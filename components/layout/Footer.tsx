"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconFacebook,
  IconInstagram,
  IconPinterest,
  IconMail,
  IconPhone,
  IconUsers,
} from "./icons";

const FOOTER_LINKS = {
  findFood: [
    { href: "/postal-code-food-finder", label: "Postal Code Finder" },
    { href: "/promotions-and-deals", label: "Food Deals" },
    { href: "/cuisine/all", label: "Cuisines" },
    { href: "/dining/all", label: "Dining Type" },
  ],
  shoppingMalls: [
    { href: "/shopping-malls", label: "All Malls" },
    { href: "/shopping-malls/jewel", label: "Jewel Changi" },
    { href: "/shopping-malls/vivocity", label: "VivoCity" },
    { href: "/shopping-malls/marina-bay-sands", label: "Marina Bay Sands" },
    { href: "/shopping-malls/suntec-city", label: "Suntec City" },
  ],
  foodGuides: [
    { href: "/reviews", label: "Reviews" },
    { href: "/restaurant-highlights", label: "Restaurant Highlights" },
    { href: "/dining-guides", label: "Dining Guides" },
    { href: "/dining-etiquette", label: "Dining Etiquette" },
    { href: "/menus", label: "Menus" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/our-story", label: "Our Story" },
    { href: "/contact-us", label: "Contact Us" },
    { href: "/advertise", label: "Advertise With Us" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
} as const;

interface FormState {
  name: string;
  email: string;
  phone: string;
}

export function Footer() {
  const year = new Date().getFullYear();
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
    if (currentStep === 1 && form.name.trim().length < 2) {
      setError("Please enter your name.");
      return false;
    }
    if (currentStep === 2 && !form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return false;
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

      const response = await fetch("/api/hubspot/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          name: form.name.trim(),
          phone: form.phone.trim(),
          source: "bfw_vip_club",
          tags: ["newsletter", "vip", "footer_signup"],
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
        setForm({ name: "", email: "", phone: "" });
        setStep(1);
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
    <footer className="relative w-full overflow-hidden bg-[#1d2b44]">
      {/* Gradient orbs */}
      <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-bfw-orange/15 blur-[100px]" />
      <div className="absolute -right-40 bottom-40 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]" />

      <div className="relative z-10">
        {/* VIP Section */}
        <div className="border-b border-white/5">
          <div className="mx-auto max-w-[1200px] px-4 py-14">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl md:p-10">
              <div className="grid items-center gap-8 lg:grid-cols-2">
                {/* Left - Text */}
                <div>
                  <h2 className="font-heading text-2xl font-bold text-white md:text-3xl">
                    MEMBERS ONLY: Join BestFoodWhere&apos;s{" "}
                    <span className="bg-[#ffe066] px-2 text-[#1d2b44]">
                      Exclusive VIP club
                    </span>{" "}
                    Today!
                  </h2>
                  <p className="mt-4 font-heading text-lg font-semibold text-bfw-orange">
                    FREE VIP Foodie Membership - Limited Spots Available
                  </p>
                  <p className="mt-4 font-body text-base text-white/70 leading-relaxed">
                    We&apos;ve secured exclusive deals with 200+ top Singapore
                    restaurants just for our members. Sign up to receive weekly
                    promotions, join our food events, and connect with fellow
                    enthusiasts in our private Facebook community.
                  </p>
                </div>

                {/* Right - Step Form */}
                <div>
                  {status === "success" ? (
                    <div className="flex items-center justify-center rounded-2xl bg-white/5 p-8">
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                          <svg
                            className="h-8 w-8 text-green-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <h3 className="font-heading text-xl font-semibold text-white">
                          Welcome to the VIP Club!
                        </h3>
                        <p className="mt-2 font-body text-sm text-white/60">
                          Check your email for exclusive deals.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Step indicators */}
                      <div className="flex items-center justify-center gap-3">
                        {[1, 2, 3].map((s) => (
                          <div key={s} className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full font-heading text-sm font-semibold transition-all ${
                                s === step
                                  ? "bg-bfw-orange text-white shadow-[0_0_20px_rgba(239,95,42,0.4)]"
                                  : s < step
                                    ? "bg-green-500 text-white"
                                    : "bg-white/10 text-white/40"
                              }`}
                            >
                              {s < step ? (
                                <svg
                                  className="h-5 w-5"
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
                            {s < 3 && (
                              <div
                                className={`h-0.5 w-8 rounded-full transition-colors ${s < step ? "bg-green-500" : "bg-white/10"}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Step content */}
                      <div className="min-h-[120px]">
                        {step === 1 && (
                          <div className="space-y-3">
                            <label className="block font-heading text-sm font-medium text-white/80">
                              What&apos;s your name?
                            </label>
                            <div className="relative">
                              <IconUsers className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                              <input
                                type="text"
                                value={form.name}
                                onChange={(e) =>
                                  setForm((p) => ({
                                    ...p,
                                    name: e.target.value,
                                  }))
                                }
                                placeholder="Enter your name"
                                className="h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 font-body text-base text-white placeholder-white/30 outline-none backdrop-blur-sm transition focus:border-bfw-orange focus:bg-white/10"
                                onKeyDown={(e) =>
                                  e.key === "Enter" && nextStep()
                                }
                              />
                            </div>
                          </div>
                        )}

                        {step === 2 && (
                          <div className="space-y-3">
                            <label className="block font-heading text-sm font-medium text-white/80">
                              Where should we send deals?
                            </label>
                            <div className="relative">
                              <IconMail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                              <input
                                type="email"
                                value={form.email}
                                onChange={(e) =>
                                  setForm((p) => ({
                                    ...p,
                                    email: e.target.value,
                                  }))
                                }
                                placeholder="Enter your email"
                                className="h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 font-body text-base text-white placeholder-white/30 outline-none backdrop-blur-sm transition focus:border-bfw-orange focus:bg-white/10"
                                onKeyDown={(e) =>
                                  e.key === "Enter" && nextStep()
                                }
                              />
                            </div>
                          </div>
                        )}

                        {step === 3 && (
                          <div className="space-y-3">
                            <label className="block font-heading text-sm font-medium text-white/80">
                              Phone number{" "}
                              <span className="font-normal text-white/40">
                                (optional)
                              </span>
                            </label>
                            <div className="relative">
                              <IconPhone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                              <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) =>
                                  setForm((p) => ({
                                    ...p,
                                    phone: e.target.value,
                                  }))
                                }
                                placeholder="Enter your phone"
                                className="h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 font-body text-base text-white placeholder-white/30 outline-none backdrop-blur-sm transition focus:border-bfw-orange focus:bg-white/10"
                                onKeyDown={(e) =>
                                  e.key === "Enter" && nextStep()
                                }
                              />
                            </div>
                          </div>
                        )}

                        {error && (
                          <p className="mt-3 rounded-lg bg-red-500/20 px-4 py-2 font-body text-sm text-red-300">
                            {error}
                          </p>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3">
                        {step > 1 && (
                          <button
                            onClick={() => setStep(step - 1)}
                            className="h-12 rounded-xl border border-white/10 bg-white/5 px-6 font-heading text-sm font-medium text-white/70 transition hover:bg-white/10"
                          >
                            Back
                          </button>
                        )}
                        <button
                          onClick={nextStep}
                          disabled={status === "submitting"}
                          className="h-12 flex-1 rounded-xl bg-bfw-orange font-heading text-base font-semibold text-white shadow-[0_0_30px_rgba(239,95,42,0.3)] transition hover:bg-bfw-orange-hover hover:shadow-[0_0_40px_rgba(239,95,42,0.4)] disabled:opacity-60"
                        >
                          {status === "submitting"
                            ? "Joining..."
                            : step === 3
                              ? "Join VIP Club"
                              : "Continue"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mx-auto max-w-[1200px] px-4 py-14">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h4 className="font-heading text-sm font-semibold text-white">
                Find Food
              </h4>
              <ul className="mt-5 space-y-3">
                {FOOTER_LINKS.findFood.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="font-body text-sm text-white/40 transition hover:text-bfw-orange"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-white">
                Shopping Malls
              </h4>
              <ul className="mt-5 space-y-3">
                {FOOTER_LINKS.shoppingMalls.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="font-body text-sm text-white/40 transition hover:text-bfw-orange"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-white">
                Food Guides
              </h4>
              <ul className="mt-5 space-y-3">
                {FOOTER_LINKS.foodGuides.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="font-body text-sm text-white/40 transition hover:text-bfw-orange"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-white">
                Company
              </h4>
              <ul className="mt-5 space-y-3">
                {FOOTER_LINKS.company.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="font-body text-sm text-white/40 transition hover:text-bfw-orange"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 md:flex-row">
            <p className="font-body text-sm text-white/30">
              © {year} BestFoodWhere
            </p>
            <p className="font-body text-sm text-white/30">
              Powered by{" "}
              <a
                href="https://quape.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bfw-orange hover:underline"
              >
                quape.com
              </a>
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/bestfoodwhere/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition hover:border-bfw-orange hover:text-bfw-orange"
              >
                <IconFacebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/bestfoodwhere/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition hover:border-bfw-orange hover:text-bfw-orange"
              >
                <IconInstagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.pinterest.com/bestfoodwhere/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition hover:border-bfw-orange hover:text-bfw-orange"
              >
                <IconPinterest className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
