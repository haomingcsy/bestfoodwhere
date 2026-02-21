"use client";

import type { MallRestaurant } from "@/types/shopping-mall";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  getPlaceholderUrl,
  isValidImageUrl,
  getOptimizedUrl,
} from "@/lib/restaurant-images";
import {
  parseOpeningHoursText,
  getCondensedSchedule,
} from "@/lib/format-opening-hours";

interface Props {
  restaurant: MallRestaurant;
  cdnUrl?: string; // Pre-fetched CDN URL from cache
  heroImageUrl?: string; // High-quality image from Google Places API
  description?: string; // Pre-fetched AI-generated description
}

function getStarRow(rating: number) {
  const full = Math.max(0, Math.min(5, Math.floor(rating)));
  const empty = 5 - full;
  return (
    <span className="inline-flex items-center gap-0.5 text-base leading-none">
      <span className="text-amber-400">{"★".repeat(full)}</span>
      <span className="text-gray-300">{"☆".repeat(empty)}</span>
    </span>
  );
}

function isCurrentlyOpen(openingHours: string): boolean {
  if (!openingHours) return true; // Assume open if no hours provided

  const hoursLower = openingHours.toLowerCase();

  // Google Maps format: "Open ⋅ Closes X pm" or "Closed ⋅ Opens X am"
  if (hoursLower.startsWith("open")) return true;
  if (hoursLower.startsWith("closed")) return false;

  // Check for explicit status indicators
  if (/temporarily closed|permanently closed/i.test(openingHours)) return false;
  if (/open 24 hours|24 hours/i.test(openingHours)) return true;

  // Try to parse time range format: "10:00 AM - 10:00 PM" or "10AM-10PM"
  const timeMatch = openingHours.match(
    /(\d{1,2}):?(\d{2})?\s*(AM|PM)\s*[-–]\s*(\d{1,2}):?(\d{2})?\s*(AM|PM)/i,
  );

  if (!timeMatch) return true; // Assume open if can't parse

  const now = new Date();
  const singaporeTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Singapore" }),
  );
  const currentMinutes =
    singaporeTime.getHours() * 60 + singaporeTime.getMinutes();

  const openHour =
    (parseInt(timeMatch[1]) % 12) +
    (timeMatch[3].toUpperCase() === "PM" ? 12 : 0);
  const openMin = parseInt(timeMatch[2] || "0");
  const closeHour =
    (parseInt(timeMatch[4]) % 12) +
    (timeMatch[6].toUpperCase() === "PM" ? 12 : 0);
  const closeMin = parseInt(timeMatch[5] || "0");

  const openMinutes = openHour * 60 + openMin;
  let closeMinutes = closeHour * 60 + closeMin;

  // Handle overnight hours (e.g., 6 PM - 2 AM)
  if (closeMinutes <= openMinutes) {
    closeMinutes += 24 * 60;
    const adjustedCurrent =
      currentMinutes < openMinutes ? currentMinutes + 24 * 60 : currentMinutes;
    return adjustedCurrent >= openMinutes && adjustedCurrent < closeMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

// Generate a unique fun description based on restaurant attributes
function generateFunDescription(
  name: string,
  cuisines: string[],
  diningStyles: string[],
  rating?: number,
  priceRange?: string,
): string {
  const cuisine = cuisines[0] || "delicious food";
  const cuisine2 = cuisines[1] || "";
  const style = diningStyles[0] || "";
  const hash = name.split("").reduce((a, b) => a + b.charCodeAt(0), 0);

  // Adjectives pool
  const adjectives = [
    "mouthwatering",
    "irresistible",
    "scrumptious",
    "heavenly",
    "delectable",
    "savory",
    "tantalizing",
    "exquisite",
    "divine",
    "incredible",
  ];
  const adj = adjectives[hash % adjectives.length];
  const adj2 = adjectives[(hash + 3) % adjectives.length];

  // Vibes pool
  const vibes = [
    "cozy",
    "vibrant",
    "welcoming",
    "lively",
    "charming",
    "bustling",
    "relaxed",
    "trendy",
    "intimate",
    "energetic",
  ];
  const vibe = vibes[(hash + 1) % vibes.length];

  // Actions pool
  const actions = [
    "sink your teeth into",
    "indulge in",
    "savor",
    "feast on",
    "treat yourself to",
    "discover",
    "experience",
    "enjoy",
  ];
  const action = actions[(hash + 2) % actions.length];

  // Cuisine-specific intros
  const cuisineIntros: Record<string, string[]> = {
    japanese: [
      `From fresh sashimi to perfectly rolled maki, ${name} brings Tokyo's finest flavors to your table.`,
      `Craving authentic Japanese? ${name} serves up ${adj} ramen, sushi, and more that'll transport you straight to Japan.`,
    ],
    chinese: [
      `Wok-fired perfection awaits at ${name}! Their ${adj} Chinese dishes are made with recipes passed down through generations.`,
      `From dim sum to roast duck, ${name} delivers authentic Chinese flavors that keep customers coming back for more.`,
    ],
    korean: [
      `Get ready for a Korean food adventure at ${name}! Sizzling BBQ, spicy kimchi, and ${adj} bibimbap await.`,
      `${name} brings the bold, fiery flavors of Korea to life. Don't miss their legendary fried chicken!`,
    ],
    thai: [
      `Spice lovers, rejoice! ${name} serves up ${adj} Thai cuisine with the perfect balance of sweet, sour, salty, and spicy.`,
      `From creamy tom yum to fragrant pad thai, ${name} captures the essence of Thai street food.`,
    ],
    indian: [
      `Rich curries, fluffy naan, and aromatic spices – ${name} is your ticket to ${adj} Indian cuisine.`,
      `${name} turns up the heat with authentic Indian flavors. Their tandoori dishes are absolutely legendary!`,
    ],
    italian: [
      `Mangia bene at ${name}! Hand-tossed pizzas, fresh pasta, and ${adj} tiramisu await hungry foodies.`,
      `${name} serves up Italian comfort food at its finest. Their homemade pasta will make nonna proud!`,
    ],
    mexican: [
      `Tacos, burritos, and guac galore! ${name} brings the fiesta with ${adj} Mexican flavors.`,
      `Ole! ${name} serves up authentic Mexican street food that'll have you saying "más, por favor!"`,
    ],
    cafe: [
      `Need a caffeine fix? ${name} brews up ${adj} coffee and Instagram-worthy treats in a ${vibe} setting.`,
      `${name} is your perfect escape for artisan coffee, fresh pastries, and those lazy afternoon vibes.`,
    ],
    bakery: [
      `Fresh from the oven! ${name} fills the air with the ${adj} aroma of baked goods that are simply irresistible.`,
      `Carb lovers unite! ${name} crafts ${adj} breads, pastries, and cakes that are worth every calorie.`,
    ],
    "fast food": [
      `Quick, tasty, and satisfying – ${name} hits the spot when those cravings strike!`,
      `${name} proves fast food can be ${adj}. Perfect for when you need delicious food on the go!`,
    ],
    western: [
      `Juicy burgers, crispy fries, and ${adj} comfort food – ${name} has your Western food cravings covered.`,
      `${name} serves up hearty Western fare that satisfies. Their portions are as generous as the flavors!`,
    ],
    seafood: [
      `Dive into ${adj} seafood at ${name}! Fresh catches prepared with skill and served with love.`,
      `Ocean-fresh and absolutely ${adj} – ${name} is a seafood lover's paradise!`,
    ],
    vegetarian: [
      `Who says veggies are boring? ${name} creates ${adj} plant-based dishes that even meat lovers adore!`,
      `${name} proves healthy eating can be delicious with their creative, ${adj} vegetarian menu.`,
    ],
    dessert: [
      `Sweet tooth calling? ${name} answers with ${adj} desserts that are pure happiness in every bite!`,
      `Life is short, eat dessert first! ${name} crafts ${adj} sweet treats you'll dream about.`,
    ],
  };

  // Check for cuisine-specific intro
  const cuisineLower = cuisine.toLowerCase();
  for (const [key, intros] of Object.entries(cuisineIntros)) {
    if (cuisineLower.includes(key) || key.includes(cuisineLower)) {
      return intros[hash % intros.length];
    }
  }

  // Rating-based intros for high-rated places
  if (rating && rating >= 4.5) {
    const highRatedTemplates = [
      `With rave reviews and loyal fans, ${name} has earned its stellar reputation for ${adj} ${cuisine} that wows every time.`,
      `There's a reason ${name} is a crowd favorite! Their ${adj} ${cuisine} consistently delivers an unforgettable dining experience.`,
      `Top-rated and totally worth it – ${name} sets the bar high for ${cuisine} with every ${adj} dish they serve.`,
    ];
    return highRatedTemplates[hash % highRatedTemplates.length];
  }

  // Style-based templates
  if (style.toLowerCase().includes("casual")) {
    return `Kick back and enjoy ${adj} ${cuisine} at ${name}. The ${vibe} atmosphere makes it perfect for any occasion!`;
  }
  if (style.toLowerCase().includes("fine")) {
    return `Elevate your dining experience at ${name}, where ${adj} ${cuisine} meets impeccable service in an elegant setting.`;
  }

  // Generic but varied templates
  const genericTemplates = [
    `${name} has mastered the art of ${cuisine}. Step in hungry, leave happy – that's the promise here!`,
    `Looking for your new favorite spot? ${name} serves up ${adj} ${cuisine} in a ${vibe} atmosphere you'll love.`,
    `Food lovers, take note! ${name} dishes out ${adj} ${cuisine} that keeps the regulars coming back.`,
    `${action} the ${adj} flavors at ${name}! Their ${cuisine} creations are crafted with passion and precision.`,
    `Skip the ordinary – ${name} delivers ${adj2} ${cuisine} that makes every meal feel like a celebration.`,
    `Warning: ${name}'s ${adj} ${cuisine} may cause serious cravings. Side effects include happiness and satisfaction!`,
    `${name} isn't just about food – it's about ${adj} experiences. Their ${cuisine} tells a delicious story.`,
    `Hungry? ${name} has you covered with ${adj} ${cuisine} that hits different every single time.`,
    `From first bite to last, ${name} delivers pure ${cuisine} magic. Trust us, your taste buds will thank you!`,
    `${name} brings the heat with ${adj} ${cuisine} that's bold, flavorful, and utterly addictive.`,
  ];

  return genericTemplates[hash % genericTemplates.length];
}

export function MallRestaurantCard({
  restaurant,
  cdnUrl,
  heroImageUrl,
  description: passedDescription,
}: Props) {
  const [showHours, setShowHours] = useState(false);
  const [showDining, setShowDining] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isOpen =
    restaurant.isOpen !== undefined
      ? restaurant.isOpen
      : isCurrentlyOpen(restaurant.openingHours);

  const mapsQuery = encodeURIComponent(
    `${restaurant.name} ${restaurant.mallSlug} Singapore`,
  );
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  // For Google Photos URLs, request larger images
  const getHighResGoogleUrl = (url: string | undefined): string | undefined => {
    if (!url) return url;
    if (url.includes("googleusercontent.com")) {
      // Use =w0-h0 to get original size without restrictions
      if (url.includes("=w") || url.includes("=s")) {
        return url
          .replace(/=w\d+-h\d+[^&]*/, "=w0-h0")
          .replace(/=s\d+[^&]*/, "=s0");
      }
      return url + "=w0-h0";
    }
    return url;
  };

  // Priority: heroImageUrl (Google Places) > cdnUrl (cached) > restaurant.imageUrl (sheets)
  const rawImageUrl = heroImageUrl || cdnUrl || restaurant.imageUrl;
  const imageUrl = heroImageUrl
    ? heroImageUrl // Already high-quality from Google Places API
    : cdnUrl
      ? getOptimizedUrl(cdnUrl, { width: 600, quality: 90, format: "webp" })
      : getHighResGoogleUrl(rawImageUrl);
  const hasValidImage = isValidImageUrl(rawImageUrl) && !imageError;
  const placeholderUrl = getPlaceholderUrl(restaurant.name, 400);

  // Check if this is a Google Places API URL (needs special handling)
  const isPlacesApiUrl = imageUrl?.includes("places.googleapis.com");

  // Reset error state when URL changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [rawImageUrl]);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {hasValidImage ? (
          <>
            {/* Blur placeholder while loading */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 animate-pulse" />
            )}
            <Image
              src={imageUrl!}
              alt={restaurant.name}
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              unoptimized={
                imageUrl?.includes("googleusercontent.com") || isPlacesApiUrl
              }
            />
          </>
        ) : (
          <div className="relative h-full w-full">
            <Image
              src={placeholderUrl}
              alt={restaurant.name}
              fill
              className="object-cover"
              sizes="400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        )}

        {/* Open/Closed Badge */}
        <div
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
            isOpen ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {isOpen ? "Open" : "Closed"}
        </div>

        {/* Price Range */}
        {restaurant.priceRange && (
          <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
            {restaurant.priceRange}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {restaurant.name}
          </h3>
          {restaurant.unit && (
            <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              #{restaurant.unit}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-2">
          {getStarRow(restaurant.rating)}
          <span className="font-medium text-gray-900">
            {restaurant.rating.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">
            ({restaurant.reviewCount})
          </span>
        </div>

        {/* Tags */}
        {(restaurant.cuisines.length > 0 ||
          restaurant.diningStyles.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {restaurant.cuisines.slice(0, 2).map((cuisine) => (
              <span
                key={cuisine}
                className="rounded-full border border-bfw-orange/30 bg-bfw-orange/5 px-2.5 py-1 text-xs font-medium text-bfw-orange"
              >
                {cuisine}
              </span>
            ))}
            {restaurant.diningStyles.slice(0, 1).map((style) => (
              <span
                key={style}
                className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
              >
                {style}
              </span>
            ))}
          </div>
        )}

        {/* Description with Read more/less */}
        <div className="mt-3">
          {(() => {
            // Priority: 1) passed AI description, 2) restaurant data description, 3) generated fallback
            const description =
              passedDescription ||
              restaurant.description ||
              generateFunDescription(
                restaurant.name,
                restaurant.cuisines,
                restaurant.diningStyles,
                restaurant.rating,
                restaurant.priceRange,
              );
            const isLong = description.length > 100;

            return (
              <>
                <p
                  className={`text-sm text-gray-600 ${
                    !showFullDesc && isLong ? "line-clamp-2" : ""
                  }`}
                >
                  {description}
                </p>
                {isLong && (
                  <button
                    type="button"
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="mt-1 text-sm font-medium text-bfw-orange hover:text-bfw-orange/80"
                  >
                    {showFullDesc ? "Read less" : "Read more"}
                  </button>
                )}
              </>
            );
          })()}
        </div>

        {/* Expandable Sections */}
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
          {/* Opening Hours */}
          {restaurant.openingHours && (
            <button
              type="button"
              onClick={() => setShowHours(!showHours)}
              className="flex w-full items-center justify-between text-sm text-gray-600 hover:text-gray-900"
            >
              <span className="flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                Opening Hours
              </span>
              <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 transition ${showHours ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          )}
          {showHours && restaurant.openingHours && (
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
              {(() => {
                const schedule = parseOpeningHoursText(restaurant.openingHours);
                if (!schedule) return restaurant.openingHours;
                const display = getCondensedSchedule(schedule);
                return (
                  <div className="space-y-1">
                    {display.map((entry, i) => (
                      <div key={i} className="flex justify-between gap-4">
                        {entry.day && (
                          <span className="font-medium text-gray-700">
                            {entry.day}
                          </span>
                        )}
                        <span className="text-right text-gray-600">
                          {entry.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Dining Options */}
          {restaurant.diningOptions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDining(!showDining)}
              className="flex w-full items-center justify-between text-sm text-gray-600 hover:text-gray-900"
            >
              <span className="flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 3h18v18H3z" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
                Dining Options
              </span>
              <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 transition ${showDining ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          )}
          {showDining && (
            <div className="flex flex-wrap gap-2 rounded-lg bg-gray-50 px-3 py-2">
              {restaurant.diningOptions.map((option) => (
                <span key={option} className="text-sm text-gray-600">
                  {option}
                </span>
              ))}
            </div>
          )}

          {/* Contact */}
          {restaurant.phone && (
            <button
              type="button"
              onClick={() => setShowContact(!showContact)}
              className="flex w-full items-center justify-between text-sm text-gray-600 hover:text-gray-900"
            >
              <span className="flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.6 19.6 0 0 1 3.1 4.2 2 2 0 0 1 5.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.6a2 2 0 0 1-.5 2.1L9.1 9.9a16 16 0 0 0 6 6l1.6-1.1a2 2 0 0 1 2.1-.5c.9.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" />
                </svg>
                Contact Store
              </span>
              <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 transition ${showContact ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          )}
          {showContact && restaurant.phone && (
            <a
              href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
              className="block rounded-lg bg-gray-50 px-3 py-2 text-sm text-bfw-orange hover:underline"
            >
              {restaurant.phone}
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            GET DIRECTIONS
          </Link>
          {restaurant.hasMenuPage ? (
            <Link
              href={`/menu/${restaurant.slug}?location=${restaurant.mallSlug}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-bfw-orange px-4 py-3 text-sm font-semibold text-white transition hover:bg-bfw-orange/90"
            >
              VIEW MENU
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-200 px-4 py-3 text-sm font-medium text-gray-500"
            >
              VIEW MENU
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
