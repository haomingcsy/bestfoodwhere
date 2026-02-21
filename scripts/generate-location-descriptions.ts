/**
 * generate-location-descriptions.ts
 *
 * Generates unique per-location descriptions for all restaurant locations
 * in the brand_locations table. Each description is 3-5 sentences tailored
 * to the specific mall, mentioning neighborhood, vibe, and menu items.
 *
 * One AI call per brand generates descriptions for ALL its locations at once,
 * ensuring cross-location uniqueness within a brand.
 *
 * After generation, stores in Supabase brand_locations.description AND
 * writes back to Google Sheets Assessment column D.
 *
 * Usage:
 *   npx tsx scripts/generate-location-descriptions.ts
 *   npx tsx scripts/generate-location-descriptions.ts --dry-run
 *   npx tsx scripts/generate-location-descriptions.ts --brand=four-leaves
 *   npx tsx scripts/generate-location-descriptions.ts --skip-sheets
 *   npx tsx scripts/generate-location-descriptions.ts --regenerate
 *   npx tsx scripts/generate-location-descriptions.ts --sheets-only
 */

import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { google } from "googleapis";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

if (!ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY in .env.local");
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONCURRENCY = 3;
const BATCH_DELAY_MS = 300;
const PROGRESS_LOG_INTERVAL = 25;
const MODEL = "claude-haiku-4-5-20251001";
const PAGE_SIZE = 1000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BrandRow {
  id: string;
  slug: string;
  name: string;
  ai_description: string | null;
}

interface LocationRow {
  id: string;
  brand_menu_id: string;
  mall_slug: string;
  location_name: string;
  description: string | null;
  mall_restaurant_id: string | null;
}

interface MallRow {
  slug: string;
  name: string;
}

interface MallRestaurantRow {
  id: string;
  rating: number | null;
  review_count: number | null;
  cuisines: string[] | null;
}

interface MenuItemRow {
  name: string;
}

interface ProcessingStats {
  brandsProcessed: number;
  brandsTotal: number;
  locationsUpdated: number;
  failed: number;
  skipped: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

// ---------------------------------------------------------------------------
// CLI Flag Parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const SKIP_SHEETS = args.includes("--skip-sheets");
const SHEETS_ONLY = args.includes("--sheets-only");
const BRAND_FLAG = args.find((a) => a.startsWith("--brand="));
const BRAND_SLUG = BRAND_FLAG ? BRAND_FLAG.split("=")[1] : null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Paginated Fetchers
// ---------------------------------------------------------------------------

async function fetchAllBrands(): Promise<BrandRow[]> {
  const allBrands: BrandRow[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from("brand_menus")
      .select("id, slug, name, ai_description");

    if (BRAND_SLUG) {
      query = query.eq("slug", BRAND_SLUG);
    }

    const { data, error } = await query.range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching brand_menus:", error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allBrands.push(...(data as BrandRow[]));
      offset += PAGE_SIZE;
      if (data.length < PAGE_SIZE) hasMore = false;
    }
  }

  return allBrands;
}

async function fetchAllLocations(): Promise<LocationRow[]> {
  const allLocations: LocationRow[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("brand_locations")
      .select(
        "id, brand_menu_id, mall_slug, location_name, description, mall_restaurant_id",
      )
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching brand_locations:", error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allLocations.push(...(data as LocationRow[]));
      offset += PAGE_SIZE;
      if (data.length < PAGE_SIZE) hasMore = false;
    }
  }

  return allLocations;
}

async function fetchAllMalls(): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from("shopping_malls")
    .select("slug, name");

  if (error) {
    console.error("Error fetching shopping_malls:", error.message);
    process.exit(1);
  }

  const mallMap = new Map<string, string>();
  for (const row of (data as MallRow[]) || []) {
    mallMap.set(row.slug, row.name);
  }
  return mallMap;
}

