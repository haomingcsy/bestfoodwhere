"use client";

import { useState, useMemo } from "react";
import { MallCard } from "./MallCard";
import { MallAreaFilter } from "./MallAreaFilter";
import { MALLS_DATA, MallAreaValue } from "@/lib/mall-data";

interface MallDirectoryProps {
  searchQuery?: string;
}

export function MallDirectory({ searchQuery = "" }: MallDirectoryProps) {
  const [selectedArea, setSelectedArea] = useState<MallAreaValue>("all");

  const filteredMalls = useMemo(() => {
    let malls = [...MALLS_DATA];

    // Filter by area
    if (selectedArea !== "all") {
      malls = malls.filter((mall) => mall.area === selectedArea);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      malls = malls.filter(
        (mall) =>
          mall.name.toLowerCase().includes(query) ||
          mall.location.toLowerCase().includes(query),
      );
    }

    return malls;
  }, [selectedArea, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 rounded-3xl">
      <MallAreaFilter
        selectedArea={selectedArea}
        onAreaChange={setSelectedArea}
      />

      {/* Results count */}
      <div className="text-sm text-gray-600 mb-6 px-2">
        Showing {filteredMalls.length} of {MALLS_DATA.length} malls
      </div>

      {/* Mall Grid */}
      {filteredMalls.length > 0 ? (
        <div className="grid gap-6 sm:gap-8 md:gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMalls.map((mall) => (
            <MallCard key={mall.slug} mall={mall} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 3h18v18H3z" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            No malls found
          </h2>
          <p className="mt-2 text-gray-600">
            Try selecting a different area or clearing your search.
          </p>
        </div>
      )}
    </div>
  );
}
