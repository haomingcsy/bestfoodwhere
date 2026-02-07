/**
 * Generate HIGH QUALITY AI food images for Old Chang Kee menu items using Fal.ai Flux
 *
 * Improvements over v1:
 * - Uses Flux model (much better quality than fast-sdxl)
 * - Unique prompts with varied angles, backgrounds, and styling
 * - More authentic Singapore hawker food characteristics
 *
 * Run with: npx tsx scripts/generate-ock-images-v2.ts
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

// Highly detailed, unique prompts with varied compositions
const FOOD_PROMPTS: Record<string, string> = {
  "Curry Puff (Original)":
    "Stunning food photography, single golden curry puff with distinctive crimped edges, cut open revealing steaming curry potato filling with visible egg slice, placed on weathered wooden board, scattered curry leaves as garnish, dramatic side lighting creating golden glow, shallow depth of field, 85mm lens, f/2.8",

  "Curry Puff (Chicken)":
    "Mouthwatering close-up of chicken curry puff torn in half, chunky chicken pieces and potatoes visible in rich yellow curry filling, flaky layers of pastry clearly visible, served on traditional kopitiam plate with blue rim, overhead 45-degree angle, natural window light, food magazine style",

  "Sardine Puff":
    "Artisan sardine puff pastry on black slate board, golden brown crispy exterior with visible flaky layers, one piece broken showing sardine filling with onions, fresh parsley garnish, moody dark background, single spotlight creating dramatic shadows, editorial food photography",

  "Yam Puff":
    "Exquisite purple yam puff (wu kok) with delicate crispy lattice exterior, cross-section showing creamy taro filling, placed on elegant ceramic dish with Asian patterns, soft natural lighting from left, minimalist composition, fine dining presentation, shallow DOF",

  "Veggie Puff":
    "Vegetarian curry puff on rustic terracotta plate, golden pastry with fork-crimped edges, halved to show colorful vegetable filling with carrots, peas, and potatoes, fresh herbs scattered around, warm afternoon sunlight, homestyle comfort food aesthetic",

  "Fishball (5 pcs)":
    "Five bouncy golden fried fishballs threaded on bamboo skewer, glossy surface with slight char marks, served in traditional hawker paper cone, sweet chili sauce drizzled on top, busy Singapore hawker center background blur, vibrant street food photography",

  "Sotong Head (3 pcs)":
    "Three crispy fried sotong heads (squid) arranged artfully on banana leaf, golden battered coating with visible tentacles, accompanied by lime wedge and sambal dip, top-down flat lay composition, tropical outdoor lighting, authentic Southeast Asian street food style",

  "Chicken Nuggets (5 pcs)":
    "Five perfectly golden chicken nuggets arranged in a semi-circle on red checkered paper liner, crispy breaded exterior, one nugget dipped in curry sauce showing juicy interior, casual fast food styling, bright cheerful lighting, family-friendly presentation",

  "Spring Roll (2 pcs)":
    "Two elegant Chinese spring rolls on white porcelain spoon rest, shatteringly crispy golden wrapper, one cut diagonally showing julienned vegetables inside, sweet chili sauce in small dish, chopsticks in frame, zen minimalist composition, soft diffused lighting",

  "Prawn Fritter":
    "Spectacular whole prawn fritter (hei zho) on vintage enamel plate, large pink prawn visible through golden crispy batter, traditional Peranakan style presentation, pandan leaves underneath, dramatic chiaroscuro lighting, rustic kopitiam table setting",

  "Cheese Sausage":
    "Cheese-filled sausage on stick with golden crispy coating, cheese stretching as it's pulled apart, served in Old Chang Kee branded paper holder, condensation droplets visible, action shot mid-bite, playful food photography, bright pop colors",

  "Fried Wonton (5 pcs)":
    "Five crispy fried wontons arranged like flower petals on round black plate, golden triangular shapes with bubbly texture, sweet and sour sauce in center, scattered sesame seeds, dramatic overhead lighting, Chinese restaurant ambiance",

  "Lor Mai Gai":
    "Unwrapped lor mai gai on lotus leaf, glistening glutinous rice with visible chicken, mushroom, and salted egg yolk, steam rising, traditional dim sum bamboo steamer in background, warm tungsten lighting, authentic Chinese teahouse atmosphere, macro detail shot",

  "Curry Chicken Noodle":
    "Steaming bowl of Singapore curry chicken noodle, rich orange curry broth, yellow egg noodles, tender chicken pieces, tau pok (fried tofu), garnished with fresh cilantro and sliced chili, ceramic spoon resting on bowl, cozy rainy day mood lighting",

  "Dry Laksa":
    "Vibrant dry laksa in deep ceramic bowl, thick bee hoon noodles coated in spicy red laksa sauce, topped with prawns, fishcake slices, and bean sprouts, sambal on side, laksa leaf garnish, overhead shot, hawker center aesthetic, punchy saturated colors",

  "Nasi Lemak Set":
    "Complete nasi lemak spread on fresh banana leaf, fragrant coconut rice shaped in mound, crispy fried chicken wing, sunny side up egg, ikan bilis and peanuts, cucumber slices, generous sambal, traditional Malay kampung style, natural daylight, feast composition",

  "Value Meal A":
    "Old Chang Kee value meal on branded tray, curry puff and fishball skewer with iced drink, casual angle showing all items, red and yellow brand colors visible, food court setting, quick service restaurant styling, appetizing everyday meal",

  "Value Meal B":
    "Combo meal featuring curry puff, chicken nuggets, and spring roll with soft drink, arranged on OCK branded tray liner, ketchup and curry sauce packets, teenage hangout vibe, bright fluorescent lighting, authentic fast food aesthetic",

  "Family Pack":
    "Generous party platter overflowing with assorted Old Chang Kee snacks - curry puffs, spring rolls, fishballs, nuggets, sotong - on large wooden serving board, multiple dipping sauces, hands reaching in to grab food, celebration atmosphere, wide angle shot",

  "Iced Lemon Tea":
    "Tall glass of iced lemon tea with crystal clear ice cubes, fresh lemon wheel floating on top, condensation droplets on glass, mint sprig garnish, bright sunny poolside vibe, turquoise background, refreshing summer drink photography",

  "Iced Milo":
    "Iconic iced Milo in tall glass, rich chocolate brown color, creamy foam on top with Milo powder sprinkled, green striped straw, Malaysian childhood nostalgia aesthetic, retro kopitiam table, warm golden hour lighting",

  "Mineral Water":
    "Crystal clear mineral water bottle with droplets, poured into glass creating splash, ice cubes mid-air, pure white background, high-speed photography capturing water dynamics, clean refreshing commercial style",

  "Soft Drink (Can)":
    "Ice-cold cola can with dramatic condensation and frost, pouring into glass with fizzy bubbles, ice cubes splashing, dark moody background with rim lighting, commercial beverage photography, ultra-realistic detail",
};

async function generateImage(prompt: string): Promise<string | null> {
  try {
    // Using Flux Schnell for high quality + speed balance
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: prompt,
        image_size: "square_hd", // Higher resolution
        num_inference_steps: 4, // Flux schnell uses fewer steps
        num_images: 1,
        enable_safety_checker: false,
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

    // Create filename with v2 prefix
    const slug = itemName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const filename = `old-chang-kee/v2-${slug}-${Date.now()}.jpg`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
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
  console.log("🎨 Generating HIGH QUALITY AI food images for Old Chang Kee\n");
  console.log("📸 Using Flux model for premium quality\n");
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
  console.log("─".repeat(50));

  let generated = 0;
  let failed = 0;

  for (const item of items) {
    const prompt = FOOD_PROMPTS[item.name];
    if (!prompt) {
      console.log(`⏭️  Skipping ${item.name} (no prompt defined)`);
      continue;
    }

    console.log(`\n🖼️  Generating: ${item.name}`);
    console.log(`   📝 Prompt: ${prompt.substring(0, 60)}...`);

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
      })
      .eq("id", item.id);

    if (updateError) {
      console.log(`   ❌ DB update failed: ${updateError.message}`);
      failed++;
    } else {
      console.log(`   ✅ Done: ${finalUrl?.substring(0, 60)}...`);
      generated++;
    }

    // Rate limiting - Flux is faster, less delay needed
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  console.log("\n" + "═".repeat(50));
  console.log(`✅ Generated: ${generated}`);
  console.log(`❌ Failed: ${failed}`);
  console.log("═".repeat(50));
  console.log("\n⚠️  Remember: These are AI-generated images!");
  console.log("💡 Consider adding a disclaimer on the menu page.");
}

main().catch(console.error);
