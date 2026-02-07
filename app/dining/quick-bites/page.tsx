import type { Metadata } from "next";
import {
  HeroSection,
  StatsSection,
  RestaurantGrid,
  DealsSection,
  OtherCuisinesSection,
} from "./components";
import { QUICK_BITES_RESTAURANTS } from "./data";

export const metadata: Metadata = {
  title: "Quick Bites in Singapore | BestFoodWhere.sg",
  description:
    "Discover the best quick bites and fast casual dining spots in Singapore. From local favorites like Ya Kun and Old Chang Kee to bubble tea chains and food courts.",
  openGraph: {
    title: "Quick Bites in Singapore | BestFoodWhere.sg",
    description:
      "Discover the best quick bites and fast casual dining spots in Singapore. Fast service, great value, and convenient locations.",
    type: "website",
  },
};

export default function QuickBitesPage() {
  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <HeroSection />

      <div className="mx-auto max-w-[1200px] px-5">
        <StatsSection />
        <RestaurantGrid restaurants={QUICK_BITES_RESTAURANTS} />
        <DealsSection />
        <OtherCuisinesSection />
      </div>
    </div>
  );
}
