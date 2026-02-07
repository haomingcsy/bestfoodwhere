/**
 * Supabase-only recipe fetching functions
 * Replaces WordPress dependency for recipe data
 */

import { getSupabaseServerClient } from "./supabase/client";
import type { RecipeContentRecord } from "@/types/recipe-content";
import type { RecipeData, RecipeQuickFacts } from "@/types/recipe";

// Category keyword mapping for recipe classification
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "asian-cuisine": [
    "korean",
    "japanese",
    "chinese",
    "thai",
    "vietnamese",
    "asian",
    "stir-fry",
    "wok",
    "soy sauce",
    "sesame",
    "ginger",
    "dim sum",
    "ramen",
    "pho",
    "kimchi",
    "teriyaki",
    "bulgogi",
    "japchae",
    "bibimbap",
    "kung pao",
    "mapo tofu",
  ],
  "italian-european": [
    "italian",
    "pasta",
    "risotto",
    "pizza",
    "mediterranean",
    "french",
    "spanish",
    "european",
    "parmesan",
    "mozzarella",
    "olive oil",
    "basil",
    "oregano",
    "carbonara",
    "lasagna",
    "bolognese",
  ],
  chicken: [
    "chicken",
    "poultry",
    "wings",
    "drumstick",
    "breast",
    "thigh",
    "rotisserie",
  ],
  seafood: [
    "fish",
    "salmon",
    "shrimp",
    "prawn",
    "crab",
    "lobster",
    "seafood",
    "tuna",
    "cod",
    "mussel",
    "clam",
    "oyster",
    "scallop",
  ],
  "beef-pork": [
    "beef",
    "pork",
    "steak",
    "bacon",
    "ham",
    "ribs",
    "brisket",
    "tenderloin",
    "ground beef",
    "meatball",
    "sirloin",
  ],
  "soups-stews": [
    "soup",
    "stew",
    "broth",
    "chowder",
    "bisque",
    "consommé",
    "gumbo",
    "chili",
  ],
  "rice-noodles": [
    "rice",
    "noodle",
    "fried rice",
    "pilaf",
    "biryani",
    "paella",
    "risotto",
    "pad thai",
    "lo mein",
    "chow mein",
    "udon",
    "soba",
  ],
  "curries-spiced": [
    "curry",
    "spice",
    "masala",
    "tikka",
    "tandoori",
    "vindaloo",
    "korma",
    "rendang",
    "laksa",
  ],
  "quick-weeknight": [
    "quick",
    "easy",
    "15-minute",
    "20-minute",
    "30-minute",
    "weeknight",
    "simple",
    "fast",
  ],
  "comfort-classics": [
    "comfort",
    "classic",
    "homestyle",
    "traditional",
    "grandma",
    "family",
    "nostalgic",
  ],
  refreshments: [
    "drink",
    "smoothie",
    "juice",
    "cocktail",
    "beverage",
    "shake",
    "lemonade",
  ],
};

/**
 * Infer category from recipe content
 */
function inferCategory(recipe: RecipeContentRecord): string {
  const searchText =
    `${recipe.title} ${recipe.description || ""} ${recipe.introduction || ""}`.toLowerCase();

  // Count matches for each category
  const scores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[category] = 0;
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        scores[category]++;
      }
    }
  }

  // Find category with highest score
  let maxScore = 0;
  let bestCategory = "general";

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  return maxScore > 0 ? bestCategory : "general";
}

/**
 * Get all recipes from Supabase
 */
export async function getSupabaseRecipes(params?: {
  limit?: number;
  offset?: number;
  category?: string;
}): Promise<RecipeContentRecord[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("recipe_content")
    .select("*")
    .eq("publish_status", "published")
    .order("created_at", { ascending: false });

  if (params?.limit) {
    query = query.limit(params.limit);
  }

  if (params?.offset) {
    query = query.range(
      params.offset,
      params.offset + (params.limit || 10) - 1,
    );
  }

  const { data, error } = await query;

  if (error || !data) return [];

  // Filter by category if specified
  if (params?.category && params.category !== "general") {
    return data.filter(
      (recipe) => inferCategory(recipe) === params.category,
    ) as RecipeContentRecord[];
  }

  return data as RecipeContentRecord[];
}

/**
 * Get a single recipe by slug from Supabase
 */
export async function getSupabaseRecipe(
  slug: string,
): Promise<RecipeContentRecord | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("recipe_content")
    .select("*")
    .eq("wp_slug", slug)
    .single();

  if (error || !data) return null;

  return data as RecipeContentRecord;
}

/**
 * Get featured image URL for a recipe
 * Tries: 1) wp_posts table, 2) Supabase storage, 3) placeholder
 */
