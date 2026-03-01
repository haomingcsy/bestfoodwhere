"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { IconMail, IconUsers, IconPhone } from "@/components/layout/icons";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { AuthDivider } from "./AuthDivider";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { PRICING_CONFIG, type PricingTier } from "@/lib/stripe/types";
import { CUISINE_TYPES } from "@/types/restaurant";
import type { ShoppingMall } from "@/types/restaurant";

interface FormState {
  email: string;
  password: string;
  contactPerson: string;
  restaurantName: string;
  businessPhone: string;
  mallLocation: string;
  cuisineType: string;
  website: string;
  description: string;
  selectedTier: PricingTier;
}

export function RestaurantSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOAuthUser = searchParams.get("oauth") === "true";
  const initialStep = searchParams.get("step")
    ? parseInt(searchParams.get("step")!)
    : 1;

  const [step, setStep] = useState(isOAuthUser ? Math.max(initialStep, 2) : 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [malls, setMalls] = useState<ShoppingMall[]>([]);
  const [mallsLoading, setMallsLoading] = useState(true);
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    contactPerson: "",
    restaurantName: "",
    businessPhone: "",
    mallLocation: "",
    cuisineType: "",
    website: "",
    description: "",
    selectedTier: "basic",
  });

  // Fetch malls from database
  useEffect(() => {
    const fetchMalls = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("shopping_malls")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (data) {
        setMalls(data);
      }
      setMallsLoading(false);
    };

    fetchMalls();
  }, []);

  // For OAuth users, pre-fill contact person from their profile
  useEffect(() => {
    if (isOAuthUser) {
      const loadUserData = async () => {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setForm((prev) => ({
            ...prev,
            email: user.email || "",
            contactPerson:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              prev.contactPerson,
          }));
        }
      };
      loadUserData();
    }
  }, [isOAuthUser]);

  const validateStep = (currentStep: number): boolean => {
    setError(null);

    if (currentStep === 1) {
      if (!form.email.includes("@")) {
        setError("Please enter a valid email address.");
        return false;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (form.contactPerson.trim().length < 2) {
        setError("Please enter contact person name.");
        return false;
      }
      if (form.restaurantName.trim().length < 2) {
        setError("Please enter restaurant name.");
        return false;
      }
      if (!form.businessPhone.trim()) {
        setError("Please enter business phone number.");
        return false;
      }
    }

    if (currentStep === 3) {
      if (!form.mallLocation) {
        setError("Please select a mall location.");
        return false;
      }
      if (!form.cuisineType) {
        setError("Please select a cuisine type.");
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      if (step < 4) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      let userId: string;

      if (isOAuthUser) {
        // OAuth user - already authenticated, just get their ID
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Session expired. Please sign in again.");
          router.push("/login");
          return;
        }
        userId = user.id;

        // Update the existing profile with phone
        await supabase
          .from("profiles")
          .update({
            display_name: form.contactPerson.trim(),
            phone: form.businessPhone.trim() || null,
          })
          .eq("id", userId);
      } else {
        // Regular signup - create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: form.email.trim(),
            password: form.password,
            options: {
              data: {
                display_name: form.contactPerson.trim(),
              },
            },
          },
        );

        if (authError) {
          if (authError.message.includes("already registered")) {
            setError(
              "This email is already registered. Please sign in instead.",
            );
          } else {
            setError(authError.message);
          }
          setIsLoading(false);
          return;
        }

        if (!authData.user) {
          setError("Failed to create account. Please try again.");
          setIsLoading(false);
          return;
        }

        userId = authData.user.id;

        // Create profile for new user
        await supabase.from("profiles").insert({
          id: userId,
          email: form.email.trim(),
          display_name: form.contactPerson.trim(),
          phone: form.businessPhone.trim() || null,
          account_type: "restaurant",
        });
      }

      // Create restaurant profile (for both OAuth and regular users)
      await supabase.from("restaurant_profiles").insert({
        id: userId,
        restaurant_name: form.restaurantName.trim(),
        contact_person: form.contactPerson.trim(),
        business_email: form.email.trim(),
        business_phone: form.businessPhone.trim(),
        mall_location: form.mallLocation,
        cuisine_type: form.cuisineType,
        website: form.website.trim() || null,
        description: form.description.trim() || null,
        subscription_tier: form.selectedTier,
        subscription_status: form.selectedTier === "basic" ? "active" : null,
      });

      // Sync with GHL
      try {
        const params = typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams();

        await fetch("/api/crm/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email.trim(),
            name: form.contactPerson.trim(),
            phone: form.businessPhone.trim(),
            source: "bfw_restaurant_signup",
            tags: ["restaurant", form.selectedTier],
            pageUrl: typeof window !== "undefined" ? window.location.href : "",
            utm_source: params.get("utm_source") || "",
            utm_medium: params.get("utm_medium") || "",
            utm_campaign: params.get("utm_campaign") || "",
            utm_content: params.get("utm_content") || "",
            utm_term: params.get("utm_term") || "",
            referrer: document.referrer,
          }),
        });
      } catch {
        // CRM sync failure is non-critical
      }

      // For paid tiers, redirect to Stripe checkout
      if (form.selectedTier !== "basic") {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tier: form.selectedTier,
            restaurantInfo: {
              restaurantName: form.restaurantName.trim(),
              contactName: form.contactPerson.trim(),
              email: form.email.trim(),
              phone: form.businessPhone.trim(),
              mallLocation: form.mallLocation,
              cuisineType: form.cuisineType,
              website: form.website.trim(),
              description: form.description.trim(),
            },
          }),
        });

        const { url, error: checkoutError } = await response.json();

        if (checkoutError) {
          setError(checkoutError);
          setIsLoading(false);
          return;
        }

        if (url) {
          window.location.href = url;
          return;
        }
      }

      // For basic tier, go directly to dashboard
      router.push("/restaurant/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    if (amount === 0) return "Free";
    return `$${(amount / 100).toFixed(0)}/mo`;
  };

  return (
    <div className="w-full max-w-lg">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-bold text-gray-900">
            List Your Restaurant
          </h1>
          <p className="mt-2 font-body text-sm text-gray-600">
            Reach thousands of food lovers in Singapore
          </p>
        </div>

        {/* Step indicators */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {(isOAuthUser ? [2, 3, 4] : [1, 2, 3, 4]).map((s, index) => (
            <div
              key={s}
              className={`flex h-8 w-8 items-center justify-center rounded-full font-heading text-sm font-semibold transition-colors ${
                s === step
                  ? "bg-bfw-orange text-white"
                  : s < step
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {s < step ? (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <GoogleSignInButton
              redirectTo="/restaurant/dashboard"
              intent="signup"
            />
            <AuthDivider />
          </>
        )}

        <div className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <IconMail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="you@restaurant.com"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    placeholder="Create a password"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
                  />
                </div>
                <PasswordStrengthIndicator password={form.password} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
                  Contact Person
                </label>
                <div className="relative">
                  <IconUsers className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.contactPerson}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, contactPerson: e.target.value }))
                    }
                    placeholder="Your name"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
                  Restaurant Name
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <input
                    type="text"
                    value={form.restaurantName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, restaurantName: e.target.value }))
                    }
                    placeholder="Restaurant name"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
                  Business Phone
                </label>
                <div className="relative">
                  <IconPhone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={form.businessPhone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, businessPhone: e.target.value }))
                    }
                    placeholder="+65 6XXX XXXX"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
                  Mall Location
                </label>
                <select
                  value={form.mallLocation}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, mallLocation: e.target.value }))
                  }
                  disabled={mallsLoading}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20 disabled:opacity-60"
                >
                  <option value="">
                    {mallsLoading ? "Loading malls..." : "Select a mall"}
                  </option>
                  {malls.map((mall) => (
                    <option key={mall.id} value={mall.name}>
                      {mall.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
                  Cuisine Type
                </label>
                <select
                  value={form.cuisineType}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, cuisineType: e.target.value }))
                  }
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
                >
                  <option value="">Select cuisine type</option>
                  {CUISINE_TYPES.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
                  Website{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, website: e.target.value }))
                  }
                  placeholder="https://yourrestaurant.com"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
                />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <p className="mb-4 text-center font-body text-sm text-gray-600">
                Choose your listing plan
              </p>
              <div className="space-y-3">
                {(Object.keys(PRICING_CONFIG) as PricingTier[])
                  .filter((tier) => tier !== "enterprise")
                  .map((tier) => {
                    const config = PRICING_CONFIG[tier];
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() =>
                          setForm((p) => ({ ...p, selectedTier: tier }))
                        }
                        className={`w-full rounded-xl border-2 p-4 text-left transition ${
                          form.selectedTier === tier
                            ? "border-bfw-orange bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-heading font-semibold text-gray-900">
                              {config.name}
                            </span>
                            {tier === "featured" && (
                              <span className="ml-2 rounded-full bg-bfw-orange px-2 py-0.5 text-xs font-medium text-white">
                                Popular
                              </span>
                            )}
                          </div>
                          <span className="font-heading text-lg font-bold text-bfw-orange">
                            {formatPrice(config.amount)}
                          </span>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {config.features.slice(0, 3).map((feature, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-sm text-gray-600"
                            >
                              <svg
                                className="h-4 w-4 text-green-500"
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
                      </button>
                    );
                  })}
              </div>
            </>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={nextStep}
            disabled={isLoading}
            className="w-full rounded-xl bg-bfw-orange py-3 font-heading text-base font-semibold text-white transition hover:bg-bfw-orange/90 disabled:opacity-60"
          >
            {isLoading
              ? form.selectedTier === "basic"
                ? "Creating listing..."
                : "Proceeding to checkout..."
              : step === 4
                ? form.selectedTier === "basic"
                  ? "Create Free Listing"
                  : "Continue to Payment"
                : isOAuthUser
                  ? `Continue - Step ${step - 1}/3`
                  : `Continue - Step ${step}/4`}
          </button>

          {step > (isOAuthUser ? 2 : 1) && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="w-full py-2 font-body text-sm text-gray-500 transition hover:text-gray-700"
            >
              ← Go back
            </button>
          )}
        </div>

        <p className="mt-6 text-center font-body text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-bfw-orange hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
