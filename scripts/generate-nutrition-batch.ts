#!/usr/bin/env npx tsx
/**
 * generate-nutrition-batch.ts
 *
 * Generates nutrition data for ALL brands with menu items in Supabase.
 * Reuses the same estimation logic as generate-nutrition.ts but processes
 * multiple brands sequentially (or with limited concurrency).
 *
 * Usage:
 *   npx tsx scripts/generate-nutrition-batch.ts                  # process all brands
 *   npx tsx scripts/generate-nutrition-batch.ts --force           # regenerate all, even existing
 *   npx tsx scripts/generate-nutrition-batch.ts --dry-run         # list brands without calling API
 *   npx tsx scripts/generate-nutrition-batch.ts --slug=sushi-tei  # process only one brand
 *   npx tsx scripts/generate-nutrition-batch.ts --concurrency=3   # process 3 brands in parallel
 */

import * as dotenv from "dotenv";
dotenv.config({ path: "/Users/haoming/Desktop/bestfoodwhere/.env.local" });

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Config & clients
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
if (!ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const BATCH_SIZE = 20;
const OUT_DIR = path.join("/Users/haoming/Desktop/bestfoodwhere", "data", "nutrition");

// Rough cost estimate: Haiku input ~$0.80/MTok, output ~$4/MTok
// Average ~600 input tokens + ~800 output tokens per batch of 20 items
const EST_INPUT_TOKENS_PER_BATCH = 600;
const EST_OUTPUT_TOKENS_PER_BATCH = 800;
const HAIKU_INPUT_COST_PER_MTOK = 0.80;
const HAIKU_OUTPUT_COST_PER_MTOK = 4.0;

// ---------------------------------------------------------------------------
// CLI arg parsing
// ---------------------------------------------------------------------------

interface CLIArgs {
  force: boolean;
  dryRun: boolean;
  slug: string | null;
  concurrency: number;
}

function parseCLIArgs(): CLIArgs {
  const args: CLIArgs = {
    force: false,
    dryRun: false,
    slug: null,
    concurrency: 1,
  };

  for (const arg of process.argv.slice(2)) {
    if (arg === "--force") {
      args.force = true;
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--all") {
      // default behavior, no-op
    } else if (arg.startsWith("--slug=")) {
      args.slug = arg.split("=")[1];
    } else if (arg.startsWith("--concurrency=")) {
      args.concurrency = Math.max(1, parseInt(arg.split("=")[1], 10) || 1);
    } else {
      console.error(`Unknown argument: ${arg}`);
      console.error("Usage: npx tsx scripts/generate-nutrition-batch.ts [--all] [--force] [--dry-run] [--slug=X] [--concurrency=N]");
      process.exit(1);
    }
  }

  return args;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BrandInfo {
  id: string;
  slug: string;
  name: string;
  itemCount: number;
}

interface MenuItemRow {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  category_name: string;
}

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium: number;
  sugar: number;
  fiber: number;
  allergens: string[];
  healthBenefits: string[];
  healthWarnings: string[];
}

// ---------------------------------------------------------------------------
// Fetch all brands with menu items from Supabase
// ---------------------------------------------------------------------------

async function fetchBrandsWithItems(slugFilter: string | null): Promise<BrandInfo[]> {
  // Step 1: Fetch all active brands
  let brandQuery = supabase
    .from("brand_menus")
    .select("id, slug, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (slugFilter) {
    brandQuery = brandQuery.eq("slug", slugFilter);
  }

  const { data: brands, error: brandsErr } = await brandQuery;

  if (brandsErr) {
    console.error("Error fetching brands:", brandsErr.message);
    process.exit(1);
  }

  if (!brands || brands.length === 0) {
    if (slugFilter) {
      console.error(`No active brand found for slug "${slugFilter}"`);
    } else {
      console.error("No active brands found in brand_menus table");
    }
    process.exit(1);
  }

  // Step 2: Fetch all menu_items brand_menu_id to count per brand (single query)
  console.log("Counting menu items per brand...");
  const PAGE_SIZE = 1000;
  const brandItemCounts: Record<string, number> = {};
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: items, error: itemsErr } = await supabase
      .from("menu_items")
      .select("brand_menu_id")
      .eq("is_available", true)
      .range(offset, offset + PAGE_SIZE - 1);

    if (itemsErr) {
      console.error("Error fetching menu items:", itemsErr.message);
      process.exit(1);
    }

    if (!items || items.length === 0) {
      hasMore = false;
      break;
    }

    for (const item of items) {
      const bid = item.brand_menu_id as string;
      brandItemCounts[bid] = (brandItemCounts[bid] || 0) + 1;
    }

    offset += items.length;
    if (items.length < PAGE_SIZE) hasMore = false;
  }

  console.log(`Counted ${offset} total menu items across ${Object.keys(brandItemCounts).length} brands`);

  // Step 3: Match brands with their item counts
  const brandsWithItems: BrandInfo[] = [];
  for (const brand of brands) {
    const itemCount = brandItemCounts[brand.id as string] || 0;
    if (itemCount > 0) {
      brandsWithItems.push({
        id: brand.id as string,
        slug: brand.slug as string,
        name: brand.name as string,
        itemCount,
      });
    }
  }

  return brandsWithItems;
}

