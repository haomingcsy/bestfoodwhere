/**
 * GrabFood Menu Image Scraper
 *
 * Uses Playwright to scrape menu item images from GrabFood for a given
 * restaurant slug.  Scraped images are fuzzy-matched against existing
 * `menu_items` rows, downloaded, uploaded to Supabase Storage
 * (`menu-images` bucket), and the DB rows are updated with both the
 * original GrabFood URL and the new CDN URL.
 *
 * Usage:
 *   npx tsx scripts/scrape-grabfood-images.ts --slug=sushi-tei
 *   npx tsx scripts/scrape-grabfood-images.ts --slug=sushi-tei --dry-run
 */

import { config } from "dotenv";
import { resolve } from "path";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

config({ path: resolve(__dirname, "../.env.local") });

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

function getArg(name: string): string | null {
  const flag = args.find((a) => a.startsWith(`--${name}=`));
  return flag ? flag.split("=").slice(1).join("=") : null;
}

function hasFlag(name: string): boolean {
  return args.includes(`--${name}`);
}

const SLUG = getArg("slug");
const DRY_RUN = hasFlag("dry-run");

if (!SLUG) {
  console.error("Usage: npx tsx scripts/scrape-grabfood-images.ts --slug=<brand-slug> [--dry-run]");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_LOAD_TIMEOUT = 30_000;
const IMAGE_DOWNLOAD_TIMEOUT = 15_000;
const MIN_IMAGE_BYTES = 1_000; // skip images smaller than 1 KB
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2_000;

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScrapedItem {
  name: string;
  description: string;
  price: string | null;
  imageUrl: string | null;
  category: string;
}

interface DbMenuItem {
  id: string;
  brand_menu_id: string;
  category_id: string;
  name: string;
  original_image_url: string | null;
  cdn_image_url: string | null;
}

interface DbCategory {
  id: string;
  name: string;
}

interface MatchResult {
  scrapedItem: ScrapedItem;
  dbItem: DbMenuItem;
  score: number;
  matchType: string;
}

// ---------------------------------------------------------------------------
// Known mall / location names to strip from brand names when searching
// ---------------------------------------------------------------------------

const KNOWN_LOCATIONS = [
  "amk hub", "ang mo kio hub", "bedok mall", "causeway point", "city square",
  "city square mall", "jem", "jewel", "jewel changi", "jewel changi airport",
  "junction 8", "nex", "northpoint", "northpoint city", "plaza singapura",
  "suntec", "suntec city", "tampines mall", "united square", "vivocity",
  "vivo city", "the woodleigh mall", "woodleigh mall", "waterway point",
  "westgate", "lot one", "imm", "clementi mall", "great world",
  "ion orchard", "paragon", "bugis junction", "bugis+", "raffles city",
  "marina bay sands", "changi airport", "one holland village", "holland village",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Strip location suffixes from a brand display name. */
function extractCoreBrand(brandName: string): string {
  let name = brandName;
  name = name.replace(/\s*[@|]\s*.+$/, "");
  name = name.replace(/\s+-\s+.+$/, "");
  const lower = name.toLowerCase().trim();
  for (const loc of KNOWN_LOCATIONS) {
    if (lower.endsWith(loc) && lower.length > loc.length + 1) {
      name = name.slice(0, name.length - loc.length).trim();
      name = name.replace(/\s+(at|in|@)\s*$/i, "").trim();
      break;
    }
  }
  return name.trim();
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "-")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---------------------------------------------------------------------------
// Fuzzy matching
// ---------------------------------------------------------------------------

/** Normalize a string for comparison: lowercase, strip special chars. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Simple Levenshtein distance. */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}

/**
 * Score how well two menu item names match.
 * Returns `{ score, matchType }` where score is 0-1.
 */
function fuzzyScore(
  scraped: string,
  db: string,
): { score: number; matchType: string } {
  const a = normalize(scraped);
  const b = normalize(db);

  if (!a || !b) return { score: 0, matchType: "empty" };

  // Exact match after normalization
  if (a === b) return { score: 1.0, matchType: "exact" };

  // One contains the other
  if (a.includes(b) || b.includes(a)) {
    const overlap = Math.min(a.length, b.length) / Math.max(a.length, b.length);
    return { score: 0.8 + overlap * 0.15, matchType: "contains" };
  }

  // Levenshtein distance check
  const dist = levenshtein(a, b);
  if (dist < 3) {
    return { score: 0.85 - dist * 0.1, matchType: `levenshtein-${dist}` };
  }

  // Word-overlap scoring
  const aWords = a.split(" ").filter((w) => w.length > 0);
  const bWords = b.split(" ").filter((w) => w.length > 0);
  if (aWords.length > 0 && bWords.length > 0) {
    let matched = 0;
    for (const w of aWords) {
      if (bWords.some((bw) => bw === w || (w.length >= 4 && bw.includes(w)) || (bw.length >= 4 && w.includes(bw)))) {
        matched++;
      }
    }
    const coverage = matched / Math.max(aWords.length, bWords.length);
    if (coverage >= 0.5) {
      return { score: coverage * 0.7, matchType: "word-overlap" };
    }
  }

  return { score: 0, matchType: "none" };
}

/**
 * Given a list of scraped items and DB items, produce the best 1-to-1
 * matching above a minimum threshold.
 */
function matchItems(
  scraped: ScrapedItem[],
  dbItems: DbMenuItem[],
): { matched: MatchResult[]; unmatched: ScrapedItem[] } {
  const MATCH_THRESHOLD = 0.5;
  const matched: MatchResult[] = [];
  const usedDbIds = new Set<string>();
  const unmatchedScraped: ScrapedItem[] = [];

  // Build a score matrix and greedily match best pairs
  const candidates: { si: number; di: number; score: number; matchType: string }[] = [];

  for (let si = 0; si < scraped.length; si++) {
    for (let di = 0; di < dbItems.length; di++) {
      const { score, matchType } = fuzzyScore(scraped[si].name, dbItems[di].name);
      if (score >= MATCH_THRESHOLD) {
        candidates.push({ si, di, score, matchType });
      }
    }
  }

  // Sort by score descending to pick best matches first
  candidates.sort((a, b) => b.score - a.score);

  const usedScraped = new Set<number>();

  for (const c of candidates) {
    if (usedScraped.has(c.si) || usedDbIds.has(dbItems[c.di].id)) continue;
    usedScraped.add(c.si);
    usedDbIds.add(dbItems[c.di].id);
    matched.push({
      scrapedItem: scraped[c.si],
      dbItem: dbItems[c.di],
      score: c.score,
      matchType: c.matchType,
    });
  }

  for (let si = 0; si < scraped.length; si++) {
    if (!usedScraped.has(si)) {
      unmatchedScraped.push(scraped[si]);
    }
  }

  return { matched, unmatched: unmatchedScraped };
}

// ---------------------------------------------------------------------------
// GrabFood search-result matching (brand -> restaurant link)
// ---------------------------------------------------------------------------

function matchRestaurantScore(brandSlug: string, restaurantSlug: string): number {
  const bWords = brandSlug.split("-").filter((w) => w.length > 0);
  const rWords = restaurantSlug.split("-").filter((w) => w.length > 0);

  if (!brandSlug || !restaurantSlug || bWords.length === 0) return 0;

  // Prefix match
  if (restaurantSlug.startsWith(brandSlug)) return 1.0;

  // All brand words in slug sequentially
  let allFound = true;
  let searchFrom = 0;
  for (const bw of bWords) {
    const idx = restaurantSlug.indexOf(bw, searchFrom);
    if (idx === -1) {
      allFound = false;
      break;
    }
    searchFrom = idx + bw.length;
  }
  if (allFound) {
    const coverage = brandSlug.length / restaurantSlug.length;
    return 0.7 + coverage * 0.3;
  }

  // Word overlap
  if (rWords.length > 0) {
    const unique = [...new Set(bWords)];
    let brandMatched = 0;
    const matchedRWords = new Set<number>();
    for (const bw of unique) {
      const idx = rWords.findIndex(
        (rw) => rw === bw || (rw.length >= 3 && bw.length >= 3 && (rw.startsWith(bw) || bw.startsWith(rw))),
      );
      if (idx >= 0) {
        brandMatched++;
        matchedRWords.add(idx);
      }
    }
    const bCov = brandMatched / unique.length;
    const rCov = matchedRWords.size / rWords.length;
    return bCov * 0.7 + rCov * 0.3;
  }

  return 0;
}

// ---------------------------------------------------------------------------
// Playwright: create a browser context mimicking a real user
// ---------------------------------------------------------------------------

async function createContext(browser: Browser): Promise<{ ctx: BrowserContext; page: Page }> {
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const ctx = await browser.newContext({
    userAgent: ua,
    locale: "en-SG",
    geolocation: { latitude: 1.3521, longitude: 103.8198 },
    permissions: ["geolocation"],
    viewport: { width: 1440, height: 900 },
  });

  // Set location cookie so GrabFood knows we are in Singapore
  await ctx.addCookies([
    {
      name: "location",
      value: encodeURIComponent(
        JSON.stringify({
          latitude: 1.3521,
          longitude: 103.8198,
          address: "Singapore",
          countryCode: "SG",
          isAccurate: true,
        }),
      ),
      domain: "food.grab.com",
      path: "/",
    },
  ]);

  const page = await ctx.newPage();
  return { ctx, page };
}

// ---------------------------------------------------------------------------
// Playwright: search GrabFood and navigate to the restaurant menu page
// ---------------------------------------------------------------------------

async function navigateToMenu(
  page: Page,
  brandName: string,
): Promise<boolean> {
  const coreBrand = extractCoreBrand(brandName);
  const cleanName = coreBrand
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/@/g, "at ")
    .replace(/['']/g, "")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const searchUrl = `https://food.grab.com/sg/en/restaurants?search=${encodeURIComponent(cleanName)}`;
  console.log(`  Searching: ${searchUrl}`);

  try {
    await page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: PAGE_LOAD_TIMEOUT,
    });
  } catch {
    // Page may timeout but still have content
  }

  // Wait for restaurant links to render
  try {
    await page.waitForSelector('a[href*="/restaurant/"]', { timeout: 12_000 });
  } catch {
    // No links appeared
  }
  await page.waitForTimeout(2_000);

  // Gather restaurant links from search results
  const restaurants = await page.evaluate(() => {
    const links = document.querySelectorAll('a[href*="/restaurant/"]');
    const seen = new Set<string>();
    const results: { href: string; text: string; slug: string }[] = [];
    for (const link of links) {
      const href = link.getAttribute("href");
      if (!href || seen.has(href)) continue;
      seen.add(href);
      const text = link.textContent?.trim() || "";
      const slugMatch = href.match(/\/restaurant\/([^/]+?)(?:-delivery)?\/[A-Z0-9-]+/);
      results.push({ href, text: text.slice(0, 300), slug: slugMatch?.[1] || "" });
    }
    return results;
  });

  if (restaurants.length === 0) {
    console.log("  No restaurant results found on GrabFood.");
    return false;
  }

  // Find best-matching restaurant
  const coreSlug = toSlug(coreBrand);
  let bestScore = 0;
  let bestRestaurant: (typeof restaurants)[0] | null = null;

  for (const r of restaurants) {
    const score = matchRestaurantScore(coreSlug, r.slug);
    if (score > bestScore) {
      bestScore = score;
      bestRestaurant = r;
    }
  }

  if (!bestRestaurant || bestScore < 0.4) {
    console.log(
      `  No confident match among ${restaurants.length} results (best score: ${bestScore.toFixed(2)}).`,
    );
    return false;
  }

  console.log(`  Matched restaurant: ${bestRestaurant.slug} (score ${bestScore.toFixed(2)})`);

  const restaurantUrl = bestRestaurant.href.startsWith("http")
    ? bestRestaurant.href
    : `https://food.grab.com${bestRestaurant.href}`;

  try {
    await page.goto(restaurantUrl, {
      waitUntil: "domcontentloaded",
      timeout: PAGE_LOAD_TIMEOUT,
    });
  } catch {
    // timeout is okay, content may still load
  }

  // Wait for menu content to render
  await page.waitForTimeout(4_000);

  return true;
}

