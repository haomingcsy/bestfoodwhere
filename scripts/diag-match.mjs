import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });

async function debugSearch(brand) {
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    locale: "en-SG",
    geolocation: { latitude: 1.3521, longitude: 103.8198 },
    permissions: ["geolocation"],
  });
  const page = await context.newPage();
  await context.addCookies([{
    name: "location",
    value: encodeURIComponent(JSON.stringify({
      latitude: 1.3521, longitude: 103.8198,
      address: "Singapore", countryCode: "SG", isAccurate: true,
    })),
    domain: "food.grab.com",
    path: "/",
  }]);

  // Clean name same way as scraper
  const cleanName = brand
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/@/g, "at ")
    .replace(/['']/g, "")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const url = `https://food.grab.com/sg/en/restaurants?search=${encodeURIComponent(cleanName)}`;
  console.log(`\n=== "${brand}" (search: "${cleanName}") ===`);

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    try {
      await page.waitForSelector('a[href*="/restaurant/"]', { timeout: 8000 });
    } catch {}
    await page.waitForTimeout(1000);

    const results = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/restaurant/"]');
      const seen = new Set();
      const out = [];
      for (const link of links) {
        const href = link.getAttribute("href");
        if (!href || seen.has(href)) continue;
        seen.add(href);
        const slugMatch = href.match(/\/restaurant\/([^/]+?)(?:-delivery)?\/[A-Z0-9-]+/);
        out.push({
          slug: slugMatch?.[1] || "",
          href: href.slice(0, 120),
        });
      }
      return out;
    });

    console.log(`  ${results.length} results:`);
    for (const r of results.slice(0, 10)) {
      console.log(`    slug: ${r.slug}`);
    }

    // Run our matching against these
    const brandSlug = brand.toLowerCase()
      .replace(/&/g, "-").replace(/'/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    console.log(`  Brand slug: "${brandSlug}"`);

    // Check if any slug starts with brand slug
    const prefixMatch = results.find(r => r.slug.startsWith(brandSlug));
    if (prefixMatch) {
      console.log(`  ✅ PREFIX MATCH: ${prefixMatch.slug}`);
    } else {
      // Check partial matches
      const brandWords = brandSlug.split("-").filter(w => w.length > 0);
      for (const r of results.slice(0, 10)) {
        const sw = r.slug.split("-").filter(w => w.length > 0);
        const matched = brandWords.filter(bw => sw.some(s => s === bw || (s.length >= 3 && bw.length >= 3 && (s.startsWith(bw) || bw.startsWith(s))))).length;
        if (matched > 0) {
          console.log(`    partial (${matched}/${brandWords.length} words): ${r.slug}`);
        }
      }
    }
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }
  await context.close();
}

const testBrands = [
  "Ajisen Ramen",
  "ASTONS Specialities",
  "Baskin-Robbins Bedok Mall",
  "Boost Juice",
  "BreadTalk",
  "Crystal Jade Hong Kong Kitchen",
  "Din Tai Fung",
  "Fish & Co",
  "Genki Sushi",
  "KOI Thé",
];

for (const brand of testBrands) {
  await debugSearch(brand);
  await new Promise(r => setTimeout(r, 3000));
}

await browser.close();
