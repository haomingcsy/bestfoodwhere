"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminSettingsPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handlePromoteToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();

      // Find user by email
      const { data: profile, error: findError } = await supabase
        .from("profiles")
        .select("id, email, display_name, account_type")
        .eq("email", email.trim())
        .single();

      if (findError || !profile) {
        setMessage({ type: "error", text: "User not found with that email." });
        setIsLoading(false);
        return;
      }

      if (profile.account_type === "admin") {
        setMessage({ type: "error", text: "User is already an admin." });
        setIsLoading(false);
        return;
      }

      // Promote to admin
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ account_type: "admin" })
        .eq("id", profile.id);

      if (updateError) {
        setMessage({
          type: "error",
          text: "Failed to promote user. " + updateError.message,
        });
        setIsLoading(false);
        return;
      }

      setMessage({
        type: "success",
        text: `Successfully promoted ${profile.display_name || profile.email} to admin!`,
      });
      setEmail("");
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="mt-1 font-body text-gray-600">
          Admin panel settings and user management
        </p>
      </div>

      {/* Promote to Admin */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900 mb-4">
          Promote User to Admin
        </h2>
        <p className="font-body text-sm text-gray-600 mb-4">
          Enter the email of an existing user to promote them to admin. This
          will give them full access to the admin panel.
        </p>

        <form onSubmit={handlePromoteToAdmin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block font-heading text-sm font-medium text-gray-700 mb-2"
            >
              User Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="h-12 w-full max-w-md rounded-xl border border-gray-200 bg-gray-50 px-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
            />
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

          <button
            type="submit"
            disabled={isLoading || !email}
            className="rounded-xl bg-bfw-orange px-6 py-3 font-heading text-sm font-semibold text-white transition hover:bg-bfw-orange/90 disabled:opacity-50"
          >
            {isLoading ? "Promoting..." : "Promote to Admin"}
          </button>
        </form>
      </div>

      {/* SQL Reference */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900 mb-4">
          Manual Admin Promotion (SQL)
        </h2>
        <p className="font-body text-sm text-gray-600 mb-4">
          If you need to promote a user directly via Supabase SQL Editor:
        </p>
        <pre className="rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">
          {`-- Replace 'user@example.com' with the user's email
UPDATE public.profiles
SET account_type = 'admin'
WHERE email = 'user@example.com';`}
        </pre>
      </div>

      {/* RLS Info */}
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
        <h2 className="font-heading text-lg font-semibold text-yellow-800 mb-2">
          Important: RLS Policies
        </h2>
        <p className="font-body text-sm text-yellow-700">
          The promotion above uses the browser client and is subject to RLS
          policies. If promotion fails due to RLS, use the Supabase Dashboard
          SQL Editor to run the command directly with service role access.
        </p>
      </div>
    </div>
  );
}
