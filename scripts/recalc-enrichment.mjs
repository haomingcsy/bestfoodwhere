#!/usr/bin/env node

/**
 * recalc-enrichment.mjs
 *
 * Recalculates enrichment_score and enrichment_status for ALL brands in
 * brand_menus based on their actual data across related tables.
 *
 * Scoring weights (total = 1.00):
 *   - has name                           0.05
 *   - has description OR ai_description  0.10
 *   - has cuisine (via mall_restaurants) 0.05
 *   - has website_url                    0.05
 *   - has hero_image_url                 0.05
 *   - has ai_amenities                   0.10
 *   - has ai_recommendations             0.10
 *   - has menu items > 0                 0.20
 *   - has menu items with prices         0.10
 *   - has menu items with images         0.10
 *   - has locations > 0                  0.05
 *   - has reviews > 0                    0.05
 *
 * Status thresholds:
 *   - "complete" if score >= 0.75
 *   - "partial"  if score >= 0.40
 *   - "minimal"  if score <  0.40
 *
 * Usage:  node scripts/recalc-enrichment.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// ---------------------------------------------------------------------------
// 1. Read environment
// ---------------------------------------------------------------------------
const envPath = resolve(
  new URL(".", import.meta.url).pathname,
  "..",
  ".env.local"
);
const envFile = readFileSync(envPath, "utf-8");

function envVar(name) {
  const match = envFile.match(new RegExp(`^${name}=["']?(.+?)["']?$`, "m"));
  if (!match) throw new Error(`Missing ${name} in .env.local`);
  return match[1];
}

const SUPABASE_URL = envVar("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE_ROLE_KEY = envVar("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// 2. Scoring logic
// ---------------------------------------------------------------------------
const BATCH_SIZE = 50;

function computeEnrichmentScore({
  hasName,
  hasDescription,
  hasCuisine,
  hasWebsiteUrl,
  hasHeroImageUrl,
  hasAiAmenities,
  hasAiRecommendations,
  hasMenuItems,
  hasMenuPrices,
  hasMenuImages,
  hasLocations,
  hasReviews,
}) {
  let score = 0;
  if (hasName) score += 0.05;
  if (hasDescription) score += 0.10;
  if (hasCuisine) score += 0.05;
  if (hasWebsiteUrl) score += 0.05;
  if (hasHeroImageUrl) score += 0.05;
  if (hasAiAmenities) score += 0.10;
  if (hasAiRecommendations) score += 0.10;
  if (hasMenuItems) score += 0.20;
  if (hasMenuPrices) score += 0.10;
  if (hasMenuImages) score += 0.10;
  if (hasLocations) score += 0.05;
  if (hasReviews) score += 0.05;
  return Math.round(score * 100) / 100; // avoid floating-point drift
}

function computeEnrichmentStatus(score) {
  if (score >= 0.75) return "complete";
  if (score >= 0.40) return "partial";
  return "minimal";
}

// ---------------------------------------------------------------------------
// 3. Fetch helpers (paginated)
// ---------------------------------------------------------------------------

async function fetchAllBrands() {
  const brands = [];
  let from = 0;
  const PAGE = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("brand_menus")
      .select(
        "id, slug, name, description, ai_description, website_url, hero_image_url, ai_amenities, ai_recommendations, enrichment_status, enrichment_score"
      )
      .range(from, from + PAGE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    brands.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return brands;
}

/** Returns Map<brand_menu_id, { itemCount, hasPrices, hasImages }> */
async function fetchMenuItemStats(brandIds) {
  const stats = new Map();
  brandIds.forEach((id) =>
    stats.set(id, { itemCount: 0, hasPrices: false, hasImages: false })
  );

  let from = 0;
  const PAGE = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("menu_items")
      .select("brand_menu_id, price, original_image_url, cdn_image_url")
      .in("brand_menu_id", brandIds)
      .range(from, from + PAGE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      const s = stats.get(row.brand_menu_id);
      if (!s) continue;
      s.itemCount++;
      if (row.price && row.price.toString().trim() !== "") s.hasPrices = true;
      if (
        (row.original_image_url && row.original_image_url.trim() !== "") ||
        (row.cdn_image_url && row.cdn_image_url.trim() !== "")
      ) {
        s.hasImages = true;
      }
    }

    if (data.length < PAGE) break;
    from += PAGE;
  }
  return stats;
}

/** Returns Map<brand_menu_id, reviewCount> */
async function fetchReviewCounts(brandIds) {
  const counts = new Map();
  brandIds.forEach((id) => counts.set(id, 0));

  let from = 0;
  const PAGE = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("brand_reviews")
      .select("brand_menu_id")
      .in("brand_menu_id", brandIds)
      .range(from, from + PAGE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      counts.set(
        row.brand_menu_id,
        (counts.get(row.brand_menu_id) || 0) + 1
      );
    }

    if (data.length < PAGE) break;
    from += PAGE;
  }
  return counts;
}

/**
 * Returns Map<brand_menu_id, { locationCount, hasCuisine }>
 * We join brand_locations -> mall_restaurants to check cuisines.
 */
async function fetchLocationData(brandIds) {
  const result = new Map();
  brandIds.forEach((id) =>
    result.set(id, { locationCount: 0, hasCuisine: false })
  );

  let from = 0;
  const PAGE = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("brand_locations")
      .select("brand_menu_id, mall_restaurants(cuisines)")
      .in("brand_menu_id", brandIds)
      .range(from, from + PAGE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      const r = result.get(row.brand_menu_id);
      if (!r) continue;
      r.locationCount++;
      // mall_restaurants can be null (if mall_restaurant_id is null) or an object
      const mr = row.mall_restaurants;
      if (
        mr &&
        mr.cuisines &&
        Array.isArray(mr.cuisines) &&
        mr.cuisines.length > 0
      ) {
        r.hasCuisine = true;
      }
    }

    if (data.length < PAGE) break;
    from += PAGE;
  }
  return result;
}

