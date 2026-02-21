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

// Fetch Assessment sheet columns A (Name) and F (Food Menu) via API key
const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Assessment!A:F?key=${API_KEY}`;
const res = await fetch(url);
const json = await res.json();

if (!json.values) {
  console.error("Failed to fetch sheet:", json.error?.message || json);
  process.exit(1);
}

const rows = json.values;
// Row 1 is title, Row 2 is header, data starts at Row 3
const header = rows[1]; // 0-indexed row 1 = sheet row 2
const nameCol = header.indexOf("Name");
const menuCol = header.indexOf("Food Menu");
console.log(`Sheet columns: Name=${nameCol}, Food Menu=${menuCol}`);
console.log(`Sheet rows: ${rows.length - 2}`);

// Build map: brand name (lowercase) -> has non-empty food menu
const sheetsMenuMap = new Map();
for (let i = 2; i < rows.length; i++) {
  const name = (rows[i][nameCol] || "").trim();
  const menu = (rows[i][menuCol] || "").trim();
  if (name) {
    sheetsMenuMap.set(name.toLowerCase(), menu.length > 10);
  }
}

const withMenu = [...sheetsMenuMap.values()].filter(Boolean).length;
console.log(`Brands with food menu in Sheets: ${withMenu}`);
console.log(`Brands without food menu in Sheets: ${sheetsMenuMap.size - withMenu}`);

// Get all brands with 0 items in Supabase
const { data: emptyBrands } = await sb
  .from("brand_menus")
  .select("id, slug, name, website_url")
  .eq("menu_item_count", 0)
  .order("name");

console.log(`\nBrands with 0 Supabase items: ${emptyBrands.length}`);

const trulyEmpty = [];
const hasSheets = [];

for (const brand of emptyBrands) {
  const nameKey = brand.name.toLowerCase().trim();
  if (sheetsMenuMap.has(nameKey) && sheetsMenuMap.get(nameKey)) {
    hasSheets.push(brand);
  } else {
    trulyEmpty.push(brand);
  }
}

console.log(`\nHas menu in Sheets (fallback works): ${hasSheets.length}`);
console.log(`TRULY EMPTY (no menu anywhere): ${trulyEmpty.length}`);

console.log(`\n=== TRULY EMPTY BRANDS (candidates to remove) ===`);
trulyEmpty.forEach((b) =>
  console.log(`  ${b.slug} | ${b.name}`)
);

// Output slugs for easy scripting
console.log(`\n=== SLUGS FOR REMOVAL ===`);
console.log(JSON.stringify(trulyEmpty.map((b) => b.slug)));
