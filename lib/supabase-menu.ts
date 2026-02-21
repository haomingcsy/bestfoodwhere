/**
 * Supabase Menu Data Fetcher
 *
 * Provides fetchBrandBySlugSupabase() and fetchAllBrandsSupabase() as
 * Supabase-backed replacements for the Google Sheets fetchBrandBySlug().
 */

import { createClient } from "@supabase/supabase-js";
import type {
  BrandData,
  LocationInfo,
  MenuCategory,
  MenuItem,
  ReviewSummary,
  Review,
  SocialLinks,
  Amenity,
  RelatedBrand,
} from "@/types/brand";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    global: { fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }) },
  },
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapLocation(bl: Record<string, unknown>): LocationInfo {
  const mr = (bl.mall_restaurants ?? {}) as Record<string, unknown>;

  return {
    slug: (bl.mall_slug as string) || (bl.slug as string) || "",
    name: (bl.location_name as string) || "",
    address: (bl.address as string) || "",
    phone: (bl.phone as string) || "",
    openingHours: Array.isArray(bl.opening_hours)
      ? (bl.opening_hours as string[]).join("\n")
      : (bl.opening_hours as string) || "",
    website: (bl.website as string) || "",
    reviews: {
      rating: (mr.rating as number) ?? 0,
      count: (mr.review_count as number) ?? 0,
    },
    imageUrl: (mr.hero_image_url as string) || (mr.image_url as string) || "",
    heroImageUrl: (mr.hero_image_url as string) || undefined,
    priceRange: (mr.price_range as string) || undefined,
    cuisine: (mr.cuisines as string[]) ?? [],
    diningStyle: (mr.dining_styles as string[]) ?? [],
    description: (bl.description as string) || undefined,
    amenities: (bl.amenities as Amenity[]) || undefined,
    details: (bl.mall_slug as string)
      ? (bl.mall_slug as string)
          .split("-")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : undefined,
  };
}

function mapMenuCategory(cat: Record<string, unknown>): MenuCategory {
  const items = ((cat.menu_items as Record<string, unknown>[]) ?? []).map(
    (mi): MenuItem => ({
      name: (mi.name as string) || "",
      description: (mi.description as string) || undefined,
      imageUrl:
        (mi.cdn_image_url as string) || (mi.original_image_url as string) || "",
      price: (mi.price as string) || undefined,
    }),
  );
  return { name: (cat.name as string) || "", items };
}

function mapReview(r: Record<string, unknown>): Review {
  return {
    author: (r.author as string) || "",
    rating: (r.rating as number) ?? 5,
    date: (r.publish_time as string) || (r.relative_date as string) || "",
    content: (r.content as string) || "",
  };
}