// ---------------------------------------------------------------------------
// 4. Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("=== recalc-enrichment ===");
  console.log(`Supabase: ${SUPABASE_URL}\n`);

  const brands = await fetchAllBrands();
  console.log(`Found ${brands.length} brands in brand_menus.\n`);

  if (brands.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  // Track transitions for summary
  const transitions = {}; // "old -> new" => count
  const newStatusDist = { minimal: 0, partial: 0, complete: 0 };
  const oldStatusDist = {};
  let totalOldScore = 0;
  let totalNewScore = 0;
  let changedCount = 0;

  // Process in batches
  for (let i = 0; i < brands.length; i += BATCH_SIZE) {
    const batch = brands.slice(i, i + BATCH_SIZE);
    const batchIds = batch.map((b) => b.id);

    // Fetch related data in parallel
    const [menuStats, reviewCounts, locationData] = await Promise.all([
      fetchMenuItemStats(batchIds),
      fetchReviewCounts(batchIds),
      fetchLocationData(batchIds),
    ]);

    const updates = [];

    for (const brand of batch) {
      const ms = menuStats.get(brand.id) || {
        itemCount: 0,
        hasPrices: false,
        hasImages: false,
      };
      const reviewCount = reviewCounts.get(brand.id) || 0;
      const ld = locationData.get(brand.id) || {
        locationCount: 0,
        hasCuisine: false,
      };

      const hasName = Boolean(brand.name && brand.name.trim() !== "");

      const hasDescription = Boolean(
        (brand.description && brand.description.trim() !== "") ||
          (brand.ai_description && brand.ai_description.trim() !== "")
      );

      const hasCuisine = ld.hasCuisine;

      const hasWebsiteUrl = Boolean(
        brand.website_url && brand.website_url.trim() !== ""
      );

      const hasHeroImageUrl = Boolean(
        brand.hero_image_url && brand.hero_image_url.trim() !== ""
      );

      const hasAiAmenities = Boolean(
        brand.ai_amenities &&
          Array.isArray(brand.ai_amenities) &&
          brand.ai_amenities.length > 0
      );

      const hasAiRecommendations = Boolean(
        brand.ai_recommendations &&
          Array.isArray(brand.ai_recommendations) &&
          brand.ai_recommendations.length > 0
      );

      const hasMenuItems = ms.itemCount > 0;
      const hasMenuPrices = ms.hasPrices;
      const hasMenuImages = ms.hasImages;
      const hasLocations = ld.locationCount > 0;
      const hasReviews = reviewCount > 0;

      const newScore = computeEnrichmentScore({
        hasName,
        hasDescription,
        hasCuisine,
        hasWebsiteUrl,
        hasHeroImageUrl,
        hasAiAmenities,
        hasAiRecommendations,
        hasMenuItems,
        hasMenuPrices,
        hasMenuImages,
        hasLocations,
        hasReviews,
      });

      const newStatus = computeEnrichmentStatus(newScore);

      // Track old values
      const oldStatus = brand.enrichment_status || "pending";
      const oldScore = parseFloat(brand.enrichment_score) || 0;

      oldStatusDist[oldStatus] = (oldStatusDist[oldStatus] || 0) + 1;
      totalOldScore += oldScore;
      totalNewScore += newScore;
      newStatusDist[newStatus]++;

      if (oldStatus !== newStatus || Math.abs(oldScore - newScore) > 0.001) {
        changedCount++;
      }

      const transKey = `${oldStatus} -> ${newStatus}`;
      transitions[transKey] = (transitions[transKey] || 0) + 1;

      updates.push({
        id: brand.id,
        enrichment_score: newScore,
        enrichment_status: newStatus,
        menu_item_count: ms.itemCount,
        has_prices: hasMenuPrices,
        has_images: hasMenuImages,
      });
    }

    // Write updates
    for (const upd of updates) {
      const { error } = await supabase
        .from("brand_menus")
        .update({
          enrichment_score: upd.enrichment_score,
          enrichment_status: upd.enrichment_status,
          menu_item_count: upd.menu_item_count,
          has_prices: upd.has_prices,
          has_images: upd.has_images,
        })
        .eq("id", upd.id);

      if (error) {
        console.error(`  ERROR updating ${upd.id}: ${error.message}`);
      }
    }

    const processed = Math.min(i + BATCH_SIZE, brands.length);
    process.stdout.write(
      `\r  Processed ${processed}/${brands.length} brands...`
    );
  }

  console.log("\n");

  // ---------------------------------------------------------------------------
  // 5. Summary
  // ---------------------------------------------------------------------------
  console.log("========================================");
  console.log("           SUMMARY");
  console.log("========================================\n");

  console.log("Old status distribution:");
  for (const [status, count] of Object.entries(oldStatusDist).sort()) {
    console.log(`  ${status.padEnd(12)} ${count}`);
  }

  console.log("\nNew status distribution:");
  for (const [status, count] of Object.entries(newStatusDist).sort()) {
    console.log(`  ${status.padEnd(12)} ${count}`);
  }

  console.log("\nTransitions:");
  for (const [transition, count] of Object.entries(transitions).sort()) {
    console.log(`  ${transition.padEnd(28)} ${count}`);
  }

  console.log(
    `\nAvg old score: ${(totalOldScore / brands.length).toFixed(3)}`
  );
  console.log(
    `Avg new score: ${(totalNewScore / brands.length).toFixed(3)}`
  );
  console.log(`Brands changed: ${changedCount} / ${brands.length}`);
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
