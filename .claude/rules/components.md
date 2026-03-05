---
globs:
  - "components/**"
  - "app/(user)/**"
  - "app/admin/**"
  - "app/restaurant/**"
---

# Component & UI Rules

## Component Organization

- `components/sections/menu/` — Menu page sections (brand hero, menu grid, location info)
- `components/sections/mall/` — Mall page sections (mall hero, restaurant grid)
- `components/sections/recipe/` — Recipe page sections
- `components/templates/` — Full page templates (MenuPageTemplate, etc.)
- `components/layout/` — Layout wrappers (header, footer, navigation)
- `components/auth/` — Authentication UI components
- `components/dashboard/` — User dashboard components
- `components/restaurant/` — Restaurant owner dashboard components

## Styling

- Tailwind CSS 3 — use utility classes, no custom CSS files unless absolutely necessary
- Responsive: mobile-first, use `sm:`, `md:`, `lg:` breakpoints
- Dark mode: not implemented — do not add dark mode utilities

## Dashboard Routes

- `/admin/*` — Admin dashboard (brands, malls, payments, promotions, recipes, restaurants, reviews, settings, subscribers, users)
- `/(user)/*` — Consumer dashboard (dashboard, deals, favorites, reviews, settings)
- `/restaurant/*` — Restaurant owner area (dashboard, analytics, settings, subscription)

## Patterns

- Page components use async server components for data fetching
- Client interactivity via `"use client"` directive only where needed
- Form submissions go through `/api/crm/contacts` or dedicated API routes
