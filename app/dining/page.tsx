"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, MapPin, Star, Clock, Users, Heart, Utensils } from "lucide-react";
import type { Metadata } from "next";

// ============================================================================
// TYPES
// ============================================================================

interface DiningCategory {
  title: string;
  slug: string;
  description: string;
  image: string;
  stats: { icon: string; label: string }[];
}

interface Restaurant {
  name: string;
  location: string;
  image: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  description: string;
  category: string;
  directionsUrl: string;
  menuUrl: string;
}

interface Deal {
  id: string;
  tag: string;
  title: string;
  duration: string;
  description: string;
}

// ============================================================================
// DATA
// ============================================================================

const DINING_CATEGORIES: DiningCategory[] = [
  {
    title: "Fine Dining",
    slug: "fine-dining",
    description:
      "Experience culinary excellence with exquisite dishes and impeccable service in elegant settings",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    stats: [
      { icon: "restaurant", label: "25+ Restaurants" },
      { icon: "star", label: "15 Michelin Stars" },
    ],
  },
  {
    title: "Casual Dining",
    slug: "casual-dining",
    description:
      "Enjoy relaxed atmospheres with quality food at reasonable prices - perfect for everyday meals",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    stats: [
      { icon: "restaurant", label: "80+ Restaurants" },
      { icon: "users", label: "3,500+ Menu Items" },
    ],
  },
  {
    title: "Quick Bites",
    slug: "quick-bites",
    description:
      "Fast and delicious options for when you're on the go but don't want to compromise on taste",
    image:
      "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    stats: [
      { icon: "restaurant", label: "60+ Locations" },
      { icon: "clock", label: "Fast Service" },
    ],
  },
  {
    title: "Family-Friendly",
    slug: "family-friendly",
    description:
      "Welcoming venues with menus and facilities catering to all ages - ideal for family gatherings",
    image:
      "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1964&q=80",
    stats: [
      { icon: "restaurant", label: "50+ Restaurants" },
      { icon: "users", label: "Kid-Friendly" },
    ],
  },
  {
    title: "Romantic",
    slug: "romantic",
    description:
      "Perfect settings for special occasions with intimate atmospheres and exceptional dining experiences",
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    stats: [
      { icon: "restaurant", label: "25+ Restaurants" },
      { icon: "heart", label: "Intimate Settings" },
    ],
  },
  {
    title: "Late Night",
    slug: "late-night",
    description:
      "Satisfy your cravings after hours with these establishments serving delicious meals into the night",
    image:
      "https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1964&q=80",
    stats: [
      { icon: "restaurant", label: "35+ Venues" },
      { icon: "clock", label: "Open Past Midnight" },
    ],
  },
];

