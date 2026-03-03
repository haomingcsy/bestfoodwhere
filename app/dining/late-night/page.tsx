import type { Metadata } from "next";
import {
  HeroSection,
  StatsSection,
  RestaurantGrid,
  DealsSection,
  OtherCuisinesSection,
} from "./components";
import { LATE_NIGHT_RESTAURANTS } from "./data";
import {
  generateBreadcrumbSchema,
  generateItemListSchema,
  JsonLd,
} from "@/lib/seo/structured-data";
import { generateDiningPageMetadata } from "@/lib/seo/metadata";

const featuredRestaurants = LATE_NIGHT_RESTAURANTS.slice(0, 5).map(
  (r) => r.name,
);
const featuredAreas = [
  ...new Set(LATE_NIGHT_RESTAURANTS.map((r) => r.area)),
].slice(0, 5);

export const metadata: Metadata = generateDiningPageMetadata(
  "Late Night",
  "late-night",
  {
    restaurantCount: LATE_NIGHT_RESTAURANTS.length,
    featuredRestaurants,
    featuredAreas,
  },
);

export default function LateNightPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bestfoodwhere.sg" },
    { name: "Dining Styles", url: "https://bestfoodwhere.sg/dining" },
    { name: "Late Night", url: "https://bestfoodwhere.sg/dining/late-night" },
  ]);

  const restaurantListSchema = generateItemListSchema(
    LATE_NIGHT_RESTAURANTS.map((r, i) => ({
      name: r.name,
      url: `https://bestfoodwhere.sg/dining/late-night`,
      image: r.image || undefined,
      position: i + 1,
    })),
    "Late Night Restaurants in Singapore",
  );

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={restaurantListSchema} />
      <div className="min-h-screen bg-[#f9f9f9]">
        <HeroSection />

        <div className="mx-auto max-w-[1200px] px-5">
          <StatsSection />
          <RestaurantGrid restaurants={LATE_NIGHT_RESTAURANTS} />
          <DealsSection />
          <OtherCuisinesSection />
        </div>
      </div>
    </>
  );
}
