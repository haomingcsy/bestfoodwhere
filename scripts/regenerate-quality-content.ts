/**
 * Quality Recipe Content Regeneration Script
 *
 * Regenerates recipe content with professional, unique writing.
 * Fixes issues with templated/generic content.
 *
 * Usage:
 *   npx tsx scripts/regenerate-quality-content.ts --test        # Test with 10 recipes
 *   npx tsx scripts/regenerate-quality-content.ts --all         # Regenerate all 332
 *   npx tsx scripts/regenerate-quality-content.ts --slug <slug> # Single recipe
 *   npx tsx scripts/regenerate-quality-content.ts --preview     # Preview prompts only
 */

import { config } from "dotenv";
import { resolve } from "path";
import * as fs from "fs";
import * as crypto from "crypto";

config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import { validateAndFixRecipeContent } from "../lib/recipe-validation";

// ============================================
// Configuration
// ============================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

let vertexCredentials: any = null;
const CREDENTIALS_PATH = resolve(process.cwd(), "vertex-ai-credentials.json");
if (fs.existsSync(CREDENTIALS_PATH)) {
  vertexCredentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
}

// ============================================
// Banned Phrases - Content that triggers regeneration
// ============================================

const BANNED_PHRASES = [
  // Templated title phrases
  "Special Recipe for You",
  "The Ratio Found",
  "Your Family Will Love",
  "Simplified Version",
  "Finally Written Down",
  "Crave-Worthy", // overused
  // Wrong food descriptions
  "crispy chicken",
  "tender chicken",
  "juicy chicken",
  "fall-off-the-bone chicken",
  "golden crispy chicken",
  // Unfilled templates
  "{method}",
  "{ingredient}",
  "{time}",
  // Generic filler
  "steady pom pi pi",
  "swee lah",
  "sibeh",
  "shiok",
  "kampung",
  // HTML entities (unprocessed)
  "&#8217;",
  "&#8211;",
  "&amp;",
];

// ============================================
// Google Gemini API Functions
// ============================================

function createJWT(): string {
  if (!vertexCredentials) {
    throw new Error("Vertex AI credentials not found");
  }

  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: vertexCredentials.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString(
    "base64url",
  );
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const signatureInput = `${base64Header}.${base64Payload}`;

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signatureInput);
  const signature = sign.sign(vertexCredentials.private_key, "base64url");

  return `${signatureInput}.${signature}`;
}

async function getAccessToken(): Promise<string> {
  const jwt = createJWT();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("Failed to get access token: " + JSON.stringify(data));
  }
  return data.access_token;
}

async function callGemini(prompt: string, retries = 3): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const accessToken = await getAccessToken();
      const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${vertexCredentials.project_id}/locations/us-central1/publishers/google/models/gemini-2.0-flash-exp:generateContent`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8, // Slightly higher for more creativity
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(
          `  Gemini error (attempt ${attempt}):`,
          JSON.stringify(data).substring(0, 200),
        );
        if (attempt === retries) return null;
        await delay(3000 * attempt);
        continue;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;

      if (attempt === retries) return null;
      await delay(3000 * attempt);
    } catch (error) {
      console.error(`  Gemini error (attempt ${attempt}):`, error);
      if (attempt === retries) return null;
      await delay(3000 * attempt);
    }
  }
  return null;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// Improved Prompt - Professional & Unique Content
// ============================================

function getImprovedPrompt(recipe: any): string {
  // Determine food type from slug and title
  const slug = recipe.wp_slug.toLowerCase();
  const title = recipe.title.toLowerCase();

  let foodType = "dish";
  if (slug.includes("soup") || title.includes("soup")) foodType = "soup";
  else if (slug.includes("salad") || title.includes("salad"))
    foodType = "salad";
  else if (
    slug.includes("cake") ||
    slug.includes("dessert") ||
    slug.includes("pudding")
  )
    foodType = "dessert";
  else if (slug.includes("rice") || slug.includes("nasi"))
    foodType = "rice dish";
  else if (
    slug.includes("noodle") ||
    slug.includes("pasta") ||
    slug.includes("mee")
  )
    foodType = "noodle dish";
  else if (slug.includes("curry")) foodType = "curry";
  else if (slug.includes("stew")) foodType = "stew";
  else if (
    slug.includes("fish") ||
    slug.includes("salmon") ||
    slug.includes("prawn") ||
    slug.includes("crab") ||
    slug.includes("seafood")
  )
    foodType = "seafood dish";
  else if (slug.includes("beef") || slug.includes("steak"))
    foodType = "beef dish";
  else if (
    slug.includes("pork") ||
    slug.includes("bacon") ||
    slug.includes("ham")
  )
    foodType = "pork dish";
  else if (slug.includes("chicken") || slug.includes("ayam"))
    foodType = "chicken dish";
  else if (
    slug.includes("tofu") ||
    slug.includes("vegetable") ||
    slug.includes("vegan")
  )
    foodType = "vegetarian dish";

  // Get existing ingredients if available
  const existingIngredients =
    recipe.ingredients
      ?.slice(0, 10)
      .map((i: any) => i.item)
      .join(", ") || "various ingredients";

  return `You are a professional culinary writer creating content for a premium recipe website. Write UNIQUE, ENGAGING content for this ${foodType}.

