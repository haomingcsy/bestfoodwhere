/**
 * Generate AI food images for Old Chang Kee menu items using Fal.ai
 *
 * Run with: npx tsx scripts/generate-ock-images.ts
 */

import { fal } from "@fal-ai/client";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex);
      let value = trimmed.substring(eqIndex + 1);
      value = value.replace(/^"|"$/g, "");
      process.env[key] = value;
    }
  }
}

loadEnv();

fal.config({
  credentials: process.env.FAL_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const BRAND_ID = "a33d825a-4254-40e1-a972-3e4b72c55614";

// Detailed prompts for each menu item to generate realistic food images
const FOOD_PROMPTS: Record<string, string> = {
  "Curry Puff (Original)":
    "Professional food photography of a golden crispy Singaporean curry puff, flaky pastry filled with curry potato and egg, on a white plate, warm lighting, appetizing, high quality",
  "Curry Puff (Chicken)":
    "Professional food photography of a golden Singaporean chicken curry puff cut in half showing chunky chicken curry filling, flaky pastry, white plate, studio lighting",
  "Sardine Puff":
    "Professional food photography of a golden fried sardine puff pastry, flaky texture, Singaporean street food, on white plate, appetizing, warm lighting",
  "Yam Puff":
    "Professional food photography of a purple yam puff pastry, crispy flaky exterior with creamy taro filling, Asian dessert, white plate, studio lighting",
  "Veggie Puff":
    "Professional food photography of a golden vegetable curry puff, flaky pastry with vegetable filling, Singaporean snack, white plate, appetizing",
  "Fishball (5 pcs)":
    "Professional food photography of 5 golden fried fishballs on wooden skewers, Singaporean street food, crispy exterior, white plate, appetizing",
  "Sotong Head (3 pcs)":
    "Professional food photography of 3 crispy fried sotong heads (squid), golden battered, Singaporean street food, on white plate, appetizing",
  "Chicken Nuggets (5 pcs)":
    "Professional food photography of 5 golden crispy chicken nuggets, Asian style, on white plate, appetizing, studio lighting",
  "Spring Roll (2 pcs)":
    "Professional food photography of 2 golden crispy spring rolls, fried to perfection, Singaporean Chinese food, white plate, appetizing",
  "Prawn Fritter":
    "Professional food photography of a golden crispy prawn fritter, deep fried, showing whole prawn, Singaporean snack, white plate",
  "Cheese Sausage":
    "Professional food photography of a golden fried cheese sausage on a stick, crispy battered exterior, Singaporean street food, white plate",
  "Fried Wonton (5 pcs)":
    "Professional food photography of 5 golden crispy fried wontons, triangular shape, Singaporean Chinese food, white plate, appetizing",
  "Lor Mai Gai":
    "Professional food photography of lor mai gai (glutinous rice with chicken in lotus leaf), unwrapped showing sticky rice and chicken, Chinese dim sum, white plate",
  "Curry Chicken Noodle":
    "Professional food photography of Singapore curry chicken noodle soup, yellow noodles in rich curry broth with chicken pieces, in a bowl, appetizing",
  "Dry Laksa":
    "Professional food photography of dry laksa noodles, thick rice noodles with spicy laksa sauce, prawns and fishcake, Singaporean food, in a bowl",
  "Nasi Lemak Set":
    "Professional food photography of nasi lemak set, coconut rice with fried chicken wing, ikan bilis, peanuts, egg, sambal, on banana leaf, Malaysian food",
  "Value Meal A":
    "Professional food photography of Singaporean curry puff combo meal with fishballs and drink, on a tray, fast food style, appetizing",
  "Value Meal B":
    "Professional food photography of Singaporean fried snacks combo meal with curry puff, nuggets and drink, on a tray, appetizing",
  "Family Pack":
    "Professional food photography of assorted Singaporean fried snacks platter, curry puffs, fishballs, spring rolls, nuggets, on a large plate, party food",
  "Iced Lemon Tea":
    "Professional food photography of iced lemon tea in a clear plastic cup with ice and lemon slice, refreshing drink, studio lighting",
  "Iced Milo":
    "Professional food photography of iced Milo chocolate drink in a clear cup with ice, Malaysian favorite drink, appetizing",
  "Mineral Water":
    "Professional product photography of a bottle of mineral water, clear and refreshing, studio lighting",
  "Soft Drink (Can)":
    "Professional product photography of a cold soda can with condensation droplets, refreshing drink, studio lighting",
};

async function generateImage(prompt: string): Promise<string | null> {
  try {
    const result = await fal.subscribe("fal-ai/fast-sdxl", {
      input: {
        prompt: prompt,
        negative_prompt:
          "blurry, low quality, distorted, ugly, text, watermark, logo",
        image_size: "square",
        num_inference_steps: 25,
        guidance_scale: 7.5,
        num_images: 1,
      },
    });

    const images = result.data?.images;
    if (images && images.length > 0) {
      return images[0].url;
    }
    return null;
  } catch (error) {
    console.error("Fal AI error:", (error as Error).message);
    return null;
  }
}

async function uploadToSupabase(
  imageUrl: string,
  itemName: string,
): Promise<string | null> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create filename
    const slug = itemName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const filename = `old-chang-kee/${slug}-${Date.now()}.jpg`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("menu-images")
      .upload(filename, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error.message);
      return imageUrl; // Return original URL as fallback
    }

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from("menu-images")
      .getPublicUrl(filename);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error("Upload failed:", (error as Error).message);
    return imageUrl; // Return original URL as fallback
  }
}

async function main() {
  console.log("🎨 Generating AI food images for Old Chang Kee\n");
  console.log("⚠️  These are AI-generated images, not actual product photos\n");

  // Get all menu items
  const { data: items, error } = await supabase
    .from("menu_items")
    .select("id, name")
    .eq("brand_menu_id", BRAND_ID);

  if (error || !items) {
    console.error("Failed to fetch menu items:", error?.message);
    return;
  }

  console.log(`Found ${items.length} menu items\n`);

  let generated = 0;
  let failed = 0;

  for (const item of items) {
    const prompt = FOOD_PROMPTS[item.name];
    if (!prompt) {
      console.log(`⏭️  Skipping ${item.name} (no prompt defined)`);
      continue;
    }

    console.log(`🖼️  Generating: ${item.name}`);

    const imageUrl = await generateImage(prompt);
    if (!imageUrl) {
      console.log(`   ❌ Failed to generate`);
      failed++;
      continue;
    }

    // Upload to Supabase Storage
    console.log(`   📤 Uploading to storage...`);
    const finalUrl = await uploadToSupabase(imageUrl, item.name);

    // Update database
    const { error: updateError } = await supabase
      .from("menu_items")
      .update({
        original_image_url: finalUrl,
        // Mark as AI-generated
        dietary_tags: supabase.rpc ? undefined : undefined, // Keep existing tags
      })
      .eq("id", item.id);

    if (updateError) {
      console.log(`   ❌ DB update failed: ${updateError.message}`);
      failed++;
    } else {
      console.log(`   ✅ Done`);
      generated++;
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("\n=============================");
  console.log(`✅ Generated: ${generated}`);
  console.log(`❌ Failed: ${failed}`);
  console.log("\n⚠️  Remember to add disclaimer to UI!");
}

main().catch(console.error);
