export interface LocationInfo {
  slug: string;
  name: string;
  address: string;
  phone: string;
  reviews: { rating: number; count: number };
  openingHours: string;
  website: string;
  imageUrl: string;
  heroImageUrl?: string;
  priceRange?: string;
  details?: string;
  distance?: string;
  cuisine: string[];
  diningStyle: string[];
  description?: string;
  amenities?: Amenity[];
  descriptionMissing?: boolean;
  amenitiesMissing?: boolean;
}

export interface MenuItem {
  name: string;
  description?: string;
  imageUrl: string;
  price?: string;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface Review {
  author: string;
  rating: number;
  date: string;
  content: string;
}

export interface ReviewSummary {
  location: string;
  rating: number;
  totalReviews: number;
  reviews: Review[];
}

export interface RelatedBrand {
  name: string;
  slug: string;
  location: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  openingHours: string;
  price?: string;
  unit?: string;
  cuisines?: string[];
  diningStyles?: string[];
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

export interface Amenity {
  label: string;
}

export interface BrandData {
  name: string;
  slug: string;
  locations: LocationInfo[];
  description: string;
  amenities: Amenity[];
  menu: MenuCategory[];
  youtubeUrl?: string;
  reviews: ReviewSummary[];
  relatedBrands: Record<string, RelatedBrand[]>;
  socialLinks: SocialLinks;
  promotions: string[];
  recommendations: string[];
  coupons?: string[];
  descriptionMissing?: boolean;
  amenitiesMissing?: boolean;
}
