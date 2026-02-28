#!/usr/bin/env node
/**
 * Downloads menu item images from their original URLs and stores them
 * permanently in Supabase Storage (menu-images bucket).
 *
 * This populates cdn_image_url for menu_items that only have original_image_url.
 *
 * Usage:
 *   node scripts/cache-menu-images.mjs [--limit N] [--brand SLUG] [--dry-run]
 *
 * Examples:
 *   node scripts/cache-menu-images.mjs --limit 100
 *   node scripts/cache-menu-images.mjs --brand sushi-tei
 *   node scripts/cache-menu-images.mjs --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// ── Load env vars ──────────────────────────────────────────────────────────────
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
const BUCKET = "menu-images";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE env vars (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Parse CLI args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
let limitArg = 0;
let brandFilter = null;
let dryRun = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--limit" && args[i + 1]) limitArg = parseInt(args[i + 1]);
  if (args[i] === "--brand" && args[i + 1]) brandFilter = args[i + 1];
  if (args[i] === "--dry-run") dryRun = true;
}

// ── Rate limiting — 50ms between downloads ─────────────────────────────────────
let lastRequest = 0;
async function rateLimit() {
  const now = Date.now();
  const wait = Math.max(0, 50 - (now - lastRequest));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Slugify a menu item name for the storage path.
 * Lowercase, replace non-alphanumeric with hyphens, collapse multiples, limit to 50 chars.
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

/**
 * Detect image type from buffer magic bytes.
 * Returns { ext, mime } or null if unrecognised.
 */
function detectImageType(buffer) {
  if (!buffer || buffer.length < 4) return null;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { ext: "png", mime: "image/png" };
  }
  // WebP: RIFF....WEBP
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer.length > 11 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return { ext: "webp", mime: "image/webp" };
  }
  // GIF: GIF87a or GIF89a
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return { ext: "gif", mime: "image/gif" };
  }
  // AVIF: ....ftypavif
  if (buffer.length > 11 && buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    return { ext: "avif", mime: "image/avif" };
  }
  return null;
}

/**
 * Determine file extension from buffer magic bytes, Content-Type header, or URL.
 * Prefers magic byte detection for accuracy.
 */
function getExtension(contentType, url, buffer) {
  // Prefer magic byte detection
  if (buffer) {
    const detected = detectImageType(buffer);
    if (detected) return detected.ext;
  }
  const typeMap = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
    "image/svg+xml": "svg",
  };
  if (contentType && typeMap[contentType.split(";")[0].trim()]) {
    return typeMap[contentType.split(";")[0].trim()];
  }
  // Fallback: try to extract from URL
  const urlPath = new URL(url).pathname;
  const match = urlPath.match(/\.(jpe?g|png|webp|gif|avif|svg)$/i);
  if (match) return match[1].toLowerCase().replace("jpeg", "jpg");
  return "jpg"; // default
}

/**
 * Get the correct MIME type for uploading, using magic bytes.
 * For types Supabase Storage may reject (like GIF), returns the detected mime.
 */
function getUploadMime(buffer, fallbackContentType) {
  if (buffer) {
    const detected = detectImageType(buffer);
    if (detected) return detected.mime;
  }
  return fallbackContentType || "image/jpeg";
}

/**
 * Download image with retry (1 retry after 2s).
 * Returns { buffer, contentType } or null on failure.
 */
async function downloadImage(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await rateLimit();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; BFW-ImageCache/1.0)",
        },
      });
      clearTimeout(timeout);

      if (!res.ok) {
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        return null;
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get("content-type") || "image/jpeg";

      // Skip images smaller than 1KB
      if (buffer.length < 1024) {
        return null;
      }

      return { buffer, contentType };
    } catch (err) {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      return null;
    }
  }
  return null;
}

/**
 * Upload buffer to Supabase Storage and return the public URL.
 */
async function uploadToStorage(storagePath, buffer, contentType) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) throw error;

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

// ── Fetch all items with pagination ────────────────────────────────────────────

async function fetchAllItems() {
  const PAGE_SIZE = 1000;
  let allItems = [];
  let offset = 0;
  let hasMore = true;

  console.log("Fetching menu items that need image caching...");

  while (hasMore) {
    let query = supabase
      .from("menu_items")
      .select("id, name, original_image_url, brand_menu_id")
      .not("original_image_url", "is", null)
      .is("cdn_image_url", null)
      .order("id")
      .range(offset, offset + PAGE_SIZE - 1);

    const { data, error } = await query;

    if (error) {
      console.error(`Failed to fetch menu items at offset ${offset}:`, error);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allItems = allItems.concat(data);
      console.log(`  Fetched ${allItems.length} items so far...`);
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        offset += PAGE_SIZE;
      }
    }
  }

  return allItems;
}

