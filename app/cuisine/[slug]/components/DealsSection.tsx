"use client";

import { useState } from "react";
import { IconX } from "@/components/layout/icons";
import type { CuisineDeal } from "../data";

interface DealsSectionProps {
  deals: CuisineDeal[];
  cuisineName: string;
}

const TERMS = [
  "Cannot be combined with other promotions or discounts",
  "Valid for dine-in only",
  "Valid on all days, including public holidays",
  "The management reserves the right to amend the terms & conditions without prior notice",
];

function DealModal({
  deal,
  onClose,
}: {
  deal: CuisineDeal;
  onClose: () => void;
}) {
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
          <p className="mb-4 font-body text-sm leading-relaxed text-[#555]">
            {deal.description}
          </p>

          <div className="mb-5">
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
          </div>

          <div className="mb-5">
            <h4 className="mb-3 font-heading text-lg font-semibold text-[#333]">
              Terms & Conditions:
            </h4>
            <ul className="list-disc space-y-2 pl-5 font-body text-sm text-[#555]">
              {TERMS.map((term) => (
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

export function DealsSection({ deals, cuisineName }: DealsSectionProps) {
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const activeDeal = deals.find((d) => d.id === activeDealId);

  if (deals.length === 0) return null;

  return (
    <section className="mb-5 rounded-xl bg-[#f9f9f9] px-5 py-8">
      <div className="mb-5 text-center">
        <h2 className="font-heading text-[26px] font-bold text-bfw-orange">
          Latest {cuisineName} Restaurant Deals
        </h2>
        <p className="mt-2 font-body text-base text-[#666]">
          Save while enjoying authentic {cuisineName.toLowerCase()} cuisine
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal) => (
          <article
            key={deal.id}
            className="relative rounded-lg bg-white p-6 shadow-[0_3px_10px_rgba(0,0,0,0.1)]"
          >
            <div className="absolute -top-2.5 left-5 rounded-full bg-bfw-orange px-4 py-1 font-heading text-sm font-semibold text-white">
              {deal.badge}
            </div>

            <h3 className="mt-4 font-heading text-base font-semibold text-[#333]">
              {deal.title}
            </h3>
            <p className="mt-2 font-body text-[13px] text-[#666]">
              {deal.duration}
            </p>
            <p className="mt-2 font-body text-sm leading-relaxed text-[#555]">
              {deal.description}
            </p>

            <button
              type="button"
              onClick={() => setActiveDealId(deal.id)}
              className="mt-5 rounded bg-bfw-orange px-4 py-2 font-heading text-[13px] font-semibold text-white transition-colors hover:bg-bfw-orange-hover"
            >
              VIEW DEAL
            </button>
          </article>
        ))}
      </div>

      {activeDeal && (
        <DealModal deal={activeDeal} onClose={() => setActiveDealId(null)} />
      )}
    </section>
  );
}
