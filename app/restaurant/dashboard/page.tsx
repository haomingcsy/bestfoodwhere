"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { StatsCard } from "@/components/dashboard";

interface RestaurantData {
  restaurant_name: string;
  subscription_tier: string;
  subscription_status: string | null;
  mall_location: string | null;
  cuisine_type: string | null;
}

interface DashboardStats {
  totalViews: number;
  profileClicks: number;
  reviewsCount: number;
  savedByUsers: number;
}

export default function RestaurantDashboardPage() {
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    profileClicks: 0,
    reviewsCount: 0,
    savedByUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check if restaurant has completed their listing
  const hasCompletedListing = Boolean(
    restaurant?.restaurant_name && restaurant.restaurant_name.trim() !== "",
  );

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch restaurant profile
        const { data: restaurantData } = await supabase
          .from("restaurant_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (restaurantData) {
          setRestaurant(restaurantData);

          // If they have a restaurant name, fetch real stats
          if (restaurantData.restaurant_name) {
            // For now, we'll query what we can
            // Views and clicks would need an analytics table - show 0 for now
            // Reviews and favorites can be queried if they have a brand_slug

            // TODO: Once restaurant is linked to a brand_slug, query:
            // - reviews WHERE brand_slug = restaurant.brand_slug
            // - favorites WHERE brand_slug = restaurant.brand_slug

            setStats({
              totalViews: 0, // Requires analytics tracking
              profileClicks: 0, // Requires analytics tracking
              reviewsCount: 0, // Will be populated when linked to brand
              savedByUsers: 0, // Will be populated when linked to brand
            });
          }
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-bfw-orange border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Welcome, {restaurant?.restaurant_name || "Restaurant Owner"}!
        </h1>
        <p className="mt-1 font-body text-gray-600">
          {hasCompletedListing
            ? "Manage your restaurant listing and track performance"
            : "Complete your listing to start attracting customers"}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Views"
          value={stats.totalViews}
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          }
        />
        <StatsCard
          title="Profile Clicks"
          value={stats.profileClicks}
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
          }
        />
        <StatsCard
          title="Reviews"
          value={stats.reviewsCount}
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          }
        />
        <StatsCard
          title="Saved by Users"
          value={stats.savedByUsers}
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/restaurant/listing"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-bfw-orange hover:bg-orange-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bfw-orange/10 text-bfw-orange">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <p className="font-heading text-sm font-medium text-gray-900">
                {hasCompletedListing ? "Edit Listing" : "Create Listing"}
              </p>
              <p className="font-body text-xs text-gray-500">
                {hasCompletedListing ? "Update your info" : "Get started"}
              </p>
            </div>
          </Link>

          <Link
            href="/restaurant/analytics"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-bfw-orange hover:bg-orange-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bfw-orange/10 text-bfw-orange">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <p className="font-heading text-sm font-medium text-gray-900">
                View Analytics
              </p>
              <p className="font-body text-xs text-gray-500">
                Track performance
              </p>
            </div>
          </Link>

          <Link
            href="/restaurant/subscription"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-bfw-orange hover:bg-orange-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bfw-orange/10 text-bfw-orange">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <p className="font-heading text-sm font-medium text-gray-900">
                Upgrade Plan
              </p>
              <p className="font-body text-xs text-gray-500">Get more reach</p>
            </div>
          </Link>

          <Link
            href="/restaurant/settings"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-bfw-orange hover:bg-orange-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bfw-orange/10 text-bfw-orange">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-heading text-sm font-medium text-gray-900">
                Settings
              </p>
              <p className="font-body text-xs text-gray-500">Account options</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Listing status */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900">
          Listing Status
        </h2>
        <div className="mt-4">
          {hasCompletedListing ? (
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-5 w-5 text-green-600"
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
                </div>
                <div>
                  <p className="font-heading font-medium text-green-900">
                    Your listing is live
                  </p>
                  <p className="font-body text-sm text-green-700">
                    Customers can find you on BestFoodWhere
                  </p>
                </div>
              </div>
              <Link
                href="/restaurant/listing"
                className="rounded-lg bg-green-600 px-4 py-2 font-heading text-sm font-medium text-white transition hover:bg-green-700"
              >
                View Listing
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                  <svg
                    className="h-5 w-5 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-heading font-medium text-yellow-900">
                    Listing not complete
                  </p>
                  <p className="font-body text-sm text-yellow-700">
                    Add your restaurant details to go live
                  </p>
                </div>
              </div>
              <Link
                href="/restaurant/listing"
                className="rounded-lg bg-bfw-orange px-4 py-2 font-heading text-sm font-medium text-white transition hover:bg-bfw-orange/90"
              >
                Complete Listing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