RECIPE: ${recipe.title}
SLUG: ${recipe.wp_slug}
FOOD TYPE: ${foodType}
KEY INGREDIENTS: ${existingIngredients}

CRITICAL REQUIREMENTS - READ CAREFULLY:

1. DESCRIPTION (1 sentence, 60-100 characters):
   - Must accurately describe THIS SPECIFIC ${foodType}
   - NEVER mention "chicken" unless this IS a chicken dish
   - NEVER mention "pork" unless this IS a pork dish
   - Focus on texture, flavor, or cooking method specific to this dish
   - NO generic phrases like "bursting with flavor" or "restaurant-quality"

   GOOD examples:
   - "Rich coconut curry with tender beef and aromatic spices"
   - "Silky egg noodles tossed in fragrant garlic oil"
   - "Crispy pan-fried dumplings with savory pork filling"

   BAD examples (NEVER use):
   - "Golden crispy chicken that's better than..."
   - "Fall-off-the-bone chicken..."
   - "Special recipe for you"

2. TITLE (creative but accurate):
   - Keep the dish name, but make the title engaging
   - NO generic suffixes like "Special Recipe for You" or "The Ratio Found"
   - Can include cooking style, origin, or key feature

   GOOD: "Classic Beef Rendang with 4-Hour Slow Cook"
   BAD: "Beef Rendang Special Recipe for You"

3. WHY YOU'LL LOVE IT (5 bullet points):
   - Each point must be UNIQUE to this specific dish
   - Format: "• **Bold phrase** - explanation"
   - NO generic points like "Impressive Presentation" or "Versatile and Customizable"
   - Focus on specific flavors, textures, techniques, or benefits

4. INTRODUCTION (2-3 paragraphs):
   - Tell the story of THIS dish
   - Include cultural context if relevant
   - Explain what makes it special
   - NO filler phrases or generic statements

5. INSTRUCTIONS (10-12 detailed steps):
   - Each step 2-4 sentences
   - Explain WHY not just WHAT
   - Include sensory cues (what to look for, smell, sound)
   - image_hint must describe the actual cooking action (no URLs)

6. PREP TIME, COOK TIME, TIPS:
   - prep_time_minutes: realistic estimate
   - cook_time_minutes: realistic estimate
   - tips: 3-5 specific tips for THIS recipe (not generic cooking tips)

Generate a JSON object with this structure:

{
  "title": "Creative but accurate title for the dish",
  "description": "1 sentence describing THIS specific dish (not chicken unless it is chicken)",
  "introduction": "2-3 engaging paragraphs about this dish",
  "why_love_it": "• **Point 1** - explanation\\n• **Point 2** - explanation\\n• **Point 3** - explanation\\n• **Point 4** - explanation\\n• **Point 5** - explanation",
  "prep_time": "XX mins",
  "cook_time": "XX mins",
  "total_time": "XX mins",
  "servings": 4,
  "difficulty": "easy|medium|hard",
  "ingredients": [
    {"item": "ingredient", "quantity": "amount", "unit": "unit", "notes": "optional"}
  ],
  "instructions": [
    {
      "step": 1,
      "text": "Detailed instruction with why, not just what",
      "time_minutes": 5,
      "tip": "Optional helpful tip",
      "image_hint": "Description of cooking action for illustration"
    }
  ],
  "tips": "• Tip 1 specific to this recipe\\n• Tip 2 specific to this recipe\\n• Tip 3 specific to this recipe",
  "equipment": [
    {"name": "equipment item", "required": true}
  ],
  "substitutions": [
    {"original": "ingredient", "substitute": "alternative", "notes": "when to use"}
  ],
  "nutrition": {
    "calories": 300,
    "protein": 25,
    "carbs": 30,
    "fat": 12,
    "fiber": 3,
    "sodium": 500
  },
  "doneness_tips": "How to know when perfectly done",
  "storage_tips": "Storage and reheating instructions",
  "pro_tips": ["tip1", "tip2", "tip3"],
  "common_mistakes": ["mistake1", "mistake2", "mistake3"],
  "faq": [
    {"question": "Question?", "answer": "Answer"}
  ]
}

