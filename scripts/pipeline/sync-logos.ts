/**
 * sync-logos.ts
 *
 * Populates brand_menus.logo_url using Google's favicon service.
 * Parses the domain from website_url and constructs a stable Google-hosted
 * favicon URL at 128px. Skips brands that return the generic default icon
 * (detected via HEAD request — default globe icon is ~400 bytes).
 *
 * Usage:
 *   npx tsx scripts/pipeline/sync-logos.ts
 *   npx tsx scripts/pipeline/sync-logos.ts --dry-run
 *   npx tsx scripts/pipeline/sync-logos.ts --limit=20
 *   npx tsx scripts/pipeline/sync-logos.ts --dry-run --limit=5
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(__dirname, "../../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/* ─── CLI flags ─────────────────────────────────────────── */

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const limitFlag = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitFlag ? parseInt(limitFlag.split("=")[1], 10) : 0;

/* ─── Constants ─────────────────────────────────────────── */

const CONCURRENCY = 10;
const FAVICON_BASE = "https://www.google.com/s2/favicons";
// Google's generic globe icon is typically ~400 bytes or less.
// Anything at or below this threshold is almost certainly the default.
const MIN_FAVICON_BYTES = 500;

/* ─── Helpers ───────────────────────────────────────────── */

function parseDomain(websiteUrl: string): string | null {
  try {
    const url = new URL(
      websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`,
    );
    return url.hostname;
  } catch {
    return null;
  }
}

function buildFaviconUrl(domain: string): string {
  return `${FAVICON_BASE}?domain=${domain}&sz=128`;
}

/**
 * HEAD-check the favicon URL. Returns true if it looks like a real logo
 * (content-length above our minimum threshold), false if it is the
 * generic default globe icon or unreachable.
 */
async function isRealFavicon(faviconUrl: string): Promise<boolean> {
  try {
    const res = await fetch(faviconUrl, { method: "HEAD" });
    if (!res.ok) return false;

    const contentLength = res.headers.get("content-length");
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size <= MIN_FAVICON_BYTES) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Process a single brand: build the favicon URL, validate it, and
 * optionally update the database.
 */
async function processBrand(brand: {
  id: string;
  name: string;
  website_url: string;
}): Promise<"updated" | "skipped_default" | "skipped_no_domain" | "error"> {
  const domain = parseDomain(brand.website_url);
  if (!domain) {
    console.log(
      `  SKIP  ${brand.name} — could not parse domain from "${brand.website_url}"`,
    );
    return "skipped_no_domain";
  }

  const faviconUrl = buildFaviconUrl(domain);

  const real = await isRealFavicon(faviconUrl);
  if (!real) {
    console.log(`  SKIP  ${brand.name} — default/generic favicon (${domain})`);
    return "skipped_default";
  }

  if (DRY_RUN) {
    console.log(`  [DRY] ${brand.name} → ${faviconUrl}`);
    return "updated";
  }

  const { error } = await supabase
    .from("brand_menus")
    .update({ logo_url: faviconUrl })
    .eq("id", brand.id);

  if (error) {
    console.error(`  ERR   ${brand.name} — ${error.message}`);
    return "error";
  }

  console.log(`  OK    ${brand.name} → ${faviconUrl}`);
  return "updated";
}

/**
 * Run an array of async functions with bounded concurrency.
 */
async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<T[]> {
  const results: T[] = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

/* ─── Main ──────────────────────────────────────────────── */

async function main() {
  console.log(
    "sync-logos: Populating brand_menus.logo_url from Google Favicons",
  );
  if (DRY_RUN) console.log("  (dry-run mode — no database writes)");
  if (LIMIT) console.log(`  (limited to ${LIMIT} brands)`);
  console.log();

  // Fetch brands missing logo_url but having a website_url
  let query = supabase
    .from("brand_menus")
    .select("id, name, website_url")
    .is("logo_url", null)
    .not("website_url", "is", null)
    .order("name");

  if (LIMIT) {
    query = query.limit(LIMIT);
  }

  const { data: brands, error } = await query;

  if (error) {
    console.error("Failed to fetch brands:", error.message);
    process.exit(1);
  }

  if (!brands || brands.length === 0) {
    console.log("No brands found with missing logo_url and a website_url.");
    return;
  }

  console.log(`Found ${brands.length} brand(s) to process.\n`);

  // Process with bounded concurrency
  const tasks = brands.map((brand) => () => processBrand(brand));
  const results = await runWithConcurrency(tasks, CONCURRENCY);

  // Summary
  const updated = results.filter((r) => r === "updated").length;
  const skippedDefault = results.filter((r) => r === "skipped_default").length;
  const skippedNoDomain = results.filter(
    (r) => r === "skipped_no_domain",
  ).length;
  const errors = results.filter((r) => r === "error").length;

  console.log("\n── Summary ──────────────────────────────────");
  console.log(`  ${DRY_RUN ? "Would update" : "Updated"}:  ${updated}`);
  console.log(`  Skipped (default icon):    ${skippedDefault}`);
  console.log(`  Skipped (bad domain):      ${skippedNoDomain}`);
  console.log(`  Errors:                    ${errors}`);
  console.log(`  Total processed:           ${brands.length}`);
  console.log("─────────────────────────────────────────────");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
