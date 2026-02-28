import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`)); return m?.[1]; };
const sb = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

const slugs = [
  "burger-king", "burger-king-imm", "burger-king-jem", "burger-king-vivo-city",
  "burger-king-the-woodleigh-mall", "hans", "hans-union", "beanstro",
  "big-appetite", "coca", "blanco-court-beef-noodles-aperia-mall",
  "rich-good-cake-shop", "l-derach", "ikea-jurong", "food-dynasty",
  "collins-nex", "collins-the-woodleigh-mall",
];

for (const slug of slugs) {
  const { data: brand } = await sb.from("brand_menus").select("id, name, menu_item_count").eq("slug", slug).single();
  if (!brand) { console.log(slug + ": NOT FOUND"); continue; }
  const { data: items } = await sb.from("menu_items").select("name, price").eq("brand_menu_id", brand.id).order("sort_order");
  console.log(`\n=== ${slug} (${brand.menu_item_count} items) ===`);
  for (const i of items || []) {
    console.log(`  ${i.price ? "$" + i.price : "NO PRICE"} | ${i.name}`);
  }
}
