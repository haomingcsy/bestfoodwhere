"use client";

import type { RecipeQuickFacts as QuickFactsType } from "@/types/recipe";
import { formatTime } from "@/lib/recipes";
import { RecipeRating } from "./RecipeRating";
import { RecipePrintButton } from "./RecipePrintButton";

interface RecipeQuickFactsProps {
  quickFacts: QuickFactsType;
  slug: string;
}

export function RecipeQuickFacts({ quickFacts, slug }: RecipeQuickFactsProps) {
  const totalTime = quickFacts.prepTimeMinutes + quickFacts.cookTimeMinutes;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="font-heading text-lg font-bold text-gray-900">
        Recipe Quick Facts
      </h3>

      <div className="mt-5 space-y-4">
        <FactRow
          label="Prep Time"
          value={formatTime(quickFacts.prepTimeMinutes)}
        />
        <FactRow
          label="Cook Time"
          value={formatTime(quickFacts.cookTimeMinutes)}
        />
        <FactRow label="Total Time" value={formatTime(totalTime)} />
        <FactRow label="Servings" value={`${quickFacts.servings} servings`} />
        <FactRow
          label="Difficulty"
          value={<DifficultyBadge level={quickFacts.difficulty} />}
        />

        {/* Rating */}
        <div className="border-t border-gray-100 pt-4">
          <RecipeRating
            rating={quickFacts.rating}
            count={quickFacts.ratingCount}
            slug={slug}
          />
        </div>

        {/* Print Button */}
        <RecipePrintButton />
      </div>
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-orange-500">{value}</span>
    </div>
  );
}

function DifficultyBadge({ level }: { level: "easy" | "medium" | "hard" }) {
  const labels = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  };

  return <span className="capitalize">{labels[level]}</span>;
}
