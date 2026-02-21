import type { Amenity } from "@/types/brand";

interface Props {
  amenities: Amenity[];
  isMissing?: boolean;
}

export function AmenitiesGrid({ amenities, isMissing }: Props) {
  return (
    <section className="rounded-2xl bg-white px-6 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
      <div className="mb-5">
        <h2 className="text-[26px] font-bold text-gray-900">Amenities & Features</h2>
        <div className="mt-4 h-[3px] w-10 bg-[#e74c3c]" />
      </div>
      {amenities.length === 0 && isMissing ? (
        <p className="text-[15px] leading-7 text-gray-500">
          Amenities information coming soon.
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {amenities.map((amenity) => {
          const parts = amenity.label.split(/\s*-\s*|\s*:\s*/);
          const title = parts[0]?.trim() || amenity.label;
          const detail = parts.slice(1).join(" - ").trim();
          const lower = title.toLowerCase();

          const icon = (() => {
            if (lower.includes("hour")) return (
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#e74c3c]" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            );
            if (lower.includes("mall") || lower.includes("location")) return (
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#e74c3c]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            );
            if (lower.includes("transport") || lower.includes("access")) return (
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#e74c3c]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 19l-3 3" />
                <path d="M11 18a4 4 0 1 1 5-5" />
              </svg>
            );
            if (lower.includes("payment")) return (
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#e74c3c]" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="6" width="18" height="12" rx="2" />
                <path d="M3 10h18" />
              </svg>
            );
            if (lower.includes("parking")) return (
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#e74c3c]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            );
            if (lower.includes("accessibility")) return (
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#e74c3c]" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v7l3 3" />
                <path d="M9 10h6" />
              </svg>
            );
            return (
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#e74c3c]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20" />
                <path d="M2 12h20" />
              </svg>
            );
          })();

          return (
            <div key={amenity.label} className="flex items-start gap-3 rounded-lg bg-[#f9f9f9] px-4 py-4">
              <div className="mt-0.5 shrink-0">{icon}</div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900">{title}</div>
                {detail ? <div className="mt-1 text-sm text-gray-600">{detail}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
