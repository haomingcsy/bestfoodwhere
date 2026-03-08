import type { Metadata } from "next";
import {
  HeroSection,
  StatsSection,
  RestaurantGrid,
  DealsSection,
  OtherCuisinesSection,
} from "./components";
import {
  generateBreadcrumbSchema,
  generateItemListSchema,
  JsonLd,
} from "@/lib/seo/structured-data";
import { generateDiningPageMetadata } from "@/lib/seo/metadata";
import { fetchRestaurantsByDiningStyle } from "@/lib/supabase-cuisine";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const restaurants = await fetchRestaurantsByDiningStyle("quick-bites");
  const featuredRestaurants = restaurants.slice(0, 5).map((r) => r.name);
  const featuredAreas = [
    ...new Set(restaurants.map((r) => r.area)),
  ].slice(0, 5);

  return generateDiningPageMetadata("Quick Bites", "quick-bites", {
    restaurantCount: restaurants.length,
    featuredRestaurants,
    featuredAreas,
  });
}

export default async function QuickBitesPage() {
  const restaurants = await fetchRestaurantsByDiningStyle("quick-bites");

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bestfoodwhere.sg" },
    { name: "Dining Styles", url: "https://bestfoodwhere.sg/dining" },
    { name: "Quick Bites", url: "https://bestfoodwhere.sg/dining/quick-bites" },
  ]);

  const restaurantListSchema = generateItemListSchema(
    restaurants.map((r, i) => ({
      name: r.name,
      url: `https://bestfoodwhere.sg/dining/quick-bites`,
      image: r.image || undefined,
      position: i + 1,
    })),
    "Quick Bites Restaurants in Singapore",
  );

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={restaurantListSchema} />
      <div className="min-h-screen bg-[#f9f9f9]">
        <HeroSection />

        <div className="mx-auto max-w-[1200px] px-5">
          <StatsSection />
          <RestaurantGrid restaurants={restaurants} />
          <DealsSection />
          <OtherCuisinesSection />
        </div>
      </div>
    </>
  );
}
