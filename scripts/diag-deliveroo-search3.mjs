// Test Deliveroo search by typing and submitting
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  locale: "en-SG",
});
const page = await ctx.newPage();

// Capture search API calls
page.on("response", async (response) => {
  const url = response.url();
  if (response.status() === 200) {
    const ct = response.headers()["content-type"] || "";
    if (ct.includes("json") && (url.includes("search") || url.includes("graphql"))) {
      try {
        const data = await response.json();
        const str = JSON.stringify(data);
        if (str.includes("restaurant") || str.includes("menu") || str.includes("kfc") || str.includes("subway")) {
          console.log(`  API: ${url.slice(0, 100)} (${str.length} bytes)`);
          console.log(`  Sample: ${str.slice(0, 400)}\n`);
        }
      } catch {}
    }
  }
});

await page.goto("https://deliveroo.com.sg/restaurants/singapore/orchard", {
  waitUntil: "domcontentloaded", timeout: 20000,
});
await page.waitForTimeout(3000);

async function searchAndCheck(query) {
  console.log(`\n=== Searching: "${query}" ===`);

  // Find and interact with search
  const searchInput = page.locator("input[type='search'][aria-label='Restaurants, groceries, dishes']").first();
  await searchInput.click();
  await page.waitForTimeout(500);
  await searchInput.fill("");
  await page.waitForTimeout(300);

  // Type slowly like a human
  await searchInput.pressSequentially(query, { delay: 100 });
  await page.waitForTimeout(2000);

  // Check for autocomplete/suggestion dropdown
  const suggestions = await page.evaluate((q) => {
    // Look for any new elements that appeared (dropdown, suggestions list)
    const ql = q.toLowerCase();
    const results = [];

    // Check for links that contain the search term
    document.querySelectorAll("a").forEach(a => {
      const text = a.textContent?.toLowerCase() || "";
      const href = a.getAttribute("href") || "";
      if ((text.includes(ql) || href.includes(ql)) && href.includes("/menu/")) {
        results.push({
          text: a.textContent?.trim()?.slice(0, 80),
          href: href,
        });
      }
    });

    // Also check for any list items or suggestions
    document.querySelectorAll("[role='option'], [role='listbox'] li, [class*='suggestion'], [class*='result']").forEach(el => {
      const text = el.textContent?.trim()?.slice(0, 100);
      if (text) results.push({ text, href: el.querySelector("a")?.getAttribute("href") || "" });
    });

    return results;
  }, query);

  console.log(`  Matching suggestions: ${suggestions.length}`);
  for (const s of suggestions.slice(0, 5)) {
    console.log(`    ${s.text.slice(0, 60)} → ${s.href.slice(0, 80)}`);
  }

  // Now press Enter to submit search
  await page.keyboard.press("Enter");
  await page.waitForTimeout(4000);

  // Check the URL after search
  console.log(`  URL after search: ${page.url()}`);

  // Get restaurant links from results page
  const links = await page.evaluate((q) => {
    const ql = q.toLowerCase();
    const results = [];
    document.querySelectorAll("a[href*='/menu/']").forEach(a => {
      const text = a.textContent?.trim();
      const href = a.getAttribute("href");
      if (text && href) {
        results.push({
          text: text.slice(0, 80),
          href,
          matches: text.toLowerCase().includes(ql),
        });
      }
    });
    return results;
  }, query);

  console.log(`  Restaurant links after Enter: ${links.length}`);
  const matching = links.filter(l => l.matches);
  console.log(`  Matching links: ${matching.length}`);
  for (const l of matching.slice(0, 5)) {
    const slugMatch = l.href.match(/\/menu\/[^/]+\/[^/]+\/([^?]+)/);
    console.log(`    ${l.text.slice(0, 50)} → slug: ${slugMatch?.[1]}`);
  }
  if (matching.length === 0 && links.length > 0) {
    console.log("  All links (none matched):");
    for (const l of links.slice(0, 5)) {
      console.log(`    ${l.text.slice(0, 50)}`);
    }
  }

  // Check page body for relevant content
  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 1000));
  if (bodyText?.toLowerCase().includes("no results") || bodyText?.toLowerCase().includes("couldn't find")) {
    console.log("  PAGE SAYS: No results found");
  }

  // Clear the search for next test
  await searchInput.fill("");
  await page.waitForTimeout(500);
}

for (const brand of ["Subway", "KFC", "McDonald's", "BreadTalk"]) {
  await searchAndCheck(brand);
  await new Promise(r => setTimeout(r, 2000));
}

await browser.close();
