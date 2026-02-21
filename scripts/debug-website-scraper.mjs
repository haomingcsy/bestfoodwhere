/**
 * debug-website-scraper.mjs
 *
 * Diagnose why the website scraper got 0 menu items.
 * - Categorizes brand_menus by website_url type
 * - Tests a sample of "real" URLs to check reachability
 * - Checks scrape_status distribution
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually (dotenv may not be available as ESM)
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=["']?(.+?)["']?$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ──────────────────────────────────────────────────────────────────────────────
// Part 1: Categorize all brand_menus
// ──────────────────────────────────────────────────────────────────────────────

console.log("=== Part 1: Categorize ALL brand_menus by website_url ===\n");

const { data: allBrands, error: err1 } = await supabase
  .from("brand_menus")
  .select("id, slug, name, website_url, scrape_status, menu_item_count")
  .order("slug");

if (err1) {
  console.error("Error fetching brand_menus:", err1.message);
  process.exit(1);
}

console.log(`Total brands in brand_menus: ${allBrands.length}\n`);

// Categorize
const nullUrl = [];
const socialMedia = [];
const realUrls = [];

const SOCIAL_PATTERNS = [
  "facebook.com",
  "instagram.com",
  "google.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "youtube.com",
  "tiktok.com",
];

for (const brand of allBrands) {
  if (!brand.website_url) {
    nullUrl.push(brand);
  } else {
    const url = brand.website_url.toLowerCase();
    const isSocial = SOCIAL_PATTERNS.some((p) => url.includes(p));
    if (isSocial) {
      socialMedia.push(brand);
    } else {
      realUrls.push(brand);
    }
  }
}

console.log(`NULL website_url:      ${nullUrl.length}`);
console.log(`Social media URLs:     ${socialMedia.length}`);
console.log(`Real website URLs:     ${realUrls.length}`);
console.log("");

// ──────────────────────────────────────────────────────────────────────────────
// Part 1b: scrape_status distribution
// ──────────────────────────────────────────────────────────────────────────────

console.log("=== scrape_status distribution (all brands) ===\n");

const statusCounts = {};
for (const b of allBrands) {
  const s = b.scrape_status || "(null)";
  statusCounts[s] = (statusCounts[s] || 0) + 1;
}
for (const [status, count] of Object.entries(statusCounts).sort()) {
  console.log(`  ${status}: ${count}`);
}
console.log("");

// ──────────────────────────────────────────────────────────────────────────────
// Part 1c: scrape_status for brands with real URLs and 0 items
// ──────────────────────────────────────────────────────────────────────────────

console.log("=== scrape_status for brands with REAL URLs and menu_item_count=0 ===\n");

const realZeroItems = realUrls.filter((b) => (b.menu_item_count || 0) === 0);
const realZeroStatusCounts = {};
for (const b of realZeroItems) {
  const s = b.scrape_status || "(null)";
  realZeroStatusCounts[s] = (realZeroStatusCounts[s] || 0) + 1;
}
for (const [status, count] of Object.entries(realZeroStatusCounts).sort()) {
  console.log(`  ${status}: ${count}`);
}
console.log(`  Total: ${realZeroItems.length}`);
console.log("");

// ──────────────────────────────────────────────────────────────────────────────
// Part 1d: What the scraper query would select (pending/failed + 0 items + url not null)
// ──────────────────────────────────────────────────────────────────────────────

console.log("=== What the scraper query selects ===");
console.log("  Filter: website_url IS NOT NULL, scrape_status IN (pending, failed), menu_item_count = 0\n");

const scraperQuery = allBrands.filter(
  (b) =>
    b.website_url &&
    (b.scrape_status === "pending" || b.scrape_status === "failed") &&
    (b.menu_item_count || 0) === 0,
);
console.log(`  Would select: ${scraperQuery.length} brands`);

const scraperBlocked = scraperQuery.filter((b) =>
  SOCIAL_PATTERNS.some((p) => b.website_url.toLowerCase().includes(p)),
);
const scraperReal = scraperQuery.filter(
  (b) => !SOCIAL_PATTERNS.some((p) => b.website_url.toLowerCase().includes(p)),
);
console.log(`  Of which blocked (social): ${scraperBlocked.length}`);
console.log(`  Of which real URLs: ${scraperReal.length}`);
console.log("");

// ──────────────────────────────────────────────────────────────────────────────
// Part 2: Print real website URLs (with status)
// ──────────────────────────────────────────────────────────────────────────────

console.log("=== Real website URLs (all brands) ===\n");
for (const b of realUrls) {
  const items = b.menu_item_count || 0;
  console.log(`  [${b.scrape_status || "null"}] ${b.slug}: ${b.website_url} (${items} items)`);
}
console.log("");

// ──────────────────────────────────────────────────────────────────────────────
// Part 2b: Print social media URLs
// ──────────────────────────────────────────────────────────────────────────────

console.log("=== Social media URLs ===\n");
for (const b of socialMedia) {
  console.log(`  ${b.slug}: ${b.website_url}`);
}
console.log("");

// ──────────────────────────────────────────────────────────────────────────────
// Part 3: Test reachability of failed URLs
// ──────────────────────────────────────────────────────────────────────────────

console.log("=== Part 3: Testing reachability of FAILED real URLs ===\n");

const failedReal = realUrls.filter(
  (b) => b.scrape_status === "failed" && (b.menu_item_count || 0) === 0,
);

console.log(`Failed brands with real URLs: ${failedReal.length}`);
console.log("");

// Test up to 10
const testSample = failedReal.slice(0, 10);
if (testSample.length === 0) {
  console.log("No failed brands with real URLs to test.");
  // Also test completed ones with 0 items
  const completedZero = realUrls.filter(
    (b) => b.scrape_status === "completed" && (b.menu_item_count || 0) === 0,
  );
  if (completedZero.length > 0) {
    console.log(`\nTesting completed-but-0-items brands instead (${completedZero.length} total, testing 10):\n`);
    testSample.push(...completedZero.slice(0, 10));
  }
}

for (const brand of testSample) {
  const url = brand.website_url;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,*/*",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timer);

    const contentType = res.headers.get("content-type") || "";
    const body = await res.text();
    const bodyLen = body.length;

    // Check if it's a JS-rendered SPA (minimal HTML)
    const hasMenuKeyword =
      body.toLowerCase().includes("menu") ||
      body.toLowerCase().includes("price") ||
      body.toLowerCase().includes("order");

    console.log(
      `  [${brand.slug}] ${url}` +
        `\n    Status: ${res.status} | Content-Type: ${contentType.split(";")[0]}` +
        `\n    Body size: ${bodyLen} chars | Has menu keywords: ${hasMenuKeyword}` +
        `\n    Redirected to: ${res.url !== url ? res.url : "(no redirect)"}`,
    );

    // Check if it's a JS SPA with minimal server HTML
    if (bodyLen < 2000 && body.includes("__NEXT_DATA__")) {
      console.log("    NOTE: Appears to be a Next.js SPA (server HTML is minimal)");
    }
    if (bodyLen < 2000 && (body.includes("id=\"app\"") || body.includes("id=\"root\""))) {
      console.log("    NOTE: Appears to be a JS SPA (React/Vue mount point, minimal HTML)");
    }
  } catch (err) {
    console.log(
      `  [${brand.slug}] ${url}` +
        `\n    ERROR: ${err.message}`,
    );
  }
  console.log("");
}

