/**
 * Update 3 chicken recipes: baked-chicken-thighs, chicken-breast, chicken-soup
 * - Update equipment (3-5 items matching affiliate keywords)
 * - Expand instructions to beginner-friendly paragraphs
 * - Generate WikiHow-style images using BFL API
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

// Recipe updates configuration
const RECIPE_UPDATES: Record<string, RecipeUpdate> = {
  "baked-chicken-thighs": {
    equipment: [
      { name: "Cast iron skillet", required: true },
      { name: "Instant-read thermometer", required: true },
      { name: "Cutting board", required: true },
      { name: "Kitchen tongs", required: true },
    ],
    instructions: [
      {
        step: 1,
        text: "Start by removing your chicken thighs from the refrigerator and placing them on a clean cutting board or large plate. Use several sheets of paper towels to thoroughly pat each thigh completely dry on both sides. This step is absolutely critical for achieving crispy skin because moisture is the enemy of crispiness. Spend a good 2-3 minutes really pressing down and absorbing all the surface moisture. The drier your chicken, the crispier your skin will be. If you have extra time, you can leave them uncovered in the refrigerator for 1-24 hours to air-dry the skin even further.",
        image_hint:
          "Paper towels patting chicken thighs dry on wooden cutting board",
      },
      {
        step: 2,
        text: "For the crispiest possible skin, consider this optional but highly recommended step: place the dried chicken thighs on a wire rack set over a plate or baking sheet. Leave them uncovered in your refrigerator for at least 1 hour, or ideally overnight (up to 24 hours). The cold, dry air of the refrigerator will draw out additional moisture from the skin, creating that professional-level crunch. This technique is what restaurants use to achieve their famously crispy chicken. If you are short on time, you can skip this step, but your skin will not be quite as shatteringly crispy.",
        image_hint: "Chicken thighs arranged on wire rack inside refrigerator",
      },
      {
        step: 3,
        text: "About 30 minutes before you are ready to cook, preheat your oven to 425F (220C). Position your oven rack in the upper-middle position for optimal heat circulation. While the oven heats, set up your baking station: place a wire cooling rack inside a rimmed baking sheet. This setup is crucial because it allows hot air to circulate completely around the chicken, crisping the bottom as well as the top. Without the rack, the bottom of the chicken would sit in its own juices and become soggy.",
        image_hint:
          "Wire cooling rack placed inside rimmed baking sheet with oven preheating",
      },
      {
        step: 4,
        text: "In a small bowl, combine all your dry seasonings: 1.5 teaspoons kosher salt, 1 teaspoon freshly ground black pepper, 1 teaspoon garlic powder, 1 teaspoon onion powder, 1 teaspoon smoked paprika, half teaspoon dried thyme, half teaspoon dried oregano, and half teaspoon baking powder. The baking powder is a secret weapon: it raises the pH of the skin, which helps it brown faster and become crispier. Use a fork or small whisk to mix everything together until well combined.",
        image_hint:
          "Small bowl with colorful spice mixture being stirred together",
      },
      {
        step: 5,
        text: "Drizzle 2 tablespoons of olive oil over your chicken thighs and use your hands to rub it evenly over all surfaces of each piece. The oil helps the seasonings adhere and promotes even browning. Now generously season both sides of each thigh with the spice mixture, pressing it firmly into the skin with your fingers. Do not be shy with the seasoning. Chicken thighs have bold, dark meat flavor that can handle and benefits from generous seasoning. Make sure to get some seasoning on the underside too.",
        image_hint:
          "Hands pressing spice rub into raw chicken thighs with visible coating",
      },
      {
        step: 6,
        text: "Arrange your seasoned chicken thighs on the wire rack, making sure they are skin-side up. This is important because you want the skin exposed to the direct heat for maximum crispiness. Space the pieces at least 1 inch apart from each other so air can circulate freely around each thigh. Overcrowding will cause the chicken to steam rather than roast, resulting in soggy skin. If you have too many thighs for one pan, use two pans or cook in batches.",
        image_hint:
          "Seasoned chicken thighs arranged skin-side up on wire rack with even spacing",
      },
      {
        step: 7,
        text: "Place the baking sheet in your preheated 425F oven and set a timer for 35 minutes. During this time, resist the urge to open the oven door, as this releases heat and extends cooking time. The high heat will render the fat under the skin while crisping the exterior. After 35 minutes, check the internal temperature by inserting an instant-read thermometer into the thickest part of the thigh without touching the bone. You are looking for 175-180F, which is higher than the standard 165F because dark meat benefits from higher temperatures.",
        image_hint:
          "Golden crispy chicken thighs baking in oven with visible browning",
      },
      {
        step: 8,
        text: "For the absolute crispiest skin, turn on your oven broiler for the final 2-3 minutes of cooking. Watch the chicken very carefully during this step, as it can go from perfectly golden to burnt quickly under the broiler intense heat. Keep the oven door slightly ajar so you can monitor the color. The skin should turn a deep, appetizing golden-brown color and look slightly blistered in spots. If any pieces are browning faster than others, rotate the pan or remove the finished pieces early.",
        image_hint:
          "Chicken under broiler with skin crisping to deep golden brown",
      },
      {
        step: 9,
        text: "Remove the baking sheet from the oven and let the chicken rest on the wire rack for exactly 5 minutes. This resting period allows the juices to redistribute throughout the meat, resulting in juicier chicken when you cut into it. Very important: Do NOT cover the chicken with foil during this rest. Unlike lean chicken breast, you do not need to trap heat, and covering would create steam that softens your hard-earned crispy skin. The skin should feel firm and crackly to the touch.",
        image_hint:
          "Golden brown crispy chicken thighs resting on wire rack with steam rising",
      },
      {
        step: 10,
        text: "Transfer your perfectly crispy chicken thighs to a serving platter or individual plates. Garnish with fresh herbs like parsley or thyme if desired, but serve immediately while the skin is at maximum crispiness. The skin will start to soften after 10-15 minutes as steam from the hot meat rises up. Each bite should deliver that satisfying crunch followed by tender, juicy, flavorful dark meat. Serve alongside your favorite sides like roasted vegetables or mashed potatoes.",
        image_hint:
          "Beautifully plated crispy chicken thigh garnished with fresh herbs on white plate",
      },
    ],
  },

  "chicken-breast": {
    equipment: [
      { name: "Cast iron skillet", required: true },
      { name: "Instant-read thermometer", required: true },
      { name: "Chef's knife", required: true },
      { name: "Kitchen tongs", required: true },
    ],
    instructions: [
      {
        step: 1,
        text: "The first and most important step for juicy chicken breast is to bring the meat to room temperature before cooking. Remove your chicken breasts from the refrigerator 15-20 minutes before you plan to start cooking. Place them on a clean cutting board or plate and let them sit on the counter. This might seem like a small step, but it is actually crucial for even cooking. Cold chicken straight from the fridge will cook unevenly - the outside will overcook and become dry while the inside is still catching up. Room temperature chicken cooks more evenly throughout.",
        image_hint:
          "Raw chicken breasts resting on wooden cutting board at room temperature",
      },
      {
        step: 2,
        text: "While your chicken is coming to room temperature, preheat your oven to 425F (220C). This high temperature is key to juicy chicken breast. It creates a quick sear on the outside that locks in the juices while cooking the interior through before it has a chance to dry out. Position your oven rack in the middle position for even heat distribution. Line a rimmed baking sheet with parchment paper for easy cleanup - this also prevents the chicken from sticking and makes serving easier.",
        image_hint:
          "Oven control panel showing 425 degrees with parchment-lined baking sheet",
      },
      {
        step: 3,
        text: "This step is the single most important technique for preventing dry chicken breast: pounding to an even thickness. Place each chicken breast between two sheets of plastic wrap or inside a zip-lock bag. Using a meat mallet, rolling pin, or even the bottom of a heavy pan, gently pound the thicker end of the breast until the entire piece is approximately three-quarter inch thick throughout. Chicken breasts are naturally tapered, with a thick end and a thin end. Without pounding, the thin end overcooks and dries out while the thick end is still undercooked.",
        image_hint:
          "Chicken breast being pounded flat with meat mallet between plastic wrap",
      },
      {
        step: 4,
        text: "Using paper towels, pat each chicken breast completely dry on both sides. This step is essential for achieving a beautiful golden brown exterior. Moisture on the surface of the chicken prevents browning because the heat energy is used to evaporate the water instead of creating the Maillard reaction (browning). Press firmly with the paper towels and do not rush this step. You want the surface of the chicken to feel almost tacky when you are done. The drier the chicken, the better it will brown.",
        image_hint:
          "Paper towels pressing firmly against chicken breast to absorb moisture",
      },
      {
        step: 5,
        text: "In a small bowl, combine your seasoning blend: 1 teaspoon kosher salt, half teaspoon freshly ground black pepper, 1 teaspoon garlic powder, 1 teaspoon paprika (sweet or smoked), half teaspoon onion powder, half teaspoon dried thyme, and 1 teaspoon brown sugar (optional but adds caramelization). Mix these together thoroughly. Drizzle 2 tablespoons of olive oil over both sides of each chicken breast, using your hands to coat evenly. Then generously sprinkle the seasoning mixture over both sides, pressing it gently into the meat.",
        image_hint:
          "Chicken breasts being coated with olive oil and colorful spice mixture",
      },
      {
        step: 6,
        text: "Arrange your seasoned chicken breasts on the prepared baking sheet, spacing them at least 2 inches apart. This spacing is important because it allows hot air to circulate around each piece, ensuring even cooking and browning. If the pieces are too close together or touching, they will steam instead of roast, resulting in pale, soggy chicken. Each breast should have its own space. If you are cooking a large batch and they do not fit with proper spacing, use two baking sheets rather than crowding them onto one.",
        image_hint:
          "Seasoned chicken breasts arranged on baking sheet with generous spacing",
      },
      {
        step: 7,
        text: "Place the baking sheet in your preheated 425F oven and set a timer for 18 minutes. During the first 15 minutes, resist the urge to open the oven door - every time you do, you lose significant heat and extend the cooking time. At 18 minutes, check the internal temperature by inserting an instant-read thermometer into the thickest part of the largest breast. You are looking for 165F (74C). If you are not there yet, continue baking in 2-minute increments until you reach the target temperature.",
        image_hint:
          "Chicken breasts baking in oven with golden color developing on top",
      },
      {
        step: 8,
        text: "For an extra golden, caramelized exterior, turn on your oven broiler for the final 2-3 minutes of cooking. Watch carefully during this step, as the intense direct heat can quickly take the chicken from perfectly browned to burnt. The sugars in the paprika and optional brown sugar will caramelize beautifully under the broiler, creating a gorgeous color and extra flavor. Keep the oven door slightly cracked so you can monitor the progress. Once you see the top turn deep golden with some slightly darker spots, it is perfect.",
        image_hint:
          "Chicken breast with deep golden caramelized top sizzling under the broiler",
      },
      {
        step: 9,
        text: "Remove the baking sheet from the oven and here is where patience is crucial: let the chicken rest for 5-10 minutes before cutting into it. Loosely tent the chicken with aluminum foil to keep it warm during resting. This resting period allows the protein fibers to relax and reabsorb the juices that were pushed to the center during cooking. If you cut into the chicken immediately, all those delicious juices will pour out onto the cutting board instead of staying in the meat. After resting, the juices will be evenly distributed.",
        image_hint:
          "Cooked chicken breasts resting under loose aluminum foil tent on baking sheet",
      },
      {
        step: 10,
        text: "Transfer the rested chicken to a clean cutting board. If serving sliced, cut against the grain (perpendicular to the muscle fibers) for the most tender texture. Use a sharp knife and make clean, confident cuts about half inch thick. Notice how the juices stay inside the meat instead of flooding the cutting board - that is the magic of proper resting. The interior should be white throughout with no pink, and the texture should be moist and tender, not dry or stringy. Serve immediately while warm.",
        image_hint:
          "Juicy chicken breast being sliced on cutting board showing moist white interior",
      },
    ],
  },

  "chicken-soup": {
    equipment: [
      { name: "Dutch oven", required: true },
      { name: "Chef's knife", required: true },
      { name: "Cutting board", required: true },
      { name: "Ladle", required: true },
      { name: "Immersion blender", required: false },
    ],
    instructions: [
      {
        step: 1,
        text: "Place your whole chicken in a large stockpot or Dutch oven (at least 8-quart capacity). The chicken should fit comfortably with room for vegetables and water around it. Add the quartered onions, roughly chopped carrots, celery stalks (include the leaves for extra flavor), and the halved garlic head. Scatter the black peppercorns, bay leaves, thyme sprigs, and parsley (stems and all) around the chicken. The parsley stems actually have more flavor than the leaves and are perfect for stock. Do not worry about precise placement - everything will simmer together.",
        image_hint:
          "Whole raw chicken in large Dutch oven pot surrounded by vegetables and herbs",
      },
      {
        step: 2,
        text: "Add enough cold water to cover the chicken by about 1 inch (approximately 12 cups). Starting with cold water is important because it allows the proteins to gradually release their flavors into the liquid. Place the pot over medium heat and bring it to a very gentle simmer - you want to see small bubbles lazily rising to the surface, not a vigorous rolling boil. This is crucial: boiling the stock vigorously will make it cloudy and can give it a slightly greasy, emulsified texture. Gentle simmering extracts flavor while keeping the broth clear and golden.",
        image_hint:
          "Large Dutch oven pot with chicken and vegetables with water starting to simmer",
      },
      {
        step: 3,
        text: "During the first 20-30 minutes of simmering, you will notice foam and impurities rising to the surface of the liquid. Using a ladle or large spoon, carefully skim off this foam and discard it. This step is important for achieving a clean-tasting, clear broth. The foam consists of coagulated proteins and impurities that can make your stock taste muddy if left in. You do not need to get every last bit, but removing the bulk of it makes a noticeable difference in the final soup clarity and taste.",
        image_hint:
          "Ladle skimming white foam from the surface of simmering chicken stock",
      },
      {
        step: 4,
        text: "Once you have skimmed the initial foam, adjust the heat to maintain a bare simmer (small bubbles occasionally breaking the surface) and let the stock cook uncovered for 1.5 hours. During this time, the chicken will become incredibly tender and the bones will release their collagen, giving your stock that rich, silky body that makes homemade soup so special. You will know the extraction is working when the stock develops a beautiful golden color and smells incredibly savory and comforting. Resist the urge to stir too much.",
        image_hint:
          "Beautiful golden broth simmering gently in pot with aromatics visible and steam rising",
      },
      {
        step: 5,
        text: "After 1.5 hours, the chicken should be completely tender and falling off the bone. Using two large forks or tongs, very carefully lift the chicken from the pot and transfer it to a large bowl or cutting board to cool. Be gentle - the chicken will be very tender and may fall apart. Set up a fine-mesh strainer over a large clean pot or heat-safe bowl. Pour the stock through the strainer, discarding all the solids (cooked vegetables, herbs, peppercorns). Press gently on the solids to extract every last drop of flavorful liquid.",
        image_hint:
          "Golden stock being poured through fine-mesh strainer into clean pot",
      },
      {
        step: 6,
        text: "Once the chicken is cool enough to handle (about 15-20 minutes), use your hands or two forks to shred the meat into bite-sized pieces. Remove and discard the skin, bones, and cartilage as you go. You should end up with about 4 cups of tender, flavorful shredded chicken. The meat will be incredibly moist and flavorful from cooking in the stock. Save the bones and carcass if you want to make a second stock (double stock is incredibly rich) or discard them. Set the shredded chicken aside while you build the soup base.",
        image_hint:
          "Hands shredding tender cooked chicken into bite-sized pieces in large bowl",
      },
      {
        step: 7,
        text: "In a clean large pot or Dutch oven, heat 2 tablespoons of olive oil over medium heat until it shimmers. Add the diced onion and cook, stirring occasionally, until it softens and becomes translucent, about 5 minutes. You are not looking to brown the onion, just soften it and develop its sweetness. The onion should look glassy and smell sweet. This step creates the flavor foundation for your soup - sauteed onions add a depth that raw onions simply do not have. Stir frequently to prevent any browning on the bottom of the pot.",
        image_hint:
          "Diced onion sauteing in Dutch oven pot becoming translucent and glossy",
      },
      {
        step: 8,
        text: "Add the sliced carrots and celery to the pot with the softened onions. Cook, stirring occasionally, for another 5 minutes until the vegetables start to soften slightly at the edges but still have some crunch. Add the minced garlic and cook for just 1 more minute until it becomes fragrant - garlic burns easily, so keep stirring once you add it. The combination of onion, carrot, celery, and garlic forms the classic aromatic base that gives chicken soup its comforting, familiar flavor. The kitchen should smell amazing at this point.",
        image_hint:
          "Colorful carrots and celery sauteing with onions and garlic in pot",
      },
      {
        step: 9,
        text: "Pour your beautiful homemade stock over the sauteed vegetables. Use all of it - about 8-10 cups. Bring the soup to a boil over high heat, then reduce to medium-low and season with salt to taste (start with 2 teaspoons and adjust from there). Homemade stock needs more salt than you might expect to really bring out its flavor. Taste as you go and keep adding salt in small amounts until the soup tastes pleasantly savory without being salty. This is also when you will really appreciate the depth of flavor your homemade stock provides.",
        image_hint:
          "Golden homemade stock being poured over sauteed vegetables in Dutch oven",
      },
      {
        step: 10,
        text: "Add the egg noodles to the simmering soup and cook until al dente, which is about 2 minutes less than the package directions indicate. The noodles will continue to absorb liquid and soften as they sit, so slightly undercooking them prevents mushiness. Stir occasionally to prevent the noodles from sticking together or to the bottom of the pot. If you are making this ahead or meal prepping, consider cooking the noodles separately and adding them to individual bowls when serving to prevent them from becoming mushy.",
        image_hint:
          "Wide egg noodles being stirred into simmering golden chicken soup",
      },
      {
        step: 11,
        text: "Add all of your shredded chicken back into the pot and stir gently to distribute it throughout the soup. Heat the chicken through for 2-3 minutes - it is already cooked, so you are just warming it back up. Taste the soup one more time and adjust the seasoning if needed. The chicken should soak up some of that delicious broth flavor. If your soup seems too thick, add a splash more stock or water. If it is too thin, let it simmer uncovered for a few minutes to reduce slightly.",
        image_hint:
          "Shredded chicken being stirred into noodle soup with ladle",
      },
      {
        step: 12,
        text: "Remove the pot from heat and stir in the lemon juice if using - this brightens all the flavors and adds a subtle lift that takes the soup from good to great. Ladle the soup into deep bowls, making sure each serving gets a generous amount of chicken, noodles, and vegetables. Top each bowl with a sprinkle of fresh chopped dill and a crack of black pepper. Serve immediately while piping hot. This soup is perfect on its own or with crusty bread for dunking. The leftovers taste even better the next day.",
        image_hint:
          "Beautiful bowl of chicken noodle soup garnished with fresh dill and steam rising",
      },
    ],
  },
};

interface RecipeEquipmentItem {
  name: string;
  required: boolean;
}

interface RecipeUpdate {
  equipment: RecipeEquipmentItem[];
  instructions: Array<{
    step: number;
    text: string;
    image_hint: string;
  }>;
}

// Generate WikiHow-style image prompt
function getImagePrompt(hint: string): string {
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
      await new Promise((r) => setTimeout(r, 5000));

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
  slug: string,
  stepNum: number,
): Promise<string | null> {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) return null;

    const imageBuffer = await imageResponse.arrayBuffer();
    const filePath = `${slug}-v2/step-${stepNum}.png`;

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

// Process single recipe
async function processRecipe(slug: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Processing: ${slug}`);
  console.log("=".repeat(60));

  const update = RECIPE_UPDATES[slug];
  if (!update) {
    console.error(`No update config for ${slug}`);
    return;
  }

  // Fetch current recipe
  const { data: recipe, error } = await supabase
    .from("recipe_content")
    .select("*")
    .eq("wp_slug", slug)
    .single();

  if (error || !recipe) {
    console.error(`Failed to fetch recipe ${slug}:`, error);
    return;
  }

  console.log(`Current title: ${recipe.title}`);
  console.log(
    `Updating equipment: ${update.equipment.map((e) => e.name).join(", ")}`,
  );
  console.log(`Total steps: ${update.instructions.length}`);

  // Prepare updated instructions with images
  const updatedInstructions: any[] = [];
  let successCount = 0;

  for (const step of update.instructions) {
    console.log(`\n--- Step ${step.step} ---`);
    console.log(`Hint: ${step.image_hint.substring(0, 60)}...`);

    const prompt = getImagePrompt(step.image_hint);
    const imageUrl = await generateImage(prompt);

    let publicUrl: string | null = null;
    if (imageUrl) {
      publicUrl = await uploadImage(imageUrl, slug, step.step);
      if (publicUrl) {
        successCount++;
        console.log(`  SUCCESS: ${publicUrl.substring(0, 80)}...`);
      }
    }

    updatedInstructions.push({
      step: step.step,
      text: step.text,
      image_hint: step.image_hint,
      image_url: publicUrl || "",
    });

    // Small delay between requests
    await new Promise((r) => setTimeout(r, 500));
  }

  // Update recipe in Supabase
  console.log(`\n--- Saving ${slug} to Supabase ---`);
  const { error: updateError } = await supabase
    .from("recipe_content")
    .update({
      equipment: update.equipment,
      instructions: updatedInstructions,
      generated_at: new Date().toISOString(),
    })
    .eq("wp_slug", slug);

  if (updateError) {
    console.error(`Save error for ${slug}:`, updateError);
  } else {
    console.log(`${slug} saved successfully!`);
    console.log(
      `  Images: ${successCount}/${update.instructions.length} generated`,
    );
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("Updating 3 Chicken Recipes");
  console.log("Recipes: baked-chicken-thighs, chicken-breast, chicken-soup");
  console.log("=".repeat(60));

  const slugs = ["baked-chicken-thighs", "chicken-breast", "chicken-soup"];

  for (const slug of slugs) {
    await processRecipe(slug);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("ALL RECIPES UPDATED");
  console.log("=".repeat(60));
}

main().catch(console.error);
