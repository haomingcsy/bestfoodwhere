import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });

async function testSearch(brand) {
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

  const url = `https://food.grab.com/sg/en/restaurants?search=${encodeURIComponent(brand)}`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(5000);

    const diag = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/restaurant/"]');
      return {
        title: document.title,
        bodyLen: document.body?.innerHTML?.length || 0,
        restaurantLinks: links.length,
        allLinks: document.querySelectorAll("a").length,
        firstRestaurantHrefs: Array.from(links).slice(0, 3).map(l => l.getAttribute("href")),
        bodySnippet: document.body?.innerText?.slice(0, 300),
      };
    });

    console.log(`\n=== ${brand} ===`);
    console.log(`Title: ${diag.title}`);
    console.log(`Body length: ${diag.bodyLen}`);
    console.log(`Restaurant links: ${diag.restaurantLinks}`);
    console.log(`All links: ${diag.allLinks}`);
    console.log(`First restaurant hrefs:`, diag.firstRestaurantHrefs);
    console.log(`Body snippet: ${diag.bodySnippet?.slice(0, 200)}`);
  } catch (e) {
    console.log(`Error for ${brand}: ${e.message}`);
  }
  await context.close();
}

// Test known chains that the scraper was showing "not found" for
for (const brand of ["KFC", "McDonald", "BreadTalk", "Bengawan Solo", "Boost Juice"]) {
  await testSearch(brand);
  await new Promise(r => setTimeout(r, 2000));
}

await browser.close();
