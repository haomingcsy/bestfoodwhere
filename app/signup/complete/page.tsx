"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AccountType = "consumer" | "restaurant";

export default function CompleteSignupPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string } | null>(
    null,
  );
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser({
        email: user.email || "",
        name: user.user_metadata?.full_name || user.user_metadata?.name || "",
      });
    };

    getUser();
  }, [router]);

  const handleComplete = async () => {
    if (!selectedType || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) throw new Error("Not authenticated");

      // Create base profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authUser.id,
        email: authUser.email,
        display_name: user.name,
        avatar_url: authUser.user_metadata?.avatar_url || null,
        account_type: selectedType,
      });

      if (profileError) throw profileError;

      // Create type-specific profile
      if (selectedType === "consumer") {
        await supabase.from("consumer_profiles").insert({
          id: authUser.id,
          email_notifications: true,
          deals_notifications: true,
        });

        router.push("/dashboard");
      } else {
        // For restaurant, redirect to complete business info
        router.push("/signup/restaurant?step=2&oauth=true");
      }
    } catch (err) {
      console.error("Error completing signup:", err);
      setError("Failed to complete signup. Please try again.");
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-bfw-orange border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-center p-6">
        <Link href="/">
          <Image
            src="/brand/logo.svg"
            alt="BestFoodWhere"
            width={160}
            height={36}
          />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
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
            <h1 className="font-heading text-2xl font-bold text-gray-900">
              Welcome, {user.name || "there"}!
            </h1>
            <p className="mt-2 font-body text-gray-600">
              One more step - choose how you&apos;ll use BestFoodWhere
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Consumer Card */}
            <button
              type="button"
              onClick={() => setSelectedType("consumer")}
              className={`rounded-2xl border-2 p-6 text-left transition ${
                selectedType === "consumer"
                  ? "border-bfw-orange bg-orange-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-semibold text-gray-900">
                Food Lover
              </h3>
              <p className="mt-1 font-body text-sm text-gray-600">
                Discover restaurants, save favorites, and write reviews
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
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
                  Save favorite restaurants
                </li>
                <li className="flex items-center gap-2">
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
                  Write reviews
                </li>
                <li className="flex items-center gap-2">
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
                  Access exclusive deals
                </li>
              </ul>
              <p className="mt-4 font-heading text-sm font-semibold text-green-600">
                Free forever
              </p>
            </button>

            {/* Restaurant Card */}
            <button
              type="button"
              onClick={() => setSelectedType("restaurant")}
              className={`rounded-2xl border-2 p-6 text-left transition ${
                selectedType === "restaurant"
                  ? "border-bfw-orange bg-orange-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                <svg
                  className="h-6 w-6 text-bfw-orange"
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
              <h3 className="font-heading text-lg font-semibold text-gray-900">
                Restaurant Owner
              </h3>
              <p className="mt-1 font-body text-sm text-gray-600">
                List your restaurant and reach more customers
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
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
                  Create your listing
                </li>
                <li className="flex items-center gap-2">
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
                  Track analytics
                </li>
                <li className="flex items-center gap-2">
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
                  Boost visibility
                </li>
              </ul>
              <p className="mt-4 font-heading text-sm font-semibold text-bfw-orange">
                Free basic listing
              </p>
            </button>
          </div>

          <button
            type="button"
            onClick={handleComplete}
            disabled={!selectedType || isLoading}
            className="mt-8 w-full rounded-xl bg-bfw-orange py-4 font-heading text-base font-semibold text-white transition hover:bg-bfw-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Setting up..." : "Continue"}
          </button>

          <p className="mt-4 text-center font-body text-sm text-gray-500">
            Signed in as {user.email}
          </p>
        </div>
      </main>
    </div>
  );
}
