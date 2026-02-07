/**
 * Batch Recipe Content Generation Script
 *
 * Fetches recipes from WordPress API by category and generates enriched content
 * using Google Gemini API, then saves to Supabase.
 *
 * Usage:
 *   npx tsx scripts/batch-generate-recipes.ts --category 110 --limit 5
 *   npx tsx scripts/batch-generate-recipes.ts --category 101 --dry-run
 *   npx tsx scripts/batch-generate-recipes.ts --category 104 --skip-existing
 *   npx tsx scripts/batch-generate-recipes.ts --all --limit 10
 *
 * CLI Options:
 *   --category <id>   Process specific category (see CATEGORIES below)
 *   --all             Process all categories
 *   --limit <n>       Limit number of recipes per category
 *   --dry-run         Preview without saving to database
 *   --skip-existing   Skip recipes already in database
 *   --verbose         Show detailed output including generated content
 *
 * Category IDs:
 *   110 - Comfort Classics
 *   101 - Asian Cuisine
 *   104 - Seafood
 *   105 - Beef & Pork
 *   102 - Italian & European
 *   103 - Chicken
 *   106 - Vegetarian
 *   107 - Quick Meals
 *   108 - Soups & Stews
 *   109 - Rice & Noodles
 */

import { config } from "dotenv";
import { resolve } from "path";
import * as fs from "fs";
import * as crypto from "crypto";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import type {
  RecipeContentInput,
  RecipeIngredientItem,
  RecipeInstructionStep,
  RecipeEquipment,
  RecipeSubstitution,
  RecipeNutrition,
  RecipeFAQItem,
} from "../types/recipe-content";
import { validateAndFixRecipeContent } from "../lib/recipe-validation";
import {
  KITCHEN_EQUIPMENT,
  type EquipmentKey,
} from "../lib/affiliates/kitchen-equipment";

// ============================================
// Configuration
// ============================================

const WORDPRESS_API_BASE = "https://bestfoodwhere.sg/wp-json/wp/v2";

const CATEGORIES: Record<string, { id: number; name: string; slug: string }> = {
  "comfort-classics": {
    id: 110,
    name: "Comfort Classics",
    slug: "comfort-classics",
  },
  "asian-cuisine": { id: 101, name: "Asian Cuisine", slug: "asian-cuisine" },
  seafood: { id: 104, name: "Seafood", slug: "seafood" },
  "beef-pork": { id: 105, name: "Beef & Pork", slug: "beef-pork" },
  "italian-european": {
    id: 102,
    name: "Italian & European",
    slug: "italian-european",
  },
  chicken: { id: 103, name: "Chicken", slug: "chicken" },
  vegetarian: { id: 106, name: "Vegetarian", slug: "vegetarian" },
  "quick-meals": { id: 107, name: "Quick Meals", slug: "quick-meals" },
  "soups-stews": { id: 108, name: "Soups & Stews", slug: "soups-stews" },
  "rice-noodles": { id: 109, name: "Rice & Noodles", slug: "rice-noodles" },
};

// Equipment keywords to match for affiliate recommendations
const EQUIPMENT_KEYWORDS: Record<string, EquipmentKey[]> = {
  "cast iron": ["castIronSkillet"],
  skillet: ["castIronSkillet", "nonstickPan"],
  "frying pan": ["castIronSkillet", "nonstickPan", "stainlessSteelPan"],
  "dutch oven": ["dutchOven"],
  "stock pot": ["stockPot"],
  wok: ["wok"],
  "rice cooker": ["riceCooker"],
  "pressure cooker": ["pressureCooker"],
  "instant pot": ["pressureCooker"],
  thermometer: ["thermometer"],
  "instant-read": ["thermometer"],
  "cutting board": ["cuttingBoard"],
  "chef's knife": ["chefKnife"],
  knife: ["chefKnife", "santokuKnife"],
  cleaver: ["cleaver"],
  blender: ["blender", "immersionBlender"],
  "food processor": ["foodProcessor"],
  "stand mixer": ["standMixer"],
  "baking sheet": ["bakingSheet"],
  "wire rack": ["bakingSheet"],
  "bamboo steamer": ["bambooSteamer"],
  steamer: ["bambooSteamer"],
  mortar: ["mortarPestle"],
  pestle: ["mortarPestle"],
  tongs: ["tongs"],
  spatula: ["spatula", "siliconeSpatula"],
  whisk: ["whisk"],
  ladle: ["ladle"],
  colander: ["colander"],
  strainer: ["colander", "strainer"],
  scale: ["kitchenScale"],
  measuring: ["measuringCups"],
  "mixing bowl": ["mixingBowls"],
};

