/**
 * Smart Image Generator - Only generates MISSING images
 *
 * - Checks database first, skips steps that already have images
 * - Never duplicates or overwrites existing images
 * - Resumes from where it left off if API fails
 * - One image per step, no more
 *
 * Run with: npx tsx scripts/generate-missing-images.ts [recipe-slug]
 * Or run all: npx tsx scripts/generate-missing-images.ts --all
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const BFL_API_KEY = process.env.BFL_API_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// WikiHow-style image prompt (NO text)
function getImagePrompt(hint: string): string {
  return `${hint}, clean line art illustration, soft pastel watercolor style, minimalist cooking scene, no text, no labels, no numbers, no words, no letters, no watermarks, light cream background, simple instructional diagram`;
}

// Generate image using BFL API
async function generateImage(prompt: string): Promise<string | null> {
  try {
    console.log(`    Requesting from BFL API...`);

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
        console.error(`    ERROR: API credits exhausted (402)`);
        return "CREDITS_EXHAUSTED";
      }
      console.error(`    ERROR: BFL API returned ${status}`);
      return null;
    }

    const { id: taskId } = await submitResponse.json();
    console.log(`    Task ID: ${taskId}, polling...`);

    // Poll for result (max 3 minutes)
    for (let attempt = 1; attempt <= 60; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));

      const resultResponse = await fetch(
        `https://api.bfl.ai/v1/get_result?id=${taskId}`,
        { headers: { "X-Key": BFL_API_KEY } },
      );

      const result = await resultResponse.json();

      if (result.status === "Ready") {
        console.log(`    Image ready!`);
        return result.result?.sample;
      } else if (result.status === "Error") {
        console.error(`    Generation failed: ${result.error}`);
        return null;
      }

      if (attempt % 10 === 0) {
        console.log(`    Still waiting... (${attempt * 3}s)`);
      }
    }

    console.error(`    Timeout after 3 minutes`);
    return null;
  } catch (error) {
    console.error(`    Error:`, error);
    return null;
  }
}

// Upload to Supabase Storage
async function uploadImage(
  imageUrl: string,
  slug: string,
  stepNum: number,
): Promise<string | null> {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) return null;

    const imageBuffer = await imageResponse.arrayBuffer();
    const filePath = `${slug}-v2/step-${stepNum}.png`;

    console.log(`    Uploading to: ${filePath}`);

    const { error } = await supabase.storage
      .from("recipe-images")
      .upload(filePath, imageBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      console.error(`    Upload error:`, error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(filePath);
    return data.publicUrl + `?v=${Date.now()}`;
  } catch (error) {
    console.error(`    Upload error:`, error);
    return null;
  }
}

// Process a single recipe - only missing images
async function processRecipe(slug: string): Promise<{
  slug: string;
  total: number;
  existing: number;
  generated: number;
  failed: number;
  creditsExhausted: boolean;
}> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Recipe: ${slug}`);
  console.log("=".repeat(60));

  // Fetch current recipe from database
  const { data: recipe, error } = await supabase
    .from("recipe_content")
    .select("wp_slug, title, instructions")
    .eq("wp_slug", slug)
    .single();

  if (error || !recipe) {
    console.error(`Recipe not found: ${slug}`);
    return {
      slug,
      total: 0,
      existing: 0,
      generated: 0,
      failed: 0,
      creditsExhausted: false,
    };
  }

  const instructions = recipe.instructions as any[];
  if (!instructions || instructions.length === 0) {
    console.error(`No instructions found for: ${slug}`);
    return {
      slug,
      total: 0,
      existing: 0,
      generated: 0,
      failed: 0,
      creditsExhausted: false,
    };
  }

  console.log(`Title: ${recipe.title}`);
  console.log(`Total steps: ${instructions.length}`);

  let existing = 0;
  let generated = 0;
  let failed = 0;
  let creditsExhausted = false;
  const updatedInstructions = [...instructions];

  for (let i = 0; i < instructions.length; i++) {
    const step = instructions[i];
    const stepNum = step.step || i + 1;

    // CHECK IF IMAGE ALREADY EXISTS
    if (
      step.image_url &&
      step.image_url.length > 20 &&
      step.image_url.startsWith("http")
    ) {
      console.log(`  Step ${stepNum}: SKIP (already has image)`);
      existing++;
      continue;
    }

    // Need to generate
    console.log(`  Step ${stepNum}: GENERATING...`);

    const hint =
      step.image_hint ||
      step.text?.substring(0, 100) ||
      `Step ${stepNum} of ${slug}`;
    const prompt = getImagePrompt(hint);

    const imageUrl = await generateImage(prompt);

    if (imageUrl === "CREDITS_EXHAUSTED") {
      creditsExhausted = true;
      console.log(`\n  STOPPING: API credits exhausted. Resume later.`);
      break;
    }

    if (imageUrl) {
      const publicUrl = await uploadImage(imageUrl, slug, stepNum);
      if (publicUrl) {
        updatedInstructions[i] = { ...step, image_url: publicUrl };
        generated++;
        console.log(`    SUCCESS`);

        // SAVE IMMEDIATELY after each successful image (crash-safe)
        const { error: saveError } = await supabase
          .from("recipe_content")
          .update({
            instructions: updatedInstructions,
            generated_at: new Date().toISOString(),
          })
          .eq("wp_slug", slug);

        if (saveError) {
          console.error(`    Save error:`, saveError.message);
        } else {
          console.log(`    Saved to DB immediately`);
        }
      } else {
        failed++;
        console.log(`    FAILED (upload error)`);
      }
    } else {
      failed++;
      console.log(`    FAILED (generation error)`);
    }

    // Small delay between requests
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\nSummary for ${slug}:`);
  console.log(`  Existing: ${existing}`);
  console.log(`  Generated: ${generated}`);
  console.log(`  Failed: ${failed}`);

  return {
    slug,
    total: instructions.length,
    existing,
    generated,
    failed,
    creditsExhausted,
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage:");
    console.log("  npx tsx scripts/generate-missing-images.ts [recipe-slug]");
    console.log("  npx tsx scripts/generate-missing-images.ts --all");
    console.log("  npx tsx scripts/generate-missing-images.ts --check");
    console.log("\nExamples:");
    console.log("  npx tsx scripts/generate-missing-images.ts chicken-curry");
    console.log("  npx tsx scripts/generate-missing-images.ts --all");
    return;
  }

  // Check mode - just show what's missing
  if (args[0] === "--check") {
    console.log("Checking all recipes for missing images...\n");

    const { data: recipes } = await supabase
      .from("recipe_content")
      .select("wp_slug, title, instructions");

    if (!recipes) return;

    let totalMissing = 0;
    for (const recipe of recipes) {
      const instructions = Array.isArray(recipe.instructions)
        ? recipe.instructions
        : [];
      const missing = instructions.filter(
        (i: any) => !i.image_url || i.image_url.length < 20,
      ).length;

      if (missing > 0) {
        console.log(
          `${recipe.wp_slug}: ${missing}/${instructions.length} missing`,
        );
        totalMissing += missing;
      }
    }

    console.log(`\nTotal missing images: ${totalMissing}`);
    console.log(
      `Estimated cost: $${(totalMissing * 0.06).toFixed(2)} (at $0.06/image)`,
    );
    return;
  }

  // Get list of recipes to process
  let slugs: string[] = [];

  if (args[0] === "--all") {
    // Get all recipes with missing images
    const { data: recipes } = await supabase
      .from("recipe_content")
      .select("wp_slug, instructions");

    if (recipes) {
      slugs = recipes
        .filter((r) => {
          const instructions = Array.isArray(r.instructions)
            ? r.instructions
            : [];
          return instructions.some(
            (i: any) => !i.image_url || i.image_url.length < 20,
          );
        })
        .map((r) => r.wp_slug);
    }
  } else {
    slugs = args;
  }

  if (slugs.length === 0) {
    console.log("No recipes with missing images found!");
    return;
  }

  console.log("=".repeat(60));
  console.log("SMART IMAGE GENERATOR");
  console.log("Only generates MISSING images - never duplicates");
  console.log("=".repeat(60));
  console.log(`\nRecipes to process: ${slugs.join(", ")}`);
  console.log(`BFL API Key: ${BFL_API_KEY ? "configured" : "MISSING"}`);

  const results: any[] = [];

  for (const slug of slugs) {
    const result = await processRecipe(slug);
    results.push(result);

    if (result.creditsExhausted) {
      console.log("\n⚠️  Credits exhausted. Stopping to save money.");
      console.log("   Top up BFL credits and run again to continue.");
      break;
    }
  }

  // Final summary
  console.log(`\n${"=".repeat(60)}`);
  console.log("FINAL SUMMARY");
  console.log("=".repeat(60));

  let totalExisting = 0;
  let totalGenerated = 0;
  let totalFailed = 0;

  for (const r of results) {
    console.log(
      `${r.slug}: ${r.existing} existing, ${r.generated} new, ${r.failed} failed`,
    );
    totalExisting += r.existing;
    totalGenerated += r.generated;
    totalFailed += r.failed;
  }

  console.log(`\nTotals:`);
  console.log(`  Already had images: ${totalExisting}`);
  console.log(`  Newly generated: ${totalGenerated}`);
  console.log(`  Failed: ${totalFailed}`);
  console.log(`  Estimated cost: $${(totalGenerated * 0.06).toFixed(2)}`);
}

main().catch(console.error);
