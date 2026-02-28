/**
 * Find brands where ALL items have no price — likely garbage scrape data.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`)); return m?.[1]; };
const sb = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

// Get all brands with menu items
const { data: brands } = await sb.from("brand_menus")
  .select("id, slug, name, menu_item_count")
  .eq("is_active", true)
  .gt("menu_item_count", 0)
  .order("name");

let suspicious = 0;
for (const brand of brands) {
  // Count items with prices
  const { count: withPrice } = await sb.from("menu_items")
    .select("*", { count: "exact", head: true })
    .eq("brand_menu_id", brand.id)
    .not("price", "is", null);

  // If NO items have prices, check if they look like real food
  if (withPrice === 0) {
    const { data: items } = await sb.from("menu_items")
      .select("name")
      .eq("brand_menu_id", brand.id)
      .limit(5);
    const names = items.map(i => i.name).join(" | ");
    console.log(`${brand.slug} (${brand.menu_item_count} items, 0 with prices): ${names}`);
    suspicious++;
  }
}

console.log(`\nTotal brands with no priced items: ${suspicious}`);
