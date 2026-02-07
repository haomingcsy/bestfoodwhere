// Recipe Quick Facts
export interface RecipeQuickFacts {
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  rating: number;
  ratingCount: number;
}

// Structured ingredient
export interface RecipeIngredient {
  item: string;
  quantity: string;
  unit: string;
  notes?: string;
}

// Step-by-step instruction
export interface RecipeInstruction {
  step: number;
  text: string;
  timeMinutes?: number;
  tip?: string;
  imageUrl?: string;
}

// Nutrition information
export interface RecipeNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

// Author information
export interface RecipeAuthor {
  name: string;
  avatarUrl: string;
}

// Table of contents item
export interface TableOfContentsItem {
  id: string;
  label: string;
}

// Category with defaults
export interface RecipeCategoryDefaults {
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: "easy" | "medium" | "hard";
}

// FAQ item for enriched content
export interface RecipeFAQItem {
  question: string;
  answer: string;
}

// Full recipe data
export interface RecipeData {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImageUrl: string;
  author: RecipeAuthor;
  publishedDate: string;
  modifiedDate: string;
  categories: number[];
  categorySlug: string;
  quickFacts: RecipeQuickFacts;

  // Enriched content (from Supabase, optional)
  hasEnrichedContent?: boolean;
  enrichedContent?: {
    introduction: string | null;
    whyLoveIt: string | null;
    ingredients: RecipeIngredient[];
    instructions: RecipeInstruction[];
    donenessTips: string | null;
    storageTips: string | null;
    proTips: string[];
    commonMistakes: string[];
    faq: RecipeFAQItem[];
    equipment: Array<{ name: string; required: boolean }>;
    substitutions: Array<{
      original: string;
      substitute: string;
      notes?: string;
    }>;
    nutrition: RecipeNutrition | null;
    sources: Array<{ url: string; title: string }>;
    // Video content
    videoUrl: string | null;
    videoThumbnail: string | null;
  };
}

// Category ID mapping
export const RECIPE_CATEGORY_IDS: Record<string, number> = {
  "asian-cuisine": 101,
  "italian-european": 102,
  chicken: 103,
  seafood: 104,
  "beef-pork": 105,
  "soups-stews": 106,
  "rice-noodles": 107,
  "curries-spiced": 108,
  "quick-weeknight": 109,
  "comfort-classics": 110,
  refreshments: 111,
  general: 1,
};

// Reverse mapping (ID to slug)
export const RECIPE_CATEGORY_SLUGS: Record<number, string> = Object.entries(
  RECIPE_CATEGORY_IDS,
).reduce(
  (acc, [slug, id]) => {
    acc[id] = slug;
    return acc;
  },
  {} as Record<number, string>,
);

// Category-aware defaults for quick facts
export const CATEGORY_DEFAULTS: Record<string, RecipeCategoryDefaults> = {
  "quick-weeknight": {
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    difficulty: "easy",
  },
  "asian-cuisine": {
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    difficulty: "medium",
  },
  "italian-european": {
    prepTimeMinutes: 20,
    cookTimeMinutes: 30,
    difficulty: "medium",
  },
  "soups-stews": {
    prepTimeMinutes: 20,
    cookTimeMinutes: 60,
    difficulty: "easy",
  },
  "curries-spiced": {
    prepTimeMinutes: 20,
    cookTimeMinutes: 45,
    difficulty: "medium",
  },
  "comfort-classics": {
    prepTimeMinutes: 15,
    cookTimeMinutes: 40,
    difficulty: "easy",
  },
  refreshments: { prepTimeMinutes: 10, cookTimeMinutes: 5, difficulty: "easy" },
  chicken: { prepTimeMinutes: 15, cookTimeMinutes: 30, difficulty: "medium" },
  seafood: { prepTimeMinutes: 15, cookTimeMinutes: 20, difficulty: "medium" },
  "beef-pork": {
    prepTimeMinutes: 20,
    cookTimeMinutes: 40,
    difficulty: "medium",
  },
  "rice-noodles": {
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    difficulty: "easy",
  },
  general: { prepTimeMinutes: 15, cookTimeMinutes: 30, difficulty: "medium" },
  default: { prepTimeMinutes: 15, cookTimeMinutes: 30, difficulty: "medium" },
};
