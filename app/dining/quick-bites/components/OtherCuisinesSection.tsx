import Image from "next/image";
import Link from "next/link";
import { OTHER_DINING_CATEGORIES } from "../data";

export function OtherCuisinesSection() {
  return (
    <section className="mb-5 rounded-xl bg-white px-5 py-8">
      <div className="mb-5 text-center">
        <h2 className="font-heading text-[26px] font-bold text-bfw-orange">
          Other Dining Categories
        </h2>
        <p className="mt-2 font-body text-base text-[#666]">
          Explore more dining options in Singapore
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {OTHER_DINING_CATEGORIES.map((category) => (
          <Link
            key={category.name}
            href={category.url}
            className="group overflow-hidden rounded-lg bg-white shadow-[0_3px_8px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_15px_rgba(239,95,42,0.15)]"
          >
            <div className="relative h-[120px] overflow-hidden">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            </div>
            <div className="p-3 text-center">
              <h3 className="font-heading text-base font-semibold text-[#333] transition-colors group-hover:text-bfw-orange">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/dining/all"
          className="inline-block rounded-full border-2 border-bfw-orange bg-transparent px-5 py-2.5 font-heading text-[15px] font-semibold text-bfw-orange transition-all hover:-translate-y-0.5 hover:bg-bfw-orange hover:text-white hover:shadow-[0_4px_8px_rgba(239,95,42,0.2)]"
        >
          View All Categories
        </Link>
      </div>
    </section>
  );
}
