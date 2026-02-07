"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface ProfileData {
  display_name: string;
  phone: string;
  email: string;
}

interface ConsumerProfileData {
  dietary_preferences: string[];
  favorite_cuisines: string[];
  email_notifications: boolean;
  deals_notifications: boolean;
}

const DIETARY_OPTIONS = [
  "Halal",
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
];

const CUISINE_OPTIONS = [
  "Chinese",
  "Malay",
  "Indian",
  "Western",
  "Japanese",
  "Korean",
  "Thai",
  "Vietnamese",
  "Italian",
  "Mexican",
];

export default function SettingsPage() {
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

  const [consumerProfile, setConsumerProfile] = useState<ConsumerProfileData>({
    dietary_preferences: [],
    favorite_cuisines: [],
    email_notifications: true,
    deals_notifications: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const [profileRes, consumerRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase
            .from("consumer_profiles")
            .select("*")
            .eq("id", user.id)
            .single(),
        ]);

        if (profileRes.data) {
          setProfile({
            display_name: profileRes.data.display_name || "",
            phone: profileRes.data.phone || "",
            email: profileRes.data.email || user.email || "",
          });
        }

        if (consumerRes.data) {
          setConsumerProfile({
            dietary_preferences: consumerRes.data.dietary_preferences || [],
            favorite_cuisines: consumerRes.data.favorite_cuisines || [],
            email_notifications: consumerRes.data.email_notifications ?? true,
            deals_notifications: consumerRes.data.deals_notifications ?? true,
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

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name,
          phone: profile.phone,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update consumer profile
      const { error: consumerError } = await supabase
        .from("consumer_profiles")
        .upsert({
          id: user.id,
          ...consumerProfile,
        });

      if (consumerError) throw consumerError;

      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({
        type: "error",
        text: "Failed to save settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDietary = (option: string) => {
    setConsumerProfile((prev) => ({
      ...prev,
      dietary_preferences: prev.dietary_preferences.includes(option)
        ? prev.dietary_preferences.filter((d) => d !== option)
        : [...prev.dietary_preferences, option],
    }));
  };

  const toggleCuisine = (option: string) => {
    setConsumerProfile((prev) => ({
      ...prev,
      favorite_cuisines: prev.favorite_cuisines.includes(option)
        ? prev.favorite_cuisines.filter((c) => c !== option)
        : [...prev.favorite_cuisines, option],
    }));
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
          Settings
        </h1>
        <p className="mt-1 font-body text-gray-600">
          Manage your profile and preferences
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

      {/* Profile Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900">
          Profile Information
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
              Display Name
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

      {/* Preferences Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900">
          Food Preferences
        </h2>
        <div className="mt-4 space-y-6">
          <div>
            <label className="mb-3 block font-heading text-sm font-medium text-gray-700">
              Dietary Requirements
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleDietary(option)}
                  className={`rounded-full px-4 py-2 font-body text-sm transition ${
                    consumerProfile.dietary_preferences.includes(option)
                      ? "bg-bfw-orange text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-3 block font-heading text-sm font-medium text-gray-700">
              Favorite Cuisines
            </label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleCuisine(option)}
                  className={`rounded-full px-4 py-2 font-body text-sm transition ${
                    consumerProfile.favorite_cuisines.includes(option)
                      ? "bg-bfw-orange text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900">
          Notifications
        </h2>
        <div className="mt-4 space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="font-heading text-sm font-medium text-gray-900">
                Email Notifications
              </p>
              <p className="font-body text-xs text-gray-500">
                Receive updates about new restaurants and features
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setConsumerProfile((p) => ({
                  ...p,
                  email_notifications: !p.email_notifications,
                }))
              }
              className={`relative h-6 w-11 rounded-full transition ${
                consumerProfile.email_notifications
                  ? "bg-bfw-orange"
                  : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  consumerProfile.email_notifications ? "translate-x-5" : ""
                }`}
              />
            </button>
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="font-heading text-sm font-medium text-gray-900">
                Deals Notifications
              </p>
              <p className="font-body text-xs text-gray-500">
                Get notified about exclusive deals and promotions
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setConsumerProfile((p) => ({
                  ...p,
                  deals_notifications: !p.deals_notifications,
                }))
              }
              className={`relative h-6 w-11 rounded-full transition ${
                consumerProfile.deals_notifications
                  ? "bg-bfw-orange"
                  : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  consumerProfile.deals_notifications ? "translate-x-5" : ""
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Save Button */}
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
