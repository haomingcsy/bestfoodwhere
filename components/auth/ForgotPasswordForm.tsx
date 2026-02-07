"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { IconMail } from "@/components/layout/icons";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );

      if (resetError) {
        setError(resetError.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-heading text-xl font-bold text-gray-900">
              Check Your Email
            </h2>
            <p className="mt-2 font-body text-sm text-gray-600">
              We&apos;ve sent a password reset link to{" "}
              <span className="font-medium">{email}</span>
            </p>
            <p className="mt-4 font-body text-sm text-gray-500">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className="font-medium text-bfw-orange hover:underline"
              >
                try again
              </button>
            </p>
          </div>

          <div className="mt-6">
            <Link
              href="/login"
              className="block w-full rounded-xl border border-gray-200 py-3 text-center font-heading text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-bold text-gray-900">
            Forgot Password?
          </h1>
          <p className="mt-2 font-body text-sm text-gray-600">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-heading text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <div className="relative">
              <IconMail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-bfw-orange py-3 font-heading text-base font-semibold text-white transition hover:bg-bfw-orange/90 disabled:opacity-60"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-gray-600">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-bfw-orange hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
