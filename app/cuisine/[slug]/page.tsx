import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateCuisinePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema, JsonLd } from "@/lib/seo/structured-data";
import { ComingSoonPage } from "@/components/templates/ComingSoonPage";
import {
  getCuisineData,
  getCuisineDisplayName,
  hasCuisineData,
  VALID_CUISINE_SLUGS,
} from "./data";
import {
  HeroSection,
  StatsSection,
  RestaurantGrid,
  DealsSection,
  OtherCuisinesSection,
} from "./components";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cuisineName = getCuisineDisplayName(slug);
  return generateCuisinePageMetadata(cuisineName, slug);
}

export function generateStaticParams() {
  return VALID_CUISINE_SLUGS.map((slug) => ({ slug }));
}

export default async function CuisinePage({ params }: Props) {
  const { slug } = await params;
  const cuisineName = getCuisineDisplayName(slug);

  // Check if this is a valid cuisine slug
  if (
    !VALID_CUISINE_SLUGS.includes(slug as (typeof VALID_CUISINE_SLUGS)[number])
  ) {
    notFound();
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bestfoodwhere.sg" },
    { name: "Cuisines", url: "https://bestfoodwhere.sg/cuisine/all" },
    { name: cuisineName, url: `https://bestfoodwhere.sg/cuisine/${slug}` },
  ]);

  // If we have data for this cuisine, render the full page
  if (hasCuisineData(slug)) {
    const cuisine = getCuisineData(slug)!;

    return (
      <>
        <JsonLd data={breadcrumbSchema} />
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

  // Otherwise show coming soon
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <ComingSoonPage
        title={`${cuisineName} Restaurants`}
        backHref="/cuisine/all"
        backLabel="Browse all cuisines"
      />
    </>
  );
}
