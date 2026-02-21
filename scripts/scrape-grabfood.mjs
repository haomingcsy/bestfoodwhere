/**
 * GrabFood Menu Scraper
 *
 * Uses Playwright to search for restaurants on GrabFood Singapore,
 * captures menu data via API interception, and stores results in Supabase.
 *
 * Usage:
 *   node scripts/scrape-grabfood.mjs                  # Scrape all brands with 0 menu items
 *   node scripts/scrape-grabfood.mjs --brand subway   # Scrape specific brand by slug
 *   node scripts/scrape-grabfood.mjs --limit 10       # Limit number of brands to process
 *   node scripts/scrape-grabfood.mjs --dry-run        # Don't save to DB, just print results
 */

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "fs";

// === Config ===
const CONCURRENCY = 1; // One at a time to avoid rate limiting
const SEARCH_DELAY_MIN_MS = 4000; // Min delay between searches
const SEARCH_DELAY_MAX_MS = 8000; // Max delay between searches
const PAGE_LOAD_TIMEOUT = 25000;
const CONTEXT_ROTATE_EVERY = 15; // Fresh browser context every N brands
const PROGRESS_FILE = "/Users/haoming/Desktop/bestfoodwhere/scripts/.grabfood-progress.json";

// === Parse args ===
const args = process.argv.slice(2);
const getArg = (name) => { const i = args.indexOf(`--${name}`); return i > -1 ? args[i + 1] : null; };
const hasFlag = (name) => args.includes(`--${name}`);
const DRY_RUN = hasFlag("dry-run");
const BRAND_FILTER = getArg("brand");
const LIMIT = parseInt(getArg("limit") || "0") || 0;

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

