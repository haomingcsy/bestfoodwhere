import { LATE_NIGHT_STATS } from "../data";

const STATS = [
  { value: LATE_NIGHT_STATS.venues, label: "Late Night Venues" },
  { value: LATE_NIGHT_STATS.latestClosing, label: "Latest Closing" },
  { value: LATE_NIGHT_STATS.entertainmentSpots, label: "Entertainment Spots" },
  { value: LATE_NIGHT_STATS.averageRating, label: "Average Rating" },
];

export function StatsSection() {
  return (
    <div className="mt-3 flex flex-wrap justify-around gap-4 rounded-xl bg-white p-4 shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
      {STATS.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="font-heading text-[26px] font-bold text-bfw-orange">
            {stat.value}
          </div>
          <div className="font-body text-sm text-[#666]">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
