"use client";

import { useEffect, useState } from "react";
import {
  IconMail,
  IconPhone,
  IconUsers,
  IconX,
  IconPercent,
  IconStar,
  IconHeart,
} from "@/components/layout/icons";
import type { SVGProps } from "react";

interface FormState {
  name: string;
  phone: string;
  email: string;
}

// Custom icons for benefits
function IconTag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}

function IconBook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function IconHandshake(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-2" />
      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
      <path d="M3 4h8" />
    </svg>
  );
}

const BENEFITS = [
  {
    title: "Exclusive Deals & Discounts",
    description: "Up to 50% off at 200+ partner restaurants and dining spots.",
    icon: IconTag,
  },
  {
    title: "Early Recipe Access",
    description: "Receive premium content for free when you join our list.",
    icon: IconBook,
  },
  {
    title: "Food Events & Networking",
    description:
      "Discover tastings, pop-ups, and foodie meetups across Singapore.",
    icon: IconCalendar,
  },
  {
    title: "Partnership Opportunities",
    description: "Collaborate with us to reach local diners and grow together.",
    icon: IconHandshake,
  },
  {
    title: "Community Access",
    description: "Get invited to our exclusive community of food lovers.",
    icon: IconUsers,
  },
];

const DISMISS_KEY = "bfwNewsletterDismissed";

const FLOATING_EMOJIS = [
  { emoji: "🍕", top: "20%", left: "5%", delay: "0s" },
  { emoji: "🍔", top: "60%", right: "8%", delay: "1s" },
  { emoji: "🍣", top: "30%", right: "15%", delay: "2s" },
  { emoji: "🍜", bottom: "20%", left: "12%", delay: "1.5s" },
];

