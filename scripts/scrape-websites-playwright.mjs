/**
 * Website Menu Scraper (Playwright)
 *
 * Uses Playwright (Chromium) to visit restaurant websites and extract menu data.
 * This replaces the fetch+cheerio approach in 02-scrape-websites.ts which fails
 * on JavaScript-rendered SPAs.
 *
 * Usage:
 *   node scripts/scrape-websites-playwright.mjs                 # Scrape all brands with 0 menu items
 *   node scripts/scrape-websites-playwright.mjs --brand subway  # Scrape specific brand by slug
 *   node scripts/scrape-websites-playwright.mjs --limit 10      # Limit number of brands to process
 *   node scripts/scrape-websites-playwright.mjs --dry-run       # Don't save to DB, just print results
 */

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "fs";

// === Config ===
const PAGE_LOAD_TIMEOUT = 30000;
const MENU_PAGE_TIMEOUT = 20000;
const DELAY_BETWEEN_BRANDS_MS = 2000;
const CONTEXT_ROTATE_EVERY = 15;
const PROGRESS_FILE = "/Users/haoming/Desktop/bestfoodwhere/scripts/.website-progress.json";

// === Parse args ===
const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(`--${name}`);
  return i > -1 ? args[i + 1] : null;
};
const hasFlag = (name) => args.includes(`--${name}`);
const DRY_RUN = hasFlag("dry-run");
const BRAND_FILTER = getArg("brand");
const LIMIT = parseInt(getArg("limit") || "0") || 0;

