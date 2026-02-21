"use client";

import { useCallback, useState, useTransition, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CUISINE_CATEGORIES, PRICE_RANGES } from "@/types/shopping-mall";

interface Props {
  mallSlug: string;
  cuisines?: string[];
}

export function RestaurantFilterBar({ mallSlug, cuisines }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCuisine, setSelectedCuisine] = useState(
    searchParams.get("cuisine") || "",
  );
  const [selectedPrice, setSelectedPrice] = useState(
    searchParams.get("price") || "",
  );
  const [openNow, setOpenNow] = useState(
    searchParams.get("openNow") === "true",
  );

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const availableCuisines = cuisines?.length ? cuisines : CUISINE_CATEGORIES;

  const updateURL = useCallback(
    (params: Record<string, string | boolean | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      // Reset to page 1 when filters change
      newParams.delete("page");

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "" || value === false) {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });

      const queryString = newParams.toString();
      const url = queryString
        ? `/shopping-malls/${mallSlug}?${queryString}`
        : `/shopping-malls/${mallSlug}`;

      startTransition(() => {
        router.push(url, { scroll: false });
      });
    },
    [mallSlug, router, searchParams],
  );

  // Debounced search — filters as you type
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      updateURL({ q: search });
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Immediate update on Enter
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateURL({ q: search });
  };

  const handleCuisineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCuisine(value);
    updateURL({ cuisine: value });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPrice(value);
    updateURL({ price: value });
  };

  const handleOpenNowToggle = () => {
    const newValue = !openNow;
    setOpenNow(newValue);
    updateURL({ openNow: newValue });
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCuisine("");
    setSelectedPrice("");
    setOpenNow(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    startTransition(() => {
      router.push(`/shopping-malls/${mallSlug}`, { scroll: false });
    });
  };

  const hasFilters = search || selectedCuisine || selectedPrice || openNow;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants, cuisines..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
            />
            {isPending && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="inline-block h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              </span>
            )}
          </div>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Cuisine Dropdown */}
          <select
            value={selectedCuisine}
            onChange={handleCuisineChange}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-bfw-orange focus:ring-2 focus:ring-bfw-orange/20"
          >
            <option value="">All Cuisines</option>
            {availableCuisines.map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>

          {/* Price Dropdown */}
          <select
            value={selectedPrice}
            onChange={handlePriceChange}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-bfw-orange focus:ring-2 focus:ring-bfw-orange/20"
          >
            <option value="">All Prices</option>
            {PRICE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label} ({range.description})
              </option>
            ))}
          </select>

          {/* Open Now Toggle */}
          <button
            type="button"
            onClick={handleOpenNowToggle}
            className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
              openNow
                ? "border-bfw-orange bg-bfw-orange text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-bfw-orange hover:text-bfw-orange"
            }`}
          >
            Open Now
          </button>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
