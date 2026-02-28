"use client";

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Search,
  LayoutGrid,
  ChevronRight,
  ChevronDown,
  Linkedin,
  Instagram,
  Github,
  Quote,
  Mail,
  Star,
} from "lucide-react";
import { useState } from "react";

// Team data
const TEAM_MEMBERS = [
  {
    name: "Alex Tan",
    role: "Founder & CEO",
    bio: "Former tech consultant and lifelong foodie who turned his passion for Singapore's diverse food scene into a mission to help others discover hidden culinary gems within shopping malls.",
    gradient: "from-gray-700 to-gray-900",
    icon: "user",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Mei Lin",
    role: "Head of Content",
    bio: "Former food blogger with a keen eye for detail and a passion for food photography. Mei ensures our mall restaurant listings are accurate, comprehensive, and visually appealing.",
    gradient: "from-purple-600 to-purple-800",
    icon: "camera",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Raj Kumar",
    role: "Tech Lead",
    bio: "Full-stack developer with a passion for creating seamless user experiences. Raj is the architect behind our powerful search features and postal code finder for mall restaurants.",
    gradient: "from-blue-600 to-blue-800",
    icon: "code",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
  },
];

// Career positions
const CAREERS = [
  {
    title: "SEO Specialist",
    type: "Full-time",
    location: "Fully Remote",
    description:
      "Drive our organic search strategy and enhance our visibility across Singapore's digital food landscape.",
    responsibilities: [
      "Develop and implement effective SEO strategies",
      "Conduct keyword research for restaurant and mall content",
      "Optimize website structure and content",
      "Analyze performance metrics and provide reports",
    ],
  },
  {
    title: "Content Creator",
    type: "Full-time",
    location: "Fully Remote",
    description:
      "Create compelling, mouthwatering content that showcases Singapore's diverse mall dining options.",
    responsibilities: [
      "Develop engaging content for restaurant listings",
      "Create mall dining guides and food-related articles",
      "Collaborate with our photography team",
      "Ensure content accuracy and quality",
    ],
  },
  {
    title: "Social Media Manager",
    type: "Full-time",
    location: "Fully Remote",
    description:
      "Build and grow our social media presence across platforms, engaging with Singapore's passionate food community.",
    responsibilities: [
      "Develop and execute social media strategy",
      "Create engaging content across platforms",
      "Manage community engagement and responses",
      "Analyze performance metrics and optimize campaigns",
    ],
  },
];

// Testimonials
const TESTIMONIALS = [
  {
    quote:
      "BestFoodWhere has completely changed how I discover restaurants in Singapore. Their mall directory feature is brilliant - I've found amazing places in malls I visit regularly but never knew existed!",
    name: "Sarah L.",
    role: "Food Blogger",
    featured: true,
  },
  {
    quote:
      "As a restaurant owner in Jewel Changi, I've seen a 30% increase in customers since listing on BestFoodWhere!",
    name: "Michael C.",
    role: "Restaurant Owner",
    featured: true,
    dark: true,
  },
  {
    quote:
      "The postal code search is brilliant! I just enter my location and instantly get restaurant recommendations with travel times. Saves so much time!",
    name: "James T.",
    role: "Regular User",
  },
  {
    quote:
      "I love that I can filter by cuisine type across all malls! Found an amazing Japanese restaurant I never would have discovered otherwise.",
    name: "Priya M.",
    role: "Foodie Explorer",
  },
  {
    quote:
      "The exclusive deals are amazing! Saved over $50 last month using the promotions BestFoodWhere negotiated with restaurants.",
    name: "David K.",
    role: "Deal Hunter",
  },
];

