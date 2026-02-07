"use client";

import Image from "next/image";
import type { RecipeData } from "@/types/recipe";
import { formatDate } from "@/lib/recipes";

interface RecipeHeroProps {
  recipe: RecipeData;
}

export function RecipeHero({ recipe }: RecipeHeroProps) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="font-heading text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
        {recipe.title}
      </h1>

      {/* Excerpt */}
      <p className="max-w-2xl text-lg text-gray-600">{recipe.excerpt}</p>

      {/* Author Info */}
      <div className="flex items-center gap-3">
        {recipe.author.avatarUrl ? (
          <Image
            src={recipe.author.avatarUrl}
            alt={recipe.author.name}
            width={44}
            height={44}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-semibold">
            {recipe.author.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="text-sm">
          <p className="font-medium text-gray-900">By {recipe.author.name}</p>
          <p className="text-gray-500">
            Updated: {formatDate(recipe.modifiedDate)}
          </p>
        </div>
      </div>

      {/* Hero Image */}
      {recipe.featuredImageUrl && (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
          <Image
            src={recipe.featuredImageUrl}
            alt={recipe.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
          />
        </div>
      )}
    </div>
  );
}