const FEATURED_RESTAURANTS: Restaurant[] = [
  {
    name: "CUT by Wolfgang Puck",
    location: "Marina Bay Sands",
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPT2dL1P55UQQvcIpG8Nrgly7xyaVUdOlLMBXhC=w408-h271-k-no",
    rating: 4.6,
    reviewCount: 1618,
    tags: ["Steak", "Western", "Premium"],
    description:
      "An elevated steakhouse by celebrity chef Wolfgang Puck, offering prime cuts of beef and refined side dishes in an elegant setting.",
    category: "FINE DINING",
    directionsUrl:
      "https://www.google.com/maps/search/?api=1&query=CUT+by+Wolfgang+Puck+Marina+Bay+Sands",
    menuUrl: "/menu/cut-by-wolfgang-puck/?location=marina-bay-sands",
  },
  {
    name: "Fish & Co. @ Causeway Point",
    location: "Causeway Point",
    image:
      "https://lh5.googleusercontent.com/p/AF1QipN0Yrlmzm6pDloQ57RHJLrfTrU-EnGLfmQkKU1n=w426-h240-k-no",
    rating: 4.5,
    reviewCount: 329,
    tags: ["Western", "Seafood", "Family Friendly"],
    description:
      "Seafood chain restaurant serving fish and chips and other seafood dishes in pan presentations, perfect for family dining.",
    category: "FAMILY FRIENDLY",
    directionsUrl:
      "https://www.google.com/maps/search/?api=1&query=Fish+%26+Co.+Causeway+Point",
    menuUrl: "/menu/fish-co/?location=causeway-point",
  },
  {
    name: "KOMA Singapore",
    location: "Marina Bay Sands",
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNEOKHK4It8mr0UrPhrLwMM7u_270XEK-Cw60Js=w408-h287-k-no",
    rating: 4.3,
    reviewCount: 2511,
    tags: ["Japanese", "Sushi", "Fine Dining"],
    description:
      "Modern Japanese restaurant with stunning interiors featuring a traditional Japanese footbridge and dramatic 20-foot high ceiling.",
    category: "JAPANESE",
    directionsUrl:
      "https://www.google.com/maps/search/?api=1&query=KOMA+Singapore+Marina+Bay+Sands",
    menuUrl: "/menu/koma-singapore/?location=marina-bay-sands",
  },
  {
    name: "LAVO Italian Restaurant",
    location: "Marina Bay Sands",
    image:
      "https://lh5.googleusercontent.com/p/AF1QipM7GaPSaX8lEasq8Hrb0DKIz2Sy5gLU_g6E0lrc=w426-h240-k-no",
    rating: 4.3,
    reviewCount: 5134,
    tags: ["Italian", "Rooftop", "Romantic"],
    description:
      "Italian-American restaurant and rooftop bar on the 57th floor offering breathtaking city views, perfect for a romantic dinner.",
    category: "ROMANTIC",
    directionsUrl:
      "https://www.google.com/maps/search/?api=1&query=LAVO+Italian+Restaurant+Marina+Bay+Sands",
    menuUrl: "/menu/lavo-italian-restaurant/?location=marina-bay-sands",
  },
  {
    name: "Swensen's @ AMK Hub",
    location: "AMK Hub",
    image:
      "https://lh5.googleusercontent.com/p/AF1QipO0kbjHf8ohjwuRfftXjWMI0SzHqlp8gaybVegb=w408-h270-k-no",
    rating: 3.8,
    reviewCount: 1003,
    tags: ["Western", "Dessert", "Casual Dining"],
    description:
      "Family restaurant serving Western comfort food and known for their ice cream sundaes and desserts in a casual setting.",
    category: "CASUAL",
    directionsUrl:
      "https://www.google.com/maps/search/?api=1&query=Swensen's+AMK+Hub",
    menuUrl: "/menu/swensens/?location=amk-hub",
  },
  {
    name: "Bar Bar Q",
    location: "Suntec City",
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNl7YE5KUv4V8Dqra0_dZ092dcUKedPgfChpL0r=w128-h86-k-no",
    rating: 4.0,
    reviewCount: 394,
    tags: ["Western", "Bar", "Late Night"],
    description:
      "Lively bar and restaurant offering Western fare and a wide selection of drinks, popular for afterwork gatherings and late-night hangouts.",
    category: "LATE NIGHT",
    directionsUrl:
      "https://www.google.com/maps/search/?api=1&query=Bar+Bar+Q+Suntec+City",
    menuUrl: "/menu/bar-bar-q/?location=suntec-city",
  },
];

const DEALS: Deal[] = [
  {
    id: "deal1",
    tag: "BUY 1 GET 1",
    title: "Buy 1 Get 1 Free at Ya Kun Kaya Toast",
    duration: "Valid till: 15 May 2025",
    description:
      "Buy one set and get another set free. Valid Monday to Friday before 11am. Not valid on public holidays.",
  },
  {
    id: "deal2",
    tag: "KIDS EAT FREE",
    title: "Kids Eat Free at Marché on Weekends",
    duration: "Valid till: 30 May 2025",
    description:
      "One free kid's meal with every adult main course purchased. Valid for children under 12 years old on Saturdays and Sundays.",
  },
  {
    id: "deal3",
    tag: "COUPLE SPECIAL",
    title: "Candlelit Dinner Package at CUT by Wolfgang Puck",
    duration: "Valid till: 31 Aug 2025",
    description:
      "4-course set dinner for two with a bottle of house wine. Includes complimentary dessert and romantic table setting.",
  },
];

