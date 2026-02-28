import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = envFile.match(new RegExp(`${key}="?([^"\n]+)`)); return m?.[1]; };
const sb = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

// Check brands that were re-scraped after cleanup, plus new finds
const slugs = [
  // Previously cleaned, re-scraped by website scraper
  "mcdonalds", "mcdonalds-suntec-city", "mcdonalds-jem",
  "ikea-jurong", "l-derach", "kazo-vivocity", "kazo-amk-hub",
  "i-love-taimei-junction-8", "i-love-taimei-the-woodleigh-mall-fried-chicken-bubble-tea-taiwan-street-food",
  "jollibee-suntec-city", "jollibee-vivo-city", "jollibee-woodlands-mrt",
  "hot-tomato", "hot-tomato-bistro",
  "little-italy-woodleigh",
  "song-fa-bak-kut-teh-suntec-city", "song-fa-bak-kut-teh-jewel-changi-airport",
  "the-coffee-bean-tea-leaf",
  // New finds - check quality
  "koma-singapore",
  "lavo-italian-restaurant-and-rooftop-bar",
  "kei-kaisendon", "kei-kaisendon-vivocity",
  "juice-farm",
  "kopi-tarts-kallang-ave",
];

for (const slug of slugs) {
  const { data: brand } = await sb.from("brand_menus").select("id, name, menu_item_count, scrape_status").eq("slug", slug).single();
  if (!brand) { console.log(`\n=== ${slug}: NOT FOUND ===`); continue; }
  const { data: items } = await sb.from("menu_items").select("name, price").eq("brand_menu_id", brand.id).order("sort_order").limit(8);
  console.log(`\n=== ${slug} (${brand.menu_item_count} items, status: ${brand.scrape_status}) ===`);
  for (const i of items || []) {
    console.log(`  ${i.price ? "$" + i.price : "NO PRICE"} | ${i.name}`);
  }
}
