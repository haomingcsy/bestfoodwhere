#!/usr/bin/env node

/**
 * fix-enrichment-flags.mjs
 *
 * Recalculates and updates the enrichment metadata flags on every row
 * in `brand_menus` based on the actual data present in related tables
 * (menu_items, brand_reviews, brand_locations) and its own columns.
 *
 * Usage:  node scripts/fix-enrichment-flags.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// 1. Read environment
// ---------------------------------------------------------------------------
const envPath = resolve(new URL('.', import.meta.url).pathname, '..', '.env.local');
const envFile = readFileSync(envPath, 'utf-8');

function envVar(name) {
  const match = envFile.match(new RegExp(`^${name}=["']?(.+?)["']?$`, 'm'));
  if (!match) throw new Error(`Missing ${name} in .env.local`);
  return match[1];
}

const SUPABASE_URL = envVar('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_ROLE_KEY = envVar('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// 2. Helpers
// ---------------------------------------------------------------------------
const BATCH_SIZE = 50;

function computeEnrichmentScore({ hasDescription, hasMenuItems, hasPrices, hasImages, hasReviews, hasAmenities }) {
  let score = 0;
  if (hasDescription) score += 0.25;
  if (hasMenuItems)   score += 0.25;
  if (hasPrices)      score += 0.15;
  if (hasImages)      score += 0.15;
  if (hasReviews)     score += 0.10;
  if (hasAmenities)   score += 0.10;
  return Math.round(score * 100) / 100; // avoid floating-point drift
}

function computeEnrichmentStatus({ hasDescription, hasMenuItems, hasReviews }) {
  if (hasDescription && hasMenuItems && hasReviews) return 'complete';
  if (hasDescription || hasMenuItems)               return 'partial';
  return 'pending';
}

// ---------------------------------------------------------------------------
// 3. Fetch all brands
// ---------------------------------------------------------------------------
async function fetchAllBrands() {
  const brands = [];
  let from = 0;
  const PAGE = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('brand_menus')
      .select('id, slug, description, ai_description, amenities, ai_amenities')
      .range(from, from + PAGE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    brands.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  return brands;
}

// ---------------------------------------------------------------------------
// 4. Gather per-brand stats in bulk using RPC / aggregated queries
// ---------------------------------------------------------------------------

/** Returns Map<brand_menu_id, { itemCount, hasPrices, hasImages }> */
async function fetchMenuItemStats(brandIds) {
  // We'll query menu_items directly with brand_menu_id (there's a direct FK)
  const stats = new Map();
  brandIds.forEach((id) => stats.set(id, { itemCount: 0, hasPrices: false, hasImages: false }));

  // Paginate through all menu items for these brands
  let from = 0;
  const PAGE = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('menu_items')
      .select('brand_menu_id, price, original_image_url, cdn_image_url')
      .in('brand_menu_id', brandIds)
      .range(from, from + PAGE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      const s = stats.get(row.brand_menu_id);
      if (!s) continue;
      s.itemCount++;
      if (row.price && row.price.trim() !== '') s.hasPrices = true;
      if ((row.original_image_url && row.original_image_url.trim() !== '') ||
          (row.cdn_image_url && row.cdn_image_url.trim() !== '')) {
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
      .from('brand_reviews')
      .select('brand_menu_id')
      .in('brand_menu_id', brandIds)
      .range(from, from + PAGE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      counts.set(row.brand_menu_id, (counts.get(row.brand_menu_id) || 0) + 1);
    }

    if (data.length < PAGE) break;
    from += PAGE;
  }

  return counts;
}

/** Returns Map<brand_menu_id, locationCount> */
async function fetchLocationCounts(brandIds) {
  const counts = new Map();
  brandIds.forEach((id) => counts.set(id, 0));

  let from = 0;
  const PAGE = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('brand_locations')
      .select('brand_menu_id')
      .in('brand_menu_id', brandIds)
      .range(from, from + PAGE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      counts.set(row.brand_menu_id, (counts.get(row.brand_menu_id) || 0) + 1);
    }

    if (data.length < PAGE) break;
    from += PAGE;
  }

  return counts;
}

