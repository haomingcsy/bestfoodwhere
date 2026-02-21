/**
 * 02-scrape-websites.ts
 *
 * Scrapes restaurant websites to extract menu items, social links, and
 * descriptions.  Stores results in menu_categories / menu_items and updates
 * brand_menus with social links + scrape status.
 *
 * Usage:
 *   npx tsx scripts/pipeline/02-scrape-websites.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";

// Allow self-signed / mismatched SSL certs (common on SG restaurant sites)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

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
// Constants
// ---------------------------------------------------------------------------

const USER_AGENT =
  "Mozilla/5.0 (compatible; BFWBot/1.0; +https://bestfoodwhere.sg)";
const FETCH_TIMEOUT_MS = 20_000;
const CONCURRENCY = 3;
const BATCH_DELAY_MS = 1_000;
const RETRY_LIMIT = 2;
const RETRY_BACKOFF_MS = 3_000;
const LOG_EVERY = 25;

/** Domains we should never scrape (aggregator / social pages, not menus). */
const BLOCKED_DOMAINS = [
  "google.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "youtube.com",
  "tiktok.com",
];

const MENU_PATH_PATTERNS = [
  "/menu",
  "/food",
  "/our-menu",
  "/food-menu",
  "/our-food",
  "/order",
];

const PRICE_RE =
  /(?:S?\$|SGD)\s*(\d{1,4}(?:\.\d{1,2})?)|(\d{1,4}\.\d{2})(?=\s|$|<)/gi;

const SOCIAL_DOMAINS: Record<string, string> = {
  "facebook.com": "facebook",
  "instagram.com": "instagram",
  "linkedin.com": "linkedin",
  "youtube.com": "youtube",
  "tiktok.com": "tiktok",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BrandMenuRow {
  id: string;
  slug: string;
  name: string;
  website_url: string;
  description: string | null;
}

interface ExtractedItem {
  name: string;
  description: string | null;
  price: number | null;
  price_text: string | null;
  image_url: string | null;
}

interface ExtractedCategory {
  name: string;
  items: ExtractedItem[];
}

interface ScrapeResult {
  categories: ExtractedCategory[];
  socialLinks: Record<string, string>;
  aboutText: string | null;
  menuPageUrl: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isBlockedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return BLOCKED_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith("." + d),
    );
  } catch {
    return false;
  }
}

function resolveUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

/** Parse a price string like "$12.90", "SGD 8.50", "S$15.00" into a number. */
function parsePrice(text: string): number | null {
  const cleaned = text.replace(/SGD/gi, "").replace(/S?\$/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 || num > 9999 ? null : num;
}

// ---------------------------------------------------------------------------
// Fetch with timeout + retries
// ---------------------------------------------------------------------------

/** Try URL variants: original, without www., with www. */
function urlVariants(url: string): string[] {
  const variants = [url];
  try {
    const u = new URL(url);
    if (u.hostname.startsWith("www.")) {
      variants.push(url.replace("://www.", "://"));
    } else {
      variants.push(url.replace("://", "://www."));
    }
  } catch {}
  return variants;
}

async function fetchWithRetry(
  url: string,
  retries = RETRY_LIMIT,
): Promise<{ html: string; ok: boolean; status: number }> {
  const urls = urlVariants(url);

  for (const tryUrl of urls) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        const res = await fetch(tryUrl, {
          headers: {
            "User-Agent": USER_AGENT,
            Accept: "text/html,application/xhtml+xml,*/*",
            "Accept-Language": "en-SG,en;q=0.9",
          },
          signal: controller.signal,
          redirect: "follow",
        });

        clearTimeout(timer);

        if (res.status === 403 || res.status === 404 || res.status === 410) {
          return { html: "", ok: false, status: res.status };
        }

        if (!res.ok) {
          if (attempt < retries) {
            await sleep(RETRY_BACKOFF_MS);
            continue;
          }
          break; // Try next URL variant
        }

        const contentType = res.headers.get("content-type") || "";
        const html = await res.text();

        // Accept if content-type says HTML, OR if body looks like HTML
        const looksLikeHtml =
          html.trimStart().slice(0, 100).toLowerCase().includes("<!doctype") ||
          html.trimStart().slice(0, 100).toLowerCase().includes("<html");
        if (
          !contentType.includes("text/html") &&
          !contentType.includes("xhtml") &&
          !looksLikeHtml
        ) {
          return { html: "", ok: false, status: res.status };
        }

        return { html, ok: true, status: res.status };
      } catch (err: unknown) {
        if (attempt < retries) {
          await sleep(RETRY_BACKOFF_MS);
          continue;
        }
        break; // Try next URL variant
      }
    }
  }
  return { html: "", ok: false, status: 0 };
}