function mapRelatedBrand(r: Record<string, unknown>): RelatedBrand {
  return {
    name: (r.name as string) || "",
    slug: (r.slug as string) || "",
    location: (r.mall_slug as string) || "",
    rating: (r.rating as number) ?? 0,
    reviewCount: (r.review_count as number) ?? 0,
    imageUrl: (r.hero_image_url as string) || (r.image_url as string) || "",
    openingHours: Array.isArray(r.opening_hours)
      ? (r.opening_hours as string[]).join("\n")
      : (r.opening_hours as string) || "",
    price: (r.price_range as string) || undefined,
    unit: (r.unit as string) || undefined,
    cuisines: (r.cuisines as string[]) || undefined,
    diningStyles: (r.dining_styles as string[]) || undefined,
  };
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Fetch a single brand by slug from Supabase, returning the full BrandData
 * shape consumed by MenuPageTemplate. Returns null when the slug is not found.
 */
export async function fetchBrandBySlugSupabase(
  slug: string,
): Promise<BrandData | null> {
  // 1. brand_menus
  const { data: brand } = await supabase
    .from("brand_menus")
    .select(
      `id, slug, name, description, ai_description,
       social_links, amenities, ai_amenities, promotions, coupons,
       recommendations, ai_recommendations, youtube_url`,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!brand) return null;

  // 2. brand_locations + mall_restaurants (join via FK)
  const { data: locations } = await supabase
    .from("brand_locations")
    .select(
      `slug, location_name, address, phone, opening_hours, website,
       description, amenities, mall_slug,
       mall_restaurants!mall_restaurant_id (
         rating, review_count, hero_image_url, image_url,
         cuisines, dining_styles, price_range, unit
       )`,
    )
    .eq("brand_menu_id", brand.id);

  // 3. menu_categories + menu_items
  let { data: categories } = await supabase
    .from("menu_categories")
    .select(
      `name, sort_order,
       menu_items ( name, description, original_image_url, cdn_image_url, price, sort_order )`,
    )
    .eq("brand_menu_id", brand.id)
    .order("sort_order", { ascending: true });

  // Fallback: if no menu items and brand name contains "@", try the parent brand's menu
  if ((!categories || categories.length === 0) && (brand.name as string)?.includes("@")) {
    const parentName = (brand.name as string).split("@")[0].trim();
    const { data: parentBrand } = await supabase
      .from("brand_menus")
      .select("id")
      .ilike("name", parentName)
      .maybeSingle();
    if (parentBrand) {
      const { data: parentCategories } = await supabase
        .from("menu_categories")
        .select(
          `name, sort_order,
           menu_items ( name, description, original_image_url, cdn_image_url, price, sort_order )`,
        )
        .eq("brand_menu_id", parentBrand.id)
        .order("sort_order", { ascending: true });
      if (parentCategories && parentCategories.length > 0) {
        categories = parentCategories;
      }
    }
  }

  // 4. brand_reviews
  const { data: reviews } = await supabase
    .from("brand_reviews")
    .select(
      "location_slug, rating, author, author_photo_url, content, publish_time, relative_date",
    )
    .eq("brand_menu_id", brand.id);

  // 5. related brands — other restaurants in the same malls
  const mallSlugs = [
    ...new Set(
      (locations ?? []).map((l) => l.mall_slug as string).filter(Boolean),
    ),
  ];

  const relatedBrandsMap: Record<string, RelatedBrand[]> = {};

  if (mallSlugs.length > 0) {
    // Look up mall IDs from slugs
    const { data: malls } = await supabase
      .from("shopping_malls")
      .select("id, slug")
      .in("slug", mallSlugs);

    const mallIdToSlug: Record<string, string> = {};
    for (const m of malls ?? []) {
      mallIdToSlug[m.id] = m.slug;
    }
    const mallIds = Object.keys(mallIdToSlug);

    // Get all brand slugs that have menu pages in our DB
    const { data: existingBrands } = await supabase
      .from("brand_menus")
      .select("slug");
    const brandSlugsSet = new Set(
      (existingBrands ?? []).map((b) => b.slug as string),
    );

    // Query each mall individually to ensure every mall gets up to 6 related brands
    // (a global limit biases toward larger malls like Suntec City)
    // Only include restaurants that have menu pages in our DB
    for (const mallId of mallIds) {
      const ms = mallIdToSlug[mallId] || "";
      const { data: related } = await supabase
        .from("mall_restaurants")
        .select(
          "name, mall_id, slug, rating, review_count, hero_image_url, image_url, opening_hours, price_range, unit, cuisines, dining_styles",
        )
        .eq("mall_id", mallId)
        .neq("slug", slug)
        .order("rating", { ascending: false, nullsFirst: false })
        .limit(20);

      // Filter to only brands that exist in brand_menus, then take top 6
      const filtered = (related ?? [])
        .filter((r) => brandSlugsSet.has(r.slug as string))
        .slice(0, 6);

      relatedBrandsMap[ms] = filtered.map((r) =>
        mapRelatedBrand({ ...r, mall_slug: ms } as Record<string, unknown>),
      );
    }
  }

  // --- Map reviews into ReviewSummary[] grouped by location ---
  const reviewsByLocation: Record<string, Review[]> = {};
  for (const r of reviews ?? []) {
    const loc = (r.location_slug as string) || "default";
    if (!reviewsByLocation[loc]) reviewsByLocation[loc] = [];
    reviewsByLocation[loc].push(mapReview(r as Record<string, unknown>));
  }

  const reviewSummaries: ReviewSummary[] = Object.entries(
    reviewsByLocation,
  ).map(([location, revs]) => ({
    location,
    rating: revs.reduce((sum, r) => sum + r.rating, 0) / (revs.length || 1),
    totalReviews: revs.length,
    reviews: revs,
  }));

  // --- Sort menu_items inside each category by sort_order ---
  const menuCategories: MenuCategory[] = (categories ?? []).map((cat) => {
    const raw = cat as Record<string, unknown>;
    const items = (raw.menu_items as Record<string, unknown>[]) ?? [];
    items.sort(
      (a, b) =>
        ((a.sort_order as number) ?? 0) - ((b.sort_order as number) ?? 0),
    );
    return mapMenuCategory(raw);
  });

  // --- Assemble BrandData ---
  const description =
    (brand.description as string) || (brand.ai_description as string) || "";

  const rawAmenities =
    ((brand.amenities as string[] | Amenity[] | null) ?? []).length > 0
      ? ((brand.amenities as string[] | Amenity[] | null) ?? [])
      : ((brand.ai_amenities as string[] | Amenity[] | null) ?? []);

  const recommendations: string[] = (brand.recommendations as string[] | null)
    ?.length
    ? (brand.recommendations as string[])
    : ((brand.ai_recommendations as string[]) ?? []);

  return {
    name: brand.name as string,
    slug: brand.slug as string,
    description,
    descriptionMissing: !description,
    amenitiesMissing: rawAmenities.length === 0,
    locations: (locations ?? []).map((l) =>
      mapLocation(l as Record<string, unknown>),
    ),
    menu: menuCategories,
    reviews: reviewSummaries,
    relatedBrands: relatedBrandsMap,
    socialLinks: (brand.social_links as SocialLinks) ?? {},
    amenities: rawAmenities.map((a: string | Amenity) =>
      typeof a === "string" ? { label: a } : a,
    ),
    promotions: (brand.promotions as string[]) ?? [],
    coupons: (brand.coupons as string[]) ?? [],
    recommendations,
    youtubeUrl: (brand.youtube_url as string) || undefined,
  };
}

/**
 * Fetch all active brands from Supabase. Returns minimal BrandData objects
 * (slug + name only) suitable for generateStaticParams.
 */
export async function fetchAllBrandsSupabase(): Promise<BrandData[]> {
  const { data, error } = await supabase
    .from("brand_menus")
    .select("slug, name")
    .eq("is_active", true);

  if (error || !data) return [];

  return data.map(
    (row): BrandData => ({
      slug: row.slug as string,
      name: row.name as string,
      description: "",
      locations: [],
      menu: [],
      reviews: [],
      relatedBrands: {},
      socialLinks: {},
      amenities: [],
      promotions: [],
      recommendations: [],
    }),
  );
}

/**
 * Fetch all active brands with their locations from Supabase.
 * Returns BrandData[] with populated locations (but empty menu/reviews).
 * Suitable for sitemap, API routes, and anywhere that needs location-level
 * data (cuisine, diningStyle, priceRange, reviews, etc.) without full menus.
 */
export async function fetchAllBrandsWithLocationsSupabase(): Promise<
  BrandData[]
> {
  const { data: brands, error } = await supabase
    .from("brand_menus")
    .select(
      `slug, name, description, ai_description,
       brand_locations (
         slug, location_name, address, phone, opening_hours, website, mall_slug,
         mall_restaurants!mall_restaurant_id (
           rating, review_count, hero_image_url, image_url,
           cuisines, dining_styles, price_range, unit
         )
       )`,
    )
    .eq("is_active", true);

  if (error || !brands) return [];

  return brands.map((brand) => {
    const description =
      (brand.description as string) || (brand.ai_description as string) || "";
    const locations = (
      (brand.brand_locations as Record<string, unknown>[]) || []
    ).map((bl) => mapLocation(bl));

    return {
      slug: brand.slug as string,
      name: brand.name as string,
      description,
      locations,
      menu: [],
      reviews: [],
      relatedBrands: {},
      socialLinks: {},
      amenities: [],
      promotions: [],
      recommendations: [],
    };
  });
}
