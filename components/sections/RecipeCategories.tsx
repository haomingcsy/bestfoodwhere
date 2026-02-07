import Image from "next/image";
import Link from "next/link";

interface RecipeCategory {
  href: string;
  categoryName: string;
  recipeCount: string;
  cardName: string;
  imageUrl?: string;
  isSeeAll?: boolean;
}

const CATEGORIES: RecipeCategory[] = [
  {
    href: "/recipes/asian-cuisine",
    categoryName: "Asian Cuisine",
    recipeCount: "66+ recipes",
    cardName: "Asian Flavors",
    imageUrl:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800",
  },
  {
    href: "/recipes/italian-european",
    categoryName: "Italian & European",
    recipeCount: "18+ recipes",
    cardName: "European Classics",
    imageUrl:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800",
  },
  {
    href: "/recipes/chicken",
    categoryName: "Chicken",
    recipeCount: "27+ recipes",
    cardName: "Chicken Delights",
    imageUrl:
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=800",
  },
  {
    href: "/recipes/seafood",
    categoryName: "Seafood",
    recipeCount: "39+ recipes",
    cardName: "Ocean Fresh",
    imageUrl:
      "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80&w=800",
  },
  {
    href: "/recipes/beef-pork",
    categoryName: "Beef & Pork",
    recipeCount: "27+ recipes",
    cardName: "Hearty Meats",
    imageUrl:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800",
  },
  {
    href: "/recipes/soups-stews",
    categoryName: "Soups & Stews",
    recipeCount: "22+ recipes",
    cardName: "Comfort Bowls",
    imageUrl:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800",
  },
  {
    href: "/recipes/rice-noodles",
    categoryName: "Rice & Noodles",
    recipeCount: "27+ recipes",
    cardName: "Staple Favorites",
    imageUrl:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=800",
  },
  {
    href: "/recipes/curries-spiced",
    categoryName: "Curries & Spiced",
    recipeCount: "35+ recipes",
    cardName: "Bold Flavors",
    imageUrl:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800",
  },
  {
    href: "/recipes/quick-weeknight",
    categoryName: "Quick Weeknight",
    recipeCount: "2+ recipes",
    cardName: "Fast & Easy",
    imageUrl:
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=800",
  },
  {
    href: "/recipes/comfort-classics",
    categoryName: "Comfort Classics",
    recipeCount: "77+ recipes",
    cardName: "Home Favorites",
    imageUrl:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=800",
  },
  {
    href: "/recipes/refreshments",
    categoryName: "Refreshments",
    recipeCount: "6+ recipes",
    cardName: "Drinks & More",
    imageUrl:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=800",
  },
  {
    href: "/recipes",
    categoryName: "All Recipes",
    recipeCount: "Browse all recipes",
    cardName: "Explore All",
    isSeeAll: true,
  },
] as const;

function BooksIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
      <path d="M8 6h8" />
      <path d="M8 10h8" />
      <path d="M8 14h8" />
    </svg>
  );
}

function RecipeCard({ category }: { category: RecipeCategory }) {
  if (category.isSeeAll) {
    return (
      <Link
        href={category.href}
        className="group relative block h-[260px] overflow-hidden rounded-2xl bg-bfw-orange shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:bg-bfw-orange-hover hover:shadow-[0_14px_30px_rgba(0,0,0,0.12)]"
      >
        <div className="flex h-full items-center justify-center">
          <div className="px-8 text-center text-white">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <BooksIcon className="h-9 w-9" />
            </div>
            <h3 className="mt-4 font-heading text-[22px] font-semibold">
              {category.categoryName}
            </h3>
            <p className="mt-2 font-body text-[15px] opacity-90 underline decoration-white/50 underline-offset-4">
              {category.recipeCount}
            </p>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-white/25 bg-white/10 px-6 py-4">
          <span className="font-heading text-[16px] font-semibold text-white">
            {category.cardName}
          </span>
          <span className="text-[20px] text-white transition-transform group-hover:translate-x-1">
            →
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={category.href}
      className="group relative block h-[260px] overflow-hidden rounded-2xl bg-white shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,0,0,0.12)]"
    >
      <div className="relative h-[170px] overflow-hidden">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.categoryName}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
          />
        ) : null}

        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-b from-black/10 to-black/60 p-6">
          <h3 className="font-heading text-[19px] font-semibold text-white drop-shadow">
            {category.categoryName}
          </h3>
          <p className="mt-1 font-body text-[14px] text-white/90 drop-shadow">
            {category.recipeCount}
          </p>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-[#f0f0f0] bg-white px-6 py-4">
        <span className="font-heading text-[16px] font-semibold text-[#333]">
          {category.cardName}
        </span>
        <span className="text-[20px] text-bfw-orange transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}

export function RecipeCategories() {
  return (
    <section className="w-full bg-white py-12">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2 className="font-heading text-[40px] font-bold leading-tight text-bfw-orange md:text-[42px]">
          Turn Your Kitchen Into a 5-Star Restaurant
        </h2>
        <p className="mt-4 max-w-[800px] font-body text-[18px] leading-relaxed text-[#555]">
          Stop ordering takeout! Transform ordinary ingredients from your pantry
          into extraordinary meals that will amaze your family and friends.
          These fool-proof recipes will make you the chef you never knew you
          could be.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {CATEGORIES.map((c) => (
            <RecipeCard key={c.href} category={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
