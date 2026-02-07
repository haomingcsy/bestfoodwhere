"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Favorite {
  id: string;
  brand_slug: string;
  location_slug: string | null;
  created_at: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("favorites")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        setFavorites(data || []);
      }
      setIsLoading(false);
    };

    fetchFavorites();
  }, []);

  const handleRemove = async (id: string) => {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("favorites").delete().eq("id", id);
    setFavorites(favorites.filter((f) => f.id !== id));
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
          My Favorites
        </h1>
        <p className="mt-1 font-body text-gray-600">
          Restaurants you&apos;ve saved for later
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-400"
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
          <h3 className="font-heading text-lg font-semibold text-gray-900">
            No favorites yet
          </h3>
          <p className="mt-2 font-body text-sm text-gray-600">
            Start exploring and save your favorite restaurants!
          </p>
          <Link
            href="/shopping-malls"
            className="mt-4 inline-block rounded-lg bg-bfw-orange px-4 py-2 font-heading text-sm font-medium text-white transition hover:bg-bfw-orange/90"
          >
            Explore Restaurants
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/menu/${favorite.brand_slug}${favorite.location_slug ? `?location=${favorite.location_slug}` : ""}`}
                    className="font-heading text-lg font-semibold text-gray-900 hover:text-bfw-orange"
                  >
                    {favorite.brand_slug
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </Link>
                  {favorite.location_slug && (
                    <p className="mt-1 font-body text-sm text-gray-500">
                      {favorite.location_slug
                        .split("-")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </p>
                  )}
                  <p className="mt-2 font-body text-xs text-gray-400">
                    Saved {new Date(favorite.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(favorite.id)}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                >
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
