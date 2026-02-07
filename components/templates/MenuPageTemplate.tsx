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
}

function pickRandomMenuItems(menu: BrandData["menu"], count: number) {
  const pool = menu.flatMap((category) =>
    category.items.map((item) => ({
      name: item.name,
      imageUrl: item.imageUrl,
    })),
  );
  if (pool.length === 0) return [];

  const selected: string[] = [];
  const used = new Set<number>();

  while (selected.length < Math.min(count, pool.length)) {
    const index = Math.floor(Math.random() * pool.length);
    if (used.has(index)) continue;
    used.add(index);
    const entry = pool[index];
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
}: MenuPageTemplateProps) {
  const location = pickLocation(brandData, initialLocation);
  const locationSlug = location?.slug ?? undefined;
  const description = location?.description || brandData.description;
  const amenities = location?.amenities?.length
    ? location.amenities
    : brandData.amenities;
  const descriptionMissing =
    location?.descriptionMissing ?? brandData.descriptionMissing ?? false;
  const amenitiesMissing =
    location?.amenitiesMissing ?? brandData.amenitiesMissing ?? false;
  const recommendations = pickRandomMenuItems(brandData.menu, 3);

  const MAIN_SECTIONS = [
    {
      key: "description",
      enabled: Boolean(description) || descriptionMissing,
      render: () => (
        <DescriptionSection
          description={description ?? ""}
          isMissing={descriptionMissing}
        />
      ),
    },
    {
      key: "amenitiesFeatures",
      enabled: amenities.length > 0 || amenitiesMissing,
      render: () => (
        <AmenitiesGrid amenities={amenities} isMissing={amenitiesMissing} />
      ),
    },
    {
      key: "foodMenu",
      enabled: brandData.menu.length > 0,
      render: () => (
        <MenuAccordion categories={brandData.menu} cdnUrls={cdnUrls} />
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
      enabled: brandData.reviews.length > 0,
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
        />
      ),
    },
    {
      key: "moreBakeries",
      enabled: Boolean(locationSlug),
      render: () => (
        <RelatedBrands
          items={(locationSlug && brandData.relatedBrands[locationSlug]) || []}
          title={`More bakeries in ${location?.name ?? "this mall"} you might like`}
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
            />
          </div>
          <OpeningHoursCard openingHours={location?.openingHours ?? ""} />
          <ExclusiveCoupons
            brandName={brandData.name}
            coupons={brandData.coupons ?? []}
          />
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
