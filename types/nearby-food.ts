export interface Coordinates {
  lat: number;
  lng: number;
}

export interface NearbyRestaurant {
  brandName: string;
  brandSlug: string;
  locationName: string;
  locationSlug: string;
  imageUrl: string;
  distance: number;
  address: string;
  rating: number;
  reviewCount: number;
  cuisine: string[];
  diningStyle: string[];
  priceRange?: string;
  menuItemCount: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  source: "gps" | "postalCode";
  postalCode?: string;
}

export interface NearbyFoodResponse {
  restaurants: NearbyRestaurant[];
  userLocation: Coordinates;
  radius: number;
  total: number;
  hasMore: boolean;
}

export interface NearbyFoodError {
  error: string;
  code:
    | "INVALID_POSTAL_CODE"
    | "GEOCODING_FAILED"
    | "NO_RESULTS"
    | "SERVER_ERROR";
}
