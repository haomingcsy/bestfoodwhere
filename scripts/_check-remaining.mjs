import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync, existsSync } from "fs";
config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Load progress files
const grabProgress = existsSync("scripts/.grabfood-progress.json")
  ? JSON.parse(readFileSync("scripts/.grabfood-progress.json", "utf8"))
  : {};
const deliverooProgress = existsSync("scripts/.deliveroo-progress.json")
  ? JSON.parse(readFileSync("scripts/.deliveroo-progress.json", "utf8"))
  : {};

const { data: zero } = await sb.from("brand_menus")
  .select("slug, name, website_url")
  .eq("menu_item_count", 0)
  .order("name");

console.log(`=== ${zero.length} brands with 0 menu items ===\n`);

// Categorize
const categories = { both_not_found: [], grab_only_not_found: [], deliveroo_only_not_found: [], neither_searched: [] };

for (const b of zero) {
  const gStatus = grabProgress[b.slug];
  const dStatus = deliverooProgress[b.slug];
  const grabNotFound = gStatus === "notFound" || gStatus === "failed";
  const deliverooNotFound = dStatus === "notFound" || dStatus === "failed";

  if (grabNotFound && deliverooNotFound) categories.both_not_found.push(b);
  else if (grabNotFound) categories.grab_only_not_found.push(b);
  else if (deliverooNotFound) categories.deliveroo_only_not_found.push(b);
  else categories.neither_searched.push(b);
}

console.log(`Not found on BOTH platforms: ${categories.both_not_found.length}`);
console.log(`Not found on GrabFood only: ${categories.grab_only_not_found.length}`);
console.log(`Not found on Deliveroo only: ${categories.deliveroo_only_not_found.length}`);
console.log(`Not searched on either: ${categories.neither_searched.length}`);

// Show the brands with potential (have website URL or known chain)
console.log("\n--- Brands not found on both platforms ---");
for (const b of categories.both_not_found) {
  // Extract core brand name (remove location suffixes)
  const coreName = b.name
    .replace(/@\s*.+$/, "")
    .replace(/\s*[-–]\s*(Jewel|NEX|JEM|Junction|Bedok|Suntec|VivoCity|ION|MBS|Orchard|Woodleigh|Novena|Causeway|AMK|Tampines|Waterway|Tiong).*/i, "")
    .replace(/\s*\(.+\)\s*$/, "")
    .trim();

  const suffix = coreName !== b.name ? ` → core: "${coreName}"` : "";
  console.log(`  ${b.slug} (${b.name})${suffix} ${b.website_url ? "[has website]" : ""}`);
}

console.log("\n--- Not searched on either ---");
for (const b of categories.neither_searched) {
  console.log(`  ${b.slug} (${b.name}) ${b.website_url ? "[has website]" : ""}`);
}
