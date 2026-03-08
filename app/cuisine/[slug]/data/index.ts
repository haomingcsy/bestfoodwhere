export type { CuisineData } from "./types";
export type {
  CuisineRestaurant,
  CuisineDeal,
  CuisineFeature,
  CuisineStats,
  OtherCuisine,
} from "./types";

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

// Get cuisine display name from slug
export function getCuisineDisplayName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