const REGIONS = [
  { id: "all", label: "All Regions", tooltip: "All areas in Singapore" },
  {
    id: "central",
    label: "Central",
    tooltip:
      "Districts 01-08, 09-13 (Raffles Place, Orchard, River Valley, Chinatown)",
  },
  {
    id: "east",
    label: "East",
    tooltip: "Districts 14-18 (Geylang, Katong, Bedok, Tampines, Pasir Ris)",
  },
  {
    id: "west",
    label: "West",
    tooltip: "Districts 22-24 (Jurong, Boon Lay, Choa Chu Kang)",
  },
  {
    id: "north",
    label: "North",
    tooltip: "Districts 25-28 (Kranji, Woodgrove, Yishun, Sembawang, Seletar)",
  },
  {
    id: "north-east",
    label: "North-East",
    tooltip: "Districts 19-20, 28 (Serangoon, Hougang, Punggol, Seletar)",
  },
  {
    id: "south",
    label: "South",
    tooltip: "Districts 01-02 (Raffles Place, Tanjong Pagar, Marina Bay)",
  },
];

const FEATURES = [
  "Fine Dining",
  "Casual Dining",
  "Quick Bites",
  "Family-Friendly",
  "Romantic",
  "Late Night",
];

// ============================================================================
// COMPONENTS
// ============================================================================

