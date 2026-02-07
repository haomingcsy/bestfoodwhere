import Link from "next/link";
import Image from "next/image";
import { IconBag, IconCuisine } from "@/components/layout/icons";
import { FeatureList } from "@/components/sections/FeatureList";

// Hero images synced from WordPress to Supabase Storage
const HERO_IMAGES_LEFT = [
  {
    src: "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/hero-left-1.png",
    alt: "Delicious Asian cuisine",
    width: 408,
    height: 544,
  },
  {
    src: "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/hero-left-2.png",
    alt: "Fresh food platter",
    width: 408,
    height: 544,
  },
  {
    src: "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/hero-left-3.png",
    alt: "Gourmet dish",
    width: 408,
    height: 544,
  },
] as const;

const HERO_IMAGES_RIGHT = [
  {
    src: "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/hero-right-1.png",
    alt: "Restaurant food",
    width: 180,
    height: 250,
  },
  {
    src: "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/hero-right-2.png",
    alt: "Local delicacy",
    width: 180,
    height: 250,
  },
  {
    src: "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/hero-right-3.png",
    alt: "Singapore food",
    width: 180,
    height: 250,
  },
] as const;

function MarqueeColumn({
  images,
  animationClassName,
  widthClassName,
}: {
  images: readonly {
    src: string;
    alt: string;
    width: number;
    height: number;
  }[];
  animationClassName: string;
  widthClassName: string;
}) {
  return (
    <div
      className={`bfw-mask-fade-vertical overflow-hidden [--gap:60px] ${widthClassName}`}
    >
      <div className={`flex flex-col gap-[var(--gap)] ${animationClassName}`}>
        {images.map((img) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            sizes="(min-width: 1024px) 180px, 0px"
            className="h-auto w-full rounded-2xl object-cover shadow-[0_15px_25px_0_rgba(0,0,0,0.1)]"
          />
        ))}
      </div>
      <div
        aria-hidden="true"
        className={`flex flex-col gap-[var(--gap)] ${animationClassName}`}
      >
        {images.map((img) => (
          <Image
            key={`${img.src}-dup`}
            src={img.src}
            alt=""
            width={img.width}
            height={img.height}
            sizes="(min-width: 1024px) 180px, 0px"
            className="h-auto w-full rounded-2xl object-cover shadow-[0_15px_25px_0_rgba(0,0,0,0.1)]"
          />
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="w-full overflow-hidden bg-[#fff1e8]">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="grid items-start gap-10 py-10 md:py-14 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-8">
            <div className="mt-2 flex max-w-[550px] flex-col items-center gap-8 text-center md:items-start md:text-left">
              <h1 className="motion-safe:animate-bfw-fade-up font-heading text-[34px] leading-[40px] font-bold text-black md:text-[54px] md:leading-[60px]">
                Discover <br />
                <span className="text-bfw-orange">Best Food Places </span>
                <br />
                Near You in Singapore.
              </h1>

              <p className="motion-safe:animate-bfw-fade-up delay-100 font-body text-[16px] leading-[24px] text-[#666666]">
                Craving good food? <br className="md:hidden" />
                Find the best eats nearby now.
              </p>

              <div className="motion-safe:animate-bfw-fade-up delay-150 w-full max-w-[360px]">
                <div className="relative flex items-center gap-[5px]">
                  <Link
                    href="/shopping-malls"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1e73be] px-5 py-3 text-[14px] font-bold text-white shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#155d99]"
                  >
                    <IconBag className="h-4 w-4" />
                    <span>View malls</span>
                  </Link>

                  <span className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[13px] font-semibold text-black shadow-[0_8px_18px_rgba(0,0,0,0.12)]">
                    Or
                  </span>

                  <Link
                    href="/cuisine/all"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#3b3b3b] px-5 py-3 text-[14px] font-bold text-white shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#1f1f1f]"
                  >
                    <IconCuisine className="h-4 w-4" />
                    <span>View Cuisine</span>
                  </Link>
                </div>
              </div>

              <div className="w-full pt-10 md:pt-12">
                <FeatureList />
              </div>
            </div>
          </div>

          <div className="hidden lg:col-span-4 lg:flex lg:items-center lg:justify-end lg:gap-[60px]">
            <MarqueeColumn
              images={HERO_IMAGES_LEFT}
              widthClassName="w-[180px] max-h-[750px]"
              animationClassName="motion-reduce:animate-none animate-bfw-marquee-up"
            />
            <MarqueeColumn
              images={HERO_IMAGES_RIGHT}
              widthClassName="w-[120px] max-h-[550px]"
              animationClassName="motion-reduce:animate-none animate-bfw-marquee-down"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
