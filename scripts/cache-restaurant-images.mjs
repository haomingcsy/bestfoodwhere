#!/usr/bin/env node
/**
 * Downloads Google Places photos for all mall_restaurants and stores them
 * permanently in Supabase Storage (restaurant-images bucket).
 *
 * This ensures images never expire (Google CDN URLs are temporary).
 *
 * Usage: node scripts/cache-restaurant-images.mjs [--limit N] [--mall SLUG]
 *
 * Cost estimate: ~$7 per 1000 photo downloads (Google Places Photo API).
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load env vars
const envPath = new URL("../.env.local", import.meta.url).pathname;
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BUCKET = "restaurant-images";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}
if (!GOOGLE_API_KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Parse CLI args
const args = process.argv.slice(2);
let limitArg = 0;
let mallFilter = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--limit" && args[i + 1]) limitArg = parseInt(args[i + 1]);
  if (args[i] === "--mall" && args[i + 1]) mallFilter = args[i + 1];
}

// Rate limiting — 1 request per 200ms
let lastRequest = 0;
async function rateLimit() {
  const now = Date.now();
  const wait = Math.max(0, 200 - (now - lastRequest));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
}

/**
 * Fetch photo references for a place using Places API (New).
 * The `photos` field is a Basic field ($0 per request).
 */
async function fetchPhotoRefs(googlePlaceId) {
  await rateLimit();
  const url = `https://places.googleapis.com/v1/places/${googlePlaceId}?fields=photos&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  Failed to fetch place ${googlePlaceId}: ${res.status}`);
    return [];
  }
  const data = await res.json();
  return data.photos || [];
}

/**
 * Get a fresh CDN URL for a photo reference.
 * Cost: $7 per 1000 requests.
 */
async function getPhotoUrl(photoName, maxWidth = 800) {
  await rateLimit();
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return null;
  const cdnUrl = res.url;
  if (!cdnUrl.includes("googleusercontent.com")) return null;
  return cdnUrl;
}

/**
 * Download image from URL and upload to Supabase Storage.
 * Returns the public URL of the stored image.
 */
async function downloadAndStore(imageUrl, storagePath) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await res.arrayBuffer());

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function main() {
  console.log("=== Restaurant Image Cache Script ===\n");

  // Build query
  let query = supabase
    .from("mall_restaurants")
    .select("id, name, slug, mall_id, google_place_id, photos, hero_image_url")
    .not("google_place_id", "is", null);

  if (mallFilter) {
    const { data: mall } = await supabase
      .from("shopping_malls")
      .select("id")
      .eq("slug", mallFilter)
      .limit(1);
    if (!mall?.length) {
      console.error(`Mall "${mallFilter}" not found`);
      process.exit(1);
    }
    query = query.eq("mall_id", mall[0].id);
    console.log(`Filtering to mall: ${mallFilter}`);
  }

  if (limitArg > 0) {
    query = query.limit(limitArg);
    console.log(`Limiting to ${limitArg} restaurants`);
  }

  const { data: restaurants, error } = await query;
  if (error) {
    console.error("Failed to fetch restaurants:", error);
    process.exit(1);
  }

  // Filter out restaurants that already have Supabase Storage URLs
  const toProcess = restaurants.filter(
    (r) => !r.hero_image_url?.includes("/storage/v1/object/public/")
  );

  console.log(
    `Found ${restaurants.length} restaurants total, ${toProcess.length} need image caching\n`
  );

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const r = toProcess[i];
    const progress = `[${i + 1}/${toProcess.length}]`;

    try {
      // Step 1: Get photo reference
      let photoName = null;

      // Check if photos column has stored references
      if (Array.isArray(r.photos) && r.photos.length > 0) {
        photoName = r.photos[0].name;
      }

      // Fallback: fetch from Google Places API (free for Basic fields)
      if (!photoName) {
        const refs = await fetchPhotoRefs(r.google_place_id);
        if (refs.length === 0) {
          console.log(`${progress} ${r.name}: No photos available — skipped`);
          skipped++;
          continue;
        }
        photoName = refs[0].name;

        // Store photo references for future use
        await supabase
          .from("mall_restaurants")
          .update({ photos: refs })
          .eq("id", r.id);
      }

      // Step 2: Get fresh CDN URL from photo reference
      const cdnUrl = await getPhotoUrl(photoName);
      if (!cdnUrl) {
        console.log(`${progress} ${r.name}: Failed to get CDN URL — skipped`);
        skipped++;
        continue;
      }

      // Step 3: Download and store in Supabase Storage
      const storagePath = `heroes/${r.slug}-${r.id.substring(0, 8)}.jpg`;
      const publicUrl = await downloadAndStore(cdnUrl, storagePath);

      // Step 4: Update hero_image_url in DB
      await supabase
        .from("mall_restaurants")
        .update({ hero_image_url: publicUrl })
        .eq("id", r.id);

      console.log(`${progress} ${r.name}: ✓ cached → ${storagePath}`);
      success++;
    } catch (err) {
      console.log(`${progress} ${r.name}: ✗ ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Success: ${success}, Failed: ${failed}, Skipped: ${skipped}`);
  console.log(
    `Supabase Storage URLs will never expire (unlike Google CDN URLs)`
  );
}

main();
