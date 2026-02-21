// Deep search for menu data in FoodPanda HTML

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,*/*",
  "Accept-Language": "en-SG,en;q=0.9",
};

const res = await fetch("https://www.foodpanda.sg/restaurant/v5iy/subway-jurong-point", { headers: HEADERS });
const html = await res.text();

// Search for Subway-specific menu item names to see if they're in the HTML
const subwayItems = ["Italian BMT", "Meatball", "Chicken Teriyaki", "Tuna", "Veggie Delight", "Turkey", "Egg Mayo"];
console.log("=== Searching for Subway menu items in HTML ===");
for (const item of subwayItems) {
  const found = html.includes(item);
  if (found) {
    const idx = html.indexOf(item);
    console.log(`\n"${item}" FOUND at offset ${idx}!`);
    // Show context
    const start = Math.max(0, idx - 100);
    const end = Math.min(html.length, idx + 200);
    console.log(`Context: ...${html.slice(start, end)}...`);
  } else {
    console.log(`"${item}" - not found`);
  }
}

// Also search for price numbers near "Subway" or menu-like content
console.log("\n=== Searching for price patterns near food items ===");
// Find all <script> tags that might contain menu data
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
let match;
let scriptNum = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  const content = match[1];
  if (content.length > 1000 && (content.includes("price") || content.includes("menu"))) {
    scriptNum++;
    console.log(`\nScript #${scriptNum} (${content.length} chars) contains price/menu:`);

    // Find price contexts
    const priceIdxs = [];
    let searchFrom = 0;
    while (true) {
      const pi = content.indexOf('"price"', searchFrom);
      if (pi === -1) break;
      priceIdxs.push(pi);
      searchFrom = pi + 7;
      if (priceIdxs.length >= 5) break;
    }

    for (const pi of priceIdxs) {
      const ctx = content.slice(Math.max(0, pi - 200), pi + 100);
      console.log(`  price context: ${ctx.slice(0, 300)}`);
      console.log("---");
    }
  }
}

// Check if the page uses SSR and includes __APOLLO_STATE__ or similar
const apolloMatch = html.match(/__APOLLO_STATE__/);
if (apolloMatch) console.log("\n*** Found __APOLLO_STATE__ ***");

// Look for vendor data with menus
const vendorMenuMatch = html.match(/"vendor"\s*:\s*\{/);
if (vendorMenuMatch) {
  const idx = html.indexOf(vendorMenuMatch[0]);
  console.log(`\n*** Found vendor object at ${idx} ***`);
  // Extract a large chunk
  const chunk = html.slice(idx, idx + 5000);
  // Try to find the menu section
  const menuIdx = chunk.indexOf('"menu');
  if (menuIdx > -1) {
    console.log(`Menu found at offset ${idx + menuIdx}`);
    console.log(chunk.slice(menuIdx, menuIdx + 1000));
  } else {
    console.log("No menu in vendor object");
    console.log(`Vendor keys context: ${chunk.slice(0, 500)}`);
  }
}

// Look for the page's Redux/Zustand store data
// FoodPanda uses Redux - search for the initial state
const reduxPatterns = [
  /window\.__REDUX_STATE__/,
  /window\.__STORE_STATE__/,
  /"initialState"/,
  /"preloadedState"/,
  /"vendorMenus"/,
  /"vendorMenu"/,
];
for (const pat of reduxPatterns) {
  if (pat.test(html)) {
    console.log(`\n*** Found ${pat.source} ***`);
    const idx = html.search(pat);
    console.log(html.slice(idx, idx + 300));
  }
}