// === Main scraper ===
async function scrapeGrabFood() {
  console.log("=== GrabFood Menu Scraper ===\n");
  if (DRY_RUN) console.log("*** DRY RUN - no DB writes ***\n");

  // Get brands to process
  let query = supabase
    .from("brand_menus")
    .select("id, slug, name, social_links")
    .eq("is_active", true);

  if (BRAND_FILTER) {
    query = query.eq("slug", BRAND_FILTER);
  } else {
    query = query.eq("menu_item_count", 0);
  }

  const { data: brands, error } = await query.order("name");
  if (error) { console.error("DB error:", error); process.exit(1); }

  const progress = loadProgress();
  let toProcess = (brands || []).filter(b => !progress.completed[b.slug] && !progress.notFound.includes(b.slug));

  if (LIMIT > 0) toProcess = toProcess.slice(0, LIMIT);

  console.log(`Brands to process: ${toProcess.length} (of ${brands?.length} total)`);
  console.log(`Already completed: ${Object.keys(progress.completed).length}`);
  console.log(`Not found on GrabFood: ${progress.notFound.length}\n`);

  if (toProcess.length === 0) {
    console.log("Nothing to process!");
    return;
  }

  // Launch browser
  const browser = await chromium.launch({ headless: true });

  const USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  ];

  async function createFreshContext() {
    const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const ctx = await browser.newContext({
      userAgent: ua,
      locale: "en-SG",
      geolocation: { latitude: 1.3521, longitude: 103.8198 },
      permissions: ["geolocation"],
    });
    await ctx.addCookies([{
      name: "location",
      value: encodeURIComponent(JSON.stringify({
        latitude: 1.3521, longitude: 103.8198,
        address: "Singapore", countryCode: "SG", isAccurate: true,
      })),
      domain: "food.grab.com",
      path: "/",
    }]);
    const pg = await ctx.newPage();
    return { ctx, pg };
  }

  let { ctx: currentContext, pg: page } = await createFreshContext();
  let contextSearchCount = 0;

  let stats = { searched: 0, found: 0, menusCaptured: 0, itemsTotal: 0, errors: 0, emptySearches: 0 };

  for (let i = 0; i < toProcess.length; i++) {
    const brand = toProcess[i];
    console.log(`\n[${i + 1}/${toProcess.length}] ${brand.name} (${brand.slug})`);

    // Rotate browser context periodically to avoid rate-limiting
    if (contextSearchCount >= CONTEXT_ROTATE_EVERY) {
      console.log(`  🔄 Rotating browser context (after ${contextSearchCount} searches)`);
      await currentContext.close();
      await sleep(2000); // Brief pause between context switches
      ({ ctx: currentContext, pg: page } = await createFreshContext());
      contextSearchCount = 0;
    }

    try {
      const result = await searchAndScrape(page, brand.name);
      stats.searched++;
      contextSearchCount++;

      if (!result) {
        console.log(`  ❌ Not found on GrabFood`);
        progress.notFound.push(brand.slug);
        saveProgress(progress);
        continue;
      }

      stats.found++;
      console.log(`  ✅ Found: ${result.merchantName} (${result.merchantId})`);
      console.log(`  📋 ${result.categories.length} categories, ${result.totalItems} items`);
      stats.menusCaptured++;
      stats.itemsTotal += result.totalItems;

      if (!DRY_RUN) {
        await saveToSupabase(brand, result);
        console.log(`  💾 Saved to Supabase`);
      } else {
        for (const cat of result.categories.slice(0, 2)) {
          console.log(`    Category: ${cat.name} (${cat.items.length} items)`);
          for (const item of cat.items.slice(0, 3)) {
            console.log(`      - ${item.name}: $${item.price?.toFixed(2)} ${item.image ? "📷" : ""}`);
          }
        }
      }

      progress.completed[brand.slug] = {
        merchantId: result.merchantId,
        merchantName: result.merchantName,
        categories: result.categories.length,
        items: result.totalItems,
        timestamp: new Date().toISOString(),
      };
      saveProgress(progress);

    } catch (e) {
      console.log(`  ⚠️ Error: ${e.message}`);
      stats.errors++;
      progress.failed[brand.slug] = { error: e.message, timestamp: new Date().toISOString() };
      saveProgress(progress);

      // On error, rotate context immediately
      try { await currentContext.close(); } catch {}
      ({ ctx: currentContext, pg: page } = await createFreshContext());
      contextSearchCount = 0;
    }

    // Random delay between brands (human-like)
    if (i < toProcess.length - 1) {
      const delay = SEARCH_DELAY_MIN_MS + Math.random() * (SEARCH_DELAY_MAX_MS - SEARCH_DELAY_MIN_MS);
      await sleep(delay);
    }

    // Print running stats every 50 brands
    if ((i + 1) % 50 === 0) {
      console.log(`\n  📊 Progress: ${stats.found} found / ${stats.searched} searched (${(stats.found/stats.searched*100).toFixed(1)}% hit rate)`);
    }
  }

  await currentContext.close();
  await browser.close();

  console.log("\n=== Summary ===");
  console.log(`Searched: ${stats.searched}`);
  console.log(`Found: ${stats.found}`);
  console.log(`Menus captured: ${stats.menusCaptured}`);
  console.log(`Total items: ${stats.itemsTotal}`);
  console.log(`Errors: ${stats.errors}`);
}

/**
 * Search for a restaurant on GrabFood and extract its menu
 */
