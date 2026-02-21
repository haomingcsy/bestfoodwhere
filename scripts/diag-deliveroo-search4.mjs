// Test Deliveroo search - dismiss modal, then search
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  locale: "en-SG",
});
const page = await ctx.newPage();

// Capture API calls for search
const searchAPIs = [];
page.on("response", async (response) => {
  const url = response.url();
  if (response.status() === 200 && url.includes("graphql")) {
    try {
      const data = await response.json();
      const str = JSON.stringify(data);
      if (str.includes("restaurant") && str.length > 1000) {
        searchAPIs.push({ url, size: str.length, sample: str.slice(0, 500) });
      }
    } catch {}
  }
});

await page.goto("https://deliveroo.com.sg/restaurants/singapore/orchard", {
  waitUntil: "domcontentloaded", timeout: 20000,
});
await page.waitForTimeout(3000);

// Dismiss any modal overlays
console.log("=== Dismissing modals ===");
try {
  // Try clicking "Accept" on cookie banner
  const acceptBtn = page.locator("button:has-text('Accept'), button:has-text('Got it'), button:has-text('OK'), #onetrust-accept-btn-handler");
  if (await acceptBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await acceptBtn.click();
    console.log("Dismissed cookie banner");
    await page.waitForTimeout(1000);
  }
} catch {}

try {
  // Close any other modal
  const closeBtn = page.locator("[class*='ReactModal'] button[aria-label='Close'], [class*='ReactModal'] button:has-text('×'), .ReactModalPortal button").first();
  if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await closeBtn.click();
    console.log("Dismissed modal");
    await page.waitForTimeout(1000);
  }
} catch {}

// Try pressing Escape to dismiss modals
await page.keyboard.press("Escape");
await page.waitForTimeout(1000);

// Check what's on the page now
const modalInfo = await page.evaluate(() => {
  const modals = document.querySelectorAll(".ReactModalPortal");
  const info = [];
  modals.forEach(m => {
    const text = m.textContent?.trim()?.slice(0, 200);
    if (text) info.push(text);
  });
  return info;
});
console.log("Modal content:", modalInfo);

// Try to search now
console.log("\n=== Attempting search ===");
try {
  const searchInput = page.locator("input[type='search']").first();
  // Use force click to bypass overlay
  await searchInput.click({ force: true });
  await page.waitForTimeout(500);
  await searchInput.fill("Subway");
  await page.waitForTimeout(3000);

  // Check for API calls during search
  console.log(`API calls captured: ${searchAPIs.length}`);
  for (const a of searchAPIs.slice(-3)) {
    console.log(`  ${a.url.slice(0, 80)} (${a.size} bytes)`);
    console.log(`  ${a.sample.slice(0, 300)}\n`);
  }

  // Check for results in the page
  const results = await page.evaluate(() => {
    const found = [];
    document.querySelectorAll("a[href*='/menu/']").forEach(a => {
      const text = a.textContent?.trim()?.toLowerCase() || "";
      if (text.includes("subway")) {
        found.push({
          text: a.textContent?.trim()?.slice(0, 80),
          href: a.getAttribute("href"),
        });
      }
    });
    return found;
  });

  console.log(`Links matching "subway": ${results.length}`);
  for (const r of results.slice(0, 5)) {
    const slug = r.href.match(/\/menu\/[^/]+\/[^/]+\/([^?]+)/)?.[1];
    console.log(`  ${r.text.slice(0, 50)} → ${slug}`);
  }

  // Press Enter and check results page
  await page.keyboard.press("Enter");
  await page.waitForTimeout(4000);
  console.log(`\nURL after Enter: ${page.url()}`);

  const allLinks = await page.evaluate(() => {
    const found = [];
    document.querySelectorAll("a[href*='/menu/']").forEach(a => {
      const text = a.textContent?.trim()?.slice(0, 60);
      const href = a.getAttribute("href");
      if (text && href) found.push({ text, href });
    });
    return found;
  });

  console.log(`All restaurant links: ${allLinks.length}`);
  for (const l of allLinks.slice(0, 10)) {
    const slug = l.href.match(/\/menu\/[^/]+\/[^/]+\/([^?]+)/)?.[1];
    console.log(`  ${l.text} → ${slug}`);
  }

} catch (e) {
  console.log(`Error: ${e.message}`);
}

// Alternative approach: Try GraphQL API directly
console.log("\n\n=== Testing GraphQL search API ===");
try {
  const result = await page.evaluate(async () => {
    try {
      const resp = await fetch("https://api.sg.deliveroo.com/consumer/graphql/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          query: "query SearchSuggestions($query: String!) { searchSuggestions(query: $query) { restaurants { name slug } } }",
          variables: { query: "Subway" },
        }),
      });
      return { status: resp.status, body: (await resp.text()).slice(0, 500) };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log("GraphQL result:", JSON.stringify(result, null, 2));
} catch (e) {
  console.log("Error:", e.message);
}

await browser.close();
