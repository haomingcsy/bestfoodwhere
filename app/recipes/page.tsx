import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSupabaseRecipes, getRecipeCategory } from "@/lib/supabase-recipes";

// Static generation - no external API dependency
export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: "Recipes | BestFoodWhere",
  description:
    "Discover delicious recipes from around the world. Easy-to-follow instructions for Asian cuisine, Italian classics, comfort food, and more.",
};

// Category data with images
const CATEGORIES = [
  {
    slug: "asian-cuisine",
    name: "Asian Cuisine",
    description: "Stir-fries, noodles, and authentic Asian flavors",
    imageUrl:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800",
  },
  {
    slug: "italian-european",
    name: "Italian & European",
    description: "Pasta, risotto, and Mediterranean classics",
    imageUrl:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800",
  },
  {
    slug: "chicken",
    name: "Chicken",
    description: "Roasted, grilled, and fried chicken recipes",
    imageUrl:
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=800",
  },
  {
    slug: "seafood",
    name: "Seafood",
    description: "Fresh fish, shrimp, and ocean delights",
    imageUrl:
      "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80&w=800",
  },
  {
    slug: "beef-pork",
    name: "Beef & Pork",
    description: "Hearty meats and savory dishes",
    imageUrl:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800",
  },
  {
    slug: "soups-stews",
    name: "Soups & Stews",
    description: "Warm bowls of comfort",
    imageUrl:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800",
  },
  {
    slug: "rice-noodles",
    name: "Rice & Noodles",
    description: "Staple dishes from around the world",
    imageUrl:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=800",
  },
  {
    slug: "curries-spiced",
    name: "Curries & Spiced",
    description: "Bold and aromatic flavors",
    imageUrl:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800",
  },
  {
    slug: "quick-weeknight",
    name: "Quick Weeknight",
    description: "Fast meals for busy days",
    imageUrl:
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=800",
  },
  {
    slug: "comfort-classics",
    name: "Comfort Classics",
    description: "Home-style favorites",
    imageUrl:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=800",
  },
  {
    slug: "refreshments",
    name: "Refreshments",
    description: "Drinks and light bites",
    imageUrl:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=800",
  },
];

export default async function RecipesPage() {
  // Fetch recent recipes from Supabase
  const recentRecipes = await getSupabaseRecipes({ limit: 8 });

  // Transform recipes for display
  const postsWithImages = recentRecipes.map((recipe) => ({
    id: recipe.wp_post_id ?? recipe.id,
    slug: recipe.wp_slug,
    title: recipe.title,
    excerpt: recipe.description ?? "",
    imageUrl: "", // No featured images stored yet - will show placeholder
    categorySlug: getRecipeCategory(recipe),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-orange-100 py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <h1 className="font-heading text-4xl font-bold text-gray-900 md:text-5xl">
            Delicious Recipes
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Discover hundreds of easy-to-follow recipes from around the world.
            From quick weeknight dinners to impressive weekend feasts.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-[1200px] px-4">
          <h2 className="font-heading text-2xl font-bold text-gray-900">
            Browse by Category
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/recipes/${category.slug}`}
                className="group relative block aspect-square overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <h3 className="font-heading text-sm font-semibold text-white">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Recipes */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-[1200px] px-4">
          <h2 className="font-heading text-2xl font-bold text-gray-900">
            Recent Recipes
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {postsWithImages.map((post) => (
              <Link
                key={post.id}
                href={`/recipes/${post.categorySlug}/${post.slug}`}
                className="group block overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
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
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
