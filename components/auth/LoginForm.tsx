"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { IconMail } from "@/components/layout/icons";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { AuthDivider } from "./AuthDivider";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const urlError = searchParams.get("error");
  const urlMessage = searchParams.get("message");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    // Initialize with URL error message
    if (urlError === "no_account") {
      return urlMessage || "No account found. Please sign up first.";
    }
    if (urlError === "auth_callback_failed") {
      return "Authentication failed. Please try again.";
    }
    return null;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Please verify your email address before logging in.");
        } else {
          setError(signInError.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Refresh the router to update session, then redirect
        router.refresh();

        // Small delay to ensure session is properly set
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Get user profile to determine redirect
        const { data: profile } = await supabase
          .from("profiles")
          .select("account_type")
          .eq("id", data.user.id)
          .single();

        let destination = "/dashboard";
        if (profile?.account_type === "restaurant") {
          destination = "/restaurant/dashboard";
        } else if (profile?.account_type === "admin") {
          destination = "/admin";
        }

        window.location.href = destination;
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="p-2">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 font-body text-gray-600">
            Sign in to continue to your account
          </p>
        </div>

        <GoogleSignInButton redirectTo={redirectTo} />
        <AuthDivider />

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

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-heading text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-12 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="font-body text-sm text-bfw-orange hover:underline"
            >
              Forgot password?
            </Link>
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
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center font-body text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-bfw-orange hover:underline"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
