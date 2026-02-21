import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  locale: "en-SG",
});

// Intercept API responses to capture menu data
let menuData = null;
const page = await context.newPage();

page.on("response", async (response) => {
  const url = response.url();
  if (url.includes("merchant") && response.status() === 200) {
    try {
      const ct = response.headers()["content-type"] || "";
      if (ct.includes("json")) {
        const data = await response.json();
        console.log(`\n=== API Response: ${url.split("?")[0]} ===`);
        console.log(`Keys: ${Object.keys(data)}`);

        // Check for menu data
        if (data.merchant?.menu || data.menu || data.categories) {
          menuData = data;
          console.log("*** MENU DATA CAPTURED ***");
          console.log(`Sample: ${JSON.stringify(data).slice(0, 2000)}`);
        } else {
          console.log(`Sample: ${JSON.stringify(data).slice(0, 500)}`);
        }
      }
    } catch (e) {}
  }
});

console.log("Navigating to GrabFood Subway page...");
try {
  await page.goto("https://food.grab.com/sg/en/restaurant/subway-jurong-point-delivery/SGDD09484", {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  console.log(`\nPage title: ${await page.title()}`);

  // Wait for menu items to load
  await page.waitForTimeout(3000);

  // Extract menu data from DOM
  const menuItems = await page.evaluate(() => {
    const result = { categories: [] };

    // Try common selectors for menu categories
    const categoryHeaders = document.querySelectorAll('[class*="category"], [class*="Category"], [data-testid*="category"], h2, h3');
    const allText = [];
    categoryHeaders.forEach(el => {
      allText.push({ tag: el.tagName, class: el.className?.toString()?.slice(0, 100), text: el.textContent?.trim()?.slice(0, 100) });
    });

    // Get all visible text that looks like menu items
    const allElements = document.querySelectorAll('div, span, p, h1, h2, h3, h4');
    const menuLike = [];
    allElements.forEach(el => {
      const text = el.textContent?.trim();
      if (text && text.length > 3 && text.length < 100) {
        const hasPrice = /\$\d/.test(text) || /SGD/.test(text) || /\d+\.\d{2}/.test(text);
        if (hasPrice) {
          menuLike.push({ text: text.slice(0, 200), class: el.className?.toString()?.slice(0, 50) });
        }
      }
    });

    return {
      title: document.title,
      url: location.href,
      categoryHeaders: allText.slice(0, 20),
      menuLikeElements: menuLike.slice(0, 30),
      bodyText: document.body?.innerText?.slice(0, 3000),
    };
  });

  console.log("\n=== DOM Analysis ===");
  console.log(`Title: ${menuItems.title}`);
  console.log(`\nCategory-like headers (${menuItems.categoryHeaders.length}):`);
  for (const h of menuItems.categoryHeaders.slice(0, 15)) {
    console.log(`  [${h.tag}] ${h.text} (class: ${h.class})`);
  }

  console.log(`\nMenu-like elements with prices (${menuItems.menuLikeElements.length}):`);
  for (const m of menuItems.menuLikeElements.slice(0, 20)) {
    console.log(`  ${m.text}`);
  }

  console.log(`\nBody text (first 2000 chars):\n${menuItems.bodyText?.slice(0, 2000)}`);

} catch (e) {
  console.log(`Error: ${e.message}`);
}

await browser.close();
console.log("\nDone!");
