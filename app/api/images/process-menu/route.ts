import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MenuImageType } from "@/lib/restaurant-images";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const N8N_WEBHOOK_URL = process.env.N8N_URL
  ? `${process.env.N8N_URL}/webhook/bfw-upscale-image`
  : null;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

interface ProcessMenuImageRequest {
  imageUrl: string;
  brandSlug: string;
  menuItemName?: string;
  imageType?: MenuImageType;
  forceUpscale?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessMenuImageRequest = await request.json();
    const {
      imageUrl,
      brandSlug,
      menuItemName,
      imageType = "menu_item",
      forceUpscale,
    } = body;

    if (!imageUrl || !brandSlug) {
      return NextResponse.json(
        { error: "Missing required fields: imageUrl, brandSlug" },
        { status: 400 },
      );
    }

    // Check if already in cache
    const { data: cached } = await supabase
      .from("menu_item_image_cache")
      .select("cdn_url")
      .eq("original_url", imageUrl)
      .single();

    if (cached?.cdn_url && !forceUpscale) {
      return NextResponse.json({
        success: true,
        cdnUrl: cached.cdn_url,
        source: "cache",
      });
    }

    // If n8n webhook is configured and upscaling is requested
    if (N8N_WEBHOOK_URL && forceUpscale) {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, brandSlug, imageType }),
      });

      if (response.ok) {
        const result = await response.json();
        return NextResponse.json({
          success: true,
          cdnUrl: result.cdnUrl,
          source: "upscaled",
        });
      }
    }

    // Download and store the original image
    const imageResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch original image" },
        { status: 400 },
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    // Skip very small images (likely broken/placeholder)
    if (imageBuffer.byteLength < 1024) {
      return NextResponse.json(
        { error: "Image too small, likely invalid" },
        { status: 400 },
      );
    }

    const contentType =
      imageResponse.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : contentType.includes("avif")
          ? "avif"
          : "jpg";

    // Build storage path based on image type
    const itemSlug = menuItemName ? slugify(menuItemName) : imageType;
    const timestamp = Date.now();
    const filename = `${itemSlug}-${timestamp}.${ext}`;
    const storagePath = `${brandSlug}/${imageType}/${filename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(storagePath, imageBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 },
      );
    }

    // Build CDN URL
    const cdnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/menu-images/${storagePath}`;

    // Update cache
    await supabase.from("menu_item_image_cache").upsert(
      {
        original_url: imageUrl,
        cdn_url: cdnUrl,
        brand_slug: brandSlug,
        menu_item_name: menuItemName || null,
        image_type: imageType,
        file_size: imageBuffer.byteLength,
        processed_at: new Date().toISOString(),
      },
      { onConflict: "original_url" },
    );

    return NextResponse.json({
      success: true,
      cdnUrl,
      source: "processed",
    });
  } catch (error) {
    console.error("Menu image processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Batch process multiple menu images
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { images } = body as {
      images: ProcessMenuImageRequest[];
    };

    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: "Missing required field: images (array)" },
        { status: 400 },
      );
    }

    // Process in smaller batches to avoid rate limits
    const batchSize = 10;
    const results: PromiseSettledResult<unknown>[] = [];

    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(async (img) => {
          // Process directly instead of calling API recursively
          const response = await processImage(img);
          return response;
        }),
      );
      results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < images.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
      total: images.length,
    });
  } catch (error) {
    console.error("Batch menu image processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Internal function for batch processing
async function processImage(
  img: ProcessMenuImageRequest,
): Promise<{ success: boolean; cdnUrl?: string; error?: string }> {
  const { imageUrl, brandSlug, menuItemName, imageType = "menu_item" } = img;

  if (!imageUrl || !brandSlug) {
    return { success: false, error: "Missing required fields" };
  }

  // Check cache first
  const { data: cached } = await supabase
    .from("menu_item_image_cache")
    .select("cdn_url")
    .eq("original_url", imageUrl)
    .single();

  if (cached?.cdn_url) {
    return { success: true, cdnUrl: cached.cdn_url };
  }

  try {
    // Download image
    const imageResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!imageResponse.ok) {
      return { success: false, error: "Failed to fetch image" };
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    if (imageBuffer.byteLength < 1024) {
      return { success: false, error: "Image too small" };
    }

    const contentType =
      imageResponse.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : "jpg";

    const itemSlug = menuItemName ? slugify(menuItemName) : imageType;
    const timestamp = Date.now();
    const filename = `${itemSlug}-${timestamp}.${ext}`;
    const storagePath = `${brandSlug}/${imageType}/${filename}`;

    // Upload
    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(storagePath, imageBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: "Upload failed" };
    }

    const cdnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/menu-images/${storagePath}`;

    // Cache
    await supabase.from("menu_item_image_cache").upsert(
      {
        original_url: imageUrl,
        cdn_url: cdnUrl,
        brand_slug: brandSlug,
        menu_item_name: menuItemName || null,
        image_type: imageType,
        file_size: imageBuffer.byteLength,
        processed_at: new Date().toISOString(),
      },
      { onConflict: "original_url" },
    );

    return { success: true, cdnUrl };
  } catch {
    return { success: false, error: "Processing failed" };
  }
}
