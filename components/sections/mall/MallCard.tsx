import type { MallData } from "@/lib/mall-data";
import type { MallSummary, ShoppingMall } from "@/types/shopping-mall";
import Image from "next/image";
import Link from "next/link";

type MallProps = MallData | MallSummary | ShoppingMall;

interface Props {
  mall: MallProps;
}

function getMallImage(mall: MallProps): string {
  if ("imageUrl" in mall && mall.imageUrl) return mall.imageUrl;
  if ("heroImageUrl" in mall && mall.heroImageUrl) return mall.heroImageUrl;
  return "";
}

function getMallLocation(mall: MallProps): string {
  if ("location" in mall && mall.location) return mall.location;
  if ("region" in mall && mall.region) return mall.region;
  return "";
}

function getDiningCount(mall: MallProps): number {
  if ("diningCount" in mall) return mall.diningCount;
  if ("restaurantCount" in mall) return mall.restaurantCount;
  return 0;
}

export function MallCard({ mall }: Props) {
  const imageUrl = getMallImage(mall);
  const location = getMallLocation(mall);
  const diningCount = getDiningCount(mall);
  const imageAlt = "imageAlt" in mall ? mall.imageAlt : mall.name;

  return (
    <article className="group h-full">
      <Link
        href={`/shopping-malls/${mall.slug}`}
        className="flex flex-col h-full overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
      >
        <div className="relative aspect-[3/2] overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-5xl text-gray-300">
                {mall.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow p-5 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 leading-snug">
            {mall.name}
          </h3>
          {location && (
            <p className="mt-1.5 text-[15px] md:text-base text-gray-600">
              {location}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
            <span className="text-sm md:text-[15px] font-medium text-gray-600">
              {diningCount} Dining Options
            </span>
            <span className="text-sm md:text-[15px] font-semibold text-bfw-red flex items-center gap-1 transition-transform group-hover:translate-x-1">
              View Directory
              <span aria-hidden="true">&rarr;</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
