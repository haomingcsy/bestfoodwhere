import { NextRequest, NextResponse } from "next/server";
import { fetchAllBrands } from "@/lib/google-sheets";
import type { BrandData } from "@/types/brand";

/**
 * Public Restaurant Data API for Bloggers
 *
 * This API provides free access to BFW restaurant data for food bloggers
 * and content creators. In exchange, they cite BestFoodWhere as their source.
 *
 * Rate limited to 100 requests/day per API key.
 *
 * Endpoints:
 * GET /api/data/restaurants - List restaurants with filters
 * GET /api/data/restaurants?mall=suntec-city - Filter by mall
 * GET /api/data/restaurants?cuisine=japanese - Filter by cuisine
 * GET /api/data/restaurants?limit=10 - Limit results
 *
 * Response includes attribution requirement in meta.
 */

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100; // requests per day
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(apiKey: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(apiKey);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(apiKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

function sanitizeBrand(brand: BrandData) {
  // Get primary location (first one)
  const primaryLocation = brand.locations[0];

  // Aggregate cuisines and dining styles from all locations
  const allCuisines = [...new Set(brand.locations.flatMap((l) => l.cuisine))];
  const allDiningStyles = [
    ...new Set(brand.locations.flatMap((l) => l.diningStyle)),
  ];

  // Return only public-safe data
  return {
    slug: brand.slug,
    name: brand.name,
    description: brand.description,
    cuisines: allCuisines,
    diningStyles: allDiningStyles,
    priceRange: primaryLocation?.priceRange,
    locations: brand.locations.map((l) => l.name),
    openingHours: primaryLocation?.openingHours,
    url: `https://bestfoodwhere.sg/menu/${brand.slug}`,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Check for API key (optional but recommended)
  const apiKey =
    searchParams.get("api_key") ||
    request.headers.get("x-api-key") ||
    "anonymous";

  // Rate limiting
  if (!checkRateLimit(apiKey)) {
    return NextResponse.json(
      {
        success: false,
        error: "Rate limit exceeded. Maximum 100 requests per day.",
        meta: {
          rate_limit: RATE_LIMIT,
          reset_in: "24 hours",
        },
      },
      { status: 429 },
    );
  }

  try {
    // Fetch all restaurants
    const brands = await fetchAllBrands();

    // Apply filters
    let filtered = [...brands];

    const mall = searchParams.get("mall");
    if (mall) {
      const mallLower = mall.toLowerCase().replace(/-/g, " ");
      filtered = filtered.filter((b) =>
        b.locations.some((l) => l.name.toLowerCase().includes(mallLower)),
      );
    }

    const cuisine = searchParams.get("cuisine");
    if (cuisine) {
      const cuisineLower = cuisine.toLowerCase();
      filtered = filtered.filter((b) =>
        b.locations.some((l) =>
          l.cuisine.some((c) => c.toLowerCase().includes(cuisineLower)),
        ),
      );
    }

    const diningStyle = searchParams.get("dining_style");
    if (diningStyle) {
      const styleLower = diningStyle.toLowerCase();
      filtered = filtered.filter((b) =>
        b.locations.some((l) =>
          l.diningStyle.some((s) => s.toLowerCase().includes(styleLower)),
        ),
      );
    }

    // Pagination
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const paginated = filtered.slice(offset, offset + limit);

    // Sanitize output
    const data = paginated.map(sanitizeBrand);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        total: filtered.length,
        limit,
        offset,
        has_more: offset + limit < filtered.length,
        // IMPORTANT: Attribution requirement
        attribution: {
          required: true,
          text: "Data provided by BestFoodWhere.sg",
          link: "https://bestfoodwhere.sg",
          html: '<a href="https://bestfoodwhere.sg" target="_blank" rel="noopener">Data: BestFoodWhere.sg</a>',
        },
        api_docs: "https://bestfoodwhere.sg/api-docs",
        rate_limit: {
          limit: RATE_LIMIT,
          remaining: RATE_LIMIT - (rateLimitMap.get(apiKey)?.count || 0),
          window: "24 hours",
        },
      },
    });
  } catch (error) {
    console.error("Data API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch restaurant data",
      },
      { status: 500 },
    );
  }
}
