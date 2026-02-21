import { readFileSync } from "fs";

// Test GrabFood API endpoints to see what works without browser automation

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-SG,en;q=0.9",
  "Origin": "https://food.grab.com",
  "Referer": "https://food.grab.com/",
};

async function testSearch(query) {
  console.log(`\n=== Testing GrabFood Search for "${query}" ===\n`);

  // Approach 1: Direct API POST to portal.grab.com
  try {
    console.log("1. Trying portal.grab.com/foodweb/v2/search...");
    const res = await fetch("https://portal.grab.com/foodweb/v2/search", {
      method: "POST",
      headers: {
        ...HEADERS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        latlng: "1.3521,103.8198", // Singapore center
        keyword: query,
        offset: 0,
        pageSize: 10,
      }),
    });
    console.log(`   Status: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`   Response keys: ${Object.keys(data)}`);
      console.log(`   Sample: ${JSON.stringify(data).slice(0, 500)}`);
    } else {
      const text = await res.text();
      console.log(`   Body: ${text.slice(0, 300)}`);
    }
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }

  // Approach 2: Fetch HTML from food.grab.com search page and look for __NEXT_DATA__
  try {
    console.log("\n2. Trying food.grab.com/sg/en/search HTML...");
    const url = `https://food.grab.com/sg/en/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        ...HEADERS,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    console.log(`   Status: ${res.status}`);
    const html = await res.text();
    console.log(`   HTML length: ${html.length}`);

    // Look for __NEXT_DATA__
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (nextDataMatch) {
      console.log("   Found __NEXT_DATA__!");
      const nextData = JSON.parse(nextDataMatch[1]);
      console.log(`   Keys: ${Object.keys(nextData)}`);
      console.log(`   Props keys: ${Object.keys(nextData.props?.pageProps || {})}`);
      console.log(`   Sample: ${JSON.stringify(nextData.props?.pageProps).slice(0, 500)}`);
    } else {
      console.log("   No __NEXT_DATA__ found");
      // Check for other embedded JSON
      const scriptTags = html.match(/<script[^>]*>([^<]{100,})<\/script>/gs);
      console.log(`   Script tags with content: ${scriptTags?.length || 0}`);
      if (scriptTags) {
        for (const tag of scriptTags.slice(0, 3)) {
          const content = tag.replace(/<\/?script[^>]*>/g, "").slice(0, 200);
          console.log(`   Script preview: ${content}`);
        }
      }
    }
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }
}

async function testRestaurantPage(slug) {
  console.log(`\n=== Testing GrabFood Restaurant Page ===\n`);

  // Approach 1: Fetch restaurant page HTML
  try {
    const url = `https://food.grab.com/sg/en/restaurant/${slug}`;
    console.log(`1. Fetching ${url}...`);
    const res = await fetch(url, {
      headers: {
        ...HEADERS,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    console.log(`   Status: ${res.status}`);
    const html = await res.text();
    console.log(`   HTML length: ${html.length}`);

    // Look for __NEXT_DATA__
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (nextDataMatch) {
      console.log("   Found __NEXT_DATA__!");
      const nextData = JSON.parse(nextDataMatch[1]);
      console.log(`   Keys: ${Object.keys(nextData)}`);
      const pageProps = nextData.props?.pageProps || {};
      console.log(`   PageProps keys: ${Object.keys(pageProps)}`);
      // Look for menu data
      if (pageProps.merchant || pageProps.restaurant || pageProps.menu) {
        console.log("   FOUND MENU DATA in pageProps!");
        console.log(`   Menu sample: ${JSON.stringify(pageProps.merchant || pageProps.restaurant || pageProps.menu).slice(0, 1000)}`);
      }
    } else {
      console.log("   No __NEXT_DATA__ found");
      // Check for window.__INITIAL_STATE__ or similar
      const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});/s);
      if (stateMatch) {
        console.log("   Found __INITIAL_STATE__!");
        console.log(`   Sample: ${stateMatch[1].slice(0, 500)}`);
      }
    }
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }

  // Approach 2: Try merchant API directly
  try {
    console.log("\n2. Trying portal.grab.com/foodweb/v2/merchants...");
    // Extract merchant ID from slug if available
    const idMatch = slug.match(/([A-Z]{2,}[0-9]+)$/);
    if (idMatch) {
      const merchantId = idMatch[1];
      const res = await fetch(`https://portal.grab.com/foodweb/v2/merchants/${merchantId}`, {
        headers: HEADERS,
      });
      console.log(`   Status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`   Keys: ${Object.keys(data)}`);
        console.log(`   Sample: ${JSON.stringify(data).slice(0, 1000)}`);
      } else {
        const text = await res.text();
        console.log(`   Body: ${text.slice(0, 300)}`);
      }
    }
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }
}

// Test with a well-known Singapore restaurant
await testSearch("Subway");
await testRestaurantPage("subway-jurong-point-delivery/SGDD09484");

console.log("\n=== Done ===");
