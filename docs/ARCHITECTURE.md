# Architecture

## Overview
BestFoodWhere.sg is being migrated from WordPress to Next.js 14 (App Router). The goal is to replicate the live site while transitioning content and data sources incrementally.

## Routes
This project uses Next.js App Router route folders under `app/`.

### Public Pages
```
app/
├── page.tsx                          # Homepage
├── shopping-malls/
│   ├── page.tsx                      # Mall listing
│   └── [slug]/page.tsx               # Individual mall
├── menu/
│   └── [slug]/page.tsx               # Brand menu (?location= query param)
├── cuisine/
│   └── [slug]/page.tsx               # Cuisine listing
├── dining/
│   └── [slug]/page.tsx               # Dining type listing
├── postal-code-food-finder/
│   └── page.tsx                      # Standalone postal finder page
├── promotions-and-deals/
│   └── page.tsx                      # Deals listing
├── about/page.tsx
├── our-story/page.tsx
├── contact-us/page.tsx
├── faq/page.tsx
├── blog/
│   ├── page.tsx                      # Blog listing
│   └── [slug]/page.tsx               # Single post
├── recipes/
│   ├── page.tsx                      # Recipe listing
│   ├── [category]/page.tsx           # Category listing
│   └── [category]/[slug]/page.tsx    # Single recipe
├── partnership/page.tsx
├── careers/page.tsx
└── listing/page.tsx                  # List Your Restaurant form
```

### Auth Pages
```
app/
├── login/page.tsx
├── signup/page.tsx
└── forgot-password/page.tsx
```

### User Dashboard (protected later)
Route group `(user)` is reserved for authenticated user pages. Auth protection will be added later (Supabase Auth).
```
app/
└── (user)/
    ├── layout.tsx
    ├── dashboard/page.tsx
    ├── favorites/page.tsx
    ├── reviews/page.tsx
    └── settings/page.tsx
```

### Admin Panel (protected later)
Admin routes will be protected later (Supabase Auth / RLS).
```
app/
└── admin/
    ├── layout.tsx
    ├── page.tsx                      # Dashboard
    ├── brands/
    │   ├── page.tsx
    │   ├── new/page.tsx
    │   └── [id]/page.tsx
    ├── malls/
    │   ├── page.tsx
    │   ├── new/page.tsx
    │   └── [id]/page.tsx
    ├── promotions/
    │   ├── page.tsx
    │   └── [id]/page.tsx
    ├── recipes/
    │   ├── page.tsx
    │   └── [id]/page.tsx
    ├── users/page.tsx
    └── subscribers/page.tsx
```

## Menu page query param (`location`)
Menu pages support an optional `location` query param:
`/menu/four-leaves?location=suntec-city`

Implementation lives in `app/menu/[slug]/page.tsx` and types `searchParams.location` as optional.

## Template-based pages
High-volume content pages use reusable templates in `components/templates/`.
- `MenuPageTemplate.tsx`
- `MallPageTemplate.tsx`
- `CuisinePageTemplate.tsx`
- `DiningPageTemplate.tsx`
- `RecipePageTemplate.tsx`
- `BlogPostTemplate.tsx`

These templates will be wired once screenshots and data contracts are finalized.

## WordPress REST API integration
Blog posts, recipes, and categories will be fetched from the existing WordPress site.
- Types: `types/wordpress.ts`
- Client utilities: `lib/wordpress.ts`

## Google Sheets CMS (Menu pages)
Brand/menu data for `/menu/[slug]` is fetched from Google Sheets via the Sheets API v4.
- Service: `lib/google-sheets.ts`
- Types: `types/brand.ts`
- Required env vars: `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_API_KEY` (optionally `GOOGLE_SHEETS_RANGE`)
