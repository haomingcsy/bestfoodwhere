# BestFoodWhere.sg - Task Tracker

> Last Updated: 2026-02-28 (post gap-fill)

## Current Phase: Menu Data Gap Fill

Goal: Ensure all 730 brands have menu data, descriptions, and images.

---

## Completed

- [x] Switch data source from Google Sheets to Supabase (`MENU_DATA_SOURCE=supabase`)
- [x] Fix Vercel env var (had trailing `\n` causing fallback to Google Sheets)
- [x] Deploy to production (bestfoodwhere.sg) with Supabase mode
- [x] Fix UX: "More bakeries" -> "More restaurants" in MenuPageTemplate
- [x] Fix UX: Remove sheet references from DescriptionSection and AmenitiesGrid
- [x] Fix supabase-menu.ts: Add `ai_amenities` to SELECT query and fallback logic
- [x] AI enrichment: 100% of 775 brands have ai_description, ai_amenities, ai_recommendations
- [x] Reviews synced from Google Places for all brands (3,952 reviews)
- [x] Bootstrap brands from mall_restaurants (775 brands, 1,056 locations)
- [x] V2 AI descriptions: 770/775 brands regenerated with unique openers, banned phrase filter
- [x] Website scraper initial run: 602 completed, 31,529 menu items scraped
- [x] Sync 5 brands from Google Sheets to Supabase menu_items (01-sync-sheets-menu.ts)
- [x] Hero images cached: 837/837 restaurant hero images in Supabase Storage
- [x] Real amenities synced: 840/840 restaurants from Google Places API
- [x] Website scraper re-run: 37 brands processed (23 skipped, 13 failed HTTP 0)
- [x] Menu item image caching: 22,543/22,848 (98.7%) — 383.6 MB in Supabase Storage
- [x] Nutrition generation: 514/514 brands (100%) — 0 failures, ~$4.24 Haiku cost
- [x] Fixed GIF upload: Supabase bucket now allows image/gif, octet-stream. 404/536 items cached.
- [x] Image coverage at 72.4% (23,331/32,237 items with CDN images)
- [x] Re-bootstrapped 200 missing brands from mall_restaurants (730 total brands now)
- [x] Website scraper: 170 new brands processed, 1,532 new menu items
- [x] AI enrichment: 200 new descriptions generated (726/730 total)
- [x] Hero images synced for 200 new brands (658/730 total)
- [x] Reviews synced: 4,023 total from Google Places
- [x] Logos synced: 134 new brand logos
- [x] Fixed 03-scrape-delivery-apps.ts column name bug
- [x] GrabFood scraper: 22 brands found (1,314 items) — many chains not on platform
- [x] Deliveroo scraper: 4 brands found (303 items)
- [x] Fixed save failures for 108-matcha-saro, 328-katong-laksa, 4fingers-crispy-chicken
- [x] Investigated GrabFood matching failures — algorithm correct, brands genuinely not on platform
- [x] Identified 10 donor→target brand pairs for same-chain menu copying
- [x] Copied menus from donor brands: 10 brands, 577 items total
- [x] Playwright website scraper: 18 remaining brands attempted, 0 menus found (MBS sites blocked)
- [x] Categorized remaining 100 zero-menu brands (6 MBS fine dining, 10 chains, 84 other)
- [x] Garbage cleanup V1: 17 brands reset, 207 nav/footer items deleted
- [x] Garbage cleanup V2: 79 brands reset, 609 garbage items deleted
- [x] Garbage cleanup V3: 7 brands reset, 793 garbage items deleted (KOMA 471, LAVO 291, etc.)
- [x] Total garbage cleanup: 103 brands, 1,609 items removed
- [x] Verified live site: cleaned pages show empty menus; uncleaned pages still have real data
- [x] Donor menu V2: 14 donor chains → 41 target brands, 4,348 items copied
- [x] GrabFood scraper V2: 10 brands found (1,102 items) — Beard Papa's, Butahage, COLLIN'S x2
- [x] Deliveroo scraper V2: 4 brands found (335 items) — cleaned 1 false match (Bar Bar Q)
- [x] Cleaned false Deliveroo match: Bar Bar Q → Da Paolo (134 items removed)

## In Progress

- [ ] 158 brands have 0 menu items (down from 203)
  - 6 MBS fine dining (Waku Ghin, CUT, Wakuda, Mott 32, BSK, Yardbird) — websites blocked
  - Remaining are small/local brands not on delivery apps or with blocked websites
  - Automated scraping options exhausted; need manual curation or new data sources

## Up Next

- [ ] Google Custom Search API for missing menu item images (plan exists — needs API keys)
- [ ] Verify menu pages display correctly on live site for new brands

