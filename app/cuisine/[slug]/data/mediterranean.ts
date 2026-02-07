import type { CuisineData } from "./types";

export const MEDITERRANEAN_CUISINE: CuisineData = {
  slug: "mediterranean",
  name: "Mediterranean",
  tagline:
    "From kebabs to pita wraps, find the best Mediterranean food near you",
  features: [
    { label: "Kebabs" },
    { label: "Pita Wraps" },
    { label: "Hummus" },
    { label: "Falafel" },
    { label: "Baklava" },
  ],
  heroImages: [
    "https://images.unsplash.com/photo-1530469912745-a215c6b256ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    "https://images.unsplash.com/photo-1583161178154-c362b3459d29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    "https://images.unsplash.com/photo-1573225342350-16731dd9bf3d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  ],
  stats: {
    restaurants: 7,
    menuItems: "500+",
    deals: 3,
    malls: 5,
  },
  restaurants: [
    {
      id: "deli-turk-suntec",
      name: "Deli Turk by Chef Celal at Suntec City Mall",
      rating: 4.8,
      reviews: 166,
      location: "Suntec City",
      tags: ["Mediterranean", "Turkish", "Kebab"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFecL-IljMkwOHWzXou_iis2UCvsiwWYrnSCNTNaDIlJi-ntGwqCyzWExihUULKJgtnx0DU1k830LvzBO0p6L0NLZkCSAjW8Uo=s4800-w800",
      description:
        "Authentic Turkish cuisine featuring a variety of kebabs, mezze platters, and grilled specialties in a welcoming atmosphere.",
      area: "central",
      tag: "AUTHENTIC",
      address: "3 Temasek Boulevard, Mall, #B1-147 Suntec City, 038983",
      phone: "+65 9008 2378",
      hours: "Monday to Sunday 11 am–10 pm",
      website: "https://www.delimedifoods.com",
    },
    {
      id: "kebabchi-charcoal-bbq",
      name: "Kebabchi Charcoal BBQ",
      rating: 4.5,
      reviews: 846,
      location: "Suntec City",
      tags: ["Mediterranean", "Turkish", "BBQ"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqECdnl-0-61IUMS1TQZsHg04O7aLlTnaFDEpF56TwkfLR4VeQUxQ9XBgHanKibw9vuQG1SnibGqoSi7CXSeJG-oxRXDaJ99jqg=s4800-w800",
      description:
        "Specializing in charcoal-grilled kebabs and traditional Mediterranean dishes with quality ingredients and authentic flavors.",
      area: "central",
      tag: "BBQ",
      address: "3 Temasek Blvd, #B1-146, Singapore 038983",
      phone: "+65 9159 9491",
      hours: "Monday to Sunday 11:30 am–10 pm",
      website: "Not available",
    },
    {
      id: "turkish-lezzet-house",
      name: "Turkish Lezzet House",
      rating: 4.6,
      reviews: 393,
      location: "Suntec City",
      tags: ["Mediterranean", "Turkish", "Halal"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGIJ0So5ovwAeuMLMYJKsw93MU14PIwuGc2PX5RsP7X6gaIzRZ7hytDDty8ChRBsDKbuK-1esn2GPyghClxZg_S5FNm5CiEtxY=s4800-w800",
      description:
        "Family-friendly Turkish restaurant serving authentic dishes from kebabs to pide, with halal-certified ingredients.",
      area: "central",
      tag: "HALAL",
      address: "3 Temasek Blvd, #B1-105, Singapore 038983",
      phone: "+65 9296 5026",
      hours:
        "Monday to Thursday 11 am–9:30 pm, Friday to Saturday 11 am–10 pm, Sunday 11 am–9:30 pm",
      website: "https://turkishlezzethouse.com",
    },
    {
      id: "stuffd-vivocity",
      name: "Stuff'd",
      rating: 4.5,
      reviews: 368,
      location: "VivoCity",
      tags: ["Mediterranean", "Fast Food", "Healthy"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwy53adZwYltkr4MDQulkrlDV2uF7MpDUD1cb6lejRC3BmtlLPLU_bdGKytFyhLxi5uKtt0PsAHTjcpI05GvC2fOYO5ZNs_SkonOcG8qpWGsE6UCNuw_UHiwoS6PFSmigQTlXDwYKMbtPOiFL4=s4800-w800",
      description:
        "Quick-service Mediterranean food featuring customizable kebabs, wraps, and bowls with fresh ingredients.",
      area: "central",
      tag: "QUICK BITES",
      address: "HarbourFront Walk, 1, B2-K17 VivoCity, 098585",
      phone: "Not available",
      hours: "Monday-Sunday: 10:30 am–9:45 pm",
      website: "http://stuffed.com.sg/",
    },
    {
      id: "stuffd-plaza-singapura",
      name: "Stuff'd",
      rating: 4.5,
      reviews: 312,
      location: "Plaza Singapura",
      tags: ["Mediterranean", "Fast Food", "Healthy"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDx1NmZf6RTRR45bx2ji8VxmH69yPfC-Qup1db-IxYNKayTH6Kd9kBFGYJFiacd47fdZJuRKzoWo6ccjztZcXqjuNOLfTUkEXCEZNbIVjYj8KuNIDkwnETrtYfbbTl_7J9_A1tlct9HQvAuZsg=s4800-w800",
      description:
        "Fresh and healthy Mediterranean-inspired wraps, kebabs and salad bowls made with quality ingredients.",
      area: "central",
      tag: "HEALTHY",
      address: "Plaza Singapura, #B2-43, 68 Orchard Rd, 238839",
      phone: "Not available",
      hours: "Monday-Sunday: 10:30 am–9:45 pm",
      website: "http://stuffed.com.sg/",
    },
    {
      id: "stuffd-woodleigh",
      name: "Stuff'd",
      rating: 4.1,
      reviews: 196,
      location: "Woodleigh Mall",
      tags: ["Mediterranean", "Fast Food", "Healthy"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEdfkFjUeun6VLV60q-o08lifaTvKuyfqzpE9lG9CSNAu6bkeTfTAXvb7Ey14_Nysc3pPN6ryFAczqfLEcYHu9AoMfRvQBAkxo=s4800-w800",
      description:
        "Popular quick-service restaurant offering Mediterranean-inspired wraps, kebabs and healthy bowls.",
      area: "north-east",
      tag: "FRESH",
      address: "11 Bidadari Park Dr, B1-K25, Singapore 367803",
      phone: "+65 9150 5729",
      hours: "Monday to Sunday 10:30 am–9:30 pm",
      website: "https://www.stuffd.com/sg",
    },
    {
      id: "tangled-suntec",
      name: "Tangled",
      rating: 4.1,
      reviews: 33,
      location: "Suntec City",
      tags: ["Mediterranean", "Western", "Pasta"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFZDXfcTDgtdCMxQJWCcsWWSsrpO_1v3NLjy3zb6CvRkWKA6j4Qgvdg_3M-YwLzTOC_2ConlPidzqUC9iHqS8usM5dg6I2dRmI=s4800-w800",
      description:
        "Mediterranean-fusion restaurant offering a variety of pastas, wraps and healthy bowl options in a casual setting.",
      area: "central",
      tag: "FUSION",
      address: "3 Temasek Blvd, #02-601A, Singapore 038983",
      phone: "+65 8770 0706",
      hours: "Monday to Sunday 11 am–9:30 pm",
      website: "https://www.tangled.sg",
    },
  ],
  deals: [
    {
      id: "deal1",
      badge: "15% OFF",
      title: "15% OFF Kebab Platters at Deli Turk",
      duration: "Valid till: 30 May 2025",
      description:
        "Enjoy 15% off all kebab platters at Deli Turk Suntec City. Valid for dine-in only, Monday to Thursday.",
      code: "KEBAB15",
    },
    {
      id: "deal2",
      badge: "1-FOR-1",
      title: "1-for-1 Pita Wraps at Stuff'd (VivoCity)",
      duration: "Valid till: 15 Jun 2025",
      description:
        "Buy one pita wrap and get one free at Stuff'd, VivoCity. Second wrap must be of equal or lesser value. T&Cs apply.",
      code: "PITA121",
    },
    {
      id: "deal3",
      badge: "FREE",
      title: "Free Baklava with Any Main Course at Turkish Lezzet House",
      duration: "Valid till: 20 May 2025",
      description:
        "Enjoy a complimentary baklava dessert with any main course ordered at Turkish Lezzet House, Suntec City.",
      code: "BAKLAVA",
    },
  ],
  otherCuisines: [
    {
      name: "Japanese",
      image:
        "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      url: "/cuisine/japanese",
    },
    {
      name: "Chinese",
      image:
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      url: "/cuisine/chinese",
    },
    {
      name: "Western",
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      url: "/cuisine/western",
    },
    {
      name: "Thai",
      image:
        "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80",
      url: "/cuisine/thai",
    },
    {
      name: "Italian",
      image:
        "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
      url: "/cuisine/italian",
    },
  ],
};
