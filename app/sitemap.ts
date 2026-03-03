import { MetadataRoute } from "next";
import { fetchAllBrandsWithLocationsSupabase } from "@/lib/supabase-menu";
import { MALLS_DATA } from "@/lib/mall-data";
import { getSupabaseRecipes } from "@/lib/supabase-recipes";

const BASE_URL = "https://bestfoodwhere.sg";

// Recipe category slugs (mirrors CATEGORY_KEYWORDS keys in lib/supabase-recipes.ts)
const RECIPE_CATEGORY_SLUGS = [
  "asian-cuisine",
  "italian-european",
  "chicken",
  "seafood",
  "beef-pork",
  "soups-stews",
  "rice-noodles",
  "curries-spiced",
  "quick-weeknight",
  "comfort-classics",
  "refreshments",
];

// Dining style pages (static routes under /dining/)
const DINING_STYLE_SLUGS = [
  "fine-dining",
  "casual-dining",
  "quick-bites",
  "late-night",
];

// Static pages with their change frequency and priority
const STATIC_PAGES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/about", changeFrequency: "monthly", priority: 0.3 },
  { path: "/our-story", changeFrequency: "monthly", priority: 0.3 },
  { path: "/contact-us", changeFrequency: "monthly", priority: 0.3 },
  { path: "/partnership", changeFrequency: "monthly", priority: 0.3 },
  { path: "/advertise", changeFrequency: "monthly", priority: 0.3 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.3 },
  { path: "/careers", changeFrequency: "monthly", priority: 0.3 },
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
  { path: "/cuisine/all", changeFrequency: "weekly", priority: 0.7 },
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

  // Fetch all brands and recipes from Supabase in parallel
  let brands: Awaited<ReturnType<typeof fetchAllBrandsWithLocationsSupabase>> =
    [];
  let recipes: Awaited<ReturnType<typeof getSupabaseRecipes>> = [];

  try {
    [brands, recipes] = await Promise.all([
      fetchAllBrandsWithLocationsSupabase(),
      getSupabaseRecipes({ limit: 500 }),
    ]);
  } catch (error) {
    console.error("Failed to fetch data for sitemap:", error);
  }

  // ------------------------------------------------------------------
  // 1. Static pages
  // ------------------------------------------------------------------
  const staticPages: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // ------------------------------------------------------------------
  // 2. Menu pages (/menu/{slug}) — highest-value pages
  // ------------------------------------------------------------------
  const menuPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${BASE_URL}/menu/${brand.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // ------------------------------------------------------------------
  // 3. Per-location pages (/menu/{slug}/{location})
  // ------------------------------------------------------------------
  const locationPages: MetadataRoute.Sitemap = [];
  for (const brand of brands) {
    for (const loc of brand.locations) {
      if (loc.slug) {
        locationPages.push({
          url: `${BASE_URL}/menu/${brand.slug}/${loc.slug}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        });
      }
    }
  }

  // ------------------------------------------------------------------
  // 4. Shopping mall pages (/shopping-malls/{slug}) — all 19 malls
  // ------------------------------------------------------------------
  const mallPages: MetadataRoute.Sitemap = MALLS_DATA.map((mall) => ({
    url: `${BASE_URL}/shopping-malls/${mall.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // ------------------------------------------------------------------
  // 5. Cuisine pages (/cuisine/{slug}) — derived from brand data
  // ------------------------------------------------------------------
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
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }),
  );

  // ------------------------------------------------------------------
  // 6. Dining style pages (/dining/{slug})
  //    Combine known static routes + dynamically discovered styles
  // ------------------------------------------------------------------
  const diningStyleSet = new Set<string>(DINING_STYLE_SLUGS);
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
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }),
  );

  // ------------------------------------------------------------------
  // 7. Recipe category pages (/recipes/{category})
  // ------------------------------------------------------------------
  const recipeCategoryPages: MetadataRoute.Sitemap = RECIPE_CATEGORY_SLUGS.map(
    (catSlug) => ({
      url: `${BASE_URL}/recipes/${catSlug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }),
  );

  // ------------------------------------------------------------------
  // 8. Individual recipe pages (/recipes/{category}/{slug})
  // ------------------------------------------------------------------
  const recipePages: MetadataRoute.Sitemap = recipes
    .filter((r) => r.wp_slug)
    .map((r) => {
      // Infer category the same way the app does
      const searchText =
        `${r.title} ${r.description || ""} ${r.introduction || ""}`.toLowerCase();
      let bestCategory = "general";
      let maxScore = 0;

      const categoryKeywords: Record<string, string[]> = {
        "asian-cuisine": [
          "korean",
          "japanese",
          "chinese",
          "thai",
          "vietnamese",
          "asian",
          "stir-fry",
          "wok",
        ],
        "italian-european": [
          "italian",
          "pasta",
          "risotto",
          "pizza",
          "mediterranean",
          "french",
          "european",
        ],
        chicken: ["chicken", "poultry", "wings", "drumstick"],
        seafood: ["fish", "salmon", "shrimp", "prawn", "crab", "seafood"],
        "beef-pork": ["beef", "pork", "steak", "bacon", "ribs", "brisket"],
        "soups-stews": ["soup", "stew", "broth", "chowder"],
        "rice-noodles": [
          "rice",
          "noodle",
          "fried rice",
          "biryani",
          "pad thai",
        ],
        "curries-spiced": [
          "curry",
          "spice",
          "masala",
          "tikka",
          "tandoori",
          "rendang",
          "laksa",
        ],
        "quick-weeknight": [
          "quick",
          "easy",
          "15-minute",
          "20-minute",
          "30-minute",
          "weeknight",
        ],
        "comfort-classics": [
          "comfort",
          "classic",
          "homestyle",
          "traditional",
        ],
        refreshments: [
          "drink",
          "smoothie",
          "juice",
          "cocktail",
          "beverage",
        ],
      };

      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        let score = 0;
        for (const keyword of keywords) {
          if (searchText.includes(keyword)) score++;
        }
        if (score > maxScore) {
          maxScore = score;
          bestCategory = category;
        }
      }

      return {
        url: `${BASE_URL}/recipes/${bestCategory}/${r.wp_slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      };
    });

  return [
    ...staticPages,
    ...menuPages,
    ...locationPages,
    ...mallPages,
    ...cuisinePages,
    ...diningPages,
    ...recipeCategoryPages,
    ...recipePages,
  ];
}
