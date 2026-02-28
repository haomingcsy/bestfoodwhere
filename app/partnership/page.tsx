"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  IconWhatsApp,
  IconPin,
  IconUsers,
  IconTrendingUp,
  IconCheck,
  IconChevronDown,
} from "@/components/layout/icons";

const WHATSAPP_LINK =
  "https://wa.me/6582233005?text=Hi%20BestFoodWhere%2C%20I%27m%20interested%20in%20partnership%20opportunities.";

// Hero background images - rotating carousel
const HERO_BACKGROUNDS = [
  {
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    alt: "Modern restaurant interior",
  },
  {
    url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    alt: "Fine dining experience",
  },
  {
    url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    alt: "Asian cuisine restaurant",
  },
  {
    url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    alt: "Cafe interior",
  },
  {
    url: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    alt: "Food court dining",
  },
];

// Floating decorative elements for hero
const FLOATING_ICONS = [
  { icon: "🍴", className: "top-[15%] left-[8%] text-3xl opacity-20" },
  { icon: "📍", className: "top-[25%] right-[12%] text-2xl opacity-15" },
  { icon: "🍜", className: "bottom-[30%] left-[5%] text-2xl opacity-20" },
  { icon: "🥢", className: "bottom-[20%] right-[8%] text-3xl opacity-15" },
];

const STATS = [
  { value: "22", suffix: "Million+", label: "Platform impressions in 2026" },
  { value: "87", suffix: "Percent", label: "Of users visit within 48 hours" },
  { value: "100", suffix: "K+", label: "Newsletter subscribers" },
];

const FEATURES = [
  {
    icon: IconPin,
    title: "Targeted Audience",
    description:
      "We bring you customers who are actively searching for food & beverage options in Singapore. Our platform's focus means higher intent visitors and better conversion rates for your business.",
  },
  {
    icon: IconUsers,
    title: "Quality Over Quantity",
    description:
      "We're selective about our partners, maintaining high standards for food quality, service, and customer experience. This curation builds trust with users and drives qualified foot traffic to your business.",
  },
  {
    icon: IconTrendingUp,
    title: "Multi-Channel Promotion",
    description:
      "Your business gets promoted across our platform, social media, email newsletters, and content marketing campaigns, creating multiple touchpoints with potential customers.",
  },
];

const PRICING_TABS = [
  { id: "listing", label: "Business Listing", icon: "📋" },
  { id: "content", label: "Content Partnership", icon: "📝" },
  { id: "promotion", label: "Promotion Partnership", icon: "📢" },
  { id: "membership", label: "Membership Plans", icon: "💎" },
];

const LISTING_PLANS = [
  {
    name: "Standard Listing",
    price: 499,
    description:
      "Perfect for businesses looking to enhance their visibility and stand out from the competition.",
    features: [
      "Enhanced listing with priority placement",
      "Upload up to 10 photos (your own photos)",
      "Custom business description",
      "Menu upload and management",
      "Basic performance reports",
    ],
    popular: false,
  },
  {
    name: "Premium Listing",
    price: 899,
    description:
      "Ideal for established businesses wanting to maximize exposure and drive significant customer growth.",
    features: [
      "Everything in Standard listing",
      "Featured placement in search results",
      "Monthly promotional campaign",
      "Inclusion in relevant collection pages",
      "Advanced analytics & competitor insights",
    ],
    popular: true,
  },
  {
    name: "Elite Listing",
    price: 1499,
    description:
      "For signature businesses seeking maximum visibility and brand impact across all channels.",
    features: [
      "Everything in Premium listing",
      "Homepage banner placement",
      "Branded content article (quarterly)",
      "Social media posts (4x per month)",
      "Professional photoshoot (15 images)",
    ],
    popular: false,
  },
];

const ADD_ONS = [
  {
    name: "Professional Photoshoot",
    description: "10 professional images of your venue and dishes",
    price: 499,
    unit: "one-time fee",
  },
  {
    name: "Promotional Campaign",
    description: "Email blast, social media, 2-week banner",
    price: 699,
    unit: "per campaign",
  },
  {
    name: "Newsletter Feature",
    description: "Featured in our 100K+ subscriber newsletter",
    price: 899,
    unit: "per feature",
  },
];

