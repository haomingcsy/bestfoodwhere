import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

interface RestaurantProfile {
  id: string;
  restaurant_name: string;
  contact_person: string;
  business_email: string | null;
  mall_location: string | null;
  cuisine_type: string | null;
  subscription_tier: string;
  subscription_status: string | null;
  created_at: string;
  profiles: {
    email: string;
  };
}

export default async function AdminRestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("restaurant_profiles")
    .select(
      `
      *,
      profiles (
        email
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (params.tier) {
    query = query.eq("subscription_tier", params.tier);
  }

  const { data: restaurants } = await query;

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "premium":
        return "bg-purple-100 text-purple-700";
      case "featured":
        return "bg-orange-100 text-bfw-orange";
      case "enterprise":
        return "bg-blue-100 text-blue-700";
      case "basic":
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "past_due":
        return "bg-yellow-100 text-yellow-700";
      case "canceled":
        return "bg-red-100 text-red-700";
      case "trialing":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">
            Restaurants
          </h1>
          <p className="mt-1 font-body text-gray-600">
            Manage restaurant listings
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Link
          href="/admin/restaurants"
          className={`rounded-lg px-4 py-2 font-body text-sm transition ${
            !params.tier
              ? "bg-bfw-orange text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </Link>
        <Link
          href="/admin/restaurants?tier=basic"
          className={`rounded-lg px-4 py-2 font-body text-sm transition ${
            params.tier === "basic"
              ? "bg-bfw-orange text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Basic
        </Link>
        <Link
          href="/admin/restaurants?tier=featured"
          className={`rounded-lg px-4 py-2 font-body text-sm transition ${
            params.tier === "featured"
              ? "bg-bfw-orange text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Featured
        </Link>
        <Link
          href="/admin/restaurants?tier=premium"
          className={`rounded-lg px-4 py-2 font-body text-sm transition ${
            params.tier === "premium"
              ? "bg-bfw-orange text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Premium
        </Link>
      </div>

      {/* Restaurants Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                Restaurant
              </th>
              <th className="px-6 py-3 text-left font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                Location
              </th>
              <th className="px-6 py-3 text-left font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                Tier
              </th>
              <th className="px-6 py-3 text-left font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
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
            {(restaurants as RestaurantProfile[] | null)?.map((restaurant) => (
              <tr key={restaurant.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <p className="font-heading text-sm font-medium text-gray-900">
                      {restaurant.restaurant_name}
                    </p>
                    <p className="font-body text-xs text-gray-500">
                      {restaurant.contact_person} ·{" "}
                      {restaurant.business_email || restaurant.profiles?.email}
                    </p>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <p className="font-body text-sm text-gray-700">
                    {restaurant.mall_location || "—"}
                  </p>
                  <p className="font-body text-xs text-gray-500">
                    {restaurant.cuisine_type || ""}
                  </p>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 font-body text-xs font-medium ${getTierBadge(
                      restaurant.subscription_tier,
                    )}`}
                  >
                    {restaurant.subscription_tier}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 font-body text-xs font-medium ${getStatusBadge(
                      restaurant.subscription_status,
                    )}`}
                  >
                    {restaurant.subscription_status || "—"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <p className="font-body text-sm text-gray-500">
                    {new Date(restaurant.created_at).toLocaleDateString()}
                  </p>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <Link
                    href={`/admin/restaurants/${restaurant.id}`}
                    className="font-body text-sm text-bfw-orange hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!restaurants || restaurants.length === 0) && (
          <div className="py-12 text-center">
            <p className="font-body text-gray-500">No restaurants found</p>
          </div>
        )}
      </div>
    </div>
  );
}
