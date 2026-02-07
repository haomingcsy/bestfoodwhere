import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipesBySupabaseCategory } from "@/lib/supabase-recipes";

// Static generation with revalidation
export const revalidate = 3600; // Revalidate every hour

interface Props {
  params: Promise<{ category: string }>;
}

// Category metadata
const CATEGORY_INFO: Record<
  string,
  { name: string; description: string; imageUrl: string }
> = {
  "asian-cuisine": {
    name: "Asian Cuisine",
    description:
      "Explore authentic Asian recipes including stir-fries, noodle dishes, and traditional favorites from across the continent.",
    imageUrl:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=1200",
  },
  "italian-european": {
    name: "Italian & European",
    description:
      "Classic European recipes featuring pasta, risotto, and Mediterranean flavors that bring the taste of Europe to your kitchen.",
    imageUrl:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=1200",
  },
  chicken: {
    name: "Chicken Recipes",
    description:
      "Delicious chicken dishes from roasted and grilled to fried and baked. Find your new favorite chicken recipe here.",
    imageUrl:
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=1200",
  },
  seafood: {
    name: "Seafood",
    description:
      "Fresh and flavorful seafood recipes featuring fish, shrimp, crab, and more from oceans around the world.",
    imageUrl:
      "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80&w=1200",
  },
  "beef-pork": {
    name: "Beef & Pork",
    description:
      "Hearty meat recipes including steaks, roasts, and slow-cooked dishes that satisfy every appetite.",
    imageUrl:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=1200",
  },
  "soups-stews": {
    name: "Soups & Stews",
    description:
      "Warm and comforting soups, stews, and broths perfect for any season.",
    imageUrl:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1200",
  },
  "rice-noodles": {
    name: "Rice & Noodles",
    description:
      "Staple dishes featuring rice and noodles from cuisines around the world.",
    imageUrl:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=1200",
  },
  "curries-spiced": {
    name: "Curries & Spiced",
    description:
      "Bold and aromatic curry recipes with rich spices and complex flavors.",
    imageUrl:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=1200",
  },
  "quick-weeknight": {
    name: "Quick Weeknight",
    description:
      "Fast and easy recipes perfect for busy weeknights when you need dinner on the table quickly.",
    imageUrl:
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=1200",
  },
  "comfort-classics": {
    name: "Comfort Classics",
    description:
      "Home-style comfort food recipes that warm the soul and bring back memories.",
    imageUrl:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=1200",
  },
  refreshments: {
    name: "Refreshments",
    description:
      "Refreshing drinks, smoothies, and light bites to enjoy any time of day.",
    imageUrl:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=1200",
  },
  general: {
    name: "All Recipes",
    description: "Browse our complete collection of delicious recipes.",
    imageUrl:
      "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=1200",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const info = CATEGORY_INFO[category];

  if (!info) {
    return { title: "Category Not Found | BestFoodWhere" };
  }

  return {
    title: `${info.name} Recipes | BestFoodWhere`,
    description: info.description,
  };
}

export default async function RecipeCategoryPage({ params }: Props) {
  const { category } = await params;

  const categoryInfo = CATEGORY_INFO[category];

  if (!categoryInfo) {
    notFound();
  }

  // Fetch recipes for this category from Supabase
  const recipes = await getRecipesBySupabaseCategory(category, { limit: 24 });

  // Transform recipes for display
  const postsWithImages = recipes.map((recipe) => ({
    id: recipe.wp_post_id ?? recipe.id,
    slug: recipe.wp_slug,
    imageUrl: "", // No featured images stored yet - will show placeholder
    displayTitle: recipe.title,
    displayExcerpt: recipe.description ?? "",
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-900 py-20">
        <Image
          src={categoryInfo.imageUrl}
          alt={categoryInfo.name}
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="relative mx-auto max-w-[1200px] px-4">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            All Recipes
          </Link>
          <h1 className="mt-4 font-heading text-4xl font-bold text-white md:text-5xl">
            {categoryInfo.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            {categoryInfo.description}
          </p>
          <p className="mt-2 text-sm text-white/60">
            {postsWithImages.length} recipe
            {postsWithImages.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </section>

      {/* Recipes Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-[1200px] px-4">
          {postsWithImages.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-gray-500">
                No recipes found in this category yet.
              </p>
              <Link
                href="/recipes"
                className="mt-4 inline-block text-orange-500 hover:underline"
              >
                Browse all recipes
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {postsWithImages.map((post) => (
                <Link
                  key={post.id}
                  href={`/recipes/${category}/${post.slug}`}
                  className="group block overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt={post.displayTitle}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-500">
                      {post.displayTitle}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {post.displayExcerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
