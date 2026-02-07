import type { CuisineStats } from "../data";

interface StatsSectionProps {
  stats: CuisineStats;
  cuisineName: string;
}

export function StatsSection({ stats, cuisineName }: StatsSectionProps) {
  return (
    <section className="mb-4 mt-2.5 flex flex-wrap justify-around rounded-xl bg-white px-4 py-4 shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
      <div className="px-4 py-2 text-center">
        <div className="font-heading text-[26px] font-bold text-bfw-orange">
          {stats.restaurants}
        </div>
        <div className="font-body text-sm text-[#666]">
          {cuisineName} Restaurants
        </div>
      </div>
      <div className="px-4 py-2 text-center">
        <div className="font-heading text-[26px] font-bold text-bfw-orange">
          {stats.menuItems}
        </div>
        <div className="font-body text-sm text-[#666]">Menu Items</div>
      </div>
      <div className="px-4 py-2 text-center">
        <div className="font-heading text-[26px] font-bold text-bfw-orange">
          {stats.deals}
        </div>
        <div className="font-body text-sm text-[#666]">Deals Available</div>
      </div>
      <div className="px-4 py-2 text-center">
        <div className="font-heading text-[26px] font-bold text-bfw-orange">
          {stats.malls}
        </div>
        <div className="font-body text-sm text-[#666]">Shopping Malls</div>
      </div>
    </section>
  );
}
