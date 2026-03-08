/**
 * Submit all site URLs to IndexNow (Bing, Yandex, Seznam, Naver)
 *
 * Run after deployment or content updates:
 *   node scripts/submit-indexnow.mjs
 *   node scripts/submit-indexnow.mjs --dry-run   # Preview without submitting
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// === Config ===
const HOST = "bestfoodwhere.sg";
const INDEXNOW_KEY = "bfw2026indexnow8sg7x";
const INDEXNOW_API = "https://www.bing.com/indexnow";
const BATCH_SIZE = 500; // Keep batches small for reliability
const DRY_RUN = process.argv.includes("--dry-run");

// === Load env ===
const envFile = readFileSync(
  new URL("../.env.local", import.meta.url),
  "utf8"
);
const getEnv = (key) => {
  const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`));
  return m?.[1]?.replace(/^"|"$/g, "");
};

const supabase = createClient(
  getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  getEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } }
);

// === Collect all URLs ===
async function collectUrls() {
  const urls = new Set();
  const base = `https://${HOST}`;

  // Static pages
  [
    "/",
    "/about",
    "/contact",
    "/blog",
    "/advertise",
    "/partnership",
    "/listing",
    "/dining",
    "/recipes",
    "/deals",
  ].forEach((p) => urls.add(`${base}${p}`));

  // Brand menu pages (from brand_menus table)
  console.log("Fetching brands...");
  const { data: brands } = await supabase
    .from("brand_menus")
    .select("slug")
    .eq("is_active", true);

  for (const b of brands || []) {
    urls.add(`${base}/menu/${b.slug}`);
  }
  console.log(`  ${brands?.length || 0} brand pages`);

  // Location pages (from brand_locations joined to brand_menus for brand slug)
  console.log("Fetching locations...");
  const { data: locations } = await supabase
    .from("brand_locations")
    .select("slug, brand_menu:brand_menus(slug)");

  for (const loc of locations || []) {
    const brandSlug = loc.brand_menu?.slug;
    if (brandSlug && loc.slug) {
      urls.add(`${base}/menu/${brandSlug}/${loc.slug}`);
    }
  }
  console.log(`  ${locations?.length || 0} location pages`);

  // Mall pages
  console.log("Fetching malls...");
  const { data: malls } = await supabase
    .from("shopping_malls")
    .select("slug");

  for (const m of malls || []) {
    urls.add(`${base}/shopping-malls/${m.slug}`);
  }
  console.log(`  ${malls?.length || 0} mall pages`);

  // Cuisine pages (hardcoded valid slugs)
  const cuisineSlugs = [
    "japanese",
    "chinese",
    "korean",
    "thai",
    "indian",
    "italian",
    "western",
    "malay",
    "indonesian",
    "vietnamese",
    "mexican",
    "mediterranean",
    "american",
    "asian",
    "european",
    "taiwanese",
    "dim-sum",
    "bubble-tea",
    "desserts",
  ];
  for (const c of cuisineSlugs) {
    urls.add(`${base}/cuisine/${c}`);
  }

  // Dining pages
  const diningSlugs = [
    "fine-dining",
    "casual-dining",
    "late-night",
    "quick-bites",
    "family-friendly",
    "romantic",
  ];
  for (const d of diningSlugs) {
    urls.add(`${base}/dining/${d}`);
  }

  // Recipe pages (category is part of URL path, derived from wp_slug)
  console.log("Fetching recipes...");
  const { data: recipes } = await supabase
    .from("recipe_content")
    .select("wp_slug, cuisine");

  for (const r of recipes || []) {
    if (r.wp_slug && r.cuisine) {
      const category = r.cuisine.toLowerCase().replace(/\s+/g, "-");
      urls.add(`${base}/recipes/${category}/${r.wp_slug}`);
    }
  }
  console.log(`  ${recipes?.length || 0} recipe pages`);

  return [...urls];
}

// === Submit to IndexNow ===
async function submitBatch(urlList) {
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlList,
  };

  const res = await fetch(INDEXNOW_API, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  return { ok: res.ok, status: res.status };
}

// === Main ===
async function main() {
  console.log("=== IndexNow URL Submission ===\n");

  const urls = await collectUrls();
  console.log(`\nTotal URLs: ${urls.length}\n`);

  if (DRY_RUN) {
    console.log("DRY RUN — not submitting. Sample URLs:");
    urls.slice(0, 20).forEach((u) => console.log(`  ${u}`));
    console.log(`  ... and ${urls.length - 20} more`);
    return;
  }

  // Submit in batches
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(urls.length / BATCH_SIZE);

    console.log(
      `Submitting batch ${batchNum}/${totalBatches} (${batch.length} URLs)...`
    );
    const { ok, status } = await submitBatch(batch);
    console.log(`  ${ok ? "✓" : "✗"} Status: ${status}`);

    // Brief pause between batches
    if (i + BATCH_SIZE < urls.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`\nDone! ${urls.length} URLs submitted to IndexNow.`);
}

main().catch(console.error);
