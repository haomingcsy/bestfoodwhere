import type { CuisineData } from "./types";

export const VIETNAMESE_CUISINE: CuisineData = {
  slug: "vietnamese",
  name: "Vietnamese",
  tagline: "From pho to banh mi, find the best Vietnamese food near you",
  features: [
    { label: "Pho" },
    { label: "Banh Mi" },
    { label: "Rice Paper Rolls" },
    { label: "Bun Cha" },
    { label: "Coffee" }
  ],
  heroImages: [
    "https://images.unsplash.com/photo-1503764654157-72d979d9af2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    "https://images.unsplash.com/photo-1552611052-33e04de081de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1364&q=80",
    "https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1376&q=80"
  ],
  stats: {
    restaurants: 7,
    menuItems: "250+",
    deals: 3,
    malls: 5,
  },
  restaurants: [
    {
      id: "co-chung-vietnamese-restaurant",
      name: "Co Chung Vietnamese Restaurant",
      rating: 4.5,
      reviews: 2933,
      location: "Plaza Singapura",
      tags: ["Vietnamese", "Casual Dining", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHUTi1xfMWO3QX-V7Ts7N6YrrQoApYnpjSYpGeAWxXatYNY6HcZ42IioZ5UeHid_eMDzriXRnjUV9TXRgcpB4cr1YqhxdeMxsQ=s4800-w800",
      description:
        "Authentic Vietnamese restaurant serving hearty noodle soups and traditional street food in a casual setting.",
      area: "south",
      tag: "AUTHENTIC",
      address: "68 Orchard Rd, #B2-20, Singapore 238839",
      phone: "88378137",
      hours: "Monday to Sunday 11 am–10 pm",
      website: undefined,
    },
    {
      id: "so-pho-marina-bay-sands",
      name: "So Pho Marina Bay Sands",
      rating: 4.5,
      reviews: 1177,
      location: "Marina Bay Sands",
      tags: ["Vietnamese", "Casual Dining"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipNQwOs3iHz4MgBiz4CTPnkQ2nrwsr9oUuCJqiJZ=w114-h86-k-no",
      description:
        "Authentic Vietnamese restaurant offering a range of traditional dishes from pho to banh mi in a relaxed setting.",
      area: "south",
      tag: "AFFORDABLE",
      address: "2 Bayfront Ave, #L1 - 03 / 04, Singapore 018972",
      phone: "+65 6688 7044",
      hours: "Monday to Sunday 11 am–10 pm",
      website: "https://sopho.com.sg",
    },
    {
      id: "paper-rice-plaza-singapura",
      name: "Paper Rice @ Plaza Singapura",
      rating: 4.5,
      reviews: 4445,
      location: "Plaza Singapura",
      tags: ["Vietnamese", "Casual Dining", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDx-LSDRRuqI-C1D16J6rWPIyXd1xIFKPC3bL6HRvHdwtuNFPd1_Kc2IjIsn8_ppkZ955ZxLVQv10COtu_yCW378lQYH9H_7UKubKYTA-b5_w0TdRhgnKREYuhs_qb8mFFMEuE0Y_8xlOVaq-PSr2fcp2A=s4800-w800",
      description:
        "Modern Vietnamese restaurant with a focus on rice paper rolls and other traditional Vietnamese street food.",
      area: "south",
      tag: "TRENDING",
      address: "68 Orchard Rd, #01-55, Singapore 238839",
      phone: "90173147",
      hours: "Monday to Sunday 11 am–10 pm",
      website: "https://paperrice.com.sg/",
    }
  ],
  deals: [
    {
      id: "deal1",
      badge: "20% OFF",
      title: "20% OFF All Pho Bowls at So Pho (VivoCity)",
      duration: "Valid till: 25 May 2025",
      description:
        "Enjoy 20% off all pho bowls at So Pho VivoCity. Valid for dine-in only, Monday to Thursday.",
      code: "PHO20",
    },
    {
      id: "deal2",
      badge: "1-FOR-1",
      title: "1-for-1 Spring Rolls at Paper Rice (Plaza Singapura)",
      duration: "Valid till: 10 Jun 2025",
      description:
        "Buy one order of spring rolls and get one free at Paper Rice, Plaza Singapura. Second order must be of equal or lesser value.",
      code: "ROLL121",
    },
    {
      id: "deal3",
      badge: "FREE",
      title: "Free Vietnamese Coffee with Any Main Course at Mrs Pho",
      duration: "Valid till: 15 May 2025",
      description:
        "Enjoy a complimentary Vietnamese coffee with any main course ordered at Mrs Pho VivoCity.",
      code: "FREECOFFEE",
    }
  ],
  otherCuisines: [
    {
      name: "Japanese",
      image:
        "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      url: "/cuisine/japanese",
    },
    {
      name: "Korean",
      image:
        "https://images.unsplash.com/photo-1590301157890-4810ed352733?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      url: "/cuisine/korean",
    },
    {
      name: "Chinese",
      image:
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      url: "/cuisine/chinese",
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
    }
  ],
};
