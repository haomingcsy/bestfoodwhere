/**
 * Google Image Search for Missing Menu Item Images
 *
 * Searches Google Images (via Playwright scraping) for food photos of menu items
 * that have no image, downloads the best result, and stores in
 * Supabase Storage.
 *
 * Usage:
 *   node scripts/search-google-images.mjs [options]
 *
 * Options:
 *   --limit N        Process only N unique dish names
 *   --brand SLUG     Only process items for this brand
 *   --dry-run        Search and score but don't download/upload
 *   --reset          Clear progress file and start fresh
 *   --min-score N    Minimum image quality score (default: 20)
 *
 * Prerequisites:
 *   Playwright installed (npx playwright install chromium)
 *   Supabase env vars in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { chromium } from "playwright";
import sharp from "sharp";

// ---------------------------------------------------------------------------
// .env.local loader (same pattern as cache-menu-images.mjs)
// ---------------------------------------------------------------------------
const envPath = new URL("../.env.local", import.meta.url).pathname;
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
    val = val.slice(1, -1);
  process.env[key] = val;
}

// ---------------------------------------------------------------------------
// Config & CLI
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const getArg = (name) => { const i = args.indexOf(`--${name}`); return i > -1 ? args[i + 1] : null; };
const hasFlag = (name) => args.includes(`--${name}`);

const DRY_RUN = hasFlag("dry-run");
const BRAND_FILTER = getArg("brand");
const LIMIT = parseInt(getArg("limit") || "0") || 0;
const RESET = hasFlag("reset");
const MIN_SCORE = parseInt(getArg("min-score") || "20") || 20;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "menu-images";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE env vars"); process.exit(1);
}

// Playwright browser (launched on demand, rotated periodically)
let browser = null;
let browserPage = null;
let browserSearchCount = 0;
const BROWSER_ROTATE_EVERY = 20; // Fresh browser every 20 searches

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
];

async function closeBrowser() {
  if (browser) {
    try { await browser.close(); } catch {}
    browser = null;
    browserPage = null;
  }
}

async function getBrowserPage(forceNew = false) {
  if (forceNew || !browser) {
    await closeBrowser();
    const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-infobars',
        '--window-size=1920,1080',
      ],
    });
    const context = await browser.newContext({
      userAgent: ua,
      locale: 'en-US',
      viewport: { width: 1280 + Math.floor(Math.random() * 200), height: 800 + Math.floor(Math.random() * 200) },
      javaScriptEnabled: true,
    });
    browserPage = await context.newPage();

    // Stealth: remove webdriver flag and add realistic browser properties
    await browserPage.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      window.chrome = { runtime: {} };
    });

    browserSearchCount = 0;
  }
  return browserPage;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// Progress tracking
// ---------------------------------------------------------------------------
const PROGRESS_FILE = new URL("./.google-images-progress.json", import.meta.url).pathname;

function loadProgress() {
  if (!RESET && existsSync(PROGRESS_FILE)) {
    return JSON.parse(readFileSync(PROGRESS_FILE, "utf8"));
  }
  return {
    completed: {},
    failed: {},
    stats: { totalQueries: 0, apiCallsToday: 0, lastApiCallDate: "", totalDownloaded: 0, totalItemsUpdated: 0 },
  };
}

function saveProgress(prog) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(prog, null, 2));
}

const progress = loadProgress();

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
let lastApiCall = 0;
const API_DELAY_MIN = 8000;  // Min 8s between searches
const API_DELAY_MAX = 15000; // Max 15s - random jitter to look human

async function rateLimitApi() {
  const now = Date.now();
  const jitter = API_DELAY_MIN + Math.random() * (API_DELAY_MAX - API_DELAY_MIN);
  const wait = Math.max(0, jitter - (now - lastApiCall));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastApiCall = Date.now();
}

let lastDownload = 0;
async function rateLimitDownload() {
  const now = Date.now();
  const wait = Math.max(0, 100 - (now - lastDownload));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastDownload = Date.now();
}

// ---------------------------------------------------------------------------
// Image helpers (from cache-menu-images.mjs patterns)
// ---------------------------------------------------------------------------
function detectImageType(buffer) {
  if (!buffer || buffer.length < 4) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    return { ext: "jpg", mime: "image/jpeg" };
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47)
    return { ext: "png", mime: "image/png" };
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer.length > 11 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50)
    return { ext: "webp", mime: "image/webp" };
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46)
    return { ext: "gif", mime: "image/gif" };
  return null;
}

function getExtension(contentType, url, buffer) {
  if (buffer) {
    const detected = detectImageType(buffer);
    if (detected) return detected.ext;
  }
  const typeMap = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
  if (contentType && typeMap[contentType.split(";")[0].trim()])
    return typeMap[contentType.split(";")[0].trim()];
  try {
    const urlPath = new URL(url).pathname;
    const match = urlPath.match(/\.(jpe?g|png|webp|gif|avif)$/i);
    if (match) return match[1].toLowerCase().replace("jpeg", "jpg");
  } catch {}
  return "jpg";
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60);
}

// ---------------------------------------------------------------------------
// Fetch items without images
// ---------------------------------------------------------------------------
async function fetchItemsWithoutImages() {
  const PAGE_SIZE = 1000;
  let allItems = [];
  let offset = 0;

  while (true) {
    let query = supabase
      .from("menu_items")
      .select("id, name, brand_menu_id")
      .is("cdn_image_url", null)
      .is("original_image_url", null)
      .range(offset, offset + PAGE_SIZE - 1);

    const { data, error } = await query;
    if (error) { console.error("DB error:", error.message); break; }
    if (!data || data.length === 0) break;
    allItems = allItems.concat(data);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  // Also fetch items where original_image_url or cdn_image_url is empty string
  offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from("menu_items")
      .select("id, name, brand_menu_id")
      .eq("cdn_image_url", "")
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) break;
    if (!data || data.length === 0) break;
    // Deduplicate with existing items
    const existingIds = new Set(allItems.map(i => i.id));
    for (const item of data) {
      if (!existingIds.has(item.id)) allItems.push(item);
    }
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return allItems;
}

// ---------------------------------------------------------------------------
// Fetch brand info for cuisine context
// ---------------------------------------------------------------------------
async function fetchBrandInfo() {
  const { data } = await supabase
    .from("brand_menus")
    .select("id, slug, name");

  const brandMap = {};
  for (const b of data || []) {
    brandMap[b.id] = { slug: b.slug, name: b.name };
  }

  // Get cuisines from mall_restaurants via brand_locations
  const { data: locations } = await supabase
    .from("brand_locations")
    .select("brand_menu_id, mall_restaurants!mall_restaurant_id(cuisines)");

  for (const loc of locations || []) {
    const brand = brandMap[loc.brand_menu_id];
    if (!brand) continue;
    const mr = loc.mall_restaurants;
    if (mr && Array.isArray(mr.cuisines) && mr.cuisines.length > 0) {
      if (!brand.cuisines) brand.cuisines = new Set();
      for (const c of mr.cuisines) brand.cuisines.add(c);
    }
  }

  return brandMap;
}

// ---------------------------------------------------------------------------
// Deduplication
// ---------------------------------------------------------------------------
function normalizeDishName(name) {
  let n = name.toLowerCase().trim();
  // Remove size variants
  n = n.replace(/\s*\((s|m|l|xs|xl|small|medium|large|regular|single|double)\)\s*/gi, " ");
  n = n.replace(/\s+(small|medium|large|regular|single|double)$/i, "");
  // Remove price patterns
  n = n.replace(/\s*\$[\d.]+\s*/g, " ");
  // Remove trailing numbers/codes like "A1", "B2"
  n = n.replace(/\s+[A-Z]?\d+$/i, "");
  // Collapse whitespace
  n = n.replace(/\s+/g, " ").trim();
  return n;
}

