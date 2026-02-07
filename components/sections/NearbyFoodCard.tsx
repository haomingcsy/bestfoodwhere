"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { NearbyRestaurant } from "@/types/nearby-food";

interface Props {
  restaurant: NearbyRestaurant;
}

export function NearbyRestaurantCard({ restaurant }: Props) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/menu/${restaurant.brandSlug}?location=${restaurant.locationSlug}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {imageError || !restaurant.imageUrl ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
            <svg
              className="h-12 w-12 text-orange-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
        ) : (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.brandName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageError(true)}
            unoptimized
          />
        )}
        {/* Distance Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm">
          <svg
            className="h-4 w-4 text-bfw-orange"
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
          <span className="font-heading text-xs font-bold text-gray-800">
            {restaurant.distance} km
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* Restaurant Name */}
        <h3 className="font-heading text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-bfw-orange transition-colors">
          {restaurant.brandName}
        </h3>

        {/* Location */}
        <p className="mt-1 font-body text-sm text-gray-500 line-clamp-1">
          {restaurant.locationName}
        </p>

        {/* Rating & Reviews */}
        {restaurant.rating > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <svg
                className="h-4 w-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-heading text-sm font-semibold text-gray-800">
                {restaurant.rating.toFixed(1)}
              </span>
            </div>
            {restaurant.reviewCount > 0 && (
              <span className="font-body text-xs text-gray-500">
                ({restaurant.reviewCount} reviews)
              </span>
            )}
          </div>
        )}

        {/* Cuisine Tags */}
        {restaurant.cuisine.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {restaurant.cuisine.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-orange-50 px-2.5 py-0.5 font-body text-xs text-orange-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Price & Menu Items */}
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          {restaurant.priceRange && (
            <span className="font-heading text-sm font-semibold text-gray-700">
              {restaurant.priceRange}
            </span>
          )}
          {restaurant.menuItemCount > 0 && (
            <span className="font-body text-xs text-gray-500">
              {restaurant.menuItemCount} menu items
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function NearbyRestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="relative aspect-[4/3] animate-pulse bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
