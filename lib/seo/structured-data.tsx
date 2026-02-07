import type { BrandData, LocationInfo, MenuCategory } from "@/types/brand";

const BASE_URL = "https://bestfoodwhere.sg";

// Type definitions for JSON-LD schemas
export interface WithContext<T> {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

// Parse opening hours into schema.org format
function parseOpeningHoursSpecification(
  hoursString: string
): { "@type": "OpeningHoursSpecification"; dayOfWeek: string[]; opens: string; closes: string }[] {
  if (!hoursString) return [];

  const specs: { "@type": "OpeningHoursSpecification"; dayOfWeek: string[]; opens: string; closes: string }[] = [];

  // Common patterns: "Mon-Fri: 10am-9pm", "Daily: 11:00-22:00"
  const lines = hoursString.split(/[,\n;]+/).map(s => s.trim()).filter(Boolean);

  const dayMap: Record<string, string> = {
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    daily: "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
  };

  for (const line of lines) {
    const match = line.match(/([a-z]+(?:\s*[-–]\s*[a-z]+)?)\s*:?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*[-–]\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (match) {
      const [, dayPart, openTime, closeTime] = match;
      const dayKey = dayPart.toLowerCase().replace(/\s*[-–]\s*/, "-");

      let days: string[] = [];
      if (dayKey.includes("-")) {
        const [start, end] = dayKey.split("-");
        const startDay = dayMap[start] || start;
        const endDay = dayMap[end] || end;
        // Simplified: just use start and end
        days = [startDay, endDay];
      } else {
        const mappedDay = dayMap[dayKey];
        days = mappedDay ? mappedDay.split(",") : [dayKey];
      }

      // Convert to 24h format
      const to24h = (time: string): string => {
        const cleaned = time.toLowerCase().replace(/\s/g, "");
        const isPM = cleaned.includes("pm");
        const isAM = cleaned.includes("am");
        const numPart = cleaned.replace(/[apm]/g, "");

        let [hours, minutes = "00"] = numPart.split(":");
        let h = parseInt(hours, 10);

        if (isPM && h < 12) h += 12;
        if (isAM && h === 12) h = 0;

        return `${h.toString().padStart(2, "0")}:${minutes.padStart(2, "0")}`;
      };

      specs.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: days,
        opens: to24h(openTime),
        closes: to24h(closeTime),
      });
    }
  }

  return specs;
}

// Parse price to numeric value
function parsePrice(priceString?: string): number | undefined {
  if (!priceString) return undefined;
  const match = priceString.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : undefined;
}

/**
 * Generate Restaurant schema for a brand/location
 * Used on /menu/[slug] pages
 */
export function generateRestaurantSchema(
  brand: BrandData,
  location: LocationInfo
): WithContext<"Restaurant"> {
  const schema: WithContext<"Restaurant"> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${BASE_URL}/menu/${brand.slug}#restaurant`,
    name: brand.name,
    url: `${BASE_URL}/menu/${brand.slug}`,
    description: brand.description || `${brand.name} restaurant in Singapore`,
    image: location.imageUrl || location.heroImageUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address,
      addressLocality: "Singapore",
      addressCountry: "SG",
    },
    geo: {
      "@type": "GeoCoordinates",
      // Placeholder - would need geocoding service
      addressCountry: "SG",
    },
    telephone: location.phone,
    servesCuisine: location.cuisine,
    priceRange: location.priceRange || "$$",
  };

  // Add rating if available
  if (location.reviews?.rating > 0 && location.reviews?.count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: location.reviews.rating,
      reviewCount: location.reviews.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add opening hours if available
  if (location.openingHours) {
    const hoursSpec = parseOpeningHoursSpecification(location.openingHours);
    if (hoursSpec.length > 0) {
      schema.openingHoursSpecification = hoursSpec;
    }
  }

  // Add menu if available
  if (brand.menu && brand.menu.length > 0) {
    schema.hasMenu = generateMenuSchema(brand.menu, brand.slug);
  }

  // Add amenities as amenityFeature
  if (location.amenities && location.amenities.length > 0) {
    schema.amenityFeature = location.amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a.label,
      value: true,
    }));
  }

  // Add social links
  if (brand.socialLinks) {
    const sameAs: string[] = [];
    if (brand.socialLinks.facebook) sameAs.push(brand.socialLinks.facebook);
    if (brand.socialLinks.instagram) sameAs.push(brand.socialLinks.instagram);
    if (brand.socialLinks.linkedin) sameAs.push(brand.socialLinks.linkedin);
    if (sameAs.length > 0) {
      schema.sameAs = sameAs;
    }
  }

  return schema;
}

