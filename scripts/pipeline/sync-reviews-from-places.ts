/**
 * sync-reviews-from-places.ts
 *
 * Fetches reviews from Google Places API (New) for all mall_restaurants
 * that have a google_place_id but no reviews yet, transforms them into
 * a simpler format, and stores them in the reviews JSONB column.
 *
 * Usage:
 *   npx tsx scripts/pipeline/sync-reviews-from-places.ts
 *   npx tsx scripts/pipeline/sync-reviews-from-places.ts --dry-run
 *   npx tsx scripts/pipeline/sync-reviews-from-places.ts --limit=10
 *   npx tsx scripts/pipeline/sync-reviews-from-places.ts --concurrency=3
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(__dirname, "../../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

if (!GOOGLE_PLACES_API_KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// CLI flag parsing
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let dryRun = false;
  let limit: number | undefined;
  let concurrency = 5;

  for (const arg of args) {
    if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg.startsWith("--limit=")) {
      limit = parseInt(arg.split("=")[1], 10);
      if (isNaN(limit) || limit <= 0) {
        console.error("--limit must be a positive integer");
        process.exit(1);
      }
    } else if (arg.startsWith("--concurrency=")) {
      concurrency = parseInt(arg.split("=")[1], 10);
      if (isNaN(concurrency) || concurrency <= 0) {
        console.error("--concurrency must be a positive integer");
        process.exit(1);
      }
    }
  }

  return { dryRun, limit, concurrency };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlacesApiReview {
  name: string;
  relativePublishTimeDescription: string;
  rating: number;
  text?: { text: string; languageCode: string };
  originalText?: { text: string; languageCode: string };
  authorAttribution: {
    displayName: string;
    uri: string;
    photoUri: string;
  };
  publishTime: string;
}

interface TransformedReview {
  author: string;
  authorPhotoUrl: string;
  authorProfileUrl: string;
  rating: number;
  content: string;
  publishTime: string;
  relativeDate: string;
}

// ---------------------------------------------------------------------------
// Google Places API fetch
// ---------------------------------------------------------------------------

async function fetchReviewsFromPlaces(
  placeId: string,
): Promise<TransformedReview[]> {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": "reviews",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Places API error ${response.status} for ${placeId}: ${errorBody}`,
    );
  }

  const data = await response.json();
  const reviews: PlacesApiReview[] = data.reviews || [];

  return reviews.map((r) => ({
    author: r.authorAttribution.displayName,
    authorPhotoUrl: r.authorAttribution.photoUri,
    authorProfileUrl: r.authorAttribution.uri,
    rating: r.rating,
    content: r.text?.text || r.originalText?.text || "",
    publishTime: r.publishTime,
    relativeDate: r.relativePublishTimeDescription,
  }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { dryRun, limit, concurrency } = parseArgs();

  console.log("=== sync-reviews-from-places ===");
  console.log(`  dry-run:     ${dryRun}`);
  console.log(`  limit:       ${limit ?? "none"}`);
  console.log(`  concurrency: ${concurrency}`);
  console.log();

  // 1. Fetch all mall_restaurants with a google_place_id but null reviews
  let query = supabase
    .from("mall_restaurants")
    .select("id, name, slug, google_place_id")
    .not("google_place_id", "is", null)
    .is("reviews", null)
    .order("name");

  if (limit) {
    query = query.limit(limit);
  }

  const { data: restaurants, error: fetchErr } = await query;

  if (fetchErr) {
    console.error("Error fetching mall_restaurants:", fetchErr.message);
    process.exit(1);
  }

  if (!restaurants || restaurants.length === 0) {
    console.log("No restaurants found that need review syncing.");
    return;
  }

  console.log(
    `Found ${restaurants.length} restaurant(s) with google_place_id but no reviews.\n`,
  );

  // 2. Process in batches with concurrency control
  let totalProcessed = 0;
  let totalWithReviews = 0;
  let totalReviewCount = 0;
  let totalErrors = 0;

  for (let i = 0; i < restaurants.length; i += concurrency) {
    const batch = restaurants.slice(i, i + concurrency);

    const batchResults = await Promise.allSettled(
      batch.map(async (restaurant, batchIdx) => {
        const idx = i + batchIdx + 1;
        const label = `${restaurant.name} (${restaurant.slug})`;

        try {
          const reviews = await fetchReviewsFromPlaces(
            restaurant.google_place_id,
          );

          console.log(
            `Processing ${idx}/${restaurants.length}: ${label}... (${reviews.length} reviews found)`,
          );

          if (reviews.length > 0) {
            totalWithReviews++;
            totalReviewCount += reviews.length;
          }

          if (!dryRun && reviews.length > 0) {
            const { error: updateErr } = await supabase
              .from("mall_restaurants")
              .update({ reviews })
              .eq("id", restaurant.id);

            if (updateErr) {
              console.error(`  Error updating ${label}: ${updateErr.message}`);
              totalErrors++;
              return;
            }
          }

          totalProcessed++;
        } catch (err: any) {
          console.error(
            `  Error fetching reviews for ${label}: ${err.message}`,
          );
          totalErrors++;
        }
      }),
    );

    // 200ms delay between batches to respect rate limits
    if (i + concurrency < restaurants.length) {
      await sleep(200);
    }
  }

  // 3. Summary
  console.log("\n=== Summary ===");
  console.log(`  Total processed:     ${totalProcessed}`);
  console.log(`  Total with reviews:  ${totalWithReviews}`);
  console.log(`  Total reviews found: ${totalReviewCount}`);
  if (totalErrors > 0) {
    console.log(`  Total errors:        ${totalErrors}`);
  }
  if (dryRun) {
    console.log("  (dry-run mode — no database updates were made)");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
