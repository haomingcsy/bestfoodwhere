"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { IconMail, IconUsers, IconPhone } from "@/components/layout/icons";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { AuthDivider } from "./AuthDivider";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

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

interface FormState {
  email: string;
  password: string;
  displayName: string;
  phone: string;
  dietaryPreferences: string[];
  favoriteCuisines: string[];
}

export function ConsumerSignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    displayName: "",
    phone: "",
    dietaryPreferences: [],
    favoriteCuisines: [],
  });

  const validateStep = (currentStep: number): boolean => {
    setError(null);

    if (currentStep === 1) {
      if (!form.email.includes("@")) {
        setError("Please enter a valid email address.");
        return false;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (form.displayName.trim().length < 2) {
        setError("Please enter your name.");
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            display_name: form.displayName.trim(),
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("This email is already registered. Please sign in instead.");
        } else {
          setError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          email: form.email.trim(),
          display_name: form.displayName.trim(),
          phone: form.phone.trim() || null,
          account_type: "consumer",
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }

        // Create consumer profile
        const { error: consumerError } = await supabase
          .from("consumer_profiles")
          .insert({
            id: authData.user.id,
            dietary_preferences: form.dietaryPreferences,
            favorite_cuisines: form.favoriteCuisines,
            email_notifications: true,
            deals_notifications: true,
          });

        if (consumerError) {
          console.error("Consumer profile creation error:", consumerError);
        }

        // Sync with HubSpot
        try {
          await fetch("/api/hubspot/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: form.email.trim(),
              name: form.displayName.trim(),
              phone: form.phone.trim(),
              source: "bfw_signup",
              tags: ["member", "consumer"],
            }),
          });
        } catch {
          // HubSpot sync failure is non-critical
        }

        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const toggleDietary = (option: string) => {
    setForm((prev) => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(option)
        ? prev.dietaryPreferences.filter((d) => d !== option)
        : [...prev.dietaryPreferences, option],
    }));
  };

  const toggleCuisine = (option: string) => {
    setForm((prev) => ({
      ...prev,
      favoriteCuisines: prev.favoriteCuisines.includes(option)
        ? prev.favoriteCuisines.filter((c) => c !== option)
        : [...prev.favoriteCuisines, option],
    }));
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-bold text-gray-900">
            Create Your Account
          </h1>
          <p className="mt-2 font-body text-sm text-gray-600">
            Join as a Food Lover
          </p>
        </div>

        {/* Step indicators */}
        <div className="mb-6 flex items-center justify-center gap-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex h-8 w-8 items-center justify-center rounded-full font-heading text-sm font-semibold transition-colors ${
                s === step
                  ? "bg-bfw-orange text-white"
                  : s < step
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {s < step ? (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                s
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <GoogleSignInButton redirectTo="/dashboard" intent="signup" />
            <AuthDivider />
          </>
        )}

        <div className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <IconMail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
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
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    placeholder="Create a password"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
                  />
                </div>
                <PasswordStrengthIndicator password={form.password} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <div className="relative">
                  <IconUsers className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, displayName: e.target.value }))
                    }
                    placeholder="Enter your name"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block font-heading text-sm font-medium text-gray-700">
                  Phone Number{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <IconPhone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+65 9XXX XXXX"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="mb-3 block font-heading text-sm font-medium text-gray-700">
                  Dietary Preferences{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleDietary(option)}
                      className={`rounded-full px-4 py-2 font-body text-sm transition ${
                        form.dietaryPreferences.includes(option)
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
                  Favorite Cuisines{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CUISINE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleCuisine(option)}
                      className={`rounded-full px-4 py-2 font-body text-sm transition ${
                        form.favoriteCuisines.includes(option)
                          ? "bg-bfw-orange text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={nextStep}
            disabled={isLoading}
            className="w-full rounded-xl bg-bfw-orange py-3 font-heading text-base font-semibold text-white transition hover:bg-bfw-orange/90 disabled:opacity-60"
          >
            {isLoading
              ? "Creating account..."
              : step === 3
                ? "Complete Signup"
                : `Continue - Step ${step}/3`}
          </button>

          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="w-full py-2 font-body text-sm text-gray-500 transition hover:text-gray-700"
            >
              ← Go back
            </button>
          )}
        </div>

        <p className="mt-6 text-center font-body text-sm text-gray-600">
          Already have an account?{" "}
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
