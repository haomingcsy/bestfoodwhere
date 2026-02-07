"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { IconUsers } from "@/components/layout/icons";

interface AccountTypeCardProps {
  type: "consumer" | "restaurant";
  title: string;
  description: string;
  benefits: string[];
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

function AccountTypeCard({
  title,
  description,
  benefits,
  icon,
  isSelected,
  onClick,
}: AccountTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col rounded-2xl border-2 bg-white p-6 text-left shadow-sm transition ${
        isSelected
          ? "border-bfw-orange shadow-md"
          : "border-gray-200 hover:border-bfw-orange hover:shadow-md"
      }`}
    >
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition ${
          isSelected
            ? "bg-bfw-orange text-white"
            : "bg-bfw-orange/10 text-bfw-orange group-hover:bg-bfw-orange group-hover:text-white"
        }`}
      >
        {icon}
      </div>

      <h3 className="font-heading text-xl font-bold text-gray-900">{title}</h3>
      <p className="mt-2 font-body text-sm text-gray-600">{description}</p>

      <ul className="mt-4 flex-1 space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-2">
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
            <span className="font-body text-sm text-gray-700">{benefit}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

interface OAuthSignupCompleteProps {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string;
}

export function OAuthSignupComplete({
  userId,
  email,
  displayName,
  avatarUrl,
}: OAuthSignupCompleteProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<
    "consumer" | "restaurant" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!selectedType) {
      setError("Please select an account type");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();

      // Create the profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        email: email,
        display_name: displayName,
        avatar_url: avatarUrl,
        account_type: selectedType,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        setError(profileError.message);
        setIsLoading(false);
        return;
      }

      // If restaurant, create restaurant_profiles entry
      if (selectedType === "restaurant") {
        const { error: restaurantError } = await supabase
          .from("restaurant_profiles")
          .insert({
            id: userId,
            restaurant_name: "",
            contact_person: displayName,
            business_email: email,
            subscription_tier: "basic",
            subscription_status: "active",
          });

        if (restaurantError) {
          console.error("Restaurant profile error:", restaurantError);
          // Don't fail the whole flow, restaurant profile is optional initially
        }
      }

      // If consumer, create consumer_profiles entry
      if (selectedType === "consumer") {
        const { error: consumerError } = await supabase
          .from("consumer_profiles")
          .insert({
            id: userId,
            email_notifications: true,
            deals_notifications: true,
          });

        if (consumerError) {
          console.error("Consumer profile error:", consumerError);
          // Don't fail the whole flow
        }
      }

      // Redirect to appropriate dashboard
      if (selectedType === "restaurant") {
        router.push("/restaurant/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Error completing signup:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Choose Your Account Type
        </h1>
        <p className="mt-2 font-body text-gray-600">
          How would you like to use BestFoodWhere?
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <AccountTypeCard
          type="consumer"
          title="Food Lover"
          description="Discover the best food in Singapore and save your favorites"
          benefits={[
            "Save your favorite restaurants",
            "Write and share reviews",
            "Access exclusive member deals",
            "Get personalized recommendations",
          ]}
          icon={<IconUsers className="h-7 w-7" />}
          isSelected={selectedType === "consumer"}
          onClick={() => setSelectedType("consumer")}
        />

        <AccountTypeCard
          type="restaurant"
          title="Restaurant Owner"
          description="List your restaurant and reach thousands of food lovers"
          benefits={[
            "Create your restaurant listing",
            "Showcase your menu and photos",
            "Reach 50,000+ monthly visitors",
            "Get detailed analytics",
          ]}
          icon={
            <svg
              className="h-7 w-7"
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
          }
          isSelected={selectedType === "restaurant"}
          onClick={() => setSelectedType("restaurant")}
        />
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedType || isLoading}
        className="w-full rounded-xl bg-bfw-orange py-3 font-heading text-sm font-semibold text-white transition hover:bg-bfw-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Creating your account..." : "Continue"}
      </button>
    </div>
  );
}
