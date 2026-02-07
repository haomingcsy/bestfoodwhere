import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { MallHero } from "@/components/sections/mall/MallHero";
import { MallContactCard } from "@/components/sections/mall/MallContactCard";
import { MallOpeningHoursCard } from "@/components/sections/mall/MallOpeningHoursCard";
import { MallLocationCard } from "@/components/sections/mall/MallLocationCard";
import { MallGettingHereCard } from "@/components/sections/mall/MallGettingHereCard";
import { RestaurantFilterBar } from "@/components/sections/mall/RestaurantFilterBar";
import { MallRestaurantCard } from "@/components/sections/mall/MallRestaurantCard";
import { Pagination } from "@/components/sections/mall/Pagination";
import {
  fetchMallDetailsFromSupabase,
  fetchMallRestaurantsFromSupabase,
} from "@/lib/supabase-mall";
import { generateBreadcrumbSchema, JsonLd } from "@/lib/seo/structured-data";
import { getMallDataBySlug, MALLS_DATA } from "@/lib/mall-data";

// Initialize Supabase client for fetching CDN URLs
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const RESTAURANTS_PER_PAGE = 8;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string;
    cuisine?: string;
    price?: string;
    openNow?: string;
    page?: string;
  }>;
}

export const revalidate = 300;

