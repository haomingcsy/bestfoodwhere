import type { Metadata } from "next";
import type { BrandData, LocationInfo } from "@/types/brand";
import {
  composeMenuTitle,
  composeMenuDescription,
  composeMallTitle,
  composeMallDescription,
  composeCuisineTitle,
  composeCuisineDescription,
  composeDiningTitle,
  composeDiningDescription,
  type MenuDescInput,
  type MallDescInput,
  type CuisineDescInput,
  type DiningDescInput,
} from "./description-composer";
import aiPageDescriptions from "./ai-page-descriptions.json";

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

  // Extract menu highlights (first few popular item names, trimmed for SEO)
  const menuHighlights = brand.menu
    ?.flatMap((cat) => cat.items)
    .slice(0, 6)
    .map((item) => item.name)
    .filter(Boolean)
    .map((n) => {
      // Strip long descriptions after " - " (e.g. "Single Figure - Number-shaped celebration cake" → "Single Figure")
      if (n.length > 30) {
        const dash = n.indexOf(" - ");
        if (dash > 3 && dash < 30) return n.slice(0, dash);
      }
      // Strip parenthetical descriptions
      if (n.length > 30) {
        const paren = n.indexOf(" (");
        if (paren > 3 && paren < 30) return n.slice(0, paren);
      }
      return n;
    })
    .filter((n) => n.length <= 40)
    .slice(0, 3);

  const menuCategories = brand.menu?.map((cat) => cat.name).filter(Boolean);

  const input: MenuDescInput = {
    brandName: brand.name,
    slug: brand.slug,
    locationName: primaryLocation.name || location?.name,
    locationSlug: primaryLocation.slug || location?.slug,
    cuisines: primaryLocation.cuisine || [],
    diningStyles: primaryLocation.diningStyle || [],
    priceRange: primaryLocation.priceRange,
    rating: primaryLocation.reviews?.rating,
    reviewCount: primaryLocation.reviews?.count,
    menuCategories,
    menuHighlights,
    amenities: (primaryLocation.amenities || brand.amenities)?.map(
      (a) => a.label,
    ),
    address: primaryLocation.address,
    hasPromotions: (brand.promotions?.length ?? 0) > 0,
    description: brand.description,
    openingHours: primaryLocation.openingHours,
  };

  const title = composeMenuTitle(input);
  // Brand-level: use AI description. Location-specific: use AI location description or composed fallback.
  const description = location
    ? (location.aiDescription || composeMenuDescription(input))
    : (brand.seoDescription || composeMenuDescription(input));

  const imageUrl =
    primaryLocation.heroImageUrl ||
    primaryLocation.imageUrl ||
    DEFAULT_OG_IMAGE;

  const canonicalUrl = location
    ? `${BASE_URL}/menu/${brand.slug}/${location.slug}`
    : `${BASE_URL}/menu/${brand.slug}`;

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
  opts?: {
    restaurantCount?: number;
    mallCount?: number;
    tagline?: string;
    featuredRestaurants?: string[];
    featuredAreas?: string[];
    features?: string[];
  },
): Metadata {
  const input: CuisineDescInput = {
    cuisineName,
    slug: cuisineSlug,
    tagline: opts?.tagline,
    restaurantCount: opts?.restaurantCount,
    mallCount: opts?.mallCount,
    featuredRestaurants: opts?.featuredRestaurants,
    featuredAreas: opts?.featuredAreas,
    features: opts?.features,
  };

  const title = composeCuisineTitle(input);
  const description =
    (aiPageDescriptions as any).cuisines?.[cuisineSlug] ||
    composeCuisineDescription(input);

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
  opts?: {
    region?: string;
    address?: string;
    restaurantCount?: number;
    cuisineCount?: number;
    mrtStations?: { name: string; line: string; walkTime: string }[];
    topRestaurants?: string[];
    description?: string;
  },
): Metadata {
  const input: MallDescInput = {
    mallName,
    slug: mallSlug,
    region: opts?.region,
    address: opts?.address,
    restaurantCount: opts?.restaurantCount,
    cuisineCount: opts?.cuisineCount,
    mrtStations: opts?.mrtStations,
    topRestaurants: opts?.topRestaurants,
    description: opts?.description,
  };

  const title = composeMallTitle(input);
  const description =
    (aiPageDescriptions as any).malls?.[mallSlug] ||
    composeMallDescription(input);

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
  opts?: {
    restaurantCount?: number;
    featuredRestaurants?: string[];
    featuredAreas?: string[];
  },
): Metadata {
  const input: DiningDescInput = {
    styleName: diningStyle,
    slug: diningSlug,
    restaurantCount: opts?.restaurantCount,
    featuredRestaurants: opts?.featuredRestaurants,
    featuredAreas: opts?.featuredAreas,
  };

  const title = composeDiningTitle(input);
  const description =
    (aiPageDescriptions as any).dining?.[diningSlug] ||
    composeDiningDescription(input);

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
