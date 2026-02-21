import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const DRY_RUN = process.argv.includes("--dry-run");

// 1. Get all mall display names
const { data: malls } = await sb.from("shopping_malls").select("slug, name");
const mallNameMap = new Map(malls.map((m) => [m.slug, m.name]));

// Fallback display names for slugs missing from shopping_malls table
const SLUG_FALLBACKS = {
  "the-woodleigh-mall": "The Woodleigh Mall",
  "mbs": "Marina Bay Sands",
};
for (const [slug, name] of Object.entries(SLUG_FALLBACKS)) {
  if (!mallNameMap.has(slug)) mallNameMap.set(slug, name);
}

console.log("Malls loaded:", mallNameMap.size, `(${Object.keys(SLUG_FALLBACKS).length} fallbacks)`);

// 2. Get all locations with brand names
const { data: locations } = await sb
  .from("brand_locations")
  .select("id, location_name, mall_slug, brand_menu_id, brand_menus!brand_menu_id(name, slug)")
  .order("brand_menu_id");

console.log("Total locations:", locations.length);

// 3. Find locations where location_name matches/contains brand name
const toFix = locations.filter((loc) => {
  const brandName = (loc.brand_menus?.name || "").toLowerCase().trim();
  const locName = (loc.location_name || "").toLowerCase().trim();
  if (!locName || !brandName) return false;
  return locName === brandName || brandName.startsWith(locName) || locName.startsWith(brandName);
});

console.log("Locations to fix:", toFix.length);

// 4. For each, replace location_name with the mall display name
let fixed = 0;
let skipped = 0;
for (const loc of toFix) {
  const mallName = mallNameMap.get(loc.mall_slug);
  if (!mallName) {
    console.log(`  SKIP: No mall name for slug "${loc.mall_slug}" (brand: ${loc.brand_menus?.name}, loc: ${loc.location_name})`);
    skipped++;
    continue;
  }

  // Skip if already correct (mall name)
  if (loc.location_name === mallName) {
    continue;
  }

  if (DRY_RUN) {
    console.log(`  DRY: "${loc.location_name}" -> "${mallName}" (${loc.brand_menus?.slug})`);
    fixed++;
  } else {
    const { error } = await sb
      .from("brand_locations")
      .update({ location_name: mallName })
      .eq("id", loc.id);
    if (error) {
      console.log(`  ERROR: ${loc.id} - ${error.message}`);
    } else {
      fixed++;
    }
  }
}

console.log(`\n${DRY_RUN ? "[DRY RUN] " : ""}Fixed: ${fixed}, Skipped: ${skipped}`);
