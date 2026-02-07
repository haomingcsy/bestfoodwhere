import Image from "next/image";
import Link from "next/link";
import { IconCheck } from "@/components/layout/icons";

const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    alt: "Late night bar scene",
  },
  {
    src: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80",
    alt: "Night dining atmosphere",
  },
  {
    src: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    alt: "Cocktail bar drinks",
  },
];

const FEATURES = [
  "Open Past Midnight",
  "Great Atmosphere",
  "Live Entertainment",
  "Full Bar Service",
  "Supper Options",
];

export function HeroSection() {
  return (
    <section className="w-full bg-[#fff9f6] border-b border-bfw-orange/10">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 px-5 py-10 md:flex-row md:py-10">
        <div className="flex-1 md:pr-8">
          <h1 className="font-heading text-[32px] font-bold leading-tight text-[#1a1a1a] md:text-[38px]">
            Late Night <span className="text-bfw-orange">Dining</span> in
            Singapore
          </h1>
          <p className="mt-4 font-body text-lg text-[#555]">
            Discover the best spots for late-night dining, drinks, and
            entertainment
          </p>

          <Link
            href="#restaurant-section"
            className="mt-6 inline-block rounded-md bg-bfw-orange px-6 py-3 font-heading text-base font-semibold text-white transition-colors hover:bg-bfw-orange-hover"
          >
            Explore Late Night Spots
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