// ---------------------------------------------------------------------------
// Fetch menu items for a brand (reused from single-brand script)
// ---------------------------------------------------------------------------

async function fetchMenuItems(brand: BrandInfo): Promise<MenuItemRow[]> {
  const { data: items, error: itemsErr } = await supabase
    .from("menu_items")
    .select(`
      id,
      name,
      description,
      price,
      menu_categories!category_id ( name )
    `)
    .eq("brand_menu_id", brand.id)
    .eq("is_available", true)
    .order("sort_order", { ascending: true });

  if (itemsErr) {
    throw new Error(`Error fetching menu items for ${brand.slug}: ${itemsErr.message}`);
  }

  if (!items || items.length === 0) {
    throw new Error(`No menu items found for brand "${brand.slug}"`);
  }

  return items.map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    category_name: item.menu_categories?.name ?? "Uncategorized",
  }));
}

// ---------------------------------------------------------------------------
// Call Claude Haiku for a batch of items (reused from single-brand script)
// ---------------------------------------------------------------------------

async function estimateNutritionBatch(
  slug: string,
  batch: MenuItemRow[],
  batchIndex: number,
  totalBatches: number,
): Promise<Record<string, NutritionData>> {
  const itemsList = batch
    .map((item, i) => {
      let line = `${i + 1}. "${item.name}" (Category: ${item.category_name})`;
      if (item.description) line += ` — ${item.description}`;
      if (item.price) line += ` [Price: ${item.price}]`;
      return line;
    })
    .join("\n");

  const brandLabel = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const prompt = `You are a nutrition estimation expert. I need you to estimate nutrition facts for menu items from "${brandLabel}", a restaurant in Singapore.

For each item below, provide realistic portion-size estimates based on typical Singapore restaurant servings. Use your knowledge of the restaurant and similar dishes.

Items:
${itemsList}

For EACH item, return a JSON object with:
- calories (number, kcal)
- protein (number, grams)
- carbs (number, grams)
- fat (number, grams)
- sodium (number, mg)
- sugar (number, grams)
- fiber (number, grams)
- allergens (string array, e.g. ["Fish", "Soy", "Gluten", "Shellfish", "Sesame", "Dairy", "Egg", "Peanut", "Tree Nut"])
- healthBenefits (string array, e.g. ["High in omega-3", "Good source of protein"])
- healthWarnings (string array, e.g. ["High in sodium", "High in saturated fat"])

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "item name in lowercase": { calories, protein, carbs, fat, sodium, sugar, fiber, allergens, healthBenefits, healthWarnings },
  ...
}

Use the exact item names from the list above, lowercased. Be realistic — do not invent extreme values.`;

  console.log(`    Batch ${batchIndex + 1}/${totalBatches}: sending ${batch.length} items to Claude Haiku...`);

  // Retry with exponential backoff on rate limit errors
  let response: Anthropic.Message | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      });
      break;
    } catch (err: any) {
      const isRateLimit = err?.status === 429 || err?.error?.type === "rate_limit_error";
      if (isRateLimit && attempt < 4) {
        const waitSec = Math.pow(2, attempt + 1) * 5; // 10s, 20s, 40s, 80s
        console.log(`    Rate limited, waiting ${waitSec}s before retry (attempt ${attempt + 2}/5)...`);
        await new Promise((resolve) => setTimeout(resolve, waitSec * 1000));
        continue;
      }
      throw err;
    }
  }

  if (!response) {
    console.error(`    Batch ${batchIndex + 1}: All retry attempts failed`);
    return {};
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    console.error(`    Batch ${batchIndex + 1}: No text response from Claude`);
    return {};
  }

  let rawText = textBlock.text.trim();

  // Strip markdown code fences if present
  if (rawText.startsWith("```")) {
    rawText = rawText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  try {
    const parsed = JSON.parse(rawText);
    console.log(`    Batch ${batchIndex + 1}: parsed ${Object.keys(parsed).length} items`);
    return parsed;
  } catch (e) {
    console.error(`    Batch ${batchIndex + 1}: Failed to parse JSON response`);
    console.error(`    Raw text (first 500 chars): ${rawText.slice(0, 500)}`);
    return {};
  }
}

