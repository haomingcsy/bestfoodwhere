/**
 * Sync shopping mall images from WordPress to Supabase Storage
 * Run with: npx tsx scripts/sync-mall-images.ts
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

// Mall images from WordPress
const MALL_IMAGES = [
  {
    url: "https://bestfoodwhere.sg/wp-content/uploads/2025/01/suntec.jpg",
    filename: "suntec-city.jpg",
    name: "Suntec City",
  },
  {
    url: "https://bestfoodwhere.sg/wp-content/uploads/2025/01/VNO-SC-VivoCity-Shopping-Center.jpg",
    filename: "vivocity.jpg",
    name: "VivoCity",
  },
  {
    url: "https://bestfoodwhere.sg/wp-content/uploads/2025/01/image-1.jpg",
    filename: "jewel-changi.jpg",
    name: "Jewel Changi",
  },
  {
    url: "https://bestfoodwhere.sg/wp-content/uploads/2025/01/nex-dec24.jpg",
    filename: "nex.jpg",
    name: "NEX",
  },
  {
    url: "https://bestfoodwhere.sg/wp-content/uploads/2025/01/imm-outlet-mall.jpg",
    filename: "imm.jpg",
    name: "IMM",
  },
  {
    url: "https://bestfoodwhere.sg/wp-content/uploads/2025/01/20181019_EDK_8478-Edit-scaled.jpg",
    filename: "plaza-singapura.jpg",
    name: "Plaza Singapura",
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
  const storagePath = `malls/${filename}`;

  // Delete existing file if present
  await supabase.storage.from("hero-images").remove([storagePath]);

  // Upload new file
  const contentType = filename.endsWith(".jpg") ? "image/jpeg" : "image/png";
  const { error } = await supabase.storage
    .from("hero-images")
    .upload(storagePath, buffer, {
      contentType,
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
  console.log(
    "🏬 Syncing shopping mall images from WordPress to Supabase...\n",
  );

  const results: { name: string; filename: string; url: string }[] = [];

  for (const image of MALL_IMAGES) {
    try {
      console.log(`Processing: ${image.name}`);
      const buffer = await downloadImage(image.url);
      console.log(`  Downloaded: ${(buffer.length / 1024).toFixed(1)} KB`);

      const publicUrl = await uploadToSupabase(buffer, image.filename);
      console.log(`  Uploaded: ${publicUrl}\n`);

      results.push({
        name: image.name,
        filename: image.filename,
        url: publicUrl,
      });

      // Rate limit
      await new Promise((r) => setTimeout(r, 500));
    } catch (error) {
      console.error(`  Error: ${error}`);
    }
  }

  console.log("\n✅ Done! Here are the new URLs:\n");
  results.forEach((r) => {
    console.log(`${r.name}: "${r.url}",`);
  });
}

main().catch(console.error);
