"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconMail,
  IconPhone,
  IconUsers,
  IconFacebook,
  IconInstagram,
  IconPinterest,
} from "@/components/layout/icons";

// ============ Types ============
interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  privacyAgreed: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
}

// ============ Data ============
const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How can I list my restaurant on BestFoodWhere?",
    answer:
      'Listing your restaurant on BestFoodWhere is easy! Visit our listing page and contact us via WhatsApp. Our team will review your submission and get your restaurant listed within 2-3 business days. Premium listing options with enhanced features are also available.',
  },
  {
    question: "How do I report incorrect information about a restaurant?",
    answer:
      'We strive for accuracy across our platform. If you spot any incorrect information, please use our contact form and select "Technical Support" as the subject. Include the restaurant name, location, and the information that needs correction. Our content team will verify and update the information promptly.',
  },
  {
    question: "How can I partner with BestFoodWhere for promotions?",
    answer:
      "We offer various partnership opportunities for restaurants, food brands, and mall operators. These include featured listings, promotional deals, banner advertisements, and co-branded marketing campaigns. Please contact our partnerships team at partnerships@bestfoodwhere.sg or use our contact form selecting \"Business Partnership\" as the subject.",
  },
  {
    question: "Do you cover restaurants outside of shopping malls?",
    answer:
      "While we initially focused on mall dining options, we're expanding our coverage to include standalone restaurants, food courts, and other dining establishments across Singapore. Stay tuned for our comprehensive coverage of Singapore's entire food scene coming soon!",
  },
  {
    question: "How can I subscribe to your newsletter?",
    answer:
      "You can subscribe to our newsletter by entering your email address in the subscription box at the bottom of our homepage. Our newsletter includes the latest restaurant openings, exclusive deals, food trends, and dining recommendations in Singapore. You can customize your preferences after subscribing to receive content that interests you most.",
  },
];

const SUBJECT_OPTIONS = [
  "Restaurant Listing",
  "Business Partnership",
  "Advertising Inquiry",
  "Technical Support",
  "Food Recommendations",
  "Other",
];

const FLOATING_EMOJIS = [
  { emoji: "🍕", top: "10%", left: "10%", delay: "0s", duration: "15s" },
  { emoji: "🍔", top: "20%", right: "15%", delay: "1s", duration: "18s" },
  { emoji: "🍣", bottom: "15%", left: "15%", delay: "2s", duration: "20s" },
  { emoji: "🍜", bottom: "25%", right: "10%", delay: "1.5s", duration: "17s" },
  { emoji: "🍦", top: "40%", left: "20%", delay: "0.5s", duration: "22s" },
  { emoji: "🥗", top: "30%", right: "30%", delay: "2.5s", duration: "19s" },
];

