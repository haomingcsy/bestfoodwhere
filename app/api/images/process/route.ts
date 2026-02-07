import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const N8N_WEBHOOK_URL = process.env.N8N_URL
  ? `${process.env.N8N_URL}/webhook/bfw-upscale-image`
  : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, mallSlug, restaurantSlug, forceUpscale } = body;

    if (!imageUrl || !mallSlug || !restaurantSlug) {
      return NextResponse.json(
        {
          error: "Missing required fields: imageUrl, mallSlug, restaurantSlug",
        },
        { status: 400 },
      );
    }

    // Check if already in cache
    const { data: cached } = await supabase
      .from("restaurant_image_cache")
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

    // If n8n webhook is configured, trigger upscaling
    if (N8N_WEBHOOK_URL && forceUpscale) {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, mallSlug, restaurantSlug }),
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

    // Fallback: just download and store the original
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch original image" },
        { status: 400 },
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType =
      imageResponse.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : "jpg";
    const filename = `${restaurantSlug}.${ext}`;
    const storagePath = `${mallSlug}/${restaurantSlug}/${filename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("restaurant-images")
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
    const cdnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/restaurant-images/${storagePath}`;

    // Update cache
    await supabase.from("restaurant_image_cache").upsert(
      {
        original_url: imageUrl,
        cdn_url: cdnUrl,
        mall_slug: mallSlug,
        restaurant_slug: restaurantSlug,
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
    console.error("Image processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Batch process multiple images
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { images } = body as {
      images: Array<{
        imageUrl: string;
        mallSlug: string;
        restaurantSlug: string;
      }>;
    };

    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: "Missing required field: images (array)" },
        { status: 400 },
      );
    }

    const results = await Promise.allSettled(
      images.map(async (img) => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/images/process`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(img),
          },
        );
        return response.json();
      }),
    );

    return NextResponse.json({
      success: true,
      processed: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
      results,
    });
  } catch (error) {
    console.error("Batch processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
