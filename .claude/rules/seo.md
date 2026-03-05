---
globs:
  - "lib/seo/**"
  - "app/menu/**"
  - "app/shopping-malls/**"
  - "app/cuisine/**"
---

# SEO & Public Page Rules

## Key Modules

- `lib/seo/` — SEO metadata generation, AI description composer, JSON-LD structured data
- `lib/supabase-menu.ts` — Brand/location data fetching (`fetchBrandBySlug()`, `fetchBrandLocations()`)
- `lib/supabase-mall.ts` — Mall data fetching

## Data Scale

- 730+ brands in `brands` table → `/menu/[slug]` pages
- 840 locations in `brand_locations` table → `/menu/[slug]/[location]` pages
- 19 malls → `/shopping-malls/[slug]` pages
- 19 cuisine categories → `/cuisine/[slug]` pages

## SEO Patterns

- Each brand page has AI-generated `meta_description` and `ai_description` stored in DB
- Location pages have per-location `ai_description` in `brand_locations` table
- Structured data uses JSON-LD (Restaurant, Menu, FoodEstablishment schemas)
- Title format: `{Brand Name} Menu, Price & Delivery | BestFoodWhere`
- Location title: `{Brand Name} {Location} — Menu & Prices`

## Image Resolution

- Brand images: `batchGetMenuImageUrls()` checks `menu_item_image_cache` then `restaurant_image_cache`
- Mall restaurant images: `hero_image_url` from `mall_restaurants` table (Google Places sync)
- Related brands: `resolveRelatedBrandImages()` looks up `mall_restaurants` by slug + name fallback
