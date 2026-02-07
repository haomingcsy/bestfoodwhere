import type { CuisineData } from "./types";

export const ITALIAN_CUISINE: CuisineData = {
  slug: "italian",
  name: "Italian",
  tagline:
    "From authentic pizzas to homemade pasta, find the best Italian food near you",
  features: [
    { label: "Pasta" },
    { label: "Pizza" },
    { label: "Risotto" },
    { label: "Family Dining" },
    { label: "Romantic" }
  ],
  heroImages: [
    "https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?auto=format&fit=crop&w=800&q=80"
  ],
  stats: {
    restaurants: 15,
    menuItems: "300+",
    deals: 3,
    malls: 6,
  },
  restaurants: [
    {
      id: "mamma-mia-trattoria",
      name: "Mamma Mia Trattoria E Caffe",
      rating: 4.7,
      reviews: 6074,
      location: "Plaza Singapura",
      tags: ["Italian", "European", "Pizza", "Pasta"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyis9FIUjHUfdzJ2beAVwJjM8wMp6wPUErtr7hMtE2nremj__Xo_KVad7fE9suRZR-eiVN_ZtT6WNQxXWRmzdhNEuHPj9nO2kRvSMKjMdyJIFo6C-XwfAMy2wwmIJU2YA-pYOoZUthqyW91GYSy1DEe7w=s4800-w800",
      description:
        "Authentic Italian restaurant serving traditional pizzas, homemade pasta, and other Italian specialties in a warm atmosphere.",
      area: "north",
      tag: "AUTHENTIC",
      address: "68 Orchard Rd, #03-79/83, Singapore 238839",
      phone: "62639153",
      hours: "Monday to Sunday: 11:30 am-10 pm",
      website: "https://mamma-mia.sg/",
    },
    {
      id: "peperoni-pizzeria-united-square",
      name: "Peperoni Pizzeria @ United Square",
      rating: 4.7,
      reviews: 346,
      location: "United Square",
      tags: ["Italian", "Pizza", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwt6ndycByW8J5U8AH0G1cGjekjWh8Z3irtvHMClBD3bmHXRp3cxDvxNbxO3MTMNlBpF8x0IB3qPt16MTvrBL9Pe-eQAJflVgW60-RHKYT1R0h0giIqIFpT9Di9Q-6kKFpVSvT8EPCGXTaUSkC_IoqcCA=s4800-w800",
      description:
        "Popular pizzeria known for wood-fired pizzas with a variety of Italian-inspired toppings and hearty pasta dishes.",
      area: "north-east",
      tag: "FAMILY FRIENDLY",
      address: "101 Thomson Rd, #01-07/60, Singapore 307591",
      phone: "66816704",
      hours: "Monday to Sunday: 11 am-2:30 pm, 5-9 pm",
      website: "https://www.peperoni.com.sg/menu",
    },
    {
      id: "pastamania-city-square",
      name: "PastaMania - Italian Casual Dining @ City Square Mall",
      rating: 4.3,
      reviews: 706,
      location: "City Square Mall",
      tags: ["Italian", "Western", "Pasta", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwaY89GssGqXVuIIRGNsennQwSEeNR4TNw10QWSJhFA3KjxoxeTFV19_JRmB_OKVzrdGsIqBkWqT0Vg03JdhgpVvtg4NTxULVFwi8WXqq-ox7CXPpc83B-QhKVfPFvNuXG5PlWsi4yBnzEnKA=s4800-w800",
      description:
        "Casual Italian dining spot offering a wide range of pasta dishes and Italian-inspired meals at affordable prices.",
      area: "north-east",
      tag: "CASUAL DINING",
      address:
        "180 Kitchener Rd, #02 - 21 / 22 City Square Mall, Singapore 208539",
      phone: "66348935",
      hours: "Monday to Sunday: 11 am-9 pm",
      website: "https://www.pastamania.com.sg/",
    },
    {
      id: "saizeriya-city-square",
      name: "Saizeriya Ristorante e Caffe",
      rating: 4.1,
      reviews: 1270,
      location: "City Square Mall",
      tags: ["Italian", "Western", "Budget-Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzLQMa-uFraEDvGFoUhy94asbPAT3PctrRePIQZW-lmEphkV0yZhnOHv6IrFD1GA9syBlzubWF7_caL9fU_MWgeQPm9lsM-fCcDeRvnhVtgJHCGbrhw2ct4bsjHjNHj5lWYL6VLpGjjR-EKsIV_MJqsQw=s4800-w800",
      description:
        "Budget-friendly Italian restaurant chain offering pizza, pasta, and other Italian favorites in a casual setting.",
      area: "east",
      tag: "BUDGET-FRIENDLY",
      address: "180 Kitchener Road, Mall, B2-55/56 City Square",
      phone: "68344877",
      hours: "Monday to Sunday: 11 am-10 pm",
      website: "https://www.saizeriya.com.sg/search/",
    },
    {
      id: "little-italy-woodleigh",
      name: "Little Italy - Woodleigh",
      rating: 4.2,
      reviews: 212,
      location: "The Woodleigh Mall",
      tags: ["Italian", "Pizza", "Pasta"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGrWGV8GAQtKbiaoXO4JLiYaQdt133nXpV2MTzgjo6SHGWjXu8qHqDpR9Axw04wW72VKL5rCk8E0qQnV8iDIh9g6gxDbTRnNBo=s4800-w800",
      description:
        "Cozy Italian restaurant serving authentic pizzas, pasta, and classic Italian dishes in a welcoming environment.",
      area: "north-east",
      tag: "FAMILY FRIENDLY",
      address: "11 Bidadari Park Dr, Mall, #02-48 The Woodleigh, 367803",
      phone: "+65 9710 9052",
      hours: "Monday to Sunday 11:30 am-10 pm",
      website: "https://www.littleitaly.com.sg",
    },
    {
      id: "lavo-italian-restaurant",
      name: "LAVO Italian Restaurant And Rooftop Bar",
      rating: 4.3,
      reviews: 5134,
      location: "Marina Bay Sands",
      tags: ["Italian", "Rooftop", "Fine Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqG4bJD3VDtkobrq90m_ZWaQHRVJWf15F8MPEyB4rVF6mcv98D-a0FqqgaKuIhskXZ_8ppbW4ySbIabY5KUfPrm-XzOGcCaD59g=s4800-w800",
      description:
        "Upscale Italian restaurant and rooftop bar combining authentic Italian cuisine with stunning city views.",
      area: "south",
      tag: "FINE DINING",
      address:
        "10 Bayfront Avenue, Marina Bay Sands, Hotel, Level 57 Tower 1, 018956",
      phone: "+65 6688 8591",
      hours:
        "Monday to Thursday 11 am-12 am, Friday to Saturday 11 am-1:30 am, Sunday 12 pm-12 am",
      website:
        "https://www.marinabaysands.com/restaurants/lavoitalianrestaurantandrooftopbar.html",
    },
    {
      id: "robertas-pizza",
      name: "Roberta's Pizza",
      rating: 4.2,
      reviews: 841,
      location: "Marina Bay Sands",
      tags: ["Italian", "Pizza", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyPlw6YMa-UUljZLy8LR8gulWo1DkUrobJ3Nz4gZnOzm4ihAwnOb2tspPfD9L_hrgx0rVw3dCBa-K6u8btlJ0xEdvj9V3agSfTrj-ybl3uVWWyjkDGl1FjIFdAPbAjbCHbHj2sKxUregbXMqyY=s4800-w800",
      description:
        "New York-style pizzeria serving artisanal wood-fired pizzas, pasta, and Italian-inspired dishes in a modern setting.",
      area: "south",
      tag: "PIZZA SPECIALIST",
      address: "2 Bayfront Ave, B1-45, Singapore 018972",
      phone: "+65 6688 7367",
      hours: "Monday to Friday 11:30 am-11 pm, Saturday to Sunday 11 am-11 pm",
      website: "https://www.marinabaysands.com/restaurants/roberta'spizza.html",
    },
    {
      id: "peperoni-pizzeria-suntec",
      name: "Peperoni Pizzeria",
      rating: 4.4,
      reviews: 1197,
      location: "Suntec City",
      tags: ["Italian", "Pizza", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwqSp3BWCHL0xKMGawZ2ISEsbpoewmZWkW_GO8o-lWJJwJOfO3NMuCpmWNtrCtgkhbDA9gRgTNKJaln1NH0sQuTX87aJTFX5Ue27rxBN5AnJtWx4Y5ZXk9zUmSIvqu9b49jXqSD62fIkBTRHQ=s4800-w800",
      description:
        "Popular pizzeria known for wood-fired pizzas with a variety of toppings served in a casual, family-friendly environment.",
      area: "north",
      tag: "PIZZA SPECIALIST",
      address: "3 Temasek Blvd, #B1-130, Singapore 038983",
      phone: "+65 6681 6729",
      hours: "Monday to Sunday 11 am-2:30 pm, 5-9 pm",
      website: "https://www.peperoni.com.sg",
    },
    {
      id: "gopizza-suntec",
      name: "GOPIZZA (Suntec City)",
      rating: 4.2,
      reviews: 382,
      location: "Suntec City",
      tags: ["Italian", "Pizza", "Quick Bites"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFQ3ywTcaXsxpXUEHq8Lvc6G0Y17d8KOO6djEYdJ1qz1W5eSA1-SKaVNkrALuPf8emV9YacikyyifPpchBrE296Z3QmAtBNF9Q=s4800-w800",
      description:
        "Modern pizzeria offering personal-sized pizzas with various toppings, baked quickly for a fast casual dining experience.",
      area: "east",
      tag: "QUICK SERVICE",
      address: "3 Temasek Blvd, #01-365, Singapore 038983",
      phone: "+65 6970 0630",
      hours:
        "Monday to Thursday 11 am-10 pm, Friday to Saturday 11 am-10:30 pm, Sunday 11 am-10 pm",
      website: "https://gopizza.sg",
    }
  ],
  deals: [
    {
      id: "deal1",
      badge: "20% OFF",
      title: "20% OFF Weekend Dinner at Mamma Mia Trattoria",
      duration: "Valid till: 30 May 2025",
      description:
        "Enjoy 20% off all dinner menu items at Mamma Mia Trattoria. Valid for dine-in only, Friday to Sunday.",
      code: "MAMMA20",
    },
    {
      id: "deal2",
      badge: "1-FOR-1",
      title: "1-for-1 Pizza at Peperoni Pizzeria",
      duration: "Valid till: 15 Jun 2025",
      description:
        "Buy one pizza and get one free at Peperoni Pizzeria. Second pizza must be of equal or lesser value.",
      code: "PEPERONI121",
    },
    {
      id: "deal3",
      badge: "FREE",
      title: "Free Tiramisu with Any Main Course at LAVO",
      duration: "Valid till: 20 May 2025",
      description:
        "Enjoy a complimentary tiramisu with any main course ordered at LAVO Italian Restaurant. Dine-in only.",
      code: "FREETIRA",
    }
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
    }
  ],
};