// ---------------------------------------------------------------------------
// 5. Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== fix-enrichment-flags ===');
  console.log(`Supabase URL: ${SUPABASE_URL}\n`);

  // Fetch all brands
  const brands = await fetchAllBrands();
  console.log(`Found ${brands.length} brands in brand_menus.\n`);

  if (brands.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  // Summary accumulators
  let updatedCount = 0;
  const statusDist = { pending: 0, partial: 0, complete: 0 };
  let totalScore = 0;

  // Process in batches
  for (let i = 0; i < brands.length; i += BATCH_SIZE) {
    const batch = brands.slice(i, i + BATCH_SIZE);
    const batchIds = batch.map((b) => b.id);

    // Fetch related data in parallel
    const [menuStats, reviewCounts, locationCounts] = await Promise.all([
      fetchMenuItemStats(batchIds),
      fetchReviewCounts(batchIds),
      fetchLocationCounts(batchIds),
    ]);

    // Build updates
    const updates = [];

    for (const brand of batch) {
      const ms = menuStats.get(brand.id) || { itemCount: 0, hasPrices: false, hasImages: false };
      const reviewCount = reviewCounts.get(brand.id) || 0;
      const locationCount = locationCounts.get(brand.id) || 0;

      const hasDescription = Boolean(
        (brand.description && brand.description.trim() !== '') ||
        (brand.ai_description && brand.ai_description.trim() !== '')
      );

      const hasAmenities = Boolean(
        (brand.amenities && Array.isArray(brand.amenities) && brand.amenities.length > 0) ||
        (brand.ai_amenities && Array.isArray(brand.ai_amenities) && brand.ai_amenities.length > 0)
      );

      const hasMenuItems = ms.itemCount > 0;
      const hasPrices = ms.hasPrices;
      const hasImages = ms.hasImages;
      const hasReviews = reviewCount > 0;

      const enrichment_score = computeEnrichmentScore({
        hasDescription, hasMenuItems, hasPrices, hasImages, hasReviews, hasAmenities,
      });

      const enrichment_status = computeEnrichmentStatus({
        hasDescription, hasMenuItems, hasReviews,
      });

      updates.push({
        id: brand.id,
        menu_item_count: ms.itemCount,
        has_prices: hasPrices,
        has_images: hasImages,
        enrichment_status,
        enrichment_score,
      });

      statusDist[enrichment_status]++;
      totalScore += enrichment_score;
    }

    // Upsert in one call per brand (supabase-js upsert requires PK)
    for (const upd of updates) {
      const { error } = await supabase
        .from('brand_menus')
        .update({
          menu_item_count: upd.menu_item_count,
          has_prices: upd.has_prices,
          has_images: upd.has_images,
          enrichment_status: upd.enrichment_status,
          enrichment_score: upd.enrichment_score,
        })
        .eq('id', upd.id);

      if (error) {
        console.error(`  ERROR updating brand ${upd.id}:`, error.message);
      } else {
        updatedCount++;
      }
    }

    // Progress log every batch
    const processed = Math.min(i + BATCH_SIZE, brands.length);
    if (processed % BATCH_SIZE === 0 || processed === brands.length) {
      console.log(`  Processed ${processed} / ${brands.length} brands...`);
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Summary
  // ---------------------------------------------------------------------------
  const avgScore = brands.length > 0 ? (totalScore / brands.length).toFixed(4) : '0.0000';

  console.log('\n========== SUMMARY ==========');
  console.log(`Total brands:       ${brands.length}`);
  console.log(`Successfully updated: ${updatedCount}`);
  console.log(`Failed updates:     ${brands.length - updatedCount}`);
  console.log('');
  console.log('Enrichment status distribution:');
  console.log(`  pending:  ${statusDist.pending}`);
  console.log(`  partial:  ${statusDist.partial}`);
  console.log(`  complete: ${statusDist.complete}`);
  console.log('');
  console.log(`Average enrichment score: ${avgScore}`);
  console.log('=============================\n');
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
