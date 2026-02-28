"use client";

import { useState } from "react";
import { IconMail, IconPhone, IconUsers } from "@/components/layout/icons";

interface FormState {
  name: string;
  email: string;
  phone: string;
}

export function VIPClubSignup() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
  });

  const validateStep = (currentStep: number): boolean => {
    setError(null);

    if (currentStep === 1) {
      if (form.name.trim().length < 2) {
        setError("Please enter your name.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (!form.email.includes("@")) {
        setError("Please enter a valid email address.");
        return false;
      }
    }

    if (currentStep === 3) {
      // Phone is optional, but validate if provided
      if (form.phone.trim()) {
        const cleanPhone = form.phone.replace(/[\s\-()]/g, "");
        const sgPhoneRegex = /^(\+65)?[689]\d{7}$/;
        if (!sgPhoneRegex.test(cleanPhone)) {
          setError("Please enter a valid Singapore phone number.");
          return false;
        }
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        submitForm();
      }
    }
  };

  const submitForm = async () => {
    setStatus("submitting");
    setError(null);

    try {
      // Get UTM parameters
      const params =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams();

      const response = await fetch("/api/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          name: form.name.trim(),
          phone: form.phone.trim(),
          source: "bfw_vip_club",
          tags: ["newsletter", "vip", "vip_signup"],
          send_welcome: true,
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          utm_source: params.get("utm_source") || "",
          utm_medium: params.get("utm_medium") || "",
          utm_campaign: params.get("utm_campaign") || "",
          utm_content: params.get("utm_content") || "",
          utm_term: params.get("utm_term") || "",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("success");
      } else {
        setError(result.error || "Something went wrong. Please try again.");
        setStatus("idle");
      }
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="border-b border-gray-200 bg-white px-4 py-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Left side - Text */}
          <div className="max-w-[600px]">
            <h2 className="font-heading text-2xl font-bold text-[#333] md:text-3xl">
              <span className="text-[#333]">MEMBERS ONLY:</span> Join
              BestFoodWhere&apos;s{" "}
              <span className="bg-bfw-orange px-2 text-white">
                Exclusive VIP club
              </span>{" "}
              Today!
            </h2>
            <p className="mt-3 font-heading text-base font-semibold text-bfw-orange md:text-lg">
              FREE VIP Foodie Membership - Limited Spots Available
            </p>
            <p className="mt-4 font-body text-sm leading-relaxed text-[#666] md:text-base">
              We&apos;ve secured exclusive deals with 200+ top Singapore
              restaurants just for our members. Sign up to receive weekly
              promotions, join our food events, and connect with fellow
              enthusiasts in our private Facebook community.
            </p>
          </div>

          {/* Right side - Form */}
          <div className="w-full max-w-[400px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:w-auto">
            {status === "success" ? (
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-8 w-8 text-green-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-heading text-xl font-semibold text-[#333]">
                  Welcome to the VIP Club!
                </h3>
                <p className="mt-2 font-body text-sm text-[#666]">
                  Check your email for exclusive deals and perks.
                </p>
              </div>
            ) : (
              <>
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

                {/* Form fields */}
                <div className="space-y-4">
                  {step === 1 && (
                    <div>
                      <label className="mb-2 block font-heading text-sm font-medium text-[#333]">
                        Your Name
                      </label>
                      <div className="relative">
                        <IconUsers className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, name: e.target.value }))
                          }
                          placeholder="Enter your name"
                          className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
                          onKeyDown={(e) => e.key === "Enter" && nextStep()}
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <label className="mb-2 block font-heading text-sm font-medium text-[#333]">
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
                          placeholder="Enter your email"
                          className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
                          onKeyDown={(e) => e.key === "Enter" && nextStep()}
                        />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div>
                      <label className="mb-2 block font-heading text-sm font-medium text-[#333]">
                        Phone Number{" "}
                        <span className="font-normal text-gray-400">
                          (optional)
                        </span>
                      </label>
                      <div className="relative">
                        <IconPhone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, phone: e.target.value }))
                          }
                          placeholder="Enter your phone"
                          className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 font-body text-[15px] text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
                          onKeyDown={(e) => e.key === "Enter" && nextStep()}
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 font-body text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  <button
                    onClick={nextStep}
                    disabled={status === "submitting"}
                    className="w-full rounded-xl bg-bfw-orange py-3 font-heading text-base font-semibold text-white transition hover:bg-bfw-orange-hover disabled:opacity-60"
                  >
                    {status === "submitting"
                      ? "Submitting..."
                      : step === 3
                        ? "Join VIP Club"
                        : `Sign Up - Step ${step}/3`}
                  </button>

                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="w-full py-2 font-body text-sm text-gray-500 transition hover:text-gray-700"
                    >
                      ← Go back
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
