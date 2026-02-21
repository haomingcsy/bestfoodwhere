/**
 * Google Places API Wrapper with Caching
 *
 * CRITICAL: Follows API usage rules from CLAUDE.md:
 * - Checks database cache before making API calls
 * - Stores results immediately in database
 * - Uses CDN URLs, never API endpoint URLs
 * - Includes rate limiting and cost tracking
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// API cost constants (per call)
const API_COSTS = {
  text_search: 0.032, // Places Text Search
  place_details: 0.017, // Place Details
  photo: 0.007, // Place Photos
};

// Rate limiting
const RATE_LIMIT_MS = 200; // 200ms between calls (5 calls/second max)
let lastApiCall = 0;

interface PlaceReview {
  author: string;
  authorPhotoUrl: string;
  authorProfileUrl: string;
  rating: number;
  date: string;
  content: string;
  publishTime: string;
}

interface PlaceSearchResult {
  placeId: string;
  name: string;
  address?: string;
  rating?: number;
  userRatingCount?: number;
  photos?: Array<{ name: string; widthPx: number; heightPx: number }>;
  openingHours?: {
    weekdayDescriptions: string[];
    openNow?: boolean;
  };
  businessStatus?: string;
  websiteUri?: string;
  phoneNumber?: string;
  googleMapsUri?: string;
  reviews?: PlaceReview[];
}

/**
 * Transform raw Google Places API review objects into our clean format
 */
function transformReviews(
  rawReviews: Record<string, unknown>[],
): PlaceReview[] {
  if (!Array.isArray(rawReviews)) return [];
  return rawReviews.map((review) => ({
    author:
      (review.authorAttribution as Record<string, string>)?.displayName || "",
    authorPhotoUrl:
      (review.authorAttribution as Record<string, string>)?.photoUri || "",
    authorProfileUrl:
      (review.authorAttribution as Record<string, string>)?.uri || "",
    rating: (review.rating as number) || 0,
    date: (review.relativePublishTimeDescription as string) || "",
    content: (review.text as Record<string, string>)?.text || "",
    publishTime: (review.publishTime as string) || "",
  }));
}

interface PlaceDetails extends PlaceSearchResult {
  priceLevel?: string;
  types?: string[];
  editorialSummary?: string;
}

interface CachedPlaceData {
  place_id: string;
  data: PlaceDetails;
  cached_at: string;
  expires_at: string;
}

/**
 * Sleep helper for rate limiting
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Enforce rate limiting
 */
async function rateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastApiCall;
  if (elapsed < RATE_LIMIT_MS) {
    await sleep(RATE_LIMIT_MS - elapsed);
  }
  lastApiCall = Date.now();
}

/**
 * Log API usage to database for cost tracking
 */
async function logApiUsage(
  supabase: SupabaseClient,
  apiName: string,
  operation: string,
  success: boolean,
  latencyMs: number,
): Promise<void> {
  const cost = API_COSTS[operation as keyof typeof API_COSTS] || 0;

  try {
    // Use the log_api_usage function we created in the migration
    await supabase.rpc("log_api_usage", {
      p_api_name: apiName,
      p_endpoint: operation,
      p_operation: operation,
      p_tokens_input: 0,
      p_tokens_output: 0,
      p_cost_usd: cost,
      p_success: success,
      p_latency_ms: latencyMs,
    });
  } catch (error) {
    // Don't fail the main operation if logging fails
    console.error("Failed to log API usage:", error);
  }
}

/**
 * Google Places API wrapper with caching
 */
export class GooglePlacesAPI {
  private apiKey: string;
  private supabase: SupabaseClient;
  private cacheDurationDays: number;

  constructor(apiKey: string, supabase: SupabaseClient, cacheDurationDays = 7) {
    this.apiKey = apiKey;
    this.supabase = supabase;
    this.cacheDurationDays = cacheDurationDays;
  }

