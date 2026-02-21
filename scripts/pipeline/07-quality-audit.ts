/**
 * 07-quality-audit.ts
 *
 * Quality audit script that analyzes brand_menus, menu_items, and menu_categories
 * for data completeness, consistency, and quality issues.
 *
 * Usage:
 *   npx tsx scripts/pipeline/07-quality-audit.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

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

const BATCH_SIZE = 1000;

async function fetchAll(table: string, select = "*"): Promise<any[]> {
  const rows: any[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + BATCH_SIZE - 1);
    if (error) throw new Error(`Error fetching ${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < BATCH_SIZE) break;
    from += BATCH_SIZE;
  }
  return rows;
}

function pct(num: number, den: number): string {
  if (den === 0) return "0.0%";
  return ((num / den) * 100).toFixed(1) + "%";
}

function section(title: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${title}`);
  console.log("=".repeat(60));
}

async function main() {
  console.log("Running quality audit...\n");

  // ── Fetch data ──
  const brands = await fetchAll(
    "brand_menus",
    "id,slug,name,scrape_status,website_url,description,social_links,logo_url,hero_image_url,ai_description,ai_amenities,ai_recommendations",
  );
  const menuItems = await fetchAll("menu_items", "id,brand_menu_id,name,price");
  const categories = await fetchAll("menu_categories", "id,brand_menu_id");
  const locations = await fetchAll("brand_locations", "id,brand_menu_id");

  // ── 1. Overall Stats ──
  section("1. Overall Stats");
  console.table({
    "Total Brands": brands.length,
    "Total Menu Items": menuItems.length,
    "Total Menu Categories": categories.length,
    "Total Brand Locations": locations.length,
  });

  // ── 2. Scrape Coverage ──
  section("2. Scrape Coverage");
  const statusCounts: Record<string, number> = {};
  for (const b of brands) {
    const s = b.scrape_status || "null";
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  }
  const scrapeTable = Object.entries(statusCounts).map(([status, count]) => ({
    Status: status,
    Count: count,
    Percentage: pct(count, brands.length),
  }));
  console.table(scrapeTable);

  const totalScraped =
    (statusCounts["scraped"] || 0) + (statusCounts["completed"] || 0);
  console.log(`Scrape rate: ${pct(totalScraped, brands.length)}`);

  // ── 3. Menu Quality ──
  section("3. Menu Quality");
  const itemsByBrand: Record<string, any[]> = {};
  for (const item of menuItems) {
    if (!itemsByBrand[item.brand_menu_id])
      itemsByBrand[item.brand_menu_id] = [];
    itemsByBrand[item.brand_menu_id].push(item);
  }

  const brandsWithItems = brands.filter(
    (b) => (itemsByBrand[b.id]?.length || 0) > 0,
  );
  const brandsWithZeroItems = brands.filter(
    (b) => (itemsByBrand[b.id]?.length || 0) === 0,
  );

  const brandsWithPrices = brandsWithItems.filter((b) =>
    itemsByBrand[b.id].some((i: any) => i.price != null),
  );
  const brandsNoPrices = brandsWithItems.filter(
    (b) => !itemsByBrand[b.id].some((i: any) => i.price != null),
  );

  const avgItemsPerBrand =
    brandsWithItems.length > 0
      ? (
          brandsWithItems.reduce(
            (sum, b) => sum + itemsByBrand[b.id].length,
            0,
          ) / brandsWithItems.length
        ).toFixed(1)
      : "0";

  console.table({
    "Brands with 0 items": brandsWithZeroItems.length,
    "Brands with items but no prices": brandsNoPrices.length,
    "Brands with items and prices": brandsWithPrices.length,
    "Avg items per brand (with items)": avgItemsPerBrand,
  });

  // ── 4. Field Completeness ──
  section("4. Field Completeness (brand_menus)");
  const fields = [
    "website_url",
    "description",
    "social_links",
    "logo_url",
    "hero_image_url",
    "ai_description",
    "ai_amenities",
    "ai_recommendations",
  ] as const;

  const fieldStats = fields.map((f) => {
    const filled = brands.filter((b) => {
      const v = b[f];
      if (v == null) return false;
      if (typeof v === "string" && v.trim() === "") return false;
      if (typeof v === "object" && Object.keys(v).length === 0) return false;
      return true;
    }).length;
    return {
      Field: f,
      Filled: filled,
      Total: brands.length,
      Pct: pct(filled, brands.length),
    };
  });
  console.table(fieldStats);

  const avgFieldCompleteness =
    brands.length > 0
      ? fieldStats.reduce((sum, s) => sum + s.Filled / s.Total, 0) /
        fields.length
      : 0;
  console.log(
    `Average field completeness: ${(avgFieldCompleteness * 100).toFixed(1)}%`,
  );

  // ── 5. Data Issues ──
  section("5. Data Issues");

  // Duplicate slugs
  const slugCounts: Record<string, number> = {};
  for (const b of brands) {
    slugCounts[b.slug] = (slugCounts[b.slug] || 0) + 1;
  }
  const duplicateSlugs = Object.entries(slugCounts)
    .filter(([, c]) => c > 1)
    .map(([slug, count]) => ({ Slug: slug, Count: count }));

  // Negative prices
  const negativePrices = menuItems.filter(
    (i) => i.price != null && i.price < 0,
  );

  // Suspiciously high prices
  const highPrices = menuItems.filter((i) => i.price != null && i.price > 500);

  // Empty names
  const emptyNames = menuItems.filter(
    (i) => !i.name || (typeof i.name === "string" && i.name.trim() === ""),
  );

  console.log(`Duplicate slugs: ${duplicateSlugs.length}`);
  if (duplicateSlugs.length > 0) console.table(duplicateSlugs);

  console.log(`Menu items with negative prices: ${negativePrices.length}`);
  if (negativePrices.length > 0)
    console.table(
      negativePrices
        .slice(0, 10)
        .map((i) => ({ id: i.id, name: i.name, price: i.price })),
    );

  console.log(`Menu items with price > $500: ${highPrices.length}`);
  if (highPrices.length > 0)
    console.table(
      highPrices
        .slice(0, 10)
        .map((i) => ({ id: i.id, name: i.name, price: i.price })),
    );

  console.log(`Menu items with empty names: ${emptyNames.length}`);

  // ── 6. Top / Bottom Samples ──
  section("6. Top / Bottom Samples by Menu Item Count");

  const brandItemCounts = brandsWithItems
    .map((b) => ({
      Name: b.name,
      Slug: b.slug,
      Items: itemsByBrand[b.id].length,
    }))
    .sort((a, b) => b.Items - a.Items);

  console.log("\nTop 5 brands by menu item count:");
  console.table(brandItemCounts.slice(0, 5));

  console.log("\nBottom 5 brands with fewest items (>0):");
  console.table(brandItemCounts.slice(-5).reverse());

  // ── Quality Score ──
  section("Quality Score");

  const scoreBrandsWithItems =
    totalScraped > 0 ? (brandsWithItems.length / totalScraped) * 0.3 : 0;
  const scoreBrandsWithPrices =
    brandsWithItems.length > 0
      ? (brandsWithPrices.length / brandsWithItems.length) * 0.3
      : 0;
  const scoreFieldCompleteness = avgFieldCompleteness * 0.4;

  const qualityScore =
    scoreBrandsWithItems + scoreBrandsWithPrices + scoreFieldCompleteness;

  console.log(
    `  Brands with items / scraped:   ${pct(brandsWithItems.length, totalScraped)} (weight 0.3)`,
  );
  console.log(
    `  Brands with prices / with items: ${pct(brandsWithPrices.length, brandsWithItems.length)} (weight 0.3)`,
  );
  console.log(
    `  Avg field completeness:          ${(avgFieldCompleteness * 100).toFixed(1)}% (weight 0.4)`,
  );
  console.log(
    `\n  >>> Overall Quality Score: ${(qualityScore * 100).toFixed(1)}% <<<\n`,
  );
}

main().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
