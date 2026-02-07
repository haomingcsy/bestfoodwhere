/**
 * Types for enriched recipe content stored in Supabase
 */

// Ingredient with precise measurements
export interface RecipeIngredientItem {
  item: string;
  quantity: string;
  unit: string;
  notes?: string;
  section?: string; // e.g., "For the sauce", "For the pasta"
}

// Step-by-step instruction
export interface RecipeInstructionStep {
  step: number;
  text: string;
  time_minutes?: number;
  tip?: string;
  image_hint?: string; // Description for potential image
}

// Equipment needed
export interface RecipeEquipment {
  name: string;
  required: boolean;
  affiliate_link?: string;
}

// Ingredient substitution
export interface RecipeSubstitution {
  original: string;
  substitute: string;
  notes?: string;
}

// Nutritional information
export interface RecipeNutrition {
  calories?: number;
  protein?: number; // grams
  carbs?: number; // grams
  fat?: number; // grams
  fiber?: number; // grams
  sodium?: number; // mg
}

// FAQ item
export interface RecipeFAQItem {
  question: string;
  answer: string;
}

// Source attribution
export interface RecipeSource {
  url: string;
  title: string;
  accessed_date: string; // ISO date string
}

// Video content
export interface RecipeVideo {
  url: string; // YouTube embed URL or self-hosted
  thumbnail?: string; // Custom thumbnail
  duration_seconds?: number;
  script?: string; // AI voiceover script
}

// Publish status enum
export type RecipePublishStatus = "draft" | "scheduled" | "published";

// Full recipe content record from Supabase
export interface RecipeContentRecord {
  id: string;
  wp_slug: string;
  wp_post_id: number | null;

  // Basic Info
  title: string;
  description: string | null;
  introduction: string | null;
  why_love_it: string | null;

  // Quick Facts
  prep_time_minutes: number;
  cook_time_minutes: number;
  total_time_minutes: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";

  // Structured Content
  ingredients: RecipeIngredientItem[];
  instructions: RecipeInstructionStep[];
  equipment: RecipeEquipment[];
  substitutions: RecipeSubstitution[];
  nutrition: RecipeNutrition | null;

  // Additional Content
  doneness_tips: string | null;
  storage_tips: string | null;
  pro_tips: string[];
  common_mistakes: string[];

  // FAQ
  faq: RecipeFAQItem[];

  // Attribution & Metadata
  sources: RecipeSource[];
  generated_at: string;
  last_verified: string | null;
  is_verified: boolean;

  // Publishing
  publish_status: RecipePublishStatus;
  scheduled_date: string | null;

  // Video
  video_url: string | null;
  video_thumbnail: string | null;
  video_duration_seconds: number | null;
  video_script: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Input for creating new recipe content
export interface RecipeContentInput {
  wp_slug: string;
  wp_post_id?: number;
  title: string;
  description?: string;
  introduction?: string;
  why_love_it?: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  ingredients: RecipeIngredientItem[];
  instructions: RecipeInstructionStep[];
  equipment?: RecipeEquipment[];
  substitutions?: RecipeSubstitution[];
  nutrition?: RecipeNutrition;
  doneness_tips?: string;
  storage_tips?: string;
  pro_tips?: string[];
  common_mistakes?: string[];
  faq?: RecipeFAQItem[];
  sources: RecipeSource[];
  // Publishing (optional - defaults to 'draft')
  publish_status?: RecipePublishStatus;
  scheduled_date?: string;
}