// ---------------------------------------------------------------------------
// Process a single brand (fetch items, call Claude, write JSON)
// ---------------------------------------------------------------------------

async function processBrand(brand: BrandInfo): Promise<boolean> {
  const items = await fetchMenuItems(brand);

  // Batch items
  const batches: MenuItemRow[][] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    batches.push(items.slice(i, i + BATCH_SIZE));
  }

  console.log(`    ${items.length} items in ${batches.length} batch(es)`);

  // Process each batch
  const allNutrition: Record<string, NutritionData> = {};
  for (let i = 0; i < batches.length; i++) {
    const result = await estimateNutritionBatch(brand.slug, batches[i], i, batches.length);
    Object.assign(allNutrition, result);

    // Delay between batches to avoid rate limiting (3s per batch)
    if (i < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  // Build output
  const output = {
    brand: brand.slug,
    generatedAt: new Date().toISOString(),
    items: allNutrition,
  };

  // Ensure output directory exists
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Write JSON
  const outFile = path.join(OUT_DIR, `${brand.slug}.json`);
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2), "utf-8");
  console.log(`    Saved to: ${outFile} (${Object.keys(allNutrition).length} items)`);

  return true;
}

// ---------------------------------------------------------------------------
// Cost estimation
// ---------------------------------------------------------------------------

function estimateCost(brands: BrandInfo[]): { totalBatches: number; estimatedCost: number } {
  let totalBatches = 0;
  for (const brand of brands) {
    totalBatches += Math.ceil(brand.itemCount / BATCH_SIZE);
  }

  const inputCost = (totalBatches * EST_INPUT_TOKENS_PER_BATCH / 1_000_000) * HAIKU_INPUT_COST_PER_MTOK;
  const outputCost = (totalBatches * EST_OUTPUT_TOKENS_PER_BATCH / 1_000_000) * HAIKU_OUTPUT_COST_PER_MTOK;
  const estimatedCost = inputCost + outputCost;

  return { totalBatches, estimatedCost };
}

// ---------------------------------------------------------------------------
// Concurrency helper: process items with limited parallelism
// ---------------------------------------------------------------------------

