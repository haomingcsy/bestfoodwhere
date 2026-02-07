import { Metadata } from "next";
import { MallHeroSearch } from "@/components/sections/mall/MallHeroSearch";
import { MallStatsCarousel } from "@/components/sections/mall/MallStatsCarousel";
import { MallDirectory } from "@/components/sections/mall/MallDirectory";

export const metadata: Metadata = {
  title: "Shopping Malls | BestFoodWhere",
  description:
    "Discover the best food and restaurants in Singapore's shopping malls. Browse our comprehensive directory of dining options across popular malls.",
};

export default function ShoppingMallsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-100 to-gray-50 py-12 md:py-16">
        <div className="container max-w-4xl mx-auto text-center px-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Discover Singapore&apos;s Top Malls
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-6 max-w-2xl mx-auto font-medium">
            Find the best restaurants, cafes, and shops in Singapore&apos;s
            shopping malls. Explore over 2,500+ dining options in 7 major areas.
          </p>
          <MallHeroSearch />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50">
        <MallStatsCarousel />
      </section>

      {/* Mall Directory */}
      <section className="py-8 md:py-12">
        <MallDirectory />
      </section>
    </main>
  );
}
