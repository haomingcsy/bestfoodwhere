import type { RelatedBrand } from "@/types/brand";
import Image from "next/image";
import Link from "next/link";
import { useRef, useMemo, useState, useCallback } from "react";
import { getOptimizedMenuUrl, IMAGE_PRESETS } from "@/lib/restaurant-images";

interface Props {
  title: string;
  items: RelatedBrand[];
  cdnUrls?: Record<string, string>;
}

function getStarRow(rating: number) {
  const full = Math.max(0, Math.min(5, Math.floor(rating)));
  const empty = 5 - full;
  return (
    <span className="inline-flex items-center gap-0.5 text-[16px] leading-none">
      <span className="text-[#fbb034]">{"★".repeat(full)}</span>
      <span className="text-[#dadce0]">{"☆".repeat(empty)}</span>
    </span>
  );
}

export function RelatedBrands({ title, items, cdnUrls = {} }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Convert record to Map for the helper function
  const cdnUrlMap = useMemo(() => new Map(Object.entries(cdnUrls)), [cdnUrls]);

  // Convert Google thumbnail URLs to higher resolution
  const getHighResGoogleUrl = (url: string): string => {
    if (url.includes("googleusercontent.com")) {
      if (url.includes("=w") || url.includes("=s")) {
        return url
          .replace(/=w\d+-h\d+[^&]*/, "=w800-h600")
          .replace(/=s\d+[^&]*/, "=s800");
      }
      return url + "=w800-h600";
    }
    return url;
  };

  // Helper to get optimized image URL
  const getImageUrl = (originalUrl: string | undefined) => {
    if (!originalUrl) return undefined;
    const directCdn = cdnUrlMap.get(originalUrl);
    if (directCdn) return directCdn;
    const highResUrl = getHighResGoogleUrl(originalUrl);
    return (
      getOptimizedMenuUrl(highResUrl, cdnUrlMap, "relatedBrand") || highResUrl
    );
  };

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      const el = scrollRef.current;
      if (!el) return;
      const cardWidth = 280 + 16; // card width + gap
      el.scrollBy({
        left: direction === "left" ? -cardWidth * 2 : cardWidth * 2,
        behavior: "smooth",
      });
      // Update state after scroll animation
      setTimeout(updateScrollState, 350);
    },
    [updateScrollState],
  );

  if (items.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[20px] font-medium text-[#202124]">{title}</h2>
        {items.length > 2 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-30 disabled:cursor-default"
              aria-label="Scroll left"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-30 disabled:cursor-default"
              aria-label="Scroll right"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => {
          const href = item.slug
            ? `/menu/${item.slug}?location=${item.location}`
            : undefined;

          const card = (
            <div
              className="w-[280px] flex-shrink-0 overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_4px_6px_rgba(0,0,0,0.12)]"
            >
              <div className="relative h-[160px] bg-gray-100">
                {item.imageUrl
                  ? (() => {
                      const resolvedUrl =
                        getImageUrl(item.imageUrl) || item.imageUrl;
                      return (
                        <Image
                          src={resolvedUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized={
                            !resolvedUrl.includes("/storage/v1/object/public/")
                          }
                        />
                      );
                    })()
                  : null}
                {item.price ? (
                  <div className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1 text-[13px] font-medium text-white">
                    {item.price}
                  </div>
                ) : null}
              </div>
              <div className="p-4">
                <h3 className="truncate text-[16px] font-medium text-[#202124]">
                  {item.name}
                </h3>

                <div className="mt-1.5 flex items-center gap-2 text-sm text-[#5f6368]">
                  <span className="inline-flex items-center gap-1.5">
                    {getStarRow(item.rating)}
                    <span className="font-medium text-[#202124]">
                      {item.rating.toFixed(1)}
                    </span>
                  </span>
                  <span className="text-[13px]">
                    ({item.reviewCount})
                  </span>
                </div>

                {item.cuisines?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.cuisines.slice(0, 2).map((tag) => (
                      <span
                        key={`${item.name}-${tag}`}
                        className="rounded-full bg-[#f1f3f4] px-2.5 py-0.5 text-[12px] text-[#202124]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );

          return href ? (
            <Link
              key={`${item.slug}-${item.location}`}
              href={href}
              className="flex-shrink-0"
            >
              {card}
            </Link>
          ) : (
            <div key={`${item.name}-${item.location}`} className="flex-shrink-0">
              {card}
            </div>
          );
        })}
      </div>
    </section>
  );
}
