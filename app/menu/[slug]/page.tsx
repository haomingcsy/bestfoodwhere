import type { Metadata } from "next";
import { MenuPageTemplate } from "@/components/templates/MenuPageTemplate";
import {
  fetchAllBrandsSupabase,
  fetchBrandBySlugSupabase,
  fetchBrandFromMallRestaurantsDB,
} from "@/lib/supabase-menu";
import { fetchBrandBySlug as fetchBrandFromSheets } from "@/lib/google-sheets";
import { fetchBrandFromMallSheets } from "@/lib/shopping-mall-sheets";
import { generateMenuPageMetadata } from "@/lib/seo/metadata";
import {
  generateRestaurantSchema,
  generateBreadcrumbSchema,
  JsonLd,
} from "@/lib/seo/structured-data";
import { notFound } from "next/navigation";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

// Revalidate every hour — enables Vercel edge caching (ISR)
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

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
  if (!brand) {
    return {
      title: "Restaurant Not Found",
      description: "The requested restaurant could not be found.",
    };
  }

  return generateMenuPageMetadata(brand);
}

export default async function MenuPage({ params }: Props) {
  const { slug } = await params;

  let brand = await fetchBrandBySlugSupabase(slug);

  // Fall back to Google Sheets when brand not in Supabase
  if (!brand) {
    try {
      brand = await fetchBrandFromSheets(slug);
    } catch {
      // Sheets unavailable
    }
  }
  // Fall back to mall sheets data
  if (!brand) {
    try {
      brand = await fetchBrandFromMallSheets(slug);
    } catch {
      // Mall sheets unavailable
    }
  }
  // Fall back to mall_restaurants DB table
  if (!brand) {
    try {
      brand = await fetchBrandFromMallRestaurantsDB(slug);
    } catch {
      // DB unavailable
    }
  }
  if (!brand) notFound();

  // Fall back to Google Sheets menu data when Supabase brand has no items
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

  // Default to first location — client handles ?location= switching
  const location = brand.locations[0];

  // Generate structured data
  const restaurantSchema = location
    ? generateRestaurantSchema(brand, location)
    : null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bestfoodwhere.sg" },
    { name: "Restaurants", url: "https://bestfoodwhere.sg/listing" },
    { name: brand.name, url: `https://bestfoodwhere.sg/menu/${brand.slug}` },
  ]);

  // CDN URLs are now stored directly on menu_items.cdn_image_url
  // and mapped into imageUrl by supabase-menu.ts — no lookup needed.
  const cdnUrls: Record<string, string> = {};

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
        initialLocation={undefined}
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
