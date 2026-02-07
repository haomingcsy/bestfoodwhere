// Stripe integration types for BestFoodWhere advertising

export type PricingTier = "basic" | "featured" | "premium" | "enterprise";

export interface RestaurantInfo {
  restaurantName: string;
  contactName: string;
  email: string;
  phone: string;
  mallLocation: string;
  cuisineType: string;
  website?: string;
  description?: string;
}

export interface CheckoutRequest {
  tier: PricingTier;
  restaurantInfo: RestaurantInfo;
}

export interface CheckoutResponse {
  url?: string;
  error?: string;
}

export const PRICING_CONFIG: Record<
  PricingTier,
  {
    name: string;
    priceId?: string; // Stripe Price ID (set after creating products in Stripe)
    amount: number; // Amount in cents
    interval?: "month" | "year";
    features: string[];
  }
> = {
  basic: {
    name: "Basic Listing",
    amount: 0, // Free
    features: [
      "Basic restaurant profile",
      "Operating hours & location",
      "Cuisine category listing",
      "Contact information",
      "User reviews display",
    ],
  },
  featured: {
    name: "Featured Listing",
    priceId: process.env.STRIPE_PRICE_FEATURED,
    amount: 19900, // $199
    interval: "month",
    features: [
      "Everything in Basic",
      "Priority search placement",
      "Verified badge",
      "Up to 10 photos",
      "Menu highlights",
      "Special offers section",
      "Basic analytics",
    ],
  },
  premium: {
    name: "Premium Listing",
    priceId: process.env.STRIPE_PRICE_PREMIUM,
    amount: 49900, // $499
    interval: "month",
    features: [
      "Everything in Featured",
      "Homepage spotlight rotation",
      "Dedicated landing page",
      "Advanced analytics dashboard",
      "Category page banner",
      "Newsletter feature",
      "Priority support",
      "Social media promotion",
    ],
  },
  enterprise: {
    name: "Enterprise",
    amount: 0, // Custom pricing
    features: [
      "Multi-location management",
      "Bulk listing tools",
      "Custom branding options",
      "API access",
      "Dedicated account manager",
      "Custom reporting",
      "Co-marketing opportunities",
      "Exclusive partnerships",
    ],
  },
};
