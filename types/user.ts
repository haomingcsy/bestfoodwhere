// User favorites
export interface Favorite {
  id: string;
  user_id: string;
  brand_slug: string;
  location_slug: string | null;
  created_at: string;
}

// User reviews
export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  user_id: string;
  brand_slug: string;
  location_slug: string | null;
  rating: number; // 1-5
  title: string | null;
  content: string | null;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

// Saved deals
export interface SavedDeal {
  id: string;
  user_id: string;
  deal_id: string;
  created_at: string;
}

// Review form data
export interface CreateReviewData {
  brand_slug: string;
  location_slug?: string;
  rating: number;
  title?: string;
  content?: string;
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  content?: string;
}

// Profile update data
export interface UpdateProfileData {
  display_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface UpdateConsumerProfileData {
  dietary_preferences?: string[];
  favorite_cuisines?: string[];
  email_notifications?: boolean;
  deals_notifications?: boolean;
}

export interface UpdateRestaurantProfileData {
  restaurant_name?: string;
  contact_person?: string;
  business_email?: string;
  business_phone?: string;
  mall_location?: string;
  cuisine_type?: string;
  website?: string;
  description?: string;
}

// Dashboard stats
export interface ConsumerDashboardStats {
  favoritesCount: number;
  reviewsCount: number;
  savedDealsCount: number;
}

export interface RestaurantDashboardStats {
  totalViews: number;
  totalClicks: number;
  reviewsCount: number;
  averageRating: number;
}
