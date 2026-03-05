# BestFoodWhere — Session Context

> This file is auto-loaded by SessionStart hooks on every startup, compaction, clear, and resume.
> It gives Claude full project context without reading the codebase.
> Keep it under 200 lines. Update after major architectural changes.

## Project Overview

BestFoodWhere (BFW) is a Singapore restaurant discovery platform.
- **Domain**: bestfoodwhere.sg
- **Stack**: Next.js 14 (App Router) + Supabase + Tailwind CSS 3 + TypeScript
- **Hosting**: Vercel (auto-deploys from `main` branch)
- **Dev**: `npm run dev` (port 4007), `npm run build` (with 8GB heap)

## Key Routes

| Route | Purpose |
|-------|---------|
| `/menu/[slug]` | Brand menu page (730+ brands) |
| `/menu/[slug]/[location]` | Per-location menu page (840 locations) |
| `/shopping-malls/[slug]` | Mall directory page (19 malls) |
| `/cuisine/[slug]` | Cuisine category page (19 categories) |
| `/dining/[slug]` | Dining category pages |
| `/recipes/[category]/[slug]` | Recipe pages |
| `/blog` | Blog listing |
| `/api/crm/contacts` | Universal CRM form handler (7+ forms) |
| `/api/contact` | Contact-us form |
| `/admin/*` | Admin dashboard (brands, malls, promotions, recipes) |
| `/(user)/*` | User dashboard, favorites, reviews, deals, settings |
| `/restaurant/*` | Restaurant owner dashboard |

## Data Architecture

### Primary Data Sources
- **Supabase** (`hgdedyrjkywaboalisaw`): Primary database for brands, locations, malls, recipes, users
- **Google Sheets** (`1_cYc7...`): "Assessment" sheet — restaurant data, menus, reviews (legacy, being migrated)
- **Google Sheets** (`198QKX...`): Mall-organized data — hardcoded ID in `shopping-mall-sheets.ts`

### Key Database Tables
- `brands` — Restaurant brands with slug, seoDescription, AI-generated descriptions
- `brand_locations` — Per-location data with ai_description, address, coordinates, rating
- `mall_restaurants` — Mall-restaurant relationships, Google Place data, hero images
- `menu_item_image_cache` / `restaurant_image_cache` — Image proxy cache
- `ghl_oauth_tokens` — GoHighLevel CRM OAuth tokens
- `subscribers`, `contacts`, `recipes`, `promotions`

### Key Lib Modules
- `lib/supabase/` — Supabase client, auth helpers
- `lib/supabase-menu.ts` — Brand/location data fetching (fetchBrandBySlug, fetchAllBrands)
- `lib/supabase-mall.ts` — Mall data fetching
- `lib/seo/` — SEO metadata, description composer, structured data
- `lib/ghl/` — GoHighLevel CRM integration (Private Integration API)
- `lib/gsc/` — Google Search Console keyword enrichment
- `lib/google-sheets.ts` — Legacy Google Sheets data source
- `lib/shopping-mall-sheets.ts` — Mall spreadsheet (HARDCODED spreadsheet ID)
- `lib/stripe/` — Stripe payment integration
- `lib/sync/` — Google Places data sync

## SEO Architecture

- **Brand pages** (`/menu/[slug]`): AI-generated `seoDescription` stored in `brands` table
- **Location pages** (`/menu/[slug]/[location]`): AI-generated `ai_description` in `brand_locations` table
- **Titles**: Template-based with progressive shortening to fit 60 chars
- **Structured data**: JSON-LD for restaurants, menus, recipes
- **Meta composer**: `lib/seo/metadata.ts` + `lib/seo/description-composer.ts`

## CRM Integration (GoHighLevel)

- **API**: Private Integration, base URL `https://services.leadconnectorhq.com`
- **Location ID**: `aj2VKGwRWaEEQpMnrbNj`
- **CRITICAL**: GHL upsert requires custom field **IDs** not key names. Mapping in `lib/ghl/utils.ts` → `GHL_FIELD_IDS`
- All forms pass UTM params + `pageUrl` + `bfw_source`
- n8n webhooks triggered per form source

## Environment Variables (key ones)

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_SHEETS_SPREADSHEET_ID` — Assessment spreadsheet
- `GHL_API_KEY` — GoHighLevel Private Integration key
- `GHL_LOCATION_ID` — GoHighLevel location
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `OPENAI_API_KEY` — Used for AI description generation
- `GOOGLE_CSE_API_KEY` / `GOOGLE_CSE_ID` — Custom Search for images

## Known Gotchas

- `shopping-mall-sheets.ts` has a **hardcoded** spreadsheet ID (not env var)
- Spreadsheet IDs were swapped once (2026-02-07) — always verify which format
- Related Brands image slugs may not match DB slugs (name differences)
- GHL field IDs must be used (not key names) — see `GHL_FIELD_IDS` mapping
- Cuisine data files can be huge (chinese.ts = 60K lines) — never read fully
- Build requires `NODE_OPTIONS='--max-old-space-size=8192'`

## Recent Major Changes

- SEO overhaul: 840 AI location descriptions, progressive title shortening (commit 834ac95)
- CRM migration: HubSpot → GoHighLevel with OAuth2 token refresh
- GSC keyword enrichment for CRM contacts (commit b34d156)
- Per-location routes (`/menu/[slug]/[location]`) with unique meta per location
- Installed 16 marketing/growth skills from agency-agents + marketingskills repos (project-level)

## Skills (Project-Level at .claude/skills/)

26 total skills. Auto-trigger rules defined in CLAUDE.md. Key groups:
- **Core BFW** (10): api-builder, bfw-component, database-designer, seo-generator, restaurant-researcher, recipe-generator, test-generator, marketing-hub, content-research-writer, recipe-video-script
- **Marketing CRO** (6): form-cro, signup-flow-cro, page-cro, cold-email, email-sequence, product-marketing-context
- **SEO & Discovery** (4): seo-audit, programmatic-seo, schema-markup, ai-seo, competitor-alternatives, analytics-tracking
- **Strategy & Growth** (4): growth-hacker, content-creator, analytics-reporter, trend-researcher

**Dependency**: Marketing skills require `product-marketing-context` to be run first (generates `.claude/skills/product-marketing-context/context.md`).

## Task Tracking

Check `tasks/todo.md` for current work state. This file is maintained by Claude across sessions.

## Commands Reference

```bash
npm run dev          # Start dev server on port 4007
npm run build        # Production build (8GB heap)
npm run lint         # ESLint
npm run type-check   # TypeScript type checking (tsc --noEmit)
npx supabase migration new <name>  # Create new migration
```
