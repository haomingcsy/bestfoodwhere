export interface RestaurantProfile {
  id: string;
  restaurant_name: string;
  contact_person: string;
  business_email: string | null;
  business_phone: string | null;
  mall_location: string | null;
  cuisine_type: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  cover_photo_url: string | null;
  gallery_urls: string[];
  subscription_tier: "basic" | "featured" | "premium" | "enterprise";
  subscription_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShoppingMall {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  region: string | null;
  mrt_station: string | null;
  is_active: boolean;
}

export const CUISINE_TYPES = [
  "Chinese",
  "Malay",
  "Indian",
  "Western",
  "Japanese",
  "Korean",
  "Thai",
  "Vietnamese",
  "Italian",
  "Mexican",
  "Mediterranean",
  "Fusion",
  "Seafood",
  "BBQ",
  "Vegetarian",
  "Cafe",
  "Fast Food",
  "Desserts",
] as const;

export type CuisineType = (typeof CUISINE_TYPES)[number];

export interface RestaurantImageUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}
