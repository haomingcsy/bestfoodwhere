import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  locale: "en-SG",
});
const page = await ctx.newPage();

await page.goto("https://deliveroo.com.sg/menu/Singapore/newton-balmoral/subway-balmoral-plaza?day=today&geohash=w21z6v3cp2uc&time=ASAP", {
  waitUntil: "domcontentloaded", timeout: 20000,
});
await page.waitForTimeout(4000);

const menuData = await page.evaluate(() => {
  const script = document.getElementById("__NEXT_DATA__");
  if (!script) return null;
  const data = JSON.parse(script.textContent);
  const menuPage = data.props?.initialState?.menuPage?.menu?.metas?.root;
  if (!menuPage) return null;

  return {
    restaurant: menuPage.restaurant,
    categories: menuPage.categories,
    items: menuPage.items?.slice(0, 5), // Just first 5 for inspection
    totalItems: menuPage.items?.length,
    // Check for images
    sampleItem: menuPage.items?.[0],
  };
});

console.log("=== Restaurant ===");
console.log(JSON.stringify(menuData?.restaurant, null, 2));

console.log("\n=== Categories ===");
console.log(JSON.stringify(menuData?.categories, null, 2));

console.log(`\n=== Items (${menuData?.totalItems} total, showing first 5) ===`);
console.log(JSON.stringify(menuData?.items, null, 2));

console.log("\n=== Full first item structure ===");
console.log(JSON.stringify(menuData?.sampleItem, null, 2));

await browser.close();
