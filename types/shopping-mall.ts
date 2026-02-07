export interface OpeningHoursEntry {
  day: string;
  hours: string;
  isToday?: boolean;
}

export interface MRTStation {
  name: string;
  line: string;
  lineCode: string;
  lineColor: string;
  walkTime: string;
}

export interface ParkingInfo {
  period: string;
  rate: string;
}

export interface GettingHere {
  mrt: MRTStation[];
  bus: string[];
  parking: ParkingInfo[];
}

export interface ShoppingMall {
  id: string;
  slug: string;
  name: string;
  description: string;
  heroImageUrl: string;
  logoUrl?: string;
  address: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  openingHours: OpeningHoursEntry[];
  gettingHere: GettingHere;
  mapEmbedUrl?: string;
  latitude?: number;
  longitude?: number;
  restaurantCount: number;
  cuisineCount?: number;
  diningOptionsCount?: number;
  badge?: string;
  region?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MallRestaurant {
  id: string;
  mallId: string;
  mallSlug: string;
  slug: string;
  name: string;
  unit: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  cuisines: string[];
  diningStyles: string[];
  description: string;
  openingHours: string;
  phone?: string;
  website?: string;
  isOpen?: boolean;
  diningOptions: string[];
  hasMenuPage: boolean;
  latitude?: number;
  longitude?: number;
}

export interface MallSummary {
  slug: string;
  name: string;
  imageUrl: string;
  region?: string;
  restaurantCount: number;
  cuisineCount?: number;
  badge?: string;
}

export interface RestaurantFilters {
  search?: string;
  cuisine?: string;
  priceRange?: string;
  openNow?: boolean;
  diningStyle?: string;
}

// MRT line colors for Singapore
export const MRT_LINE_COLORS: Record<string, string> = {
  "North-South Line": "#d42e12",
  NSL: "#d42e12",
  NS: "#d42e12",
  "East-West Line": "#009645",
  EWL: "#009645",
  EW: "#009645",
  "Circle Line": "#fa9e0d",
  CCL: "#fa9e0d",
  CC: "#fa9e0d",
  "Downtown Line": "#005ec4",
  DTL: "#005ec4",
  DT: "#005ec4",
  "North East Line": "#9900aa",
  NEL: "#9900aa",
  NE: "#9900aa",
  "Thomson-East Coast Line": "#9d5b25",
  TEL: "#9d5b25",
  TE: "#9d5b25",
};

// Price range options
export const PRICE_RANGES = [
  { value: "budget", label: "Budget", description: "Under $15" },
  { value: "mid", label: "Mid-range", description: "$15-30" },
  { value: "premium", label: "Premium", description: "$30-50" },
  { value: "fine", label: "Fine Dining", description: "$50+" },
];

// Common cuisine categories
export const CUISINE_CATEGORIES = [
  "Chinese",
  "Japanese",
  "Korean",
  "Western",
  "Italian",
  "American",
  "Thai",
  "Vietnamese",
  "Indian",
  "Malay",
  "Indonesian",
  "Local",
  "Seafood",
  "Fast Food",
  "Cafe",
  "Dessert",
  "Bubble Tea",
  "Food Court",
];

// Dining style options
export const DINING_STYLES = [
  "Casual Dining",
  "Fine Dining",
  "Quick Bites",
  "Family Friendly",
  "Late Night Dining",
  "Takeaway",
  "Delivery",
];
