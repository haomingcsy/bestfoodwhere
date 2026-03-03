/**
 * Batch Generate Location-Specific SEO Meta Descriptions via Anthropic API
 *
 * Generates unique, playful meta descriptions for each brand_location page
 * (e.g. /menu/din-tai-fung/suntec-city) using Claude Haiku.
 * Each description is tailored to the specific restaurant location —
 * mentioning the mall, the brand's dishes, ratings, and what makes
 * that location special.
 *
 * Usage:
 *   npx tsx scripts/batch-generate-location-seo-descriptions.ts
 *   npx tsx scripts/batch-generate-location-seo-descriptions.ts --limit 10
 *   npx tsx scripts/batch-generate-location-seo-descriptions.ts --brand-slug mcdonalds
 *   npx tsx scripts/batch-generate-location-seo-descriptions.ts --skip-existing
 *   npx tsx scripts/batch-generate-location-seo-descriptions.ts --regenerate-all
 *   npx tsx scripts/batch-generate-location-seo-descriptions.ts --dry-run
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- CLI args ---
const args = process.argv.slice(2);
const getArg = (name: string) => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : undefined;
};
const hasFlag = (name: string) => args.includes(`--${name}`);

const LIMIT = getArg("limit") ? parseInt(getArg("limit")!) : undefined;
const BRAND_SLUG = getArg("brand-slug");
const SKIP_EXISTING = hasFlag("skip-existing");
const REGEN_ALL = hasFlag("regenerate-all");
const DRY_RUN = hasFlag("dry-run");
const VERBOSE = hasFlag("verbose");

// --- Types ---
interface LocationRow {
  id: string;
  brand_menu_id: string;
  mall_slug: string;
  location_name: string;
  ai_description: string | null;
}

interface BrandRow {
  id: string;
  slug: string;
  name: string;
}

interface MallRestaurantRow {
  cuisines: string[] | null;
  rating: number | null;
  review_count: number | null;
  price_range: string | null;
  dining_styles: string[] | null;
}

interface MenuItem {
  name: string;
}

// --- Style rotation for unique descriptions ---
const STYLE_POOL = [
  "Start with the brand name + location (e.g. '{brand} at {location} serves up…')",
  "Open with a specific dish name and what makes it special at this location.",
  "Lead with a location detail (e.g. 'Tucked inside {location}, …', 'At {location}, …')",
  "Start with a sensory word (sizzling, crispy, aromatic, tangy, smoky, golden, etc.).",
  "Open with what locals love about this particular outlet.",
  "Start with a number or statistic (e.g. 'With 50+ menu items…', 'Rated 4.5/5…')",
  "Lead with the cuisine type and what this location does best.",
  "Open with a direct action verb (Bite into, Sink your teeth into, Tuck into, etc.).",
  "Start with a fan/customer perspective (e.g. 'Regulars at {location} swear by…')",
  "Open from a mall-goer perspective (e.g. 'Shopping at {location}? Don't miss…')",
  "Lead with an ingredient or cooking technique that defines the brand's best seller.",
  "Start with a contrast or unexpected twist (e.g. 'Not your average mall {cuisine}…')",
  "Open with what makes this outlet worth the visit.",
  "Start with how this location compares (e.g. 'One of the best spots for…')",
  "Lead with the vibe or atmosphere of dining at this location.",
];

const BANNED_OPENERS = [
  "Experience", "Discover", "Craving", "Explore", "Indulge",
  "Step", "Savor", "Dive", "Treat yourself", "Welcome to",
  "Looking for", "Hungry for", "Taste the", "Delight in",
  "Embark", "Unleash", "Elevate", "Immerse",
];

// --- Build prompt for a single location ---
function buildPrompt(
  brand: BrandRow,
  locationName: string,
  mr: MallRestaurantRow | null,
  menuItems: MenuItem[],
  styleIndex: number
): string {
  const cuisines = mr?.cuisines
    ? Array.isArray(mr.cuisines) ? mr.cuisines : []
    : [];
  const cuisineStr = cuisines.length > 0 ? cuisines.join(", ") : "restaurant";
  const ratingStr = mr?.rating ? `${mr.rating}/5 (${mr.review_count || 0} reviews)` : "";
  const priceStr = mr?.price_range || "";
  const diningStyles = mr?.dining_styles
    ? Array.isArray(mr.dining_styles) ? mr.dining_styles.join(", ") : ""
    : "";
  const dishNames = menuItems.slice(0, 5).map((i) => i.name);
  const dishStr = dishNames.length > 0 ? dishNames.join(", ") : "";
  const style = STYLE_POOL[styleIndex % STYLE_POOL.length];

  return `Write a meta description for the ${brand.name} restaurant at ${locationName} in Singapore.

About: ${cuisineStr} restaurant${priceStr ? ` (${priceStr})` : ""}${ratingStr ? ` rated ${ratingStr}` : ""}${diningStyles ? `. Style: ${diningStyles}` : ""}.
Location: ${locationName} (a shopping mall in Singapore).
${dishStr ? `Popular dishes: ${dishStr}.` : ""}

WRITING STYLE (you MUST follow this): ${style.replace(/\{brand\}/g, brand.name).replace(/\{location\}/g, locationName).replace(/\{cuisine\}/g, cuisineStr)}

Goal: Make people want to click. Be specific — mention the LOCATION NAME (${locationName}), actual dishes, ratings, or what makes this outlet special.
Tone: Playful, fun, and confident. Write like a food-savvy local recommending a spot.
Rules:
- MUST be between 140-155 characters (count carefully, this is strict)
- NO emojis
- MUST mention "${locationName}" somewhere in the description
- Use the brand name exactly as given: "${brand.name}"
- BANNED first words: ${BANNED_OPENERS.join(", ")}. Do NOT start with any of these.
- Be specific. Generic descriptions like "diverse flavors await" are not allowed.
- Do NOT use star symbols or special rating characters. Use "4.5/5" format for ratings.
Return ONLY the meta description text, nothing else.`;
}

// --- Main ---
async function run() {
  console.log("=== Batch Location SEO Description Generator ===");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"} | Skip existing: ${SKIP_EXISTING}`);
  console.log();

  // 1. Fetch all active brands
  const { data: brands, error: brandError } = await supabase
    .from("brand_menus")
    .select("id, slug, name")
    .eq("is_active", true)
    .order("slug");

  if (brandError || !brands) {
    console.error("Failed to fetch brands:", brandError);
    return;
  }

  const brandMap: Record<string, BrandRow> = {};
  for (const b of brands) brandMap[b.id] = b;
  console.log(`Loaded ${brands.length} brands`);

  // 2. Fetch locations
  let locQuery = supabase
    .from("brand_locations")
    .select("id, brand_menu_id, mall_slug, location_name, ai_description, mall_restaurant_id")
    .order("mall_slug");

  if (BRAND_SLUG) {
    const brand = brands.find(b => b.slug === BRAND_SLUG);
    if (!brand) {
      console.error(`Brand slug "${BRAND_SLUG}" not found`);
      return;
    }
    locQuery = locQuery.eq("brand_menu_id", brand.id);
  }

  const { data: locations, error: locError } = await locQuery;
  if (locError || !locations) {
    console.error("Failed to fetch locations:", locError);
    return;
  }
  console.log(`Fetched ${locations.length} locations`);

  // 3. Fetch mall_restaurants for enrichment (batched to avoid URL length limits)
  const mrIds = [...new Set(
    locations.map((l: any) => l.mall_restaurant_id).filter(Boolean)
  )];
  const mrMap: Record<string, MallRestaurantRow> = {};
  const BATCH_SIZE = 50;
  for (let b = 0; b < mrIds.length; b += BATCH_SIZE) {
    const batch = mrIds.slice(b, b + BATCH_SIZE);
    const { data: mrRows } = await supabase.from("mall_restaurants")
      .select("id, cuisines, rating, review_count, price_range, dining_styles")
      .in("id", batch);
    for (const mr of mrRows || []) mrMap[mr.id] = mr;
  }
  console.log(`Loaded ${Object.keys(mrMap).length} mall restaurant entries`);

  // 4. Pre-fetch menu items per brand (to avoid N+1)
  const brandIds = [...new Set(locations.map((l: any) => l.brand_menu_id))];
  const menuItemMap: Record<string, MenuItem[]> = {};
  for (const bId of brandIds) {
    const { data: items } = await supabase
      .from("menu_items")
      .select("name, menu_categories!inner(brand_menu_id)")
      .eq("menu_categories.brand_menu_id", bId)
      .not("name", "is", null)
      .limit(8);

    menuItemMap[bId] = (items || [])
      .map((i: any) => ({ name: i.name }))
      .filter((i: MenuItem) => i.name && i.name.length <= 40);
  }
  console.log(`Pre-fetched menu items for ${brandIds.length} brands`);
  console.log();

  // 5. Process each location
  let processed = 0;
  let skipped = 0;
  let errors = 0;
  const toProcess = LIMIT ? locations.slice(0, LIMIT) : locations;

  for (let i = 0; i < toProcess.length; i++) {
    const loc = toProcess[i] as any;
    const brand = brandMap[loc.brand_menu_id];
    if (!brand) {
      if (VERBOSE) console.log(`  SKIP ${loc.location_name} (no active brand)`);
      skipped++;
      continue;
    }

    // Skip logic
    if (loc.ai_description && !REGEN_ALL) {
      if (SKIP_EXISTING) {
        skipped++;
        if (VERBOSE) console.log(`  SKIP ${brand.slug}/${loc.mall_slug} (has existing)`);
        continue;
      }
    }

    const mr = mrMap[loc.mall_restaurant_id] || null;
    const menuItems = menuItemMap[loc.brand_menu_id] || [];

    const prompt = buildPrompt(brand, loc.location_name, mr, menuItems, i);

    if (DRY_RUN) {
      console.log(`\n━━━ ${brand.name} @ ${loc.location_name} [style ${i % STYLE_POOL.length}] ━━━`);
      console.log(`  Cuisine: ${mr?.cuisines || "unknown"}`);
      console.log(`  Rating: ${mr?.rating || "n/a"} | Price: ${mr?.price_range || "n/a"}`);
      console.log(`  Menu items: ${menuItems.length} (${menuItems.slice(0, 3).map(i => i.name).join(", ")})`);
      console.log(`  Style: ${STYLE_POOL[i % STYLE_POOL.length]}`);
      console.log(`  [Would generate via API]`);
      processed++;
      continue;
    }

    // Call Anthropic API with retry
    try {
      let description = "";
      for (let attempt = 0; attempt < 4; attempt++) {
        let retryHint = "";
        if (attempt > 0 && description.length > 0) {
          const lenOk = description.length >= 130 && description.length <= 160;
          const firstWord = description.split(/\s/)[0];
          const openerBanned = BANNED_OPENERS.some(b =>
            description.toLowerCase().startsWith(b.toLowerCase())
          );
          const hasLocation = description.toLowerCase().includes(loc.location_name.toLowerCase());
          if (!lenOk) retryHint += ` Previous attempt was ${description.length} characters — MUST be 140-155.`;
          if (openerBanned) retryHint += ` You started with "${firstWord}" which is BANNED.`;
          if (!hasLocation) retryHint += ` You MUST mention "${loc.location_name}" in the description.`;
        }

        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 200,
          temperature: 1,
          messages: [{ role: "user", content: prompt + retryHint }],
        });

        description = (response.content[0] as any).text.trim();

        // Strip quotes
        if (description.startsWith('"') && description.endsWith('"')) {
          description = description.slice(1, -1);
        }

        const lenOk = description.length >= 130 && description.length <= 160;
        const openerOk = !BANNED_OPENERS.some(b =>
          description.toLowerCase().startsWith(b.toLowerCase())
        );
        if (lenOk && openerOk) break;
        if (VERBOSE) console.log(`    Retry ${attempt + 1}: ${description.length}c, opener=${description.split(/\s/)[0]}`);
      }

      // Save to DB
      const { error: updateError } = await supabase
        .from("brand_locations")
        .update({
          ai_description: description,
          ai_description_generated_at: new Date().toISOString(),
        })
        .eq("id", loc.id);

      if (updateError) {
        console.error(`  ✗ ${brand.slug}/${loc.mall_slug}: DB error:`, updateError.message);
        errors++;
      } else {
        processed++;
        console.log(`  ✓ ${brand.slug}/${loc.mall_slug} (${description.length}c): ${description}`);
      }

      // Rate limiting
      await new Promise((r) => setTimeout(r, 50));
    } catch (apiError: any) {
      console.error(`  ✗ ${brand.slug}/${loc.mall_slug}: API error:`, apiError.message);
      errors++;

      if (apiError.status === 429 || apiError.status === 529) {
        console.log(`  ${apiError.status === 429 ? "Rate limited" : "API overloaded"}, waiting 5s...`);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Processed: ${processed} | Skipped: ${skipped} | Errors: ${errors}`);
}

run();
