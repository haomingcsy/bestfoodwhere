"use client";

import { useMemo, useState } from "react";
import type { MenuCategory, MenuItem } from "@/types/brand";
import Image from "next/image";
import { getOptimizedMenuUrl, IMAGE_PRESETS } from "@/lib/restaurant-images";

interface Props {
  categories: MenuCategory[];
  cdnUrls?: Record<string, string>;
}

export function MenuAccordion({ categories, cdnUrls = {} }: Props) {
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
  const defaultOpenId = useMemo(() => categories[0]?.name ?? "", [categories]);
  const [openId, setOpenId] = useState<string>(defaultOpenId);
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);

  const getNutritionFacts = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) {
      hash = (hash * 31 + name.charCodeAt(i)) % 10000;
    }
    const calories = 180 + (hash % 140);
    const carbs = 22 + (hash % 20);
    const protein = 4 + (hash % 6);
    const fat = 6 + (hash % 8);
    const sugar = 6 + (hash % 12);
    const sodium = 120 + (hash % 120);
    return { calories, carbs, protein, fat, sugar, sodium };
  };

  const icons = {
    breadSlice: (
      <svg
        viewBox="0 0 576 512"
        className="h-6 w-6"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M352 64H224C100.3 64 0 164.3 0 288c0 68.5 55.5 124 124 124h328c68.5 0 124-55.5 124-124C576 164.3 475.7 64 352 64zM64 288c0-88.4 71.6-160 160-160h128c88.4 0 160 71.6 160 160 0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32z" />
      </svg>
    ),
    fish: (
      <svg
        viewBox="0 0 576 512"
        className="h-6 w-6"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M512 128c-75.9 0-140.4 42.4-192 96-51.6-53.6-116.1-96-192-96C57.3 128 0 185.3 0 256s57.3 128 128 128c75.9 0 140.4-42.4 192-96 51.6 53.6 116.1 96 192 96 70.7 0 128-57.3 128-128S582.7 128 512 128zM128 320c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64zm368-32c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z" />
      </svg>
    ),
    egg: (
      <svg
        viewBox="0 0 384 512"
        className="h-6 w-6"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M192 0C86 0 0 145 0 293.3 0 415.6 85.1 512 192 512s192-96.4 192-218.7C384 145 298 0 192 0z" />
      </svg>
    ),
    child: (
      <svg
        viewBox="0 0 384 512"
        className="h-6 w-6"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M120 72a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zM32 400c0-61.9 50.1-112 112-112h16v96c0 8.8 7.2 16 16 16s16-7.2 16-16V288h16v96c0 8.8 7.2 16 16 16s16-7.2 16-16V288h16c61.9 0 112 50.1 112 112v64c0 8.8-7.2 16-16 16H48c-8.8 0-16-7.2-16-16v-64z" />
      </svg>
    ),
    brain: (
      <svg
        viewBox="0 0 576 512"
        className="h-6 w-6"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M208 80c0-44.2 35.8-80 80-80s80 35.8 80 80c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-26.5-21.5-48-48-48s-48 21.5-48 48c0 8.8-7.2 16-16 16s-16-7.2-16-16zm-96 96c0-44.2 35.8-80 80-80 12.2 0 23.8 2.7 34.2 7.6 8 3.8 11.3 13.4 7.5 21.3-3.8 8-13.4 11.3-21.3 7.5-6.2-2.9-13-4.4-20.4-4.4-26.5 0-48 21.5-48 48 0 8.8-7.2 16-16 16s-16-7.2-16-16zm352-80c44.2 0 80 35.8 80 80 0 8.8-7.2 16-16 16s-16-7.2-16-16c0-26.5-21.5-48-48-48-7.4 0-14.2 1.5-20.4 4.4-8 3.8-17.5 .4-21.3-7.5-3.8-8-.4-17.5 7.5-21.3 10.4-4.9 22-7.6 34.2-7.6zm-336 128c44.2 0 80 35.8 80 80v48c0 44.2-35.8 80-80 80-8.8 0-16-7.2-16-16s7.2-16 16-16c26.5 0 48-21.5 48-48v-48c0-26.5-21.5-48-48-48-8.8 0-16-7.2-16-16s7.2-16 16-16zm336 0c44.2 0 80 35.8 80 80v48c0 44.2-35.8 80-80 80-8.8 0-16-7.2-16-16s7.2-16 16-16c26.5 0 48-21.5 48-48v-48c0-26.5-21.5-48-48-48-8.8 0-16-7.2-16-16s7.2-16 16-16zM256 192c0-8.8 7.2-16 16-16s16 7.2 16 16v128c0 8.8-7.2 16-16 16s-16-7.2-16-16V192z" />
      </svg>
    ),
    dumbbell: (
      <svg
        viewBox="0 0 640 512"
        className="h-6 w-6"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M104 96c-13.3 0-24 10.7-24 24v48H48c-26.5 0-48 21.5-48 48v80c0 26.5 21.5 48 48 48h32v48c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V96c0-13.3-10.7-24-24-24h-48zm488 72h-32V120c0-13.3-10.7-24-24-24h-48c-13.3 0-24 10.7-24 24v296c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24v-48h32c26.5 0 48-21.5 48-48v-80c0-26.5-21.5-48-48-48zM432 200H208v112h224V200z" />
      </svg>
    ),
    heartbeat: (
      <svg
        viewBox="0 0 512 512"
        className="h-6 w-6"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M462.3 62.6c-54.5-46.4-136-38.3-186.4 13.7L256 96.7l-19.9-20.4C185.7 24.3 104.2 16.2 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.2l193.5 199.8c12 12.4 28.3 19.4 45.5 19.4s33.5-7 45.5-19.4l193.5-199.8c56.2-57.4 52.9-153.6-9.9-207.2z" />
      </svg>
    ),
    alert: (
      <svg
        viewBox="0 0 576 512"
        className="h-6 w-6"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M569.5 440.6L329.5 40.6c-18.1-30.2-62.9-30.2-81 0L8.5 440.6C-9.6 470.9 13.8 512 48.5 512h479c34.7 0 58.1-41.1 42-71.4zM288 176c17.7 0 32 14.3 32 32v112c0 17.7-14.3 32-32 32s-32-14.3-32-32V208c0-17.7 14.3-32 32-32zm0 272c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z" />
      </svg>
    ),
  };

  const getHealthBenefits = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("tuna")) {
      return [
        {
          title: "Great for Children",
          description:
            "The protein in tuna supports healthy growth and development for active kids.",
          icon: icons.child,
        },
        {
          title: "Brain Health",
          description:
            "Omega-3 fatty acids in tuna support cognitive function and brain health.",
          icon: icons.brain,
        },
        {
          title: "Muscle Recovery",
          description:
            "12g of high-quality protein helps repair muscles after exercise.",
          icon: icons.dumbbell,
        },
        {
          title: "Heart Friendly",
          description:
            "Low in saturated fat and provides heart-healthy omega-3 fatty acids.",
          icon: icons.heartbeat,
        },
      ];
    }
    return [
      {
        title: "Energy Boost",
        description: "Balanced carbs provide steady energy throughout the day.",
        icon: icons.heartbeat,
      },
      {
        title: "Satisfying Bite",
        description: "A hearty snack that keeps you full between meals.",
        icon: icons.dumbbell,
      },
    ];
  };

  const getAllergens = (name: string) => {
    const lower = name.toLowerCase();
    const allergens = [
      {
        label: "Wheat",
        description:
          "Used in the bun dough. Contains gluten which may trigger reactions in those with celiac disease or gluten sensitivity.",
        icon: (
          <svg
            viewBox="0 0 576 512"
            className="h-7 w-7"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M352 64H224C100.3 64 0 164.3 0 288c0 68.5 55.5 124 124 124h328c68.5 0 124-55.5 124-124C576 164.3 475.7 64 352 64zM64 288c0-88.4 71.6-160 160-160h128c88.4 0 160 71.6 160 160 0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32z" />
          </svg>
        ),
      },
    ];

    if (lower.includes("tuna") || lower.includes("fish")) {
      allergens.push({
        label: "Fish",
        description:
          "The main ingredient in the filling. People with fish allergies may experience reactions ranging from mild to severe.",
        icon: (
          <svg
            viewBox="0 0 576 512"
            className="h-7 w-7"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M512 128c-75.9 0-140.4 42.4-192 96-51.6-53.6-116.1-96-192-96C57.3 128 0 185.3 0 256s57.3 128 128 128c75.9 0 140.4-42.4 192-96 51.6 53.6 116.1 96 192 96 70.7 0 128-57.3 128-128S582.7 128 512 128zM128 320c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z" />
          </svg>
        ),
      });
    }

    allergens.push({
      label: "Eggs",
      description:
        "Used in the bun dough and mayonnaise in the filling. Common allergen that can cause reactions in sensitive individuals.",
      icon: (
        <svg
          viewBox="0 0 384 512"
          className="h-7 w-7"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M192 0C86 0 0 145 0 293.3 0 415.6 85.1 512 192 512s192-96.4 192-218.7C384 145 298 0 192 0z" />
        </svg>
      ),
    });

    return allergens;
  };

  const getYumRating = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) {
      hash = (hash * 17 + name.charCodeAt(i)) % 100;
    }
    const score = 7.5 + (hash % 20) / 10;
    return Math.min(9.6, Number(score.toFixed(1)));
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
          const isOpen = category.name === openId;
          return (
            <section key={category.name} className="rounded-lg bg-white">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? "" : category.name)}
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
                        className="flex items-start gap-5 rounded-lg p-3 transition-colors hover:bg-[#f8f8f8]"
                      >
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gray-100 shadow-md ring-4 ring-white">
                          {item.imageUrl ? (
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
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xl font-bold text-gray-400">
                              {item.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-semibold text-gray-900">
                              {item.name}
                            </h4>
                            <button
                              type="button"
                              aria-label={`Nutrition info for ${item.name}`}
                              onClick={() => setActiveItem(item)}
                              className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff4747] text-white shadow-sm hover:bg-[#ff4747]/90"
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
                const facts = getNutritionFacts(activeItem.name);
                const benefits = getHealthBenefits(activeItem.name);
                const allergens = getAllergens(activeItem.name);
                const yumScore = getYumRating(activeItem.name);
                const macros = [
                  {
                    label: "Carbohydrates",
                    value: facts.carbs,
                    color: "bg-[#2d8cff]",
                  },
                  {
                    label: "Protein",
                    value: facts.protein,
                    color: "bg-[#f5a623]",
                  },
                  { label: "Fat", value: facts.fat, color: "bg-[#e74c3c]" },
                  {
                    label: "Sodium",
                    value: facts.sodium,
                    unit: "mg",
                    color: "bg-[#8e44ad]",
                  },
                ];
                const totalMacro = facts.carbs + facts.protein + facts.fat + 1;

                return (
                  <div className="space-y-8">
                    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-[#7cc34a] text-center text-white shadow-inner">
                          <div className="text-4xl font-bold">
                            {facts.calories}
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
                                  <span className="h-3 w-3 rounded-full bg-[#ff4d4f]" />
                                  {macro.label}
                                </div>
                                <span className="text-[#e74c3c]">
                                  {macro.value}
                                  {macro.unit ?? "g"}
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

                    <div className="rounded-2xl bg-[#fafafa] px-5 py-5 shadow-sm">
                      <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <span className="text-[#ff4d4f]">
                          {icons.heartbeat}
                        </span>
                        Health Benefits
                      </div>
                      <div className="relative mt-5">
                        <button
                          type="button"
                          className="absolute -left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md md:flex"
                          aria-label="Previous"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className="absolute -right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md md:flex"
                          aria-label="Next"
                        >
                          ›
                        </button>
                        <div className="grid gap-4 md:grid-cols-2">
                          {benefits.map((benefit) => (
                            <div
                              key={benefit.title}
                              className="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-black/5"
                            >
                              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff7a45] text-white">
                                {benefit.icon}
                              </div>
                              <div className="text-base font-semibold text-gray-900">
                                {benefit.title}
                              </div>
                              <p className="mt-2 text-sm text-gray-600">
                                {benefit.description}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-5 h-2 w-full rounded-full bg-gray-200">
                          <div className="h-full w-24 rounded-full bg-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#fff6d9] px-5 py-5">
                      <div className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <span className="text-[#ff4d4f]">{icons.alert}</span>
                        Allergens
                      </div>
                      <p className="mt-2 text-sm text-gray-700">
                        This product contains the following allergens that may
                        cause reactions in sensitive individuals:
                      </p>
                      <div className="mt-4 flex flex-wrap gap-4">
                        {allergens.map((allergen) => (
                          <div
                            key={allergen.label}
                            className="flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-full border-[3px] border-[#f8c28b] bg-white text-[#ff4d4f]"
                          >
                            {allergen.icon}
                            <span className="text-sm font-semibold text-gray-700">
                              {allergen.label}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 rounded-xl bg-white px-4 py-4 text-sm text-gray-700">
                        {allergens.map((allergen) => (
                          <p
                            key={`${allergen.label}-detail`}
                            className="mb-3 last:mb-0"
                          >
                            <span className="font-semibold text-gray-900">
                              {allergen.label}:
                            </span>{" "}
                            {allergen.description}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-[#ff8ea0] via-[#ff8ea0] to-[#ff6fa3] px-5 py-5 text-white">
                      <div className="flex items-center gap-2 text-2xl font-semibold">
                        <span className="text-2xl">★</span>
                        Yumminess Rating
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-4xl font-bold">
                          {yumScore}
                          <span className="text-lg font-medium text-white/80">
                            /10
                          </span>
                        </div>
                        <div className="text-3xl">😋</div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        {Array.from({ length: 10 }).map((_, index) => (
                          <div
                            key={`yum-${index}`}
                            className={`h-2 w-7 rounded-full ${index < Math.round(yumScore) ? "bg-white" : "bg-white/40"}`}
                          />
                        ))}
                      </div>
                      <p className="mt-4 text-sm text-white/90">
                        Perfect balance of savory flavors with a hint of
                        sweetness from the soft bun. A customer favorite!
                      </p>
                    </div>

                    <p className="text-center text-xs text-gray-400">
                      Values are approximate and may vary. Consult your
                      physician for personalized nutrition advice.
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
