import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data } = await sb
  .from("brand_locations")
  .select("id, location_name, mall_slug, brand_menu_id, brand_menus!brand_menu_id(name, slug)")
  .order("brand_menu_id");

const mismatches = data.filter((loc) => {
  const brandName = (loc.brand_menus?.name || "").toLowerCase().trim();
  const locName = (loc.location_name || "").toLowerCase().trim();
  if (!locName || !brandName) return false;
  // location_name == brand name or contains it
  return locName === brandName || brandName.startsWith(locName) || locName.startsWith(brandName);
});

console.log("Total locations:", data.length);
console.log("Locations where location_name ~ brand name:", mismatches.length);
console.log("\nFull list:");
for (const m of mismatches) {
  console.log(`  [${m.brand_menus?.slug}] Brand: "${m.brand_menus?.name}" | Location: "${m.location_name}" | Mall: ${m.mall_slug || "null"} | ID: ${m.id}`);
}
