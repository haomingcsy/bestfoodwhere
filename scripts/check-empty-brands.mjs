import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = env.match(new RegExp(`${key}="?([^"\\n]+)`)); return m?.[1]; };

const supabase = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

// Get brands with 0 menu items
const { data: emptyBrands } = await supabase
  .from("brand_menus")
  .select("slug, name, description, ai_description, ai_amenities, website_url, menu_item_count")
  .eq("is_active", true)
  .eq("menu_item_count", 0)
  .limit(20);

console.log(`Sample of brands with 0 menu items:\n`);
for (const b of emptyBrands || []) {
  console.log(`- ${b.name} (${b.slug})`);
  console.log(`  website: ${b.website_url || 'none'}`);
  console.log(`  has description: ${!!(b.description || b.ai_description)}`);
  console.log(`  amenities: ${JSON.stringify(b.ai_amenities?.slice(0,3))}`);
  console.log();
}

// Get cuisine breakdown from mall_restaurants for empty brands
const { data: cuisineData } = await supabase
  .from("brand_locations")
  .select("brand_menu_id, mall_restaurants!mall_restaurant_id(cuisines)")
  .in("brand_menu_id", (emptyBrands || []).map(b => b.slug));

// Count total empty brands
const { count } = await supabase
  .from("brand_menus")
  .select("*", { count: "exact", head: true })
  .eq("is_active", true)
  .eq("menu_item_count", 0);

console.log(`\nTotal brands with 0 menu items: ${count}`);

// Check how many have AI descriptions at least
const { count: withDesc } = await supabase
  .from("brand_menus")
  .select("*", { count: "exact", head: true })
  .eq("is_active", true)
  .eq("menu_item_count", 0)
  .not("ai_description", "is", null);

console.log(`Of those, brands with AI description: ${withDesc}`);

// Check how many have website_url
const { count: withWebsite } = await supabase
  .from("brand_menus")
  .select("*", { count: "exact", head: true })
  .eq("is_active", true)
  .eq("menu_item_count", 0)
  .not("website_url", "is", null);

console.log(`Of those, brands with website URL: ${withWebsite}`);
