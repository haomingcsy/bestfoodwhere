// Extract FoodPanda client ID and test Disco API

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,*/*",
  "Accept-Language": "en-SG,en;q=0.9",
};

// 1. Fetch FoodPanda page and extract embedded data / client IDs
console.log("=== Fetching FoodPanda page ===");
const res = await fetch("https://www.foodpanda.sg/restaurants/new?lat=1.3521&lng=103.8198&vertical=restaurants", {
  headers: HEADERS,
});
const html = await res.text();
console.log(`HTML length: ${html.length}`);

// Look for client IDs, API keys, etc
const patterns = [
  /["']?clientId["']?\s*[:=]\s*["']([^"']+)["']/gi,
  /["']?client[_-]?id["']?\s*[:=]\s*["']([^"']+)["']/gi,
  /["']?x-disco-client-id["']?\s*[:=]\s*["']([^"']+)["']/gi,
  /["']?apiKey["']?\s*[:=]\s*["']([^"']+)["']/gi,
  /disco\.deliveryhero\.io[^"'\s]*/gi,
];

for (const pat of patterns) {
  const matches = html.match(pat);
  if (matches) {
    console.log(`\nPattern ${pat.source}:`);
    const unique = [...new Set(matches)].slice(0, 5);
    for (const m of unique) console.log(`  ${m}`);
  }
}

// Look for __NEXT_DATA__ or similar embedded state
const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
if (nextDataMatch) {
  console.log("\n__NEXT_DATA__ found!");
  try {
    const nd = JSON.parse(nextDataMatch[1]);
    console.log(`Keys: ${Object.keys(nd)}`);
    if (nd.props?.pageProps) {
      const pp = nd.props.pageProps;
      console.log(`PageProps keys: ${Object.keys(pp)}`);
      // Look for restaurants/vendors data
      for (const key of Object.keys(pp)) {
        const val = pp[key];
        if (Array.isArray(val) && val.length > 0) {
          console.log(`  ${key}: [array:${val.length}]`);
          if (typeof val[0] === "object") {
            console.log(`    First item keys: ${Object.keys(val[0]).slice(0, 10)}`);
          }
        } else if (typeof val === "object" && val !== null) {
          console.log(`  ${key}: {${Object.keys(val).slice(0, 8).join(",")}}`);
        }
      }
    }
    // Look for runtime config
    if (nd.runtimeConfig) {
      console.log(`\nRuntimeConfig: ${JSON.stringify(nd.runtimeConfig).slice(0, 1000)}`);
    }
  } catch (e) {
    console.log(`Parse error: ${e.message}`);
  }
} else {
  console.log("\nNo __NEXT_DATA__");
}

// Look for window.__INITIAL_STATE__ or window.__APP_CONTEXT__
const statePatterns = [
  /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/,
  /window\.__APP_CONTEXT__\s*=\s*(\{[\s\S]*?\});/,
  /window\.__PRELOADED_STATE__\s*=\s*(\{[\s\S]*?\});/,
  /window\.App\s*=\s*(\{[\s\S]*?\});/,
];

for (const pat of statePatterns) {
  const m = html.match(pat);
  if (m) {
    console.log(`\nFound ${pat.source}!`);
    console.log(`Sample: ${m[1].slice(0, 500)}`);
  }
}

// Check for vendors/restaurant listing data embedded anywhere
const vendorMatch = html.match(/"vendors"\s*:\s*\[/);
if (vendorMatch) {
  console.log("\n*** Found 'vendors' array in HTML ***");
  const idx = html.indexOf(vendorMatch[0]);
  console.log(`Context: ${html.slice(idx, idx + 500)}`);
}

// 2. Try Disco API with common FoodPanda client IDs
console.log("\n\n=== Testing Disco API with Client IDs ===");
const clientIds = [
  "pandora",
  "foodpanda-sg",
  "foodpanda",
  "sg",
  "FP_SG",
];

for (const clientId of clientIds) {
  try {
    const url = `https://disco.deliveryhero.io/listing/api/v1/pandora/vendors?country=sg&latitude=1.3521&longitude=103.8198&language_id=1&vertical=restaurants&q=Subway&limit=3`;
    const r = await fetch(url, {
      headers: {
        ...HEADERS,
        Accept: "application/json",
        "x-disco-client-id": clientId,
      },
    });
    console.log(`\nClient ID "${clientId}": Status ${r.status}`);
    if (r.ok) {
      const data = await r.json();
      console.log(`Keys: ${Object.keys(data)}`);
      console.log(`Sample: ${JSON.stringify(data).slice(0, 500)}`);
    } else if (r.status < 500) {
      const text = await r.text();
      console.log(`Response: ${text.slice(0, 200)}`);
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}
