// Extract menu data from FoodPanda restaurant page HTML

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,*/*",
  "Accept-Language": "en-SG,en;q=0.9",
};

console.log("Fetching FoodPanda Subway page...");
const res = await fetch("https://www.foodpanda.sg/restaurant/v5iy/subway-jurong-point", { headers: HEADERS });
const html = await res.text();
console.log(`HTML: ${html.length} chars`);

// Look for JSON-LD with menu data
const jsonLdBlocks = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
if (jsonLdBlocks) {
  console.log(`\n=== JSON-LD Blocks: ${jsonLdBlocks.length} ===`);
  for (let i = 0; i < jsonLdBlocks.length; i++) {
    const content = jsonLdBlocks[i].replace(/<\/?script[^>]*>/g, "");
    try {
      const data = JSON.parse(content);
      console.log(`\nBlock ${i}: @type=${data["@type"]}`);
      if (data.hasMenu || data.menu || data["@type"] === "Menu" || data["@type"] === "Restaurant") {
        console.log("*** HAS MENU DATA ***");
        console.log(JSON.stringify(data).slice(0, 2000));
      } else {
        console.log(`Keys: ${Object.keys(data).slice(0, 10)}`);
      }
    } catch (e) {
      console.log(`Block ${i}: parse error`);
    }
  }
}

// Look for embedded state / redux data
const statePatterns = [
  { name: "__NEXT_DATA__", regex: /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/ },
  { name: "window.__data", regex: /window\.__data\s*=\s*([\s\S]*?)\s*;\s*(?:window\.|<\/script)/ },
  { name: "window.__INITIAL", regex: /window\.__INITIAL[^=]*=\s*([\s\S]*?)\s*;\s*(?:window\.|<\/script)/ },
  { name: "props data", regex: /"pageProps"\s*:\s*(\{[\s\S]*?\})\s*,\s*"[a-zA-Z]/ },
];

for (const { name, regex } of statePatterns) {
  const m = html.match(regex);
  if (m) {
    console.log(`\n=== ${name} found ===`);
    try {
      const data = JSON.parse(m[1]);
      console.log(`Type: ${typeof data}`);
      if (typeof data === "object") {
        console.log(`Keys: ${Object.keys(data)}`);
        // Recursively look for menus/items/categories
        function findMenuData(obj, path = "") {
          if (!obj || typeof obj !== "object") return;
          for (const key of Object.keys(obj)) {
            const lk = key.toLowerCase();
            if (lk.includes("menu") || lk.includes("categor") || lk.includes("product")) {
              const val = obj[key];
              if (Array.isArray(val) && val.length > 0) {
                console.log(`  ${path}.${key}: [${val.length} items]`);
                if (typeof val[0] === "object") {
                  console.log(`    First: ${JSON.stringify(val[0]).slice(0, 300)}`);
                }
              } else if (val && typeof val === "object") {
                console.log(`  ${path}.${key}: {${Object.keys(val).slice(0, 5)}}`);
              }
            }
            if (typeof obj[key] === "object" && path.split(".").length < 4) {
              findMenuData(obj[key], `${path}.${key}`);
            }
          }
        }
        findMenuData(data, name);
      }
    } catch (e) {
      console.log(`Parse error: ${e.message}`);
      console.log(`Raw (500 chars): ${m[1].slice(0, 500)}`);
    }
  }
}

// Direct pattern matching for menu items in HTML
console.log("\n=== Direct Pattern Search ===");

// Search for price patterns in the HTML
const priceMatches = html.match(/\$\d+\.\d{2}/g);
if (priceMatches) {
  const unique = [...new Set(priceMatches)];
  console.log(`\nPrices found: ${unique.length} unique`);
  console.log(`Samples: ${unique.slice(0, 20).join(", ")}`);
}

// Search for menu section patterns
const menuSectionPatches = [
  /"name"\s*:\s*"[^"]+"\s*,\s*"description"\s*:\s*"[^"]*"\s*,\s*"price"/g,
  /"product_name"\s*:\s*"[^"]+"/g,
  /"item_name"\s*:\s*"[^"]+"/g,
  /"menuCategories"/g,
  /"menu_categories"/g,
];

for (const pat of menuSectionPatches) {
  const matches = html.match(pat);
  if (matches) {
    console.log(`\nPattern ${pat.source}: ${matches.length} matches`);
    for (const m of matches.slice(0, 3)) {
      console.log(`  ${m.slice(0, 150)}`);
    }
  }
}

// Try to find structured menu data by looking for common FoodPanda patterns
const fpPatterns = [
  /"menus"\s*:\s*\[/,
  /"toppings"\s*:/,
  /"menu_items"\s*:/,
  /"menuItems"\s*:/,
  /"dishes"\s*:/,
  /"food_characteristics"\s*:/,
];
for (const pat of fpPatterns) {
  const m = html.match(pat);
  if (m) {
    const idx = html.indexOf(m[0]);
    console.log(`\n*** ${pat.source} found at offset ${idx} ***`);
    console.log(html.slice(idx, idx + 500));
  }
}
