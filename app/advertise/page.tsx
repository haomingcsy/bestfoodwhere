"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Target,
  TrendingUp,
  BarChart3,
  MapPin,
  Check,
  ArrowRight,
  Star,
  Users,
  Utensils,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  Award,
  Eye,
  MousePointerClick,
  X,
  Loader2,
  Building2,
} from "lucide-react";
import type { PricingTier } from "@/lib/stripe/types";

// Pricing tiers
const PRICING_TIERS: Array<{
  id: PricingTier;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  gradient: string;
}> = [
  {
    id: "basic",
    name: "Basic Listing",
    price: "Free",
    period: "",
    description: "Get discovered by food lovers",
    features: [
      "Basic restaurant profile",
      "Operating hours & location",
      "Cuisine category listing",
      "Contact information",
      "User reviews display",
    ],
    cta: "Get Started",
    popular: false,
    gradient: "from-gray-800 to-gray-900",
  },
  {
    id: "featured",
    name: "Featured Listing",
    price: "$199",
    period: "/month",
    description: "Stand out from the crowd",
    features: [
      "Everything in Basic",
      "Priority search placement",
      "Verified badge",
      "Up to 10 photos",
      "Menu highlights",
      "Special offers section",
      "Basic analytics",
    ],
    cta: "Start Growing",
    popular: true,
    gradient: "from-[#ff6a3d] to-[#ff8c66]",
  },
  {
    id: "premium",
    name: "Premium Listing",
    price: "$499",
    period: "/month",
    description: "Maximum visibility & impact",
    features: [
      "Everything in Featured",
      "Homepage spotlight rotation",
      "Dedicated landing page",
      "Advanced analytics dashboard",
      "Category page banner",
      "Newsletter feature",
      "Priority support",
      "Social media promotion",
    ],
    cta: "Go Premium",
    popular: false,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For F&B groups & chains",
    features: [
      "Multi-location management",
      "Bulk listing tools",
      "Custom branding options",
      "API access",
      "Dedicated account manager",
      "Custom reporting",
      "Co-marketing opportunities",
      "Exclusive partnerships",
    ],
    cta: "Contact Sales",
    popular: false,
    gradient: "from-violet-600 to-purple-700",
  },
];

// Benefits
const BENEFITS = [
  {
    icon: Target,
    title: "Targeted Reach",
    description:
      "Connect with food lovers actively searching for their next meal. Our users are hungry and ready to dine.",
    stat: "85%",
    statLabel: "visit within 24hrs",
  },
  {
    icon: Eye,
    title: "Premium Placement",
    description:
      "Featured listings, homepage banners, and category spotlights ensure your restaurant gets noticed first.",
    stat: "3x",
    statLabel: "more visibility",
  },
  {
    icon: BarChart3,
    title: "Measurable Results",
    description:
      "Track your performance with our analytics dashboard. See clicks, views, and ROI in real-time.",
    stat: "100%",
    statLabel: "transparent data",
  },
  {
    icon: MapPin,
    title: "Local Expertise",
    description:
      "We know Singapore's mall dining scene inside out. Benefit from our deep local knowledge and connections.",
    stat: "19",
    statLabel: "malls covered",
  },
];