const SUCCESS_STORIES = [
  {
    type: "F&B Group",
    name: "Flavor House Group",
    quote:
      "With 12 F&B concepts across Singapore, our strategic partnership has revolutionized our digital presence. BestFoodWhere's content marketing campaigns have generated a 38% increase in new customer acquisition across all our venues.",
    person: "James Lim",
    role: "CEO, Flavor House Group",
    stats: [
      { label: "New Customers", value: "+38%" },
      { label: "Digital Reach", value: "+145%" },
      { label: "ROI", value: "8.2x" },
    ],
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    type: "Restaurant",
    name: "Sushi Elegance",
    quote:
      "Our partnership with BestFoodWhere transformed our customer acquisition strategy. We've seen a 73% increase in foot traffic, and our average order value has grown by 28% due to the qualified customers the platform brings in.",
    person: "David Wong",
    role: "Marketing Director, Sushi Elegance",
    stats: [
      { label: "Foot Traffic", value: "+73%" },
      { label: "Order Value", value: "+28%" },
      { label: "ROI", value: "9.5x" },
    ],
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
  },
];

const CONTENT_STEPS = [
  {
    step: 1,
    title: "Create Quality Content",
    description:
      "Provide high-quality content about your business, recipes, or food stories",
  },
  {
    step: 2,
    title: "Featured Placement",
    description:
      "We feature your content on our blog, recipe section, or deals page",
  },
  {
    step: 3,
    title: "Cross Promotion",
    description:
      "You mention BestFoodWhere on your website or social media channels",
  },
  {
    step: 4,
    title: "Mutual Growth",
    description:
      "Both parties benefit from increased visibility and relevant traffic",
  },
];

const PROMOTION_STEPS = [
  {
    step: 1,
    title: "Create Exclusive Offers",
    description:
      "You provide exclusive deals or promotions for BestFoodWhere users",
  },
  {
    step: 2,
    title: "Premium Placement",
    description:
      "We feature these deals prominently on our platform and marketing channels",
  },
  {
    step: 3,
    title: "Customer Redemption",
    description: "Customers redeem deals through our unique tracking codes",
  },
  {
    step: 4,
    title: "Performance-Based Pricing",
    description:
      "We receive a percentage commission only on successful redemptions",
  },
];

const PROMOTION_BENEFITS = [
  {
    title: "No Upfront Investment",
    description: "Pay only for actual redemptions - no upfront marketing costs",
  },
  {
    title: "Massive Audience Reach",
    description: "Access to our 200,000+ monthly users",
  },
  {
    title: "Detailed Performance Analytics",
    description:
      "Get insights into promotion performance, user demographics, and redemption patterns",
  },
  {
    title: "Revenue Optimization",
    description:
      "Strategically fill empty tables during off-peak hours and increase overall revenue",
  },
];

const MEMBERSHIP_PLANS = [
  {
    name: "ESSENTIAL",
    subtitle: "Basic Presence",
    price: 699,
    yearlyPrice: 6990,
    description: "Perfect for new food & beverage businesses",
    features: [
      "Standard business listing",
      "Upload up to 10 photos",
      "Basic analytics dashboard",
      "Social media mention (1x quarterly)",
      "Self-service promotion tools",
    ],
    popular: false,
  },
  {
    name: "PREMIUM",
    subtitle: "Enhanced Visibility",
    price: 1299,
    yearlyPrice: 12990,
    description: "Ideal for established businesses",
    features: [
      "Everything in ESSENTIAL",
      "Priority placement in search results",
      "Listed in 2 curated collections",
      "Social media posts (1x monthly)",
      "Email feature (1x quarterly)",
      "Ad credit for sidebar placement",
    ],
    popular: true,
  },
  {
    name: "ENTERPRISE",
    subtitle: "Total Market Dominance",
    price: 2499,
    yearlyPrice: 24990,
    description: "For business groups and F&B operators",
    features: [
      "Everything in PREMIUM",
      "Multiple location management (up to 5)",
      "Permanent homepage banner",
      "Custom landing page for your brand",
      "Professional photoshoot included",
      "Newsletter feature access",
      "Dedicated account manager",
    ],
    popular: false,
  },
];

