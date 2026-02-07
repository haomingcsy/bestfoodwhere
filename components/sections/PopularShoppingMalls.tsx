import Image from "next/image";
import Link from "next/link";
import {
  IconArrowRight,
  IconGoblet,
  IconPin,
  IconStore,
  IconUtensils,
} from "@/components/layout/icons";

interface Mall {
  name: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
  badge: string;
  location: string;
  stats: {
    foodPlaces: string;
    cuisines: string;
    diningOptions: string;
  };
  tags: string[];
}

// Mall images synced from WordPress to Supabase Storage
const MALLS: Mall[] = [
  {
    name: "Suntec City",
    href: "/shopping-malls/suntec-city",
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/suntec-city.jpg",
    imageAlt: "Suntec City Mall Exterior With Fountain",
    badge: "Popular",
    location: "Marina Bay, Singapore",
    stats: { foodPlaces: "150+", cuisines: "30", diningOptions: "25" },
    tags: ["Din Tai Fung", "Toast Box", "Hans Cafe"],
  },
  {
    name: "VivoCity",
    href: "/shopping-malls/vivocity",
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/vivocity.jpg",
    imageAlt: "Vivocity Mall Exterior View",
    badge: "Top Pick",
    location: "HarbourFront, Singapore",
    stats: { foodPlaces: "200+", cuisines: "40", diningOptions: "30" },
    tags: ["Seoul Garden", "Shake Shack", "Starbucks"],
  },
  {
    name: "Jewel Changi",
    href: "/shopping-malls/jewel",
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/jewel-changi.jpg",
    imageAlt: "Jewel Changi Mall With Iconic Waterfall",
    badge: "Must Visit",
    location: "Changi Airport, Singapore",
    stats: { foodPlaces: "130+", cuisines: "20", diningOptions: "15" },
    tags: ["A&W", "% Arabica", "Jewel Coffee"],
  },
  {
    name: "Nex",
    href: "/shopping-malls/nex",
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/nex.jpg",
    imageAlt: "Nex Mall Exterior With Modern Architecture",
    badge: "Family Favorite",
    location: "Serangoon, Singapore",
    stats: { foodPlaces: "120+", cuisines: "25", diningOptions: "20" },
    tags: ["Subway", "Pizza Hut", "McDonald's"],
  },
  {
    name: "IMM",
    href: "/shopping-malls/imm",
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/imm.jpg",
    imageAlt: "IMM Mall Exterior View",
    badge: "Outlet Heaven",
    location: "Jurong East, Singapore",
    stats: { foodPlaces: "90+", cuisines: "15", diningOptions: "10" },
    tags: ["Outlet Levi's", "Starbucks", "Daiso"],
  },
  {
    name: "Plaza Singapura",
    href: "/shopping-malls/plaza-singapura",
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/plaza-singapura.jpg",
    imageAlt: "Plaza Singapura mall exterior entrance",
    badge: "Central Spot",
    location: "Orchard, Singapore",
    stats: { foodPlaces: "110+", cuisines: "22", diningOptions: "18" },
    tags: ["Haidilao", "Genki Sushi", "Ya Kun"],
  },
];

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-1 text-bfw-orange">{icon}</span>
      <span className="font-heading text-[15px] font-semibold text-[#333] leading-none">
        {value}
      </span>
      <span className="mt-1 font-body text-[12px] text-[#666]">{label}</span>
    </div>
  );
}

function MallCard({ mall }: { mall: Mall }) {
  return (
    <Link href={mall.href} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
        <div className="relative h-[200px]">
          <Image
            src={mall.imageUrl}
            alt={mall.imageAlt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <span className="absolute right-4 top-4 rounded-lg bg-white/90 px-3 py-1 text-[12px] font-semibold text-bfw-orange backdrop-blur">
            {mall.badge}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-6">
          <div>
            <h3 className="font-heading text-[19px] font-bold text-[#333]">
              {mall.name}
            </h3>
            <div className="mt-2 flex items-center gap-2 font-body text-[14px] text-[#666]">
              <IconPin className="h-4 w-4 text-bfw-orange" />
              <span>{mall.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-y border-[#f0f0f0] py-3">
            <Stat
              icon={<IconStore className="h-5 w-5" />}
              value={mall.stats.foodPlaces}
              label="Food Places"
            />
            <Stat
              icon={<IconUtensils className="h-5 w-5" />}
              value={mall.stats.cuisines}
              label="Cuisines"
            />
            <Stat
              icon={<IconGoblet className="h-5 w-5" />}
              value={mall.stats.diningOptions}
              label="Dining Options"
            />
          </div>

          <div className="mt-auto">
            <p className="font-body text-[13px] text-[#666]">Popular Stores</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {mall.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#f5f5f5] px-3 py-1 font-body text-[12px] text-[#525252]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-bfw-orange px-4 py-3 font-heading text-[14px] font-semibold text-white transition-colors hover:bg-bfw-orange-hover">
              <span>View Directory</span>
              <IconArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function PopularShoppingMalls() {
  return (
    <section className="w-full bg-white py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="text-center">
          <h2 className="font-heading text-[40px] font-bold text-bfw-orange md:text-[48px]">
            Popular Shopping Malls
          </h2>
          <p className="mt-4 font-body text-[15px] text-[#666] md:text-[16px]">
            Explore Singapore&apos;s best mall dining spots
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MALLS.map((mall) => (
            <MallCard key={mall.name} mall={mall} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/shopping-malls"
            className="group inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 font-heading text-[16px] font-semibold text-[#333] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-0.5 hover:text-bfw-orange hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
          >
            View All Malls
            <span className="ml-2 transition-all group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
