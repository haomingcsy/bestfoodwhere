/**
 * Fix Sushi Tei image URLs in mall_restaurants table.
 *
 * The image_url field returns HTTP 403 (expired Google Places thumbnail).
 * This script fetches fresh photo URLs from Google Places API (New)
 * and updates both image_url (400px) and hero_image_url (800px).
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_PLACES_API_KEY =
  process.env.GOOGLE_PLACES_API_KEY || "AIzaSyAUU3CIdUUOe49DTiS5_i9GMe_mjIpC09c";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SUSHI_TEI_IDS = [
  "cb87f25b-4d9c-4214-8d92-59271ec9b3c3", // JEM
  "c70d279d-25ae-4c35-8258-9f3f8825b755", // VivoCity
  "436d6bb3-c7d4-4d18-a289-1676b71c4a20", // Jewel
];

async function main() {
  // Step 1: Query the 3 Sushi Tei records
  console.log("=== Fetching Sushi Tei mall_restaurant records ===\n");

  const { data: records, error: fetchError } = await supabase
    .from("mall_restaurants")
    .select("id, name, slug, google_place_id, image_url, hero_image_url, mall_id")
    .in("id", SUSHI_TEI_IDS);

  if (fetchError) {
    console.error("Error fetching records:", fetchError.message);
    process.exit(1);
  }

  if (!records || records.length === 0) {
    console.error("No records found for the given IDs.");
    process.exit(1);
  }

  console.log(`Found ${records.length} records:\n`);
  for (const r of records) {
    console.log(`  - ${r.name} (slug: ${r.slug})`);
    console.log(`    ID: ${r.id}`);
    console.log(`    google_place_id: ${r.google_place_id}`);
    console.log(`    Current image_url: ${r.image_url?.substring(0, 80)}...`);
    console.log(`    Current hero_image_url: ${r.hero_image_url?.substring(0, 80)}...`);
    console.log();
  }

  // Step 2: For each record, call Google Places API to get fresh photos
  console.log("=== Fetching fresh photos from Google Places API ===\n");

  for (const record of records) {
    if (!record.google_place_id) {
      console.log(
        `  SKIP: ${record.name} (${record.slug}) - no google_place_id`
      );
      continue;
    }

    const placeId = record.google_place_id;
    const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}?fields=photos&key=${GOOGLE_PLACES_API_KEY}`;

    console.log(`  Fetching photos for ${record.name} (${record.slug})...`);
    console.log(`    Place ID: ${placeId}`);

    const response = await fetch(detailsUrl);

    if (!response.ok) {
      console.error(
        `    ERROR: Places API returned ${response.status} ${response.statusText}`
      );
      const body = await response.text();
      console.error(`    Body: ${body.substring(0, 200)}`);
      continue;
    }

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
      console.log(`    WARNING: No photos returned for this place.`);
      continue;
    }

    console.log(`    Found ${data.photos.length} photos.`);

    // Use the first photo reference
    const photoName = data.photos[0].name;
    console.log(`    Using photo: ${photoName}`);

    // Step 3: Get CDN URLs using skipHttpRedirect=true (returns photoUri)
    // image_url: 400px thumbnail
    const imgApiUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${GOOGLE_PLACES_API_KEY}&skipHttpRedirect=true`;
    console.log(`    Fetching CDN URL for image_url (400px)...`);
    const imgRes = await fetch(imgApiUrl);
    if (!imgRes.ok) {
      console.error(`    ERROR: Photo media API returned ${imgRes.status} for 400px`);
      const errText = await imgRes.text();
      console.error(`    ${errText.substring(0, 200)}`);
      continue;
    }
    const imgData = await imgRes.json();
    const imageUrl = imgData.photoUri;
    if (!imageUrl) {
      console.error(`    ERROR: No photoUri in 400px response`);
      continue;
    }
    console.log(`    -> CDN URL (400px): ${imageUrl.substring(0, 100)}...`);

    // hero_image_url: 800px
    const heroApiUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${GOOGLE_PLACES_API_KEY}&skipHttpRedirect=true`;
    console.log(`    Fetching CDN URL for hero_image_url (800px)...`);
    const heroRes = await fetch(heroApiUrl);
    if (!heroRes.ok) {
      console.error(`    ERROR: Photo media API returned ${heroRes.status} for 800px`);
      continue;
    }
    const heroData = await heroRes.json();
    const heroImageUrl = heroData.photoUri;
    if (!heroImageUrl) {
      console.error(`    ERROR: No photoUri in 800px response`);
      continue;
    }
    console.log(`    -> CDN URL (800px): ${heroImageUrl.substring(0, 100)}...`);

    // Verify the CDN URLs are accessible
    console.log(`    Verifying CDN URLs...`);
    const imgCheck = await fetch(imageUrl, { method: "HEAD", redirect: "follow" });
    console.log(`    -> image_url (400px) status: ${imgCheck.status}`);
    const heroCheck = await fetch(heroImageUrl, { method: "HEAD", redirect: "follow" });
    console.log(`    -> hero_image_url (800px) status: ${heroCheck.status}`);

    if (imgCheck.status !== 200 || heroCheck.status !== 200) {
      console.error(`    ERROR: CDN URL verification failed. Skipping update.`);
      continue;
    }

    // Step 4: Update the database
    console.log(`    Updating database...`);

    const { error: updateError } = await supabase
      .from("mall_restaurants")
      .update({
        image_url: imageUrl,
        hero_image_url: heroImageUrl,
      })
      .eq("id", record.id);

    if (updateError) {
      console.error(`    ERROR updating: ${updateError.message}`);
    } else {
      console.log(`    SUCCESS: Updated image_url and hero_image_url`);
      console.log(`    New image_url: ${imageUrl}`);
      console.log(`    New hero_image_url: ${heroImageUrl}`);
    }

    console.log();
  }

  // Step 5: Verify by re-querying
  console.log("=== Verification: Re-querying updated records ===\n");

  const { data: updated, error: verifyError } = await supabase
    .from("mall_restaurants")
    .select("id, name, slug, image_url, hero_image_url")
    .in("id", SUSHI_TEI_IDS);

  if (verifyError) {
    console.error("Error verifying:", verifyError.message);
  } else {
    for (const r of updated) {
      console.log(`  ${r.name} (${r.slug})`);
      console.log(`    image_url: ${r.image_url}`);
      console.log(`    hero_image_url: ${r.hero_image_url}`);
      console.log();
    }
  }

  console.log("=== Done ===");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
