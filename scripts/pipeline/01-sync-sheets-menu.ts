/**
 * 01-sync-sheets-menu.ts
 *
 * Syncs all menu items from Google Sheets ("Food Menu" column) into Supabase
 * tables: menu_categories and menu_items. For each brand found in Sheets with
 * menu data, it looks up the matching brand_menus row by slug, clears any
 * existing categories/items, and inserts fresh data.
 *
 * Usage:
 *   npx tsx scripts/pipeline/01-sync-sheets-menu.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { fetchAllBrands } from "../../lib/google-sheets";
import type { BrandData, MenuCategory } from "../../types/brand";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

config({ path: resolve(__dirname, "../../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PRICE_REGEX = /(?:S?\$|SGD)\s*(\d{1,4}(?:\.\d{1,2})?)/;

/**
 * Extract a numeric price from a price string like "$12.50", "S$8.90", "SGD 5".
 * Returns null if no price can be parsed.
 */
function parsePriceNumeric(price: string | undefined): number | null {
  if (!price) return null;
  const match = price.match(PRICE_REGEX);
  if (!match) return null;
  const val = parseFloat(match[1]);
  return isNaN(val) ? null : val;
}

/**
 * Check if a brand has any actual menu items.
 */
function hasMenuItems(menu: MenuCategory[]): boolean {
  if (!menu || menu.length === 0) return false;
  return menu.some((cat) => cat.items && cat.items.length > 0);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== 01-sync-sheets-menu: Syncing menus from Google Sheets to Supabase ===\n");

  // 1. Fetch all brands from Google Sheets
  console.log("Fetching all brands from Google Sheets...");
  const brands: BrandData[] = await fetchAllBrands();
  console.log(`Fetched ${brands.length} brands from Sheets.\n`);

  // 2. Fetch all brand_menus rows from Supabase (slug -> id mapping)
  console.log("Fetching brand_menus from Supabase...");
  const { data: brandMenuRows, error: bmError } = await supabase
    .from("brand_menus")
    .select("id, slug");

  if (bmError) {
    console.error("Failed to fetch brand_menus:", bmError.message);
    process.exit(1);
  }

  const slugToMenuId = new Map<string, string>();
  for (const row of brandMenuRows ?? []) {
    slugToMenuId.set(row.slug, row.id);
  }
  console.log(`Found ${slugToMenuId.size} brand_menus rows in Supabase.\n`);

  // 3. Process each brand
  let totalProcessed = 0;
  let totalSkippedNoMenu = 0;
  let totalSkippedNoMatch = 0;
  let totalFailed = 0;
  let totalCategoriesInserted = 0;
  let totalItemsInserted = 0;

  for (let i = 0; i < brands.length; i++) {
    const brand = brands[i];

    // Progress logging every 10 brands
    if (i > 0 && i % 10 === 0) {
      console.log(
        `  Progress: ${i}/${brands.length} brands processed ` +
          `(${totalCategoriesInserted} categories, ${totalItemsInserted} items so far)`,
      );
    }

    // Skip if no menu data
    if (!hasMenuItems(brand.menu)) {
      totalSkippedNoMenu++;
      continue;
    }

    // Look up brand_menus row by slug
    const brandMenuId = slugToMenuId.get(brand.slug);
    if (!brandMenuId) {
      totalSkippedNoMatch++;
      if (totalSkippedNoMatch <= 5) {
        console.warn(`  WARN: No brand_menus row for slug "${brand.slug}" — skipping`);
      }
      continue;
    }

    try {
      // Delete existing menu_items first (FK constraint: menu_items.category_id -> menu_categories.id)
      const { error: delItemsErr } = await supabase
        .from("menu_items")
        .delete()
        .eq("brand_menu_id", brandMenuId);

      if (delItemsErr) {
        throw new Error(`Failed to delete menu_items: ${delItemsErr.message}`);
      }

      // Delete existing menu_categories
      const { error: delCatsErr } = await supabase
        .from("menu_categories")
        .delete()
        .eq("brand_menu_id", brandMenuId);

      if (delCatsErr) {
        throw new Error(`Failed to delete menu_categories: ${delCatsErr.message}`);
      }

      // Insert categories in batch
      const categoryRows = brand.menu
        .filter((cat) => cat.items && cat.items.length > 0)
        .map((cat, idx) => ({
          brand_menu_id: brandMenuId,
          name: cat.name,
          sort_order: idx,
          is_active: true,
        }));

      if (categoryRows.length === 0) {
        totalSkippedNoMenu++;
        continue;
      }

      const { data: insertedCats, error: catInsertErr } = await supabase
        .from("menu_categories")
        .insert(categoryRows)
        .select("id, name, sort_order");

      if (catInsertErr) {
        throw new Error(`Failed to insert menu_categories: ${catInsertErr.message}`);
      }

      if (!insertedCats || insertedCats.length === 0) {
        throw new Error("No categories returned after insert");
      }

      // Build a map from category name+sort_order to the inserted category id
      const catNameToId = new Map<string, string>();
      for (const cat of insertedCats) {
        // Use sort_order as a key component in case of duplicate category names
        catNameToId.set(`${cat.sort_order}::${cat.name}`, cat.id);
      }

      totalCategoriesInserted += insertedCats.length;

      // Build all menu item rows
      const itemRows: Array<Record<string, unknown>> = [];
      const filteredMenu = brand.menu.filter(
        (cat) => cat.items && cat.items.length > 0,
      );

      for (let catIdx = 0; catIdx < filteredMenu.length; catIdx++) {
        const cat = filteredMenu[catIdx];
        const categoryId = catNameToId.get(`${catIdx}::${cat.name}`);

        for (let itemIdx = 0; itemIdx < cat.items.length; itemIdx++) {
          const item = cat.items[itemIdx];
          itemRows.push({
            brand_menu_id: brandMenuId,
            category_id: categoryId ?? null,
            name: item.name,
            description: item.description ?? null,
            price: item.price ?? null,
            price_numeric: parsePriceNumeric(item.price),
            original_image_url: item.imageUrl || null,
            sort_order: itemIdx,
            is_available: true,
            is_featured: false,
          });
        }
      }

      // Insert items in batch
      if (itemRows.length > 0) {
        const { error: itemInsertErr } = await supabase
          .from("menu_items")
          .insert(itemRows);

        if (itemInsertErr) {
          throw new Error(`Failed to insert menu_items: ${itemInsertErr.message}`);
        }

        totalItemsInserted += itemRows.length;
      }

      // Update brand_menus.menu_item_count
      const { error: updateErr } = await supabase
        .from("brand_menus")
        .update({ menu_item_count: itemRows.length })
        .eq("id", brandMenuId);

      if (updateErr) {
        console.warn(
          `  WARN: Failed to update menu_item_count for "${brand.slug}": ${updateErr.message}`,
        );
      }

      totalProcessed++;
    } catch (err) {
      totalFailed++;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ERROR processing "${brand.slug}": ${msg}`);
    }
  }

  // Final summary
  console.log("\n=== Sync Complete ===");
  console.log(`  Total brands from Sheets:    ${brands.length}`);
  console.log(`  Successfully processed:      ${totalProcessed}`);
  console.log(`  Skipped (no menu data):      ${totalSkippedNoMenu}`);
  console.log(`  Skipped (no brand_menus match): ${totalSkippedNoMatch}`);
  console.log(`  Failed:                      ${totalFailed}`);
  console.log(`  Categories inserted:         ${totalCategoriesInserted}`);
  console.log(`  Menu items inserted:         ${totalItemsInserted}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
