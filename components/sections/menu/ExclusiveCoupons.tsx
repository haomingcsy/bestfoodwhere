"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface Props {
  brandName: string;
  coupons: string[];
}

interface CouponEntry {
  code: string;
  description: string;
}

function parseCouponLine(line: string): CouponEntry {
  const trimmed = line.trim();
  if (!trimmed) return { code: "", description: "" };
  const separator = trimmed.includes("|") ? "|" : trimmed.includes(" - ") ? " - " : null;
  if (separator) {
    const [code, ...rest] = trimmed.split(separator).map((part) => part.trim());
    return { code: code || trimmed, description: rest.join(" ").trim() || "" };
  }
  return { code: trimmed, description: "" };
}

export function ExclusiveCoupons({ brandName, coupons }: Props) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const parsedCoupons = useMemo(() => {
    if (coupons.length === 0) return [];
    return coupons.map((line) => parseCouponLine(line)).filter((entry) => entry.code);
  }, [coupons]);

  const previewLines = useMemo(() => {
    if (parsedCoupons.length > 0) {
      return parsedCoupons.slice(0, 3).map((entry) => entry.description || entry.code);
    }
    return [];
  }, [parsedCoupons]);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return undefined;
    let isMounted = true;

    client.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setIsAuthenticated(Boolean(data.session));
    });

    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setIsAuthenticated(Boolean(session));
    });

    return () => {
      isMounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  const handleRevealClick = () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setIsRevealed((value) => !value);
  };

  return (
    <section className="rounded-2xl bg-white px-6 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
      <h3 className="text-lg font-semibold text-gray-900">Exclusive {brandName} Discount Coupons</h3>
      <p className="mt-1 text-sm text-gray-600">
        Log in to reveal exclusive coupon codes.
      </p>

      <div className="mt-5 rounded-xl border-2 border-dashed border-[#4CAF50] bg-gradient-to-br from-white to-[#e8f5e9] px-5 py-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#4CAF50] to-[#45a049] text-white shadow-md">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="11" width="16" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <div className="text-lg font-semibold text-gray-900">Exclusive Coupons Available</div>
        <p className="mt-2 text-sm text-gray-600">
          Get instant access to special discount codes from {brandName}
        </p>

        {!parsedCoupons.length ? (
          <p className="mt-4 text-sm text-gray-600">No coupons listed yet.</p>
        ) : null}

        {parsedCoupons.length > 0 ? (
          <button
            type="button"
            onClick={handleRevealClick}
            className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#4CAF50] to-[#45a049] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
          >
            {isAuthenticated && isRevealed
              ? "Hide Coupon Codes"
              : isAuthenticated
                ? "Reveal Coupon Codes"
                : "Log in to Reveal"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setIsTermsOpen(true)}
          className="mt-3 text-xs text-[#4CAF50] underline"
        >
          Terms and conditions apply
        </button>

        {isAuthenticated && isRevealed ? (
          <div className="mt-5 rounded-xl bg-white/70 px-4 py-3 text-left text-sm text-gray-800">
            <div className="font-semibold text-gray-900">Your Coupon Codes</div>
            <ul className="mt-2 space-y-3">
              {parsedCoupons.map((entry) => (
                <li key={entry.code} className="rounded-lg border border-dashed border-[#4CAF50]/60 px-3 py-2">
                  <div className="text-sm font-semibold text-[#1b5e20]">{entry.code}</div>
                  {entry.description ? (
                    <div className="mt-1 text-xs text-gray-600">{entry.description}</div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {isLoginOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Login required"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h4 className="text-lg font-bold text-gray-900">Login required</h4>
            <p className="mt-2 text-[15px] text-gray-600">
              Please log in to reveal coupon codes.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsLoginOpen(false)}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-border bg-white text-sm font-semibold text-gray-900 hover:bg-[#fff9f6]"
              >
                Cancel
              </button>
              <Link
                href="/login"
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-bfw-red text-sm font-semibold text-white hover:opacity-95"
              >
                Go to login
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {isTermsOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Coupon terms and conditions"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h4 className="text-lg font-bold text-gray-900">Coupon Terms & Conditions</h4>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
              <li>Each coupon code is valid for one redemption per transaction.</li>
              <li>Not valid with other promotions, discounts, or vouchers unless stated.</li>
              <li>Valid only at participating outlets listed on the brand page.</li>
              <li>Minimum spend may apply; see the coupon description for details.</li>
              <li>While stocks last and subject to availability.</li>
              <li>BestFoodWhere.sg reserves the right to amend or withdraw offers.</li>
            </ul>
            <button
              type="button"
              onClick={() => setIsTermsOpen(false)}
              className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-xl border border-border bg-white text-sm font-semibold text-gray-900 hover:bg-[#fff9f6]"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