// Success stories
const SUCCESS_STORIES = [
  {
    restaurant: "Flavor House Group",
    quote:
      "Since partnering with BestFoodWhere, our weekend reservations have increased by 40%. The targeted visibility to mall shoppers has been a game-changer for our outlets.",
    person: "James Lim",
    role: "Marketing Director",
    stat: "+40%",
    statLabel: "Weekend Bookings",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    restaurant: "Sakura Sushi",
    quote:
      "The Premium listing paid for itself within the first month. We've seen consistent foot traffic from customers who discovered us on BestFoodWhere.",
    person: "Yuki Tanaka",
    role: "Owner",
    stat: "+35%",
    statLabel: "Foot Traffic",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    restaurant: "The Hungry Bear Cafe",
    quote:
      "Being featured on the homepage during our launch week brought in over 200 new customers. Best marketing investment we've made.",
    person: "David Chen",
    role: "Founder",
    stat: "200+",
    statLabel: "New Customers",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
];

// How it works steps
const STEPS = [
  {
    number: "01",
    title: "Get in Touch",
    description:
      "Fill out our quick form or give us a call. Our team will reach out within 24 hours to understand your needs.",
    icon: Phone,
  },
  {
    number: "02",
    title: "Choose Your Plan",
    description:
      "Select the advertising package that fits your goals and budget. We'll help you pick the perfect option.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Get Featured",
    description:
      "Your listing goes live and hungry foodies start discovering your restaurant. Watch your business grow!",
    icon: TrendingUp,
  },
];

// Singapore malls list
const SINGAPORE_MALLS = [
  "313@Somerset",
  "Bugis Junction",
  "Bugis+",
  "Capitol Singapore",
  "Causeway Point",
  "Century Square",
  "Changi City Point",
  "City Square Mall",
  "Clarke Quay",
  "Compass One",
  "Funan",
  "Great World City",
  "HarbourFront Centre",
  "ION Orchard",
  "JCube",
  "Jewel Changi Airport",
  "Junction 8",
  "Jurong Point",
  "Marina Bay Sands",
  "Marina Square",
  "NEX",
  "Ngee Ann City",
  "Northpoint City",
  "Novena Square",
  "Orchard Central",
  "Orchard Gateway",
  "Paya Lebar Quarter",
  "Plaza Singapura",
  "Raffles City",
  "Seletar Mall",
  "Suntec City",
  "Tampines Mall",
  "The Cathay",
  "The Centrepoint",
  "The Clementi Mall",
  "The Heeren",
  "The Star Vista",
  "Thomson Plaza",
  "Tiong Bahru Plaza",
  "United Square",
  "Velocity @ Novena Square",
  "VivoCity",
  "Waterway Point",
  "Westgate",
  "White Sands",
  "Wisma Atria",
  "Other",
];

const CUISINE_TYPES = [
  "Asian Fusion",
  "Chinese",
  "Indian",
  "Italian",
  "Japanese",
  "Korean",
  "Malay",
  "Mediterranean",
  "Mexican",
  "Thai",
  "Vietnamese",
  "Western",
  "Cafe & Bakery",
  "Fast Food",
  "Halal",
  "Vegetarian",
  "Seafood",
  "Steakhouse",
  "Other",
];

interface RestaurantFormData {
  restaurantName: string;
  contactName: string;
  email: string;
  phone: string;
  mallLocation: string;
  cuisineType: string;
  website: string;
  description: string;
}

function CanceledBanner() {
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled");

  if (!canceled) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="mx-auto max-w-7xl flex items-center justify-center gap-2 text-yellow-800">
        <span>
          Payment was canceled. You can try again when you&apos;re ready.
        </span>
      </div>
    </div>
  );
}

