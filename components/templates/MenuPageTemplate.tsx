"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { BrandData, LocationInfo } from "@/types/brand";
import { AmenitiesGrid } from "@/components/sections/menu/AmenitiesGrid";
import { DescriptionSection } from "@/components/sections/menu/DescriptionSection";
import { ExclusiveCoupons } from "@/components/sections/menu/ExclusiveCoupons";
import { GoogleReviews } from "@/components/sections/menu/GoogleReviews";
import { HeroHeader } from "@/components/sections/menu/HeroHeader";
import { MapSection } from "@/components/sections/menu/MapSection";
import { MenuAccordion } from "@/components/sections/menu/MenuAccordion";
import { OpeningHoursCard } from "@/components/sections/menu/OpeningHoursCard";
import { PromotionsCarousel } from "@/components/sections/menu/PromotionsCarousel";
import { RecommendationsCard } from "@/components/sections/menu/RecommendationsCard";
import { RelatedBrands } from "@/components/sections/menu/RelatedBrands";
import { StoreInfoCard } from "@/components/sections/menu/StoreInfoCard";
import { VideoEmbed } from "@/components/sections/menu/VideoEmbed";

export interface MenuPageTemplateProps {
  brandData: BrandData;
  initialLocation?: string;
  cdnUrls?: Record<string, string>;
  dbReviews?: Array<{
    author: string;
    authorPhotoUrl?: string;
    authorProfileUrl?: string;
    rating: number;
    date: string;
    content: string;
    publishTime?: string;
  }>;
  dbRating?: number;
  dbReviewCount?: number;
  nutritionData?: Record<string, Record<string, unknown>>;
}

// Words that indicate scraped navigation links rather than food items
const NAV_JUNK_PATTERN =
  /^(home|about(\s+us)?|contact(\s+us)?|career|careers|outlet|outlets|menu|faq|login|sign\s*(up|in)|privacy|terms|blog|news|franchise)$/i;

function pickMenuItems(menu: BrandData["menu"], count: number) {
  const pool = menu
    .flatMap((category) =>
      category.items.map((item) => ({
        name: item.name,
        imageUrl: item.imageUrl,
      })),
    )
    .filter((item) => !NAV_JUNK_PATTERN.test(item.name.trim()));
  if (pool.length === 0) return [];

  // Spread picks across categories for variety (deterministic — no Math.random)
  const selected: string[] = [];
  const step = Math.max(1, Math.floor(pool.length / count));
  for (let i = 0; selected.length < count && i < pool.length; i += step) {
    const entry = pool[i];
    selected.push(
      entry.imageUrl ? `${entry.name} - ${entry.imageUrl}` : entry.name,
    );
  }

  return selected;
}

function pickLocation(
  brandData: BrandData,
  initialLocation?: string,
): LocationInfo | null {
  const locations = brandData.locations;
  if (locations.length === 0) return null;
  if (!initialLocation) return locations[0] ?? null;
  const normalized = initialLocation.trim().toLowerCase();
  return (
    locations.find((location) => location.slug === normalized) ??
    locations.find((location) => location.name.toLowerCase() === normalized) ??
    locations[0] ??
    null
  );
}

