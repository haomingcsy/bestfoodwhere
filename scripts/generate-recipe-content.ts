/**
 * Recipe Content Generation Script
 * Generates enriched recipe content, step images, and saves to Supabase
 *
 * Run with: npx tsx scripts/generate-recipe-content.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

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
  RecipeSource,
} from "../types/recipe-content";
import { validateAndFixRecipeContent } from "../lib/recipe-validation";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const BFL_API_KEY = process.env.BFL_API_KEY!;

// Recipe data for all 5 chicken recipes
const recipeData: Record<string, RecipeContentInput> = {
  "chicken-rice": {
    wp_slug: "chicken-rice",
    title: "Authentic Hainanese Chicken Rice",
    description:
      "Silky poached chicken served over fragrant rice cooked in rich chicken fat and stock, with ginger-scallion oil and spicy chili sauce.",
    introduction: `Hainanese Chicken Rice is one of Southeast Asia's most beloved dishes, with deep roots in the culinary traditions of Singapore, Malaysia, and Thailand. Originally brought by migrants from China's Hainan province in the early 20th century, this humble dish has evolved into an iconic comfort food that perfectly demonstrates how simple ingredients can create extraordinary flavors.

The magic of chicken rice lies in its deceptive simplicity. A properly prepared version features four essential components: silky poached chicken with impossibly tender meat and gelatinous skin, fragrant rice fried in rendered chicken fat then steamed in rich stock, aromatic ginger-scallion oil, and a punchy chili-garlic sauce. Each element requires careful attention, but the result is a harmonious dish that's far greater than the sum of its parts.`,
    why_love_it: `- **Silky, succulent chicken** with perfectly seasoned skin that melts in your mouth
- **Incredibly fragrant rice** infused with chicken fat and aromatics for deep, savory flavor
- **Three essential sauces** that add layers of heat, brightness, and umami
- **One-pot efficiency** where the chicken and rice share the same cooking liquid
- **Restaurant-quality results** that rival Singapore's famous hawker stalls
- **Impressive presentation** that looks elegant for guests but comes together easily`,
    prep_time_minutes: 30,
    cook_time_minutes: 90,
    servings: 4,
    difficulty: "medium",
    ingredients: [
      {
        item: "Whole chicken",
        quantity: "1",
        unit: "whole",
        notes: "about 3.5 lbs, room temperature",
      },
      {
        item: "Fresh ginger",
        quantity: "5",
        unit: "cm",
        notes: "unpeeled, smashed",
      },
      { item: "Salt", quantity: "2", unit: "tsp", notes: "for poaching" },
      {
        item: "Sesame oil",
        quantity: "1",
        unit: "tbsp",
        notes: "for rubbing chicken",
      },
      {
        item: "Pandan leaves",
        quantity: "2-3",
        unit: "leaves",
        notes: "optional",
      },
      {
        item: "Jasmine rice",
        quantity: "3",
        unit: "cups",
        notes: "about 675g",
      },
      {
        item: "Rendered chicken fat",
        quantity: "1/4",
        unit: "cup",
        notes: "or vegetable oil",
      },
      { item: "Garlic", quantity: "4", unit: "cloves", notes: "minced" },
      {
        item: "Shallots",
        quantity: "2",
        unit: "medium",
        notes: "finely diced",
        section: "For the Rice",
      },
      {
        item: "Red bird's eye chili",
        quantity: "4-6",
        unit: "pieces",
        notes: "for chili sauce",
        section: "For Chili Sauce",
      },
      {
        item: "Ginger slices",
        quantity: "6",
        unit: "slices",
        notes: "for chili sauce",
        section: "For Chili Sauce",
      },
      {
        item: "Calamansi or lime juice",
        quantity: "2",
        unit: "tbsp",
        section: "For Chili Sauce",
      },
      {
        item: "Spring onions",
        quantity: "4",
        unit: "stalks",
        notes: "thinly sliced",
        section: "For Ginger-Scallion Oil",
      },
      {
        item: "Fresh grated ginger",
        quantity: "2",
        unit: "tbsp",
        section: "For Ginger-Scallion Oil",
      },
      {
        item: "Peanut oil",
        quantity: "1/4",
        unit: "cup",
        section: "For Ginger-Scallion Oil",
      },
      {
        item: "Light soy sauce",
        quantity: "2",
        unit: "tbsp",
        notes: "for dressing",
      },
      {
        item: "Fresh cucumber",
        quantity: "1",
        unit: "medium",
        notes: "sliced, for serving",
      },
      {
        item: "Fresh cilantro",
        quantity: "1",
        unit: "bunch",
        notes: "for garnish",
      },
    ],
    instructions: [
      {
        step: 1,
        text: "Start by taking your chicken out of the refrigerator 30-45 minutes before cooking - this is crucial for even cooking. While waiting, rinse the chicken inside and out under cold running water, then pat it completely dry with paper towels. Pay special attention to drying the cavity. Generously rub 2 teaspoons of salt all over the outside skin, working it into every crevice. Take the smashed ginger pieces and stuff them inside the cavity of the chicken. This step seasons the chicken from inside out and infuses it with aromatic ginger flavor during poaching.",
        time_minutes: 35,
        tip: "A room temperature chicken cooks more evenly - cold chicken straight from the fridge will have overcooked outer meat and undercooked inner meat",
        image_hint:
          "Hands rubbing salt into whole raw chicken on wooden cutting board, ginger pieces visible nearby",
      },
      {
        step: 2,
        text: "Fill your large stock pot with enough water to fully submerge the chicken (about 4 liters/16 cups). Add the remaining smashed ginger and pandan leaves if using. Place over medium-high heat and bring to what's called a 'gentle simmer' - you want to see small bubbles rising lazily to the surface, not a vigorous rolling boil. The water temperature should be around 85-90°C (185-195°F). Use your thermometer to check if you're unsure. Once simmering, carefully lower the chicken into the pot breast-side down using tongs or a large spoon. The breast meat is more delicate and benefits from being submerged in the hottest part of the liquid.",
        time_minutes: 10,
        tip: "If you see large bubbles vigorously breaking the surface, your water is too hot. Turn down the heat immediately - boiling makes the chicken tough and rubbery",
        image_hint:
          "Whole chicken being gently lowered into large pot of simmering water with visible ginger and pandan leaves",
      },
      {
        step: 3,
        text: "Now comes the patience part. Maintain that gentle simmer for 40-50 minutes depending on chicken size (about 12-13 minutes per pound). Here's the key technique: Every 15 minutes, use tongs to carefully lift the chicken by the cavity and let all the liquid drain out, then lower it back in. This ensures the cavity heats evenly. Keep the water at a bare simmer - if it starts boiling, turn the heat down. You'll know it's ready when you insert a thermometer into the thickest part of the thigh (not touching bone) and it reads 74°C (165°F), or when you pierce the thigh and the juices run completely clear with no pink.",
        time_minutes: 45,
        tip: "Set a timer for every 15 minutes so you don't forget to lift and drain the chicken. This step is what separates good chicken rice from great chicken rice",
        image_hint:
          "Golden chicken simmering in aromatic broth, gentle bubbles visible on surface, steam rising",
      },
      {
        step: 4,
        text: "While the chicken is poaching (this is a great time to multitask!), prepare the ginger-scallion oil. Peel your 2 tablespoons of fresh ginger and grate it finely using a microplane or the small holes of a box grater. Thinly slice the spring onions, separating the white and green parts. Place the grated ginger and all the spring onion slices into a heatproof bowl - glass or metal works best. Add 1/2 teaspoon of salt. Now heat the peanut oil in a small saucepan over high heat until it just starts to smoke (around 200°C/400°F). Carefully and slowly pour the hot oil over the ginger-scallion mixture - it will sizzle dramatically. Stir immediately to combine. The hot oil blooms the aromatics, releasing their fragrant oils.",
        time_minutes: 8,
        tip: "Stand back when pouring the oil as it will splatter. Have your ingredients ready before heating the oil - once it's smoking, you need to pour immediately",
        image_hint:
          "Hot smoking oil being carefully poured over bowl of fresh grated ginger and sliced scallions, sizzling",
      },
      {
        step: 5,
        text: "Next, make the signature chili sauce. If using a mortar and pestle (traditional method), add the bird's eye chilies, ginger slices, 2 garlic cloves, 1/2 teaspoon salt, and 1/2 teaspoon sugar. Pound in a circular motion until you get a rough paste - it shouldn't be completely smooth; some texture is good. Alternatively, pulse in a food processor. Now here's the secret: add 2-3 tablespoons of HOT poaching stock from your chicken pot (carefully ladle it out). This creates the right consistency and adds savory depth. Finish with the calamansi or lime juice and taste - it should be spicy, slightly sweet, sour, and salty all at once. Adjust any element to your preference.",
        time_minutes: 10,
        tip: "The sauce should be pourable, not thick like a paste. If it's too thick, add more hot stock tablespoon by tablespoon. For a milder sauce, remove the chili seeds first",
        image_hint:
          "Bright orange-red chili sauce in small bowl with granite mortar and pestle, fresh chilies scattered around",
      },
      {
        step: 6,
        text: "This is the most important step for achieving that signature silky, jiggly skin! Prepare a large bowl of ice water while the chicken is in its last 5 minutes of poaching. Add plenty of ice and 1 tablespoon of salt. The moment your chicken reaches temperature, use two large utensils to carefully lift it out and immediately plunge it completely into the ice bath. Submerge it fully and let it sit for exactly 10-15 minutes. This 'shocking' technique does two things: it immediately stops the cooking process so the meat stays juicy, and the rapid temperature change causes the skin to contract and tighten, creating that prized gelatinous texture.",
        time_minutes: 15,
        tip: "Don't skip or shorten this step! The ice bath is what creates the characteristic wobbly, silky skin that defines great Hainanese chicken. Use lots of ice - the water should stay very cold",
        image_hint:
          "Cooked whole chicken being submerged into large bowl of ice water with visible ice cubes floating",
      },
      {
        step: 7,
        text: "Remove the chicken from the ice bath and place it on a clean cutting board. The skin should feel tight and slightly tacky. Pour the sesame oil into your palms and rub it generously all over the entire chicken - this adds flavor and gives it a beautiful sheen. Let the chicken rest at room temperature while you prepare the rice. This resting period (about 15-20 minutes) allows the juices to redistribute throughout the meat. Reserve all the poaching stock in the pot - you'll need it for the rice!",
        time_minutes: 5,
        tip: "Don't refrigerate the chicken after the ice bath - you want to serve it at room temperature or slightly warm, which is traditional",
        image_hint:
          "Glistening poached chicken being rubbed with sesame oil, skin appearing silky and golden",
      },
      {
        step: 8,
        text: "Now for the fragrant rice that makes this dish complete. First, rinse your jasmine rice in a fine-mesh sieve under cold water, swishing it around with your hand until the water runs mostly clear (about 5-6 rinses). This removes excess starch so the rice doesn't become gummy. Drain well. In your pot or rice cooker, heat the rendered chicken fat (or vegetable oil) over medium heat. Add the minced garlic and diced shallots, stirring constantly for about 2 minutes until fragrant and just starting to turn golden - don't let them brown. Add the drained rice and stir continuously for another 2-3 minutes, coating every single grain with the fragrant fat. The rice will start to look slightly translucent at the edges.",
        time_minutes: 8,
        tip: "Toasting the rice in fat is what gives chicken rice its distinctive nutty aroma. Listen for a slight crackling sound - that means the rice is ready for the liquid",
        image_hint:
          "Jasmine rice grains being stirred in pot with golden garlic and shallots, each grain glistening with chicken fat",
      },
      {
        step: 9,
        text: "Here's where the magic happens - cooking the rice in that flavorful poaching stock instead of plain water. Measure out 3 cups of the warm chicken poaching stock (use a ladle to skim from the clearer top layer). Pour it into the pot with the toasted rice. Add a pandan leaf if you have one for extra fragrance. Bring to a boil over high heat, stirring once. The moment it boils, reduce the heat to the lowest possible setting. Cover with a tight-fitting lid and set a timer for exactly 12 minutes. Do not lift the lid during this time - not even to peek! The steam trapped inside is what cooks the rice perfectly. If using a rice cooker, simply add the stock and press start.",
        time_minutes: 12,
        tip: "The 1:1 ratio of rice to stock is traditional, but if your rice brand tends to be dry, use a 1:1.1 ratio. Mark your measuring cup so you're consistent each time",
        image_hint:
          "Rice pot with tight lid, gentle wisps of steam escaping from edges, timer showing countdown",
      },
      {
        step: 10,
        text: "When the timer goes off, turn off the heat completely but don't remove the lid yet! Let the rice rest undisturbed for another 10 minutes. This resting period allows the steam to finish cooking the top layer of rice and lets the moisture redistribute evenly. After 10 minutes, remove the lid and use a fork (not a spoon) to gently fluff the rice, working from the outside edges toward the center. Each grain should be separate, fluffy, and glistening with chicken fat. The aroma should be incredibly fragrant - nutty, savory, and slightly sweet.",
        time_minutes: 10,
        tip: "If you see any wet spots on top of the rice, leave the lid off for another 2-3 minutes to let excess moisture evaporate before fluffing",
        image_hint:
          "Fluffy aromatic chicken rice being fluffed with fork, steam rising, individual grains visible and glistening",
      },
      {
        step: 11,
        text: "Time to carve the chicken. Place it breast-side up on a cutting board. First, remove the legs by cutting through the skin where the leg meets the body, then pop the joint out of the socket and cut through. Separate the drumstick from the thigh at the joint. For the breast, make a cut down the center along the breastbone, then carefully slice the breast meat off the bone following the rib cage. You can either serve the breast whole or slice it crosswise into 1/2-inch pieces - the sliced presentation is more traditional. Arrange the pieces on a serving platter. Drizzle with 2 tablespoons of light soy sauce and splash 2-3 tablespoons of the reserved poaching stock over the meat to keep it moist.",
        time_minutes: 8,
        tip: "Use a sharp knife and cut against the grain for the most tender slices. Save the carcass to make stock for your next batch of chicken rice!",
        image_hint:
          "Beautifully carved chicken pieces arranged on oval platter, glistening with soy sauce, showing silky skin texture",
      },
      {
        step: 12,
        text: "Assemble your complete Hainanese Chicken Rice spread! Scoop the fragrant rice into individual bowls or one large serving bowl, packing it gently into a mound. Arrange the sliced cucumber alongside the chicken as a refreshing palate cleanser. Place small dishes of the ginger-scallion oil, chili sauce, and extra soy sauce for dipping - this trio of condiments is essential. Garnish with fresh cilantro. Each diner should take rice, chicken, and customize with their preferred mix of sauces. For the traditional experience, dip the chicken first in the ginger-scallion oil, then add a touch of chili sauce for heat!",
        time_minutes: 5,
        tip: "Serve everything at room temperature, not hot. This is traditional and actually allows the delicate flavors to shine. Provide a small bowl of the poaching stock as a soup on the side",
        image_hint:
          "Complete Hainanese chicken rice spread with rice bowl, sliced chicken platter, three condiment dishes, cucumber slices, and fresh cilantro garnish",
      },
    ],
    equipment: [
      { name: "Stock pot", required: true },
      { name: "Rice cooker", required: true },
      { name: "Thermometer", required: true },
      { name: "Cutting board", required: true },
      { name: "Mortar and pestle", required: false },
    ],
    substitutions: [
      {
        original: "Whole chicken",
        substitute: "Chicken thighs (bone-in)",
        notes: "Reduce poaching time to 25-30 minutes",
      },
      {
        original: "Rendered chicken fat",
        substitute: "Vegetable oil or butter",
        notes: "Less authentic but still delicious",
      },
      {
        original: "Pandan leaves",
        substitute: "Bay leaves",
        notes: "Different flavor profile but adds aromatics",
      },
      {
        original: "Calamansi juice",
        substitute: "Lime juice",
        notes: "Equally citrusy and bright",
      },
    ],
    nutrition: {
      calories: 685,
      protein: 42,
      carbs: 58,
      fat: 28,
      fiber: 2,
      sodium: 890,
    },
    doneness_tips:
      "The chicken is done when a thermometer inserted in the thickest part of the thigh reads 165F (74C). The juices should run clear, and the meat should easily pull away from the bone. A slight pink blush near the bone is normal and safe - grey meat means overcooked.",
    storage_tips:
      "Store carved chicken and rice separately in airtight containers. Refrigerate for up to 3 days. Reheat chicken gently in warm stock to prevent drying. Reheat rice in microwave with a splash of water, covered. Sauces keep for 1 week refrigerated.",
    pro_tips: [
      "Season your poaching stock well - if it tastes bland, your chicken will too. Add fish sauce if needed.",
      "Save all the chicken fat from the cavity and render it slowly for the most authentic rice flavor.",
      "The ice bath is non-negotiable - it's what gives the chicken that signature silky, jiggly skin.",
      "Use a rice cooker for foolproof rice, but cook it with stock instead of water.",
      "Toast the rice in fat until you hear it crackle - this develops nutty flavor.",
    ],
    common_mistakes: [
      "Boiling the chicken vigorously - this toughens the meat. Keep it at a gentle simmer.",
      "Skipping the ice bath - without it, the skin will be soft instead of silky.",
      "Using plain water for rice - chicken stock is essential for authentic flavor.",
      "Carving the chicken while too hot - let it rest or the juices will run out.",
      "Making the chili sauce too thick - it should be pourable, not pasty.",
    ],
    faq: [
      {
        question: "Can I use chicken breast instead of whole chicken?",
        answer:
          "You can, but the results won't be as flavorful. Breast meat dries out easily and lacks the fat that makes this dish special. Thighs are a better substitute if you must skip whole chicken.",
      },
      {
        question: "Why does my chicken skin turn out rubbery?",
        answer:
          "Rubbery skin usually means the chicken wasn't shocked in ice water, or the poaching temperature was too high. The ice bath contracts the skin, creating that signature silky texture.",
      },
      {
        question: "Can I make this in a rice cooker?",
        answer:
          "Yes! Saute the aromatics in a pan, add to rice cooker with rice and stock. The chicken should be poached separately. This actually makes the rice portion easier.",
      },
      {
        question: "How do I get more chicken fat for the rice?",
        answer:
          "Ask your butcher for extra chicken skin or fat. Slowly render it in a pan over low heat. You can also buy rendered chicken fat (schmaltz) at some grocery stores.",
      },
      {
        question: "What makes restaurant chicken rice taste better?",
        answer:
          "Restaurants often use older chickens with more flavor, render massive amounts of chicken fat, and season their stock more aggressively. Don't be shy with salt and aromatics!",
      },
    ],
    sources: [
      {
        url: "https://adamliaw.com/recipe/hainanese-chicken-rice",
        title: "Authentic Hainanese Chicken Rice - Adam Liaw",
        accessed_date: "2026-01-10",
      },
      {
        url: "https://iamafoodblog.com/hainanese-chicken-rice-best-easy-one-pot-chicken-rice-recipe/",
        title: "Easy One Pot Hainanese Chicken Rice - I Am A Food Blog",
        accessed_date: "2026-01-10",
      },
      {
        url: "https://www.lanascooking.com/chicken-and-rice/",
        title: "Old Fashioned Chicken and Rice - Lana's Cooking",
        accessed_date: "2026-01-10",
      },
    ],
  },

  "chicken-breast": {
    wp_slug: "chicken-breast",
    title: "Perfectly Juicy Baked Chicken Breast",
    description:
      "Tender, juicy chicken breasts with a golden caramelized exterior, using simple techniques that guarantee moist meat every time.",
    introduction: `The baked chicken breast has an unfair reputation as boring diet food - dry, bland, and forgettable. But when cooked properly, chicken breast transforms into something truly delicious: juicy, flavorful, and wonderfully versatile. The key lies in a few simple techniques that anyone can master.

The secret to juicy chicken breast isn't complicated marinades or special equipment. It's about understanding the science: brining adds moisture, pounding ensures even cooking, high heat creates a beautiful sear while keeping the interior moist, and resting allows juices to redistribute. Master these fundamentals, and you'll never suffer through dry chicken again.`,
    why_love_it: `- **Incredibly juicy** results every single time with the right technique
- **Quick weeknight dinner** ready in under 30 minutes from start to finish
- **Naturally lean protein** that fits perfectly into healthy meal prep
- **Endlessly versatile** - slice for salads, sandwiches, grain bowls, or serve whole
- **Simple seasoning** that lets the chicken's natural flavor shine through
- **Budget-friendly** protein that feeds a family without breaking the bank`,
    prep_time_minutes: 10,
    cook_time_minutes: 22,
    servings: 4,
    difficulty: "easy",
    ingredients: [
      {
        item: "Boneless skinless chicken breasts",
        quantity: "4",
        unit: "pieces",
        notes: "about 6-8 oz each",
      },
      { item: "Olive oil", quantity: "2", unit: "tbsp" },
      { item: "Kosher salt", quantity: "1", unit: "tsp" },
      {
        item: "Black pepper",
        quantity: "1/2",
        unit: "tsp",
        notes: "freshly ground",
      },
      { item: "Garlic powder", quantity: "1", unit: "tsp" },
      { item: "Paprika", quantity: "1", unit: "tsp", notes: "sweet or smoked" },
      { item: "Onion powder", quantity: "1/2", unit: "tsp" },
      { item: "Dried thyme", quantity: "1/2", unit: "tsp" },
      {
        item: "Brown sugar",
        quantity: "1",
        unit: "tsp",
        notes: "optional, for caramelization",
      },
    ],
    instructions: [
      {
        step: 1,
        text: "Remove chicken from refrigerator 15-20 minutes before cooking to bring to room temperature. This ensures even cooking throughout.",
        time_minutes: 20,
        tip: "Cold chicken takes longer to cook and cooks unevenly",
        image_hint: "Raw chicken breasts resting on cutting board",
      },
      {
        step: 2,
        text: "Preheat oven to 425F (220C). Line a baking sheet with parchment paper for easy cleanup.",
        time_minutes: 2,
        image_hint: "Oven being preheated with temperature display showing 425",
      },
      {
        step: 3,
        text: "Place chicken between plastic wrap or parchment. Pound to an even 3/4-inch thickness using a meat mallet or rolling pin.",
        time_minutes: 3,
        tip: "Even thickness is the most important step for juicy chicken",
        image_hint: "Chicken breast being pounded flat with meat mallet",
      },
      {
        step: 4,
        text: "Pat chicken completely dry with paper towels. Wet chicken won't brown properly.",
        time_minutes: 2,
        image_hint: "Paper towels patting chicken breast dry",
      },
      {
        step: 5,
        text: "Mix all seasonings in a small bowl. Brush chicken with olive oil on both sides, then coat evenly with seasoning mixture.",
        time_minutes: 3,
        image_hint: "Seasoning being sprinkled over oiled chicken breasts",
      },
      {
        step: 6,
        text: "Arrange chicken on prepared baking sheet with space between pieces. Do not crowd.",
        time_minutes: 1,
        image_hint: "Seasoned chicken breasts arranged on baking sheet",
      },
      {
        step: 7,
        text: "Bake at 425F for 18-22 minutes until internal temperature reaches 165F. Thinner pieces will cook faster.",
        time_minutes: 20,
        tip: "Use an instant-read thermometer for perfect results",
        image_hint: "Chicken breasts baking in oven with golden color",
      },
      {
        step: 8,
        text: "Optional: Broil for 2-3 minutes at the end for extra golden, caramelized exterior.",
        time_minutes: 3,
        image_hint: "Chicken with deep golden caramelized top under broiler",
      },
      {
        step: 9,
        text: "Remove from oven and tent loosely with foil. Rest for 5-10 minutes before slicing.",
        time_minutes: 10,
        tip: "Resting is crucial - cutting too soon releases all the juices",
        image_hint: "Cooked chicken breasts resting under foil tent",
      },
      {
        step: 10,
        text: "Slice against the grain if desired and serve immediately. Notice how the juices stay inside!",
        time_minutes: 2,
        image_hint: "Juicy chicken breast being sliced, showing moist interior",
      },
    ],
    equipment: [
      { name: "Meat mallet or rolling pin", required: true },
      { name: "Baking sheet", required: true },
      { name: "Instant-read thermometer", required: true },
      { name: "Parchment paper", required: false },
    ],
    substitutions: [
      {
        original: "Olive oil",
        substitute: "Avocado oil or melted butter",
        notes: "Higher smoke point oils work well at high heat",
      },
      {
        original: "Paprika",
        substitute: "Cajun seasoning",
        notes: "For a spicier version",
      },
      {
        original: "Brown sugar",
        substitute: "Honey (brushed on)",
        notes: "Creates similar caramelization",
      },
      {
        original: "Fresh chicken",
        substitute: "Thawed frozen chicken",
        notes: "Pat extra dry, may need 2-3 more minutes cooking time",
      },
    ],
    nutrition: {
      calories: 265,
      protein: 38,
      carbs: 2,
      fat: 11,
      fiber: 0,
      sodium: 480,
    },
    doneness_tips:
      "The only reliable way to know chicken is done is with a thermometer - it should read 165F (74C) at the thickest part. The meat should be white throughout with no pink. If you cut into it and see pink, return to oven for a few more minutes. Clear juices running out when pierced also indicate doneness.",
    storage_tips:
      "Cool completely before storing. Refrigerate in airtight container for up to 4 days. Slice before storing for meal prep convenience. Reheat gently in 350F oven covered with foil, or microwave with a damp paper towel over top. Freezes well for up to 3 months.",
    pro_tips: [
      "Pound chicken to even thickness - this single step makes the biggest difference in juiciness.",
      "Don't skip the rest time. Those 5 minutes allow juices to redistribute throughout the meat.",
      "Brine for extra insurance: Soak in salted water (1/4 cup salt per 4 cups water) for 15-30 minutes.",
      "High heat is your friend - 425F creates a seal that keeps moisture in.",
      "Invest in an instant-read thermometer. It's the only way to guarantee perfect results every time.",
    ],
    common_mistakes: [
      "Skipping the pounding step - uneven chicken means dry thin parts and undercooked thick parts.",
      "Cooking chicken straight from the fridge - this causes uneven cooking.",
      "Opening the oven constantly to check - this drops the temperature and extends cooking time.",
      "Cutting into chicken immediately after cooking - you'll lose all those precious juices.",
      "Overcrowding the pan - pieces touching each other will steam instead of roast.",
    ],
    faq: [
      {
        question: "Why is my chicken always dry?",
        answer:
          "The most common reasons are overcooking, uneven thickness, and not letting it rest. Use a thermometer, pound to even thickness, and rest for 5-10 minutes.",
      },
      {
        question: "Should I brine chicken breast?",
        answer:
          "Brining isn't required but provides extra insurance against dryness. A 15-30 minute brine in salted water adds moisture and seasons throughout.",
      },
      {
        question: "What temperature should I bake chicken breast?",
        answer:
          "425F is ideal - high enough to create browning and seal in juices, but not so high it dries out the exterior before the interior cooks.",
      },
      {
        question: "Can I cook chicken breast from frozen?",
        answer:
          "Yes, but add 50% more cooking time. Better to thaw in refrigerator overnight for even cooking.",
      },
      {
        question: "How do I add more flavor?",
        answer:
          "Marinate for 30 minutes to 2 hours, use compound butter under the skin, or stuff with cheese and spinach.",
      },
    ],
    sources: [
      {
        url: "https://natashaskitchen.com/baked-chicken-breast/",
        title: "Baked Chicken Breast (with Video) - Natasha's Kitchen",
        accessed_date: "2026-01-10",
      },
      {
        url: "https://www.gimmesomeoven.com/baked-chicken-breast/",
        title: "Baked Chicken Breast - Gimme Some Oven",
        accessed_date: "2026-01-10",
      },
      {
        url: "https://www.recipetineats.com/oven-baked-chicken-breast/",
        title: "Oven Baked Chicken Breast - RecipeTin Eats",
        accessed_date: "2026-01-10",
      },
      {
        url: "https://cafedelites.com/oven-baked-chicken-breast/",
        title: "Juicy Oven Baked Chicken Breast - Cafe Delites",
        accessed_date: "2026-01-10",
      },
    ],
  },

  "baked-chicken-thighs": {
    wp_slug: "baked-chicken-thighs",
    title: "Crispy Baked Chicken Thighs",
    description:
      "Juicy, tender chicken thighs with irresistibly crispy, golden skin - a simple technique that delivers restaurant-quality results every time.",
    introduction: `Chicken thighs are the unsung hero of weeknight dinners. Unlike their leaner breast counterparts, thighs are forgiving, flavorful, and practically impossible to overcook thanks to their higher fat content. When baked properly, they develop a crackling crispy skin that shatters with every bite while the meat stays incredibly juicy underneath.

The secret to perfect crispy skin lies in three principles: dry skin, high heat, and patience. By removing excess moisture, allowing air circulation, and resisting the urge to constantly check on them, you'll achieve that satisfying crunch without any deep frying. These thighs are equally delicious straight from the oven or as meal prep for the week ahead.`,
    why_love_it: `- **Impossibly crispy skin** that rivals any fried chicken, without the mess of frying
- **Juicy, tender meat** that's nearly impossible to overcook
- **Hands-off cooking** - just season, bake, and walk away
- **Budget-friendly** protein that tastes like a million bucks
- **Perfect for meal prep** - stays moist when reheated
- **Simple ingredients** you already have in your pantry`,
    prep_time_minutes: 10,
    cook_time_minutes: 40,
    servings: 4,
    difficulty: "easy",
    ingredients: [
      {
        item: "Bone-in, skin-on chicken thighs",
        quantity: "8",
        unit: "pieces",
        notes: "about 4 lbs total",
      },
      { item: "Olive oil", quantity: "2", unit: "tbsp" },
      { item: "Kosher salt", quantity: "1.5", unit: "tsp" },
      {
        item: "Black pepper",
        quantity: "1",
        unit: "tsp",
        notes: "freshly ground",
      },
      { item: "Garlic powder", quantity: "1", unit: "tsp" },
      { item: "Onion powder", quantity: "1", unit: "tsp" },
      {
        item: "Paprika",
        quantity: "1",
        unit: "tsp",
        notes: "smoked for extra flavor",
      },
      { item: "Dried thyme", quantity: "1/2", unit: "tsp" },
      { item: "Dried oregano", quantity: "1/2", unit: "tsp" },
      {
        item: "Baking powder",
        quantity: "1/2",
        unit: "tsp",
        notes: "optional, for extra crispiness",
      },
    ],
    instructions: [
      {
        step: 1,
        text: "Remove chicken from packaging and pat thoroughly dry with paper towels. This step is critical for crispy skin.",
        time_minutes: 5,
        tip: "Don't skip the drying - moisture is the enemy of crispy skin",
        image_hint: "Paper towels patting chicken thighs dry",
      },
      {
        step: 2,
        text: "For extra crispy skin, place chicken uncovered in refrigerator for 1-24 hours to air-dry. This step is optional but highly recommended.",
        time_minutes: 1,
        tip: "The longer you air-dry, the crispier the skin",
        image_hint: "Chicken thighs on wire rack in refrigerator",
      },
      {
        step: 3,
        text: "Preheat oven to 425F (220C). Set a wire rack inside a rimmed baking sheet for best air circulation.",
        time_minutes: 2,
        image_hint: "Wire rack set inside baking sheet",
      },
      {
        step: 4,
        text: "Combine all seasonings including baking powder in a small bowl. Mix well to combine.",
        time_minutes: 2,
        image_hint: "Spices being mixed together in small bowl",
      },
      {
        step: 5,
        text: "Drizzle chicken with olive oil and rub to coat evenly. Generously season both sides with the spice mixture, pressing it into the skin.",
        time_minutes: 5,
        tip: "Don't be shy with seasoning - chicken thighs can handle bold flavors",
        image_hint: "Chicken thighs being seasoned with spice mixture",
      },
      {
        step: 6,
        text: "Arrange chicken skin-side up on the wire rack, ensuring pieces don't touch. The rack allows hot air to circulate underneath.",
        time_minutes: 2,
        image_hint: "Seasoned chicken thighs arranged on wire rack",
      },
      {
        step: 7,
        text: "Bake at 425F for 35-45 minutes until skin is deep golden brown and internal temperature reaches 175-180F.",
        time_minutes: 40,
        tip: "Dark meat benefits from cooking past 165F - the connective tissue breaks down and becomes more tender",
        image_hint: "Golden crispy chicken thighs baking in oven",
      },
      {
        step: 8,
        text: "For extra crispiness, turn on broiler for final 2-3 minutes. Watch carefully to prevent burning.",
        time_minutes: 3,
        image_hint: "Chicken under broiler with skin crisping up",
      },
      {
        step: 9,
        text: "Remove from oven and let rest for 5 minutes. Do NOT cover, or the steam will soften the crispy skin.",
        time_minutes: 5,
        tip: "Unlike chicken breast, don't tent these with foil or you'll lose the crisp",
        image_hint: "Crispy chicken thighs resting on wire rack",
      },
      {
        step: 10,
        text: "Serve immediately while the skin is at maximum crispiness. Garnish with fresh herbs if desired.",
        time_minutes: 2,
        image_hint: "Plated crispy chicken thigh with herbs",
      },
    ],
    equipment: [
      { name: "Rimmed baking sheet", required: true },
      { name: "Wire cooling rack", required: true },
      { name: "Instant-read thermometer", required: true },
      { name: "Paper towels", required: true },
    ],
    substitutions: [
      {
        original: "Bone-in thighs",
        substitute: "Boneless thighs",
        notes: "Reduce cooking time to 25-30 minutes",
      },
      {
        original: "Paprika",
        substitute: "Cayenne pepper",
        notes: "For a spicier kick",
      },
      {
        original: "Olive oil",
        substitute: "Melted butter",
        notes: "Adds richness but watch for burning",
      },
      {
        original: "Wire rack",
        substitute: "Directly on sheet pan",
        notes: "Flip halfway through for even crispiness",
      },
    ],
    nutrition: {
      calories: 425,
      protein: 38,
      carbs: 1,
      fat: 29,
      fiber: 0,
      sodium: 720,
    },
    doneness_tips:
      "Chicken thighs are done when they reach 175-180F internal temperature. Unlike breast meat, thighs taste better cooked beyond 165F because the collagen breaks down into gelatin, making the meat more tender and succulent. The skin should be deep golden brown and crispy to the touch.",
    storage_tips:
      "Store in an airtight container in the refrigerator for up to 4 days. To reheat while maintaining crispiness, place on a wire rack in a 375F oven for 8-10 minutes. Avoid microwaving if you want to preserve crispy skin. Freezes well for up to 3 months.",
    pro_tips: [
      "Air-drying uncovered in the fridge overnight is the single best thing you can do for crispy skin.",
      "The baking powder trick: It raises the skin's pH, helping it brown faster and get crispier.",
      "Always use a wire rack - sitting in their own juices makes the bottom soggy.",
      "Don't flip! Start skin-side up and leave them alone for maximum crispiness.",
      "Higher internal temp means better texture - cook to 180F for the most tender meat.",
    ],
    common_mistakes: [
      "Not drying the chicken properly - wet skin equals soggy skin.",
      "Cooking directly on the pan without a rack - traps moisture underneath.",
      "Removing from oven too early - thighs need more time than breasts.",
      "Covering the chicken while resting - steam will ruin your crispy skin.",
      "Crowding the pan - pieces need space for air to circulate.",
    ],
    faq: [
      {
        question: "Why isn't my chicken skin crispy?",
        answer:
          "The most common cause is moisture. Make sure to pat thighs very dry, and ideally air-dry in the fridge uncovered for several hours. Also ensure you're using a wire rack for air circulation.",
      },
      {
        question: "Can I use boneless skinless thighs?",
        answer:
          "Yes, but you won't get crispy skin. Reduce cooking time to 25-30 minutes and bake at 400F to prevent drying out.",
      },
      {
        question: "What does baking powder do?",
        answer:
          "Baking powder is alkaline, which raises the skin's pH and helps it brown faster. It also draws out moisture, contributing to crispiness. Use aluminum-free to avoid any metallic taste.",
      },
      {
        question: "Why cook thighs to higher temperature than breast?",
        answer:
          "Thighs have more connective tissue that benefits from higher temperatures. At 175-180F, the collagen converts to gelatin, making the meat silky and tender rather than chewy.",
      },
      {
        question: "Can I add a sauce?",
        answer:
          "Yes, but add it after cooking. Sauce during cooking will prevent crispy skin. Brush with BBQ sauce, teriyaki, or hot honey in the last 5 minutes if desired.",
      },
    ],
    sources: [
      {
        url: "https://downshiftology.com/recipes/crispy-baked-chicken-thighs/",
        title: "Baked Chicken Thighs (Crispy and Juicy!) - Downshiftology",
        accessed_date: "2026-01-10",
      },
      {
        url: "https://thesaltymarshmallow.com/crispy-baked-chicken-thighs/",
        title: "Crispy Baked Chicken Thighs - The Salty Marshmallow",
        accessed_date: "2026-01-10",
      },
      {
        url: "https://www.spendwithpennies.com/baked-chicken-thighs/",
        title: "Crispy Baked Chicken Thighs - Spend With Pennies",
        accessed_date: "2026-01-10",
      },
      {
        url: "https://www.thekitchn.com/best-baked-chicken-thighs-skills-showdown-23269344",
        title: "The Best Way to Make Crispy Baked Chicken Thighs - The Kitchn",
        accessed_date: "2026-01-10",
      },
    ],
  },

  "chicken-soup": {
    wp_slug: "chicken-soup",
    title: "Homemade Chicken Noodle Soup",
    description:
      "A comforting bowl of golden chicken soup made from scratch with tender chicken, fresh vegetables, and perfectly cooked egg noodles in a rich, flavorful broth.",
    introduction: `There's a reason chicken soup is called "Jewish penicillin" - this golden elixir has been comforting the sick and weary for generations. But homemade chicken soup isn't just for when you're under the weather. Made from scratch with a whole chicken, aromatic vegetables, and love, it's a culinary project that rewards you with the most deeply satisfying bowl of soup you'll ever taste.

The magic starts with the stock. Using a whole chicken means you get both rich flavor from the bones and tender meat for the soup itself. The slow simmer extracts collagen and gelatin, creating that characteristic body that makes homemade soup feel like a warm hug. Once you taste the difference, store-bought will never satisfy again.`,
    why_love_it: `- **Deeply nourishing** with homemade stock that's actually good for you
- **Incredibly flavorful** broth that tastes nothing like the canned version
- **Tender, shreddable chicken** that's perfectly seasoned from cooking in stock
- **Wholesome vegetables** that soak up all that golden goodness
- **Make-ahead friendly** and actually tastes better the next day
- **Freezer-friendly** for homemade soup whenever you need it`,
    prep_time_minutes: 20,
    cook_time_minutes: 120,
    servings: 8,
    difficulty: "medium",
    ingredients: [
      {
        item: "Whole chicken",
        quantity: "1",
        unit: "whole",
        notes: "about 4 lbs",
        section: "For the Stock",
      },
      {
        item: "Onions",
        quantity: "2",
        unit: "large",
        notes: "quartered",
        section: "For the Stock",
      },
      {
        item: "Carrots",
        quantity: "3",
        unit: "large",
        notes: "roughly chopped",
        section: "For the Stock",
      },
      {
        item: "Celery stalks",
        quantity: "4",
        unit: "stalks",
        notes: "with leaves",
        section: "For the Stock",
      },
      {
        item: "Garlic head",
        quantity: "1",
        unit: "head",
        notes: "halved horizontally",
        section: "For the Stock",
      },
      {
        item: "Black peppercorns",
        quantity: "1",
        unit: "tbsp",
        section: "For the Stock",
      },
      {
        item: "Bay leaves",
        quantity: "3",
        unit: "leaves",
        section: "For the Stock",
      },
      {
        item: "Fresh thyme",
        quantity: "4",
        unit: "sprigs",
        section: "For the Stock",
      },
      {
        item: "Fresh parsley",
        quantity: "1",
        unit: "bunch",
        notes: "stems included",
        section: "For the Stock",
      },
      { item: "Water", quantity: "12", unit: "cups", section: "For the Stock" },
      {
        item: "Olive oil",
        quantity: "2",
        unit: "tbsp",
        section: "For the Soup",
      },
      {
        item: "Onion",
        quantity: "1",
        unit: "large",
        notes: "diced",
        section: "For the Soup",
      },
      {
        item: "Carrots",
        quantity: "3",
        unit: "medium",
        notes: "sliced into coins",
        section: "For the Soup",
      },
      {
        item: "Celery",
        quantity: "3",
        unit: "stalks",
        notes: "sliced",
        section: "For the Soup",
      },
      {
        item: "Garlic",
        quantity: "4",
        unit: "cloves",
        notes: "minced",
        section: "For the Soup",
      },
      {
        item: "Egg noodles",
        quantity: "8",
        unit: "oz",
        notes: "wide noodles preferred",
      },
      { item: "Salt", quantity: "2", unit: "tsp", notes: "or to taste" },
      {
        item: "Fresh dill",
        quantity: "2",
        unit: "tbsp",
        notes: "chopped, for serving",
      },
      {
        item: "Lemon juice",
        quantity: "1",
        unit: "tbsp",
        notes: "optional, brightens flavor",
      },
    ],
    instructions: [
      {
        step: 1,
        text: "Place whole chicken in a large stockpot. Add quartered onions, roughly chopped carrots and celery, garlic head, peppercorns, bay leaves, thyme, and parsley stems.",
        time_minutes: 10,
        image_hint:
          "Whole chicken in pot surrounded by vegetables and aromatics",
      },
      {
        step: 2,
        text: "Add water to cover the chicken by about 1 inch. Bring to a gentle simmer over medium heat - do not let it boil vigorously.",
        time_minutes: 15,
        tip: "Boiling makes the broth cloudy; gentle simmering keeps it clear and golden",
        image_hint: "Pot with chicken coming to a gentle simmer",
      },
      {
        step: 3,
        text: "Skim any foam or impurities that rise to the surface during the first 20-30 minutes of simmering.",
        time_minutes: 30,
        image_hint: "Ladle skimming foam from surface of soup",
      },
      {
        step: 4,
        text: "Simmer uncovered for 1.5 hours until the chicken is completely tender and falling off the bone.",
        time_minutes: 90,
        tip: "Low and slow is the key to rich, flavorful stock",
        image_hint: "Golden broth simmering gently with vegetables",
      },
      {
        step: 5,
        text: "Carefully remove the chicken from the pot and set aside to cool. Strain the stock through a fine-mesh sieve, discarding the solids.",
        time_minutes: 15,
        image_hint: "Stock being strained through sieve into clean pot",
      },
      {
        step: 6,
        text: "Once chicken is cool enough to handle, shred the meat into bite-sized pieces. Discard skin and bones (or save for more stock).",
        time_minutes: 15,
        tip: "You should have about 4 cups of shredded meat",
        image_hint: "Hands shredding cooked chicken into bowl",
      },
      {
        step: 7,
        text: "In a clean pot, heat olive oil over medium heat. Add diced onion and cook until softened, about 5 minutes.",
        time_minutes: 5,
        image_hint: "Diced onion sauteing in pot",
      },
      {
        step: 8,
        text: "Add sliced carrots and celery. Cook for another 5 minutes until vegetables start to soften. Add minced garlic and cook 1 more minute.",
        time_minutes: 6,
        image_hint: "Colorful vegetables sauteing together",
      },
      {
        step: 9,
        text: "Pour in the strained stock. Bring to a boil, then reduce heat to medium-low. Season with salt to taste.",
        time_minutes: 5,
        image_hint: "Golden stock being poured over sauteed vegetables",
      },
      {
        step: 10,
        text: "Add egg noodles and cook until al dente, about 2 minutes less than package directions since they'll continue cooking.",
        time_minutes: 8,
        tip: "Add noodles only when ready to serve to prevent them from getting mushy",
        image_hint: "Egg noodles being added to soup",
      },
      {
        step: 11,
        text: "Add shredded chicken and heat through for 2-3 minutes. Taste and adjust seasoning, adding more salt if needed.",
        time_minutes: 3,
        image_hint: "Shredded chicken being stirred into soup",
      },
      {
        step: 12,
        text: "Stir in lemon juice if using. Serve in deep bowls topped with fresh dill and more black pepper.",
        time_minutes: 2,
        tip: "The lemon juice brightens everything - don't skip it!",
        image_hint: "Beautiful bowl of chicken noodle soup garnished with dill",
      },
    ],
    equipment: [
      { name: "Large stockpot (8+ quart)", required: true },
      { name: "Fine-mesh strainer", required: true },
      { name: "Ladle", required: true },
      { name: "Large bowl for shredding chicken", required: false },
    ],
    substitutions: [
      {
        original: "Whole chicken",
        substitute: "Bone-in chicken thighs and wings",
        notes: "Use 3-4 lbs, reduce simmer time to 1 hour",
      },
      {
        original: "Egg noodles",
        substitute: "Rice or orzo pasta",
        notes: "Cook separately for gluten-free option",
      },
      {
        original: "Fresh herbs",
        substitute: "Dried herbs",
        notes: "Use 1/3 the amount of dried herbs",
      },
      {
        original: "Homemade stock",
        substitute: "Store-bought low-sodium broth",
        notes: "Won't have the same body but saves time",
      },
    ],
    nutrition: {
      calories: 285,
      protein: 24,
      carbs: 28,
      fat: 8,
      fiber: 3,
      sodium: 680,
    },
    doneness_tips:
      "The chicken is ready when it easily falls off the bone and shreds effortlessly - typically after 1.5 hours of gentle simmering. The stock should be golden and aromatic. Taste for seasoning; it should be pleasantly savory. Vegetables in the soup should be tender but not mushy.",
    storage_tips:
      "Store soup and noodles separately to prevent noodles from getting mushy. Stock alone keeps 5 days refrigerated or 3 months frozen. Fat will solidify on top when cold - remove or stir back in when reheating. Reheat gently on stovetop, adding water if needed.",
    pro_tips: [
      "Keep the chicken skin on during simmering - it adds flavor and richness to the broth.",
      "A splash of vinegar or lemon juice at the end brightens the whole soup.",
      "For clearer broth, never let it boil - maintain a gentle simmer with small bubbles.",
      "Make double the stock and freeze half for future soups - it's liquid gold.",
      "Add noodles only to individual servings if meal prepping to keep them from absorbing all the broth.",
    ],
    common_mistakes: [
      "Boiling the stock vigorously - this makes it cloudy and can give it a greasy texture.",
      "Not skimming the foam - those impurities can make the broth taste off.",
      "Overcooking the noodles - add them late and slightly undercook since they'll keep absorbing liquid.",
      "Not seasoning enough - homemade stock needs salt to bring out its flavor.",
      "Using boneless chicken - bones are essential for rich, gelatinous stock.",
    ],
    faq: [
      {
        question: "Can I make this in a slow cooker?",
        answer:
          "Yes! Add chicken and stock ingredients to slow cooker on low for 8 hours or high for 4 hours. Remove chicken, strain broth, and continue with soup in a pot on the stove.",
      },
      {
        question: "Why is my soup bland?",
        answer:
          "Homemade stock needs generous seasoning. Add salt gradually, tasting as you go, until it tastes pleasantly savory. A squeeze of lemon also adds brightness.",
      },
      {
        question: "Can I make it without a whole chicken?",
        answer:
          "Yes, use 3-4 lbs of bone-in chicken pieces (thighs and drumsticks work great). The bones are essential for flavorful, gelatinous stock.",
      },
      {
        question: "How do I keep noodles from getting mushy?",
        answer:
          "Cook noodles separately and add to individual bowls, or add them right before serving. If storing, keep noodles separate from soup.",
      },
      {
        question: "Should I remove the fat from the stock?",
        answer:
          "It's personal preference. Some fat adds richness and flavor. For a lighter soup, refrigerate stock overnight and remove solidified fat before using.",
      },
    ],
    sources: [
      {
        url: "https://www.recipetineats.com/homemade-chicken-noodle-soup-from-scratch/",
        title: "Homemade Chicken Noodle Soup (from scratch!) - RecipeTin Eats",
        accessed_date: "2026-01-10",
      },
      {
        url: "https://tastesbetterfromscratch.com/chicken-noodle-soup/",
        title:
          "Truly Homemade Chicken Noodle Soup - Tastes Better From Scratch",
        accessed_date: "2026-01-10",
      },
      {
        url: "https://www.fearlessdining.com/grandmas-homemade-chicken-soup/",
        title: "Grandma's Chicken Soup From Scratch - Fearless Dining",
        accessed_date: "2026-01-10",
      },
      {
        url: "https://www.ambitiouskitchen.com/the-best-chicken-soup-recipe/",
        title: "The Best Chicken Soup You'll Ever Eat - Ambitious Kitchen",
        accessed_date: "2026-01-10",
      },
    ],
  },

  "chicken-stew": {
    wp_slug: "chicken-stew",
    title: "Hearty Chicken Stew",
    description:
      "A warming bowl of tender chicken and vegetables in a rich, herb-infused gravy - the ultimate comfort food that tastes even better the next day.",
    introduction: `When the weather turns cold and you need something truly warming, nothing satisfies quite like a hearty chicken stew. This isn't a light soup - it's a substantial, stick-to-your-ribs meal with tender chunks of chicken thigh, creamy potatoes, and vegetables all swimming in a gloriously thick, herb-scented gravy.

The secret to great chicken stew lies in building layers of flavor. Browning the flour-coated chicken creates fond (those delicious brown bits) that become the foundation of your gravy. A careful selection of herbs - parsley, thyme, rosemary, and sage - gives the stew a warm, cozy character. And using bone-in thighs means the meat stays incredibly tender even after simmering.`,
    why_love_it: `- **Rich, thick gravy** that coats every bite with savory goodness
- **Tender chicken thighs** that stay juicy and flavorful throughout cooking
- **Creamy potatoes** that soak up all those delicious flavors
- **One-pot convenience** with minimal cleanup
- **Make-ahead perfection** - honestly tastes better reheated the next day
- **Freezer-friendly** comfort food ready whenever you need it`,
    prep_time_minutes: 20,
    cook_time_minutes: 50,
    servings: 6,
    difficulty: "easy",
    ingredients: [
      {
        item: "Boneless skinless chicken thighs",
        quantity: "2",
        unit: "lbs",
        notes: "cut into 1-inch pieces",
      },
      {
        item: "All-purpose flour",
        quantity: "4",
        unit: "tbsp",
        notes: "divided",
      },
      { item: "Butter", quantity: "2", unit: "tbsp" },
      { item: "Olive oil", quantity: "1", unit: "tbsp" },
      { item: "Yellow onion", quantity: "1", unit: "large", notes: "diced" },
      { item: "Celery", quantity: "3", unit: "ribs", notes: "sliced" },
      {
        item: "Carrots",
        quantity: "4",
        unit: "medium",
        notes: "sliced into coins",
      },
      { item: "Garlic", quantity: "4", unit: "cloves", notes: "minced" },
      { item: "Baby potatoes", quantity: "1.5", unit: "lbs", notes: "halved" },
      {
        item: "Chicken broth",
        quantity: "2",
        unit: "cups",
        notes: "low sodium",
      },
      {
        item: "Vegetable broth",
        quantity: "2",
        unit: "cups",
        notes: "or more chicken broth",
      },
      { item: "Dried parsley", quantity: "1", unit: "tsp" },
      { item: "Dried thyme", quantity: "1/2", unit: "tsp" },
      { item: "Dried rosemary", quantity: "1/2", unit: "tsp" },
      { item: "Dried sage", quantity: "1/2", unit: "tsp" },
      { item: "Salt", quantity: "1", unit: "tsp", notes: "or to taste" },
      { item: "Black pepper", quantity: "1/2", unit: "tsp" },
      {
        item: "Fresh parsley",
        quantity: "2",
        unit: "tbsp",
        notes: "chopped, for serving",
      },
    ],
    instructions: [
      {
        step: 1,
        text: "Cut chicken thighs into 1-inch pieces. Place 2 tablespoons flour in a shallow dish and toss chicken to coat evenly.",
        time_minutes: 5,
        tip: "The flour coating helps brown the chicken and thickens the stew",
        image_hint: "Chicken pieces being tossed in flour in a bowl",
      },
      {
        step: 2,
        text: "Heat butter and olive oil in a large Dutch oven or heavy pot over medium-high heat until the butter stops foaming.",
        time_minutes: 2,
        image_hint: "Butter and oil melting in Dutch oven",
      },
      {
        step: 3,
        text: "Add flour-coated chicken in a single layer. Don't stir - let it brown undisturbed for 3-4 minutes. Flip and brown the other side.",
        time_minutes: 8,
        tip: "Don't crowd the pan; work in batches if needed for proper browning",
        image_hint: "Chicken pieces browning in pot with golden crust forming",
      },
      {
        step: 4,
        text: "Remove browned chicken to a bowl. The fond (brown bits) on the bottom of the pot is flavor gold - don't clean it.",
        time_minutes: 2,
        image_hint: "Browned chicken pieces in bowl with fond visible in pot",
      },
      {
        step: 5,
        text: "Add onion and celery to the pot. Saute for 3-4 minutes, scraping up the browned bits from the bottom.",
        time_minutes: 4,
        image_hint: "Onion and celery sauteing while deglazing pot",
      },
      {
        step: 6,
        text: "Add carrots and garlic. Cook for another 2 minutes until fragrant.",
        time_minutes: 2,
        image_hint: "Carrots and garlic added to pot with onions and celery",
      },
      {
        step: 7,
        text: "Sprinkle remaining 2 tablespoons flour over the vegetables. Stir and cook for 2 minutes to eliminate raw flour taste.",
        time_minutes: 2,
        tip: "This creates a roux that will thicken your stew beautifully",
        image_hint: "Flour being stirred into vegetables",
      },
      {
        step: 8,
        text: "Slowly pour in chicken and vegetable broths while stirring constantly to prevent lumps. Scrape up any remaining fond.",
        time_minutes: 3,
        image_hint: "Broth being poured into pot while stirring",
      },
      {
        step: 9,
        text: "Add potatoes, browned chicken, parsley, thyme, rosemary, sage, salt, and pepper. Stir to combine.",
        time_minutes: 3,
        image_hint:
          "All ingredients combined in pot with potatoes and herbs visible",
      },
      {
        step: 10,
        text: "Bring to a boil, then reduce heat to medium-low. Cover and simmer for 30 minutes, stirring occasionally, until potatoes are tender.",
        time_minutes: 30,
        tip: "The stew will thicken as it simmers - add more broth if too thick",
        image_hint: "Stew simmering with lid partially on",
      },
      {
        step: 11,
        text: "Taste and adjust seasoning. The stew should be thick and coating the spoon.",
        time_minutes: 2,
        image_hint: "Thick gravy coating a wooden spoon",
      },
      {
        step: 12,
        text: "Serve hot in deep bowls, topped with fresh chopped parsley. Crusty bread is the perfect accompaniment.",
        time_minutes: 2,
        image_hint: "Bowl of hearty chicken stew with crusty bread on side",
      },
    ],
    equipment: [
      { name: "Dutch oven or large heavy pot", required: true },
      { name: "Wooden spoon", required: true },
      { name: "Sharp knife and cutting board", required: true },
      { name: "Ladle for serving", required: false },
    ],
    substitutions: [
      {
        original: "Chicken thighs",
        substitute: "Chicken breast",
        notes:
          "Cut slightly larger and add during last 15 minutes to prevent drying",
      },
      {
        original: "Baby potatoes",
        substitute: "Yukon Gold or red potatoes",
        notes: "Cut into 1-inch cubes",
      },
      {
        original: "Dried herbs",
        substitute: "Fresh herbs",
        notes: "Use 3x the amount and add at the end",
      },
      {
        original: "Vegetable broth",
        substitute: "White wine",
        notes: "Use 1 cup wine + 1 cup extra chicken broth",
      },
    ],
    nutrition: {
      calories: 355,
      protein: 30,
      carbs: 32,
      fat: 12,
      fiber: 4,
      sodium: 802,
    },
    doneness_tips:
      "The stew is done when the potatoes are fork-tender and the gravy coats the back of a spoon. The chicken should be completely cooked through with no pink remaining. If the stew seems too thin, simmer uncovered for 10-15 more minutes to reduce and thicken.",
    storage_tips:
      "Refrigerate in airtight container for up to 5 days - the flavors actually improve overnight. Reheat gently on stovetop, adding a splash of broth if too thick. Freezes beautifully for up to 3 months; thaw overnight in refrigerator before reheating.",
    pro_tips: [
      "Dark meat chicken thighs are essential - they stay moist and add richness that breast meat can't match.",
      "Don't skip browning the chicken. Those brown bits (fond) are the foundation of your gravy's flavor.",
      "Let the stew rest for 10 minutes before serving - it thickens up and flavors meld together.",
      "Make it the day before you need it. Stews are always better the next day as flavors develop.",
      "A splash of Worcestershire sauce or soy sauce adds umami depth without being identifiable.",
    ],
    common_mistakes: [
      "Using chicken breast instead of thighs - breast dries out during the long simmer time.",
      "Not browning the chicken properly - skipping this step means less flavorful gravy.",
      "Adding all the flour to the liquid at once - this causes lumps. Add slowly while stirring.",
      "Cooking uncovered the whole time - the liquid will evaporate and the stew won't braise properly.",
      "Rushing the process - low and slow develops the best flavor and texture.",
    ],
    faq: [
      {
        question: "Can I make this in a slow cooker?",
        answer:
          "Yes! Brown the chicken and saute vegetables on the stove first, then transfer everything to the slow cooker. Cook on low for 6-8 hours or high for 4 hours.",
      },
      {
        question: "How do I make it thicker?",
        answer:
          "Mix 2 tablespoons cornstarch with 2 tablespoons cold water. Stir into simmering stew and cook for 2 minutes until thickened.",
      },
      {
        question: "Can I use bone-in chicken?",
        answer:
          "Yes! Bone-in thighs add even more flavor. Remove bones after cooking and before serving, or leave them in for rustic appeal.",
      },
      {
        question: "What should I serve with chicken stew?",
        answer:
          "Crusty bread for dipping is classic. Also great over egg noodles, mashed potatoes, or with a simple green salad.",
      },
      {
        question: "Why is my stew watery?",
        answer:
          "Either not enough flour was used, or it wasn't simmered long enough. Try simmering uncovered for 15-20 more minutes to reduce and thicken.",
      },
    ],
    sources: [
      {
        url: "https://www.budgetbytes.com/chicken-stew/",
        title: "Hearty Chicken Stew (Cozy Up With Comfort) - Budget Bytes",
        accessed_date: "2026-01-10",
      },
      {
        url: "https://www.spendwithpennies.com/chicken-stew/",
        title: "Chicken Stew - Spend With Pennies",
        accessed_date: "2026-01-10",
      },
      {
        url: "https://www.delish.com/cooking/recipe-ideas/a55316/easy-chicken-stew-recipe/",
        title: "Best Chicken Stew Recipe - Delish",
        accessed_date: "2026-01-10",
      },
      {
        url: "https://www.recipetineats.com/chicken-stew/",
        title: "Chicken Stew - RecipeTin Eats",
        accessed_date: "2026-01-10",
      },
    ],
  },
};

// Clean line art prompt - NO TEXT, NO "WikiHow" word (model adds text if you say WikiHow)
function getImagePrompt(
  step: RecipeInstructionStep,
  recipeName: string,
): string {
  const hint = step.image_hint || step.text.substring(0, 100);
  return `${hint}, clean line art illustration, soft pastel watercolor style, minimalist cooking scene, no text, no labels, no numbers, no words, no letters, no watermarks, light cream background, simple instructional diagram`;
}

// Generate image using BFL API
async function generateImage(prompt: string): Promise<string | null> {
  try {
    console.log(`  Requesting image generation...`);

    // Submit image generation request
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

    const submitData = await submitResponse.json();
    const taskId = submitData.id;

    if (!taskId) {
      console.error("  No task ID returned from BFL API");
      return null;
    }

    console.log(`  Task ID: ${taskId}, polling for result...`);

    // Poll for result
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(
        `https://api.bfl.ai/v1/get_result?id=${taskId}`,
        {
          headers: {
            "X-Key": BFL_API_KEY,
          },
        },
      );

      if (!statusResponse.ok) {
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();

      if (statusData.status === "Ready" && statusData.result?.sample) {
        console.log(`  Image ready!`);
        return statusData.result.sample;
      } else if (statusData.status === "Error") {
        console.error(
          `  Image generation failed: ${statusData.error || "Unknown error"}`,
        );
        return null;
      }

      attempts++;
      console.log(
        `  Status: ${statusData.status} (attempt ${attempts}/${maxAttempts})`,
      );
    }

    console.error("  Image generation timed out");
    return null;
  } catch (error) {
    console.error("  Image generation error:", error);
    return null;
  }
}

// Upload image to Supabase Storage
async function uploadImageToSupabase(
  imageUrl: string,
  slug: string,
  stepNumber: number,
): Promise<string | null> {
  try {
    console.log(`  Downloading image from BFL...`);

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(`  Failed to download image: ${imageResponse.status}`);
      return null;
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const filePath = `${slug}/step-${stepNumber}.png`;

    console.log(`  Uploading to Supabase: ${filePath}`);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("recipe-images")
      .upload(filePath, imageBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      console.error(`  Supabase upload error:`, error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(filePath);

    console.log(`  Upload successful: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error("  Upload error:", error);
    return null;
  }
}

// Process a single recipe
async function processRecipe(
  slug: string,
  generateImages: boolean = false,
): Promise<{ success: boolean; sourceCount: number; imageCount: number }> {
  console.log(`\n========================================`);
  console.log(`Processing recipe: ${slug}`);
  console.log(`========================================`);

  const recipe = recipeData[slug];
  if (!recipe) {
    console.error(`Recipe data not found for: ${slug}`);
    return { success: false, sourceCount: 0, imageCount: 0 };
  }

  let imageCount = 0;

  // Generate images for ALL instruction steps
  if (generateImages && BFL_API_KEY) {
    const stepsToProcess = recipe.instructions.length;
    console.log(`\nGenerating step images (all ${stepsToProcess} steps)...`);

    for (let i = 0; i < stepsToProcess; i++) {
      const instruction = recipe.instructions[i];
      console.log(`\nStep ${instruction.step}:`);

      const prompt = getImagePrompt(instruction, recipe.title);
      const imageUrl = await generateImage(prompt);

      if (imageUrl) {
        const publicUrl = await uploadImageToSupabase(
          imageUrl,
          slug,
          instruction.step,
        );
        if (publicUrl) {
          // Store the image URL in the instruction's image_url field (matching ginger-chicken)
          (instruction as any).image_url = publicUrl;
          imageCount++;
        }
      }
    }

    console.log(`\nGenerated ${imageCount}/${stepsToProcess} images`);
  }

  // Validate and auto-fix formatting before saving
  const validatedRecipe = validateAndFixRecipeContent(recipe);

  // Save to Supabase
  console.log(`\nSaving to Supabase...`);

  try {
    const { data, error } = await supabase
      .from("recipe_content")
      .upsert(
        {
          ...validatedRecipe,
          is_verified: true,
          generated_at: new Date().toISOString(),
        },
        {
          onConflict: "wp_slug",
        },
      )
      .select()
      .single();

    if (error) {
      console.error(`Supabase error:`, error);
      return { success: false, sourceCount: recipe.sources.length, imageCount };
    }

    console.log(`Recipe saved successfully! ID: ${data.id}`);
    return { success: true, sourceCount: recipe.sources.length, imageCount };
  } catch (error) {
    console.error(`Save error:`, error);
    return { success: false, sourceCount: recipe.sources.length, imageCount };
  }
}

// Main execution
async function main() {
  console.log("=".repeat(60));
  console.log("Recipe Content Generation Script");
  console.log("=".repeat(60));

  // Check for --images flag
  const generateImages = process.argv.includes("--images");
  if (generateImages) {
    console.log("\nImage generation ENABLED (--images flag detected)");
  } else {
    console.log("\nImage generation DISABLED (use --images flag to enable)");
  }

  console.log(`\nProcessing ${Object.keys(recipeData).length} recipes...\n`);

  const results: {
    slug: string;
    success: boolean;
    sourceCount: number;
    imageCount: number;
  }[] = [];

  for (const slug of Object.keys(recipeData)) {
    const result = await processRecipe(slug, generateImages);
    results.push({ slug, ...result });
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));

  for (const result of results) {
    const status = result.success ? "SUCCESS" : "FAILED";
    console.log(
      `${result.slug}: ${status} | Sources: ${result.sourceCount} | Images: ${result.imageCount}`,
    );
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(
    `\nTotal: ${successCount}/${results.length} recipes processed successfully`,
  );
}

main().catch(console.error);
