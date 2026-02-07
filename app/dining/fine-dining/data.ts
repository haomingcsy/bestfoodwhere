import type { Restaurant, DiningDeal, DiningCategory } from "@/types/dining";

export const FINE_DINING_RESTAURANTS: Restaurant[] = [
  {
    id: "bread-street-kitchen",
    name: "Bread Street Kitchen by Gordon Ramsay",
    rating: 4.1,
    reviews: 4273,
    location: "Marina Bay Sands",
    tags: ["Western", "British", "Fine Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMyqJmwjq_l-vT-FO5PmquSIMNRvgceYl1xas_f=w800-h600-k-no",
    description:
      "Gordon Ramsay's modern British European restaurant offering classic dishes with a contemporary twist in a sophisticated setting.",
    area: "south",
    tag: "CELEBRITY CHEF",
    address:
      "10 Bayfront Ave, B1/01-81 The Shoppes, Marina Bay Sands, Singapore 018956",
    phone: "+65 6688 5665",
    hours: "Monday to Friday 12 pm–12 am, Saturday to Sunday 11:30 am–12 am",
    website:
      "https://www.marinabaysands.com/restaurants/breadstreetkitchenbygordonramsay.html",
  },
  {
    id: "cut-wolfgang-puck",
    name: "CUT by Wolfgang Puck",
    rating: 4.6,
    reviews: 1618,
    location: "Marina Bay Sands",
    tags: ["Western", "Steak", "Fine Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPT2dL1P55UQQvcIpG8Nrgly7xyaVUdOlLMBXhC=w800-h600-k-no",
    description:
      "Acclaimed celebrity chef Wolfgang Puck's sophisticated steakhouse serving exceptional cuts of beef and creative side dishes.",
    area: "south",
    tag: "STEAKHOUSE",
    address:
      "10 Bayfront Ave, B1-71 The Shoppes, Marina Bay Sands, Singapore 018956",
    phone: "+65 6688 8517",
    hours:
      "Monday to Thursday 5–10 pm, Friday to Saturday 5–11 pm, Sunday 5–10 pm",
    website:
      "https://www.marinabaysands.com/restaurants/cutbywolfgangpuck.html",
  },
  {
    id: "koma-singapore",
    name: "KOMA Singapore",
    rating: 4.3,
    reviews: 2511,
    location: "Marina Bay Sands",
    tags: ["Japanese", "Sushi", "Fine Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNEOKHK4It8mr0UrPhrLwMM7u_270XEK-Cw60Js=w800-h600-k-no",
    description:
      "Modern Japanese restaurant with stunning interiors featuring a traditional Japanese footbridge and dramatic 20-foot high ceiling.",
    area: "south",
    tag: "JAPANESE",
    address:
      "10 Bayfront Ave, B1-67 The Shoppes, Marina Bay Sands, Singapore 018956",
    phone: "+65 6688 8690",
    hours:
      "Monday to Thursday 11:30 am–2:30 pm, 5–11 pm, Friday to Saturday 11:30 am–2:30 pm, 5 pm–12 am, Sunday 11:30 am–2:30 pm, 5–11 pm",
    website: "https://www.marinabaysands.com/restaurants/komasingapore.html",
  },
  {
    id: "mott-32-singapore",
    name: "Mott 32 Singapore",
    rating: 4.3,
    reviews: 854,
    location: "Marina Bay Sands",
    tags: ["Chinese", "Cantonese", "Fine Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMXy1wHC4szZj-E9U9pcT7JJ6EMJiT5Icea9fLi=w800-h600-k-no",
    description:
      "Award-winning Chinese restaurant known for its authentic Cantonese cuisine with modern touches and signature dishes like apple wood-roasted Peking duck.",
    area: "south",
    tag: "CHINESE",
    address:
      "10 Bayfront Ave, B1-42-44 The Shoppes, Marina Bay Sands, Singapore 018956",
    phone: "+65 6688 9922",
    hours:
      "Monday to Thursday 11:30 am–2:30 pm, 5–9:30 pm, Friday to Saturday 11:30 am–2:30 pm, 5–11:30 pm, Sunday 11:30 am–2:30 pm, 5–9:30 pm",
    website: "https://www.marinabaysands.com/restaurants/mott32singapore.html",
  },
  {
    id: "tunglok-peking-duck",
    name: "TungLok Peking Duck Novena",
    rating: 4.8,
    reviews: 1644,
    location: "Velocity@Novena",
    tags: ["Chinese", "Peking Duck", "Fine Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMX7d7J-Z1zR38_3icdMWZXotKQDMIkFn4o9HIe=w800-h600-k-no",
    description:
      "Upscale Chinese restaurant specializing in authentic Peking duck prepared according to traditional methods, carved tableside for a theatrical dining experience.",
    area: "central",
    tag: "CHINESE",
    address: "Velocity@Novena Square#02-11/12, 238 Thomson Rd, 307683",
    phone: "+65 6992 2777",
    hours: "Monday to Sunday 11:30 am–3 pm, 6–10 pm",
    website: "https://www.tunglok.com",
  },
  {
    id: "wakuda",
    name: "Wakuda",
    rating: 4.2,
    reviews: 278,
    location: "Marina Bay Sands",
    tags: ["Japanese", "Sushi", "Fine Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNTH3Fbuka9eWwn9dhMmOba_R__IEhBdJ88yRas=w800-h600-k-no",
    description:
      "Chef Tetsuya Wakuda's modern Japanese restaurant offering exceptional sushi, sashimi, and innovative dishes using the finest seasonal ingredients.",
    area: "south",
    tag: "JAPANESE",
    address:
      "10 Bayfront Avenue, Marina Bay Sands, Hotel Tower 2, Lobby, 018956",
    phone: "+65 6688 8885",
    hours: "Monday to Sunday 11:30 am–12 am",
    website: "https://www.marinabaysands.com/restaurants/wakuda.html",
  },
  {
    id: "waku-ghin",
    name: "Waku Ghin",
    rating: 4.2,
    reviews: 312,
    location: "Marina Bay Sands",
    tags: ["Japanese", "Fine Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMh_vxmBra9VxYf8Nk2ImC5uOn0ws3jPBrQ8Bqw=w800-h600-k-no",
    description:
      "Chef Tetsuya Wakuda's intimate dining experience featuring an omakase-style degustation menu with the finest seasonal ingredients from Japan and around the world.",
    area: "south",
    tag: "CELEBRITY CHEF",
    address:
      "10 Bayfront Ave, #02-03 The Shoppes, Marina Bay Sands, Singapore 018956",
    phone: "+65 6688 8507",
    hours: "Monday to Sunday 5–11 pm",
    website: "https://www.marinabaysands.com/restaurants/wakughin.html",
  },
  {
    id: "lavo-italian",
    name: "LAVO Italian Restaurant And Rooftop Bar",
    rating: 4.3,
    reviews: 5134,
    location: "Marina Bay Sands",
    tags: ["Italian", "Fine Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipM7GaPSaX8lEasq8Hrb0DKIz2Sy5gLU_g6E0lrc=w800-h600-k-no",
    description:
      "Upscale Italian-American restaurant with spectacular views from its 57th-floor location, serving hearty Italian classics and signature cocktails.",
    area: "south",
    tag: "ROOFTOP",
    address:
      "10 Bayfront Avenue, Marina Bay Sands, Hotel, Level 57 Tower 1, 018956",
    phone: "+65 6688 8591",
    hours:
      "Monday to Thursday 11 am–12 am, Friday to Saturday 11 am–1:30 am, Sunday 12 pm–12 am",
    website:
      "https://www.marinabaysands.com/restaurants/lavoitalianrestaurantandrooftopbar.html",
  },
  {
    id: "putien-mbs",
    name: "PUTIEN Marina Bay Sands",
    rating: 4.8,
    reviews: 822,
    location: "Marina Bay Sands",
    tags: ["Chinese", "Fujian", "Fine Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOUuBL_mXfSHdS2AxGHWTHTnKwd20QY5jPxyZnY=w800-h600-k-no",
    description:
      "Michelin-starred restaurant specializing in cuisine from the Fujian province, offering fresh, light flavors using premium seasonal ingredients.",
    area: "south",
    tag: "MICHELIN STAR",
    address:
      "2 Bayfront Ave, #01-05 The Shoppes at, Marina Bay Sands, Singapore 018973",
    phone: "+65 6688 7053",
    hours: "Monday to Sunday 11:30 am–10 pm",
    website: "https://www.putien.com",
  },
  {
    id: "blossom-restaurant",
    name: "Blossom Restaurant",
    rating: 4.7,
    reviews: 2248,
    location: "Marina Bay Sands",
    tags: ["Chinese", "Fine Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPReLTKEffTWsf6SHZcHI73SJ24IrFEoqpD-K7B=w800-h600-k-no",
    description:
      "Modern Chinese restaurant showcasing dishes from various regions of China, presented with contemporary flair and using premium ingredients.",
    area: "south",
    tag: "CHINESE",
    address:
      "Marina Bay Sands Hotel, Lobby Tower 2, #01-05/05A, 2 Bayfront Ave, 018972",
    phone: "+65 6688 7799",
    hours: "Monday to Sunday 11 am–4:30 pm, 5:30–11 pm",
    website:
      "https://www.marinabaysands.com/restaurants/blossomrestaurant.html",
  },
  {
    id: "rise",
    name: "RISE",
    rating: 4.2,
    reviews: 1746,
    location: "Marina Bay Sands",
    tags: ["International", "Buffet", "Fine Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMjku5-c4mYvypdiKKdAI0TfeXTPuQcDqAkVUf2=w800-h600-k-no",
    description:
      "International buffet restaurant in a garden-inspired setting, serving dishes made with sustainable ingredients and herbs from their own garden.",
    area: "south",
    tag: "BUFFET",
    address:
      "10 Bayfront Avenue, Marina Bay Sands, Hotel Tower 1, Lobby, 018956",
    phone: "+65 6688 5525",
    hours:
      "Monday to Thursday 6:30 am–10 pm, Friday to Saturday 6:30 am–10:30 pm, Sunday 6:30 am–10 pm",
    website: "https://www.marinabaysands.com/restaurants/rise.html",
  },
  {
    id: "putien-tampines",
    name: "PUTIEN Tampines Mall",
    rating: 4.8,
    reviews: 3067,
    location: "Tampines Mall",
    tags: ["Chinese", "Asian", "Fine Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPE8xQCBwkWahrktdxufS0vG9bWbVeAM6TGWWPc=w800-h600-k-no",
    description:
      "Award-winning restaurant serving authentic Fujian cuisine with a Michelin star, known for its simple yet refined dishes that highlight natural flavors.",
    area: "east",
    tag: "MICHELIN",
    address: "4 Tampines Central 5, #02 - 02 Tampines Mall, Singapore 529510",
    phone: "67812162",
    hours: "Monday-Sunday: 11:30 am–10 pm",
    website: "https://order.putien.com/en_SG/",
  },
  {
    id: "crystal-jade",
    name: "Crystal Jade Hong Kong Kitchen",
    rating: 3.8,
    reviews: 591,
    location: "Causeway Point",
    tags: ["Chinese", "Cantonese", "Fine Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPzDjTS2kNY5jsG9fM6AhK-DF7ETQbCFHb3kFHy=w800-h600-k-no",
    description:
      "Elegant restaurant serving authentic Cantonese cuisine and dim sum in a sophisticated setting with attentive service.",
    area: "north",
    tag: "UPSCALE",
    address: "Woodlands Square, #05-10 Causeway Point, Singapore 738099",
    phone: "83668498",
    hours: "Monday-Friday: 11 am–10 pm, Saturday-Sunday: 10:30 am–10 pm",
    website: "http://www.crystaljade.com/",
  },
  {
    id: "jumbo-seafood-jewel",
    name: "JUMBO Seafood - Jewel",
    rating: 4.8,
    reviews: 3651,
    location: "Jewel Changi Airport",
    tags: ["Seafood", "Chinese", "Fine Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPVq2O2cjG-LTOtTnVtebSZLMHxHLDfnWn71vT1=w800-h600-k-no",
    description:
      "Award-winning seafood restaurant famous for its chili crab and other Singapore seafood delicacies, set in an elegant atmosphere.",
    area: "east",
    tag: "SEAFOOD",
    address: "78 Airport Blvd., #03-202/203/204, Singapore 819666",
    phone: "63883435",
    hours: "Monday-Sunday: 11:30 am–10 pm",
    website: "https://www.jumboseafood.com.sg/en/menus",
  },
  {
    id: "din-tai-fung",
    name: "Din Tai Fung",
    rating: 4.3,
    reviews: 1066,
    location: "Tampines Mall",
    tags: ["Chinese", "Taiwanese", "Fine Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMxeCUA_aNbzUjh_fUP3OWCD3dN663I0XzIkYID=w800-h600-k-no",
    description:
      "World-famous Taiwanese restaurant chain known for their meticulously crafted xiao long bao (soup dumplings) and refined Chinese cuisine.",
    area: "east",
    tag: "PREMIUM",
    address: "4 Tampines Central 5, #02-01 Tampines Mall, Singapore 529510",
    phone: "67870998",
    hours:
      "Monday-Thursday & Sunday: 11 am–9 pm, Friday-Saturday: 11 am–9:15 pm",
    website: "http://www.dintaifung.com.sg/",
  },
  {
    id: "jumbo-signatures",
    name: "JUMBO Signatures",
    rating: 4.7,
    reviews: 804,
    location: "Marina Bay Sands",
    tags: ["Seafood", "Singaporean", "Fine Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPhDzH_KCXiNfsNyxAasfGYlHwJLO96-w4lCXdk=w800-h600-k-no",
    description:
      "Premium seafood restaurant known for its award-winning chili crab and other Singaporean seafood delicacies in an elegant setting.",
    area: "south",
    tag: "SEAFOOD",
    address: "The Shoppes at Marina Bay Sands, 2 Bayfront Ave, B1- 01B, 018972",
    phone: "+65 6688 7023",
    hours:
      "Monday to Friday 11:30 am–3 pm, 5:30–10:30 pm, Saturday to Sunday 12–3:30 pm, 5:30–10:30 pm",
    website: "https://www.marinabaysands.com/restaurants/jumbosignatures.html",
  },
];

export const FINE_DINING_DEALS: DiningDeal[] = [
  {
    id: "deal1",
    badge: "DEGUSTATION",
    title: "9-Course Tasting Menu Experience at CUT by Wolfgang Puck",
    duration: "Valid till: 30 June 2025",
    description:
      "Indulge in a specially curated 9-course tasting menu with premium wine pairing. Available for dinner service only.",
    code: "CUTMENU25",
  },
  {
    id: "deal2",
    badge: "EXCLUSIVE",
    title: "Chef's Table Experience at KOMA Singapore",
    duration: "Valid till: 15 May 2025",
    description:
      "Enjoy a personalized dining experience at the exclusive Chef's Table with custom menu prepared right before your eyes.",
    code: "KOMACHEF25",
  },
  {
    id: "deal3",
    badge: "WINE PAIRING",
    title: "Complimentary Wine Pairing at Bread Street Kitchen",
    duration: "Valid till: 31 Dec 2025",
    description:
      "Receive complimentary wine pairing with your 5-course dinner when dining on weekdays. Advance reservation required.",
    code: "BSKWINE25",
  },
];

export const OTHER_DINING_CATEGORIES: DiningCategory[] = [
  {
    name: "Casual Dining",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/casual",
  },
  {
    name: "Quick Bites",
    image:
      "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/quick-bites",
  },
  {
    name: "Family Friendly",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/family-friendly",
  },
  {
    name: "Romantic",
    image:
      "https://images.unsplash.com/photo-1505275350441-83dcda8eeef5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/romantic",
  },
  {
    name: "Late Night Dining",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/late-night",
  },
];

export const FINE_DINING_STATS = {
  restaurants: "25+",
  michelinStars: "15",
  celebrityChefs: "8",
  averageRating: "4.5",
};
