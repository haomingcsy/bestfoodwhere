/**
 * Supabase Mall Data Fetcher
 *
 * Fetches mall restaurant data from Supabase tables.
 * Used as fallback when Google Sheets API is unavailable.
 */

import { createClient } from "@supabase/supabase-js";
import { getMallDataBySlug } from "./mall-data";
import type { MallRestaurant, ShoppingMall } from "@/types/shopping-mall";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type { MallRestaurant };

/**
 * Get mall details from Supabase (with static data fallback)
 */
export async function fetchMallDetailsFromSupabase(
  slug: string,
): Promise<ShoppingMall | null> {
  // Fetch mall data from Supabase
  const { data: mall } = await supabase
    .from("shopping_malls")
    .select(
      `id, name, slug, description, hero_image_url, address, postal_code,
       map_embed_url, latitude, longitude, opening_hours, getting_here`,
    )
    .eq("slug", slug)
    .single();

  // Fall back to static data if not in Supabase
  const staticMall = getMallDataBySlug(slug);
  if (!mall && !staticMall) {
    return null;
  }

  // Get restaurant count
  let restaurantCount = staticMall?.diningCount || 0;
  if (mall?.id) {
    const { count } = await supabase
      .from("mall_restaurants")
      .select("id", { count: "exact", head: true })
      .eq("mall_id", mall.id);
    restaurantCount = count || restaurantCount;
  }

  // Default mall hours
  const defaultHours = "10:00 AM - 10:00 PM";

  return {
    id: mall?.id || slug,
    slug,
    name: mall?.name || staticMall?.name || slug,
    description:
      mall?.description ||
      `Discover the best restaurants and dining options at ${mall?.name || staticMall?.name}. Browse our comprehensive directory of food places.`,
    heroImageUrl: mall?.hero_image_url || staticMall?.imageUrl || "",
    address: mall?.address || staticMall?.location || "",
    postalCode: mall?.postal_code,
    mapEmbedUrl: mall?.map_embed_url,
    latitude: mall?.latitude,
    longitude: mall?.longitude,
    openingHours: [
      { day: "Monday", hours: defaultHours },
      { day: "Tuesday", hours: defaultHours },
      { day: "Wednesday", hours: defaultHours },
      { day: "Thursday", hours: defaultHours },
      { day: "Friday", hours: defaultHours },
      { day: "Saturday", hours: defaultHours },
      { day: "Sunday", hours: defaultHours },
    ],
    gettingHere: mall?.getting_here || {
      mrt: [],
      bus: [],
      parking: [],
    },
    restaurantCount,
  };
}

/**
 * Fetch restaurants for a mall from Supabase
 */
export async function fetchMallRestaurantsFromSupabase(
  mallSlug: string,
): Promise<MallRestaurant[]> {
  // First get mall ID from slug
  const { data: mall } = await supabase
    .from("shopping_malls")
    .select("id")
    .eq("slug", mallSlug)
    .single();

  if (!mall?.id) {
    console.error("Mall not found in Supabase:", mallSlug);
    return [];
  }

  // Fetch restaurants by mall_id
  const { data: restaurants, error } = await supabase
    .from("mall_restaurants")
    .select(
      `
      id,
      slug,
      name,
      description,
      cuisines,
      dining_styles,
      opening_hours,
      rating,
      review_count,
      hero_image_url,
      image_url,
      price_range,
      phone,
      website,
      unit,
      latitude,
      longitude,
      dining_options,
      has_menu_page
    `,
    )
    .eq("mall_id", mall.id)
    .order("created_at", { ascending: true });

  if (error || !restaurants) {
    console.error("Error fetching mall restaurants:", error);
    return [];
  }

  return restaurants.map((r) => ({
    id: r.id,
    mallId: mall.id,
    mallSlug: mallSlug,
    slug: r.slug,
    name: r.name,
    unit: r.unit || "",
    imageUrl: r.hero_image_url || r.image_url || "",
    rating: r.rating || 0,
    reviewCount: r.review_count || 0,
    priceRange: r.price_range || "",
    cuisines: r.cuisines || [],
    diningStyles: r.dining_styles || [],
    description: r.description || "",
    openingHours: r.opening_hours || "",
    phone: r.phone || undefined,
    website: r.website || undefined,
    latitude: r.latitude || undefined,
    longitude: r.longitude || undefined,
    diningOptions: r.dining_options || [],
    hasMenuPage: r.has_menu_page || false,
  }));
}
