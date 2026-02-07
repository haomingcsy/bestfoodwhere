import type { ShoppingMall } from "@/types/shopping-mall";
import Image from "next/image";
import Link from "next/link";

interface Props {
  mall: ShoppingMall;
  isOpen?: boolean;
}

export function MallHero({ mall, isOpen = true }: Props) {
  const primaryMRT = mall.gettingHere.mrt[0];
  const hasHeroImage = !!mall.heroImageUrl;

  return (
    <section className="relative min-h-[400px] overflow-hidden">
      {/* Background Image */}
      {hasHeroImage ? (
        <div className="absolute inset-0">
          <Image
            src={mall.heroImageUrl!}
            alt={`${mall.name} shopping mall`}
            fill
            className="object-cover"
            sizes="100vw"
            priority
            quality={100}
            unoptimized
          />
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
        </div>
      )}

      {/* Content */}
      <div className="container relative z-10 flex min-h-[400px] flex-col justify-center py-12 text-white">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-white/70 hover:text-white">
            HOME
          </Link>
          <span className="mx-2 text-white/50">&gt;</span>
          <span className="font-medium">{mall.name.toUpperCase()}</span>
        </nav>

        {/* Mall Name */}
        <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
          {mall.name}
        </h1>

        {/* Description */}
        {mall.description && (
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">
            {mall.description.length > 300
              ? `${mall.description.slice(0, 300)}...`
              : mall.description}
          </p>
        )}

        {/* Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/* MRT Station */}
          {primaryMRT && (
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: primaryMRT.lineColor }}
              >
                <rect x="4" y="3" width="16" height="16" rx="2" />
                <path d="M4 11h16" />
                <path d="M12 3v8" />
                <circle cx="8" cy="21" r="1" />
                <circle cx="16" cy="21" r="1" />
                <path d="M8 19v2M16 19v2" />
              </svg>
              <span className="text-sm font-medium">
                {primaryMRT.name}
                {primaryMRT.lineCode && (
                  <span
                    className="ml-1.5 rounded px-1.5 py-0.5 text-xs font-bold"
                    style={{ backgroundColor: primaryMRT.lineColor }}
                  >
                    {primaryMRT.lineCode}
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Open Status */}
          <div
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              isOpen ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {isOpen ? "Open Now" : "Closed"}
          </div>

          {/* Restaurant Count */}
          {mall.restaurantCount > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-bfw-orange"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 3h18v18H3z" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <span className="text-sm font-medium">
                {mall.restaurantCount} Restaurants
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
