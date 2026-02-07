"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { StatsCard } from "@/components/dashboard";

interface DashboardStats {
  favoritesCount: number;
  reviewsCount: number;
  savedDealsCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    favoritesCount: 0,
    reviewsCount: 0,
    savedDealsCount: 0,
  });
  const [displayName, setDisplayName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();

        setDisplayName(
          profile?.display_name || user.email?.split("@")[0] || "User",
        );

        // Fetch stats in parallel
        const [favorites, reviews, deals] = await Promise.all([
          supabase
            .from("favorites")
            .select("id", { count: "exact" })
            .eq("user_id", user.id),
          supabase
            .from("reviews")
            .select("id", { count: "exact" })
            .eq("user_id", user.id),
          supabase
            .from("saved_deals")
            .select("id", { count: "exact" })
            .eq("user_id", user.id),
        ]);

        setStats({
          favoritesCount: favorites.count || 0,
          reviewsCount: reviews.count || 0,
          savedDealsCount: deals.count || 0,
        });
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
          Welcome back, {displayName}!
        </h1>
        <p className="mt-1 font-body text-gray-600">
          Here&apos;s what&apos;s happening with your food journey
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Saved Favorites"
          value={stats.favoritesCount}
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
        <StatsCard
          title="Reviews Written"
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
          title="Saved Deals"
          value={stats.savedDealsCount}
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
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
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
            href="/shopping-malls"
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <p className="font-heading text-sm font-medium text-gray-900">
                Explore Malls
              </p>
              <p className="font-body text-xs text-gray-500">Find new places</p>
            </div>
          </Link>

          <Link
            href="/promotions-and-deals"
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-heading text-sm font-medium text-gray-900">
                View Deals
              </p>
              <p className="font-body text-xs text-gray-500">Save money</p>
            </div>
          </Link>

          <Link
            href="/favorites"
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-heading text-sm font-medium text-gray-900">
                My Favorites
              </p>
              <p className="font-body text-xs text-gray-500">View saved</p>
            </div>
          </Link>

          <Link
            href="/settings"
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
              <p className="font-body text-xs text-gray-500">Edit profile</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
