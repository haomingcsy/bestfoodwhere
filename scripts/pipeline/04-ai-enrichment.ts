/**
 * 04-ai-enrichment.ts
 *
 * AI enrichment pipeline that generates descriptions, amenities, and
 * recommendations for all brands using Claude AI (Haiku).
 *
 * Processes brands that have not yet been enriched (ai_description IS NULL).
 * For each brand, gathers context from brand_locations + mall_restaurants +
 * menu_items, then calls Claude to generate structured content.
 *
 * Usage:
 *   npx tsx scripts/pipeline/04-ai-enrichment.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

config({ path: resolve(__dirname, "../../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

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

const CONCURRENCY = 5;
const BATCH_DELAY_MS = 200;
const PROGRESS_LOG_INTERVAL = 25;
const MODEL = "claude-haiku-4-5-20251001";

const VALID_AMENITIES = [
  "WiFi",
  "Halal Certified",
  "Vegetarian Options",
  "Kid-Friendly",
  "Wheelchair Accessible",
  "Outdoor Seating",
  "Air Conditioned",
  "Accepts Credit Card",
  "Delivery Available",
  "Takeaway Available",
  "Reservation Available",
  "Pet-Friendly Area",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BrandMenuRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  ai_description: string | null;
}

interface MallRestaurantData {
  name: string;
  rating: number | null;
  review_count: number | null;
  cuisines: string[] | null;
  dining_styles: string[] | null;
  opening_hours: string | null;
}

interface BrandLocationRow {
  mall_slug: string;
  location_name: string;
  mall_restaurant_id: string | null;
  mall_restaurants: MallRestaurantData | null;
}

interface MenuItemRow {
  name: string;
  price: number | null;
}

interface AIResponse {
  description: string;
  amenities: string[];
  recommendations: string[];
}

interface ProcessingStats {
  success: number;
  failed: number;
  skipped: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Split an array into chunks of a given size. */
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/** Sleep for a given number of milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Filter amenities to only valid options. */
function filterAmenities(amenities: string[]): string[] {
  const validSet = new Set<string>(VALID_AMENITIES);
  return amenities.filter((a) => validSet.has(a));
}

// ---------------------------------------------------------------------------
// Data Gathering
// ---------------------------------------------------------------------------

async function fetchBrandLocations(
  brandId: string,
): Promise<BrandLocationRow[]> {
  const { data, error } = await supabase
    .from("brand_locations")
    .select(
      "mall_slug, location_name, mall_restaurant_id, mall_restaurants(name, rating, review_count, cuisines, dining_styles, opening_hours)",
    )
    .eq("brand_menu_id", brandId);

  if (error) {
    console.error(
      `  Error fetching locations for brand ${brandId}:`,
      error.message,
    );
    return [];
  }

  return (data as unknown as BrandLocationRow[]) || [];
}

async function fetchMenuItems(brandId: string): Promise<MenuItemRow[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("name, price")
    .eq("brand_menu_id", brandId)
    .limit(10);

  if (error) {
    console.error(
      `  Error fetching menu items for brand ${brandId}:`,
      error.message,
    );
    return [];
  }

  return (data as MenuItemRow[]) || [];
}

// ---------------------------------------------------------------------------
// Prompt Building
// ---------------------------------------------------------------------------