// Generate all mall pages at build time
export async function generateStaticParams() {
  return MALLS_DATA.map((mall) => ({ slug: mall.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const mall = await fetchMallDetailsFromSupabase(slug);

  if (!mall) {
    return {
      title: "Mall Not Found | BestFoodWhere",
    };
  }

  return {
    title: `${mall.name} Food Directory | BestFoodWhere`,
    description:
      mall.description ||
      `Discover the best restaurants and food options at ${mall.name}. Browse our comprehensive directory of dining options.`,
    alternates: {
      canonical: `https://bestfoodwhere.sg/shopping-malls/${slug}`,
    },
    openGraph: {
      title: `${mall.name} Food Directory | BestFoodWhere`,
      description:
        mall.description ||
        `Discover the best restaurants and food options at ${mall.name}.`,
      url: `https://bestfoodwhere.sg/shopping-malls/${slug}`,
      images: mall.heroImageUrl ? [mall.heroImageUrl] : [],
    },
  };
}

function filterRestaurants(
  restaurants: Awaited<ReturnType<typeof fetchMallRestaurantsFromSupabase>>,
  filters: {
    q?: string;
    cuisine?: string;
    price?: string;
    openNow?: string;
  },
) {
  let filtered = [...restaurants];

  // Search filter
  if (filters.q) {
    const searchLower = filters.q.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(searchLower) ||
        r.description?.toLowerCase().includes(searchLower) ||
        r.cuisines.some((c) => c.toLowerCase().includes(searchLower)),
    );
  }

  // Cuisine filter
  if (filters.cuisine) {
    const cuisineLower = filters.cuisine.toLowerCase();
    filtered = filtered.filter((r) =>
      r.cuisines.some((c) => c.toLowerCase() === cuisineLower),
    );
  }

  // Price filter
  if (filters.price) {
    const priceMap: Record<string, string[]> = {
      budget: ["$5-15", "$8-15", "under $15", "Budget"],
      mid: ["$15-25", "$15-30", "$18-35", "Mid-range"],
      premium: ["$30-50", "$25-50", "Premium"],
      fine: ["$50+", "$50-100", "$100+", "Fine Dining"],
    };
    const validPrices = priceMap[filters.price] || [];
    filtered = filtered.filter((r) =>
      validPrices.some(
        (p) =>
          r.priceRange?.toLowerCase().includes(p.toLowerCase()) ||
          p.toLowerCase().includes(r.priceRange?.toLowerCase() || ""),
      ),
    );
  }

  // Open now filter
  if (filters.openNow === "true") {
    filtered = filtered.filter((r) => {
      if (r.isOpen !== undefined) return r.isOpen;
      if (!r.openingHours) return false;
      if (/closed/i.test(r.openingHours)) return false;
      return true; // Assume open if can't determine
    });
  }

  return filtered;
}

// Fetch AI-generated descriptions from cache
async function fetchDescriptions(
  mallSlug: string,
): Promise<Map<string, string>> {
  const descMap = new Map<string, string>();

  try {
    const { data } = await supabase
      .from("restaurant_descriptions")
      .select("restaurant_name, description")
      .eq("mall_slug", mallSlug);

    if (data) {
      for (const item of data) {
        descMap.set(item.restaurant_name, item.description);
      }
    }
  } catch (error) {
    console.error("Failed to fetch descriptions:", error);
  }

  return descMap;
}

// Fetch CDN URLs for restaurant images from cache
async function fetchCdnUrls(
  restaurants: Awaited<ReturnType<typeof fetchMallRestaurantsFromSupabase>>,
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();

  const originalUrls = restaurants
    .map((r) => r.imageUrl)
    .filter((url): url is string => !!url);

  if (originalUrls.length === 0) return urlMap;

  try {
    const { data } = await supabase
      .from("restaurant_image_cache")
      .select("original_url, cdn_url")
      .in("original_url", originalUrls);

    if (data) {
      for (const item of data) {
        urlMap.set(item.original_url, item.cdn_url);
      }
    }
  } catch (error) {
    console.error("Failed to fetch CDN URLs:", error);
  }

  return urlMap;
}

// Fetch high-quality hero images from Google Places API (stored in mall_restaurants)
async function fetchHeroImages(mallSlug: string): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();

  try {
    // Get mall ID first
    const { data: mall } = await supabase
      .from("shopping_malls")
      .select("id")
      .eq("slug", mallSlug)
      .single();

    if (!mall) return imageMap;

    // Fetch hero images for all restaurants in this mall
    const { data } = await supabase
      .from("mall_restaurants")
      .select("slug, hero_image_url")
      .eq("mall_id", mall.id)
      .not("hero_image_url", "is", null);

    if (data) {
      for (const item of data) {
        if (item.hero_image_url) {
          imageMap.set(item.slug, item.hero_image_url);
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch hero images:", error);
  }

  return imageMap;
}

// Fetch mall hero image from database
async function fetchMallHeroImage(mallSlug: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("shopping_malls")
      .select("hero_image_url")
      .eq("slug", mallSlug)
      .single();

    return data?.hero_image_url || null;
  } catch (error) {
    console.error("Failed to fetch mall hero image:", error);
    return null;
  }
}

export default async function ShoppingMallPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const filters = await searchParams;

  let mall: Awaited<ReturnType<typeof fetchMallDetailsFromSupabase>> = null;
  let restaurants: Awaited<
    ReturnType<typeof fetchMallRestaurantsFromSupabase>
  > = [];
  let cdnUrlMap = new Map<string, string>();
  let descriptionMap = new Map<string, string>();
  let heroImageMap = new Map<string, string>();

  try {
    [mall, restaurants] = await Promise.all([
      fetchMallDetailsFromSupabase(slug),
      fetchMallRestaurantsFromSupabase(slug),
    ]);

    // Fetch CDN URLs, descriptions, and hero images in parallel
    [cdnUrlMap, descriptionMap, heroImageMap] = await Promise.all([
      fetchCdnUrls(restaurants),
      fetchDescriptions(slug),
      fetchHeroImages(slug),
    ]);

    // Set the mall hero image from MALLS_DATA (same as listing page)
    if (mall) {
      const mallData = getMallDataBySlug(slug);
      if (mallData?.imageUrl) {
        mall.heroImageUrl = mallData.imageUrl;
      }
    }
  } catch (error) {
    console.error("Failed to fetch mall data:", error);
  }

  if (!mall) {
    notFound();
  }

  // Update restaurant count
  mall.restaurantCount = restaurants.length;

  // Apply filters
  const filteredRestaurants = filterRestaurants(restaurants, filters);

  // Pagination
  const currentPage = Math.max(1, parseInt(filters.page || "1", 10) || 1);
  const totalPages = Math.ceil(
    filteredRestaurants.length / RESTAURANTS_PER_PAGE,
  );
  const startIndex = (currentPage - 1) * RESTAURANTS_PER_PAGE;
  const paginatedRestaurants = filteredRestaurants.slice(
    startIndex,
    startIndex + RESTAURANTS_PER_PAGE,
  );

  // Get unique cuisines for filter dropdown
  const uniqueCuisines = [
    ...new Set(restaurants.flatMap((r) => r.cuisines)),
  ].sort();

  // SEO breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bestfoodwhere.sg" },
    { name: "Shopping Malls", url: "https://bestfoodwhere.sg/shopping-malls" },
    {
      name: mall.name,
      url: `https://bestfoodwhere.sg/shopping-malls/${slug}`,
    },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <MallHero mall={mall} />

        {/* Main Content */}
        <div className="container py-8">
          <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
            {/* Sidebar */}
            <aside className="space-y-6">
              <MallContactCard mall={mall} />
              <MallOpeningHoursCard mall={mall} />
              <MallLocationCard mall={mall} />
              <MallGettingHereCard mall={mall} />
            </aside>

            {/* Restaurant Directory */}
            <div className="space-y-6">
              {/* Filter Bar */}
              <Suspense
                fallback={
                  <div className="h-16 animate-pulse rounded-2xl bg-white" />
                }
              >
                <RestaurantFilterBar
                  mallSlug={slug}
                  cuisines={uniqueCuisines}
                />
              </Suspense>

              {/* Results Count */}
              <div className="text-sm text-gray-600">
                {filteredRestaurants.length === restaurants.length ? (
                  <span>
                    Showing {startIndex + 1}-
                    {Math.min(
                      startIndex + RESTAURANTS_PER_PAGE,
                      filteredRestaurants.length,
                    )}{" "}
                    of {restaurants.length} restaurants
                  </span>
                ) : (
                  <span>
                    Showing {startIndex + 1}-
                    {Math.min(
                      startIndex + RESTAURANTS_PER_PAGE,
                      filteredRestaurants.length,
                    )}{" "}
                    of {filteredRestaurants.length} restaurants (filtered from{" "}
                    {restaurants.length})
                  </span>
                )}
              </div>

              {/* Restaurant Grid */}
              {paginatedRestaurants.length > 0 ? (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    {paginatedRestaurants.map((restaurant) => (
                      <MallRestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        cdnUrl={
                          restaurant.imageUrl
                            ? cdnUrlMap.get(restaurant.imageUrl)
                            : undefined
                        }
                        heroImageUrl={heroImageMap.get(restaurant.slug)}
                        description={descriptionMap.get(restaurant.name)}
                      />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <Suspense fallback={null}>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        mallSlug={slug}
                      />
                    </Suspense>
                  )}
                </>
              ) : (
                <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    No restaurants found
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Try adjusting your filters or search terms.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
