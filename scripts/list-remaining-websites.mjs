/**
 * List brands that have a real website URL but still have 0 menu items.
 * Filters out social media URLs.
 *
 * Usage:
 *   node scripts/list-remaining-websites.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// === Supabase ===
const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`)); return m?.[1]; };
const supabase = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

// Social media domains to exclude
const SOCIAL_DOMAINS = [
  "facebook.com",
  "instagram.com",
  "google.com",
  "youtube.com",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
];

function isSocialUrl(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return SOCIAL_DOMAINS.some(d => hostname === d || hostname.endsWith("." + d));
  } catch {
    return false;
  }
}

async function main() {
  console.log("=== Brands with website URLs but 0 menu items ===\n");

  const { data: brands, error } = await supabase
    .from("brand_menus")
    .select("id, slug, name, website_url, scrape_status")
    .eq("is_active", true)
    .eq("menu_item_count", 0)
    .not("website_url", "is", null)
    .order("name");

  if (error) {
    console.error("DB error:", error);
    process.exit(1);
  }

  // Filter out social media URLs
  const filtered = (brands || []).filter(b => b.website_url && !isSocialUrl(b.website_url));

  console.log(`${"#".padEnd(4)} ${"Brand Name".padEnd(40)} ${"Slug".padEnd(35)} Website URL`);
  console.log("-".repeat(140));

  for (let i = 0; i < filtered.length; i++) {
    const b = filtered[i];
    console.log(
      `${String(i + 1).padEnd(4)} ${b.name.padEnd(40)} ${b.slug.padEnd(35)} ${b.website_url}`
    );
  }

  console.log("-".repeat(140));
  console.log(`\nTotal: ${filtered.length} brands with real website URLs and 0 menu items`);
  console.log(`(Excluded ${(brands || []).length - filtered.length} social media URLs)`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
