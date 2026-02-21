/**
 * Vision-based Menu Scraper (Playwright + Claude Vision API)
 *
 * Takes screenshots of restaurant menu pages and uses Claude Vision to extract
 * structured menu data. Designed for the ~197 brands where the DOM-based scraper
 * failed (image-based menus, PDFs, JS-heavy SPAs).
 *
 * Usage:
 *   node scripts/scrape-menus-vision.mjs                 # Scrape all brands with 0 menu items
 *   node scripts/scrape-menus-vision.mjs --brand subway  # Scrape specific brand by slug
 *   node scripts/scrape-menus-vision.mjs --limit 10      # Limit number of brands to process
 *   node scripts/scrape-menus-vision.mjs --dry-run       # Don't save to DB, just print results
 */

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// === Config ===
const PAGE_LOAD_TIMEOUT = 30_000;
const MENU_PAGE_TIMEOUT = 20_000;
const DELAY_BETWEEN_BRANDS_MS = 2_000;
const DELAY_BETWEEN_CLAUDE_CALLS_MS = 2_000;
const MAX_SCREENSHOTS = 8;
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 800;
const CONTEXT_ROTATE_EVERY = 15;
const VISION_MODEL = "claude-haiku-4-5-20251001";
const PROGRESS_FILE = "/Users/haoming/Desktop/bestfoodwhere/scripts/.vision-progress.json";
const SCREENSHOT_DIR = "/Users/haoming/Desktop/bestfoodwhere/scripts/.vision-screenshots";

// === Parse CLI args ===
const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(`--${name}`);
  return i > -1 ? args[i + 1] : null;
};
const hasFlag = (name) => args.includes(`--${name}`);
const DRY_RUN = hasFlag("dry-run");
const BRAND_FILTER = getArg("brand");
const LIMIT = parseInt(getArg("limit") || "0") || 0;

