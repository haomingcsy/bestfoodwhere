import type { Metadata } from "next";
import {
  HeroSection,
  StatsSection,
  RestaurantGrid,
  DealsSection,
  OtherCuisinesSection,
} from "./components";
import { LATE_NIGHT_RESTAURANTS } from "./data";

export const metadata: Metadata = {
  title: "Late Night Dining in Singapore | BestFoodWhere.sg",
  description:
    "Discover the best late-night dining spots in Singapore. From rooftop bars and cocktail lounges to 24-hour hot pot and supper spots, explore venues open past midnight.",
  openGraph: {
    title: "Late Night Dining in Singapore | BestFoodWhere.sg",
    description:
      "Discover the best late-night dining spots in Singapore. Bars, lounges, and restaurants open past midnight.",
    type: "website",
  },
};

export default function LateNightPage() {
  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <HeroSection />

      <div className="mx-auto max-w-[1200px] px-5">
        <StatsSection />
        <RestaurantGrid restaurants={LATE_NIGHT_RESTAURANTS} />
        <DealsSection />
        <OtherCuisinesSection />
      </div>
    </div>
  );
}
