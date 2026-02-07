import { QUICK_BITES_STATS } from "../data";

const STATS = [
  { value: QUICK_BITES_STATS.locations, label: "Quick Bite Locations" },
  { value: QUICK_BITES_STATS.menuItems, label: "Menu Items" },
  { value: QUICK_BITES_STATS.shoppingMalls, label: "Shopping Malls" },
  { value: QUICK_BITES_STATS.averageRating, label: "Average Rating" },
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