async function searchAndScrape(page, brandName) {
  // Use core brand name for searching (better results than location-specific names)
  const coreBrand = extractCoreBrand(brandName);
  const cleanName = coreBrand
    .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII (Chinese chars etc.)
    .replace(/@/g, "at ")
    .replace(/['']/g, "")
    .replace(/\s*\(.*?\)\s*/g, " ") // Remove parenthetical like "(Jem)"
    .replace(/\s+/g, " ")
    .trim();
  const searchUrl = `https://food.grab.com/sg/en/restaurants?search=${encodeURIComponent(cleanName)}`;

  // Navigate to search page (no API interceptor needed here - just need HTML)
  try {
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: PAGE_LOAD_TIMEOUT });
  } catch (e) {
    // Page might timeout but search results could still be there
  }

  // Wait for restaurant links to appear (GrabFood renders via JS)
  try {
    await page.waitForSelector('a[href*="/restaurant/"]', { timeout: 10000 });
  } catch {
    // No restaurant links appeared - might be genuinely no results
  }
  await page.waitForTimeout(2000); // Extra buffer for all results to render

  // Find matching restaurant links in search results
  const restaurants = await page.evaluate(() => {
    const links = document.querySelectorAll('a[href*="/restaurant/"]');
    const seen = new Set();
    const results = [];
    for (const link of links) {
      const href = link.getAttribute("href");
      if (!href || seen.has(href)) continue;
      seen.add(href);
      const text = link.textContent?.trim() || "";
      // Extract slug from URL: /sg/en/restaurant/subway-bishan-north-delivery/SGDD...
      const slugMatch = href.match(/\/restaurant\/([^/]+?)(?:-delivery)?\/[A-Z0-9-]+/);
      const slug = slugMatch?.[1] || "";
      // Extract merchant ID from URL
      const idMatch = href.match(/\/([A-Z0-9][\w-]*[A-Z0-9])(?:\?.*)?$/);
      results.push({
        href,
        text: text.slice(0, 300),
        slug,
        merchantId: idMatch?.[1] || "",
      });
    }
    return results;
  });

  if (restaurants.length === 0) {
    // Diagnostic: check if page actually loaded
    const pageTitle = await page.title().catch(() => "unknown");
    const linkCount = await page.evaluate(() => document.querySelectorAll("a").length).catch(() => 0);
    const currentUrl = page.url();
    console.log(`  🔍 0 results (title: "${pageTitle}", url: ${currentUrl.slice(0, 80)}, links: ${linkCount})`);
    return null;
  }

  // Find best match by name similarity using word-overlap scoring
  const bestMatch = findBestMatch(brandName, restaurants);

  if (!bestMatch) {
    console.log(`  🔍 Search returned ${restaurants.length} results, but no confident match for "${brandName}"`);
    return null;
  }

  console.log(`  🔍 Search returned ${restaurants.length} results, best match: ${bestMatch.slug}`);

  // Navigate to the restaurant page to capture menu data via API
  const restaurantUrl = bestMatch.href.startsWith("http")
    ? bestMatch.href
    : `https://food.grab.com${bestMatch.href}`;

  // Set up API response interceptor BEFORE navigating
  let apiData = null;
  const menuPromise = new Promise((resolve) => {
    const handler = async (response) => {
      const url = response.url();
      if (url.includes("/foodweb/guest/") && url.includes("/merchants/") && !url.includes("/search")) {
        try {
          if (response.status() === 200) {
            const data = await response.json();
            if (data.merchant?.menu?.categories) {
              page.removeListener("response", handler);
              resolve(data);
            }
          }
        } catch (e) {}
      }
    };
    page.on("response", handler);
    setTimeout(() => {
      page.removeListener("response", handler);
      resolve(null);
    }, PAGE_LOAD_TIMEOUT);
  });

  try {
    await page.goto(restaurantUrl, { waitUntil: "domcontentloaded", timeout: PAGE_LOAD_TIMEOUT });
  } catch (e) {}

  apiData = await menuPromise;

  if (!apiData?.merchant?.menu?.categories) {
    console.log(`  ⚠️ API interception failed, trying DOM extraction...`);
    // Fallback: try to extract from DOM
    return await extractMenuFromDOM(page, bestMatch);
  }

  return parseGrabFoodAPI(apiData);
}

/**
 * Parse GrabFood API response into our standard format
 */
