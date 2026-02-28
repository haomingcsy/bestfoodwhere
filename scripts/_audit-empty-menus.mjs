import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// 1. Check Bread Street Kitchen specifically
const { data: bsk } = await sb.from("brand_menus").select("id, slug, name").ilike("name", "%bread street%");
console.log("=== Bread Street Kitchen in brand_menus ===");
console.log(JSON.stringify(bsk, null, 2));

const { data: bskMR } = await sb.from("mall_restaurants").select("id, slug, name, mall_slug, hero_image_url, google_place_id").ilike("name", "%bread street%");
console.log("\n=== Bread Street Kitchen in mall_restaurants ===");
console.log(JSON.stringify(bskMR, null, 2));

if (bsk && bsk.length > 0) {
  const { count } = await sb.from("menu_items").select("id", { count: "exact", head: true }).eq("brand_menu_id", bsk[0].id);
  console.log("\nmenu_items count:", count);
} else {
  console.log("\nNo brand_menus entry found");
}

// 2. Audit: all brands with 0 menu items
const { data: allBrands } = await sb.from("brand_menus").select("id, slug, name");
const emptyBrands = [];
for (const b of allBrands || []) {
  const { count: c } = await sb.from("menu_items").select("id", { count: "exact", head: true }).eq("brand_menu_id", b.id);
  if (!c || c === 0) {
    emptyBrands.push(b.slug);
  }
}
console.log(`\n=== Brands with 0 menu items: ${emptyBrands.length} / ${(allBrands || []).length} ===`);
emptyBrands.forEach(s => console.log("  " + s));

// 3. Audit: mall_restaurants with no matching brand_menus entry
const { data: allMR } = await sb.from("mall_restaurants").select("slug, name, mall_slug");
const brandSlugs = new Set((allBrands || []).map(b => b.slug));
const orphanMR = (allMR || []).filter(mr => !brandSlugs.has(mr.slug));
console.log(`\n=== mall_restaurants with no brand_menus entry: ${orphanMR.length} / ${(allMR || []).length} ===`);
orphanMR.slice(0, 30).forEach(mr => console.log(`  ${mr.slug} (${mr.name}) @ ${mr.mall_slug}`));
if (orphanMR.length > 30) console.log(`  ... and ${orphanMR.length - 30} more`);
