/**
 * Script to process all menu images from Google Sheets brand data
 * and upload them to Supabase Storage CDN
 *
 * Run with: npx tsx scripts/process-menu-images.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fetchAllBrands } from "../lib/google-sheets";
import type { BrandData } from "../types/brand";

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

// Map GOOGLE_SHEETS_MENU_ID to GOOGLE_SHEETS_SPREADSHEET_ID if not set
if (
  !process.env.GOOGLE_SHEETS_SPREADSHEET_ID &&
  process.env.GOOGLE_SHEETS_MENU_ID
) {
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_MENU_ID;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

type MenuImageType =
  | "menu_item"
  | "hero"
  | "logo"
  | "promotion"
  | "recommendation"
  | "related_brand";

interface MenuImage {
  brandSlug: string;
  brandName: string;
  imageUrl: string;
  imageType: MenuImageType;
  itemName?: string;
}

function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const lower = url.toLowerCase();
  return (
    (lower.startsWith("http://") || lower.startsWith("https://")) &&
    (lower.includes("googleusercontent") ||
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png") ||
      lower.endsWith(".webp") ||
      lower.includes("postimg") ||
      lower.includes("imgbb") ||
      lower.includes("imgur"))
  );
}

function extractImagesFromBrands(brands: BrandData[]): MenuImage[] {
  const images: MenuImage[] = [];

  for (const brand of brands) {
    const brandSlug = brand.slug;
    const brandName = brand.name;

    // Menu item images
    for (const category of brand.menu) {
      for (const item of category.items) {
        if (item.imageUrl && isValidImageUrl(item.imageUrl)) {
          images.push({
            brandSlug,
            brandName,
            imageUrl: item.imageUrl,
            imageType: "menu_item",
            itemName: item.name,
          });
        }
      }
    }

    // Promotion images
    for (const url of brand.promotions) {
      if (isValidImageUrl(url)) {
        images.push({
          brandSlug,
          brandName,
          imageUrl: url,
          imageType: "promotion",
        });
      }
    }

    // Location images (hero and logo)
    for (const location of brand.locations) {
      if (location.imageUrl && isValidImageUrl(location.imageUrl)) {
        images.push({
          brandSlug,
          brandName,
          imageUrl: location.imageUrl,
          imageType: "logo",
        });
      }
      if (location.heroImageUrl && isValidImageUrl(location.heroImageUrl)) {
        images.push({
          brandSlug,
          brandName,
          imageUrl: location.heroImageUrl,
          imageType: "hero",
        });
      }
    }

    // Related brand images
    for (const locationBrands of Object.values(brand.relatedBrands)) {
      for (const relatedBrand of locationBrands) {
        if (relatedBrand.imageUrl && isValidImageUrl(relatedBrand.imageUrl)) {
          images.push({
            brandSlug,
            brandName,
            imageUrl: relatedBrand.imageUrl,
            imageType: "related_brand",
          });
        }
      }
    }
  }

  // Deduplicate by imageUrl
  const seen = new Set<string>();
  return images.filter((img) => {
    if (seen.has(img.imageUrl)) return false;
    seen.add(img.imageUrl);
    return true;
  });
}

async function downloadImage(url: string): Promise<{
  buffer: ArrayBuffer;
  contentType: string;
} | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BFW Image Processor/1.0)",
      },
    });

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
    return null;
  }
}

async function uploadToStorage(
  image: MenuImage,
  buffer: ArrayBuffer,
  contentType: string,
): Promise<string | null> {
  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : "jpg";
  const timestamp = Date.now();
  const itemSlug = image.itemName ? toSlug(image.itemName) : image.imageType;
  const filename = `${itemSlug}-${timestamp}.${ext}`;
  const storagePath = `${image.brandSlug}/${image.imageType}/${filename}`;

  try {
    const { error } = await supabase.storage
      .from("menu-images")
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.log(`  Upload error: ${error.message}`);
      return null;
    }

    return `${SUPABASE_URL}/storage/v1/object/public/menu-images/${storagePath}`;
  } catch (error) {
    console.log(`  Storage error: ${error}`);
    return null;
  }
}

async function updateCache(
  originalUrl: string,
  cdnUrl: string,
  brandSlug: string,
  imageType: MenuImageType,
  itemName: string | undefined,
  fileSize: number,
): Promise<void> {
  try {
    await supabase.from("menu_item_image_cache").upsert(
      {
        original_url: originalUrl,
        cdn_url: cdnUrl,
        brand_slug: brandSlug,
        image_type: imageType,
        menu_item_name: itemName || null,
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
  console.log("🍽️  Menu Image Processor");
  console.log("================================\n");

  // Check if we have required env vars
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Missing required environment variables!");
    console.error(
      "Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY",
    );
    process.exit(1);
  }

  console.log("📊 Fetching brand data from Google Sheets...");
  const brands = await fetchAllBrands();
  console.log(`   Found ${brands.length} brands\n`);

  console.log("🔍 Extracting menu images...");
  const images = extractImagesFromBrands(brands);
  console.log(`   Found ${images.length} unique images to process\n`);

  // Group by type for summary
  const byType = images.reduce(
    (acc, img) => {
      acc[img.imageType] = (acc[img.imageType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  console.log("   By type:", byType, "\n");

  let processed = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    console.log(
      `[${i + 1}/${images.length}] ${image.brandName} (${image.imageType})`,
    );

    // Check if already in cache
    const { data: cached } = await supabase
      .from("menu_item_image_cache")
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
      image.brandSlug,
      image.imageType,
      image.itemName,
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
