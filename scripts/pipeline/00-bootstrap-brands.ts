/**
 * 00-bootstrap-brands.ts
 *
 * Bootstrap script that reads all mall_restaurants, groups them by normalized
 * slug into unique brands, and upserts into brand_menus + brand_locations.
 *
 * Usage:
 *   npx tsx scripts/pipeline/00-bootstrap-brands.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

config({ path: resolve(__dirname, "../../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Split an array into chunks of a given size. */
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MallRestaurantRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  opening_hours: string | null;
  unit: string | null;
  shopping_malls: {
    name: string;
    slug: string;
  } | null;
}

interface BrandGroup {
  slug: string;
  name: string;
  website: string | null;
  description: string | null;
  locations: MallRestaurantRow[];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== 00-bootstrap-brands ===");
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log("");

  // -------------------------------------------------------------------------
  // Step 1: Fetch all mall_restaurants with their mall info
  // -------------------------------------------------------------------------
  console.log("Fetching all mall_restaurants...");

  const allRows: MallRestaurantRow[] = [];
  const PAGE_SIZE = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("mall_restaurants")
      .select(
        "id, slug, name, description, website, phone, opening_hours, unit, shopping_malls(name, slug)",
      )
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching mall_restaurants:", error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allRows.push(...(data as unknown as MallRestaurantRow[]));
      offset += PAGE_SIZE;
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      }
    }
  }

  console.log(`Fetched ${allRows.length} mall_restaurants rows.`);

  // -------------------------------------------------------------------------
  // Step 2: Group by normalized slug
  // -------------------------------------------------------------------------
  console.log("Grouping by brand slug...");

  const brandMap = new Map<string, BrandGroup>();

  for (const row of allRows) {
    const slug = toSlug(row.name);
    if (!slug) {
      console.warn(`  Skipping restaurant with empty slug: "${row.name}"`);
      continue;
    }

    if (!brandMap.has(slug)) {
      brandMap.set(slug, {
        slug,
        name: row.name,
        website: row.website,
        description: row.description,
        locations: [],
      });
    }

    const brand = brandMap.get(slug)!;
    brand.locations.push(row);

    // Prefer a location that has a website/description if the current brand lacks one
    if (!brand.website && row.website) {
      brand.website = row.website;
    }
    if (!brand.description && row.description) {
      brand.description = row.description;
    }
  }

  const brands = Array.from(brandMap.values());
  console.log(
    `Found ${brands.length} unique brands from ${allRows.length} locations.`,
  );
  console.log("");

  // -------------------------------------------------------------------------
  // Step 3: Upsert brands into brand_menus (batched)
  // -------------------------------------------------------------------------
  console.log("Upserting into brand_menus...");

  const BATCH_SIZE = 50;
  const brandChunks = chunk(brands, BATCH_SIZE);
  let brandsUpserted = 0;

  for (let i = 0; i < brandChunks.length; i++) {
    const batch = brandChunks[i];
    const rows = batch.map((b) => ({
      slug: b.slug,
      name: b.name,
      website_url: b.website || null,
      description: b.description || null,
    }));

    const { error } = await supabase
      .from("brand_menus")
      .upsert(rows, { onConflict: "slug", ignoreDuplicates: false });

    if (error) {
      console.error(
        `  Error upserting brand_menus batch ${i + 1}:`,
        error.message,
      );
    } else {
      brandsUpserted += batch.length;
    }

    if (brandsUpserted % BATCH_SIZE === 0 || i === brandChunks.length - 1) {
      console.log(
        `  Progress: ${brandsUpserted}/${brands.length} brands upserted`,
      );
    }
  }

  // -------------------------------------------------------------------------
  // Step 4: Fetch brand_menus IDs for linking locations
  // -------------------------------------------------------------------------
  console.log("Fetching brand_menus IDs...");

  const brandIdMap = new Map<string, string>();
  const slugChunks = chunk(
    brands.map((b) => b.slug),
    BATCH_SIZE,
  );

  for (const slugBatch of slugChunks) {
    const { data, error } = await supabase
      .from("brand_menus")
      .select("id, slug")
      .in("slug", slugBatch);

    if (error) {
      console.error("  Error fetching brand IDs:", error.message);
      continue;
    }

    for (const row of data || []) {
      brandIdMap.set(row.slug, row.id);
    }
  }

  console.log(`  Mapped ${brandIdMap.size} brand IDs.`);
  console.log("");

  // -------------------------------------------------------------------------
  // Step 5: Upsert brand_locations (batched)
  // -------------------------------------------------------------------------
  console.log("Upserting into brand_locations...");

  const allLocations: Array<{
    brand_menu_id: string;
    mall_restaurant_id: string;
    mall_slug: string;
    location_name: string;
    slug: string;
    address: string | null;
    phone: string | null;
    opening_hours: string | null;
    website: string | null;
    description: string | null;
  }> = [];

  for (const brand of brands) {
    const brandId = brandIdMap.get(brand.slug);
    if (!brandId) {
      console.warn(
        `  No brand_menus ID found for slug "${brand.slug}", skipping locations.`,
      );
      continue;
    }

    for (const loc of brand.locations) {
      const mallSlug = loc.shopping_malls?.slug;
      if (!mallSlug) {
        console.warn(
          `  Location "${loc.name}" (${loc.id}) has no mall slug, skipping.`,
        );
        continue;
      }

      allLocations.push({
        brand_menu_id: brandId,
        mall_restaurant_id: loc.id,
        mall_slug: mallSlug,
        location_name: loc.shopping_malls?.name || mallSlug,
        slug: loc.slug,
        address: loc.unit || null,
        phone: loc.phone || null,
        opening_hours: loc.opening_hours || null,
        website: loc.website || null,
        description: loc.description || null,
      });
    }
  }

  const locationChunks = chunk(allLocations, BATCH_SIZE);
  let locationsUpserted = 0;

  for (let i = 0; i < locationChunks.length; i++) {
    const batch = locationChunks[i];

    const { error } = await supabase.from("brand_locations").upsert(batch, {
      onConflict: "brand_menu_id,mall_slug",
      ignoreDuplicates: false,
    });

    if (error) {
      console.error(
        `  Error upserting brand_locations batch ${i + 1}:`,
        error.message,
      );
    } else {
      locationsUpserted += batch.length;
    }

    if (
      locationsUpserted % BATCH_SIZE === 0 ||
      i === locationChunks.length - 1
    ) {
      console.log(
        `  Progress: ${locationsUpserted}/${allLocations.length} locations upserted`,
      );
    }
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("");
  console.log("=== Bootstrap Complete ===");
  console.log(`  Total brands created/updated: ${brandsUpserted}`);
  console.log(`  Total locations linked:        ${locationsUpserted}`);
  console.log(
    `  Multi-location brands:         ${brands.filter((b) => b.locations.length > 1).length}`,
  );
  console.log(
    `  Single-location brands:        ${brands.filter((b) => b.locations.length === 1).length}`,
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