FINAL CHECK - Before returning, verify:
- Description matches the actual food type (${foodType})
- No chicken references unless this is a chicken dish
- No pork references unless this is a pork dish
- Title doesn't contain "Special Recipe for You" or similar
- Each "why_love_it" point is unique to this dish

Return ONLY valid JSON, no markdown code blocks.`;
}

// ============================================
// Content Validation
// ============================================

function validateContent(
  recipe: any,
  content: any,
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const slug = recipe.wp_slug.toLowerCase();
  const isChickenRecipe = slug.includes("chicken") || slug.includes("ayam");
  const isPorkRecipe =
    slug.includes("pork") ||
    slug.includes("bacon") ||
    slug.includes("ham") ||
    slug.includes("bak") ||
    slug.includes("char-siew");

  // Check description
  const desc = (content.description || "").toLowerCase();
  if (desc.includes("chicken") && !isChickenRecipe) {
    issues.push("Description mentions chicken but this is not a chicken dish");
  }
  if (desc.includes("pork") && !isPorkRecipe) {
    issues.push("Description mentions pork but this is not a pork dish");
  }

  // Check for banned phrases
  const fullText = JSON.stringify(content);
  for (const phrase of BANNED_PHRASES) {
    if (fullText.toLowerCase().includes(phrase.toLowerCase())) {
      issues.push(`Contains banned phrase: "${phrase}"`);
    }
  }

  // Check for unfilled templates
  if (fullText.includes("{") && fullText.includes("}")) {
    issues.push("Contains unfilled template placeholders");
  }

  // Check required fields (times can be in various formats)
  const hasTime = content.prep_time || content.prep_time_minutes;
  if (!hasTime) issues.push("Missing prep time");

  return { valid: issues.length === 0, issues };
}

// ============================================
// Parse Gemini Response
// ============================================

function parseGeminiResponse(response: string): any | null {
  try {
    let cleaned = response.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON
    const match = response.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ============================================
// Process Single Recipe
// ============================================

async function processRecipe(
  recipe: any,
  options: { preview: boolean },
): Promise<{ success: boolean; issues: string[] }> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Processing: ${recipe.title}`);
  console.log(`Slug: ${recipe.wp_slug}`);
  console.log("=".repeat(60));

  const prompt = getImprovedPrompt(recipe);

  if (options.preview) {
    console.log("\n--- PROMPT PREVIEW ---");
    console.log(prompt.substring(0, 1500) + "...");
    return { success: true, issues: [] };
  }

  console.log("  Calling Gemini API...");
  const response = await callGemini(prompt);

  if (!response) {
    return { success: false, issues: ["Failed to get Gemini response"] };
  }

  const content = parseGeminiResponse(response);
  if (!content) {
    return { success: false, issues: ["Failed to parse response"] };
  }

  // Validate content
  const validation = validateContent(recipe, content);
  if (!validation.valid) {
    console.log("  Validation issues:", validation.issues);
    // Try once more with feedback
    console.log("  Retrying with validation feedback...");

    const retryPrompt =
      prompt +
      `\n\nPREVIOUS ATTEMPT HAD ISSUES:\n${validation.issues.join("\n")}\n\nPlease fix these issues and try again.`;
    const retryResponse = await callGemini(retryPrompt);

    if (retryResponse) {
      const retryContent = parseGeminiResponse(retryResponse);
      if (retryContent) {
        const retryValidation = validateContent(recipe, retryContent);
        if (retryValidation.valid) {
          Object.assign(content, retryContent);
        }
      }
    }
  }

  // Parse time strings to minutes
  const parseTime = (timeStr: string): number | null => {
    if (!timeStr) return null;
    const match = timeStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  // Merge new content with existing recipe (exclude computed columns)
  const { total_time_minutes, ...recipeWithoutComputed } = recipe;
  const updatedRecipe = {
    ...recipeWithoutComputed,
    title: content.title || recipe.title,
    description: content.description || recipe.description,
    introduction: content.introduction || recipe.introduction,
    why_love_it: content.why_love_it || recipe.why_love_it,
    prep_time_minutes:
      parseTime(content.prep_time) ||
      content.prep_time_minutes ||
      recipe.prep_time_minutes,
    cook_time_minutes:
      parseTime(content.cook_time) ||
      content.cook_time_minutes ||
      recipe.cook_time_minutes,
    servings: content.servings || recipe.servings,
    difficulty: content.difficulty || recipe.difficulty,
    ingredients: content.ingredients || recipe.ingredients,
    instructions: (content.instructions || recipe.instructions || []).map(
      (inst: any, idx: number) => ({
        step: inst.step || idx + 1,
        text: inst.text || "",
        time_minutes: inst.time_minutes,
        tip: inst.tip,
        image_hint: inst.image_hint,
      }),
    ),
    equipment: content.equipment || recipe.equipment,
    substitutions: content.substitutions || recipe.substitutions,
    nutrition: content.nutrition || recipe.nutrition,
    doneness_tips: content.doneness_tips || recipe.doneness_tips,
    storage_tips: content.storage_tips || recipe.storage_tips,
    pro_tips:
      content.pro_tips ||
      content.tips
        ?.split("\n")
        .map((t: string) => t.replace(/^[•\-]\s*/, "").trim())
        .filter(Boolean) ||
      recipe.pro_tips,
    common_mistakes: content.common_mistakes || recipe.common_mistakes,
    faq: content.faq || recipe.faq,
    generated_at: new Date().toISOString(),
  };

  // Validate and save
  console.log("  Saving to database...");
  const validated = validateAndFixRecipeContent(updatedRecipe);

  const { error } = await supabase
    .from("recipe_content")
    .update(validated)
    .eq("wp_slug", recipe.wp_slug);

  if (error) {
    return { success: false, issues: [error.message] };
  }

  console.log("  Saved successfully!");
  return { success: true, issues: [] };
}

