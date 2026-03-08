import { createClient } from "@supabase/supabase-js";
import type { SingaporeArea } from "@/types/dining";
import type { CuisineRestaurant } from "@/app/cuisine/[slug]/data/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ---------------------------------------------------------------------------
// Slug → DB value mappings
// ---------------------------------------------------------------------------

export const CUISINE_SLUG_TO_DB_NAME: Record<string, string> = {
  american: "American",
  "bubble-tea": "Bubble Tea",
  cafe: "Cafe",
  chinese: "Chinese",
  dessert: "Dessert",
  european: "European",
  "fast-food": "Fast Food",
  "food-court": "Food Court",
  indian: "Indian",
  italian: "Italian",
  japanese: "Japanese",
  korean: "Korean",
  local: "Local",
  mediterranean: "Mediterranean",
  mexican: "Mexican",
  seafood: "Seafood",
  thai: "Thai",
  vietnamese: "Vietnamese",
  western: "Western",
};

export const DINING_SLUG_TO_DB_STYLE: Record<string, string> = {
  "casual-dining": "Casual Dining",
  "late-night": "Late Night Dining",
  "quick-bites": "Quick Bites",
  "family-friendly": "Family Friendly",
  romantic: "Romantic",
  "budget-friendly": "Budget-Friendly",
  "healthy-eating": "Healthy Eating",
};

// ---------------------------------------------------------------------------
// Region mapping
// ---------------------------------------------------------------------------

function mapRegionToArea(region: string | null): SingaporeArea {
  switch (region) {
    case "central":
      return "central";
    case "east":
      return "east";
    case "west":
      return "west";
    case "north":
      return "north";
    case "northeast":
      return "north-east";
    case "southwest":
      return "south";
    default:
      return "central";
  }
}

// ---------------------------------------------------------------------------
// Dirty dining_styles filter
// ---------------------------------------------------------------------------