// ============================================
// Initialize Clients
// ============================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Load Vertex AI credentials if available
let vertexCredentials: any = null;
const CREDENTIALS_PATH = resolve(process.cwd(), "vertex-ai-credentials.json");
if (fs.existsSync(CREDENTIALS_PATH)) {
  vertexCredentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
}

// ============================================
// Google Gemini API Functions
// ============================================

function createJWT(): string {
  if (!vertexCredentials) {
    throw new Error("Vertex AI credentials not found");
  }

  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: vertexCredentials.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString(
    "base64url",
  );
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const signatureInput = `${base64Header}.${base64Payload}`;

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signatureInput);
  const signature = sign.sign(vertexCredentials.private_key, "base64url");

  return `${signatureInput}.${signature}`;
}

async function getAccessToken(): Promise<string> {
  const jwt = createJWT();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("Failed to get access token: " + JSON.stringify(data));
  }
  return data.access_token;
}

async function callGemini(prompt: string, retries = 3): Promise<string | null> {
  if (!vertexCredentials) {
    throw new Error(
      "Vertex AI credentials not found. Please add vertex-ai-credentials.json",
    );
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const accessToken = await getAccessToken();
      // Using gemini-2.0-flash-exp (requires 10s delay to stay under rate limits)
      const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${vertexCredentials.project_id}/locations/us-central1/publishers/google/models/gemini-2.0-flash-exp:generateContent`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(
          `  Gemini API error (attempt ${attempt}):`,
          JSON.stringify(data).substring(0, 200),
        );
        if (attempt === retries) return null;
        await delay(2000 * attempt);
        continue;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;

      console.error(`  No text in Gemini response (attempt ${attempt})`);
      if (attempt === retries) return null;
      await delay(2000 * attempt);
    } catch (error) {
      console.error(`  Gemini error (attempt ${attempt}):`, error);
      if (attempt === retries) return null;
      await delay(2000 * attempt);
    }
  }

  return null;
}

// ============================================
// WordPress API Functions
// ============================================

interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  categories: number[];
  date: string;
}

async function fetchRecipesByCategory(
  categoryId: number,
  limit: number = 100,
): Promise<WPPost[]> {
  const url = `${WORDPRESS_API_BASE}/posts?categories=${categoryId}&per_page=${Math.min(limit, 100)}&_fields=id,slug,title,content,excerpt,categories,date`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`WordPress API error: ${response.status}`);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("WordPress fetch error:", error);
    return [];
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// ============================================
// Content Generation Prompts
// ============================================

function getRecipeGenerationPrompt(post: WPPost, categoryName: string): string {
  const title = stripHtml(post.title.rendered);
  const content = stripHtml(post.content.rendered);
  const excerpt = stripHtml(post.excerpt.rendered);

  return `You are a professional recipe writer and culinary expert. Generate enriched recipe content for the following dish.

RECIPE: ${title}
CATEGORY: ${categoryName}
EXISTING CONTENT: ${content.substring(0, 2000)}
EXCERPT: ${excerpt}

Generate a comprehensive JSON object with the following structure. Be creative but accurate. All content should be original and helpful for home cooks.

{
  "introduction": "2-3 paragraphs introducing the dish, its origins, and what makes it special. Make it engaging and informative.",

  "why_love_it": "5-6 bullet points in format: '• **Bold key benefit** - detailed explanation'. Focus on taste, ease, versatility, health, or special features.",

  "prep_time_minutes": <number>,
  "cook_time_minutes": <number>,
  "servings": <number>,
  "difficulty": "easy" | "medium" | "hard",

  "ingredients": [
    {"item": "ingredient name", "quantity": "amount", "unit": "unit", "notes": "optional notes", "section": "optional section name"}
  ],

  "instructions": [
    {
      "step": 1,
      "text": "Detailed beginner-friendly instruction (2-4 sentences). Explain the 'why' not just the 'what'.",
      "time_minutes": <estimated time for this step>,
      "tip": "Optional helpful tip for this step",
      "image_hint": "Brief description for potential step image"
    }
  ],

  "equipment": [
    {"name": "equipment item", "required": true/false}
  ],

  "substitutions": [
    {"original": "original ingredient", "substitute": "substitution", "notes": "when to use this substitution"}
  ],

  "pro_tips": ["5 expert tips for best results"],

  "common_mistakes": ["5 common mistakes to avoid with brief explanations"],

  "faq": [
    {"question": "Common question about this recipe?", "answer": "Helpful, detailed answer."}
  ],

  "nutrition": {
    "calories": <per serving>,
    "protein": <grams>,
    "carbs": <grams>,
    "fat": <grams>,
    "fiber": <grams>,
    "sodium": <mg>
  },

  "doneness_tips": "How to know when the dish is perfectly done. Include visual cues, texture, and temperature if applicable.",

  "storage_tips": "How to store leftovers, how long they keep, and best reheating methods."
}

IMPORTANT GUIDELINES:
1. Instructions should have 10-12 steps, each detailed and beginner-friendly
2. Equipment should include 4-5 items, prioritizing: cast iron skillet, instant-read thermometer, Dutch oven, chef's knife, cutting board, rice cooker, wok, baking sheet
3. Include exactly 5 FAQ items with substantive answers
4. why_love_it must use bullet format: "• **Bold phrase** - description"
5. Nutrition values should be realistic estimates per serving
6. Be specific with times and temperatures
7. Tips should be actionable and non-obvious

Return ONLY the JSON object, no markdown code blocks or additional text.`;
}

// ============================================
// Content Processing Functions
// ============================================

function parseGeminiResponse(
  response: string,
): Partial<RecipeContentInput> | null {
  try {
    // Clean up the response - remove markdown code blocks if present
    let cleaned = response.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error("  Failed to parse Gemini response:", error);
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function enrichEquipmentWithAffiliates(
  equipment: RecipeEquipment[],
): RecipeEquipment[] {
  return equipment.map((item) => {
    const nameLower = item.name.toLowerCase();

    // Find matching affiliate equipment
    for (const [keyword, keys] of Object.entries(EQUIPMENT_KEYWORDS)) {
      if (nameLower.includes(keyword)) {
        const equipmentKey = keys[0];
        const affiliateEquipment = KITCHEN_EQUIPMENT[equipmentKey];
        if (affiliateEquipment) {
          return {
            ...item,
            name: affiliateEquipment.name,
            affiliate_link: affiliateEquipment.link,
          };
        }
      }
    }

    return item;
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// Database Functions
// ============================================

async function getExistingSlugs(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("recipe_content")
    .select("wp_slug");

  if (error) {
    console.error("Error fetching existing recipes:", error);
    return new Set();
  }

  return new Set(data?.map((r) => r.wp_slug) || []);
}

async function saveRecipeContent(
  content: RecipeContentInput,
): Promise<boolean> {
  try {
    // Validate and fix formatting
    const validatedContent = validateAndFixRecipeContent(content);

    const { error } = await supabase.from("recipe_content").upsert(
      {
        ...validatedContent,
        is_verified: false,
        generated_at: new Date().toISOString(),
      },
      {
        onConflict: "wp_slug",
      },
    );

    if (error) {
      console.error(`  Database error:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`  Save error:`, error);
    return false;
  }
}

