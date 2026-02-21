/**
 * 05-sync-reviews.ts
 *
 * Extracts Google Places reviews from the mall_restaurants.reviews JSONB column
 * into the normalized brand_reviews table. Handles both Google Places API (New)
 * and Legacy response formats.
 *
 * Usage:
 *   npx tsx scripts/pipeline/05-sync-reviews.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

config({ path: resolve(__dirname, "../../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FETCH_BATCH_SIZE = 100;
const UPSERT_BATCH_SIZE = 50;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Split an array into chunks of a given size. */
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Row shape returned from mall_restaurants query. */
interface MallRestaurantRow {
  id: string;
  slug: string;
  name: string;
  google_place_id: string | null;
  reviews: unknown;
}

/** Lookup map from mall_restaurant_id to brand_menu_id. */
type LocationMap = Map<string, string>;

/** A normalized review row ready for upsert into brand_reviews. */
interface BrandReviewRow {
  brand_menu_id: string;
  mall_restaurant_id: string;
  google_place_id: string | null;
  author: string;
  author_photo_url: string | null;
  author_profile_url: string | null;
  rating: number;
  content: string;
  publish_time: string; // ISO-8601
  relative_date: string | null;
}

// ---------------------------------------------------------------------------
// Review parsing – handles both API formats
// ---------------------------------------------------------------------------