// ---------------------------------------------------------------------------
// Playwright: scrape menu items from the rendered page
// ---------------------------------------------------------------------------

async function scrapeMenuItems(page: Page): Promise<ScrapedItem[]> {
  // Approach 1 (BEST): Intercept the GrabFood merchant API via reload.
  // This returns the FULL menu with all items & images in one JSON payload.
  console.log("  Attempting API interception (full menu)...");
  const apiItems = await scrapeViaApiInterception(page);
  if (apiItems.length > 5) {
    return apiItems;
  }
  if (apiItems.length > 0) {
    console.log(`  API interception returned only ${apiItems.length} items, trying other methods...`);
  }

  // Approach 2: Try extracting from __NEXT_DATA__ or embedded JSON
  const fromJson = await page.evaluate(() => {
    const scripts = document.querySelectorAll("script");
    for (const s of scripts) {
      const text = s.textContent || "";
      if (text.includes('"categories"') && text.includes('"items"')) {
        try {
          if (text.includes("__NEXT_DATA__")) {
            const data = JSON.parse(text);
            const merchant =
              data?.props?.pageProps?.merchant ||
              data?.props?.pageProps?.initialState?.merchant;
            if (merchant?.menu?.categories) {
              return merchant.menu.categories;
            }
          }
        } catch {}
      }
    }
    return null;
  });

  if (fromJson) {
    console.log("  Extracted menu data from embedded JSON.");
    return parseJsonCategories(fromJson);
  }

  // Approach 3: Scroll through entire page to load all lazy items, then DOM scrape
  console.log("  Scrolling page to load all menu items...");
  let prevHeight = 0;
  for (let i = 0; i < 30; i++) {
    const newHeight = await page.evaluate(() => {
      window.scrollBy(0, 800);
      return document.body.scrollHeight;
    });
    await page.waitForTimeout(500);
    if (newHeight === prevHeight) break;
    prevHeight = newHeight;
  }
  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  // Also try clicking on category tabs/accordions to expand all sections
  await page.evaluate(() => {
    const tabs = document.querySelectorAll(
      '[class*="category"], [class*="Category"], [role="tab"], [class*="tab"]'
    );
    tabs.forEach(t => {
      if (t instanceof HTMLElement && !t.classList.toString().includes("active")) {
        try { t.click(); } catch {}
      }
    });
  });
  await page.waitForTimeout(2000);

  console.log("  Scraping menu items from DOM...");

  const items = await page.evaluate(() => {
    const results: {
      name: string;
      description: string;
      price: string | null;
      imageUrl: string | null;
      category: string;
    }[] = [];

    // Strategy: find all images that look like food items from GrabFood CDN
    const allImages = document.querySelectorAll("img");
    const foodImages: HTMLImageElement[] = [];
    for (const img of allImages) {
      const src = img.src || img.getAttribute("data-src") || "";
      if (
        src &&
        (src.includes("cloudfront.net") ||
          src.includes("grab.com") ||
          src.includes("food-cms")) &&
        !src.includes("logo") &&
        !src.includes("icon") &&
        (img.naturalWidth >= 50 || img.width >= 50)
      ) {
        foodImages.push(img);
      }
    }

    // For each food image, walk up to find the enclosing card
    for (const img of foodImages) {
      let card: HTMLElement | null = img.parentElement;
      for (let i = 0; i < 6 && card; i++) {
        const text = card.textContent?.trim() || "";
        if (text.length > 5 && text.length < 500) break;
        card = card.parentElement;
      }
      if (!card) continue;

      const nameEl =
        card.querySelector("h3, h4") ||
        card.querySelector('[class*="name"], [class*="Name"], [class*="title"], [class*="Title"]') ||
        card.querySelector("p, span");
      const name = nameEl?.textContent?.trim() || "";
      if (!name || name.length > 200) continue;

      const priceMatch = card.textContent?.match(/\$\s*([\d.]+)/);
      const price = priceMatch ? `$${priceMatch[1]}` : null;

      const descEls = card.querySelectorAll("p, span");
      let description = "";
      for (const el of descEls) {
        const t = el.textContent?.trim() || "";
        if (t !== name && t.length > 10 && !t.startsWith("$")) {
          description = t.slice(0, 300);
          break;
        }
      }

      const imageUrl = img.src || img.getAttribute("data-src") || null;

      results.push({ name, description, price, imageUrl, category: "" });
    }

    // Deduplicate
    const seen = new Set<string>();
    return results.filter((item) => {
      const key = item.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

  // Assign category labels
  for (const item of items) {
    if (!item.category) item.category = "Menu";
  }

  return items;
}

// ---------------------------------------------------------------------------
// Approach 1 helper: parse API/JSON categories
// ---------------------------------------------------------------------------

function parseJsonCategories(categories: any[]): ScrapedItem[] {
  const items: ScrapedItem[] = [];
  for (const cat of categories) {
    const catName: string = cat.name || cat.categoryName || "Menu";
    for (const item of cat.items || []) {
      if (!item.name) continue;
      const priceNum =
        item.priceInMinorUnit != null
          ? item.priceInMinorUnit / 100
          : item.price ?? null;
      items.push({
        name: item.name,
        description: item.description || "",
        price: priceNum != null ? `$${Number(priceNum).toFixed(2)}` : null,
        imageUrl: item.imgHref || item.imageURL || item.image || null,
        category: catName,
      });
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// Approach 3 (fallback): intercept API response while triggering a reload
// ---------------------------------------------------------------------------

async function scrapeViaApiInterception(page: Page): Promise<ScrapedItem[]> {
  console.log("  Attempting API interception via page reload...");

  return new Promise<ScrapedItem[]>((resolveItems) => {
    let resolved = false;

    const handler = async (response: any) => {
      if (resolved) return;
      const url: string = response.url();
      // GrabFood merchant API pattern
      if (
        url.includes("/foodweb/guest/") &&
        url.includes("/merchants/") &&
        !url.includes("/search")
      ) {
        try {
          if (response.status() === 200) {
            const data = await response.json();
            if (data?.merchant?.menu?.categories) {
              resolved = true;
              page.removeListener("response", handler);
              console.log("  Captured menu data from API interception.");
              resolveItems(parseJsonCategories(data.merchant.menu.categories));
            }
          }
        } catch {}
      }
    };

    page.on("response", handler);

    // Reload to trigger the API call
    page
      .reload({ waitUntil: "domcontentloaded", timeout: PAGE_LOAD_TIMEOUT })
      .catch(() => {});

    // Timeout after PAGE_LOAD_TIMEOUT
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        page.removeListener("response", handler);
        resolveItems([]);
      }
    }, PAGE_LOAD_TIMEOUT);
  });
}

// ---------------------------------------------------------------------------
// Image download
// ---------------------------------------------------------------------------

async function downloadImage(
  url: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        IMAGE_DOWNLOAD_TIMEOUT,
      );

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; BFW Image Processor/1.0)",
          Accept: "image/*,*/*;q=0.8",
        },
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.log(
          `    Download failed (HTTP ${res.status}), attempt ${attempt + 1}/${MAX_RETRIES}`,
        );
        if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY_MS);
        continue;
      }

      const arrayBuf = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      const contentType = res.headers.get("content-type") || "image/jpeg";

      if (buffer.byteLength < MIN_IMAGE_BYTES) {
        console.log(
          `    Image too small (${buffer.byteLength} bytes), skipping.`,
        );
        return null;
      }

      return { buffer, contentType };
    } catch (err: any) {
      console.log(
        `    Download error: ${err.message}, attempt ${attempt + 1}/${MAX_RETRIES}`,
      );
      if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY_MS);
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Supabase Storage upload
// ---------------------------------------------------------------------------

