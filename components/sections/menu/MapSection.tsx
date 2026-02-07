import Link from "next/link";

interface Props {
  brandName: string;
  address: string;
}

export function MapSection({ brandName, address }: Props) {
  const query = encodeURIComponent(`${brandName} ${address}`.trim());
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <section className="rounded-2xl bg-white px-6 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
      <div className="mb-5">
        <h2 className="text-[26px] font-bold text-gray-900">Map Directions</h2>
        <div className="mt-4 h-[3px] w-10 bg-[#e74c3c]" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <iframe
          title="Map"
          className="h-80 w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${query}&output=embed`}
        />
      </div>

      <div className="mt-4">
        <Link
          href={directionsHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#4285f4] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3367d6]"
        >
          Get Directions to {brandName}
        </Link>
      </div>
    </section>
  );
}
