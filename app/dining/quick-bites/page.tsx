import type { Metadata } from "next";
import {
  HeroSection,
  StatsSection,
  RestaurantGrid,
  DealsSection,
  OtherCuisinesSection,
} from "./components";
import { QUICK_BITES_RESTAURANTS } from "./data";
import {
  generateBreadcrumbSchema,
  generateItemListSchema,
  JsonLd,
} from "@/lib/seo/structured-data";
import { generateDiningPageMetadata } from "@/lib/seo/metadata";

const featuredRestaurants = QUICK_BITES_RESTAURANTS.slice(0, 5).map(
  (r) => r.name,
);
const featuredAreas = [
  ...new Set(QUICK_BITES_RESTAURANTS.map((r) => r.area)),
].slice(0, 5);

export const metadata: Metadata = generateDiningPageMetadata(
  "Quick Bites",
  "quick-bites",
  {
    restaurantCount: QUICK_BITES_RESTAURANTS.length,
    featuredRestaurants,
    featuredAreas,
  },
);

export default function QuickBitesPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bestfoodwhere.sg" },
    { name: "Dining Styles", url: "https://bestfoodwhere.sg/dining" },
    { name: "Quick Bites", url: "https://bestfoodwhere.sg/dining/quick-bites" },
  ]);

  const restaurantListSchema = generateItemListSchema(
    QUICK_BITES_RESTAURANTS.map((r, i) => ({
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
          <RestaurantGrid restaurants={QUICK_BITES_RESTAURANTS} />
          <DealsSection />
          <OtherCuisinesSection />
        </div>
      </div>
    </>
  );
}
