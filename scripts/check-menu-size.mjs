import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data } = await sb.from("brand_menus").select("id").eq("slug", "sushi-tei").single();
if (!data) { console.log("no brand"); process.exit(); }

const { data: items, count } = await sb.from("menu_items")
  .select("name, description, original_image_url, cdn_image_url", { count: "exact" })
  .eq("brand_menu_id", data.id);

console.log("Total items:", count);
const descs = (items || []).filter(i => i.description).map(i => i.description.length);
console.log("Items with descriptions:", descs.length);
if (descs.length > 0) {
  console.log("Avg desc length:", Math.round(descs.reduce((a, b) => a + b, 0) / descs.length));
  console.log("Max desc length:", Math.max(...descs));
}
const withImg = (items || []).filter(i => i.cdn_image_url || i.original_image_url).length;
console.log("Items with images:", withImg);
console.log("Raw JSON size:", (JSON.stringify(items).length / 1024).toFixed(0), "KB");

// Also check top 5 heaviest brands
const { data: brands } = await sb.from("brand_menus").select("slug, id");
const results = [];
for (const b of brands || []) {
  const { count: c } = await sb.from("menu_items").select("id", { count: "exact", head: true }).eq("brand_menu_id", b.id);
  results.push({ slug: b.slug, count: c || 0 });
}
results.sort((a, b) => b.count - a.count);
console.log("\nTop 10 heaviest brands by item count:");
results.slice(0, 10).forEach(r => console.log(`  ${r.slug}: ${r.count} items`));