/**
 * Fetch brand_menus slug mapping for a set of brand_menu_ids.
 */
async function fetchBrandMenuSlugs(brandMenuIds) {
  const uniqueIds = [...new Set(brandMenuIds)];
  const slugMap = new Map();
  const PAGE_SIZE = 1000;

  for (let i = 0; i < uniqueIds.length; i += PAGE_SIZE) {
    const batch = uniqueIds.slice(i, i + PAGE_SIZE);
    const { data, error } = await supabase
      .from("brand_menus")
      .select("id, slug")
      .in("id", batch);

    if (error) {
      console.error("Failed to fetch brand_menus:", error);
      process.exit(1);
    }

    for (const row of data || []) {
      slugMap.set(row.id, row.slug);
    }
  }

  return slugMap;
}

/**
 * Check which original_urls already exist in menu_item_image_cache.
 * Returns a Set of cached original_urls.
 */
async function fetchCachedUrls(originalUrls) {
  const cached = new Set();
  const PAGE_SIZE = 1000;

  for (let i = 0; i < originalUrls.length; i += PAGE_SIZE) {
    const batch = originalUrls.slice(i, i + PAGE_SIZE);
    const { data, error } = await supabase
      .from("menu_item_image_cache")
      .select("original_url")
      .in("original_url", batch);

    if (error) {
      console.warn("Warning: failed to check image cache:", error.message);
      continue;
    }

    for (const row of data || []) {
      cached.add(row.original_url);
    }
  }

  return cached;
}

// ── Process a single item ──────────────────────────────────────────────────────

