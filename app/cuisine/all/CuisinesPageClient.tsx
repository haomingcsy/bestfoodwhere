"use client";

import { useState, useMemo } from "react";
import {
  HeroSection,
  StatsSection,
  SearchSection,
  CuisineGrid,
  FeaturedRestaurantsSection,
  DealsSection,
  DeliverySection,
  NewsletterTrendingSection,
  RestaurantOwnersSection,
} from "./components";
import { CUISINES } from "./data";

export function CuisinesPageClient() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCuisines = useMemo(() => {
    if (!searchTerm) return CUISINES;
    const term = searchTerm.toLowerCase();
    return CUISINES.filter(
      (cuisine) =>
        cuisine.name.toLowerCase().includes(term) ||
        cuisine.description.toLowerCase().includes(term),
    );
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <HeroSection />

      <div className="mx-auto max-w-[1200px] px-5">
        <StatsSection />
        <SearchSection onSearch={setSearchTerm} />
        <CuisineGrid cuisines={filteredCuisines} />
        <FeaturedRestaurantsSection />
        <DealsSection />
        <DeliverySection />
        <NewsletterTrendingSection />
        <RestaurantOwnersSection />
      </div>
    </div>
  );
}
