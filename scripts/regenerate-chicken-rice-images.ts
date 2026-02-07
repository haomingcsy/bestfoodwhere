/**
 * Regenerate WikiHow-style images for chicken-rice only
 * Uses correct prompt: clean line art, soft pastel watercolor, NO TEXT
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

// Clean line art prompt - NO TEXT, NO "WikiHow" word
function getImagePrompt(hint: string, recipeName: string): string {
  return `${hint}, clean line art illustration, soft pastel watercolor style, minimalist cooking scene, no text, no labels, no numbers, no words, no letters, no watermarks, light cream background, simple instructional diagram`;
}

// Generate image using BFL API
async function generateImage(prompt: string): Promise<string | null> {
  try {
    console.log(`  Requesting image...`);

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
      console.error(`  BFL API error: ${submitResponse.status}`);
      return null;
    }

    const { id: taskId } = await submitResponse.json();
    console.log(`  Task ID: ${taskId}, polling...`);

    // Poll for result
    for (let attempt = 1; attempt <= 60; attempt++) {
      await new Promise((r) => setTimeout(r, 2000));

      const resultResponse = await fetch(
        `https://api.bfl.ai/v1/get_result?id=${taskId}`,
        { headers: { "X-Key": BFL_API_KEY } },
      );

      const result = await resultResponse.json();

      if (result.status === "Ready") {
        console.log(`  Image ready!`);
        return result.result?.sample;
      } else if (result.status === "Error") {
        console.error(`  Generation failed`);
        return null;
      }

      if (attempt % 10 === 0) {
        console.log(`  Status: ${result.status} (attempt ${attempt}/60)`);
      }
    }

    console.error(`  Timeout`);
    return null;
  } catch (error) {
    console.error(`  Error:`, error);
    return null;
  }
}

// Upload to Supabase Storage
async function uploadImage(
  imageUrl: string,
  step: number,
): Promise<string | null> {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) return null;

    const imageBuffer = await imageResponse.arrayBuffer();
    const filePath = `chicken-rice-v2/step-${step}.png`;

    console.log(`  Uploading: ${filePath}`);

    const { error } = await supabase.storage
      .from("recipe-images")
      .upload(filePath, imageBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      console.error(`  Upload error:`, error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(filePath);
    return data.publicUrl + `?v=${Date.now()}`;
  } catch (error) {
    console.error(`  Upload error:`, error);
    return null;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("Regenerating WikiHow-style images for chicken-rice");
  console.log("=".repeat(60));

  // Fetch current recipe
  const { data: recipe, error } = await supabase
    .from("recipe_content")
    .select("*")
    .eq("wp_slug", "chicken-rice")
    .single();

  if (error || !recipe) {
    console.error("Failed to fetch recipe:", error);
    return;
  }

  console.log(`\nRecipe: ${recipe.title}`);
  console.log(`Steps: ${recipe.instructions.length}`);

  // Image hints for each step (from the detailed instructions)
  const imageHints = [
    "hands rubbing salt into whole raw chicken on wooden cutting board with ginger pieces",
    "whole chicken being lowered into large pot of simmering water with ginger and pandan",
    "golden chicken simmering in aromatic broth with gentle bubbles and steam",
    "hot oil being poured over grated ginger and sliced scallions in bowl sizzling",
    "bright orange-red chili sauce in small bowl with mortar and pestle",
    "cooked whole chicken being submerged into bowl of ice water with ice cubes",
    "glistening poached chicken being rubbed with sesame oil on cutting board",
    "jasmine rice being stirred in pot with garlic and shallots glistening with fat",
    "rice pot with tight lid and wisps of steam escaping",
    "fluffy aromatic chicken rice being fluffed with fork steam rising",
    "beautifully carved chicken pieces arranged on oval platter with silky skin",
    "complete Hainanese chicken rice spread with rice bowl sliced chicken and condiments",
  ];

  const instructions = recipe.instructions as any[];
  let successCount = 0;

  for (let i = 0; i < instructions.length; i++) {
    const step = instructions[i];
    const hint = imageHints[i] || step.text.substring(0, 100);

    console.log(`\n--- Step ${step.step} ---`);
    console.log(`Hint: ${hint.substring(0, 60)}...`);

    const prompt = getImagePrompt(hint, "Hainanese Chicken Rice");
    const imageUrl = await generateImage(prompt);

    if (imageUrl) {
      const publicUrl = await uploadImage(imageUrl, step.step);
      if (publicUrl) {
        instructions[i].image_url = publicUrl;
        successCount++;
        console.log(`  SUCCESS: ${publicUrl.substring(0, 80)}...`);
      }
    }

    // Small delay between requests
    await new Promise((r) => setTimeout(r, 500));
  }

  // Save updated recipe
  console.log(`\n--- Saving to Supabase ---`);
  const { error: updateError } = await supabase
    .from("recipe_content")
    .update({ instructions })
    .eq("wp_slug", "chicken-rice");

  if (updateError) {
    console.error("Save error:", updateError);
  } else {
    console.log("Recipe saved!");
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(
    `COMPLETE: ${successCount}/${instructions.length} images generated`,
  );
  console.log("=".repeat(60));
}

main().catch(console.error);
