/**
 * Batch Generate SEO Meta Descriptions via Anthropic API
 *
 * Generates unique, playful meta descriptions for all brand menu pages
 * using Claude Haiku. Each description is tailored to the restaurant's
 * actual menu items, cuisine, location, and brand character.
 *
 * Usage:
 *   npx tsx scripts/batch-generate-seo-descriptions.ts
 *   npx tsx scripts/batch-generate-seo-descriptions.ts --limit 10
 *   npx tsx scripts/batch-generate-seo-descriptions.ts --slug mcdonalds
 *   npx tsx scripts/batch-generate-seo-descriptions.ts --skip-existing
 *   npx tsx scripts/batch-generate-seo-descriptions.ts --regenerate-all
 *   npx tsx scripts/batch-generate-seo-descriptions.ts --dry-run
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
const SLUG_FILTER = getArg("slug");
const SKIP_EXISTING = hasFlag("skip-existing");
const FIX_BAD = hasFlag("fix-bad");
const REGEN_ALL = hasFlag("regenerate-all");
const DRY_RUN = hasFlag("dry-run");
const VERBOSE = hasFlag("verbose");

const EMOJI_RE = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu;

// --- Types ---
interface BrandRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  ai_description: string | null;
  amenities: string[] | null;
  menu_item_count: number | null;
}

interface MallRestaurantRow {
  slug: string;
  name: string;
  cuisines: string[] | string | null;
  rating: number | null;
  review_count: number | null;
  price_range: string | null;
}

interface MenuItem {
  name: string;
  price: number | null;
}

// --- Style rotation for unique descriptions ---
const STYLE_POOL = [
  "Start with the brand name doing something (e.g. '{brand} serves up…', '{brand} brings…')",
  "Open with a specific dish name or flavor as the hook.",
  "Start with a bold claim or surprising fact about the brand.",
  "Open with a question that hooks the reader.",
  "Lead with a location detail (e.g. 'At {location}, …', 'Tucked inside {location}, …')",
  "Start with a sensory word (sizzling, crispy, aromatic, tangy, smoky, golden, etc.).",
  "Open with what sets this brand apart from the rest.",
  "Start with a number or statistic (e.g. 'With 50+ menu items…', 'Rated 4.5/5…')",
  "Lead with the cuisine's origin or heritage story.",
  "Open with a direct action verb (Bite into, Sink your teeth into, Tuck into, etc.).",
  "Start with how long the brand has been around or its reputation.",
  "Open from a fan/customer perspective (e.g. 'Locals swear by…', 'Fans can't stop raving…')",
  "Start with the type of experience (e.g. 'A cozy corner for…', 'The go-to spot for…')",
  "Open with a contrast or unexpected twist (e.g. 'Not your average…', 'Forget boring…')",
  "Lead with an ingredient or cooking technique that defines the brand.",
];

const BANNED_OPENERS = [
  "Experience", "Discover", "Craving", "Explore", "Indulge",
  "Step", "Savor", "Dive", "Treat yourself", "Welcome to",
  "Looking for", "Hungry for", "Taste the", "Delight in",
  "Embark", "Unleash", "Elevate", "Immerse",
];

// --- Build prompt for a single brand ---
function buildPrompt(
  brand: BrandRow,
  mr: MallRestaurantRow | null,
  menuItems: MenuItem[],
  styleIndex: number
): string {
  const cuisines = mr?.cuisines
    ? Array.isArray(mr.cuisines)
      ? mr.cuisines
      : mr.cuisines.split(",").map((s) => s.trim())
    : [];
  const cuisineStr = cuisines.length > 0 ? cuisines.join(", ") : "restaurant";
  const ratingStr = mr?.rating ? `${mr.rating}/5 (${mr.review_count || 0} reviews)` : "";
  const priceStr = mr?.price_range || "";
  const dishNames = menuItems.slice(0, 5).map((i) => i.name);
  const dishStr = dishNames.length > 0 ? dishNames.join(", ") : "";
  const style = STYLE_POOL[styleIndex % STYLE_POOL.length];

  return `Write a meta description for ${brand.name} in Singapore.

About: ${cuisineStr} restaurant${priceStr ? ` (${priceStr})` : ""}${ratingStr ? ` rated ${ratingStr}` : ""}.
${dishStr ? `Popular dishes: ${dishStr}.` : ""}
${brand.description ? `Brand info: ${brand.description.substring(0, 200)}` : ""}

WRITING STYLE (you MUST follow this): ${style.replace("{brand}", brand.name).replace("{location}", mr?.name || "Singapore")}

Goal: Make people want to click. Be specific to THIS brand — mention actual dishes, ratings, or what makes them unique.
Tone: Playful, fun, and confident.
Rules:
- MUST be between 140-155 characters (count carefully, this is strict)
- NO emojis
- Use the brand name exactly as given (do not change capitalization)
- BANNED first words: ${BANNED_OPENERS.join(", ")}. Do NOT start with any of these.
- Be specific. Generic descriptions like "diverse flavors await" are not allowed.
Return ONLY the meta description text, nothing else.`;
}

// --- Main ---
async function run() {
  console.log("=== Batch SEO Description Generator ===");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"} | Skip existing: ${SKIP_EXISTING}`);
  console.log();

  // 1. Fetch all brands
  let query = supabase
    .from("brand_menus")
    .select("id, slug, name, description, ai_description, amenities, menu_item_count")
    .eq("is_active", true)
    .order("slug");

  if (SLUG_FILTER) {
    query = query.eq("slug", SLUG_FILTER);
  }
  if (LIMIT) {
    query = query.limit(LIMIT);
  }

  const { data: brands, error: brandError } = await query;
  if (brandError || !brands) {
    console.error("Failed to fetch brands:", brandError);
    return;
  }
  console.log(`Fetched ${brands.length} brands`);

  // 2. Fetch mall_restaurants for enrichment
  const { data: mallRows } = await supabase
    .from("mall_restaurants")
    .select("slug, name, cuisines, rating, review_count, price_range");

  const mrMap: Record<string, MallRestaurantRow> = {};
  for (const mr of mallRows || []) {
    if (!mrMap[mr.slug] || (mr.review_count || 0) > (mrMap[mr.slug].review_count || 0)) {
      mrMap[mr.slug] = mr;
    }
  }
  console.log(`Loaded ${Object.keys(mrMap).length} mall restaurant entries for enrichment`);

  // 3. Process each brand
  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < brands.length; i++) {
    const brand = brands[i];

    // Skip logic
    if (brand.ai_description && !REGEN_ALL) {
      if (FIX_BAD) {
        // Only regenerate descriptions that are bad (too long, too short, or have emojis)
        const len = brand.ai_description.length;
        EMOJI_RE.lastIndex = 0;
        const hasBadEmoji = EMOJI_RE.test(brand.ai_description);
        if (len >= 100 && len <= 165 && !hasBadEmoji) {
          skipped++;
          if (VERBOSE) console.log(`  SKIP ${brand.slug} (good: ${len}c)`);
          continue;
        }
        if (VERBOSE) console.log(`  FIX ${brand.slug} (${len}c, emoji=${hasBadEmoji})`);
      } else if (SKIP_EXISTING) {
        skipped++;
        if (VERBOSE) console.log(`  SKIP ${brand.slug} (has existing description)`);
        continue;
      }
    }

    const mr = mrMap[brand.slug] || null;

    // Fetch top menu items
    const { data: items } = await supabase
      .from("menu_items")
      .select("name, price_numeric")
      .eq("brand_menu_id", brand.id)
      .not("name", "is", null)
      .limit(8);

    const menuItems: MenuItem[] = (items || []).map((i: any) => ({
      name: i.name,
      price: i.price_numeric,
    }));

    const prompt = buildPrompt(brand, mr, menuItems, i);

    if (DRY_RUN) {
      console.log(`\n━━━ ${brand.name} (${brand.slug}) [style ${i % STYLE_POOL.length}] ━━━`);
      console.log(`  Cuisine: ${mr?.cuisines || "unknown"}`);
      console.log(`  Rating: ${mr?.rating || "n/a"} | Price: ${mr?.price_range || "n/a"}`);
      console.log(`  Menu items: ${menuItems.length} (${menuItems.slice(0, 3).map(i => i.name).join(", ")})`);
      console.log(`  Style: ${STYLE_POOL[i % STYLE_POOL.length]}`);
      console.log(`  [Would generate via API]`);
      processed++;
      continue;
    }

    // Call Anthropic API (with retry for length + banned opener violations)
    try {
      let description = "";
      for (let attempt = 0; attempt < 4; attempt++) {
        let retryHint = "";
        if (attempt > 0 && description.length > 0) {
          const lenOk = description.length >= 130 && description.length <= 160;
          const firstWord = description.split(/\s/)[0];
          const openerBanned = BANNED_OPENERS.some(b => description.toLowerCase().startsWith(b.toLowerCase()));
          if (!lenOk) retryHint += ` Previous attempt was ${description.length} characters — MUST be 140-155.`;
          if (openerBanned) retryHint += ` You started with "${firstWord}" which is BANNED. Use a completely different opening.`;
        }

        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 200,
          temperature: 1,
          messages: [{ role: "user", content: prompt + retryHint }],
        });

        description = (response.content[0] as any).text.trim();

        // Strip quotes if the model wrapped it
        if (description.startsWith('"') && description.endsWith('"')) {
          description = description.slice(1, -1);
        }

        const lenOk = description.length >= 130 && description.length <= 160;
        const openerOk = !BANNED_OPENERS.some(b => description.toLowerCase().startsWith(b.toLowerCase()));
        if (lenOk && openerOk) break;
        if (VERBOSE) console.log(`    Retry ${attempt + 1}: ${description.length}c, opener=${description.split(/\s/)[0]}`);
      }

      // Save to DB
      const { error: updateError } = await supabase
        .from("brand_menus")
        .update({
          ai_description: description,
          ai_description_generated_at: new Date().toISOString(),
        })
        .eq("id", brand.id);

      if (updateError) {
        console.error(`  ✗ ${brand.slug}: DB update failed:`, updateError.message);
        errors++;
      } else {
        processed++;
        console.log(`  ✓ ${brand.slug} (${description.length}c): ${description}`);
      }

      // Rate limiting: ~50ms between calls
      await new Promise((r) => setTimeout(r, 50));
    } catch (apiError: any) {
      console.error(`  ✗ ${brand.slug}: API error:`, apiError.message);
      errors++;

      // Back off on rate limits / overloaded
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