function isCleanDiningStyle(style: string): boolean {
  if (style.length > 30) return false;
  if (/^#/.test(style)) return false;
  if (/^\d/.test(style)) return false;
  if (/Phone:|Reviews:|Website:|Address:/.test(style)) return false;
  if (/Singapore \d/.test(style)) return false;
  if (/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/.test(style))
    return false;
  return true;
}

// ---------------------------------------------------------------------------
// Row mapper
// ---------------------------------------------------------------------------

interface DbRow {
  slug: string;
  name: string;
  rating: number | null;
  review_count: number | null;
  description: string | null;
  hero_image_url: string | null;
  cuisines: string[] | null;
  dining_styles: string[] | null;
  opening_hours: string | null;
  phone: string | null;
  website: string | null;
  unit: string | null;
  has_menu_page: boolean | null;
  shopping_malls: { name: string; region: string | null } | null;
}

function mapRow(row: DbRow): CuisineRestaurant {
  const mallName = row.shopping_malls?.name ?? "";
  const region = row.shopping_malls?.region ?? null;
  const cleanStyles = (row.dining_styles ?? []).filter(isCleanDiningStyle);
  const primaryTag =
    cleanStyles[0] ?? (row.cuisines ?? [])[0] ?? "";

  return {
    id: row.slug ?? row.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
    name: row.name,
    rating: row.rating ?? 0,
    reviews: row.review_count ?? 0,
    location: mallName,
    tags: [...(row.cuisines ?? []).slice(0, 2), ...cleanStyles.slice(0, 1)].slice(0, 3),
    image: row.hero_image_url ?? "",
    description: row.description ?? "",
    area: mapRegionToArea(region),
    tag: primaryTag.toUpperCase(),
    address: row.unit ? `${row.unit}, ${mallName}, Singapore` : `${mallName}, Singapore`,
    phone: row.phone ?? "",
    hours: row.opening_hours ?? "",
    website: row.website ?? "",
  };
}

// ---------------------------------------------------------------------------
// Select columns
// ---------------------------------------------------------------------------

const SELECT_COLS = `
  slug,
  name,
  rating,
  review_count,
  description,
  hero_image_url,
  cuisines,
  dining_styles,
  opening_hours,
  phone,
  website,
  unit,
  has_menu_page,
  shopping_malls!inner ( name, region )
`;

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

export async function fetchRestaurantsByCuisine(
  slug: string,
): Promise<CuisineRestaurant[]> {
  const dbName = CUISINE_SLUG_TO_DB_NAME[slug];
  if (!dbName) return [];

  const { data, error } = await supabase
    .from("mall_restaurants")
    .select(SELECT_COLS)
    .contains("cuisines", [dbName])
    .order("rating", { ascending: false, nullsFirst: false });

  if (error) {
    console.error(`[supabase-cuisine] Error fetching cuisine ${slug}:`, error);
    return [];
  }

  return (data as unknown as DbRow[]).map(mapRow);
}

export async function fetchRestaurantsByDiningStyle(
  slug: string,
): Promise<CuisineRestaurant[]> {
  const dbStyle = DINING_SLUG_TO_DB_STYLE[slug];
  if (!dbStyle) return [];

  const { data, error } = await supabase
    .from("mall_restaurants")
    .select(SELECT_COLS)
    .contains("dining_styles", [dbStyle])
    .order("rating", { ascending: false, nullsFirst: false });

  if (error) {
    console.error(`[supabase-cuisine] Error fetching dining ${slug}:`, error);
    return [];
  }

  return (data as unknown as DbRow[]).map(mapRow);
}

// ---------------------------------------------------------------------------
// Hero images (Unsplash — preserved from static files)
// ---------------------------------------------------------------------------

export const CUISINE_HERO_IMAGES: Record<string, string[]> = {
  american: [
    "https://images.unsplash.com/photo-1551782450-17144efb9c50?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
  ],
  "bubble-tea": [
    "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1627998792088-f8016b438988?auto=format&fit=crop&w=800&q=80",
  ],
  cafe: [
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80",
  ],
  chinese: [
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534766438357-2b270dbd1b40?auto=format&fit=crop&w=800&q=80",
  ],
  dessert: [
    "https://images.unsplash.com/photo-1583182332473-b31ba08929c8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1605807646983-377bc5a76493?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
  ],
  european: [
    "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
  ],
  "fast-food": [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1619881590738-a111d176d906?auto=format&fit=crop&w=800&q=80",
  ],
  "food-court": [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  ],
  indian: [
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  ],
  italian: [
    "https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?auto=format&fit=crop&w=800&q=80",
  ],
  japanese: [
    "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=800&q=80",
  ],
  korean: [
    "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1635363638580-c2809d049eee?auto=format&fit=crop&w=800&q=80",
  ],
  local: [
    "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
  ],
  mediterranean: [
    "https://images.unsplash.com/photo-1530469912745-a215c6b256ea?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583161178154-c362b3459d29?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1573225342350-16731dd9bf3d?auto=format&fit=crop&w=800&q=80",
  ],
  mexican: [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584208632869-05fa2b2a5934?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=800&q=80",
  ],
  seafood: [
    "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
  ],
  thai: [
    "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80",
  ],
  vietnamese: [
    "https://images.unsplash.com/photo-1503764654157-72d979d9af2f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=80",
  ],
  western: [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=800&q=80",
  ],
};

// ---------------------------------------------------------------------------
// Meta config (taglines, features, otherCuisines — preserved from static files)
// ---------------------------------------------------------------------------

const CUISINE_IMAGE_MAP: Record<string, string> = {
  Japanese: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
  Chinese: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
  Korean: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80",
  Thai: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=800&q=80",
  Indian: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
  Italian: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=800&q=80",
  Western: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  European: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
};

interface CuisineMeta {
  tagline: string;
  features: string[];
  otherCuisines: { name: string; image: string; url: string }[];
}

function makeOther(names: string[]): { name: string; image: string; url: string }[] {
  return names.map((n) => ({
    name: n,
    image: CUISINE_IMAGE_MAP[n] ?? "",
    url: `/cuisine/${n.toLowerCase().replace(/\s+/g, "-")}`,
  }));
}

export const CUISINE_META: Record<string, CuisineMeta> = {
  american: {
    tagline: "From juicy burgers to premium steaks, find the best American food near you",
    features: ["Burgers", "Steaks", "Southern", "BBQ", "Diner Classics"],
    otherCuisines: makeOther(["Japanese", "Chinese", "Korean", "Thai", "Indian"]),
  },
  "bubble-tea": {
    tagline: "From classic milk tea to fruit tea, find the best bubble tea near you",
    features: ["Milk Tea", "Fruit Tea", "Brown Sugar", "Cheese Tea", "Fresh Milk"],
    otherCuisines: makeOther(["Japanese", "Korean", "Chinese", "Thai", "Western"]),
  },
  cafe: {
    tagline: "From artisanal coffee to brunch delights, find the best cafes near you",
    features: ["Specialty Coffee", "Artisanal Pastries", "Brunch Menus", "Cozy Ambience", "Wi-Fi Available"],
    otherCuisines: makeOther(["Japanese", "Chinese", "Western", "Thai", "Korean"]),
  },
  chinese: {
    tagline: "From dim sum to hot pot, find the best Chinese food near you",
    features: ["Dim Sum", "Hot Pot", "Roast Duck", "Dumplings", "Noodles"],
    otherCuisines: makeOther(["Japanese", "Korean", "Western", "Thai", "Italian"]),
  },
  dessert: {
    tagline: "From bubble tea to pastries, find the best desserts near you",
    features: ["Bubble Tea", "Cakes", "Ice Cream", "Pastries", "Cookies"],
    otherCuisines: makeOther(["Japanese", "Korean", "Chinese", "Western", "Thai"]),
  },
  european: {
    tagline: "From Italian pasta to French bistros, find the best European food near you",
    features: ["Italian", "French", "German", "Spanish", "Mediterranean"],
    otherCuisines: makeOther(["Japanese", "Chinese", "Indian", "Thai", "Korean"]),
  },
  "fast-food": {
    tagline: "From burgers to fried chicken, find the best fast food near you",
    features: ["Burgers", "Fried Chicken", "Fries", "Milkshakes", "Quick Service"],
    otherCuisines: makeOther(["Japanese", "Chinese", "Western", "Thai", "Italian"]),
  },
  "food-court": {
    tagline: "Discover the best food courts around the city offering a variety of local and international delights",
    features: ["Local Cuisine", "International Food", "Affordable Meals", "Quick Service", "Family Friendly"],
    otherCuisines: makeOther(["Chinese", "Japanese", "Western", "Thai", "Korean"]),
  },
  indian: {
    tagline: "From spicy curries to tandoori delights, find the best Indian food near you",
    features: ["North Indian", "South Indian", "Vegetarian", "Tandoori", "Biryani"],
    otherCuisines: makeOther(["Japanese", "Chinese", "European", "Thai", "Korean"]),
  },
  italian: {
    tagline: "From authentic pizzas to homemade pasta, find the best Italian food near you",
    features: ["Pasta", "Pizza", "Risotto", "Family Dining", "Romantic"],
    otherCuisines: makeOther(["Japanese", "Chinese", "Indian", "Thai", "Korean"]),
  },
  japanese: {
    tagline: "From sushi to ramen, find the best Japanese food near you",
    features: ["Sushi", "Ramen", "Yakiniku", "Tempura", "Tonkatsu"],
    otherCuisines: makeOther(["Korean", "Chinese", "Western", "Thai", "Italian"]),
  },
  korean: {
    tagline: "From BBQ to Bibimbap, find the best Korean food near you",
    features: ["BBQ", "Bibimbap", "Tteokbokki", "Kimchi", "Bingsu"],
    otherCuisines: makeOther(["Japanese", "Chinese", "Western", "Thai", "Italian"]),
  },
  local: {
    tagline: "From Chicken Rice to Laksa, find the best hawker foods near you",
    features: ["Kaya Toast", "Chicken Rice", "Bak Kut Teh", "Laksa", "Nasi Lemak"],
    otherCuisines: makeOther(["Japanese", "Chinese", "Western", "Thai", "Korean"]),
  },
  mediterranean: {
    tagline: "From kebabs to pita wraps, find the best Mediterranean food near you",
    features: ["Kebabs", "Pita Wraps", "Hummus", "Falafel", "Baklava"],
    otherCuisines: makeOther(["Japanese", "Chinese", "Western", "Thai", "Italian"]),
  },
  mexican: {
    tagline: "From tasty tacos to sizzling fajitas, find the best Mexican food near you",
    features: ["Tacos", "Burritos", "Quesadillas", "Enchiladas", "Nachos"],
    otherCuisines: makeOther(["Japanese", "Chinese", "Indian", "Thai", "Korean"]),
  },
  seafood: {
    tagline: "From fish to crab, find the best seafood dishes near you",
    features: ["Fish", "Crab", "Lobster", "Prawns", "Shellfish"],
    otherCuisines: makeOther(["Japanese", "Chinese", "Western", "Thai", "Italian"]),
  },
  thai: {
    tagline: "From spicy Tom Yum to delicious Pad Thai, find the best Thai food near you",
    features: ["Tom Yum", "Pad Thai", "Green Curry", "Som Tum", "Mango Sticky Rice"],
    otherCuisines: makeOther(["Japanese", "Chinese", "Indian", "European", "Korean"]),
  },
  vietnamese: {
    tagline: "From pho to banh mi, find the best Vietnamese food near you",
    features: ["Pho", "Banh Mi", "Rice Paper Rolls", "Bun Cha", "Coffee"],
    otherCuisines: makeOther(["Japanese", "Korean", "Chinese", "Thai", "Italian"]),
  },
  western: {
    tagline: "From steaks to pasta, find the best Western food near you",
    features: ["Steaks", "Burgers", "Pasta", "Pizza", "Seafood"],
    otherCuisines: makeOther(["Japanese", "Chinese", "Korean", "Thai", "Indian"]),
  },
};
