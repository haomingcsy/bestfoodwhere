// Deep dive into GrabFood restaurant page __NEXT_DATA__ payload

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-SG,en;q=0.9",
};

const url = "https://food.grab.com/sg/en/restaurant/subway-jurong-point-delivery/SGDD09484";
console.log(`Fetching ${url}...`);

const res = await fetch(url, { headers: HEADERS });
const html = await res.text();

const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
if (!nextDataMatch) {
  console.log("No __NEXT_DATA__ found");
  process.exit(1);
}

const nextData = JSON.parse(nextDataMatch[1]);
const pageProps = nextData.props?.pageProps || {};

console.log("\n=== PageProps Structure ===");
console.log("Top-level keys:", Object.keys(pageProps));

const payload = pageProps.payload;
if (payload) {
  console.log("\n=== Payload Structure ===");
  console.log("Payload keys:", Object.keys(payload));

  // Explore merchant/restaurant info
  if (payload.merchant) {
    console.log("\n--- Merchant Info ---");
    const m = payload.merchant;
    console.log("Merchant keys:", Object.keys(m));
    console.log("Name:", m.name || m.chainName);
    console.log("ID:", m.ID || m.id || m.merchantID);
    console.log("Address:", m.address);
    console.log("Rating:", m.rating);
  }

  // Explore menu data
  if (payload.menu) {
    console.log("\n--- Menu Data ---");
    const menu = payload.menu;
    console.log("Menu keys:", Object.keys(menu));
    console.log("Menu type:", typeof menu);

    if (menu.categories) {
      console.log(`\nCategories: ${menu.categories.length}`);
      for (const cat of menu.categories.slice(0, 3)) {
        console.log(`\n  Category: ${cat.name || cat.title}`);
        console.log(`  Category keys: ${Object.keys(cat)}`);
        if (cat.items || cat.products) {
          const items = cat.items || cat.products;
          console.log(`  Items count: ${items.length}`);
          for (const item of items.slice(0, 2)) {
            console.log(`    Item keys: ${Object.keys(item)}`);
            console.log(`    Name: ${item.name || item.title}`);
            console.log(`    Price: ${item.price || item.priceInMinorUnit || item.displayPrice}`);
            console.log(`    Desc: ${(item.description || "").slice(0, 100)}`);
            console.log(`    Image: ${item.imgHref || item.imageURL || item.imgUrl || item.image}`);
          }
        }
      }
    }
  }

  // Check for other menu-like structures
  for (const key of Object.keys(payload)) {
    const val = payload[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const subkeys = Object.keys(val);
      if (subkeys.length > 0) {
        console.log(`\n--- payload.${key} ---`);
        console.log(`  Keys: ${subkeys.slice(0, 10).join(", ")}`);
        if (Array.isArray(val.categories) || Array.isArray(val.items) || Array.isArray(val.sections)) {
          console.log(`  HAS ARRAY DATA: categories=${val.categories?.length} items=${val.items?.length} sections=${val.sections?.length}`);
        }
      }
    } else if (Array.isArray(val)) {
      console.log(`\n--- payload.${key} (array) ---`);
      console.log(`  Length: ${val.length}`);
      if (val.length > 0 && typeof val[0] === "object") {
        console.log(`  First item keys: ${Object.keys(val[0]).slice(0, 10).join(", ")}`);
      }
    }
  }
}

// Also check initialReduxState
const reduxState = pageProps.initialReduxState || pageProps.routeState?.initialReduxState;
if (reduxState) {
  console.log("\n=== Redux State ===");
  console.log("Redux keys:", Object.keys(reduxState));
}

// Print full payload as JSON (limited)
console.log("\n=== Full Payload (first 3000 chars) ===");
console.log(JSON.stringify(payload, null, 2).slice(0, 3000));
