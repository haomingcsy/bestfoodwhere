import Stripe from "stripe";

// Lazily initialized Stripe client (created at runtime, not build time)
let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return stripeClient;
}

// Legacy export for backwards compatibility
export const stripe = {
  get customers() {
    return getStripeClient().customers;
  },
  get checkout() {
    return getStripeClient().checkout;
  },
  get webhooks() {
    return getStripeClient().webhooks;
  },
};

// Helper to get base URL for redirects
export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:4007";
}