export default function AdvertisePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [restaurantForm, setRestaurantForm] = useState<RestaurantFormData>({
    restaurantName: "",
    contactName: "",
    email: "",
    phone: "",
    mallLocation: "",
    cuisineType: "",
    website: "",
    description: "",
  });

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    restaurant: "",
    phone: "",
    message: "",
  });

  const handleTierSelect = (tierId: PricingTier) => {
    setSelectedTier(tierId);
    setIsModalOpen(true);
    setError(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTier(null);
    setError(null);
  };

  const handleRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          restaurantInfo: restaurantForm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle contact form submission
    console.log("Contact form submitted:", contactForm);
  };

  const selectedTierData = PRICING_TIERS.find((t) => t.id === selectedTier);

  return (
    <main className="min-h-screen bg-white">
      {/* Canceled banner */}
      <Suspense fallback={null}>
        <CanceledBanner />
      </Suspense>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] py-24 lg:py-32">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 106, 61, 0.15) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(255, 140, 102, 0.1) 0%, transparent 50%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff6a3d' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Floating elements */}
        <div className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-[#ff6a3d]/10 blur-3xl" />
        <div className="absolute right-[15%] bottom-[20%] h-48 w-48 rounded-full bg-[#ff8c66]/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ff6a3d]/30 bg-[#ff6a3d]/10 px-4 py-2 text-sm font-medium text-[#ff6a3d]">
                <Utensils className="h-4 w-4" />
                Grow Your Restaurant Business
              </div>

              <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                Reach Singapore&apos;s
                <span className="relative ml-3 inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-[#ff6a3d] to-[#ff8c66] bg-clip-text text-transparent">
                    Hungry Foodies
                  </span>
                  <span className="absolute -bottom-2 left-0 h-3 w-full bg-[#ff6a3d]/20 blur-sm" />
                </span>
              </h1>

              <p className="mb-8 text-lg text-gray-400 md:text-xl">
                Join 500+ restaurants already growing their business with
                BestFoodWhere. Get discovered by thousands of food lovers
                searching for their next meal in Singapore&apos;s top malls.
              </p>

              <div className="mb-10 flex flex-wrap justify-center gap-4 lg:justify-start">
                <Link
                  href="#pricing"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff6a3d] to-[#ff8c66] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[#ff6a3d]/25 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#ff6a3d]/30"
                >
                  View Pricing
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  Talk to Sales
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 lg:justify-start">
                {[
                  { value: "10K+", label: "Food Listings" },
                  { value: "100K+", label: "Monthly Visitors" },
                  { value: "19", label: "Malls Covered" },
                ].map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-[#ff6a3d]">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Element - Growth Chart Mockup */}
            <div className="relative hidden lg:block">
              <div className="relative mx-auto w-full max-w-md">
                {/* Dashboard mockup */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-xl">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-400">
                        Restaurant Views
                      </div>
                      <div className="text-3xl font-bold text-white">
                        12,847
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400">
                      <TrendingUp className="h-4 w-4" />
                      +127%
                    </div>
                  </div>

                  {/* Chart bars */}
                  <div className="flex h-32 items-end gap-2">
                    {[40, 55, 45, 70, 65, 85, 75, 95, 88, 100, 92, 110].map(
                      (height, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm bg-gradient-to-t from-[#ff6a3d] to-[#ff8c66] transition-all hover:opacity-80"
                          style={{
                            height: `${height}%`,
                            animationDelay: `${i * 100}ms`,
                          }}
                        />
                      ),
                    )}
                  </div>

                  <div className="mt-4 flex justify-between text-xs text-gray-500">
                    <span>Jan</span>
                    <span>Dec</span>
                  </div>
                </div>

                {/* Floating stat cards */}
                <div className="absolute -left-8 top-1/4 rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6a3d]/20">
                      <MousePointerClick className="h-5 w-5 text-[#ff6a3d]" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">3,421</div>
                      <div className="text-xs text-gray-400">Clicks</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 bottom-1/4 rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                      <Users className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">892</div>
                      <div className="text-xs text-gray-400">New Customers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Why Advertise Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-[#ff6a3d]/10 px-4 py-2 text-sm font-semibold text-[#ff6a3d]">
              WHY BESTFOODWHERE
            </span>
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Your Restaurant Deserves
              <br />
              <span className="text-[#ff6a3d]">Maximum Visibility</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              We&apos;re not just another listing site. We&apos;re
              Singapore&apos;s dedicated mall dining discovery platform,
              connecting your restaurant with customers who are ready to eat.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="absolute right-4 top-4 text-5xl font-black text-gray-100 transition-colors group-hover:text-[#ff6a3d]/10">
                  {benefit.stat}
                </div>

                <div className="relative">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6a3d] to-[#ff8c66] text-white shadow-lg shadow-[#ff6a3d]/25">
                    <benefit.icon className="h-7 w-7" />
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-gray-900">
                    {benefit.title}
                  </h3>
                  <p className="mb-4 text-gray-600">{benefit.description}</p>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#ff6a3d]">
                      {benefit.stat}
                    </span>
                    <span className="text-sm text-gray-500">
                      {benefit.statLabel}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-[#ff6a3d]/10 px-4 py-2 text-sm font-semibold text-[#ff6a3d]">
              PRICING PLANS
            </span>
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Choose Your Growth Plan
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              From free listings to premium placement, we have options for every
              budget. Start free and upgrade as you grow.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            {PRICING_TIERS.map((tier, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl ${
                  tier.popular
                    ? "ring-2 ring-[#ff6a3d] ring-offset-4"
                    : "border border-gray-200"
                } bg-white shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl`}
              >
                {tier.popular && (
                  <div className="absolute right-4 top-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ff6a3d] px-3 py-1 text-xs font-semibold text-white">
                      <Star className="h-3 w-3 fill-current" />
                      POPULAR
                    </span>
                  </div>
                )}

                <div
                  className={`bg-gradient-to-br ${tier.gradient} p-6 text-white`}
                >
                  <h3 className="mb-2 text-xl font-bold">{tier.name}</h3>
                  <p className="mb-4 text-sm opacity-80">{tier.description}</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-black">{tier.price}</span>
                    <span className="ml-1 text-lg opacity-80">
                      {tier.period}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <ul className="mb-6 space-y-3">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff6a3d]" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleTierSelect(tier.id)}
                    className={`w-full rounded-full py-3 font-semibold transition-all ${
                      tier.popular
                        ? "bg-gradient-to-r from-[#ff6a3d] to-[#ff8c66] text-white shadow-lg shadow-[#ff6a3d]/25 hover:shadow-xl"
                        : "border-2 border-gray-200 text-gray-900 hover:border-[#ff6a3d] hover:text-[#ff6a3d]"
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-[#ff6a3d]/10 px-4 py-2 text-sm font-semibold text-[#ff6a3d]">
              SUCCESS STORIES
            </span>
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Restaurants Growing With Us
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Don&apos;t just take our word for it. See how restaurants across
              Singapore are thriving with BestFoodWhere.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {SUCCESS_STORIES.map((story, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl"
              >
                {/* Stat badge */}
                <div className="absolute right-6 top-6 rounded-xl bg-gradient-to-br from-[#ff6a3d] to-[#ff8c66] px-4 py-2 text-center">
                  <div className="text-2xl font-bold text-white">
                    {story.stat}
                  </div>
                  <div className="text-xs text-white/80">{story.statLabel}</div>
                </div>

                <div className="mb-6">
                  <Award className="h-8 w-8 text-[#ff6a3d]" />
                </div>

                <p className="mb-6 text-gray-600 italic">
                  &ldquo;{story.quote}&rdquo;
                </p>

                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={story.avatar}
                      alt={story.person}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {story.person}
                    </div>
                    <div className="text-sm text-gray-500">
                      {story.role}, {story.restaurant}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-[#ff6a3d]/20 px-4 py-2 text-sm font-semibold text-[#ff6a3d]">
              HOW IT WORKS
            </span>
            <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
              Get Started in 3 Simple Steps
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              We&apos;ve made it easy for you to start growing your restaurant
              business with BestFoodWhere.
            </p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connecting line */}
            <div className="absolute left-1/2 top-20 hidden h-0.5 w-2/3 -translate-x-1/2 bg-gradient-to-r from-[#ff6a3d] via-[#ff8c66] to-[#ff6a3d] md:block" />

            {STEPS.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6a3d] to-[#ff8c66] text-white shadow-lg shadow-[#ff6a3d]/30">
                  <step.icon className="h-10 w-10" />
                  <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-[#ff6a3d]">
                    {step.number}
                  </div>
                </div>

                <h3 className="mb-3 text-xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section id="contact" className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff6a3d] to-[#ff8c66] shadow-2xl shadow-[#ff6a3d]/25">
            <div className="grid lg:grid-cols-2">
              {/* Left - Info */}
              <div className="p-12 text-white lg:p-16">
                <h2 className="mb-6 text-4xl font-bold md:text-5xl">
                  Ready to Grow Your Restaurant?
                </h2>
                <p className="mb-8 text-lg text-white/90">
                  Get in touch with our team and let us help you reach thousands
                  of hungry foodies in Singapore. Free consultation included!
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-sm text-white/70">Email us</div>
                      <div className="font-semibold">
                        advertise@bestfoodwhere.sg
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-sm text-white/70">Call us</div>
                      <div className="font-semibold">+65 8123 4567</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - Form */}
              <div className="bg-white p-12 lg:p-16">
                <h3 className="mb-6 text-2xl font-bold text-gray-900">
                  Get Your Free Consultation
                </h3>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Restaurant Name
                      </label>
                      <input
                        type="text"
                        value={contactForm.restaurant}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            restaurant: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                        placeholder="Your Restaurant"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                        placeholder="john@restaurant.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                        placeholder="+65 8123 4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Tell us about your goals
                    </label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          message: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                      placeholder="What would you like to achieve with BestFoodWhere?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#ff6a3d] to-[#ff8c66] py-4 font-semibold text-white shadow-lg shadow-[#ff6a3d]/25 transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    Get Started
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurant Submission Modal */}
      {isModalOpen && selectedTierData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div
              className={`bg-gradient-to-br ${selectedTierData.gradient} p-6 text-white`}
            >
              <button
                onClick={handleModalClose}
                className="absolute right-4 top-4 rounded-full bg-white/20 p-2 hover:bg-white/30 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-6 w-6" />
                <span className="text-sm font-medium opacity-80">
                  List Your Restaurant
                </span>
              </div>
              <h3 className="text-2xl font-bold">{selectedTierData.name}</h3>
              <p className="text-white/80 mt-1">
                {selectedTierData.price === "Free" ||
                selectedTierData.price === "Custom"
                  ? selectedTierData.description
                  : `${selectedTierData.price}${selectedTierData.period} - ${selectedTierData.description}`}
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleRestaurantSubmit} className="p-6 space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Restaurant Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={restaurantForm.restaurantName}
                    onChange={(e) =>
                      setRestaurantForm({
                        ...restaurantForm,
                        restaurantName: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                    placeholder="Your Restaurant Name"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={restaurantForm.contactName}
                    onChange={(e) =>
                      setRestaurantForm({
                        ...restaurantForm,
                        contactName: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                    placeholder="Your Name"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={restaurantForm.email}
                    onChange={(e) =>
                      setRestaurantForm({
                        ...restaurantForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                    placeholder="contact@restaurant.com"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={restaurantForm.phone}
                    onChange={(e) =>
                      setRestaurantForm({
                        ...restaurantForm,
                        phone: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                    placeholder="+65 8123 4567"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Mall Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={restaurantForm.mallLocation}
                    onChange={(e) =>
                      setRestaurantForm({
                        ...restaurantForm,
                        mallLocation: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                    required
                  >
                    <option value="">Select a mall</option>
                    {SINGAPORE_MALLS.map((mall) => (
                      <option key={mall} value={mall}>
                        {mall}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Cuisine Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={restaurantForm.cuisineType}
                    onChange={(e) =>
                      setRestaurantForm({
                        ...restaurantForm,
                        cuisineType: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                    required
                  >
                    <option value="">Select cuisine type</option>
                    {CUISINE_TYPES.map((cuisine) => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Website (optional)
                </label>
                <input
                  type="url"
                  value={restaurantForm.website}
                  onChange={(e) =>
                    setRestaurantForm({
                      ...restaurantForm,
                      website: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                  placeholder="https://yourrestaurant.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tell us about your restaurant (optional)
                </label>
                <textarea
                  value={restaurantForm.description}
                  onChange={(e) =>
                    setRestaurantForm({
                      ...restaurantForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/20"
                  placeholder="Briefly describe your restaurant, specialties, and what makes you unique..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="flex-1 rounded-lg border-2 border-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#ff6a3d] to-[#ff8c66] py-3 font-semibold text-white shadow-lg shadow-[#ff6a3d]/25 hover:shadow-xl transition-all disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : selectedTier === "basic" ? (
                    "Submit Listing"
                  ) : selectedTier === "enterprise" ? (
                    "Request Quote"
                  ) : (
                    "Continue to Payment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
