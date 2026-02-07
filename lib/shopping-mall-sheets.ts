import type {
  GettingHere,
  MallRestaurant,
  MallSummary,
  MRTStation,
  OpeningHoursEntry,
  ParkingInfo,
  ShoppingMall,
} from "@/types/shopping-mall";
import { getMenuSlugsForSync } from "./menu-registry";

const SHOPPING_MALL_SPREADSHEET_ID =
  "1_cYc73Tsni6Sqtb1OX61TjoWwFtVx5BcXnsYFo1bZBM";
const DEFAULT_REVALIDATE_SECONDS =
  process.env.NODE_ENV === "development" ? 0 : 300;

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function toSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanCellText(value: string | undefined | null) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed;
}

function normalizeHeader(value: string) {
  return value.trim().replace(/:+$/, "").replace(/\s+/g, " ");
}

function splitList(value: string): string[] {
  const cleaned = cleanCellText(value);
  if (!cleaned) return [];
  return cleaned
    .split(/[\n,•|;]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function fetchSheetValues(spreadsheetId: string, rangeA1: string) {
  const apiKey = requireEnv("GOOGLE_SHEETS_API_KEY");
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      rangeA1,
    )}`,
  );
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), {
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS },
  });
  if (!response.ok) {
    throw new Error(
      `Google Sheets values request failed: ${response.status} ${response.statusText}`,
    );
  }

  const json = (await response.json()) as { values?: string[][] };
  return json.values ?? [];
}

function getMRTLineColor(lineCode: string): string {
  const colors: Record<string, string> = {
    NS: "#d42e12",
    EW: "#009645",
    CC: "#fa9e0d",
    DT: "#005ec4",
    NE: "#9900aa",
    TE: "#9d5b25",
    CG: "#009645",
    CE: "#fa9e0d",
  };
  return colors[lineCode.toUpperCase()] ?? "#666666";
}

function parseMRTStations(text: string): MRTStation[] {
  const stations: MRTStation[] = [];
  if (!text) return stations;

  // Match patterns like "City Hall (NS25/EW13) - 3 min walk" or "Promenade CC4/DT15 3 min walk"
  const lines = text.split(/[\n;]+/).filter(Boolean);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Extract station name and code
    const match = trimmed.match(
      /^([A-Za-z\s]+?)\s*[\(\[]?([A-Z]{2}\d+(?:\/[A-Z]{2}\d+)?)[\)\]]?\s*[-–]?\s*(.+)?$/i,
    );

    if (match) {
      const stationName = match[1].trim();
      const codes = match[2].split("/");
      const walkTime = match[3]?.trim() || "";

      for (const code of codes) {
        const lineMatch = code.match(/([A-Z]{2})(\d+)/i);
        if (lineMatch) {
          const lineCode = lineMatch[1].toUpperCase();
          stations.push({
            name: stationName,
            line: getLineName(lineCode),
            lineCode: code.toUpperCase(),
            lineColor: getMRTLineColor(lineCode),
            walkTime: walkTime || "Walking distance",
          });
        }
      }
    } else {
      // Simple format: just station name
      stations.push({
        name: trimmed.replace(/[-–]\s*\d+\s*min.*$/i, "").trim(),
        line: "",
        lineCode: "",
        lineColor: "#666666",
        walkTime: trimmed.match(/\d+\s*min/i)?.[0] || "",
      });
    }
  }

  return stations;
}

function getLineName(code: string): string {
  const names: Record<string, string> = {
    NS: "North-South Line",
    EW: "East-West Line",
    CC: "Circle Line",
    DT: "Downtown Line",
    NE: "North East Line",
    TE: "Thomson-East Coast Line",
    CG: "Changi Airport Branch",
    CE: "Circle Line Extension",
  };
  return names[code.toUpperCase()] ?? "";
}

function parseBusServices(text: string): string[] {
  if (!text) return [];
  // Extract bus numbers
  const buses = text.match(/\d+[A-Z]?/g) ?? [];
  return [...new Set(buses)];
}

function parseParkingInfo(text: string): ParkingInfo[] {
  const parking: ParkingInfo[] = [];
  if (!text) return parking;

  const lines = text.split(/[\n;]+/).filter(Boolean);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Try to parse "Mon-Fri: $2.60/hr" or similar
    const match = trimmed.match(/^(.+?):\s*(.+)$/);
    if (match) {
      parking.push({
        period: match[1].trim(),
        rate: match[2].trim(),
      });
    } else {
      parking.push({
        period: "General",
        rate: trimmed,
      });
    }
  }

  return parking;
}

function parseOpeningHours(text: string): OpeningHoursEntry[] {
  const hours: OpeningHoursEntry[] = [];
  if (!text) return hours;

  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "Asia/Singapore",
  });

  // Try to parse structured format
  const lines = text.split(/[\n;]+/).filter(Boolean);

  for (const line of lines) {
    const trimmed = line.trim();
    // Match "Monday: 10:00 AM - 10:00 PM" or "Mon-Sun: 10am-10pm"
    const match = trimmed.match(/^([A-Za-z\-\s]+?):\s*(.+)$/);
    if (match) {
      const dayPart = match[1].trim();
      const timePart = match[2].trim();

      // Check if it's a range like "Mon-Sun"
      const rangeMatch = dayPart.match(/^(\w+)\s*[-–to]+\s*(\w+)$/i);
      if (rangeMatch) {
        const startDay = rangeMatch[1];
        const endDay = rangeMatch[2];
        const startIndex = dayNames.findIndex((d) =>
          d.toLowerCase().startsWith(startDay.toLowerCase().slice(0, 3)),
        );
        const endIndex = dayNames.findIndex((d) =>
          d.toLowerCase().startsWith(endDay.toLowerCase().slice(0, 3)),
        );

        if (startIndex !== -1 && endIndex !== -1) {
          for (let i = startIndex; i !== (endIndex + 1) % 7; i = (i + 1) % 7) {
            hours.push({
              day: dayNames[i],
              hours: timePart,
              isToday: dayNames[i] === today,
            });
            if (i === endIndex) break;
          }
        }
      } else {
        // Single day
        const dayIndex = dayNames.findIndex((d) =>
          d.toLowerCase().startsWith(dayPart.toLowerCase().slice(0, 3)),
        );
        if (dayIndex !== -1) {
          hours.push({
            day: dayNames[dayIndex],
            hours: timePart,
            isToday: dayNames[dayIndex] === today,
          });
        }
      }
    }
  }

  // If no structured hours found, assume same hours for all days
  if (hours.length === 0 && text) {
    for (const day of dayNames) {
      hours.push({
        day,
        hours: text.trim(),
        isToday: day === today,
      });
    }
  }

  return hours;
}

// Convert slug to display name (e.g., "suntec-city" -> "Suntec City")
function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// --- URL Tab Parser ---
export async function fetchMallList(): Promise<MallSummary[]> {
  const values = await fetchSheetValues(
    SHOPPING_MALL_SPREADSHEET_ID,
    "URLs!A:E",
  );

  if (values.length === 0) return [];

  const malls: MallSummary[] = [];

  // The URLs tab has URLs in column A, starting from row 1 (header) or row 2
  for (const row of values) {
    const cellValue = cleanCellText(row[0]);
    if (!cellValue) continue;

    // Extract slug from URL pattern: /shopping-malls/[slug]/
    const urlMatch = cellValue.match(/\/shopping-malls\/([^\/]+)\/?$/);
    if (!urlMatch) continue;

    const slug = urlMatch[1];
    // Skip the main "shopping-malls" page URL
    if (!slug || slug === "shopping-malls") continue;

    const name = slugToName(slug);

    malls.push({
      slug,
      name,
      imageUrl: "",
      region: "",
      restaurantCount: 0,
    });
  }

  return malls;
}

// Mall name mapping for common abbreviations (header -> slug)
const MALL_NAME_MAP: Record<string, string> = {
  mbs: "marina-bay-sands",
  "marina bay sands": "marina-bay-sands",
  "velocity@novena": "velocity-novena-square",
  "velocity novena": "velocity-novena-square",
  "the woodleigh mall": "woodleigh-mall",
  woodleigh: "woodleigh-mall",
  nex: "nex",
  "imm outlet mall": "imm",
  imm: "imm",
};

// Reverse mapping (slug -> possible header names)
const SLUG_TO_HEADERS: Record<string, string[]> = {
  "marina-bay-sands": ["Marina Bay Sands", "MBS", "marina bay sands"],
  "velocity-novena-square": [
    "Velocity@Novena",
    "Velocity Novena",
    "velocity novena square",
  ],
  "woodleigh-mall": ["Woodleigh Mall", "The Woodleigh Mall", "Woodleigh"],
  imm: ["IMM", "IMM Outlet Mall"],
};

// --- Full Info Tab Parser ---
// The Full info sheet has mall names as column headers, with restaurant data in rows
export async function fetchMallDetails(
  slug: string,
): Promise<ShoppingMall | null> {
  // For now, return a basic mall object since Full info doesn't have mall details
  // Mall details would come from the "Full info" tab but it's structured as restaurant data per mall column
  const name = slugToName(slug);

  return {
    id: slug,
    slug,
    name,
    description: `Discover the best restaurants and dining options at ${name}. Browse our comprehensive directory of food places.`,
    heroImageUrl: "",
    address: "",
    openingHours: [
      { day: "Monday", hours: "10:00 AM - 10:00 PM" },
      { day: "Tuesday", hours: "10:00 AM - 10:00 PM" },
      { day: "Wednesday", hours: "10:00 AM - 10:00 PM" },
      { day: "Thursday", hours: "10:00 AM - 10:00 PM" },
      { day: "Friday", hours: "10:00 AM - 10:00 PM" },
      { day: "Saturday", hours: "10:00 AM - 10:00 PM" },
      { day: "Sunday", hours: "10:00 AM - 10:00 PM" },
    ],
    gettingHere: { mrt: [], bus: [], parking: [] },
    restaurantCount: 0,
  };
}

// Parse restaurant info from cell text like "Name: [name] Cuisine: [type] Reviews: [rating] ([count]) ..."
function parseRestaurantInfo(text: string): {
  name?: string;
  cuisine?: string[];
  rating?: number;
  reviewCount?: number;
  address?: string;
  phone?: string;
  openingHours?: string;
  website?: string;
  imageUrl?: string;
  diningStyle?: string[];
  priceRange?: string;
  unit?: string;
} {
  if (!text) return {};

  const labels = [
    "Name",
    "Cuisine",
    "Reviews",
    "Address",
    "Phone",
    "Price",
    "Opening Hours",
    "Weekly Schedule",
    "Website",
    "Image URL",
    "Dining Style",
    "Unit",
  ];

  const extract = (label: string): string | undefined => {
    const startMatch = text.match(new RegExp(`${label}\\s*:\\s*`, "i"));
    if (!startMatch || startMatch.index === undefined) return undefined;
    const start = startMatch.index + startMatch[0].length;

    const remaining = text.slice(start);
    const nextLabelRegex = new RegExp(
      `\\b(?:${labels.filter((l) => l.toLowerCase() !== label.toLowerCase()).join("|")})\\s*:`,
      "i",
    );
    const nextMatch = remaining.match(nextLabelRegex);
    const end =
      nextMatch && nextMatch.index !== undefined
        ? start + nextMatch.index
        : text.length;
    return text.slice(start, end).trim();
  };

  const name = extract("Name");
  const cuisineText = extract("Cuisine");
  const reviewsText = extract("Reviews") || "";
  const address = extract("Address");
  const phone = extract("Phone");
  const priceRange = extract("Price");
  const openingHours = extract("Opening Hours") || extract("Weekly Schedule");
  const website = extract("Website");
  const imageUrl = extract("Image URL");
  const diningStyleText = extract("Dining Style");
  const unit = extract("Unit");

  // Parse rating and review count from "4.5 (123)" format
  const ratingMatch = reviewsText.match(/([\d.]+)/);
  const countMatch = reviewsText.match(/\((\d+)\)/);

  return {
    name,
    cuisine: cuisineText ? splitList(cuisineText) : undefined,
    rating: ratingMatch ? parseFloat(ratingMatch[1]) : undefined,
    reviewCount: countMatch ? parseInt(countMatch[1], 10) : undefined,
    address,
    phone,
    openingHours,
    website,
    imageUrl,
    diningStyle: diningStyleText ? splitList(diningStyleText) : undefined,
    priceRange,
    unit,
  };
}

// --- Mall Restaurants Parser ---
// The Full info sheet has mall names as column headers, restaurant data in rows
export async function fetchMallRestaurants(
  mallSlug: string,
): Promise<MallRestaurant[]> {
  // Fetch menu page slugs from shared registry and sheet data in parallel
  const [menuSlugs, values] = await Promise.all([
    getMenuSlugsForSync(),
    fetchSheetValues(SHOPPING_MALL_SPREADSHEET_ID, "Full info!A:Z"),
  ]);

  if (values.length < 2) return [];

  // Row 1 contains mall names as headers
  const headers = values[0] ?? [];

  // Find the column index for this mall
  let columnIndex = -1;

  // 1. First, try exact slug match
  columnIndex = headers.findIndex((h) => toSlug(h) === mallSlug);

  // 2. Try using SLUG_TO_HEADERS mapping
  if (columnIndex < 0 && SLUG_TO_HEADERS[mallSlug]) {
    const possibleHeaders = SLUG_TO_HEADERS[mallSlug];
    columnIndex = headers.findIndex((h) =>
      possibleHeaders.some(
        (ph) =>
          h.toLowerCase() === ph.toLowerCase() || toSlug(h) === toSlug(ph),
      ),
    );
  }

  // 3. Try partial matching
  if (columnIndex < 0) {
    const mallNameLower = mallSlug.replace(/-/g, " ").toLowerCase();
    columnIndex = headers.findIndex(
      (h) =>
        h.toLowerCase().includes(mallNameLower) ||
        mallNameLower.includes(h.toLowerCase()),
    );
  }

  // 4. Try fuzzy matching on slug
  if (columnIndex < 0) {
    columnIndex = headers.findIndex((h) => {
      const hSlug = toSlug(h);
      return hSlug.includes(mallSlug) || mallSlug.includes(hSlug);
    });
  }

  if (columnIndex < 0) {
    console.warn(
      `Mall column not found for slug: ${mallSlug}. Available headers:`,
      headers.slice(0, 10),
    );
    return [];
  }

  const restaurants: MallRestaurant[] = [];

  // Process each row (starting from row 2, which is index 1)
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const cellText = cleanCellText(row[columnIndex]);
    if (!cellText) continue;

    const info = parseRestaurantInfo(cellText);
    if (!info.name) continue;

    const slug = toSlug(info.name);

    // Check if this restaurant has a menu page
    const hasMenuPage = menuSlugs.has(slug);

    restaurants.push({
      id: `${mallSlug}-${slug}`,
      mallId: mallSlug,
      mallSlug,
      slug,
      name: info.name,
      unit: info.unit || "",
      imageUrl: info.imageUrl || "",
      rating: info.rating || 0,
      reviewCount: info.reviewCount || 0,
      priceRange: info.priceRange || "",
      cuisines: info.cuisine || [],
      diningStyles: info.diningStyle || [],
      description: "",
      openingHours: info.openingHours || "",
      phone: info.phone,
      website: info.website,
      diningOptions: [],
      hasMenuPage,
    });
  }

  return restaurants;
}

// --- All Malls with Details ---
export async function fetchAllMalls(): Promise<ShoppingMall[]> {
  const summaries = await fetchMallList();
  const malls: ShoppingMall[] = [];

  for (const summary of summaries) {
    const details = await fetchMallDetails(summary.slug);
    if (details) {
      details.restaurantCount = summary.restaurantCount;
      malls.push(details);
    } else {
      // Create basic mall from summary
      malls.push({
        id: summary.slug,
        slug: summary.slug,
        name: summary.name,
        description: "",
        heroImageUrl: summary.imageUrl,
        address: "",
        openingHours: [],
        gettingHere: { mrt: [], bus: [], parking: [] },
        restaurantCount: summary.restaurantCount,
        region: summary.region,
        badge: summary.badge,
      });
    }
  }

  return malls;
}
