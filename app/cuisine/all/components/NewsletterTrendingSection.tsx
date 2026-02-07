"use client";

import { useState } from "react";
import Link from "next/link";
import { TRENDING_FOODS } from "../data";

export function NewsletterTrendingSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubscribe = () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 5000);
    }, 1500);
  };

  return (
    <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
      {/* Newsletter Signup */}
      <div className="rounded-xl bg-white p-8 shadow-[0_3px_10px_rgba(0,0,0,0.1)]">
        <h3 className="mb-4 font-heading text-[22px] font-semibold text-[#333]">
          Subscribe to our Newsletter
        </h3>
        <p className="mb-5 font-body text-sm text-[#666]">
          Get exclusive deals and new restaurant notifications delivered to your
          inbox.
        </p>

        <div className="mb-4 flex">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-grow rounded-l-md border border-r-0 border-[#ddd] px-4 py-3 font-body text-sm outline-none focus:border-bfw-orange"
          />
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={status === "loading"}
            className="rounded-r-md bg-bfw-orange px-5 font-heading text-sm font-semibold text-white transition-colors hover:bg-bfw-orange-hover disabled:opacity-70"
          >
            {status === "loading" ? "..." : "Subscribe"}
          </button>
        </div>

        {status === "success" && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
            Thank you! You&apos;ve been subscribed successfully.
          </div>
        )}

        {status === "error" && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Please enter a valid email address.
          </div>
        )}

        <p className="mb-4 font-body text-xs text-[#999]">
          By subscribing, you agree to receive marketing emails from us. You can
          unsubscribe at any time.
        </p>

        <div className="flex items-center rounded-md bg-[#f8f8f8] p-3">
          <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs text-white">
            ✓
          </div>
          <p className="font-body text-xs text-[#666]">
            Your information is secure and will never be shared with third
            parties.
          </p>
        </div>
      </div>

      {/* Trending Food Categories */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-bfw-orange to-[#ff8e63] p-8 text-white shadow-[0_10px_25px_rgba(239,95,42,0.2)]">
        <div className="absolute -bottom-10 -right-5 h-[150px] w-[150px] rounded-full bg-white opacity-10" />
        <div className="absolute -left-8 -top-8 h-[100px] w-[100px] rounded-full bg-white opacity-10" />

        <h3 className="relative z-10 mb-4 font-heading text-[22px] font-bold drop-shadow-sm">
          Trending Food Categories
        </h3>
        <p className="relative z-10 mb-5 font-body text-[15px] opacity-90">
          The hottest food trends in Singapore right now
        </p>

        <div className="relative z-10 space-y-4">
          {TRENDING_FOODS.map((food) => (
            <Link
              key={food.id}
              href={food.url}
              className="group flex items-center justify-between rounded-xl bg-white/15 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:bg-white/25 hover:shadow-[0_8px_16px_rgba(0,0,0,0.15)]"
            >
              <div className="flex items-center">
                <div className="mr-4 flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-white/30 text-xl shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
                  🔥
                </div>
                <div>
                  <h4 className="font-heading text-[17px] font-semibold">
                    {food.name}
                  </h4>
                  <p className="font-body text-[13px] text-white/90">
                    {food.description}
                  </p>
                </div>
              </div>
              <span className="text-xl font-semibold transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