async function fetchMenuItems(brandId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("name")
    .eq("brand_menu_id", brandId)
    .limit(15);

  if (error) {
    console.error(
      `  Error fetching menu items for brand ${brandId}:`,
      error.message,
    );
    return [];
  }

  return ((data as MenuItemRow[]) || []).map((item) => item.name);
}

async function fetchMallRestaurantData(
  ids: string[],
): Promise<Map<string, MallRestaurantRow>> {
  if (ids.length === 0) return new Map();

  const { data, error } = await supabase
    .from("mall_restaurants")
    .select("id, rating, review_count, cuisines")
    .in("id", ids);

  if (error) {
    console.error("Error fetching mall_restaurants:", error.message);
    return new Map();
  }

  const map = new Map<string, MallRestaurantRow>();
  for (const row of (data as MallRestaurantRow[]) || []) {
    map.set(row.id, row);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Prompt Building
// ---------------------------------------------------------------------------

function buildPrompt(
  brand: BrandRow,
  locations: LocationRow[],
  mallNames: Map<string, string>,
  menuItems: string[],
  mallRestaurants: Map<string, MallRestaurantRow>,
): string {
  // Derive cuisine from mall_restaurants data
  const allCuisines = new Set<string>();
  for (const loc of locations) {
    const mr = loc.mall_restaurant_id
      ? mallRestaurants.get(loc.mall_restaurant_id)
      : null;
    if (mr?.cuisines) {
      for (const c of mr.cuisines) allCuisines.add(c);
    }
  }
  const cuisine = allCuisines.size > 0 ? Array.from(allCuisines).join(", ") : "Various";
  const menuHighlights =
    menuItems.length > 0 ? menuItems.join(", ") : "Not available";

  const locationLines = locations
    .map((loc) => {
      const mallName = mallNames.get(loc.mall_slug) || loc.location_name;
      const mr = loc.mall_restaurant_id
        ? mallRestaurants.get(loc.mall_restaurant_id)
        : null;
      const rating = mr?.rating ? `${mr.rating}/5` : "N/A";
      const reviewCount = mr?.review_count ? `${mr.review_count} reviews` : "N/A";
      return `- ${mallName} (Rating: ${rating}, ${reviewCount})`;
    })
    .join("\n");

  const mallSlugs = locations.map((loc) => loc.mall_slug).join(", ");

  return `You write punchy, food-obsessed location blurbs for BestFoodWhere.sg.

Brand: ${brand.name}
Cuisine: ${cuisine}
Menu items: ${menuHighlights}

Locations:
${locationLines}

For EACH location write 2-3 SHORT sentences (max 80 words total). Rules:
- Lead with the FOOD. What should someone order? What's the star dish? What flavour hits you?
- Be specific about actual menu items — name dishes, describe textures, flavours, ingredients
- Keep it savory, appetizing, and a little playful — like a foodie friend giving you the inside scoop
- Drop one fun food fact, insider tip, or "did you know" if you can (e.g. "their sambal is made fresh daily", "the laksa broth simmers for 8 hours")
- You may mention the mall name once naturally, but do NOT describe the mall, neighborhood, MRT, foot traffic, or crowds
- NEVER open with: "Nestled", "Tucked", "Welcome", "Step into", "Located", "Situated", "This branch", "Found in", "Head to", "Swing by", "Pop into"
- NO filler like "perfect for", "whether you're", "if you're looking for", "something for everyone"
- Each location must read completely differently — vary sentence structure and which dishes you highlight

Return ONLY valid JSON:
{
  "${locations[0]?.mall_slug || "example-slug"}": "Description..."${locations.length > 1 ? `,\n  "${locations[1]?.mall_slug || "example-slug-2"}": "Description..."` : ""}
}

Keys must be: ${mallSlugs}`;
}

// ---------------------------------------------------------------------------
// AI Call
// ---------------------------------------------------------------------------

async function callClaude(
  prompt: string,
): Promise<{
  parsed: Record<string, string>;
  inputTokens: number;
  outputTokens: number;
}> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in Claude response");
  }

  const rawText = textBlock.text.trim();

  // Attempt to parse JSON — handle possible markdown wrapping
  let jsonStr = rawText;
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  let parsed: Record<string, string>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${rawText.substring(0, 200)}`);
  }

  // Validate that all values are strings
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value !== "string") {
      throw new Error(
        `Invalid value for mall slug "${key}": expected string, got ${typeof value}`,
      );
    }
  }

  return { parsed, inputTokens, outputTokens };
}

// ---------------------------------------------------------------------------
// Brand Processing
// ---------------------------------------------------------------------------

async function processBrand(
  brand: BrandRow,
  brandLocations: LocationRow[],
  mallNames: Map<string, string>,
  stats: ProcessingStats,
): Promise<void> {
  // In REGENERATE mode, process all locations regardless of existing descriptions
  const REGENERATE = args.includes("--regenerate");
  if (!REGENERATE) {
    // Skip if ALL locations already have descriptions
    const locationsNeedingDescriptions = brandLocations.filter(
      (loc) => !loc.description,
    );

    if (locationsNeedingDescriptions.length === 0) {
      stats.skipped += brandLocations.length;
      return;
    }
  }

  try {
    // Fetch context data for this brand
    const mallRestaurantIds = brandLocations
      .map((loc) => loc.mall_restaurant_id)
      .filter((id): id is string => id !== null);

    const [menuItems, mallRestaurants] = await Promise.all([
      fetchMenuItems(brand.id),
      fetchMallRestaurantData(mallRestaurantIds),
    ]);

    // Build prompt for ALL locations (not just missing ones) to ensure cross-location uniqueness
    const prompt = buildPrompt(
      brand,
      brandLocations,
      mallNames,
      menuItems,
      mallRestaurants,
    );

    if (DRY_RUN) {
      console.log(`\n--- DRY RUN: ${brand.name} (${brand.slug}) ---`);
      console.log(
        `Locations: ${brandLocations.map((l) => l.location_name).join(", ")}`,
      );
      console.log(`Prompt length: ${prompt.length} chars`);
      console.log(`Prompt preview:\n${prompt.substring(0, 500)}...\n`);
      stats.brandsProcessed++;
      return;
    }

    // Call Claude
    const { parsed, inputTokens, outputTokens } = await callClaude(prompt);
    stats.totalInputTokens += inputTokens;
    stats.totalOutputTokens += outputTokens;

    // Update each location in Supabase
    let updatedCount = 0;
    for (const loc of brandLocations) {
      const description = parsed[loc.mall_slug];
      if (!description) {
        console.warn(
          `  Warning: No description returned for ${brand.name} @ ${loc.mall_slug}`,
        );
        continue;
      }

      // Only update if location didn't already have a description (unless --regenerate)
      if (loc.description && !args.includes("--regenerate")) {
        continue;
      }

      const { error: updateError } = await supabase
        .from("brand_locations")
        .update({ description })
        .eq("brand_menu_id", brand.id)
        .eq("mall_slug", loc.mall_slug);

      if (updateError) {
        console.error(
          `  Error updating ${brand.name} @ ${loc.mall_slug}: ${updateError.message}`,
        );
        continue;
      }

      updatedCount++;
    }

    stats.locationsUpdated += updatedCount;
    stats.brandsProcessed++;
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error(`  FAILED: ${brand.name} (${brand.slug}): ${errorMessage}`);
    stats.failed++;
  }
}

// ---------------------------------------------------------------------------
// Google Sheets Write-back
// ---------------------------------------------------------------------------

async function writeToGoogleSheets(
  brands: BrandRow[],
  locationsByBrand: Map<string, LocationRow[]>,
  mallNames: Map<string, string>,
): Promise<number> {
  if (!SPREADSHEET_ID) {
    console.error(
      "Missing GOOGLE_SHEETS_SPREADSHEET_ID — skipping Sheets write-back",
    );
    return 0;
  }

  console.log("\n--- Google Sheets Write-back ---");

  const auth = new google.auth.GoogleAuth({
    keyFile: resolve(__dirname, "../genial-retina-485114-u9-766fc0022b06.json"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // Read column A to map brand names to row numbers
  const { data: nameData } = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Assessment!A3:A1000",
  });

  const sheetNames: string[] = (nameData?.values || []).map(
    (row: string[]) => (row[0] || "").trim(),
  );

  // Build a map: lowercase brand name -> row numbers (1-indexed, starting at row 3)
  // Use arrays to handle duplicate brand names in the spreadsheet
  const nameToRows = new Map<string, number[]>();
  for (let i = 0; i < sheetNames.length; i++) {
    if (sheetNames[i]) {
      const key = sheetNames[i].toLowerCase();
      const existing = nameToRows.get(key) || [];
      existing.push(i + 3);
      nameToRows.set(key, existing);
    }
  }

  // Build all updates in memory first, then batch-write
  const updateData: { range: string; values: string[][] }[] = [];

  for (const brand of brands) {
    const rowNumbers = nameToRows.get(brand.name.toLowerCase());
    if (!rowNumbers || rowNumbers.length === 0) continue;

    const locations = locationsByBrand.get(brand.id);
    if (!locations || locations.length === 0) continue;

    // Fetch current descriptions from Supabase for this brand
    const { data: currentLocs, error } = await supabase
      .from("brand_locations")
      .select("mall_slug, location_name, description")
      .eq("brand_menu_id", brand.id)
      .order("location_name", { ascending: true });

    if (error || !currentLocs) continue;

    const locsWithDesc = currentLocs.filter(
      (loc: { description: string | null }) => loc.description,
    );
    if (locsWithDesc.length === 0) continue;

    // Format in D3 style: "Mall Name -\nDescription paragraph.\n\nMall Name 2 -\n..."
    const formattedDescription = locsWithDesc
      .map(
        (loc: { mall_slug: string; location_name: string; description: string }) => {
          const displayName = mallNames.get(loc.mall_slug) || loc.location_name;
          return `${displayName} -\n${loc.description}`;
        },
      )
      .join("\n\n");

    // Write to ALL rows with this brand name (handles duplicates)
    for (const rowNumber of rowNumbers) {
      updateData.push({
        range: `Assessment!D${rowNumber}`,
        values: [[formattedDescription]],
      });
    }
  }

  // Second pass: fuzzy match for sheet rows that weren't matched by exact name.
  // Some brands in Supabase have location-suffixed names like "Beauty in The Pot at VivoCity"
  // but the sheet has the consolidated name "Beauty in The Pot".
  const matchedRows = new Set(updateData.map((u) => u.range));
  for (let i = 0; i < sheetNames.length; i++) {
    const sheetName = sheetNames[i];
    if (!sheetName) continue;
    const rowNumber = i + 3;
    if (matchedRows.has(`Assessment!D${rowNumber}`)) continue;

    const sheetLower = sheetName.toLowerCase();
    // Normalize: strip punctuation, collapse whitespace for looser matching
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff\uac00-\ud7af]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    const sheetNorm = normalize(sheetName);
    const sheetCompact = sheetNorm.replace(/\s/g, "");

    // Find all Supabase brands whose name starts with or contains this sheet name
    const fuzzyBrands = brands.filter((b) => {
      const bn = b.name.toLowerCase();
      const bnNorm = normalize(b.name);
      const bnCompact = bnNorm.replace(/\s/g, "");
      return (
        bn.startsWith(sheetLower) ||
        sheetLower.startsWith(bn) ||
        bn.includes(sheetLower) ||
        bnNorm.startsWith(sheetNorm) ||
        sheetNorm.startsWith(bnNorm) ||
        bnNorm.includes(sheetNorm) ||
        bnCompact.startsWith(sheetCompact) ||
        sheetCompact.startsWith(bnCompact) ||
        bnCompact.includes(sheetCompact)
      );
    });

    if (fuzzyBrands.length === 0) continue;

    // Collect all location descriptions from these matching brands
    const allDescs: { mallSlug: string; description: string }[] = [];
    for (const fb of fuzzyBrands) {
      const { data: locs } = await supabase
        .from("brand_locations")
        .select("mall_slug, description")
        .eq("brand_menu_id", fb.id);
      if (!locs) continue;
      for (const loc of locs) {
        if (loc.description) {
          allDescs.push({
            mallSlug: loc.mall_slug,
            description: loc.description,
          });
        }
      }
    }

    if (allDescs.length === 0) continue;

    // Deduplicate by mall_slug (in case multiple brands cover the same location)
    const seenMalls = new Set<string>();
    const uniqueDescs = allDescs.filter((d) => {
      if (seenMalls.has(d.mallSlug)) return false;
      seenMalls.add(d.mallSlug);
      return true;
    });

    const formattedDescription = uniqueDescs
      .map((d) => {
        const displayName = mallNames.get(d.mallSlug) || d.mallSlug;
        return `${displayName} -\n${d.description}`;
      })
      .join("\n\n");

    updateData.push({
      range: `Assessment!D${rowNumber}`,
      values: [[formattedDescription]],
    });
    console.log(
      `  Fuzzy matched "${sheetName}" -> ${fuzzyBrands.length} brands, ${uniqueDescs.length} locations`,
    );
  }

  console.log(`  Prepared ${updateData.length} rows for batch update`);

  // Use batchUpdate to write all cells in a single API call
  try {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: "RAW",
        data: updateData,
      },
    });
    console.log(`  Batch update successful: ${updateData.length} rows written`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  Batch update failed: ${msg}`);
    return 0;
  }

  return updateData.length;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Location Description Generation ===");
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  if (DRY_RUN) console.log("Mode: DRY RUN (no writes)");
  if (BRAND_SLUG) console.log(`Filtering to brand: ${BRAND_SLUG}`);
  if (SKIP_SHEETS) console.log("Skipping Google Sheets write-back");
  if (args.includes("--regenerate")) console.log("Mode: REGENERATE (overwriting all existing descriptions)");
  if (SHEETS_ONLY) console.log("Mode: SHEETS ONLY (no AI generation)");
  console.log("");

  // -------------------------------------------------------------------------
  // Step 1: Fetch all data
  // -------------------------------------------------------------------------
  console.log("Fetching data from Supabase...");

  const [brands, allLocations, mallNames] = await Promise.all([
    fetchAllBrands(),
    fetchAllLocations(),
    fetchAllMalls(),
  ]);

  console.log(`  Brands: ${brands.length}`);
  console.log(`  Locations: ${allLocations.length}`);
  console.log(`  Malls: ${mallNames.size}`);
  console.log("");

  // Group locations by brand_menu_id
  const locationsByBrand = new Map<string, LocationRow[]>();
  for (const loc of allLocations) {
    const existing = locationsByBrand.get(loc.brand_menu_id) || [];
    existing.push(loc);
    locationsByBrand.set(loc.brand_menu_id, existing);
  }

  // -------------------------------------------------------------------------
  // Step 2: If --sheets-only, skip to Sheets write-back
  // -------------------------------------------------------------------------
  if (SHEETS_ONLY) {
    console.log("Skipping AI generation (--sheets-only mode).");
    const sheetsUpdated = await writeToGoogleSheets(
      brands,
      locationsByBrand,
      mallNames,
    );
    console.log("");
    console.log("=== Location Description Generation Complete ===");
    console.log(`Google Sheets: Updated ${sheetsUpdated} rows in Assessment column D`);
    return;
  }

  // -------------------------------------------------------------------------
  // Step 3: Filter to brands that have locations needing descriptions
  // -------------------------------------------------------------------------
  const REGENERATE_ALL = args.includes("--regenerate");
  const brandsToProcess = brands.filter((brand) => {
    const locs = locationsByBrand.get(brand.id);
    if (!locs || locs.length === 0) return false;
    if (REGENERATE_ALL) return true;
    // Process if at least one location is missing a description
    return locs.some((loc) => !loc.description);
  });

  console.log(
    `Brands needing location descriptions: ${brandsToProcess.length}/${brands.length}`,
  );

  if (brandsToProcess.length === 0 && !DRY_RUN) {
    console.log(
      "Nothing to do. All locations already have descriptions.",
    );

    if (!SKIP_SHEETS) {
      const sheetsUpdated = await writeToGoogleSheets(
        brands,
        locationsByBrand,
        mallNames,
      );
      console.log("");
      console.log("=== Location Description Generation Complete ===");
      console.log(
        `Google Sheets: Updated ${sheetsUpdated} rows in Assessment column D`,
      );
    }
    return;
  }

  // -------------------------------------------------------------------------
  // Step 4: Process brands (AI generation)
  // -------------------------------------------------------------------------
  const stats: ProcessingStats = {
    brandsProcessed: 0,
    brandsTotal: brandsToProcess.length,
    locationsUpdated: 0,
    failed: 0,
    skipped: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
  };

  // In dry-run mode, only process 3 sample brands
  const brandsForProcessing = DRY_RUN
    ? brandsToProcess.slice(0, 3)
    : brandsToProcess;

  console.log(
    `\nStarting AI generation for ${brandsForProcessing.length} brands...`,
  );

  const batches = chunk(brandsForProcessing, CONCURRENCY);
  let totalProcessed = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    await Promise.all(
      batch.map((brand) => {
        const locs = locationsByBrand.get(brand.id) || [];
        return processBrand(brand, locs, mallNames, stats);
      }),
    );

    totalProcessed += batch.length;

    // Log progress at intervals
    if (
      totalProcessed % PROGRESS_LOG_INTERVAL === 0 ||
      i === batches.length - 1
    ) {
      console.log(
        `  Progress: ${totalProcessed}/${brandsForProcessing.length} brands ` +
          `(${stats.locationsUpdated} locations updated, ${stats.failed} failed, ${stats.skipped} skipped)`,
      );
    }

    // Delay between batches
    if (i < batches.length - 1) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  // -------------------------------------------------------------------------
  // Step 5: Google Sheets write-back
  // -------------------------------------------------------------------------
  let sheetsUpdated = 0;
  if (!SKIP_SHEETS && !DRY_RUN) {
    // Re-fetch locations to get updated descriptions
    const updatedLocations = await fetchAllLocations();
    const updatedLocationsByBrand = new Map<string, LocationRow[]>();
    for (const loc of updatedLocations) {
      const existing = updatedLocationsByBrand.get(loc.brand_menu_id) || [];
      existing.push(loc);
      updatedLocationsByBrand.set(loc.brand_menu_id, existing);
    }

    sheetsUpdated = await writeToGoogleSheets(
      brands,
      updatedLocationsByBrand,
      mallNames,
    );
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  const inputCost = (stats.totalInputTokens / 1_000_000) * 0.8;
  const outputCost = (stats.totalOutputTokens / 1_000_000) * 4.0;
  const totalCost = inputCost + outputCost;

  console.log("");
  console.log("=== Location Description Generation Complete ===");
  console.log(
    `Brands processed: ${stats.brandsProcessed}/${stats.brandsTotal}`,
  );
  console.log(`Locations updated: ${stats.locationsUpdated}/1056`);
  console.log(`Failed: ${stats.failed}`);
  console.log(
    `Skipped (already had descriptions): ${stats.skipped}`,
  );
  console.log(
    `Total input tokens: ${stats.totalInputTokens.toLocaleString()}`,
  );
  console.log(
    `Total output tokens: ${stats.totalOutputTokens.toLocaleString()}`,
  );
  console.log(`Estimated cost: $${totalCost.toFixed(2)}`);

  if (!SKIP_SHEETS && !DRY_RUN) {
    console.log("");
    console.log(
      `Google Sheets: Updated ${sheetsUpdated} rows in Assessment column D`,
    );
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
