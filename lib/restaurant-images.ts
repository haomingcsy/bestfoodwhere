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

    // Also check restaurant_image_cache for URLs not found above
    const remaining = validUrls.filter((url) => !urlMap.has(url));
    if (remaining.length > 0) {
      const { data: restaurantCached } = await supabase
        .from("restaurant_image_cache")
        .select("original_url, cdn_url")
        .in("original_url", remaining);

      if (restaurantCached) {
        for (const item of restaurantCached) {
          urlMap.set(item.original_url, item.cdn_url);
        }
      }
    }
  } catch {
    // Return empty map on error
  }

  return urlMap;
}

/**
 * Resolve related brand images using mall_restaurants hero_image_url.
 * Matches by slug first, then falls back to exact name match.
 * Returns a map of originalImageUrl → resolvedHeroImageUrl.
 */
export async function resolveRelatedBrandImages(
  brands: Array<{ name: string; imageUrl: string }>,
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  if (brands.length === 0) return urlMap;

  const toSlug = (input: string) =>
    input
      .trim()
      .toLowerCase()
      .replace(/['']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // Build lookup maps
  const slugToImageUrl = new Map<string, string>();
  const nameToImageUrl = new Map<string, string>();
  for (const brand of brands) {
    const slug = toSlug(brand.name);
    if (slug && brand.imageUrl) {
      slugToImageUrl.set(slug, brand.imageUrl);
      nameToImageUrl.set(brand.name.trim(), brand.imageUrl);
    }
  }

  const slugs = [...slugToImageUrl.keys()];
  const names = [...nameToImageUrl.keys()];
  if (slugs.length === 0) return urlMap;

  try {
    // Primary: query mall_restaurants by slug (same source as mall pages)
    const { data: bySlug, error: slugError } = await supabase
      .from("mall_restaurants")
      .select("slug, name, hero_image_url")
      .in("slug", slugs)
      .not("hero_image_url", "is", null);

    if (slugError) {
      console.error(
        "[resolveRelatedBrandImages] slug query error:",
        slugError.message,
      );
    }

    if (bySlug) {
      for (const item of bySlug) {
        const originalUrl = slugToImageUrl.get(item.slug);
        if (originalUrl && item.hero_image_url && !urlMap.has(originalUrl)) {
          urlMap.set(originalUrl, item.hero_image_url);
        }
      }
    }

    // Fallback: query by exact name for any still-unresolved brands
    const unresolvedNames = names.filter(
      (name) => !urlMap.has(nameToImageUrl.get(name)!),
    );
    if (unresolvedNames.length > 0) {
      const { data: byName, error: nameError } = await supabase
        .from("mall_restaurants")
        .select("name, hero_image_url")
        .in("name", unresolvedNames)
        .not("hero_image_url", "is", null);

      if (nameError) {
        console.error(
          "[resolveRelatedBrandImages] name query error:",
          nameError.message,
        );
      }

      if (byName) {
        for (const item of byName) {
          const originalUrl = nameToImageUrl.get(item.name);
          if (originalUrl && item.hero_image_url && !urlMap.has(originalUrl)) {
            urlMap.set(originalUrl, item.hero_image_url);
          }
        }
      }
    }

    console.log(
      `[resolveRelatedBrandImages] Resolved ${urlMap.size}/${slugs.length} images`,
      urlMap.size < slugs.length
        ? `| Unresolved: ${slugs.filter((s) => !urlMap.has(slugToImageUrl.get(s)!)).join(", ")}`
        : "",
    );
  } catch (err) {
    console.error("[resolveRelatedBrandImages] Error:", err);
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
 * Fetch Google reviews from the mall_restaurants table for a given restaurant slug.
 * A restaurant can exist in multiple malls, so we query all matching rows,
 * combine and deduplicate reviews, and compute aggregate rating/count.
 */
export async function fetchGoogleReviewsFromDB(
  restaurantSlug: string,
): Promise<{
  reviews: Array<{
    author: string;
    authorPhotoUrl?: string;
    authorProfileUrl?: string;
    rating: number;
    date: string;
    content: string;
    publishTime?: string;
  }>;
  rating?: number;
  reviewCount?: number;
}> {
  const emptyResult = {
    reviews: [],
    rating: undefined,
    reviewCount: undefined,
  };

  try {
    // Get all locations for this restaurant with their Google Place IDs
    const { data, error } = await supabase
      .from("mall_restaurants")
      .select("google_place_id, rating, review_count")
      .eq("slug", restaurantSlug);

    if (error) {
      console.error("[fetchGoogleReviews] query error:", error.message);
      return emptyResult;
    }

    if (!data || data.length === 0) {
      return emptyResult;
    }

    // Fetch reviews live from Google Places API for each location
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.error("[fetchGoogleReviews] No GOOGLE_PLACES_API_KEY");
      return emptyResult;
    }

    type ReviewItem = {
      author: string;
      authorPhotoUrl?: string;
      authorProfileUrl?: string;
      rating: number;
      date: string;
      content: string;
      publishTime?: string;
    };

    const allReviews: ReviewItem[] = [];

    // Fetch reviews from Google Places API for each location (in parallel)
    const placeIds = data
      .map((r) => r.google_place_id)
      .filter((id): id is string => !!id);

    const fetches = placeIds.map(async (placeId) => {
      try {
        const res = await fetch(
          `https://places.googleapis.com/v1/places/${placeId}`,
          {
            headers: {
              "X-Goog-Api-Key": apiKey,
              "X-Goog-FieldMask": "reviews",
            },
            next: { revalidate: 86400 }, // Cache for 24h
          },
        );
        if (!res.ok) return [];
        const place = await res.json();
        if (!Array.isArray(place.reviews)) return [];
        return place.reviews.map(
          (r: {
            authorAttribution?: {
              displayName?: string;
              photoUri?: string;
              uri?: string;
            };
            rating?: number;
            relativePublishTimeDescription?: string;
            text?: { text?: string };
            originalText?: { text?: string };
            publishTime?: string;
          }): ReviewItem => ({
            author: r.authorAttribution?.displayName ?? "Anonymous",
            authorPhotoUrl: r.authorAttribution?.photoUri,
            authorProfileUrl: r.authorAttribution?.uri,
            rating: r.rating ?? 0,
            date: r.relativePublishTimeDescription ?? "",
            content: r.text?.text ?? r.originalText?.text ?? "",
            publishTime: r.publishTime,
          }),
        );
      } catch {
        return [];
      }
    });

    const results = await Promise.all(fetches);
    for (const reviews of results) {
      allReviews.push(...reviews);
    }

    // Deduplicate by author + first 50 chars of content
    const seen = new Set<string>();
    const deduped = allReviews.filter((review) => {
      const key = `${review.author.toLowerCase()}|${review.content.slice(0, 50).toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by publishTime descending (newest first)
    deduped.sort((a, b) => {
      const timeA = a.publishTime ? new Date(a.publishTime).getTime() : 0;
      const timeB = b.publishTime ? new Date(b.publishTime).getTime() : 0;
      return timeB - timeA;
    });

    // Compute aggregate rating and total review count
    let totalRating = 0;
    let totalCount = 0;
    let ratingEntries = 0;

    for (const row of data) {
      if (row.rating != null) {
        totalRating += row.rating;
        ratingEntries++;
      }
      if (row.review_count != null) {
        totalCount += row.review_count;
      }
    }

    const avgRating =
      ratingEntries > 0 ? totalRating / ratingEntries : undefined;

    console.log(
      `[fetchGoogleReviews] slug="${restaurantSlug}" → ${placeIds.length} location(s), ${deduped.length} unique reviews`,
    );

    return {
      reviews: deduped,
      rating: avgRating,
      reviewCount: totalCount > 0 ? totalCount : undefined,
    };
  } catch (err) {
    console.error("[fetchGoogleReviews] Error:", err);
    return emptyResult;
  }
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
