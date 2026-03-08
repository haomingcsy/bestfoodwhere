import type { Metadata } from "next";
import { generateDiningPageMetadata } from "@/lib/seo/metadata";
import {
  generateBreadcrumbSchema,
  generateItemListSchema,
  JsonLd,
} from "@/lib/seo/structured-data";
import { ComingSoonPage } from "@/components/templates/ComingSoonPage";
import { fetchRestaurantsByDiningStyle } from "@/lib/supabase-cuisine";
import { RestaurantGrid } from "@/app/cuisine/[slug]/components";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const diningStyle = slugToName(slug);
  const restaurants = await fetchRestaurantsByDiningStyle(slug);

  if (restaurants.length > 0) {
    return generateDiningPageMetadata(diningStyle, slug, {
      restaurantCount: restaurants.length,
      featuredRestaurants: restaurants.slice(0, 5).map((r) => r.name),
      featuredAreas: [...new Set(restaurants.map((r) => r.area))].slice(0, 5),
    });
  }

  return generateDiningPageMetadata(diningStyle, slug);
}

export default async function DiningPage({ params }: Props) {
  const { slug } = await params;
  const diningStyle = slugToName(slug);
  const restaurants = await fetchRestaurantsByDiningStyle(slug);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bestfoodwhere.sg" },
    { name: "Dining Styles", url: "https://bestfoodwhere.sg/dining" },
    { name: diningStyle, url: `https://bestfoodwhere.sg/dining/${slug}` },
  ]);

  if (restaurants.length > 0) {
    const restaurantListSchema = generateItemListSchema(
      restaurants.map((r, i) => ({
        name: r.name,
        url: `https://bestfoodwhere.sg/dining/${slug}`,
        image: r.image || undefined,
        position: i + 1,
      })),
      `${diningStyle} Restaurants in Singapore`,
    );

    return (
      <>
        <JsonLd data={breadcrumbSchema} />
        <JsonLd data={restaurantListSchema} />
        <div className="min-h-screen bg-[#f9f9f9]">
          <div className="mx-auto max-w-[1200px] px-5 py-10">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
              {diningStyle}{" "}
              <span className="text-bfw-orange">Dining</span> in Singapore
            </h1>
            <p className="mb-8 text-[15px] text-gray-600">
              Discover {restaurants.length} {diningStyle.toLowerCase()} restaurants across Singapore
            </p>
            <RestaurantGrid
              restaurants={restaurants}
              cuisineName={diningStyle}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <ComingSoonPage
        title={`${diningStyle} Dining`}
        backHref="/"
        backLabel="Back to home"
      />
    </>
  );
}