const FAQS = [
  {
    question: "What are the requirements to become a BestFoodWhere partner?",
    answer:
      "We look for quality F&B establishments that maintain high standards in food quality, service, and customer experience. Partners should have a physical location in Singapore and be committed to providing excellent dining experiences.",
  },
  {
    question: "How long does it take to set up my business on the platform?",
    answer:
      "Once you sign up, our team will have your listing live within 3-5 business days. Premium and Elite partners receive priority onboarding with dedicated support.",
  },
  {
    question: "Can I track the performance of my business listing?",
    answer:
      "Yes! All partners have access to our analytics dashboard showing views, clicks, direction requests, and customer engagement metrics. Premium and Elite partners get additional competitive insights.",
  },
  {
    question: "What is the contract duration for partnership plans?",
    answer:
      "Our standard partnership terms are 6 or 12 months. We offer flexible month-to-month options for select partners. Contact us to discuss the best arrangement for your business.",
  },
  {
    question: "How do you ensure quality traffic to our business listing?",
    answer:
      "We focus on SEO-driven organic traffic, targeted content marketing, and our engaged newsletter audience of 100K+ food enthusiasts. This ensures visitors are genuinely interested in dining options.",
  },
];

export default function PartnershipPage() {
  const [activeTab, setActiveTab] = useState("listing");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Rotate background images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] overflow-hidden">
        {/* Background Images Carousel */}
        {HERO_BACKGROUNDS.map((bg, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentBgIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={bg.url}
              alt={bg.alt}
              fill
              className="object-cover"
              priority={idx === 0}
              unoptimized
            />
          </div>
        ))}

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/90 via-[#0f2b52]/85 to-[#1d2b44]/90" />

        {/* Animated gradient accents */}
        <div className="absolute inset-0 bg-gradient-to-r from-bfw-orange/10 via-transparent to-bfw-orange/5" />

        {/* Floating decorative elements */}
        {FLOATING_ICONS.map((item, idx) => (
          <div
            key={idx}
            className={`pointer-events-none absolute animate-float ${item.className}`}
          >
            {item.icon}
          </div>
        ))}

        {/* Image indicator dots */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {HERO_BACKGROUNDS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBgIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentBgIndex
                  ? "w-8 bg-bfw-orange"
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-[1200px] flex-col items-center justify-center px-4 py-20 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-medium text-white/80 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-bfw-orange" />
            22+ MILLION IMPRESSIONS IN 2026
          </span>

          <h1 className="font-heading text-4xl font-bold text-white md:text-6xl">
            Partner <span className="text-bfw-orange">With Us</span>
          </h1>

          <p className="mt-6 max-w-[700px] font-body text-lg text-white/70">
            Join Singapore&apos;s premier food discovery platform and unlock
            unprecedented growth opportunities for your business. We&apos;re
            selective about who we work with to ensure quality for our users.
          </p>

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-bfw-orange to-[#ff7b4d] px-8 py-4 font-heading text-lg font-semibold text-white shadow-[0_0_40px_rgba(239,95,42,0.4)] transition hover:shadow-[0_0_60px_rgba(239,95,42,0.5)]"
          >
            <IconWhatsApp className="h-6 w-6" />
            Contact Us on WhatsApp
          </a>

          <div className="mt-16 animate-bounce text-white/40">
            <IconChevronDown className="h-8 w-8" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <h2 className="text-center font-heading text-3xl font-bold text-[#1d2b44] md:text-4xl">
            Singapore&apos;s Most Trusted Food Platform
          </h2>
          <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-bfw-orange" />

          <p className="mx-auto mt-6 max-w-[700px] text-center font-body text-base text-[#667085]">
            BestFoodWhere connects{" "}
            <strong className="text-[#1d2b44]">food enthusiasts</strong> with
            the{" "}
            <strong className="text-[#1d2b44]">best dining experiences</strong>{" "}
            across Singapore. Our platform drives{" "}
            <strong className="text-[#1d2b44]">qualified foot traffic</strong>{" "}
            to food & beverage businesses through strategic digital exposure.
          </p>

          {/* Stats Cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border-t-4 border-bfw-orange bg-white p-8 shadow-lg"
              >
                <div className="text-center">
                  <span className="font-heading text-5xl font-bold text-bfw-orange">
                    {stat.value}
                  </span>
                  <span className="ml-1 font-heading text-xl font-semibold text-[#1d2b44]">
                    {stat.suffix}
                  </span>
                </div>
                <p className="mt-3 text-center font-body text-sm text-[#667085]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-2xl bg-[#fafafa] p-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-bfw-orange/10">
                  <feature.icon className="h-6 w-6 text-bfw-orange" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[#1d2b44]">
                  {feature.title}
                </h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-[#667085]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-[#0f1419] py-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <h2 className="text-center font-heading text-3xl font-bold text-white md:text-4xl">
            Four Ways to Partner With Us
          </h2>
          <p className="mx-auto mt-4 max-w-[600px] text-center font-body text-base text-white/60">
            Choose the partnership model that best fits your business needs or
            combine multiple options for maximum impact.
          </p>

          {/* Tabs */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {PRICING_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-heading text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-white text-[#1d2b44]"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Business Listing Plans */}
          {activeTab === "listing" && (
            <div className="mt-12">
              <h3 className="mb-2 text-center font-heading text-2xl font-semibold text-white">
                Business Listing
              </h3>
              <p className="mb-10 text-center font-body text-sm text-white/50">
                Get your food & beverage business listed on Singapore&apos;s
                premier food discovery platform and start attracting new
                customers.
              </p>

              <div className="grid gap-6 lg:grid-cols-3">
                {LISTING_PLANS.map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative rounded-2xl p-8 ${
                      plan.popular
                        ? "border-2 border-bfw-orange bg-[#1a1f26]"
                        : "border border-white/10 bg-[#141820]"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-bfw-orange px-4 py-1 text-xs font-semibold text-white">
                        POPULAR
                      </span>
                    )}

                    <h4 className="font-heading text-xl font-semibold text-white">
                      {plan.name}
                    </h4>
                    <div className="mt-4">
                      <span className="font-heading text-4xl font-bold text-bfw-orange">
                        ${plan.price}
                      </span>
                      <span className="text-white/50">/month</span>
                    </div>
                    <p className="mt-4 font-body text-sm text-white/60">
                      {plan.description}
                    </p>

                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                          <span className="font-body text-sm text-white/80">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-heading text-sm font-semibold transition ${
                        plan.popular
                          ? "bg-bfw-orange text-white hover:bg-bfw-orange-hover"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <IconWhatsApp className="h-4 w-4" />
                      Contact Us
                    </a>
                  </div>
                ))}
              </div>

              {/* Add-ons */}
              <div className="mt-12 rounded-2xl border border-white/10 bg-[#141820] p-8">
                <h4 className="font-heading text-lg font-semibold text-white">
                  Add-On Services{" "}
                  <span className="font-normal text-white/50">
                    (Available with any plan)
                  </span>
                </h4>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {ADD_ONS.map((addon) => (
                    <div key={addon.name} className="rounded-xl bg-white/5 p-5">
                      <h5 className="font-heading text-base font-semibold text-white">
                        {addon.name}
                      </h5>
                      <p className="mt-1 font-body text-xs text-white/50">
                        {addon.description}
                      </p>
                      <p className="mt-3">
                        <span className="font-heading text-xl font-bold text-bfw-orange">
                          ${addon.price}
                        </span>
                        <span className="text-xs text-white/40">
                          {" "}
                          {addon.unit}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content Partnership Tab */}
          {activeTab === "content" && (
            <div className="mt-12">
              <h3 className="mb-2 text-center font-heading text-2xl font-semibold text-white">
                Content Partnership
              </h3>
              <p className="mb-10 text-center font-body text-sm text-white/50">
                We&apos;ll feature your content on our platform, and you&apos;ll
                mention us on yours for mutual visibility.
              </p>

              <div className="rounded-2xl border border-white/10 bg-[#141820] p-8">
                <div className="grid gap-10 lg:grid-cols-2">
                  {/* How It Works */}
                  <div>
                    <h4 className="mb-6 font-heading text-xl font-semibold text-white">
                      How It Works
                    </h4>
                    <div className="space-y-4">
                      {CONTENT_STEPS.map((item) => (
                        <div key={item.step} className="flex gap-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bfw-orange/20 font-heading text-sm font-bold text-white">
                            {item.step}
                          </div>
                          <div>
                            <h5 className="font-heading text-base font-semibold text-white">
                              {item.title}
                            </h5>
                            <p className="mt-1 font-body text-sm text-white/60">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Guidelines */}
                  <div>
                    <h4 className="mb-6 font-heading text-xl font-semibold text-white">
                      Content Guidelines
                    </h4>
                    <div className="rounded-xl bg-white/5 p-5">
                      <h5 className="font-heading text-base font-semibold text-white">
                        Quality Standards
                      </h5>
                      <ul className="mt-3 space-y-2 font-body text-sm text-white/70">
                        <li>Original and not published elsewhere</li>
                        <li>
                          High quality with professional images (min 1200x800px)
                        </li>
                        <li>
                          Relevant to Singapore&apos;s food & beverage scene
                        </li>
                        <li>Free of excessive promotional language</li>
                        <li>Compliant with our brand voice guidelines</li>
                      </ul>
                    </div>
                    <div className="mt-4 rounded-xl bg-bfw-orange/10 p-5">
                      <h5 className="font-heading text-base font-semibold text-white">
                        Content Ideas
                      </h5>
                      <ul className="mt-3 space-y-2 font-body text-sm text-white/70">
                        <li>Chef interviews and kitchen stories</li>
                        <li>Behind-the-scenes venue tours</li>
                        <li>
                          Signature dish recipes (simplified for home cooks)
                        </li>
                        <li>Food and ingredient spotlights</li>
                      </ul>
                    </div>
                    <div className="mt-6 rounded-xl bg-white/5 p-5 text-center">
                      <h5 className="font-heading text-lg font-semibold text-white">
                        Pricing: Value-Based Exchange
                      </h5>
                      <p className="mt-2 font-body text-sm text-white/60">
                        No fixed fees - we evaluate each partnership based on
                        mutual value and reach potential
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 border-t border-white/10 pt-8 text-center">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-bfw-orange px-8 py-4 font-heading text-base font-semibold text-white transition hover:bg-bfw-orange-hover"
                  >
                    <IconWhatsApp className="h-5 w-5" />
                    Start a Content Partnership
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Promotion Partnership Tab */}
          {activeTab === "promotion" && (
            <div className="mt-12">
              <h3 className="mb-2 text-center font-heading text-2xl font-semibold text-white">
                Promotion Partnership
              </h3>
              <p className="mb-10 text-center font-body text-sm text-white/50">
                We&apos;ll feature your deals and promotions, and earn a
                percentage commission on redemptions.
              </p>

              <div className="rounded-2xl border border-white/10 bg-[#141820] p-8">
                <div className="grid gap-10 lg:grid-cols-2">
                  {/* How It Works */}
                  <div>
                    <h4 className="mb-6 font-heading text-xl font-semibold text-white">
                      How It Works
                    </h4>
                    <div className="space-y-4">
                      {PROMOTION_STEPS.map((item) => (
                        <div key={item.step} className="flex gap-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bfw-orange/20 font-heading text-sm font-bold text-white">
                            {item.step}
                          </div>
                          <div>
                            <h5 className="font-heading text-base font-semibold text-white">
                              {item.title}
                            </h5>
                            <p className="mt-1 font-body text-sm text-white/60">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Benefits */}
                  <div>
                    <h4 className="mb-6 font-heading text-xl font-semibold text-white">
                      Key Benefits
                    </h4>
                    <div className="space-y-4">
                      {PROMOTION_BENEFITS.map((benefit) => (
                        <div
                          key={benefit.title}
                          className="flex items-start gap-3"
                        >
                          <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                          <div>
                            <h5 className="font-heading text-base font-semibold text-white">
                              {benefit.title}
                            </h5>
                            <p className="mt-1 font-body text-sm text-white/60">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-xl bg-bfw-orange/20 p-6 text-center">
                      <h5 className="font-heading text-lg font-semibold text-white">
                        Performance-Based Pricing
                      </h5>
                      <p className="mt-2 font-heading text-4xl font-bold text-white">
                        10-15%
                      </p>
                      <p className="mt-2 font-body text-sm text-white/70">
                        Commission on successful redemptions
                        <br />
                        with proven ROI of 8-12x
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 border-t border-white/10 pt-8 text-center">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-bfw-orange px-8 py-4 font-heading text-base font-semibold text-white transition hover:bg-bfw-orange-hover"
                  >
                    <IconWhatsApp className="h-5 w-5" />
                    Start a Promotion Partnership
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Membership Plans Tab */}
          {activeTab === "membership" && (
            <div className="mt-12">
              <h3 className="mb-2 text-center font-heading text-2xl font-semibold text-white">
                Membership Plans
              </h3>
              <p className="mb-10 text-center font-body text-sm text-white/50">
                Comprehensive membership packages for businesses looking to
                maximize their presence across all our channels.
              </p>

              <div className="grid gap-6 lg:grid-cols-3">
                {MEMBERSHIP_PLANS.map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative rounded-2xl p-8 ${
                      plan.popular
                        ? "border-2 border-bfw-orange bg-[#1a1f26] lg:-mt-4 lg:scale-105"
                        : "border border-white/10 bg-[#141820]"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 right-4 rounded-full bg-bfw-orange px-4 py-1 text-xs font-semibold text-white">
                        POPULAR
                      </span>
                    )}

                    <h4 className="font-heading text-xl font-bold text-white">
                      {plan.name}
                    </h4>
                    <p className="font-body text-sm text-white/50">
                      {plan.subtitle}
                    </p>

                    <div className="mt-4">
                      <span className="font-heading text-3xl font-bold text-white">
                        ${plan.price.toLocaleString()}
                      </span>
                      <span className="text-white/50">/month</span>
                    </div>
                    <p className="mt-1 rounded-full bg-white/5 px-3 py-1 text-center text-xs text-white/60">
                      ${plan.yearlyPrice.toLocaleString()}/year (Save 17%)
                    </p>

                    <p className="mt-4 font-body text-sm text-white/60">
                      {plan.description}
                    </p>

                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                          <span className="font-body text-sm text-white/80">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-heading text-sm font-semibold transition ${
                        plan.popular
                          ? "bg-bfw-orange text-white hover:bg-bfw-orange-hover"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <IconWhatsApp className="h-4 w-4" />
                      Contact Us
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Success Stories */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <h2 className="text-center font-heading text-3xl font-bold text-[#1d2b44] md:text-4xl">
            Success Stories
          </h2>
          <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-bfw-orange" />
          <p className="mx-auto mt-6 max-w-[600px] text-center font-body text-base text-[#667085]">
            See how our partners have achieved remarkable results through
            strategic partnerships with BestFoodWhere.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {SUCCESS_STORIES.map((story) => (
              <div
                key={story.name}
                className="overflow-hidden rounded-2xl border border-[#eef0f4] bg-white shadow-sm"
              >
                <div className="relative h-48">
                  <Image
                    src={story.image}
                    alt={story.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <span className="absolute left-4 top-4 rounded-lg bg-bfw-orange px-3 py-1 text-xs font-semibold text-white">
                    {story.type}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-xl font-semibold text-[#1d2b44]">
                    {story.name}
                  </h3>
                  <p className="mt-3 font-body text-sm italic text-[#667085]">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#eef0f4]">
                      <Image
                        src={story.avatar}
                        alt={story.person}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="font-heading text-sm font-semibold text-[#1d2b44]">
                        {story.person}
                      </p>
                      <p className="font-body text-xs text-[#667085]">
                        {story.role}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[#eef0f4] pt-6">
                    {story.stats.map((stat) => (
                      <div key={stat.label} className="text-center">
                        <p className="font-body text-xs text-[#667085]">
                          {stat.label}
                        </p>
                        <p className="font-heading text-xl font-bold text-bfw-orange">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Newsletter callout */}
          <div className="relative mt-12 overflow-hidden rounded-2xl bg-gradient-to-r from-[#1d2b44] to-[#2a3f5f] p-8">
            <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <span className="mb-2 inline-block rounded-lg bg-bfw-orange/20 px-3 py-1 text-xs font-semibold text-bfw-orange">
                  ENTERPRISE TIER EXCLUSIVE
                </span>
                <h3 className="font-heading text-2xl font-bold text-white">
                  Access Our 100K+ Newsletter Audience
                </h3>
                <p className="mt-2 max-w-[600px] font-body text-sm text-white/70">
                  Enterprise tier partners gain exclusive access to our highly
                  engaged email subscriber base of 100,000+ food enthusiasts.
                  With open rates exceeding industry standards at 32%, our
                  newsletter delivers qualified traffic directly to your
                  business, contributing to the exceptional ROI our top partners
                  experience.
                </p>
                <p className="mt-3 font-body text-xs text-white/50">
                  *Terms and conditions apply. Frequency and placement subject
                  to editorial approval.
                </p>
              </div>
              <div className="shrink-0 rounded-full border-4 border-white/20 bg-white p-6 text-center">
                <p className="font-heading text-3xl font-bold text-bfw-orange">
                  32%
                </p>
                <p className="font-body text-xs text-[#667085]">Open Rate</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-bfw-orange px-8 py-4 font-heading text-base font-semibold text-white shadow-lg transition hover:bg-bfw-orange-hover"
            >
              <IconWhatsApp className="h-5 w-5" />
              Join Our Success Stories
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#fafafa] py-20">
        <div className="mx-auto max-w-[800px] px-4">
          <h2 className="text-center font-heading text-3xl font-bold text-[#1d2b44] md:text-4xl">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-bfw-orange" />
          <p className="mx-auto mt-6 max-w-[600px] text-center font-body text-base text-[#667085]">
            Find answers to common questions about partnering with
            BestFoodWhere.
          </p>

          <div className="mt-10 space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-[#eef0f4] bg-white"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-heading text-base font-medium text-[#1d2b44]">
                    {faq.question}
                  </span>
                  <IconChevronDown
                    className={`h-5 w-5 shrink-0 text-[#667085] transition-transform ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="border-t border-[#eef0f4] px-6 py-5">
                    <p className="font-body text-sm leading-relaxed text-[#667085]">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-bfw-orange to-[#ff7b4d] py-20">
        <div className="mx-auto max-w-[800px] px-4 text-center">
          <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
            Ready to Grow Your Business?
          </h2>
          <p className="mx-auto mt-4 max-w-[500px] font-body text-lg text-white/90">
            Join Singapore&apos;s premier food discovery platform and connect
            with thousands of food enthusiasts actively looking for dining
            experiences like yours.
          </p>

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-xl border-2 border-white bg-white/10 px-8 py-4 font-heading text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-bfw-orange"
          >
            <IconWhatsApp className="h-6 w-6" />
            Contact Us Today
          </a>

          <p className="mt-6 font-body text-sm text-white/70">
            Limited partnership slots available — Apply now to secure your
            position
          </p>
        </div>
      </section>
    </main>
  );
}
