---
globs:
  - "supabase/**"
  - "lib/supabase*"
  - "lib/supabase/**"
---

# Supabase & Database Rules

## Key Tables

| Table | Purpose |
|-------|---------|
| `brands` | Brand master data (730+ rows), slug, name, meta_description, ai_description |
| `brand_locations` | Per-location data (840 rows), slug, address, ai_description |
| `mall_restaurants` | Mall-restaurant mapping, google_place_id, hero_image_url, photos JSONB |
| `menu_item_image_cache` | Cached menu item images keyed by original_url |
| `restaurant_image_cache` | Cached restaurant images keyed by original_url, has restaurant_slug + mall_slug |
| `ghl_oauth_tokens` | GHL CRM OAuth token storage |
| `subscribers` | Newsletter subscribers |
| `contacts` | Contact form submissions |
| `recipes` | Recipe content |
| `promotions` | Deals and promotions |

## Migration Conventions

- New migrations: `npx supabase migration new <descriptive_name>`
- Timestamp prefix format: `YYYYMMDDHHMMSS`
- Always include RLS policies for new tables
- Use `supabase db push` for local development, migrations for production

## Connection Patterns

- Client-side: use `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Server-side: use `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- Supabase MCP available in read-only mode for schema inspection and data queries
