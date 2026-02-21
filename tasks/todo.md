# BestFoodWhere.sg - Task Tracker

> Last Updated: 2026-02-21

## Current Phase: Final Data Population & Image Caching

Goal: All 775+ restaurant menu pages fully populated with factual data, served from Supabase.

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

## In Progress

- [ ] Verify site displays properly after all data populated
- [ ] Commit all current changes to git

## Up Next

- [ ] Verify site displays properly after all data populated
- [ ] Commit all current changes to git
- [ ] Move bestfoodwhere.sg domain from old `bfw` Vercel project to `bestfoodwhere` project

## Blocked

- None currently

---

## Key Decisions Made

- **Data source**: Supabase (not Google Sheets) - controlled by `MENU_DATA_SOURCE` env var
- **AI content**: Used for description, amenities, recommendations when manual data missing
- **Rollback plan**: Delete `MENU_DATA_SOURCE` env var in Vercel -> instant rollback to Sheets
- **Nutrition data**: Stored as JSON files in `data/nutrition/${slug}.json` — loaded at build time
- **Image pipeline**: original_image_url → download → Supabase Storage → cdn_image_url

## Data Quality Metrics (2026-02-21)

| Metric | Count |
|--------|-------|
| Total brands | 775 |
| Brands with menu items | 617 (80%) |
| Brands with 0 items | 158 (20%) |
| Total menu items | 31,529 |
| Items with images | 22,987 (72.9%) |
| Items with prices | 29,002 (92%) |
| Items with CDN images | 22,543 (98.7%) — DONE |
| Nutrition JSON files | 514 of 514 (100%) — DONE |
| Total reviews | 3,952 |
| AI enrichment coverage | 100% |

## Recently Modified Files

- `scripts/cache-menu-images.mjs` — NEW: Menu item image CDN caching script
- `scripts/pipeline/01-sync-sheets-menu.ts` — NEW: Google Sheets → Supabase menu sync
- `scripts/_check-state.mjs` — NEW: Menu data state diagnostics
- `scripts/_check-images.mjs` — NEW: Image coverage diagnostics

## Key Files

- `app/menu/[slug]/page.tsx` - Menu page route (line 25: USE_SUPABASE flag)
- `lib/supabase-menu.ts` - Supabase data fetcher
- `lib/google-sheets.ts` - Google Sheets data fetcher (fallback)
- `lib/restaurant-images.ts` - Image URL resolution (batchGetMenuImageUrls)
- `scripts/pipeline/` - Data population pipeline (00-bootstrap through 07-quality-audit)
- `scripts/cache-menu-images.mjs` - Menu item image CDN caching
- `scripts/generate-nutrition-batch.ts` - Nutrition data generation
- `components/templates/MenuPageTemplate.tsx` - Main menu page template
