import type { Metadata } from "next";
import { MenuPageTemplate } from "@/components/templates/MenuPageTemplate";
import {
  fetchAllBrandsSupabase,
  fetchBrandBySlugSupabase,
} from "@/lib/supabase-menu";
import { fetchBrandBySlug as fetchBrandFromSheets } from "@/lib/google-sheets";
import { generateMenuPageMetadata } from "@/lib/seo/metadata";
import {
  generateRestaurantSchema,
  generateBreadcrumbSchema,
  JsonLd,
} from "@/lib/seo/structured-data";
import {
  batchGetMenuImageUrls,
  collectBrandImageUrls,
} from "@/lib/restaurant-images";
import { notFound } from "next/navigation";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ location?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const { location: locationSlug } = await searchParams;

  const brand = await fetchBrandBySlugSupabase(slug);
  if (!brand) {
    return {
      title: "Restaurant Not Found",
      description: "The requested restaurant could not be found.",
    };
  }

  const location = locationSlug
    ? brand.locations.find((l) => l.slug === locationSlug)
    : undefined;

  return generateMenuPageMetadata(brand, location);
}

export default async function MenuPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { location: locationSlug } = await searchParams;

  let brand = await fetchBrandBySlugSupabase(slug);

  if (!brand) {
    notFound();
  }

  // Fall back to Google Sheets menu data when Supabase has no items
  if (brand.menu.length === 0) {
    try {
      const sheetBrand = await fetchBrandFromSheets(slug);
      if (sheetBrand && sheetBrand.menu.length > 0) {
        brand = { ...brand, menu: sheetBrand.menu };
      }
    } catch {
      // Sheets unavailable — continue with empty menu
    }
  }

  // Get the specific location or default to first
  const location =
    (locationSlug && brand.locations.find((l) => l.slug === locationSlug)) ||
    brand.locations[0];

  // Generate structured data
  const restaurantSchema = location
    ? generateRestaurantSchema(brand, location)
    : null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bestfoodwhere.sg" },
    { name: "Restaurants", url: "https://bestfoodwhere.sg/listing" },
    { name: brand.name, url: `https://bestfoodwhere.sg/menu/${brand.slug}` },
  ]);

  // Batch fetch CDN URLs for all images in the brand data
  const imageUrls = collectBrandImageUrls(brand);
  const cdnUrlMap = await batchGetMenuImageUrls(imageUrls);

  const cdnUrls = Object.fromEntries(cdnUrlMap);

  // Load nutrition data if available for this brand
  let nutritionData: Record<string, Record<string, unknown>> | undefined;
  try {
    const nutritionPath = join(process.cwd(), "data", "nutrition", `${slug}.json`);
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
      {restaurantSchema && <JsonLd data={restaurantSchema} />}
      <JsonLd data={breadcrumbSchema} />

      <MenuPageTemplate
        brandData={brand}
        initialLocation={locationSlug}
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
    const brands = await fetchAllBrandsSupabase();
    return brands.map((brand) => ({ slug: brand.slug }));
  } catch (error) {
    console.error("Failed to fetch brands for static params:", error);
    return [];
  }
}
