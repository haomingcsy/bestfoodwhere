"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { FEATURED_RESTAURANTS } from "../data";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-[#ffc107]">
        {"★".repeat(Math.floor(rating))}
        {rating % 1 >= 0.5 ? "★" : ""}
      </span>
    </div>
  );
}

export function FeaturedRestaurantsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 325;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative mb-8 overflow-hidden rounded-xl bg-[#0d0d14] shadow-[0_0_30px_rgba(239,95,42,0.25)]">
      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-bfw-orange to-[#ff8e63] px-6 py-6 text-center shadow-[0_5px_15px_rgba(239,95,42,0.4)]">
        <h2 className="font-heading text-[28px] font-bold text-white drop-shadow-md">
          Featured Restaurants
        </h2>
        <p className="mx-auto mt-2 max-w-[600px] font-body text-[17px] text-white/95">
          Our spotlight on exceptional dining experiences
        </p>
      </div>

      {/* Restaurant Carousel */}
      <div className="relative bg-[#121220] px-8 py-9">
        {/* Spotlight Badge */}
        <div className="absolute right-8 top-8 z-20 flex animate-pulse items-center gap-1.5 rounded-full bg-gradient-to-r from-bfw-orange to-[#ff8e63] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_3px_15px_rgba(239,95,42,0.5)]">
          <span className="text-lg">✨</span> SPOTLIGHT
        </div>

        {/* Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto py-5 scrollbar-thin scrollbar-track-[#202030] scrollbar-thumb-bfw-orange"
        >
          {FEATURED_RESTAURANTS.map((restaurant) => (
            <article
              key={restaurant.id}
              className="group relative z-10 min-w-[300px] cursor-pointer overflow-hidden rounded-2xl bg-[#1c1c2e] shadow-[0_10px_30px_rgba(0,0,0,0.25),0_0_20px_rgba(239,95,42,0.2)] transition-all duration-300 hover:-translate-y-4 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3),0_0_30px_rgba(239,95,42,0.4)]"
            >
              {/* Image */}
              <div className="relative h-[180px] overflow-hidden">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 to-transparent" />
                <Image
                  src={restaurant.image}
                  alt={restaurant.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="300px"
                />
                <div className="absolute left-4 top-4 z-20 rounded-full bg-gradient-to-r from-bfw-orange to-[#ff8e63] px-3 py-1 text-xs font-semibold text-white shadow-md">
                  PREMIUM
                </div>
              </div>

              {/* Content */}
              <div className="relative overflow-hidden p-5">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-heading text-lg font-bold text-white">
                    {restaurant.name}
                  </h3>
                  <div className="text-right">
                    <StarRating rating={restaurant.rating} />
                    <span className="text-xs text-[#aaa]">
                      {restaurant.rating} ({restaurant.reviews})
                    </span>
                  </div>
                </div>

                <div className="mb-3 inline-block rounded border-l-[3px] border-bfw-orange bg-white/5 px-2.5 py-1 text-[13px] text-[#ccc]">
                  {restaurant.location}
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  {restaurant.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#ccc]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2.5">
                  <Link
                    href={restaurant.menuUrl}
                    className="flex-1 rounded-md bg-gradient-to-r from-bfw-orange to-[#ff8e63] py-2.5 text-center text-[13px] font-semibold text-white shadow-[0_3px_10px_rgba(239,95,42,0.3)] transition-shadow hover:shadow-[0_5px_15px_rgba(239,95,42,0.5)]"
                  >
                    VIEW MENU
                  </Link>
                  <a
                    href={restaurant.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-md border border-white/10 bg-white/5 py-2.5 text-center text-[13px] font-semibold text-[#ccc] transition-colors hover:bg-white/10 hover:text-white"
                  >
                    GET DIRECTIONS
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-[#ccc] transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
            aria-label="Previous"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-[#ccc] transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
            aria-label="Next"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
