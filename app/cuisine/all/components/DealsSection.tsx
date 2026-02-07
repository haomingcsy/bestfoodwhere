"use client";

import { useState } from "react";
import Image from "next/image";
import { IconX } from "@/components/layout/icons";
import { CUISINE_DEALS } from "../data";
import type { CuisineDeal } from "../data";

function DealModal({
  deal,
  onClose,
}: {
  deal: CuisineDeal;
  onClose: () => void;
}) {
  const copyCode = () => {
    navigator.clipboard.writeText(deal.code);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Deal details"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-[#eee] p-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full p-2 text-[#555] hover:bg-gray-100"
          >
            <IconX className="h-5 w-5" />
          </button>

          <h3 className="pr-8 font-heading text-[22px] font-semibold text-bfw-orange">
            {deal.title}
          </h3>
          <p className="mt-2 font-body text-sm text-[#666]">{deal.duration}</p>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="relative mb-5 h-[200px] overflow-hidden rounded-lg">
            <Image
              src={deal.image}
              alt={deal.title}
              fill
              className="object-cover"
              sizes="500px"
            />
          </div>

          <p className="mb-4 font-body text-sm leading-relaxed text-[#555]">
            {deal.description}
          </p>

          <div className="mb-5">
            <h4 className="mb-3 font-heading text-lg font-semibold text-[#333]">
              Participating Locations:
            </h4>
            <ul className="list-disc space-y-2 pl-5 font-body text-sm text-[#555]">
              {deal.participants.map((participant) => (
                <li key={participant}>{participant}</li>
              ))}
            </ul>
          </div>

          <div className="mb-5 rounded-lg bg-[#f8f8f8] p-4">
            <h4 className="mb-3 font-heading text-lg font-semibold text-[#333]">
              How to Redeem:
            </h4>
            <p className="mb-2 font-body text-sm text-[#555]">
              1. Show this deal to the staff when ordering
            </p>
            <p className="mb-3 font-body text-sm text-[#555]">
              2. Mention the promo code:
            </p>
            <div className="mb-3 rounded-md border border-dashed border-bfw-orange bg-[#fff6f2] p-2.5 text-center">
              <span className="font-heading text-lg font-bold text-bfw-orange">
                {deal.code}
              </span>
            </div>
            <button
              type="button"
              onClick={copyCode}
              className="w-full rounded-md bg-bfw-orange py-2 font-heading text-sm font-semibold text-white transition-colors hover:bg-bfw-orange-hover"
            >
              Copy Code
            </button>
          </div>

          <div className="mb-5">
            <h4 className="mb-3 font-heading text-lg font-semibold text-[#333]">
              Terms & Conditions:
            </h4>
            <ul className="list-disc space-y-2 pl-5 font-body text-sm text-[#555]">
              {deal.terms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md bg-bfw-orange py-3 font-heading text-base font-semibold text-white transition-colors hover:bg-bfw-orange-hover"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function DealsSection() {
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const activeDeal = CUISINE_DEALS.find((d) => d.id === activeDealId);

  return (
    <section className="relative mb-8 overflow-hidden rounded-xl bg-[#fff6f2] px-6 py-8">
      <div className="absolute -right-10 top-0 z-0 h-[150px] w-[150px] rotate-45 -translate-y-[70%] bg-bfw-orange opacity-10" />

      <div className="relative z-10 mb-8 text-center">
        <h2 className="font-heading text-[26px] font-bold text-bfw-orange">
          Special Deals & Promotions
        </h2>
        <p className="mt-2 font-body text-base text-[#666]">
          Exclusive offers from our partner restaurants
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        {CUISINE_DEALS.map((deal) => (
          <article
            key={deal.id}
            onClick={() => setActiveDealId(deal.id)}
            className="flex cursor-pointer items-center rounded-xl bg-white p-5 shadow-[0_3px_10px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(239,95,42,0.15)]"
          >
            <div className="relative mr-4 flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-[#f0f0f0]">
              <span className="font-heading text-2xl font-bold text-bfw-orange">
                {deal.badge}
              </span>
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-bfw-orange text-base font-bold text-white">
                !
              </div>
            </div>

            <div className="flex-1">
              <h3 className="mb-1 font-heading text-base font-semibold text-[#333]">
                {deal.title}
              </h3>
              <p className="mb-2 font-body text-sm text-[#666]">
                {deal.subtitle}
              </p>
              <span className="flex items-center font-heading text-[13px] font-semibold text-bfw-orange">
                VIEW DETAILS <span className="ml-1">→</span>
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="relative z-10 mt-6 text-center">
        <button
          type="button"
          className="inline-block rounded-full bg-bfw-orange px-8 py-3 font-heading text-[15px] font-semibold text-white transition-colors hover:bg-bfw-orange-hover"
        >
          View All Promotions
        </button>
      </div>

      {activeDeal && (
        <DealModal deal={activeDeal} onClose={() => setActiveDealId(null)} />
      )}
    </section>
  );
}
