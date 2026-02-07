import type { Metadata } from "next";
import { CuisinesPageClient } from "./CuisinesPageClient";

export const metadata: Metadata = {
  title: "All Cuisines in Singapore | BestFoodWhere.sg",
  description:
    "Explore all 19 cuisine types in Singapore. From Japanese and Korean to Local and Western, discover 671+ restaurants and 12,000+ menu items across the island.",
  openGraph: {
    title: "All Cuisines in Singapore | BestFoodWhere.sg",
    description:
      "Explore all cuisines in Singapore. Find your favorite food from Japanese to Local delights.",
    type: "website",
  },
};

export default function CuisinesPage() {
  return <CuisinesPageClient />;
}