function parseGrabFoodAPI(data) {
  const merchant = data.merchant;
  const categories = [];
  let totalItems = 0;

  for (const cat of merchant.menu?.categories || []) {
    const items = [];
    for (const item of cat.items || []) {
      if (!item.name) continue;
      const priceNum = item.priceInMinorUnit ? item.priceInMinorUnit / 100 : null;
      items.push({
        name: item.name,
        description: item.description || "",
        price: priceNum,
        priceText: priceNum ? `$${priceNum.toFixed(2)}` : null,
        image: item.imgHref || null,
        available: item.available !== false,
        dietaryTags: extractDietaryTags(item),
      });
      totalItems++;
    }

    if (items.length > 0) {
      categories.push({
        name: cat.name,
        items,
      });
    }
  }

  return {
    merchantId: merchant.ID,
    merchantName: merchant.name,
    merchantPhoto: merchant.photoHref,
    grabfoodUrl: `https://food.grab.com/sg/en/restaurant/${merchant.ID}`,
    categories,
    totalItems,
  };
}

function extractDietaryTags(item) {
  const tags = [];
  const attrs = item.itemAttributes?.attributes;
  if (attrs) {
    for (const [groupName, group] of Object.entries(attrs)) {
      for (const attr of group.attributes || []) {
        if (attr.name) tags.push(attr.name);
      }
    }
  }
  return tags;
}

/**
 * Fallback: extract menu from DOM when API interception fails
 */
async function extractMenuFromDOM(page, matchInfo) {
  await page.waitForTimeout(3000);

  const menuData = await page.evaluate(() => {
    const categories = [];
    // GrabFood uses specific class patterns for menu sections
    const categoryHeaders = document.querySelectorAll('[class*="menuCategory"], [class*="menu-category"], h2');

    for (const header of categoryHeaders) {
      const catName = header.textContent?.trim();
      if (!catName || catName.length > 100) continue;

      const items = [];
      let sibling = header.nextElementSibling;
      while (sibling && !sibling.matches('h2, [class*="menuCategory"], [class*="menu-category"]')) {
        const nameEl = sibling.querySelector('[class*="itemName"], [class*="item-name"], [class*="dishName"]');
        const priceEl = sibling.querySelector('[class*="price"], [class*="Price"]');
        const imgEl = sibling.querySelector('img[src*="food-cms"], img[src*="grab.com"]');

        if (nameEl) {
          const priceText = priceEl?.textContent?.trim();
          const priceMatch = priceText?.match(/\$?([\d.]+)/);
          items.push({
            name: nameEl.textContent?.trim() || "",
            description: "",
            price: priceMatch ? parseFloat(priceMatch[1]) : null,
            priceText: priceText || null,
            image: imgEl?.src || null,
            available: true,
            dietaryTags: [],
          });
        }
        sibling = sibling.nextElementSibling;
      }

      if (items.length > 0) {
        categories.push({ name: catName, items });
      }
    }

    return categories;
  });

  if (menuData.length === 0) return null;

  const totalItems = menuData.reduce((sum, cat) => sum + cat.items.length, 0);
  return {
    merchantId: matchInfo.merchantId,
    merchantName: matchInfo.text?.split(/[,\d]/)[0]?.trim() || matchInfo.slug,
    merchantPhoto: null,
    grabfoodUrl: matchInfo.href,
    categories: menuData,
    totalItems,
  };
}

/**
 * Save scraped menu data to Supabase
 */
async function saveToSupabase(brand, result) {
  // Guard: never delete existing data if scrape returned nothing
  if (!result.categories.length) {
    console.log(`    ⚠️ Skipping save: no categories scraped`);
    return;
  }

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
      console.log(`    ⚠️ Category insert error: ${catError.message}`);
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
        console.log(`    ⚠️ Items insert error: ${itemError.message}`);
      }
    }
  }

  // 3. Update brand_menus with GrabFood URL and item count
  const socialLinks = brand.social_links || {};
  socialLinks.grabfood = result.grabfoodUrl;

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

