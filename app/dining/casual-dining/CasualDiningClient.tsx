"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, MapPin, Phone, Clock, ChevronDown } from "lucide-react";
import {
  generateBreadcrumbSchema,
  generateItemListSchema,
  JsonLd,
} from "@/lib/seo/structured-data";

// ============================================================================
// TYPES
// ============================================================================

interface Restaurant {
  name: string;
  rating: number;
  reviews: number;
  location: string;
  tags: string[];
  image: string;
  description: string;
  area: string;
  tag: string;
  address: string;
  phone: string;
  hours: string;
}

interface Deal {
  id: string;
  tag: string;
  title: string;
  duration: string;
  description: string;
  code: string;
}

interface DiningCategory {
  name: string;
  image: string;
  url: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEALS: Deal[] = [
  {
    id: "deal1",
    tag: "1-FOR-1",
    title: "1-for-1 Main Course at Poulet",
    duration: "Valid till: 30 May 2025",
    description:
      "Buy one main course and get the second one free. Valid for dine-in only on weekdays from 2pm to 5pm.",
    code: "POULET11",
  },
  {
    id: "deal2",
    tag: "25% OFF",
    title: "25% Off Total Bill at Genki Sushi",
    duration: "Valid till: 15 Jul 2025",
    description:
      "Enjoy 25% off your total bill when you dine in groups of 4 or more. Valid for dine-in only from Monday to Thursday.",
    code: "GENKI25",
  },
  {
    id: "deal3",
    tag: "SET MENU",
    title: "$35 Set Menu for Two at Marche",
    duration: "Valid till: 31 Aug 2025",
    description:
      "Special set menu for two persons including 2 mains, 2 drinks, and 1 dessert to share for only $35. Available daily.",
    code: "MARCHE35",
  },
];

const OTHER_CATEGORIES: DiningCategory[] = [
  {
    name: "Fine Dining",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/fine-dining",
  },
  {
    name: "Quick Bites",
    image:
      "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/quick-bites",
  },
  {
    name: "Family Friendly",
    image:
      "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/family-friendly",
  },
  {
    name: "Late Night",
    image:
      "https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/late-night",
  },
  {
    name: "Romantic",
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/romantic",
  },
];

const REGIONS = [
  { id: "all", label: "All Regions", tooltip: "All areas in Singapore" },
  {
    id: "central",
    label: "Central",
    tooltip: "Districts 01-08, 09-13 (Raffles Place, Orchard, River Valley)",
  },
  {
    id: "east",
    label: "East",
    tooltip: "Districts 14-18 (Geylang, Katong, Bedok, Tampines)",
  },
  {
    id: "west",
    label: "West",
    tooltip: "Districts 22-24 (Jurong, Boon Lay, Choa Chu Kang)",
  },
  {
    id: "north",
    label: "North",
    tooltip: "Districts 25-28 (Kranji, Woodgrove, Yishun, Sembawang)",
  },
  {
    id: "north-east",
    label: "North-East",
    tooltip: "Districts 19-20, 28 (Serangoon, Hougang, Punggol)",
  },
  {
    id: "south",
    label: "South",
    tooltip: "Districts 01-02 (Raffles Place, Tanjong Pagar, Marina Bay)",
  },
];

const FEATURES = [
  "Relaxed Atmosphere",
  "Quality Food",
  "Diverse Cuisines",
  "Great Service",
  "Good Value",
];

const RESTAURANTS_PER_PAGE = 9;

// ============================================================================
// COMPONENTS
// ============================================================================

function HeroSection() {
  return (
    <div className="w-full bg-[#f0f7ff] border-b border-[#4177c4]/10 mb-4">
      <div className="flex flex-col md:flex-row max-w-[1200px] mx-auto py-10 px-5 items-center gap-8">
        <div className="flex-1 md:pr-8">
          <h1 className="font-heading text-[32px] md:text-[38px] font-bold leading-tight mb-4">
            Casual <span className="text-[#4177c4]">Dining</span> in Singapore
          </h1>
          <p className="text-lg text-gray-600 mb-5 leading-relaxed">
            Discover the best restaurants for a relaxed and enjoyable dining
            experience
          </p>
          <a
            href="#restaurant-section"
            className="inline-block bg-[#4177c4] text-white py-3 px-6 rounded-md font-semibold text-base hover:bg-[#3366b3] transition-colors mb-6"
          >
            Explore Restaurants
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
        <div className="flex-1 grid grid-cols-3 gap-3 h-[220px] md:h-[280px]">
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
              alt="Casual dining restaurant"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1559304822-9eb2813c9844?ixlib=rb-4.0.3&auto=format&fit=crop&w=1528&q=80"
              alt="People enjoying casual dining"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1554679665-f5537f187268?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80"
              alt="Restaurant food served"
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
    { number: "80+", label: "Casual Dining Restaurants" },
    { number: "3,500+", label: "Menu Items" },
    { number: "15", label: "Cuisine Types" },
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
          className={`px-4 py-2 rounded-full text-sm cursor-pointer transition-all border ${activeRegion === region.id ? "bg-[#4177c4] text-white border-[#4177c4]" : "bg-white border-gray-200 hover:border-[#4177c4]"}`}
        >
          {region.label}
        </button>
      ))}
    </div>
  );
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={
            i <= Math.floor(rating) || (i - rating < 1 && i - rating > 0)
              ? "text-amber-400"
              : "text-gray-300"
          }
        >
          ★
        </span>,
      );
    }
    return stars;
  };
  const menuSlug = restaurant.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  const locationSlug = restaurant.location.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="group rounded-xl overflow-hidden shadow-lg bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4177c4] to-[#6799e8] z-10" />
      <div className="h-[200px] relative overflow-hidden">
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {restaurant.tag && (
          <div className="absolute top-4 -right-1 bg-gradient-to-r from-[#4177c4] to-[#6799e8] text-white py-1.5 px-4 text-xs font-bold z-20 uppercase tracking-wider shadow-lg">
            {restaurant.tag}
          </div>
        )}
      </div>
      <div className="p-5 bg-white">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#4177c4] transition-colors pr-2">
            {restaurant.name}
          </h3>
          <div className="text-right shrink-0">
            <div className="text-base tracking-wider">
              {renderStars(restaurant.rating)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {restaurant.rating} ({restaurant.reviews} reviews)
            </div>
          </div>
        </div>
        <div className="inline-block text-sm text-gray-600 mb-3 bg-gray-50 py-1 px-3 rounded border-l-[3px] border-[#4177c4]">
          {restaurant.location}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {restaurant.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 py-1 px-3 rounded-full text-xs text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-[#4177c4] hover:border-blue-200 transition-all"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed pl-3 border-l-[3px] border-blue-200 italic">
          {restaurant.description}
        </p>
        <div className="mb-4">
          <button
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className={`w-full flex justify-between items-center bg-gradient-to-r from-blue-50 to-white border border-blue-200 border-l-4 border-l-[#4177c4] rounded py-2.5 px-4 text-sm font-semibold text-gray-700 hover:from-blue-100 transition-all ${isDetailsOpen ? "rounded-b-none" : ""}`}
          >
            <span>Contact & Hours</span>
            <ChevronDown
              className={`w-4 h-4 text-[#4177c4] transition-transform ${isDetailsOpen ? "rotate-180" : ""}`}
            />
          </button>
          {isDetailsOpen && (
            <div className="border border-t-0 border-blue-200 border-l-4 border-l-[#4177c4] rounded-b p-4 bg-white text-sm space-y-3 animate-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#4177c4]/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[#4177c4]" />
                </div>
                <div>
                  <strong>Address:</strong> {restaurant.address}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#4177c4]/10 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[#4177c4]" />
                </div>
                <div>
                  <strong>Phone:</strong>{" "}
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="text-[#4177c4] hover:underline"
                  >
                    {restaurant.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#4177c4]/10 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-[#4177c4]" />
                </div>
                <div>
                  <strong>Hours:</strong> {restaurant.hours}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ", " + restaurant.location + ", Singapore")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            GET DIRECTIONS
          </a>
          <Link
            href={`/menu/${menuSlug}/${locationSlug}`}
            className="flex-1 text-center py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-[#4177c4] to-[#6799e8] text-white hover:from-[#3366b3] hover:to-[#4177c4] hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            VIEW MENU
          </Link>
        </div>
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center gap-1 mt-5">
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
        >
          « Prev
        </button>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded text-sm transition-colors ${page === currentPage ? "bg-[#4177c4] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          {page}
        </button>
      ))}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
        >
          Next »
        </button>
      )}
    </div>
  );
}