async function processItem(item, brandSlug) {
  const itemSlug = slugify(item.name || "item");
  const idPrefix = item.id.substring(0, 8);

  // Download image
  const result = await downloadImage(item.original_image_url);
  if (!result) {
    return { status: "skipped", reason: "download failed or image too small" };
  }

  const { buffer, contentType } = result;
  const ext = getExtension(contentType, item.original_image_url, buffer);
  const uploadMime = getUploadMime(buffer, contentType);
  const storagePath = `${brandSlug}/menu_item/${itemSlug}-${idPrefix}.${ext}`;

  if (dryRun) {
    return {
      status: "dry-run",
      storagePath,
      size: buffer.length,
    };
  }

  // Upload to Supabase Storage (use detected mime type for accuracy)
  const cdnUrl = await uploadToStorage(storagePath, buffer, uploadMime);

  // Upsert into menu_item_image_cache
  const { error: cacheError } = await supabase
    .from("menu_item_image_cache")
    .upsert(
      {
        original_url: item.original_image_url,
        cdn_url: cdnUrl,
        brand_slug: brandSlug,
        menu_item_name: (item.name || "").slice(0, 255),
        image_type: "menu_item",
        file_size: buffer.length,
        processed_at: new Date().toISOString(),
      },
      { onConflict: "original_url" }
    );

  if (cacheError) {
    console.warn(`  Warning: cache upsert failed for ${item.name}: ${cacheError.message}`);
  }

  // Update menu_items.cdn_image_url
  const { error: updateError } = await supabase
    .from("menu_items")
    .update({ cdn_image_url: cdnUrl })
    .eq("id", item.id);

  if (updateError) {
    console.warn(`  Warning: menu_items update failed for ${item.name}: ${updateError.message}`);
  }

  return {
    status: "success",
    storagePath,
    size: buffer.length,
    cdnUrl,
  };
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Menu Item Image Cache Script ===\n");

  if (dryRun) console.log("*** DRY RUN MODE — no uploads or DB writes ***\n");
  if (brandFilter) console.log(`Filtering to brand: ${brandFilter}`);
  if (limitArg > 0) console.log(`Limiting to ${limitArg} items`);

  // Step 1: Fetch all uncached menu items
  let items = await fetchAllItems();
  console.log(`\nFound ${items.length} menu items with original_image_url but no cdn_image_url`);

  if (items.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  // Step 2: Fetch brand slugs
  const brandMenuIds = items.map((i) => i.brand_menu_id).filter(Boolean);
  const slugMap = await fetchBrandMenuSlugs(brandMenuIds);
  console.log(`Loaded ${slugMap.size} brand menu slug mappings`);

  // Step 3: Filter by brand if specified
  if (brandFilter) {
    items = items.filter((i) => slugMap.get(i.brand_menu_id) === brandFilter);
    console.log(`After brand filter: ${items.length} items`);
  }

  // Step 4: Apply limit
  if (limitArg > 0 && items.length > limitArg) {
    items = items.slice(0, limitArg);
    console.log(`After limit: ${items.length} items`);
  }

  if (items.length === 0) {
    console.log("Nothing to process after filters.");
    return;
  }

  // Step 5: Check which are already in the image cache
  const originalUrls = items.map((i) => i.original_image_url);
  const cachedUrls = await fetchCachedUrls(originalUrls);
  const uncachedItems = items.filter((i) => !cachedUrls.has(i.original_image_url));

  console.log(
    `\n${cachedUrls.size} already cached, ${uncachedItems.length} to process\n`
  );

  if (uncachedItems.length === 0) {
    console.log("All items already cached. Nothing to do.");
    return;
  }

  // Step 6: Process with concurrency of 5
  const CONCURRENCY = 5;
  let success = 0;
  let failed = 0;
  let skipped = 0;
  let totalBytes = 0;
  const startTime = Date.now();

  for (let i = 0; i < uncachedItems.length; i += CONCURRENCY) {
    const batch = uncachedItems.slice(i, i + CONCURRENCY);

    const results = await Promise.allSettled(
      batch.map(async (item, batchIdx) => {
        const globalIdx = i + batchIdx;
        const brandSlug = slugMap.get(item.brand_menu_id) || "unknown";

        try {
          const result = await processItem(item, brandSlug);

          if (result.status === "success" || result.status === "dry-run") {
            success++;
            totalBytes += result.size || 0;
            return { item, result, globalIdx };
          } else {
            skipped++;
            return { item, result, globalIdx };
          }
        } catch (err) {
          failed++;
          return { item, error: err.message, globalIdx };
        }
      })
    );

    // Print progress every 50 images
    const processed = Math.min(i + CONCURRENCY, uncachedItems.length);
    if (processed % 50 < CONCURRENCY || processed === uncachedItems.length) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = (processed / ((Date.now() - startTime) / 1000)).toFixed(1);
      console.log(
        `[${processed}/${uncachedItems.length}] ` +
          `success=${success} failed=${failed} skipped=${skipped} ` +
          `elapsed=${elapsed}s rate=${rate}/s`
      );
    }

    // Log individual results for each batch item
    for (const settled of results) {
      if (settled.status === "fulfilled") {
        const { item, result, error, globalIdx } = settled.value;
        const idx = globalIdx + 1;
        const brandSlug = slugMap.get(item.brand_menu_id) || "unknown";
        if (error) {
          console.log(`  [${idx}] ${brandSlug}/${item.name}: FAIL — ${error}`);
        } else if (result.status === "success") {
          const sizeKB = ((result.size || 0) / 1024).toFixed(1);
          console.log(`  [${idx}] ${brandSlug}/${item.name}: OK — ${result.storagePath} (${sizeKB}KB)`);
        } else if (result.status === "dry-run") {
          const sizeKB = ((result.size || 0) / 1024).toFixed(1);
          console.log(`  [${idx}] ${brandSlug}/${item.name}: DRY-RUN — would upload ${result.storagePath} (${sizeKB}KB)`);
        } else {
          console.log(`  [${idx}] ${brandSlug}/${item.name}: SKIP — ${result.reason}`);
        }
      } else {
        // Promise.allSettled rejected — should not happen since we catch inside
        console.log(`  Unexpected rejection: ${settled.reason}`);
      }
    }
  }

  // Final summary
  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  console.log(`\n=== Summary ===`);
  console.log(`Total processed: ${success + failed + skipped}`);
  console.log(`  Success: ${success}`);
  console.log(`  Failed:  ${failed}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`Total data: ${totalMB} MB`);
  console.log(`Time: ${totalElapsed}s`);
  if (dryRun) {
    console.log(`\n*** DRY RUN — no actual uploads were made ***`);
  } else {
    console.log(`\nCDN URLs stored in menu_items.cdn_image_url and menu_item_image_cache.`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
