/**
 * Deliveroo Menu Scraper
 *
 * Uses Playwright to search for restaurants on Deliveroo Singapore,
 * extracts menu data from __NEXT_DATA__ JSON, and stores results in Supabase.
 *
 * Usage:
 *   node scripts/scrape-deliveroo.mjs                  # Scrape all brands with 0 menu items
 *   node scripts/scrape-deliveroo.mjs --brand subway   # Scrape specific brand by slug
 *   node scripts/scrape-deliveroo.mjs --limit 10       # Limit number of brands to process
 *   node scripts/scrape-deliveroo.mjs --dry-run        # Don't save to DB, just print results
 *   node scripts/scrape-deliveroo.mjs --all            # Scrape all active brands (even with existing data)
 */

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "fs";

// === Config ===
const SEARCH_DELAY_MIN_MS = 3000;
const SEARCH_DELAY_MAX_MS = 6000;
const PAGE_LOAD_TIMEOUT = 20000;
const CONTEXT_ROTATE_EVERY = 20;
const PROGRESS_FILE = "/Users/haoming/Desktop/bestfoodwhere/scripts/.deliveroo-progress.json";
const BASE_URL = "https://deliveroo.com.sg/restaurants/singapore/orchard";

// === Parse args ===
const args = process.argv.slice(2);
const getArg = (name) => { const i = args.indexOf(`--${name}`); return i > -1 ? args[i + 1] : null; };
const hasFlag = (name) => args.includes(`--${name}`);
const DRY_RUN = hasFlag("dry-run");
const BRAND_FILTER = getArg("brand");
const LIMIT = parseInt(getArg("limit") || "0") || 0;
const SCRAPE_ALL = hasFlag("all");

