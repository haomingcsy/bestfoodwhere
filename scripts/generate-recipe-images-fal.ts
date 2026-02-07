/**
 * Generate Recipe Images using FAL AI
 *
 * Generates:
 * 1. Hero/featured image (appetizing food photography style)
 * 2. Step-by-step WikiHow-style illustrations
 *
 * Run with: npx tsx scripts/generate-recipe-images-fal.ts [recipe-slug]
 * Or run all: npx tsx scripts/generate-recipe-images-fal.ts --all
 * Or run batch: npx tsx scripts/generate-recipe-images-fal.ts --batch 10
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const FAL_KEY = process.env.FAL_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

if (!FAL_KEY) {
  console.error("FAL_KEY is required in .env.local");
  process.exit(1);
}

interface RecipeContent {
  id: string;
  wp_slug: string;
  title: string;
  description: string | null;
  instructions: Array<{
    step: number;
    text: string;
    time_minutes?: number;
    tip?: string;
    image_url?: string;
    image_hint?: string;
  }>;
}

/**
 * Generate hero image prompt - appetizing food photography
 */
function getHeroPrompt(title: string, description: string | null): string {
  const dishName = title.replace(/recipe/gi, "").trim();
  return `Professional food photography of ${dishName}, beautifully plated on elegant dishware, soft natural lighting from the side, shallow depth of field, garnished perfectly, restaurant quality presentation, warm inviting colors, top-down or 45-degree angle shot, clean minimal background, appetizing and delicious looking, 4k quality`;
}

/**
 * Generate step image prompt - WikiHow illustration style with consistency
 */
function getStepPrompt(
  hint: string,
  stepNum: number,
  dishName: string,
): string {
  // Consistent elements across all steps
  const consistentStyle = `
    clean vector illustration style,
    flat design with subtle gradients,
    consistent warm color palette (soft orange, warm yellow, cream, sage green),
    same modern minimalist kitchen with white countertop and light wood accents,
    same stainless steel pot with black handles throughout,
    same pair of hands with light skin tone,
    birds-eye view or 3/4 angle,
    soft diffused lighting,
    cream/off-white background,
    no text, no labels, no numbers, no watermarks,
    WikiHow instructional illustration style
  `
    .replace(/\s+/g, " ")
    .trim();

  return `Cooking step for ${dishName}: ${hint}. Style: ${consistentStyle}`;
}

/**
 * Call FAL AI API to generate image using synchronous endpoint
 */
async function generateImageWithFal(
  prompt: string,
  isHero: boolean = false,
): Promise<string | null> {
  try {
    console.log(`    Submitting to FAL AI...`);

    // Use the synchronous endpoint (waits for result)
    const response = await fetch("https://fal.run/fal-ai/flux-pro/v1.1-ultra", {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        // Use smaller size for hero to avoid storage limits
        image_size: isHero ? "landscape_4_3" : "landscape_16_9",
        num_images: 1,
        enable_safety_checker: true,
        safety_tolerance: "2",
        output_format: "jpeg", // JPEG is smaller than PNG
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`    FAL API error: ${response.status} - ${errorText}`);
      return null;
    }

    const result = await response.json();

    // Direct result from synchronous endpoint
    if (result.images?.[0]?.url) {
      console.log(`    Image generated!`);
      return result.images[0].url;
    }

    console.error(
      `    No image in response:`,
      JSON.stringify(result).substring(0, 200),
    );
    return null;
  } catch (error) {
    console.error(`    Error generating image:`, error);
    return null;
  }
}

/**
 * Download image and upload to Supabase Storage
 */