// ---------------------------------------------------------------------------
// Robots.txt check (best-effort)
// ---------------------------------------------------------------------------

async function isAllowedByRobots(url: string): Promise<boolean> {
  try {
    const origin = new URL(url).origin;
    const robotsUrl = `${origin}/robots.txt`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);

    const res = await fetch(robotsUrl, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return true; // no robots.txt = allowed

    const text = await res.text();
    const lines = text.split("\n");
    let inOurSection = false;
    let inWildcard = false;

    for (const raw of lines) {
      const line = raw.trim().toLowerCase();
      if (line.startsWith("user-agent:")) {
        const agent = line.replace("user-agent:", "").trim();
        inOurSection = agent === "bfwbot";
        inWildcard = agent === "*";
      } else if ((inOurSection || inWildcard) && line.startsWith("disallow:")) {
        const path = line.replace("disallow:", "").trim();
        if (path === "/" || path === "/*") return false;
      }
    }

    return true;
  } catch {
    return true; // on error, assume allowed
  }
}

// ---------------------------------------------------------------------------
// Social link extraction
// ---------------------------------------------------------------------------

function extractSocialLinks($: cheerio.CheerioAPI): Record<string, string> {
  const links: Record<string, string> = {};
  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href") || "").trim();
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
    for (const [domain, key] of Object.entries(SOCIAL_DOMAINS)) {
      if (href.includes(domain) && !links[key]) {
        links[key] = href;
      }
    }
  });
  return links;
}

// ---------------------------------------------------------------------------
// About / description extraction
// ---------------------------------------------------------------------------

function extractAboutText($: cheerio.CheerioAPI): string | null {
  // Look for meta description first
  const metaDesc =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content");

  if (metaDesc && metaDesc.length > 30) {
    return metaDesc.slice(0, 500);
  }

  // Look for about sections
  const aboutSelectors = [
    "#about",
    ".about",
    '[class*="about"]',
    "#story",
    ".story",
    '[class*="story"]',
  ];

  for (const sel of aboutSelectors) {
    const text = $(sel).first().text().trim();
    if (text && text.length > 30 && text.length < 2000) {
      return text.slice(0, 500);
    }
  }

  return metaDesc?.slice(0, 500) || null;
}

// ---------------------------------------------------------------------------
// Menu page discovery
// ---------------------------------------------------------------------------

function findMenuPageLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href") || "").trim().toLowerCase();
    if (!href || href === "#") return;

    for (const pattern of MENU_PATH_PATTERNS) {
      if (href.includes(pattern)) {
        const resolved = resolveUrl(baseUrl, $(el).attr("href") || "");
        if (!seen.has(resolved)) {
          seen.add(resolved);
          found.push(resolved);
        }
        break;
      }
    }
  });

  return found;
}

// ---------------------------------------------------------------------------
// Menu extraction
// ---------------------------------------------------------------------------

