/**
 * Improved Recipe Image Regeneration Script
 *
 * Generates consistent WikiHow-style images WITHOUT any text.
 * Reads actual recipe ingredients to ensure images match the recipe content.
 *
 * Usage:
 *   npx tsx scripts/regenerate-recipe-images.ts <recipe-slug>
 *   npx tsx scripts/regenerate-recipe-images.ts <recipe-slug> --dry-run
 *   npx tsx scripts/regenerate-recipe-images.ts <recipe-slug> --steps 1,2,5
 *   npx tsx scripts/regenerate-recipe-images.ts --list
 *
 * Examples:
 *   npx tsx scripts/regenerate-recipe-images.ts chicken-rice
 *   npx tsx scripts/regenerate-recipe-images.ts chicken-rice --dry-run
 *   npx tsx scripts/regenerate-recipe-images.ts chicken-breast --steps 3,4,5
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import type {
  RecipeIngredientItem,
  RecipeInstructionStep,
} from "../types/recipe-content";

// Initialize clients
const BFL_API_KEY = process.env.BFL_API_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ============================================================================
// IMPROVED PROMPT FORMULA - Strictly prevents text/labels
// ============================================================================

/**
 * Base style suffix for all image prompts
 * This formula is designed to strictly prevent ANY text in generated images
 */
const BASE_STYLE_SUFFIX = `clean minimalist line art illustration, soft pastel watercolor wash, simple cooking diagram style, cream white background, no text, no words, no letters, no labels, no numbers, no watermarks, no signatures, no captions, no annotations, muted earth tones, gentle shadows`;

/**
 * Checks if a string is a URL (image URLs should be ignored as hints)
 */
function isUrl(str: string): boolean {
  return str.startsWith("http://") || str.startsWith("https://");
}

/**
 * Generates an improved image prompt based on the step description and recipe context
 *
 * Key improvements:
 * 1. Uses specific action verbs (pouring, stirring, chopping, etc.)
 * 2. Includes ONLY ingredients that are actually in the recipe
 * 3. Avoids generic descriptions that could lead to wrong ingredients
 * 4. Multiple negative text prompts for maximum text prevention
 * 5. Ignores image_hint if it's a URL (from previous generation)
 */
function generateImprovedPrompt(
  step: RecipeInstructionStep,
  allIngredients: RecipeIngredientItem[],
  recipeTitle: string,
): string {
  // Extract ingredient names for context validation
  const ingredientNames = allIngredients.map((i) => i.item.toLowerCase());

  // Get the base hint from step or generate from text
  // IMPORTANT: Skip image_hint if it's a URL (from previous generation)
  let actionDescription: string;
  if (step.image_hint && !isUrl(step.image_hint)) {
    actionDescription = step.image_hint;
  } else {
    actionDescription = extractActionFromText(step.text);
  }

  // Validate that any mentioned ingredients actually exist in the recipe
  actionDescription = validateIngredients(actionDescription, ingredientNames);

  // Build the final prompt
  return `${actionDescription}, ${BASE_STYLE_SUFFIX}`;
}

/**
 * Extracts a clean action description from step text
 * Focuses on the primary cooking action and visible elements
 *
 * Improved algorithm:
 * 1. Looks for cooking action verbs and their context
 * 2. Extracts visual elements (bowls, pots, ingredients being manipulated)
 * 3. Converts to descriptive phrase suitable for illustration
 */
