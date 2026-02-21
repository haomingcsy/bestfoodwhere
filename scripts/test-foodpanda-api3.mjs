// Test Disco API with extracted client IDs

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-SG,en;q=0.9",
};

const clientIds = [
  "com.global.foodpanda.service",
  "AeP4GhDfjiEnkgT9ToLchUWuRchi8BWCSSSOF5p-DiXm4INqIWjlUVpMrNuA",
  "1771166975102.714290443286373227.camhp2kc1m",
];

const headerNames = [
  "x-disco-client-id",
  "x-fp-api-key",
  "x-pd-client-id",
  "perseus-client-id",
  "x-pandora-client-id",
];

const url = `https://disco.deliveryhero.io/listing/api/v1/pandora/vendors?country=sg&latitude=1.3521&longitude=103.8198&language_id=1&vertical=restaurants&q=Subway&limit=3`;

for (const clientId of clientIds) {
  for (const headerName of headerNames) {
    try {
      const r = await fetch(url, {
        headers: { ...HEADERS, [headerName]: clientId },
      });
      if (r.status !== 403) {
        console.log(`*** ${headerName}: "${clientId}" => Status ${r.status}`);
        if (r.ok) {
          const data = await r.json();
          console.log(`Keys: ${Object.keys(data)}`);
          console.log(`Sample: ${JSON.stringify(data).slice(0, 500)}`);
        } else {
          const text = await r.text();
          console.log(`Body: ${text.slice(0, 200)}`);
        }
      }
    } catch (e) {}
  }
}

// Also try the FoodPanda specific API endpoints
console.log("\n=== FoodPanda Vendor API ===");
const fpEndpoints = [
  "https://www.foodpanda.sg/api/v5/vendors?latitude=1.3521&longitude=103.8198&q=Subway&limit=3",
  "https://www.foodpanda.sg/api/restaurants?lat=1.3521&lng=103.8198&q=Subway",
  "https://sg.fd-api.com/api/v5/vendors?latitude=1.3521&longitude=103.8198&q=Subway&limit=3",
  "https://sg-api.foodpanda.com/api/v5/vendors?latitude=1.3521&longitude=103.8198&q=Subway&limit=3",
];

for (const epUrl of fpEndpoints) {
  try {
    console.log(`\nGET ${epUrl.split("?")[0]}...`);
    const r = await fetch(epUrl, { headers: HEADERS });
    console.log(`Status: ${r.status}`);
    if (r.ok) {
      const data = await r.json();
      console.log(`Keys: ${Object.keys(data)}`);
      console.log(`Sample: ${JSON.stringify(data).slice(0, 500)}`);
    } else if (r.status < 500) {
      const text = await r.text();
      console.log(`Body: ${text.slice(0, 200)}`);
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

// Try to get a FoodPanda restaurant menu page directly
console.log("\n=== FoodPanda Direct Menu Page ===");
const menuUrls = [
  "https://www.foodpanda.sg/restaurant/w9uw/subway",
  "https://www.foodpanda.sg/restaurant/v5iy/subway-jurong-point",
  "https://www.foodpanda.sg/chain/cg8lx/subway",
];
for (const mUrl of menuUrls) {
  try {
    const r = await fetch(mUrl, {
      headers: { ...HEADERS, Accept: "text/html,*/*" },
      redirect: "follow",
    });
    console.log(`\n${mUrl} => ${r.status}`);
    if (r.ok) {
      const html = await r.text();
      console.log(`HTML: ${html.length} chars`);
      // Check for menu data
      if (html.includes("menu") && html.includes("price")) {
        console.log("*** Contains menu/price references ***");
        // Look for JSON-LD
        const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
        if (jsonLd) {
          console.log(`JSON-LD blocks: ${jsonLd.length}`);
          for (const block of jsonLd.slice(0, 2)) {
            const content = block.replace(/<\/?script[^>]*>/g, "");
            console.log(`  ${content.slice(0, 300)}`);
          }
        }
        // Check for embedded vendor data
        const vendorData = html.match(/"menus"\s*:\s*\[/);
        if (vendorData) {
          const idx = html.indexOf(vendorData[0]);
          console.log(`\nMenus data at offset ${idx}:`);
          console.log(html.slice(idx, idx + 1000));
        }
      }
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}
