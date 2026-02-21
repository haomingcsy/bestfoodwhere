import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data } = await sb
  .from("brand_locations")
  .select("id, location_name, mall_slug, brand_menu_id, brand_menus!brand_menu_id(name, slug)")
  .order("brand_menu_id");

// Group by brand_menu_id + mall_slug
const grouped = new Map();
for (const loc of data) {
  const key = `${loc.brand_menu_id}|${loc.mall_slug}`;
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key).push(loc);
}

let totalDupes = 0;
const dupeIds = [];
for (const [key, locs] of grouped) {
  if (locs.length > 1) {
    totalDupes += locs.length - 1;
    console.log(`${locs[0].brand_menus?.name} @ ${locs[0].location_name}: ${locs.length} entries`);
    for (const l of locs) {
      console.log(`  id=${l.id} loc_name="${l.location_name}" mall_slug=${l.mall_slug}`);
    }
    // Keep the first, mark rest as duplicates
    for (let i = 1; i < locs.length; i++) {
      dupeIds.push(locs[i].id);
    }
  }
}

console.log(`\nTotal duplicate entries to remove: ${totalDupes}`);
console.log("Duplicate IDs:", JSON.stringify(dupeIds));
