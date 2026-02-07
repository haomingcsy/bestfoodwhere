import type { BrandData, LocationInfo } from "@/types/brand";
import fourLeavesHero from "@/image/fourleaves.png";
import { getOptimizedMenuUrl, IMAGE_PRESETS } from "@/lib/restaurant-images";
import { useMemo } from "react";
/* eslint-disable @next/next/no-img-element */

interface Props {
  brand: BrandData;
  location: LocationInfo | null;
  cdnUrls?: Record<string, string>;
}

export function HeroHeader({ brand, location, cdnUrls = {} }: Props) {
  // Convert record to Map for the helper function
  const cdnUrlMap = useMemo(() => new Map(Object.entries(cdnUrls)), [cdnUrls]);

  // Helper to get optimized image URL
  const getImageUrl = (
    originalUrl: string | undefined,
    preset: keyof typeof IMAGE_PRESETS,
  ) => {
    if (!originalUrl) return undefined;
    return getOptimizedMenuUrl(originalUrl, cdnUrlMap, preset);
  };
  const fallbackMenuImage = brand.menu[0]?.items?.[0]?.imageUrl ?? "";
  const isFourLeaves = brand.name.toLowerCase().includes("four leaves");
  const singaporeNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" }),
  );
  const heroImageUrl =
    location?.heroImageUrl || location?.imageUrl || fallbackMenuImage || "";
  const logoUrl = location?.imageUrl || "";
  const priceRange = location?.priceRange;
  const openingHours = location?.openingHours ?? "";
  const parseTime = (value: string) => {
    const match = value.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (!match) return null;
    const hourRaw = Number(match[1]);
    const minutes = match[2] ? Number(match[2]) : 0;
    const period = match[3].toLowerCase();
    if (!Number.isFinite(hourRaw) || !Number.isFinite(minutes)) return null;
    let hour = hourRaw % 12;
    if (period === "pm") hour += 12;
    return hour * 60 + minutes;
  };

  const parseOpenClose = (value: string) => {
    const matches = value.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/gi);
    if (!matches || matches.length < 2) return null;
    const open = parseTime(matches[0]);
    const close = parseTime(matches[1]);
    if (open === null || close === null) return null;
    return { open, close };
  };

  const nowMinutes = singaporeNow.getHours() * 60 + singaporeNow.getMinutes();
  const openClose = parseOpenClose(openingHours);
  const isOpen = openClose
    ? nowMinutes >= openClose.open && nowMinutes < openClose.close
    : !/closed/i.test(openingHours);
  const openTimeLabel =
    openingHours.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i)?.[1] || "";
  const openLabel = isOpen
    ? `Open Now [${openingHours}]`
    : `Closed Now [Closed${openTimeLabel ? ` - Opens ${openTimeLabel}` : ""}]`;

  const tags = [
    ...new Set([
      ...(location?.cuisine ?? []),
      ...(location?.diningStyle ?? []),
    ]),
  ].filter(Boolean);

  const TagIcon = () => (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );

  return (
    <section className="mb-6">
      {isFourLeaves ? (
        <div className="relative mb-4 h-56 w-full overflow-hidden rounded-2xl bg-[#fff9f6] shadow-sm">
          <img
            src={fourLeavesHero.src}
            alt={`${brand.name} hero`}
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
        </div>
      ) : heroImageUrl ? (
        <div className="relative mb-4 h-56 w-full overflow-hidden rounded-2xl bg-[#fff9f6] shadow-sm">
          <img
            src={getImageUrl(heroImageUrl, "heroBanner") || heroImageUrl}
            alt={`${brand.name} hero`}
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
        </div>
      ) : null}

      <div className="rounded-2xl bg-black/85 px-6 py-5 shadow-lg md:h-[180px]">
        <div className="flex w-full flex-col items-center gap-5 md:flex-row md:items-start md:gap-6">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-lg shadow-black/20 ring-[4px] ring-white/30">
            {isFourLeaves ? (
              <img
                src={fourLeavesHero.src}
                alt={brand.name}
                className="h-full w-full object-cover"
              />
            ) : logoUrl ? (
              <img
                src={getImageUrl(logoUrl, "logo") || logoUrl}
                alt={brand.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-white/80">
                Logo
              </div>
            )}
          </div>

          <div className="min-w-0 text-center text-white md:text-left">
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-[4px] bg-[#ff0000] px-3 py-1 text-sm font-medium text-white"
                >
                  <TagIcon />
                  {tag}
                </span>
              ))}
            </div>

            <div className="relative mt-2">
              <h1 className="text-[32px] font-semibold leading-tight text-white">
                {brand.name}
              </h1>
              {priceRange ? (
                <div className="mt-1 text-sm font-medium text-white/80">
                  Price: {priceRange}
                </div>
              ) : null}
              <div className="mt-3">
                <span
                  className={`inline-flex items-center rounded-[4px] border px-4 py-1.5 text-sm font-medium ${
                    isOpen
                      ? "border-[#22C55E] bg-[#22C55E]"
                      : "border-[#7f1d1d] bg-[#7f1d1d]"
                  }`}
                >
                  {openLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
