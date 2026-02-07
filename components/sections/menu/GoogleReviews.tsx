"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { Review, ReviewSummary } from "@/types/brand";

interface Props {
  brandName: string;
  locationName: string;
  summary?: ReviewSummary;
}

interface UserReview extends Review {
  id: string;
  createdAt: number;
}

function nowIsoId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clampRating(value: number): 1 | 2 | 3 | 4 | 5 {
  if (value <= 1) return 1;
  if (value === 2) return 2;
  if (value === 3) return 3;
  if (value === 4) return 4;
  return 5;
}

function getRelativeTimeLabel(createdAt: number): string {
  const diffMs = Date.now() - createdAt;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes <= 0) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function getStarRow(rating: number) {
  const full = Math.max(0, Math.min(5, Math.floor(rating)));
  const empty = 5 - full;
  return (
    <span className="inline-flex items-center gap-0.5 text-[20px] leading-none" aria-label={`${rating} out of 5`}>
      <span className="text-[#fbb034]">{"★".repeat(full)}</span>
      <span className="text-[#dadce0]">{"☆".repeat(empty)}</span>
    </span>
  );
}

function getDistribution(reviews: Array<{ rating?: number }>): Record<1 | 2 | 3 | 4 | 5, number> {
  const counts: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of reviews) {
    const v = review.rating;
    if (typeof v === "number" && v >= 1 && v <= 5) counts[clampRating(v)] += 1;
  }
  return counts;
}

