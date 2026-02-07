import type { CuisineData } from "./types";
import { AMERICAN_CUISINE } from "./american";
import { BUBBLE_TEA_CUISINE } from "./bubble-tea";
import { CAFE_CUISINE } from "./cafe";
import { CHINESE_CUISINE } from "./chinese";
import { DESSERT_CUISINE } from "./dessert";
import { EUROPEAN_CUISINE } from "./european";
import { FAST_FOOD_CUISINE } from "./fast-food";
import { FOOD_COURT_CUISINE } from "./food-court";
import { INDIAN_CUISINE } from "./indian";
import { ITALIAN_CUISINE } from "./italian";
import { JAPANESE_CUISINE } from "./japanese";
import { KOREAN_CUISINE } from "./korean";
import { LOCAL_CUISINE } from "./local";
import { MEDITERRANEAN_CUISINE } from "./mediterranean";
import { MEXICAN_CUISINE } from "./mexican";
import { SEAFOOD_CUISINE } from "./seafood";
import { THAI_CUISINE } from "./thai";
import { VIETNAMESE_CUISINE } from "./vietnamese";
import { WESTERN_CUISINE } from "./western";

export type { CuisineData } from "./types";
export type {
  CuisineRestaurant,
  CuisineDeal,
  CuisineFeature,
  CuisineStats,
  OtherCuisine,
} from "./types";

// Map of all cuisine data by slug
const CUISINE_MAP: Record<string, CuisineData> = {
  american: AMERICAN_CUISINE,
  "bubble-tea": BUBBLE_TEA_CUISINE,
  cafe: CAFE_CUISINE,
  chinese: CHINESE_CUISINE,
  dessert: DESSERT_CUISINE,
  european: EUROPEAN_CUISINE,
  "fast-food": FAST_FOOD_CUISINE,
  "food-court": FOOD_COURT_CUISINE,
  indian: INDIAN_CUISINE,
  italian: ITALIAN_CUISINE,
  japanese: JAPANESE_CUISINE,
  korean: KOREAN_CUISINE,
  local: LOCAL_CUISINE,
  mediterranean: MEDITERRANEAN_CUISINE,
  mexican: MEXICAN_CUISINE,
  seafood: SEAFOOD_CUISINE,
  thai: THAI_CUISINE,
  vietnamese: VIETNAMESE_CUISINE,
  western: WESTERN_CUISINE,
};

// List of all valid cuisine slugs
export const VALID_CUISINE_SLUGS = [
  "american",
  "bubble-tea",
  "cafe",
  "chinese",
  "dessert",
  "european",
  "fast-food",
  "food-court",
  "indian",
  "italian",
  "japanese",
  "korean",
  "local",
  "mediterranean",
  "mexican",
  "seafood",
  "thai",
  "vietnamese",
  "western",
] as const;

export type CuisineSlug = (typeof VALID_CUISINE_SLUGS)[number];

// Get cuisine data by slug
export function getCuisineData(slug: string): CuisineData | null {
  return CUISINE_MAP[slug] || null;
}

// Check if a cuisine slug is valid and has data
export function hasCuisineData(slug: string): boolean {
  return slug in CUISINE_MAP;
}

// Get cuisine display name from slug
export function getCuisineDisplayName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
