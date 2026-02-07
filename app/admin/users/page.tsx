import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

// Force dynamic rendering to always show fresh data
export const dynamic = "force-dynamic";

interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  account_type: string;
  created_at: string;
}

interface RestaurantProfile {
  id: string;
  restaurant_name: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
}

interface UserStats {
  favorites: number;
  reviews: number;
  totalSpent: number;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (params.type) {
    query = query.eq("account_type", params.type);
  }

  const { data: users } = await query;

  // Get restaurant profiles for subscription info
  const { data: restaurantProfiles } = await supabase
    .from("restaurant_profiles")
    .select("id, restaurant_name, subscription_tier, subscription_status");

  // Get favorites and reviews counts for each user
  const userIds = users?.map((u) => u.id) || [];

  const [
    { data: favoritesData },
    { data: reviewsData },
    { data: paymentsData },
  ] = await Promise.all([
    supabase
      .from("favorites")
      .select("user_id")
      .in("user_id", userIds.length > 0 ? userIds : [""]),
    supabase
      .from("reviews")
      .select("user_id")
      .in("user_id", userIds.length > 0 ? userIds : [""]),
    supabase
      .from("payments")
      .select("user_id, amount, status")
      .in("user_id", userIds.length > 0 ? userIds : [""])
      .eq("status", "succeeded"),
  ]);

  // Build stats map
  const statsMap: Record<string, UserStats> = {};
  userIds.forEach((id) => {
    statsMap[id] = { favorites: 0, reviews: 0, totalSpent: 0 };
  });

  favoritesData?.forEach((f) => {
    if (statsMap[f.user_id]) {
      statsMap[f.user_id].favorites++;
    }
  });

  reviewsData?.forEach((r) => {
    if (statsMap[r.user_id]) {
      statsMap[r.user_id].reviews++;
    }
  });

  paymentsData?.forEach((p) => {
    if (statsMap[p.user_id]) {
      statsMap[p.user_id].totalSpent += p.amount;
    }
  });

  // Build restaurant profile map
  const restaurantMap: Record<string, RestaurantProfile> = {};
  restaurantProfiles?.forEach((rp) => {
    restaurantMap[rp.id] = rp;
  });

  const getAccountTypeBadge = (type: string) => {
    switch (type) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "restaurant":
        return "bg-orange-100 text-bfw-orange";
      case "consumer":
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getSubscriptionBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "trialing":
        return "bg-blue-100 text-blue-700";
      case "past_due":
        return "bg-yellow-100 text-yellow-700";
      case "canceled":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">
            Users
          </h1>
          <p className="mt-1 font-body text-gray-600">
            Manage all registered users
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Link
          href="/admin/users"
          className={`rounded-lg px-4 py-2 font-body text-sm transition ${
            !params.type
              ? "bg-bfw-orange text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </Link>
        <Link
          href="/admin/users?type=consumer"
          className={`rounded-lg px-4 py-2 font-body text-sm transition ${
            params.type === "consumer"
              ? "bg-bfw-orange text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Consumers
        </Link>
        <Link
          href="/admin/users?type=restaurant"
          className={`rounded-lg px-4 py-2 font-body text-sm transition ${
            params.type === "restaurant"
              ? "bg-bfw-orange text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Restaurants
        </Link>
        <Link
          href="/admin/users?type=admin"
          className={`rounded-lg px-4 py-2 font-body text-sm transition ${
            params.type === "admin"
              ? "bg-bfw-orange text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Admins
        </Link>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                  User
                </th>
                <th className="px-6 py-3 text-left font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-center font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                  Favorites
                </th>
                <th className="px-6 py-3 text-center font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                  Reviews
                </th>
                <th className="px-6 py-3 text-left font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                  Subscription
                </th>
                <th className="px-6 py-3 text-right font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                  Joined
                </th>
                <th className="px-6 py-3 text-right font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {(users as Profile[] | null)?.map((user) => {
                const stats = statsMap[user.id] || { favorites: 0, reviews: 0 };
                const restaurant = restaurantMap[user.id];

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-heading text-sm font-semibold text-gray-600">
                            {(user.display_name || user.email || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-heading text-sm font-medium text-gray-900">
                            {user.display_name || "—"}
                          </p>
                          <p className="font-body text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 font-body text-xs font-medium ${getAccountTypeBadge(
                          user.account_type,
                        )}`}
                      >
                        {user.account_type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span className="font-body text-sm text-gray-700">
                        {stats.favorites}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span className="font-body text-sm text-gray-700">
                        {stats.reviews}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {user.account_type === "restaurant" && restaurant ? (
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex w-fit rounded-full px-2 py-0.5 font-body text-xs font-medium ${getSubscriptionBadge(
                              restaurant.subscription_status,
                            )}`}
                          >
                            {restaurant.subscription_tier || "basic"}
                          </span>
                          <span className="font-body text-xs text-gray-500">
                            {restaurant.subscription_status || "—"}
                          </span>
                        </div>
                      ) : (
                        <span className="font-body text-xs text-gray-400">
                          —
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      {stats.totalSpent > 0 ? (
                        <span className="font-heading text-sm font-semibold text-green-600">
                          ${(stats.totalSpent / 100).toFixed(2)}
                        </span>
                      ) : (
                        <span className="font-body text-xs text-gray-400">
                          —
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="font-body text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-body text-sm text-bfw-orange hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(!users || users.length === 0) && (
          <div className="py-12 text-center">
            <p className="font-body text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