function RestaurantSection({
  restaurants,
  currentPage,
  onPageChange,
}: {
  restaurants: Restaurant[];
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(restaurants.length / RESTAURANTS_PER_PAGE);
  const startIndex = (currentPage - 1) * RESTAURANTS_PER_PAGE;
  const displayedRestaurants = restaurants.slice(
    startIndex,
    startIndex + RESTAURANTS_PER_PAGE,
  );
  return (
    <section id="restaurant-section" className="py-8 bg-white mb-5 rounded-xl">
      <div className="text-center mb-6">
        <h2 className="text-[26px] font-bold text-[#4177c4] mb-2">
          Casual Dining in Singapore
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-5">
        {displayedRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.name + restaurant.location}
            restaurant={restaurant}
          />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
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
          Latest Casual Dining Deals
        </h2>
        <p className="text-gray-600">
          Save while enjoying a relaxed meal with friends and family
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

function OtherCategoriesSection() {
  return (
    <section className="py-8 px-5 bg-white mb-5 rounded-xl">
      <div className="text-center mb-6">
        <h2 className="text-[26px] font-bold text-[#4177c4] mb-2">
          Other Dining Categories
        </h2>
        <p className="text-gray-600">
          Explore more dining options in Singapore
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
        {OTHER_CATEGORIES.map((category) => (
          <Link
            key={category.name}
            href={category.url}
            className="group rounded-lg overflow-hidden shadow-md bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="h-[120px] relative overflow-hidden">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-3 text-center">
              <h3 className="text-base font-semibold text-gray-800 group-hover:text-[#4177c4] transition-colors">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
      <div className="text-center">
        <Link
          href="/dining"
          className="inline-block bg-transparent text-[#4177c4] border-2 border-[#4177c4] py-2.5 px-6 rounded-full font-semibold text-base hover:bg-[#4177c4] hover:text-white hover:-translate-y-0.5 hover:shadow-md transition-all"
        >
          View All Categories
        </Link>
      </div>
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
            {deal.title}
          </h2>
          <p className="text-gray-600 text-sm">{deal.duration}</p>
        </div>
        <div className="mb-5">
          <p className="mb-4 text-gray-600">{deal.description}</p>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            How to Redeem:
          </h3>
          <p className="mb-3 leading-relaxed text-gray-600">
            1. Show this deal to the staff when ordering
          </p>
          <p className="mb-4 leading-relaxed text-gray-600">
            2. Mention the promo code: <strong>{deal.code}</strong>
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
// MAIN CLIENT COMPONENT
// ============================================================================

interface CasualDiningClientProps {
  restaurants: Restaurant[];
}

export default function CasualDiningClient({
  restaurants: CASUAL_DINING_RESTAURANTS,
}: CasualDiningClientProps) {
  const [activeRegion, setActiveRegion] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const filteredRestaurants = useMemo(() => {
    if (activeRegion === "all") return CASUAL_DINING_RESTAURANTS;
    return CASUAL_DINING_RESTAURANTS.filter((r) => r.area === activeRegion);
  }, [activeRegion, CASUAL_DINING_RESTAURANTS]);

  const handleRegionChange = (region: string) => {
    setActiveRegion(region);
    setCurrentPage(1);
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document
      .getElementById("restaurant-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bestfoodwhere.sg" },
    { name: "Dining Styles", url: "https://bestfoodwhere.sg/dining" },
    {
      name: "Casual Dining",
      url: "https://bestfoodwhere.sg/dining/casual-dining",
    },
  ]);

  const restaurantListSchema = generateItemListSchema(
    CASUAL_DINING_RESTAURANTS.map((r, i) => ({
      name: r.name,
      url: `https://bestfoodwhere.sg/dining/casual-dining`,
      image: r.image || undefined,
      position: i + 1,
    })),
    "Casual Dining Restaurants in Singapore",
  );

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={restaurantListSchema} />
      <main className="min-h-screen bg-gray-50">
        <HeroSection />
        <div className="max-w-[1200px] mx-auto px-5">
          <StatsSection />
          <FilterSection
            activeRegion={activeRegion}
            onRegionChange={handleRegionChange}
          />
          <RestaurantSection
            restaurants={filteredRestaurants}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
          <DealsSection onViewDeal={setSelectedDeal} />
          <OtherCategoriesSection />
        </div>
        <DealModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
      </main>
    </>
  );
}