function buildDeduplicationMap(items, brandMap) {
  const map = new Map();

  for (const item of items) {
    if (!item.name || item.name.trim().length < 2) continue;

    const brand = brandMap[item.brand_menu_id];
    if (!brand) continue;

    // Apply brand filter if specified
    if (BRAND_FILTER && brand.slug !== BRAND_FILTER) continue;

    const normalized = normalizeDishName(item.name);
    if (normalized.length < 2) continue;

    const key = slugify(normalized);
    if (!key) continue;

    if (!map.has(key)) {
      map.set(key, {
        displayName: item.name.trim(),
        normalized,
        items: [],
        cuisines: new Set(),
        brandNames: new Set(),
      });
    }

    const entry = map.get(key);
    entry.items.push({ id: item.id, brandSlug: brand.slug, brandName: brand.name });
    entry.brandNames.add(brand.name);
    if (brand.cuisines) {
      for (const c of brand.cuisines) entry.cuisines.add(c);
    }
  }

  // Sort by most-shared items first (highest impact)
  return new Map([...map.entries()].sort((a, b) => b[1].items.length - a[1].items.length));
}

// ---------------------------------------------------------------------------
// Google Images scraping (via Playwright)
// ---------------------------------------------------------------------------
// Primary: Bing Image Search (less aggressive anti-bot than Google)
async function searchBingImages(query) {
  await rateLimitApi();

  browserSearchCount++;
  const needsRotation = browserSearchCount > BROWSER_ROTATE_EVERY;
  const page = await getBrowserPage(needsRotation);
  if (needsRotation) {
    console.log(`  [Browser rotated after ${BROWSER_ROTATE_EVERY} searches]`);
  }

  const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500 + Math.random() * 1000);

    const html = await page.content();

    // Check for actual blocking (not CSS classes like b_ov_blocked)
    if (html.includes('captcha') || html.includes('unusual traffic from your computer')) {
      console.warn('  Bing CAPTCHA detected! Rotating browser...');
      await closeBrowser();
      await new Promise(r => setTimeout(r, 60000));
      throw new Error("CAPTCHA_DETECTED");
    }

    return extractBingImageUrls(html);
  } catch (err) {
    if (err.message === "CAPTCHA_DETECTED") throw err;
    await closeBrowser();
    throw err;
  }
}

