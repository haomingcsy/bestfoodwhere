import type { Metadata } from "next";
import { MenuPageTemplate } from "@/components/templates/MenuPageTemplate";
import { fetchAllBrands, fetchBrandBySlug } from "@/lib/google-sheets";
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

  const brand = await fetchBrandBySlug(slug);
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

  const brand = await fetchBrandBySlug(slug);

  if (!brand) {
    notFound();
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

  return (
    <>
      {/* Structured Data for SEO */}
      {restaurantSchema && <JsonLd data={restaurantSchema} />}
      <JsonLd data={breadcrumbSchema} />

      <MenuPageTemplate
        brandData={brand}
        initialLocation={locationSlug}
        cdnUrls={cdnUrls}
      />
    </>
  );
}

export async function generateStaticParams() {
  // Skip static generation if Google Sheets env vars aren't configured
  if (
    !process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
    !process.env.GOOGLE_SHEETS_API_KEY
  ) {
    return [];
  }

  try {
    const brands = await fetchAllBrands();
    return brands.map((brand) => ({ slug: brand.slug }));
  } catch (error) {
    console.error("Failed to fetch brands for static params:", error);
    return [];
  }
}
