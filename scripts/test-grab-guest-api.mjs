// Test GrabFood guest API - the endpoint captured from Playwright network interception

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-SG,en;q=0.9",
  Origin: "https://food.grab.com",
  Referer: "https://food.grab.com/",
};

// Test guest API directly (no Playwright)
const merchantId = "SGDD09484";
const latlng = "1.287953,103.851784";

console.log("=== Testing Guest API Directly ===");
const endpoints = [
  `https://portal.grab.com/foodweb/guest/v2/merchants/${merchantId}`,
  `https://portal.grab.com/foodweb/guest/v2/merchants/${merchantId}?latlng=${latlng}`,
];

for (const url of endpoints) {
  try {
    console.log(`\nGET ${url}`);
    const res = await fetch(url, { headers: HEADERS });
    console.log(`Status: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`Merchant name: ${data.merchant?.name}`);
      console.log(`Categories: ${data.merchant?.menu?.categories?.length}`);
      const totalItems = data.merchant?.menu?.categories?.reduce((sum, cat) => sum + (cat.items?.length || 0), 0);
      console.log(`Total items: ${totalItems}`);
      // Show first category and item
      const firstCat = data.merchant?.menu?.categories?.[0];
      if (firstCat) {
        console.log(`\nFirst category: ${firstCat.name}`);
        const firstItem = firstCat.items?.[0];
        if (firstItem) {
          console.log(`  First item: ${firstItem.name}`);
          console.log(`  Price: $${(firstItem.priceInMinorUnit / 100).toFixed(2)}`);
          console.log(`  Image: ${firstItem.imgHref?.slice(0, 80)}`);
        }
      }
    } else {
      const text = await res.text();
      console.log(`Error: ${text.slice(0, 200)}`);
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

// Also test the guest search endpoint
console.log("\n\n=== Testing Guest Search API ===");
const searchEndpoints = [
  {
    url: "https://portal.grab.com/foodweb/guest/v2/search",
    method: "POST",
    body: { latlng, keyword: "Subway", offset: 0, pageSize: 5 },
  },
  {
    url: `https://portal.grab.com/foodweb/guest/v2/search?keyword=Subway&latlng=${latlng}&offset=0&pageSize=5`,
    method: "GET",
  },
];

for (const ep of searchEndpoints) {
  try {
    console.log(`\n${ep.method} ${ep.url.split("?")[0]}`);
    const opts = {
      method: ep.method,
      headers: { ...HEADERS, ...(ep.body ? { "Content-Type": "application/json" } : {}) },
    };
    if (ep.body) opts.body = JSON.stringify(ep.body);
    const res = await fetch(ep.url, opts);
    console.log(`Status: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`Keys: ${Object.keys(data)}`);
      console.log(`Sample: ${JSON.stringify(data).slice(0, 800)}`);
    } else {
      const text = await res.text();
      console.log(`Error: ${text.slice(0, 200)}`);
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}