// === Load env ===
const envFile = readFileSync(
  "/Users/haoming/Desktop/bestfoodwhere/.env.local",
  "utf8"
);
const getEnv = (key) => {
  const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`));
  return m?.[1]?.replace(/^"|"$/g, "");
};

// === Supabase client ===
const supabase = createClient(
  getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  getEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } }
);

// === Anthropic client ===
const anthropicApiKey = getEnv("ANTHROPIC_API_KEY");
if (!anthropicApiKey) {
  console.error(
    "ERROR: ANTHROPIC_API_KEY not found in .env.local\n" +
      "Add it to /Users/haoming/Desktop/bestfoodwhere/.env.local:\n" +
      '  ANTHROPIC_API_KEY="sk-ant-..."\n'
  );
  process.exit(1);
}
const anthropic = new Anthropic({
  apiKey: anthropicApiKey,
});

// === Social media domains to exclude ===
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
    return SOCIAL_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith("." + d)
    );
  } catch {
    return false;
  }
}

// === Menu link patterns ===
const MENU_LINK_PATTERNS = [
  "/menu",
  "/food-menu",
  "/our-menu",
  "/food",
  "/our-food",
  "/order",
  "/menus",
  "/dine",
  "/eat",
  "/dining",
  "/offerings",
  "/products",
  "/catalogue",
  "/price",
];

const MENU_LINK_TEXTS = [
  "menu",
  "our menu",
  "food menu",
  "view menu",
  "see menu",
  "full menu",
  "food",
  "dishes",
  "dine",
  "what we serve",
  "explore menu",
  "browse menu",
  "order now",
  "order online",
  "view our menu",
];

// === User agents ===
const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
];

// === Utilities ===
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadProgress() {
  if (existsSync(PROGRESS_FILE)) {
    return JSON.parse(readFileSync(PROGRESS_FILE, "utf8"));
  }
  return { completed: {}, failed: {}, noMenu: [] };
}

function saveProgress(progress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// ---------------------------------------------------------------------------
// Find and navigate to menu page
// ---------------------------------------------------------------------------

async function findMenuPage(page) {
  // Look for menu links in the page
  const menuLink = await page.evaluate(
    ({ patterns, texts }) => {
      const links = document.querySelectorAll("a[href]");
      for (const link of links) {
        const href = (link.getAttribute("href") || "").toLowerCase();
        const text = (link.textContent || "").toLowerCase().trim();

        // Check if href matches menu patterns
        for (const pattern of patterns) {
          if (href.includes(pattern)) {
            return link.getAttribute("href");
          }
        }

        // Check if link text mentions menu
        for (const menuText of texts) {
          if (text === menuText) {
            return link.getAttribute("href");
          }
        }
      }
      return null;
    },
    { patterns: MENU_LINK_PATTERNS, texts: MENU_LINK_TEXTS }
  );

  if (menuLink) {
    try {
      const currentUrl = page.url();
      const resolvedUrl = new URL(menuLink, currentUrl).href;

      // Only navigate if same domain
      const currentDomain = new URL(currentUrl).hostname;
      const targetDomain = new URL(resolvedUrl).hostname;

      if (
        targetDomain === currentDomain ||
        targetDomain.endsWith("." + currentDomain) ||
        currentDomain.endsWith("." + targetDomain)
      ) {
        await page.goto(resolvedUrl, {
          waitUntil: "networkidle",
          timeout: MENU_PAGE_TIMEOUT,
        }).catch(() => page.goto(resolvedUrl, { waitUntil: "domcontentloaded", timeout: MENU_PAGE_TIMEOUT }));
        await page.waitForTimeout(4000);
        return resolvedUrl;
      }
    } catch {
      // Navigation failed, continue with current page
    }
  }

  // Try common URL patterns directly
  const baseUrl = new URL(page.url());
  const menuPaths = ["/menu", "/our-menu", "/food-menu", "/menus", "/food", "/dine", "/dining"];

  for (const path of menuPaths) {
    const tryUrl = `${baseUrl.origin}${path}`;
    try {
      const response = await page.goto(tryUrl, {
        waitUntil: "networkidle",
        timeout: MENU_PAGE_TIMEOUT,
      }).catch(() => page.goto(tryUrl, { waitUntil: "domcontentloaded", timeout: MENU_PAGE_TIMEOUT }));
      if (response && response.status() !== 404 && response.status() !== 403) {
        await page.waitForTimeout(4000);
        return tryUrl;
      }
    } catch {
      // Page doesn't exist
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Detect PDF menu links
// ---------------------------------------------------------------------------

async function findPdfLinks(page) {
  return await page.evaluate(() => {
    const links = document.querySelectorAll("a[href]");
    const pdfs = [];
    for (const link of links) {
      const href = link.getAttribute("href") || "";
      if (href.toLowerCase().endsWith(".pdf")) {
        const text = (link.textContent || "").trim();
        try {
          const resolved = new URL(href, window.location.href).href;
          pdfs.push({ url: resolved, text });
        } catch {
          pdfs.push({ url: href, text });
        }
      }
    }
    return pdfs;
  });
}

// ---------------------------------------------------------------------------
// Extract menu from PDF using Claude's native PDF support
// ---------------------------------------------------------------------------

async function extractMenuFromPdf(pdfUrl, brandName) {
  try {
    console.log(`    Downloading PDF: ${pdfUrl}`);
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching PDF`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Limit PDF size to 25MB
    if (buffer.length > 25 * 1024 * 1024) {
      console.log(`    PDF too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB), skipping`);
      return [];
    }

    const base64Data = buffer.toString("base64");

    const claudeResponse = await anthropic.messages.create({
      model: VISION_MODEL,
      max_tokens: 16000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Restaurant: ${brandName}\n\n${VISION_PROMPT}`,
            },
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    const responseText = claudeResponse.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    return parseVisionResponse(responseText);
  } catch (err) {
    console.log(`    PDF extraction error: ${err.message}`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Capture screenshots with scrolling
// ---------------------------------------------------------------------------

async function captureMenuScreenshots(page, maxScreenshots = MAX_SCREENSHOTS) {
  const screenshots = [];
  const viewportHeight = VIEWPORT_HEIGHT;

  // Close cookie banners, modals, etc.
  await dismissOverlays(page);

  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  const numScreenshots = Math.min(
    Math.ceil(pageHeight / viewportHeight),
    maxScreenshots
  );

  for (let i = 0; i < numScreenshots; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * viewportHeight);
    await page.waitForTimeout(1500); // Wait longer for lazy-loaded images and JS rendering
    const buf = await page.screenshot({ type: "jpeg", quality: 85 });
    screenshots.push(buf);
  }

  return screenshots;
}

// ---------------------------------------------------------------------------
// Dismiss overlays (cookie banners, popups, etc.)
// ---------------------------------------------------------------------------

async function dismissOverlays(page) {
  try {
    await page.evaluate(() => {
      // Common cookie / consent banner selectors
      const selectors = [
        '[class*="cookie"] button',
        '[class*="consent"] button',
        '[class*="Cookie"] button',
        '[class*="Consent"] button',
        '[id*="cookie"] button',
        '[id*="consent"] button',
        '[class*="popup"] button[class*="close"]',
        '[class*="modal"] button[class*="close"]',
        '[class*="overlay"] button[class*="close"]',
        'button[aria-label="Close"]',
        'button[aria-label="close"]',
        'button[aria-label="Accept"]',
        'button[aria-label="Accept cookies"]',
        'button[aria-label="Accept all"]',
      ];

      for (const sel of selectors) {
        const btns = document.querySelectorAll(sel);
        for (const btn of btns) {
          const text = (btn.textContent || "").toLowerCase().trim();
          if (
            text.includes("accept") ||
            text.includes("ok") ||
            text.includes("got it") ||
            text.includes("agree") ||
            text.includes("close") ||
            text.includes("dismiss") ||
            text === "x" ||
            text === ""
          ) {
            btn.click();
          }
        }
      }
    });
  } catch {
    // Ignore errors from overlay dismissal
  }
  await page.waitForTimeout(500);
}

// ---------------------------------------------------------------------------
// Claude Vision extraction
// ---------------------------------------------------------------------------

const VISION_PROMPT = `You are extracting menu items from a restaurant menu image. Extract ALL visible menu items with:
- Item name (exactly as written)
- Description (if visible, otherwise empty string)
- Price (numeric only, in SGD, without $ sign. e.g. 12.90 not $12.90)
- Category/section name (group items under their menu section heading)

Return ONLY valid JSON in this exact format:
{"categories": [{"name": "Category Name", "items": [{"name": "Item Name", "description": "Description or empty string", "price": 12.90}]}]}

Rules:
- If no menu items are visible, return {"categories": []}
- Do not invent items. Only extract what is clearly visible.
- If a price is not visible for an item, set price to null.
- Combine items from all images into a single coherent menu structure.
- If the same category appears across multiple images, merge items into one category.
- Prices should be numbers (12.90) not strings ("$12.90").
- Keep descriptions concise (under 200 chars).`;

async function extractMenuWithVision(screenshots, brandName) {
  // Build the content array with images
  const content = [];

  content.push({
    type: "text",
    text: `Restaurant: ${brandName}\n\n${VISION_PROMPT}`,
  });

  for (let i = 0; i < screenshots.length; i++) {
    const base64 = screenshots[i].toString("base64");
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: base64,
      },
    });
    if (screenshots.length > 1) {
      content.push({
        type: "text",
        text: `(Screenshot ${i + 1} of ${screenshots.length})`,
      });
    }
  }

  const response = await anthropic.messages.create({
    model: VISION_MODEL,
    max_tokens: 16000,
    messages: [
      {
        role: "user",
        content,
      },
    ],
  });

  // Extract text from response
  const responseText = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  return responseText;
}

function parseVisionResponse(responseText) {
  // Try to extract JSON from the response
  // Claude may wrap JSON in markdown code blocks
  let jsonStr = responseText;

  // Remove markdown code fences if present
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  // Try to find JSON object in the text
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON object found in Claude response");
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    // Attempt to repair truncated JSON by closing open brackets
    let repaired = jsonMatch[0];
    // Count open/close brackets
    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    // Trim trailing incomplete entries (text after last complete item)
    repaired = repaired.replace(/,\s*\{[^}]*$/, "");
    repaired = repaired.replace(/,\s*"[^"]*$/, "");
    // Close any remaining open brackets
    for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += "]";
    for (let i = 0; i < openBraces - closeBraces; i++) repaired += "}";
    try {
      parsed = JSON.parse(repaired);
    } catch {
      throw new Error(e.message);
    }
  }

  if (!parsed.categories || !Array.isArray(parsed.categories)) {
    throw new Error("Invalid response structure: missing categories array");
  }

  // Validate and clean the data
  const categories = [];
  for (const cat of parsed.categories) {
    if (!cat.name || !Array.isArray(cat.items)) continue;

    const items = [];
    for (const item of cat.items) {
      if (!item.name || typeof item.name !== "string") continue;

      const cleanItem = {
        name: item.name.trim().slice(0, 200),
        description:
          item.description && typeof item.description === "string"
            ? item.description.trim().slice(0, 500)
            : null,
        price: null,
        priceText: null,
        image: null,
      };

      // Parse price
      if (item.price !== null && item.price !== undefined) {
        const priceNum = parseFloat(item.price);
        if (!isNaN(priceNum) && priceNum > 0 && priceNum < 10000) {
          cleanItem.price = priceNum;
          cleanItem.priceText = `$${priceNum.toFixed(2)}`;
        }
      }

      items.push(cleanItem);
    }

    if (items.length > 0) {
      categories.push({
        name: cat.name.trim().slice(0, 100),
        items,
      });
    }
  }

  return categories;
}

// ---------------------------------------------------------------------------
// Save to Supabase (matching existing scraper pattern)
// ---------------------------------------------------------------------------

async function saveToSupabase(brand, categories) {
  // 1. Delete existing menu data for this brand
  await supabase.from("menu_items").delete().eq("brand_menu_id", brand.id);
  await supabase
    .from("menu_categories")
    .delete()
    .eq("brand_menu_id", brand.id);

  // 2. Insert categories and items
  let totalItems = 0;
  let hasPrices = false;

  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci];

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
      if (item.price) hasPrices = true;
      totalItems++;

      return {
        brand_menu_id: brand.id,
        category_id: catRow.id,
        name: item.name,
        description: item.description || null,
        price: item.priceText,
        price_numeric: item.price,
        original_image_url: item.image || null,
        sort_order: idx,
      };
    });

    if (itemRows.length > 0) {
      const { error: itemError } = await supabase
        .from("menu_items")
        .insert(itemRows);
      if (itemError) {
        console.log(`    Warning: Items insert error: ${itemError.message}`);
      }
    }
  }

  // 3. Update brand_menus
  await supabase
    .from("brand_menus")
    .update({
      menu_item_count: totalItems,
      has_images: false,
      has_prices: hasPrices,
      scrape_status: "completed",
      scrape_source: "vision",
      last_scraped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", brand.id);

  return totalItems;
}

// ---------------------------------------------------------------------------
// Detect 404 / error pages
// ---------------------------------------------------------------------------

async function isErrorPage(page) {
  const text = await page.evaluate(() => {
    const body = document.body?.innerText?.toLowerCase() || "";
    const title = document.title?.toLowerCase() || "";
    const combined = title + " " + body.slice(0, 2000);
    return combined;
  });
  const errorPatterns = [
    "page not found", "404", "doesn't seem to exist",
    "page doesn't exist", "not be found", "no longer available",
    "this page isn't available", "error 404", "page cannot be found",
  ];
  return errorPatterns.some((p) => text.includes(p));
}

// ---------------------------------------------------------------------------
// Process a single brand
// ---------------------------------------------------------------------------

async function processBrand(page, brand) {
  const url = brand.website_url;

  // 1. Navigate to website — try networkidle first for JS-heavy sites, fall back to domcontentloaded
  try {
    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: PAGE_LOAD_TIMEOUT,
    });
  } catch (err) {
    if (err.message.includes("net::ERR_")) {
      throw new Error(`Cannot reach website: ${err.message}`);
    }
    // Timeout is OK — page may still be usable, try domcontentloaded fallback
    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: PAGE_LOAD_TIMEOUT,
      });
    } catch (err2) {
      if (err2.message.includes("net::ERR_")) {
        throw new Error(`Cannot reach website: ${err2.message}`);
      }
    }
  }

  // Extra wait for JS-heavy SPAs to render content
  await page.waitForTimeout(5000);

  // 2. Find the menu page
  let menuPageUrl = null;
  try {
    menuPageUrl = await findMenuPage(page);
  } catch {
    // Stay on current page
  }

  // Check if we landed on a 404 page
  if (await isErrorPage(page)) {
    console.log(`  Menu page is a 404/error page, trying homepage instead`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: PAGE_LOAD_TIMEOUT });
    await page.waitForTimeout(3000);
    menuPageUrl = null;
  }

  const currentPageUrl = page.url();
  console.log(
    `  Menu page: ${menuPageUrl || currentPageUrl + " (homepage)"}`
  );

  // 3. Check for PDF links
  const pdfLinks = await findPdfLinks(page);
  if (pdfLinks.length > 0) {
    console.log(`  PDF menus found: ${pdfLinks.length}`);
    for (const pdf of pdfLinks.slice(0, 3)) {
      console.log(`    - ${pdf.url} (${pdf.text || "no text"})`);
    }
  }

  // 4. Try PDF extraction first (usually more complete than screenshots)
  let categories = [];
  if (pdfLinks.length > 0) {
    console.log(`  Trying PDF extraction...`);
    for (const pdf of pdfLinks.slice(0, 3)) {
      try {
        await sleep(DELAY_BETWEEN_CLAUDE_CALLS_MS);
        const pdfCategories = await extractMenuFromPdf(pdf.url, brand.name);
        if (pdfCategories.length > 0) {
          categories.push(...pdfCategories);
          console.log(`  PDF "${pdf.text || 'menu'}": ${pdfCategories.reduce((s,c) => s + c.items.length, 0)} items`);
        }
      } catch (err) {
        console.log(`  PDF extraction failed: ${err.message}`);
      }
    }
  }

  // 5. If PDF didn't yield enough items, try screenshots too
  if (categories.reduce((s, c) => s + c.items.length, 0) < 3) {
    const screenshots = await captureMenuScreenshots(page);
    console.log(`  Screenshots: ${screenshots.length}`);

    if (screenshots.length > 0) {
      // Optionally save screenshots for debugging
      if (hasFlag("save-screenshots")) {
        mkdirSync(SCREENSHOT_DIR, { recursive: true });
        for (let i = 0; i < screenshots.length; i++) {
          const filePath = join(SCREENSHOT_DIR, `${brand.slug}-${i + 1}.jpg`);
          writeFileSync(filePath, screenshots[i]);
        }
      }

      await sleep(DELAY_BETWEEN_CLAUDE_CALLS_MS);
      const responseText = await extractMenuWithVision(screenshots, brand.name);
      const screenshotCategories = parseVisionResponse(responseText);

      // If screenshots found more items than PDFs, use screenshots instead
      const screenshotItems = screenshotCategories.reduce((s, c) => s + c.items.length, 0);
      const pdfItems = categories.reduce((s, c) => s + c.items.length, 0);

      if (screenshotItems > pdfItems) {
        categories = screenshotCategories;
      }
    }
  }

  // 6. Results
  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  return {
    categories,
    totalItems,
    menuPageUrl: menuPageUrl || currentPageUrl,
    pdfLinks,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Vision-based Menu Scraper (Playwright + Claude) ===\n");
  console.log(`Model: ${VISION_MODEL}`);
  console.log(`Viewport: ${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT}`);
  console.log(`Max screenshots per brand: ${MAX_SCREENSHOTS}`);
  if (DRY_RUN) console.log("*** DRY RUN - no DB writes ***");
  console.log("");

  // Get brands to process
  let query;
  if (BRAND_FILTER) {
    query = supabase
      .from("brand_menus")
      .select("id, slug, name, website_url, social_links")
      .eq("slug", BRAND_FILTER);
  } else {
    query = supabase
      .from("brand_menus")
      .select("id, slug, name, website_url, social_links")
      .eq("is_active", true)
      .eq("menu_item_count", 0)
      .not("website_url", "is", null);
  }

  const { data: brands, error } = await query.order("name");
  if (error) {
    console.error("DB error:", error);
    process.exit(1);
  }

  // Filter out social media URLs
  const filteredBrands = (brands || []).filter(
    (b) => b.website_url && !isSocialUrl(b.website_url)
  );

  // Load progress to skip already-processed brands
  const progress = loadProgress();
  let toProcess = filteredBrands.filter(
    (b) => !progress.completed[b.slug] && !progress.noMenu.includes(b.slug)
  );

  if (LIMIT > 0) toProcess = toProcess.slice(0, LIMIT);

  console.log(
    `Brands to process: ${toProcess.length} (of ${filteredBrands.length} with website URLs)`
  );
  console.log(
    `Already completed: ${Object.keys(progress.completed).length}`
  );
  console.log(`No menu found previously: ${progress.noMenu.length}`);
  console.log(
    `Previously failed: ${Object.keys(progress.failed).length}\n`
  );

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
      viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
      ignoreHTTPSErrors: true,
    });
    const pg = await ctx.newPage();

    // Block heavy resources to speed up loading (but keep images for vision!)
    await pg.route("**/*", (route) => {
      const resourceType = route.request().resourceType();
      if (resourceType === "media" || resourceType === "font") {
        route.abort();
      } else {
        route.continue();
      }
    });

    return { ctx, pg };
  }

  let { ctx: currentContext, pg: page } = await createFreshContext();
  let contextCount = 0;

  const stats = {
    processed: 0,
    found: 0,
    totalItems: 0,
    noMenu: 0,
    errors: 0,
    pdfFound: 0,
  };

  for (let i = 0; i < toProcess.length; i++) {
    const brand = toProcess[i];
    console.log(
      `\n[${i + 1}/${toProcess.length}] ${brand.name} (${brand.slug})`
    );
    console.log(`  URL: ${brand.website_url}`);

    // Rotate browser context periodically
    if (contextCount >= CONTEXT_ROTATE_EVERY) {
      console.log(
        `  Rotating browser context (after ${contextCount} sites)`
      );
      await currentContext.close();
      await sleep(1000);
      ({ ctx: currentContext, pg: page } = await createFreshContext());
      contextCount = 0;
    }

    try {
      const result = await processBrand(page, brand);
      stats.processed++;
      contextCount++;

      if (result.pdfLinks.length > 0) {
        stats.pdfFound++;
      }

      if (result.totalItems === 0) {
        console.log(`  No menu items extracted by Claude Vision`);
        stats.noMenu++;
        progress.noMenu.push(brand.slug);
        saveProgress(progress);

        if (!DRY_RUN) {
          await supabase
            .from("brand_menus")
            .update({
              scrape_status: "vision_no_items",
              last_scraped_at: new Date().toISOString(),
            })
            .eq("id", brand.id);
        }
        continue;
      }

      console.log(
        `  Claude extracted: ${result.totalItems} items in ${result.categories.length} categories`
      );
      stats.found++;
      stats.totalItems += result.totalItems;

      if (!DRY_RUN) {
        const savedItems = await saveToSupabase(brand, result.categories);
        console.log(`  Saved ${savedItems} items to Supabase`);
      } else {
        // Print sample in dry-run mode
        for (const cat of result.categories.slice(0, 3)) {
          console.log(
            `    Category: ${cat.name} (${cat.items.length} items)`
          );
          for (const item of cat.items.slice(0, 5)) {
            const priceStr = item.price ? ` $${item.price.toFixed(2)}` : "";
            const descStr = item.description
              ? ` — ${item.description.slice(0, 60)}...`
              : "";
            console.log(`      - ${item.name}${priceStr}${descStr}`);
          }
          if (cat.items.length > 5) {
            console.log(`      ... and ${cat.items.length - 5} more`);
          }
        }
        if (result.categories.length > 3) {
          console.log(
            `    ... and ${result.categories.length - 3} more categories`
          );
        }
      }

      progress.completed[brand.slug] = {
        items: result.totalItems,
        categories: result.categories.length,
        source: "vision",
        menuPageUrl: result.menuPageUrl,
        pdfLinks: result.pdfLinks.length,
        timestamp: new Date().toISOString(),
      };
      saveProgress(progress);
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      stats.errors++;
      stats.processed++;
      contextCount++;

      progress.failed[brand.slug] = {
        error: err.message,
        timestamp: new Date().toISOString(),
      };
      saveProgress(progress);

      if (!DRY_RUN) {
        try {
          await supabase
            .from("brand_menus")
            .update({
              scrape_status: "vision_failed",
              last_scraped_at: new Date().toISOString(),
            })
            .eq("id", brand.id);
        } catch {
          // Ignore DB update errors
        }
      }

      // If page crashed, create a fresh context
      if (
        err.message.includes("closed") ||
        err.message.includes("crash") ||
        err.message.includes("Target") ||
        err.message.includes("disposed")
      ) {
        console.log(`  Recovering with fresh browser context...`);
        try {
          await currentContext.close();
        } catch {}
        await sleep(2000);
        ({ ctx: currentContext, pg: page } = await createFreshContext());
        contextCount = 0;
      }
    }

    // Delay between brands
    if (i < toProcess.length - 1) {
      await sleep(DELAY_BETWEEN_BRANDS_MS);
    }

    // Print progress every 10 brands
    if ((i + 1) % 10 === 0) {
      console.log(
        `\n--- Progress: ${i + 1}/${toProcess.length} | Found: ${stats.found} | Items: ${stats.totalItems} | No menu: ${stats.noMenu} | Errors: ${stats.errors} | PDFs: ${stats.pdfFound} ---`
      );
    }
  }

  await currentContext.close();
  await browser.close();

  console.log("\n\n=== Final Summary ===");
  console.log(`Processed: ${stats.processed}`);
  console.log(`Found menus: ${stats.found}`);
  console.log(`Total items extracted: ${stats.totalItems}`);
  console.log(`No menu found: ${stats.noMenu}`);
  console.log(`Errors: ${stats.errors}`);
  console.log(`Brands with PDF menus: ${stats.pdfFound}`);
  if (stats.processed > 0) {
    console.log(
      `Hit rate: ${((stats.found / stats.processed) * 100).toFixed(1)}%`
    );
    if (stats.found > 0) {
      console.log(
        `Avg items per brand: ${(stats.totalItems / stats.found).toFixed(1)}`
      );
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