async function uploadToStorage(
  brandSlug: string,
  category: string,
  itemName: string,
  buffer: Buffer,
  contentType: string,
): Promise<string | null> {
  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : "jpg";

  const itemSlug = toSlug(itemName) || "item";
  const categorySlug = toSlug(category) || "menu";
  const timestamp = Date.now();
  const filename = `${itemSlug}-${timestamp}.${ext}`;
  const storagePath = `${brandSlug}/${categorySlug}/${filename}`;

  try {
    const { error } = await supabase.storage
      .from("menu-images")
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.log(`    Storage upload error: ${error.message}`);
      return null;
    }

    return `${SUPABASE_URL}/storage/v1/object/public/menu-images/${storagePath}`;
  } catch (err: any) {
    console.log(`    Storage error: ${err.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Database operations
// ---------------------------------------------------------------------------

async function fetchBrand(slug: string) {
  const { data, error } = await supabase
    .from("brand_menus")
    .select("id, slug, name")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error(`Brand not found for slug "${slug}":`, error?.message);
    return null;
  }
  return data as { id: string; slug: string; name: string };
}

async function fetchMenuItems(brandMenuId: string): Promise<DbMenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, brand_menu_id, category_id, name, original_image_url, cdn_image_url")
    .eq("brand_menu_id", brandMenuId);

  if (error) {
    console.error("Failed to fetch menu items:", error.message);
    return [];
  }
  return (data || []) as DbMenuItem[];
}

async function fetchCategories(brandMenuId: string): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from("menu_categories")
    .select("id, name")
    .eq("brand_menu_id", brandMenuId);

  if (error) {
    console.error("Failed to fetch categories:", error.message);
    return new Map();
  }

  const map = new Map<string, string>();
  for (const row of data || []) {
    map.set(row.id, row.name);
  }
  return map;
}

async function updateMenuItem(
  id: string,
  originalImageUrl: string,
  cdnImageUrl: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("menu_items")
    .update({
      original_image_url: originalImageUrl,
      cdn_image_url: cdnImageUrl,
    })
    .eq("id", id);

  if (error) {
    console.log(`    DB update error for item ${id}: ${error.message}`);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== GrabFood Image Scraper ===\n");
  if (DRY_RUN) console.log("*** DRY RUN - no uploads or DB writes ***\n");

  // 1. Look up the brand
  const slug = SLUG as string; // guaranteed non-null by the guard above
  console.log(`Looking up brand: ${slug}`);
  const brand = await fetchBrand(slug);
  if (!brand) {
    process.exit(1);
  }
  console.log(`  Found: ${brand.name} (id: ${brand.id})\n`);

  // 2. Fetch existing menu items from DB
  console.log("Fetching existing menu items from DB...");
  const dbItems = await fetchMenuItems(brand.id);
  const categoryMap = await fetchCategories(brand.id);
  console.log(`  ${dbItems.length} items in DB across ${categoryMap.size} categories.\n`);

  if (dbItems.length === 0) {
    console.log("No existing menu items to match against. Exiting.");
    process.exit(0);
  }

  // 3. Launch Playwright and scrape GrabFood
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  let scrapedItems: ScrapedItem[] = [];

  try {
    const { ctx, page } = await createContext(browser);

    const found = await navigateToMenu(page, brand.name);
    if (!found) {
      console.log("\nCould not find restaurant on GrabFood. Exiting.");
      await ctx.close();
      await browser.close();
      process.exit(0);
    }

    // Try DOM scraping first
    scrapedItems = await scrapeMenuItems(page);

    // If we got very few items, try API interception as fallback
    if (scrapedItems.length < 3) {
      console.log(
        `  Only ${scrapedItems.length} items from DOM, trying API interception...`,
      );
      const apiItems = await scrapeViaApiInterception(page);
      if (apiItems.length > scrapedItems.length) {
        scrapedItems = apiItems;
      }
    }

    await ctx.close();
  } finally {
    await browser.close();
  }

  console.log(`\nScraped ${scrapedItems.length} items from GrabFood.\n`);

  if (scrapedItems.length === 0) {
    console.log("No items scraped. Exiting.");
    process.exit(0);
  }

  // Filter out items without images
  const withImages = scrapedItems.filter((item) => item.imageUrl);
  console.log(`  ${withImages.length} items have images.\n`);

  if (withImages.length === 0) {
    console.log("No items with images found. Exiting.");
    process.exit(0);
  }

  // 4. Fuzzy match scraped items to DB items
  console.log("Matching scraped items to DB items...\n");
  const { matched, unmatched } = matchItems(withImages, dbItems);

  console.log(`  Matched: ${matched.length}`);
  console.log(`  Unmatched (scraped but no DB match): ${unmatched.length}\n`);

  if (matched.length > 0) {
    console.log("Matched items:");
    for (const m of matched) {
      const catName = categoryMap.get(m.dbItem.category_id) || "?";
      console.log(
        `  [${m.matchType}, ${m.score.toFixed(2)}] "${m.scrapedItem.name}" -> DB: "${m.dbItem.name}" (cat: ${catName})`,
      );
    }
    console.log();
  }

  if (unmatched.length > 0) {
    console.log("Unmatched scraped items (no DB equivalent):");
    for (const u of unmatched.slice(0, 20)) {
      console.log(`  - "${u.name}" (${u.category})`);
    }
    if (unmatched.length > 20) {
      console.log(`  ... and ${unmatched.length - 20} more.`);
    }
    console.log();
  }

  if (DRY_RUN) {
    console.log("=== DRY RUN complete. No images downloaded or DB updated. ===");
    process.exit(0);
  }

  // 5. Download, upload, and update each matched item
  console.log("Processing matched items...\n");

  let uploaded = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < matched.length; i++) {
    const m = matched[i];
    const imageUrl = m.scrapedItem.imageUrl!;
    const catName = categoryMap.get(m.dbItem.category_id) || "menu";

    console.log(
      `[${i + 1}/${matched.length}] "${m.dbItem.name}" <- "${m.scrapedItem.name}"`,
    );

    // Skip if already has a CDN image
    if (m.dbItem.cdn_image_url && m.dbItem.original_image_url) {
      console.log("  Already has CDN image, skipping.");
      skipped++;
      continue;
    }

    // Download image
    console.log(`  Downloading: ${imageUrl.slice(0, 80)}...`);
    const downloaded = await downloadImage(imageUrl);
    if (!downloaded) {
      console.log("  Failed to download. Skipping.");
      failed++;
      continue;
    }
    console.log(
      `  Downloaded: ${(downloaded.buffer.byteLength / 1024).toFixed(1)} KB (${downloaded.contentType})`,
    );

    // Upload to Supabase Storage
    const cdnUrl = await uploadToStorage(
      brand.slug,
      catName,
      m.dbItem.name,
      downloaded.buffer,
      downloaded.contentType,
    );
    if (!cdnUrl) {
      console.log("  Failed to upload. Skipping.");
      failed++;
      continue;
    }
    console.log(`  Uploaded: ${cdnUrl.slice(0, 80)}...`);

    // Update DB row
    const updated = await updateMenuItem(m.dbItem.id, imageUrl, cdnUrl);
    if (updated) {
      console.log("  DB updated.");
      uploaded++;
    } else {
      failed++;
    }

    // Brief delay between downloads to be polite to CDN
    await sleep(200);
  }

  // 6. Summary
  console.log("\n=== Summary ===");
  console.log(`Brand:           ${brand.name} (${brand.slug})`);
  console.log(`Scraped items:   ${scrapedItems.length} (${withImages.length} with images)`);
  console.log(`DB items:        ${dbItems.length}`);
  console.log(`Matched:         ${matched.length}`);
  console.log(`Uploaded:        ${uploaded}`);
  console.log(`Skipped (exist): ${skipped}`);
  console.log(`Failed:          ${failed}`);
  console.log(`Unmatched:       ${unmatched.length}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
