/**
 * sync-hero-images.ts
 *
 * Syncs hero_image_url from mall_restaurants to brand_menus
 * via the brand_locations join table.
 *
 * Usage:
 *   npx tsx scripts/pipeline/sync-hero-images.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(__dirname, "../../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  // 1. Get all brand_locations with their mall_restaurant hero images
  const { data: locations, error: locErr } = await supabase
    .from("brand_locations")
    .select("brand_menu_id, mall_restaurants(hero_image_url)")
    .not("mall_restaurants", "is", null);

  if (locErr) throw locErr;

  // Build map: brand_menu_id → first non-null hero_image_url
  const heroMap = new Map<string, string>();
  for (const loc of locations || []) {
    const mr = loc.mall_restaurants as any;
    const url = mr?.hero_image_url;
    if (url && !heroMap.has(loc.brand_menu_id)) {
      heroMap.set(loc.brand_menu_id, url);
    }
  }

  console.log(
    `Found ${heroMap.size} brands with hero images in mall_restaurants`,
  );

  // 2. Get brands that currently have no hero_image_url
  const { data: brands, error: brandErr } = await supabase
    .from("brand_menus")
    .select("id")
    .is("hero_image_url", null);

  if (brandErr) throw brandErr;

  const toUpdate = (brands || []).filter((b) => heroMap.has(b.id));
  console.log(`${toUpdate.length} brands need hero_image_url update`);

  // 3. Update in batches of 50
  let updated = 0;
  for (let i = 0; i < toUpdate.length; i += 50) {
    const batch = toUpdate.slice(i, i + 50);
    const promises = batch.map((b) =>
      supabase
        .from("brand_menus")
        .update({ hero_image_url: heroMap.get(b.id) })
        .eq("id", b.id),
    );
    const results = await Promise.all(promises);
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      console.error(
        `Batch errors:`,
        errors.map((e) => e.error?.message),
      );
    }
    updated += batch.length - errors.length;
  }

  console.log(`Updated ${updated} brands with hero images`);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
