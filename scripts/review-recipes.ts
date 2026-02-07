/**
 * Recipe Content Review Script
 * Shows full recipe content for quality review before image generation
 *
 * Usage:
 *   npx tsx scripts/review-recipes.ts              # Show 5 random samples
 *   npx tsx scripts/review-recipes.ts --all        # Export all to JSON
 *   npx tsx scripts/review-recipes.ts <slug>       # Show specific recipe
 *   npx tsx scripts/review-recipes.ts --category   # Group by category
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function printRecipe(r: any): void {
  console.log("\n" + "=".repeat(80));
  console.log("RECIPE:", r.title);
  console.log("Slug:", r.wp_slug);
  console.log("=".repeat(80));

  console.log("\nDESCRIPTION:");
  console.log(r.description || "(none)");

  console.log("\nTIME & SERVINGS:");
  console.log(
    `Prep: ${r.prep_time} | Cook: ${r.cook_time} | Total: ${r.total_time} | Servings: ${r.servings}`,
  );

  console.log("\nWHY YOU'LL LOVE IT:");
  console.log(r.why_love_it || "(none)");

  const ingredients = r.ingredients || [];
  console.log(`\nINGREDIENTS (${ingredients.length}):`);
  ingredients.forEach((ing: any, i: number) => {
    const notes = ing.notes ? ` (${ing.notes})` : "";
    console.log(`  ${i + 1}. ${ing.quantity} ${ing.unit} ${ing.item}${notes}`);
  });

  const instructions = r.instructions || [];
  console.log(`\nINSTRUCTIONS (${instructions.length} steps):`);
  instructions.forEach((step: any) => {
    console.log(`\n  Step ${step.step}:`);
    console.log(`  ${step.text}`);
    if (step.image_hint) {
      console.log(`  [Image hint: ${step.image_hint}]`);
    }
  });

  if (r.tips) {
    console.log("\nTIPS:");
    console.log(r.tips);
  }

  console.log("\n");
}

async function showSamples(count: number = 5): Promise<void> {
  // Get recipes needing images
  const { data: recipes } = await supabase
    .from("recipe_content")
    .select("*")
    .order("title");

  const needImages =
    recipes?.filter((r) => {
      const instructions = r.instructions || [];
      return instructions.some(
        (i: any) => !i.image_url || !i.image_url.startsWith("http"),
      );
    }) || [];

  console.log(`\nTotal recipes needing images: ${needImages.length}`);
  console.log(`Showing ${Math.min(count, needImages.length)} samples:\n`);

  // Pick diverse samples (every Nth recipe)
  const step = Math.floor(needImages.length / count);
  for (let i = 0; i < count && i * step < needImages.length; i++) {
    printRecipe(needImages[i * step]);
  }
}

async function showRecipe(slug: string): Promise<void> {
  const { data: r, error } = await supabase
    .from("recipe_content")
    .select("*")
    .eq("wp_slug", slug)
    .single();

  if (error || !r) {
    console.error(`Recipe not found: ${slug}`);
    return;
  }

  printRecipe(r);
}

async function showByCategory(): Promise<void> {
  const { data: recipes } = await supabase
    .from("recipe_content")
    .select("wp_slug, title, instructions")
    .order("title");

  const needImages =
    recipes?.filter((r) => {
      const instructions = r.instructions || [];
      return instructions.some(
        (i: any) => !i.image_url || !i.image_url.startsWith("http"),
      );
    }) || [];

  // Group by apparent category based on title/slug
  const categories: Record<string, any[]> = {
    Chicken: [],
    Beef: [],
    Pork: [],
    Seafood: [],
    Vegetarian: [],
    Soup: [],
    Noodles: [],
    Rice: [],
    Asian: [],
    Western: [],
    Other: [],
  };

  for (const r of needImages) {
    const slug = r.wp_slug.toLowerCase();
    const title = r.title.toLowerCase();

    if (slug.includes("chicken") || title.includes("chicken")) {
      categories.Chicken.push(r);
    } else if (
      slug.includes("beef") ||
      title.includes("beef") ||
      slug.includes("steak")
    ) {
      categories.Beef.push(r);
    } else if (slug.includes("pork") || title.includes("pork")) {
      categories.Pork.push(r);
    } else if (
      slug.includes("fish") ||
      slug.includes("prawn") ||
      slug.includes("salmon") ||
      slug.includes("crab") ||
      slug.includes("seafood") ||
      slug.includes("shrimp") ||
      title.includes("fish") ||
      title.includes("seafood")
    ) {
      categories.Seafood.push(r);
    } else if (
      slug.includes("tofu") ||
      slug.includes("vegetable") ||
      title.includes("vegetarian")
    ) {
      categories.Vegetarian.push(r);
    } else if (slug.includes("soup") || title.includes("soup")) {
      categories.Soup.push(r);
    } else if (
      slug.includes("noodle") ||
      slug.includes("pasta") ||
      slug.includes("ramen") ||
      slug.includes("udon")
    ) {
      categories.Noodles.push(r);
    } else if (slug.includes("rice") || title.includes("rice")) {
      categories.Rice.push(r);
    } else if (
      slug.includes("kimchi") ||
      slug.includes("thai") ||
      slug.includes("japanese") ||
      slug.includes("korean") ||
      slug.includes("chinese")
    ) {
      categories.Asian.push(r);
    } else if (
      slug.includes("pizza") ||
      slug.includes("pasta") ||
      slug.includes("burger")
    ) {
      categories.Western.push(r);
    } else {
      categories.Other.push(r);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("RECIPES BY CATEGORY (needing images)");
  console.log("=".repeat(60));

  for (const [category, items] of Object.entries(categories)) {
    if (items.length > 0) {
      console.log(`\n${category} (${items.length}):`);
      items.forEach((r) => {
        const steps = r.instructions?.length || 0;
        console.log(`  - ${r.wp_slug} (${steps} steps)`);
      });
    }
  }
}

async function exportAll(): Promise<void> {
  const { data: recipes } = await supabase
    .from("recipe_content")
    .select("*")
    .order("title");

  const needImages =
    recipes?.filter((r) => {
      const instructions = r.instructions || [];
      return instructions.some(
        (i: any) => !i.image_url || !i.image_url.startsWith("http"),
      );
    }) || [];

  console.log(JSON.stringify(needImages, null, 2));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    await showSamples(5);
  } else if (args[0] === "--all") {
    await exportAll();
  } else if (args[0] === "--category") {
    await showByCategory();
  } else if (args[0] === "--count" && args[1]) {
    await showSamples(parseInt(args[1]));
  } else {
    await showRecipe(args[0]);
  }
}

main().catch(console.error);
