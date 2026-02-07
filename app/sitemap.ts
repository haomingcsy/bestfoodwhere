import { MetadataRoute } from "next";
import { fetchAllBrands } from "@/lib/google-sheets";

const BASE_URL = "https://bestfoodwhere.sg";

// Mall slugs from PopularShoppingMalls component
const MALL_SLUGS = [
  "suntec-city",
  "vivocity",
  "jewel",
  "nex",
  "imm",
  "plaza-singapura",
];

// Static pages with their change frequency and priority
const STATIC_PAGES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "", changeFrequency: "daily", priority: 1.0 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/our-story", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact-us", changeFrequency: "monthly", priority: 0.6 },
  { path: "/partnership", changeFrequency: "monthly", priority: 0.6 },
  { path: "/advertise", changeFrequency: "monthly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/careers", changeFrequency: "weekly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/shopping-malls", changeFrequency: "weekly", priority: 0.8 },
  {
    path: "/postal-code-food-finder",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  { path: "/promotions-and-deals", changeFrequency: "daily", priority: 0.8 },
  { path: "/listing", changeFrequency: "daily", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/recipes", changeFrequency: "weekly", priority: 0.6 },
  { path: "/cuisine", changeFrequency: "weekly", priority: 0.7 },
  { path: "/dining", changeFrequency: "weekly", priority: 0.7 },
];

function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Fetch all brands from Google Sheets
  let brands: Awaited<ReturnType<typeof fetchAllBrands>> = [];
  try {
    brands = await fetchAllBrands();
  } catch (error) {
    console.error("Failed to fetch brands for sitemap:", error);
  }

  // Static pages
  const staticPages: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Restaurant/Menu pages (highest value pages)
  const menuPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${BASE_URL}/menu/${brand.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Extract unique cuisines from all brands
  const cuisineSet = new Set<string>();
  brands.forEach((brand) => {
    brand.locations.forEach((location) => {
      location.cuisine?.forEach((c) => {
        if (c && c.trim()) {
          cuisineSet.add(toSlug(c));
        }
      });
    });
  });

  const cuisinePages: MetadataRoute.Sitemap = Array.from(cuisineSet).map(
    (cuisineSlug) => ({
      url: `${BASE_URL}/cuisine/${cuisineSlug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
  );

  // Extract unique dining styles from all brands
  const diningStyleSet = new Set<string>();
  brands.forEach((brand) => {
    brand.locations.forEach((location) => {
      location.diningStyle?.forEach((d) => {
        if (d && d.trim()) {
          diningStyleSet.add(toSlug(d));
        }
      });
    });
  });

  const diningPages: MetadataRoute.Sitemap = Array.from(diningStyleSet).map(
    (diningSlug) => ({
      url: `${BASE_URL}/dining/${diningSlug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
  );

  // Shopping mall pages
  const mallPages: MetadataRoute.Sitemap = MALL_SLUGS.map((mallSlug) => ({
    url: `${BASE_URL}/shopping-malls/${mallSlug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...menuPages,
    ...cuisinePages,
    ...diningPages,
    ...mallPages,
  ];
}
