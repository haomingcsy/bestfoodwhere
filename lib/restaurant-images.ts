import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STORAGE_BUCKET = "restaurant-images";
const MENU_STORAGE_BUCKET = "menu-images";

// Image type for menu-related images
export type MenuImageType =
  | "menu_item"
  | "hero"
  | "logo"
  | "promotion"
  | "recommendation"
  | "related_brand";

/**
 * Get the CDN URL for a restaurant image
 * Falls back to original URL if not in cache
 */
export async function getRestaurantImageUrl(
  originalUrl: string | undefined,
  mallSlug: string,
  restaurantSlug: string,
): Promise<string | null> {
  if (!originalUrl) return null;

  try {
    // Check cache first
    const { data: cached } = await supabase
      .from("restaurant_image_cache")
      .select("cdn_url")
      .eq("original_url", originalUrl)
      .single();

    if (cached?.cdn_url) {
      return cached.cdn_url;
    }

    // Return original URL if not cached
    return originalUrl;
  } catch {
    return originalUrl;
  }
}

/**
 * Build the Supabase Storage public URL for a restaurant image
 */
export function buildStorageUrl(
  mallSlug: string,
  restaurantSlug: string,
  filename: string,
): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${mallSlug}/${restaurantSlug}/${filename}`;
}

/**
 * Generate a placeholder image URL based on restaurant name
 * Uses UI Avatars as fallback
 */
export function getPlaceholderUrl(name: string, size: number = 400): string {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=ff6b35&color=ffffff&bold=true&format=png`;
}

/**
 * Check if a URL is a valid image URL
 */
export function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Get optimized image URL with Supabase transform parameters
 * Only works for images stored in Supabase Storage
 */
export function getOptimizedUrl(
  cdnUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif" | "origin";
  } = {},
): string {
  const { width = 800, height, quality = 80, format = "webp" } = options;

  // Check if it's a Supabase Storage URL
  if (!cdnUrl.includes("/storage/v1/object/public/")) {
    return cdnUrl;
  }

  // Return direct URL without transformation
  // Note: Supabase Image Transformation (render/image endpoint) requires Pro plan
  // Using direct object URLs instead
  return cdnUrl;
}

/**
 * Batch fetch CDN URLs for multiple restaurants
 */
export async function batchGetImageUrls(
  restaurants: Array<{
    imageUrl?: string;
    mallSlug: string;
    slug: string;
  }>,
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  const originalUrls = restaurants
    .map((r) => r.imageUrl)
    .filter((url): url is string => !!url);

  if (originalUrls.length === 0) return urlMap;

  try {
    const { data: cached } = await supabase
      .from("restaurant_image_cache")
      .select("original_url, cdn_url")
      .in("original_url", originalUrls);

    if (cached) {
      for (const item of cached) {
        urlMap.set(item.original_url, item.cdn_url);
      }
    }
  } catch {
    // Return empty map on error
  }

  return urlMap;
}

// Types for the image cache table
export interface RestaurantImageCache {
  id: string;
  original_url: string;
  cdn_url: string;
  mall_slug: string;
  restaurant_slug: string;
  width: number | null;
  height: number | null;
  file_size: number | null;
  processed_at: string;
  created_at: string;
}

// Types for menu image cache
export interface MenuItemImageCache {
  id: string;
  original_url: string;
  cdn_url: string;
  brand_slug: string;
  menu_item_name: string | null;
  image_type: MenuImageType;
  width: number | null;
  height: number | null;
  file_size: number | null;
  processed_at: string;
  created_at: string;
}

/**
 * Get the CDN URL for a menu image
 * Falls back to original URL if not in cache
 */
export async function getMenuImageUrl(
  originalUrl: string | undefined,
): Promise<string | null> {
  if (!originalUrl) return null;

  try {
    const { data: cached } = await supabase
      .from("menu_item_image_cache")
      .select("cdn_url")
      .eq("original_url", originalUrl)
      .single();

    if (cached?.cdn_url) {
      return cached.cdn_url;
    }

    return originalUrl;
  } catch {
    return originalUrl;
  }
}