function extractMenuFromPage(
  $: cheerio.CheerioAPI,
  url: string,
): { categories: ExtractedCategory[] } {
  const categories: ExtractedCategory[] = [];
  const seenItems = new Set<string>();

  // -----------------------------------------------------------------------
  // Strategy 1: JSON-LD structured data
  // -----------------------------------------------------------------------
  const jsonLdScripts = $('script[type="application/ld+json"]').toArray();
  for (const script of jsonLdScripts) {
    try {
      const raw = $(script).html() || "";
      const data = JSON.parse(raw);
      const items = extractFromJsonLd(data);
      if (items.length > 0) {
        categories.push({ name: "Menu", items });
        for (const it of items) seenItems.add(it.name.toLowerCase());
      }
    } catch {
      // malformed JSON-LD — skip
    }
  }

  // -----------------------------------------------------------------------
  // Strategy 2: Common CSS selectors for menu sections
  // -----------------------------------------------------------------------
  const menuSectionSelectors = [
    ".menu-section",
    ".menu-category",
    ".food-category",
    '[class*="menu-group"]',
    '[class*="menu-section"]',
    '[class*="menu-category"]',
    ".menu-list",
    ".food-list",
  ];

  for (const sectionSel of menuSectionSelectors) {
    $(sectionSel).each((_, section) => {
      const $section = $(section);
      // Try to find a heading inside
      const heading =
        $section.find("h2, h3, h4, h5").first().text().trim() || "Menu";

      const items = extractItemsFromContainer($, $section, url, seenItems);
      if (items.length > 0) {
        categories.push({ name: heading, items });
      }
    });
  }

  // -----------------------------------------------------------------------
  // Strategy 3: Headers followed by item lists
  // -----------------------------------------------------------------------
  if (categories.length === 0 || totalItems(categories) < 3) {
    $("h2, h3, h4").each((_, heading) => {
      const $heading = $(heading);
      const headingText = $heading.text().trim();
      if (!headingText || headingText.length > 80) return;

      // Collect sibling elements until next heading of same or higher level
      const tag = heading.tagName.toLowerCase();
      const items: ExtractedItem[] = [];
      let $next = $heading.next();
      let safetyCounter = 0;

      while ($next.length && safetyCounter < 100) {
        const nextTag = ($next.prop("tagName") || "").toLowerCase();
        // Stop at next heading of same or higher level
        if (
          nextTag === tag ||
          (tag === "h3" && nextTag === "h2") ||
          (tag === "h4" && (nextTag === "h2" || nextTag === "h3"))
        ) {
          break;
        }

        const containerItems = extractItemsFromContainer(
          $,
          $next,
          url,
          seenItems,
        );
        items.push(...containerItems);

        $next = $next.next();
        safetyCounter++;
      }

      if (items.length > 0) {
        categories.push({ name: headingText, items });
      }
    });
  }

  // -----------------------------------------------------------------------
  // Strategy 4: Price-based detection (fallback)
  // -----------------------------------------------------------------------
  if (totalItems(categories) < 3) {
    const itemSelectors = [
      ".menu-item",
      ".food-item",
      ".dish",
      '[class*="menu-item"]',
      '[class*="food-item"]',
      '[class*="dish"]',
      '[class*="product"]',
      "li",
    ];

    const fallbackItems: ExtractedItem[] = [];

    for (const sel of itemSelectors) {
      $(sel).each((_, el) => {
        const $el = $(el);
        const text = $el.text().trim();
        if (!text || text.length > 300) return;

        const priceMatch = text.match(PRICE_RE);
        if (!priceMatch) return;

        // Get the item name by removing the price part
        let name = text.replace(PRICE_RE, "").trim();
        // Clean up excess whitespace and special chars
        name = name
          .replace(/[\n\r\t]+/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim();
        // Remove trailing/leading punctuation
        name = name.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9)]+$/g, "").trim();

        if (
          name.length < 2 ||
          name.length > 120 ||
          seenItems.has(name.toLowerCase())
        ) {
          return;
        }

        const priceText = priceMatch[0];
        const price = parsePrice(priceText);

        // Try to find an image nearby
        const img = $el.find("img").first().attr("src") || null;
        const imageUrl = img ? resolveUrl(url, img) : null;

        seenItems.add(name.toLowerCase());
        fallbackItems.push({
          name,
          description: null,
          price,
          price_text: priceText,
          image_url: imageUrl,
        });
      });

      if (fallbackItems.length >= 3) break;
    }

    if (fallbackItems.length > 0) {
      categories.push({ name: "Menu", items: fallbackItems });
    }
  }

  return { categories };
}

function extractFromJsonLd(data: unknown): ExtractedItem[] {
  const items: ExtractedItem[] = [];
  if (!data || typeof data !== "object") return items;

  const obj = data as Record<string, unknown>;

  // Handle arrays
  if (Array.isArray(data)) {
    for (const entry of data) {
      items.push(...extractFromJsonLd(entry));
    }
    return items;
  }

  // Restaurant with hasMenu
  if (obj["@type"] === "Restaurant" && obj.hasMenu) {
    items.push(...extractFromJsonLd(obj.hasMenu));
  }

  // Menu type
  if (obj["@type"] === "Menu" && obj.hasMenuSection) {
    items.push(...extractFromJsonLd(obj.hasMenuSection));
  }

  // MenuSection
  if (obj["@type"] === "MenuSection" && obj.hasMenuItem) {
    items.push(...extractFromJsonLd(obj.hasMenuItem));
  }

  // MenuItem
  if (obj["@type"] === "MenuItem") {
    const name = String(obj.name || "").trim();
    if (name) {
      let price: number | null = null;
      let priceText: string | null = null;

      if (obj.offers && typeof obj.offers === "object") {
        const offers = obj.offers as Record<string, unknown>;
        if (offers.price) {
          price = parseFloat(String(offers.price));
          priceText = `$${price.toFixed(2)}`;
          if (isNaN(price)) price = null;
        }
      }

      items.push({
        name,
        description: obj.description
          ? String(obj.description).slice(0, 500)
          : null,
        price,
        price_text: priceText,
        image_url: obj.image ? String(obj.image) : null,
      });
    }
  }

  return items;
}

