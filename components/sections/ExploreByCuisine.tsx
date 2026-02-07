import Image from "next/image";
import Link from "next/link";

interface Cuisine {
  name: string;
  href: string;
  imageUrl?: string;
  placeCount?: string;
  isSeeAll?: boolean;
}

const CUISINES: Cuisine[] = [
  {
    name: "Japanese",
    href: "/cuisine/japanese",
    imageUrl:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80",
    placeCount: "750+ Places",
  },
  {
    name: "Chinese",
    href: "/cuisine/chinese",
    imageUrl:
      "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?auto=format&fit=crop&q=80",
    placeCount: "850+ Places",
  },
  {
    name: "Western",
    href: "/cuisine/western",
    imageUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80",
    placeCount: "700+ Places",
  },
  {
    name: "Local Delights",
    href: "/cuisine/local",
    imageUrl:
      "https://images.unsplash.com/photo-1583077874340-79db6564672e?auto=format&fit=crop&q=80",
    placeCount: "500+ Places",
  },
  {
    name: "Korean",
    href: "/cuisine/korean",
    imageUrl:
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&q=80",
    placeCount: "400+ Places",
  },
  {
    name: "See All Cuisines",
    href: "/cuisine/all",
    isSeeAll: true,
  },
];

function CuisineCard({ cuisine }: { cuisine: Cuisine }) {
  if (cuisine.isSeeAll) {
    return (
      <Link
        href={cuisine.href}
        className="group flex h-[200px] flex-col items-center justify-center rounded-2xl bg-bfw-orange text-center shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:bg-bfw-orange-hover hover:shadow-[0_14px_30px_rgba(0,0,0,0.12)]"
      >
        <div className="font-heading text-[24px] font-semibold text-white">
          See All Cuisines
        </div>
        <div className="mt-2 font-body text-[14px] text-white/90">
          Explore more options
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={cuisine.href}
      className="group relative h-[200px] overflow-hidden rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,0,0,0.12)]"
    >
      {cuisine.imageUrl ? (
        <Image
          src={cuisine.imageUrl}
          alt={cuisine.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      ) : null}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-black/0 p-5 text-white">
        <div className="font-heading text-[22px] font-semibold leading-tight">
          {cuisine.name}
        </div>
        {cuisine.placeCount ? (
          <div className="mt-1 font-body text-[14px] opacity-90">
            {cuisine.placeCount}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export function ExploreByCuisine() {
  return (
    <section className="w-full bg-[#fff9f6] py-12">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2 className="font-heading text-[28px] font-bold text-[#1a202c] md:text-left md:text-[28px]">
          Explore By Cuisine
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-6">
          {CUISINES.map((c) => (
            <CuisineCard key={c.href} cuisine={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
