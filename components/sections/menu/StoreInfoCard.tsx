import type { BrandData, LocationInfo } from "@/types/brand";
import Link from "next/link";
import { LocationSelect } from "./LocationSelect";
import Image from "next/image";
import {
  IconFacebook,
  IconInstagram,
  IconLinkedin,
  IconPin,
} from "@/components/layout/icons";
import { getOptimizedMenuUrl, IMAGE_PRESETS } from "@/lib/restaurant-images";
import { useMemo, useState } from "react";
import {
  parseOpeningHoursText,
  getTodayHours,
} from "@/lib/format-opening-hours";
import { ReportIssueModal } from "./ReportIssueModal";

interface Props {
  brand: BrandData;
  location: LocationInfo | null;
  initialLocation?: string;
  className?: string;
  cdnUrls?: Record<string, string>;
  onLocationChange?: (slug: string) => void;
}

export function StoreInfoCard({
  brand,
  location,
  initialLocation,
  className,
  cdnUrls = {},
  onLocationChange,
}: Props) {
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
  const mapsQuery = location?.address
    ? encodeURIComponent(location.address)
    : encodeURIComponent(`${brand.name} ${location?.name ?? ""} Singapore`);
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const openLabel = location?.openingHours
    ? /closed/i.test(location.openingHours)
      ? "Closed Now"
      : "Open Now"
    : "Closed Now";

  const [reportOpen, setReportOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const logoSrc = location?.imageUrl;

  return (
    <section
      className={`rounded-2xl bg-white px-6 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.10)] ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">Store Info</h3>
        <button
          onClick={() => setReportOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5"
          aria-label="Report an issue"
          title="Report an issue"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-[#e74c3c]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6" />
            <path d="M12 17h.01" />
          </svg>
        </button>
      </div>

      {brand.locations.length > 0 ? (
        <div className="mt-4">
          <LocationSelect
            locations={brand.locations}
            value={initialLocation}
            onLocationChange={onLocationChange}
          />
        </div>
      ) : null}

      <div className="mt-6 flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-gray-100 shadow-sm ring-1 ring-black/5">
          {logoSrc && !logoError ? (
            <Image
              src={getImageUrl(location?.imageUrl, "logo") || logoSrc}
              alt={brand.name}
              fill
              className="object-cover"
              unoptimized={logoSrc.includes("googleusercontent.com")}
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-lg font-bold text-gray-400">
              {brand.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-xl font-bold text-gray-900">{brand.name}</div>
          <div className="text-sm font-medium text-gray-600">
            {location?.name ?? "Multiple locations"}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3">
        <span className="text-sm font-semibold text-gray-900">
          Today&apos;s Hours:
        </span>
        <span className="text-sm font-semibold text-[#4EA88A]">
          {(() => {
            if (!location?.openingHours) return "--";
            const schedule = parseOpeningHoursText(location.openingHours);
            if (schedule) {
              const today = getTodayHours(schedule);
              if (today) return today;
            }
            // Fallback: try to extract just the time range
            const timeMatch = location.openingHours.match(
              /\d{1,2}:\d{2}\s*(?:AM|PM)\s*[-–]\s*\d{1,2}:\d{2}\s*(?:AM|PM)/i,
            );
            return timeMatch
              ? timeMatch[0]
              : location.openingHours.slice(0, 50);
          })()}
        </span>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-[#FFD166] to-[#e74c3c]" />
        <div className="px-4 py-4 pl-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <IconPin className="h-4 w-4 text-[#e74c3c]" />
            Location Details
          </div>

          <div className="mt-4 space-y-3 text-sm">
            {location?.address ? (
              <Link
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <IconPin className="mt-0.5 h-4 w-4 shrink-0 text-[#e74c3c]" />
                <span className="min-w-0">{location.address}</span>
              </Link>
            ) : null}

            {location?.phone ? (
              <a
                href={`tel:${location.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-[#e74c3c]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2a19.6 19.6 0 0 1-8.5-3a19.3 19.3 0 0 1-6-6A19.6 19.6 0 0 1 2.1 4.2A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.6-1.1a2 2 0 0 1 2.1-.5c.9.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" />
                </svg>
                <span>{location.phone}</span>
              </a>
            ) : null}

            {location?.website ? (
              <Link
                href={location.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-[#e74c3c]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18" />
                  <path d="M12 3a15 15 0 0 1 0 18" />
                  <path d="M12 3a15 15 0 0 0 0 18" />
                </svg>
                <span className="truncate">
                  {location.website.replace(/^https?:\/\//, "")}
                </span>
              </Link>
            ) : null}

            {location?.details ? (
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-[#e74c3c]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 10v6" />
                  <path d="M12 7h.01" />
                </svg>
                <span className="text-sm text-gray-700">
                  {location.details}
                </span>
              </div>
            ) : null}

            {location?.distance ? (
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-[#e74c3c]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 12h16" />
                  <path d="M8 16l-4-4 4-4" />
                  <path d="M16 8l4 4-4 4" />
                </svg>
                <span className="text-sm text-gray-700">
                  {location.distance}
                </span>
              </div>
            ) : null}

            <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-[#e74c3c]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span
                className={`text-sm font-semibold ${/open/i.test(openLabel) ? "text-green-700" : "text-red-700"}`}
              >
                {openLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {location?.website ? (
        <Link
          href={location.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#e74c3c] px-5 py-4 font-semibold text-white shadow-lg shadow-[#e74c3c]/25 transition hover:-translate-y-0.5 hover:bg-[#d44133]"
        >
          Order Online
        </Link>
      ) : null}

      <div className="mt-6 border-t border-gray-100 pt-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
          Follow {brand.name} On
        </div>
        <div className="mt-4 flex gap-3">
          {brand.socialLinks.facebook ? (
            <Link
              href={brand.socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#3b5998] to-[#4e69a2] text-white shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-md"
              aria-label="Facebook"
            >
              <IconFacebook className="h-5 w-5" />
            </Link>
          ) : null}
          {brand.socialLinks.instagram ? (
            <Link
              href={brand.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-md"
              aria-label="Instagram"
            >
              <IconInstagram className="h-5 w-5" />
            </Link>
          ) : null}
          {brand.socialLinks.linkedin ? (
            <Link
              href={brand.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#0077b5] to-[#0e94da] text-white shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-md"
              aria-label="LinkedIn"
            >
              <IconLinkedin className="h-5 w-5" />
            </Link>
          ) : null}
        </div>
      </div>

      <ReportIssueModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        brandName={brand.name}
        locationName={location?.name}
      />
    </section>
  );
}
