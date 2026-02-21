/**
 * Menu Registry - Centralized utility for checking menu page availability
 *
 * This module provides a single source of truth for determining which restaurants
 * have menu pages. Use this across all pages/components that display restaurant
 * listings (shopping malls, dining pages, cuisine pages, search results, etc.)
 */

import { fetchAllBrandsSupabase } from "./supabase-menu";

// Cache for menu page slugs
let menuPageSlugsCache: Set<string> | null = null;
let menuPageSlugsCacheTime = 0;
const MENU_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get all available menu page slugs
 * Results are cached for 5 minutes to avoid repeated API calls
 */
export async function getMenuPageSlugs(): Promise<Set<string>> {
  const now = Date.now();
  if (menuPageSlugsCache && now - menuPageSlugsCacheTime < MENU_CACHE_TTL_MS) {
    return menuPageSlugsCache;
  }

  try {
    const brands = await fetchAllBrandsSupabase();
    menuPageSlugsCache = new Set(brands.map((brand) => brand.slug));
    menuPageSlugsCacheTime = now;
    return menuPageSlugsCache;
  } catch (error) {
    console.warn("[Menu Registry] Failed to fetch menu page slugs:", error);
    return menuPageSlugsCache ?? new Set();
  }
}

/**
 * Check if a restaurant has a menu page
 * @param slug - The restaurant slug to check
 * @returns Promise<boolean> - Whether the restaurant has a menu page
 */
export async function hasMenuPage(slug: string): Promise<boolean> {
  const slugs = await getMenuPageSlugs();
  return slugs.has(slug);
}

/**
 * Batch check which restaurants have menu pages
 * More efficient than calling hasMenuPage for each restaurant
 * @param slugs - Array of restaurant slugs to check
 * @returns Promise<Map<string, boolean>> - Map of slug to hasMenuPage
 */
export async function batchCheckMenuPages(
  slugs: string[],
): Promise<Map<string, boolean>> {
  const menuSlugs = await getMenuPageSlugs();
  const result = new Map<string, boolean>();
  for (const slug of slugs) {
    result.set(slug, menuSlugs.has(slug));
  }
  return result;
}

/**
 * Enrich restaurant data with hasMenuPage flag
 * Use this to add menu page availability to any restaurant list
 * @param restaurants - Array of objects with at least a slug property
 * @returns Same array with hasMenuPage added to each item
 */
export async function enrichWithMenuPageStatus<
  T extends { slug: string; hasMenuPage?: boolean },
>(restaurants: T[]): Promise<T[]> {
  const menuSlugs = await getMenuPageSlugs();
  return restaurants.map((restaurant) => ({
    ...restaurant,
    hasMenuPage: menuSlugs.has(restaurant.slug),
  }));
}

/**
 * Helper to generate consistent slugs
 * Use this when you need to generate a slug that matches the menu page slugs
 */
export function toMenuSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Get menu page URL for a restaurant
 * Returns the URL if menu page exists, undefined otherwise
 * @param slug - Restaurant slug
 * @param location - Optional location slug for multi-location restaurants
 */
export async function getMenuPageUrl(
  slug: string,
  location?: string,
): Promise<string | undefined> {
  const exists = await hasMenuPage(slug);
  if (!exists) return undefined;

  const baseUrl = `/menu/${slug}`;
  return location ? `${baseUrl}?location=${location}` : baseUrl;
}

/**
 * Sync helper for use in data fetching functions
 * Returns the menu slugs set for efficient checking in loops
 */
export async function getMenuSlugsForSync(): Promise<Set<string>> {
  return getMenuPageSlugs();
}
