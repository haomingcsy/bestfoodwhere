/**
 * Script to process all restaurant images from Google Sheets
 * and upload them to Supabase Storage CDN
 *
 * Run with: npx tsx scripts/process-restaurant-images.ts
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
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY!;
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

interface RestaurantImage {
  mallName: string;
  mallSlug: string;
  name: string;
  restaurantSlug: string;
  imageUrl: string;
}

async function fetchSheetData(): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Full%20info!A:Z?key=${GOOGLE_SHEETS_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.values || [];
}

function parseRestaurantImages(rows: string[][]): RestaurantImage[] {
  const images: RestaurantImage[] = [];
  if (rows.length < 2) return images;

  const headers = rows[0] || [];

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];

    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const mallName = headers[colIndex];
      const cellValue = row[colIndex];

      if (!mallName || !cellValue) continue;

      // Parse restaurant info from cell
      const nameMatch = cellValue.match(/Name:\s*([^\n]+)/i);
      const imageMatch = cellValue.match(/Image URL:\s*([^\n]+)/i);

      if (nameMatch && imageMatch) {
        const name = nameMatch[1].trim();
        const imageUrl = imageMatch[1].trim();

        if (imageUrl && imageUrl.startsWith("http")) {
          images.push({
            mallName,
            mallSlug: toSlug(mallName),
            name,
            restaurantSlug: toSlug(name),
            imageUrl,
          });
        }
      }
    }
  }

  return images;
}

// Convert Google Photos URL to high-resolution version
function getHighResUrl(url: string): string {
  if (url.includes("googleusercontent.com")) {
    // Replace size params with larger dimensions
    if (url.includes("=w") || url.includes("=s")) {
      return url
        .replace(/=w\d+-h\d+[^&\s]*/, "=w1200-h900-k-no")
        .replace(/=s\d+[^&\s]*/, "=s1200");
    }
    // If no size params, append them
    return url + "=w1200-h900-k-no";
  }
  return url;
}

async function downloadImage(
  url: string,
  retries = 3,
): Promise<{
  buffer: ArrayBuffer;
  contentType: string;
} | null> {
  // Convert to high-res URL first
  const highResUrl = getHighResUrl(url);

  for (let attempt = 0; attempt < retries; attempt++) {
    // Exponential backoff: 1s, 2s, 4s
    const delay = 1000 * Math.pow(2, attempt);
    await new Promise((r) => setTimeout(r, delay));

    try {
      const response = await fetch(highResUrl);

      if (response.status === 429 || response.status === 400) {
        console.log(
          `  Rate limited (${response.status}), retry ${attempt + 1}/${retries}...`,
        );
        continue;
      }

      if (!response.ok) {
        console.log(`  Failed to download: ${response.status}`);
        return null;
      }

      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") || "image/jpeg";

      // Skip if too small (likely broken)
      if (buffer.byteLength < 1000) {
        console.log(`  Image too small: ${buffer.byteLength} bytes`);
        return null;
      }

      return { buffer, contentType };
    } catch (error) {
      console.log(`  Download error: ${error}`);
      if (attempt === retries - 1) return null;
    }
  }
  return null;
}

async function uploadToStorage(
  image: RestaurantImage,
  buffer: ArrayBuffer,
  contentType: string,
): Promise<string | null> {
  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : "jpg";
  const filename = `${image.restaurantSlug}.${ext}`;
  const storagePath = `${image.mallSlug}/${image.restaurantSlug}/${filename}`;

  try {
    const { error } = await supabase.storage
      .from("restaurant-images")
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.log(`  Upload error: ${error.message}`);
      return null;
    }

    return `${SUPABASE_URL}/storage/v1/object/public/restaurant-images/${storagePath}`;
  } catch (error) {
    console.log(`  Storage error: ${error}`);
    return null;
  }
}

async function updateCache(
  originalUrl: string,
  cdnUrl: string,
  mallSlug: string,
  restaurantSlug: string,
  fileSize: number,
): Promise<void> {
  try {
    await supabase.from("restaurant_image_cache").upsert(
      {
        original_url: originalUrl,
        cdn_url: cdnUrl,
        mall_slug: mallSlug,
        restaurant_slug: restaurantSlug,
        file_size: fileSize,
        processed_at: new Date().toISOString(),
      },
      { onConflict: "original_url" },
    );
  } catch (error) {
    console.log(`  Cache update error: ${error}`);
  }
}

async function main() {
  console.log("🖼️  Restaurant Image Processor");
  console.log("================================\n");

  // Check if we have required env vars
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !GOOGLE_SHEETS_API_KEY) {
    console.error("Missing required environment variables!");
    process.exit(1);
  }

  console.log("📊 Fetching data from Google Sheets...");
  const rows = await fetchSheetData();
  console.log(`   Found ${rows.length} rows\n`);

  console.log("🔍 Parsing restaurant images...");
  const images = parseRestaurantImages(rows);
  console.log(`   Found ${images.length} images to process\n`);

  let processed = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    console.log(
      `[${i + 1}/${images.length}] ${image.name} (${image.mallName})`,
    );

    // Check if already in cache
    const { data: cached } = await supabase
      .from("restaurant_image_cache")
      .select("cdn_url")
      .eq("original_url", image.imageUrl)
      .single();

    if (cached?.cdn_url) {
      console.log("  ⏭️  Already cached, skipping");
      skipped++;
      continue;
    }

    // Download image
    const downloaded = await downloadImage(image.imageUrl);
    if (!downloaded) {
      failed++;
      continue;
    }

    // Upload to storage
    const cdnUrl = await uploadToStorage(
      image,
      downloaded.buffer,
      downloaded.contentType,
    );
    if (!cdnUrl) {
      failed++;
      continue;
    }

    // Update cache
    await updateCache(
      image.imageUrl,
      cdnUrl,
      image.mallSlug,
      image.restaurantSlug,
      downloaded.buffer.byteLength,
    );

    console.log("  ✅ Processed successfully");
    processed++;

    // Rate limiting - wait 100ms between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\n================================");
  console.log("📈 Summary:");
  console.log(`   ✅ Processed: ${processed}`);
  console.log(`   ⏭️  Skipped (cached): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Total: ${images.length}`);
}

main().catch(console.error);