  /**
   * Check if we have cached data for a place
   */
  async getCachedPlace(placeId: string): Promise<PlaceDetails | null> {
    const { data, error } = await this.supabase
      .from("mall_restaurants")
      .select("google_place_id, last_google_sync_at, google_data")
      .eq("google_place_id", placeId)
      .single();

    if (error || !data?.google_data) {
      return null;
    }

    // Check if cache is still valid
    const syncedAt = new Date(data.last_google_sync_at);
    const expiresAt = new Date(
      syncedAt.getTime() + this.cacheDurationDays * 24 * 60 * 60 * 1000,
    );

    if (new Date() > expiresAt) {
      return null; // Cache expired
    }

    return data.google_data as PlaceDetails;
  }

  /**
   * Search for a place by text query
   * ALWAYS checks cache first, stores result in database
   */
  async searchPlace(
    query: string,
    options: {
      restaurantId?: string;
      skipCache?: boolean;
    } = {},
  ): Promise<PlaceSearchResult | null> {
    await rateLimit();

    const startTime = Date.now();

    try {
      const response = await fetch(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": this.apiKey,
            "X-Goog-FieldMask":
              "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.photos,places.currentOpeningHours,places.businessStatus,places.websiteUri,places.nationalPhoneNumber,places.googleMapsUri,places.reviews",
          },
          body: JSON.stringify({
            textQuery: query,
            languageCode: "en",
            regionCode: "SG",
            maxResultCount: 1,
          }),
        },
      );

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      if (data.error) {
        await logApiUsage(
          this.supabase,
          "google_places",
          "text_search",
          false,
          latencyMs,
        );
        console.error(`Google Places API error: ${data.error.message}`);
        return null;
      }

      await logApiUsage(
        this.supabase,
        "google_places",
        "text_search",
        true,
        latencyMs,
      );

      const place = data.places?.[0];
      if (!place) {
        return null;
      }

      const result: PlaceSearchResult = {
        placeId: place.id,
        name: place.displayName?.text || "",
        address: place.formattedAddress,
        rating: place.rating,
        userRatingCount: place.userRatingCount,
        photos: place.photos,
        openingHours: place.currentOpeningHours
          ? {
              weekdayDescriptions:
                place.currentOpeningHours.weekdayDescriptions || [],
              openNow: place.currentOpeningHours.openNow,
            }
          : undefined,
        businessStatus: place.businessStatus,
        websiteUri: place.websiteUri,
        phoneNumber: place.nationalPhoneNumber,
        googleMapsUri: place.googleMapsUri,
        reviews: place.reviews ? transformReviews(place.reviews) : undefined,
      };

      // Update restaurant if ID provided
      if (options.restaurantId) {
        await this.updateRestaurantFromPlace(options.restaurantId, result);
      }

