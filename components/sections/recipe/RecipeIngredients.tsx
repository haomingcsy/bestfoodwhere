"use client";

import { extractSection } from "@/lib/recipes";
import type { RecipeIngredient } from "@/types/recipe";

interface RecipeIngredientsProps {
  content: string;
  ingredients?: RecipeIngredient[];
}

export function RecipeIngredients({
  content,
  ingredients,
}: RecipeIngredientsProps) {
  // Use structured ingredients if available
  if (ingredients && ingredients.length > 0) {
    // Group ingredients by section if they have sections
    const sections = groupIngredientsBySection(ingredients);

    return (
      <section id="ingredients" className="scroll-mt-28">
        <h2 className="font-heading text-2xl font-bold text-gray-900">
          Ingredients You&apos;ll Need
        </h2>
        <p className="mt-2 text-gray-600">
          Here&apos;s what you&apos;ll need – nothing too fancy, just good
          ingredients that work together beautifully.
        </p>

        <div className="mt-4 space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.name && (
                <h3 className="mb-2 font-semibold text-gray-800">
                  {section.name}
                </h3>
              )}
              <ul className="space-y-2">
                {section.items.map((ing, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-600"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400" />
                    <span>
                      <span className="font-medium text-gray-900">
                        {ing.quantity} {ing.unit}
                      </span>{" "}
                      {ing.item}
                      {ing.notes && (
                        <span className="text-gray-500"> ({ing.notes})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Fall back to WordPress content parsing
  const ingredientsSection = extractSection(content, "Ingredients");

  const isPlaceholder =
    ingredientsSection.toLowerCase().includes("see recipe card") ||
    ingredientsSection.toLowerCase().includes("recipe card for ingredients");

  return (
    <section id="ingredients" className="scroll-mt-28">
      <h2 className="font-heading text-2xl font-bold text-gray-900">
        Ingredients You&apos;ll Need
      </h2>
      <p className="mt-2 text-gray-600">
        Here&apos;s what you&apos;ll need – nothing too fancy, just good
        ingredients that work together beautifully.
      </p>

      {isPlaceholder || !ingredientsSection ? (
        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            See recipe card for ingredients
          </p>
        </div>
      ) : (
        <div
          className="prose prose-gray mt-4 max-w-none prose-ul:my-2 prose-li:my-0 prose-li:text-gray-600"
          dangerouslySetInnerHTML={{ __html: ingredientsSection }}
        />
      )}
    </section>
  );
}

function groupIngredientsBySection(ingredients: RecipeIngredient[]) {
  const sections: Array<{ name: string | null; items: RecipeIngredient[] }> =
    [];
  let currentSection: { name: string | null; items: RecipeIngredient[] } = {
    name: null,
    items: [],
  };

  for (const ing of ingredients) {
    const section = (ing as { section?: string }).section;
    if (section && section !== currentSection.name) {
      if (currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { name: section, items: [ing] };
    } else {
      currentSection.items.push(ing);
    }
  }

  if (currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}
