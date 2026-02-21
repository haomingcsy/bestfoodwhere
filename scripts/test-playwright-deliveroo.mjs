// Test Playwright with Deliveroo to discover API endpoints and menu data structure
import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: true,
  args: [
    "--disable-blink-features=AutomationControlled",
    "--no-sandbox",
  ],
});

const context = await browser.newContext({
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  locale: "en-SG",
  viewport: { width: 1920, height: 1080 },
});

const page = await context.newPage();

// Hide automation
await page.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => false });
  delete navigator.__proto__.webdriver;
});

// Capture API responses
page.on("response", async (response) => {
  const url = response.url();
  if (response.status() === 200) {
    const ct = response.headers()["content-type"] || "";
    if (ct.includes("json") && (url.includes("api") || url.includes("menu") || url.includes("restaurant"))) {
      try {
        const data = await response.json();
        console.log(`API: ${url.split("?")[0]} => keys: ${Object.keys(data).slice(0, 10)}`);
        const str = JSON.stringify(data);
        if (str.includes("menu") || str.includes("categor")) {
          console.log("  *** POTENTIAL MENU DATA ***");
          console.log(`  Sample: ${str.slice(0, 1000)}`);
        }
      } catch (e) {}
    }
  }
});

console.log("=== Testing Deliveroo ===");

// First try search
try {
  console.log("\n--- Deliveroo search ---");
  await page.goto("https://deliveroo.com.sg/restaurants/singapore/downtown-core?q=Subway", {
    waitUntil: "domcontentloaded",
    timeout: 20000,
  });
  console.log(`Title: ${await page.title()}`);
  await page.waitForTimeout(5000);

  const searchResults = await page.evaluate(() => {
    const results = [];
    const links = document.querySelectorAll('a[href*="/menu/"]');
    links.forEach(l => {
      results.push({
        href: l.getAttribute("href"),
        text: l.textContent?.trim()?.slice(0, 100),
      });
    });
    return {
      results,
      bodySnippet: document.body?.innerText?.slice(0, 2000),
    };
  });

  console.log(`Links to /menu/: ${searchResults.results.length}`);
  for (const r of searchResults.results.slice(0, 5)) {
    console.log(`  ${r.text}: ${r.href}`);
  }
  console.log(`\nBody:\n${searchResults.bodySnippet}`);

} catch (e) {
  console.log(`Error: ${e.message}`);
}

// Try a known restaurant page
try {
  console.log("\n\n--- Deliveroo restaurant page ---");
  await page.goto("https://deliveroo.com.sg/menu/singapore/downtown-core/subway-city-hall", {
    waitUntil: "domcontentloaded",
    timeout: 20000,
  });
  console.log(`Title: ${await page.title()}`);
  await page.waitForTimeout(5000);

  const menuData = await page.evaluate(() => {
    const result = { categories: [], items: [] };

    // Get all text content
    const headers = document.querySelectorAll('h2, h3, [data-testid*="category"], [role="heading"]');
    headers.forEach(h => {
      const text = h.textContent?.trim();
      if (text && text.length > 1 && text.length < 100) result.categories.push(text);
    });

    // Find items with prices
    const allElements = document.querySelectorAll('[class*="MenuItem"], [data-testid*="menu-item"], li, article');
    allElements.forEach(el => {
      const text = el.textContent?.trim();
      if (text && /\$?\d+\.\d{2}/.test(text) && text.length < 300) {
        result.items.push(text.slice(0, 200));
      }
    });

    result.bodySnippet = document.body?.innerText?.slice(0, 3000);
    return result;
  });

  console.log(`Categories: ${menuData.categories.slice(0, 10).join(" | ")}`);
  console.log(`Items with prices: ${menuData.items.length}`);
  for (const item of menuData.items.slice(0, 10)) {
    console.log(`  ${item}`);
  }
  console.log(`\nBody:\n${menuData.bodySnippet}`);

} catch (e) {
  console.log(`Error: ${e.message}`);
}

await browser.close();
