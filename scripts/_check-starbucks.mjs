import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Get all Starbucks locations
const { data } = await sb
  .from("brand_locations")
  .select("id, location_name, mall_slug, brand_menu_id, brand_menus!brand_menu_id(name, slug)")
  .ilike("brand_menus.name", "%starbucks%");

console.log("Starbucks locations:", data.length);
for (const loc of data) {
  console.log(`  id=${loc.id} loc_name="${loc.location_name}" mall_slug="${loc.mall_slug}"`);
}

// Now check ALL brands for duplicate location_name within same brand
console.log("\n--- Checking ALL brands for duplicate location_name ---");
const { data: all } = await sb
  .from("brand_locations")
  .select("id, location_name, mall_slug, brand_menu_id, brand_menus!brand_menu_id(name, slug)")
  .order("brand_menu_id");

const byBrandAndName = new Map();
for (const loc of all) {
  const key = `${loc.brand_menu_id}|${(loc.location_name || "").toLowerCase().trim()}`;
  if (!byBrandAndName.has(key)) byBrandAndName.set(key, []);
  byBrandAndName.get(key).push(loc);
}

let totalDupes = 0;
for (const [key, locs] of byBrandAndName) {
  if (locs.length > 1) {
    totalDupes += locs.length - 1;
    console.log(`\n${locs[0].brand_menus?.name} - "${locs[0].location_name}" x${locs.length}:`);
    for (const l of locs) {
      console.log(`  id=${l.id} mall_slug="${l.mall_slug}"`);
    }
  }
}
console.log(`\nTotal duplicate location_name entries: ${totalDupes}`);
