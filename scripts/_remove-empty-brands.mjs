import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

const DRY_RUN = process.argv.includes("--dry-run");

// Get all brands with 0 menu items
const { data: emptyBrands, error } = await sb
  .from("brand_menus")
  .select("id, slug, name")
  .eq("menu_item_count", 0)
  .order("name");

if (error) { console.error("Query error:", error); process.exit(1); }

// Cross-check with Google Sheets to exclude brands that have Sheets fallback
const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Assessment!A:F?key=${API_KEY}`;
const res = await fetch(url);
const json = await res.json();
const rows = json.values || [];
const header = rows[1];
const nameCol = header.indexOf("Name");
const menuCol = header.indexOf("Food Menu");

const sheetsMenuMap = new Map();
for (let i = 2; i < rows.length; i++) {
  const name = (rows[i][nameCol] || "").trim();
  const menu = (rows[i][menuCol] || "").trim();
  if (name) sheetsMenuMap.set(name.toLowerCase(), { hasMenu: menu.length > 10, rowIndex: i });
}

// Filter to truly empty (no Supabase items AND no Sheets menu)
const toRemove = emptyBrands.filter((b) => {
  const key = b.name.toLowerCase().trim();
  const sheets = sheetsMenuMap.get(key);
  return !sheets || !sheets.hasMenu;
});

console.log(`Total empty in Supabase: ${emptyBrands.length}`);
console.log(`Truly empty (removing): ${toRemove.length}`);
if (DRY_RUN) console.log("--- DRY RUN MODE ---");

const slugs = toRemove.map((b) => b.slug);
const ids = toRemove.map((b) => b.id);

// Step 1: Delete from Supabase (order matters for FK constraints)
console.log("\n=== SUPABASE DELETION ===");

// Delete menu_items for these brands
if (!DRY_RUN) {
  // Delete in batches of 50 IDs to avoid query limits
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const { error: e1 } = await sb.from("menu_items").delete().in("brand_menu_id", batch);
    if (e1) console.error(`  menu_items batch ${i}: ${e1.message}`);
  }
  console.log("  Deleted menu_items");

  // Delete menu_categories
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const { error: e2 } = await sb.from("menu_categories").delete().in("brand_menu_id", batch);
    if (e2) console.error(`  menu_categories batch ${i}: ${e2.message}`);
  }
  console.log("  Deleted menu_categories");

  // Delete brand_locations
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const { error: e3 } = await sb.from("brand_locations").delete().in("brand_menu_id", batch);
    if (e3) console.error(`  brand_locations batch ${i}: ${e3.message}`);
  }
  console.log("  Deleted brand_locations");

  // Delete brand_menus (the main rows)
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const { error: e4 } = await sb.from("brand_menus").delete().in("id", batch);
    if (e4) console.error(`  brand_menus batch ${i}: ${e4.message}`);
  }
  console.log("  Deleted brand_menus");
} else {
  console.log(`  Would delete from menu_items, menu_categories, brand_locations, brand_menus for ${ids.length} brands`);
}

// Step 2: Delete from Google Sheets
console.log("\n=== GOOGLE SHEETS DELETION ===");

// Build list of sheet row indices to delete (0-indexed from rows array)
const rowsToDelete = [];
const namesLower = new Set(toRemove.map((b) => b.name.toLowerCase().trim()));

for (let i = 2; i < rows.length; i++) {
  const name = (rows[i][nameCol] || "").trim().toLowerCase();
  if (namesLower.has(name)) {
    rowsToDelete.push(i); // 0-indexed in the rows array
  }
}

console.log(`  Matched ${rowsToDelete.length} rows in Google Sheets for deletion`);

if (!DRY_RUN && rowsToDelete.length > 0) {
  // Use Sheets API batchUpdate to delete rows
  // Rows must be deleted from bottom to top to preserve indices
  const sheetId = 0; // Assume Assessment is first sheet (sheetId 0)

  // We need to get the actual sheetId for the Assessment sheet
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties&key=${API_KEY}`;
  const metaRes = await fetch(metaUrl);
  const metaJson = await metaRes.json();
  const assessmentSheet = metaJson.sheets?.find(
    (s) => s.properties?.title === "Assessment"
  );
  const actualSheetId = assessmentSheet?.properties?.sheetId ?? 0;

  // Unfortunately, deleting rows via API key doesn't work (read-only).
  // We need OAuth or service account for write operations.
  // For now, output the rows to delete so user can do it manually or we use a different auth method.
  console.log("  NOTE: Google Sheets API key is read-only. Cannot delete rows directly.");
  console.log("  Rows to delete (sheet row numbers, 1-indexed):");

  // Convert to 1-indexed sheet row numbers
  const sheetRowNumbers = rowsToDelete.map((i) => i + 1).sort((a, b) => b - a);
  console.log(`  ${sheetRowNumbers.join(", ")}`);

  // Try using service account if available
  const credFiles = ["client_secret_google_sheets.json", "service-account.json"];
  let serviceAccountPath = null;
  for (const f of credFiles) {
    try {
      const { statSync } = await import("fs");
      statSync(resolve(__dirname, "..", f));
      serviceAccountPath = resolve(__dirname, "..", f);
      break;
    } catch {}
  }

  if (!serviceAccountPath) {
    // Try the OAuth file for write access
    const { readdirSync } = await import("fs");
    const files = readdirSync(resolve(__dirname, ".."));
    const oauthFile = files.find((f) => f.startsWith("client_secret_") && f.endsWith(".json"));
    if (oauthFile) {
      console.log(`  Found OAuth file: ${oauthFile} (needs user consent flow for writes)`);
    }
    console.log("  Skipping Sheets deletion - no service account credentials found.");
    console.log("  The brands have been removed from Supabase. Sheets rows can be deleted manually.");
    console.log(`  Brand names to search and delete in Sheets:`);
    toRemove.slice(0, 10).forEach((b) => console.log(`    ${b.name}`));
    console.log(`    ... and ${toRemove.length - 10} more`);
  }
} else if (DRY_RUN) {
  console.log(`  Would delete ${rowsToDelete.length} rows from Assessment sheet`);
}

// Step 3: Verify
if (!DRY_RUN) {
  const { count } = await sb
    .from("brand_menus")
    .select("id", { count: "exact", head: true });
  const { count: withItems } = await sb
    .from("brand_menus")
    .select("id", { count: "exact", head: true })
    .gt("menu_item_count", 0);

  console.log(`\n=== VERIFICATION ===`);
  console.log(`  Total brands remaining: ${count}`);
  console.log(`  Brands with menu items: ${withItems}`);
  console.log(`  Brands without items: ${count - withItems}`);
  console.log(`  Coverage: ${withItems}/${count} (${((withItems / count) * 100).toFixed(1)}%)`);
}