// Features
const FEATURES = [
  {
    title: "Postal Code Search",
    description:
      "Our innovative search technology connects you with dining options nearby, showing exact travel times and providing accurate information about every restaurant in Singapore's malls.",
    stat: "6,500+ Areas",
    cta: "Explore Food Near You",
    href: "/postal-code-food-finder",
    icon: MapPin,
    gradient: "from-[#ff6a3d] to-[#ff8c66]",
    bgImage:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  },
  {
    title: "Mall Directory Experts",
    description:
      "As Singapore's only platform specializing in mall dining, we provide interactive floor-by-floor maps and comprehensive listings of every restaurant in Singapore's major shopping centers.",
    stat: "19 Shopping Malls",
    cta: "Discover Mall Dining",
    href: "/shopping-malls",
    icon: Building2,
    gradient: "from-[#1a1a2e] to-[#16213e]",
    bgImage:
      "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  },
  {
    title: "Cuisine Explorer",
    description:
      "Discover Singapore's diverse culinary landscape with our comprehensive cuisine filtering, helping you find exactly what you're craving - from local favorites to international delights.",
    stat: "15+ Cuisines",
    cta: "Browse Cuisines",
    href: "/cuisine/all",
    icon: Search,
    gradient: "from-[#ff6a3d] to-[#ff8c66]",
    bgImage:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  },
  {
    title: "Dining Type Filter",
    description:
      "Filter restaurants by dining experience - casual eateries, fine dining, buffets, food courts, and more - to find the perfect atmosphere for any occasion.",
    stat: "8+ Dining Types",
    cta: "Find Your Style",
    href: "/dining",
    icon: LayoutGrid,
    gradient: "from-[#1e2a78] to-[#243b55]",
    bgImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  },
];

interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  resume: File | null;
}

