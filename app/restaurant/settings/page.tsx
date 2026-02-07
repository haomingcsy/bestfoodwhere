"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface ProfileData {
  display_name: string;
  phone: string;
  email: string;
}

export default function RestaurantSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [profile, setProfile] = useState<ProfileData>({
    display_name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfile({
            display_name: data.display_name || "",
            phone: data.phone || "",
            email: data.email || user.email || "",
          });
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name,
          phone: profile.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error) {
      console.error("Error saving:", error);
      setMessage({
        type: "error",
        text: "Failed to save settings. Please try again.",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Account Settings
        </h1>
        <p className="mt-1 font-body text-gray-600">
          Manage your account preferences
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

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900">
          Account Information
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
              Contact Name
            </label>
            <input
              type="text"
              value={profile.display_name}
              onChange={(e) =>
                setProfile((p) => ({ ...p, display_name: e.target.value }))
              }
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
            />
          </div>
          <div>
            <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 font-body text-[15px] text-gray-500"
            />
            <p className="mt-1 font-body text-xs text-gray-400">
              Email cannot be changed
            </p>
          </div>
          <div>
            <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) =>
                setProfile((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="+65 9XXX XXXX"
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-xl bg-bfw-orange px-6 py-3 font-heading text-sm font-semibold text-white transition hover:bg-bfw-orange/90 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
