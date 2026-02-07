/**
 * Update 3 Chicken Recipes: chicken-stew, sesame-chicken, kung-pao-chicken
 * - Equipment updated to match affiliate keywords
 * - Instructions expanded to beginner-friendly paragraphs (3-5 sentences)
 * - WikiHow-style images generated using BFL API
 *
 * Run with: npx tsx scripts/update-stew-sesame-kungpao.ts
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

interface RecipeUpdate {
  equipment: Array<{ name: string; required: boolean }>;
  instructions: Array<{
    step: number;
    text: string;
    time_minutes?: number;
    tip?: string;
    image_hint: string;
  }>;
}

// Recipe updates with AFFILIATE-MATCHED equipment keywords
const RECIPE_UPDATES: Record<string, RecipeUpdate> = {
  "chicken-stew": {
    // Equipment matched to: "dutch oven", "knife", "cutting board", "ladle"
    equipment: [
      { name: "Dutch oven", required: true },
      { name: "Chef's knife", required: true },
      { name: "Cutting board", required: true },
      { name: "Wooden spoons", required: true },
      { name: "Ladle", required: false },
    ],
    instructions: [
      {
        step: 1,
        text: "Start by preparing your chicken thighs on a clean cutting board. Using a sharp chef's knife, trim any excess fat from the thighs and cut them into uniform 1-inch pieces. Keeping the pieces the same size is crucial because it ensures they cook evenly, so none end up dry while others are still undercooked. Place 2 tablespoons of all-purpose flour in a shallow bowl, season it with a pinch of salt and pepper, then add the chicken pieces. Toss everything together until each piece is lightly but evenly coated - the flour will help create a beautiful golden crust and thicken the stew later.",
        time_minutes: 5,
        tip: "The flour coating helps brown the chicken and thickens the stew - don't skip this step!",
        image_hint:
          "Chicken pieces being tossed in flour in a bowl, flour coating visible on meat",
      },
      {
        step: 2,
        text: "Place your Dutch oven on the stovetop over medium-high heat and add both the butter and olive oil. The combination is important: butter adds rich flavor while olive oil raises the smoke point so the butter doesn't burn. Wait until the butter melts completely and starts to foam, which indicates the pan is hot enough. You'll know it's ready when the foaming subsides and you can see small wisps of steam rising from the surface. If the butter starts to brown too quickly, reduce the heat slightly.",
        time_minutes: 2,
        tip: "Combining butter and oil gives you the best of both worlds - butter flavor without burning",
        image_hint:
          "Butter and olive oil melting together in a Dutch oven, foam visible",
      },
      {
        step: 3,
        text: "Add the flour-coated chicken pieces to the hot pan, arranging them in a single layer with space between each piece. Here's the critical technique: resist the temptation to stir! Let the chicken sit undisturbed for 3-4 minutes until a deep golden-brown crust forms on the bottom. You'll know it's ready to flip when the chicken releases easily from the pan - if it sticks, it needs more time. Use tongs to flip each piece and brown the other side for another 2-3 minutes. If your pan isn't big enough, work in batches to avoid crowding.",
        time_minutes: 8,
        tip: "Don't crowd the pan - work in batches if needed for that beautiful golden crust",
        image_hint:
          "Chicken pieces searing in pot with golden brown crust forming",
      },
      {
        step: 4,
        text: "Once all the chicken is beautifully browned, use your tongs to transfer it to a clean bowl and set it aside. Now look at the bottom of your Dutch oven - you'll see dark brown bits stuck to the surface called 'fond', which is pure concentrated flavor gold! Don't scrape it off or clean the pan - these caramelized bits will dissolve into your stew and create an incredibly rich, savory gravy. The fond is the foundation of your stew's depth, so protect it at all costs.",
        time_minutes: 2,
        tip: "The fond (brown bits) is flavor gold - never clean it out!",
        image_hint: "Browned chicken in bowl with fond visible in empty pot",
      },
      {
        step: 5,
        text: "With the pot still over medium heat, add the diced onion and sliced celery to the Dutch oven. As they hit the hot surface, use a wooden spoon to start scraping up all those precious brown bits from the bottom of the pan - this process is called 'deglazing'. The moisture from the vegetables will help lift the fond. Stir frequently and cook for 3-4 minutes until the onion turns translucent and starts to soften. Season with a small pinch of salt to help draw out moisture and speed up the cooking.",
        time_minutes: 4,
        tip: "Scrape up all the brown bits - this is where the magic flavor lives",
        image_hint:
          "Onions and celery sauteing while wooden spoon scrapes fond from pot",
      },
      {
        step: 6,
        text: "Now add the sliced carrots and minced garlic to the pot with the onions and celery. The carrots will take longer to cook than the aromatics, so give them a head start by cooking for 2 full minutes, stirring occasionally. When you add the garlic, be extra vigilant - garlic burns quickly and burnt garlic tastes bitter. Keep stirring constantly for just 1 minute until you can smell the garlic's fragrance blooming. The carrots won't be fully cooked at this point, and that's perfect - they'll continue softening during the simmer phase.",
        time_minutes: 3,
        tip: "Watch the garlic carefully - burnt garlic ruins the whole dish",
        image_hint:
          "Carrots and garlic being added to sauteed onions and celery",
      },
      {
        step: 7,
        text: "Sprinkle the remaining 2 tablespoons of flour evenly over all the vegetables in the pot. This creates what's called a roux - a mixture of flour and fat that will thicken your stew beautifully. Stir constantly with your wooden spoon for 2 full minutes, making sure every vegetable gets coated and there are no dry flour pockets visible. This cooking time is essential: raw flour has a distinctly unpleasant, pasty taste that will ruin your stew. You'll know it's ready when the mixture looks slightly paste-like and you can't see any white flour.",
        time_minutes: 2,
        tip: "Cook the flour for 2 full minutes to eliminate that raw flour taste",
        image_hint: "Flour being stirred into vegetables creating a roux",
      },
      {
        step: 8,
        text: "Here's where patience pays off - slowly pour in the chicken and vegetable broths while stirring constantly with your wooden spoon. Pour in a thin, steady stream rather than dumping it all at once, as this gradual addition prevents lumps from forming in your gravy. Keep scraping the bottom and sides of the pot to incorporate any remaining fond and to prevent the roux from clumping. The mixture will look thick at first, then gradually thin out as you add more liquid. Continue stirring until all the broth is incorporated and smooth.",
        time_minutes: 3,
        tip: "Pour slowly while stirring to prevent lumps in your gravy",
        image_hint: "Broth being poured slowly into pot while stirring",
      },
      {
        step: 9,
        text: "Add the halved baby potatoes to the pot first, pressing them down gently so they're mostly submerged in the liquid. Then add the browned chicken pieces along with any juices that accumulated in the bowl - those juices are packed with flavor! Sprinkle in the dried parsley, thyme, rosemary, sage, salt, and pepper. Give everything a good stir to distribute the herbs evenly throughout the stew. Taste a small spoonful of the liquid and adjust the salt if needed.",
        time_minutes: 3,
        tip: "Add the chicken juices from the bowl - they're full of flavor",
        image_hint: "Potatoes, chicken, and herbs being added to the stew",
      },
      {
        step: 10,
        text: "Increase the heat to medium-high and bring the stew to a full boil - you'll see large bubbles breaking the surface vigorously. Once boiling, immediately reduce the heat to medium-low to achieve a gentle simmer. Place the lid on your Dutch oven, leaving it slightly ajar to allow steam to escape. Simmer for 30 minutes, stirring every 10 minutes to prevent sticking and ensure even cooking. The stew will thicken beautifully as it simmers. Check the potatoes at 25 minutes by piercing with a fork.",
        time_minutes: 30,
        tip: "A gentle simmer, not a rolling boil, keeps the chicken tender",
        image_hint: "Covered Dutch oven with stew simmering, steam escaping",
      },
      {
        step: 11,
        text: "After 30 minutes, remove the lid and check if your stew has reached the perfect consistency. Dip a wooden spoon into the stew and lift it out - the gravy should coat the back of the spoon thickly without running off immediately. Pierce a potato with a fork; it should slide in easily with no resistance. The chicken should be tender and the vegetables soft but not mushy. Taste the gravy and adjust the seasoning - you'll likely need more salt and pepper at this stage.",
        time_minutes: 2,
        tip: "The gravy should coat the back of a spoon",
        image_hint: "Wooden spoon lifted from stew showing thick gravy coating",
      },
      {
        step: 12,
        text: "Remove the Dutch oven from the heat and let the stew rest for 5 minutes before serving - this allows the temperature to even out and the flavors to meld. Use a ladle to portion generous servings into deep bowls, making sure each serving gets plenty of chicken, potatoes, vegetables, and that gorgeous gravy. Sprinkle fresh chopped parsley over each bowl for a pop of color and fresh herb brightness. Serve immediately with crusty bread for dipping into the gravy - this stew actually tastes even better the next day!",
        time_minutes: 7,
        tip: "This stew tastes even better the next day - make extra!",
        image_hint:
          "Bowl of hearty chicken stew garnished with parsley, crusty bread on side",
      },
    ],
  },

  "sesame-chicken": {
    // Equipment matched to: "wok", "thermometer", "cutting board", "spider strainer"
    equipment: [
      { name: "Wok", required: true },
      { name: "Spider strainer", required: true },
      { name: "Instant-read thermometer", required: true },
      { name: "Cutting board", required: true },
      { name: "Chef's knife", required: true },
    ],
    instructions: [
      {
        step: 1,
        text: "Start by preparing your chicken thighs on a clean cutting board. Using a sharp chef's knife, trim any excess fat from the thighs, then cut them into uniform 1-inch pieces. Uniformity is crucial here - if pieces are different sizes, smaller ones will overcook while larger ones remain underdone. Pat each piece thoroughly dry with paper towels, pressing firmly to absorb as much moisture as possible. Any water left on the chicken will cause dangerous oil splattering during frying and prevent the coating from adhering properly.",
        time_minutes: 5,
        tip: "Dry chicken is essential - wet chicken causes oil to splatter dangerously",
        image_hint:
          "Chicken thighs being cut into uniform pieces on cutting board",
      },
      {
        step: 2,
        text: "Set up your breading station with three shallow bowls arranged in a row for efficient workflow. In the first bowl, place 1/2 cup of cornstarch for the initial coating. In the second bowl, whisk together the remaining cornstarch, flour, baking powder, beaten egg, and cold water until you have a smooth, slightly thick batter with no lumps - it should be the consistency of heavy cream. The baking powder is the secret weapon here: it creates tiny air bubbles that make the coating extra light and crispy. Have a wire rack ready for the coated pieces.",
        time_minutes: 3,
        tip: "Cold water makes a crispier batter - don't use room temperature",
        image_hint:
          "Three bowls set up for breading station with cornstarch and batter",
      },
      {
        step: 3,
        text: "Now comes the double-coating technique that creates that signature extra-crispy texture. Working with a few pieces at a time, first dredge the chicken in the plain cornstarch, tossing to coat completely and shaking off any excess. Then dip each piece into the wet batter, letting any excess drip off for a few seconds. The first cornstarch layer helps the batter stick, while the batter creates the main crispy coating. Place each coated piece on your wire rack. Let them rest for 5 minutes while you heat the oil - this helps the coating set.",
        time_minutes: 8,
        tip: "Don't skip the rest time - it helps the coating adhere better during frying",
        image_hint:
          "Chicken pieces being dipped in batter then placed on wire rack",
      },
      {
        step: 4,
        text: "Pour 3 cups of vegetable oil into a large wok or deep heavy-bottomed pot. Clip your instant-read thermometer to the side so the tip is submerged in the oil but not touching the bottom. Heat the oil over medium-high heat until it reaches exactly 350F (175C). This temperature is critical: too cool and the chicken absorbs oil and becomes greasy; too hot and the coating burns before the chicken cooks through. Set up your draining station: a clean wire rack over a baking sheet lined with paper towels.",
        time_minutes: 5,
        tip: "350F is the sweet spot - use a thermometer, don't guess!",
        image_hint: "Oil heating in wok with thermometer showing 350F",
      },
      {
        step: 5,
        text: "When the oil reaches 350F, carefully lower 5-6 pieces of coated chicken into the oil using a spider strainer. Don't drop them from height - lower them gently to avoid splashing. The oil will bubble vigorously at first, which is normal. Fry for 4-5 minutes, turning the pieces occasionally with your spider strainer for even browning. The chicken is done when the coating is deep golden brown and the internal temperature reaches 165F. Transfer to your draining rack and let the oil return to 350F before the next batch.",
        time_minutes: 15,
        tip: "Don't crowd the wok - frying in batches keeps the oil temperature stable",
        image_hint: "Golden chicken pieces frying in wok with spider strainer",
      },
      {
        step: 6,
        text: "While the chicken drains, prepare the sesame sauce. Carefully pour out the frying oil (save it for future use once cooled) and wipe the wok clean with paper towels, being careful as it's still hot. Return the wok to medium heat and add 1 tablespoon of fresh vegetable oil. Add the minced garlic and ginger, stirring constantly for about 30 seconds until fragrant - you'll smell that wonderful aromatic combination but don't let it brown. If it starts to color, move quickly to the next step.",
        time_minutes: 2,
        tip: "Keep the garlic moving - burnt garlic will ruin the sauce",
        image_hint: "Garlic and ginger sizzling in wok",
      },
      {
        step: 7,
        text: "Add the soy sauce, rice vinegar, honey, brown sugar, sesame oil, and chicken broth to the wok all at once. Stir everything together and bring to a simmer over medium heat. Let the sauce bubble gently for 2 minutes, allowing the sugars to dissolve completely and the flavors to meld together. The sauce will reduce slightly and become more concentrated. Taste and adjust: add more honey if you prefer sweeter, more vinegar for tanginess, or a splash of water if too intense.",
        time_minutes: 3,
        tip: "Taste the sauce now and adjust - it's your last chance before adding chicken",
        image_hint: "Sauce bubbling in wok with honey and soy visible",
      },
      {
        step: 8,
        text: "Give your cornstarch slurry a quick stir (cornstarch settles quickly) and pour it into the simmering sauce while stirring constantly. Within 30-60 seconds, you'll see the sauce transform from thin and watery to glossy and thick enough to coat a spoon. This is the perfect consistency for clinging to the crispy chicken. If the sauce becomes too thick, add a tablespoon of water. If it's too thin, let it simmer another minute. Remove from heat once the sauce is glossy and thick.",
        time_minutes: 1,
        tip: "Stir constantly when adding cornstarch to prevent lumps",
        image_hint: "Glossy thick sauce coating the back of a spoon",
      },
      {
        step: 9,
        text: "Here's the key to keeping your chicken crispy: work quickly! Add all the fried chicken pieces to the wok with the sauce and toss vigorously using tongs or two spatulas. The goal is to coat every piece evenly with that gorgeous glossy sauce while minimizing the time the crispy coating spends in contact with the liquid. Toss for no more than 30 seconds - any longer and the coating will start to soften. The sauce should cling to each piece in a thin, shiny layer.",
        time_minutes: 1,
        tip: "Work fast! The longer chicken sits in sauce, the less crispy it stays",
        image_hint: "Crispy chicken being tossed in glossy sauce",
      },
      {
        step: 10,
        text: "Transfer the sauced chicken immediately to a serving platter - don't let it sit in the wok. Sprinkle generously with sesame seeds, using both white and black sesame seeds if you have them for visual appeal. Add the sliced green onions on top for a fresh pop of color and mild onion flavor. Serve immediately over steamed white rice to soak up any extra sauce. The dish is best eaten right away while the coating is still crispy. Accompany with steamed broccoli for a complete meal.",
        time_minutes: 2,
        tip: "Serve immediately - the crispy coating won't stay crunchy forever",
        image_hint:
          "Plated sesame chicken with sesame seeds and green onions on rice",
      },
    ],
  },

  "kung-pao-chicken": {
    // Equipment matched to: "wok", "knife", "cutting board", "spatula"
    equipment: [
      { name: "Wok", required: true },
      { name: "Chef's knife", required: true },
      { name: "Cutting board", required: true },
      { name: "Wok spatula", required: true },
      { name: "Small prep bowls", required: false },
    ],
    instructions: [
      {
        step: 1,
        text: "Start by preparing the chicken for marinating. Place the boneless chicken thighs on a clean cutting board and use a sharp chef's knife to cut them into uniform 3/4-inch cubes - consistency in size ensures even cooking. Transfer the cubed chicken to a medium bowl and add 1 tablespoon of soy sauce, 1 tablespoon of Shaoxing wine, and 1 tablespoon of cornstarch. Mix thoroughly with your hands, massaging the marinade into the meat until each piece is evenly coated. Cover and refrigerate for at least 15 minutes, or up to 2 hours for best results.",
        time_minutes: 20,
        tip: "Marinating at least 15 minutes allows the cornstarch to create that signature velvety texture",
        image_hint: "Chicken cubes being mixed with marinade in bowl",
      },
      {
        step: 2,
        text: "While the chicken marinates, prepare all your aromatics and have everything ready - this is called mise en place and it's essential for stir-frying. Using kitchen scissors, snip the dried red chilies into 1-inch segments over a small bowl. To control the heat level, shake out and discard most of the seeds - they carry the most capsaicin. Measure out the Sichuan peppercorns. Mince your garlic and ginger finely. Slice the green onions, keeping white and green parts separate. Finally, measure out your roasted peanuts.",
        time_minutes: 5,
        tip: "Removing chili seeds reduces heat while keeping the smoky flavor",
        image_hint:
          "Aromatics prepared in small bowls - chilies, peppercorns, garlic, ginger, scallions",
      },
      {
        step: 3,
        text: "Now mix the sauce ingredients in a small bowl so it's ready to pour when needed - you won't have time to measure during the fast-paced stir-fry. Combine 2 tablespoons of soy sauce, 1 tablespoon of Chinese black vinegar, 1 tablespoon of Shaoxing wine, 2 teaspoons of sugar, 1 teaspoon of sesame oil, and 2 tablespoons of chicken broth. Whisk until the sugar dissolves completely. In a separate tiny bowl, mix 1 teaspoon of cornstarch with 1 tablespoon of water for the slurry. Set both bowls within arm's reach of your wok.",
        time_minutes: 3,
        tip: "The slurry thickens the sauce so it coats the chicken beautifully",
        image_hint: "Sauce ingredients being whisked together in small bowl",
      },
      {
        step: 4,
        text: "Heat your wok over high heat until it starts to smoke lightly - this is crucial for achieving 'wok hei', that prized smoky flavor of restaurant stir-fries. Add 2 tablespoons of vegetable oil and swirl to coat the sides. When the oil shimmers and just begins to smoke, add the marinated chicken pieces in a single layer. Here's the key technique: don't touch them! Let the chicken sear undisturbed for 60-90 seconds until golden brown on the bottom, then stir-fry for another 2-3 minutes until cooked through. Transfer to a plate.",
        time_minutes: 4,
        tip: "Let the wok get smoking hot - high heat is the secret to restaurant-quality stir-fry",
        image_hint: "Chicken cubes searing in smoking hot wok",
      },
      {
        step: 5,
        text: "Wipe out the wok with a paper towel if there are any burnt bits, then return it to high heat. Add the remaining 1 tablespoon of oil. When it begins to shimmer, add the dried chili segments and Sichuan peppercorns together. This is the moment that defines Kung Pao - stir constantly for about 30-45 seconds until the chilies darken slightly and become fragrant. You'll smell that distinctive Sichuan aroma. Be careful not to burn them - burnt chilies taste bitter. If they start to blacken, proceed to the next step immediately.",
        time_minutes: 1,
        tip: "Watch carefully - chilies go from perfect to burnt in seconds",
        image_hint: "Dried chilies and Sichuan peppercorns sizzling in wok",
      },
      {
        step: 6,
        text: "Quickly add the minced garlic, ginger, and the white parts of the green onions to the wok. These aromatics need just 15-20 seconds of cooking while stirring constantly - you want to release their fragrance without browning them. The residual heat from the chilies will help bloom their flavors. You'll smell the ginger and garlic immediately. The white parts of the scallions should soften slightly but retain some texture. If anything starts to stick, splash in a tablespoon of water.",
        time_minutes: 1,
        tip: "Keep everything moving - garlic burns extremely fast in a hot wok",
        image_hint:
          "Garlic, ginger and scallion whites being stirred with chilies",
      },
      {
        step: 7,
        text: "Return the seared chicken to the wok and give everything a quick toss to combine. Immediately pour in the prepared sauce all at once. The sauce will hit the hot wok and sizzle dramatically - this is good! Toss everything together vigorously for about 30 seconds, ensuring every piece of chicken gets coated with the sauce. You'll see it thickening and glazing the chicken. Taste a piece and adjust the seasoning if needed - add more sugar for sweetness, more vinegar for tang, or soy sauce for saltiness.",
        time_minutes: 1,
        tip: "The sauce should sizzle when it hits the wok - that's flavor developing",
        image_hint: "Chicken being tossed with sauce in wok, steam rising",
      },
      {
        step: 8,
        text: "Give the cornstarch slurry a quick stir (it settles rapidly) and pour it into the center of the wok while stirring constantly. The sauce will transform within 15-20 seconds from thin and runny to glossy and thick enough to coat a spoon. Every piece of chicken should now be wearing a shiny, clingy glaze. If the sauce becomes too thick, add a splash of chicken broth. If it's still too thin, let it bubble for another 10-15 seconds. The perfect consistency clings without pooling.",
        time_minutes: 1,
        tip: "Stir constantly when adding slurry to prevent lumps",
        image_hint: "Glossy sauce coating chicken as cornstarch thickens it",
      },
      {
        step: 9,
        text: "Remove the wok from heat immediately to prevent overcooking. Add the roasted peanuts and the green parts of the scallions, then toss everything together for 5-10 seconds. Adding the peanuts at the very end ensures they stay crunchy - if added earlier, they'll absorb moisture from the sauce and become soft. The green scallions add a fresh pop of color and mild onion flavor that balances the dish. The residual heat is enough to warm the peanuts through without cooking them further.",
        time_minutes: 1,
        tip: "Add peanuts at the very end to keep them crunchy",
        image_hint:
          "Peanuts and scallion greens being tossed into finished dish",
      },
      {
        step: 10,
        text: "Transfer the Kung Pao Chicken to a warmed serving plate immediately - don't let it sit in the wok where it will continue cooking from residual heat. Arrange it in a mound and ensure some peanuts and dried chilies are visible on top for authentic presentation. Serve immediately alongside steamed jasmine rice to absorb the delicious sauce. Warn your guests about the whole dried chilies - they're for flavor and occasional bursts of heat rather than eating whole. Pair with stir-fried bok choy for a complete Sichuan meal.",
        time_minutes: 2,
        tip: "Serve immediately - this dish doesn't hold well",
        image_hint: "Finished Kung Pao Chicken on serving plate with rice",
      },
    ],
  },
};

// Generate WikiHow-style image prompt (NO text, NO "WikiHow" word)
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
      await new Promise((r) => setTimeout(r, 3000));

      const resultResponse = await fetch(
        `https://api.bfl.ai/v1/get_result?id=${taskId}`,
        {
          headers: { "X-Key": BFL_API_KEY },
        },
      );

      const result = await resultResponse.json();

      if (result.status === "Ready") {
        console.log(`  Image ready!`);
        return result.result?.sample;
      } else if (result.status === "Error") {
        console.error(`  Generation failed: ${result.error}`);
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
    return { success: false, imageCount: 0 };
  }

  // Check if recipe exists in Supabase
  const { data: existing, error: fetchError } = await supabase
    .from("recipe_content")
    .select("id, title, wp_slug")
    .eq("wp_slug", slug)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error(`Error fetching ${slug}:`, fetchError);
    return { success: false, imageCount: 0 };
  }

  // Prepare instructions with images
  const updatedInstructions: any[] = [];
  let imageCount = 0;

  console.log(`Equipment: ${update.equipment.map((e) => e.name).join(", ")}`);
  console.log(`Total steps: ${update.instructions.length}`);

  for (const step of update.instructions) {
    console.log(`\n--- Step ${step.step} ---`);
    console.log(`Hint: ${step.image_hint.substring(0, 60)}...`);

    const prompt = getImagePrompt(step.image_hint);
    const imageUrl = await generateImage(prompt);

    let publicUrl: string | null = null;
    if (imageUrl) {
      publicUrl = await uploadImage(imageUrl, slug, step.step);
      if (publicUrl) {
        imageCount++;
        console.log(`  SUCCESS: ${publicUrl.substring(0, 80)}...`);
      }
    }

    updatedInstructions.push({
      step: step.step,
      text: step.text,
      time_minutes: step.time_minutes,
      tip: step.tip,
      image_hint: step.image_hint,
      image_url: publicUrl || "",
    });

    // Small delay between requests
    await new Promise((r) => setTimeout(r, 500));
  }

  // Format equipment as array of objects
  const formattedEquipment = update.equipment.map((e) => ({
    name: e.name,
    required: e.required,
  }));

  // Upsert recipe to Supabase
  console.log(`\n--- Saving ${slug} to Supabase ---`);

  if (existing) {
    // Update existing recipe
    const { error: updateError } = await supabase
      .from("recipe_content")
      .update({
        equipment: formattedEquipment,
        instructions: updatedInstructions,
        is_verified: true,
        generated_at: new Date().toISOString(),
      })
      .eq("wp_slug", slug);

    if (updateError) {
      console.error(`Update error for ${slug}:`, updateError);
      return { success: false, imageCount };
    }
  } else {
    console.log(`Recipe ${slug} not found in database - skipping save`);
    return { success: false, imageCount };
  }

  console.log(`${slug} saved successfully!`);
  console.log(`  Equipment: ${formattedEquipment.length} items`);
  console.log(
    `  Images: ${imageCount}/${update.instructions.length} generated`,
  );

  return { success: true, imageCount };
}

async function main() {
  console.log("=".repeat(60));
  console.log("Updating 3 Chicken Recipes");
  console.log("Recipes: chicken-stew, sesame-chicken, kung-pao-chicken");
  console.log("=".repeat(60));
  console.log(`BFL API Key: ${BFL_API_KEY ? "configured" : "MISSING"}`);
  console.log(`Storage path: recipe-images/{slug}-v2/step-{n}.png`);

  const slugs = ["chicken-stew", "sesame-chicken", "kung-pao-chicken"];
  const results: { slug: string; success: boolean; imageCount: number }[] = [];

  for (const slug of slugs) {
    const result = await processRecipe(slug);
    results.push({ slug, ...result });
  }

  // Summary
  console.log(`\n${"=".repeat(60)}`);
  console.log("SUMMARY");
  console.log("=".repeat(60));

  for (const result of results) {
    const status = result.success ? "SUCCESS" : "FAILED";
    console.log(`${result.slug}: ${status} | Images: ${result.imageCount}`);
  }

  const successCount = results.filter((r) => r.success).length;
  const totalImages = results.reduce((sum, r) => sum + r.imageCount, 0);
  console.log(
    `\nTotal: ${successCount}/${results.length} recipes | ${totalImages} images generated`,
  );
}

main().catch(console.error);
