import type { SingaporeArea } from "@/types/dining";

export interface CuisineRestaurant {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  tags: string[];
  image: string;
  description: string;
  area: SingaporeArea;
  tag: string;
  address: string;
  phone: string;
  hours: string;
  website?: string;
}

export interface CuisineDeal {
  id: string;
  badge: string;
  title: string;
  duration: string;
  description: string;
  code: string;
}

export interface CuisineFeature {
  label: string;
}

export interface CuisineStats {
  restaurants: number;
  menuItems: string;
  deals: number;
  malls: number;
}

export interface OtherCuisine {
  name: string;
  image: string;
  url: string;
}

export interface CuisineData {
  slug: string;
  name: string;
  tagline: string;
  features: CuisineFeature[];
  heroImages: string[];
  stats: CuisineStats;
  restaurants: CuisineRestaurant[];
  deals: CuisineDeal[];
  otherCuisines: OtherCuisine[];
}
