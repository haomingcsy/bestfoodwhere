"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  NearbyRestaurant,
  NearbyFoodResponse,
  NearbyFoodError,
  UserLocation,
} from "@/types/nearby-food";
import {
  NearbyRestaurantCard,
  NearbyRestaurantCardSkeleton,
} from "@/components/sections/NearbyFoodCard";

type Status = "idle" | "detecting" | "loading" | "success" | "error";

function isValidPostalCode(value: string): boolean {
  return /^\d{6}$/.test(value);
}

export function PostalCodeFoodFinder() {
  const [postalCode, setPostalCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<NearbyRestaurant[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [radius, setRadius] = useState(10);
  const [gpsSupported, setGpsSupported] = useState(false);

  // Check if geolocation is available
  useEffect(() => {
    setGpsSupported("geolocation" in navigator);
  }, []);

  // Store last search params for re-fetching when radius changes
  const [lastSearchParams, setLastSearchParams] = useState<{
    postalCode?: string;
    lat?: number;
    lng?: number;
  } | null>(null);

  const fetchNearbyFood = useCallback(
    async (
      params: { postalCode?: string; lat?: number; lng?: number },
      saveParams = true,
    ) => {
      setStatus("loading");
      setError(null);
      setRestaurants([]);

      // Save search params for radius change re-fetch
      if (saveParams) {
        setLastSearchParams(params);
      }

      const url = new URL("/api/nearby-food", window.location.origin);
      if (params.postalCode) {
        url.searchParams.set("postalCode", params.postalCode);
      } else if (params.lat !== undefined && params.lng !== undefined) {
        url.searchParams.set("lat", params.lat.toString());
        url.searchParams.set("lng", params.lng.toString());
      }
      url.searchParams.set("radius", radius.toString());

      try {
        const response = await fetch(url.toString());
        const data = (await response.json()) as
          | NearbyFoodResponse
          | NearbyFoodError;

        if (!response.ok) {
          const errorData = data as NearbyFoodError;
          setError(errorData.error);
          setStatus("error");
          return;
        }

        const successData = data as NearbyFoodResponse;
        setRestaurants(successData.restaurants);
        setUserLocation({
          ...successData.userLocation,
          source: params.postalCode ? "postalCode" : "gps",
          postalCode: params.postalCode,
        });
        setStatus("success");
      } catch (err) {
        console.error("Failed to fetch nearby food:", err);
        setError("Failed to search for nearby restaurants. Please try again.");
        setStatus("error");
      }
    },
    [radius],
  );

  // Re-fetch when radius changes (if we already have results)
  useEffect(() => {
    if (lastSearchParams && status === "success") {
      fetchNearbyFood(lastSearchParams, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius]);

  const handleDetectLocation = useCallback(() => {
    if (!gpsSupported) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setStatus("detecting");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchNearbyFood({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (geoError) => {
        let message = "Could not detect your location.";
        if (geoError.code === geoError.PERMISSION_DENIED) {
          message =
            "Location access was denied. Please enter your postal code instead.";
        } else if (geoError.code === geoError.TIMEOUT) {
          message =
            "Location detection timed out. Please enter your postal code instead.";
        }
        setError(message);
        setStatus("idle");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
      },
    );
  }, [gpsSupported, fetchNearbyFood]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPostalCode(postalCode)) {
      setError("Please enter a valid 6-digit Singapore postal code.");
      return;
    }
    fetchNearbyFood({ postalCode });
  };

  const isLoading = status === "loading" || status === "detecting";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff9f6] to-white">
      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="text-center">
            <h1 className="font-heading text-[32px] font-bold leading-tight text-gray-900 md:text-[48px]">
              Find Food <span className="text-bfw-orange">Near You</span>
            </h1>
            <p className="mx-auto mt-4 max-w-[640px] font-body text-[15px] leading-relaxed text-gray-600 md:text-[16px]">
              Discover delicious food close to your location. Enter your postal
              code or use GPS to get started.
            </p>
          </div>

          {/* Search Form */}
          <div className="mx-auto mt-10 max-w-[700px]">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={postalCode}
                  onChange={(e) =>
                    setPostalCode(
                      e.target.value.replace(/[^\d]/g, "").slice(0, 6),
                    )
                  }
                  placeholder="Enter 6-digit postal code"
                  aria-label="Postal code"
                  disabled={isLoading}
                  className="h-14 w-full rounded-xl border border-gray-200 bg-white px-5 font-body text-[15px] text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-bfw-orange focus:ring-4 focus:ring-bfw-orange/10 disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !postalCode}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-bfw-orange px-8 font-heading text-[14px] font-bold tracking-wide text-white shadow-md transition-all hover:bg-bfw-orange-hover hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    SEARCHING...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    FIND RESTAURANTS
                  </>
                )}
              </button>
            </form>

            {/* GPS Detection Button */}
            {gpsSupported && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 font-body text-sm text-gray-600 transition hover:text-bfw-orange disabled:opacity-60"
                >
                  {status === "detecting" ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Detecting location...
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Use my current location
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Radius Selector */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="font-body text-sm text-gray-600">
                Search radius:
              </span>
              <div className="flex gap-1">
                {[5, 10, 20].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRadius(r)}
                    className={`rounded-lg px-3 py-1.5 font-heading text-xs font-semibold transition ${
                      radius === r
                        ? "bg-bfw-orange text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="mx-auto max-w-[700px] px-4">
          <div className="rounded-xl bg-red-50 px-5 py-4 text-center">
            <p className="font-body text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {(status === "loading" || status === "success") && (
        <section className="py-8 md:py-12">
          <div className="mx-auto max-w-[1200px] px-4">
            {/* Results Header */}
            {status === "success" && restaurants.length > 0 && (
              <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-heading text-[24px] font-bold text-gray-900">
                  {restaurants.length} Restaurant
                  {restaurants.length === 1 ? "" : "s"} Found
                </h2>
                {userLocation && (
                  <p className="font-body text-sm text-gray-500">
                    {userLocation.source === "postalCode"
                      ? `Near postal code ${userLocation.postalCode}`
                      : "Near your current location"}{" "}
                    (within {radius} km)
                  </p>
                )}
              </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {status === "loading"
                ? // Skeleton loaders
                  Array.from({ length: 6 }).map((_, i) => (
                    <NearbyRestaurantCardSkeleton key={i} />
                  ))
                : // Actual results
                  restaurants.map((restaurant) => (
                    <NearbyRestaurantCard
                      key={`${restaurant.brandSlug}-${restaurant.locationSlug}`}
                      restaurant={restaurant}
                    />
                  ))}
            </div>

            {/* Empty State */}
            {status === "success" && restaurants.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-heading text-lg font-bold text-gray-900">
                  No restaurants found
                </h3>
                <p className="mt-2 font-body text-sm text-gray-600">
                  Try increasing the search radius or entering a different
                  postal code.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Initial State - Feature Cards */}
      {status === "idle" && (
        <section className="py-8 md:py-12">
          <div className="mx-auto max-w-[1000px] px-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bfw-orange/10">
                  <svg
                    className="h-6 w-6 text-bfw-orange"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-heading text-[18px] font-bold text-gray-900">
                  Location-Based Search
                </h3>
                <p className="mt-3 font-body text-[14px] leading-relaxed text-gray-600">
                  Find restaurants near any postal code in Singapore or use GPS
                  for automatic location detection.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bfw-orange/10">
                  <svg
                    className="h-6 w-6 text-bfw-orange"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <h3 className="font-heading text-[18px] font-bold text-gray-900">
                  Ratings & Reviews
                </h3>
                <p className="mt-3 font-body text-[14px] leading-relaxed text-gray-600">
                  See restaurant ratings, reviews, and cuisine types to help you
                  make the best choice.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bfw-orange/10">
                  <svg
                    className="h-6 w-6 text-bfw-orange"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <h3 className="font-heading text-[18px] font-bold text-gray-900">
                  Full Menus
                </h3>
                <p className="mt-3 font-body text-[14px] leading-relaxed text-gray-600">
                  Browse complete menus with photos and prices before you visit
                  the restaurant.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