// ============================================
// Main Processing Functions
// ============================================

async function processRecipe(
  post: WPPost,
  categoryName: string,
  options: { dryRun: boolean; verbose: boolean },
): Promise<{ success: boolean; slug: string }> {
  const title = stripHtml(post.title.rendered);
  console.log(`\n  Processing: ${title}`);
  console.log(`  Slug: ${post.slug}`);

  // Generate content with Gemini
  console.log(`  Generating content with Gemini...`);
  const prompt = getRecipeGenerationPrompt(post, categoryName);
  const geminiResponse = await callGemini(prompt);

  if (!geminiResponse) {
    console.error(`  Failed to generate content`);
    return { success: false, slug: post.slug };
  }

  // Parse the response
  const parsed = parseGeminiResponse(geminiResponse);
  if (!parsed) {
    console.error(`  Failed to parse generated content`);
    return { success: false, slug: post.slug };
  }

  if (options.verbose) {
    console.log(`  Generated content preview:`);
    console.log(
      `    - Introduction: ${(parsed.introduction || "").substring(0, 100)}...`,
    );
    console.log(
      `    - Instructions: ${(parsed.instructions || []).length} steps`,
    );
    console.log(`    - Equipment: ${(parsed.equipment || []).length} items`);
    console.log(`    - FAQ: ${(parsed.faq || []).length} items`);
  }

  // Enrich equipment with affiliate links
  const equipment = enrichEquipmentWithAffiliates(parsed.equipment || []);

  // Build the complete content object
  const recipeContent: RecipeContentInput = {
    wp_slug: post.slug,
    wp_post_id: post.id,
    title: title,
    description:
      stripHtml(post.excerpt.rendered) ||
      parsed.introduction?.substring(0, 200),
    introduction: parsed.introduction || "",
    why_love_it: parsed.why_love_it || "",
    prep_time_minutes: parsed.prep_time_minutes || 15,
    cook_time_minutes: parsed.cook_time_minutes || 30,
    servings: parsed.servings || 4,
    difficulty: parsed.difficulty || "medium",
    ingredients: parsed.ingredients || [],
    instructions: (parsed.instructions || []).map((inst: any, idx: number) => ({
      step: inst.step || idx + 1,
      text: inst.text || "",
      time_minutes: inst.time_minutes,
      tip: inst.tip,
      image_hint: inst.image_hint,
    })),
    equipment: equipment,
    substitutions: parsed.substitutions || [],
    nutrition: parsed.nutrition || null,
    doneness_tips: parsed.doneness_tips || "",
    storage_tips: parsed.storage_tips || "",
    pro_tips: parsed.pro_tips || [],
    common_mistakes: parsed.common_mistakes || [],
    faq: parsed.faq || [],
    sources: [
      {
        url: `https://bestfoodwhere.sg/recipes/${post.slug}`,
        title: `${title} - BestFoodWhere`,
        accessed_date: new Date().toISOString().split("T")[0],
      },
    ],
  };

  // Save to database (unless dry run)
  if (options.dryRun) {
    console.log(`  [DRY RUN] Would save recipe: ${post.slug}`);
    return { success: true, slug: post.slug };
  }

  console.log(`  Saving to database...`);
  const saved = await saveRecipeContent(recipeContent);

  if (saved) {
    console.log(`  Successfully saved: ${post.slug}`);
    return { success: true, slug: post.slug };
  } else {
    console.error(`  Failed to save: ${post.slug}`);
    return { success: false, slug: post.slug };
  }
}

