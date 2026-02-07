/**
 * Fix specific restaurants that have logo images instead of food photos
 * This script targets known chains where Google Places returns a logo as the first photo
 *
 * Run with: npx tsx scripts/fix-logo-restaurants.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex);
      const value = trimmed.substring(eqIndex + 1);
      process.env[key] = value;
    }
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const GOOGLE_API_KEY =
  process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_SHEETS_API_KEY!;

// Restaurants known to have logo as first photo - use photo index 1+ instead
const LOGO_FIRST_RESTAURANTS = [
  "pastamania",
  // Add more as discovered
];

interface PlaceResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  photos?: Array<{ name: string }>;
}

async function getPhotoUrl(
  photoReference: string,
  maxWidth: number = 1200,
): Promise<string | null> {
  const placesUrl = `https://places.googleapis.com/v1/${photoReference}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(placesUrl, { redirect: "follow" });
    if (response.ok && response.url.includes("googleusercontent.com")) {
      return response.url;
    }
    return null;
  } catch (error) {
    console.error(`  Error getting photo URL:`, error);
    return null;
  }
}

async function searchAndGetAlternatePhoto(
  restaurantName: string,
  mallName: string,
): Promise<string | null> {
  const url = "https://places.googleapis.com/v1/places:searchText";

  const query = `${restaurantName} ${mallName} Singapore`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.photos",
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: "en",
        regionCode: "SG",
        maxResultCount: 1,
      }),
    });

    const data = await response.json();

    if (!data.places || data.places.length === 0) return null;

    const place = data.places[0] as PlaceResult;
    if (!place.photos || place.photos.length < 2) return null;

    // Try photos at index 1, 2, 3 (skipping the logo at index 0)
    for (let i = 1; i < Math.min(place.photos.length, 4); i++) {
      const photoUrl = await getPhotoUrl(place.photos[i].name);
      if (photoUrl) {
        console.log(`  Using photo index ${i}`);
        return photoUrl;
      }
    }

    return null;
  } catch (error) {
    console.error(`  Error searching:`, error);
    return null;
  }
}

async function main() {
  console.log("=== Fixing Logo-First Restaurants ===\n");

  // Build the filter pattern
  const pattern = LOGO_FIRST_RESTAURANTS.map((r) => `%${r}%`);

  // Get all restaurants matching the logo-first patterns
  let allRestaurants: Array<{
    id: string;
    name: string;
    mall_name: string;
  }> = [];

  for (const p of pattern) {
    const { data: restaurants, error } = await supabase
      .from("mall_restaurants")
      .select(
        `
        id,
        name,
        shopping_malls!inner(name)
      `,
      )
      .ilike("name", p);

    if (error) {
      console.error("Error fetching restaurants:", error);
      continue;
    }

    if (restaurants) {
      for (const r of restaurants) {
        allRestaurants.push({
          id: r.id,
          name: r.name,
          mall_name: Array.isArray(r.shopping_malls)
            ? ((r.shopping_malls[0] as { name: string } | undefined)?.name ??
              "Unknown")
            : ((r.shopping_malls as { name: string } | null)?.name ??
              "Unknown"),
        });
      }
    }
  }

  console.log(`Found ${allRestaurants.length} restaurants to fix\n`);

  let updated = 0;
  let failed = 0;

  for (const restaurant of allRestaurants) {
    process.stdout.write(`${restaurant.name} @ ${restaurant.mall_name}... `);

    const photoUrl = await searchAndGetAlternatePhoto(
      restaurant.name,
      restaurant.mall_name,
    );

    if (photoUrl) {
      const { error: updateError } = await supabase
        .from("mall_restaurants")
        .update({ hero_image_url: photoUrl })
        .eq("id", restaurant.id);

      if (updateError) {
        console.log(`FAILED: ${updateError.message}`);
        failed++;
      } else {
        console.log("OK");
        updated++;
      }
    } else {
      console.log("NO ALTERNATE PHOTO");
      failed++;
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log("\n=== SUMMARY ===");
  console.log(`Updated: ${updated}`);
  console.log(`Failed: ${failed}`);
}

main().catch(console.error);
