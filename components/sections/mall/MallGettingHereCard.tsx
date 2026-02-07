import type { ShoppingMall } from "@/types/shopping-mall";

interface Props {
  mall: ShoppingMall;
}

export function MallGettingHereCard({ mall }: Props) {
  const { mrt, bus, parking } = mall.gettingHere;
  const hasContent = mrt.length > 0 || bus.length > 0 || parking.length > 0;

  if (!hasContent) return null;

  return (
    <section className="rounded-2xl bg-white px-6 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
      <h3 className="text-lg font-semibold text-gray-900">Getting Here</h3>

      {/* MRT */}
      {mrt.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-bfw-red"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="4" y="3" width="16" height="16" rx="2" />
              <path d="M4 11h16" />
              <path d="M12 3v8" />
              <circle cx="8" cy="21" r="1" />
              <circle cx="16" cy="21" r="1" />
              <path d="M8 19v2M16 19v2" />
            </svg>
            MRT:
          </div>
          <div className="mt-2 space-y-2">
            {mrt.map((station, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {station.lineCode && (
                  <span
                    className="inline-flex h-6 min-w-[3rem] items-center justify-center rounded px-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: station.lineColor }}
                  >
                    {station.lineCode}
                  </span>
                )}
                <span className="text-gray-700">
                  {station.name}
                  {station.walkTime && (
                    <span className="ml-1 text-gray-500">
                      - {station.walkTime}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bus */}
      {bus.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-bfw-red"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 6v6M16 6v6M2 12h2M20 12h2M5 18v2M19 18v2" />
              <rect x="4" y="4" width="16" height="12" rx="2" />
              <path d="M4 16h16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2Z" />
            </svg>
            Bus:
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {bus.map((busNum) => (
              <span
                key={busNum}
                className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-sm font-medium text-gray-700"
              >
                {busNum}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Parking */}
      {parking.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-bfw-red"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
            </svg>
            Parking:
          </div>
          <div className="mt-2 space-y-2">
            {parking.map((info, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <span className="font-medium text-gray-700">{info.period}</span>
                <span className="text-right text-gray-600">{info.rate}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
