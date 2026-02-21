"use client";

import type { LocationInfo } from "@/types/brand";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface Props {
  locations: LocationInfo[];
  value?: string;
  onLocationChange?: (slug: string) => void;
}

export function LocationSelect({ locations, value, onLocationChange }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selected = useMemo(() => {
    if (!value) return locations[0]?.slug ?? "";
    return value;
  }, [locations, value]);

  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
        Select Location:
      </label>
      <select
        value={selected}
        onChange={(event) => {
          const slug = event.target.value;
          const next = new URLSearchParams(searchParams.toString());
          next.set("location", slug);
          router.replace(`${pathname}?${next.toString()}`, { scroll: false });
          if (onLocationChange) {
            onLocationChange(slug);
          }
        }}
        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-sm focus:border-bfw-red focus:outline-none focus:ring-2 focus:ring-bfw-red/20"
        aria-label="Select location"
      >
        {locations.map((location) => (
          <option key={location.slug} value={location.slug}>
            {location.name}
          </option>
        ))}
      </select>
    </div>
  );
}