function parseReview(
  raw: Record<string, unknown>,
  mallRestaurantId: string,
  googlePlaceId: string | null,
  brandMenuId: string,
): BrandReviewRow | null {
  try {
    // --- Author ---
    const author =
      (raw.authorAttribution as Record<string, unknown>)?.displayName ??
      raw.author_name ??
      raw.author ??
      null;

    if (!author || typeof author !== "string") {
      return null; // cannot create a review without an author
    }

    // --- Rating ---
    const rating = typeof raw.rating === "number" ? raw.rating : null;
    if (rating === null) {
      return null; // rating is essential
    }

    // --- Content / text ---
    let content: string | null = null;
    if (raw.text !== undefined) {
      if (typeof raw.text === "string") {
        content = raw.text;
      } else if (
        typeof raw.text === "object" &&
        raw.text !== null &&
        typeof (raw.text as Record<string, unknown>).text === "string"
      ) {
        content = (raw.text as Record<string, unknown>).text as string;
      }
    }
    if (raw.content !== undefined && typeof raw.content === "string") {
      content = raw.content;
    }
    // Allow reviews with empty content (rating-only reviews exist)
    content = content ?? "";

    // --- Publish time ---
    let publishTime: string | null = null;

    if (typeof raw.publishTime === "string") {
      // Format A – ISO-8601 string
      publishTime = raw.publishTime;
    } else if (typeof raw.publish_time === "string") {
      publishTime = raw.publish_time;
    } else if (typeof raw.time === "number") {
      // Format B – Unix timestamp in seconds
      publishTime = new Date(raw.time * 1000).toISOString();
    }

    if (!publishTime) {
      return null; // publish_time is part of the unique constraint
    }

    // --- Author photo ---
    const authorPhotoUrl =
      ((raw.authorAttribution as Record<string, unknown>)?.photoUri as
        | string
        | undefined) ??
      (raw.profile_photo_url as string | undefined) ??
      null;

    // --- Author profile URL ---
    const authorProfileUrl =
      ((raw.authorAttribution as Record<string, unknown>)?.uri as
        | string
        | undefined) ??
      (raw.author_url as string | undefined) ??
      null;

    // --- Relative date ---
    const relativeDate =
      (raw.relativePublishTimeDescription as string | undefined) ??
      (raw.relative_time_description as string | undefined) ??
      null;

    return {
      brand_menu_id: brandMenuId,
      mall_restaurant_id: mallRestaurantId,
      google_place_id: googlePlaceId,
      author: author as string,
      author_photo_url: authorPhotoUrl,
      author_profile_url: authorProfileUrl,
      rating,
      content,
      publish_time: publishTime,
      relative_date: relativeDate,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== 05-sync-reviews ===");
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log("");

  // -------------------------------------------------------------------------
  // Step 1: Build a lookup from mall_restaurant_id -> brand_menu_id
  // -------------------------------------------------------------------------
  console.log("Building brand_locations lookup map...");

  const locationMap: LocationMap = new Map();
  let locOffset = 0;
  let locHasMore = true;

  while (locHasMore) {
    const { data, error } = await supabase
      .from("brand_locations")
      .select("mall_restaurant_id, brand_menu_id")
      .range(locOffset, locOffset + 999);

    if (error) {
      console.error("Error fetching brand_locations:", error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      locHasMore = false;
    } else {
      for (const row of data) {
        if (row.mall_restaurant_id && row.brand_menu_id) {
          locationMap.set(row.mall_restaurant_id, row.brand_menu_id);
        }
      }
      locOffset += 1000;
      if (data.length < 1000) {
        locHasMore = false;
      }
    }
  }

  console.log(`  Loaded ${locationMap.size} brand_location mappings.`);
  console.log("");

  // -------------------------------------------------------------------------
  // Step 2: Fetch mall_restaurants with non-null reviews in batches
  // -------------------------------------------------------------------------
  console.log("Fetching mall_restaurants with reviews...");

  let totalRestaurants = 0;
  let totalReviewsParsed = 0;
  let totalReviewsUpserted = 0;
  let totalSkipped = 0;
  let totalParseErrors = 0;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("mall_restaurants")
      .select("id, slug, name, google_place_id, reviews")
      .not("reviews", "is", null)
      .range(offset, offset + FETCH_BATCH_SIZE - 1);

    if (error) {
      console.error("Error fetching mall_restaurants:", error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    const rows = data as unknown as MallRestaurantRow[];
    totalRestaurants += rows.length;

    // Collect all review rows for this batch
    const reviewRows: BrandReviewRow[] = [];

    for (const mr of rows) {
      // Find matching brand_menu_id
      const brandMenuId = locationMap.get(mr.id);
      if (!brandMenuId) {
        totalSkipped++;
        continue;
      }

      // Parse reviews array
      let reviewsArray: unknown[];
      try {
        if (Array.isArray(mr.reviews)) {
          reviewsArray = mr.reviews;
        } else if (typeof mr.reviews === "string") {
          const parsed = JSON.parse(mr.reviews);
          if (!Array.isArray(parsed)) {
            totalSkipped++;
            continue;
          }
          reviewsArray = parsed;
        } else {
          totalSkipped++;
          continue;
        }
      } catch {
        console.warn(
          `  Malformed reviews JSON for "${mr.name}" (${mr.id}), skipping.`,
        );
        totalSkipped++;
        continue;
      }

      for (const rawReview of reviewsArray) {
        if (typeof rawReview !== "object" || rawReview === null) {
          totalParseErrors++;
          continue;
        }

        const parsed = parseReview(
          rawReview as Record<string, unknown>,
          mr.id,
          mr.google_place_id,
          brandMenuId,
        );

        if (parsed) {
          reviewRows.push(parsed);
          totalReviewsParsed++;
        } else {
          totalParseErrors++;
        }
      }
    }

    // Batch upsert collected reviews
    if (reviewRows.length > 0) {
      const upsertChunks = chunk(reviewRows, UPSERT_BATCH_SIZE);

      for (const batch of upsertChunks) {
        const { error: upsertError } = await supabase
          .from("brand_reviews")
          .upsert(batch, {
            onConflict: "brand_menu_id,author,publish_time",
            ignoreDuplicates: false,
          });

        if (upsertError) {
          console.error(
            `  Error upserting brand_reviews batch:`,
            upsertError.message,
          );
        } else {
          totalReviewsUpserted += batch.length;
        }
      }
    }

    // Progress logging
    if (totalRestaurants % 100 === 0 || data.length < FETCH_BATCH_SIZE) {
      console.log(
        `  Processed ${totalRestaurants} restaurants, ${totalReviewsParsed} reviews parsed, ${totalReviewsUpserted} upserted`,
      );
    }

    if (data.length < FETCH_BATCH_SIZE) {
      hasMore = false;
    } else {
      offset += FETCH_BATCH_SIZE;
    }
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("");
  console.log("=== Sync Complete ===");
  console.log(`  Restaurants processed:   ${totalRestaurants}`);
  console.log(`  Reviews parsed:          ${totalReviewsParsed}`);
  console.log(`  Reviews upserted:        ${totalReviewsUpserted}`);
  console.log(`  Restaurants skipped:     ${totalSkipped}`);
  console.log(`  Individual parse errors: ${totalParseErrors}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