async function processWithConcurrency(
  brands: BrandInfo[],
  concurrency: number,
  processor: (brand: BrandInfo, index: number) => Promise<"processed" | "failed">,
): Promise<{ processed: number; failed: number }> {
  let processed = 0;
  let failed = 0;
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < brands.length) {
      const idx = nextIndex++;
      const result = await processor(brands[idx], idx);
      if (result === "processed") {
        processed++;
      } else {
        failed++;
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, brands.length) }, () => worker());
  await Promise.all(workers);

  return { processed, failed };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseCLIArgs();

  console.log("\n=== Nutrition Batch Generator ===\n");
  console.log(`Mode: ${args.dryRun ? "DRY RUN" : args.force ? "FORCE (regenerate all)" : "normal (skip existing)"}`);
  if (args.slug) console.log(`Filter: --slug=${args.slug}`);
  if (args.concurrency > 1) console.log(`Concurrency: ${args.concurrency}`);
  console.log("");

  // 1. Fetch all brands with menu items
  console.log("Fetching brands with menu items from Supabase...");
  const allBrands = await fetchBrandsWithItems(args.slug);
  const totalItems = allBrands.reduce((sum, b) => sum + b.itemCount, 0);
  console.log(`Found ${allBrands.length} brand(s) with ${totalItems} total menu items\n`);

  // 2. Determine which brands to process (skip if JSON already exists, unless --force)
  let skipped = 0;
  const brandsToProcess: BrandInfo[] = [];

  for (const brand of allBrands) {
    const jsonPath = path.join(OUT_DIR, `${brand.slug}.json`);
    if (!args.force && fs.existsSync(jsonPath)) {
      skipped++;
      if (args.dryRun) {
        console.log(`  SKIP  ${brand.name} (${brand.slug}) — ${brand.itemCount} items — already exists`);
      }
    } else {
      brandsToProcess.push(brand);
    }
  }

  console.log(`Brands to process: ${brandsToProcess.length}`);
  console.log(`Brands to skip (already have JSON): ${skipped}\n`);

  if (brandsToProcess.length === 0) {
    console.log("Nothing to process. Use --force to regenerate existing files.");
    return;
  }

  // 3. Cost estimate
  const processItems = brandsToProcess.reduce((sum, b) => sum + b.itemCount, 0);
  const { totalBatches, estimatedCost } = estimateCost(brandsToProcess);
  console.log(`Estimated API calls: ${totalBatches} batches for ${processItems} items`);
  console.log(`Estimated cost: ~$${estimatedCost.toFixed(4)} (Claude Haiku)\n`);

  // 4. Dry run — just list brands
  if (args.dryRun) {
    console.log("--- Brands that would be processed ---\n");
    for (let i = 0; i < brandsToProcess.length; i++) {
      const b = brandsToProcess[i];
      console.log(`  ${String(i + 1).padStart(3)}. ${b.name} (${b.slug}) — ${b.itemCount} items — ${Math.ceil(b.itemCount / BATCH_SIZE)} batch(es)`);
    }
    console.log(`\n--- Summary (DRY RUN) ---`);
    console.log(`  Would process: ${brandsToProcess.length} brands`);
    console.log(`  Would skip:    ${skipped} brands`);
    console.log(`  Total items:   ${processItems}`);
    console.log(`  Est. cost:     ~$${estimatedCost.toFixed(4)}`);
    return;
  }

  // 5. Process brands
  const startTime = Date.now();

  const { processed, failed } = await processWithConcurrency(
    brandsToProcess,
    args.concurrency,
    async (brand, index) => {
      console.log(`\n--- Brand ${index + 1}/${brandsToProcess.length}: processing ${brand.name} (${brand.slug}) — ${brand.itemCount} items ---`);
      try {
        await processBrand(brand);
        return "processed";
      } catch (err: any) {
        console.error(`  ERROR processing ${brand.slug}: ${err.message}`);
        return "failed";
      }
    },
  );

  // 6. Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n=== Batch Generation Complete ===\n`);
  console.log(`  Processed: ${processed} brand(s)`);
  console.log(`  Skipped:   ${skipped} brand(s) (already had JSON)`);
  console.log(`  Failed:    ${failed} brand(s)`);
  console.log(`  Time:      ${elapsed}s`);
  console.log(`  Output:    ${OUT_DIR}/\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
