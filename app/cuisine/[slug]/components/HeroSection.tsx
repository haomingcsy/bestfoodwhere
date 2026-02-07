import Image from "next/image";
import type { CuisineData } from "../data";

interface HeroSectionProps {
  cuisine: CuisineData;
}

export function HeroSection({ cuisine }: HeroSectionProps) {
  return (
    <section className="w-full border-b border-bfw-orange/10 bg-[#fff6f2]">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center px-5 py-10 md:flex-row md:py-10">
        <div className="mb-6 flex-1 md:mb-0 md:pr-8">
          <h1 className="mb-4 font-heading text-[28px] font-bold leading-tight md:text-[38px]">
            {cuisine.name} <span className="text-bfw-orange">Cuisine</span> in
            Singapore
          </h1>
          <p className="mb-5 font-body text-lg text-[#555]">
            {cuisine.tagline}
          </p>

          <a
            href="#restaurant-section"
            className="mb-6 inline-block rounded-md bg-bfw-orange px-6 py-3 font-heading text-base font-semibold text-white transition-colors hover:bg-bfw-orange-hover"
          >
            Explore Restaurants
          </a>

          <div className="mt-4 flex flex-wrap gap-4">
            {cuisine.features.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center font-body text-base"
              >
                <span className="mr-2 font-bold text-bfw-orange">✓</span>
                <span>{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid h-[200px] flex-1 grid-cols-3 gap-3 md:h-[280px]">
          {cuisine.heroImages.map((image, index) => (
            <div key={index} className="relative overflow-hidden rounded-lg">
              <Image
                src={image}
                alt={`${cuisine.name} dish ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 20vw"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
