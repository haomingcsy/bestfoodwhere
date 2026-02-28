import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`)); return m?.[1]; };
const sb = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

const slugs = [
  "koma-singapore",
  "lavo-italian-restaurant-and-rooftop-bar",
  "kei-kaisendon", "kei-kaisendon-vivocity",
  "juice-farm",
  "kopi-tarts-kallang-ave", "kopi-tarts-temasek-blvd",
];

for (const slug of slugs) {
  const { data: brand } = await sb.from("brand_menus").select("id, name, menu_item_count, scrape_status").eq("slug", slug).single();
  if (!brand) { console.log(`\n=== ${slug}: NOT FOUND ===`); continue; }
  
  // Get ALL items to see full picture
  const { data: items } = await sb.from("menu_items").select("name, price").eq("brand_menu_id", brand.id).order("sort_order");
  
  const withPrice = items.filter(i => i.price !== null).length;
  const withoutPrice = items.filter(i => i.price === null).length;
  
  console.log(`\n=== ${slug} (${items.length} items, ${withPrice} with price, ${withoutPrice} without) ===`);
  // Show first 15 items
  for (const i of items.slice(0, 15)) {
    console.log(`  ${i.price ? "$" + i.price : "NO PRICE"} | ${i.name}`);
  }
  if (items.length > 15) console.log(`  ... and ${items.length - 15} more`);
}