// ============================================
// Main
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes("--test");
  const isAll = args.includes("--all");
  const isPreview = args.includes("--preview");
  const slugIdx = args.indexOf("--slug");
  const singleSlug = slugIdx !== -1 ? args[slugIdx + 1] : null;

  console.log("=".repeat(60));
  console.log("Quality Content Regeneration Script");
  console.log("=".repeat(60));

  if (!vertexCredentials) {
    console.error("ERROR: vertex-ai-credentials.json not found!");
    process.exit(1);
  }

  // Get recipes that need regeneration
  let query = supabase.from("recipe_content").select("*");

  if (singleSlug) {
    query = query.eq("wp_slug", singleSlug);
  }

  const { data: recipes, error } = await query.order("title");

  if (error || !recipes) {
    console.error("Failed to fetch recipes:", error);
    process.exit(1);
  }

  // Filter to only recipes needing images (no complete image set)
  const needsWork = recipes.filter((r) => {
    const instructions = r.instructions || [];
    return instructions.some(
      (i: any) => !i.image_url || !i.image_url.startsWith("http"),
    );
  });

  console.log(`\nTotal recipes: ${recipes.length}`);
  console.log(`Recipes needing work: ${needsWork.length}`);

  // Determine which to process
  let toProcess = needsWork;
  if (isTest) {
    toProcess = needsWork.slice(0, 10);
    console.log(`\nTEST MODE: Processing first 10 recipes`);
  } else if (singleSlug) {
    toProcess = recipes.filter((r) => r.wp_slug === singleSlug);
    console.log(`\nSingle recipe mode: ${singleSlug}`);
  } else if (!isAll) {
    console.log(
      "\nUse --test for 10 recipes, --all for all, or --slug <slug> for one",
    );
    process.exit(0);
  }

  console.log(`\nProcessing ${toProcess.length} recipes...`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const recipe = toProcess[i];
    console.log(`\n[${i + 1}/${toProcess.length}]`);

    const result = await processRecipe(recipe, { preview: isPreview });

    if (result.success) {
      success++;
    } else {
      failed++;
      console.log("  Issues:", result.issues.join(", "));
    }

    // Rate limit - 10 second delay
    if (i < toProcess.length - 1 && !isPreview) {
      console.log("  Waiting 10s...");
      await delay(10000);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
}

main().catch(console.error);
