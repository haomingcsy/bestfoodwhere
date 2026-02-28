/**
 * Audit menu gaps: find all Supabase brands with 0 or few menu items,
 * plus check which have website URLs we could scrape.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Get all brands with their menu item counts
const { data: brands } = await sb.from("brand_menus").select("id, slug, name, website_url");

const results = [];
for (const b of brands || []) {
  const { count } = await sb.from("menu_items").select("id", { count: "exact", head: true }).eq("brand_menu_id", b.id);
  results.push({ slug: b.slug, name: b.name, count: count || 0, website: b.website_url });
}

// Sort by count ascending
results.sort((a, b) => a.count - b.count);

// Stats
const total = results.length;
const zero = results.filter(r => r.count === 0);
const under5 = results.filter(r => r.count > 0 && r.count < 5);
const under10 = results.filter(r => r.count >= 5 && r.count < 10);

console.log(`=== Menu Item Coverage (${total} brands) ===`);
console.log(`  0 items: ${zero.length}`);
console.log(`  1-4 items: ${under5.length}`);
console.log(`  5-9 items: ${under10.length}`);
console.log(`  10+ items: ${results.filter(r => r.count >= 10).length}`);

if (zero.length > 0) {
  console.log(`\n=== Brands with 0 menu items ===`);
  zero.forEach(r => console.log(`  ${r.slug} (${r.name}) ${r.website ? '- has website' : '- NO website'}`));
}

if (under5.length > 0) {
  console.log(`\n=== Brands with 1-4 menu items (suspicious) ===`);
  under5.forEach(r => console.log(`  ${r.slug}: ${r.count} items`));
}

// Now check mall_restaurants for restaurants NOT in brand_menus
const { data: mr } = await sb.from("mall_restaurants").select("slug, name, mall_slug, google_place_id, hero_image_url");
const brandSlugs = new Set(results.map(r => r.slug));
const mrNotInBrands = (mr || []).filter(r => !brandSlugs.has(r.slug));

console.log(`\n=== mall_restaurants NOT in brand_menus: ${mrNotInBrands.length} / ${(mr || []).length} ===`);
if (mrNotInBrands.length > 0) {
  mrNotInBrands.slice(0, 20).forEach(r => console.log(`  ${r.slug} (${r.name}) @ ${r.mall_slug} ${r.google_place_id ? '- has place_id' : ''}`));
  if (mrNotInBrands.length > 20) console.log(`  ... and ${mrNotInBrands.length - 20} more`);
}

// Check brand_menus entries that have enrichment data
const { data: enriched } = await sb.from("brand_menus")
  .select("slug, website_url, grabfood_url, deliveroo_url, foodpanda_url")
  .not("website_url", "is", null);

const withDelivery = (brands || []).filter(b => {
  const e = enriched?.find(e => e.slug === b.slug);
  return e && (e.grabfood_url || e.deliveroo_url || e.foodpanda_url);
});

const zeroWithDelivery = zero.filter(z => {
  const e = enriched?.find(e => e.slug === z.slug);
  return e && (e.grabfood_url || e.deliveroo_url || e.foodpanda_url);
});

console.log(`\n=== Delivery URL Coverage ===`);
console.log(`  Brands with any delivery URL: ${withDelivery.length}`);
console.log(`  Zero-menu brands with delivery URL (easy wins): ${zeroWithDelivery.length}`);
if (zeroWithDelivery.length > 0) {
  zeroWithDelivery.forEach(r => console.log(`    ${r.slug}`));
}
