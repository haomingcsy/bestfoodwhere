import type { CuisineData } from "./types";

export const MEXICAN_CUISINE: CuisineData = {
  slug: "mexican",
  name: "Mexican",
  tagline:
    "From tasty tacos to sizzling fajitas, find the best Mexican food near you",
  features: [
    { label: "Tacos" },
    { label: "Burritos" },
    { label: "Quesadillas" },
    { label: "Enchiladas" },
    { label: "Nachos" },
  ],
  heroImages: [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584208632869-05fa2b2a5934?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=800&q=80",
  ],
  stats: {
    restaurants: 7,
    menuItems: "300+",
    deals: 4,
    malls: 6,
  },
  restaurants: [
    {
      id: "stuffd-plaza-singapura",
      name: "Stuff'd",
      rating: 4.5,
      reviews: 312,
      location: "Plaza Singapura",
      tags: ["Mexican", "Fast Food", "Mediterranean"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDx1NmZf6RTRR45bx2ji8VxmH69yPfC-Qup1db-IxYNKayTH6Kd9kBFGYJFiacd47fdZJuRKzoWo6ccjztZcXqjuNOLfTUkEXCEZNbIVjYj8KuNIDkwnETrtYfbbTl_7J9_A1tlct9HQvAuZsg=s4800-w800",
      description:
        "Quick and customizable Mexican-inspired wraps, burritos and bowls with fresh ingredients.",
      area: "central",
      tag: "QUICK BITES",
      address: "68 Orchard Road, #B2-43, Plaza Singapura, 238839",
      phone: "Not available",
      hours: "Monday to Sunday 10:30 am–9:45 pm",
      website: "http://stuffed.com.sg/",
    },
    {
      id: "stuffd-woodleigh-mall",
      name: "Stuff'd",
      rating: 4.1,
      reviews: 196,
      location: "The Woodleigh Mall",
      tags: ["Mexican", "Mediterranean", "Healthy"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEdfkFjUeun6VLV60q-o08lifaTvKuyfqzpE9lG9CSNAu6bkeTfTAXvb7Ey14_Nysc3pPN6ryFAczqfLEcYHu9AoMfRvQBAkxo=s4800-w800",
      description:
        "Healthy Mexican and Mediterranean wraps, burritos and rice bowls made fresh to order.",
      area: "north-east",
      tag: "HEALTHY EATING",
      address: "11 Bidadari Park Dr, B1-K25, Singapore 367803",
      phone: "+65 9150 5729",
      hours: "Monday to Sunday 10:30 am–9:30 pm",
      website: "https://www.stuffd.com/sg",
    },
    {
      id: "stuffd-vivocity",
      name: "Stuff'd",
      rating: 4.5,
      reviews: 368,
      location: "VivoCity",
      tags: ["Mexican", "Fast Food", "Mediterranean"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwy53adZwYltkr4MDQulkrlDV2uF7MpDUD1cb6lejRC3BmtlLPLU_bdGKytFyhLxi5uKtt0PsAHTjcpI05GvC2fOYO5ZNs_SkonOcG8qpWGsE6UCNuw_UHiwoS6PFSmigQTlXDwYKMbtPOiFL4=s4800-w800",
      description:
        "Popular chain serving fresh Mexican and Mediterranean-inspired wraps, burritos and rice bowls.",
      area: "south",
      tag: "FAMILY FRIENDLY",
      address: "HarbourFront Walk, 1, B2-K17 VivoCity, 098585",
      phone: "Not available",
      hours: "Monday to Sunday 10:30 am–9:45 pm",
      website: "http://stuffed.com.sg/",
    },
    {
      id: "marche-vivocity",
      name: "Marché VivoCity",
      rating: 4.4,
      reviews: 6044,
      location: "VivoCity",
      tags: ["European", "Mexican", "Western"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGKOBh-dWpwakJLwUJ3U1bEzfuIG4pbnKJq3imXZ3cdEw2CXtIgnNA4XtduF2r66WB4P_Oi69QqWuYRjDDcAxy589hDJXYu7rg=s4800-w800",
      description:
        "European market-style dining featuring Mexican food stations with tacos, quesadillas and nachos.",
      area: "south",
      tag: "MARKET DINING",
      address: "1 HarbourFront Walk, #03 - 14 VivoCity, Singapore 098585",
      phone: "65931702",
      hours:
        "Monday-Thursday, Sunday: 11 am–9:30 pm, Friday: 11 am–10:30 pm, Saturday: 10 am–10:30 pm",
      website: "https://marche.sg/",
    },
    {
      id: "marche-suntec-city",
      name: "Marché Suntec City",
      rating: 4.2,
      reviews: 2630,
      location: "Suntec City",
      tags: ["European", "Mexican", "Western"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEcyVTi8qK299QcZmxNvbtG1io7f3A6KKSVzHMwrZmyROvRi90ZeAyfpEOmUEAdcNYzD5JTj4QhWnM5KZwkBEb_fvNNT_dJAKE=s4800-w800",
      description:
        "Market-style dining with Mexican food options including freshly made tacos, burritos and nachos.",
      area: "central",
      tag: "FAMILY FRIENDLY",
      address:
        "3 Temasek Boulevard #01-612 to 614, Tower 3 Suntec City, 038983",
      phone: "+65 6593 1704",
      hours:
        "Monday-Thursday 11 am–9:30 pm, Friday 11 am–10:30 pm, Saturday 10 am–10:30 pm, Sunday 10 am–9:30 pm",
      website: "https://www.marche.sg",
    },
    {
      id: "guzman-y-gomez-nex",
      name: "Guzman y Gomez - NEX",
      rating: 4.8,
      reviews: 2882,
      location: "NEX",
      tags: ["Mexican"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDz2gv7EReqIYUuhZVcyaOKY7RFhKqOiDLemR088iQ52w2OmQXkCsMbjNpIcF3MfQcU66NWUoNXfpk29iahYG5Y2LcT7Me95OUw2NAHBb1LI4paMjDbxGTQfteaH08KxlsqdM8yr0wxxZYsbXAhw7oWiiw=s4800-w800",
      description:
        "Popular Mexican fast food restaurant offering burritos, tacos and bowls.",
      area: "north-east",
      tag: "QUICK BITES",
      address: "23 Serangoon Central, #02-14, Singapore 556083",
      phone: "92341160",
      hours: "Monday to Sunday: 8 am–9:30 pm",
      website: "https://www.guzmanygomez.com/sg/",
    },
    {
      id: "shake-shack-plaza-singapura",
      name: "Shake Shack Plaza Singapura",
      rating: 4.0,
      reviews: 2350,
      location: "Plaza Singapura",
      tags: ["Fast Food", "American", "Mexican-inspired"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwaxGYuCwK_UQ9VfWBzpyMKI2riI8HNmtwmCK0Pbp1sJXV0mCPHLoRXT9JSYuUh0jtnPgysN6GPkZbjLegASwHP3Vb5BBCb74aWCRozfD9bLUvRV1W6BzFBc-ZQuS8hAIXgWsUfiVciTvLpZm0=s4800-w800",
      description:
        "Popular burger chain that also offers Mexican-inspired items like chicken bites with spicy jalapeño toppings.",
      area: "central",
      tag: "CASUAL DINING",
      address:
        "#01-32-25 Unit #01-32/33/34C/35 Plaza Singapura, Singapore 238839",
      phone: "69764385",
      hours: "Monday, Wednesday-Sunday: 11 am–10 pm, Tuesday: 11 am–4 pm",
      website: "https://www.shakeshack.com.sg/",
    },
  ],
  deals: [
    {
      id: "deal1",
      badge: "20% OFF",
      title: "20% OFF Lunch Menu at Stuff'd",
      duration: "Valid till: 30 May 2025",
      description:
        "Enjoy 20% off all lunch menu items at Stuff'd. Valid for dine-in only, Monday to Friday from 11am to 2pm.",
      code: "STUFFD20",
    },
    {
      id: "deal2",
      badge: "1-FOR-1",
      title: "1-for-1 Burritos at Guzman Y Gomez",
      duration: "Valid till: 15 Jun 2025",
      description:
        "Buy one burrito and get one free at Guzman Y Gomez. Second burrito must be of equal or lesser value.",
      code: "GYG121",
    },
    {
      id: "deal3",
      badge: "FREE",
      title: "Free Nachos with Any Main Course at Marché",
      duration: "Valid till: 20 May 2025",
      description:
        "Enjoy complimentary nachos with any main course ordered at Marché. Dine-in only.",
      code: "NACHOS",
    },
  ],
  otherCuisines: [
    {
      name: "Japanese",
      image:
        "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
      url: "/cuisine/japanese",
    },
    {
      name: "Chinese",
      image:
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
      url: "/cuisine/chinese",
    },
    {
      name: "Indian",
      image:
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
      url: "/cuisine/indian",
    },
    {
      name: "Thai",
      image:
        "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=800&q=80",
      url: "/cuisine/thai",
    },
    {
      name: "Korean",
      image:
        "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80",
      url: "/cuisine/korean",
    },
  ],
};
