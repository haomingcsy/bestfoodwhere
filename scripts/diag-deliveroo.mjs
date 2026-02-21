import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  locale: "en-SG",
});
const page = await ctx.newPage();

await page.goto("https://deliveroo.com.sg/menu/Singapore/newton-balmoral/subway-balmoral-plaza?day=today&geohash=w21z6v3cp2uc&time=ASAP", {
  waitUntil: "domcontentloaded", timeout: 20000,
});
await page.waitForTimeout(5000);

// 1. Check __NEXT_DATA__ for structured menu data
const nextData = await page.evaluate(() => {
  const script = document.getElementById("__NEXT_DATA__");
  if (!script) return null;
  const data = JSON.parse(script.textContent);

  const found = {};
  const search = (obj, path, depth) => {
    if (depth > 8 || !obj || typeof obj !== "object") return;
    for (const [k, v] of Object.entries(obj)) {
      const p = path ? path + "." + k : k;
      const kl = k.toLowerCase();
      if (kl.includes("menu") || kl.includes("categor") || kl.includes("item") || kl === "restaurant") {
        if (typeof v === "object" && v !== null) {
          const str = JSON.stringify(v);
          if (str.length > 100) {
            found[p] = str.slice(0, 600);
          }
        }
      }
      if (typeof v === "object" && v !== null) {
        search(v, p, depth + 1);
      }
    }
  };
  search(data, "", 0);
  return { keys: Object.keys(data.props?.initialState || {}).slice(0, 40), found };
});

console.log("=== __NEXT_DATA__ ===");
console.log("Top-level initialState keys:", nextData?.keys);
console.log("\nMenu-related paths:");
for (const [path, sample] of Object.entries(nextData?.found || {})) {
  console.log(`\n  ${path}:`);
  console.log(`  ${sample}`);
}

// 2. Better DOM extraction with categories
const menuExtract = await page.evaluate(() => {
  // Find the menu container - look for the scrollable section with categories
  const main = document.querySelector("main") || document.body;

  // Categories: h3 elements in the nav/sticky bar area
  const skipTexts = new Set([
    "Discover Deliveroo", "Legal", "Support", "Take Deliveroo with you",
    "Cookie Settings", "Manage Consent Preferences", "Vendors List",
    "Info", "Allergens and more", "Free delivery",
  ]);

  // Find category header elements
  const catHeaders = [];
  main.querySelectorAll("h3").forEach(h => {
    const text = h.textContent?.trim();
    if (text && text.length > 1 && text.length < 80 && !skipTexts.has(text) && !text.startsWith("About ")) {
      catHeaders.push({ text, element: h });
    }
  });

  // Find all item li elements
  const allItems = [];
  main.querySelectorAll("li").forEach(li => {
    const text = li.textContent?.trim() || "";
    const priceMatch = text.match(/\$(\d+\.\d{2})/);
    if (!priceMatch) return;

    // Get image
    const img = li.querySelector("img");
    let imageUrl = "";
    if (img) {
      const src = img.getAttribute("src") || "";
      if (src.includes("deliveroo") || src.includes("roocdn")) imageUrl = src;
    }

    // Parse name and description from text
    const priceStr = priceMatch[0];
    let beforePrice = text.split(priceStr)[0];
    // Remove "Popular" / "New" tags
    beforePrice = beforePrice.replace(/^(Popular|New)\s*/i, "").trim();

    let name = beforePrice;
    let description = "";

    // If the text is long, try to split name from description
    // Description usually starts with a capital letter after the name
    if (name.length > 60) {
      // Look for where description starts - usually after a short name
      // Try splitting at known patterns
      const descStart = name.search(/[a-z][A-Z]/);
      if (descStart > 5 && descStart < 60) {
        description = name.slice(descStart + 1);
        name = name.slice(0, descStart + 1);
      }
    }

    if (name && name.length > 1) {
      allItems.push({
        name: name.slice(0, 100),
        price: parseFloat(priceMatch[1]),
        description: description.slice(0, 200),
        imageUrl,
        // Store the element's vertical position for category grouping
        top: li.getBoundingClientRect().top,
      });
    }
  });

  // Group items by category using vertical position
  const catPositions = catHeaders.map(c => ({
    text: c.text,
    top: c.element.getBoundingClientRect().top,
  }));

  const categories = [];
  for (let i = 0; i < catPositions.length; i++) {
    const catTop = catPositions[i].top;
    const nextCatTop = i + 1 < catPositions.length ? catPositions[i + 1].top : Infinity;

    const items = allItems.filter(item => item.top >= catTop && item.top < nextCatTop);
    if (items.length > 0) {
      categories.push({
        name: catPositions[i].text,
        items: items.map(({ name, price, description, imageUrl }) => ({ name, price, description, imageUrl })),
      });
    }
  }

  // Deduplicate items across categories (Popular section duplicates)
  const seen = new Set();
  const deduped = [];
  for (const cat of categories) {
    if (cat.name === "Popular with other people") continue; // Skip "Popular" - it's duplicates
    const uniqueItems = cat.items.filter(item => {
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    });
    if (uniqueItems.length > 0) {
      deduped.push({ ...cat, items: uniqueItems });
    }
  }

  return {
    categories: deduped,
    totalItems: allItems.length,
    catHeaders: catHeaders.map(c => c.text),
  };
});

console.log("\n\n=== DOM Menu Extraction ===");
console.log("Category headers:", menuExtract.catHeaders);
console.log(`Total items found: ${menuExtract.totalItems}`);
console.log(`Categories with items: ${menuExtract.categories.length}`);

for (const cat of menuExtract.categories) {
  console.log(`\n  ${cat.name} (${cat.items.length} items):`);
  for (const item of cat.items.slice(0, 8)) {
    console.log(`    ${item.name} - $${item.price}${item.description ? " | " + item.description.slice(0, 50) : ""}${item.imageUrl ? " [img]" : ""}`);
  }
  if (cat.items.length > 8) console.log(`    ... and ${cat.items.length - 8} more`);
}

await browser.close();
