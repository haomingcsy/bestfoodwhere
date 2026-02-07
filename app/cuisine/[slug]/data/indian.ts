import type { CuisineData } from "./types";

export const INDIAN_CUISINE: CuisineData = {
  slug: "indian",
  name: "Indian",
  tagline:
    "From spicy curries to tandoori delights, find the best Indian food near you",
  features: [
    { label: "North Indian" },
    { label: "South Indian" },
    { label: "Vegetarian" },
    { label: "Tandoori" },
    { label: "Biryani" }
  ],
  heroImages: [
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80"
  ],
  stats: {
    restaurants: 8,
    menuItems: "500+",
    deals: 3,
    malls: 5,
  },
  restaurants: [
    {
      id: "punjab-grill",
      name: "Punjab Grill",
      rating: 4.0,
      reviews: 991,
      location: "Marina Bay Sands",
      tags: ["Indian", "Fine Dining", "Tandoori"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGrz8t3k-NumcTd1GkCCbBMv8cXiHh5TXTy6Vpeu2BmHVy9LdUkiWs9MQLx8d61lhf7Pvk8pBPjBfaAOHs8e-9m1-jhJu5u_Q=s4800-w800",
      description:
        "Upscale North Indian cuisine featuring tandoor-grilled specialties and rich curries in an elegant setting.",
      area: "south",
      tag: "FINE DINING",
      address: "2 Bayfront Ave, B1 - 01A, Singapore 018972",
      phone: "+65 6634 1701",
      hours: "Monday to Sunday 11:30 am-3 pm, 6:30-10:30 pm",
      website: "https://www.marinabaysands.com/restaurants/punjabgrill.html",
    },
    {
      id: "kebabchi-charcoal-bbq",
      name: "Kebabchi Charcoal BBQ",
      rating: 4.5,
      reviews: 846,
      location: "Suntec City",
      tags: ["Indian", "BBQ", "Kebab"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqECdnl-0-61IUMS1TQZsHg04O7aLlTnaFDEpF56TwkfLR4VeQUxQ9XBgHanKibw9vuQG1SnibGqoSi7CXSeJG-oxRXDaJ99jqg=s4800-w800",
      description:
        "Authentic Indian kebabs and grilled delicacies cooked over charcoal for rich, smoky flavors.",
      area: "central",
      tag: "CHARCOAL GRILL",
      address: "3 Temasek Blvd, #B1-146, Singapore 038983",
      phone: "+65 9159 9491",
      hours: "Monday to Sunday 11:30 am-10 pm",
    },
    {
      id: "turkish-lezzet-house",
      name: "Turkish Lezzet House",
      rating: 4.6,
      reviews: 393,
      location: "Suntec City",
      tags: ["Mediterranean", "Indian-inspired", "Halal"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGIJ0So5ovwAeuMLMYJKsw93MU14PIwuGc2PX5RsP7X6gaIzRZ7hytDDty8ChRBsDKbuK-1esn2GPyghClxZg_S5FNm5CiEtxY=s4800-w800",
      description:
        "Mediterranean restaurant serving dishes with Indian influences in a warm, inviting atmosphere.",
      area: "central",
      tag: "HALAL FRIENDLY",
      address: "3 Temasek Blvd, #B1-105, Singapore 038983",
      phone: "+65 9296 5026",
      hours:
        "Monday to Thursday 11 am-9:30 pm, Friday to Saturday 11 am-10 pm, Sunday 11 am-9:30 pm",
      website: "https://turkishlezzethouse.com",
    },
    {
      id: "deli-turk-by-chef-celal",
      name: "Deli Turk by Chef Celal",
      rating: 4.8,
      reviews: 166,
      location: "Suntec City Mall",
      tags: ["Mediterranean", "Indian Spices", "Halal"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFecL-IljMkwOHWzXou_iis2UCvsiwWYrnSCNTNaDIlJi-ntGwqCyzWExihUULKJgtnx0DU1k830LvzBO0p6L0NLZkCSAjW8Uo=s4800-w800",
      description:
        "Mediterranean delights with Indian spice influences, offering a fusion of flavors in a casual setting.",
      area: "central",
      tag: "FUSION",
      address: "3 Temasek Boulevard, Mall, #B1-147 Suntec City, 038983",
      phone: "+65 9008 2378",
      hours: "Monday to Sunday 11 am-10 pm",
      website: "https://www.delimedifoods.com",
    },
    {
      id: "my-spice-affair",
      name: "My Spice Affair",
      rating: 4.0,
      reviews: 208,
      location: "Aperia Mall",
      tags: ["Indian", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEBUD4Hfy_wxc367iqiKMTJxef8QtJirV7FPsUwBICVmunraOaoyANvgMeneoAmGZTIwbLf3Pl8VaGKKSSv_9v-RNIgjJ_kKNI=s4800-w800",
      description: "Indian cuisine in a casual dining setting.",
      area: "east",
      tag: "CASUAL DINING",
      address: "12 Kallang Avenue, #02-11, Aperia Mall, Singapore 339511",
      phone: "+65 8424 2182",
      hours: "Monday-Friday & Sunday: 10 am-9 pm, Saturday: Closed",
      website: "http://www.myspiceaffair.com/",
    },
    {
      id: "kebabchi-biryani",
      name: "Kebabchi Biryani",
      rating: 4.6,
      reviews: 476,
      location: "Bedok Mall",
      tags: ["Indian", "Casual Dining", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqG0fOQSnmcOhhIZoojy2xbZAAESQYAAOXAZTaX4StnP93wl8Sjv-ifRvsQTRQS-bjYbcaRAKGkhBCRK7cEGIK3sM7l2l9DSvSE=s4800-w800",
      description:
        "Indian restaurant specializing in biryani and other authentic dishes.",
      area: "east",
      tag: "BIRYANI SPECIALIST",
      address: "311 New Upper Changi Rd, #01-12 Bedok Mall, Singapore 467360",
      phone: "+65 8950 0087",
      hours: "Monday to Sunday: 10 am-10 pm",
      website: "http://www.kebabchibiryani.com/",
    },
    {
      id: "the-original-vadai",
      name: "The Original Vadai",
      rating: 2.6,
      reviews: 25,
      location: "Jewel Changi Airport",
      tags: ["Indian", "Snacks", "Quick Bites"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDw-Ltg2FVNhX1h2r7hH8JDEINbz59nKWcGNdcwyuksgM7REHuUhuImgkJC7Gs4iO001qaqQrHOYMABMuC8YHIJfDoCWKxNIPje9Xu4mTiHdY9ZMoyBAuDpqnZsCXj5iRcUtXGoPOx43CwsFLdr40oBuiA=s4800-w800",
      description: "Stall specializing in vadai, a popular South Indian snack.",
      area: "east",
      tag: "SNACKS",
      address:
        "78 Airport Boulevard, #B2-267, Jewel, 78 Airport Blvd., #B2-267 Singapore Changi Airport, 819666",
      phone: "+65 8588 4181",
      hours: "Monday-Thursday: 9 am-10 pm, Friday-Sunday: 9 am-11 pm",
      website:
        "https://deliveroo.com.sg/menu/singapore/sg-changi-airport/the-original-vadai-jewel",
    }
  ],
  deals: [
    {
      id: "deal1",
      badge: "20% OFF",
      title: "20% OFF Weekend Dinner at Punjab Grill",
      duration: "Valid till: 30 May 2025",
      description:
        "Enjoy 20% off all dinner menu items at Punjab Grill. Valid for dine-in only, Friday to Sunday.",
      code: "PUNJAB20",
    },
    {
      id: "deal2",
      badge: "1-FOR-1",
      title: "1-for-1 Tandoori Platter at Kebabchi Charcoal BBQ",
      duration: "Valid till: 15 Jun 2025",
      description:
        "Buy one tandoori platter and get one free at Kebabchi Charcoal BBQ. Second platter must be of equal or lesser value.",
      code: "KEBAB121",
    },
    {
      id: "deal3",
      badge: "FREE",
      title: "Free Naan with Any Curry at Turkish Lezzet House",
      duration: "Valid till: 20 May 2025",
      description:
        "Enjoy a complimentary naan bread with any curry ordered at Turkish Lezzet House. Dine-in only.",
      code: "FREENAAN",
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
      name: "European",
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
      url: "/cuisine/european",
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
