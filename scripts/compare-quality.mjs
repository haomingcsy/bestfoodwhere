/**
 * compare-quality.mjs
 *
 * Compares data quality across scraped brands against Four Leaves (gold standard).
 * Checks brand_menus, menu_categories, menu_items, brand_locations, and brand_reviews.
 */

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// ---------- load env vars from .env.local ----------
const envPath = new URL('../.env.local', import.meta.url).pathname;
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  env[key] = val;
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ---------- brands to compare ----------
const BRANDS = [
  'four-leaves',
  'subway',
  'kfc',
  'a-roy-thai-restaurant',
  'koi-th',
  'canton-paradise-signature-plaza-singapura',
  'haidilao-hot-pot-vivocity',
];

// ---------- helpers ----------
function yn(val) {
  if (val === null || val === undefined || val === '') return 'NO';
  if (typeof val === 'string' && val.trim() === '') return 'NO';
  return 'yes';
}

function pad(s, w) {
  const str = String(s);
  return str.length >= w ? str.slice(0, w) : str + ' '.repeat(w - str.length);
}

// ---------- main ----------
async function main() {
  const results = {};

  for (const slug of BRANDS) {
    const data = { slug };

    // 1. Fetch from brand_menus
    const { data: brand, error: brandErr } = await supabase
      .from('brand_menus')
      .select('id, slug, name, description, ai_description, ai_amenities, ai_recommendations, website_url, hero_image_url, menu_source_type, menu_item_count, has_prices, has_images, enrichment_status, enrichment_score, confidence_score')
      .eq('slug', slug)
      .maybeSingle();

    if (brandErr) {
      console.error(`Error fetching brand_menus for ${slug}:`, brandErr.message);
      data.found = false;
      results[slug] = data;
      continue;
    }

    if (!brand) {
      console.warn(`Brand not found in brand_menus: ${slug}`);
      data.found = false;
      results[slug] = data;
      continue;
    }

    data.found = true;
    data.brand_menu_id = brand.id;
    data.name = brand.name || '';
    data.description = yn(brand.description);
    data.ai_description = yn(brand.ai_description);
    data.ai_amenities = yn(brand.ai_amenities);
    data.ai_recommendations = yn(brand.ai_recommendations);
    data.website_url = yn(brand.website_url);
    data.hero_image_url = yn(brand.hero_image_url);
    data.menu_item_count = brand.menu_item_count ?? 0;
    data.menu_source_type = brand.menu_source_type || '(none)';
    data.has_prices = brand.has_prices ? 'yes' : 'NO';
    data.has_images = brand.has_images ? 'yes' : 'NO';
    data.enrichment_status = brand.enrichment_status || '(none)';
    data.enrichment_score = brand.enrichment_score ?? 0;
    data.confidence_score = brand.confidence_score ?? 0;

    const brandMenuId = brand.id;

    // 2. Fetch menu_categories count + names (keyed by brand_menu_id)
    const { data: cats, error: catErr } = await supabase
      .from('menu_categories')
      .select('id, name')
      .eq('brand_menu_id', brandMenuId);

    if (catErr) {
      console.error(`Error fetching menu_categories for ${slug}:`, catErr.message);
    }

    data.category_count = cats ? cats.length : 0;
    data.category_names = cats ? cats.map(c => c.name).join(', ') : '';

    // 3. Fetch menu_items stats (keyed by brand_menu_id; image columns: original_image_url, cdn_image_url)
    const { data: items, error: itemErr } = await supabase
      .from('menu_items')
      .select('id, price, price_numeric, description, original_image_url, cdn_image_url')
      .eq('brand_menu_id', brandMenuId);

    if (itemErr) {
      console.error(`Error fetching menu_items for ${slug}:`, itemErr.message);
    }

    const allItems = items || [];
    data.items_total = allItems.length;
    data.items_with_price = allItems.filter(i => {
      const p = i.price_numeric ?? i.price;
      return p !== null && p !== undefined && Number(p) > 0;
    }).length;
    data.items_with_desc = allItems.filter(i => i.description && i.description.trim() !== '').length;
    data.items_with_image = allItems.filter(i =>
      (i.original_image_url && i.original_image_url.trim() !== '') ||
      (i.cdn_image_url && i.cdn_image_url.trim() !== '')
    ).length;

    // Percentages
    const total = data.items_total || 1;
    data.pct_price = Math.round((data.items_with_price / total) * 100);
    data.pct_desc = Math.round((data.items_with_desc / total) * 100);
    data.pct_image = Math.round((data.items_with_image / total) * 100);

    // 4. Fetch brand_locations count (by brand_menu_id)
    const { count: locCount, error: locErr } = await supabase
      .from('brand_locations')
      .select('id', { count: 'exact', head: true })
      .eq('brand_menu_id', brandMenuId);

    if (locErr) {
      console.error(`Error fetching brand_locations for ${slug}:`, locErr.message);
    }
    data.location_count = locCount ?? 0;

    // 5. Fetch brand_reviews count (by brand_menu_id)
    const { count: revCount, error: revErr } = await supabase
      .from('brand_reviews')
      .select('id', { count: 'exact', head: true })
      .eq('brand_menu_id', brandMenuId);

    if (revErr) {
      console.error(`Error fetching brand_reviews for ${slug}:`, revErr.message);
    }
    data.review_count = revCount ?? 0;

    results[slug] = data;
  }

  // ---------- Print comparison table ----------
  const gold = results['four-leaves'];

  console.log('\n' + '='.repeat(141));
  console.log('  DATA QUALITY COMPARISON -- Four Leaves (gold standard) vs Scraped Brands');
  console.log('='.repeat(141));

  const colWidth = 17;
  const labelWidth = 22;

  const shortNames = {
    'four-leaves': 'FourLeaves*',
    'subway': 'Subway',
    'kfc': 'KFC',
    'a-roy-thai-restaurant': 'ARoyThai',
    'koi-th': 'KOI',
    'canton-paradise-signature-plaza-singapura': 'CantonPara',
    'haidilao-hot-pot-vivocity': 'Haidilao',
  };

  // Print header
  let header = pad('Field', labelWidth);
  for (const slug of BRANDS) {
    header += pad(shortNames[slug], colWidth);
  }
  console.log('');
  console.log(header);
  console.log('-'.repeat(labelWidth + colWidth * BRANDS.length));

  // Row definitions
  const rows = [
    { label: 'Found in DB', key: 'found', fmt: v => v ? 'yes' : 'NO' },
    { label: 'description', key: 'description' },
    { label: 'ai_description', key: 'ai_description' },
    { label: 'ai_amenities', key: 'ai_amenities' },
    { label: 'ai_recommendations', key: 'ai_recommendations' },
    { label: 'website_url', key: 'website_url' },
    { label: 'hero_image_url', key: 'hero_image_url' },
    { label: 'menu_source_type', key: 'menu_source_type' },
    { label: 'menu_item_count', key: 'menu_item_count', numeric: true },
    { label: 'has_prices (flag)', key: 'has_prices' },
    { label: 'has_images (flag)', key: 'has_images' },
    { label: 'enrichment_status', key: 'enrichment_status' },
    { label: 'enrichment_score', key: 'enrichment_score', numeric: true },
    { label: 'confidence_score', key: 'confidence_score', numeric: true },
    null, // separator
    { label: 'Categories', key: 'category_count', numeric: true },
    { label: 'Items (total)', key: 'items_total', numeric: true },
    { label: 'Items w/ price', key: 'items_with_price', numeric: true },
    { label: '  % w/ price', key: 'pct_price', numeric: true, suffix: '%' },
    { label: 'Items w/ desc', key: 'items_with_desc', numeric: true },
    { label: '  % w/ desc', key: 'pct_desc', numeric: true, suffix: '%' },
    { label: 'Items w/ image', key: 'items_with_image', numeric: true },
    { label: '  % w/ image', key: 'pct_image', numeric: true, suffix: '%' },
    null, // separator
    { label: 'Locations', key: 'location_count', numeric: true },
    { label: 'Reviews', key: 'review_count', numeric: true },
  ];

  for (const row of rows) {
    if (row === null) {
      console.log(pad('', labelWidth) + '-'.repeat(colWidth * BRANDS.length));
      continue;
    }

    let line = pad(row.label, labelWidth);
    for (const slug of BRANDS) {
      const d = results[slug];
      if (!d || !d.found) {
        line += pad('N/A', colWidth);
        continue;
      }
      let val = d[row.key];
      if (val === undefined) val = '-';
      if (row.fmt) val = row.fmt(val);
      let cell = String(val) + (row.suffix || '');

      // Highlight gaps vs gold standard
      if (gold && gold.found && slug !== 'four-leaves') {
        const goldVal = row.fmt ? row.fmt(gold[row.key]) : gold[row.key];
        if (row.numeric) {
          if (Number(goldVal) > 0 && (Number(val) === 0 || val === '-')) {
            cell += ' [GAP]';
          }
        } else {
          const gStr = String(goldVal);
          const bStr = String(val);
          if (gStr === 'yes' && bStr === 'NO') {
            cell += ' [GAP]';
          }
        }
      }

      line += pad(cell, colWidth);
    }
    console.log(line);
  }

  // Print category names separately (truncated for readability)
  console.log('\n' + '-'.repeat(141));
  console.log('  CATEGORY NAMES PER BRAND (first 10)');
  console.log('-'.repeat(141));
  for (const slug of BRANDS) {
    const d = results[slug];
    if (!d || !d.found) {
      console.log(`  ${shortNames[slug]}: N/A`);
      continue;
    }
    const allNames = d.category_names || '(none)';
    const nameArr = allNames.split(', ');
    const display = nameArr.length > 10
      ? nameArr.slice(0, 10).join(', ') + ` ... (+${nameArr.length - 10} more)`
      : allNames;
    console.log(`  ${shortNames[slug]} (${d.category_count}): ${display}`);
  }

  // Summary
  console.log('\n' + '='.repeat(141));
  console.log('  GAP SUMMARY (fields where gold standard has data but brand does not)');
  console.log('='.repeat(141));

  let totalGaps = 0;
  for (const slug of BRANDS) {
    if (slug === 'four-leaves') continue;
    const d = results[slug];
    if (!d || !d.found) {
      console.log(`  ${shortNames[slug]}: NOT FOUND in brand_menus`);
      totalGaps++;
      continue;
    }

    const gaps = [];
    for (const row of rows) {
      if (row === null) continue;
      if (row.key === 'found') continue;
      if (!gold || !gold.found) continue;
      const goldVal = row.fmt ? row.fmt(gold[row.key]) : gold[row.key];
      const brandVal = row.fmt ? row.fmt(d[row.key]) : d[row.key];

      if (row.numeric) {
        if (Number(goldVal) > 0 && (Number(brandVal) === 0 || brandVal === undefined || brandVal === '-')) {
          gaps.push(row.label.trim());
        }
      } else {
        if (String(goldVal) === 'yes' && String(brandVal) === 'NO') {
          gaps.push(row.label.trim());
        }
      }
    }

    if (gaps.length === 0) {
      console.log(`  ${shortNames[slug]}: No gaps vs Four Leaves -- all fields populated`);
    } else {
      console.log(`  ${shortNames[slug]}: ${gaps.length} gap(s) -- ${gaps.join(', ')}`);
      totalGaps += gaps.length;
    }
  }

  console.log(`\n  Total gaps across all brands: ${totalGaps}`);
  console.log('  * FourLeaves = gold standard (manually enriched)\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