// === Supabase ===
const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`)); return m?.[1]; };
const supabase = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

// === Progress tracking ===
function loadProgress() {
  if (existsSync(PROGRESS_FILE)) {
    return JSON.parse(readFileSync(PROGRESS_FILE, "utf8"));
  }
  return { completed: {}, failed: {}, notFound: [] };
}

function saveProgress(progress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// === User agents ===
const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
];

// === Known location patterns in brand names ===
const LOCATION_PATTERNS = [
  /\s*@\s*.+$/i,
  /\s*-\s*(bedok|tampines|jurong|woodlands|sengkang|punggol|pasir ris|clementi|bukit|ang mo kio|toa payoh|bishan|yishun|hougang|serangoon|novena|orchard|marina|bugis|chinatown|raffles|sentosa|harbourfront|vivocity|nex|jem|westgate|junction\s*\d+|lot\s*one|causeway\s*point|northpoint|compass\s*one|waterway\s*point|suntec|ion|plaza\s*sing|parkway\s*parade|tampines\s*mall|bedok\s*mall|changi|jewel|terminal)/i,
  /\s*\(.*?\)\s*$/,
];

/**
 * Extract core brand name by stripping location suffixes.
 */
function extractCoreBrand(name) {
  let core = name;
  for (const pattern of LOCATION_PATTERNS) {
    core = core.replace(pattern, "").trim();
  }
  // Also strip trailing "Singapore" or "SG"
  core = core.replace(/\s+(singapore|sg)$/i, "").trim();
  return core || name;
}

/**
 * Create a slug from a brand name for matching.
 */
function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "-")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Score how well a Deliveroo restaurant slug matches our brand.
 * Returns 0-1 score.
 */
function matchScore(brandName, deliverooSlug) {
  const brandSlug = nameToSlug(brandName);
  const brandWords = brandSlug.split("-").filter(w => w.length > 0);
  const slugWords = deliverooSlug.split("-").filter(w => w.length > 0);

  if (brandWords.length === 0 || slugWords.length === 0) return 0;

  // Check if slug starts with brand slug
  if (deliverooSlug.startsWith(brandSlug)) return 1.0;

  // Check word overlap
  let matchedBrandWords = 0;
  let matchedSlugWords = 0;

  for (const bw of brandWords) {
    const match = slugWords.some(sw => {
      if (sw === bw) return true;
      // Only allow prefix matching for words >= 4 chars to avoid false positives
      if (bw.length >= 4 && sw.length >= 4 && (sw.startsWith(bw) || bw.startsWith(sw))) return true;
      return false;
    });
    if (match) matchedBrandWords++;
  }

  for (const sw of slugWords) {
    const match = brandWords.some(bw => {
      if (sw === bw) return true;
      if (bw.length >= 4 && sw.length >= 4 && (sw.startsWith(bw) || bw.startsWith(sw))) return true;
      return false;
    });
    if (match) matchedSlugWords++;
  }

  // Combined score: 70% brand word coverage + 30% slug word coverage
  const brandCoverage = matchedBrandWords / brandWords.length;
  const slugCoverage = matchedSlugWords / slugWords.length;
  return brandCoverage * 0.7 + slugCoverage * 0.3;
}

/**
 * Find the best matching restaurant from search results.
 */
function findBestMatch(brandName, searchResults) {
  const coreName = extractCoreBrand(brandName);
  let bestScore = 0;
  let bestResult = null;

  for (const result of searchResults) {
    const score = matchScore(coreName, result.slug);
    if (score > bestScore) {
      bestScore = score;
      bestResult = result;
    }
  }

  // Require minimum 0.5 match score
  if (bestScore >= 0.5) {
    return { ...bestResult, score: bestScore };
  }
  return null;
}

/**
 * Extract menu data from __NEXT_DATA__ on a Deliveroo restaurant page.
 */
async function extractMenuData(page) {
  return await page.evaluate(() => {
    const script = document.getElementById("__NEXT_DATA__");
    if (!script) return null;

    const data = JSON.parse(script.textContent);
    const menuRoot = data?.props?.initialState?.menuPage?.menu?.metas?.root;
    if (!menuRoot) return null;

    const restaurant = menuRoot.restaurant;
    const categories = menuRoot.categories || [];
    const items = menuRoot.items || [];

    if (categories.length === 0 || items.length === 0) return null;

    // Group items by category
    const categoryMap = {};
    for (const cat of categories) {
      categoryMap[cat.id] = { name: cat.name, items: [] };
    }

    for (const item of items) {
      if (!item.categoryId || !categoryMap[item.categoryId]) continue;

      categoryMap[item.categoryId].items.push({
        name: item.name,
        description: item.description || item.productInformation || null,
        price: item.price?.fractional ? item.price.fractional / 100 : null,
        priceText: item.price?.formatted || null,
        image: item.image?.url?.replace("{w}", "400").replace("{h}", "400") || null,
        available: item.available !== false,
        popular: item.popular === true,
        dietaryTags: item.dietaryTags || [],
      });
    }

    // Convert to array format
    const result = {
      restaurantName: restaurant?.name,
      restaurantSlug: restaurant?.uname,
      address: restaurant?.location?.address?.address1,
      categories: categories
        .map(cat => ({
          name: categoryMap[cat.id].name,
          items: categoryMap[cat.id].items,
        }))
        .filter(cat => cat.items.length > 0),
    };

    result.totalItems = result.categories.reduce((sum, c) => sum + c.items.length, 0);
    result.deliverooUrl = `https://deliveroo.com.sg${restaurant?.links?.self?.href || ""}`;

    return result;
  });
}

/**
 * Search for a brand on Deliveroo and extract menu data.
 */
