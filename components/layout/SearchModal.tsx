"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MALLS_DATA } from "@/lib/mall-data";
import { IconSearch, IconStore, IconUtensils } from "./icons";

interface RestaurantResult {
  name: string;
  slug: string;
  mallSlug: string;
  mallName: string;
  cuisines: string[];
  imageUrl: string;
  hasMenuPage: boolean;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [restaurants, setRestaurants] = useState<RestaurantResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const filteredMalls = query.trim().length > 0
    ? MALLS_DATA.filter(
        (mall) =>
          mall.name.toLowerCase().includes(query.toLowerCase()) ||
          mall.location.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const totalItems = filteredMalls.length + restaurants.length;

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
    // Reset state when closing
    setQuery("");
    setRestaurants([]);
    setHighlightedIndex(-1);
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  // Debounced restaurant search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setRestaurants([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch(
          `/api/search/restaurants?q=${encodeURIComponent(query.trim())}`,
          { signal: abortRef.current.signal },
        );
        const data = await res.json();
        setRestaurants(data.results || []);
      } catch (e: unknown) {
        if (e instanceof Error && e.name !== "AbortError") setRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const navigate = useCallback(
    (url: string) => {
      router.push(url);
      onClose();
    },
    [router, onClose],
  );

  const handleSelectMall = useCallback(
    (slug: string) => navigate(`/shopping-malls/${slug}`),
    [navigate],
  );

  const handleSelectRestaurant = useCallback(
    (result: RestaurantResult) => {
      const url = result.hasMenuPage
        ? `/menu/${result.slug}`
        : `/shopping-malls/${result.mallSlug}`;
      navigate(url);
    },
    [navigate],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < totalItems - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          if (highlightedIndex < filteredMalls.length) {
            handleSelectMall(filteredMalls[highlightedIndex].slug);
          } else {
            const restIdx = highlightedIndex - filteredMalls.length;
            handleSelectRestaurant(restaurants[restIdx]);
          }
        }
        break;
      case "Escape":
        onClose();
        break;
    }
  };

  const hasResults =
    filteredMalls.length > 0 || restaurants.length > 0 || isLoading;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 backdrop-blur-sm px-4 pt-20 md:pt-28"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="w-full max-w-2xl">
        {/* Search input */}
        <div className="flex items-center rounded-2xl bg-white px-5 py-4 shadow-2xl">
          <IconSearch className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlightedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search malls, restaurants, cuisines..."
            className="flex-1 bg-transparent text-lg text-gray-900 placeholder-gray-400 outline-none"
            aria-label="Search"
            role="combobox"
            aria-expanded={hasResults}
            aria-haspopup="listbox"
            aria-controls="global-search-results"
          />
          <button
            type="button"
            onClick={onClose}
            className="ml-3 rounded-lg px-2 py-1 text-sm text-gray-400 hover:text-gray-600"
          >
            ESC
          </button>
        </div>

        {/* Results dropdown */}
        {query.trim().length >= 2 && hasResults && (
          <ul
            id="global-search-results"
            className="mt-2 max-h-[60vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
            role="listbox"
          >
            {/* Malls section */}
            {filteredMalls.length > 0 && (
              <>
                <li className="px-5 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Shopping Malls
                </li>
                {filteredMalls.map((mall, index) => (
                  <li
                    key={`mall-${mall.slug}`}
                    role="option"
                    aria-selected={highlightedIndex === index}
                    className={`flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors ${
                      highlightedIndex === index
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelectMall(mall.slug)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <IconStore className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {mall.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {mall.location}
                      </div>
                    </div>
                  </li>
                ))}
              </>
            )}

            {/* Restaurants section */}
            {(restaurants.length > 0 || isLoading) && (
              <>
                <li
                  className={`px-5 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${
                    filteredMalls.length > 0
                      ? "border-t border-gray-100"
                      : ""
                  }`}
                >
                  Restaurants
                </li>
                {isLoading && restaurants.length === 0 && (
                  <li className="flex items-center gap-2 px-5 py-3 text-sm text-gray-400">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                    Searching restaurants...
                  </li>
                )}
                {restaurants.map((result, index) => {
                  const globalIndex = filteredMalls.length + index;
                  return (
                    <li
                      key={`rest-${result.slug}-${result.mallSlug}`}
                      role="option"
                      aria-selected={highlightedIndex === globalIndex}
                      className={`flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors ${
                        highlightedIndex === globalIndex
                          ? "bg-gray-100"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleSelectRestaurant(result)}
                      onMouseEnter={() => setHighlightedIndex(globalIndex)}
                    >
                      <IconUtensils className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {result.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          at {result.mallName}
                          {result.cuisines.length > 0 &&
                            ` · ${result.cuisines.slice(0, 2).join(", ")}`}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </>
            )}
          </ul>
        )}

        {/* No results */}
        {query.trim().length >= 2 && !hasResults && (
          <div className="mt-2 rounded-2xl bg-white p-6 text-center shadow-2xl">
            <p className="text-gray-500">
              No results found for &ldquo;{query}&rdquo;
            </p>
          </div>
        )}

        {/* Empty state hint */}
        {query.trim().length < 2 && (
          <div className="mt-2 rounded-2xl bg-white p-6 text-center shadow-2xl">
            <p className="text-sm text-gray-400">
              Type at least 2 characters to search
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