## Blocked

- Google Sheets API returns 403 from scripts (API key issue) — not critical since Supabase is primary
- MBS restaurant websites return HTTP2 protocol errors (all 11 MBS brands blocked)

---

## Key Decisions Made

- **Data source**: Supabase (not Google Sheets) - controlled by `MENU_DATA_SOURCE` env var
- **AI content**: Used for description, amenities, recommendations when manual data missing
- **Rollback plan**: Delete `MENU_DATA_SOURCE` env var in Vercel -> instant rollback to Sheets
- **Nutrition data**: Stored as JSON files in `data/nutrition/${slug}.json` — loaded at build time
- **Image pipeline**: original_image_url → download → Supabase Storage → cdn_image_url

## Data Quality Metrics (2026-02-28, final after gap fill)

| Metric | Count |
|--------|-------|
| Total brands | 730 |
| Brands with menu items | 572 (78.4%) |
| Brands with 0 items | 158 (21.6%) |
| Total menu items | 39,079 |
| Items with CDN images | 35,295 (90.3%) |
| Brands with AI description | 726 (99.5%) |
| Brands with hero image | 840 |
| Brands with reviews | 807 |
| Quality Score | 88% |

### Changes from 2026-02-28 gap fill session:
- Donor menu V2: 14 chains → 41 targets, +4,348 items
- GrabFood V2: +10 brands, +1,102 items (Beard Papa's, Butahage, COLLIN'S)
- Deliveroo V2: +4 brands, +335 items (1 false match cleaned)
- Coverage improved: 72.2% → 78.4% (+45 brands with menus, +4,725 items)

### Changes from 2026-02-28 garbage cleanup (all passes):
- V1: 17 brands, 207 items deleted (nav links, footers)
- V2: 79 brands, 609 items deleted (promo text, corporate pages)
- V3: 7 brands, 793 items deleted (scrape fragments, UI text, no-price wine lists)
- Total: 103 brands reset, 1,609 garbage items removed
- Coverage dropped 86.3% → 72.2% but DATA QUALITY significantly improved
- Verified live site: cleaned pages show empty menus correctly (Vercel cache may be stale)

### Changes from 2026-02-28 session (earlier):
- GrabFood scraper: +22 brands, +1,314 items
- Deliveroo scraper: +4 brands, +303 items
- Donor menu copying: +10 brands, +577 items (same-chain pairs)
- Playwright website scraper: attempted 18 remaining brands, 0 menus (MBS blocked)
- Investigated GrabFood matching: algorithm correct, chains not on platform
- Coverage improved: 81% → 86.3% (+36 brands with menus, +2,194 items)

### Changes from earlier 2026-02-28 session:
- Re-bootstrapped 200 missing brands from mall_restaurants → brand_menus
- Website scraper: +1,532 menu items across ~65 newly scraped brands
- AI enrichment: 200 new descriptions ($0.18 cost)
- Synced 200 hero images, 4,023 reviews, 134 logos
- Fixed 03-scrape-delivery-apps.ts column name bug (brand_name → name)

## Recently Modified Files

- `scripts/_find-donors-v2.mjs` — NEW: Find donor matches for 203 zero-menu brands (14 chains, 41 targets)
- `scripts/_copy-donors-batch.mjs` — NEW: Batch copy menus from 14 donors to 41 targets
- `scripts/_cleanup-garbage-v3.mjs` — NEW: V3 cleanup (KOMA 471, LAVO 291, etc.)
- `scripts/_cleanup-garbage-v2.mjs` — Comprehensive garbage cleanup (79 brands)
- `scripts/_cleanup-garbage-menus.mjs` — First garbage cleanup pass (17 brands)
- `scripts/_check-rescrape.mjs` — NEW: Check re-scraped brands for data quality
- `scripts/_check-stats.mjs` — Quick DB stats checker
- `scripts/scrape-grabfood.mjs` — GrabFood delivery app scraper
- `scripts/scrape-deliveroo.mjs` — Deliveroo delivery app scraper

## Key Files

- `app/menu/[slug]/page.tsx` - Menu page route (line 25: USE_SUPABASE flag)
- `lib/supabase-menu.ts` - Supabase data fetcher
- `lib/google-sheets.ts` - Google Sheets data fetcher (fallback)
- `lib/restaurant-images.ts` - Image URL resolution (batchGetMenuImageUrls)
- `scripts/pipeline/` - Data population pipeline (00-bootstrap through 07-quality-audit)
- `scripts/cache-menu-images.mjs` - Menu item image CDN caching
- `scripts/generate-nutrition-batch.ts` - Nutrition data generation
- `components/templates/MenuPageTemplate.tsx` - Main menu page template
