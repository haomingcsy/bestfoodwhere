import type { CuisineData } from "./types";

export const FOOD_COURT_CUISINE: CuisineData = {
  slug: "food-court",
  name: "Food Court",
  tagline:
    "Discover the best food courts around the city offering a variety of local and international delights",
  features: [
    { label: "Local Cuisine" },
    { label: "International Food" },
    { label: "Affordable Meals" },
    { label: "Quick Service" },
    { label: "Family Friendly" },
  ],
  heroImages: [
    "https://lh3.googleusercontent.com/places/ANXAkqH7Kg5MfmyKDXyoUnpDHCXPzuGDTX5272HVXByY9ysRaY9NKDXeyGWEMgQlFzLDix83z7PRAMXWPKe-emfd3CRyn4yeeC6Tu_A=s4800-w800",
    "https://lh3.googleusercontent.com/places/ANXAkqEmgCBM8K3WYSuuicLq-YE6d7E8RAb4tuieyutmwlninsnKsvi_8VRmjqFQNE6uItSgaiVFqfA4J8hd7Es02oNagp-rLOLqCQ=s4800-w800",
    "https://lh3.googleusercontent.com/place-photos/AEkURDz42Ch0QPdp_TlYPo14gh49qS8lBLXn9WehyQvS6kYIbiI2-iDKmlIIQGwxC4IQeCGTXeWYTrMcuiKgrtLZRTqIye7EoioA-sjswV-h8Ncbc0ZdK2G77ns5uRAS_iie-mLZFm5MSFGE8wiodH0m-m_KwQ=s4800-w800",
  ],
  stats: {
    restaurants: 14,
    menuItems: "100+",
    deals: 3,
    malls: 10,
  },
  restaurants: [
    {
      id: "food-republic-suntec",
      name: "Food Republic",
      rating: 3.9,
      reviews: 1620,
      location: "Suntec City",
      tags: ["Food Court", "Local Cuisine", "International Food"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipOm-8jQojzVGkrnROW6faIdZUsHmVAHJ3sWAJMW=w129-h86-k-no",
      description:
        "Modern food court offering a variety of local and international cuisines in a comfortable air-conditioned setting.",
      area: "central",
      tag: "POPULAR",
      address: "3 Temasek Blvd, #B1-115, Singapore 038983",
      phone: "+65 6338 2848",
      hours: "Monday to Sunday 10 am-9 pm",
      website: "https://www.foodrepublic.com.sg",
    },
    {
      id: "rasapura-masters",
      name: "Rasapura Masters",
      rating: 3.9,
      reviews: 2057,
      location: "Marina Bay Sands",
      tags: ["Food Court", "Local Cuisine", "International Food"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxVzilPiwRo5ithE7-KXLsPFrRRoMxEWLfeb2PjTk0_UgvdXr7DCpYmh6hth0imk18Pn_OBQ3Rz11RXwnNybahUe2ZF9KkJkLDCO8VkQ7iza8zMzaaHXANFdcG3bDCaYxCI3lFN5JgToxjb1H95srK3=s4800-w800",
      description:
        "Premium food court located at The Shoppes at Marina Bay Sands offering a wide variety of local and international cuisines.",
      area: "south",
      tag: "PREMIUM",
      address:
        "2 Bayfront Ave, B2-49A/50/51/52/53 The Shoppes at Marina Bay Sands, Singapore 018972",
      phone: "+65 6688 7300",
      hours:
        "Monday to Thursday 8 am-10 pm, Friday to Saturday 8 am-11 pm, Sunday 8 am-10 pm",
      website:
        "https://www.marinabaysands.com/restaurants/rasapuramasters.html",
    },
    {
      id: "food-republic-vivocity",
      name: "Food Republic @ VivoCity",
      rating: 4.2,
      reviews: 5531,
      location: "VivoCity",
      tags: ["Food Court", "Local Cuisine", "International Food"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipNq_QyBNYvK3dfEyEitR0vAuvT34yrdgycZoT8=w446-h240-k-no",
      description:
        "Spacious food court featuring a variety of local and international cuisines with stunning waterfront views.",
      area: "south",
      tag: "WATERFRONT",
      address: "1 HarbourFront Walk, #03 - 01, Singapore 098585",
      phone: "62760521",
      hours: "Monday to Sunday 10 am-10 pm",
      website: "http://foodrepublic.com.sg/",
    },
    {
      id: "kopitiam-vivocity",
      name: "Kopitiam @ VivoCity",
      rating: 4.0,
      reviews: 3708,
      location: "VivoCity",
      tags: ["Food Court", "Local Cuisine", "Quick Bites"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipPI1V42KA12dcAvMrfS6GyjcVoZMuZ6SY5vFjko=w408-h544-k-no",
      description:
        "Popular food court offering a wide range of affordable local dishes and international cuisine in a casual setting.",
      area: "south",
      tag: "AFFORDABLE",
      address: "1 HarbourFront Walk, B2-39 VivoCity, Singapore 098585",
      phone: "63769865",
      hours: "Monday to Sunday 7 am-10 pm",
      website: "https://www.kopitiam.biz/",
    },
    {
      id: "food-junction-junction8",
      name: "Food Junction - Junction 8",
      rating: 3.7,
      reviews: 1248,
      location: "Junction 8",
      tags: ["Food Court", "Local Cuisine", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxPoFRl5kk676RG5wgmm8C4BvlyeVUX6R3hpfHhHRBTECk5lkvHagMLio_QQdyaG3GqtsKCDXprxNB3a6IIXaD3IJ1FdwVAmTYK6ljlWzouTuLP6cBSt63Np2a1X2lNVj2YeqFo2M0eyzlEwg=s4800-w800",
      description:
        "Modern food court offering a wide selection of local and international cuisines in a comfortable environment.",
      area: "north",
      tag: "FAMILY FRIENDLY",
      address: "9 Bishan Pl, #04-01 Junction 8, Singapore 579837",
      phone: "63536797",
      hours: "Monday to Sunday 10 am-10 pm",
      website: "http://www.foodjunction.com/",
    },
    {
      id: "kopitiam-amk-hub",
      name: "Kopitiam",
      rating: 3.7,
      reviews: 1280,
      location: "AMK Hub",
      tags: ["Food Court", "Local Cuisine", "Quick Bites"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwDykexH5c8i2v1U4wKtgM7DNKDGFBI_3bYl5YNL3HyDGpF_TDSAzG2CdmCJKJOACRELmvRxqaoSqUOklyLn6vnPzX8spV_WBCdzDu0yvGdFcZ493dDHDldyCzD1CzXqjSRDM9ehZ-pbtqFDkA=s4800-w800",
      description:
        "Busy food court offering a diverse range of affordable local dishes and international cuisine in a casual setting.",
      area: "north",
      tag: "QUICK BITES",
      address: "53 Ang Mo Kio Ave 3, #03-12 AMK Hub, Singapore 569933",
      phone: "65506500",
      hours: "Monday to Sunday 8 am-10 pm",
      website: "https://www.kopitiam.biz/",
    },
    {
      id: "food-dynasty-united-square",
      name: "Food Dynasty @ United Square",
      rating: 2.2,
      reviews: 95,
      location: "United Square",
      tags: ["Food Court", "Local Cuisine", "Quick Bites"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqF3qR2AtedzzFRRJZ0USFx-O4vEWhbP4VMjeseSy9DJFAfP7q8B1poEyZl4fu4R4vQVigB7lphuDWF6XCs4ah7Pv6Iu2D9GwPM=s4800-w800",
      description:
        "Food court offering a variety of local and Asian dishes in a casual mall setting with affordable options.",
      area: "central",
      tag: "BUDGET",
      address:
        "101 Thomson Rd, B1-02 United Square Shopping Mall, Singapore 307591",
      phone: "Not available",
      hours: "Monday to Sunday 8:30 am-9 pm",
      website: "https://fooddynasty.sg/",
    },
    {
      id: "food-republic-causeway-point",
      name: "Food Republic @ Causeway Point",
      rating: 3.8,
      reviews: 1499,
      location: "Causeway Point",
      tags: ["Food Court", "Local Cuisine", "International Food"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGkYlyp3vmzWBQVThaNAAFQUkk5q2EGjvJZhMaoU2j8rEAe4NECJuE-DjmpruEFTqyTUIJYqylU0eP-RUOEMn1ef-mjI8hIHA8=s4800-w530",
      description:
        "Modern food court offering a variety of local and international cuisines in a comfortable setting at Causeway Point mall.",
      area: "north",
      tag: "POPULAR",
      address: "1 Woodlands Square, #04-01/02/03/04, Singapore 738099",
      phone: "68911021",
      hours: "Monday to Sunday 10 am-10 pm",
      website: "https://foodrepublic.com.sg/",
    },
    {
      id: "food-republic-nex",
      name: "Food Republic @ NEX",
      rating: 3.6,
      reviews: 1112,
      location: "NEX",
      tags: ["Food Court", "Local Cuisine", "International Food"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHohMfoMsdzYq-ZsV8HXSKlCKAtpXi0TD7zh3wkj7Q7rYnmfybE3ZRirhj81hKy7Wf_zWEjBwVtT292YtFwM7HI0bQYwwNEIA=s4800-w800",
      description:
        "Modern food court featuring a variety of local and international cuisines in NEX mall.",
      area: "north",
      tag: "POPULAR",
      address: "23 Serangoon Central, #B2 - 63 to 66, Singapore 556083",
      phone: "68343126",
      hours: "Monday to Sunday 10 am-10 pm",
      website: "http://foodrepublic.com.sg/",
    },
    {
      id: "food-junction-nex",
      name: "Food Junction",
      rating: 3.8,
      reviews: 1300,
      location: "NEX",
      tags: ["Food Court", "Local Cuisine", "International Food"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDx6n74WeFyZ0UApSHfcbJ4n3FLZlwv8eoiPtacbZDiehIEjd_7owxmfa_01u79UejcwOX1BHEFuO81mNM6f0ICRfm3v47sf0bi1r9mK_72gUdmUmXEqJOUQy9rbwoZjEQ0fUb6p73ey33AvvLjHXty2xQ=s4800-w800",
      description:
        "Popular food court offering a wide range of local and international cuisines in a convenient mall location.",
      area: "north",
      tag: "FAMILY FRIENDLY",
      address: "23 Serangoon Central, #04-36/37 NEX, Singapore 556083",
      phone: "66344358",
      hours: "Not available",
      website: "https://www.foodjunction.com/",
    },
    {
      id: "kopitiam-food-hall-jem",
      name: "Kopitiam Food Hall",
      rating: 3.6,
      reviews: 858,
      location: "JEM",
      tags: ["Food Court", "Local Cuisine", "Quick Bites"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzBD4sb6GuVu82rNvDREGpJEQ4RlHiAo_t8nzfmMIOGet-5I3IFq4w0Sw8NklRbdPa0VNe7R4frgk6nItcJaSreUxKP6FBhJbktw1Ao2N5qt8q9mJT45Es39C5no237KIQi_CpjOTgI62ShE-E=s4800-w800",
      description:
        "Popular food court offering a wide range of affordable local dishes and international cuisine in a casual setting.",
      area: "west",
      tag: "AFFORDABLE",
      address: "50 Jurong Gateway Rd, #05 - 01 JEM, Singapore 608549",
      phone: "Not available",
      hours: "Monday to Sunday 8:30 am-10 pm",
      website: "Not available",
    },
    {
      id: "cantine-kopitiam-causeway-point",
      name: "Cantine by Kopitiam",
      rating: 3.8,
      reviews: 739,
      location: "Causeway Point",
      tags: ["Food Court", "Local Cuisine", "Quick Bites"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxN8C940o9syFOR7E8jgqTznVLUASKcWnKUrJFY89AymfMRYcxLdJtUjdzIKsW8xjz2pCNlhbjL3PjINh66NmlY67fvT6eBNFgfw_afwDGCrXiZnODH6k8TrQAT32orTAkbQO6AODydm5v_CQ=s4800-w800",
      description:
        "Modern food court offering a diverse range of affordable local dishes and international cuisine in a casual setting.",
      area: "north",
      tag: "QUICK BITES",
      address: "1 Woodlands Square, #07-03 Causeway Point, Singapore 738099",
      phone: "68940919",
      hours: "Monday to Sunday 9 am-10 pm",
      website: "http://www.kopitiam.biz/",
    },
    {
      id: "food-republic-jewel",
      name: "Food Republic",
      rating: 3.5,
      reviews: 416,
      location: "Jewel Changi Airport",
      tags: ["Food Court", "Local Cuisine", "International Food"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDy1zrl_E5Jk-4TSNLgWtlS_zKDLuyNE8BDfZHQhAJmzi-idVq-n7usnTTKpR6OKb7AqNyZ1QRb6-UrrCn-nK9-atTfzhB_7O6gP1G42ulkZxv1v8a1ovmas91Oq6SFFiUW3oncX0cUwYg8AZuPpDkxu=s4800-w800",
      description:
        "Modern food court offering a variety of local and international cuisines in Jewel Changi Airport.",
      area: "east",
      tag: "AIRPORT",
      address: "78 Airport Blvd., basement 2 78, Singapore 819666",
      phone: "65367836",
      hours: "Monday to Friday 7:30 am-10 pm, Saturday to Sunday 7:30 am-11 pm",
      website: "Not available",
    },
    {
      id: "five-spice-jewel",
      name: "Five Spice @ Jewel",
      rating: 3.9,
      reviews: 27,
      location: "Jewel Changi Airport",
      tags: ["Food Court", "Asian", "Local Cuisine"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyI6lhv-Tp3qkt0KGt0DuY0shYELg1-bcFWxKlaO2_5ZCWq_WJF4EIAq5s4gHVUNaIyKSs_aZxcvyWDf1ziBBzmhdsCUdnJDv9LxNKJQXztUDTov-7ECBeRFb8LYFs5AR0v-P4-7J3Iq9iWukg=s4800-w800",
      description:
        "Asian food court offering a variety of local and regional cuisines in Jewel Changi Airport.",
      area: "east",
      tag: "AIRPORT",
      address: "78 Airport Blvd., #B2-238/239, Singapore 819666",
      phone: "67026506",
      hours: "Monday to Sunday 11 am-10 pm",
      website: "https://www.fivespice.com.sg/",
    },
  ],
  deals: [
    {
      id: "deal1",
      badge: "20% OFF",
      title: "20% OFF All Food Stalls at Food Republic (Suntec City)",
      duration: "Valid till: 30 May 2025",
      description:
        "Enjoy 20% off at any food stall in Food Republic Suntec City. Valid for dine-in only, Monday to Thursday.",
      code: "FOOD20",
    },
    {
      id: "deal2",
      badge: "1-FOR-1",
      title: "1-for-1 Drinks at Kopitiam (VivoCity)",
      duration: "Valid till: 15 Jun 2025",
      description:
        "Buy one drink and get one free at any beverage stall in Kopitiam VivoCity. Second drink must be of equal or lesser value.",
      code: "DRINKS121",
    },
    {
      id: "deal3",
      badge: "FREE",
      title: "Free Drink with $10 Spent at Food Junction (Junction 8)",
      duration: "Valid till: 20 May 2025",
      description:
        "Enjoy a complimentary drink with a minimum spend of $10 at any stall in Food Junction Junction 8.",
      code: "FREEDRINK",
    },
  ],
  otherCuisines: [
    {
      name: "Chinese",
      image:
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      url: "/cuisine/chinese",
    },
    {
      name: "Japanese",
      image:
        "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      url: "/cuisine/japanese",
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
      name: "Korean",
      image:
        "https://images.unsplash.com/photo-1590301157890-4810ed352733?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      url: "/cuisine/korean",
    },
  ],
};
