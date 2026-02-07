"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface SavedDeal {
  id: string;
  deal_id: string;
  created_at: string;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<SavedDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("saved_deals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        setDeals(data || []);
      }
      setIsLoading(false);
    };

    fetchDeals();
  }, []);

  const handleRemove = async (id: string) => {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("saved_deals").delete().eq("id", id);
    setDeals(deals.filter((d) => d.id !== id));
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
          Saved Deals
        </h1>
        <p className="mt-1 font-body text-gray-600">
          Deals and promotions you&apos;ve saved
        </p>
      </div>

      {deals.length === 0 ? (
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
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <h3 className="font-heading text-lg font-semibold text-gray-900">
            No saved deals yet
          </h3>
          <p className="mt-2 font-body text-sm text-gray-600">
            Browse promotions and save deals for later!
          </p>
          <Link
            href="/promotions-and-deals"
            className="mt-4 inline-block rounded-lg bg-bfw-orange px-4 py-2 font-heading text-sm font-medium text-white transition hover:bg-bfw-orange/90"
          >
            Browse Deals
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-heading font-semibold text-gray-900">
                    Deal #{deal.deal_id}
                  </p>
                  <p className="mt-2 font-body text-xs text-gray-400">
                    Saved {new Date(deal.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(deal.id)}
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
