/**
 * 03-scrape-delivery-apps.ts
 *
 * Searches delivery app platforms (GrabFood, FoodPanda, Deliveroo) for brand
 * listings and stores delivery URLs + any menu data found.
 *
 * Usage:
 *   npx tsx scripts/pipeline/03-scrape-delivery-apps.ts [--dry-run] [--slug=brand-slug]
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";

config({ path: resolve(__dirname, "../../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const SLUG_FLAG = args.find((a) => a.startsWith("--slug="));
const SINGLE_SLUG = SLUG_FLAG ? SLUG_FLAG.split("=")[1] : null;
const CONC_FLAG = args.find((a) => a.startsWith("--concurrency="));
const CONCURRENCY = CONC_FLAG ? parseInt(CONC_FLAG.split("=")[1], 10) || 2 : 2;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function fuzzyMatch(brandName: string, foundName: string): boolean {
  const a = normalize(brandName);
  const b = normalize(foundName);
  return a.includes(b) || b.includes(a);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithBackoff(
  url: string,
  maxRetries = 3,
): Promise<{ html: string; ok: boolean }> {
  let delay = 1000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-SG,en;q=0.9",
        },
      });
      if (res.status === 429) {
        console.warn(`  429 rate-limited on ${url}, retrying in ${delay}ms...`);
        await sleep(delay);
        delay *= 2;
        continue;
      }
      const html = await res.text();
      return { html, ok: res.ok };
    } catch (err: any) {
      if (attempt < maxRetries) {
        console.warn(
          `  Fetch error (attempt ${attempt + 1}): ${err.message}, retrying...`,
        );
        await sleep(delay);
        delay *= 2;
      } else {
        return { html: "", ok: false };
      }
    }
  }
  return { html: "", ok: false };
}

// ---------------------------------------------------------------------------
// Platform scrapers
// ---------------------------------------------------------------------------

interface PlatformResult {
  platform: string;
  url: string | null;
}

async function searchGrabFood(brandName: string): Promise<PlatformResult> {
  const searchUrl = `https://food.grab.com/sg/en/search?q=${encodeURIComponent(brandName)}`;
  const { html, ok } = await fetchWithBackoff(searchUrl);
  if (!ok || !html) return { platform: "grabfood", url: null };

  const $ = cheerio.load(html);
  // GrabFood search results typically have restaurant links
  const links = $('a[href*="/restaurant/"]');
  for (let i = 0; i < links.length; i++) {
    const el = $(links[i]);
    const name = el.text().trim() || el.attr("aria-label") || "";
    const href = el.attr("href") || "";
    if (fuzzyMatch(brandName, name) && href) {
      const fullUrl = href.startsWith("http")
        ? href
        : `https://food.grab.com${href}`;
      return { platform: "grabfood", url: fullUrl };
    }
  }
  // Fallback: check any card-like elements with restaurant names
  $(
    "[class*='restaurant'], [class*='Restaurant'], [data-testid*='restaurant']",
  ).each((_, el) => {
    const name = $(el).find("h3, h4, p, span").first().text().trim();
    const link = $(el).find("a").attr("href");
    if (name && link && fuzzyMatch(brandName, name)) {
      const fullUrl = link.startsWith("http")
        ? link
        : `https://food.grab.com${link}`;
      return { platform: "grabfood", url: fullUrl };
    }
  });
  return { platform: "grabfood", url: null };
}

async function searchFoodPanda(brandName: string): Promise<PlatformResult> {
  const searchUrl = `https://www.foodpanda.sg/search?q=${encodeURIComponent(brandName)}`;
  const { html, ok } = await fetchWithBackoff(searchUrl);
  if (!ok || !html) return { platform: "foodpanda", url: null };

  const $ = cheerio.load(html);
  const links = $('a[href*="/restaurant/"], a[href*="/shop/"]');
  for (let i = 0; i < links.length; i++) {
    const el = $(links[i]);
    const name = el.text().trim() || el.attr("aria-label") || "";
    const href = el.attr("href") || "";
    if (fuzzyMatch(brandName, name) && href) {
      const fullUrl = href.startsWith("http")
        ? href
        : `https://www.foodpanda.sg${href}`;
      return { platform: "foodpanda", url: fullUrl };
    }
  }
  $("[class*='vendor'], [class*='Vendor'], [data-testid*='vendor']").each(
    (_, el) => {
      const name = $(el).find("h3, h4, p, span").first().text().trim();
      const link = $(el).find("a").attr("href");
      if (name && link && fuzzyMatch(brandName, name)) {
        const fullUrl = link.startsWith("http")
          ? link
          : `https://www.foodpanda.sg${link}`;
        return { platform: "foodpanda", url: fullUrl };
      }
    },
  );
  return { platform: "foodpanda", url: null };
}

async function searchDeliveroo(brandName: string): Promise<PlatformResult> {
  const searchUrl = `https://deliveroo.com.sg/search?q=${encodeURIComponent(brandName)}`;
  const { html, ok } = await fetchWithBackoff(searchUrl);
  if (!ok || !html) return { platform: "deliveroo", url: null };

  const $ = cheerio.load(html);
  const links = $('a[href*="/menu/"], a[href*="/restaurant/"]');
  for (let i = 0; i < links.length; i++) {
    const el = $(links[i]);
    const name = el.text().trim() || el.attr("aria-label") || "";
    const href = el.attr("href") || "";
    if (fuzzyMatch(brandName, name) && href) {
      const fullUrl = href.startsWith("http")
        ? href
        : `https://deliveroo.com.sg${href}`;
      return { platform: "deliveroo", url: fullUrl };
    }
  }
  $(
    "[class*='restaurant'], [class*='Restaurant'], [data-testid*='restaurant']",
  ).each((_, el) => {
    const name = $(el).find("h3, h4, p, span").first().text().trim();
    const link = $(el).find("a").attr("href");
    if (name && link && fuzzyMatch(brandName, name)) {
      const fullUrl = link.startsWith("http")
        ? link
        : `https://deliveroo.com.sg${link}`;
      return { platform: "deliveroo", url: fullUrl };
    }
  });
  return { platform: "deliveroo", url: null };
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

interface Brand {
  slug: string;
  brand_name: string;
  social_links: Record<string, string> | null;
}

async function processBrand(brand: Brand): Promise<{
  slug: string;
  found: Record<string, string>;
  errors: string[];
}> {
  const found: Record<string, string> = {};
  const errors: string[] = [];
  const searchers = [searchGrabFood, searchFoodPanda, searchDeliveroo];

  for (const searcher of searchers) {
    try {
      const result = await searcher(brand.brand_name);
      if (result.url) {
        found[result.platform] = result.url;
        console.log(`  [${brand.slug}] ${result.platform}: ${result.url}`);
      } else {
        console.log(`  [${brand.slug}] ${result.platform}: not found`);
      }
    } catch (err: any) {
      const msg = `${brand.slug}: ${err.message}`;
      errors.push(msg);
      console.error(`  [${brand.slug}] error: ${err.message}`);
    }
    // Rate-limit: 1s between requests
    await sleep(1000);
  }

  // Merge into social_links (don't overwrite existing keys)
  if (Object.keys(found).length > 0 && !DRY_RUN) {
    const existing = brand.social_links || {};
    const merged = { ...found, ...existing }; // existing keys take priority

    const { error } = await supabase
      .from("brand_menus")
      .update({ social_links: merged })
      .eq("slug", brand.slug);

    if (error) {
      errors.push(`DB update failed for ${brand.slug}: ${error.message}`);
      console.error(`  [${brand.slug}] DB update error: ${error.message}`);
    }
  }

  // Log to scrape_logs
  if (!DRY_RUN) {
    await supabase.from("scrape_logs").insert({
      brand_slug: brand.slug,
      source: "delivery_search",
      status: errors.length > 0 ? "partial" : "success",
      urls_found: found,
      errors: errors.length > 0 ? errors : null,
      scraped_at: new Date().toISOString(),
    });
  }

  return { slug: brand.slug, found, errors };
}

async function main() {
  console.log("=== Delivery App URL Scraper ===");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  if (SINGLE_SLUG) console.log(`Single brand: ${SINGLE_SLUG}`);
  console.log();

  // Fetch brands from brand_menus
  let query = supabase
    .from("brand_menus")
    .select("slug, brand_name, social_links")
    .in("scrape_status", ["scraped", "failed"]);

  if (SINGLE_SLUG) {
    query = query.eq("slug", SINGLE_SLUG);
  }

  const { data: brands, error } = await query;
  if (error) {
    console.error("Failed to fetch brands:", error.message);
    process.exit(1);
  }
  if (!brands || brands.length === 0) {
    console.log("No brands to process.");
    return;
  }

  console.log(`Found ${brands.length} brand(s) to process.\n`);

  // Process in batches of CONCURRENCY
  const summary = {
    total: 0,
    grabfood: 0,
    foodpanda: 0,
    deliveroo: 0,
    errors: 0,
  };

  for (let i = 0; i < brands.length; i += CONCURRENCY) {
    const batch = brands.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((b) => processBrand(b as Brand)),
    );

    for (const r of results) {
      summary.total++;
      if (r.found.grabfood) summary.grabfood++;
      if (r.found.foodpanda) summary.foodpanda++;
      if (r.found.deliveroo) summary.deliveroo++;
      if (r.errors.length > 0) summary.errors++;
    }

    // Brief pause between batches
    if (i + CONCURRENCY < brands.length) {
      await sleep(500);
    }
  }

  // Print summary
  console.log("\n=== Summary ===");
  console.log(`Total brands processed: ${summary.total}`);
  console.log(`GrabFood URLs found:    ${summary.grabfood}`);
  console.log(`FoodPanda URLs found:   ${summary.foodpanda}`);
  console.log(`Deliveroo URLs found:   ${summary.deliveroo}`);
  console.log(`Brands with errors:     ${summary.errors}`);
  if (DRY_RUN) console.log("\n(Dry run — no DB writes were made)");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
