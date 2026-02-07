import { STATS } from "../data";

export function StatsSection() {
  return (
    <section className="mb-4 mt-2.5 flex flex-wrap justify-around rounded-xl bg-white px-4 py-4 shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
      {STATS.map((stat) => (
        <div key={stat.label} className="px-4 py-2 text-center">
          <div className="font-heading text-[26px] font-bold text-bfw-orange">
            {stat.value}
          </div>
          <div className="font-body text-sm text-[#666]">{stat.label}</div>
        </div>
      ))}
    </section>
  );
}
