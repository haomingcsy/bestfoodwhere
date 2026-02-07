/**
 * Restaurant Image Upload API
 * Handles image uploads for restaurant logos, cover photos, and gallery images
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { RestaurantImageUploadResponse } from "@/types/restaurant";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_FILE_SIZE = {
  logo: 5 * 1024 * 1024, // 5MB
  cover: 10 * 1024 * 1024, // 10MB
  gallery: 5 * 1024 * 1024, // 5MB
};

type ImageType = "logo" | "cover" | "gallery";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<RestaurantImageUploadResponse>> {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      },
    );

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const imageType = formData.get("type") as ImageType | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    if (!imageType || !["logo", "cover", "gallery"].includes(imageType)) {
      return NextResponse.json(
        { success: false, error: "Invalid image type" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Please upload a JPG, PNG, or WebP image.",
        },
        { status: 400 },
      );
    }

    // Validate file size
    const maxSize = MAX_FILE_SIZE[imageType];
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        { success: false, error: `File size must be less than ${maxMB}MB` },
        { status: 400 },
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = file.type.split("/")[1] || "jpg";
    const filename = `${user.id}/${imageType}/${timestamp}-${randomId}.${extension}`;

    // Convert File to ArrayBuffer then to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("restaurant-images")
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to upload image. Please try again." },
        { status: 500 },
      );
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("restaurant-images").getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    );
  }
}
