import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// 1. Get all brand_locations with their brand info and mall_restaurant link
const { data: locs } = await sb
  .from("brand_locations")
  .select("id, location_name, mall_slug, brand_menu_id, mall_restaurant_id, brand_menus!brand_menu_id(name, slug)")
  .order("brand_menu_id");

// 2. Get all mall_restaurants grouped by mall slug + restaurant name/slug
const { data: mallRests } = await sb
  .from("mall_restaurants")
  .select("id, slug, name, mall_id, shopping_malls!mall_id(slug)")
  .eq("is_active", true);

// Build lookup: mall_slug -> set of restaurant slugs/names
const mallRestLookup = new Map(); // mall_slug -> Map(restaurant_slug -> mr record)
for (const mr of mallRests) {
  const mallSlug = mr.shopping_malls?.slug;
  if (!mallSlug) continue;
  if (!mallRestLookup.has(mallSlug)) mallRestLookup.set(mallSlug, new Map());
  mallRestLookup.get(mallSlug).set(mr.slug, mr);
}

// 3. Get all shopping_malls slugs
const { data: malls } = await sb.from("shopping_malls").select("slug, name");
const validMallSlugs = new Set(malls.map(m => m.slug));
const mallNames = new Map(malls.map(m => [m.slug, m.name]));

// 4. Check each brand_location
const phantoms = []; // locations in brand_locations but NOT in mall_restaurants
const orphanedMalls = []; // locations with mall_slug not in shopping_malls at all
const linked = []; // locations with valid mall_restaurant_id

for (const loc of locs) {
  if (loc.mall_restaurant_id) {
    linked.push(loc);
    continue;
  }

  if (!validMallSlugs.has(loc.mall_slug)) {
    orphanedMalls.push(loc);
    continue;
  }

  // No mall_restaurant_id link - check if any mall_restaurant matches by slug
  const mallRests = mallRestLookup.get(loc.mall_slug);
  const brandSlug = loc.brand_menus?.slug;
  const brandName = loc.brand_menus?.name;

  if (!mallRests) {
    phantoms.push({ ...loc, reason: "mall has no restaurants in mall_restaurants" });
    continue;
  }

  // Try match by brand slug
  if (mallRests.has(brandSlug)) {
    // Actually exists but not linked
    linked.push(loc);
    continue;
  }

  // Try fuzzy match by name
  const mrNames = [...mallRests.values()].map(mr => mr.name.toLowerCase());
  if (mrNames.some(n => n === brandName?.toLowerCase())) {
    linked.push(loc);
    continue;
  }

  phantoms.push({ ...loc, reason: "brand not found in mall_restaurants for this mall" });
}

console.log(`=== Summary ===`);
console.log(`Total brand_locations: ${locs.length}`);
console.log(`Linked to mall_restaurants (has FK or match): ${linked.length}`);
console.log(`Phantom locations (brand NOT in mall's restaurant list): ${phantoms.length}`);
console.log(`Orphaned mall slugs (mall_slug not in shopping_malls): ${orphanedMalls.length}`);

if (orphanedMalls.length > 0) {
  const slugs = [...new Set(orphanedMalls.map(l => l.mall_slug))];
  console.log(`\nOrphaned mall slugs: ${slugs.join(", ")}`);
}

console.log(`\n=== Phantom Locations (brand NOT on mall page) ===`);
// Group by mall for readability
const byMall = new Map();
for (const p of phantoms) {
  if (!byMall.has(p.mall_slug)) byMall.set(p.mall_slug, []);
  byMall.get(p.mall_slug).push(p);
}

for (const [mallSlug, pLocs] of [...byMall.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n${mallNames.get(mallSlug) || mallSlug} (${mallSlug}): ${pLocs.length} phantom brands`);
  for (const p of pLocs) {
    console.log(`  - ${p.brand_menus?.name} (slug: ${p.brand_menus?.slug})`);
  }
}
