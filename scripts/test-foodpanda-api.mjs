// Test FoodPanda API endpoints

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-SG,en;q=0.9",
};

// 1. Test FoodPanda search
console.log("=== FoodPanda Search ===");
try {
  const searchUrl = "https://www.foodpanda.sg/restaurants/new?lat=1.3521&lng=103.8198&vertical=restaurants&q=Subway";
  const res = await fetch(searchUrl, {
    headers: { ...HEADERS, Accept: "text/html,*/*" },
  });
  console.log(`HTML page status: ${res.status}`);
  const html = await res.text();
  console.log(`HTML length: ${html.length}`);

  // Check for embedded data
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
  if (nextDataMatch) {
    console.log("Found __NEXT_DATA__!");
    const nd = JSON.parse(nextDataMatch[1]);
    console.log(`Keys: ${Object.keys(nd)}`);
    console.log(`PageProps keys: ${Object.keys(nd.props?.pageProps || {})}`);
    console.log(`Sample: ${JSON.stringify(nd.props?.pageProps).slice(0, 500)}`);
  }

  // Check for Delivery Hero disco API pattern
  const discoMatch = html.match(/disco\.deliveryhero\.io/);
  if (discoMatch) console.log("Found disco.deliveryhero.io reference!");

  const apiMatch = html.match(/(https?:\/\/[^"'\s]*api[^"'\s]*)/gi);
  if (apiMatch) {
    console.log("\nAPI URLs found in HTML:");
    const unique = [...new Set(apiMatch)].slice(0, 10);
    for (const u of unique) console.log(`  ${u}`);
  }
} catch (e) {
  console.log(`Error: ${e.message}`);
}

// 2. Test Delivery Hero disco API (FoodPanda's backend)
console.log("\n=== Delivery Hero Disco API ===");
const discoEndpoints = [
  `https://disco.deliveryhero.io/search/api/v1/feed?country=sg&latitude=1.3521&longitude=103.8198&language_id=1&customer_type=regular&vertical=restaurants&q=Subway&limit=5`,
  `https://disco.deliveryhero.io/listing/api/v1/pandora/vendors?country=sg&latitude=1.3521&longitude=103.8198&language_id=1&vertical=restaurants&q=Subway&limit=5`,
];

for (const url of discoEndpoints) {
  try {
    console.log(`\nGET ${url.split("?")[0]}...`);
    const res = await fetch(url, { headers: HEADERS });
    console.log(`Status: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`Keys: ${Object.keys(data)}`);
      console.log(`Sample: ${JSON.stringify(data).slice(0, 1000)}`);
    } else {
      const text = await res.text();
      console.log(`Body: ${text.slice(0, 300)}`);
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

// 3. Test FoodPanda restaurant page for embedded menu
console.log("\n=== FoodPanda Restaurant Page ===");
try {
  // Try a known Subway page
  const res = await fetch("https://www.foodpanda.sg/restaurant/w9uw/subway-jurong-point", {
    headers: { ...HEADERS, Accept: "text/html,*/*" },
  });
  console.log(`Status: ${res.status}`);
  if (res.ok) {
    const html = await res.text();
    console.log(`HTML length: ${html.length}`);
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (nextDataMatch) {
      const nd = JSON.parse(nextDataMatch[1]);
      const pp = nd.props?.pageProps || {};
      console.log(`PageProps keys: ${Object.keys(pp)}`);
      // Look for menu structure
      for (const key of Object.keys(pp)) {
        if (typeof pp[key] === "object" && pp[key]) {
          const subkeys = Array.isArray(pp[key]) ? `[array:${pp[key].length}]` : Object.keys(pp[key]).slice(0, 5).join(",");
          console.log(`  ${key}: ${subkeys}`);
        }
      }
      console.log(`\nFull pageProps (first 2000): ${JSON.stringify(pp).slice(0, 2000)}`);
    }
  }
} catch (e) {
  console.log(`Error: ${e.message}`);
}

// 4. Test Deliveroo
console.log("\n=== Deliveroo ===");
try {
  const res = await fetch("https://deliveroo.com.sg/restaurants/singapore/downtown?q=Subway", {
    headers: { ...HEADERS, Accept: "text/html,*/*" },
  });
  console.log(`Status: ${res.status}`);
  if (res.ok) {
    const html = await res.text();
    console.log(`HTML length: ${html.length}`);
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (nextDataMatch) {
      console.log("Found __NEXT_DATA__!");
      const nd = JSON.parse(nextDataMatch[1]);
      console.log(`PageProps keys: ${Object.keys(nd.props?.pageProps || {})}`);
    }
    // Check for JSON-LD or embedded data
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs);
    if (jsonLdMatch) {
      console.log(`Found ${jsonLdMatch.length} JSON-LD blocks`);
      for (const block of jsonLdMatch.slice(0, 2)) {
        const content = block.replace(/<\/?script[^>]*>/g, "");
        console.log(`  ${content.slice(0, 300)}`);
      }
    }
  }
} catch (e) {
  console.log(`Error: ${e.message}`);
}
