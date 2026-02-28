import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`)); return m?.[1]; };
const sb = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

// Get all zero-menu brands
const { data: zeroMenuBrands } = await sb.from("brand_menus")
  .select("id, slug, name, menu_item_count")
  .eq("is_active", true)
  .eq("menu_item_count", 0)
  .order("slug");

console.log(`Found ${zeroMenuBrands.length} zero-menu brands\n`);

// Get all brands WITH menus (potential donors)
const { data: menuBrands } = await sb.from("brand_menus")
  .select("id, slug, name, menu_item_count")
  .eq("is_active", true)
  .gt("menu_item_count", 0)
  .order("slug");

// Extract core brand name from slug
function coreSlug(slug) {
  // Remove common mall/location suffixes
  const malls = [
    "suntec-city", "vivocity", "vivo-city", "jem", "jewel", "jewel-changi-airport",
    "jewel-changi", "plaza-singapura", "causeway-point", "tampines-mall",
    "bedok-mall", "junction-8", "amk-hub", "city-square-mall", "aperia",
    "aperia-mall", "imm", "nex", "serangoon-nex", "united-square",
    "the-woodleigh-mall", "woodleigh-mall", "woodleigh", "woodlands-mrt",
    "novena", "bugis", "mbs", "marina-bay-sands", "orchard",
    "singapore", "kallang-ave", "temasek-blvd",
  ];
  
  let s = slug;
  for (const mall of malls.sort((a, b) => b.length - a.length)) {
    if (s.endsWith(`-${mall}`)) {
      s = s.slice(0, -(mall.length + 1));
      break;
    }
  }
  return s;
}

// Group zero-menu brands by core name
const groups = {};
for (const brand of zeroMenuBrands) {
  const core = coreSlug(brand.slug);
  if (!groups[core]) groups[core] = [];
  groups[core].push(brand);
}

// Find donors for each group
let totalTargets = 0;
let totalDonors = 0;
const donorPairs = [];

for (const [core, targets] of Object.entries(groups)) {
  // Find potential donors: brands with menus whose slug starts with core
  const donors = menuBrands.filter(b => {
    const bCore = coreSlug(b.slug);
    return bCore === core || b.slug.startsWith(core + "-") || b.slug === core;
  });
  
  if (donors.length > 0) {
    // Pick the donor with most items
    const bestDonor = donors.sort((a, b) => b.menu_item_count - a.menu_item_count)[0];
    console.log(`\n✅ DONOR FOUND: "${bestDonor.name}" (${bestDonor.slug}, ${bestDonor.menu_item_count} items)`);
    console.log(`   Targets (${targets.length}):`);
    for (const t of targets) {
      console.log(`     → ${t.slug}`);
    }
    totalTargets += targets.length;
    totalDonors++;
    donorPairs.push({ donor: bestDonor, targets });
  }
}

// Also show groups with NO donor
let noDonor = 0;
for (const [core, targets] of Object.entries(groups)) {
  const donors = menuBrands.filter(b => {
    const bCore = coreSlug(b.slug);
    return bCore === core || b.slug.startsWith(core + "-") || b.slug === core;
  });
  if (donors.length === 0) {
    noDonor += targets.length;
  }
}

console.log(`\n=== Summary ===`);
console.log(`Total zero-menu brands: ${zeroMenuBrands.length}`);
console.log(`Brands with potential donor: ${totalTargets} (across ${totalDonors} donor chains)`);
console.log(`Brands with NO donor: ${noDonor}`);
console.log(`\nDonor pairs for copying:`);
for (const pair of donorPairs) {
  console.log(`  ${pair.donor.slug} (${pair.donor.menu_item_count} items) → ${pair.targets.map(t => t.slug).join(", ")}`);
}