async function uploadToSupabase(
  imageUrl: string,
  storagePath: string,
  contentType: string = "image/png",
): Promise<string | null> {
  try {
    console.log(`    Downloading and uploading to Supabase...`);

    // Download image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`    Failed to download image`);
      return null;
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("recipe-images")
      .upload(storagePath, imageBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`    Supabase upload error:`, error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(storagePath);

    console.log(`    Uploaded: ${storagePath}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error(`    Upload error:`, error);
    return null;
  }
}

/**
 * Process a single recipe - generate hero + step images
 */
async function processRecipe(
  recipe: RecipeContent,
  forceRegenerate: boolean = false,
): Promise<{
  heroGenerated: boolean;
  stepsGenerated: number;
}> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Processing: ${recipe.title}`);
  console.log(`Slug: ${recipe.wp_slug}`);
  console.log(`${"=".repeat(60)}`);

  let heroGenerated = false;
  let stepsGenerated = 0;

  // 1. Generate hero image
  console.log(`\n[HERO IMAGE]`);
  const heroPrompt = getHeroPrompt(recipe.title, recipe.description);
  console.log(`  Prompt: ${heroPrompt.substring(0, 80)}...`);

  const heroImageUrl = await generateImageWithFal(heroPrompt, true);
  if (heroImageUrl) {
    const heroStoragePath = `${recipe.wp_slug}/hero.jpg`;
    const publicUrl = await uploadToSupabase(
      heroImageUrl,
      heroStoragePath,
      "image/jpeg",
    );
    if (publicUrl) {
      heroGenerated = true;
      console.log(`  Hero image saved!`);
    }
  }

  // 2. Generate step images
  console.log(`\n[STEP IMAGES] (${recipe.instructions.length} steps)`);

  const updatedInstructions = [...recipe.instructions];

  for (let i = 0; i < recipe.instructions.length; i++) {
    const step = recipe.instructions[i];
    const stepNum = step.step || i + 1;

    // Skip if already has image (unless force regenerate)
    if (
      !forceRegenerate &&
      step.image_url &&
      step.image_url.startsWith("http")
    ) {
      console.log(`  Step ${stepNum}: SKIP (already has image)`);
      continue;
    }

    console.log(`  Step ${stepNum}:`);

    // Get hint for image
    const hint = step.image_hint || step.text.substring(0, 150);
    const dishName = recipe.title.replace(/recipe/gi, "").trim();
    const stepPrompt = getStepPrompt(hint, stepNum, dishName);
    console.log(`    Hint: ${hint.substring(0, 60)}...`);

    const stepImageUrl = await generateImageWithFal(stepPrompt, false);
    if (stepImageUrl) {
      const stepStoragePath = `${recipe.wp_slug}/step-${stepNum}.jpg`;
      const publicUrl = await uploadToSupabase(
        stepImageUrl,
        stepStoragePath,
        "image/jpeg",
      );
      if (publicUrl) {
        updatedInstructions[i] = { ...step, image_url: publicUrl };
        stepsGenerated++;
        console.log(`    Saved!`);
      }
    }

    // Small delay between steps to avoid rate limiting
    await new Promise((r) => setTimeout(r, 1000));
  }

  // 3. Update database with new instructions (including image URLs)
  if (stepsGenerated > 0) {
    console.log(`\n[DATABASE UPDATE]`);
    const { error } = await supabase
      .from("recipe_content")
      .update({ instructions: updatedInstructions })
      .eq("id", recipe.id);

    if (error) {
      console.error(`  Failed to update database:`, error);
    } else {
      console.log(`  Updated ${stepsGenerated} step images in database`);
    }
  }

  return { heroGenerated, stepsGenerated };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const forceRegenerate = args.includes("--force");
  const filteredArgs = args.filter((a) => a !== "--force");

  let recipes: RecipeContent[] = [];

  if (forceRegenerate) {
    console.log("🔄 Force regenerate mode - will overwrite existing images\n");
  }

  if (filteredArgs[0] === "--all") {
    // Get all recipes
    console.log("Fetching all recipes...");
    const { data, error } = await supabase
      .from("recipe_content")
      .select("id, wp_slug, title, description, instructions")
      .order("created_at", { ascending: true });

    if (error || !data) {
      console.error("Failed to fetch recipes:", error);
      process.exit(1);
    }

    recipes = data;
    console.log(`Found ${recipes.length} recipes`);
  } else if (filteredArgs[0] === "--batch") {
    // Get batch of recipes without images
    const batchSize = parseInt(filteredArgs[1]) || 10;
    console.log(
      `Fetching batch of ${batchSize} recipes without hero images...`,
    );

    const { data, error } = await supabase
      .from("recipe_content")
      .select("id, wp_slug, title, description, instructions")
      .order("created_at", { ascending: true })
      .limit(batchSize);

    if (error || !data) {
      console.error("Failed to fetch recipes:", error);
      process.exit(1);
    }

    recipes = data;
    console.log(`Processing ${recipes.length} recipes`);
  } else if (filteredArgs[0]) {
    // Single recipe by slug
    const slug = filteredArgs[0];
    console.log(`Fetching recipe: ${slug}`);

    const { data, error } = await supabase
      .from("recipe_content")
      .select("id, wp_slug, title, description, instructions")
      .eq("wp_slug", slug)
      .single();

    if (error || !data) {
      console.error(`Recipe not found: ${slug}`);
      process.exit(1);
    }

    recipes = [data];
  } else {
    console.log(`
Usage:
  npx tsx scripts/generate-recipe-images-fal.ts [recipe-slug]           # Single recipe
  npx tsx scripts/generate-recipe-images-fal.ts [recipe-slug] --force   # Regenerate all
  npx tsx scripts/generate-recipe-images-fal.ts --batch 10              # Batch of 10
  npx tsx scripts/generate-recipe-images-fal.ts --all                   # All recipes
    `);
    process.exit(0);
  }

  // Process recipes
  let totalHero = 0;
  let totalSteps = 0;

  for (const recipe of recipes) {
    const result = await processRecipe(recipe, forceRegenerate);
    if (result.heroGenerated) totalHero++;
    totalSteps += result.stepsGenerated;
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`COMPLETE`);
  console.log(`${"=".repeat(60)}`);
  console.log(`Hero images generated: ${totalHero}`);
  console.log(`Step images generated: ${totalSteps}`);
}

main().catch(console.error);
