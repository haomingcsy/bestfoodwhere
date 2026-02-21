#!/usr/bin/env node

/**
 * Sync Four Leaves reviews from Google Places API (New)
 *
 * Fetches reviews for all "Four Leaves" entries in mall_restaurants
 * and stores them in the `google_data` JSONB column.
 *
 * Usage: node scripts/sync-four-leaves-reviews.mjs
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// 1. Load environment variables from .env.local
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx > 0) {
    env[trimmed.substring(0, eqIdx).trim()] = trimmed
      .substring(eqIdx + 1)
      .trim();
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const PLACES_API_KEY = env.GOOGLE_PLACES_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !PLACES_API_KEY) {
  console.error(
    "Missing required env vars. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and GOOGLE_PLACES_API_KEY.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const RATE_LIMIT_MS = 300;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Transform raw Google Places API review objects into our clean format.
 */
function transformReviews(rawReviews) {
  if (!Array.isArray(rawReviews)) return [];
  return rawReviews.map((review) => ({
    author: review.authorAttribution?.displayName || "",
    authorPhotoUrl: review.authorAttribution?.photoUri || "",
    authorProfileUrl: review.authorAttribution?.uri || "",
    rating: review.rating || 0,
    date: review.relativePublishTimeDescription || "",
    content: review.text?.text || "",
    publishTime: review.publishTime || "",
  }));
}

/**
 * Fetch place details (reviews, rating, userRatingCount) from Google Places API (New).
 */
async function fetchPlaceReviews(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": PLACES_API_KEY,
      "X-Goog-FieldMask": "reviews,rating,userRatingCount",
    },
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`API error: ${data.error.message}`);
  }

  return {
    rating: data.rating,
    reviewCount: data.userRatingCount,
    reviews: data.reviews ? transformReviews(data.reviews) : [],
  };
}

// ---------------------------------------------------------------------------
// 2. Find all Four Leaves entries
// ---------------------------------------------------------------------------
async function findFourLeaves() {
  console.log("Step 1: Finding Four Leaves entries...");

  const { data, error } = await supabase
    .from("mall_restaurants")
    .select(
      "id, name, slug, google_place_id, google_data, rating, review_count, shopping_malls(name)",
    )
    .ilike("name", "%four leaves%");

  if (error) {
    console.error("Error querying Four Leaves:", error.message);
    return [];
  }

  console.log(`  Found ${data.length} entries:\n`);
  data.forEach((r) => {
    const mall = r.shopping_malls?.name || "Unknown";
    const existingReviews = r.google_data?.reviews;
    const hasReviews =
      existingReviews &&
      Array.isArray(existingReviews) &&
      existingReviews.length > 0;
    console.log(`  ${r.name} @ ${mall}`);
    console.log(`    ID: ${r.id}`);
    console.log(`    Place ID: ${r.google_place_id || "NONE"}`);
    console.log(
      `    Current rating: ${r.rating || "N/A"} (${r.review_count || 0} reviews)`,
    );
    console.log(
      `    Existing reviews in google_data: ${hasReviews ? `${existingReviews.length} stored` : "none"}`,
    );
    console.log();
  });

  return data;
}

// ---------------------------------------------------------------------------
// 3. Sync reviews for each entry
// ---------------------------------------------------------------------------
async function syncReviews(restaurants) {
  console.log("Step 2: Syncing reviews from Google Places API...\n");

  const results = {
    success: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  for (const restaurant of restaurants) {
    const mall = restaurant.shopping_malls?.name || "Unknown";
    const label = `${restaurant.name} @ ${mall}`;

    if (!restaurant.google_place_id) {
      console.log(`  SKIP: ${label} - no google_place_id`);
      results.skipped++;
      results.details.push({
        name: label,
        status: "skipped",
        reason: "no place_id",
      });
      continue;
    }

    try {
      console.log(`  SYNC: ${label} (${restaurant.google_place_id})`);

      await sleep(RATE_LIMIT_MS);
      const placeData = await fetchPlaceReviews(restaurant.google_place_id);

      console.log(
        `    API returned: rating=${placeData.rating}, reviews=${placeData.reviews.length}`,
      );

      if (placeData.reviews.length > 0) {
        const first = placeData.reviews[0];
        console.log(
          `    First review: "${first.content.substring(0, 80)}..." by ${first.author} (${first.rating} stars)`,
        );
      }

      // Merge reviews into existing google_data
      const existingGoogleData = restaurant.google_data || {};
      const updatedGoogleData = {
        ...existingGoogleData,
        reviews: placeData.reviews,
      };

      const { error: updateError } = await supabase
        .from("mall_restaurants")
        .update({
          google_data: updatedGoogleData,
          rating: placeData.rating,
          review_count: placeData.reviewCount,
          last_google_sync_at: new Date().toISOString(),
          last_verified_at: new Date().toISOString(),
        })
        .eq("id", restaurant.id);

      if (updateError) {
        console.log(`    ERROR updating: ${updateError.message}`);
        results.failed++;
        results.details.push({
          name: label,
          status: "failed",
          error: updateError.message,
        });
      } else {
        console.log(
          `    Updated google_data: ${placeData.reviews.length} reviews saved`,
        );
        results.success++;
        results.details.push({
          name: label,
          status: "success",
          reviews: placeData.reviews.length,
          rating: placeData.rating,
        });
      }
    } catch (error) {
      console.log(`    ERROR: ${error.message}`);
      results.failed++;
      results.details.push({
        name: label,
        status: "failed",
        error: error.message,
      });
    }

    console.log();
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("==============================================");
  console.log("  Four Leaves Reviews Sync (google_data)");
  console.log("==============================================\n");

  // Step 1: Find entries
  const restaurants = await findFourLeaves();
  if (restaurants.length === 0) {
    console.log("No Four Leaves entries found!");
    process.exit(0);
  }

  // Step 2: Sync reviews
  const results = await syncReviews(restaurants);

  // Summary
  console.log("==============================================");
  console.log("  Sync Summary");
  console.log("==============================================");
  console.log(`  Total entries: ${restaurants.length}`);
  console.log(`  Synced:        ${results.success}`);
  console.log(`  Skipped:       ${results.skipped}`);
  console.log(`  Failed:        ${results.failed}`);
  console.log();

  if (results.success > 0) {
    console.log("  Reviews synced for:");
    results.details
      .filter((d) => d.status === "success")
      .forEach((d) => {
        console.log(
          `    - ${d.name}: ${d.reviews} reviews (rating: ${d.rating})`,
        );
      });
  }

  if (results.failed > 0) {
    console.log("\n  Failures:");
    results.details
      .filter((d) => d.status === "failed")
      .forEach((d) => {
        console.log(`    - ${d.name}: ${d.error}`);
      });
  }

  console.log("\nDone!");
}

main().catch(console.error);
