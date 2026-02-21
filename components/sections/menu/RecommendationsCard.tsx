/* eslint-disable @next/next/no-img-element */
import { useMemo } from "react";
import { getOptimizedMenuUrl, IMAGE_PRESETS } from "@/lib/restaurant-images";

interface Props {
  items: string[];
  cdnUrls?: Record<string, string>;
}

export function RecommendationsCard({ items, cdnUrls = {} }: Props) {
  // Convert record to Map for the helper function
  const cdnUrlMap = useMemo(() => new Map(Object.entries(cdnUrls)), [cdnUrls]);

  // Helper to get optimized image URL
  const getImageUrl = (originalUrl: string) => {
    return (
      getOptimizedMenuUrl(originalUrl, cdnUrlMap, "recommendation") ||
      originalUrl
    );
  };

  if (items.length === 0) return null;

  const parseItem = (raw: string) => {
    const urlMatch = raw.match(/https?:\/\/\S+/);
    const imageUrl = urlMatch ? urlMatch[0] : "";
    const cleaned = urlMatch ? raw.replace(urlMatch[0], "").trim() : raw.trim();
    const parts = cleaned.includes("|")
      ? cleaned.split("|")
      : cleaned.split(" - ");
    const [title, ...rest] = parts.map((part) => part.trim()).filter(Boolean);
    const badge = rest.find((part) => /popular|bestseller/i.test(part)) ?? "";
    const description = rest.filter((part) => part !== badge).join(" ");
    return { title: title || raw, badge, description, imageUrl };
  };

  return (
    <section className="rounded-2xl bg-white px-6 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
      <h3 className="text-lg font-semibold text-gray-900">
        BestFoodWhere&apos;s Recommendation
      </h3>
      <div className="mt-5 space-y-4">
        {items.slice(0, 3).map((item) => {
          const parsed = parseItem(item);
          return (
            <div key={item} className="rounded-2xl bg-[#f7f7f7] p-4">
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white shadow-sm">
                  {parsed.imageUrl ? (
                    <img
                      src={getImageUrl(parsed.imageUrl)}
                      alt={parsed.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-amber-50 text-lg">
                      🍽
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">
                    {parsed.title}
                  </div>
                  {parsed.badge ? (
                    <span className="mt-1 inline-flex rounded-md bg-[#ffd166] px-2 py-0.5 text-[11px] font-semibold text-[#9a5b00]">
                      {parsed.badge}
                    </span>
                  ) : null}
                  {parsed.description ? (
                    <p className="mt-2 text-sm text-gray-600">
                      {parsed.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
