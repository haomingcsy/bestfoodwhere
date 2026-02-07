"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IconPin, IconPhone, IconChevronDown } from "@/components/layout/icons";
import type { Restaurant } from "@/types/dining";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(
        <span key={i} className="text-[#ffc107]">
          ★
        </span>,
      );
    } else if (i - rating < 1 && i - rating > 0) {
      stars.push(
        <span key={i} className="relative inline-block text-[#ffc107]">
          ★
          <span
            className="absolute inset-0 overflow-hidden"
            style={{ width: "50%" }}
          >
            <span className="text-[#e0e0e0]">★</span>
          </span>
        </span>,
      );
    } else {
      stars.push(
        <span key={i} className="text-[#e0e0e0]">
          ★
        </span>,
      );
    }
  }
  return <div className="flex tracking-wider">{stars}</div>;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const menuSlug = restaurant.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  const locationSlug = restaurant.location.toLowerCase().replace(/\s+/g, "-");

  return (
    <article className="group relative overflow-hidden rounded-xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_20px_rgba(239,95,42,0.15)]">
      <div className="absolute left-0 right-0 top-0 z-10 h-1 bg-gradient-to-r from-bfw-orange to-bfw-orange-hover" />

      <div className="relative h-[200px] overflow-hidden">
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {restaurant.tag && (
          <div className="absolute right-[-5px] top-4 z-20 bg-gradient-to-r from-bfw-orange to-bfw-orange-hover px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-md">
            {restaurant.tag}
          </div>
        )}
      </div>

      <div className="relative bg-white p-5">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-heading text-lg font-bold text-[#333] transition-colors group-hover:text-bfw-orange">
            {restaurant.name}
          </h3>
          <div className="flex flex-col items-end rounded-md px-2 py-1">
            <StarRating rating={restaurant.rating} />
            <span className="mt-1 font-body text-xs text-[#666]">
              {restaurant.rating} ({restaurant.reviews} reviews)
            </span>
          </div>
        </div>

        <div className="mb-3 inline-block rounded border-l-[3px] border-bfw-orange bg-[#f8f8f8] px-2.5 py-1 font-body text-sm text-[#666]">
          {restaurant.location}
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {restaurant.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#eee] bg-[#f0f0f0] px-3 py-1 font-body text-xs text-[#555] transition-all hover:border-bfw-orange/30 hover:bg-bfw-orange/5 hover:text-bfw-orange"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mb-4 border-l-[3px] border-bfw-orange/30 pl-3 font-body text-sm italic leading-relaxed text-[#555]">
          {restaurant.description}
        </p>

        <div className="mb-4">
          <button
            type="button"
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className={`flex w-full items-center justify-between rounded border border-bfw-orange/30 bg-gradient-to-r from-bfw-orange/10 to-transparent px-4 py-2.5 font-heading text-sm font-semibold text-[#333] transition-all hover:from-bfw-orange/20 hover:shadow-[0_2px_5px_rgba(239,95,42,0.15)] ${
              isDetailsOpen ? "rounded-b-none" : ""
            }`}
          >
            <span>Contact & Hours</span>
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-bfw-orange shadow-sm transition-transform ${
                isDetailsOpen ? "rotate-180 bg-bfw-orange text-white" : ""
              }`}
            >
              <IconChevronDown className="h-3 w-3" />
            </span>
          </button>

          {isDetailsOpen && (
            <div className="animate-[fadeDown_0.3s_ease] rounded-b border border-t-0 border-bfw-orange/30 bg-white p-4">
              <div className="mb-3 flex items-start gap-2.5 border-b border-dashed border-[#eee] pb-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bfw-orange/10 text-bfw-orange">
                  <IconPin className="h-3.5 w-3.5" />
                </span>
                <span className="font-body text-[13px]">
                  <strong>Address:</strong> {restaurant.address}
                </span>
              </div>
              <div className="mb-3 flex items-start gap-2.5 border-b border-dashed border-[#eee] pb-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bfw-orange/10 text-bfw-orange">
                  <IconPhone className="h-3.5 w-3.5" />
                </span>
                <span className="font-body text-[13px]">
                  <strong>Phone:</strong>{" "}
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="text-bfw-orange transition-colors hover:text-bfw-orange-hover hover:underline"
                  >
                    {restaurant.phone}
                  </a>
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bfw-orange/10 text-bfw-orange">
                  🕒
                </span>
                <span className="font-body text-[13px]">
                  <strong>Hours:</strong> {restaurant.hours}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              restaurant.name + ", " + restaurant.location + ", Singapore",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 overflow-hidden rounded-full border border-[#eee] bg-[#f8f8f8] py-2.5 text-center font-heading text-[13px] font-semibold text-[#333] shadow-[0_3px_6px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 hover:bg-[#f0f0f0] hover:shadow-[0_5px_12px_rgba(0,0,0,0.15)]"
          >
            GET DIRECTIONS
          </a>
          <Link
            href={`/menu/${menuSlug}/?location=${locationSlug}`}
            className="flex-1 overflow-hidden rounded-full bg-gradient-to-r from-bfw-orange to-bfw-orange-hover py-2.5 text-center font-heading text-[13px] font-semibold text-white shadow-[0_3px_6px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 hover:from-bfw-orange-hover hover:to-bfw-orange hover:shadow-[0_5px_12px_rgba(239,95,42,0.3)]"
          >
            VIEW MENU
          </Link>
        </div>
      </div>
    </article>
  );
}
