import Image from "next/image";
import Link from "next/link";
import type { Cuisine } from "../data";

interface CuisineGridProps {
  cuisines: Cuisine[];
}

export function CuisineGrid({ cuisines }: CuisineGridProps) {
  return (
    <section id="cuisine-section" className="mb-5 rounded-xl bg-white py-8">
      <div className="mb-8 text-center">
        <h2 className="font-heading text-[26px] font-bold text-bfw-orange">
          All Cuisines
        </h2>
        <p className="mt-2 font-body text-base text-[#666]">
          Find your favorite cuisine and discover new places to eat
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 px-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {cuisines.map((cuisine) => (
          <Link
            key={cuisine.id}
            href={cuisine.url}
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1.5 hover:shadow-[0_8px_15px_rgba(239,95,42,0.15)]"
          >
            <div className="absolute left-0 top-0 z-10 h-1 w-full bg-gradient-to-r from-bfw-orange to-[#ff8e63]" />

            <div className="relative h-[180px] overflow-hidden">
              <Image
                src={cuisine.image}
                alt={cuisine.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>

            <div className="p-4 text-center">
              <h3 className="mb-1 font-heading text-lg font-semibold text-[#333] transition-colors group-hover:text-bfw-orange">
                {cuisine.name}
              </h3>
              <p className="mb-3 font-body text-sm leading-snug text-[#666]">
                {cuisine.description}
              </p>
              <span className="inline-block rounded-full bg-[#f0f0f0] px-3 py-1 font-body text-xs text-[#555]">
                {cuisine.count} {cuisine.countLabel}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {cuisines.length === 0 && (
        <div className="py-12 text-center font-body text-[#666]">
          No cuisines found matching your search.
        </div>
      )}
    </section>
  );
}