export function MenuPageTemplate({
  brandData,
  initialLocation,
  cdnUrls = {},
  dbReviews,
  dbRating,
  dbReviewCount,
  nutritionData,
}: MenuPageTemplateProps) {
  const pathname = usePathname();

  const [locationSlug, setLocationSlug] = useState(
    () =>
      pickLocation(brandData, initialLocation)?.slug ??
      brandData.locations[0]?.slug,
  );

  // On client mount, read ?location= from URL (SSG pages don't have it server-side)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLocation = params.get("location");
    if (urlLocation) {
      const matched = pickLocation(brandData, urlLocation);
      if (matched && matched.slug !== locationSlug) {
        setLocationSlug(matched.slug);
      }
    } else if (locationSlug) {
      window.history.replaceState(null, "", `${pathname}?location=${locationSlug}`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const location = useMemo(
    () => pickLocation(brandData, locationSlug),
    [brandData, locationSlug],
  );

  const description = useMemo(
    () => location?.description || brandData.description,
    [location, brandData.description],
  );
  const amenities = useMemo(
    () =>
      location?.amenities?.length ? location.amenities : brandData.amenities,
    [location, brandData.amenities],
  );
  const descriptionMissing = useMemo(
    () => location?.descriptionMissing ?? brandData.descriptionMissing ?? false,
    [location, brandData.descriptionMissing],
  );
  const amenitiesMissing = useMemo(
    () => location?.amenitiesMissing ?? brandData.amenitiesMissing ?? false,
    [location, brandData.amenitiesMissing],
  );
  const recommendations = useMemo(() => {
    const recs = brandData.recommendations;
    // If manual recommendations have image URLs, use them
    const hasImages = recs.some((r) => /https?:\/\//.test(r));
    if (recs.length > 0 && hasImages) return recs.slice(0, 3);
    // Prefer menu items with real images over text-only AI recommendations
    const menuPicks = pickMenuItems(brandData.menu, 3);
    if (menuPicks.length > 0) return menuPicks;
    // Fall back to text-only recommendations
    return recs.slice(0, 3);
  }, [brandData.recommendations, brandData.menu]);

  const MAIN_SECTIONS = [
    {
      key: "description",
      enabled: Boolean(description),
      render: () => (
        <DescriptionSection
          description={description ?? ""}
          isMissing={descriptionMissing}
        />
      ),
    },
    {
      key: "amenitiesFeatures",
      enabled: amenities.length > 0,
      render: () => (
        <AmenitiesGrid amenities={amenities} isMissing={amenitiesMissing} />
      ),
    },
    {
      key: "foodMenu",
      enabled: brandData.menu.length > 0,
      render: () => (
        <MenuAccordion categories={brandData.menu} cdnUrls={cdnUrls} nutritionData={nutritionData as never} />
      ),
    },
    {
      key: "mobileOpeningHours",
      enabled: Boolean(location?.openingHours),
      render: () => (
        <div className="lg:hidden">
          <OpeningHoursCard openingHours={location?.openingHours ?? ""} />
        </div>
      ),
    },
    {
      key: "mobileCoupons",
      enabled: (brandData.coupons ?? []).length > 0,
      render: () => (
        <div className="lg:hidden">
          <ExclusiveCoupons
            brandName={brandData.name}
            coupons={brandData.coupons ?? []}
          />
        </div>
      ),
    },
    {
      key: "googleMapDirections",
      enabled: Boolean(location?.address),
      render: () => (
        <MapSection
          brandName={brandData.name}
          address={location?.address ?? ""}
        />
      ),
    },
    {
      key: "youtubeVideo",
      enabled: Boolean(brandData.youtubeUrl),
      render: () => <VideoEmbed url={brandData.youtubeUrl ?? ""} />,
    },
    {
      key: "googleReviews",
      enabled:
        brandData.reviews.length > 0 ||
        (dbReviews != null && dbReviews.length > 0),
      render: () => (
        <GoogleReviews
          brandName={brandData.name}
          locationName={location?.name ?? "Location"}
          summary={
            location
              ? (brandData.reviews.find(
                  (review) => review.location === location.name,
                ) ?? brandData.reviews[0])
              : brandData.reviews[0]
          }
          dbReviews={dbReviews}
          dbRating={dbRating}
          dbReviewCount={dbReviewCount}
        />
      ),
    },
    {
      key: "moreRestaurants",
      enabled: Boolean(locationSlug),
      render: () => (
        <RelatedBrands
          items={(locationSlug && brandData.relatedBrands[locationSlug]) || []}
          title={`More in ${location?.name ?? "this mall"}`}
          cdnUrls={cdnUrls}
        />
      ),
    },
  ].filter((section) => section.enabled);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <HeroHeader brand={brandData} location={location} cdnUrls={cdnUrls} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="space-y-10">
            <div className="lg:hidden">
              <StoreInfoCard
                brand={brandData}
                location={location}
                initialLocation={locationSlug}
                cdnUrls={cdnUrls}
                onLocationChange={setLocationSlug}
              />
            </div>
            {MAIN_SECTIONS.map((section) => (
              <div key={section.key}>{section.render()}</div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="hidden lg:block">
            <StoreInfoCard
              brand={brandData}
              location={location}
              initialLocation={locationSlug}
              cdnUrls={cdnUrls}
              onLocationChange={setLocationSlug}
            />
          </div>
          {location?.openingHours && (
            <div className="hidden lg:block">
              <OpeningHoursCard openingHours={location.openingHours} />
            </div>
          )}
          {(brandData.coupons ?? []).length > 0 && (
            <div className="hidden lg:block">
              <ExclusiveCoupons
                brandName={brandData.name}
                coupons={brandData.coupons ?? []}
              />
            </div>
          )}
          <RecommendationsCard items={recommendations} cdnUrls={cdnUrls} />
          <PromotionsCarousel
            promotions={brandData.promotions}
            cdnUrls={cdnUrls}
          />
        </aside>
      </div>
    </div>
  );
}
