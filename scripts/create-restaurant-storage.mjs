#!/usr/bin/env node

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = join(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join("=").trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

console.log("Creating restaurant-images storage bucket...\n");

// Create the bucket
const { data: bucket, error: bucketError } =
  await supabase.storage.createBucket("restaurant-images", {
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
  });

if (bucketError) {
  if (bucketError.message.includes("already exists")) {
    console.log("✅ Bucket already exists");
  } else {
    console.log("❌ Error creating bucket:", bucketError.message);
  }
} else {
  console.log("✅ Bucket created:", bucket);
}

// List buckets to confirm
const { data: buckets } = await supabase.storage.listBuckets();
console.log("\nExisting buckets:", buckets?.map((b) => b.name).join(", "));
