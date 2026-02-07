# BestFoodWhere.sg - Task Tracker

> Last Updated: December 2025

## Current Phase: Homepage (Phase 3)

Goal: Replicate `https://bestfoodwhere.sg/` homepage top-to-bottom using Next.js + Tailwind with mock data (no Supabase/Maps integration yet).

---

## Checklist (Build in exact homepage order)

- [x] (M) Wire global layout: render `components/layout/Header` + `components/layout/Footer` in `app/layout.tsx`
- [x] (M) Build sticky **Header/Navigation** (desktop + mobile): logo, Discover dropdown, Shopping Malls dropdown, Cuisines dropdown, Blog dropdown, search trigger, “List Your Restaurant” CTA, login/account buttons
- [x] (M) Build **Hero**: “Discover Best Food Places Near You in Singapore.” headline with highlight + simple animation, subtitle, dual CTA buttons (“View malls” / “View cuisine”)
- [x] (S) Build **Feature List**: 4–5 bullets with check icons (copy + spacing to match live)
- [x] (L) Build **Postal Code Finder (UI only)**: 6-digit input, submit button, results panel + travel time chips, “View directory” link/button (mock mall + mock travel times)
- [x] (M) Build **Popular Shopping Malls**: 3-col responsive grid (or horizontal carousel on mobile if matching), 6 cards with image, badge, stats, tags, hover lift, “View All Malls” link
- [x] (M) Build **Explore by Cuisine**: 3-col responsive image cards with bottom overlay text + hover lift, “View all cuisines” link
- [x] (S) Build **Dining Options**: 4-col responsive icon cards (Family-Friendly, Romantic, Late-Night, Quick Bites) with hover states
- [x] (M) Build **Latest Food Deals**: 3-col responsive deal cards with discount badges (e.g., “30% OFF”, “1-FOR-1”), CTA button
- [x] (M) Build **Recipe Categories**: 4-col responsive grid, 12 category cards with consistent sizing + hover
- [x] (S) Build **Newsletter Signup**: email capture form with loading/success/error UI (mock submit)
- [x] (S) Build **Footer**: 4-col layout with links + copyright
- [x] (S) Verify responsive behavior (sm/md/lg/xl) across all sections + basic a11y (labels, focus, reduced motion)
- [x] (S) Run `npm run type-check` + `npm run lint` and fix issues from homepage changes only

---

## Implementation Notes / Constraints
- Mock data only (hardcoded arrays) colocated with each section or in `lib/mock/homepage.ts`.
- Defer Google Maps API + real travel-time calculations; use deterministic mock values for now.
- Match live site interactions: sticky header, dropdown behaviors, hover lift/shadows, section spacing, and typography (Montserrat headings).
- Prefer Server Components by default; use Client Components only where needed (dropdowns, mobile drawer, postal code input state).

---

## Progress Notes

#### 2025-12-14 - Homepage kickoff
**Status:** In Progress
**Notes:**
- Header, Hero, Feature List, and Postal Code Finder sections implemented with mock data.

#### 2025-12-17 - Run dev server (local)
**Status:** Completed
**Checklist:**
- [x] Ensure dependencies installed (`npm ci`)
- [x] Start dev server (`npm run dev`, port `4007`)
- [x] Confirm homepage loads at `http://localhost:4007`

---

## Phase 2: Site Architecture Setup (Complete)

- [x] Scaffold public routes (malls, menu, cuisine, dining, postal finder, deals, about, contact, faq, blog, recipes, careers, partnership, listing)
- [x] Scaffold auth routes (`/login`, `/signup`, `/forgot-password`)
- [x] Scaffold user dashboard route group (`/(user)/*`) (structure only; no auth yet)
- [x] Scaffold admin panel routes (`/admin/*`) (structure only; no auth yet)
- [x] Add template placeholders under `components/templates/`
- [x] Add WordPress REST API client (`lib/wordpress.ts`) + types (`types/wordpress.ts`)
- [x] Add `docs/ARCHITECTURE.md` documenting routes/templates/WP integration

---

## Phase 3: Menu Pages - Google Sheets CMS (In Progress)