async function searchAndScrape(page, brandName, isFirstSearch) {
  const coreName = extractCoreBrand(brandName);
  const searchQuery = coreName
    .replace(/[^a-zA-Z0-9\s&'-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Make sure we're on the restaurants page
  const currentUrl = page.url();
  if (!currentUrl.includes("deliveroo.com.sg/restaurants")) {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: PAGE_LOAD_TIMEOUT });
    await page.waitForTimeout(2000);
  }

  // Dismiss cookie banner on first visit
  if (isFirstSearch) {
    try {
      const acceptBtn = page.locator("#onetrust-accept-btn-handler");
      if (await acceptBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await acceptBtn.click();
        await page.waitForTimeout(1000);
      }
    } catch {}
    // Dismiss any other modal
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  }

  // Type in search
  const searchInput = page.locator("input[type='search']").first();
  try {
    await searchInput.click({ force: true, timeout: 5000 });
  } catch {
    // If click fails, try pressing Escape first
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    await searchInput.click({ force: true, timeout: 5000 });
  }
  await page.waitForTimeout(300);
  await searchInput.fill("");
  await page.waitForTimeout(200);
  await searchInput.fill(searchQuery);
  await page.waitForTimeout(3000);

  // Extract restaurant links from search results
  const searchResults = await page.evaluate(() => {
    const results = [];
    const seen = new Set();
    document.querySelectorAll("a[href*='/menu/']").forEach(a => {
      const href = a.getAttribute("href") || "";
      const slugMatch = href.match(/\/menu\/[^/]+\/([^/]+)\/([^?]+)/);
      if (!slugMatch) return;
      const slug = slugMatch[2];
      if (seen.has(slug)) return;
      seen.add(slug);
      results.push({
        text: a.textContent?.trim()?.slice(0, 100) || "",
        href,
        area: slugMatch[1],
        slug,
      });
    });
    return results;
  });

  if (searchResults.length === 0) {
    // Clear search and return
    await searchInput.fill("");
    await page.waitForTimeout(300);
    return null;
  }

  // Find best matching result
  const match = findBestMatch(brandName, searchResults);
  if (!match) {
    await searchInput.fill("");
    await page.waitForTimeout(300);
    return null;
  }

  // Navigate to the restaurant page
  const restaurantUrl = `https://deliveroo.com.sg${match.href}`;
  await page.goto(restaurantUrl, { waitUntil: "domcontentloaded", timeout: PAGE_LOAD_TIMEOUT });
  await page.waitForTimeout(3000);

  // Check for "Page Not Found"
  const title = await page.title();
  if (title.includes("Page Not Found") || title.includes("404")) {
    return null;
  }

  // Extract menu data from __NEXT_DATA__
  const menuData = await extractMenuData(page);
  if (!menuData || menuData.totalItems === 0) {
    return null;
  }

  return menuData;
}

/**
 * Save scraped menu data to Supabase.
 */
