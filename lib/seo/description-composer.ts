/**
 * SEO Description Composer — Search-Intent-First Engine
 *
 * Produces information-dense meta titles and descriptions that answer
 * what searchers actually want: cuisine, dishes, prices, ratings, location.
 * Uniqueness comes from each restaurant's distinct data, not artificial
 * sentence-structure variation.
 */

// ---------------------------------------------------------------------------
// Hash & utility layer
// ---------------------------------------------------------------------------

function slugHash(raw: string): number {
  let h = 0;
  for (let i = 0; i < raw.length; i++) {
    h = (h << 5) - h + raw.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Independent hash channels keyed from the same slug. */
function hashes(slug: string) {
  return {
    h0: slugHash(slug),
    h1: slugHash(slug + "a"),
    h2: slugHash(slug + "b"),
    h3: slugHash(slug + "c"),
    h4: slugHash(slug + "d"),
    h5: slugHash(slug + "e"),
    h6: slugHash(slug + "f"),
  };
}

function pick<T>(arr: T[], h: number): T {
  return arr[h % arr.length];
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const dot = text.lastIndexOf(".", maxLen - 1);
  if (dot > maxLen * 0.5) return text.slice(0, dot + 1);
  const sp = text.lastIndexOf(" ", maxLen - 4);
  if (sp > maxLen * 0.5) return text.slice(0, sp) + "...";
  return text.slice(0, maxLen - 3) + "...";
}

function clean(text: string): string {
  return text
    .replace(/\.\s*\./g, ".")
    .replace(/,\s*\./g, ".")
    .replace(/\s+/g, " ")
    .replace(/\s+\./g, ".")
    .replace(/\.([A-Z])/g, ". $1")
    .trim();
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function lc(s: string | undefined): string {
  return (s || "").toLowerCase();
}

function joinNatural(items: string[], conj = "and"): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conj} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} ${conj} ${items[items.length - 1]}`;
}

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

function ratingAdjective(rating: number, h: number): string {
  if (rating >= 4.8) return pick(["acclaimed", "top-rated", "exceptional", "outstanding"], h);
  if (rating >= 4.5) return pick(["highly rated", "top-rated", "popular"], h);
  if (rating >= 4.3) return pick(["popular", "well-rated", "well-reviewed"], h);
  return pick(["established", "well-known"], h);
}

function priceAdjective(price: string, h: number): string {
  const p = lc(price);
  if (p === "$$$$" || p.includes("fine") || p.includes("premium"))
    return pick(["premium", "upscale", "fine dining"], h);
  if (p === "$$$" || p.includes("high"))
    return pick(["mid-to-high range", "upper mid-range"], h);
  if (p === "$" || p.includes("budget") || p.includes("cheap"))
    return pick(["budget-friendly", "affordable", "value"], h);
  return pick(["mid-range", "moderately priced"], h);
}

/** Format review count with + suffix for round display. */
function formatReviewCount(count: number): string {
  if (count >= 1000) return `${Math.floor(count / 100) * 100}+`;
  if (count >= 100) return `${Math.floor(count / 10) * 10}+`;
  return `${count}`;
}

/** Get primary cuisine label. */
function primaryCuisine(cuisines: string[]): string {
  return cuisines[0] ? titleCase(cuisines[0]) : "";
}

/** Get cuisine descriptor for use in descriptions (e.g. "Japanese cuisine", "dim sum"). */
function cuisineDescriptor(cuisines: string[]): string {
  if (!cuisines.length) return "dining";
  const primary = lc(cuisines[0]);
  // Some cuisines read better without "cuisine" suffix
  const noSuffix = ["dim sum", "fast food", "seafood", "bbq", "cafe", "bakery", "dessert"];
  if (noSuffix.some(ns => primary.includes(ns))) return titleCase(cuisines[0]);
  return `${titleCase(cuisines[0])} cuisine`;
}

/** Build a dish list string from highlights. */
function dishList(highlights: string[] | undefined, h: number, maxItems = 3): string {
  if (!highlights || highlights.length === 0) return "";
  // Rotate starting point based on hash
  const start = h % highlights.length;
  const rotated = [...highlights.slice(start), ...highlights.slice(0, start)];
  return joinNatural(rotated.slice(0, maxItems));
}

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface MenuDescInput {
  brandName: string;
  slug: string;
  locationName?: string;
  locationSlug?: string;
  cuisines: string[];
  diningStyles: string[];
  priceRange?: string;
  rating?: number;
  reviewCount?: number;
  menuCategories?: string[];
  menuHighlights?: string[];
  amenities?: string[];
  address?: string;
  hasPromotions?: boolean;
  description?: string;
  openingHours?: string;
}

export interface MallDescInput {
  mallName: string;
  slug: string;
  region?: string;
  address?: string;
  restaurantCount?: number;
  cuisineCount?: number;
  mrtStations?: { name: string; line: string; walkTime: string }[];
  topRestaurants?: string[];
  description?: string;
}

export interface CuisineDescInput {
  cuisineName: string;
  slug: string;
  tagline?: string;
  restaurantCount?: number;
  mallCount?: number;
  featuredRestaurants?: string[];
  featuredAreas?: string[];
  features?: string[];
}

export interface DiningDescInput {
  styleName: string;
  slug: string;
  restaurantCount?: number;
  featuredRestaurants?: string[];
  featuredAreas?: string[];
}

// =========================================================================
//  MENU PAGE — Title  (max 60 chars)
// =========================================================================

export function composeMenuTitle(d: MenuDescInput): string {
  const brand = d.brandName;
  const loc = d.locationName;
  const site = "BestFoodWhere";

  if (loc) {
    // If brand name already contains the location, don't repeat it
    if (brand.toLowerCase().includes(loc.toLowerCase())) {
      const full = `${brand} Menu & Prices | ${site}`;
      if (full.length <= 60) return full;
      return truncate(`${brand} Menu | ${site}`, 60);
    }
    // Try progressively shorter formats to fit within 60 chars
    const full = `${brand} Menu & Prices - ${loc} | ${site}`;
    if (full.length <= 60) return full;
    const noPrices = `${brand} Menu - ${loc} | ${site}`;
    if (noPrices.length <= 60) return noPrices;
    const noSite = `${brand} Menu & Prices - ${loc}`;
    if (noSite.length <= 60) return noSite;
    return truncate(`${brand} Menu - ${loc}`, 60);
  }
  return truncate(`${brand} Menu & Prices | ${site}`, 60);
}

// =========================================================================
//  MENU PAGE — Description  (max 160 chars)
// =========================================================================

export function composeMenuDescription(d: MenuDescInput): string {
  const H = hashes(d.slug + (d.locationSlug || ""));
  const brand = d.brandName;
  const loc = d.locationName;
  const dishes = dishList(d.menuHighlights, H.h1);
  const rat = d.rating;
  const revCount = d.reviewCount;
  const price = d.priceRange || "";

  // Avoid repeating cuisine if it already appears in the brand name
  const brandLower = lc(brand);
  let cuisine = cuisineDescriptor(d.cuisines);
  if (lc(cuisine).split(" ").some(w => w.length > 3 && brandLower.includes(w))) {
    // Try secondary cuisine
    if (d.cuisines.length > 1) {
      cuisine = cuisineDescriptor(d.cuisines.slice(1));
    } else {
      cuisine = ""; // skip cuisine mention — brand name already implies it
    }
  }

  // --- Build lead sentence (~80-100 chars) ---
  let lead: string;
  const leadPatterns: string[] = [];

  if (dishes && loc && cuisine) {
    leadPatterns.push(
      `${brand} at ${loc} serves ${cuisine} featuring ${dishes}.`,
      `${brand} serves ${cuisine} at ${loc}, including ${dishes}.`,
      `Visit ${brand} at ${loc} for ${cuisine} like ${dishes}.`,
    );
  } else if (dishes && loc) {
    leadPatterns.push(
      `${brand} at ${loc} features ${dishes}.`,
      `${brand} at ${loc} is known for ${dishes}.`,
      `Visit ${brand} at ${loc} for ${dishes}.`,
    );
  } else if (dishes && cuisine) {
    leadPatterns.push(
      `${brand} serves ${cuisine} featuring ${dishes}.`,
      `${brand} offers ${cuisine} including ${dishes}.`,
      `${brand} is known for ${cuisine} like ${dishes}.`,
    );
  } else if (dishes) {
    leadPatterns.push(
      `${brand} is known for dishes like ${dishes}.`,
      `${brand} features ${dishes}.`,
      `${brand} serves ${dishes}.`,
    );
  } else if (loc && cuisine) {
    leadPatterns.push(
      `${brand} at ${loc} serves ${cuisine}.`,
      `${brand} serves ${cuisine} at ${loc}.`,
      `Visit ${brand} at ${loc} for ${cuisine}.`,
    );
  } else if (loc) {
    leadPatterns.push(
      `${brand} is a restaurant at ${loc}.`,
      `${brand} at ${loc}.`,
      `Visit ${brand} at ${loc}.`,
    );
  } else if (cuisine) {
    leadPatterns.push(
      `${brand} serves ${cuisine}.`,
      `${brand} offers ${cuisine}.`,
      `${brand} is a ${cuisine} restaurant.`,
    );
  } else {
    leadPatterns.push(
      `${brand} is a restaurant in Singapore.`,
      `${brand} serves a variety of dishes.`,
    );
  }
  lead = pick(leadPatterns, H.h2);

  // --- Rating signal ---
  let ratingSignal = "";
  if (rat && rat > 0 && revCount && revCount > 0) {
    const fmtCount = formatReviewCount(revCount);
    const ratingPhrases = [
      `Rated ${rat}/5 by ${fmtCount} diners.`,
      `${fmtCount} reviews, ${rat}/5 average.`,
      `${rat}/5 rating from ${fmtCount} reviews.`,
      `${rat}/5 stars from ${fmtCount} diners.`,
    ];
    ratingSignal = pick(ratingPhrases, H.h3);
  }

  // --- Price signal ---
  let priceSignal = "";
  if (price) {
    const pricePhrases = [
      `${price} pricing.`,
      `${price} price range.`,
      `Priced ${price}.`,
    ];
    priceSignal = pick(pricePhrases, H.h4);
  }

  // --- CTA ---
  const ctas = [
    "View the full menu with prices.",
    "Browse the complete menu.",
    "See menu, prices and reviews.",
    "Full menu with prices inside.",
    "Menu, photos and reviews.",
  ];
  const cta = pick(ctas, H.h5);

  // --- Assemble ---
  const parts = [lead, ratingSignal, priceSignal, cta].filter(Boolean);
  const raw = clean(parts.join(" "));
  return truncate(raw, 160);
}

// =========================================================================
//  MALL PAGE — Title  (max 60 chars)
// =========================================================================

export function composeMallTitle(d: MallDescInput): string {
  const mall = d.mallName;
  return truncate(`${mall} Restaurants & Menus | BestFoodWhere`, 60);
}

// =========================================================================
//  MALL PAGE — Description  (max 160 chars)
// =========================================================================

export function composeMallDescription(d: MallDescInput): string {
  const H = hashes(d.slug);
  const mall = d.mallName;
  const count = d.restaurantCount;
  const cuisineCount = d.cuisineCount;
  const topNames = d.topRestaurants?.slice(0, 3) || [];
  const mrt = d.mrtStations?.[0];
  const region = d.region;

  // Lead: what the mall has
  let lead: string;
  if (count && topNames.length > 0) {
    lead = `${mall} has ${count}+ restaurants including ${joinNatural(topNames)}.`;
  } else if (count) {
    lead = `${mall} has ${count}+ restaurants and food outlets.`;
  } else if (topNames.length > 0) {
    lead = `${mall} restaurants include ${joinNatural(topNames)}.`;
  } else {
    lead = `Explore restaurants and food options at ${mall}.`;
  }

  // Cuisine variety
  let cuisineInfo = "";
  if (cuisineCount && cuisineCount > 5) {
    cuisineInfo = `${cuisineCount}+ cuisine types.`;
  }

  // Transit info
  let transitInfo = "";
  if (mrt) {
    transitInfo = `Near ${mrt.name} MRT.`;
  } else if (region) {
    transitInfo = `Located in ${region}.`;
  }

  // CTA
  const ctas = [
    "Full directory with menus and prices.",
    "Browse all restaurants with menus.",
    "View menus, prices and reviews.",
    "Complete food directory inside.",
  ];
  const cta = pick(ctas, H.h1);

  const parts = [lead, cuisineInfo, transitInfo, cta].filter(Boolean);
  const raw = clean(parts.join(" "));
  return truncate(raw, 160);
}

// =========================================================================
//  CUISINE PAGE — Title  (max 60 chars)
// =========================================================================

export function composeCuisineTitle(d: CuisineDescInput): string {
  const name = titleCase(d.cuisineName);
  return truncate(`Best ${name} Restaurants in Singapore | BestFoodWhere`, 60);
}

// =========================================================================
//  CUISINE PAGE — Description  (max 160 chars)
// =========================================================================

export function composeCuisineDescription(d: CuisineDescInput): string {
  const H = hashes(d.slug);
  const name = titleCase(d.cuisineName);
  const count = d.restaurantCount;
  const featured = d.featuredRestaurants?.slice(0, 3) || [];
  const areas = d.featuredAreas?.slice(0, 2) || [];
  const mallCount = d.mallCount;

  // Lead
  let lead: string;
  if (count && featured.length > 0) {
    lead = `Find ${count}+ ${name} restaurants across Singapore including ${joinNatural(featured)}.`;
  } else if (count) {
    lead = `Find ${count}+ ${name} restaurants across Singapore malls.`;
  } else if (featured.length > 0) {
    lead = `${name} restaurants in Singapore including ${joinNatural(featured)}.`;
  } else {
    lead = `Discover ${name} restaurants across Singapore.`;
  }

  // Location info
  let locationInfo = "";
  if (areas.length > 0 && mallCount) {
    locationInfo = `Available in ${mallCount}+ malls across ${joinNatural(areas)}.`;
  } else if (mallCount) {
    locationInfo = `Found in ${mallCount}+ Singapore malls.`;
  }

  // CTA
  const ctas = [
    "Browse menus, prices and reviews.",
    "View menus and prices.",
    "Compare menus, prices and ratings.",
    "See all menus with prices.",
  ];
  const cta = pick(ctas, H.h1);

  const parts = [lead, locationInfo, cta].filter(Boolean);
  const raw = clean(parts.join(" "));
  return truncate(raw, 160);
}

// =========================================================================
//  DINING STYLE PAGE — Title  (max 60 chars)
// =========================================================================

export function composeDiningTitle(d: DiningDescInput): string {
  const style = titleCase(d.styleName);
  return truncate(`${style} Restaurants in Singapore | BestFoodWhere`, 60);
}

// =========================================================================
//  DINING STYLE PAGE — Description  (max 160 chars)
// =========================================================================

export function composeDiningDescription(d: DiningDescInput): string {
  const H = hashes(d.slug);
  const style = titleCase(d.styleName);
  const count = d.restaurantCount;
  const featured = d.featuredRestaurants?.slice(0, 3) || [];
  const areas = d.featuredAreas?.slice(0, 2) || [];

  // Lead
  let lead: string;
  if (count && featured.length > 0) {
    lead = `Explore ${count}+ ${lc(style)} restaurants in Singapore including ${joinNatural(featured)}.`;
  } else if (count) {
    lead = `Explore ${count}+ ${lc(style)} restaurants across Singapore malls.`;
  } else if (featured.length > 0) {
    lead = `${style} restaurants in Singapore including ${joinNatural(featured)}.`;
  } else {
    lead = `Discover ${lc(style)} restaurants in Singapore.`;
  }

  // Location info
  let locationInfo = "";
  if (areas.length > 0) {
    locationInfo = areas.length === 1
      ? `Found in ${areas[0]} and more.`
      : `Found in ${areas.join(", ")} and more.`;
  }

  // CTA
  const ctas = [
    "View menus, prices and reviews.",
    "Browse menus and prices.",
    "Compare menus, prices and ratings.",
    "See all menus with prices.",
  ];
  const cta = pick(ctas, H.h1);

  const parts = [lead, locationInfo, cta].filter(Boolean);
  const raw = clean(parts.join(" "));
  return truncate(raw, 160);
}
