import { NextRequest, NextResponse } from "next/server";
import { stripe, getBaseUrl } from "@/lib/stripe/client";
import type { CheckoutRequest, PricingTier } from "@/lib/stripe/types";

// Pricing amounts in cents (SGD)
const PRICING: Record<PricingTier, { amount: number; name: string }> = {
  basic: { amount: 0, name: "Basic Listing" },
  featured: { amount: 19900, name: "Featured Listing" },
  premium: { amount: 49900, name: "Premium Listing" },
  enterprise: { amount: 0, name: "Enterprise" },
};

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { tier, restaurantInfo } = body;

    // Validate required fields
    if (
      !restaurantInfo.restaurantName ||
      !restaurantInfo.email ||
      !restaurantInfo.contactName
    ) {
      return NextResponse.json(
        { error: "Missing required restaurant information" },
        { status: 400 },
      );
    }

    const pricing = PRICING[tier];
    if (!pricing) {
      return NextResponse.json(
        { error: "Invalid pricing tier" },
        { status: 400 },
      );
    }

    const baseUrl = getBaseUrl();

    // For free tier or enterprise (custom), submit directly without payment
    if (tier === "basic" || tier === "enterprise") {
      // Store the submission in your database or send to GHL/n8n
      // For now, we'll redirect to success with the submission info
      const params = new URLSearchParams({
        tier,
        restaurant: restaurantInfo.restaurantName,
        email: restaurantInfo.email,
      });

      return NextResponse.json({
        url: `${baseUrl}/advertise/success?${params.toString()}`,
      });
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: restaurantInfo.email,
      name: restaurantInfo.contactName,
      phone: restaurantInfo.phone,
      metadata: {
        restaurant_name: restaurantInfo.restaurantName,
        mall_location: restaurantInfo.mallLocation,
        cuisine_type: restaurantInfo.cuisineType,
        website: restaurantInfo.website || "",
        description: restaurantInfo.description || "",
        tier,
      },
    });

    // Create checkout session for paid tiers
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "sgd",
            product_data: {
              name: `BestFoodWhere ${pricing.name}`,
              description: `Monthly subscription for ${restaurantInfo.restaurantName}`,
              images: ["https://bestfoodwhere.sg/brand/logo.svg"],
            },
            unit_amount: pricing.amount,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/advertise/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${baseUrl}/advertise?canceled=true`,
      metadata: {
        restaurant_name: restaurantInfo.restaurantName,
        contact_name: restaurantInfo.contactName,
        email: restaurantInfo.email,
        phone: restaurantInfo.phone,
        mall_location: restaurantInfo.mallLocation,
        cuisine_type: restaurantInfo.cuisineType,
        tier,
      },
      subscription_data: {
        metadata: {
          restaurant_name: restaurantInfo.restaurantName,
          tier,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
