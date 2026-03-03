import type { Metadata } from "next";
import { MenuPageTemplate } from "@/components/templates/MenuPageTemplate";
import {
  fetchAllBrandsWithLocationsSupabase,
  fetchBrandBySlugSupabase,
  fetchBrandFromMallRestaurantsDB,
} from "@/lib/supabase-menu";
import { fetchBrandBySlug as fetchBrandFromSheets } from "@/lib/google-sheets";
import { fetchBrandFromMallSheets } from "@/lib/shopping-mall-sheets";
import { generateMenuPageMetadata } from "@/lib/seo/metadata";
import {
  generateRestaurantSchema,
  generateMenuSchema,
  generateBreadcrumbSchema,
  JsonLd,
} from "@/lib/seo/structured-data";
import { notFound } from "next/navigation";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { BrandData } from "@/types/brand";

// Revalidate every day
export const revalidate = 86400;

interface Props {
  params: Promise<{ slug: string; location: string }>;
}

/**
 * Resolve brand data from all available sources, with cascading fallbacks.
 */
async function resolveBrand(slug: string): Promise<BrandData | null> {
  let brand = await fetchBrandBySlugSupabase(slug);

  if (!brand) {
    try {
      brand = await fetchBrandFromSheets(slug);
    } catch {
      // Sheets unavailable
    }
  }
  if (!brand) {
    try {
      brand = await fetchBrandFromMallSheets(slug);
    } catch {
      // Mall sheets unavailable
    }
  }
  if (!brand) {
    try {
      brand = await fetchBrandFromMallRestaurantsDB(slug);
    } catch {
      // DB unavailable
    }
  }

  // Fall back to Google Sheets menu data when Supabase brand has no items
  if (brand && brand.menu.length === 0) {
    try {
      const sheetBrand = await fetchBrandFromSheets(slug);
      if (sheetBrand && sheetBrand.menu.length > 0) {
        brand = { ...brand, menu: sheetBrand.menu };
      }
    } catch {
      // Sheets unavailable — continue with empty menu
    }
  }

  return brand;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, location: locationSlug } = await params;

  const brand = await resolveBrand(slug);
  if (!brand) {
    return {
      title: "Restaurant Not Found",
      description: "The requested restaurant could not be found.",
    };
  }

  const specificLocation = brand.locations.find(
    (loc) => loc.slug === locationSlug,
  );
  if (!specificLocation) {
    return {
      title: "Location Not Found",
      description: "The requested restaurant location could not be found.",
    };
  }

  return generateMenuPageMetadata(brand, specificLocation);
}

export default async function MenuLocationPage({ params }: Props) {
  const { slug, location: locationSlug } = await params;

  const brand = await resolveBrand(slug);
  if (!brand) notFound();

  const specificLocation = brand.locations.find(
    (loc) => loc.slug === locationSlug,
  );
  if (!specificLocation) notFound();

  // Generate structured data — location-specific Restaurant schema
  const restaurantSchema = generateRestaurantSchema(brand, specificLocation);

  const menuSchema =
    brand.menu.length > 0
      ? generateMenuSchema(brand.menu, brand.slug)
      : null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bestfoodwhere.sg" },
    { name: "Restaurants", url: "https://bestfoodwhere.sg/listing" },
    {
      name: brand.name,
      url: `https://bestfoodwhere.sg/menu/${brand.slug}`,
    },
    {
      name: specificLocation.name,
      url: `https://bestfoodwhere.sg/menu/${brand.slug}/${specificLocation.slug}`,
    },
  ]);

  // CDN URLs are stored directly on menu_items.cdn_image_url
  const cdnUrls: Record<string, string> = {};

  // Load nutrition data if available for this brand
  let nutritionData: Record<string, Record<string, unknown>> | undefined;
  try {
    const nutritionPath = join(
      process.cwd(),
      "data",
      "nutrition",
      `${slug}.json`,
    );
    if (existsSync(nutritionPath)) {
      const raw = JSON.parse(readFileSync(nutritionPath, "utf-8"));
      nutritionData = raw.items;
    }
  } catch {
    // Nutrition data not available — modal will show fallback message
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <JsonLd data={restaurantSchema} />
      {menuSchema && <JsonLd data={menuSchema} />}
      <JsonLd data={breadcrumbSchema} />

      <MenuPageTemplate
        brandData={brand}
        initialLocation={specificLocation.slug}
        cdnUrls={cdnUrls}
        dbReviews={[]}
        dbRating={undefined}
        dbReviewCount={undefined}
        nutritionData={nutritionData}
      />
    </>
  );
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  try {
    const brands = await fetchAllBrandsWithLocationsSupabase();
    const params: { slug: string; location: string }[] = [];

    for (const brand of brands) {
      for (const loc of brand.locations) {
        if (loc.slug) {
          params.push({ slug: brand.slug, location: loc.slug });
        }
      }
    }

    return params;
  } catch (error) {
    console.error(
      "Failed to fetch brands for location static params:",
      error,
    );
    return [];
  }
}