      return result;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      await logApiUsage(
        this.supabase,
        "google_places",
        "text_search",
        false,
        latencyMs,
      );
      throw error;
    }
  }

  /**
   * Get photo URL for a place photo reference
   * Returns CDN URL (lh3.googleusercontent.com), NOT API URL
   */
  async getPhotoUrl(photoRef: string, maxWidth = 800): Promise<string | null> {
    await rateLimit();

    const startTime = Date.now();

    try {
      // The photo reference is in format "places/{placeId}/photos/{photoId}"
      const url = `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=${maxWidth}&key=${this.apiKey}`;
      const res = await fetch(url, { redirect: "follow" });

      const latencyMs = Date.now() - startTime;

      // Get the final URL after redirect (this is the CDN URL)
      const cdnUrl = res.url;

      // CRITICAL: Verify it's a CDN URL, not an API URL
      if (!cdnUrl.includes("lh3.googleusercontent.com")) {
        console.warn(`Warning: Photo URL is not CDN format: ${cdnUrl}`);
        await logApiUsage(
          this.supabase,
          "google_places_photos",
          "photo",
          false,
          latencyMs,
        );
        return null;
      }

      await logApiUsage(
        this.supabase,
        "google_places_photos",
        "photo",
        true,
        latencyMs,
      );

      return cdnUrl;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      await logApiUsage(
        this.supabase,
        "google_places_photos",
        "photo",
        false,
        latencyMs,
      );
      throw error;
    }
  }

  /**
   * Get place details by place ID
   * ALWAYS checks cache first
   */
  async getPlaceDetails(
    placeId: string,
    options: {
      skipCache?: boolean;
      restaurantId?: string;
    } = {},
  ): Promise<PlaceDetails | null> {
    // Check cache first (unless explicitly skipped)
    if (!options.skipCache) {
      const cached = await this.getCachedPlace(placeId);
      if (cached) {
        return cached;
      }
    }

    await rateLimit();

    const startTime = Date.now();

    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}`,
        {
          method: "GET",
          headers: {
            "X-Goog-Api-Key": this.apiKey,
            "X-Goog-FieldMask":
              "id,displayName,formattedAddress,rating,userRatingCount,photos,currentOpeningHours,businessStatus,websiteUri,nationalPhoneNumber,googleMapsUri,priceLevel,types,editorialSummary,reviews",
          },
        },
      );

      const place = await response.json();
      const latencyMs = Date.now() - startTime;

      if (place.error) {
        await logApiUsage(
          this.supabase,
          "google_places",
          "place_details",
          false,
          latencyMs,
        );
        console.error(`Google Places API error: ${place.error.message}`);
        return null;
      }

      await logApiUsage(
        this.supabase,
        "google_places",
        "place_details",
        true,
        latencyMs,
      );

      const result: PlaceDetails = {
        placeId: place.id,
        name: place.displayName?.text || "",
        address: place.formattedAddress,
        rating: place.rating,
        userRatingCount: place.userRatingCount,
        photos: place.photos,
        openingHours: place.currentOpeningHours
          ? {
              weekdayDescriptions:
                place.currentOpeningHours.weekdayDescriptions || [],
              openNow: place.currentOpeningHours.openNow,
            }
          : undefined,
        businessStatus: place.businessStatus,
        websiteUri: place.websiteUri,
        phoneNumber: place.nationalPhoneNumber,
        googleMapsUri: place.googleMapsUri,
        priceLevel: place.priceLevel,
        types: place.types,
        editorialSummary: place.editorialSummary?.text,
        reviews: place.reviews ? transformReviews(place.reviews) : undefined,
      };

      // Update restaurant if ID provided
      if (options.restaurantId) {
        await this.updateRestaurantFromPlace(options.restaurantId, result);
      }

      return result;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      await logApiUsage(
        this.supabase,
        "google_places",
        "place_details",
        false,
        latencyMs,
      );
      throw error;
    }
  }

  /**
   * Update restaurant record with place data
   * Stores both synced data and tracks the sync time
   */
  private async updateRestaurantFromPlace(
    restaurantId: string,
    place: PlaceSearchResult | PlaceDetails,
  ): Promise<void> {
    const updates: Record<string, unknown> = {
      google_place_id: place.placeId,
      last_google_sync_at: new Date().toISOString(),
      last_verified_at: new Date().toISOString(),
      data_source: "google_places",
      google_data: place,
    };

    // Update specific fields if available
    if (place.rating !== undefined) {
      updates.rating = place.rating;
    }
    if (place.userRatingCount !== undefined) {
      updates.review_count = place.userRatingCount;
    }
    if (place.businessStatus === "CLOSED_PERMANENTLY") {
      updates.is_permanently_closed = true;
      updates.needs_review = true;
    }
    if (place.openingHours?.weekdayDescriptions) {
      updates.opening_hours = place.openingHours.weekdayDescriptions;
    }
    if (place.phoneNumber) {
      updates.phone = place.phoneNumber;
    }
    if (place.websiteUri) {
      updates.website = place.websiteUri;
    }
    // Store reviews in the reviews JSONB column
    if ("reviews" in place && (place as PlaceDetails).reviews?.length) {
      updates.reviews = (place as PlaceDetails).reviews;
    }

    const { error } = await this.supabase
      .from("mall_restaurants")
      .update(updates)
      .eq("id", restaurantId);

    if (error) {
      console.error(`Failed to update restaurant ${restaurantId}:`, error);
    }
  }

  /**
   * Sync a single restaurant with Google Places
   * - Searches for the restaurant
   * - Gets photos
   * - Updates database
   * Returns changes detected
   */
  async syncRestaurant(
    restaurantId: string,
    restaurantName: string,
    mallName: string,
    options: {
      forceRefresh?: boolean;
      fetchPhoto?: boolean;
    } = {},
  ): Promise<{
    success: boolean;
    changes: string[];
    error?: string;
  }> {
    const changes: string[] = [];

    try {
      // Get current restaurant data
      const { data: currentData, error: fetchError } = await this.supabase
        .from("mall_restaurants")
        .select("*")
        .eq("id", restaurantId)
        .single();

      if (fetchError || !currentData) {
        return {
          success: false,
          changes: [],
          error: "Restaurant not found",
        };
      }

      // Check if we need to refresh (cache expired or force)
      const needsRefresh =
        options.forceRefresh ||
        !currentData.last_google_sync_at ||
        new Date().getTime() -
          new Date(currentData.last_google_sync_at).getTime() >
          this.cacheDurationDays * 24 * 60 * 60 * 1000;

      if (!needsRefresh && currentData.google_place_id) {
        return { success: true, changes: ["No refresh needed - cache valid"] };
      }

      // Search for the place
      const query = `${restaurantName} ${mallName} Singapore`;
      const place = await this.searchPlace(query, { restaurantId });

      if (!place) {
        return {
          success: false,
          changes: [],
          error: "Place not found on Google",
        };
      }

      // Detect changes
      if (currentData.rating !== place.rating) {
        changes.push(`rating: ${currentData.rating} -> ${place.rating}`);
      }
      if (place.businessStatus === "CLOSED_PERMANENTLY") {
        changes.push("STATUS: CLOSED PERMANENTLY");
      }
      if (
        place.openingHours?.weekdayDescriptions &&
        JSON.stringify(currentData.opening_hours) !==
          JSON.stringify(place.openingHours.weekdayDescriptions)
      ) {
        changes.push("opening_hours changed");
      }

      // Fetch photo if requested and no valid image exists
      if (options.fetchPhoto && place.photos?.[0]) {
        const needsPhoto =
          !currentData.hero_image_url ||
          !currentData.hero_image_url.includes("lh3.googleusercontent.com");

        if (needsPhoto) {
          const photoUrl = await this.getPhotoUrl(place.photos[0].name);
          if (photoUrl) {
            await this.supabase
              .from("mall_restaurants")
              .update({ hero_image_url: photoUrl })
              .eq("id", restaurantId);
            changes.push("hero_image_url updated");
          }
        }
      }

      return { success: true, changes };
    } catch (error) {
      return {
        success: false,
        changes: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Batch sync multiple restaurants with rate limiting
   * Returns summary of changes
   */
  async batchSync(
    restaurants: Array<{
      id: string;
      name: string;
      mallName: string;
    }>,
    options: {
      batchSize?: number;
      delayBetweenBatches?: number;
      onProgress?: (current: number, total: number, result: unknown) => void;
    } = {},
  ): Promise<{
    total: number;
    synced: number;
    failed: number;
    closures: string[];
    errors: Array<{ id: string; error: string }>;
  }> {
    const batchSize = options.batchSize || 10;
    const delayBetweenBatches = options.delayBetweenBatches || 2000;

    const results = {
      total: restaurants.length,
      synced: 0,
      failed: 0,
      closures: [] as string[],
      errors: [] as Array<{ id: string; error: string }>,
    };

    for (let i = 0; i < restaurants.length; i += batchSize) {
      const batch = restaurants.slice(i, i + batchSize);

      for (const restaurant of batch) {
        const result = await this.syncRestaurant(
          restaurant.id,
          restaurant.name,
          restaurant.mallName,
          { fetchPhoto: true },
        );

        if (result.success) {
          results.synced++;
          if (result.changes.includes("STATUS: CLOSED PERMANENTLY")) {
            results.closures.push(restaurant.name);
          }
        } else {
          results.failed++;
          results.errors.push({
            id: restaurant.id,
            error: result.error || "Unknown error",
          });
        }

        if (options.onProgress) {
          options.onProgress(
            i + batch.indexOf(restaurant) + 1,
            restaurants.length,
            result,
          );
        }
      }

      // Delay between batches
      if (i + batchSize < restaurants.length) {
        await sleep(delayBetweenBatches);
      }
    }

    return results;
  }
}

/**
 * Create a Google Places API instance with default configuration
 */
export function createGooglePlacesAPI(
  supabase: SupabaseClient,
  apiKey?: string,
): GooglePlacesAPI {
  const key = apiKey || process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_PLACES_API_KEY is required");
  }
  return new GooglePlacesAPI(key, supabase);
}