export async function getRecipeFeaturedImage(
  slug: string,
): Promise<string | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  // Try wp_posts table first (migrated WordPress posts)
  const { data } = await supabase
    .from("wp_posts")
    .select("featured_image_url")
    .eq("slug", slug)
    .single();

  if (data?.featured_image_url) {
    return data.featured_image_url;
  }

  // Try Supabase storage (generated images) - try jpg first, then png
  const storagePathJpg = `${slug}/hero.jpg`;
  const { data: storageData } = supabase.storage
    .from("recipe-images")
    .getPublicUrl(storagePathJpg);

  if (storageData?.publicUrl) {
    // Check if the image exists by trying to fetch it
    try {
      const response = await fetch(storageData.publicUrl, { method: "HEAD" });
      if (response.ok) {
        return storageData.publicUrl;
      }
    } catch {
      // Image doesn't exist, continue to fallback
    }
  }

  // Return null - component should handle fallback
  return null;
}

/**
 * Get recipes by category
 */
export async function getRecipesBySupabaseCategory(
  category: string,
  params?: { limit?: number; offset?: number },
): Promise<RecipeContentRecord[]> {
  const allRecipes = await getSupabaseRecipes({
    limit: 100, // Get more to filter
  });

  const filtered = allRecipes.filter(
    (recipe) => inferCategory(recipe) === category,
  );

  const start = params?.offset || 0;
  const end = start + (params?.limit || 24);

  return filtered.slice(start, end);
}

/**
 * Get recipe count by category
 */
export async function getRecipeCountByCategory(): Promise<
  Record<string, number>
> {
  const allRecipes = await getSupabaseRecipes({ limit: 500 });

  const counts: Record<string, number> = {};

  for (const recipe of allRecipes) {
    const category = inferCategory(recipe);
    counts[category] = (counts[category] || 0) + 1;
  }

  return counts;
}

/**
 * Convert RecipeContentRecord to RecipeData format
 */
export function convertToRecipeData(
  record: RecipeContentRecord,
  featuredImageUrl?: string | null,
): RecipeData {
  // Parse JSONB fields if they're strings
  const parseJsonField = <T>(field: T | string | null): T => {
    if (field === null || field === undefined) return [] as unknown as T;
    if (typeof field === "string") {
      try {
        return JSON.parse(field);
      } catch {
        return [] as unknown as T;
      }
    }
    return field;
  };

  const ingredients = parseJsonField(record.ingredients) as Array<{
    item: string;
    quantity: string;
    unit: string;
    notes?: string;
  }>;
  const instructions = parseJsonField(record.instructions) as Array<{
    step: number;
    text: string;
    time_minutes?: number;
    tip?: string;
    image_url?: string;
    image_hint?: string;
  }>;
  const equipment = parseJsonField(record.equipment) as Array<{
    name: string;
    required: boolean;
  }>;
  const faq = parseJsonField(record.faq) as Array<{
    question: string;
    answer: string;
  }>;
  const sources = parseJsonField(record.sources) as Array<{
    url: string;
    title: string;
  }>;
  const substitutions = parseJsonField(record.substitutions);
  const nutrition = parseJsonField(record.nutrition);

  const quickFacts: RecipeQuickFacts = {
    prepTimeMinutes: record.prep_time_minutes ?? 15,
    cookTimeMinutes: record.cook_time_minutes ?? 30,
    servings: record.servings ?? 4,
    difficulty: (record.difficulty as "easy" | "medium" | "hard") ?? "medium",
    rating: 4.5,
    ratingCount: 0,
  };

  const recipeData: RecipeData = {
    id: record.wp_post_id ?? 0,
    slug: record.wp_slug,
    title: record.title,
    excerpt: record.description ?? "",
    content: "", // No raw HTML content needed when using enriched data
    featuredImageUrl: featuredImageUrl || "",
    author: {
      name: "Janelle",
      avatarUrl:
        "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/recipe-images/brand/janelle-avatar.png",
    },
    publishedDate: record.created_at,
    modifiedDate: record.updated_at,
    categories: [],
    categorySlug: inferCategory(record),
    quickFacts,
    hasEnrichedContent: true,
    enrichedContent: {
      introduction: record.introduction ?? null,
      whyLoveIt: record.why_love_it ?? null,
      ingredients: ingredients.map((ing) => ({
        item: ing.item,
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes,
      })),
      instructions: instructions.map((inst) => ({
        step: inst.step,
        text: inst.text,
        timeMinutes: inst.time_minutes,
        tip: inst.tip,
        imageUrl:
          inst.image_url ||
          (inst.image_hint?.startsWith("http") ? inst.image_hint : undefined),
      })),
      donenessTips: record.doneness_tips ?? null,
      storageTips: record.storage_tips ?? null,
      proTips: record.pro_tips ?? [],
      commonMistakes: record.common_mistakes ?? [],
      faq: faq,
      equipment: equipment.map((eq) => ({
        name: eq.name,
        required: eq.required,
      })),
      substitutions: substitutions,
      nutrition: nutrition,
      sources: sources.map((s) => ({
        url: s.url,
        title: s.title,
      })),
      videoUrl: record.video_url ?? null,
      videoThumbnail: record.video_thumbnail ?? null,
    },
  };

  return recipeData;
}

/**
 * Get the inferred category for a recipe
 */
export function getRecipeCategory(recipe: RecipeContentRecord): string {
  return inferCategory(recipe);
}
