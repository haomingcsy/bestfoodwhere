#!/usr/bin/env npx tsx
/**
 * generate-nutrition.ts
 *
 * Reads menu items for a brand from Supabase, sends them to Claude Haiku
 * in batches to estimate nutrition facts, and writes the results to
 * data/nutrition/{slug}.json.
 *
 * Usage:
 *   npx tsx scripts/generate-nutrition.ts --slug=sushi-tei
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

// ---------------------------------------------------------------------------
// CLI arg parsing
// ---------------------------------------------------------------------------

function getSlugArg(): string {
  const arg = process.argv.find((a) => a.startsWith("--slug="));
  if (!arg) {
    console.error("Usage: npx tsx scripts/generate-nutrition.ts --slug=<brand-slug>");
    process.exit(1);
  }
  return arg.split("=")[1];
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
// Fetch menu items from Supabase
// ---------------------------------------------------------------------------

async function fetchMenuItems(slug: string): Promise<MenuItemRow[]> {
  // First get the brand_menu_id for this slug
  const { data: brand, error: brandErr } = await supabase
    .from("brand_menus")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (brandErr || !brand) {
    console.error(`Brand not found for slug "${slug}":`, brandErr?.message);
    process.exit(1);
  }

  console.log(`Found brand: ${brand.name} (${brand.id})`);

  // Fetch menu items joined with category name
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
    console.error("Error fetching menu items:", itemsErr.message);
    process.exit(1);
  }

  if (!items || items.length === 0) {
    console.error(`No menu items found for brand "${slug}"`);
    process.exit(1);
  }

  // Map to flat structure
  return items.map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    category_name: item.menu_categories?.name ?? "Uncategorized",
  }));
}

// ---------------------------------------------------------------------------
// Call Claude Haiku for a batch of items
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

  console.log(`  Batch ${batchIndex + 1}/${totalBatches}: sending ${batch.length} items to Claude Haiku...`);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  // Extract text response
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    console.error(`  Batch ${batchIndex + 1}: No text response from Claude`);
    return {};
  }

  let rawText = textBlock.text.trim();

  // Strip markdown code fences if present
  if (rawText.startsWith("```")) {
    rawText = rawText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  try {
    const parsed = JSON.parse(rawText);
    console.log(`  Batch ${batchIndex + 1}: parsed ${Object.keys(parsed).length} items`);
    return parsed;
  } catch (e) {
    console.error(`  Batch ${batchIndex + 1}: Failed to parse JSON response`);
    console.error(`  Raw text (first 500 chars): ${rawText.slice(0, 500)}`);
    return {};
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const slug = getSlugArg();
  console.log(`\nGenerating nutrition data for: ${slug}\n`);

  // 1. Fetch menu items
  const items = await fetchMenuItems(slug);
  console.log(`Fetched ${items.length} menu items\n`);

  // 2. Batch items
  const batches: MenuItemRow[][] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    batches.push(items.slice(i, i + BATCH_SIZE));
  }
  console.log(`Split into ${batches.length} batches of ~${BATCH_SIZE} items\n`);

  // 3. Process each batch
  const allNutrition: Record<string, NutritionData> = {};
  for (let i = 0; i < batches.length; i++) {
    const result = await estimateNutritionBatch(slug, batches[i], i, batches.length);
    Object.assign(allNutrition, result);

    // Small delay between batches to avoid rate limiting
    if (i < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(`\nTotal nutrition entries: ${Object.keys(allNutrition).length}`);

  // 4. Build output
  const output = {
    brand: slug,
    generatedAt: new Date().toISOString(),
    items: allNutrition,
  };

  // 5. Ensure output directory exists
  const outDir = path.join("/Users/haoming/Desktop/bestfoodwhere", "data", "nutrition");
  fs.mkdirSync(outDir, { recursive: true });

  // 6. Write JSON
  const outFile = path.join(outDir, `${slug}.json`);
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\nSaved to: ${outFile}`);
  console.log("Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
