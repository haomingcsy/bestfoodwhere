import type { Metadata } from "next";
import {
  HeroSection,
  StatsSection,
  RestaurantGrid,
  DealsSection,
  OtherCuisinesSection,
} from "./components";
import { FINE_DINING_RESTAURANTS } from "./data";

export const metadata: Metadata = {
  title: "Fine Dining in Singapore | BestFoodWhere.sg",
  description:
    "Discover the most exquisite fine dining restaurants in Singapore. From Michelin-starred establishments to celebrity chef restaurants, explore premium culinary experiences.",
  openGraph: {
    title: "Fine Dining in Singapore | BestFoodWhere.sg",
    description:
      "Discover the most exquisite fine dining restaurants in Singapore. From Michelin-starred establishments to celebrity chef restaurants.",
    type: "website",
  },
};

export default function FineDiningPage() {
  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <HeroSection />

      <div className="mx-auto max-w-[1200px] px-5">
        <StatsSection />
        <RestaurantGrid restaurants={FINE_DINING_RESTAURANTS} />
        <DealsSection />
        <OtherCuisinesSection />
      </div>
    </div>
  );
}