// === Supabase ===
const envFile = readFileSync(
  "/Users/haoming/Desktop/bestfoodwhere/.env.local",
  "utf8"
);
const getEnv = (key) => {
  const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`));
  return m?.[1];
};
const supabase = createClient(
  getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  getEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } }
);

// === Progress tracking ===
function loadProgress() {
  if (existsSync(PROGRESS_FILE)) {
    return JSON.parse(readFileSync(PROGRESS_FILE, "utf8"));
  }
  return { completed: {}, failed: {}, noMenu: [] };
}

function saveProgress(progress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

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

// === User agents ===
const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
];

// === Price regex ===
const PRICE_RE = /(?:S?\$|SGD)\s*(\d{1,4}(?:\.\d{1,2})?)/g;

// === Menu link patterns ===
const MENU_LINK_PATTERNS = [
  "/menu",
  "/food-menu",
  "/our-menu",
  "/food",
  "/our-food",
  "/order",
  "/menus",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Strategy 1: JSON-LD structured data
// ---------------------------------------------------------------------------

async function extractJsonLdMenu(page) {
  return await page.evaluate(() => {
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    const categories = [];

    function processJsonLd(data) {
      if (!data || typeof data !== "object") return;

      if (Array.isArray(data)) {
        for (const entry of data) processJsonLd(entry);
        return;
      }

      // Restaurant with hasMenu
      if (data["@type"] === "Restaurant" && data.hasMenu) {
        processJsonLd(data.hasMenu);
      }

      // Menu type
      if (data["@type"] === "Menu" && data.hasMenuSection) {
        const sections = Array.isArray(data.hasMenuSection)
          ? data.hasMenuSection
          : [data.hasMenuSection];
        for (const section of sections) processJsonLd(section);
      }

      // MenuSection
      if (data["@type"] === "MenuSection") {
        const sectionName = data.name || "Menu";
        const menuItems = Array.isArray(data.hasMenuItem)
          ? data.hasMenuItem
          : data.hasMenuItem
            ? [data.hasMenuItem]
            : [];

        const items = [];
        for (const mi of menuItems) {
          if (mi["@type"] === "MenuItem" && mi.name) {
            let price = null;
            let priceText = null;
            if (mi.offers && mi.offers.price) {
              price = parseFloat(mi.offers.price);
              if (isNaN(price)) price = null;
              priceText = price ? `$${price.toFixed(2)}` : null;
            }
            items.push({
              name: String(mi.name).trim(),
              description: mi.description
                ? String(mi.description).slice(0, 500)
                : null,
              price,
              priceText,
              image: mi.image ? String(mi.image) : null,
            });
          }
        }

        if (items.length > 0) {
          categories.push({ name: sectionName, items });
        }
      }

      // Single MenuItem at top level
      if (data["@type"] === "MenuItem" && data.name) {
        let price = null;
        let priceText = null;
        if (data.offers && data.offers.price) {
          price = parseFloat(data.offers.price);
          if (isNaN(price)) price = null;
          priceText = price ? `$${price.toFixed(2)}` : null;
        }
        categories.push({
          name: "Menu",
          items: [
            {
              name: String(data.name).trim(),
              description: data.description
                ? String(data.description).slice(0, 500)
                : null,
              price,
              priceText,
              image: data.image ? String(data.image) : null,
            },
          ],
        });
      }
    }

    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent);
        processJsonLd(data);
      } catch {}
    }

    return categories;
  });
}

// ---------------------------------------------------------------------------
// Strategy 2: __NEXT_DATA__ (Next.js sites)
// ---------------------------------------------------------------------------

async function extractNextDataMenu(page) {
  return await page.evaluate(() => {
    const script = document.getElementById("__NEXT_DATA__");
    if (!script) return null;

    let data;
    try {
      data = JSON.parse(script.textContent);
    } catch {
      return null;
    }

    // Deep-search for menu-like arrays in the props
    const categories = [];
    const priceRe = /(?:S?\$|SGD)\s*(\d{1,4}(?:\.\d{1,2})?)/;

    function searchForMenuData(obj, depth = 0) {
      if (!obj || typeof obj !== "object" || depth > 8) return;

      // Check if this looks like a menu item array
      if (Array.isArray(obj) && obj.length >= 3) {
        const hasMenuItems = obj.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            item.name &&
            typeof item.name === "string" &&
            (item.price !== undefined ||
              item.priceText ||
              item.price_text ||
              item.priceInCents ||
              item.priceInMinorUnit)
        );

        if (hasMenuItems.length >= 3) {
          const items = hasMenuItems.map((item) => {
            let price = null;
            let priceText = null;

            if (typeof item.price === "number") {
              price = item.price > 100 ? item.price / 100 : item.price;
              priceText = `$${price.toFixed(2)}`;
            } else if (item.priceInCents) {
              price = item.priceInCents / 100;
              priceText = `$${price.toFixed(2)}`;
            } else if (item.priceInMinorUnit) {
              price = item.priceInMinorUnit / 100;
              priceText = `$${price.toFixed(2)}`;
            } else if (typeof item.price === "string") {
              const m = item.price.match(priceRe);
              if (m) {
                price = parseFloat(m[1]);
                priceText = item.price;
              }
            }

            return {
              name: String(item.name).trim(),
              description: item.description
                ? String(item.description).slice(0, 500)
                : null,
              price,
              priceText,
              image: item.image || item.imageUrl || item.photo || null,
            };
          });

          categories.push({
            name: "Menu",
            items,
          });
          return; // Found a match, stop searching this branch
        }
      }

      // Check if this is a category-like structure with items
      if (
        !Array.isArray(obj) &&
        obj.name &&
        typeof obj.name === "string" &&
        Array.isArray(obj.items) &&
        obj.items.length > 0
      ) {
        const hasNamedItems = obj.items.filter(
          (item) => item && item.name && typeof item.name === "string"
        );

        if (hasNamedItems.length >= 2) {
          const items = hasNamedItems.map((item) => {
            let price = null;
            let priceText = null;

            if (typeof item.price === "number") {
              price = item.price > 100 ? item.price / 100 : item.price;
              priceText = `$${price.toFixed(2)}`;
            } else if (typeof item.price === "string") {
              const m = item.price.match(priceRe);
              if (m) {
                price = parseFloat(m[1]);
                priceText = item.price;
              }
            }

            return {
              name: String(item.name).trim(),
              description: item.description
                ? String(item.description).slice(0, 500)
                : null,
              price,
              priceText,
              image: item.image || item.imageUrl || item.photo || null,
            };
          });

          categories.push({ name: obj.name, items });
        }
      }

      // Recurse
      const keys = Array.isArray(obj) ? obj.keys() : Object.keys(obj);
      for (const key of keys) {
        searchForMenuData(obj[key], depth + 1);
      }
    }

    searchForMenuData(data.props);

    return categories.length > 0 ? categories : null;
  });
}

// ---------------------------------------------------------------------------
// Strategy 3: DOM extraction - look for price patterns near item names
// ---------------------------------------------------------------------------

async function extractDomMenu(page) {
  return await page.evaluate(() => {
    const priceRe = /(?:S?\$|SGD)\s*(\d{1,4}(?:\.\d{1,2})?)/g;
    const categories = [];
    const seenItems = new Set();

    // ---- Sub-strategy 3a: Structured menu sections (h2/h3 + item blocks) ----
    const headings = document.querySelectorAll("h2, h3");

    for (const heading of headings) {
      const headingText = heading.textContent?.trim();
      if (!headingText || headingText.length > 80 || headingText.length < 2)
        continue;

      // Skip headings that are clearly not menu categories
      const skipWords = [
        "contact",
        "about",
        "follow",
        "subscribe",
        "copyright",
        "location",
        "address",
        "hours",
        "opening",
        "reservation",
        "book",
        "gallery",
        "news",
        "blog",
        "event",
        "career",
        "privacy",
        "terms",
        "faq",
        "testimonial",
        "review",
        "footer",
        "header",
        "navigation",
        "nav",
      ];
      const lowerHeading = headingText.toLowerCase();
      if (skipWords.some((w) => lowerHeading.includes(w))) continue;

      const items = [];
      const tag = heading.tagName.toLowerCase();

      // Walk siblings after the heading until we hit another heading of same level
      let sibling = heading.nextElementSibling;
      let safety = 0;

      while (sibling && safety < 200) {
        const sibTag = sibling.tagName?.toLowerCase();
        if (sibTag === tag || (tag === "h3" && sibTag === "h2")) break;

        const sibText = sibling.textContent?.trim() || "";
        if (sibText.length > 0 && sibText.length < 500) {
          // Look for price patterns in this sibling's subtree
          const priceMatches = [...sibText.matchAll(priceRe)];

          if (priceMatches.length > 0) {
            // Try to find item name: look for named sub-elements
            const nameEls = sibling.querySelectorAll(
              "h4, h5, h6, strong, b, .name, .title, [class*='name'], [class*='title'], [class*='item-name'], [class*='dish']"
            );

            if (nameEls.length > 0) {
              // Multiple named items within this sibling container
              for (const nameEl of nameEls) {
                const itemContainer =
                  nameEl.closest(
                    "li, .item, .menu-item, .food-item, .dish, [class*='item'], [class*='product'], tr, article, .card"
                  ) || nameEl.parentElement;
                const containerText = itemContainer?.textContent?.trim() || "";
                const containerPrices = [
                  ...containerText.matchAll(
                    /(?:S?\$|SGD)\s*(\d{1,4}(?:\.\d{1,2})?)/g
                  ),
                ];

                const name = nameEl.textContent?.trim();
                if (
                  name &&
                  name.length >= 2 &&
                  name.length <= 120 &&
                  !seenItems.has(name.toLowerCase())
                ) {
                  const priceStr = containerPrices[0]?.[0] || null;
                  const priceNum = containerPrices[0]?.[1]
                    ? parseFloat(containerPrices[0][1])
                    : null;

                  // Look for description
                  const descEl = itemContainer?.querySelector(
                    "p, .description, .desc, [class*='desc']"
                  );
                  let description = null;
                  if (descEl) {
                    const descText = descEl.textContent?.trim();
                    if (
                      descText &&
                      descText !== name &&
                      descText.length > 5 &&
                      descText.length < 500
                    ) {
                      description = descText;
                    }
                  }

                  // Look for image
                  const imgEl = itemContainer?.querySelector("img[src]");
                  const image = imgEl?.getAttribute("src") || null;

                  seenItems.add(name.toLowerCase());
                  items.push({
                    name,
                    description,
                    price: priceNum,
                    priceText: priceStr,
                    image,
                  });
                }
              }
            } else {
              // Single item — the sibling itself has price and name content
              let name = sibText.replace(
                /(?:S?\$|SGD)\s*\d{1,4}(?:\.\d{1,2})?/g,
                ""
              );
              name = name.replace(/[\n\r\t]+/g, " ").replace(/\s{2,}/g, " ").trim();
              name = name.replace(
                /^[^a-zA-Z0-9]+|[^a-zA-Z0-9)]+$/g,
                ""
              ).trim();

              if (
                name.length >= 2 &&
                name.length <= 120 &&
                !seenItems.has(name.toLowerCase())
              ) {
                const priceStr = priceMatches[0]?.[0] || null;
                const priceNum = priceMatches[0]?.[1]
                  ? parseFloat(priceMatches[0][1])
                  : null;

                const imgEl = sibling.querySelector("img[src]");
                const image = imgEl?.getAttribute("src") || null;

                seenItems.add(name.toLowerCase());
                items.push({
                  name,
                  description: null,
                  price: priceNum,
                  priceText: priceStr,
                  image,
                });
              }
            }
          }
        }

        sibling = sibling.nextElementSibling;
        safety++;
      }

      if (items.length > 0) {
        categories.push({ name: headingText, items });
      }
    }

    // ---- Sub-strategy 3b: CSS class-based menu sections ----
    if (
      categories.reduce((sum, c) => sum + c.items.length, 0) < 3
    ) {
      const menuSections = document.querySelectorAll(
        '.menu-section, .menu-category, .food-category, [class*="menu-group"], [class*="menu-section"], [class*="menu-category"], [class*="food-list"], [class*="menu-list"]'
      );

      for (const section of menuSections) {
        const headingEl = section.querySelector("h2, h3, h4, h5");
        const catName =
          headingEl?.textContent?.trim() || "Menu";
        if (catName.length > 80) continue;

        const items = [];
        const itemEls = section.querySelectorAll(
          '.menu-item, .food-item, .dish, [class*="menu-item"], [class*="food-item"], [class*="dish"], [class*="product"], li, tr, article'
        );

        for (const itemEl of itemEls) {
          const text = itemEl.textContent?.trim() || "";
          if (text.length > 500 || text.length < 3) continue;

          const prices = [
            ...text.matchAll(
              /(?:S?\$|SGD)\s*(\d{1,4}(?:\.\d{1,2})?)/g
            ),
          ];

          const nameEl = itemEl.querySelector(
            "h3, h4, h5, h6, strong, b, .name, .title, [class*='name'], [class*='title']"
          );
          let name = nameEl?.textContent?.trim() || "";

          if (!name) {
            name = text
              .replace(/(?:S?\$|SGD)\s*\d{1,4}(?:\.\d{1,2})?/g, "")
              .replace(/[\n\r\t]+/g, " ")
              .replace(/\s{2,}/g, " ")
              .trim();
            name = name.replace(
              /^[^a-zA-Z0-9]+|[^a-zA-Z0-9)]+$/g,
              ""
            ).trim();
          }

          if (
            name.length >= 2 &&
            name.length <= 120 &&
            !seenItems.has(name.toLowerCase())
          ) {
            const priceStr = prices[0]?.[0] || null;
            const priceNum = prices[0]?.[1]
              ? parseFloat(prices[0][1])
              : null;

            const descEl = itemEl.querySelector(
              "p, .description, .desc, [class*='desc']"
            );
            let description = null;
            if (descEl) {
              const dt = descEl.textContent?.trim();
              if (dt && dt !== name && dt.length > 5 && dt.length < 500) {
                description = dt;
              }
            }

            const imgEl = itemEl.querySelector("img[src]");
            const image = imgEl?.getAttribute("src") || null;

            seenItems.add(name.toLowerCase());
            items.push({
              name,
              description,
              price: priceNum,
              priceText: priceStr,
              image,
            });
          }
        }

        if (items.length > 0) {
          categories.push({ name: catName, items });
        }
      }
    }

    // ---- Sub-strategy 3c: Universal price-based scanning ----
    if (
      categories.reduce((sum, c) => sum + c.items.length, 0) < 3
    ) {
      const allItems = [];
      // Look for any element that contains both text and a price
      const candidates = document.querySelectorAll(
        '.menu-item, .food-item, .dish, [class*="menu-item"], [class*="food-item"], [class*="product"], [class*="dish"], li, article, .card, [class*="card"]'
      );

      for (const el of candidates) {
        const text = el.textContent?.trim() || "";
        if (text.length < 5 || text.length > 500) continue;

        const prices = [
          ...text.matchAll(
            /(?:S?\$|SGD)\s*(\d{1,4}(?:\.\d{1,2})?)/g
          ),
        ];
        if (prices.length === 0) continue;

        const nameEl = el.querySelector(
          "h3, h4, h5, h6, strong, b, .name, .title, [class*='name'], [class*='title']"
        );
        let name = nameEl?.textContent?.trim() || "";

        if (!name) {
          name = text
            .replace(/(?:S?\$|SGD)\s*\d{1,4}(?:\.\d{1,2})?/g, "")
            .replace(/[\n\r\t]+/g, " ")
            .replace(/\s{2,}/g, " ")
            .trim();
          name = name.replace(
            /^[^a-zA-Z0-9]+|[^a-zA-Z0-9)]+$/g,
            ""
          ).trim();
        }

        if (
          name.length >= 2 &&
          name.length <= 120 &&
          !seenItems.has(name.toLowerCase())
        ) {
          const priceStr = prices[0]?.[0] || null;
          const priceNum = prices[0]?.[1]
            ? parseFloat(prices[0][1])
            : null;

          const imgEl = el.querySelector("img[src]");
          const image = imgEl?.getAttribute("src") || null;

          seenItems.add(name.toLowerCase());
          allItems.push({
            name,
            description: null,
            price: priceNum,
            priceText: priceStr,
            image,
          });
        }
      }

      if (allItems.length > 0) {
        categories.push({ name: "Menu", items: allItems });
      }
    }

    return categories;
  });
}

// ---------------------------------------------------------------------------
// Find and navigate to menu page
// ---------------------------------------------------------------------------

async function findAndClickMenuLink(page) {
  // Look for menu links in the navigation or body
  const menuLink = await page.evaluate((patterns) => {
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
      if (
        text === "menu" ||
        text === "our menu" ||
        text === "food menu" ||
        text === "view menu" ||
        text === "see menu" ||
        text === "full menu"
      ) {
        return link.getAttribute("href");
      }
    }
    return null;
  }, MENU_LINK_PATTERNS);

  if (menuLink) {
    try {
      // Resolve relative URLs
      const currentUrl = page.url();
      const resolvedUrl = new URL(menuLink, currentUrl).href;

      // Only navigate if it's on the same domain
      const currentDomain = new URL(currentUrl).hostname;
      const targetDomain = new URL(resolvedUrl).hostname;

      if (
        targetDomain === currentDomain ||
        targetDomain.endsWith("." + currentDomain) ||
        currentDomain.endsWith("." + targetDomain)
      ) {
        await page.goto(resolvedUrl, {
          waitUntil: "domcontentloaded",
          timeout: MENU_PAGE_TIMEOUT,
        });
        // Wait for dynamic content
        await page.waitForTimeout(3000);
        return resolvedUrl;
      }
    } catch (err) {
      // Navigation failed, continue with current page
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main scraping function for a single brand
// ---------------------------------------------------------------------------

async function scrapeBrandWebsite(page, brand) {
  const url = brand.website_url;

  // Navigate to the website
  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: PAGE_LOAD_TIMEOUT,
    });
  } catch (err) {
    // Even if timeout, the page might have partially loaded
    if (err.message.includes("net::ERR_")) {
      throw new Error(`Cannot reach website: ${err.message}`);
    }
  }

  // Wait for JS rendering
  await page.waitForTimeout(4000);

  // --- Attempt extraction on homepage first ---
  let allCategories = [];

  // Strategy 1: JSON-LD
  const jsonLdCats = await extractJsonLdMenu(page);
  if (jsonLdCats && jsonLdCats.length > 0) {
    const totalItems = jsonLdCats.reduce((s, c) => s + c.items.length, 0);
    if (totalItems >= 3) {
      console.log(`    JSON-LD: ${totalItems} items found on homepage`);
      return {
        categories: jsonLdCats,
        totalItems,
        source: "json-ld",
        pageUrl: page.url(),
      };
    }
    allCategories.push(...jsonLdCats);
  }

  // Strategy 2: __NEXT_DATA__
  const nextDataCats = await extractNextDataMenu(page);
  if (nextDataCats && nextDataCats.length > 0) {
    const totalItems = nextDataCats.reduce((s, c) => s + c.items.length, 0);
    if (totalItems >= 3) {
      console.log(`    __NEXT_DATA__: ${totalItems} items found on homepage`);
      return {
        categories: nextDataCats,
        totalItems,
        source: "next-data",
        pageUrl: page.url(),
      };
    }
    allCategories.push(...nextDataCats);
  }

  // Strategy 3: DOM extraction on homepage
  const domCats = await extractDomMenu(page);
  if (domCats && domCats.length > 0) {
    const totalItems = domCats.reduce((s, c) => s + c.items.length, 0);
    if (totalItems >= 3) {
      console.log(`    DOM: ${totalItems} items found on homepage`);
      return {
        categories: domCats,
        totalItems,
        source: "dom-homepage",
        pageUrl: page.url(),
      };
    }
    allCategories.push(...domCats);
  }

  // --- Try navigating to a /menu page ---
  const menuPageUrl = await findAndClickMenuLink(page);

  if (menuPageUrl) {
    console.log(`    Navigated to menu page: ${menuPageUrl}`);

    // Strategy 1: JSON-LD on menu page
    const menuJsonLd = await extractJsonLdMenu(page);
    if (menuJsonLd && menuJsonLd.length > 0) {
      const totalItems = menuJsonLd.reduce((s, c) => s + c.items.length, 0);
      if (totalItems >= 3) {
        console.log(`    JSON-LD: ${totalItems} items found on menu page`);
        return {
          categories: menuJsonLd,
          totalItems,
          source: "json-ld-menu",
          pageUrl: menuPageUrl,
        };
      }
      allCategories.push(...menuJsonLd);
    }

    // Strategy 2: __NEXT_DATA__ on menu page
    const menuNextData = await extractNextDataMenu(page);
    if (menuNextData && menuNextData.length > 0) {
      const totalItems = menuNextData.reduce(
        (s, c) => s + c.items.length,
        0
      );
      if (totalItems >= 3) {
        console.log(
          `    __NEXT_DATA__: ${totalItems} items found on menu page`
        );
        return {
          categories: menuNextData,
          totalItems,
          source: "next-data-menu",
          pageUrl: menuPageUrl,
        };
      }
      allCategories.push(...menuNextData);
    }

    // Strategy 3: DOM extraction on menu page
    const menuDom = await extractDomMenu(page);
    if (menuDom && menuDom.length > 0) {
      const totalItems = menuDom.reduce((s, c) => s + c.items.length, 0);
      if (totalItems >= 3) {
        console.log(`    DOM: ${totalItems} items found on menu page`);
        return {
          categories: menuDom,
          totalItems,
          source: "dom-menu",
          pageUrl: menuPageUrl,
        };
      }
      allCategories.push(...menuDom);
    }
  }

  // --- Also try common menu URL patterns directly ---
  if (allCategories.reduce((s, c) => s + c.items.length, 0) < 3) {
    const baseUrl = new URL(url);
    const menuPaths = ["/menu", "/our-menu", "/food-menu"];

    for (const path of menuPaths) {
      const tryUrl = `${baseUrl.origin}${path}`;
      if (tryUrl === menuPageUrl) continue; // Already tried

      try {
        const response = await page.goto(tryUrl, {
          waitUntil: "domcontentloaded",
          timeout: MENU_PAGE_TIMEOUT,
        });

        // Skip if we got redirected back to homepage or got 404
        if (
          !response ||
          response.status() === 404 ||
          response.status() === 403
        ) {
          continue;
        }

        await page.waitForTimeout(3000);

        const directJsonLd = await extractJsonLdMenu(page);
        if (directJsonLd && directJsonLd.length > 0) {
          const totalItems = directJsonLd.reduce(
            (s, c) => s + c.items.length,
            0
          );
          if (totalItems >= 3) {
            console.log(
              `    JSON-LD: ${totalItems} items at ${path}`
            );
            return {
              categories: directJsonLd,
              totalItems,
              source: "json-ld-direct",
              pageUrl: tryUrl,
            };
          }
          allCategories.push(...directJsonLd);
        }

        const directNextData = await extractNextDataMenu(page);
        if (directNextData && directNextData.length > 0) {
          const totalItems = directNextData.reduce(
            (s, c) => s + c.items.length,
            0
          );
          if (totalItems >= 3) {
            console.log(
              `    __NEXT_DATA__: ${totalItems} items at ${path}`
            );
            return {
              categories: directNextData,
              totalItems,
              source: "next-data-direct",
              pageUrl: tryUrl,
            };
          }
          allCategories.push(...directNextData);
        }

        const directDom = await extractDomMenu(page);
        if (directDom && directDom.length > 0) {
          const totalItems = directDom.reduce(
            (s, c) => s + c.items.length,
            0
          );
          if (totalItems >= 3) {
            console.log(`    DOM: ${totalItems} items at ${path}`);
            return {
              categories: directDom,
              totalItems,
              source: "dom-direct",
              pageUrl: tryUrl,
            };
          }
          allCategories.push(...directDom);
        }
      } catch {
        // Page doesn't exist or failed to load
      }
    }
  }

  // --- Return whatever we found, even if < 3 items ---
  if (allCategories.length > 0) {
    // Deduplicate items across categories by name
    const seenNames = new Set();
    const dedupedCategories = [];

    for (const cat of allCategories) {
      const uniqueItems = cat.items.filter((item) => {
        const key = item.name.toLowerCase();
        if (seenNames.has(key)) return false;
        seenNames.add(key);
        return true;
      });
      if (uniqueItems.length > 0) {
        dedupedCategories.push({ name: cat.name, items: uniqueItems });
      }
    }

    const totalItems = dedupedCategories.reduce(
      (s, c) => s + c.items.length,
      0
    );
    if (totalItems > 0) {
      return {
        categories: dedupedCategories,
        totalItems,
        source: "combined",
        pageUrl: page.url(),
      };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Save to Supabase (same pattern as scrape-deliveroo.mjs / scrape-grabfood.mjs)
// ---------------------------------------------------------------------------

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
      has_images: hasImages,
      has_prices: hasPrices,
      scrape_status: "completed",
      last_scraped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", brand.id);

  return totalItems;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Website Menu Scraper (Playwright) ===\n");
  if (DRY_RUN) console.log("*** DRY RUN - no DB writes ***\n");

  // Get brands to process
  let query = supabase
    .from("brand_menus")
    .select("id, slug, name, website_url, social_links")
    .eq("is_active", true)
    .eq("menu_item_count", 0)
    .not("website_url", "is", null);

  if (BRAND_FILTER) {
    query = supabase
      .from("brand_menus")
      .select("id, slug, name, website_url, social_links")
      .eq("slug", BRAND_FILTER);
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

  const progress = loadProgress();
  let toProcess = filteredBrands.filter(
    (b) =>
      !progress.completed[b.slug] && !progress.noMenu.includes(b.slug)
  );

  if (LIMIT > 0) toProcess = toProcess.slice(0, LIMIT);

  console.log(
    `Brands to process: ${toProcess.length} (of ${filteredBrands.length} with website URLs)`
  );
  console.log(
    `Already completed: ${Object.keys(progress.completed).length}`
  );
  console.log(`No menu found: ${progress.noMenu.length}`);
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
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
    });
    const pg = await ctx.newPage();

    // Block unnecessary resources to speed up loading
    await pg.route(
      "**/*",
      (route) => {
        const resourceType = route.request().resourceType();
        if (
          resourceType === "media" ||
          resourceType === "font"
        ) {
          route.abort();
        } else {
          route.continue();
        }
      }
    );

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
      const result = await scrapeBrandWebsite(page, brand);
      stats.processed++;
      contextCount++;

      if (!result || result.totalItems === 0) {
        console.log(`  No menu items found`);
        stats.noMenu++;
        progress.noMenu.push(brand.slug);
        saveProgress(progress);

        if (!DRY_RUN) {
          // Mark as scraped even with no results
          await supabase
            .from("brand_menus")
            .update({
              scrape_status: "completed",
              last_scraped_at: new Date().toISOString(),
            })
            .eq("id", brand.id);
        }
        continue;
      }

      console.log(
        `  Found ${result.totalItems} items in ${result.categories.length} categories (source: ${result.source})`
      );
      stats.found++;
      stats.totalItems += result.totalItems;

      if (!DRY_RUN) {
        const savedItems = await saveToSupabase(brand, result);
        console.log(`  Saved ${savedItems} items to Supabase`);
      } else {
        // Print sample in dry-run mode
        for (const cat of result.categories.slice(0, 3)) {
          console.log(
            `    Category: ${cat.name} (${cat.items.length} items)`
          );
          for (const item of cat.items.slice(0, 3)) {
            console.log(
              `      - ${item.name}: ${item.priceText || "no price"} ${item.image ? "[img]" : ""}`
            );
          }
          if (cat.items.length > 3) {
            console.log(
              `      ... and ${cat.items.length - 3} more`
            );
          }
        }
      }

      progress.completed[brand.slug] = {
        items: result.totalItems,
        categories: result.categories.length,
        source: result.source,
        pageUrl: result.pageUrl,
        timestamp: new Date().toISOString(),
      };
      saveProgress(progress);
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      stats.errors++;
      progress.failed[brand.slug] = {
        error: err.message,
        timestamp: new Date().toISOString(),
      };
      saveProgress(progress);

      // If page crashed, create a fresh context
      if (
        err.message.includes("closed") ||
        err.message.includes("crash") ||
        err.message.includes("Target") ||
        err.message.includes("disposed")
      ) {
        console.log(`  Recovering with fresh context...`);
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

    // Print progress every 20 brands
    if ((i + 1) % 20 === 0) {
      console.log(
        `\n--- Progress: ${i + 1}/${toProcess.length} | Found: ${stats.found} | Items: ${stats.totalItems} | No menu: ${stats.noMenu} | Errors: ${stats.errors} ---`
      );
    }
  }

  await currentContext.close();
  await browser.close();

  console.log("\n\n=== Final Summary ===");
  console.log(`Processed: ${stats.processed}`);
  console.log(`Found menus: ${stats.found}`);
  console.log(`Total items: ${stats.totalItems}`);
  console.log(`No menu found: ${stats.noMenu}`);
  console.log(`Errors: ${stats.errors}`);
  if (stats.processed > 0) {
    console.log(
      `Hit rate: ${((stats.found / stats.processed) * 100).toFixed(1)}%`
    );
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
