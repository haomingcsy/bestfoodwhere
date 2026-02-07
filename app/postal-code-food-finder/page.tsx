import type { Metadata } from "next";
import { PostalCodeFoodFinder } from "@/components/sections/PostalCodeFoodFinder";

export const metadata: Metadata = {
  title: "Find Food Near You | BestFoodWhere",
  description:
    "Discover delicious food options near your location. Enter your postal code or use GPS to find restaurants and menu items close to you in Singapore.",
  openGraph: {
    title: "Find Food Near You | BestFoodWhere",
    description:
      "Discover delicious food options near your location. Enter your postal code or use GPS to find restaurants and menu items close to you in Singapore.",
  },
};

export default function PostalCodeFoodFinderPage() {
  return <PostalCodeFoodFinder />;
}
