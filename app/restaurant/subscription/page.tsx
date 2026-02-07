"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PRICING_CONFIG, type PricingTier } from "@/lib/stripe/types";

export default function SubscriptionPage() {
  const [currentTier, setCurrentTier] = useState<PricingTier>("basic");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("restaurant_profiles")
          .select("subscription_tier")
          .eq("id", user.id)
          .single();

        if (data?.subscription_tier) {
          setCurrentTier(data.subscription_tier as PricingTier);
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleUpgrade = async (tier: PricingTier) => {
    if (tier === "basic" || tier === currentTier) return;

    setIsUpgrading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const { url, error } = await response.json();

      if (error) {
        alert(error);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("Failed to start upgrade. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const formatPrice = (amount: number) => {
    if (amount === 0) return "Free";
    return `$${(amount / 100).toFixed(0)}/mo`;
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-bfw-orange border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Subscription
        </h1>
        <p className="mt-1 font-body text-gray-600">Manage your listing plan</p>
      </div>

      {/* Current plan */}
      <div className="rounded-xl border-2 border-bfw-orange bg-orange-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-sm text-bfw-orange">Current Plan</p>
            <p className="font-heading text-xl font-bold text-gray-900">
              {PRICING_CONFIG[currentTier].name}
            </p>
          </div>
          <div className="text-right">
            <p className="font-heading text-2xl font-bold text-bfw-orange">
              {formatPrice(PRICING_CONFIG[currentTier].amount)}
            </p>
          </div>
        </div>
      </div>

      {/* Available plans */}
      <div className="grid gap-4 lg:grid-cols-3">
        {(["basic", "featured", "premium"] as PricingTier[]).map((tier) => {
          const config = PRICING_CONFIG[tier];
          const isCurrent = tier === currentTier;
          const isDowngrade =
            (currentTier === "premium" && tier !== "premium") ||
            (currentTier === "featured" && tier === "basic");

          return (
            <div
              key={tier}
              className={`rounded-xl border-2 p-6 ${
                isCurrent
                  ? "border-bfw-orange bg-orange-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-semibold text-gray-900">
                  {config.name}
                </h3>
                {tier === "featured" && !isCurrent && (
                  <span className="rounded-full bg-bfw-orange px-2 py-0.5 text-xs font-medium text-white">
                    Popular
                  </span>
                )}
              </div>

              <p className="mt-2 font-heading text-2xl font-bold text-gray-900">
                {formatPrice(config.amount)}
              </p>

              <ul className="mt-4 space-y-2">
                {config.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleUpgrade(tier)}
                disabled={isCurrent || isDowngrade || isUpgrading}
                className={`mt-6 w-full rounded-xl py-3 font-heading text-sm font-semibold transition ${
                  isCurrent
                    ? "bg-gray-100 text-gray-500"
                    : isDowngrade
                      ? "bg-gray-100 text-gray-400"
                      : "bg-bfw-orange text-white hover:bg-bfw-orange/90"
                } disabled:cursor-not-allowed`}
              >
                {isCurrent
                  ? "Current Plan"
                  : isDowngrade
                    ? "Contact Support"
                    : isUpgrading
                      ? "Loading..."
                      : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Enterprise */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-semibold text-gray-900">
              Enterprise
            </h3>
            <p className="mt-1 font-body text-sm text-gray-600">
              Multi-location management, API access, and custom solutions
            </p>
          </div>
          <a
            href="/contact-us"
            className="rounded-xl border border-bfw-orange px-6 py-3 font-heading text-sm font-semibold text-bfw-orange transition hover:bg-orange-50"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </div>
  );
}
