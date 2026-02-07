import Image from "next/image";
import { useMemo } from "react";
import { getOptimizedMenuUrl, IMAGE_PRESETS } from "@/lib/restaurant-images";

interface Props {
  promotions: string[];
  cdnUrls?: Record<string, string>;
}

export function PromotionsCarousel({ promotions, cdnUrls = {} }: Props) {
  // Convert record to Map for the helper function
  const cdnUrlMap = useMemo(() => new Map(Object.entries(cdnUrls)), [cdnUrls]);

  // Helper to get optimized image URL
  const getImageUrl = (originalUrl: string) => {
    return (
      getOptimizedMenuUrl(originalUrl, cdnUrlMap, "promotion") || originalUrl
    );
  };

  if (promotions.length === 0) return null;

  return (
    <section className="rounded-2xl bg-white px-6 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
      <h3 className="text-lg font-semibold text-gray-900">Latest Promotions</h3>
      <div className="mt-4 space-y-4">
        {promotions.map((url) => (
          <div
            key={url}
            className="relative w-full overflow-hidden rounded-xl bg-[#fff9f6]"
          >
            <div className="relative h-64 w-full">
              <Image
                src={getImageUrl(url)}
                alt="Promotion"
                fill
                className="object-cover"
                unoptimized={url.includes("googleusercontent.com")}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