function extractItemsFromContainer(
  $: cheerio.CheerioAPI,
  $container: cheerio.Cheerio<cheerio.Element>,
  baseUrl: string,
  seenItems: Set<string>,
): ExtractedItem[] {
  const items: ExtractedItem[] = [];

  // Look for individual item blocks
  const itemSelectors = [
    ".menu-item",
    ".food-item",
    ".dish",
    '[class*="menu-item"]',
    '[class*="food-item"]',
    '[class*="dish"]',
    '[class*="product"]',
    "li",
    "tr",
  ];

  for (const sel of itemSelectors) {
    $container.find(sel).each((_, el) => {
      const $el = $(el);
      const fullText = $el.text().trim();
      if (!fullText || fullText.length > 500) return;

      // Extract the name: first heading, strong, or first meaningful text
      let name =
        $el
          .find(
            "h3, h4, h5, h6, strong, b, .name, .title, [class*='name'], [class*='title']",
          )
          .first()
          .text()
          .trim() || "";

      // Extract price
      const priceMatch = fullText.match(PRICE_RE);
      const priceText = priceMatch ? priceMatch[0] : null;
      const price = priceText ? parsePrice(priceText) : null;

      // If no heading-derived name, use the full text minus the price
      if (!name) {
        name = fullText.replace(PRICE_RE, "").trim();
        name = name
          .replace(/[\n\r\t]+/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim();
        name = name.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9)]+$/g, "").trim();
      }

      if (
        name.length < 2 ||
        name.length > 120 ||
        seenItems.has(name.toLowerCase())
      ) {
        return;
      }

      // Description: text that is not the name and not a price
      let description: string | null = null;
      const descEl = $el.find(".description, .desc, p, [class*='desc']");
      if (descEl.length) {
        const descText = descEl.first().text().trim();
        if (descText && descText !== name && descText.length > 5) {
          description = descText.slice(0, 500);
        }
      }

      // Image
      const img = $el.find("img").first().attr("src") || null;
      const imageUrl = img ? resolveUrl(baseUrl, img) : null;

      seenItems.add(name.toLowerCase());
      items.push({
        name,
        description,
        price,
        price_text: priceText,
        image_url: imageUrl,
      });
    });

    if (items.length > 0) break; // use the first selector that finds items
  }

  return items;
}

function totalItems(categories: ExtractedCategory[]): number {
  return categories.reduce((sum, c) => sum + c.items.length, 0);
}

// ---------------------------------------------------------------------------
// Scrape a single brand website
// ---------------------------------------------------------------------------

