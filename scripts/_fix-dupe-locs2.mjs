import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const oldSlugs = ["mbs", "velocity-novena", "woodleigh-mall"];

// Get remaining locations with old slugs
const { data: remaining } = await sb
  .from("brand_locations")
  .select("id, location_name, mall_slug, brand_menu_id, brand_menus!brand_menu_id(name, slug)")
  .in("mall_slug", oldSlugs);

console.log(`Remaining locations with old slugs: ${remaining.length}`);
for (const loc of remaining) {
  console.log(`  ${loc.brand_menus?.name} @ "${loc.location_name}" (${loc.mall_slug}) id=${loc.id}`);
}

// These are all duplicates where the canonical already exists - just delete them
const DRY_RUN = process.argv.includes("--dry-run");
if (DRY_RUN) {
  console.log("\n[DRY RUN] Would delete all above.");
  process.exit(0);
}

let deleted = 0;
for (const loc of remaining) {
  const { error } = await sb.from("brand_locations").delete().eq("id", loc.id);
  if (error) {
    console.log(`  ERROR deleting ${loc.id}: ${error.message}`);
  } else {
    deleted++;
  }
}
console.log(`\nDeleted: ${deleted}`);

// Verify
const { count } = await sb
  .from("brand_locations")
  .select("id", { count: "exact", head: true })
  .in("mall_slug", oldSlugs);
console.log(`Remaining with old slugs: ${count}`);
