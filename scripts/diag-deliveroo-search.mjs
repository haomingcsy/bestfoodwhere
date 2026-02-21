// Test Deliveroo search and matching for various brands
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  locale: "en-SG",
});
const page = await ctx.newPage();

const testBrands = ["KFC", "Ajisen Ramen", "BreadTalk", "Din Tai Fung", "Genki Sushi"];

for (const brand of testBrands) {
  const url = `https://deliveroo.com.sg/restaurants/singapore/orchard?q=${encodeURIComponent(brand)}`;
  console.log(`\n=== Searching: "${brand}" ===`);

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(4000);

    const links = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('a[href*="/menu/"]').forEach(a => {
        const href = a.getAttribute("href");
        const text = a.textContent?.trim()?.slice(0, 80);
        if (href && text) results.push({ href, text });
      });
      return results;
    });

    console.log(`  Found ${links.length} restaurant links:`);
    for (const l of links.slice(0, 5)) {
      // Extract slug from href
      const slugMatch = l.href.match(/\/menu\/[^/]+\/[^/]+\/([^?]+)/);
      const slug = slugMatch?.[1] || "";
      console.log(`    slug: ${slug}`);
      console.log(`    text: ${l.text.slice(0, 60)}`);
    }
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }

  await new Promise(r => setTimeout(r, 2000));
}

await browser.close();