- [ ] Add Google Sheets service (`lib/google-sheets.ts`) with 5-min ISR caching
- [ ] Add brand/menu types (`types/brand.ts`)
- [ ] Wire `/menu/[slug]` to Google Sheets + `MenuPageTemplate`
- [ ] Build menu sections under `components/sections/menu/` (layout + placeholders)
- [ ] Update `.env.example` with required Google Sheets env vars
- [ ] Add docs note for Sheets integration (update `docs/ARCHITECTURE.md`)
- [ ] Run `npm run lint` + `npm run type-check` (menu changes only)

---

## Four Leaves WP Parity (codex-claude)

Goal: Match `https://bestfoodwhere.sg/menu/four-leaves/` in the `codex-claude` menu template.

### Plan (Pending Approval)
- [x] 1. Restyle `HeroHeader` to WP black bar layout (tags, price, open badge) and add hero image support.
- [x] 2. Update `StoreInfoCard` to WP sidebar layout (location selector, profile strip, location details card, order button, socials).
- [x] 3. Rebuild `GoogleReviews` to WP layout (logo header, rating summary, bars, CTA, list styling).
- [x] 4. Restyle “More bakeries” (`RelatedBrands`) cards to WP typography, badges, tags, hours line.
- [x] 5. Ensure mobile layout moves Store Info above main sections while keeping sidebar on desktop.
- [x] 6. Run `npm run lint` + `npm run type-check` after changes.

### Plan (Pending Approval) - Four Leaves Data Sync & Visual Parity
- [ ] 1. Confirm hero/logo image source uses local `image/fourleaves.png` everywhere the Four Leaves art appears.
- [ ] 2. Normalize opening-hours parsing to always render 7 day rows from sheet data (Weekly Schedule / Opening Hours).
- [ ] 3. Align open/closed badge text and time to Singapore time with “opens at” fallback.
- [ ] 4. Verify description + amenities content is generated per location when sheet is blank.
- [ ] 5. Re-check Four Leaves page layout against the reference screenshots and note any deltas.

### Plan (Pending Approval) - Nutrition Modal Icon Parity + Sheet Verification
- [ ] 1. Replace Health Benefits + Allergen icons with local SVGs matching the original Font Awesome shapes (bread-slice, fish, egg, child, brain, dumbbell, heartbeat, exclamation-triangle).
- [ ] 2. Wire the modal to use those SVGs consistently across all menu items (no external dependency).
- [ ] 3. Verify the menu data is loading from Google Sheets; if the API key is invalid, surface the error and request a valid key.

### Plan (Pending Approval) - Sheets Mapping + Per-Location Content
- [ ] 1. Read the “All Menus” tab and confirm Name → slug mapping for all provided names.
- [ ] 2. Map “General Information” + “Location associated” to location selector, tags, map, store info, and opening hours per location.
- [ ] 3. Parse detailed Google Reviews text into the reviews section per location.
- [ ] 4. Fix “More bakeries” parsing so the cards render for each location.
- [ ] 5. Wire “BestFoodWhere’s Recommendation” into the sidebar.
- [ ] 6. Add data-driven “Exclusive Coupons” column and connect it to the sidebar.
- [ ] 7. Implement unique per-location Description + Amenities via sheet content (no templated generator).

### Plan (Pending Approval) - HubSpot Webhook Endpoint
- [x] 1. Add `app/api/hubspot/webhook/route.ts` with `POST` handler returning 200 and logging payload.
- [x] 2. Add optional `GET` handler returning 200 for quick verification.
- [ ] 3. Document the webhook URL for Vercel production deployment.

### Plan (Approved) - Newsletter Popup + n8n → HubSpot
- [ ] 1. Replace `NewsletterSignup` with modal popup UI (left benefits + right form) matching the reference layout.
- [ ] 2. Add `/api/newsletter` route to forward submissions to `N8N_NEWSLETTER_WEBHOOK_URL`.
- [ ] 3. Render popup globally in `app/layout.tsx` and remove inline usage from `app/page.tsx`.
- [ ] 4. Add success/error states and ensure no consent checkbox is shown.