function HeroSection() {
  return (
    <div className="w-full bg-[#f0f7ff] border-b border-[#4177c4]/10 mb-4">
      <div className="flex flex-col md:flex-row max-w-[1200px] mx-auto py-10 px-5 items-center gap-8">
        {/* Content */}
        <div className="flex-1 md:pr-8">
          <h1 className="font-heading text-[32px] md:text-[38px] font-bold leading-tight mb-4">
            Singapore <span className="text-[#4177c4]">Dining</span> Guide
          </h1>
          <p className="text-lg text-gray-600 mb-5 leading-relaxed">
            Discover the best restaurants across all dining styles in Singapore
            - from fine dining to quick bites, and everything in between
          </p>
          <a
            href="#dining-categories"
            className="inline-block bg-[#4177c4] text-white py-3 px-6 rounded-md font-semibold text-base hover:bg-[#3366b3] transition-colors mb-6"
          >
            Explore Dining Options
          </a>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-center text-base">
                <span className="text-[#4177c4] font-bold mr-2">✓</span>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Images Grid */}
        <div className="flex-1 grid grid-cols-3 gap-3 h-[220px] md:h-[280px]">
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
              alt="Fine dining experience"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
              alt="Restaurant ambiance"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1555992336-fb0d29498b13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1964&q=80"
              alt="Family dining"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsSection() {
  const stats = [
    { number: "1,000+", label: "Restaurants" },
    { number: "6", label: "Dining Categories" },
    { number: "30+", label: "Cuisines" },
    { number: "4.3", label: "Average Rating" },
  ];

  return (
    <div className="flex justify-around py-4 bg-white shadow-sm mt-3 mb-4 rounded-xl">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="text-[26px] font-bold text-[#4177c4] mb-1">
            {stat.number}
          </div>
          <div className="text-sm text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

function FilterSection({
  activeRegion,
  onRegionChange,
}: {
  activeRegion: string;
  onRegionChange: (region: string) => void;
}) {
  return (
    <div className="py-4 flex flex-wrap gap-2 bg-gray-50 mb-5 rounded-xl justify-center">
      {REGIONS.map((region) => (
        <button
          key={region.id}
          onClick={() => onRegionChange(region.id)}
          title={region.tooltip}
          className={`px-4 py-2 rounded-full text-sm cursor-pointer transition-all border ${
            activeRegion === region.id
              ? "bg-[#4177c4] text-white border-[#4177c4]"
              : "bg-white border-gray-200 hover:border-[#4177c4]"
          }`}
        >
          {region.label}
        </button>
      ))}
    </div>
  );
}

function DiningCategoryCard({ category }: { category: DiningCategory }) {
  const getStatIcon = (iconType: string) => {
    switch (iconType) {
      case "restaurant":
        return <Utensils className="w-4 h-4 text-[#4177c4]" />;
      case "star":
        return <Star className="w-4 h-4 text-[#4177c4]" />;
      case "users":
        return <Users className="w-4 h-4 text-[#4177c4]" />;
      case "clock":
        return <Clock className="w-4 h-4 text-[#4177c4]" />;
      case "heart":
        return <Heart className="w-4 h-4 text-[#4177c4]" />;
      default:
        return <Utensils className="w-4 h-4 text-[#4177c4]" />;
    }
  };

  return (
    <Link
      href={`/dining/${category.slug}`}
      className="group block rounded-xl overflow-hidden shadow-lg transition-all duration-300 bg-white hover:-translate-y-1 hover:shadow-xl relative"
    >
      {/* Top gradient bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4177c4] to-[#6799e8] z-10" />

      {/* Image */}
      <div className="h-[200px] relative overflow-hidden">
        <Image
          src={category.image}
          alt={category.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="p-5 bg-white">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#4177c4] transition-colors">
          {category.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {category.description}
        </p>
        <div className="flex flex-wrap gap-4 mb-4">
          {category.stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 text-sm text-gray-600"
            >
              {getStatIcon(stat.icon)}
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
        <span className="inline-block bg-gradient-to-r from-[#4177c4] to-[#6799e8] text-white py-2 px-4 rounded text-sm font-semibold hover:from-[#3366b3] hover:to-[#4177c4] transition-all hover:-translate-y-0.5 hover:shadow-md">
          Explore {category.title}
        </span>
      </div>
    </Link>
  );
}

function DiningCategoriesSection() {
  return (
    <section id="dining-categories" className="py-8 bg-white mb-5 rounded-xl">
      <div className="text-center mb-6">
        <h2 className="text-[26px] font-bold text-[#4177c4] mb-2">
          Dining Categories
        </h2>
        <p className="text-gray-600 max-w-[800px] mx-auto">
          Explore Singapore&apos;s diverse dining scene with something for every
          occasion, taste, and budget
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-5">
        {DINING_CATEGORIES.map((category) => (
          <DiningCategoryCard key={category.slug} category={category} />
        ))}
      </div>
    </section>
  );
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.3;
    return (
      <span className="text-amber-400 tracking-wider">
        {"★".repeat(fullStars)}
        {hasHalf && "★"}
        {"☆".repeat(5 - fullStars - (hasHalf ? 1 : 0))}
      </span>
    );
  };

  return (
    <div className="group rounded-2xl overflow-hidden shadow-lg bg-white transition-all duration-500 hover:-translate-y-4 hover:scale-[1.03] hover:shadow-2xl relative z-10 hover:z-20">
      {/* Top gradient bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4177c4] to-[#6799e8] z-10" />

      {/* Pulse effect dot */}
      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#4177c4] z-20 animate-pulse" />

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-30 pointer-events-none" />

      {/* Image */}
      <div className="h-[220px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 z-10" />
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
        />
        {/* Category tag */}
        <div className="absolute top-4 -right-1 bg-gradient-to-r from-[#4177c4] to-[#6799e8] text-white py-2 px-5 text-xs font-bold z-20 uppercase tracking-wider shadow-lg">
          {restaurant.category}
        </div>
      </div>

      {/* Info */}
      <div className="p-6 border-t border-[#4177c4]/10">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#4177c4] transition-colors relative">
            {restaurant.name}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#4177c4] transition-all duration-300 group-hover:w-full" />
          </h3>
          <div className="text-right p-2 rounded-lg bg-[#4177c4]/5 group-hover:bg-[#4177c4]/10 transition-colors">
            <div className="text-base">{renderStars(restaurant.rating)}</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">
              {restaurant.rating} ({restaurant.reviewCount} reviews)
            </div>
          </div>
        </div>

        <div className="inline-block text-sm text-gray-600 mb-4 bg-gradient-to-r from-gray-50 to-white py-1.5 px-4 rounded-md border-l-[3px] border-[#4177c4] shadow-sm group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-gray-50 group-hover:translate-x-1 transition-all">
          <MapPin className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
          {restaurant.location}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {restaurant.tags.map((tag, idx) => (
            <span
              key={tag}
              className="bg-gray-100 py-1 px-3 rounded-full text-xs text-gray-600 border border-gray-200 transition-all group-hover:bg-blue-50 group-hover:text-[#4177c4] group-hover:border-blue-200 group-hover:-translate-y-0.5"
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="text-sm text-gray-600 mb-5 leading-relaxed pl-4 border-l-[3px] border-blue-200 italic group-hover:border-[#4177c4] group-hover:pl-5 transition-all">
          {restaurant.description}
        </p>

        <div className="flex gap-4 opacity-90 group-hover:opacity-100 transition-opacity">
          <a
            href={restaurant.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-3 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all relative overflow-hidden"
          >
            GET DIRECTIONS
          </a>
          <Link
            href={restaurant.menuUrl}
            className="flex-1 text-center py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-[#4177c4] to-[#6799e8] text-white hover:from-[#3366b3] hover:to-[#4177c4] hover:-translate-y-1 hover:shadow-lg transition-all relative overflow-hidden"
          >
            VIEW MENU
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeaturedRestaurantsSection() {
  return (
    <section className="py-10 bg-gradient-to-br from-[#f0f7ff] via-white to-[#f0f7ff] mb-8 rounded-2xl relative overflow-hidden">
      {/* Animated top bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4177c4] via-[#6799e8] to-[#4177c4] bg-[length:200%_100%] animate-[gradientMove_8s_ease_infinite]" />

      <div className="text-center mb-10">
        <h2 className="text-[32px] font-bold text-[#4177c4] mb-3 relative inline-block">
          Featured Restaurants
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-[#4177c4]" />
        </h2>
        <p className="text-gray-600 mt-4">
          Our handpicked selection of top-rated establishments from various
          dining categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-5">
        {FEATURED_RESTAURANTS.map((restaurant) => (
          <RestaurantCard key={restaurant.name} restaurant={restaurant} />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Link
          href="/restaurants"
          className="inline-block bg-[#4177c4] text-white border-2 border-[#4177c4] py-3 px-8 rounded-full font-semibold text-base hover:-translate-y-1 hover:shadow-xl transition-all relative overflow-hidden group"
        >
          <span className="relative z-10">View All Restaurants</span>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600" />
        </Link>
      </div>
    </section>
  );
}

function DealCard({
  deal,
  onViewDeal,
}: {
  deal: Deal;
  onViewDeal: (deal: Deal) => void;
}) {
  return (
    <div className="bg-white p-6 rounded-lg relative shadow-md">
      <div className="absolute -top-3 left-5 bg-[#4177c4] text-white py-1 px-4 rounded-full text-sm font-semibold">
        {deal.tag}
      </div>
      <h3 className="mt-4 mb-2 text-base font-semibold">{deal.title}</h3>
      <p className="text-sm text-gray-500 mb-2">{deal.duration}</p>
      <p className="text-sm text-gray-600 mb-5 leading-relaxed">
        {deal.description}
      </p>
      <button
        onClick={() => onViewDeal(deal)}
        className="inline-block bg-[#4177c4] text-white py-2 px-4 rounded text-sm font-semibold hover:bg-[#3366b3] transition-colors cursor-pointer"
      >
        VIEW DEAL
      </button>
    </div>
  );
}

function DealsSection({ onViewDeal }: { onViewDeal: (deal: Deal) => void }) {
  return (
    <section className="py-8 px-5 bg-gray-50 mb-5 rounded-xl">
      <div className="text-center mb-6">
        <h2 className="text-[26px] font-bold text-[#4177c4] mb-2">
          Featured Dining Deals
        </h2>
        <p className="text-gray-600">
          Special offers across various dining categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {DEALS.map((deal) => (
          <DealCard key={deal.id} deal={deal} onViewDeal={onViewDeal} />
        ))}
      </div>
    </section>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "dining_newsletter",
          tags: ["newsletter", "dining"],
        }),
      });

      if (!response.ok) throw new Error("Failed to subscribe");

      setIsSuccess(true);
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section className="py-10 px-8 bg-[#f0f7ff] mb-8 rounded-xl text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-[26px] font-bold text-gray-800 mb-2">
          You&apos;re Subscribed!
        </h2>
        <p className="text-gray-600 text-base">
          Check your inbox for the latest dining updates and exclusive deals.
        </p>
      </section>
    );
  }

  return (
    <section className="py-10 px-8 bg-[#f0f7ff] mb-8 rounded-xl text-center">
      <h2 className="text-[26px] font-bold text-gray-800 mb-4">
        <span className="bg-yellow-300 px-1">Stay Updated</span> on
        Singapore&apos;s Food Scene
      </h2>
      <p className="text-gray-600 text-base leading-relaxed mb-6 max-w-[700px] mx-auto">
        Subscribe to our newsletter for the latest restaurant openings,
        exclusive deals, and culinary events across all dining categories
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row max-w-[550px] mx-auto gap-2 sm:gap-0"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="flex-1 py-3.5 px-5 border border-gray-200 rounded sm:rounded-r-none text-base outline-none focus:border-[#4177c4]"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-bfw-orange text-white border-none py-3 px-8 sm:rounded-l-none rounded font-semibold text-base cursor-pointer hover:bg-[#d84c1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <p className="mt-4 text-xs text-gray-500">
        Join thousands of food lovers! Unsubscribe anytime.
      </p>
    </section>
  );
}

function DealModal({
  deal,
  onClose,
}: {
  deal: Deal | null;
  onClose: () => void;
}) {
  if (!deal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white p-8 rounded-lg w-[90%] max-w-[500px] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl cursor-pointer text-gray-500 hover:text-gray-800"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-5">
          <h2 className="text-[#4177c4] text-xl font-bold mb-1">
            Deal Details
          </h2>
          <p className="text-gray-600 text-sm">Limited time offer</p>
        </div>

        <div className="mb-5">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            How to Redeem:
          </h3>
          <p className="mb-3 leading-relaxed text-gray-600">
            1. Show this deal to the staff when ordering
          </p>
          <p className="mb-4 leading-relaxed text-gray-600">
            2. Mention the promo code: <strong>SGDINING2025</strong>
          </p>

          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Terms & Conditions:
          </h3>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Cannot be combined with other promotions or discounts</li>
            <li>Valid for dine-in only</li>
            <li>
              The management reserves the right to amend the terms & conditions
              without prior notice
            </li>
          </ul>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="bg-[#4177c4] text-white border-none py-2.5 px-5 rounded font-semibold cursor-pointer hover:bg-[#3366b3] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function DiningPage() {
  const [activeRegion, setActiveRegion] = useState("all");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />

      <div className="max-w-[1200px] mx-auto px-5">
        <StatsSection />
        <FilterSection
          activeRegion={activeRegion}
          onRegionChange={setActiveRegion}
        />
        <DiningCategoriesSection />
        <FeaturedRestaurantsSection />
        <DealsSection onViewDeal={setSelectedDeal} />
        <NewsletterSection />
      </div>

      <DealModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
    </main>
  );
}