async function processCategory(
  category: { id: number; name: string; slug: string },
  options: {
    limit: number;
    skipExisting: boolean;
    dryRun: boolean;
    verbose: boolean;
  },
): Promise<{ processed: number; success: number; skipped: number }> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Category: ${category.name} (ID: ${category.id})`);
  console.log("=".repeat(60));

  // Fetch recipes from WordPress
  console.log(`Fetching recipes from WordPress...`);
  const posts = await fetchRecipesByCategory(category.id, options.limit);
  console.log(`Found ${posts.length} recipes`);

  if (posts.length === 0) {
    return { processed: 0, success: 0, skipped: 0 };
  }

  // Get existing slugs if skip-existing is enabled
  let existingSlugs = new Set<string>();
  if (options.skipExisting) {
    existingSlugs = await getExistingSlugs();
    console.log(`Found ${existingSlugs.size} existing recipes in database`);
  }

  let processed = 0;
  let success = 0;
  let skipped = 0;

  for (const post of posts) {
    // Check if should skip
    if (options.skipExisting && existingSlugs.has(post.slug)) {
      console.log(`\n  Skipping (exists): ${post.slug}`);
      skipped++;
      continue;
    }

    const result = await processRecipe(post, category.name, {
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    processed++;
    if (result.success) success++;

    // Rate limiting - wait between API calls (10s to stay under rate limits)
    if (processed < posts.length) {
      console.log(`  Waiting 10s before next recipe...`);
      await delay(10000);
    }
  }

  return { processed, success, skipped };
}

// ============================================
// CLI Argument Parsing
// ============================================

function parseArgs(): {
  categoryId: number | null;
  all: boolean;
  limit: number;
  dryRun: boolean;
  skipExisting: boolean;
  verbose: boolean;
} {
  const args = process.argv.slice(2);
  let categoryId: number | null = null;
  let all = false;
  let limit = 100;
  let dryRun = false;
  let skipExisting = false;
  let verbose = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--category":
        categoryId = parseInt(args[++i], 10);
        break;
      case "--all":
        all = true;
        break;
      case "--limit":
        limit = parseInt(args[++i], 10);
        break;
      case "--dry-run":
        dryRun = true;
        break;
      case "--skip-existing":
        skipExisting = true;
        break;
      case "--verbose":
        verbose = true;
        break;
      case "--help":
        printHelp();
        process.exit(0);
    }
  }

  return { categoryId, all, limit, dryRun, skipExisting, verbose };
}

function printHelp(): void {
  console.log(`
