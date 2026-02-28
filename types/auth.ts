import type { User, Session } from "@supabase/supabase-js";

// Account types
export type AccountType = "consumer" | "restaurant" | "admin";

// Subscription tiers for restaurants
export type SubscriptionTier = "basic" | "featured" | "premium" | "enterprise";
export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "trialing";

// Base profile (extends Supabase auth.users)
export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  account_type: AccountType;
  created_at: string;
  updated_at: string;
}

// Consumer-specific profile data
export interface ConsumerProfile {
  id: string;
  dietary_preferences: string[] | null;
  favorite_cuisines: string[] | null;
  email_notifications: boolean;
  deals_notifications: boolean;
}

// Restaurant-specific profile data
export interface RestaurantProfile {
  id: string;
  restaurant_name: string;
  contact_person: string;
  business_email: string | null;
  business_phone: string | null;
  mall_location: string | null;
  cuisine_type: string | null;
  website: string | null;
  description: string | null;
  stripe_customer_id: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus | null;
  subscription_id: string | null;
  ghl_contact_id: string | null;
  created_at: string;
  updated_at: string;
}

// Combined user with profile
export interface AuthUser {
  user: User;
  profile: Profile;
  consumerProfile?: ConsumerProfile;
  restaurantProfile?: RestaurantProfile;
}

// Auth state for context
export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Signup form data
export interface ConsumerSignupData {
  email: string;
  password: string;
  display_name: string;
  phone?: string;
  dietary_preferences?: string[];
  favorite_cuisines?: string[];
}

export interface RestaurantSignupData {
  email: string;
  password: string;
  display_name: string;
  restaurant_name: string;
  contact_person: string;
  business_phone: string;
  mall_location: string;
  cuisine_type: string;
  website?: string;
  description?: string;
  tier: SubscriptionTier;
}

// Login form data
export interface LoginData {
  email: string;
  password: string;
}

// Password reset
export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}
