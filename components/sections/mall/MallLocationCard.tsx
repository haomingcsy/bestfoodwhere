import type { ShoppingMall } from "@/types/shopping-mall";
import Link from "next/link";

interface Props {
  mall: ShoppingMall;
}

export function MallLocationCard({ mall }: Props) {
  // Show location card if we have either address or map embed
  if (!mall.address && !mall.mapEmbedUrl) return null;

  const mapsQuery = encodeURIComponent(
    mall.address || `${mall.name} Singapore`,
  );
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  // Use stored embed URL from database (no API call needed)
  const embedUrl = mall.mapEmbedUrl;

  return (
    <section className="rounded-2xl bg-white px-6 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
      <h3 className="text-lg font-semibold text-gray-900">Location</h3>

      {/* Address */}
      <div className="mt-4 text-gray-700">
        <p>{mall.address}</p>
        {mall.postalCode && (
          <p className="mt-1 text-gray-500">Singapore {mall.postalCode}</p>
        )}
      </div>

      {/* Map Embed */}
      {embedUrl && (
        <div className="mt-4 h-48 overflow-hidden rounded-xl bg-gray-100">
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map of ${mall.name}`}
          />
        </div>
      )}

      {/* Get Directions Button */}
      <Link
        href={mapsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-bfw-orange px-4 py-3 font-semibold text-white transition hover:bg-bfw-orange/90"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        Get Directions
      </Link>
    </section>
  );
}
