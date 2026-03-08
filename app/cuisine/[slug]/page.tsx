import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateCuisinePageMetadata } from "@/lib/seo/metadata";
import {
  generateBreadcrumbSchema,
  generateItemListSchema,
  JsonLd,
} from "@/lib/seo/structured-data";
import { VALID_CUISINE_SLUGS, getCuisineDisplayName } from "./data";
import {
  HeroSection,
  StatsSection,
  RestaurantGrid,
  DealsSection,
  OtherCuisinesSection,
} from "./components";
import {
  fetchRestaurantsByCuisine,
  CUISINE_META,
  CUISINE_HERO_IMAGES,
} from "@/lib/supabase-cuisine";
import type { CuisineData } from "./data/types";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cuisineName = getCuisineDisplayName(slug);
  const meta = CUISINE_META[slug];

  if (meta) {
    return generateCuisinePageMetadata(cuisineName, slug, {
      tagline: meta.tagline,
      features: meta.features,
    });
  }

  return generateCuisinePageMetadata(cuisineName, slug);
}

export function generateStaticParams() {
  return VALID_CUISINE_SLUGS.map((slug) => ({ slug }));
}

export default async function CuisinePage({ params }: Props) {
  const { slug } = await params;
  const cuisineName = getCuisineDisplayName(slug);

  if (
    !VALID_CUISINE_SLUGS.includes(slug as (typeof VALID_CUISINE_SLUGS)[number])
  ) {
    notFound();
  }

  const restaurants = await fetchRestaurantsByCuisine(slug);
  const meta = CUISINE_META[slug];
  const heroImages = CUISINE_HERO_IMAGES[slug] ?? [];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bestfoodwhere.sg" },
    { name: "Cuisines", url: "https://bestfoodwhere.sg/cuisine/all" },
    { name: cuisineName, url: `https://bestfoodwhere.sg/cuisine/${slug}` },
  ]);

  const uniqueMalls = [...new Set(restaurants.map((r) => r.location))];

  const cuisine: CuisineData = {
    slug,
    name: cuisineName,
    tagline: meta?.tagline ?? `Find the best ${cuisineName} food near you`,
    features: (meta?.features ?? []).map((label) => ({ label })),
    heroImages,
    stats: {
      restaurants: restaurants.length,
      menuItems: `${Math.round(restaurants.length * 15)}+`,
      deals: 0,
      malls: uniqueMalls.length,
    },
    restaurants,
    deals: [],
    otherCuisines: meta?.otherCuisines ?? [],
  };

  const restaurantListSchema = generateItemListSchema(
    cuisine.restaurants.map((r, i) => ({
      name: r.name,
      url: r.website || `https://bestfoodwhere.sg/cuisine/${slug}`,
      image: r.image || undefined,
      position: i + 1,
    })),
    `${cuisine.name} Restaurants in Singapore`,
  );

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={restaurantListSchema} />
      <div className="min-h-screen bg-[#f9f9f9]">
        <HeroSection cuisine={cuisine} />

        <div className="mx-auto max-w-[1200px] px-5">
          <StatsSection stats={cuisine.stats} cuisineName={cuisine.name} />
          <RestaurantGrid
            restaurants={cuisine.restaurants}
            cuisineName={cuisine.name}
          />
          <DealsSection deals={cuisine.deals} cuisineName={cuisine.name} />
          <OtherCuisinesSection cuisines={cuisine.otherCuisines} />
        </div>
      </div>
    </>
  );
}
