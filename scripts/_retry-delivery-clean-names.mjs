/**
 * Retry delivery app searches with cleaned brand names
 * Many brands were not found because the search used the full name with location suffix
 * e.g., "Gong Cha @ Waterway Point" → search "Gong Cha" instead
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { chromium } from "playwright";

config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const DRY_RUN = process.argv.includes("--dry-run");
const LIMIT = parseInt(process.argv.find(a => a.startsWith("--limit="))?.split("=")[1] || "999");

// Load progress
const PROGRESS_FILE = "scripts/.retry-delivery-progress.json";
let progress;
try {
  progress = JSON.parse(readFileSync(PROGRESS_FILE, "utf8"));
} catch {
  progress = { completed: {}, notFound: [] };
}

function saveProgress() {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

/**
 * Extract core brand name by removing location suffixes
 */
function cleanBrandName(name) {
  return name
    // Remove @ location
    .replace(/@\s*.+$/, "")
    // Remove - Location
    .replace(/\s*[-–]\s*(Jewel|NEX|JEM|Junction|Bedok|Suntec|VivoCity|ION|MBS|Orchard|Woodleigh|Novena|Causeway|AMK|Tampines|Waterway|Tiong|Marina|Plaza|Nex|IMM|Thomson|United|Lot).*/i, "")
    // Remove (Location)
    .replace(/\s*\([^)]*(?:Mall|City|Square|Point|Hub|Airport|Bay|Place|Centre|Orchard|Tampines|Bedok|Novena|Jurong)[^)]*\)\s*$/i, "")
    // Remove trailing location patterns
    .replace(/\s+(?:Jewel|NEX|JEM|Bedok|Suntec|VivoCity|Novena|AMK|Tampines)\s*$/i, "")
    .trim();
}

/**
 * Search GrabFood with a cleaned search term
 */
async function searchGrabFood(page, searchTerm) {
  const url = `https://food.grab.com/sg/en/restaurants?search=${encodeURIComponent(searchTerm)}&supportDelivery=true`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000);

  const title = await page.title();
  if (title.includes("400") || title.includes("403") || title.includes("Error")) {
    return { results: [], error: title };
  }

  const links = await page.$$eval('a[href*="/restaurant/"]', els =>
    els.map(el => ({
      href: el.getAttribute("href"),
      text: (el.textContent || "").trim().substring(0, 100),
    }))
  );

  return { results: links };
}

/**
 * Search Deliveroo with a cleaned search term
 */
async function searchDeliveroo(page, searchTerm) {
  const url = `https://deliveroo.com.sg/restaurants/singapore/singapore?q=${encodeURIComponent(searchTerm)}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000);

  const links = await page.$$eval('a[href*="/menu/"]', els =>
    els.map(el => ({
      href: el.getAttribute("href"),
      text: (el.textContent || "").trim().substring(0, 100),
    }))
  );

  return { results: links };
}

async function main() {
  console.log("=== Retry Delivery Search with Clean Names ===\n");
  if (DRY_RUN) console.log("*** DRY RUN ***\n");

  // Get brands with 0 items
  const { data: brands } = await sb.from("brand_menus")
    .select("slug, name, website_url")
    .eq("menu_item_count", 0)
    .order("name");

  // Filter to unprocessed
  const toProcess = brands.filter(b =>
    !progress.completed[b.slug] && !progress.notFound.includes(b.slug)
  ).slice(0, LIMIT);

  console.log(`Brands to process: ${toProcess.length} (of ${brands.length} with 0 items)`);
  console.log(`Already completed: ${Object.keys(progress.completed).length}`);
  console.log(`Not found: ${progress.notFound.length}\n`);

  if (toProcess.length === 0) {
    console.log("Nothing to process!");
    return;
  }

  // Show name cleaning preview
  console.log("Name cleaning preview:");
  for (const b of toProcess.slice(0, 10)) {
    const cleaned = cleanBrandName(b.name);
    if (cleaned !== b.name) {
      console.log(`  "${b.name}" → "${cleaned}"`);
    }
  }
  console.log("");

  // Only do the preview if dry-run
  if (DRY_RUN) {
    console.log("Full list of brands with cleaned names:");
    for (const b of toProcess) {
      const cleaned = cleanBrandName(b.name);
      const marker = cleaned !== b.name ? " → " + cleaned : "";
      console.log(`  ${b.slug}: ${b.name}${marker}`);
    }
    return;
  }

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  let context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
  });
  // Set Singapore location cookie for GrabFood
  await context.addCookies([{
    name: "location",
    value: encodeURIComponent(JSON.stringify({
      latitude: 1.3521, longitude: 103.8198,
      address: "Singapore", countryCode: "SG", isAccurate: true,
    })),
    domain: "food.grab.com",
    path: "/",
  }]);

  let page = await context.newPage();
  let searchCount = 0;
  let found = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const brand = toProcess[i];
    const cleanedName = cleanBrandName(brand.name);

    console.log(`[${i+1}/${toProcess.length}] ${brand.name} (${brand.slug})`);
    if (cleanedName !== brand.name) {
      console.log(`  Cleaned: "${cleanedName}"`);
    }

    // Rotate context every 15 searches
    searchCount++;
    if (searchCount % 15 === 0) {
      console.log("  🔄 Rotating browser context");
      await page.close();
      await context.close();
      context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        viewport: { width: 1280, height: 800 },
      });
      await context.addCookies([{
        name: "location",
        value: encodeURIComponent(JSON.stringify({
          latitude: 1.3521, longitude: 103.8198,
          address: "Singapore", countryCode: "SG", isAccurate: true,
        })),
        domain: "food.grab.com",
        path: "/",
      }]);
      page = await context.newPage();
    }

    try {
      // Try GrabFood first
      const grabResult = await searchGrabFood(page, cleanedName);
      if (grabResult.results.length > 0) {
        console.log(`  ✅ Found on GrabFood: ${grabResult.results.length} results`);
        console.log(`    Top: ${grabResult.results[0].text.substring(0, 60)}`);
        console.log(`    URL: ${grabResult.results[0].href}`);
        progress.completed[brand.slug] = { platform: "grabfood", results: grabResult.results.length };
        found++;
        saveProgress();
        await page.waitForTimeout(3000 + Math.random() * 2000);
        continue;
      }

      await page.waitForTimeout(2000);

      // Try Deliveroo
      const delResult = await searchDeliveroo(page, cleanedName);
      if (delResult.results.length > 0) {
        console.log(`  ✅ Found on Deliveroo: ${delResult.results.length} results`);
        console.log(`    Top: ${delResult.results[0].text.substring(0, 60)}`);
        progress.completed[brand.slug] = { platform: "deliveroo", results: delResult.results.length };
        found++;
        saveProgress();
        await page.waitForTimeout(3000 + Math.random() * 2000);
        continue;
      }

      console.log(`  ❌ Not found on either platform`);
      progress.notFound.push(brand.slug);
      saveProgress();

    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      progress.notFound.push(brand.slug);
      saveProgress();
    }

    await page.waitForTimeout(3000 + Math.random() * 3000);
  }

  await browser.close();

  console.log(`\n=== Summary ===`);
  console.log(`Searched: ${toProcess.length}`);
  console.log(`Found: ${found}`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
