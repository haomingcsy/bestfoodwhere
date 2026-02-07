import {
  IconStore,
  IconPin,
  IconUtensils,
  IconTimer,
} from "@/components/layout/icons";

interface StatItem {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const STATS: StatItem[] = [
  {
    value: "10,000+",
    label: "Restaurant Listings",
    icon: <IconStore className="h-6 w-6" />,
  },
  {
    value: "19",
    label: "Shopping Malls",
    icon: <IconPin className="h-6 w-6" />,
  },
  {
    value: "50+",
    label: "Cuisine Types",
    icon: <IconUtensils className="h-6 w-6" />,
  },
  {
    value: "Weekly",
    label: "Data Updates",
    icon: <IconTimer className="h-6 w-6" />,
  },
];

export function TrustSignals() {
  return (
    <section className="w-full bg-gray-50 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-3 rounded-full bg-bfw-orange/10 p-3 text-bfw-orange">
                {stat.icon}
              </div>
              <div className="font-heading text-3xl font-bold text-gray-900 md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 font-body text-sm text-gray-600 md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <p className="font-body text-sm text-gray-500">
            Trusted by diners across Singapore
          </p>
          <div className="flex items-center gap-6 opacity-60">
            {/* Partner/Press logos would go here */}
            <span className="font-heading text-sm font-medium text-gray-400">
              As featured in
            </span>
            <div className="flex items-center gap-4 text-gray-400">
              <span className="text-xs">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Compact version for footer or other placements
 */
export function TrustSignalsCompact() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-4 text-center md:gap-10">
      {STATS.map((stat) => (
        <div key={stat.label} className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold text-bfw-orange">
            {stat.value}
          </span>
          <span className="font-body text-sm text-gray-600">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
