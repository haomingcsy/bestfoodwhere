// Test Deliveroo search by interacting with the search UI
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  locale: "en-SG",
});
const page = await ctx.newPage();

// Test 1: Check if there's a search API we can call directly
page.on("response", async (response) => {
  const url = response.url();
  if (response.status() === 200 && url.includes("search")) {
    const ct = response.headers()["content-type"] || "";
    if (ct.includes("json")) {
      try {
        const data = await response.json();
        const str = JSON.stringify(data);
        console.log(`\n  SEARCH API: ${url.slice(0, 120)}`);
        console.log(`  Size: ${str.length}, Keys: ${Object.keys(data).join(",").slice(0, 100)}`);
        if (str.length < 5000) console.log(`  Data: ${str.slice(0, 500)}`);
      } catch {}
    }
  }
});

// Go to Deliveroo restaurants page with address set
console.log("=== Setting location to Singapore central ===");
await page.goto("https://deliveroo.com.sg/restaurants/singapore/orchard", {
  waitUntil: "domcontentloaded", timeout: 20000,
});
await page.waitForTimeout(3000);

// Look for search input
const searchInputs = await page.evaluate(() => {
  const inputs = [];
  document.querySelectorAll("input, [role='search'], [type='search'], [data-testid*='search']").forEach(el => {
    inputs.push({
      tag: el.tagName,
      type: el.type,
      placeholder: el.placeholder,
      className: el.className?.toString()?.slice(0, 100),
      role: el.getAttribute("role"),
      testId: el.getAttribute("data-testid"),
      ariaLabel: el.getAttribute("aria-label"),
    });
  });

  // Also check for search-related buttons/links
  const searchElements = [];
  document.querySelectorAll("[class*='search' i], [data-testid*='search' i]").forEach(el => {
    searchElements.push({
      tag: el.tagName,
      text: el.textContent?.trim()?.slice(0, 50),
      className: el.className?.toString()?.slice(0, 100),
      testId: el.getAttribute("data-testid"),
    });
  });

  return { inputs, searchElements: searchElements.slice(0, 10) };
});

console.log("\nInputs found:", JSON.stringify(searchInputs.inputs, null, 2));
console.log("\nSearch-related elements:", JSON.stringify(searchInputs.searchElements, null, 2));

// Test 2: Try search API directly
console.log("\n=== Testing Deliveroo search API ===");
try {
  const apiResponse = await page.evaluate(async () => {
    // Try different API patterns
    const urls = [
      "https://api.sg.deliveroo.com/consumer/search/suggestions?q=KFC",
      "https://api.sg.deliveroo.com/consumer/search?q=KFC&lat=1.3521&lng=103.8198",
      "https://deliveroo.com.sg/api/search?q=KFC",
    ];

    const results = [];
    for (const url of urls) {
      try {
        const resp = await fetch(url, {
          headers: { "Accept": "application/json" },
        });
        const text = await resp.text();
        results.push({ url, status: resp.status, body: text.slice(0, 500) });
      } catch (e) {
        results.push({ url, error: e.message });
      }
    }
    return results;
  });

  for (const r of apiResponse) {
    console.log(`\n  ${r.url}`);
    console.log(`  Status: ${r.status || "Error: " + r.error}`);
    if (r.body) console.log(`  Body: ${r.body.slice(0, 300)}`);
  }
} catch (e) {
  console.log(`Error: ${e.message}`);
}

// Test 3: Try typing in search
console.log("\n\n=== Testing search input interaction ===");
try {
  // Click search icon/button if exists
  const searchBtn = page.locator("[data-testid*='search'], button:has-text('Search'), [aria-label*='search' i]").first();
  if (await searchBtn.isVisible().catch(() => false)) {
    console.log("Found search button, clicking...");
    await searchBtn.click();
    await page.waitForTimeout(1000);
  }

  // Type in search input
  const searchInput = page.locator("input[type='search'], input[placeholder*='search' i], input[aria-label*='search' i], input[name*='search' i]").first();
  if (await searchInput.isVisible().catch(() => false)) {
    console.log("Found search input, typing 'KFC'...");
    await searchInput.fill("KFC");
    await page.waitForTimeout(3000);

    // Check for search suggestions/results
    const suggestions = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll("a[href*='/menu/'], [role='option'], [role='listbox'] li").forEach(el => {
        items.push({
          text: el.textContent?.trim()?.slice(0, 80),
          href: el.getAttribute("href"),
        });
      });
      return items;
    });

    console.log(`Search suggestions: ${suggestions.length}`);
    for (const s of suggestions.slice(0, 10)) {
      console.log(`  ${s.text} → ${s.href || "(no link)"}`);
    }
  } else {
    console.log("No search input found");
  }
} catch (e) {
  console.log(`Error: ${e.message}`);
}

await browser.close();
