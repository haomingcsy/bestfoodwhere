"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  IconBrackets,
  IconPercent,
  IconPin,
  IconStar,
  IconX,
} from "@/components/layout/icons";

type DealType = "discount" | "free-item" | "1-for-1";

interface Deal {
  id: number;
  badge: string;
  exclusive?: boolean;
  title: string;
  location: string;
  description: string;
  validUntil: string;
  dealType: DealType;
}

const TERMS = [
  "Valid for dine-in only unless specified otherwise",
  "Cannot be used in conjunction with other promotions or discounts",
  "Valid until the date shown, while stocks last",
  "The management reserves the right to amend the terms & conditions without prior notice",
] as const;

function DealIcon({ type }: { type: DealType }) {
  if (type === "discount") return <IconPercent className="h-5 w-5" />;
  if (type === "free-item") return <IconBrackets className="h-5 w-5" />;
  return <IconStar className="h-5 w-5" />;
}

export function LatestFoodDeals() {
  const deals = useMemo<Deal[]>(
    () => [
      {
        id: 19,
        badge: "30% OFF",
        exclusive: true,
        title: "30% OFF All Items at Ajisen Ramen",
        location: "IMM",
        description: "Buy one main course and get another free during weekday lunches",
        validUntil: "6 Jun 2025",
        dealType: "discount",
      },
      {
        id: 9,
        badge: "FREE DESSERT",
        title: "Free Dessert with Any Main at Curry Times",
        location: "Velocity Novena Square",
        description: "Weekend special promotion on our most popular dishes",
        validUntil: "6 May 2025",
        dealType: "free-item",
      },
      {
        id: 29,
        badge: "1-FOR-1",
        exclusive: true,
        title: "1-for-1 Main Course at Ajisen Ramen",
        location: "AMK Hub",
        description:
          "Exclusive offer for first-time customers. Buy one main course and get another free!",
        validUntil: "6 Jun 2025",
        dealType: "1-for-1",
      },
    ],
    []
  );

  const [activeId, setActiveId] = useState<number | null>(null);
  const activeDeal = deals.find((d) => d.id === activeId) ?? null;

  return (
    <section className="w-full bg-[#fff9f6] py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="text-left max-[480px]:text-center">
          <h2 className="font-heading text-[28px] font-bold text-[#1a1a1a] md:text-[32px]">
            Save While You Savor—Latest Food Deals in Singapore
          </h2>
          <p className="mt-2 font-heading text-[16px] font-medium text-[#666666]">
            Exclusive offers and promotions from the best restaurants
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <article
              key={deal.id}
              className="flex h-full flex-col rounded-2xl border border-[#f0f0f0] bg-white p-7 shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,0,0,0.1)]"
            >
              <div className="flex-1">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-bfw-orange">
                    <DealIcon type={deal.dealType} />
                  </span>
                  <span className="font-heading text-[14px] font-semibold text-bfw-orange">
                    {deal.badge}
                  </span>
                  {deal.exclusive ? (
                    <span className="ml-auto rounded-full bg-bfw-orange px-3 py-1 font-heading text-[12px] font-semibold text-white">
                      EXCLUSIVE
                    </span>
                  ) : null}
                </div>

                <h3 className="font-heading text-[20px] font-semibold text-[#1a1a1a]">
                  {deal.title}
                </h3>

                <div className="mt-3 flex items-center gap-2 font-body text-[14px] text-[#666666]">
                  <IconPin className="h-4 w-4 text-[#666666]" />
                  <span>{deal.location}</span>
                </div>

                <p className="mt-4 font-body text-[14px] leading-relaxed text-[#666666]">
                  {deal.description}
                </p>

                <p className="mt-4 font-body text-[14px] text-[#666666]">
                  Valid until {deal.validUntil}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveId(deal.id)}
                className="mt-6 w-full rounded-xl bg-bfw-orange py-3 font-heading text-[16px] font-semibold text-white transition-colors hover:bg-bfw-orange-hover"
              >
                View Deal
              </button>
            </article>
          ))}
        </div>

        <div className="mt-8 text-left max-[480px]:text-center">
          <Link
            href="/deals"
            className="inline-flex items-center gap-1 font-heading text-[16px] font-semibold text-[#1a1a1a] transition-all hover:gap-2"
          >
            Explore All Deals →
          </Link>
        </div>
      </div>

      {activeDeal ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Deal details"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-5"
          onClick={() => setActiveId(null)}
        >
          <div
            className="w-full max-w-[500px] overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative border-b border-[#eee] p-6">
              <button
                type="button"
                onClick={() => setActiveId(null)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full p-2 text-[#666] hover:bg-gray-100"
              >
                <IconX className="h-5 w-5" />
              </button>

              <h3 className="font-heading text-[20px] font-semibold text-[#1a1a1a]">
                {activeDeal.title}
              </h3>
              <p className="mt-2 flex items-center gap-2 font-body text-[14px] text-[#666666]">
                <IconPin className="h-4 w-4" />
                {activeDeal.location}
              </p>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <p className="font-body text-[14px] leading-relaxed text-[#444]">
                {activeDeal.description}
              </p>

              <div className="mt-6 rounded-lg bg-[#f5f5f5] p-4 font-body text-[13px] leading-relaxed text-[#666666]">
                <strong>Terms &amp; Conditions:</strong>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {TERMS.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>

              <Link
                href="/deals"
                className="mt-6 block w-full rounded-xl bg-bfw-orange py-3 text-center font-heading text-[16px] font-semibold text-white transition-colors hover:bg-bfw-orange-hover"
                onClick={() => setActiveId(null)}
              >
                See Full Details
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
