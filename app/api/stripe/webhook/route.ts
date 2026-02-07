import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Create Supabase client with service role for webhook operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Helper to find user by Stripe customer ID or email
async function findUserByStripeCustomer(
  customerId: string,
): Promise<string | null> {
  // First check restaurant_profiles for stripe_customer_id
  const { data: restaurant } = await supabase
    .from("restaurant_profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (restaurant) {
    return restaurant.id;
  }

  // Fall back to looking up customer email
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;

    const email = (customer as Stripe.Customer).email;
    if (!email) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    return profile?.id || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout completed:", session.id);

      const metadata = session.metadata;
      if (metadata && session.customer) {
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer.id;

        // Find user by email from metadata
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", metadata.email)
          .single();

        if (profile) {
          // Update restaurant_profiles with Stripe info
          await supabase
            .from("restaurant_profiles")
            .update({
              stripe_customer_id: customerId,
              subscription_tier: metadata.tier,
              subscription_status: "active",
              restaurant_name: metadata.restaurant_name,
              contact_person: metadata.contact_name,
              business_email: metadata.email,
              business_phone: metadata.phone,
              mall_location: metadata.mall_location,
              cuisine_type: metadata.cuisine_type,
            })
            .eq("id", profile.id);

          console.log(
            `Updated restaurant profile for ${metadata.restaurant_name}`,
          );
        }
      }
      break;
    }

    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription created:", subscription.id);

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const userId = await findUserByStripeCustomer(customerId);
      if (userId) {
        await supabase
          .from("restaurant_profiles")
          .update({
            subscription_id: subscription.id,
            subscription_status: subscription.status,
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(
        "Subscription updated:",
        subscription.id,
        subscription.status,
      );

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const userId = await findUserByStripeCustomer(customerId);
      if (userId) {
        // Map Stripe status to our status
        let status = subscription.status;
        if (subscription.cancel_at_period_end) {
          status = "canceled";
        }

        await supabase
          .from("restaurant_profiles")
          .update({
            subscription_status: status,
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription canceled:", subscription.id);

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const userId = await findUserByStripeCustomer(customerId);
      if (userId) {
        await supabase
          .from("restaurant_profiles")
          .update({
            subscription_status: "canceled",
          })
          .eq("id", userId);
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("Payment succeeded:", invoice.id);

      if (!invoice.customer) break;

      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer.id;

      const userId = await findUserByStripeCustomer(customerId);

      // Extract payment intent and subscription IDs from invoice
      // Using Record type to handle Stripe API version differences
      const invoiceData = invoice as unknown as Record<string, unknown>;
      const rawPaymentIntent = invoiceData.payment_intent;
      const rawSubscription = invoiceData.subscription;

      const paymentIntentId =
        typeof rawPaymentIntent === "string"
          ? rawPaymentIntent
          : ((rawPaymentIntent as { id?: string } | null)?.id ?? null);
      const subscriptionId =
        typeof rawSubscription === "string"
          ? rawSubscription
          : ((rawSubscription as { id?: string } | null)?.id ?? null);

      // Record the payment
      const paymentData = {
        user_id: userId,
        stripe_invoice_id: invoice.id,
        stripe_payment_id: paymentIntentId,
        stripe_subscription_id: subscriptionId,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: "succeeded" as const,
        description:
          invoice.lines.data[0]?.description || "Subscription payment",
        metadata: {
          invoice_number: invoice.number,
          billing_reason: invoice.billing_reason,
          period_start: invoice.period_start,
          period_end: invoice.period_end,
        },
      };

      const { error } = await supabase.from("payments").insert(paymentData);

      if (error) {
        console.error("Failed to record payment:", error);
      } else {
        console.log(
          `Recorded payment of ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`,
        );
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("Payment failed:", invoice.id);

      if (!invoice.customer) break;

      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer.id;

      const userId = await findUserByStripeCustomer(customerId);

      // Extract payment intent and subscription IDs from invoice
      // Using Record type to handle Stripe API version differences
      const failedInvoiceData = invoice as unknown as Record<string, unknown>;
      const failedRawPaymentIntent = failedInvoiceData.payment_intent;
      const failedRawSubscription = failedInvoiceData.subscription;

      const failedPaymentIntentId =
        typeof failedRawPaymentIntent === "string"
          ? failedRawPaymentIntent
          : ((failedRawPaymentIntent as { id?: string } | null)?.id ?? null);
      const failedSubscriptionId =
        typeof failedRawSubscription === "string"
          ? failedRawSubscription
          : ((failedRawSubscription as { id?: string } | null)?.id ?? null);

      // Record the failed payment
      const paymentData = {
        user_id: userId,
        stripe_invoice_id: invoice.id,
        stripe_payment_id: failedPaymentIntentId,
        stripe_subscription_id: failedSubscriptionId,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: "failed" as const,
        description:
          invoice.lines.data[0]?.description || "Subscription payment",
        metadata: {
          invoice_number: invoice.number,
          billing_reason: invoice.billing_reason,
        },
      };

      await supabase.from("payments").insert(paymentData);

      // Update subscription status to past_due
      if (userId) {
        await supabase
          .from("restaurant_profiles")
          .update({
            subscription_status: "past_due",
          })
          .eq("id", userId);
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      console.log("Charge refunded:", charge.id);

      // Update payment status to refunded
      if (charge.payment_intent) {
        await supabase
          .from("payments")
          .update({ status: "refunded" })
          .eq("stripe_payment_id", charge.payment_intent);
      }
      break;
    }

    case "customer.created": {
      const customer = event.data.object as Stripe.Customer;
      console.log("Customer created:", customer.id, customer.email);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
