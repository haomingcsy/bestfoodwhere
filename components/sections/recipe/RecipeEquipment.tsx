"use client";

import {
  getAffiliateRecommendations,
  getCategoryEquipment,
} from "@/lib/affiliates/kitchen-equipment";

interface Equipment {
  name: string;
  required: boolean;
}

interface RecipeEquipmentProps {
  equipment?: Equipment[];
  categorySlug?: string;
}

export function RecipeEquipment({
  equipment,
  categorySlug,
}: RecipeEquipmentProps) {
  // Get premium affiliate recommendations based on equipment or category
  const equipmentNames = equipment?.map((e) => e.name) || [];
  const affiliateProducts =
    equipmentNames.length > 0
      ? getAffiliateRecommendations(equipmentNames, 3)
      : getCategoryEquipment(categorySlug || "general");

  if (affiliateProducts.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="font-heading text-lg font-bold text-gray-900">
        Recommended Equipment
      </h3>
      <p className="mt-1 text-xs text-gray-500">
        Premium picks for this recipe
      </p>

      <div className="mt-4 space-y-4">
        {affiliateProducts.map((product, index) => (
          <a
            key={index}
            href={product.link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group block rounded-lg border border-gray-100 p-3 transition-all hover:border-orange-200 hover:bg-orange-50"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 group-hover:text-orange-600 line-clamp-1">
                  {product.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                  {product.description}
                </p>
                <p className="mt-1 text-xs font-medium text-orange-500">
                  {product.priceRange}
                </p>
              </div>
              <span className="text-gray-300 group-hover:text-orange-400">
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>

      <p className="mt-4 text-[10px] text-gray-400 leading-tight">
        As an Amazon Associate, we earn from qualifying purchases. Links may be
        affiliate links.
      </p>
    </div>
  );
}