/**
 * Batch fetch CDN URLs for multiple menu images
 * Returns a Map of original URL -> CDN URL
 */
export async function batchGetMenuImageUrls(
  urls: string[],
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  const validUrls = urls.filter((url) => url && isValidImageUrl(url));

  if (validUrls.length === 0) return urlMap;

  try {
    const { data: cached } = await supabase
      .from("menu_item_image_cache")
      .select("original_url, cdn_url")
      .in("original_url", validUrls);

    if (cached) {
      for (const item of cached) {
        urlMap.set(item.original_url, item.cdn_url);
      }
    }
  } catch {
    // Return empty map on error
  }

  return urlMap;
}

/**
 * Build the Supabase Storage public URL for a menu image
 */
export function buildMenuStorageUrl(
  brandSlug: string,
  itemSlug: string,
  filename: string,
): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${MENU_STORAGE_BUCKET}/${brandSlug}/${itemSlug}/${filename}`;
}

/**
 * Image size presets for different use cases
 */
export const IMAGE_PRESETS = {
  menuItemList: { width: 96, quality: 80, format: "webp" as const },
  menuItemModal: { width: 200, quality: 85, format: "webp" as const },
  heroBanner: { width: 800, quality: 85, format: "webp" as const },
  logo: { width: 80, quality: 80, format: "webp" as const },
  promotion: { width: 600, quality: 80, format: "webp" as const },
  relatedBrand: { width: 400, quality: 80, format: "webp" as const },
  recommendation: { width: 64, quality: 80, format: "webp" as const },
} as const;

/**
 * Get optimized menu image URL with preset
 * Applies optimization to CDN URLs, passes through others
 */
export function getOptimizedMenuUrl(
  url: string | undefined,
  cdnUrlMap: Map<string, string>,
  preset: keyof typeof IMAGE_PRESETS,
): string | undefined {
  if (!url) return undefined;

  // Check if we have a CDN URL for this image
  const cdnUrl = cdnUrlMap.get(url) || url;

  // Only apply optimization if it's a Supabase Storage URL
  if (cdnUrl.includes("/storage/v1/object/public/")) {
    return getOptimizedUrl(cdnUrl, IMAGE_PRESETS[preset]);
  }

  return cdnUrl;
}

/**
 * Collect all image URLs from brand data for batch fetching
 */
export function collectBrandImageUrls(brandData: {
  menu?: Array<{ items: Array<{ imageUrl?: string }> }>;
  promotions?: string[];
  recommendations?: string[];
  relatedBrands?: Record<string, Array<{ imageUrl?: string }>>;
  locationInfo?: { imageUrl?: string; heroImageUrl?: string };
}): string[] {
  const urls: string[] = [];

  // Menu item images
  if (brandData.menu) {
    for (const category of brandData.menu) {
      for (const item of category.items) {
        if (item.imageUrl) urls.push(item.imageUrl);
      }
    }
  }

  // Promotion images
  if (brandData.promotions) {
    urls.push(...brandData.promotions.filter(Boolean));
  }

  // Location images (hero and logo)
  if (brandData.locationInfo?.imageUrl) {
    urls.push(brandData.locationInfo.imageUrl);
  }
  if (brandData.locationInfo?.heroImageUrl) {
    urls.push(brandData.locationInfo.heroImageUrl);
  }

  // Related brand images
  if (brandData.relatedBrands) {
    for (const brands of Object.values(brandData.relatedBrands)) {
      for (const brand of brands) {
        if (brand.imageUrl) urls.push(brand.imageUrl);
      }
    }
  }

  // Recommendation images (extract URLs from recommendation strings)
  if (brandData.recommendations) {
    const urlRegex = /https?:\/\/\S+/g;
    for (const rec of brandData.recommendations) {
      const matches = rec.match(urlRegex);
      if (matches) urls.push(...matches);
    }
  }

  return [...new Set(urls)]; // Deduplicate
}
