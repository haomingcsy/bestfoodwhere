import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const DRY_RUN = process.argv.includes("--dry-run");

// 1. Check which mall slugs exist in shopping_malls
const { data: malls } = await sb.from("shopping_malls").select("slug, name");
const mallMap = new Map(malls.map((m) => [m.slug, m.name]));

console.log("=== Mall slug check ===");
for (const slug of ["mbs", "marina-bay-sands", "velocity-novena", "velocity-novena-square", "woodleigh-mall", "the-woodleigh-mall", "jewel", "jewel-changi-airport"]) {
  console.log(`  ${slug}: ${mallMap.has(slug) ? `YES -> "${mallMap.get(slug)}"` : "NOT in shopping_malls"}`);
}

// 2. Define slug merges: [old_slug] -> [canonical_slug, canonical_display_name]
const SLUG_MERGES = {
  "mbs": { canonical: "marina-bay-sands", name: "Marina Bay Sands" },
  "velocity-novena": { canonical: "velocity-novena-square", name: null }, // will use shopping_malls name
  "woodleigh-mall": { canonical: "the-woodleigh-mall", name: "The Woodleigh Mall" },
};

// Get canonical names from shopping_malls where not hardcoded
for (const [oldSlug, merge] of Object.entries(SLUG_MERGES)) {
  if (!merge.name) {
    merge.name = mallMap.get(merge.canonical) || null;
  }
}

console.log("\n=== Slug merges ===");
for (const [old, merge] of Object.entries(SLUG_MERGES)) {
  console.log(`  "${old}" -> "${merge.canonical}" (display: "${merge.name}")`);
}

// 3. Get all locations with the old slugs
const oldSlugs = Object.keys(SLUG_MERGES);
const { data: locations } = await sb
  .from("brand_locations")
  .select("id, location_name, mall_slug, brand_menu_id, brand_menus!brand_menu_id(name, slug)")
  .in("mall_slug", oldSlugs);

console.log(`\nLocations with old slugs: ${locations.length}`);

// 4. For each, check if a duplicate exists with the canonical slug (same brand_menu_id)
const { data: allLocs } = await sb
  .from("brand_locations")
  .select("id, location_name, mall_slug, brand_menu_id")
  .order("brand_menu_id");

// Build lookup: brand_menu_id + mall_slug -> location ids
const locLookup = new Map();
for (const loc of allLocs) {
  const key = `${loc.brand_menu_id}|${loc.mall_slug}`;
  if (!locLookup.has(key)) locLookup.set(key, []);
  locLookup.get(key).push(loc);
}

let toDelete = [];
let toUpdate = [];

for (const loc of locations) {
  const merge = SLUG_MERGES[loc.mall_slug];
  const canonicalKey = `${loc.brand_menu_id}|${merge.canonical}`;
  const existsCanonical = locLookup.has(canonicalKey);

  if (existsCanonical) {
    // Canonical already exists -> this old-slug entry is a true duplicate, delete it
    toDelete.push({ id: loc.id, brand: loc.brand_menus?.name, oldSlug: loc.mall_slug });
  } else {
    // No canonical entry -> update this one to use canonical slug + name
    toUpdate.push({
      id: loc.id,
      brand: loc.brand_menus?.name,
      oldSlug: loc.mall_slug,
      newSlug: merge.canonical,
      newName: merge.name,
    });
  }
}

console.log(`\nDuplicates to DELETE (canonical already exists): ${toDelete.length}`);
for (const d of toDelete) {
  console.log(`  DEL: ${d.brand} @ ${d.oldSlug}`);
}

console.log(`\nLocations to UPDATE (migrate to canonical slug): ${toUpdate.length}`);
for (const u of toUpdate) {
  console.log(`  UPD: ${u.brand} @ "${u.oldSlug}" -> "${u.newSlug}" (name: "${u.newName}")`);
}

if (DRY_RUN) {
  console.log("\n[DRY RUN] No changes made.");
  process.exit(0);
}

// 5. Execute deletes
let deleted = 0;
for (const d of toDelete) {
  const { error } = await sb.from("brand_locations").delete().eq("id", d.id);
  if (error) {
    console.log(`  DELETE ERROR: ${d.id} - ${error.message}`);
  } else {
    deleted++;
  }
}

// 6. Execute updates
let updated = 0;
for (const u of toUpdate) {
  const { error } = await sb
    .from("brand_locations")
    .update({ mall_slug: u.newSlug, location_name: u.newName })
    .eq("id", u.id);
  if (error) {
    console.log(`  UPDATE ERROR: ${u.id} - ${error.message}`);
  } else {
    updated++;
  }
}

console.log(`\nDone! Deleted: ${deleted}, Updated: ${updated}`);

// 7. Verify - check for any remaining old slugs
const { count } = await sb
  .from("brand_locations")
  .select("id", { count: "exact", head: true })
  .in("mall_slug", oldSlugs);
console.log(`Remaining locations with old slugs: ${count}`);
