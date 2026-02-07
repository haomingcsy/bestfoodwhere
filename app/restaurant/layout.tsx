"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { DashboardSidebar, DashboardHeader } from "@/components/dashboard";

interface Props {
  children: ReactNode;
}

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/restaurant/dashboard",
    icon: (
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
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    label: "My Listing",
    href: "/restaurant/listing",
    icon: (
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
    ),
  },
  {
    label: "Analytics",
    href: "/restaurant/analytics",
    icon: (
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
    ),
  },
  {
    label: "Subscription",
    href: "/restaurant/subscription",
    icon: (
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
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/restaurant/settings",
    icon: (
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
    ),
  },
];

export default function RestaurantLayout({ children }: Props) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState<{
    displayName?: string;
    email?: string;
    avatarUrl?: string;
    subscriptionTier?: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const [profileRes, restaurantRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", authUser.id)
            .single(),
          supabase
            .from("restaurant_profiles")
            .select("restaurant_name, subscription_tier")
            .eq("id", authUser.id)
            .single(),
        ]);

        setUser({
          displayName:
            restaurantRes.data?.restaurant_name ||
            profileRes.data?.display_name ||
            authUser.email?.split("@")[0],
          email: authUser.email,
          avatarUrl: profileRes.data?.avatar_url,
          subscriptionTier: restaurantRes.data?.subscription_tier || "basic",
        });
      }
    };

    fetchUser();
  }, []);

  const getTierBadge = (tier?: string) => {
    const colors = {
      basic: "bg-gray-100 text-gray-700",
      featured: "bg-blue-100 text-blue-700",
      premium: "bg-purple-100 text-purple-700",
      enterprise: "bg-yellow-100 text-yellow-700",
    };
    return (
      <span
        className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${colors[tier as keyof typeof colors] || colors.basic}`}
      >
        {tier?.charAt(0).toUpperCase() + (tier?.slice(1) || "")}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar items={NAV_ITEMS} userType="restaurant" />

      {/* Mobile sidebar overlay */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform lg:hidden ${
          showMobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DashboardSidebar items={NAV_ITEMS} userType="restaurant" />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <DashboardHeader
          user={user || undefined}
          showMobileMenu={showMobileMenu}
          onMobileMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
        />

        {/* Tier badge banner */}
        {user?.subscriptionTier && user.subscriptionTier !== "premium" && (
          <div className="border-b border-yellow-200 bg-yellow-50 px-6 py-2">
            <p className="flex items-center justify-center gap-2 font-body text-sm text-yellow-800">
              You&apos;re on the {getTierBadge(user.subscriptionTier)} plan.
              <a
                href="/restaurant/subscription"
                className="font-medium underline hover:no-underline"
              >
                Upgrade for more features
              </a>
            </p>
          </div>
        )}

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
