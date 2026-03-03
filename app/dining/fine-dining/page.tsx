import type { Metadata } from "next";
import {
  HeroSection,
  StatsSection,
  RestaurantGrid,
  DealsSection,
  OtherCuisinesSection,
} from "./components";
import { FINE_DINING_RESTAURANTS } from "./data";
import {
  generateBreadcrumbSchema,
  generateItemListSchema,
  JsonLd,
} from "@/lib/seo/structured-data";
import { generateDiningPageMetadata } from "@/lib/seo/metadata";

const featuredRestaurants = FINE_DINING_RESTAURANTS.slice(0, 5).map(
  (r) => r.name,
);
const featuredAreas = [
  ...new Set(FINE_DINING_RESTAURANTS.map((r) => r.area)),
].slice(0, 5);

export const metadata: Metadata = generateDiningPageMetadata(
  "Fine Dining",
  "fine-dining",
  {
    restaurantCount: FINE_DINING_RESTAURANTS.length,
    featuredRestaurants,
    featuredAreas,
  },
);

export default function FineDiningPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bestfoodwhere.sg" },
    { name: "Dining Styles", url: "https://bestfoodwhere.sg/dining" },
    { name: "Fine Dining", url: "https://bestfoodwhere.sg/dining/fine-dining" },
  ]);

  const restaurantListSchema = generateItemListSchema(
    FINE_DINING_RESTAURANTS.map((r, i) => ({
      name: r.name,
      url: `https://bestfoodwhere.sg/dining/fine-dining`,
      image: r.image || undefined,
      position: i + 1,
    })),
    "Fine Dining Restaurants in Singapore",
  );

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={restaurantListSchema} />
      <div className="min-h-screen bg-[#f9f9f9]">
        <HeroSection />

        <div className="mx-auto max-w-[1200px] px-5">
          <StatsSection />
          <RestaurantGrid restaurants={FINE_DINING_RESTAURANTS} />
          <DealsSection />
          <OtherCuisinesSection />
        </div>
      </div>
    </>
  );
}
