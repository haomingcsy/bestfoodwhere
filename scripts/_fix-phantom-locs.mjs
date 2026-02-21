import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const DRY_RUN = process.argv.includes("--dry-run");

// ============================================================
// STEP 1: Fix woodleigh slug direction (the-woodleigh-mall -> woodleigh-mall)
// ============================================================
console.log("=== Step 1: Fix woodleigh mall slug ===");

const { data: woodleighLocs } = await sb
  .from("brand_locations")
  .select("id, location_name, mall_slug, brand_menu_id, brand_menus!brand_menu_id(name, slug)")
  .eq("mall_slug", "the-woodleigh-mall");

console.log(`Locations with "the-woodleigh-mall": ${woodleighLocs.length}`);

// Check for conflicts: does a woodleigh-mall entry already exist for same brand?
let woodleighFixed = 0;
let woodleighSkipped = 0;
let woodleighDeleted = 0;

for (const loc of woodleighLocs) {
  const { data: existing } = await sb
    .from("brand_locations")
    .select("id")
    .eq("brand_menu_id", loc.brand_menu_id)
    .eq("mall_slug", "woodleigh-mall")
    .maybeSingle();

  if (existing) {
    // Already has a woodleigh-mall entry for this brand - delete the-woodleigh-mall duplicate
    if (!DRY_RUN) {
      await sb.from("brand_locations").delete().eq("id", loc.id);
    }
    console.log(`  DEL: ${loc.brand_menus?.name} (canonical already exists)`);
    woodleighDeleted++;
  } else {
    // No conflict - update slug to woodleigh-mall
    if (!DRY_RUN) {
      await sb
        .from("brand_locations")
        .update({ mall_slug: "woodleigh-mall", location_name: "Woodleigh Mall" })
        .eq("id", loc.id);
    }
    console.log(`  UPD: ${loc.brand_menus?.name} -> woodleigh-mall`);
    woodleighFixed++;
  }
}
console.log(`Woodleigh: ${woodleighFixed} updated, ${woodleighDeleted} deleted (dupes)\n`);

// ============================================================
// STEP 2: Delete phantom locations (brand not in mall_restaurants)
// ============================================================
console.log("=== Step 2: Remove phantom locations ===");

// Get all brand_locations
const { data: allLocs } = await sb
  .from("brand_locations")
  .select("id, location_name, mall_slug, brand_menu_id, mall_restaurant_id, brand_menus!brand_menu_id(name, slug)")
  .order("brand_menu_id");

// Get all mall_restaurants
const { data: mallRests } = await sb
  .from("mall_restaurants")
  .select("id, slug, name, mall_id, shopping_malls!mall_id(slug)")
  .eq("is_active", true);

// Build lookup: mall_slug -> Set of restaurant slugs + names
const mallRestBySlug = new Map();
for (const mr of mallRests) {
  const mallSlug = mr.shopping_malls?.slug;
  if (!mallSlug) continue;
  if (!mallRestBySlug.has(mallSlug)) mallRestBySlug.set(mallSlug, { slugs: new Set(), names: new Set() });
  const entry = mallRestBySlug.get(mallSlug);
  entry.slugs.add(mr.slug);
  entry.names.add(mr.name.toLowerCase());
}

// Get valid mall slugs
const { data: malls } = await sb.from("shopping_malls").select("slug");
const validMallSlugs = new Set(malls.map(m => m.slug));

const toDelete = [];

for (const loc of allLocs) {
  // Skip if has direct FK link
  if (loc.mall_restaurant_id) continue;

  // Skip if mall slug not in shopping_malls (handled separately)
  if (!validMallSlugs.has(loc.mall_slug)) continue;

  const mallEntry = mallRestBySlug.get(loc.mall_slug);
  if (!mallEntry) {
    toDelete.push(loc);
    continue;
  }

  const brandSlug = loc.brand_menus?.slug;
  const brandName = loc.brand_menus?.name?.toLowerCase();

  // Check if brand exists in mall_restaurants by slug or name
  if (mallEntry.slugs.has(brandSlug)) continue;
  if (brandName && mallEntry.names.has(brandName)) continue;

  toDelete.push(loc);
}

// Group by mall for display
const byMall = new Map();
for (const loc of toDelete) {
  if (!byMall.has(loc.mall_slug)) byMall.set(loc.mall_slug, []);
  byMall.get(loc.mall_slug).push(loc);
}

console.log(`Phantom locations to delete: ${toDelete.length}`);
for (const [mall, locs] of [...byMall.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n  ${mall}: ${locs.length} brands`);
  for (const l of locs) {
    console.log(`    - ${l.brand_menus?.name}`);
  }
}

if (DRY_RUN) {
  console.log("\n[DRY RUN] No deletions made.");
  process.exit(0);
}

// Execute deletions
let deleted = 0;
for (const loc of toDelete) {
  const { error } = await sb.from("brand_locations").delete().eq("id", loc.id);
  if (error) {
    console.log(`  ERROR deleting ${loc.id}: ${error.message}`);
  } else {
    deleted++;
  }
}

console.log(`\nDeleted: ${deleted} phantom locations`);

// Final count
const { count } = await sb
  .from("brand_locations")
  .select("id", { count: "exact", head: true });
console.log(`Total brand_locations remaining: ${count}`);
