import Image from "next/image";
import Link from "next/link";
import { IconCheck } from "@/components/layout/icons";

const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    alt: "Fine dining experience",
  },
  {
    src: "https://images.unsplash.com/photo-1519683109079-d5f539e1542f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    alt: "Fine plating",
  },
  {
    src: "https://images.unsplash.com/photo-1511018556340-d16986a1c194?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
    alt: "Elegant restaurant setting",
  },
];

const FEATURES = [
  "Exquisite Cuisine",
  "Premium Service",
  "Elegant Ambiance",
  "Award-winning Chefs",
  "Curated Wine Selection",
];

export function HeroSection() {
  return (
    <section className="w-full bg-[#fff9f6] border-b border-bfw-orange/10">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 px-5 py-10 md:flex-row md:py-10">
        <div className="flex-1 md:pr-8">
          <h1 className="font-heading text-[32px] font-bold leading-tight text-[#1a1a1a] md:text-[38px]">
            Fine <span className="text-bfw-orange">Dining</span> in Singapore
          </h1>
          <p className="mt-4 font-body text-lg text-[#555]">
            Discover the most exquisite culinary experiences in the Lion City
          </p>

          <Link
            href="#restaurant-section"
            className="mt-6 inline-block rounded-md bg-bfw-orange px-6 py-3 font-heading text-base font-semibold text-white transition-colors hover:bg-bfw-orange-hover"
          >
            Explore Restaurants
          </Link>

          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
            {FEATURES.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 font-body text-base"
              >
                <IconCheck className="h-4 w-4 text-bfw-orange" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid flex-1 grid-cols-3 gap-3">
          {HERO_IMAGES.map((image, index) => (
            <div
              key={index}
              className="relative h-[200px] overflow-hidden rounded-lg md:h-[280px]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 300px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