function buildPrompt(
  brand: BrandMenuRow,
  locations: BrandLocationRow[],
  menuItems: MenuItemRow[],
): string {
  // Gather location/mall names
  const mallNames = locations
    .map((l) => l.location_name)
    .filter(Boolean)
    .join(", ");

  // Find the first location with valid mall_restaurants data
  const linkedLocation = locations.find((l) => l.mall_restaurants !== null);
  const mr = linkedLocation?.mall_restaurants;

  const cuisines =
    mr?.cuisines && mr.cuisines.length > 0
      ? mr.cuisines.join(", ")
      : "Not specified";

  const diningStyles =
    mr?.dining_styles && mr.dining_styles.length > 0
      ? mr.dining_styles.join(", ")
      : "Not specified";

  const rating =
    mr?.rating !== null && mr?.rating !== undefined
      ? `${mr.rating}/5`
      : "Not available";

  const reviewCount =
    mr?.review_count !== null && mr?.review_count !== undefined
      ? `${mr.review_count} reviews`
      : "No reviews";

  const openingHours = mr?.opening_hours || "Not available";

  const menuItemsList =
    menuItems.length > 0
      ? menuItems.map((item) => item.name).join(", ")
      : "Not available";

  // Hash brand name to pick a unique opener instruction from a large pool
  let hash = 0;
  for (let i = 0; i < brand.name.length; i++) {
    hash = ((hash << 5) - hash + brand.name.charCodeAt(i)) | 0;
  }

  const openers = [
    `Your first sentence MUST start with a specific dish name from the menu (e.g., "Their Mala Xiang Guo..." or "One bite of the Rendang...").`,
    `Your first sentence MUST start with a texture or flavor word (e.g., "Crispy, golden, and dripping with..." or "Silky smooth congee that...").`,
    `Your first sentence MUST start with a question (e.g., "Ever had laksa so rich you..." or "Know that feeling when...").`,
    `Your first sentence MUST start with a time reference (e.g., "On a rainy Tuesday afternoon..." or "Late-night hunger at 10pm...").`,
    `Your first sentence MUST start with "Forget..." followed by a common alternative (e.g., "Forget the chain pizza places..." or "Forget instant ramen...").`,
    `Your first sentence MUST be a one-line verdict (e.g., "Best fried chicken thigh in Bedok, no contest." or "Finally, a poke bowl that doesn't skimp.").`,
    `Your first sentence MUST start with a person reference (e.g., "Your colleague who always knows where to eat..." or "That uncle in front of you just ordered...").`,
    `Your first sentence MUST describe what you smell or hear first (e.g., "Charcoal smoke hits you from ten metres away..." or "You hear the sizzle before you see it...").`,
    `Your first sentence MUST start with a contrast (e.g., "Tiny stall, massive portions." or "Looks like a simple noodle shop — until the broth arrives.").`,
    `Your first sentence MUST reference the neighborhood or mall vibe (e.g., "Sandwiched between fast fashion and a phone shop..." or "After circling the carpark at JEM...").`,
    `Your first sentence MUST start with an action (e.g., "Grab a number, pick your spice level, and brace yourself." or "Queue up, scan the QR code, and watch them hand-pull your noodles.").`,
    `Your first sentence MUST include a price reference (e.g., "Under $8 for a full set meal that actually fills you up..." or "Worth every cent of the $15 donburi...").`,
    `Your first sentence MUST start with "Don't sleep on..." or "Don't skip..." (e.g., "Don't sleep on the prawn paste chicken here..." or "Don't skip the side of garlic naan...").`,
    `Your first sentence MUST be a direct comparison (e.g., "If Genki Sushi is your everyday fix, this is your special occasion." or "Imagine your favourite hawker upgraded to air-con comfort.").`,
    `Your first sentence MUST start with a confession or hot take (e.g., "Honestly? I didn't expect much from a mall food court stall." or "Hot take: their chilli crab pasta beats most actual chilli crab.").`,
    `Your first sentence MUST reference a specific ingredient (e.g., "They source their wagyu from..." or "Real charcoal, not gas — and you can taste the difference.").`,
    `Your first sentence MUST start with "Here's the thing about..." (e.g., "Here's the thing about their fishball noodles — they make the fishballs fresh daily.").`,
    `Your first sentence MUST describe the crowd or vibe (e.g., "Office workers in shirts, families with strollers, teenagers on dates — everyone's here for the same thing." or "It's always packed at noon and empty by 2pm, which tells you everything.").`,
    `Your first sentence MUST use a memory or nostalgia angle (e.g., "Tastes like the kaya toast your grandma used to make..." or "Reminds you of that roadside stall in Bangkok...").`,
    `Your first sentence MUST start with "Order the..." as a direct recommendation (e.g., "Order the truffle mushroom pizza and thank me later." or "Order the set lunch — it's the only way to go here.").`,
  ];

  const openerIdx = Math.abs(hash) % openers.length;
  const openerInstruction = openers[openerIdx];

  return `You are writing a short restaurant blurb for BestFoodWhere.sg.

Restaurant: ${brand.name}
Location(s): ${mallNames || "Singapore"}
Cuisine: ${cuisines}
Style: ${diningStyles}
Menu highlights: ${menuItemsList}

CRITICAL RULES — follow these EXACTLY:
1. ${openerInstruction}
2. Write exactly 2-3 sentences total. Warm, specific, sounds like a real person who ate here.
3. Mention at least one SPECIFIC menu item by name.
4. BANNED opening words/phrases — if your description starts with ANY of these, it will be REJECTED:
   "This is where", "The moment you", "Walking into", "Walk into", "There's something",
   "If you're", "Tucked", "Nestled", "Indulge", "Step into", "Welcome to", "Located in",
   "Situated", "Experience", "Discover", "Immerse"
5. No star ratings, no review counts, no corporate language.

Generate JSON:
{
  "description": "your 2-3 sentence blurb following rule #1 exactly",
  "recommendations": ["dish1", "dish2", "dish3"]
}
recommendations = 3-5 must-try dishes using ACTUAL menu item names above when available.

Return ONLY valid JSON, no markdown.`;
}