/**
 * Extract core brand name by stripping location suffixes.
 * "Boost Juice @ Suntec City" → "Boost Juice"
 * "ASTONS Specialities @ Vivocity" → "ASTONS Specialities"
 * "Genki Sushi Junction 8" → "Genki Sushi" (if "Junction 8" is a known location)
 */
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

function extractCoreBrand(brandName) {
  let name = brandName;

  // Remove @ Location, - Location, | Location patterns
  name = name.replace(/\s*[@|]\s*.+$/, "");
  name = name.replace(/\s+-\s+.+$/, "");

  // Remove known location names from end
  const lower = name.toLowerCase().trim();
  for (const loc of KNOWN_LOCATIONS) {
    if (lower.endsWith(loc) && lower.length > loc.length + 1) {
      name = name.slice(0, name.length - loc.length).trim();
      // Also remove trailing "at", "in", "@"
      name = name.replace(/\s+(at|in|@)\s*$/i, "").trim();
      break;
    }
  }

  return name.trim();
}

function toSlug(name) {
  return name.toLowerCase()
    .replace(/&/g, "-")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Score how well a brand matches a restaurant slug.
 * Returns 0-1 score.
 */
function matchScore(brandSlug, slug) {
  const brandWords = brandSlug.split("-").filter(w => w.length > 0);
  const slugWords = slug.split("-").filter(w => w.length > 0);

  if (!brandSlug || !slug || brandWords.length === 0) return 0;

  // Method 1: Prefix match (highest confidence)
  if (slug.startsWith(brandSlug) || slug.startsWith(brandSlug.replace(/-/g, ""))) {
    return 1.0;
  }

  // Method 2: All brand words in slug sequentially
  let allFound = true;
  let searchFrom = 0;
  for (const bw of brandWords) {
    const idx = slug.indexOf(bw, searchFrom);
    if (idx === -1) { allFound = false; break; }
    searchFrom = idx + bw.length;
  }
  if (allFound) {
    const coverage = brandSlug.length / slug.length;
    return 0.7 + coverage * 0.3;
  }

  // Method 3: Word overlap (bidirectional)
  if (slugWords.length > 0) {
    const uniqueBrandWords = [...new Set(brandWords)];
    let brandMatched = 0;
    const matchedSlugWords = new Set();

    for (const bw of uniqueBrandWords) {
      const matchIdx = slugWords.findIndex(sw => {
        if (sw === bw) return true;
        if (sw.length >= 3 && bw.length >= 3) {
          return sw.startsWith(bw) || bw.startsWith(sw);
        }
        return false;
      });
      if (matchIdx >= 0) {
        brandMatched++;
        matchedSlugWords.add(matchIdx);
      }
    }

    const brandCoverage = brandMatched / uniqueBrandWords.length;
    const slugCoverage = matchedSlugWords.size / slugWords.length;
    return brandCoverage * 0.7 + slugCoverage * 0.3;
  }

  return 0;
}

/**
 * Find the best matching restaurant from search results.
 * Uses URL slug matching with core brand name extraction for location-specific brands.
 * Returns null if no confident match is found.
 */
function findBestMatch(brandName, restaurants) {
  const fullSlug = toSlug(brandName);
  const coreBrand = extractCoreBrand(brandName);
  const coreSlug = toSlug(coreBrand);

  let bestScore = 0;
  let bestRestaurant = null;

  for (const r of restaurants) {
    const slug = r.slug || "";

    // Try full brand slug first
    const fullScore = matchScore(fullSlug, slug);
    if (fullScore >= 1.0) return r; // Perfect match

    // Try core brand slug (without location)
    const coreScore = coreSlug !== fullSlug ? matchScore(coreSlug, slug) : 0;

    const score = Math.max(fullScore, coreScore);
    if (score > bestScore) {
      bestScore = score;
      bestRestaurant = r;
    }
  }

  // Require at least 50% combined score
  if (bestScore < 0.5) return null;

  return bestRestaurant;
}

// Run
await scrapeGrabFood();