export default function AboutPage() {
  const [applicationModal, setApplicationModal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
    resume: null,
  });

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let resumeUrl: string | undefined;

      // Upload resume if provided
      if (formData.resume) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", formData.resume);

        const uploadRes = await fetch("/api/career/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload resume");
        }

        const uploadData = await uploadRes.json();
        resumeUrl = uploadData.url;
      }

      // Submit application to career API (which syncs to GHL)
      const res = await fetch("/api/career/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          message: formData.message || undefined,
          resume_url: resumeUrl,
          area_of_interest: applicationModal, // Job title
          availability: "Immediate",
          pageUrl: window.location.href,
          utm_source:
            new URLSearchParams(window.location.search).get("utm_source") ||
            undefined,
          utm_medium:
            new URLSearchParams(window.location.search).get("utm_medium") ||
            undefined,
          utm_campaign:
            new URLSearchParams(window.location.search).get("utm_campaign") ||
            undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Application submission failed");
      }

      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        resume: null,
      });

      // Auto close after success
      setTimeout(() => {
        setApplicationModal(null);
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setApplicationModal(null);
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-[#111] to-[#222]">
        {/* Animated food particles */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute left-[10%] top-[10%] animate-bounce text-4xl">
            🍕
          </div>
          <div className="absolute right-[15%] top-[20%] animate-bounce text-4xl delay-100">
            🍔
          </div>
          <div className="absolute bottom-[15%] left-[15%] animate-bounce text-4xl delay-200">
            🍣
          </div>
          <div className="absolute bottom-[25%] right-[10%] animate-bounce text-4xl delay-300">
            🍜
          </div>
          <div className="absolute left-[20%] top-[40%] animate-bounce text-4xl delay-500">
            🍦
          </div>
          <div className="absolute right-[30%] top-[30%] animate-bounce text-4xl delay-700">
            🥗
          </div>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,106,61,0.3)_0%,rgba(0,0,0,0.7)_70%)]" />

        <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-7xl items-center px-4 py-20">
          <div className="flex flex-wrap items-center justify-between gap-12">
            {/* Text content */}
            <div className="flex-1 space-y-8">
              <div>
                <span className="mb-4 inline-block rounded-full bg-[#ff6a3d]/20 px-5 py-2 text-sm font-semibold text-[#ff6a3d]">
                  ABOUT BESTFOODWHERE
                </span>
                <h1 className="text-5xl font-black leading-tight text-white md:text-6xl">
                  Discover Singapore&apos;s{" "}
                  <span className="text-[#ff6a3d] drop-shadow-[0_5px_30px_rgba(255,106,61,0.8)]">
                    Food Paradise
                  </span>
                </h1>
                <p className="mt-6 max-w-xl text-lg text-white/90">
                  BestFoodWhere is revolutionizing how people discover, explore,
                  and enjoy Singapore&apos;s vibrant dining landscape through
                  innovative mall-based dining exploration.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="#what-we-do"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff6a3d] to-[#ff8c66] px-8 py-4 font-semibold text-white shadow-lg shadow-[#ff6a3d]/40 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  Explore Our Platform
                </Link>
                <Link
                  href="#team"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Meet Our Team
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-10 pt-6">
                <div>
                  <div className="text-5xl font-extrabold text-[#ff6a3d]">
                    10K<span className="text-2xl">+</span>
                  </div>
                  <div className="mt-1 text-sm uppercase tracking-wider text-white/70">
                    Food Listings
                  </div>
                </div>
                <div>
                  <div className="text-5xl font-extrabold text-[#ff6a3d]">
                    19
                  </div>
                  <div className="mt-1 text-sm uppercase tracking-wider text-white/70">
                    Shopping Malls
                  </div>
                </div>
                <div>
                  <div className="text-5xl font-extrabold text-[#ff6a3d]">
                    4.3
                  </div>
                  <div className="mt-1 text-sm uppercase tracking-wider text-white/70">
                    User Rating
                  </div>
                </div>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="hidden flex-1 animate-[float_6s_ease-in-out_infinite] lg:block">
              <div className="relative mx-auto w-[300px]">
                <div className="rounded-[40px] border-8 border-[#333] bg-white p-0 shadow-2xl">
                  {/* Phone header */}
                  <div className="flex h-14 items-center justify-between rounded-t-[32px] bg-gradient-to-r from-[#ff6a3d] to-[#ff8c66] px-4">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/brand/logo.svg"
                        alt="BestFoodWhere"
                        width={120}
                        height={32}
                        className="h-7 w-auto brightness-0 invert"
                        unoptimized
                      />
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white/20" />
                  </div>

                  {/* Phone content */}
                  <div className="p-4">
                    <div className="mb-4">
                      <div className="text-lg font-bold text-gray-900">
                        Find Food Nearby
                      </div>
                      <div className="text-sm text-gray-500">
                        Discover great restaurants in Singapore&apos;s malls
                      </div>
                    </div>

                    {/* Search box */}
                    <div className="mb-4 flex items-center gap-2 rounded-full bg-gray-100 px-4 py-3">
                      <MapPin className="h-5 w-5 text-[#ff6a3d]" />
                      <span className="text-sm text-gray-600">
                        238839 (Orchard)
                      </span>
                      <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#ff6a3d] to-[#ff8c66]">
                        <ChevronRight className="h-4 w-4 text-white" />
                      </div>
                    </div>

                    {/* Restaurant cards */}
                    <div className="text-sm font-semibold text-gray-900 mb-3">
                      Nearby Restaurants
                    </div>
                    {[
                      {
                        name: "Din Tai Fung",
                        type: "Chinese • Dumplings",
                        location: "5 mins away at Paragon",
                        rating: "4.8",
                        emoji: "🍜",
                      },
                      {
                        name: "Shake Shack",
                        type: "American • Burgers",
                        location: "8 mins away at ION Orchard",
                        rating: "4.6",
                        emoji: "🍔",
                      },
                      {
                        name: "Genki Sushi",
                        type: "Japanese • Sushi",
                        location: "10 mins away at 313@Somerset",
                        rating: "4.4",
                        emoji: "🍣",
                      },
                    ].map((restaurant, i) => (
                      <div
                        key={i}
                        className="mb-3 flex items-center gap-3 rounded-xl bg-white p-3 shadow-md"
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                          {restaurant.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {restaurant.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {restaurant.type}
                          </div>
                          <div className="text-xs text-[#ff6a3d]">
                            {restaurant.location}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#ff6a3d]">
                          <Star className="h-3 w-3 fill-current" />
                          {restaurant.rating}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -right-10 top-[10%] h-20 w-20 rotate-[15deg] rounded-2xl bg-gradient-to-br from-[#ff6a3d] to-[#ff8c66] shadow-lg shadow-[#ff6a3d]/40" />
                <div className="absolute -left-8 bottom-[15%] h-16 w-16 -rotate-[10deg] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-10 w-10 text-white" />
        </div>
      </section>

      {/* What We Do Section */}
      <section
        id="what-we-do"
        className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 py-24"
      >
        <div className="mx-auto max-w-7xl px-4">
          {/* Section header */}
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-[#ff6a3d]/10 px-5 py-2 text-sm font-semibold text-[#ff6a3d]">
              WHAT WE DO
            </span>
            <h2 className="relative mb-6 inline-block text-4xl font-extrabold text-gray-900 md:text-5xl">
              Revolutionizing Food Discovery
              <span className="absolute -bottom-2 left-1/4 h-1 w-1/2 bg-gradient-to-r from-transparent via-[#ff6a3d] to-transparent" />
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              BestFoodWhere creates extraordinary dining discovery experiences
              in Singapore&apos;s vibrant mall landscape through innovative
              technology and local expertise.
            </p>
          </div>

          {/* Features grid */}
          <div className="mb-16 grid gap-8 md:grid-cols-2">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="group overflow-hidden rounded-2xl bg-white shadow-lg transition hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden">
                  {/* Background Image */}
                  <Image
                    src={feature.bgImage}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized
                  />
                  {/* Gradient Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-80`}
                  />
                  {/* Icon */}
                  <div className="relative z-10 flex h-full items-center p-6">
                    <feature.icon className="h-16 w-16 text-white drop-shadow-lg" />
                  </div>
                  {/* Animated circle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-32 w-32 animate-pulse rounded-full border-2 border-dashed border-white/30" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mb-6 text-gray-600">{feature.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#ff6a3d]/10 px-4 py-2 text-sm font-medium text-[#ff6a3d]">
                      {feature.stat}
                    </span>
                    <Link
                      href={feature.href}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff6a3d] to-[#ff8c66] px-6 py-3 font-semibold text-white shadow-lg shadow-[#ff6a3d]/20 transition hover:-translate-y-1"
                    >
                      {feature.cta}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mission & Vision */}
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg">
              <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-[#ff6a3d] to-[#ff8c66]" />
              <div className="mb-6 flex items-center gap-4">
                <h3 className="relative text-3xl font-bold text-gray-900">
                  Our Mission
                  <span className="absolute -bottom-2 left-0 h-1 w-16 bg-[#ff6a3d]" />
                </h3>
                <div className="ml-auto text-5xl opacity-20">🍽️</div>
              </div>
              <div className="border-l-4 border-[#ff6a3d]/30 pl-6">
                <p className="mb-4 text-gray-600">
                  At BestFoodWhere, we&apos;re on a mission to make mall dining
                  discovery in Singapore{" "}
                  <span className="font-bold text-[#ff6a3d]">
                    effortless and exciting
                  </span>
                  . We believe everyone deserves to find their perfect dining
                  experience without the frustration of outdated information or
                  limited options.
                </p>
                <p className="text-gray-600">
                  Our platform connects food lovers with{" "}
                  <span className="font-bold text-[#ff6a3d]">
                    comprehensive, accurate, and up-to-date
                  </span>{" "}
                  information about Singapore&apos;s vibrant shopping mall
                  restaurants.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg">
              <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-[#ff8c66] to-[#ff6a3d]" />
              <div className="mb-6 flex items-center gap-4">
                <h3 className="relative text-3xl font-bold text-gray-900">
                  Our Vision
                  <span className="absolute -bottom-2 left-0 h-1 w-16 bg-[#ff6a3d]" />
                </h3>
                <div className="ml-auto text-5xl opacity-20">🚀</div>
              </div>
              <div className="border-l-4 border-[#ff6a3d]/30 pl-6">
                <p className="mb-4 text-gray-600">
                  We envision a Singapore where{" "}
                  <span className="font-bold text-[#ff6a3d]">
                    no great restaurant goes undiscovered
                  </span>
                  . Where dining establishments thrive through increased
                  visibility, and where food lovers can easily find exactly what
                  they&apos;re craving.
                </p>
                <p className="text-gray-600">
                  By 2026, we aim to be{" "}
                  <span className="font-bold text-[#ff6a3d]">
                    Southeast Asia&apos;s premier food discovery platform
                  </span>
                  , expanding beyond shopping malls to cover all dining
                  categories.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-[#ff6a3d]/10 px-5 py-2 text-sm font-semibold text-[#ff6a3d]">
              OUR TEAM
            </span>
            <h2 className="mb-6 text-4xl font-extrabold text-gray-900 md:text-5xl">
              The Faces Behind BestFoodWhere
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Meet our passionate team of food enthusiasts, tech innovators, and
              customer experience experts who make the magic happen.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-10">
            {TEAM_MEMBERS.map((member, i) => (
              <div
                key={i}
                className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-xl"
              >
                <div
                  className={`relative h-56 bg-gradient-to-br ${member.gradient}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white/20">
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#ff6a3d]/90 to-transparent" />
                </div>
                <div className="relative p-6">
                  <div className="absolute -top-8 right-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#ff6a3d] to-[#ff8c66] shadow-lg">
                    <span className="text-2xl text-white">
                      {member.icon === "user"
                        ? "👤"
                        : member.icon === "camera"
                          ? "📸"
                          : "💻"}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="mb-4 font-semibold text-[#ff6a3d]">
                    {member.role}
                  </p>
                  <p className="mb-6 text-gray-600">{member.bio}</p>
                  <div className="flex gap-3">
                    <a
                      href="#"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6a3d]/10 text-[#ff6a3d] transition hover:bg-[#ff6a3d]/20"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6a3d]/10 text-[#ff6a3d] transition hover:bg-[#ff6a3d]/20"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section
        id="careers"
        className="relative overflow-hidden bg-gradient-to-br from-[#111] to-[#222] py-24"
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ff6a3d' fill-opacity='0.3'%3E%3Cpath d='M0 0h4v4H0V0zm10 10h4v4h-4v-4zm-10 10h4v4H0v-4zm10 10h4v4h-4v-4z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-[#ff6a3d]/20 px-5 py-2 text-sm font-semibold text-[#ff6a3d]">
              JOIN OUR TEAM
            </span>
            <h2 className="mb-6 text-4xl font-extrabold text-white md:text-5xl">
              Careers at BestFoodWhere
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-white/80">
              Join our passionate team and help revolutionize Singapore&apos;s
              food discovery landscape. All positions are fully remote!
            </p>
          </div>

          <div className="mb-16 grid gap-8 md:grid-cols-3">
            {CAREERS.map((career, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:-translate-y-2 hover:bg-white/10"
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6a3d]/20 to-[#ff6a3d]/5">
                  <span className="text-4xl">
                    {i === 0 ? "📊" : i === 1 ? "✍️" : "📱"}
                  </span>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-white">
                  {career.title}
                </h3>
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#ff6a3d]/20 px-3 py-1 text-sm text-[#ff6a3d]">
                    {career.type}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                    {career.location}
                  </span>
                </div>
                <p className="mb-6 text-white/80">{career.description}</p>
                <h4 className="mb-3 font-semibold text-[#ff6a3d]">
                  Responsibilities:
                </h4>
                <ul className="mb-6 space-y-2 text-sm text-white/70">
                  {career.responsibilities.map((resp, j) => (
                    <li key={j}>• {resp}</li>
                  ))}
                </ul>
                <button
                  onClick={() => setApplicationModal(career.title)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff6a3d] to-[#ff8c66] px-6 py-3 font-semibold text-white shadow-lg shadow-[#ff6a3d]/30 transition hover:-translate-y-1"
                >
                  Apply Now
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Open Application CTA */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center backdrop-blur-sm">
            <h3 className="mb-4 text-3xl font-bold text-white">
              Don&apos;t See The Right Role?
            </h3>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
              We&apos;re always looking for talented individuals who are
              passionate about food and technology. Send us your resume and let
              us know how you can contribute to our mission.
            </p>
            <button
              onClick={() => setApplicationModal("Open Application")}
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#ff6a3d] to-[#ff8c66] px-8 py-4 font-semibold text-white shadow-lg shadow-[#ff6a3d]/40 transition hover:-translate-y-1"
            >
              Send Open Application
              <Mail className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-[#ff6a3d]/10 px-5 py-2 text-sm font-semibold text-[#ff6a3d]">
              TESTIMONIALS
            </span>
            <h2 className="mb-6 text-4xl font-extrabold text-gray-900 md:text-5xl">
              What Our Users Say
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              The real stories from food lovers who use BestFoodWhere to
              discover Singapore&apos;s amazing mall dining scene.
            </p>
          </div>

          {/* Featured testimonials */}
          <div className="mb-12 grid gap-8 lg:grid-cols-12">
            <div className="col-span-8 rounded-2xl bg-gradient-to-br from-[#ff6a3d]/5 to-[#ff6a3d]/10 p-8 shadow-lg">
              <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6a3d] to-[#ff8c66] shadow-lg">
                <Quote className="h-7 w-7 text-white" />
              </div>
              <p className="mb-8 text-2xl font-light italic text-gray-700">
                {TESTIMONIALS[0].quote}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {TESTIMONIALS[0].name}
                    </div>
                    <div className="text-gray-600">{TESTIMONIALS[0].role}</div>
                  </div>
                </div>
                <div className="text-[#ff6a3d]">★★★★★</div>
              </div>
            </div>

            <div className="col-span-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-8 text-white shadow-lg">
              <div className="relative mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6a3d] to-[#ff8c66] shadow-lg">
                <Quote className="h-6 w-6 text-white" />
              </div>
              <p className="mb-6 text-lg font-light italic text-white/90">
                {TESTIMONIALS[1].quote}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <div className="font-bold">{TESTIMONIALS[1].name}</div>
                    <div className="text-sm text-white/70">
                      {TESTIMONIALS[1].role}
                    </div>
                  </div>
                </div>
                <div className="text-[#ff6a3d]">★★★★★</div>
              </div>
            </div>
          </div>

          {/* Small testimonials */}
          <div className="flex flex-wrap justify-center gap-8">
            {TESTIMONIALS.slice(2).map((testimonial, i) => (
              <div
                key={i}
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg"
              >
                <p className="mb-6 italic text-gray-600">{testimonial.quote}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <span>👤</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-[#ff6a3d]">★★★★★</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Modal */}
      {applicationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={handleModalClose}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleModalClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              ×
            </button>

            {submitSuccess ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-8 w-8 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  Application Submitted!
                </h3>
                <p className="text-gray-600">
                  Thank you for your interest in joining BestFoodWhere.
                  We&apos;ll review your application and get back to you soon.
                </p>
              </div>
            ) : (
              <>
                <h3 className="mb-6 text-center text-2xl font-bold text-gray-900">
                  Apply for{" "}
                  <span className="text-[#ff6a3d]">{applicationModal}</span>
                </h3>

                {submitError && (
                  <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block font-semibold text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-semibold text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-semibold text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                      placeholder="+65 8123 4567"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-semibold text-gray-700">
                      Resume/CV
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          resume: e.target.files?.[0] || null,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[#ff6a3d]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#ff6a3d]"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      PDF, DOC, or DOCX (max 5MB)
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block font-semibold text-gray-700">
                      Cover Letter / Message
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                      placeholder="Tell us why you'd be a great fit..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-gradient-to-r from-[#ff6a3d] to-[#ff8c66] py-4 font-semibold text-white shadow-lg shadow-[#ff6a3d]/20 transition hover:shadow-xl disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="h-5 w-5 animate-spin"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
