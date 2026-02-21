// Find the actual GrabFood API endpoints from runtime config and test them

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-SG,en;q=0.9",
};

// 1. Get runtime config from __NEXT_DATA__
const url = "https://food.grab.com/sg/en/restaurant/subway-jurong-point-delivery/SGDD09484";
const res = await fetch(url, { headers: HEADERS });
const html = await res.text();
const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
const nextData = JSON.parse(nextDataMatch[1]);

console.log("=== Runtime Config ===");
const rc = nextData.runtimeConfig;
console.log(JSON.stringify(rc, null, 2).slice(0, 2000));

// 2. Try various known GrabFood API patterns
const merchantId = "SGDD09484";
const latlng = "1.287953,103.851784";

const endpoints = [
  {
    name: "foodweb v2 merchant",
    url: `https://portal.grab.com/foodweb/v2/merchants/${merchantId}`,
    method: "GET",
  },
  {
    name: "food.grab.com API merchant",
    url: `https://food.grab.com/sg/en/api/merchants/${merchantId}`,
    method: "GET",
  },
  {
    name: "food.grab.com _next/data",
    url: `https://food.grab.com/_next/data/${nextData.buildId}/sg/en/restaurant/subway-jurong-point-delivery/${merchantId}.json`,
    method: "GET",
  },
  {
    name: "portal.grab.com merchant detail",
    url: `https://portal.grab.com/foodweb/v2/merchants/${merchantId}?latlng=${latlng}`,
    method: "GET",
  },
  {
    name: "portal.grab.com merchant menu",
    url: `https://portal.grab.com/foodweb/v2/merchants/${merchantId}/menu?latlng=${latlng}`,
    method: "GET",
  },
];

const apiHeaders = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-SG,en;q=0.9",
  Origin: "https://food.grab.com",
  Referer: "https://food.grab.com/",
};

for (const ep of endpoints) {
  try {
    console.log(`\n--- ${ep.name} ---`);
    console.log(`URL: ${ep.url}`);
    const r = await fetch(ep.url, {
      method: ep.method,
      headers: apiHeaders,
      body: ep.body ? JSON.stringify(ep.body) : undefined,
    });
    console.log(`Status: ${r.status}`);
    const ct = r.headers.get("content-type") || "";
    console.log(`Content-Type: ${ct}`);
    if (r.ok || r.status < 500) {
      const text = await r.text();
      if (ct.includes("json") || text.startsWith("{") || text.startsWith("[")) {
        try {
          const data = JSON.parse(text);
          console.log(`Keys: ${Object.keys(data)}`);
          console.log(`Sample: ${JSON.stringify(data).slice(0, 1000)}`);
        } catch {
          console.log(`Body (first 500): ${text.slice(0, 500)}`);
        }
      } else {
        console.log(`Body (first 300): ${text.slice(0, 300)}`);
      }
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

// 3. Also try GrabFood search endpoint variations
console.log("\n\n=== Search Endpoint Variations ===");
const searchEndpoints = [
  {
    name: "portal search POST",
    url: "https://portal.grab.com/foodweb/v2/search",
    method: "POST",
    body: { latlng, keyword: "Subway", offset: 0, pageSize: 5 },
  },
  {
    name: "food.grab.com _next/data search",
    url: `https://food.grab.com/_next/data/${nextData.buildId}/sg/en/restaurants.json?search=Subway`,
    method: "GET",
  },
  {
    name: "food.grab.com _next/data search v2",
    url: `https://food.grab.com/_next/data/${nextData.buildId}/sg/en/search.json?q=Subway`,
    method: "GET",
  },
];

for (const ep of searchEndpoints) {
  try {
    console.log(`\n--- ${ep.name} ---`);
    const fetchOpts = {
      method: ep.method,
      headers: { ...apiHeaders, ...(ep.body ? { "Content-Type": "application/json" } : {}) },
    };
    if (ep.body) fetchOpts.body = JSON.stringify(ep.body);
    const r = await fetch(ep.url, fetchOpts);
    console.log(`Status: ${r.status}`);
    if (r.ok) {
      const data = await r.json();
      console.log(`Keys: ${Object.keys(data)}`);
      console.log(`Sample: ${JSON.stringify(data).slice(0, 500)}`);
    } else {
      const text = await r.text();
      console.log(`Body: ${text.slice(0, 300)}`);
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}
