"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { Review, ReviewSummary } from "@/types/brand";

interface DbReview {
  author: string;
  authorPhotoUrl?: string;
  authorProfileUrl?: string;
  rating: number;
  date: string;
  content: string;
  publishTime?: string;
}

interface Props {
  brandName: string;
  locationName: string;
  summary?: ReviewSummary;
  dbReviews?: DbReview[];
  dbRating?: number;
  dbReviewCount?: number;
}

interface UserReview extends Review {
  id: string;
  createdAt: number;
}

interface NormalizedReview {
  author: string;
  authorPhotoUrl?: string;
  rating: number;
  timeAgo: string;
  text: string;
  source: "Google" | "BestFoodWhere";
  id: string;
}

// Deterministic avatar colors based on author name (Google-style)
const AVATAR_COLORS = [
  "#1a73e8",
  "#e8710a",
  "#d93025",
  "#188038",
  "#8430ce",
  "#795548",
  "#607d8b",
  "#0097a7",
  "#689f38",
  "#ef6c00",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
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
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears === 1 ? "" : "s"} ago`;
}

function StarRating({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm"
      ? "text-[14px]"
      : size === "lg"
        ? "text-[22px]"
        : "text-[18px]";
  const full = Math.max(0, Math.min(5, Math.floor(rating)));
  const empty = 5 - full;
  return (
    <span
      className={`inline-flex items-center gap-0.5 leading-none ${sizeClass}`}
      aria-label={`${rating} out of 5`}
    >
      <span className="text-[#fbbf24]">{"★".repeat(full)}</span>
      <span className="text-[#d1d5db]">{"☆".repeat(empty)}</span>
    </span>
  );
}

function getDistribution(
  reviews: Array<{ rating?: number }>,
): Record<1 | 2 | 3 | 4 | 5, number> {
  const counts: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  for (const review of reviews) {
    const v = review.rating;
    if (typeof v === "number" && v >= 1 && v <= 5) counts[clampRating(v)] += 1;
  }
  return counts;
}

// Stop words to exclude from keyword extraction
const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "is",
  "it",
  "was",
  "were",
  "are",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "can",
  "shall",
  "this",
  "that",
  "these",
  "those",
  "i",
  "we",
  "you",
  "he",
  "she",
  "they",
  "me",
  "him",
  "her",
  "us",
  "them",
  "my",
  "your",
  "his",
  "its",
  "our",
  "their",
  "what",
  "which",
  "who",
  "whom",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "also",
  "even",
  "here",
  "there",
  "then",
  "now",
  "about",
  "up",
  "out",
  "if",
  "because",
  "as",
  "until",
  "while",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "through",
  "into",
  "over",
  "really",
  "quite",
  "much",
  "many",
  "well",
  "get",
  "got",
  "go",
  "went",
  "come",
  "came",
  "make",
  "made",
  "take",
  "took",
  "give",
  "gave",
  "say",
  "said",
  "think",
  "thought",
  "know",
  "knew",
  "see",
  "saw",
  "want",
  "look",
  "use",
  "find",
  "found",
  "tell",
  "told",
  "ask",
  "asked",
  "work",
  "seem",
  "feel",
  "try",
  "tried",
  "leave",
  "left",
  "call",
  "good",
  "great",
  "nice",
  "bad",
  "like",
  "one",
  "two",
  "first",
  "new",
  "old",
  "big",
  "small",
  "long",
  "little",
  "way",
  "thing",
  "things",
  "day",
  "time",
  "back",
  "still",
  "don",
  "doesn",
  "didn",
  "won",
  "ve",
  "re",
  "ll",
  "let",
  "going",
  "doing",
  "having",
  "being",
  "am",
  "an",
  "bit",
  "lot",
  "though",
  "however",
  "always",
  "never",
  "ever",
  "yet",
  "already",
  "anything",
  "everything",
  "nothing",
  "something",
  "someone",
  "anyone",
  "everyone",
  "place",
  "places",
  "people",
  "person",
  "definitely",
  "absolutely",
  "especially",
  "pretty",
  "enough",
  "rather",
  "usually",
  "actually",
  "probably",
]);

function extractKeywords(
  reviews: NormalizedReview[],
): Array<{ word: string; count: number }> {
  const wordCounts = new Map<string, number>();

  for (const review of reviews) {
    // Extract unique words per review (so a word appearing many times in one review counts once)
    const words = new Set(
      review.text
        .toLowerCase()
        .replace(/[^a-z\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
    );
    for (const word of words) {
      wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
    }
  }

  return Array.from(wordCounts.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

type SortOption = "relevant" | "newest" | "highest" | "lowest";

// Three-dot menu icon
function ThreeDotIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2Zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Z" />
    </svg>
  );
}

// Multicolor Google "G" logo SVG
function GoogleGLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Individual review card component (light theme style)
function ReviewCard({
  review,
  likes,
  onLike,
  onShare,
}: {
  review: NormalizedReview;
  likes: number;
  onLike: () => void;
  onShare: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const isLong = review.text.length > 180;
  const avatarColor = getAvatarColor(review.author);

  return (
    <div className="py-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {review.authorPhotoUrl && !photoError ? (
          <img
            src={review.authorPhotoUrl}
            alt={review.author}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
            onError={() => setPhotoError(true)}
          />
        ) : (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-medium text-white"
            style={{ backgroundColor: avatarColor }}
          >
            {review.author.trim().slice(0, 1).toUpperCase()}
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Row 1: Author name + three-dot menu */}
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-gray-900">
              {review.author}
            </span>
            <button
              type="button"
              className="shrink-0 rounded-full p-1 text-gray-500 transition hover:bg-gray-100"
              aria-label="More options"
            >
              <ThreeDotIcon />
            </button>
          </div>

          {/* Row 2: Local Guide badge */}
          <div className="mt-0.5">
            <span className="text-[12px] text-gray-500">
              {review.source === "Google"
                ? "Local Guide"
                : "BestFoodWhere reviewer"}
            </span>
          </div>

          {/* Row 3: Stars + time ago */}
          <div className="mt-1.5 flex items-center gap-2">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-[12px] text-gray-500">{review.timeAgo}</span>
          </div>

          {/* Row 4: Review text with expand/collapse */}
          <div className="mt-2">
            <p
              className={`whitespace-pre-line text-[14px] leading-[22px] text-gray-700 transition-all duration-200 ${
                isLong && !expanded ? "line-clamp-3" : ""
              }`}
            >
              {review.text}
            </p>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="mt-1 text-[14px] font-medium text-[#4285f4] hover:underline"
              >
                {expanded ? "Show less" : "... More"}
              </button>
            )}
          </div>

          {/* Row 5: Photo thumbnails placeholder */}
          {/* Ready for future photo data - currently hidden */}
          {/* <div className="mt-3 flex gap-2 overflow-x-auto">
            {photos.map((photo, i) => (
              <div key={i} className="h-[80px] w-[80px] shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                <Image src={photo} alt="" fill className="object-cover" />
              </div>
            ))}
          </div> */}

          {/* Row 6: Like + Share actions */}
          <div className="mt-3 flex items-center gap-1">
            <button
              type="button"
              onClick={onLike}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] text-gray-500 transition hover:bg-gray-100"
              aria-label="Like this review"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                />
              </svg>
              {likes > 0 && <span>{likes}</span>}
            </button>
            <button
              type="button"
              onClick={onShare}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] text-gray-500 transition hover:bg-gray-100"
              aria-label="Share this review"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GoogleReviews({
  brandName,
  locationName,
  summary,
  dbReviews,
  dbRating,
  dbReviewCount,
}: Props) {
  const storageKey = `bfw:user-reviews:${brandName.toLowerCase()}`;
  const likesKey = `bfw:review-likes:${brandName.toLowerCase()}`;
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [reviewLikes, setReviewLikes] = useState<Record<string, number>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevant");
  const [showAll, setShowAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const [draftRating, setDraftRating] = useState<number>(0);
  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftText, setDraftText] = useState("");

  // Load user reviews and likes from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as UserReview[];
        setUserReviews(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setUserReviews([]);
    }
    try {
      const raw = localStorage.getItem(likesKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        setReviewLikes(typeof parsed === "object" && parsed ? parsed : {});
      }
    } catch {
      setReviewLikes({});
    }
  }, [storageKey, likesKey]);

  const combinedReviews = useMemo((): NormalizedReview[] => {
    const normalizedUser: NormalizedReview[] = userReviews
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((review) => ({
        id: review.id,
        author: review.author,
        rating: review.rating,
        timeAgo: getRelativeTimeLabel(review.createdAt),
        text: review.content,
        source: "BestFoodWhere" as const,
      }));

    const safeTimeAgo = (dateStr: string | undefined | null): string => {
      if (!dateStr) return "";
      const ts = new Date(dateStr).getTime();
      return isNaN(ts) ? "" : getRelativeTimeLabel(ts);
    };

    // Normalize DB reviews (from Google Places API via Supabase) - these take priority
    const normalizedDb: NormalizedReview[] =
      dbReviews?.map((review, idx) => ({
        id: `db-${idx}`,
        author: review.author,
        authorPhotoUrl: review.authorPhotoUrl,
        rating: review.rating,
        timeAgo: safeTimeAgo(review.publishTime || review.date),
        text: review.content,
        source: "Google" as const,
      })) ?? [];

    const normalizedSheets: NormalizedReview[] =
      summary?.reviews?.map((review, idx) => ({
        id: `google-${idx}`,
        author: review.author,
        rating: review.rating,
        timeAgo: safeTimeAgo(review.date),
        text: review.content,
        source: "Google" as const,
      })) ?? [];

    // Deduplicate: DB reviews take priority over Sheets reviews.
    // Key = lowercase author name + first 50 chars of content
    const seen = new Set<string>();
    const deduped: NormalizedReview[] = [];

    for (const review of normalizedDb) {
      const key = `${review.author.toLowerCase()}|${review.text.slice(0, 50).toLowerCase()}`;
      seen.add(key);
      deduped.push(review);
    }

    for (const review of normalizedSheets) {
      const key = `${review.author.toLowerCase()}|${review.text.slice(0, 50).toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(review);
      }
    }

    return [...normalizedUser, ...deduped];
  }, [summary, dbReviews, userReviews]);

  // Extract keyword chips from reviews
  const keywords = useMemo(
    () => extractKeywords(combinedReviews),
    [combinedReviews],
  );

  // Filter reviews by active chip keyword
  const chipFilteredReviews = useMemo(() => {
    if (!activeChip) return combinedReviews;
    return combinedReviews.filter((r) =>
      r.text.toLowerCase().includes(activeChip.toLowerCase()),
    );
  }, [combinedReviews, activeChip]);

  // Sort reviews
  const sortedReviews = useMemo(() => {
    const sorted = [...chipFilteredReviews];
    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => {
          if (a.source === "BestFoodWhere" && b.source !== "BestFoodWhere")
            return -1;
          if (b.source === "BestFoodWhere" && a.source !== "BestFoodWhere")
            return 1;
          return 0;
        });
      case "highest":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  }, [chipFilteredReviews, sortBy]);

  const INITIAL_SHOW = 5;
  const visibleReviews = showAll
    ? sortedReviews
    : sortedReviews.slice(0, INITIAL_SHOW);

  const distribution = useMemo(
    () => getDistribution(combinedReviews),
    [combinedReviews],
  );
  const totalFromDistribution = useMemo(
    () => Object.values(distribution).reduce((a, b) => a + b, 0),
    [distribution],
  );

  const totalReviewsLabel = useMemo(() => {
    const baseCount =
      dbReviewCount ?? summary?.totalReviews ?? totalFromDistribution;
    const total = baseCount + userReviews.length;
    return `${total} review${total === 1 ? "" : "s"}`;
  }, [dbReviewCount, summary, totalFromDistribution, userReviews.length]);

  const computedRating = useMemo(() => {
    if (typeof dbRating === "number") return dbRating;
    if (summary?.rating) return summary.rating;
    const total = totalFromDistribution;
    if (total === 0) return undefined;
    const sum = Object.entries(distribution).reduce(
      (acc, [k, v]) => acc + Number(k) * v,
      0,
    );
    return sum / total;
  }, [dbRating, distribution, summary, totalFromDistribution]);

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
    } catch {}
    setSuccessVisible(true);
    closeModal();
    window.setTimeout(() => setSuccessVisible(false), 5000);
  };

  const handleLike = useCallback(
    (reviewId: string) => {
      setReviewLikes((prev) => {
        const next = { ...prev, [reviewId]: (prev[reviewId] ?? 0) + 1 };
        try {
          localStorage.setItem(likesKey, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [likesKey],
  );

  const handleShare = useCallback(
    async (review: NormalizedReview) => {
      const text = `${review.author} rated ${brandName} ${review.rating}/5: "${review.text.slice(0, 100)}${review.text.length > 100 ? "..." : ""}"`;
      const url = typeof window !== "undefined" ? window.location.href : "";

      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({ title: `Review of ${brandName}`, text, url });
          return;
        } catch {}
      }
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setCopiedId(review.id);
        window.setTimeout(() => setCopiedId(null), 2000);
      } catch {}
    },
    [brandName],
  );

  const sortOptions: Array<{ key: SortOption; label: string }> = [
    { key: "relevant", label: "Most relevant" },
    { key: "newest", label: "Newest" },
    { key: "highest", label: "Highest rating" },
    { key: "lowest", label: "Lowest rating" },
  ];

  return (
    <section className="rounded-2xl bg-white px-6 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
      {/* Header: Google Reviews title + Write a review */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <GoogleGLogo className="h-6 w-6" />
            <span>Reviews</span>
          </h2>
          <p className="mt-0.5 text-[14px] text-gray-500">{brandName}</p>
          <div className="mt-4 h-[3px] w-10 bg-[#e74c3c]" />
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-[#4285f4] px-4 py-1.5 text-[13px] font-medium text-[#4285f4] transition hover:bg-[#4285f4]/10 sm:px-5 sm:py-2 sm:text-[14px]"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-[16px] w-[16px]"
            fill="currentColor"
          >
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Zm-2 10H6v-2h12v2Zm0-3H6V7h12v2Zm0-3H6V4h12v2Z" />
          </svg>
          Write a review
        </button>
      </div>

      {/* Rating summary + distribution */}
      <div className="mt-5 flex flex-col gap-6 border-b border-gray-200 pb-5 sm:mt-6 sm:flex-row sm:items-start sm:gap-8 sm:pb-6">
        {/* Big rating number + stars */}
        <div className="flex flex-row items-center gap-4 sm:flex-col sm:items-center sm:gap-1 sm:min-w-[120px]">
          <span className="text-[48px] font-light leading-none text-gray-900 sm:text-[56px]">
            {typeof computedRating === "number"
              ? computedRating.toFixed(1)
              : "--"}
          </span>
          <div className="flex flex-col items-start sm:items-center">
            <div className="mt-0 sm:mt-2">
              {typeof computedRating === "number" ? (
                <StarRating rating={computedRating} size="lg" />
              ) : null}
            </div>
            <span className="mt-1 text-[13px] text-gray-500">
              {totalReviewsLabel}
            </span>
          </div>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-1.5 pt-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars as 1 | 2 | 3 | 4 | 5] ?? 0;
            const percentage =
              totalFromDistribution > 0
                ? (count / totalFromDistribution) * 100
                : 0;
            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="w-3 text-right text-[13px] text-gray-500">
                  {stars}
                </span>
                <div className="h-[10px] flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#fbbf24] transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Chips Row */}
      {keywords.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setActiveChip(null)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
              activeChip === null
                ? "bg-[#4285f4] text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            All
          </button>
          {keywords.map((kw) => (
            <button
              key={kw.word}
              type="button"
              onClick={() =>
                setActiveChip(activeChip === kw.word ? null : kw.word)
              }
              className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
                activeChip === kw.word
                  ? "bg-[#4285f4] text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {kw.word} {kw.count}
            </button>
          ))}
        </div>
      )}

      {/* Sort Tabs */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setSortBy(opt.key)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
              sortBy === opt.key
                ? "bg-[#4285f4] text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Success toast */}
      {successVisible && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <svg
            viewBox="0 0 20 20"
            className="h-5 w-5 text-green-700"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
              clipRule="evenodd"
            />
          </svg>
          Thank you! Your review has been added.
        </div>
      )}

      {/* Copied toast */}
      {copiedId && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          Link copied to clipboard
        </div>
      )}

      {/* Review list */}
      <div className="mt-2 divide-y divide-gray-200">
        {visibleReviews.length === 0 && (
          <p className="py-8 text-center text-[14px] text-gray-500">
            No reviews yet. Be the first to share your experience!
          </p>
        )}
        {visibleReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            likes={reviewLikes[review.id] ?? 0}
            onLike={() => handleLike(review.id)}
            onShare={() => handleShare(review)}
          />
        ))}
      </div>

      {/* Show more / Show less */}
      {sortedReviews.length > INITIAL_SHOW && (
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-6 py-2 text-[14px] font-medium text-[#4285f4] transition hover:bg-gray-100"
          >
            {showAll
              ? "Show fewer reviews"
              : `Show all ${sortedReviews.length} reviews`}
            <svg
              viewBox="0 0 24 24"
              className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`}
              fill="currentColor"
            >
              <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41Z" />
            </svg>
          </button>
        </div>
      )}

      {/* Review submission modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close modal"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-medium text-gray-900">
                  Rate and review
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
                  aria-label="Close"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                  >
                    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z" />
                  </svg>
                </button>
              </div>
              <p className="mt-1 text-[14px] text-gray-500">
                {brandName} - {locationName}
              </p>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5">
              {/* Star rating selector */}
              <div className="mb-6 text-center">
                <div className="flex justify-center gap-2 text-[40px] leading-none">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const value = idx + 1;
                    const active = value <= draftRating;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setDraftRating(value)}
                        className={`transition-transform hover:scale-110 ${active ? "text-[#fbbf24]" : "text-[#d1d5db]"}`}
                        aria-label={`${value} star`}
                      >
                        {active ? "★" : "☆"}
                      </button>
                    );
                  })}
                </div>
                {draftRating > 0 && (
                  <p className="mt-2 text-[13px] text-gray-500">
                    {
                      ["", "Poor", "Fair", "Good", "Very good", "Excellent"][
                        draftRating
                      ]
                    }
                  </p>
                )}
              </div>

              <div className="grid gap-4">
                <label className="grid gap-1.5">
                  <span className="text-[13px] font-medium text-gray-500">
                    Your name
                  </span>
                  <input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-[14px] text-gray-900 transition placeholder:text-gray-400 focus:border-[#4285f4] focus:outline-none focus:ring-2 focus:ring-[#4285f4]/20"
                    placeholder="Enter your name"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-[13px] font-medium text-gray-500">
                    Email
                  </span>
                  <input
                    value={draftEmail}
                    onChange={(e) => setDraftEmail(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-[14px] text-gray-900 transition placeholder:text-gray-400 focus:border-[#4285f4] focus:outline-none focus:ring-2 focus:ring-[#4285f4]/20"
                    placeholder="your@email.com"
                    type="email"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-[13px] font-medium text-gray-500">
                    Your review
                  </span>
                  <textarea
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    className="min-h-[100px] w-full resize-y rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-[14px] text-gray-900 transition placeholder:text-gray-400 focus:border-[#4285f4] focus:outline-none focus:ring-2 focus:ring-[#4285f4]/20"
                    placeholder="Share your experience at this location..."
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full px-5 py-2 text-[14px] font-medium text-[#4285f4] transition hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!formValid}
                  onClick={submitReview}
                  className={`rounded-full px-6 py-2 text-[14px] font-medium transition ${
                    formValid
                      ? "bg-[#4285f4] text-white hover:bg-[#3367d6] hover:shadow-md"
                      : "cursor-not-allowed bg-gray-200 text-gray-400"
                  }`}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
