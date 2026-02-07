"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { CUISINE_TYPES } from "@/types/restaurant";
import type { ShoppingMall } from "@/types/restaurant";
import { ImageUploader } from "@/components/restaurant/ImageUploader";
import { GalleryManager } from "@/components/restaurant/GalleryManager";

interface RestaurantData {
  restaurant_name: string;
  contact_person: string;
  business_email: string | null;
  business_phone: string | null;
  mall_location: string | null;
  cuisine_type: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  cover_photo_url: string | null;
  gallery_urls: string[];
}

export default function ListingPage() {
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [malls, setMalls] = useState<ShoppingMall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createSupabaseBrowserClient();

      // Fetch malls and restaurant profile in parallel
      const [mallsResult, userResult] = await Promise.all([
        supabase
          .from("shopping_malls")
          .select("*")
          .eq("is_active", true)
          .order("name"),
        supabase.auth.getUser(),
      ]);

      if (mallsResult.data) {
        setMalls(mallsResult.data);
      }

      if (userResult.data.user) {
        const { data } = await supabase
          .from("restaurant_profiles")
          .select("*")
          .eq("id", userResult.data.user.id)
          .single();

        if (data) {
          setRestaurant({
            restaurant_name: data.restaurant_name || "",
            contact_person: data.contact_person || "",
            business_email: data.business_email,
            business_phone: data.business_phone,
            mall_location: data.mall_location,
            cuisine_type: data.cuisine_type,
            website: data.website,
            description: data.description,
            logo_url: data.logo_url,
            cover_photo_url: data.cover_photo_url,
            gallery_urls: data.gallery_urls || [],
          });
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    if (!restaurant) return;

    // Validate required fields
    if (!restaurant.restaurant_name.trim()) {
      setMessage({ type: "error", text: "Restaurant name is required" });
      return;
    }
    if (!restaurant.contact_person.trim()) {
      setMessage({ type: "error", text: "Contact person is required" });
      return;
    }
    if (!restaurant.mall_location) {
      setMessage({ type: "error", text: "Please select a mall location" });
      return;
    }
    if (!restaurant.cuisine_type) {
      setMessage({ type: "error", text: "Please select a cuisine type" });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("restaurant_profiles")
        .update({
          restaurant_name: restaurant.restaurant_name,
          contact_person: restaurant.contact_person,
          business_email: restaurant.business_email,
          business_phone: restaurant.business_phone,
          mall_location: restaurant.mall_location,
          cuisine_type: restaurant.cuisine_type,
          website: restaurant.website,
          description: restaurant.description,
          logo_url: restaurant.logo_url,
          cover_photo_url: restaurant.cover_photo_url,
          gallery_urls: restaurant.gallery_urls,
        })
        .eq("id", user.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Listing updated successfully!" });
    } catch (error) {
      console.error("Error saving:", error);
      setMessage({
        type: "error",
        text: "Failed to save changes. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-bfw-orange border-t-transparent" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center">
        <p className="text-gray-600">No restaurant profile found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Edit Listing
        </h1>
        <p className="mt-1 font-body text-gray-600">
          Update your restaurant information
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900">
          Basic Information
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
              Restaurant Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={restaurant.restaurant_name}
              onChange={(e) =>
                setRestaurant((r) =>
                  r ? { ...r, restaurant_name: e.target.value } : null,
                )
              }
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
            />
          </div>
          <div>
            <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
              Contact Person <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={restaurant.contact_person}
              onChange={(e) =>
                setRestaurant((r) =>
                  r ? { ...r, contact_person: e.target.value } : null,
                )
              }
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
            />
          </div>
          <div>
            <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
              Business Email
            </label>
            <input
              type="email"
              value={restaurant.business_email || ""}
              onChange={(e) =>
                setRestaurant((r) =>
                  r ? { ...r, business_email: e.target.value } : null,
                )
              }
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
            />
          </div>
          <div>
            <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
              Business Phone
            </label>
            <input
              type="tel"
              value={restaurant.business_phone || ""}
              onChange={(e) =>
                setRestaurant((r) =>
                  r ? { ...r, business_phone: e.target.value } : null,
                )
              }
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
            />
          </div>
        </div>
      </div>

      {/* Location & Type */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900">
          Location & Type
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
              Mall Location <span className="text-red-500">*</span>
            </label>
            <select
              value={restaurant.mall_location || ""}
              onChange={(e) =>
                setRestaurant((r) =>
                  r ? { ...r, mall_location: e.target.value } : null,
                )
              }
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
            >
              <option value="">Select a mall</option>
              {malls.map((mall) => (
                <option key={mall.id} value={mall.name}>
                  {mall.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
              Cuisine Type <span className="text-red-500">*</span>
            </label>
            <select
              value={restaurant.cuisine_type || ""}
              onChange={(e) =>
                setRestaurant((r) =>
                  r ? { ...r, cuisine_type: e.target.value } : null,
                )
              }
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
            >
              <option value="">Select cuisine type</option>
              {CUISINE_TYPES.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
              Website{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="url"
              value={restaurant.website || ""}
              onChange={(e) =>
                setRestaurant((r) =>
                  r ? { ...r, website: e.target.value } : null,
                )
              }
              placeholder="https://yourrestaurant.com"
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900">
          Description
        </h2>
        <div className="mt-4">
          <textarea
            value={restaurant.description || ""}
            onChange={(e) =>
              setRestaurant((r) =>
                r ? { ...r, description: e.target.value } : null,
              )
            }
            rows={4}
            maxLength={1000}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
            placeholder="Tell customers about your restaurant, specialties, and what makes you unique..."
          />
          <p className="mt-1 text-right font-body text-xs text-gray-400">
            {(restaurant.description || "").length}/1000 characters
          </p>
        </div>
      </div>

      {/* Images */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900">
          Images
        </h2>
        <p className="mt-1 font-body text-sm text-gray-600">
          Add images to make your listing stand out
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ImageUploader
            type="logo"
            currentUrl={restaurant.logo_url}
            onUpload={(url) =>
              setRestaurant((r) => (r ? { ...r, logo_url: url } : null))
            }
            onRemove={() =>
              setRestaurant((r) => (r ? { ...r, logo_url: null } : null))
            }
            label="Restaurant Logo"
            description="Square image recommended (e.g., 400x400px)"
            aspectRatio="aspect-square"
          />
          <ImageUploader
            type="cover"
            currentUrl={restaurant.cover_photo_url}
            onUpload={(url) =>
              setRestaurant((r) => (r ? { ...r, cover_photo_url: url } : null))
            }
            onRemove={() =>
              setRestaurant((r) => (r ? { ...r, cover_photo_url: null } : null))
            }
            label="Cover Photo"
            description="Wide image recommended (e.g., 1200x675px)"
            aspectRatio="aspect-video"
          />
        </div>

        <div className="mt-6">
          <GalleryManager
            images={restaurant.gallery_urls}
            onImagesChange={(urls) =>
              setRestaurant((r) => (r ? { ...r, gallery_urls: urls } : null))
            }
            maxImages={10}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-xl bg-bfw-orange px-8 py-3 font-heading text-sm font-semibold text-white transition hover:bg-bfw-orange/90 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
