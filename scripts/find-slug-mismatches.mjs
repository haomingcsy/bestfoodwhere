/**
 * find-slug-mismatches.mjs
 *
 * Investigates slug mismatches between delivery-app scrapers and the brand_menus table.
 *
 * Checks:
 *   1. Brands in brand_menus where menu_item_count = 0 or NULL but have menu_items via brand_menu_id
 *   2. Brands with menu_item_count > 0 but zero actual menu_items (stale counter)
 *   3. Brands where menu_item_count differs from actual count
 *   4. Specific check for "A-Roy Thai" and any related slugs
 *   5. Orphaned menu_categories / menu_items whose brand_menu_id doesn't exist in brand_menus
 *   6. Near-match slug pairs that could cause scraper confusion
 *   7. Scraper progress file analysis
 *
 * Usage:
 *   node scripts/find-slug-mismatches.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// === Supabase setup ===
const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => {
  const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`));
  return m?.[1];
};

const SUPABASE_URL = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// === Helpers ===

/** Paginate over a Supabase table, returning ALL rows (bypasses 1000-row default). */
async function fetchAll(table, select, filters = {}) {
  const PAGE = 1000;
  let all = [];
  let from = 0;
  while (true) {
    let q = supabase.from(table).select(select).range(from, from + PAGE - 1);
    for (const [col, val] of Object.entries(filters)) {
      if (val === null) q = q.is(col, null);
      else q = q.eq(col, val);
    }
    const { data, error } = await q;
    if (error) throw new Error(`fetchAll(${table}): ${error.message}`);
    all = all.concat(data || []);
    if (!data || data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

// === Main ===
async function main() {
  console.log("=".repeat(70));
  console.log("  SLUG MISMATCH INVESTIGATION");
  console.log("=".repeat(70));
  console.log();

  // -----------------------------------------------------------------------
  // Step 0: Load all brand_menus
  // -----------------------------------------------------------------------
  const allBrands = await fetchAll("brand_menus", "id, slug, name, menu_item_count, scrape_status, is_active");
  console.log(`Total brands in brand_menus: ${allBrands.length}`);

  const brandById = new Map(allBrands.map(b => [b.id, b]));
  const brandBySlug = new Map(allBrands.map(b => [b.slug, b]));

  // -----------------------------------------------------------------------
  // Step 1: Brands with menu_item_count = 0 or NULL
  // -----------------------------------------------------------------------
  const emptyBrands = allBrands.filter(b => !b.menu_item_count || b.menu_item_count === 0);
  console.log(`Brands with menu_item_count = 0 or NULL: ${emptyBrands.length}`);
  console.log();

  // -----------------------------------------------------------------------
  // Step 2: Get actual menu_items count per brand_menu_id
  // -----------------------------------------------------------------------
  console.log("Counting actual menu_items per brand...");

  const allMenuItems = await fetchAll("menu_items", "id, brand_menu_id");
  console.log(`Total menu_items rows: ${allMenuItems.length}`);

  // Count per brand_menu_id
  const actualCountByBrandId = new Map();
  for (const item of allMenuItems) {
    const c = actualCountByBrandId.get(item.brand_menu_id) || 0;
    actualCountByBrandId.set(item.brand_menu_id, c + 1);
  }

  console.log(`Distinct brand_menu_ids with menu_items: ${actualCountByBrandId.size}`);
  console.log();

  // -----------------------------------------------------------------------
  // CHECK 1: Brands with menu_item_count = 0/NULL but actually have items
  // -----------------------------------------------------------------------
  console.log("-".repeat(70));
  console.log("CHECK 1: Brands with menu_item_count=0/NULL but HAVE actual menu_items");
  console.log("-".repeat(70));

  const phantomEmpty = [];
  for (const brand of emptyBrands) {
    const actual = actualCountByBrandId.get(brand.id) || 0;
    if (actual > 0) {
      phantomEmpty.push({ ...brand, actual_items: actual });
    }
  }

  if (phantomEmpty.length === 0) {
    console.log("  None found. All brands with menu_item_count=0 truly have 0 menu_items.");
  } else {
    console.log(`  Found ${phantomEmpty.length} brands:`);
    for (const b of phantomEmpty) {
      console.log(`    - ${b.name} (${b.slug}): menu_item_count=${b.menu_item_count ?? "NULL"}, actual=${b.actual_items}`);
    }
  }
  console.log();

  // -----------------------------------------------------------------------
  // CHECK 2: Brands with menu_item_count > 0 but ZERO actual items (stale)
  // -----------------------------------------------------------------------
  console.log("-".repeat(70));
  console.log("CHECK 2: Brands with menu_item_count > 0 but ZERO actual menu_items (stale counter)");
  console.log("-".repeat(70));

  const staleCounts = [];
  for (const brand of allBrands) {
    if (brand.menu_item_count && brand.menu_item_count > 0) {
      const actual = actualCountByBrandId.get(brand.id) || 0;
      if (actual === 0) {
        staleCounts.push({ ...brand, actual_items: 0 });
      }
    }
  }

  if (staleCounts.length === 0) {
    console.log("  None found.");
  } else {
    console.log(`  Found ${staleCounts.length} brands:`);
    for (const b of staleCounts) {
      console.log(`    - ${b.name} (${b.slug}): menu_item_count=${b.menu_item_count}, actual=0`);
    }
  }
  console.log();

  // -----------------------------------------------------------------------
  // CHECK 3: Brands where menu_item_count doesn't match actual count
  // -----------------------------------------------------------------------
  console.log("-".repeat(70));
  console.log("CHECK 3: Brands where menu_item_count differs from actual count");
  console.log("-".repeat(70));

  const countMismatches = [];
  for (const brand of allBrands) {
    const recorded = brand.menu_item_count ?? 0;
    const actual = actualCountByBrandId.get(brand.id) || 0;
    if (recorded !== actual && (recorded > 0 || actual > 0)) {
      countMismatches.push({ ...brand, recorded, actual_items: actual, diff: actual - recorded });
    }
  }

  if (countMismatches.length === 0) {
    console.log("  All counts match perfectly.");
  } else {
    console.log(`  Found ${countMismatches.length} mismatches:`);
    countMismatches.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    for (const b of countMismatches) {
      const dir = b.diff > 0 ? "UNDER-counted" : "OVER-counted";
      console.log(`    - ${b.name} (${b.slug}): recorded=${b.recorded}, actual=${b.actual_items} [${dir} by ${Math.abs(b.diff)}]`);
    }
  }
  console.log();

  // -----------------------------------------------------------------------
  // CHECK 4: A-Roy Thai investigation
  // -----------------------------------------------------------------------
  console.log("-".repeat(70));
  console.log("CHECK 4: A-Roy Thai investigation");
  console.log("-".repeat(70));

  // Search brand_menus for anything containing "a-roy" or "aroy"
  const aroyBrands = allBrands.filter(b =>
    b.slug.includes("a-roy") ||
    b.slug.includes("aroy") ||
    b.name.toLowerCase().includes("a-roy") ||
    b.name.toLowerCase().includes("aroy") ||
    b.name.toLowerCase().includes("a roy")
  );

  if (aroyBrands.length === 0) {
    console.log("  No brands found matching 'a-roy' / 'aroy' in brand_menus.");
  } else {
    console.log(`  Found ${aroyBrands.length} brand(s) matching 'a-roy':`);
    for (const b of aroyBrands) {
      const actual = actualCountByBrandId.get(b.id) || 0;
      console.log(`    - ${b.name} (slug: ${b.slug}, id: ${b.id})`);
      console.log(`      menu_item_count=${b.menu_item_count ?? "NULL"}, actual_items=${actual}, status=${b.scrape_status}`);
    }
  }

  // Search menu_categories for anything with "a-roy" or "aroy" in name
  const { data: aroyCats } = await supabase
    .from("menu_categories")
    .select("id, brand_menu_id, name")
    .or("name.ilike.%a-roy%,name.ilike.%aroy%,name.ilike.%a roy%");

  if (aroyCats && aroyCats.length > 0) {
    console.log(`  Found ${aroyCats.length} menu_categories with 'a-roy' in name:`);
    for (const c of aroyCats) {
      const brand = brandById.get(c.brand_menu_id);
      console.log(`    - Category "${c.name}" -> brand: ${brand ? `${brand.name} (${brand.slug})` : `UNKNOWN (${c.brand_menu_id})`}`);
    }
  } else {
    console.log("  No menu_categories found with 'a-roy' in category name.");
  }

  // Check if any menu_items mention "a-roy" in their name
  const { data: aroyItems } = await supabase
    .from("menu_items")
    .select("id, brand_menu_id, name")
    .or("name.ilike.%a-roy%,name.ilike.%aroy%,name.ilike.%a roy%")
    .limit(10);

  if (aroyItems && aroyItems.length > 0) {
    console.log(`  Found ${aroyItems.length} menu_items mentioning 'a-roy':`);
    for (const item of aroyItems) {
      const brand = brandById.get(item.brand_menu_id);
      console.log(`    - "${item.name}" -> brand: ${brand ? `${brand.name} (${brand.slug})` : `UNKNOWN (${item.brand_menu_id})`}`);
    }
  } else {
    console.log("  No menu_items found mentioning 'a-roy' in item name.");
  }

  // For any a-roy brand found, check its menu_categories
  for (const b of aroyBrands) {
    const { data: cats } = await supabase
      .from("menu_categories")
      .select("id, name")
      .eq("brand_menu_id", b.id);
    if (cats && cats.length > 0) {
      console.log(`  Categories under "${b.name}" (${b.slug}):`);
      for (const c of cats) {
        console.log(`    - ${c.name}`);
      }
      const { count } = await supabase
        .from("menu_items")
        .select("id", { count: "exact", head: true })
        .eq("brand_menu_id", b.id);
      console.log(`  Total menu_items for this brand: ${count}`);
    } else {
      console.log(`  No menu_categories found for "${b.name}" (${b.slug}).`);
    }
  }

  // Also search for Thai-related brands with 0 items as potential mismatches
  const thaiBrands = allBrands.filter(b =>
    (b.name.toLowerCase().includes("thai") || b.slug.includes("thai")) &&
    (!b.menu_item_count || b.menu_item_count === 0)
  );
  if (thaiBrands.length > 0) {
    console.log(`  Thai-related brands with 0 menu items (for context):`);
    for (const b of thaiBrands) {
      console.log(`    - ${b.name} (${b.slug})`);
    }
  }
  console.log();

  // -----------------------------------------------------------------------
  // CHECK 5: Orphaned menu_categories (brand_menu_id not in brand_menus)
  // -----------------------------------------------------------------------
  console.log("-".repeat(70));
  console.log("CHECK 5: Orphaned menu_categories (brand_menu_id not in brand_menus)");
  console.log("-".repeat(70));

  const allCategories = await fetchAll("menu_categories", "id, brand_menu_id, name");
  console.log(`  Total menu_categories: ${allCategories.length}`);

  const orphanedCats = allCategories.filter(c => !brandById.has(c.brand_menu_id));

  if (orphanedCats.length === 0) {
    console.log("  No orphaned categories found. All menu_categories reference valid brand_menus.");
  } else {
    console.log(`  Found ${orphanedCats.length} orphaned categories:`);
    const grouped = new Map();
    for (const c of orphanedCats) {
      if (!grouped.has(c.brand_menu_id)) grouped.set(c.brand_menu_id, []);
      grouped.get(c.brand_menu_id).push(c);
    }
    for (const [bmId, cats] of grouped) {
      console.log(`    brand_menu_id ${bmId}: ${cats.length} categories`);
      for (const c of cats.slice(0, 5)) {
        console.log(`      - "${c.name}"`);
      }
      if (cats.length > 5) console.log(`      ... and ${cats.length - 5} more`);
    }
  }
  console.log();

  // -----------------------------------------------------------------------
  // CHECK 6: Orphaned menu_items (brand_menu_id not in brand_menus)
  // -----------------------------------------------------------------------
  console.log("-".repeat(70));
  console.log("CHECK 6: Orphaned menu_items (brand_menu_id not in brand_menus)");
  console.log("-".repeat(70));

  const orphanedItems = allMenuItems.filter(item => !brandById.has(item.brand_menu_id));

  if (orphanedItems.length === 0) {
    console.log("  No orphaned menu_items found.");
  } else {
    const grouped = new Map();
    for (const item of orphanedItems) {
      const c = grouped.get(item.brand_menu_id) || 0;
      grouped.set(item.brand_menu_id, c + 1);
    }
    console.log(`  Found ${orphanedItems.length} orphaned items across ${grouped.size} unknown brand_menu_ids:`);
    for (const [bmId, count] of grouped) {
      console.log(`    brand_menu_id ${bmId}: ${count} items`);
    }
  }
  console.log();

  // -----------------------------------------------------------------------
  // CHECK 7: Near-match slug pairs (potential scraper confusion)
  // -----------------------------------------------------------------------
  console.log("-".repeat(70));
  console.log("CHECK 7: Brands with similar slugs (potential scraper confusion)");
  console.log("-".repeat(70));

  const slugs = allBrands.map(b => b.slug).sort();
  const nearMatches = [];
  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      const a = slugs[i];
      const b = slugs[j];
      if (a !== b && (b.startsWith(a + "-") || a.startsWith(b + "-"))) {
        const brandA = brandBySlug.get(a);
        const brandB = brandBySlug.get(b);
        nearMatches.push({
          slugA: a,
          nameA: brandA?.name,
          countA: actualCountByBrandId.get(brandA?.id) || 0,
          slugB: b,
          nameB: brandB?.name,
          countB: actualCountByBrandId.get(brandB?.id) || 0,
        });
      }
    }
  }

  if (nearMatches.length === 0) {
    console.log("  No near-match slug pairs found.");
  } else {
    console.log(`  Found ${nearMatches.length} slug pairs that could cause confusion:`);
    for (const m of nearMatches) {
      console.log(`    "${m.slugA}" (${m.nameA}, ${m.countA} items) <-> "${m.slugB}" (${m.nameB}, ${m.countB} items)`);
    }
  }
  console.log();

  // -----------------------------------------------------------------------
  // CHECK 8: Scraper progress files
  // -----------------------------------------------------------------------
  console.log("-".repeat(70));
  console.log("CHECK 8: Scraper progress files - brands not found on platforms");
  console.log("-".repeat(70));

  const progressFiles = [
    { name: "GrabFood", path: "/Users/haoming/Desktop/bestfoodwhere/scripts/.grabfood-progress.json" },
    { name: "Deliveroo", path: "/Users/haoming/Desktop/bestfoodwhere/scripts/.deliveroo-progress.json" },
  ];

  for (const pf of progressFiles) {
    try {
      const data = JSON.parse(readFileSync(pf.path, "utf8"));
      const completed = Object.keys(data.completed || {});
      const notFound = data.notFound || [];
      const failed = Object.keys(data.failed || {});
      console.log(`  ${pf.name}:`);
      console.log(`    Completed: ${completed.length}`);
      console.log(`    Not found: ${notFound.length}`);
      console.log(`    Failed: ${failed.length}`);

      // Check if any completed slug doesn't exist in brand_menus
      const orphanedCompleted = completed.filter(s => !brandBySlug.has(s));
      if (orphanedCompleted.length > 0) {
        console.log(`    WARNING: ${orphanedCompleted.length} completed slugs NOT in brand_menus:`);
        for (const s of orphanedCompleted) {
          console.log(`      - ${s}`);
        }
      }
    } catch {
      console.log(`  ${pf.name}: No progress file found at ${pf.path}`);
    }
  }
  console.log();

  // -----------------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------------
  console.log("=".repeat(70));
  console.log("  SUMMARY");
  console.log("=".repeat(70));
  console.log(`  Total brands: ${allBrands.length}`);
  console.log(`  Brands with menu_item_count=0/NULL: ${emptyBrands.length}`);
  console.log(`  Phantom-empty (counter=0 but items exist): ${phantomEmpty.length}`);
  console.log(`  Stale counter (counter>0 but no items): ${staleCounts.length}`);
  console.log(`  Count mismatches: ${countMismatches.length}`);
  console.log(`  Orphaned categories: ${orphanedCats.length}`);
  console.log(`  Orphaned items: ${orphanedItems.length}`);
  console.log(`  Near-match slug pairs: ${nearMatches.length}`);
  console.log(`  A-Roy Thai brands found: ${aroyBrands.length}`);
  console.log();
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