Batch Recipe Content Generation Script

Usage:
  npx tsx scripts/batch-generate-recipes.ts [options]

Options:
  --category <id>   Process specific category ID
  --all             Process all categories
  --limit <n>       Limit recipes per category (default: 100)
  --dry-run         Preview without saving
  --skip-existing   Skip recipes already in database
  --verbose         Show detailed output
  --help            Show this help message

Category IDs:
  110 - Comfort Classics
  101 - Asian Cuisine
  104 - Seafood
  105 - Beef & Pork
  102 - Italian & European
  103 - Chicken
  106 - Vegetarian
  107 - Quick Meals
  108 - Soups & Stews
  109 - Rice & Noodles

Examples:
  npx tsx scripts/batch-generate-recipes.ts --category 110 --limit 5
  npx tsx scripts/batch-generate-recipes.ts --all --limit 3 --dry-run
  npx tsx scripts/batch-generate-recipes.ts --category 101 --skip-existing
`);
}

// ============================================
// Main Entry Point
// ============================================

async function main() {
  console.log("=".repeat(60));
  console.log("Batch Recipe Content Generation Script");
  console.log("=".repeat(60));

  // Check for required credentials
  if (!vertexCredentials) {
    console.error("\nERROR: vertex-ai-credentials.json not found!");
    console.error("Please add your Google Cloud service account credentials.");
    process.exit(1);
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("\nERROR: Supabase credentials not found in .env.local!");
    process.exit(1);
  }

  // Parse arguments
  const args = parseArgs();

  if (!args.categoryId && !args.all) {
    console.error("\nERROR: Please specify --category <id> or --all");
    printHelp();
    process.exit(1);
  }

  console.log(`\nOptions:`);
  console.log(`  Category: ${args.all ? "ALL" : args.categoryId}`);
  console.log(`  Limit: ${args.limit} per category`);
  console.log(`  Dry Run: ${args.dryRun}`);
  console.log(`  Skip Existing: ${args.skipExisting}`);
  console.log(`  Verbose: ${args.verbose}`);

  // Determine which categories to process
  let categoriesToProcess: { id: number; name: string; slug: string }[] = [];

  if (args.all) {
    categoriesToProcess = Object.values(CATEGORIES);
  } else if (args.categoryId) {
    // Find category by ID
    const found = Object.values(CATEGORIES).find(
      (c) => c.id === args.categoryId,
    );
    if (found) {
      categoriesToProcess = [found];
    } else {
      console.error(`\nERROR: Unknown category ID: ${args.categoryId}`);
      console.log("Available categories:");
      for (const [key, cat] of Object.entries(CATEGORIES)) {
        console.log(`  ${cat.id} - ${cat.name}`);
      }
      process.exit(1);
    }
  }

  // Process each category
  const results: {
    category: string;
    processed: number;
    success: number;
    skipped: number;
  }[] = [];

  for (const category of categoriesToProcess) {
    const result = await processCategory(category, {
      limit: args.limit,
      skipExisting: args.skipExisting,
      dryRun: args.dryRun,
      verbose: args.verbose,
    });

    results.push({
      category: category.name,
      ...result,
    });

    // Wait between categories
    if (
      categoriesToProcess.indexOf(category) <
      categoriesToProcess.length - 1
    ) {
      console.log(`\nWaiting 5s before next category...`);
      await delay(5000);
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));

  let totalProcessed = 0;
  let totalSuccess = 0;
  let totalSkipped = 0;

  for (const result of results) {
    console.log(
      `${result.category}: ${result.success}/${result.processed} succeeded, ${result.skipped} skipped`,
    );
    totalProcessed += result.processed;
    totalSuccess += result.success;
    totalSkipped += result.skipped;
  }

  console.log("-".repeat(60));
  console.log(
    `TOTAL: ${totalSuccess}/${totalProcessed} succeeded, ${totalSkipped} skipped`,
  );

  if (args.dryRun) {
    console.log("\n[DRY RUN] No changes were made to the database.");
  }
}

main().catch((error) => {
  console.error("\nFatal error:", error);
  process.exit(1);
});
