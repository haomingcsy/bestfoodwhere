/**
 * Fetch fresh Google Places photos for 14 shopping malls and upload to Supabase Storage.
 *
 * Usage: node scripts/fetch-mall-heroes.mjs
 */

// Load from environment variables (set in .env.local or pass directly)
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GOOGLE_PLACES_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required env vars: GOOGLE_PLACES_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const BUCKET = "hero-images";

const MALLS_TO_FETCH = [
  { slug: "marina-bay-sands", searchName: "Marina Bay Sands Singapore" },
  { slug: "velocity-novena-square", searchName: "Velocity Novena Square Singapore" },
  { slug: "united-square", searchName: "United Square Shopping Mall Singapore" },
  { slug: "woodleigh-mall", searchName: "The Woodleigh Mall Singapore" },
  { slug: "junction-8", searchName: "Junction 8 Shopping Centre Singapore" },
  { slug: "city-square-mall", searchName: "City Square Mall Singapore" },
  { slug: "amk-hub", searchName: "AMK Hub Singapore" },
  { slug: "causeway-point", searchName: "Causeway Point Singapore" },
  { slug: "bedok-mall", searchName: "Bedok Mall Singapore" },
  { slug: "hougang-mall", searchName: "Hougang Mall Singapore" },
  { slug: "tampines-mall", searchName: "Tampines Mall Singapore" },
  { slug: "jewel", searchName: "Jewel Changi Airport Singapore" },
  { slug: "jem", searchName: "JEM Shopping Mall Jurong East Singapore" },
  { slug: "aperia-mall", searchName: "Aperia Mall Singapore" },
];

async function ensureBucketExists() {
  console.log("Checking if bucket exists...");

  // Try listing the bucket
  const listRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, {
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
    },
  });

  if (listRes.ok) {
    console.log(`Bucket '${BUCKET}' already exists.`);
    return;
  }

  // Create the bucket (public)
  console.log(`Creating bucket '${BUCKET}'...`);
  const createRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create bucket: ${err}`);
  }
  console.log(`Bucket '${BUCKET}' created successfully.`);
}

async function searchPlace(mallName) {
  const url = "https://places.googleapis.com/v1/places:searchText";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
    },
    body: JSON.stringify({
      textQuery: mallName,
      maxResultCount: 1,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Places search failed for "${mallName}": ${res.status} ${errText}`);
  }

  const data = await res.json();
  if (!data.places || data.places.length === 0) {
    throw new Error(`No place found for "${mallName}"`);
  }

  const place = data.places[0];
  return {
    placeId: place.id,
    displayName: place.displayName?.text,
    photos: place.photos || [],
  };
}

async function downloadPhoto(photoName, maxWidth = 1200) {
  // Use the Places API photo endpoint
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_PLACES_API_KEY}&skipHttpRedirect=true`;

  const res = await fetch(url);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Photo download failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const photoUri = data.photoUri;

  if (!photoUri) {
    throw new Error(`No photoUri in response for ${photoName}`);
  }

  // Download the actual image
  const imgRes = await fetch(photoUri);
  if (!imgRes.ok) {
    throw new Error(`Image download failed from ${photoUri}: ${imgRes.status}`);
  }

  const buffer = await imgRes.arrayBuffer();
  return Buffer.from(buffer);
}

async function uploadToSupabase(slug, imageBuffer) {
  const path = `malls/${slug}.jpg`;

  // Upsert (upload with overwrite)
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "image/jpeg",
      "x-upsert": "true",
    },
    body: imageBuffer,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload failed for ${slug}: ${res.status} ${errText}`);
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  return publicUrl;
}

async function processMall(mall) {
  console.log(`\n--- Processing: ${mall.slug} ---`);

  // Step 1: Search for the place
  console.log(`  Searching for "${mall.searchName}"...`);
  const place = await searchPlace(mall.searchName);
  console.log(`  Found: ${place.displayName} (${place.placeId}), ${place.photos.length} photos available`);

  if (place.photos.length === 0) {
    console.log(`  WARNING: No photos found for ${mall.slug}, skipping.`);
    return { slug: mall.slug, status: "no_photos" };
  }

  // Step 2: Download the first (best) photo
  const photoName = place.photos[0].name;
  console.log(`  Downloading photo: ${photoName}...`);
  const imageBuffer = await downloadPhoto(photoName);
  console.log(`  Downloaded ${(imageBuffer.length / 1024).toFixed(1)} KB`);

  // Step 3: Upload to Supabase
  console.log(`  Uploading to Supabase Storage...`);
  const publicUrl = await uploadToSupabase(mall.slug, imageBuffer);
  console.log(`  Uploaded! URL: ${publicUrl}`);

  return { slug: mall.slug, status: "success", url: publicUrl };
}

async function main() {
  console.log("=== Mall Hero Image Fetcher ===\n");

  // Step 0: Ensure bucket exists
  await ensureBucketExists();

  const results = [];
  const errors = [];

  // Process malls sequentially to avoid rate limits
  for (const mall of MALLS_TO_FETCH) {
    try {
      const result = await processMall(mall);
      results.push(result);
    } catch (err) {
      console.error(`  ERROR processing ${mall.slug}: ${err.message}`);
      errors.push({ slug: mall.slug, error: err.message });
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log("\n\n=== RESULTS ===\n");
  console.log("Successful uploads:");
  for (const r of results.filter((r) => r.status === "success")) {
    console.log(`  ${r.slug}: ${r.url}`);
  }

  if (errors.length > 0) {
    console.log("\nErrors:");
    for (const e of errors) {
      console.log(`  ${e.slug}: ${e.error}`);
    }
  }

  // Output the slug -> URL mapping for easy copy
  console.log("\n\n=== URL MAPPING (for mall-data.ts) ===\n");
  const mapping = {};
  for (const r of results.filter((r) => r.status === "success")) {
    mapping[r.slug] = r.url;
  }
  console.log(JSON.stringify(mapping, null, 2));
}

main().catch(console.error);
