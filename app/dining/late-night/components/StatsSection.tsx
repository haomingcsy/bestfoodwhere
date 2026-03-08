const LATE_NIGHT_STATS = {
  restaurants: 22,
  menuItems: "500+",
  deals: 3,
  malls: 8,
};

const STATS = [
  { value: LATE_NIGHT_STATS.restaurants, label: "Late Night Venues" },
  { value: LATE_NIGHT_STATS.menuItems, label: "Menu Items" },
  { value: LATE_NIGHT_STATS.deals, label: "Deals" },
  { value: LATE_NIGHT_STATS.malls, label: "Shopping Malls" },
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
