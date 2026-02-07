/**
 * Fetch high-quality restaurant images from Google Places API
 *
 * This script:
 * 1. Gets restaurants from Google Sheets
 * 2. Searches Google Places API to get place_id
 * 3. Fetches photo references from Places API
 * 4. Constructs photo URLs and stores in Supabase
 *
 * Run with: npx tsx scripts/fetch-images.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  const lines = envContent.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    if (key && valueParts.length > 0) {
      process.env[key] = valueParts.join("=");
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_API_KEY =
  process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_SHEETS_API_KEY!;
const SPREADSHEET_ID = "198QKXG3B3StIEXYui17o1SmIEcpi1OsUbZGpaVFekhw";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Restaurant {
  mallName: string;
  mallSlug: string;
  name: string;
  restaurantSlug: string;
  address?: string;
}

interface PlaceSearchResult {
  place_id: string;
  name: string;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

async function fetchSheetData(): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Full%20info!A:Z?key=${GOOGLE_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.values || [];
}

// Extract field value - stops at next field label or end of string
function extractField(text: string, fieldName: string): string | undefined {
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

  const startMatch = text.match(new RegExp(`${fieldName}\\s*:\\s*`, "i"));
  if (!startMatch || startMatch.index === undefined) return undefined;
  const start = startMatch.index + startMatch[0].length;

  const remaining = text.slice(start);
  const nextLabelRegex = new RegExp(
    `\\b(?:${labels.filter((l) => l.toLowerCase() !== fieldName.toLowerCase()).join("|")})\\s*:`,
    "i",
  );
  const nextMatch = remaining.match(nextLabelRegex);
  const end =
    nextMatch && nextMatch.index !== undefined
      ? start + nextMatch.index
      : text.length;
  return text.slice(start, end).trim();
}

function parseRestaurants(rows: string[][]): Restaurant[] {
  const restaurants: Restaurant[] = [];
  if (rows.length < 2) return restaurants;

  const headers = rows[0] || [];

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];

    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const mallName = headers[colIndex];
      const cellValue = row[colIndex];

      if (!mallName || !cellValue) continue;

      // Parse restaurant info using field extraction
      const name = extractField(cellValue, "Name");
      const address = extractField(cellValue, "Address");

      if (name) {
        restaurants.push({
          mallName,
          mallSlug: toSlug(mallName),
          name,
          restaurantSlug: toSlug(name),
          address,
        });
      }
    }
  }

  return restaurants;
}

async function searchPlace(
  restaurant: Restaurant,
): Promise<PlaceSearchResult | null> {
  // Build search query with restaurant name and mall for better accuracy
  const query = restaurant.address
    ? `${restaurant.name} ${restaurant.address}`
    : `${restaurant.name} ${restaurant.mallName} Singapore`;

  // Use the new Places API (Text Search)
  const url = "https://places.googleapis.com/v1/places:searchText";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: "en",
        regionCode: "SG",
        maxResultCount: 1,
      }),
    });

    const data = await response.json();

    if (data.places?.[0]) {
      const place = data.places[0];
      return {
        place_id: place.id,
        name: place.displayName?.text || "",
        photos: place.photos?.map((p: { name: string }) => ({
          photo_reference: p.name, // This is the photo resource name
          height: 0,
          width: 0,
        })),
      };
    }

    // Fallback: try with just restaurant name
    if (!data.places || data.places.length === 0) {
      const fallbackResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_API_KEY,
          "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
        },
        body: JSON.stringify({
          textQuery: `${restaurant.name} restaurant Singapore`,
          languageCode: "en",
          regionCode: "SG",
          maxResultCount: 1,
        }),
      });

      const fallbackData = await fallbackResponse.json();

      if (fallbackData.places?.[0]) {
        const place = fallbackData.places[0];
        return {
          place_id: place.id,
          name: place.displayName?.text || "",
          photos: place.photos?.map((p: { name: string }) => ({
            photo_reference: p.name,
            height: 0,
            width: 0,
          })),
        };
      }
    }

    return null;
  } catch (error) {
    console.error(`  Error searching for place: ${error}`);
    return null;
  }
}

async function getRedirectedPhotoUrl(
  photoReference: string,
  maxWidth: number = 1200,
): Promise<string | null> {
  // For the new Places API, photoReference is the resource name like "places/xxx/photos/yyy"
  // The Places Photo endpoint redirects to a googleusercontent.com URL
  const placesUrl = `https://places.googleapis.com/v1/${photoReference}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_API_KEY}`;

  try {
    // Follow the redirect to get the final googleusercontent.com URL
    const response = await fetch(placesUrl, { redirect: "follow" });
    if (response.ok && response.url.includes("googleusercontent.com")) {
      return response.url;
    }
    return null;
  } catch (error) {
    console.error(`  Error getting photo URL: ${error}`);
    return null;
  }
}

async function getPhotoUrls(placeId: string): Promise<string[]> {
  // Get place details with photos field using new Places API
  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  try {
    const response = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "photos",
      },
    });
    const data = await response.json();

    if (data.photos) {
      // Get up to 5 photos and resolve their final URLs
      const photoPromises = data.photos
        .slice(0, 5)
        .map((photo: { name: string }) => getRedirectedPhotoUrl(photo.name));
      const urls = await Promise.all(photoPromises);
      return urls.filter((url): url is string => url !== null);
    }

    return [];
  } catch (error) {
    console.error(`  Error fetching place details: ${error}`);
    return [];
  }
}

async function upsertRestaurant(
  restaurant: Restaurant,
  placeId: string,
  heroImageUrl: string,
  photos: string[],
): Promise<boolean> {
  try {
    // First, get the mall_id
    const { data: mall } = await supabase
      .from("shopping_malls")
      .select("id")
      .eq("slug", restaurant.mallSlug)
      .single();

    if (!mall) {
      // Create mall if it doesn't exist
      const { data: newMall, error: mallError } = await supabase
        .from("shopping_malls")
        .insert({
          slug: restaurant.mallSlug,
          name: restaurant.mallName,
          is_active: true,
        })
        .select("id")
        .single();

      if (mallError) {
        console.error(`  Error creating mall: ${mallError.message}`);
        return false;
      }

      var mallId = newMall.id;
    } else {
      var mallId = mall.id;
    }

    // Upsert the restaurant
    const { error } = await supabase.from("mall_restaurants").upsert(
      {
        mall_id: mallId,
        slug: restaurant.restaurantSlug,
        name: restaurant.name,
        google_place_id: placeId,
        hero_image_url: heroImageUrl,
        photos: photos,
        is_active: true,
      },
      { onConflict: "mall_id,slug" },
    );

    if (error) {
      console.error(`  Error upserting restaurant: ${error.message}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`  Error in upsertRestaurant: ${error}`);
    return false;
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("🖼️  Google Places Image Fetcher");
  console.log("================================\n");

  // Validate env vars
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Missing Supabase credentials!");
    process.exit(1);
  }

  if (!GOOGLE_API_KEY) {
    console.error(
      "Missing Google API key! Set GOOGLE_PLACES_API_KEY or GOOGLE_SHEETS_API_KEY",
    );
    process.exit(1);
  }

  console.log("📊 Fetching restaurants from Google Sheets...");
  const rows = await fetchSheetData();
  console.log(`   Found ${rows.length} rows\n`);

  console.log("🔍 Parsing restaurants...");
  const restaurants = parseRestaurants(rows);
  console.log(`   Found ${restaurants.length} restaurants to process\n`);

  // Check for already processed restaurants
  const { data: existingRestaurants } = await supabase
    .from("mall_restaurants")
    .select("slug, mall_id, google_place_id")
    .not("google_place_id", "is", null);

  const existingSet = new Set(
    existingRestaurants?.map((r) => `${r.slug}`) || [],
  );

  console.log(`   ${existingSet.size} restaurants already have place_id\n`);

  let processed = 0;
  let failed = 0;
  let skipped = 0;

  // Process in batches to avoid rate limiting
  const BATCH_SIZE = 10;
  const BATCH_DELAY = 2000; // 2 seconds between batches

  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i];

    console.log(
      `[${i + 1}/${restaurants.length}] ${restaurant.name} (${restaurant.mallName})`,
    );

    // Skip if already processed
    if (existingSet.has(restaurant.restaurantSlug)) {
      console.log("  ⏭️  Already has place_id, skipping");
      skipped++;
      continue;
    }

    // Search for place
    const place = await searchPlace(restaurant);

    if (!place) {
      console.log("  ❌ Place not found");
      failed++;
      continue;
    }

    console.log(`  📍 Found place_id: ${place.place_id.slice(0, 20)}...`);

    // Get photo URLs (resolve redirects to get final googleusercontent.com URLs)
    let photos: string[] = [];
    if (place.photos && place.photos.length > 0) {
      // Use photos from search result - resolve redirects
      const photoPromises = place.photos
        .slice(0, 5)
        .map((p) => getRedirectedPhotoUrl(p.photo_reference));
      const urls = await Promise.all(photoPromises);
      photos = urls.filter((url): url is string => url !== null);
    } else {
      // Fetch from place details
      photos = await getPhotoUrls(place.place_id);
    }

    if (photos.length === 0) {
      console.log("  ⚠️  No photos found");
      failed++;
      continue;
    }

    console.log(`  📸 Found ${photos.length} photos`);

    // Save to database
    const success = await upsertRestaurant(
      restaurant,
      place.place_id,
      photos[0], // First photo as hero image
      photos,
    );

    if (success) {
      console.log("  ✅ Saved to database");
      processed++;
    } else {
      failed++;
    }

    // Rate limiting - wait between requests
    if ((i + 1) % BATCH_SIZE === 0) {
      console.log(
        `\n⏳ Pausing ${BATCH_DELAY / 1000}s to avoid rate limits...\n`,
      );
      await sleep(BATCH_DELAY);
    } else {
      await sleep(200); // 200ms between individual requests
    }
  }

  console.log("\n================================");
  console.log("📈 Summary:");
  console.log(`   ✅ Processed: ${processed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Total: ${restaurants.length}`);
}

main().catch(console.error);
