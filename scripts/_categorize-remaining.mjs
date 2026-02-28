/**
 * Categorize the remaining 110 zero-menu brands to determine what's achievable
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`)); return m?.[1]; };
const sb = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

// Get zero-menu brands with their mall info
const { data: brands } = await sb.from("brand_menus")
  .select("slug, name, website_url, social_links, menu_item_count")
  .eq("is_active", true)
  .eq("menu_item_count", 0)
  .order("name");

// Get mall associations
const { data: mallRestaurants } = await sb.from("mall_restaurants")
  .select("slug, name, mall_slug, cuisine_type, hero_image_url, google_place_id")
  .in("slug", brands.map(b => b.slug));

// Group by slug for lookup
const mallMap = {};
for (const mr of mallRestaurants || []) {
  if (!mallMap[mr.slug]) mallMap[mr.slug] = [];
  mallMap[mr.slug].push(mr);
}

console.log(`=== Remaining Zero-Menu Brands: ${brands.length} ===\n`);

// Categorize
const categories = {
  mbs: [],         // Marina Bay Sands restaurants
  fineDining: [],  // High-end restaurants likely no delivery
  chains: [],      // Known chains that should have menus
  hawker: [],      // Hawker/food court stalls
  cafe: [],        // Cafes, dessert shops
  other: [],       // Other
};

const MBS_KEYWORDS = ["marina bay sands", "mbs", "the shoppes"];
const FINE_DINING_KEYWORDS = ["gordon ramsay", "wolfgang puck", "waku ghin", "wakuda", "mott 32", "yardbird"];
const CHAIN_KEYWORDS = ["gong cha", "ajisen", "ben & jerry", "jollibee", "kfc", "mcdonald", "subway", "starbucks", "toast box", "ya kun", "old chang kee", "mr bean", "jollibean", "breadtalk", "four leaves", "bengawan", "delifrance", "polar", "swensen", "sakae", "sushi express", "genki sushi", "sukiya", "yoshinoya", "pepper lunch", "mos burger", "carl's jr", "burger king", "popeyes", "nando", "long john silver", "fish & co", "manhattan fish", "crystal jade", "din tai fung", "tim ho wan", "xin wang", "tung lok", "putien", "paradise", "soup restaurant"];

for (const brand of brands) {
  const mallData = mallMap[brand.slug] || [];
  const lowerName = brand.name.toLowerCase();
  const mallSlugs = mallData.map(m => m.mall_slug).join(", ");

  const entry = {
    slug: brand.slug,
    name: brand.name,
    malls: mallSlugs,
    website: brand.website_url ? "yes" : "no",
    hasGooglePlace: mallData.some(m => m.google_place_id) ? "yes" : "no",
    cuisine: mallData[0]?.cuisine_type || "unknown",
  };

  if (mallSlugs.includes("marina-bay-sands") || FINE_DINING_KEYWORDS.some(kw => lowerName.includes(kw))) {
    categories.mbs.push(entry);
  } else if (CHAIN_KEYWORDS.some(kw => lowerName.includes(kw))) {
    categories.chains.push(entry);
  } else {
    categories.other.push(entry);
  }
}

console.log(`\n--- MBS / Fine Dining (${categories.mbs.length}) ---`);
for (const b of categories.mbs) {
  console.log(`  ${b.name} | malls: ${b.malls} | website: ${b.website} | cuisine: ${b.cuisine}`);
}

console.log(`\n--- Known Chains (${categories.chains.length}) ---`);
for (const b of categories.chains) {
  console.log(`  ${b.name} | malls: ${b.malls} | website: ${b.website} | cuisine: ${b.cuisine}`);
}

console.log(`\n--- Other (${categories.other.length}) ---`);
for (const b of categories.other) {
  console.log(`  ${b.name} | malls: ${b.malls} | website: ${b.website} | cuisine: ${b.cuisine}`);
}

// Summary
console.log(`\n=== Summary ===`);
console.log(`MBS / Fine Dining: ${categories.mbs.length}`);
console.log(`Known Chains: ${categories.chains.length}`);
console.log(`Other: ${categories.other.length}`);
console.log(`Total: ${brands.length}`);

// Check which have website URLs that might work (non-MBS)
const withWebsite = brands.filter(b => b.website_url && !b.website_url.includes("marinabaysands.com"));
console.log(`\nWith non-MBS website: ${withWebsite.length}`);
for (const b of withWebsite) {
  console.log(`  ${b.name}: ${b.website_url}`);
}
