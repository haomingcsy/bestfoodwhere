import type { Metadata } from "next";
import type { BrandData, LocationInfo } from "@/types/brand";

const BASE_URL = "https://bestfoodwhere.sg";
const SITE_NAME = "BestFoodWhere";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og/default.jpg`;

/**
 * Default metadata configuration
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Best Food Near You | Discover Singapore's #1 Food Directory",
    template: "%s | BestFoodWhere.sg",
  },
  description:
    "Find the best restaurants, cafes, and food spots in Singapore shopping malls. Browse menus, reviews, opening hours, and exclusive deals at BestFoodWhere.",
  keywords: [
    "Singapore food",
    "restaurant directory",
    "shopping mall food",
    "Singapore restaurants",
    "food near me",
    "best restaurants Singapore",
    "mall dining",
  ],
  authors: [{ name: "BestFoodWhere Team" }],
  creator: "BestFoodWhere",
  publisher: "BestFoodWhere",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_SG",
    url: BASE_URL,
    siteName: SITE_NAME,
    title: "Best Food Near You | Discover Singapore's #1 Food Directory",
    description:
      "Find the best restaurants, cafes, and food spots in Singapore shopping malls. Browse menus, reviews, opening hours, and exclusive deals.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "BestFoodWhere - Singapore Food Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Food Near You | Discover Singapore's #1 Food Directory",
    description:
      "Find the best restaurants, cafes, and food spots in Singapore shopping malls.",
    images: [DEFAULT_OG_IMAGE],
    creator: "@bestfoodwhere",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    // Add these when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

/**
 * Generate metadata for restaurant/menu pages
 */
export function generateMenuPageMetadata(
  brand: BrandData,
  location?: LocationInfo,
): Metadata {
  const primaryLocation = location || brand.locations[0];
  if (!primaryLocation) {
    return {
      title: brand.name,
      description: `View ${brand.name} menu and locations in Singapore.`,
    };
  }

  const cuisineText = primaryLocation.cuisine?.length
    ? primaryLocation.cuisine.slice(0, 3).join(", ")
    : "restaurant";

  const ratingText =
    primaryLocation.reviews?.rating > 0
      ? ` (${primaryLocation.reviews.rating}/5 from ${primaryLocation.reviews.count} reviews)`
      : "";

  const title = location
    ? `${brand.name} ${location.name} - Menu, Reviews & Hours`
    : `${brand.name} Menu & Locations in Singapore`;

  const description = location
    ? `View ${brand.name} menu, reviews${ratingText}, opening hours at ${location.name}. ${cuisineText} restaurant in Singapore.`
    : `Find ${brand.name} locations across Singapore. View full menu, prices, reviews, opening hours and directions. ${cuisineText} dining.`;

  const imageUrl =
    primaryLocation.heroImageUrl ||
    primaryLocation.imageUrl ||
    DEFAULT_OG_IMAGE;

  const canonicalUrl = `${BASE_URL}/menu/${brand.slug}${location ? `?location=${location.slug}` : ""}`;

  return {
    title,
    description,
    keywords: [
      brand.name,
      `${brand.name} menu`,
      `${brand.name} Singapore`,
      ...primaryLocation.cuisine,
      ...primaryLocation.diningStyle,
      "restaurant Singapore",
    ].filter(Boolean),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${brand.name} Restaurant`,
        },
      ],
      locale: "en_SG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * Generate metadata for cuisine category pages
 */
export function generateCuisinePageMetadata(
  cuisineName: string,
  cuisineSlug: string,
  restaurantCount?: number,
): Metadata {
  const countText = restaurantCount ? `${restaurantCount}+ ` : "";
  const title = `Best ${cuisineName} Restaurants in Singapore Malls`;
  const description = `Discover ${countText}${cuisineName.toLowerCase()} restaurants in Singapore shopping malls. Find menus, reviews, opening hours and locations.`;

  return {
    title,
    description,
    keywords: [
      `${cuisineName} restaurant Singapore`,
      `best ${cuisineName.toLowerCase()} Singapore`,
      `${cuisineName.toLowerCase()} food Singapore`,
      "Singapore mall restaurants",
    ],
    alternates: {
      canonical: `${BASE_URL}/cuisine/${cuisineSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/cuisine/${cuisineSlug}`,
      siteName: SITE_NAME,
      images: [
        {
          url: `${BASE_URL}/api/og?type=cuisine&cuisine=${encodeURIComponent(cuisineName)}`,
          width: 1200,
          height: 630,
          alt: `${cuisineName} Restaurants in Singapore`,
        },
      ],
      locale: "en_SG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Generate metadata for shopping mall pages
 */
export function generateMallPageMetadata(
  mallName: string,
  mallSlug: string,
  mallLocation?: string,
  restaurantCount?: number,
): Metadata {
  const countText = restaurantCount ? `${restaurantCount}+ ` : "";
  const locationText = mallLocation ? ` in ${mallLocation}` : "";
  const title = `${mallName} Food Directory - Restaurants & Cafes`;
  const description = `Explore ${countText}restaurants and cafes at ${mallName}${locationText}. Find menus, reviews, opening hours and the best dining spots.`;

  return {
    title,
    description,
    keywords: [
      `${mallName} restaurants`,
      `${mallName} food`,
      `${mallName} dining`,
      `food at ${mallName}`,
      "Singapore mall restaurants",
    ],
    alternates: {
      canonical: `${BASE_URL}/shopping-malls/${mallSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/shopping-malls/${mallSlug}`,
      siteName: SITE_NAME,
      images: [
        {
          url: `${BASE_URL}/api/og?type=mall&mall=${encodeURIComponent(mallName)}`,
          width: 1200,
          height: 630,
          alt: `${mallName} Food Directory`,
        },
      ],
      locale: "en_SG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Generate metadata for dining style pages
 */
export function generateDiningPageMetadata(
  diningStyle: string,
  diningSlug: string,
  restaurantCount?: number,
): Metadata {
  const countText = restaurantCount ? `${restaurantCount}+ ` : "";
  const title = `${diningStyle} Dining in Singapore Malls`;
  const description = `Find ${countText}${diningStyle.toLowerCase()} dining options in Singapore shopping malls. Browse restaurants, cafes, and food spots with menus and reviews.`;

  return {
    title,
    description,
    keywords: [
      `${diningStyle} Singapore`,
      `${diningStyle.toLowerCase()} dining Singapore`,
      "Singapore mall restaurants",
      "dining options Singapore",
    ],
    alternates: {
      canonical: `${BASE_URL}/dining/${diningSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/dining/${diningSlug}`,
      siteName: SITE_NAME,
      locale: "en_SG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Generate metadata for blog posts
 */
export function generateBlogPostMetadata(post: {
  title: string;
  excerpt: string;
  slug: string;
  featuredImage?: string;
  publishedAt?: string;
  author?: string;
}): Metadata {
  const title = post.title;
  const description = post.excerpt || `Read ${post.title} on BestFoodWhere.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/blog/${post.slug}`,
      siteName: SITE_NAME,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author || "BestFoodWhere Team"],
      images: post.featuredImage
        ? [
            {
              url: post.featuredImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : undefined,
      locale: "en_SG",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  };
}

/**
 * Generate static page metadata
 */
export function generateStaticPageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}${path}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}${path}`,
      siteName: SITE_NAME,
      locale: "en_SG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