// ============ Component ============
export default function ContactUsPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    privacyAgreed: false,
  });

  // Scroll to form when clicking Get In Touch
  const scrollToForm = () => {
    const formEl = document.getElementById("contact-form-section");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
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
    if (!form.subject) {
      setError("Please select a subject.");
      return;
    }
    if (!form.privacyAgreed) {
      setError("Please agree to the privacy policy.");
      return;
    }

    setStatus("submitting");

    try {
      const params = new URLSearchParams(window.location.search);
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: form.subject,
          message: form.message.trim(),
          source: "contact-form",
          pageUrl: window.location.href,
          utm_source: params.get("utm_source") || "",
          utm_medium: params.get("utm_medium") || "",
          utm_campaign: params.get("utm_campaign") || "",
          utm_content: params.get("utm_content") || "",
          utm_term: params.get("utm_term") || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setStatus("success");
      // Redirect to thank you page
      window.location.href = "/thank-you";
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again shortly.");
    }
  };

  return (
    <div className="min-h-screen">
      {/* ============ Hero Section ============ */}
      <section className="relative flex min-h-[700px] items-center justify-center overflow-hidden bg-[#111] py-20 md:min-h-screen">
        {/* Floating Food Emojis */}
        <div className="absolute inset-0 z-[1]">
          {FLOATING_EMOJIS.map((item, idx) => (
            <div
              key={idx}
              className="absolute animate-float text-[40px] opacity-50"
              style={{
                top: item.top,
                left: item.left,
                right: item.right,
                bottom: item.bottom,
                animationDelay: item.delay,
                animationDuration: item.duration,
              }}
            >
              {item.emoji}
            </div>
          ))}
        </div>

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 z-[2]"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,106,61,0.3) 0%, rgba(0,0,0,0.7) 70%)",
          }}
        />

        {/* Hero Content */}
        <div className="relative z-[3] mx-auto max-w-[1000px] px-5 text-center">
          <h1 className="mb-8 font-heading text-[50px] font-black leading-tight text-white drop-shadow-[0_5px_30px_rgba(255,106,61,0.8)] md:text-[90px]">
            <span className="text-bfw-orange">Connect</span> With Us
          </h1>
          <p className="mx-auto mb-10 max-w-[700px] font-body text-lg leading-relaxed text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] md:text-2xl">
            We&apos;re passionate about connecting you with Singapore&apos;s best dining
            experiences. Let&apos;s start a conversation.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-5">
            <a
              href="https://wa.me/6585051684"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] px-8 py-5 font-heading text-lg font-bold text-white shadow-[0_15px_40px_rgba(37,211,102,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(37,211,102,0.6)]"
            >
              <WhatsAppIcon className="h-6 w-6" />
              WhatsApp Us
            </a>
            <button
              onClick={scrollToForm}
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-bfw-orange to-[#ff8c66] px-8 py-5 font-heading text-lg font-bold text-white shadow-[0_15px_40px_rgba(255,106,61,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(255,106,61,0.6)]"
            >
              Get In Touch
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 z-[4] -translate-x-1/2 animate-bounce">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ============ Reach Out Section ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#111] to-[#222] px-5 py-24 md:py-32">
        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMzMzIi8+PHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiMzMzMiLz48L3N2Zz4=")`,
          }}
        />

        <div className="relative z-[1] mx-auto max-w-[1400px]">
          <h2 className="relative mx-auto mb-20 inline-flex w-full justify-center font-heading text-4xl font-extrabold text-white md:text-5xl">
            <span className="relative">
              Reach Out To Us
              <span className="absolute -bottom-4 left-0 h-1 w-full bg-gradient-to-r from-transparent via-bfw-orange to-transparent" />
            </span>
          </h2>

          <div className="flex flex-wrap justify-center gap-10">
            {/* WhatsApp Card */}
            <ContactCard
              icon={<WhatsAppIcon className="h-[50px] w-[50px]" />}
              title="WhatsApp Us"
              description="Get instant responses via WhatsApp. Our team is available daily from 9am to 9pm."
              linkHref="https://wa.me/6585051684"
              linkText="+65 8505 1684"
              gradient="from-[#25D366] to-[#128C7E]"
              glowColor="rgba(37,211,102,0.3)"
            />

            {/* Email Card */}
            <ContactCard
              icon={<IconMail className="h-[50px] w-[50px] text-white" />}
              title="Email Us"
              description="Have a specific question or inquiry? Send us an email and we'll respond within 24 hours."
              linkHref="mailto:hello@bestfoodwhere.sg"
              linkText="hello@bestfoodwhere.sg"
              gradient="from-bfw-orange to-[#ff8c66]"
              glowColor="rgba(255,106,61,0.3)"
            />

            {/* Call Card */}
            <ContactCard
              icon={<IconPhone className="h-[50px] w-[50px] text-white" />}
              title="Call Us"
              description="Need immediate assistance? Our support team is available Monday to Friday, 9am - 6pm."
              linkHref="tel:+6585051684"
              linkText="+65 8505 1684"
              gradient="from-bfw-orange to-[#ff8c66]"
              glowColor="rgba(255,106,61,0.3)"
            />
          </div>
        </div>
      </section>

      {/* ============ Contact Form Section ============ */}
      <section
        id="contact-form-section"
        className="relative overflow-hidden bg-white px-5 py-24 md:py-36"
      >
        {/* Decorative circles */}
        <div className="absolute -right-[150px] -top-[150px] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-bfw-orange/10 to-[#ff8c66]/10" />
        <div className="absolute -bottom-[100px] -left-[100px] h-[400px] w-[400px] rounded-full bg-gradient-to-br from-bfw-orange/10 to-[#ff8c66]/10" />

        <div className="relative z-[1] mx-auto max-w-[1200px]">
          <div className="mb-20 text-center">
            <h2 className="mb-5 font-heading text-4xl font-extrabold text-[#333] md:text-5xl">
              Let&apos;s Start a Conversation
            </h2>
            <p className="mx-auto max-w-[700px] font-body text-lg leading-relaxed text-[#555] md:text-xl">
              We&apos;re excited to hear from you! Fill out the form below and we&apos;ll get back
              to you as soon as possible.
            </p>
          </div>

          <div className="mx-auto max-w-[1100px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_100px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col lg:flex-row">
              {/* Left Side - Why Connect */}
              <div className="relative flex-1 bg-gradient-to-br from-bfw-orange to-[#ff8c66] p-10 lg:p-16">
                {/* Pattern overlay */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMTUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjEiLz48L3N2Zz4=")`,
                  }}
                />

                <div className="relative z-[1]">
                  <h3 className="mb-8 font-heading text-3xl font-bold text-white">
                    Why Connect With Us?
                  </h3>

                  <div className="space-y-8">
                    <ReasonItem
                      icon={<IconUsers className="h-[30px] w-[30px] text-white" />}
                      title="Business Partnerships"
                      description="Explore opportunities to feature your restaurant or collaborate on promotional campaigns."
                    />
                    <ReasonItem
                      icon={<InfoIcon className="h-[30px] w-[30px] text-white" />}
                      title="Support & Assistance"
                      description="Get help with using our platform, updating restaurant information, or technical issues."
                    />
                    <ReasonItem
                      icon={<MessageIcon className="h-[30px] w-[30px] text-white" />}
                      title="Feedback & Suggestions"
                      description="Share your ideas and feedback to help us improve the BestFoodWhere experience."
                    />
                  </div>

                  {/* Social Links */}
                  <div className="mt-10 flex gap-4">
                    <a
                      href="https://www.facebook.com/bestfoodwhere"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white transition-all hover:-translate-y-1 hover:bg-white/30"
                    >
                      <IconFacebook className="h-5 w-5" />
                    </a>
                    <a
                      href="https://www.instagram.com/bestfoodwhere/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white transition-all hover:-translate-y-1 hover:bg-white/30"
                    >
                      <IconInstagram className="h-5 w-5" />
                    </a>
                    <a
                      href="https://www.pinterest.com/bestfoodwhere/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white transition-all hover:-translate-y-1 hover:bg-white/30"
                    >
                      <IconPinterest className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="flex-1 p-10 lg:p-16">
                <form onSubmit={submit} className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <FormInput
                      label="Your Name"
                      icon={<IconUsers className="h-5 w-5 text-gray-400" />}
                      type="text"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                      required
                    />
                    <FormInput
                      label="Email Address"
                      icon={<IconMail className="h-5 w-5 text-gray-400" />}
                      type="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={(v) => setForm((p) => ({ ...p, email: v }))}
                      required
                    />
                  </div>

                  <FormInput
                    label="Phone Number"
                    icon={<IconPhone className="h-5 w-5 text-gray-400" />}
                    type="tel"
                    placeholder="Enter your phone number"
                    value={form.phone}
                    onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
                  />

                  <div>
                    <label className="mb-2 block font-heading text-base font-semibold text-[#333]">
                      Subject
                    </label>
                    <div className="relative">
                      <SubjectIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <select
                        value={form.subject}
                        onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                        required
                        className="h-14 w-full appearance-none rounded-2xl border border-gray-200 bg-[#f9f9f9] pl-12 pr-10 font-body text-base text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
                      >
                        <option value="" disabled>
                          Select a subject
                        </option>
                        {SUBJECT_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block font-heading text-base font-semibold text-[#333]">
                      Your Message
                    </label>
                    <div className="relative">
                      <MessageIcon className="absolute left-4 top-5 h-5 w-5 text-gray-400" />
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                        placeholder="Enter your message here..."
                        rows={5}
                        className="w-full resize-y rounded-2xl border border-gray-200 bg-[#f9f9f9] py-4 pl-12 pr-4 font-body text-base text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      checked={form.privacyAgreed}
                      onChange={(e) => setForm((p) => ({ ...p, privacyAgreed: e.target.checked }))}
                      className="mt-1 h-5 w-5 accent-bfw-orange"
                      required
                    />
                    <label htmlFor="privacy" className="font-body text-[15px] leading-relaxed text-[#555]">
                      I agree to the processing of my personal data according to the{" "}
                      <Link href="/privacy-policy" className="font-semibold text-bfw-orange hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </label>
                  </div>

                  {error && (
                    <p className="rounded-xl bg-red-50 px-4 py-3 font-body text-sm text-red-700">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-bfw-orange to-[#ff8c66] py-5 font-heading text-lg font-bold text-white shadow-[0_10px_30px_rgba(255,106,61,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(255,106,61,0.4)] disabled:opacity-60"
                  >
                    {status === "submitting" ? "Sending..." : "Send Message"}
                    <SendIcon className="h-6 w-6" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ Section ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f8f5f2] to-white px-5 py-24 md:py-32">
        {/* Decorative dots */}
        <div className="absolute left-[50px] top-[50px] h-8 w-8 rounded-full bg-bfw-orange/20" />
        <div className="absolute right-[80px] top-[100px] h-12 w-12 rounded-full bg-bfw-orange/10" />
        <div className="absolute bottom-[70px] left-[200px] h-10 w-10 rounded-full bg-bfw-orange/15" />
        <div className="absolute bottom-[120px] right-[200px] h-16 w-16 rounded-full bg-bfw-orange/10" />

        <div className="relative z-[1] mx-auto max-w-[1000px]">
          <div className="mb-16 text-center">
            <h2 className="mb-5 font-heading text-4xl font-extrabold text-[#333] md:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-[700px] font-body text-lg leading-relaxed text-[#666] md:text-xl">
              Find quick answers to the most common questions about BestFoodWhere.
            </p>
          </div>

          <div className="space-y-6">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl bg-white shadow-[0_15px_40px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  className="flex w-full items-center justify-between px-8 py-6"
                >
                  <h3 className="text-left font-heading text-lg font-bold text-[#333] md:text-xl">
                    {item.question}
                  </h3>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bfw-orange/10 transition-transform ${
                      openFAQ === idx ? "rotate-45" : ""
                    }`}
                  >
                    <PlusIcon className="h-4 w-4 text-bfw-orange" />
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFAQ === idx ? "max-h-[300px]" : "max-h-0"
                  }`}
                >
                  <div className="border-t border-gray-100 px-8 py-6">
                    <p className="font-body text-base leading-relaxed text-[#555]">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="mb-6 font-body text-lg text-[#666]">
              Still have questions? Our team is ready to help!
            </p>
            <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
              <a
                href="https://wa.me/6585051684"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] px-8 py-4 font-heading text-lg font-semibold text-white shadow-[0_10px_30px_rgba(37,211,102,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(37,211,102,0.4)]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp Us
              </a>
              <button
                onClick={scrollToForm}
                className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-bfw-orange to-[#ff8c66] px-8 py-4 font-heading text-lg font-semibold text-white shadow-[0_10px_30px_rgba(255,106,61,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(255,106,61,0.4)]"
              >
                Contact Form
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============ Sub Components ============
function ContactCard({
  icon,
  title,
  description,
  linkHref,
  linkText,
  gradient,
  glowColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkHref: string;
  linkText: string;
  gradient: string;
  glowColor: string;
}) {
  return (
    <div className="group relative min-w-[300px] max-w-[350px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-sm transition-all hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(0,0,0,0.2)]">
      {/* Glow */}
      <div
        className="absolute left-0 top-0 h-full w-full opacity-60"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${glowColor} 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-[1]">
        <div
          className={`mx-auto mb-8 flex h-[100px] w-[100px] items-center justify-center rounded-3xl bg-gradient-to-br ${gradient} shadow-[0_15px_30px_${glowColor}] transition-transform group-hover:rotate-[5deg]`}
        >
          {icon}
        </div>
        <h3 className="mb-4 font-heading text-2xl font-bold text-white">{title}</h3>
        <p className="mb-6 font-body text-lg leading-relaxed text-white/70">{description}</p>
        <a
          href={linkHref}
          className="inline-block rounded-full border border-white/20 bg-white/10 px-8 py-4 font-heading text-lg font-semibold text-white transition-all hover:bg-white/20"
        >
          {linkText}
        </a>
      </div>
    </div>
  );
}

function ReasonItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-5 transition-transform hover:translate-x-2">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20">
        {icon}
      </div>
      <div>
        <h4 className="mb-2 font-heading text-xl font-semibold text-white">{title}</h4>
        <p className="font-body text-base leading-relaxed text-white/80">{description}</p>
      </div>
    </div>
  );
}

function FormInput({
  label,
  icon,
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block font-heading text-base font-semibold text-[#333]">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="h-14 w-full rounded-2xl border border-gray-200 bg-[#f9f9f9] pl-12 pr-4 font-body text-base text-gray-900 outline-none transition focus:border-bfw-orange focus:bg-white focus:ring-2 focus:ring-bfw-orange/20"
        />
      </div>
    </div>
  );
}

// ============ Icons ============
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SubjectIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
