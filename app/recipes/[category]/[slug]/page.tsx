import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRecipe, formatTime } from "@/lib/recipes";
import { RecipePageTemplate } from "@/components/templates/RecipePageTemplate";

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipe(slug);

  if (!recipe) {
    return { title: "Recipe Not Found | BestFoodWhere" };
  }

  return {
    title: `${recipe.title} | BestFoodWhere Recipes`,
    description:
      recipe.excerpt ||
      `Learn how to make ${recipe.title} with our easy step-by-step recipe.`,
    openGraph: {
      title: recipe.title,
      description: recipe.excerpt,
      images: recipe.featuredImageUrl ? [recipe.featuredImageUrl] : [],
      type: "article",
      publishedTime: recipe.publishedDate,
      modifiedTime: recipe.modifiedDate,
      authors: [recipe.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.title,
      description: recipe.excerpt,
      images: recipe.featuredImageUrl ? [recipe.featuredImageUrl] : [],
    },
  };
}

export default async function RecipePage({ params }: Props) {
  const { slug, category } = await params;
  const recipe = await getRecipe(slug);

  if (!recipe) {
    notFound();
  }

  // Generate JSON-LD structured data for SEO
  const totalTime =
    recipe.quickFacts.prepTimeMinutes + recipe.quickFacts.cookTimeMinutes;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.excerpt,
    image: recipe.featuredImageUrl,
    author: {
      "@type": "Person",
      name: recipe.author.name,
    },
    datePublished: recipe.publishedDate,
    dateModified: recipe.modifiedDate,
    prepTime: `PT${recipe.quickFacts.prepTimeMinutes}M`,
    cookTime: `PT${recipe.quickFacts.cookTimeMinutes}M`,
    totalTime: `PT${totalTime}M`,
    recipeYield: `${recipe.quickFacts.servings} servings`,
    aggregateRating:
      recipe.quickFacts.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: recipe.quickFacts.rating,
            ratingCount: recipe.quickFacts.ratingCount,
          }
        : undefined,
    publisher: {
      "@type": "Organization",
      name: "BestFoodWhere",
      logo: {
        "@type": "ImageObject",
        url: "https://bestfoodwhere.sg/logo.png",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecipePageTemplate recipe={recipe} />
    </>
  );
}