export function GoogleReviews({ brandName, locationName, summary }: Props) {
  const storageKey = `bfw:user-reviews:${brandName.toLowerCase()}`;
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const [draftRating, setDraftRating] = useState<number>(0);
  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftText, setDraftText] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as UserReview[];
      setUserReviews(Array.isArray(parsed) ? parsed : []);
    } catch {
      setUserReviews([]);
    }
  }, [storageKey]);

  const combinedReviews = useMemo(() => {
    const normalizedUser = userReviews
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((review) => ({
        author: review.author,
        rating: review.rating,
        timeAgo: getRelativeTimeLabel(review.createdAt),
        text: review.content,
        source: "BestFoodWhere",
      }));

    const normalizedGoogle =
      summary?.reviews?.map((review) => ({
        author: review.author,
        rating: review.rating,
        timeAgo: review.date,
        text: review.content,
        source: "Google",
      })) ?? [];

    return [...normalizedUser, ...normalizedGoogle];
  }, [summary, userReviews]);

  const distribution = useMemo(() => getDistribution(combinedReviews), [combinedReviews]);
  const totalFromDistribution = useMemo(() => Object.values(distribution).reduce((a, b) => a + b, 0), [distribution]);
  const totalReviewsLabel = useMemo(() => {
    const baseCount = summary?.totalReviews ?? totalFromDistribution;
    const total = baseCount + userReviews.length;
    if (userReviews.length > 0) return `${total} reviews`;
    return `${baseCount} Google reviews`;
  }, [summary, totalFromDistribution, userReviews.length]);

  const computedRating = useMemo(() => {
    if (summary?.rating) return summary.rating;
    const total = totalFromDistribution;
    if (total === 0) return undefined;
    const sum = Object.entries(distribution).reduce((acc, [k, v]) => acc + Number(k) * v, 0);
    return sum / total;
  }, [distribution, summary, totalFromDistribution]);

  const formValid = useMemo(() => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draftEmail.trim());
    return (
      draftRating >= 1 &&
      draftRating <= 5 &&
      draftName.trim().length > 0 &&
      emailOk &&
      draftText.trim().length > 0
    );
  }, [draftEmail, draftName, draftRating, draftText]);

  const resetForm = () => {
    setDraftRating(0);
    setDraftName("");
    setDraftEmail("");
    setDraftText("");
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const submitReview = () => {
    if (!formValid) return;

    const review: UserReview = {
      id: nowIsoId(),
      author: draftName.trim(),
      rating: clampRating(draftRating),
      date: new Date().toISOString(),
      content: draftText.trim(),
      createdAt: Date.now(),
    };

    const next = [review, ...userReviews];
    setUserReviews(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Ignore persistence failures.
    }

    setSuccessVisible(true);
    closeModal();
    window.setTimeout(() => setSuccessVisible(false), 5000);
  };

  return (
    <section className="mx-auto max-w-[800px] rounded-2xl bg-white px-6 py-6 shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-3">
        <Image
          src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
          alt="Google"
          width={92}
          height={30}
          className="h-6 w-auto"
        />
        <div className="text-[20px] font-medium text-[#202124]">
          Reviews - <span className="font-semibold">{locationName}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-10 border-b border-[#dadce0] pb-6 md:flex-row md:items-start">
        <div className="min-w-[140px]">
          <div className="flex items-baseline">
            <span className="text-[48px] font-normal text-[#202124]">
              {typeof computedRating === "number" ? computedRating.toFixed(1) : "--"}
            </span>
            <span className="ml-1 text-[20px] text-[#5f6368]">/5</span>
          </div>
          <div className="mt-2">{typeof computedRating === "number" ? getStarRow(computedRating) : null}</div>
          <div className="mt-1 text-[14px] text-[#5f6368]">{totalReviewsLabel}</div>
        </div>

        <div className="flex-1 space-y-3 pt-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars as 1 | 2 | 3 | 4 | 5] ?? 0;
            const percentage = totalFromDistribution > 0 ? (count / totalFromDistribution) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex w-12 items-center justify-end gap-1 text-[14px] text-[#5f6368]">
                  <span>{stars}</span>
                  <span className="text-[#fbb034]">★</span>
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f1f3f4]">
                  <div className="h-full rounded-full bg-[#e74c3c]" style={{ width: `${percentage}%` }} />
                </div>
                <div className="w-12 text-right text-[13px] text-[#5f6368]">({count})</div>
              </div>
            );
          })}
        </div>
      </div>

      {successVisible ? (
        <div className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          Thank you for your review! It has been added to our community reviews.
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="mt-5 inline-flex items-center gap-2 rounded-[4px] bg-[#e74c3c] px-6 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#d44133] hover:shadow-[0_4px_8px_rgba(231,76,60,0.2)]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Zm-2 10H6v-2h12v2Zm0-3H6V7h12v2Zm0-3H6V4h12v2Z" />
        </svg>
        Write a review
      </button>

      <div className="mt-5 flex items-start gap-3 rounded-lg bg-[#f9f9f9] px-4 py-3 text-[14px] text-[#666]">
        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e74c3c] text-[12px] font-semibold text-white">
          i
        </span>
        <p>Reviews submitted here are shown to our community and help others discover great food.</p>
      </div>

      <div className="mt-6 space-y-5">
        {combinedReviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet. Be the first to share your experience!</p>
        ) : null}
        {combinedReviews.slice(0, 8).map((review, index) => (
          <div
            key={`${review.author}-${index}`}
            className="flex gap-4 border-b border-[#dadce0] pb-5 last:border-b-0 last:pb-0"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e74c3c] text-sm font-medium text-white">
              {review.author.trim().slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-[#202124]">{review.author}</div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-[14px] text-[#5f6368]">
                {typeof review.rating === "number" ? <span>{getStarRow(review.rating)}</span> : null}
                {review.timeAgo ? <span>{review.timeAgo}</span> : null}
                {review.source ? <span>Posted on {review.source}</span> : null}
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#202124]">
                {review.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {modalOpen ? (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close modal" onClick={closeModal} />
          <div className="relative w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 bg-[#e74c3c] px-6 py-4 text-white">
              <h3 className="text-lg font-medium">
                Rate and review {brandName} <span className="font-semibold">{locationName}</span>
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
                aria-label="Close"
              >
                x
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="mb-5">
                <div className="text-sm font-medium text-gray-600">Score</div>
                <div className="mt-2 flex gap-2 text-[32px] leading-none">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const value = idx + 1;
                    const active = value <= draftRating;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setDraftRating(value)}
                        className={active ? "text-[#fbb034]" : "text-[#dadce0]"}
                        aria-label={`${value} star`}
                      >
                        {active ? "★" : "☆"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-gray-600">Your Name</span>
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm text-gray-900 shadow-sm focus:border-[#e74c3c] focus:outline-none focus:ring-2 focus:ring-[#e74c3c]/15"
                    placeholder="Enter your name"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-gray-600">Email Address</span>
                  <input
                    value={draftEmail}
                    onChange={(event) => setDraftEmail(event.target.value)}
                    className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm text-gray-900 shadow-sm focus:border-[#e74c3c] focus:outline-none focus:ring-2 focus:ring-[#e74c3c]/15"
                    placeholder="Enter your email address"
                    type="email"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-gray-600">Your Review</span>
                  <textarea
                    value={draftText}
                    onChange={(event) => setDraftText(event.target.value)}
                    className="min-h-28 w-full resize-y rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#e74c3c] focus:outline-none focus:ring-2 focus:ring-[#e74c3c]/15"
                    placeholder="Share details of your own experience at this location"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!formValid}
                  onClick={submitReview}
                  className={`rounded-md px-5 py-2 text-sm font-semibold text-white transition ${
                    formValid ? "bg-[#e74c3c] hover:bg-[#d44133]" : "cursor-not-allowed bg-gray-300"
                  }`}
                >
                  Post Review
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