/**
 * Generate Menu schema
 */
export function generateMenuSchema(
  menuCategories: MenuCategory[],
  brandSlug: string
): WithContext<"Menu"> {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${BASE_URL}/menu/${brandSlug}#menu`,
    hasMenuSection: menuCategories.map((category) => ({
      "@type": "MenuSection",
      name: category.name,
      hasMenuItem: category.items.map((item) => ({
        "@type": "MenuItem",
        name: item.name,
        description: item.description,
        image: item.imageUrl,
        offers: item.price
          ? {
              "@type": "Offer",
              price: parsePrice(item.price),
              priceCurrency: "SGD",
            }
          : undefined,
      })),
    })),
  };
}

/**
 * Generate LocalBusiness schema (more general than Restaurant)
 */
export function generateLocalBusinessSchema(
  brand: BrandData,
  location: LocationInfo
): WithContext<"LocalBusiness"> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/menu/${brand.slug}#localbusiness`,
    name: brand.name,
    url: `${BASE_URL}/menu/${brand.slug}`,
    description: brand.description,
    image: location.imageUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address,
      addressLocality: "Singapore",
      addressCountry: "SG",
    },
    telephone: location.phone,
    priceRange: location.priceRange,
    aggregateRating:
      location.reviews?.rating > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: location.reviews.rating,
            reviewCount: location.reviews.count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
): WithContext<"BreadcrumbList"> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
): WithContext<"FAQPage"> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Organization schema for About page
 */
export function generateOrganizationSchema(): WithContext<"Organization"> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}#organization`,
    name: "BestFoodWhere",
    alternateName: "BFW",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/brand/logo.svg`,
      width: 200,
      height: 60,
    },
    description:
      "Singapore's most comprehensive food and restaurant directory for shopping mall dining",
    foundingDate: "2024",
    foundingLocation: {
      "@type": "Place",
      name: "Singapore",
    },
    areaServed: {
      "@type": "Country",
      name: "Singapore",
    },
    sameAs: [
      "https://www.facebook.com/bestfoodwhere",
      "https://www.instagram.com/bestfoodwhere",
      "https://www.linkedin.com/company/bestfoodwhere",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "hello@bestfoodwhere.sg",
      url: `${BASE_URL}/contact-us`,
    },
  };
}

/**
 * Generate WebSite schema for root layout (enables sitelinks search box)
 */
export function generateWebSiteSchema(): WithContext<"WebSite"> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}#website`,
    name: "BestFoodWhere",
    alternateName: "BFW",
    url: BASE_URL,
    description:
      "Singapore's most comprehensive food and restaurant directory for shopping mall dining",
    publisher: {
      "@id": `${BASE_URL}#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/listing?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-SG",
  };
}

/**
 * Generate ItemList schema for listing pages (malls, cuisines)
 */
export function generateItemListSchema(
  items: { name: string; url: string; image?: string; position?: number }[],
  listName: string
): WithContext<"ItemList"> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: item.position ?? index + 1,
      name: item.name,
      url: item.url,
      image: item.image,
    })),
  };
}

/**
 * Generate Article schema for blog posts
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}): WithContext<"Article"> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Person",
      name: article.author || "BestFoodWhere Team",
    },
    publisher: {
      "@id": `${BASE_URL}#organization`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  };
}

/**
 * Helper component to render JSON-LD script tag
 */
export function JsonLd({ data }: { data: WithContext<string> | WithContext<string>[] }) {
  const jsonString = JSON.stringify(Array.isArray(data) ? data : data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}
