import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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

for (const brand of ["Ajisen Ramen", "Aki Sushi & Grill", "A&W", "Subway"]) {
  const url = `https://food.grab.com/sg/en/restaurants?search=${encodeURIComponent(brand)}`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(3000);

    const results = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/restaurant/"]');
      return Array.from(links).slice(0, 8).map(l => ({
        href: l.getAttribute("href"),
        text: l.textContent?.trim()?.slice(0, 150),
      }));
    });

    console.log(`\n=== "${brand}" search results (${results.length}) ===`);
    for (const r of results) {
      console.log(`  "${r.text}" → ${r.href}`);
    }
  } catch (e) {
    console.log(`Error for ${brand}: ${e.message}`);
  }
}

await browser.close();
