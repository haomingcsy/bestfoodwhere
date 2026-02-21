"use client";

import { useMemo, useState } from "react";
import type { MenuCategory, MenuItem } from "@/types/brand";
import Image from "next/image";
import { getOptimizedMenuUrl, IMAGE_PRESETS } from "@/lib/restaurant-images";

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium: number;
  sugar: number;
  fiber: number;
  allergens: string[];
  healthBenefits: string[];
  healthWarnings: string[];
}

interface Props {
  categories: MenuCategory[];
  cdnUrls?: Record<string, string>;
  nutritionData?: Record<string, NutritionInfo>;
}

export function MenuAccordion({ categories, cdnUrls = {}, nutritionData }: Props) {
  // Convert record to Map for the helper function
  const cdnUrlMap = useMemo(() => new Map(Object.entries(cdnUrls)), [cdnUrls]);

  // Helper to get optimized image URL
  const getImageUrl = (
    originalUrl: string | undefined,
    preset: keyof typeof IMAGE_PRESETS,
  ) => {
    if (!originalUrl) return undefined;
    return getOptimizedMenuUrl(originalUrl, cdnUrlMap, preset);
  };
  const defaultOpenIds = useMemo(
    () => new Set(categories[0]?.name ? [categories[0].name] : []),
    [categories],
  );
  const [openIds, setOpenIds] = useState<Set<string>>(defaultOpenIds);
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);

  const getNutrition = (itemName: string): NutritionInfo | null => {
    if (!nutritionData) return null;
    return nutritionData[itemName.toLowerCase()] || null;
  };

  if (categories.length === 0) {
    return (
      <section className="rounded-2xl bg-white px-6 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
        <h2 className="text-[26px] font-bold text-gray-900">Food Menu</h2>
        <div className="mt-4 h-[3px] w-10 bg-[#e74c3c]" />
        <p className="mt-4 text-sm text-gray-500">No menu items available.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white px-6 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
      <div className="mb-5">
        <h2 className="text-[26px] font-bold text-gray-900">Food Menu</h2>
        <div className="mt-4 h-[3px] w-10 bg-[#e74c3c]" />
      </div>

      <div className="space-y-3">
        {categories.map((category) => {
          const isOpen = openIds.has(category.name);
          return (
            <section key={category.name} className="rounded-lg bg-white">
              <button
                type="button"
                onClick={() =>
                  setOpenIds((prev) => {
                    const next = new Set(prev);
                    if (isOpen) next.delete(category.name);
                    else next.add(category.name);
                    return next;
                  })
                }
                className={`group flex w-full items-center justify-between gap-3 rounded-lg border-2 px-5 py-4 text-left transition-colors ${
                  isOpen
                    ? "border-[#ff4747] bg-[#ff4747] text-white"
                    : "border-[#ff4747] bg-white text-gray-900 hover:bg-[#ff4747] hover:text-white"
                }`}
              >
                <span className="text-base font-semibold">{category.name}</span>
                <span
                  className={`text-2xl leading-none ${
                    isOpen
                      ? "text-white"
                      : "text-[#ff4747] group-hover:text-white"
                  }`}
                >
                  {isOpen ? "-" : "+"}
                </span>
              </button>

              {isOpen ? (
                <div className="rounded-b-lg border-2 border-t-0 border-[#ff4747] px-5 py-5">
                  <div className="space-y-5">
                    {category.items.map((item) => (
                      <div
                        key={`${category.name}-${item.name}`}
                        className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-[#f8f8f8]"
                      >
                        {item.imageUrl ? (
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-sm ring-1 ring-black/5">
                            <Image
                              src={
                                getImageUrl(item.imageUrl, "menuItemList") ||
                                item.imageUrl
                              }
                              alt={item.name}
                              fill
                              className="object-cover"
                              unoptimized={item.imageUrl.includes(
                                "googleusercontent.com",
                              )}
                            />
                          </div>
                        ) : null}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-semibold text-gray-900">
                              {item.name}
                            </h4>
                            <div className="flex shrink-0 items-center gap-2">
                              {item.price ? (
                                <span className="text-sm font-semibold text-[#e74c3c]">
                                  {item.price}
                                </span>
                              ) : null}
                              <button
                                type="button"
                                aria-label={`Nutrition info for ${item.name}`}
                                onClick={() => setActiveItem(item)}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ff4747] text-white shadow-sm hover:bg-[#ff4747]/90"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-3.5 w-3.5"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path d="M12 2c3.3 1.6 5.5 4.4 6 8.2c-4.2-1.7-7.8.3-9.5 3.5C7.4 11 6 9 6 6.5C6 4.7 7.4 3 9.2 2.2c.9-.4 1.9-.4 2.8-.2Z" />
                                  <path d="M12 22c-3.8-2.2-5.6-6.4-4.6-10.7c2.2-1.2 4.4-1.4 6.7-.7c2.9.9 4.9 3.4 5.3 6.4c-1.9 3.1-4.4 4.9-7.4 5Z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          {item.description ? (
                            <p className="mt-1 text-sm text-gray-500">
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      {activeItem ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setActiveItem(null)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative bg-[#e74c3c] px-6 py-5 text-white">
              <div className="text-xl font-semibold">Nutrition Facts</div>
              <div className="absolute right-5 top-4 flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-full border-[3px] border-white shadow-md">
                  {activeItem.imageUrl ? (
                    <Image
                      src={
                        getImageUrl(activeItem.imageUrl, "menuItemModal") ||
                        activeItem.imageUrl
                      }
                      alt={activeItem.name}
                      fill
                      className="object-cover"
                      unoptimized={activeItem.imageUrl.includes(
                        "googleusercontent.com",
                      )}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/20 text-lg font-semibold">
                      {activeItem.name.charAt(0)}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setActiveItem(null)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#e74c3c] shadow-md"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>
            </div>
            <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
              {(() => {
                const nutrition = getNutrition(activeItem.name);

                if (!nutrition) {
                  return (
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                      <svg viewBox="0 0 24 24" className="h-10 w-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                      <p className="text-sm text-gray-500">
                        Nutrition information not yet available for this item.
                      </p>
                    </div>
                  );
                }

                const macros = [
                  { label: "Carbs", value: nutrition.carbs, unit: "g", color: "bg-[#2d8cff]" },
                  { label: "Protein", value: nutrition.protein, unit: "g", color: "bg-[#f5a623]" },
                  { label: "Fat", value: nutrition.fat, unit: "g", color: "bg-[#e74c3c]" },
                  { label: "Sodium", value: nutrition.sodium, unit: "mg", color: "bg-[#8e44ad]" },
                ];
                const totalMacro = nutrition.carbs + nutrition.protein + nutrition.fat + 1;

                return (
                  <div className="space-y-6">
                    {/* Calories + Macros */}
                    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-[#7cc34a] text-center text-white shadow-inner">
                          <div className="text-4xl font-bold">
                            {nutrition.calories}
                          </div>
                          <div className="text-lg font-medium">calories</div>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-black/5">
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-[#2d8cff]" />
                            C
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-[#f5a623]" />
                            P
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-[#e74c3c]" />
                            F
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {macros.map((macro) => {
                          const isSodium = macro.unit === "mg";
                          const max = isSodium ? 500 : totalMacro;
                          const percent = Math.min(
                            100,
                            Math.round((macro.value / max) * 100),
                          );
                          return (
                            <div key={macro.label}>
                              <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                                <div className="flex items-center gap-2">
                                  <span className={`h-3 w-3 rounded-full ${macro.color}`} />
                                  {macro.label}
                                </div>
                                <span className="text-[#e74c3c]">
                                  {macro.value}
                                  {macro.unit}
                                </span>
                              </div>
                              <div className="mt-2 h-3 w-full rounded-full bg-gray-100">
                                <div
                                  className={`h-full rounded-full ${macro.color}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Health Benefits */}
                    {nutrition.healthBenefits.length > 0 ? (
                      <div className="rounded-2xl bg-[#fafafa] px-5 py-5 shadow-sm">
                        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#22c55e]" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                          </svg>
                          Health Benefits
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {nutrition.healthBenefits.map((benefit) => (
                            <span
                              key={benefit}
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1.5 text-sm font-medium text-[#166534]"
                            >
                              <svg viewBox="0 0 20 20" className="h-4 w-4 text-[#22c55e]" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                              </svg>
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Allergens */}
                    {nutrition.allergens.length > 0 ? (
                      <div className="rounded-2xl bg-[#fff6d9] px-5 py-5">
                        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#f59e0b]" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.499-2.599 4.499H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.004ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                          </svg>
                          Allergen Watch
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {nutrition.allergens.map((allergen) => (
                            <span
                              key={allergen}
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] px-3 py-1.5 text-sm font-medium text-[#92400e]"
                            >
                              <svg viewBox="0 0 20 20" className="h-4 w-4 text-[#f59e0b]" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                              </svg>
                              {allergen}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Health Warnings */}
                    {nutrition.healthWarnings.length > 0 ? (
                      <div className="rounded-2xl bg-[#fefce8] px-5 py-5 ring-1 ring-[#facc15]/30">
                        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#eab308]" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                          </svg>
                          Warnings
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {nutrition.healthWarnings.map((warning) => (
                            <span
                              key={warning}
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#fef9c3] px-3 py-1.5 text-sm font-medium text-[#854d0e]"
                            >
                              {warning}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Disclaimer */}
                    <p className="text-center text-xs text-gray-400">
                      Values are AI-estimated and may vary. Not a substitute for professional dietary advice.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