function extractActionFromText(text: string): string {
  // Cooking action verbs to look for
  const actionVerbs = [
    "pour",
    "stir",
    "mix",
    "add",
    "place",
    "chop",
    "slice",
    "dice",
    "mince",
    "grate",
    "whisk",
    "beat",
    "fold",
    "knead",
    "roll",
    "spread",
    "brush",
    "drizzle",
    "season",
    "rub",
    "coat",
    "dip",
    "fry",
    "saute",
    "sear",
    "brown",
    "bake",
    "roast",
    "grill",
    "broil",
    "simmer",
    "boil",
    "steam",
    "poach",
    "braise",
    "reduce",
    "deglaze",
    "flip",
    "turn",
    "remove",
    "transfer",
    "arrange",
    "serve",
    "garnish",
    "carve",
    "shred",
    "pound",
    "tenderize",
    "marinate",
    "rest",
    "cool",
    "chill",
    "heat",
    "preheat",
    "cover",
    "uncover",
    "drain",
    "strain",
    "rinse",
    "wash",
    "pat",
    "dry",
  ];

  // Find sentences containing action verbs
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    for (const verb of actionVerbs) {
      if (lowerSentence.includes(verb)) {
        // Found a sentence with an action verb
        let description = sentence.trim();

        // Clean up common prefixes
        description = description
          .replace(
            /^(Start by |Begin by |First,? |Next,? |Then,? |Now,? |Here's |This is )/i,
            "",
          )
          .replace(/^(You should |You need to |You'll want to |You can )/i, "")
          .replace(/^(The |A |An )/i, "")
          .trim();

        // Truncate if too long
        if (description.length > 120) {
          // Try to cut at a natural break point
          const cutPoint = description.substring(0, 120).lastIndexOf(" ");
          description =
            cutPoint > 60
              ? description.substring(0, cutPoint)
              : description.substring(0, 100);
        }

        // Convert to present participle form for visual description
        description = convertToVisualDescription(description);

        if (description.length >= 20) {
          return description;
        }
      }
    }
  }

  // Fallback: use first substantial sentence
  const firstSentence = sentences[0] || text.substring(0, 100);
  let fallback = firstSentence
    .replace(
      /^(Start by |Begin by |First,? |Next,? |Then,? |Now,? |Here's |This is )/i,
      "",
    )
    .replace(/^(You should |You need to |You'll want to )/i, "")
    .trim();

  if (fallback.length > 100) {
    fallback = fallback.substring(0, 100);
  }

  return convertToVisualDescription(fallback);
}

/**
 * Converts a sentence into a visual description suitable for illustration
 */
function convertToVisualDescription(text: string): string {
  // Replace command forms with descriptive gerunds where possible
  const conversions: [RegExp, string][] = [
    [/^(Remove|Take) /i, "Removing "],
    [/^(Place|Put) /i, "Placing "],
    [/^(Add) /i, "Adding "],
    [/^(Pour) /i, "Pouring "],
    [/^(Stir) /i, "Stirring "],
    [/^(Mix) /i, "Mixing "],
    [/^(Season) /i, "Seasoning "],
    [/^(Rub) /i, "Rubbing "],
    [/^(Chop|Cut|Slice) /i, "Slicing "],
    [/^(Brown) /i, "Browning "],
    [/^(Simmer) /i, "Simmering "],
    [/^(Serve) /i, "Serving "],
    [/^(Arrange) /i, "Arranging "],
    [/^(Garnish) /i, "Garnishing "],
    [/^(Carve) /i, "Carving "],
    [/^(Heat) /i, "Heating "],
    [/^(Cover) /i, "Covering "],
    [/^(Drain) /i, "Draining "],
    [/^(Rinse) /i, "Rinsing "],
    [/^(Pat) /i, "Patting "],
  ];

  let result = text;
  for (const [pattern, replacement] of conversions) {
    if (pattern.test(result)) {
      result = result.replace(pattern, replacement);
      break;
    }
  }

  return result;
}

/**
 * Validates that mentioned ingredients exist in the recipe
 * Removes or replaces ingredients that don't belong
 */
function validateIngredients(
  description: string,
  validIngredients: string[],
): string {
  // Common problematic ingredients that get added incorrectly
  const problematicIngredients = [
    "rice",
    "noodles",
    "pasta",
    "bread",
    "cheese",
    "tomato",
    "beans",
    "corn",
  ];

  let result = description;

  for (const problematic of problematicIngredients) {
    // Check if this ingredient is mentioned but not in the recipe
    const regex = new RegExp(`\\b${problematic}\\b`, "gi");
    if (
      regex.test(result) &&
      !validIngredients.some((i) => i.includes(problematic))
    ) {
      // Remove the problematic ingredient from description
      result = result.replace(regex, "").replace(/\s+/g, " ").trim();
    }
  }

  return result;
}

// ============================================================================
// BFL API Functions
// ============================================================================

interface GenerationResult {
  success: boolean;
  imageUrl: string | null;
  error?: string;
}

/**
 * Generates an image using BFL API (Flux Pro 1.1 Ultra)
 */
async function generateImage(prompt: string): Promise<GenerationResult> {
  try {
    console.log(`    Submitting to BFL API...`);

    // Submit generation request
    const submitResponse = await fetch(
      "https://api.bfl.ai/v1/flux-pro-1.1-ultra",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Key": BFL_API_KEY,
        },
        body: JSON.stringify({
          prompt,
          width: 1024,
          height: 768,
          safety_tolerance: 2,
        }),
      },
    );

    if (!submitResponse.ok) {
      const status = submitResponse.status;
      if (status === 402) {
        return {
          success: false,
          imageUrl: null,
          error: "API credits exhausted (402)",
        };
      }
      return {
        success: false,
        imageUrl: null,
        error: `BFL API error: ${status}`,
      };
    }

    const { id: taskId } = await submitResponse.json();
    console.log(`    Task ID: ${taskId}`);

    // Poll for result (max 3 minutes)
    for (let attempt = 1; attempt <= 60; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));

      const resultResponse = await fetch(
        `https://api.bfl.ai/v1/get_result?id=${taskId}`,
        { headers: { "X-Key": BFL_API_KEY } },
      );

      const result = await resultResponse.json();

      if (result.status === "Ready") {
        console.log(`    Generation complete!`);
        return { success: true, imageUrl: result.result?.sample };
      } else if (result.status === "Error") {
        return {
          success: false,
          imageUrl: null,
          error: result.error || "Generation failed",
        };
      }

      if (attempt % 10 === 0) {
        console.log(`    Polling... (${attempt * 3}s)`);
      }
    }

    return { success: false, imageUrl: null, error: "Timeout after 3 minutes" };
  } catch (error) {
    return {
      success: false,
      imageUrl: null,
      error: String(error),
    };
  }
}

// ============================================================================
// Supabase Storage Functions
// ============================================================================

/**
 * Uploads an image to Supabase Storage
 * Uses versioned folder structure: {slug}-v3/step-{n}.png
 */
async function uploadToSupabase(
  imageUrl: string,
  slug: string,
  stepNum: number,
): Promise<string | null> {
  try {
    // Download the generated image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(`    Failed to download image`);
      return null;
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    // Use v3 folder to distinguish from previous generations
    const filePath = `${slug}-v3/step-${stepNum}.png`;

    console.log(`    Uploading to: ${filePath}`);

    const { error } = await supabase.storage
      .from("recipe-images")
      .upload(filePath, imageBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      console.error(`    Upload error: ${error.message}`);
      return null;
    }

    // Get public URL with cache-busting parameter
    const { data } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(filePath);

    return data.publicUrl + `?v=${Date.now()}`;
  } catch (error) {
    console.error(`    Upload error:`, error);
    return null;
  }
}

// ============================================================================
// Main Processing Functions
// ============================================================================

interface RecipeData {
  wp_slug: string;
  title: string;
  ingredients: RecipeIngredientItem[];
  instructions: RecipeInstructionStep[];
}

/**
 * Fetches recipe data from Supabase
 */
async function fetchRecipe(slug: string): Promise<RecipeData | null> {
  const { data, error } = await supabase
    .from("recipe_content")
    .select("wp_slug, title, ingredients, instructions")
    .eq("wp_slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as RecipeData;
}

/**
 * Lists all available recipes
 */
async function listRecipes(): Promise<void> {
  const { data, error } = await supabase
    .from("recipe_content")
    .select("wp_slug, title, instructions")
    .order("wp_slug");

  if (error || !data) {
    console.error("Failed to fetch recipes:", error);
    return;
  }

  console.log("\n" + "=".repeat(60));
  console.log("Available Recipes");
  console.log("=".repeat(60));

  for (const recipe of data) {
    const steps = Array.isArray(recipe.instructions)
      ? recipe.instructions.length
      : 0;
    console.log(`  ${recipe.wp_slug} - "${recipe.title}" (${steps} steps)`);
  }

  console.log("\n");
}

/**
 * Process a recipe and regenerate all (or specified) images
 */
async function processRecipe(
  slug: string,
  options: {
    dryRun: boolean;
    specificSteps?: number[];
  },
): Promise<{
  total: number;
  generated: number;
  failed: number;
  creditsExhausted: boolean;
}> {
  console.log("\n" + "=".repeat(60));
  console.log(`Recipe: ${slug}`);
  console.log("=".repeat(60));

  // Fetch recipe from database
  const recipe = await fetchRecipe(slug);
  if (!recipe) {
    console.error(`Recipe not found: ${slug}`);
    return { total: 0, generated: 0, failed: 0, creditsExhausted: false };
  }

  console.log(`Title: ${recipe.title}`);
  console.log(`Total steps: ${recipe.instructions.length}`);
  console.log(`Total ingredients: ${recipe.ingredients.length}`);

  // Log ingredients for context
  console.log("\nIngredients in this recipe:");
  recipe.ingredients.slice(0, 10).forEach((ing) => {
    console.log(`  - ${ing.item} (${ing.quantity} ${ing.unit})`);
  });
  if (recipe.ingredients.length > 10) {
    console.log(`  ... and ${recipe.ingredients.length - 10} more`);
  }

  // Determine which steps to process
  const stepsToProcess = options.specificSteps
    ? recipe.instructions.filter((inst) =>
        options.specificSteps!.includes(inst.step),
      )
    : recipe.instructions;

  console.log(`\nSteps to process: ${stepsToProcess.length}`);

  if (options.dryRun) {
    console.log("\n--- DRY RUN MODE: Previewing prompts only ---\n");
  }

  let generated = 0;
  let failed = 0;
  let creditsExhausted = false;
  const updatedInstructions = [...recipe.instructions];

  for (const step of stepsToProcess) {
    console.log(`\n--- Step ${step.step} ---`);

    // Generate the improved prompt
    const prompt = generateImprovedPrompt(
      step,
      recipe.ingredients,
      recipe.title,
    );

    console.log(`  Original hint: ${step.image_hint || "(from text)"}`);
    console.log(`  Improved prompt:`);
    console.log(`    "${prompt.substring(0, 200)}..."`);

    if (options.dryRun) {
      console.log(`  [DRY RUN - Would generate image here]`);
      continue;
    }

    // Generate the image
    const result = await generateImage(prompt);

    if (result.error?.includes("credits exhausted")) {
      creditsExhausted = true;
      console.log(`\n  STOPPING: API credits exhausted`);
      break;
    }

    if (result.success && result.imageUrl) {
      // Upload to Supabase
      const publicUrl = await uploadToSupabase(
        result.imageUrl,
        slug,
        step.step,
      );

      if (publicUrl) {
        // Update the instruction with new image URL
        const idx = updatedInstructions.findIndex((i) => i.step === step.step);
        if (idx !== -1) {
          (updatedInstructions[idx] as any).image_url = publicUrl;
        }
        generated++;
        console.log(`    SUCCESS: ${publicUrl.substring(0, 60)}...`);

        // Save immediately after each successful image (crash-safe)
        const { error: saveError } = await supabase
          .from("recipe_content")
          .update({
            instructions: updatedInstructions,
            generated_at: new Date().toISOString(),
          })
          .eq("wp_slug", slug);

        if (saveError) {
          console.error(`    Save error: ${saveError.message}`);
        } else {
          console.log(`    Saved to database`);
        }
      } else {
        failed++;
        console.log(`    FAILED: Upload error`);
      }
    } else {
      failed++;
      console.log(`    FAILED: ${result.error}`);
    }

    // Small delay between requests
    await new Promise((r) => setTimeout(r, 500));
  }

  // Summary
  console.log(`\n--- Summary for ${slug} ---`);
  console.log(`  Processed: ${stepsToProcess.length}`);
  console.log(`  Generated: ${generated}`);
  console.log(`  Failed: ${failed}`);
  if (!options.dryRun) {
    console.log(`  Estimated cost: $${(generated * 0.06).toFixed(2)}`);
  }

  return {
    total: stepsToProcess.length,
    generated,
    failed,
    creditsExhausted,
  };
}

// ============================================================================
// CLI Interface
// ============================================================================

function printUsage(): void {
  console.log(`
Usage: npx tsx scripts/regenerate-recipe-images.ts <recipe-slug> [options]

Commands:
  <recipe-slug>     Regenerate images for a specific recipe
  --list            List all available recipes

Options:
  --dry-run         Preview prompts without generating images
  --steps <n,n,n>   Only regenerate specific step numbers (comma-separated)

Examples:
  npx tsx scripts/regenerate-recipe-images.ts chicken-rice
  npx tsx scripts/regenerate-recipe-images.ts chicken-rice --dry-run
  npx tsx scripts/regenerate-recipe-images.ts chicken-breast --steps 1,2,3
  npx tsx scripts/regenerate-recipe-images.ts --list
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    return;
  }

  // Handle --list command
  if (args[0] === "--list") {
    await listRecipes();
    return;
  }

  // Parse arguments
  const slug = args[0];
  const dryRun = args.includes("--dry-run");

  let specificSteps: number[] | undefined;
  const stepsIdx = args.indexOf("--steps");
  if (stepsIdx !== -1 && args[stepsIdx + 1]) {
    specificSteps = args[stepsIdx + 1]
      .split(",")
      .map((s) => parseInt(s.trim()));
    console.log(`Targeting specific steps: ${specificSteps.join(", ")}`);
  }

  // Validate configuration
  console.log("=".repeat(60));
  console.log("IMPROVED RECIPE IMAGE REGENERATION");
  console.log("WikiHow-style images WITHOUT text");
  console.log("=".repeat(60));

  if (!BFL_API_KEY && !dryRun) {
    console.error("\nERROR: BFL_API_KEY not configured in .env.local");
    console.log("Use --dry-run to preview prompts without generating.");
    return;
  }

  console.log(`\nBFL API Key: ${BFL_API_KEY ? "configured" : "not set"}`);
  console.log(`Dry run: ${dryRun}`);

  // Process the recipe
  const result = await processRecipe(slug, { dryRun, specificSteps });

  // Final summary
  console.log("\n" + "=".repeat(60));
  console.log("COMPLETE");
  console.log("=".repeat(60));

  if (result.creditsExhausted) {
    console.log("\nWarning: API credits exhausted. Top up and run again.");
  }

  if (!dryRun && result.generated > 0) {
    console.log(`\nImages saved to: recipe-images/${slug}-v3/`);
    console.log(`Total cost: $${(result.generated * 0.06).toFixed(2)}`);
  }
}

main().catch(console.error);
