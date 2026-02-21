import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = env.match(new RegExp(`${key}="?([^"\\n]+)`)); return m?.[1]; };

const supabase = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

// Check how many brands have delivery app URLs
const { data: brands } = await supabase
  .from("brand_menus")
  .select("slug, name, social_links, menu_item_count")
  .eq("is_active", true);

let hasGrab = 0, hasFoodPanda = 0, hasDeliveroo = 0, hasAny = 0;
let emptyWithGrab = 0, emptyWithFP = 0, emptyWithDel = 0, emptyWithAny = 0;

for (const b of brands || []) {
  const sl = b.social_links || {};
  const g = !!sl.grabfood;
  const f = !!sl.foodpanda;
  const d = !!sl.deliveroo;
  if (g) hasGrab++;
  if (f) hasFoodPanda++;
  if (d) hasDeliveroo++;
  if (g || f || d) hasAny++;
  
  if (b.menu_item_count === 0) {
    if (g) emptyWithGrab++;
    if (f) emptyWithFP++;
    if (d) emptyWithDel++;
    if (g || f || d) emptyWithAny++;
  }
}

console.log("=== Delivery App URL Coverage ===\n");
console.log(`Total brands: ${brands?.length}`);
console.log(`Brands with GrabFood URL: ${hasGrab}`);
console.log(`Brands with FoodPanda URL: ${hasFoodPanda}`);
console.log(`Brands with Deliveroo URL: ${hasDeliveroo}`);
console.log(`Brands with ANY delivery URL: ${hasAny}\n`);

console.log("=== Among brands with 0 menu items (570) ===\n");
console.log(`Empty brands with GrabFood URL: ${emptyWithGrab}`);
console.log(`Empty brands with FoodPanda URL: ${emptyWithFP}`);
console.log(`Empty brands with Deliveroo URL: ${emptyWithDel}`);
console.log(`Empty brands with ANY delivery URL: ${emptyWithAny}`);

// Show sample of social_links for brands with delivery URLs
const sample = (brands || []).filter(b => b.social_links?.grabfood).slice(0, 3);
console.log("\nSample GrabFood URLs:");
for (const b of sample) {
  console.log(`  ${b.name}: ${b.social_links.grabfood}`);
}
