// Test GrabFood proxy endpoints and alternative API approaches

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-SG,en;q=0.9",
  Origin: "https://food.grab.com",
  Referer: "https://food.grab.com/sg/en/restaurant/subway-jurong-point-delivery/SGDD09484",
};

const merchantId = "SGDD09484";
const latlng = "1.287953,103.851784";

const endpoints = [
  // Proxy endpoints (from runtime config)
  {
    name: "proxy foodweb v2 merchant",
    url: `https://food.grab.com/proxy/foodweb/v2/merchants/${merchantId}?latlng=${latlng}`,
    method: "GET",
  },
  {
    name: "proxy foodweb v2 merchant (no latlng)",
    url: `https://food.grab.com/proxy/foodweb/v2/merchants/${merchantId}`,
    method: "GET",
  },
  // Delvplatform API
  {
    name: "delvplatform merchant",
    url: `https://food.grab.com/proxy/delvplatformapi/v1/merchants/${merchantId}?latlng=${latlng}`,
    method: "GET",
  },
  {
    name: "p.grab.com delvplatform",
    url: `https://p.grab.com/delvplatformapi/v1/merchants/${merchantId}`,
    method: "GET",
  },
  // Foodpax API
  {
    name: "foodpaxapi merchant",
    url: `https://food.grab.com/proxy/foodpaxapi/v1/restaurants/${merchantId}`,
    method: "GET",
  },
  // Try with different API versions
  {
    name: "proxy foodweb v1 merchant",
    url: `https://food.grab.com/proxy/foodweb/v1/merchants/${merchantId}`,
    method: "GET",
  },
  // Search via proxy
  {
    name: "proxy foodweb v2 search",
    url: "https://food.grab.com/proxy/foodweb/v2/search",
    method: "POST",
    body: { latlng, keyword: "Subway", offset: 0, pageSize: 5 },
  },
];

for (const ep of endpoints) {
  try {
    console.log(`\n--- ${ep.name} ---`);
    console.log(`${ep.method} ${ep.url}`);
    const opts = {
      method: ep.method,
      headers: { ...HEADERS, ...(ep.body ? { "Content-Type": "application/json" } : {}) },
    };
    if (ep.body) opts.body = JSON.stringify(ep.body);
    const r = await fetch(ep.url, opts);
    console.log(`Status: ${r.status}`);
    const ct = r.headers.get("content-type") || "";
    if (r.status < 500) {
      const text = await r.text();
      if (text.startsWith("{") || text.startsWith("[")) {
        const data = JSON.parse(text);
        console.log(`Keys: ${Object.keys(data)}`);
        // Check for menu data
        const str = JSON.stringify(data);
        if (str.includes("menu") || str.includes("categ") || str.includes("item")) {
          console.log("*** CONTAINS MENU-RELATED DATA ***");
        }
        console.log(`Sample: ${str.slice(0, 800)}`);
      } else {
        console.log(`HTML response (${text.length} chars)`);
      }
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

// Alternative: Try to get cookies first by visiting the page, then use them
console.log("\n\n=== Cookie-based approach ===");
try {
  // First visit the page to get cookies
  const pageRes = await fetch("https://food.grab.com/sg/en/restaurant/subway-jurong-point-delivery/SGDD09484", {
    headers: {
      ...HEADERS,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    redirect: "manual",
  });
  const cookies = pageRes.headers.getSetCookie?.() || [];
  console.log(`Cookies received: ${cookies.length}`);
  for (const c of cookies.slice(0, 5)) {
    console.log(`  ${c.split(";")[0]}`);
  }

  // Now try API with cookies
  if (cookies.length > 0) {
    const cookieStr = cookies.map(c => c.split(";")[0]).join("; ");
    const apiRes = await fetch(`https://portal.grab.com/foodweb/v2/merchants/${merchantId}?latlng=${latlng}`, {
      headers: {
        ...HEADERS,
        Cookie: cookieStr,
      },
    });
    console.log(`\nAPI with cookies - Status: ${apiRes.status}`);
    if (apiRes.ok) {
      const data = await apiRes.json();
      console.log(`Keys: ${Object.keys(data)}`);
      console.log(`Sample: ${JSON.stringify(data).slice(0, 500)}`);
    }
  }
} catch (e) {
  console.log(`Error: ${e.message}`);
}