// ──────────────────────────────────────────────────────────────────────────────
// Part 4: Check scrape_logs for error patterns
// ──────────────────────────────────────────────────────────────────────────────

console.log("=== Part 4: Scrape log error patterns ===\n");

const { data: logs, error: logErr } = await supabase
  .from("scrape_logs")
  .select("status, error_message")
  .order("created_at", { ascending: false })
  .limit(500);

if (logErr) {
  console.log("Could not read scrape_logs:", logErr.message);
} else if (logs && logs.length > 0) {
  const logStatusCounts = {};
  const errorPatterns = {};

  for (const log of logs) {
    logStatusCounts[log.status] = (logStatusCounts[log.status] || 0) + 1;

    if (log.error_message) {
      // Normalize error messages for grouping
      let pattern = log.error_message;
      // Group HTTP errors by status code
      const httpMatch = pattern.match(/HTTP (\d+)/);
      if (httpMatch) {
        pattern = `Homepage fetch failed (HTTP ${httpMatch[1]})`;
      }
      // Group abort/timeout
      if (pattern.includes("abort") || pattern.includes("timeout")) {
        pattern = "Timeout/abort";
      }
      errorPatterns[pattern] = (errorPatterns[pattern] || 0) + 1;
    }
  }

  console.log("Log status distribution:");
  for (const [status, count] of Object.entries(logStatusCounts).sort()) {
    console.log(`  ${status}: ${count}`);
  }
  console.log("");

  console.log("Error patterns:");
  const sorted = Object.entries(errorPatterns).sort((a, b) => b[1] - a[1]);
  for (const [pattern, count] of sorted) {
    console.log(`  ${count}x: ${pattern}`);
  }
} else {
  console.log("No scrape_logs found (table may not exist or is empty).");
}

console.log("\n=== Done ===");
