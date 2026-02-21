import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data } = await sb.from("brand_menus").select("slug, website_url").eq("menu_item_count", 0).limit(200);
const slugSet = new Set(data.map(b => b.slug));

const progress = JSON.parse(readFileSync("scripts/.vision-progress.json", "utf8"));

let removedCompleted = 0, removedNoMenu = 0, removedFailed = 0;

for (const slug of slugSet) {
  if (progress.completed && progress.completed[slug]) { delete progress.completed[slug]; removedCompleted++; }
  if (progress.failed && progress.failed[slug]) { delete progress.failed[slug]; removedFailed++; }
}
if (progress.noMenu) {
  const before = progress.noMenu.length;
  progress.noMenu = progress.noMenu.filter(s => !slugSet.has(s));
  removedNoMenu = before - progress.noMenu.length;
}

writeFileSync("scripts/.vision-progress.json", JSON.stringify(progress, null, 2));
console.log("Removed from completed:", removedCompleted);
console.log("Removed from noMenu:", removedNoMenu);
console.log("Removed from failed:", removedFailed);
console.log("Remaining completed:", Object.keys(progress.completed || {}).length);
console.log("Remaining noMenu:", (progress.noMenu || []).length);
console.log("Remaining failed:", Object.keys(progress.failed || {}).length);
console.log("\nEmpty brand slugs:", slugSet.size);

// Also show how many have website URLs vs not
const withUrl = data.filter(b => b.website_url && !b.website_url.includes("facebook.com") && !b.website_url.includes("instagram.com"));
const socialOnly = data.filter(b => b.website_url && (b.website_url.includes("facebook.com") || b.website_url.includes("instagram.com")));
const noUrl = data.filter(b => !b.website_url);
console.log("\nWith scrapable website_url:", withUrl.length);
console.log("Social media only URL:", socialOnly.length);
console.log("No website_url:", noUrl.length);
