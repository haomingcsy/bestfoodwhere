import { Hero } from "@/components/sections/Hero";
import { PostalCodeFinder } from "@/components/sections/PostalCodeFinder";
import { PopularShoppingMalls } from "@/components/sections/PopularShoppingMalls";
import { ExploreByCuisine } from "@/components/sections/ExploreByCuisine";
import { DiningOptions } from "@/components/sections/DiningOptions";
import { LatestFoodDeals } from "@/components/sections/LatestFoodDeals";
import { RecipeCategories } from "@/components/sections/RecipeCategories";
import { TrustSignals } from "@/components/sections/TrustSignals";

export default function Home() {
  return (
    <div>
      <Hero />
      <TrustSignals />
      <PostalCodeFinder />
      <PopularShoppingMalls />
      <ExploreByCuisine />
      <DiningOptions />
      <LatestFoodDeals />
      <RecipeCategories />
    </div>
  );
}
