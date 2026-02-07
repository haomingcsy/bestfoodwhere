/**
 * Sync hero images from WordPress to Supabase Storage
 * Run with: npx tsx scripts/sync-hero-images.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load env
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (key && valueParts.length > 0) {
      let value = valueParts.join("=");
      // Remove quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Hero images from WordPress
const HERO_IMAGES = [
  // Left column (tall images)
  {
    url: "https://bestfoodwhere.sg/wp-content/uploads/2025/01/gettyimages-922234438-2048x2048-1.png",
    filename: "hero-left-1.png",
  },
  {
    url: "https://bestfoodwhere.sg/wp-content/uploads/2025/01/gettyimages-879573476-2048x2048-1.png",
    filename: "hero-left-2.png",
  },
  {
    url: "https://bestfoodwhere.sg/wp-content/uploads/2025/01/gettyimages-1468833485-2048x2048-1.png",
    filename: "hero-left-3.png",
  },
  // Right column (smaller images)
  {
    url: "https://bestfoodwhere.sg/wp-content/uploads/2025/01/Untitled-design-22.png",
    filename: "hero-right-1.png",
  },
  {
    url: "https://bestfoodwhere.sg/wp-content/uploads/2025/01/Untitled-design-21.png",
    filename: "hero-right-2.png",
  },
  {
    url: "https://bestfoodwhere.sg/wp-content/uploads/2025/01/Untitled-design-20.png",
    filename: "hero-right-3.png",
  },
];

async function downloadImage(url: string): Promise<Buffer> {
  console.log(`  Downloading: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadToSupabase(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const storagePath = `${filename}`;

  // Check if file exists and delete it first
  const { error: deleteError } = await supabase.storage
    .from("hero-images")
    .remove([storagePath]);

  if (deleteError && !deleteError.message.includes("not found")) {
    console.log(`  Note: ${deleteError.message}`);
  }

  // Upload new file
  const { data, error } = await supabase.storage
    .from("hero-images")
    .upload(storagePath, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload ${filename}: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("hero-images")
    .getPublicUrl(storagePath);

  return urlData.publicUrl;
}

async function main() {
  console.log("🖼️  Syncing hero images from WordPress to Supabase...\n");

  const results: { filename: string; url: string }[] = [];

  for (const image of HERO_IMAGES) {
    try {
      console.log(`Processing: ${image.filename}`);
      const buffer = await downloadImage(image.url);
      console.log(`  Downloaded: ${(buffer.length / 1024).toFixed(1)} KB`);

      const publicUrl = await uploadToSupabase(buffer, image.filename);
      console.log(`  Uploaded: ${publicUrl}\n`);

      results.push({ filename: image.filename, url: publicUrl });

      // Rate limit
      await new Promise((r) => setTimeout(r, 500));
    } catch (error) {
      console.error(`  Error: ${error}`);
    }
  }

  console.log("\n✅ Done! Here are the new URLs:\n");
  console.log("const HERO_IMAGES_LEFT = [");
  results
    .filter((r) => r.filename.includes("left"))
    .forEach((r) => {
      console.log(
        `  { src: "${r.url}", alt: "Food image", width: 408, height: 544 },`,
      );
    });
  console.log("];\n");

  console.log("const HERO_IMAGES_RIGHT = [");
  results
    .filter((r) => r.filename.includes("right"))
    .forEach((r) => {
      console.log(
        `  { src: "${r.url}", alt: "Food image", width: 408, height: 306 },`,
      );
    });
  console.log("];");
}

main().catch(console.error);
