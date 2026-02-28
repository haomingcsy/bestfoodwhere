import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (k) => { const m = envFile.match(new RegExp(`${k}="?([^"\\n]+)`)); return m?.[1]; };
const sb = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"));

const { data } = await sb.from("brand_menus")
  .select("slug, name, website_url")
  .eq("is_active", true)
  .eq("menu_item_count", 0)
  .order("name");

function core(n) {
  return n
    .replace(/\s*[@|]\s*.+$/g, "")
    .replace(/\s+-\s+.+$/, "")
    .replace(/\s*\([^)]+\)\s*/g, "")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[éè]/g, "e")
    .trim()
    .toLowerCase()
    .slice(0, 30);
}

const groups = {};
for (const b of data) {
  const c = core(b.name);
  if (!groups[c]) groups[c] = [];
  groups[c].push(b);
}

const multiLoc = Object.entries(groups).filter(([, v]) => v.length > 1);
const singles = Object.entries(groups).filter(([, v]) => v.length === 1);

console.log(`Unique brands (single location): ${singles.length}`);
console.log(`Multi-location groups: ${multiLoc.length} (${multiLoc.reduce((s, [, v]) => s + v.length, 0)} brands)`);
console.log(`\nMulti-location groups (only need 1 menu each):`);
for (const [c, brands] of multiLoc) {
  console.log(`  "${c}": ${brands.map(b => b.slug).join(", ")}`);
}

// Categorize singles by website type
const cats = { properWebsite: [], instagram: [], facebook: [], noWebsite: [], other: [] };
for (const [, brands] of singles) {
  const b = brands[0];
  const url = b.website_url || "";
  if (!url) cats.noWebsite.push(b);
  else if (url.includes("instagram.com")) cats.instagram.push(b);
  else if (url.includes("facebook.com")) cats.facebook.push(b);
  else cats.properWebsite.push(b);
}

console.log(`\nSingle-location brands by website type:`);
console.log(`  Proper website: ${cats.properWebsite.length}`);
console.log(`  Instagram only: ${cats.instagram.length}`);
console.log(`  Facebook only: ${cats.facebook.length}`);
console.log(`  No website: ${cats.noWebsite.length}`);

console.log(`\nTotal brands: ${data.length}`);
console.log(`Unique brand names: ${Object.keys(groups).length}`);
console.log(`If we get 1 menu per unique group: ${multiLoc.reduce((s, [, v]) => s + v.length - 1, 0)} additional brands would be filled`);