async function saveToSupabase(brand, result) {
  // 1. Delete existing menu data for this brand
  await supabase.from("menu_items").delete().eq("brand_menu_id", brand.id);
  await supabase.from("menu_categories").delete().eq("brand_menu_id", brand.id);

  // 2. Insert categories and items
  let totalItems = 0;
  let hasImages = false;
  let hasPrices = false;

  for (let ci = 0; ci < result.categories.length; ci++) {
    const cat = result.categories[ci];

    const { data: catRow, error: catError } = await supabase
      .from("menu_categories")
      .insert({
        brand_menu_id: brand.id,
        name: cat.name,
        sort_order: ci,
      })
      .select("id")
      .single();

    if (catError) {
      console.log(`    Warning: Category insert error: ${catError.message}`);
      continue;
    }

    const itemRows = cat.items.map((item, idx) => {
      if (item.image) hasImages = true;
      if (item.price) hasPrices = true;
      totalItems++;

      return {
        brand_menu_id: brand.id,
        category_id: catRow.id,
        name: item.name,
        description: item.description || null,
        price: item.priceText,
        price_numeric: item.price,
        original_image_url: item.image,
        dietary_tags: item.dietaryTags || [],
        is_available: item.available,
        sort_order: idx,
      };
    });

    if (itemRows.length > 0) {
      const { error: itemError } = await supabase.from("menu_items").insert(itemRows);
      if (itemError) {
        console.log(`    Warning: Items insert error: ${itemError.message}`);
      }
    }
  }

  // 3. Update brand_menus with Deliveroo URL and item count
  const socialLinks = brand.social_links || {};
  socialLinks.deliveroo = result.deliverooUrl;

  await supabase
    .from("brand_menus")
    .update({
      menu_item_count: totalItems,
      has_images: hasImages,
      has_prices: hasPrices,
      social_links: socialLinks,
      updated_at: new Date().toISOString(),
    })
    .eq("id", brand.id);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// === Main ===
async function scrapeDeliveroo() {
  console.log("=== Deliveroo Menu Scraper ===\n");
  if (DRY_RUN) console.log("*** DRY RUN - no DB writes ***\n");

  // Get brands to process
  let query = supabase
    .from("brand_menus")
    .select("id, slug, name, social_links")
    .eq("is_active", true);

  if (BRAND_FILTER) {
    query = query.eq("slug", BRAND_FILTER);
  } else if (!SCRAPE_ALL) {
    query = query.eq("menu_item_count", 0);
  }

  const { data: brands, error } = await query.order("name");
  if (error) { console.error("DB error:", error); process.exit(1); }

  const progress = loadProgress();
  let toProcess = (brands || []).filter(b =>
    !progress.completed[b.slug] && !progress.notFound.includes(b.slug)
  );

  if (LIMIT > 0) toProcess = toProcess.slice(0, LIMIT);

  console.log(`Brands to process: ${toProcess.length} (of ${brands?.length} total)`);
  console.log(`Already completed: ${Object.keys(progress.completed).length}`);
  console.log(`Not found on Deliveroo: ${progress.notFound.length}\n`);

  if (toProcess.length === 0) {
    console.log("Nothing to process!");
    return;
  }

  // Launch browser
  const browser = await chromium.launch({ headless: true });

  async function createFreshContext() {
    const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const ctx = await browser.newContext({
      userAgent: ua,
      locale: "en-SG",
      viewport: { width: 1920, height: 1080 },
    });
    const pg = await ctx.newPage();
    // Navigate to base URL
    await pg.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: PAGE_LOAD_TIMEOUT });
    await pg.waitForTimeout(2000);
    return { ctx, pg, isFirst: true };
  }

  let { ctx: currentContext, pg: page, isFirst } = await createFreshContext();
  let contextSearchCount = 0;

  let stats = { searched: 0, found: 0, menusCaptured: 0, itemsTotal: 0, errors: 0 };

  for (let i = 0; i < toProcess.length; i++) {
    const brand = toProcess[i];
    console.log(`\n[${i + 1}/${toProcess.length}] ${brand.name} (${brand.slug})`);

    // Rotate browser context periodically
    if (contextSearchCount >= CONTEXT_ROTATE_EVERY) {
      console.log(`  Rotating browser context (after ${contextSearchCount} searches)`);
      await currentContext.close();
      await sleep(2000);
      ({ ctx: currentContext, pg: page, isFirst } = await createFreshContext());
      contextSearchCount = 0;
    }

    try {
      const result = await searchAndScrape(page, brand.name, isFirst);
      isFirst = false;
      stats.searched++;
      contextSearchCount++;

      if (!result) {
        console.log(`  Not found on Deliveroo`);
        progress.notFound.push(brand.slug);
        saveProgress(progress);
        continue;
      }

      stats.found++;
      console.log(`  Found: ${result.restaurantName} (${result.restaurantSlug})`);
      console.log(`  ${result.categories.length} categories, ${result.totalItems} items`);
      stats.menusCaptured++;
      stats.itemsTotal += result.totalItems;

      if (!DRY_RUN) {
        await saveToSupabase(brand, result);
        console.log(`  Saved to Supabase`);
      } else {
        for (const cat of result.categories.slice(0, 2)) {
          console.log(`    Category: ${cat.name} (${cat.items.length} items)`);
          for (const item of cat.items.slice(0, 3)) {
            console.log(`      - ${item.name}: ${item.priceText} ${item.image ? "[img]" : ""}`);
          }
        }
      }

      progress.completed[brand.slug] = {
        deliverooSlug: result.restaurantSlug,
        items: result.totalItems,
        categories: result.categories.length,
        timestamp: new Date().toISOString(),
      };
      saveProgress(progress);

    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      stats.errors++;
      progress.failed[brand.slug] = err.message;
      saveProgress(progress);

      // If page crashed, create a fresh context
      if (err.message.includes("closed") || err.message.includes("crash") || err.message.includes("Target")) {
        console.log(`  Recovering with fresh context...`);
        try { await currentContext.close(); } catch {}
        await sleep(3000);
        ({ ctx: currentContext, pg: page, isFirst } = await createFreshContext());
        contextSearchCount = 0;
      }
    }

    // Random delay between searches
    const delay = SEARCH_DELAY_MIN_MS + Math.random() * (SEARCH_DELAY_MAX_MS - SEARCH_DELAY_MIN_MS);
    await sleep(delay);

    // Print progress every 20 brands
    if ((i + 1) % 20 === 0) {
      console.log(`\n--- Progress: ${i + 1}/${toProcess.length} | Found: ${stats.found} | Items: ${stats.itemsTotal} | Errors: ${stats.errors} ---`);
    }
  }

  await currentContext.close();
  await browser.close();

  console.log("\n\n=== Final Summary ===");
  console.log(`Searched: ${stats.searched}`);
  console.log(`Found: ${stats.found} (${stats.searched > 0 ? Math.round(stats.found / stats.searched * 100) : 0}%)`);
  console.log(`Menu items captured: ${stats.itemsTotal}`);
  console.log(`Errors: ${stats.errors}`);
}

scrapeDeliveroo().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
