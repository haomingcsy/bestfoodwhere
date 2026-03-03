import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRecipe } from "@/lib/recipes";
import { RecipePageTemplate } from "@/components/templates/RecipePageTemplate";
import {
  generateRecipeSchema,
  generateBreadcrumbSchema,
  JsonLd,
} from "@/lib/seo/structured-data";

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

  // Build recipe schema using the centralized generator
  const totalTime =
    recipe.quickFacts.prepTimeMinutes + recipe.quickFacts.cookTimeMinutes;

  const recipeSchema = generateRecipeSchema({
    name: recipe.title,
    slug: `${category}/${slug}`,
    description: recipe.excerpt,
    image: recipe.featuredImageUrl,
    prepTime: `PT${recipe.quickFacts.prepTimeMinutes}M`,
    cookTime: `PT${recipe.quickFacts.cookTimeMinutes}M`,
    totalTime: `PT${totalTime}M`,
    servings: recipe.quickFacts.servings,
    ingredients: recipe.enrichedContent?.ingredients?.map(
      (ing) => `${ing.quantity} ${ing.unit} ${ing.item}`.trim(),
    ),
    instructions: recipe.enrichedContent?.instructions?.map((step) => ({
      step: step.step,
      text: step.text,
    })),
    cuisine: undefined,
    category,
    calories: recipe.enrichedContent?.nutrition?.calories,
    author: recipe.author.name,
    datePublished: recipe.publishedDate,
    rating: recipe.quickFacts.rating,
    reviewCount: recipe.quickFacts.ratingCount,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bestfoodwhere.sg" },
    { name: "Recipes", url: "https://bestfoodwhere.sg/recipes" },
    {
      name: category
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      url: `https://bestfoodwhere.sg/recipes/${category}`,
    },
    {
      name: recipe.title,
      url: `https://bestfoodwhere.sg/recipes/${category}/${slug}`,
    },
  ]);

  return (
    <>
      <JsonLd data={recipeSchema} />
      <JsonLd data={breadcrumbSchema} />
      <RecipePageTemplate recipe={recipe} />
    </>
  );
}