// ---------------------------------------------------------------------------
// AI Call
// ---------------------------------------------------------------------------

async function callClaude(
  prompt: string,
): Promise<{ parsed: AIResponse; inputTokens: number; outputTokens: number }> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;

  // Extract text content
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in Claude response");
  }

  const rawText = textBlock.text.trim();

  // Attempt to parse JSON - handle possible markdown wrapping
  let jsonStr = rawText;
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  let parsed: AIResponse;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${rawText}`);
  }

  // Validate and sanitize
  if (!parsed.description || typeof parsed.description !== "string") {
    throw new Error("Missing or invalid 'description' in AI response");
  }

  // Reject descriptions that start with banned phrases
  const bannedStarts = [
    "this is where", "the moment you", "walking into", "walk into",
    "there's something", "if you're", "tucked", "nestled", "indulge",
    "step into", "welcome to", "located in", "situated", "experience",
    "discover", "immerse",
  ];
  const lowerDesc = parsed.description.toLowerCase();
  for (const banned of bannedStarts) {
    if (lowerDesc.startsWith(banned)) {
      throw new Error(`Description starts with banned phrase "${banned}": ${parsed.description.substring(0, 80)}`);
    }
  }

  if (!Array.isArray(parsed.amenities)) {
    parsed.amenities = [];
  }
  parsed.amenities = filterAmenities(parsed.amenities);

  if (!Array.isArray(parsed.recommendations)) {
    parsed.recommendations = [];
  }
  parsed.recommendations = parsed.recommendations
    .filter((r) => typeof r === "string" && r.trim().length > 0)
    .slice(0, 5);

  return { parsed, inputTokens, outputTokens };
}

// ---------------------------------------------------------------------------
// Brand Processing
// ---------------------------------------------------------------------------

async function processBrand(
  brand: BrandMenuRow,
  stats: ProcessingStats,
  forceAll = false,
): Promise<void> {
  // Double-check: skip if already enriched (unless forcing)
  if (brand.ai_description && !forceAll) {
    stats.skipped++;
    return;
  }

  try {
    // Gather context data
    const [locations, menuItems] = await Promise.all([
      fetchBrandLocations(brand.id),
      fetchMenuItems(brand.id),
    ]);

    // Build prompt and call Claude (retry once if banned phrase detected)
    const prompt = buildPrompt(brand, locations, menuItems);
    let result: { parsed: AIResponse; inputTokens: number; outputTokens: number };
    try {
      result = await callClaude(prompt);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("banned phrase")) {
        // Retry once
        result = await callClaude(prompt);
      } else {
        throw e;
      }
    }
    const { parsed, inputTokens, outputTokens } = result;

    stats.totalInputTokens += inputTokens;
    stats.totalOutputTokens += outputTokens;

    // Prepare the update payload
    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      ai_description: parsed.description,
      ai_amenities: parsed.amenities,
      ai_recommendations: parsed.recommendations,
      ai_description_generated_at: now,
    };

    // Also set description if it's currently null or forcing
    if (!brand.description || forceAll) {
      updatePayload.description = parsed.description;
    }

    // Update brand_menus
    const { error: updateError } = await supabase
      .from("brand_menus")
      .update(updatePayload)
      .eq("id", brand.id);

    if (updateError) {
      throw new Error(`Supabase update failed: ${updateError.message}`);
    }

    // Log success to enrichment_jobs
    await supabase.from("enrichment_jobs").insert({
      brand_menu_id: brand.id,
      job_type: "full_enrichment",
      status: "completed",
      tokens_input: inputTokens,
      tokens_output: outputTokens,
      model_used: MODEL,
      completed_at: now,
    });

    stats.success++;
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error(`  FAILED: ${brand.name} (${brand.slug}): ${errorMessage}`);

    // Log failure to enrichment_jobs
    await supabase.from("enrichment_jobs").insert({
      brand_menu_id: brand.id,
      job_type: "full_enrichment",
      status: "failed",
      error_message: errorMessage,
      model_used: MODEL,
      completed_at: new Date().toISOString(),
    });

    stats.failed++;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const forceAll = process.argv.includes("--force");

  console.log("=== 04-ai-enrichment ===");
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  if (forceAll) console.log("Mode: FORCE (regenerating all descriptions)");
  console.log("");

  // -------------------------------------------------------------------------
  // Step 1: Fetch brands
  // -------------------------------------------------------------------------
  console.log("Fetching brands that need AI enrichment...");

  const allBrands: BrandMenuRow[] = [];
  const PAGE_SIZE = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from("brand_menus")
      .select("id, slug, name, description, ai_description");

    if (!forceAll) {
      query = query.is("ai_description", null);
    }

    const { data, error } = await query.range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching brand_menus:", error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allBrands.push(...(data as BrandMenuRow[]));
      offset += PAGE_SIZE;
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      }
    }
  }

  console.log(`Found ${allBrands.length} brands to enrich.`);

  if (allBrands.length === 0) {
    console.log("Nothing to do. All brands already have AI descriptions.");
    return;
  }

  console.log("");

  // -------------------------------------------------------------------------
  // Step 2: Process brands in concurrent batches
  // -------------------------------------------------------------------------
  console.log("Starting AI enrichment...");

  const stats: ProcessingStats = {
    success: 0,
    failed: 0,
    skipped: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
  };

  const batches = chunk(allBrands, CONCURRENCY);
  let processed = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    // Process batch concurrently
    await Promise.all(batch.map((brand) => processBrand(brand, stats, forceAll)));

    processed += batch.length;

    // Log progress at intervals
    if (processed % PROGRESS_LOG_INTERVAL === 0 || i === batches.length - 1) {
      console.log(
        `  Progress: ${processed}/${allBrands.length} processed ` +
          `(${stats.success} success, ${stats.failed} failed, ${stats.skipped} skipped)`,
      );
    }

    // Delay between batches to avoid rate limiting
    if (i < batches.length - 1) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  const inputCost = (stats.totalInputTokens / 1_000_000) * 0.8;
  const outputCost = (stats.totalOutputTokens / 1_000_000) * 4.0;
  const totalCost = inputCost + outputCost;

  console.log("");
  console.log("=== AI Enrichment Complete ===");
  console.log(`  Total brands processed: ${allBrands.length}`);
  console.log(`  Successful:             ${stats.success}`);
  console.log(`  Failed:                 ${stats.failed}`);
  console.log(`  Skipped:                ${stats.skipped}`);
  console.log("");
  console.log("=== Token Usage ===");
  console.log(
    `  Input tokens:           ${stats.totalInputTokens.toLocaleString()}`,
  );
  console.log(
    `  Output tokens:          ${stats.totalOutputTokens.toLocaleString()}`,
  );
  console.log(
    `  Estimated cost:         $${totalCost.toFixed(4)} (input: $${inputCost.toFixed(4)}, output: $${outputCost.toFixed(4)})`,
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