// Fallback: Google Image Search
async function searchGoogleImages(query) {
  await rateLimitApi();

  browserSearchCount++;
  const needsRotation = browserSearchCount > BROWSER_ROTATE_EVERY;
  const page = await getBrowserPage(needsRotation);

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&hl=en`;

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500 + Math.random() * 1000);

    // Handle consent banner
    try {
      const consentBtn = await page.$('button:has-text("Accept all"), button:has-text("I agree"), [aria-label="Accept all"]');
      if (consentBtn) {
        await consentBtn.click();
        await page.waitForTimeout(2000);
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1500);
      }
    } catch {}

    const html = await page.content();

    if (html.includes('captcha') || html.includes('unusual traffic')) {
      console.warn('  Google CAPTCHA detected!');
      await closeBrowser();
      throw new Error("CAPTCHA_DETECTED");
    }

    return extractGoogleImageUrls(html);
  } catch (err) {
    if (err.message === "CAPTCHA_DETECTED") throw err;
    await closeBrowser();
    throw err;
  }
}

function extractBingImageUrls(html) {
  // Bing stores original image URLs in "murl" JSON fields, with quotes as &quot;
  // Pattern matches both: "murl":"url" and &quot;murl&quot;:&quot;url&quot;
  const urls = [];

  // Match &quot; encoded format (most common in Bing HTML)
  const encodedPattern = /&quot;murl&quot;:&quot;(https?:\/\/[^&]+)&quot;/gi;
  let match;
  while ((match = encodedPattern.exec(html)) !== null) {
    const url = match[1].replace(/\\u002f/gi, '/');
    if (url.length < 500 && url.length > 20) urls.push(url);
  }

  // Also try literal quote format (in case Bing serves unencoded JSON)
  const literalPattern = /"murl"\s*:\s*"(https?:\/\/[^"]+)"/gi;
  while ((match = literalPattern.exec(html)) !== null) {
    const url = match[1].replace(/\\u002f/gi, '/');
    if (url.length < 500 && url.length > 20) urls.push(url);
  }

  const unique = [...new Set(urls)];

  trackApiCall();

  return unique.slice(0, 15).map(url => {
    let domain = '';
    try { domain = new URL(url).hostname; } catch {}
    return { link: url, displayLink: domain, image: {} };
  });
}

function extractGoogleImageUrls(html) {
  const urlPattern = /https?:\/\/[^"'\s\\]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s\\]*)*/gi;
  const allUrls = [...new Set(html.match(urlPattern) || [])];

  const imageUrls = allUrls.filter(u => {
    const lower = u.toLowerCase();
    return !lower.includes('google.com') &&
           !lower.includes('gstatic.com') &&
           !lower.includes('googleapis.com') &&
           !lower.includes('googleusercontent.com') &&
           !lower.includes('schema.org') &&
           u.length < 500 && u.length > 30;
  });

  trackApiCall();

  return imageUrls.slice(0, 15).map(url => {
    let domain = '';
    try { domain = new URL(url).hostname; } catch {}
    return { link: url, displayLink: domain, image: {} };
  });
}

function trackApiCall() {
  const today = new Date().toISOString().split("T")[0];
  if (progress.stats.lastApiCallDate !== today) {
    progress.stats.apiCallsToday = 0;
    progress.stats.lastApiCallDate = today;
  }
  progress.stats.apiCallsToday++;
  progress.stats.totalQueries++;
}

function buildSearchQuery(entry) {
  let query = `"${entry.displayName}" food`;

  // Add cuisine context
  if (entry.cuisines.size > 0) {
    const topCuisine = [...entry.cuisines][0];
    query += ` ${topCuisine}`;
  }

  // If only one brand, add brand name for specificity
  if (entry.brandNames.size === 1) {
    const brandName = [...entry.brandNames][0];
    // Only add brand name if the dish name doesn't already contain it
    if (!entry.normalized.includes(brandName.toLowerCase())) {
      query += ` ${brandName}`;
    }
  } else {
    query += " Singapore";
  }

  return query;
}

// ---------------------------------------------------------------------------
// Image scoring
// ---------------------------------------------------------------------------
const PREFERRED_DOMAINS = [
  "deliveroo", "grab", "foodpanda", "burpple", "hungrygowhere",
  "eatbook", "sethlui", "danielfooddiary", "ladyironchef",
  "misstamchiak", "thesmartlocal",
];

const BLOCKED_DOMAINS = [
  "shutterstock", "istockphoto", "alamy", "dreamstime", "123rf",
  "gettyimages", "depositphotos", "bigstock", "pinterest",
  "vectorstock", "canstockphoto",
];

function scoreImageResult(result) {
  let score = 50;

  const link = result.link || "";
  const domain = (result.displayLink || "").toLowerCase();

  // Domain reputation
  if (BLOCKED_DOMAINS.some(d => domain.includes(d))) return 0;
  if (PREFERRED_DOMAINS.some(d => domain.includes(d))) score += 15;

  // File type preference
  if (link.match(/\.(jpg|jpeg|webp)(\?|$)/i)) score += 5;
  if (link.match(/\.(gif|svg|bmp)(\?|$)/i)) score -= 10;

  // Prefer shorter URLs (less likely to be thumbnails)
  if (link.length < 150) score += 5;
  else if (link.length > 300) score -= 5;

  // Boost food-related domains
  const foodDomains = ['food', 'eat', 'recipe', 'cook', 'menu', 'restaurant', 'delivery', 'cuisine'];
  if (foodDomains.some(d => domain.includes(d))) score += 10;

  return score;
}

function selectBestImages(results) {
  return results
    .map(r => ({ result: r, score: scoreImageResult(r) }))
    .filter(s => s.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score);
}

// ---------------------------------------------------------------------------
// Download image
// ---------------------------------------------------------------------------
async function downloadImage(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await rateLimitDownload();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; BFW-ImageCache/1.0)" },
      });
      clearTimeout(timeout);

      if (!res.ok) {
        if (attempt === 0) { await new Promise(r => setTimeout(r, 2000)); continue; }
        return null;
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get("content-type") || "image/jpeg";

      if (buffer.length < 1024) return null;
      if (buffer.length > 5 * 1024 * 1024) return null;

      // Verify dimensions with sharp
      try {
        const metadata = await sharp(buffer).metadata();
        if (!metadata.width || !metadata.height || metadata.width < 200 || metadata.height < 200) {
          if (attempt === 0) { await new Promise(r => setTimeout(r, 500)); continue; }
          return null;
        }
        // Return dimensions too for logging
        return { buffer, contentType, width: metadata.width, height: metadata.height };
      } catch {
        // sharp failed - probably not a valid image
        if (attempt === 0) continue;
        return null;
      }
    } catch {
      if (attempt === 0) { await new Promise(r => setTimeout(r, 2000)); continue; }
      return null;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Upload to Supabase Storage
// ---------------------------------------------------------------------------
async function uploadToStorage(storagePath, buffer, contentType) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: true });

  if (error) throw error;
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

// ---------------------------------------------------------------------------
// Update database
// ---------------------------------------------------------------------------
async function updateItemsWithImage(itemIds, cdnUrl, sourceUrl) {
  const BATCH_SIZE = 100;
  let updated = 0;

  for (let i = 0; i < itemIds.length; i += BATCH_SIZE) {
    const batch = itemIds.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("menu_items")
      .update({ original_image_url: sourceUrl, cdn_image_url: cdnUrl })
      .in("id", batch);

    if (error) {
      console.warn(`  DB update error: ${error.message}`);
    } else {
      updated += batch.length;
    }
  }

  return updated;
}

// ---------------------------------------------------------------------------
// Process a single dish entry
// ---------------------------------------------------------------------------
async function processDish(slug, entry) {
  const query = buildSearchQuery(entry);

  // Search Bing Images (primary), fall back to Google
  let results = [];
  try {
    results = await searchBingImages(query);
  } catch (err) {
    if (err.message === "CAPTCHA_DETECTED") throw err;
    // Bing failed, try Google
  }

  if (results.length === 0) {
    // Fallback: simplified query on Bing
    const simpleQuery = `${entry.displayName} food photo`;
    try {
      results = await searchBingImages(simpleQuery);
    } catch {}
  }

  if (results.length === 0) {
    return { status: "no_results", query };
  }

  // Score and rank
  const scored = selectBestImages(results);
  if (scored.length === 0) {
    return { status: "no_suitable", query, bestRawScore: scoreImageResult(results[0]) };
  }

  if (DRY_RUN) {
    const best = scored[0];
    return {
      status: "dry-run",
      query,
      bestScore: best.score,
      bestUrl: best.result.link,
      bestDomain: best.result.displayLink,
      dimensions: `N/A`,
    };
  }

  // Try top 3 results for download
  for (let i = 0; i < Math.min(3, scored.length); i++) {
    const candidate = scored[i];
    const imageData = await downloadImage(candidate.result.link);
    if (!imageData) continue;

    // Resize to max 800px
    let finalBuffer = imageData.buffer;
    try {
      const meta = await sharp(imageData.buffer).metadata();
      if (meta.width > 800 || meta.height > 800) {
        finalBuffer = await sharp(imageData.buffer)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
      }
    } catch {}

    // Upload to storage - sanitize content type (strip params, fix image/jpg -> image/jpeg)
    let cleanContentType = (imageData.contentType || "image/jpeg").split(";")[0].trim();
    if (cleanContentType === "image/jpg") cleanContentType = "image/jpeg";
    const ext = getExtension(cleanContentType, candidate.result.link, finalBuffer);
    const storagePath = `_search/${slug}/${slug}.${ext}`;

    try {
      const cdnUrl = await uploadToStorage(storagePath, finalBuffer, cleanContentType);
      const itemIds = entry.items.map(i => i.id);
      const updated = await updateItemsWithImage(itemIds, cdnUrl, candidate.result.link);

      progress.stats.totalDownloaded++;
      progress.stats.totalItemsUpdated += updated;

      return {
        status: "success",
        query,
        cdnUrl,
        sourceUrl: candidate.result.link,
        score: candidate.score,
        itemCount: updated,
        size: finalBuffer.length,
      };
    } catch (err) {
      console.warn(`  Upload failed: ${err.message}`);
      continue;
    }
  }

  return { status: "download_failed", query };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("=== Google Image Search for Menu Items ===");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
  if (BRAND_FILTER) console.log(`Brand filter: ${BRAND_FILTER}`);
  if (LIMIT) console.log(`Limit: ${LIMIT} unique dish names`);
  console.log();

  // 1. Fetch items and brand info
  console.log("Fetching items without images...");
  const [items, brandMap] = await Promise.all([
    fetchItemsWithoutImages(),
    fetchBrandInfo(),
  ]);
  console.log(`Found ${items.length} items without images`);

  // 2. Deduplicate
  const dedupMap = buildDeduplicationMap(items, brandMap);
  console.log(`Deduplicated to ${dedupMap.size} unique dish names`);

  // 3. Filter out completed/failed
  const toProcess = [...dedupMap.entries()]
    .filter(([slug]) => !progress.completed[slug] && !progress.failed[slug]);
  console.log(`${toProcess.length} remaining (${Object.keys(progress.completed).length} already done, ${Object.keys(progress.failed).length} failed)`);

  // Apply limit
  const limited = LIMIT > 0 ? toProcess.slice(0, LIMIT) : toProcess;
  if (LIMIT > 0) console.log(`Processing first ${limited.length} entries`);
  console.log();

  // 4. Process
  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  let noResults = 0;
  let captchaCount = 0;
  const startTime = Date.now();

  for (const [slug, entry] of limited) {
    try {
      const result = await processDish(slug, entry);

      if (result.status === "success" || result.status === "dry-run") {
        succeeded++;
        progress.completed[slug] = {
          cdnUrl: result.cdnUrl || "(dry-run)",
          sourceUrl: result.sourceUrl || result.bestUrl,
          query: result.query,
          itemCount: entry.items.length,
          score: result.score || result.bestScore,
          timestamp: new Date().toISOString(),
        };

        if (DRY_RUN) {
          console.log(`  [OK] "${entry.displayName}" → score=${result.bestScore} ${result.bestDomain} (${result.dimensions})`);
        }
      } else if (result.status === "no_results" || result.status === "no_suitable") {
        noResults++;
        progress.failed[slug] = {
          reason: result.status,
          query: result.query,
          timestamp: new Date().toISOString(),
        };
      } else {
        failed++;
        progress.failed[slug] = {
          reason: result.status,
          query: result.query,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (err) {
      if (err.message === "QUOTA_EXCEEDED") {
        console.log("\nGoogle API quota exceeded. Run again tomorrow to continue.");
        break;
      }
      if (err.message === "CAPTCHA_DETECTED") {
        captchaCount++;
        if (captchaCount >= 3) {
          console.log("\n3 CAPTCHAs in this run. Waiting 30 minutes before continuing...");
          saveProgress(progress);
          await closeBrowser();
          await new Promise(r => setTimeout(r, 30 * 60 * 1000));
          captchaCount = 0;
        } else {
          console.log(`\nCAPTCHA #${captchaCount}. Waiting 5 minutes, then continuing with fresh browser...`);
          saveProgress(progress);
          await closeBrowser();
          await new Promise(r => setTimeout(r, 5 * 60 * 1000));
        }
        // Don't mark as failed - will retry on next run if we break
        continue;
      }
      failed++;
      progress.failed[slug] = { reason: err.message, timestamp: new Date().toISOString() };
    }

    processed++;

    // Save progress every 10 items
    if (processed % 10 === 0) {
      saveProgress(progress);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = (processed / ((Date.now() - startTime) / 1000)).toFixed(1);
      const eta = limited.length > 0 ? (((limited.length - processed) / (processed / ((Date.now() - startTime) / 1000))) / 60).toFixed(0) : '?';
      console.log(
        `[${processed}/${limited.length}] ok=${succeeded} fail=${failed} noResult=${noResults} ` +
        `elapsed=${elapsed}s rate=${rate}/s apiCalls=${progress.stats.apiCallsToday} ETA=${eta}min`
      );
    }

    // Cooldown break every 50 searches to avoid detection
    if (processed % 50 === 0 && processed < limited.length) {
      const cooldown = 180 + Math.random() * 120; // 3-5 min break
      console.log(`  Cooldown: pausing ${cooldown.toFixed(0)}s after ${processed} searches...`);
      saveProgress(progress);
      await closeBrowser(); // Fresh browser after each cooldown
      await new Promise(r => setTimeout(r, cooldown * 1000));
    }
  }

  // Final save
  saveProgress(progress);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n=== Summary ===");
  console.log(`Processed: ${processed}`);
  console.log(`Succeeded: ${succeeded}`);
  console.log(`No results: ${noResults}`);
  console.log(`Failed: ${failed}`);
  console.log(`Time: ${elapsed}s`);
  console.log(`API calls today: ${progress.stats.apiCallsToday}`);
  console.log(`Total items updated: ${progress.stats.totalItemsUpdated}`);

  await closeBrowser();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  saveProgress(progress);
  closeBrowser().catch(() => {});
  process.exit(1);
});
