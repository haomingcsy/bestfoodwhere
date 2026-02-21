import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await sb
  .from("brand_menus")
  .select("slug, name, website_url, scrape_status")
  .eq("menu_item_count", 0)
  .order("name");

if (error) { console.error("Query error:", error); process.exit(1); }
if (!data) { console.log("No data returned"); process.exit(0); }

const noUrl = data.filter((b) => !b.website_url);
const socialOnly = data.filter(
  (b) =>
    b.website_url &&
    (b.website_url.includes("facebook.com") ||
      b.website_url.includes("instagram.com"))
);
const hasUrl = data.filter(
  (b) =>
    b.website_url &&
    !b.website_url.includes("facebook.com") &&
    !b.website_url.includes("instagram.com")
);

// Check which ones are location-specific (have "@" or match a parent)
const locationSpecific = data.filter((b) => b.name.includes("@"));
const standalone = data.filter((b) => !b.name.includes("@"));

console.log(`Total empty: ${data.length}`);
console.log(`Location-specific (has @): ${locationSpecific.length}`);
console.log(`Standalone brands: ${standalone.length}\n`);

console.log(`=== NO WEBSITE URL (${noUrl.length}) ===`);
noUrl.forEach((b) => console.log(`  ${b.slug} | ${b.name}`));

console.log(`\n=== SOCIAL MEDIA ONLY (${socialOnly.length}) ===`);
socialOnly.forEach((b) => console.log(`  ${b.slug} | ${b.name} | ${b.website_url}`));

console.log(`\n=== HAS WEBSITE BUT NO MENU (${hasUrl.length}) ===`);
hasUrl.forEach((b) => console.log(`  ${b.slug} | ${b.name} | ${b.website_url}`));

// Check which location-specific ones have a parent with menus
console.log(`\n=== LOCATION-SPECIFIC BRANDS ===`);
for (const b of locationSpecific) {
  const parentName = b.name.split("@")[0].trim();
  const { data: parent } = await sb
    .from("brand_menus")
    .select("id, slug, menu_item_count")
    .ilike("name", parentName)
    .maybeSingle();
  const hasParent = parent && parent.menu_item_count > 0;
  console.log(
    `  ${b.slug} | parent: ${parent ? parent.slug + " (" + parent.menu_item_count + " items)" : "NONE"} | ${hasParent ? "COVERED by fallback" : "NO parent menu"}`
  );
}

// Check for near-name matches (brands that might be duplicates or variants)
console.log(`\n=== POTENTIAL PARENT MATCHES (non-@ brands) ===`);
for (const b of standalone.slice(0, 30)) {
  // Check if there's a similar brand WITH menu items
  const words = b.name.split(/[\s-]+/).filter((w) => w.length > 3);
  if (words.length > 0) {
    const { data: similar } = await sb
      .from("brand_menus")
      .select("slug, name, menu_item_count")
      .gt("menu_item_count", 0)
      .ilike("name", `%${words[0]}%`)
      .limit(3);
    if (similar && similar.length > 0) {
      console.log(`  ${b.name} -> possible match: ${similar.map((s) => s.name + " (" + s.menu_item_count + ")").join(", ")}`);
    }
  }
}
