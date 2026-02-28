/**
 * Find zero-menu brands that are duplicates of brands WITH menu data.
 * Strategy: if brand "Gong Cha" has 0 items but "Gong Cha @ Waterway Point" has 50 items,
 * we can copy the menu data.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`)); return m?.[1]; };
const sb = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

// Get ALL brands
const { data: allBrands } = await sb.from("brand_menus")
  .select("id, slug, name, menu_item_count")
  .eq("is_active", true)
  .order("name");

const zeroMenu = allBrands.filter(b => b.menu_item_count === 0);
const withMenu = allBrands.filter(b => b.menu_item_count > 0);

console.log(`Total brands: ${allBrands.length}`);
console.log(`With menu: ${withMenu.length}`);
console.log(`Zero menu: ${zeroMenu.length}\n`);

// Extract core brand name (strip location, normalize)
function coreName(name) {
  return name
    .replace(/\s*[@|]\s*.+$/, "")
    .replace(/\s+-\s+.+$/, "")
    .replace(/\s*\([^)]+\)\s*/g, "")
    .replace(/\s*(Jewel|NEX|JEM|Junction|Bedok|Suntec|VivoCity|ION|MBS|Novena|AMK|Tampines|Waterway|Tiong|Marina|Plaza|Nex|IMM|Thomson|Woodleigh|United|Lot).*/i, "")
    .replace(/['']/g, "'")
    .replace(/[éè]/g, "e")
    .replace(/[^\x00-\x7F]/g, "") // strip CJK
    .trim()
    .toLowerCase();
}

// Build map of core names -> brands with menus
const menuMap = {};
for (const b of withMenu) {
  const core = coreName(b.name);
  if (!menuMap[core]) menuMap[core] = [];
  menuMap[core].push(b);
}

// Find zero-menu brands that match a brand with menus
const matches = [];
const noMatch = [];

for (const b of zeroMenu) {
  const core = coreName(b.name);
  const candidates = menuMap[core];
  if (candidates && candidates.length > 0) {
    matches.push({
      empty: b,
      donor: candidates[0],
      coreName: core,
    });
  } else {
    noMatch.push(b);
  }
}

console.log(`=== Matches Found: ${matches.length} ===\n`);
for (const m of matches) {
  console.log(`  "${m.empty.name}" (${m.empty.slug}, 0 items)`);
  console.log(`    → DONOR: "${m.donor.name}" (${m.donor.slug}, ${m.donor.menu_item_count} items)`);
  console.log(`    core: "${m.coreName}"`);
  console.log();
}

console.log(`\n=== No Match: ${noMatch.length} ===`);
// Show their core names so we can see near-misses
for (const b of noMatch) {
  const core = coreName(b.name);
  // Check for partial matches
  const partials = Object.keys(menuMap).filter(k =>
    k.includes(core) || core.includes(k) ||
    (core.length > 3 && k.startsWith(core.slice(0, Math.max(5, core.length - 3))))
  );
  if (partials.length > 0) {
    console.log(`  ${b.name} [core: "${core}"] → NEAR: ${partials.map(p => `"${p}" (${menuMap[p][0].menu_item_count} items)`).join(", ")}`);
  }
}

// Count potential items to copy
const totalCopyable = matches.reduce((sum, m) => sum + m.donor.menu_item_count, 0);
console.log(`\n=== Summary ===`);
console.log(`Exact core-name matches: ${matches.length} brands`);
console.log(`Donor items available: ${totalCopyable}`);
console.log(`Still unmatched: ${noMatch.length}`);
