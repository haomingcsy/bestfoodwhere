import type { Metadata } from "next";
import { generateDiningPageMetadata } from "@/lib/seo/metadata";
import { fetchRestaurantsByDiningStyle } from "@/lib/supabase-cuisine";
import CasualDiningClient from "./CasualDiningClient";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const restaurants = await fetchRestaurantsByDiningStyle("casual-dining");
  const featuredRestaurants = restaurants.slice(0, 5).map((r) => r.name);
  const featuredAreas = [
    ...new Set(restaurants.map((r) => r.area)),
  ].slice(0, 5);

  return generateDiningPageMetadata("Casual Dining", "casual-dining", {
    restaurantCount: restaurants.length,
    featuredRestaurants,
    featuredAreas,
  });
}

export default async function CasualDiningPage() {
  const restaurants = await fetchRestaurantsByDiningStyle("casual-dining");

  // Map CuisineRestaurant to the client's Restaurant type
  const clientRestaurants = restaurants.map((r) => ({
    name: r.name,
    rating: r.rating,
    reviews: r.reviews,
    location: r.location,
    tags: r.tags,
    image: r.image,
    description: r.description,
    area: r.area,
    tag: r.tag,
    address: r.address,
    phone: r.phone,
    hours: r.hours,
  }));

  return <CasualDiningClient restaurants={clientRestaurants} />;
}