async function scrapeBrand(brand: BrandMenuRow): Promise<ScrapeResult> {
  const result: ScrapeResult = {
    categories: [],
    socialLinks: {},
    aboutText: null,
    menuPageUrl: null,
  };

  const url = brand.website_url;

  if (isBlockedDomain(url)) {
    return result;
  }

  // Check robots.txt
  const allowed = await isAllowedByRobots(url);
  if (!allowed) {
    console.log(`  [${brand.slug}] Blocked by robots.txt — skipping`);
    return result;
  }

  // Fetch homepage
  const homePage = await fetchWithRetry(url);
  if (!homePage.ok) {
    throw new Error(`Homepage fetch failed (HTTP ${homePage.status})`);
  }

  const $home = cheerio.load(homePage.html);

  // Extract social links from homepage
  result.socialLinks = extractSocialLinks($home);

  // Extract about text
  result.aboutText = extractAboutText($home);

  // Try extracting menu from homepage first
  const homeMenu = extractMenuFromPage($home, url);
  if (totalItems(homeMenu.categories) >= 3) {
    result.categories = homeMenu.categories;
    result.menuPageUrl = url;
    return result;
  }

  // Look for a dedicated menu page
  const menuLinks = findMenuPageLinks($home, url);

  for (const menuUrl of menuLinks.slice(0, 3)) {
    // Try up to 3 menu page candidates
    try {
      const menuPage = await fetchWithRetry(menuUrl);
      if (!menuPage.ok) continue;

      const $menu = cheerio.load(menuPage.html);
      const extracted = extractMenuFromPage($menu, menuUrl);

      // Also gather social links from menu page
      const menuSocial = extractSocialLinks($menu);
      for (const [key, val] of Object.entries(menuSocial)) {
        if (!result.socialLinks[key]) {
          result.socialLinks[key] = val;
        }
      }

      if (totalItems(extracted.categories) > totalItems(result.categories)) {
        result.categories = extracted.categories;
        result.menuPageUrl = menuUrl;
      }

      if (totalItems(result.categories) >= 3) break;
    } catch {
      // skip this menu page candidate
    }
  }

  // If still no menu items but homepage had some, keep those
  if (result.categories.length === 0 && homeMenu.categories.length > 0) {
    result.categories = homeMenu.categories;
    result.menuPageUrl = url;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Database operations — persist results
// ---------------------------------------------------------------------------

async function persistScrapeResult(
  brand: BrandMenuRow,
  result: ScrapeResult,
): Promise<{ itemCount: number; categoryCount: number }> {
  const brandId = brand.id;
  const itemCount = totalItems(result.categories);
  const categoryCount = result.categories.length;

  // Guard: never delete existing data if scrape returned nothing
  if (categoryCount === 0 || itemCount === 0) {
    return { itemCount: 0, categoryCount: 0 };
  }

  // Delete existing data for this brand (refresh pattern)
  await supabase.from("menu_items").delete().eq("brand_menu_id", brandId);
  await supabase.from("menu_categories").delete().eq("brand_menu_id", brandId);

  // Insert categories + items
  for (let ci = 0; ci < result.categories.length; ci++) {
    const cat = result.categories[ci];

    const { data: catRow, error: catErr } = await supabase
      .from("menu_categories")
      .insert({
        brand_menu_id: brandId,
        name: cat.name,
        sort_order: ci,
      })
      .select("id")
      .single();

    if (catErr || !catRow) {
      console.warn(
        `  [${brand.slug}] Failed to insert category "${cat.name}": ${catErr?.message}`,
      );
      continue;
    }

    const categoryId = catRow.id;

    // Batch insert items for this category
    const itemRows = cat.items.map((item, idx) => ({
      brand_menu_id: brandId,
      category_id: categoryId,
      name: item.name,
      description: item.description,
      price: item.price_text,
      price_numeric: item.price,
      original_image_url: item.image_url,
      sort_order: idx,
    }));

    if (itemRows.length > 0) {
      const { error: itemErr } = await supabase
        .from("menu_items")
        .insert(itemRows);

      if (itemErr) {
        console.warn(
          `  [${brand.slug}] Failed to insert items for "${cat.name}": ${itemErr.message}`,
        );
      }
    }
  }

  // Update brand_menus with results
  const updatePayload: Record<string, unknown> = {
    scrape_status: "completed",
    last_scraped_at: new Date().toISOString(),
    menu_item_count: itemCount,
  };

  if (Object.keys(result.socialLinks).length > 0) {
    updatePayload.social_links = result.socialLinks;
  }

  if (result.aboutText && !brand.description) {
    updatePayload.description = result.aboutText;
  }

  await supabase.from("brand_menus").update(updatePayload).eq("id", brandId);

  return { itemCount, categoryCount };
}

async function logScrape(
  brandId: string,
  websiteUrl: string,
  status: string,
  itemCount: number,
  error: string | null,
): Promise<void> {
  await supabase.from("scrape_logs").insert({
    brand_menu_id: brandId,
    website_url: websiteUrl,
    status,
    items_found: itemCount,
    error_message: error,
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== 02-scrape-websites ===");
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log("");

  // -------------------------------------------------------------------------
  // Step 1: Fetch brands to scrape
  // -------------------------------------------------------------------------
  console.log("Fetching brands with pending/failed scrape status...");

  const { data: brands, error } = await supabase
    .from("brand_menus")
    .select("id, slug, name, website_url, description")
    .not("website_url", "is", null)
    .in("scrape_status", ["pending", "failed"])
    .eq("menu_item_count", 0)
    .order("slug");

  if (error) {
    console.error("Error fetching brand_menus:", error.message);
    process.exit(1);
  }

  if (!brands || brands.length === 0) {
    console.log("No brands to scrape. All done!");
    return;
  }

  console.log(`Found ${brands.length} brands to scrape.`);
  console.log("");

  // -------------------------------------------------------------------------
  // Step 2: Process in batches of CONCURRENCY
  // -------------------------------------------------------------------------
  const batches = chunk(brands as BrandMenuRow[], CONCURRENCY);

  let totalProcessed = 0;
  let totalItemsFound = 0;
  let totalCategoriesFound = 0;
  let totalSocialLinksFound = 0;
  let totalFailures = 0;
  let totalSkipped = 0;

  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];

    const promises = batch.map(async (brand) => {
      const startTime = Date.now();

      // Skip blocked domains
      if (isBlockedDomain(brand.website_url)) {
        console.log(`  [${brand.slug}] Skipped — blocked domain`);
        totalSkipped++;
        await logScrape(
          brand.id,
          brand.website_url,
          "skipped",
          0,
          "Blocked domain",
        );
        return;
      }

      try {
        const result = await scrapeBrand(brand);
        const itemCount = totalItems(result.categories);
        const socialCount = Object.keys(result.socialLinks).length;
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        if (itemCount > 0) {
          const { itemCount: stored, categoryCount } =
            await persistScrapeResult(brand, result);

          console.log(
            `  [${brand.slug}] ${stored} items in ${categoryCount} categories, ` +
              `${socialCount} social links (${elapsed}s)`,
          );

          totalItemsFound += stored;
          totalCategoriesFound += categoryCount;
          totalSocialLinksFound += socialCount;

          await logScrape(
            brand.id,
            brand.website_url,
            "completed",
            stored,
            null,
          );
        } else {
          // No menu items found but scrape succeeded
          const updatePayload: Record<string, unknown> = {
            scrape_status: "completed",
            last_scraped_at: new Date().toISOString(),
          };

          if (socialCount > 0) {
            updatePayload.social_links = result.socialLinks;
            totalSocialLinksFound += socialCount;
          }

          if (result.aboutText && !brand.description) {
            updatePayload.description = result.aboutText;
          }

          await supabase
            .from("brand_menus")
            .update(updatePayload)
            .eq("id", brand.id);

          console.log(
            `  [${brand.slug}] No menu items found, ${socialCount} social links (${elapsed}s)`,
          );

          await logScrape(
            brand.id,
            brand.website_url,
            "completed",
            0,
            "No menu items detected",
          );
        }
      } catch (err: unknown) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const errMsg = err instanceof Error ? err.message : String(err);
        console.log(`  [${brand.slug}] FAILED: ${errMsg} (${elapsed}s)`);
        totalFailures++;

        await supabase
          .from("brand_menus")
          .update({
            scrape_status: "failed",
            last_scraped_at: new Date().toISOString(),
          })
          .eq("id", brand.id);

        await logScrape(
          brand.id,
          brand.website_url,
          "failed",
          0,
          errMsg.slice(0, 500),
        );
      }
    });

    await Promise.all(promises);
    totalProcessed += batch.length;

    // Log progress
    if (totalProcessed % LOG_EVERY === 0 || bi === batches.length - 1) {
      console.log(
        `\nProgress: ${totalProcessed}/${brands.length} processed ` +
          `(${totalItemsFound} items, ${totalCategoriesFound} categories, ` +
          `${totalSocialLinksFound} social links, ${totalFailures} failures)\n`,
      );
    }

    // Delay between batches to avoid overwhelming servers
    if (bi < batches.length - 1) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("");
  console.log("=== Scrape Complete ===");
  console.log(`  Total processed:       ${totalProcessed}`);
  console.log(`  Total skipped:         ${totalSkipped}`);
  console.log(`  Menu items found:      ${totalItemsFound}`);
  console.log(`  Menu categories found: ${totalCategoriesFound}`);
  console.log(`  Social links found:    ${totalSocialLinksFound}`);
  console.log(`  Failures:              ${totalFailures}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
