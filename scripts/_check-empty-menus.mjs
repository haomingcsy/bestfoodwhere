import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: brands } = await sb.from("brand_menus").select("id,name,slug").limit(1000);
const { data: items } = await sb.from("menu_items").select("brand_menu_id").limit(50000);

const countMap = {};
for (const i of items || []) countMap[i.brand_menu_id] = (countMap[i.brand_menu_id] || 0) + 1;

const noMenu = brands.filter(b => !countMap[b.id]);
const hasMenu = brands.filter(b => countMap[b.id]);
const hasMenuNames = new Set(hasMenu.map(h => h.name.toLowerCase()));

let hasParent = 0, orphans = 0;
const parentedList = [], orphanList = [];

for (const b of noMenu) {
  const atMatch = b.name.match(/^(.+?)\s*@\s*.+$/);
  if (atMatch) {
    const parentName = atMatch[1].trim().toLowerCase();
    if (hasMenuNames.has(parentName)) {
      hasParent++;
      parentedList.push(b.name);
    } else {
      orphans++;
      orphanList.push(b.name);
    }
  } else {
    orphans++;
    orphanList.push(b.name);
  }
}

console.log("Total brands:", brands.length);
console.log("With menu_items:", hasMenu.length);
console.log("Without menu_items:", noMenu.length);
console.log("\n--- Empty but parent brand HAS menus:", hasParent, "---");
parentedList.slice(0, 15).forEach(n => console.log("  ", n));
console.log("\n--- Truly empty (no matching parent):", orphans, "---");
orphanList.slice(0, 40).forEach(n => console.log("  ", n));

// Also check: does the menu page use food_menu (from sheets) or menu_items (supabase)?
const { data: ftJ8 } = await sb.from("brand_menus").select("food_menu").eq("slug", "fun-toast-junction-8").single();
const { data: ft } = await sb.from("brand_menus").select("food_menu").eq("slug", "fun-toast").single();
console.log("\n--- food_menu column check ---");
console.log("Fun Toast (main) food_menu:", ft?.food_menu ? `HAS DATA (${JSON.stringify(ft.food_menu).length} chars)` : "NULL/EMPTY");
console.log("Fun Toast J8 food_menu:", ftJ8?.food_menu ? `HAS DATA (${JSON.stringify(ftJ8.food_menu).length} chars)` : "NULL/EMPTY");

// Check if brand_menus has a food_menu column at all
const { data: cols } = await sb.rpc("get_columns", { table_name: "brand_menus" }).catch(() => ({ data: null }));
if (!cols) {
  // Just check a sample brand with known menu
  const { data: sample } = await sb.from("brand_menus").select("*").eq("slug", "fun-toast").single();
  console.log("\nFun Toast columns:", Object.keys(sample || {}).join(", "));
}
