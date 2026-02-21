"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MALLS_DATA } from "@/lib/mall-data";
import { IconSearch, IconStore, IconUtensils } from "@/components/layout/icons";

interface MallHeroSearchProps {
  onSearch?: (query: string) => void;
}

interface RestaurantResult {
  name: string;
  slug: string;
  mallSlug: string;
  mallName: string;
  cuisines: string[];
  imageUrl: string;
  hasMenuPage: boolean;
}

export function MallHeroSearch({ onSearch }: MallHeroSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [restaurants, setRestaurants] = useState<RestaurantResult[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const filteredMalls = MALLS_DATA.filter(
    (mall) =>
      mall.name.toLowerCase().includes(query.toLowerCase()) ||
      mall.location.toLowerCase().includes(query.toLowerCase()),
  );

  const totalItems = filteredMalls.length + restaurants.length;

  // Debounced restaurant search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setRestaurants([]);
      setIsLoadingRestaurants(false);
      return;
    }

    setIsLoadingRestaurants(true);

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
      } catch (e: any) {
        if (e?.name !== "AbortError") setRestaurants([]);
      } finally {
        setIsLoadingRestaurants(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelectMall = (slug: string) => {
    router.push(`/shopping-malls/${slug}`);
    setIsOpen(false);
    setQuery("");
  };

  const handleSelectRestaurant = (result: RestaurantResult) => {
    const url = result.hasMenuPage
      ? `/menu/${result.slug}`
      : `/shopping-malls/${result.mallSlug}`;
    router.push(url);
    setIsOpen(false);
    setQuery("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setHighlightedIndex(-1);
    onSearch?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

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
        setIsOpen(false);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasResults =
    filteredMalls.length > 0 || restaurants.length > 0 || isLoadingRestaurants;

  return (
    <div className="relative w-full max-w-[600px] mx-auto">
      <div className="relative flex items-center bg-white/90 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg">
        <IconSearch className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search malls or restaurants (e.g., 'VivoCity', 'Sushi')"
          className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none text-base"
          aria-label="Search for malls or restaurants"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="search-results"
          role="combobox"
        />
      </div>

      {isOpen && hasResults && (
        <ul
          id="search-results"
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl max-h-[400px] overflow-y-auto z-50"
          role="listbox"
        >
          {/* Malls Section */}
          {filteredMalls.length > 0 && (
            <>
              <li className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Shopping Malls
              </li>
              {filteredMalls.map((mall, index) => (
                <li
                  key={`mall-${mall.slug}`}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 ${
                    highlightedIndex === index
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelectMall(mall.slug)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <IconStore className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">{mall.name}</div>
                    <div className="text-sm text-gray-500">
                      {mall.location}
                    </div>
                  </div>
                </li>
              ))}
            </>
          )}

          {/* Restaurants Section */}
          {(restaurants.length > 0 || isLoadingRestaurants) && (
            <>
              <li
                className={`px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider ${filteredMalls.length > 0 ? "border-t border-gray-100" : ""}`}
              >
                Restaurants
              </li>
              {isLoadingRestaurants && restaurants.length === 0 && (
                <li className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                  <span className="inline-block h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
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
                    className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 ${
                      highlightedIndex === globalIndex
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelectRestaurant(result)}
                    onMouseEnter={() => setHighlightedIndex(globalIndex)}
                  >
                    <IconUtensils className="h-4 w-4 text-gray-400 flex-shrink-0" />
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

      {isOpen &&
        query &&
        query.trim().length >= 2 &&
        !hasResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl p-4 text-center text-gray-500">
            No malls or restaurants found matching &ldquo;{query}&rdquo;
          </div>
        )}
    </div>
  );
}
