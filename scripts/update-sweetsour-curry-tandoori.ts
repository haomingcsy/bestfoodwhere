/**
 * Update 3 Chicken Recipes: sweet-and-sour-chicken, chicken-curry, tandoori-chicken
 * - Equipment updated to match affiliate keywords
 * - Instructions expanded to beginner-friendly paragraphs (3-5 sentences)
 * - WikiHow-style images generated using BFL API
 *
 * Run with: npx tsx scripts/update-sweetsour-curry-tandoori.ts
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
  "sweet-and-sour-chicken": {
    // Equipment matched to: "wok", "spider strainer", "thermometer", "knife", "cutting board"
    equipment: [
      { name: "Wok", required: true },
      { name: "Spider strainer", required: true },
      { name: "Instant-read thermometer", required: true },
      { name: "Chef's knife", required: true },
      { name: "Cutting board", required: true },
    ],
    instructions: [
      {
        step: 1,
        text: "Start by preparing your chicken breast on a clean cutting board. Using a sharp chef's knife, slice the chicken against the grain into 1-inch cubes, keeping the pieces uniform for even cooking. Pat each piece thoroughly dry with paper towels - this step is critical because any moisture on the chicken will cause the oil to splatter dangerously and prevent the batter from adhering properly. Transfer the dried chicken cubes to a medium bowl and season with 1/2 teaspoon of salt and a pinch of white pepper. Let the seasoned chicken rest while you prepare the other components.",
        time_minutes: 5,
        tip: "Cutting against the grain makes the chicken more tender when cooked",
        image_hint:
          "Chicken breast being cut into uniform cubes on wooden cutting board",
      },
      {
        step: 2,
        text: "Prepare the vegetables for your sweet and sour sauce - this colorful mix is what makes the dish visually stunning. Cut the bell peppers (use a mix of red, green, and yellow for maximum color) into 1-inch squares, roughly the same size as your chicken pieces. Slice the onion into wedges, keeping the layers intact so they hold together during cooking. Cut the pineapple into similar-sized chunks if using fresh, or drain canned pineapple and reserve the juice for the sauce. Having all vegetables prepped and ready is essential since stir-frying happens very quickly.",
        time_minutes: 5,
        tip: "Using three colors of bell pepper makes the dish restaurant-worthy",
        image_hint:
          "Colorful bell peppers and onion being cut into chunks on cutting board",
      },
      {
        step: 3,
        text: "Now prepare the sweet and sour sauce so it's ready when needed - you won't have time to measure during the fast-paced cooking. In a medium bowl, whisk together 1/4 cup rice vinegar, 1/4 cup ketchup, 3 tablespoons sugar, 2 tablespoons soy sauce, and 1/2 cup pineapple juice until the sugar dissolves completely. In a separate small bowl, mix 1 tablespoon of cornstarch with 2 tablespoons of water to create a slurry - this will thicken your sauce later. Taste the sauce mixture and adjust: add more sugar if too tangy, more vinegar if too sweet.",
        time_minutes: 3,
        tip: "The pineapple juice adds natural sweetness and helps tenderize the chicken",
        image_hint:
          "Sauce ingredients being whisked together in bowl, ketchup and vinegar visible",
      },
      {
        step: 4,
        text: "Set up your breading station for the crispiest coating. In a shallow bowl, beat 1 egg with 1 tablespoon of water until smooth. In another shallow bowl, mix 1/2 cup cornstarch with 2 tablespoons of all-purpose flour - the combination creates an extra crispy texture that stays crunchy even after being coated in sauce. Working with a few pieces at a time, dip the chicken first in the egg mixture, letting excess drip off, then coat thoroughly in the cornstarch mixture. Place the coated pieces on a wire rack and let them rest for 5 minutes - this helps the coating set and adhere better during frying.",
        time_minutes: 8,
        tip: "The 5-minute rest helps the coating adhere and creates extra crispiness",
        image_hint:
          "Chicken pieces being coated in cornstarch mixture, breading station setup visible",
      },
      {
        step: 5,
        text: "Pour 3 cups of vegetable oil into your wok and clip an instant-read thermometer to the side, ensuring the tip is submerged but not touching the bottom. Heat over medium-high heat until the oil reaches exactly 350F (175C) - this temperature is crucial for achieving crispy chicken that isn't greasy. While the oil heats, set up your draining station: place a wire rack over a baking sheet lined with paper towels. Test the oil temperature by dropping in a small piece of batter - it should sizzle immediately and float to the surface within 2 seconds.",
        time_minutes: 5,
        tip: "350F is the sweet spot - too cool and chicken absorbs oil, too hot and it burns",
        image_hint:
          "Oil heating in wok with thermometer showing 350F temperature",
      },
      {
        step: 6,
        text: "Carefully lower 6-8 pieces of coated chicken into the hot oil using a spider strainer - don't drop them from height to avoid dangerous splashing. The oil will bubble vigorously at first, which is completely normal. Let the chicken fry undisturbed for the first minute to set the crust, then gently turn the pieces with your spider strainer for even browning. Fry for 4-5 minutes total until the coating is deep golden brown and the internal temperature reaches 165F. Remove the chicken to your draining rack and let the oil return to 350F before frying the next batch.",
        time_minutes: 15,
        tip: "Don't crowd the wok - frying in batches keeps oil temperature stable for crispier results",
        image_hint:
          "Golden chicken pieces frying in wok, spider strainer lifting one piece",
      },
      {
        step: 7,
        text: "Once all the chicken is fried and draining, carefully pour out most of the frying oil into a heat-safe container to save for future use. Leave about 2 tablespoons of oil in the wok. Return the wok to high heat until the oil shimmers. Add the garlic and ginger, stirring constantly for 30 seconds until fragrant - you'll smell that wonderful aromatic combination, but don't let it brown. The residual heat is intense, so work quickly and be ready to add the vegetables immediately if the garlic starts to color.",
        time_minutes: 2,
        tip: "Save your frying oil - it can be reused 2-3 times for Asian cooking",
        image_hint:
          "Garlic and ginger being stirred in wok with small amount of oil",
      },
      {
        step: 8,
        text: "Add the bell peppers and onion wedges to the wok, tossing constantly with your spatula. The vegetables should hit the hot wok with a satisfying sizzle - if there's no sizzle, your wok isn't hot enough. Stir-fry for 2-3 minutes until the vegetables are crisp-tender, meaning they still have a slight bite but have softened slightly. The colors should remain vibrant; overcooked vegetables turn dull and limp. Add the pineapple chunks in the last 30 seconds just to warm them through.",
        time_minutes: 3,
        tip: "Keep the vegetables moving - they should be colorful and crisp, never soggy",
        image_hint:
          "Colorful bell peppers and onions being stir-fried in wok, vegetables sizzling",
      },
      {
        step: 9,
        text: "Pour the prepared sweet and sour sauce into the wok all at once. The sauce will hit the hot wok and sizzle dramatically - this is exactly what you want! Stir everything together and bring to a simmer. Give the cornstarch slurry a quick stir (it settles quickly) and pour it in while stirring constantly. The sauce will transform within 30-45 seconds from thin to glossy and thick enough to coat a spoon. If the sauce becomes too thick, add a splash of pineapple juice or water. Taste and adjust seasoning as needed.",
        time_minutes: 2,
        tip: "Stir constantly when adding cornstarch to prevent lumps from forming",
        image_hint: "Glossy sweet and sour sauce coating vegetables in wok",
      },
      {
        step: 10,
        text: "Here's the secret to keeping your chicken crispy: work fast! Add all the fried chicken pieces to the wok and toss vigorously using a spatula or two spoons. The goal is to coat every piece evenly with that gorgeous glossy sauce while minimizing the time the crispy coating spends in contact with the liquid. Toss for no more than 30-45 seconds - any longer and the coating will start to soften. Each piece should be wearing a thin, shiny layer of sauce with the crispy coating still visible underneath.",
        time_minutes: 1,
        tip: "Work fast! The longer chicken sits in sauce, the less crispy it stays",
        image_hint:
          "Crispy chicken being tossed with glossy sweet and sour sauce",
      },
      {
        step: 11,
        text: "Transfer the sweet and sour chicken immediately to a warmed serving platter - don't let it sit in the wok where it will continue absorbing sauce and losing crispiness. Arrange the dish attractively with the colorful vegetables visible throughout. Garnish with a sprinkle of sesame seeds and sliced green onions for an authentic restaurant presentation. Serve immediately alongside steamed jasmine rice to absorb the delicious sauce. This dish is best eaten right away while the coating is still perfectly crispy.",
        time_minutes: 2,
        tip: "Serve immediately - the crispy coating won't stay crunchy for long",
        image_hint:
          "Beautiful plated sweet and sour chicken with colorful peppers and sesame seeds",
      },
    ],
  },

  "chicken-curry": {
    // Equipment matched to: "dutch oven", "knife", "cutting board", "wooden spoons", "mortar pestle"
    equipment: [
      { name: "Dutch oven", required: true },
      { name: "Chef's knife", required: true },
      { name: "Cutting board", required: true },
      { name: "Wooden spoons", required: true },
      { name: "Mortar and pestle", required: false },
    ],
    instructions: [
      {
        step: 1,
        text: "Start by preparing your chicken thighs on a clean cutting board. Using a sharp chef's knife, trim any excess fat and cut the thighs into generous 2-inch pieces - larger pieces stay more tender during the braising process and won't fall apart. Season the chicken generously with 1 teaspoon of salt, 1/2 teaspoon of black pepper, and 1 teaspoon of curry powder, massaging the spices into the meat with your hands. Let the seasoned chicken rest at room temperature while you prepare the aromatics - this allows the spices to penetrate and brings the meat to room temperature for more even cooking.",
        time_minutes: 10,
        tip: "Room temperature chicken cooks more evenly than cold chicken straight from the fridge",
        image_hint:
          "Chicken thighs being seasoned with curry powder on cutting board",
      },
      {
        step: 2,
        text: "Prepare all your aromatics and vegetables for the curry base. Dice 2 medium onions finely - the smaller the dice, the more they'll melt into the sauce creating body and sweetness. Mince 4 cloves of garlic and a 2-inch piece of fresh ginger. If you have a mortar and pestle, pound the garlic and ginger together into a paste for the most intense flavor - this releases more oils than mincing alone. Dice 2 large tomatoes, removing the core first. Have all your measured spices ready in small bowls within arm's reach of the stove.",
        time_minutes: 8,
        tip: "Pounding garlic and ginger together releases more flavor than mincing",
        image_hint:
          "Onions, garlic, ginger, and tomatoes being prepared, mortar and pestle visible",
      },
      {
        step: 3,
        text: "Place your Dutch oven over medium-high heat and add 3 tablespoons of vegetable oil or ghee. When the oil shimmers and just begins to ripple, add the seasoned chicken pieces in a single layer - work in batches if necessary to avoid crowding. Let the chicken sear undisturbed for 3-4 minutes until a golden-brown crust forms on the bottom. Flip each piece and brown the other side for another 2-3 minutes. The fond (caramelized bits) forming on the bottom of the pot is flavor gold that will enrich your curry. Transfer the browned chicken to a plate.",
        time_minutes: 10,
        tip: "Don't move the chicken while searing - patience creates that beautiful golden crust",
        image_hint:
          "Chicken pieces searing in Dutch oven with golden brown crust forming",
      },
      {
        step: 4,
        text: "With the Dutch oven still over medium heat, add the diced onions to the pot with a pinch of salt. The salt helps draw moisture from the onions, speeding up the cooking process. Stir with a wooden spoon, scraping up all the precious brown bits from the bottom of the pot - this deglazing action infuses your curry with incredible depth. Cook the onions for 8-10 minutes, stirring frequently, until they turn deep golden brown and smell sweet and caramelized. This patient cooking of onions is the foundation of any great curry.",
        time_minutes: 10,
        tip: "Well-browned onions are the secret to restaurant-quality curry - don't rush this step",
        image_hint:
          "Golden caramelized onions being stirred in Dutch oven with wooden spoon",
      },
      {
        step: 5,
        text: "Make a well in the center of the onions and add the garlic-ginger paste (or minced garlic and ginger). Let it sizzle in the hot center for 30 seconds, stirring constantly - you want to release the fragrance without browning. Now add the ground spices: 2 tablespoons curry powder, 1 teaspoon cumin, 1 teaspoon coriander, 1/2 teaspoon turmeric, and 1/4 teaspoon cayenne pepper. Stir the spices into the onion mixture and cook for 1-2 minutes until incredibly fragrant and the raw spice smell has cooked off. If the mixture looks dry, add a splash of water to prevent burning.",
        time_minutes: 3,
        tip: "Blooming spices in oil releases fat-soluble flavor compounds for a richer curry",
        image_hint:
          "Curry spices being stirred into onion mixture, golden color developing",
      },
      {
        step: 6,
        text: "Add the diced tomatoes to the pot and stir well to combine. The tomatoes will release their liquid and help deglaze any remaining fond. Cook for 5-7 minutes, stirring occasionally and breaking down the tomatoes with your wooden spoon until they completely melt into the sauce and you see oil separating around the edges. This separation - called 'bhunao' in Indian cooking - indicates the masala base is properly cooked and the raw tomato taste has been eliminated. The mixture should look like a thick, unified paste.",
        time_minutes: 7,
        tip: "When you see oil separating at the edges, your masala base is perfectly cooked",
        image_hint:
          "Tomatoes cooking down into curry base, oil separating at edges",
      },
      {
        step: 7,
        text: "Return the seared chicken pieces to the Dutch oven along with any juices that accumulated on the plate - those juices are packed with flavor! Nestle the chicken into the masala base, turning each piece to coat it thoroughly with the aromatic mixture. Pour in 1 cup of chicken broth or water, stirring to incorporate and scraping the bottom of the pot. The liquid should come about halfway up the chicken pieces. If you're using coconut milk, add 1/2 cup now for a richer, creamier curry. Season with 1 teaspoon of salt.",
        time_minutes: 3,
        tip: "Add the chicken juices from the plate - they're concentrated flavor",
        image_hint:
          "Chicken pieces nestled in curry sauce with liquid being added",
      },
      {
        step: 8,
        text: "Bring the curry to a simmer over medium heat, then reduce the heat to medium-low to maintain a gentle bubbling. Cover the Dutch oven with the lid slightly ajar to allow some steam to escape - this helps the sauce reduce and concentrate in flavor while keeping the chicken moist. Simmer for 25-30 minutes, stirring every 10 minutes to prevent sticking and to ensure even cooking. The chicken is done when it's tender and cooked through - it should offer no resistance when pierced with a fork but still hold its shape.",
        time_minutes: 30,
        tip: "A gentle simmer, not a rolling boil, keeps the chicken tender and juicy",
        image_hint:
          "Curry simmering gently in covered Dutch oven, steam escaping",
      },
      {
        step: 9,
        text: "Remove the lid and check the consistency of your curry sauce. For a thicker curry, continue simmering uncovered for another 5-10 minutes until the sauce clings to the back of a spoon. For a saucier curry, add a splash more broth or water. If using coconut milk, add another 1/2 cup now and simmer for 3 minutes to incorporate. Taste the curry and adjust the seasoning - you'll likely need more salt at this stage. Add a squeeze of fresh lemon juice to brighten all the flavors and balance the richness.",
        time_minutes: 5,
        tip: "A squeeze of lemon at the end brightens the curry and balances the spices",
        image_hint:
          "Creamy curry sauce being checked for consistency with wooden spoon",
      },
      {
        step: 10,
        text: "Remove the Dutch oven from heat and let the curry rest for 5 minutes - this allows the temperature to even out and the flavors to meld together beautifully. Transfer to a warmed serving bowl and garnish generously with fresh cilantro leaves. Serve alongside steamed basmati rice, warm naan bread, or fluffy roti for scooping up the delicious sauce. This curry tastes even better the next day as the flavors continue to develop, making it perfect for meal prep. Store leftovers in an airtight container in the refrigerator for up to 4 days.",
        time_minutes: 7,
        tip: "This curry tastes even better the next day - make extra for meal prep",
        image_hint:
          "Beautiful chicken curry in serving bowl garnished with cilantro, naan bread on side",
      },
    ],
  },

  "tandoori-chicken": {
    // Equipment matched to: "cast iron skillet/grill pan", "thermometer", "knife", "cutting board", "mixing bowls"
    equipment: [
      { name: "Cast iron grill pan", required: true },
      { name: "Instant-read thermometer", required: true },
      { name: "Chef's knife", required: true },
      { name: "Cutting board", required: true },
      { name: "Mixing bowls", required: true },
    ],
    instructions: [
      {
        step: 1,
        text: "Start by preparing the chicken for maximum marinade penetration. Place chicken leg quarters (or thighs and drumsticks) on a clean cutting board. Using a sharp chef's knife, make 3-4 deep diagonal slashes through the skin and into the meat on each piece, cutting almost to the bone. These cuts aren't just for show - they allow the flavorful marinade to penetrate deep into the meat, ensuring every bite is seasoned and tender. Flip and make similar cuts on the other side. Place the slashed chicken in a large mixing bowl.",
        time_minutes: 5,
        tip: "Deep slashes are crucial - they let the marinade penetrate for authentic tandoori flavor",
        image_hint:
          "Chicken pieces with deep diagonal slashes on cutting board",
      },
      {
        step: 2,
        text: "Create the first marinade layer to tenderize and season the meat. In a small bowl, combine 2 tablespoons of lemon juice, 1 teaspoon of salt, and 1/2 teaspoon of cayenne pepper. Pour this mixture over the chicken, rubbing it into all the slashes and crevices with your hands. The acid from the lemon juice will begin breaking down the proteins, making the meat more tender and helping it absorb flavors. Cover the bowl and let the chicken marinate for 30 minutes at room temperature, or refrigerate for up to 2 hours.",
        time_minutes: 35,
        tip: "This first acid marinade tenderizes the chicken and opens it up for the yogurt layer",
        image_hint: "Lemon juice and spices being rubbed into chicken slashes",
      },
      {
        step: 3,
        text: "While the chicken marinates, prepare the signature tandoori yogurt marinade. In a large mixing bowl, combine 1 cup of full-fat Greek yogurt (the fat is essential for flavor and moisture), 2 tablespoons of vegetable oil, 1 tablespoon of garam masala, 2 teaspoons of cumin, 2 teaspoons of paprika, 1 teaspoon of turmeric, 1 teaspoon of coriander, 1/2 teaspoon of cayenne, and 4 cloves of minced garlic and a 2-inch piece of grated ginger. For authentic red color, add 1 teaspoon of Kashmiri red chili powder or a few drops of red food coloring if desired.",
        time_minutes: 5,
        tip: "Full-fat yogurt is essential - low-fat versions make the chicken dry",
        image_hint:
          "Vibrant red yogurt marinade being mixed in bowl with visible spices",
      },
      {
        step: 4,
        text: "Remove the chicken from the first marinade, shaking off any excess liquid - you don't need to rinse it. Add the chicken pieces to the yogurt marinade bowl, using your hands to thoroughly coat every surface. Make sure to push the marinade deep into the slashes you made earlier. The yogurt acts as a carrier, helping the spices penetrate while also keeping the meat incredibly moist during high-heat cooking. Cover the bowl tightly with plastic wrap and refrigerate for at least 4 hours, or preferably overnight for the most authentic flavor.",
        time_minutes: 10,
        tip: "Overnight marinating creates the deepest flavor - plan ahead for best results",
        image_hint:
          "Chicken being coated in red yogurt marinade, hands pushing marinade into slashes",
      },
      {
        step: 5,
        text: "Remove the marinated chicken from the refrigerator 45-60 minutes before cooking to bring it to room temperature - this is crucial for even cooking. Cold chicken placed on a hot pan will seize up and cook unevenly. Place your cast iron grill pan over medium-high heat and let it preheat for at least 5 minutes until very hot. You can test by flicking a few drops of water on the surface - they should sizzle and evaporate immediately. Brush the grill pan lightly with vegetable oil to prevent sticking.",
        time_minutes: 50,
        tip: "Room temperature chicken cooks more evenly - don't skip the resting time",
        image_hint:
          "Marinated chicken resting at room temperature, grill pan heating in background",
      },
      {
        step: 6,
        text: "Before placing the chicken on the grill pan, shake off any excess marinade - too much marinade will steam instead of char, preventing those signature charred spots. Place the chicken pieces on the hot grill pan, skin-side down first. You should hear an immediate, aggressive sizzle. Do not move the chicken for 4-5 minutes; let it develop those characteristic dark char marks that give tandoori its unique flavor. The yogurt marinade will caramelize and char in spots, creating complex, smoky flavors that mimic a real tandoor oven.",
        time_minutes: 5,
        tip: "Let the chicken char without moving - those dark spots are pure flavor",
        image_hint:
          "Chicken pieces searing on hot grill pan with char marks forming",
      },
      {
        step: 7,
        text: "Using tongs, flip the chicken pieces to the second side. The first side should have beautiful dark char marks and grill lines. Continue cooking for another 4-5 minutes, again without moving, to develop char on this side as well. If the chicken is browning too quickly and the interior isn't cooked, reduce the heat to medium. The marinade's natural sugars will caramelize, creating a slightly sweet, smoky crust. The kitchen should smell incredible at this point - a heady mix of roasted spices and grilled meat.",
        time_minutes: 5,
        tip: "Reduce heat if charring too fast - the goal is charred outside, juicy inside",
        image_hint:
          "Chicken being flipped with tongs showing beautiful char marks on cooked side",
      },
      {
        step: 8,
        text: "Continue cooking the chicken, flipping every 3-4 minutes, until it reaches an internal temperature of 165F (74C) when measured with an instant-read thermometer at the thickest part without touching bone. The total cooking time depends on the size of your pieces - typically 20-25 minutes for leg quarters or 15-18 minutes for smaller thighs. Don't rely on time alone; always verify with a thermometer to ensure food safety while avoiding overcooking. The exterior should be deeply charred in spots with a beautiful mahogany color overall.",
        time_minutes: 15,
        tip: "Always use a thermometer - 165F ensures safety while keeping the meat juicy",
        image_hint:
          "Thermometer being inserted into chicken showing 165F temperature",
      },
      {
        step: 9,
        text: "Transfer the cooked tandoori chicken to a cutting board and let it rest for 5 minutes before serving. During this rest, the juices redistribute throughout the meat, ensuring every bite is moist and flavorful. If you cut into it immediately, those precious juices will run out onto the cutting board instead of staying in the meat. While the chicken rests, slice 1 red onion into thin rings and separate them, and prepare lemon wedges for serving. Chop some fresh cilantro for garnish.",
        time_minutes: 7,
        tip: "Resting is essential - it lets juices redistribute for maximum moisture",
        image_hint:
          "Charred tandoori chicken resting on cutting board, juices settling",
      },
      {
        step: 10,
        text: "Arrange the rested tandoori chicken on a warmed serving platter for an impressive presentation. Top with the sliced red onion rings and a generous handful of fresh cilantro leaves. Place lemon wedges around the edges - the fresh lemon juice squeezed over the chicken at the table adds a bright, acidic contrast to the rich spices. Serve immediately with warm naan bread, cooling cucumber raita, and fragrant basmati rice. For an authentic experience, encourage guests to eat with their hands, tearing naan to scoop up pieces of chicken.",
        time_minutes: 3,
        tip: "A squeeze of fresh lemon at the table brightens all the smoky flavors",
        image_hint:
          "Stunning plated tandoori chicken with charred skin, onion rings, cilantro, and lemon wedges",
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
  console.log(
    "Recipes: sweet-and-sour-chicken, chicken-curry, tandoori-chicken",
  );
  console.log("=".repeat(60));
  console.log(`BFL API Key: ${BFL_API_KEY ? "configured" : "MISSING"}`);
  console.log(`Storage path: recipe-images/{slug}-v2/step-{n}.png`);

  const slugs = ["sweet-and-sour-chicken", "chicken-curry", "tandoori-chicken"];
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
