"use client";

import { useMemo, useState } from "react";
import { RestaurantCard } from "./RestaurantCard";
import { FilterSection } from "./FilterSection";
import type { Restaurant, SingaporeArea } from "@/types/dining";

interface RestaurantGridProps {
  restaurants: Restaurant[];
  title?: string;
}

const RESTAURANTS_PER_PAGE = 9;

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  const maxVisiblePages = 7;

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const halfWindow = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfWindow);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("ellipsis");
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("ellipsis");
      pages.push(totalPages);
    }
  }

  return (
    <div className="mt-5 flex justify-center gap-1">
      {currentPage > 1 && (
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded bg-[#f0f0f0] px-3 py-2 font-body text-sm text-[#333]"
        >
          &laquo; Prev
        </button>
      )}

      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 py-2 text-[#666]">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`rounded px-3 py-2 font-body text-sm ${
              currentPage === page
                ? "bg-bfw-orange text-white"
                : "bg-[#f0f0f0] text-[#333]"
            }`}
          >
            {page}
          </button>
        ),
      )}

      {currentPage < totalPages && (
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded bg-[#f0f0f0] px-3 py-2 font-body text-sm text-[#333]"
        >
          Next &raquo;
        </button>
      )}
    </div>
  );
}

export function RestaurantGrid({
  restaurants,
  title = "Late Night Spots in Singapore",
}: RestaurantGridProps) {
  const [currentArea, setCurrentArea] = useState<SingaporeArea>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRestaurants = useMemo(() => {
    if (currentArea === "all") return restaurants;
    return restaurants.filter((r) => r.area === currentArea);
  }, [restaurants, currentArea]);

  const totalPages = Math.ceil(
    filteredRestaurants.length / RESTAURANTS_PER_PAGE,
  );

  const paginatedRestaurants = useMemo(() => {
    const startIndex = (currentPage - 1) * RESTAURANTS_PER_PAGE;
    return filteredRestaurants.slice(
      startIndex,
      startIndex + RESTAURANTS_PER_PAGE,
    );
  }, [filteredRestaurants, currentPage]);

  const handleAreaChange = (area: SingaporeArea) => {
    setCurrentArea(area);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document
      .getElementById("restaurant-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <FilterSection
        currentArea={currentArea}
        onAreaChange={handleAreaChange}
      />

      <section
        id="restaurant-section"
        className="mb-5 rounded-xl bg-white py-8"
      >
        <div className="mb-5 text-center">
          <h2 className="font-heading text-[26px] font-bold text-bfw-orange">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 px-5 md:grid-cols-2 lg:grid-cols-3">
          {paginatedRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="py-12 text-center font-body text-[#666]">
            No restaurants found in this area. Try a different filter.
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </section>
    </>
  );
}