export function NewsletterSignup() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (sessionStorage.getItem(DISMISS_KEY)) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsOpen(true);
    }, 1400);

    return () => window.clearTimeout(timeout);
  }, []);

  const close = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DISMISS_KEY, "true");
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (form.name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate Singapore phone number if provided
    if (form.phone.trim()) {
      const cleanPhone = form.phone.replace(/[\s\-()]/g, "");
      const sgPhoneRegex = /^(\+65)?[689]\d{7}$/;
      if (!sgPhoneRegex.test(cleanPhone)) {
        setError(
          "Please enter a valid Singapore phone number (8 digits starting with 6, 8, or 9).",
        );
        return;
      }
    }

    setStatus("submitting");

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
          source: "bfw_website",
          tags: ["newsletter", "vip"],
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
      setError("Something went wrong. Please try again shortly.");
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6 md:py-10">
      <button
        type="button"
        aria-label="Close newsletter signup"
        onClick={close}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative z-10 my-auto w-full max-w-[1100px] overflow-hidden rounded-2xl bg-white shadow-[0_35px_80px_rgba(0,0,0,0.25)] md:rounded-3xl">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0f2b52] via-[#12335f] to-[#10294a] px-5 py-5 text-white md:px-10 md:py-7">
          {/* Floating food emojis */}
          {FLOATING_EMOJIS.map((item, idx) => (
            <div
              key={idx}
              className="pointer-events-none absolute animate-float text-2xl opacity-30"
              style={{
                top: item.top,
                left: item.left,
                right: item.right,
                bottom: item.bottom,
                animationDelay: item.delay,
              }}
            >
              {item.emoji}
            </div>
          ))}
          <h2 className="relative z-10 font-heading text-[18px] font-semibold leading-tight md:text-[28px]">
            Get the Best Food Deals & Dining Experience in Singapore
          </h2>
          <p className="relative z-10 mt-2 max-w-[720px] font-body text-[13px] text-white/80 md:text-[16px]">
            Join 10,000+ food lovers receiving exclusive promotions from 200+
            partner restaurants.
          </p>
          <button
            type="button"
            onClick={close}
            className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:right-6 md:top-6 md:h-9 md:w-9"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 px-4 pb-6 pt-5 md:grid-cols-[1.1fr_0.9fr] md:gap-8 md:px-10 md:pb-8 md:pt-7">
          <div>
            <div className="flex flex-wrap gap-2 md:gap-3">
              <span className="rounded-full bg-[#1d3356] px-3 py-1.5 text-[12px] font-semibold text-white md:px-4 md:py-2 md:text-[13px]">
                Weekly Food Deals
              </span>
              <span className="rounded-full bg-bfw-orange px-3 py-1.5 text-[12px] font-semibold text-white md:px-4 md:py-2 md:text-[13px]">
                Save Up To 50%
              </span>
            </div>

            <div className="mt-4 space-y-3 md:mt-6 md:space-y-4">
              {BENEFITS.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl border border-[#eef0f4] bg-white px-4 py-3 shadow-sm md:gap-4 md:rounded-2xl md:px-5 md:py-4"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#203a63] md:mt-1 md:h-9 md:w-9">
                    <item.icon className="h-4 w-4 text-white md:h-5 md:w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-[14px] font-semibold text-[#1d2b44] md:text-[16px]">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 font-body text-[12px] leading-snug text-[#667085] md:mt-1 md:text-[14px]">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-center font-heading text-[18px] font-semibold text-[#1d2b44] md:text-[24px]">
              Get{" "}
              <span className="bg-[#ffe066] px-1.5 text-[#1d2b44] md:px-2">
                Exclusive Food Deals
              </span>{" "}
              Every Week!
            </h3>

            {status === "success" ? (
              <div className="mt-4 rounded-xl border border-[#e9edf2] bg-[#f7fafc] px-4 py-4 text-center md:mt-6 md:rounded-2xl md:px-6 md:py-6">
                <p className="font-heading text-[16px] font-semibold text-[#1d2b44] md:text-[18px]">
                  Thanks for joining!
                </p>
                <p className="mt-2 font-body text-[13px] text-[#667085] md:text-[14px]">
                  We will send your first round of food deals soon.
                </p>
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="mt-4 space-y-4 md:mt-6 md:space-y-5"
              >
                <label className="block">
                  <span className="font-heading text-[14px] font-medium text-[#1d2b44]">
                    Your Name
                  </span>
                  <div className="relative mt-2">
                    <IconUsers className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#ff5a45]" />
                    <input
                      value={form.name}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Enter your name"
                      className="h-12 w-full rounded-xl border border-[#e5e8ee] bg-white pl-12 pr-4 font-body text-[15px] text-[#101828] outline-none transition focus:border-bfw-orange focus:ring-4 focus:ring-bfw-orange/15"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="font-heading text-[14px] font-medium text-[#1d2b44]">
                    Email Address
                  </span>
                  <div className="relative mt-2">
                    <IconMail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#ff5a45]" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      placeholder="Enter your email"
                      className="h-12 w-full rounded-xl border border-[#e5e8ee] bg-white pl-12 pr-4 font-body text-[15px] text-[#101828] outline-none transition focus:border-bfw-orange focus:ring-4 focus:ring-bfw-orange/15"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="font-heading text-[14px] font-medium text-[#1d2b44]">
                    Phone Number
                  </span>
                  <div className="relative mt-2">
                    <IconPhone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#ff5a45]" />
                    <input
                      inputMode="tel"
                      value={form.phone}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }))
                      }
                      placeholder="Enter your phone number"
                      className="h-12 w-full rounded-xl border border-[#e5e8ee] bg-white pl-12 pr-4 font-body text-[15px] text-[#101828] outline-none transition focus:border-bfw-orange focus:ring-4 focus:ring-bfw-orange/15"
                    />
                  </div>
                </label>

                {error ? (
                  <p className="rounded-xl bg-red-50 px-4 py-3 font-body text-[13px] text-red-700">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full rounded-xl bg-[#1d3356] py-3 font-heading text-[16px] font-semibold text-white transition hover:bg-[#162944] disabled:opacity-60"
                >
                  {status === "submitting" ? "Submitting..." : "Subscribe Now"}
                </button>
                <div className="text-center font-body text-[13px] text-[#1aa36d]">
                  Join our foodie community today | 10,327 members
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
