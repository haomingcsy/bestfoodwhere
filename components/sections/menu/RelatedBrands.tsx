import type { RelatedBrand } from "@/types/brand";
import Image from "next/image";
import { useMemo } from "react";
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
  // Convert record to Map for the helper function
  const cdnUrlMap = useMemo(() => new Map(Object.entries(cdnUrls)), [cdnUrls]);

  // Convert Google thumbnail URLs to higher resolution
  const getHighResGoogleUrl = (url: string): string => {
    if (url.includes("googleusercontent.com")) {
      // Request larger image size (800px width)
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
    const highResUrl = getHighResGoogleUrl(originalUrl);
    return (
      getOptimizedMenuUrl(highResUrl, cdnUrlMap, "relatedBrand") || highResUrl
    );
  };

  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-6 text-[20px] font-medium text-[#202124]">{title}</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={`${item.name}-${item.location}`}
            className="overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_4px_6px_rgba(0,0,0,0.12)]"
          >
            <div className="relative h-[200px] bg-gray-100">
              {item.imageUrl ? (
                <Image
                  src={getImageUrl(item.imageUrl) || item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  unoptimized={item.imageUrl.includes("googleusercontent.com")}
                />
              ) : null}
              {item.price ? (
                <div className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1 text-[13px] font-medium text-white">
                  {item.price}
                </div>
              ) : null}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[18px] font-medium text-[#202124]">
                  {item.name}
                </h3>
                {item.unit ? (
                  <span className="rounded-md bg-[#f1f3f4] px-2 py-1 text-[13px] font-medium text-[#5f6368]">
                    {item.unit}
                  </span>
                ) : null}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#5f6368]">
                <span className="inline-flex items-center gap-2">
                  {getStarRow(item.rating)}
                  <span className="font-medium text-[#202124]">
                    {item.rating.toFixed(1)}
                  </span>
                </span>
                <span className="text-[14px]">
                  ({item.reviewCount} reviews)
                </span>
              </div>

              {item.cuisines?.length || item.diningStyles?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(item.cuisines ?? []).slice(0, 2).map((tag) => (
                    <span
                      key={`${item.name}-${tag}`}
                      className="rounded-full bg-[#f1f3f4] px-3 py-1 text-[13px] text-[#202124]"
                    >
                      {tag}
                    </span>
                  ))}
                  {(item.diningStyles ?? []).slice(0, 2).map((tag) => (
                    <span
                      key={`${item.name}-${tag}-style`}
                      className="rounded-full bg-[#f1f3f4] px-3 py-1 text-[13px] text-[#202124]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {item.openingHours ? (
                <p className="mt-3 text-[14px] text-[#188038]">
                  {item.openingHours}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
