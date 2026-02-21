// Test Playwright with FoodPanda to discover API endpoints and menu data structure
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  locale: "en-SG",
});

const page = await context.newPage();

// Capture all API responses
const apiResponses = [];
page.on("response", async (response) => {
  const url = response.url();
  const status = response.status();
  if (status === 200 && (url.includes("api") || url.includes("disco") || url.includes("vendor") || url.includes("menu"))) {
    const ct = response.headers()["content-type"] || "";
    if (ct.includes("json")) {
      try {
        const data = await response.json();
        apiResponses.push({ url: url.split("?")[0], keys: Object.keys(data), sample: JSON.stringify(data).slice(0, 500) });
        console.log(`API: ${url.split("?")[0]} => keys: ${Object.keys(data)}`);

        // Look for menu data
        const str = JSON.stringify(data);
        if (str.includes('"menus"') || str.includes('"menu_categories"') || str.includes('"toppings"')) {
          console.log("  *** MENU DATA FOUND ***");
          console.log(`  Sample: ${str.slice(0, 2000)}`);
        }
      } catch (e) {}
    }
  }
});

console.log("=== Navigating to FoodPanda Subway page ===");
try {
  await page.goto("https://www.foodpanda.sg/restaurant/v5iy/subway-jurong-point", {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  console.log(`\nPage title: ${await page.title()}`);
  await page.waitForTimeout(5000);

  // Extract menu from DOM
  const menuData = await page.evaluate(() => {
    const result = { categories: [], rawItems: [] };

    // Look for menu section headers
    const headers = document.querySelectorAll('h2, h3, [data-testid*="menu"], [class*="menu-category"]');
    const headerTexts = [];
    headers.forEach(h => {
      const text = h.textContent?.trim();
      if (text && text.length < 100 && text.length > 1) headerTexts.push(text);
    });
    result.headers = headerTexts;

    // Look for price elements
    const priceEls = document.querySelectorAll('[data-testid*="price"], [class*="price"], [class*="Price"]');
    priceEls.forEach(el => {
      const text = el.textContent?.trim();
      if (text && /\$?\d+\.\d{2}/.test(text)) {
        // Get parent context
        const parent = el.closest('[class*="item"], [class*="dish"], [class*="product"], li, article');
        const nameEl = parent?.querySelector('[class*="name"], [class*="title"], h3, h4');
        result.rawItems.push({
          price: text,
          name: nameEl?.textContent?.trim() || "",
          parentClass: parent?.className?.toString()?.slice(0, 80) || "",
        });
      }
    });

    // Get body text for context
    result.bodySnippet = document.body?.innerText?.slice(0, 3000);
    return result;
  });

  console.log("\n=== DOM Analysis ===");
  console.log(`Headers: ${menuData.headers?.slice(0, 15).join(" | ")}`);
  console.log(`\nPrice elements found: ${menuData.rawItems?.length}`);
  for (const item of (menuData.rawItems || []).slice(0, 10)) {
    console.log(`  ${item.name}: ${item.price} (${item.parentClass})`);
  }
  console.log(`\nBody text:\n${menuData.bodySnippet}`);

} catch (e) {
  console.log(`Error: ${e.message}`);
}

console.log(`\n=== All API responses captured: ${apiResponses.length} ===`);
for (const r of apiResponses) {
  console.log(`  ${r.url} => ${r.keys}`);
}

await browser.close();
