"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, MapPin, Phone, Clock, ChevronDown } from "lucide-react";

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
// DATA
// ============================================================================

const CASUAL_DINING_RESTAURANTS: Restaurant[] = [
  {
    name: "Aki Sushi & Grill",
    rating: 3.8,
    reviews: 132,
    location: "Plaza Singapura",
    tags: ["Japanese", "Sushi", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPmM6eIjtWfPdHpOOP-5QqGYNiZqxCIUhg94x3A=w408-h541-k-no",
    description:
      "Japanese restaurant offering a variety of sushi, grilled items, and other authentic dishes in a casual setting.",
    area: "central",
    tag: "JAPANESE",
    address: "68 Orchard Road, #B2-40 Plaza, Singapore 238839",
    phone: "94553953",
    hours:
      "Monday-Thursday: 11:30 am–9 pm, Friday, Sunday: 11:30 am–10 pm, Saturday: 12 am–10 pm",
  },
  {
    name: "Fish & Co. @ Causeway Point",
    rating: 4.5,
    reviews: 329,
    location: "Causeway Point",
    tags: ["Western", "Seafood", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipN0Yrlmzm6pDloQ57RHJLrfTrU-EnGLfmQkKU1n=w426-h240-k-no",
    description:
      "Popular seafood restaurant known for serving dishes in hot pans, offering a casual dining experience with Mediterranean-inspired cuisine.",
    area: "north",
    tag: "SEAFOOD",
    address: "1 Woodlands Square, #02-34/K01, Singapore 738099",
    phone: "62352156",
    hours: "Monday-Sunday: 11 am–9:30 pm",
  },
  {
    name: "Hot Tomato",
    rating: 4.0,
    reviews: 733,
    location: "Causeway Point",
    tags: ["Western", "Steak", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPHHWLzc5TMB48ZVQqxH77ZZ6CxzVNbFMG6HJi2=w408-h306-k-no",
    description:
      "Western restaurant offering affordable steaks, pasta and other Western favorites in a relaxed setting.",
    area: "north",
    tag: "WESTERN",
    address: "1 Woodlands Square, #02-11, Singapore 738099",
    phone: "68942685",
    hours: "Monday-Sunday: 11 am–10 pm",
  },
  {
    name: "Beauty in The Pot at NEX",
    rating: 4.5,
    reviews: 1221,
    location: "Nex",
    tags: ["Chinese", "Hotpot", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipN88EAmYoCanqcpXuQ4pscdGARqOtg29Av2PLsw=w590-h240-k-no",
    description:
      "Premium hotpot restaurant known for their collagen-rich broths and quality ingredients in a comfortable setting.",
    area: "north-east",
    tag: "HOTPOT",
    address: "23 Serangoon Central, #02-01, Singapore 556083",
    phone: "68058172",
    hours: "Monday to Sunday: 11:30 am–3 am",
  },
  {
    name: "Gong Yuan Ma La Tang",
    rating: 3.8,
    reviews: 329,
    location: "Nex",
    tags: ["Chinese", "Spicy", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNM0zfmQkJygEzQzYgZIO5-LGUp1bYRo7agM_cA=w408-h306-k-no",
    description:
      "Customizable Chinese spicy soup restaurant where diners select their own ingredients for a personalized hotpot experience.",
    area: "north-east",
    tag: "MALA",
    address: "23 Serangoon Central, #03-17 NEX, Singapore 556083",
    phone: "66002031",
    hours: "Monday to Sunday: 11 am–9:30 pm",
  },
  {
    name: "KANTIN",
    rating: 4.8,
    reviews: 1536,
    location: "Jewel",
    tags: ["Asian", "Food Court", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMYi93CYwfIfmz9-1NwS1yC3wYBv2IH-VQ0TnEe=w408-h272-k-no",
    description:
      "Modern food court offering a variety of Asian cuisines in a stylish setting at Jewel Changi Airport.",
    area: "east",
    tag: "ASIAN",
    address:
      "78 AIRPORT BOULEVARD, #05-206/207 JEWEL, Singapore Changi Airport, 819666",
    phone: "96843690",
    hours: "Monday-Sunday: 11 am–10 pm",
  },
  {
    name: "Ajisen Tanjiro",
    rating: 3.8,
    reviews: 256,
    location: "IMM",
    tags: ["Japanese", "Ramen", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOxqqipthP47dEMJ2Oh-z3BvEopGeHUscoBViiF=w408-h306-k-no",
    description:
      "Japanese restaurant specializing in ramen with their signature white pork-bone soup, plus a variety of Japanese dishes.",
    area: "west",
    tag: "RAMEN",
    address: "2 Jurong East Street 21, Singapore 609601",
    phone: "65645610",
    hours: "Monday-Sunday: 11:30 am–10 pm",
  },
  {
    name: "ANDES by Astons",
    rating: 4.4,
    reviews: 837,
    location: "IMM",
    tags: ["Western", "Steak", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNe5pr7Hmsgx_1pU9K6890fpVSZPE_FsndaJZ3k=w408-h282-k-no",
    description:
      "Western restaurant offering quality steaks and Western cuisine at affordable prices in a laid-back atmosphere.",
    area: "west",
    tag: "WESTERN",
    address: "2 Jurong East Street 21, #01-96 Imm, Singapore 609601",
    phone: "62603285",
    hours: "Monday-Sunday: 11:30 am–10 pm",
  },
  {
    name: "Aburi-EN (Jem)",
    rating: 4.6,
    reviews: 1162,
    location: "JEM",
    tags: ["Japanese", "Grill", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPvsjtEAqQu7N6_J7hrtKf9XQ1FiTLng9sF6BWT=w408-h314-k-no",
    description:
      "Japanese restaurant specializing in aburi (flame-seared) dishes, with premium meats and seafood options.",
    area: "west",
    tag: "JAPANESE",
    address: "50 Jurong Gateway Rd, #01-04 Jem, Singapore 608549",
    phone: "62602238",
    hours: "Monday-Sunday: 11 am–10 pm",
  },
  {
    name: "My Spice Affair",
    rating: 4.0,
    reviews: 208,
    location: "Aperia Mall",
    tags: ["Indian", "Spicy", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNH4xEKpg1zOF4hYd8EhSfOSu8M6cy2RW2pdgwA=w409-h240-k-no",
    description:
      "Authentic Indian restaurant offering a variety of flavorful dishes from different regions of India.",
    area: "central",
    tag: "INDIAN",
    address: "12 Kallang Avenue, #02-11, Aperia Mall, Singapore 339511",
    phone: "84242182",
    hours: "Monday-Friday & Sunday: 10 am–9 pm, Saturday: Closed",
  },
  {
    name: "Bali Thai",
    rating: 4.1,
    reviews: 1118,
    location: "IMM",
    tags: ["Thai", "Indonesian", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMzXN9z-5WHm6n68CCD1TULfwoxoVF1a82lG1x7=w128-h86-k-no",
    description:
      "Restaurant serving a fusion of Thai and Indonesian cuisines, offering the best flavors from both countries.",
    area: "west",
    tag: "THAI-INDO",
    address: "2 Jurong East Street 21, #01 - 21, Singapore 609601",
    phone: "65605660",
    hours: "Monday-Sunday: 11:30 am–10 pm",
  },
  {
    name: "Riverside Canton Claypot Cuisine",
    rating: 4.5,
    reviews: 1783,
    location: "Nex",
    tags: ["Chinese", "Claypot", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMI30_kkRbGGT9gnOPGEJAJGuHidJ-qhGtEHPFK=w480-h240-k-no",
    description:
      "Cantonese restaurant specializing in claypot dishes and grilled fish in various flavors and styles.",
    area: "north-east",
    tag: "CHINESE",
    address: "23 Serangoon Central, B1-34 / 35 NEX, Singapore 556083",
    phone: "64708208",
    hours: "Monday to Sunday: 11 am–10 pm",
  },
  {
    name: "Soup Restaurant",
    rating: 4.1,
    reviews: 365,
    location: "United Square",
    tags: ["Chinese", "Soup", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipO1Hk7KCaNTl1zkrczLGocvcutSrwED2CFklJAK=w408-h306-k-no",
    description:
      "Chinese restaurant specializing in traditional Chinatown heritage soups and home-style dishes.",
    area: "north",
    tag: "CHINESE",
    address:
      "101 Thomson Rd, #B1 - 10 United Square Shopping Mall, Singapore 307591",
    phone: "62540400",
    hours:
      "Monday-Friday: 11:30 am–2:30 pm, 5:30–10 pm, Saturday-Sunday: 11:30 am–10 pm",
  },
  {
    name: "Aburi-EN",
    rating: 4.7,
    reviews: 778,
    location: "Junction 8",
    tags: ["Japanese", "Grill", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOF25lfh-b0X-FtuU9qQGNamwejZQJ_nhB9ltYd=w408-h306-k-no",
    description:
      "Japanese restaurant specializing in aburi (flame-seared) dishes, particularly meats and seafood.",
    area: "north-east",
    tag: "JAPANESE",
    address: "9 Bishan Pl, #01-37/37A Junction 8, Singapore 579837",
    phone: "63348836",
    hours: "Monday-Sunday: 11 am–10 pm",
  },
  {
    name: "Genki Sushi",
    rating: 4.5,
    reviews: 1008,
    location: "City Square Mall",
    tags: ["Japanese", "Sushi", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNbb8h8hSBvgSj7cq8h14fFSkatE63sFl71E9w=w426-h240-k-no",
    description:
      "Modern Japanese restaurant with a conveyor belt sushi concept, offering fresh sushi and other Japanese dishes.",
    area: "north-east",
    tag: "JAPANESE",
    address: "180 Kitchener Rd, #02-37/38 City Square Mall, Singapore 208539",
    phone: "69748040",
    hours: "Monday-Sunday: 11 am–10 pm",
  },
  {
    name: "Ajisen Ramen",
    rating: 4.0,
    reviews: 321,
    location: "AMK Hub",
    tags: ["Japanese", "Ramen", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipP-6fC7c3JLUlDn_AfR0_iGGLjIVwcFB3UYZ8al=w408-h306-k-no",
    description:
      "Popular Japanese ramen chain known for their signature white pork bone soup base and variety of ramen options.",
    area: "north",
    tag: "RAMEN",
    address: "53 Ang Mo Kio Ave 3, AMK Hub, #02 - 19/20/21, Singapore 569933",
    phone: "64818861",
    hours: "Monday to Sunday: 11 am–10 pm",
  },
  {
    name: "Mei Heong Yuen Dessert",
    rating: 3.6,
    reviews: 172,
    location: "Velocity@Novena",
    tags: ["Chinese", "Dessert", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMbSd3dPZCIsUwDmbkUqoZHCbc9VhA1PpNmyDox=w408-h306-k-no",
    description:
      "Traditional Chinese dessert shop offering a wide variety of hot and cold desserts, including their famous snow ice.",
    area: "central",
    tag: "DESSERT",
    address:
      "238 Thomson Road Velocity@Novena Square, #02-03 Novena Velocity, 307683",
    phone: "+65 6252 7335",
    hours: "Monday to Sunday 11:15 am–10 pm",
  },
  {
    name: "Mun Zuk Novena",
    rating: 4.2,
    reviews: 428,
    location: "Velocity@Novena",
    tags: ["Chinese", "Congee", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMONSfLcxCXgymBf5uJwo9oyadeATRFHvmjgeF4=w470-h240-k-no",
    description:
      "Specializing in Cantonese congee (rice porridge) with various toppings and sides. Perfect for a comforting meal.",
    area: "central",
    tag: "CHINESE",
    address:
      "238 Thomson Rd, #01-86/87 Velocity, Novena Square, Singapore 307683",
    phone: "+65 6261 3490",
    hours: "Monday to Sunday 9 am–8 pm",
  },
  {
    name: "Brewerkz Woodleigh Mall",
    rating: 4.4,
    reviews: 302,
    location: "The Woodleigh Mall",
    tags: ["Western", "Craft Beer", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPHLnHBMjUJCh5rwt-5tvW0sCONswIvJ-tdaOAs=w408-h272-k-no",
    description:
      "Singapore's pioneer craft brewery offering a range of craft beers alongside Western fare in a relaxed setting.",
    area: "north-east",
    tag: "CRAFT BEER",
    address: "11 Bidadari Park Dr, #02-20/20A, Singapore 367803",
    phone: "+65 9820 0271",
    hours: "Monday to Sunday 12–10 pm",
  },
  {
    name: "Genki Sushi Junction 8",
    rating: 4.5,
    reviews: 2105,
    location: "Junction 8",
    tags: ["Japanese", "Sushi", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPDtocuRyQrQrxE_SLOkme-C5Ei4BwoYYYizihF=w426-h240-k-no",
    description:
      "Modern Japanese restaurant with a conveyor belt sushi concept, offering fresh sushi and other Japanese dishes.",
    area: "north-east",
    tag: "SUSHI",
    address: "9 Bishan Pl, #01-22/30 Junction 8, Singapore 579837",
    phone: "68162151",
    hours: "Monday-Sunday: 11 am–10 pm",
  },
  {
    name: "PastaMania",
    rating: 4.3,
    reviews: 706,
    location: "City Square Mall",
    tags: ["Italian", "Pasta", "Casual Dining"],
    image:
      "https://lh3.googleusercontent.com/p/AF1QipOTJZq4xWgN5hLSt1x_rrAEeoL16i0p_8OW1axc=w408-h240-k-no-pi-10-ya6.0171056-ro-0-fo100",
    description:
      "Italian casual dining restaurant chain offering a variety of pasta dishes, pizzas, and other Italian favorites.",
    area: "north-east",
    tag: "ITALIAN",
    address:
      "180 Kitchener Rd, #02 - 21 / 22 City Square Mall, Singapore 208539",
    phone: "66348935",
    hours: "Monday-Sunday: 11 am–9 pm",
  },
  {
    name: "A-Roy Thai Restaurant",
    rating: 4.1,
    reviews: 721,
    location: "Velocity@Novena",
    tags: ["Thai", "Asian", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOFjWBK5eXRJ14tNtCwgtDTL7jMlop0nfcwvfSg=w408-h544-k-no",
    description:
      "Authentic Thai restaurant serving a range of traditional dishes from various regions of Thailand.",
    area: "central",
    tag: "THAI",
    address: "Thomson Rd, 238 Novena Square #03-61/64, Singapore 307683",
    phone: "+65 6338 3880",
    hours: "Monday to Sunday 11 am–3 pm, 5–9:30 pm",
  },
  {
    name: "Hoshino Coffee",
    rating: 3.1,
    reviews: 339,
    location: "United Square",
    tags: ["Japanese", "Cafe", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNsDEiKPhbeTy9JBKQX4eP2GGDMDNacunSI-Os2=w408-h244-k-no",
    description:
      "Japanese-style cafe known for hand-dripped coffee and fluffy souffle pancakes in a cozy setting.",
    area: "north",
    tag: "JAPANESE CAFE",
    address: "101 Thomson Rd, #02-06/07, Singapore 307591",
    phone: "62645878",
    hours: "Monday-Friday: 11 am–9 pm, Saturday-Sunday: 9 am–9 pm",
  },
  {
    name: "Little Italy - Woodleigh",
    rating: 4.2,
    reviews: 212,
    location: "The Woodleigh Mall",
    tags: ["Italian", "Pizza", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipP4j8wmfKeXDMMGCFHUkSRMh1g8e2oO6RIONabW=w408-h306-k-no",
    description:
      "Cozy Italian restaurant serving authentic Italian cuisine including pizzas, pastas, and other Italian favorites.",
    area: "north-east",
    tag: "ITALIAN",
    address: "11 Bidadari Park Dr, Mall, #02-48 The Woodleigh, 367803",
    phone: "+65 9710 9052",
    hours: "Monday to Sunday 11:30 am–10 pm",
  },
  {
    name: "Wee Nam Kee Hainanese Chicken Rice",
    rating: 4.1,
    reviews: 1773,
    location: "United Square",
    tags: ["Chinese", "Chicken Rice", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipO-aR0wMo2TWfpXtBmZs5PtWLBrQ1mgu7T8dHRd=w946-h240-k-no",
    description:
      "Famous Singaporean restaurant known for authentic Hainanese chicken rice and other Chinese dishes.",
    area: "north",
    tag: "CHICKEN RICE",
    address: "101 Thomson Rd, #01-08 United Square, Singapore 307591",
    phone: "62556396",
    hours: "Monday-Sunday: 11 am–9 pm",
  },
  {
    name: "Ichiban Boshi",
    rating: 4.5,
    reviews: 619,
    location: "United Square",
    tags: ["Japanese", "Sushi", "Casual Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipN0oSYUZ3WjcAHiNn1tZhxzeB75PIZxtW04LUhW=w408-h306-k-no",
    description:
      "Japanese restaurant offering a wide variety of sushi, sashimi, and other Japanese dishes in a family-friendly setting.",
    area: "north",
    tag: "JAPANESE",
    address: "101 Thomson Rd, #02-02 United Square, Singapore 307591",
    phone: "62587786",
    hours: "Monday-Friday, Sunday: 11 am–9:30 pm, Saturday: 11 am–10 pm",
  },
];

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
            href={`/menu/${menuSlug}/?location=${locationSlug}`}
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
// MAIN PAGE
// ============================================================================

export default function CasualDiningPage() {
  const [activeRegion, setActiveRegion] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const filteredRestaurants = useMemo(() => {
    if (activeRegion === "all") return CASUAL_DINING_RESTAURANTS;
    return CASUAL_DINING_RESTAURANTS.filter((r) => r.area === activeRegion);
  }, [activeRegion]);

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

  return (
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
  );
}
