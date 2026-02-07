import type { CuisineData } from "./types";

export const THAI_CUISINE: CuisineData = {
  slug: "thai",
  name: "Thai",
  tagline:
    "From spicy Tom Yum to delicious Pad Thai, find the best Thai food near you",
  features: [
    { label: "Tom Yum" },
    { label: "Pad Thai" },
    { label: "Green Curry" },
    { label: "Som Tum" },
    { label: "Mango Sticky Rice" }
  ],
  heroImages: [
    "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    "https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  ],
  stats: {
    restaurants: 19,
    menuItems: "300+",
    deals: 3,
    malls: 9,
  },
  restaurants: [
    {
      id: "a-roy-thai-restaurant",
      name: "A-Roy Thai Restaurant",
      rating: 4.1,
      reviews: 721,
      location: "Novena Square",
      tags: ["Thai", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwZjvkq1GfULHbn_r-LSG_WaqvahdEiBTdxAmR9lMs5LZkZjq0ZyBhJO6ymVEhzXYGSPC0QR-lGlphErn9_mV5Mw8Ks8V8iMTMJbD4f74h28toAeudkmKbotIkOP0RE6Po9RD4MwKuSKGmp0Sc=s4800-w800",
      description: "Authentic Thai cuisine in a casual dining setting.",
      area: "central",
      tag: "AUTHENTIC",
      address: "Thomson Rd, 238号Novena Square#03-61/64, Singapore 307683",
      phone: "+65 6338 3880",
      hours: "Monday to Sunday 11 am-3 pm, 5-9:30 pm",
      website: "https://www.aroythai.com.sg",
    },
    {
      id: "sanook-kitchen-vivocity",
      name: "Sanook Kitchen",
      rating: 4.5,
      reviews: 581,
      location: "VivoCity",
      tags: ["Thai", "Casual Dining", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDziVslKD9fJku3doQel6rPvReo-gUn577WGnJHNbaOi5pDT5zUei_yhH57YwYMUB1czBiS2hdPgIBpjDA_AKXkV_PJnWJG-ZdMwbeHW7xdNI_9ETnEW6y2fYtHLnxyI7egh3O3E9fWCGPtAGg=s4800-w800",
      description:
        "Vibrant Thai dining experience offering classic dishes with authentic flavors.",
      area: "south",
      tag: "FAMILY FRIENDLY",
      address: "1 HarbourFront Walk, B2-23C VivoCity, Singapore 098585",
      phone: "62522723",
      hours: "Monday-Sunday: 11 am-9:30 pm",
    },
    {
      id: "sanook-kitchen-suntec-city",
      name: "Sanook Kitchen - Suntec City",
      rating: 4.5,
      reviews: 1317,
      location: "Suntec City",
      tags: ["Thai", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxhx7F2eIjjCGNvutT6PGs92HI4LYUmYM6rfxFwAYYCcx3rXupH9uwx4INhlikzN95WU5v-eaNOfxIIRXfvIk-g1iDPNYwJe2kOybkXPo9LH4RtsByZA_2xoA3kgoWmc0nkSfCv6FIfhRErJdAFLNl8Og=s4800-w800",
      description:
        "Popular Thai restaurant offering a wide range of authentic dishes in a modern setting.",
      area: "central",
      tag: "POPULAR",
      address: "3 Temasek Blvd, #B1-134, Singapore 038983",
      phone: "+65 6261 2097",
      hours: "Monday to Sunday 11 am-10 pm",
      website: "https://www.sanookkitchen.com.sg",
    },
    {
      id: "thai-accent",
      name: "Thai Accent",
      rating: 4.2,
      reviews: 808,
      location: "VivoCity",
      tags: ["Thai", "Casual Dining", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFR_b6TkrIX968sCgAbJAaIHj1hJjSZUoJnEEKVK79k9sod4UwEebeDsSRC8ZmxnbSHtzPEpcUrm3e3ayXGOfR69V8voqCxKRw=s4800-w800",
      description:
        "Upscale Thai dining with a focus on authentic flavors and elegant presentation.",
      area: "south",
      tag: "UPSCALE",
      address: "1 HarbourFront Walk, #02-143 VivoCity, Singapore 098585",
      phone: "63769282",
      hours:
        "Monday-Thursday, Sunday: 11:30 am-9 pm, Friday-Saturday: 11:30 am-9:30 pm",
    },
    {
      id: "bali-thai-suntec-city",
      name: "Bali Thai (Suntec City)",
      rating: 4.2,
      reviews: 678,
      location: "Suntec City",
      tags: ["Thai", "Indonesian", "Fusion"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHLWXJGRw0J6MvNS7TMxQNia-QFfyE0zl7Jr4m1GOFmpKIlZlnuuG28ULpKxNSMYGHM2a09d_AK0tJFZ0hhtopj52DA-L4Q1qc=s4800-w800",
      description:
        "Fusion restaurant offering both Thai and Indonesian cuisines with a modern twist.",
      area: "central",
      tag: "FUSION",
      address: "3 Temasek Blvd, Tower 5 #B1-121A 121B, Singapore 038983",
      phone: "+65 6338 2066",
      hours: "Monday to Sunday 11:30 am-10 pm",
      website: "https://www.balithai.com.sg",
    },
    {
      id: "go-ang-pratunam-chicken-rice-vivocity",
      name: "Go-Ang Pratunam Chicken Rice",
      rating: 4.6,
      reviews: 2439,
      location: "VivoCity",
      tags: ["Thai", "Chicken Rice", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwgjYavJn2O5hoO29SJlHofd91Dxusday1sQAT8AsKjbRAe4zWzeUHRBCtvA1tDu1s4pol9Uu9g5yFlsqd-7AdLiIZkTj-gjEXYnIejXt5VwFrJExo9I5tpUOOX27rx6aS3n7bvGAlaascQNsM5mgYF3A=s4800-w800",
      description:
        "Famous Thai chicken rice restaurant from Bangkok, known for its tender chicken and flavorful rice.",
      area: "south",
      tag: "MICHELIN",
      address: "1 HarbourFront Walk, #B2-30 VivoCity, Singapore 098585",
      phone: "62721912",
      hours: "Monday-Sunday: 11 am-10 pm",
    },
    {
      id: "hana-k-food",
      name: "Hana K-Food",
      rating: 4.1,
      reviews: 286,
      location: "Novena Square",
      tags: ["Korean", "Thai-inspired", "Fusion"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxBtPQpvTCfHURuKNx7HWJBhSCjvzs97_4jaz52wKtW56aUt1BVvPHXqjK7jFX1mFuCsrn9A3XlHobWiIqxA8BYW1WnmmteIq0o8rm4lG_A_brz9g-TH7Zbg_olOjNdbPdG25fFryOhKhMwdA=s4800-w800",
      description:
        "Korean food with Thai influences, offering a unique fusion dining experience.",
      area: "central",
      tag: "FUSION",
      address:
        "#02-25 Velocity @ Novena Square, 238 Thomson Rd, Singapore 307683",
      phone: "+65 6256 0873",
      hours: "Monday to Sunday 10 am-9:30 pm",
      website: "https://www.hanakfood.com",
    },
    {
      id: "sanook-kitchen-jewel",
      name: "Sanook Kitchen",
      rating: 4.6,
      reviews: 1526,
      location: "Jewel Changi Airport",
      tags: ["Thai", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDw8l-ar-XuTuHMyRfjKmwROeuMlLikvj_WeSYv87jx0DNZ47I2hbbDCMM76Wa0p1Z7uVqMmcn5NAvH8MrO6lervM4GjQZdIKGE46Kk83-WKAahhQ9TYgP8DcYWlEjgzr5wPrhCm5H0cwEkOGw=s4800-w800",
      description:
        "Popular Thai restaurant offering a wide range of authentic dishes in a modern setting.",
      area: "east",
      tag: "POPULAR",
      address:
        "Singapore Changi Airport, 78 Airport Blvd., #03-223 224 Jewel, 819666",
      phone: "62420722",
      hours: "Monday-Sunday: 11 am-9:30 pm",
      website: "https://sanookkitchen.com.sg/",
    },
    {
      id: "bali-thai-imm",
      name: "Bali Thai",
      rating: 4.1,
      reviews: 1118,
      location: "IMM",
      tags: ["Thai", "Indonesian", "Fusion"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFClYdCu98f_pWS04Y-nHBG0T6MqpUNwQGtkrdOHsz8sOKmlIyp0lqr-hbVOMVOWxQeaJBQm-UcKZi0f19bLkqiqx0lCBdoV9U=s4800-w800",
      description:
        "Fusion restaurant offering both Thai and Indonesian cuisines with a modern twist.",
      area: "west",
      tag: "FUSION",
      address: "2 Jurong East Street 21, #01 - 21, Singapore 609601",
      phone: "65605660",
      hours: "Monday-Sunday: 11:30 am-10 pm",
    },
    {
      id: "bali-thai-causeway-point",
      name: "Bali Thai",
      rating: 4.1,
      reviews: 589,
      location: "Causeway Point",
      tags: ["Thai", "Indonesian", "Fusion"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFMINpc_C6Ookn_CDCZvoTyv2RJ884DMeEwWPsqGz-rUQ6djMoA0H7of7rNIi0sCik7tEkGRF9J7d2e_oqAbtx-s3exFtFEUEc=s4800-w800",
      description:
        "Fusion restaurant offering both Thai and Indonesian cuisines with a modern twist.",
      area: "north",
      tag: "FUSION",
      address: "1 Woodlands Square, #05-05, Singapore 738099",
      phone: "68941363",
      hours: "Monday-Sunday: 11:30 am-10 pm",
      website: "https://balithai.com.sg/",
    },
    {
      id: "go-ang-pratunam-chicken-rice-nex",
      name: "Go-Ang Pratunam Chicken Rice",
      rating: 4.6,
      reviews: 3559,
      location: "NEX",
      tags: ["Thai", "Chicken Rice", "Quick Bites"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDziGmVSA25CYgzBkHtGyRTQg_ejX4vbhzgWAvxqcdUPV7HQmHGMAxgwCwUcd_ay1t7QaqFQpVN3aq99qHNKfLmAFGy5U04luGJJBrpoLLjOedRdLRyNkI2OQ5i5FPdo3FKhz7tJS33j_Ee2YA=s4800-w800",
      description:
        "Famous Thai chicken rice restaurant from Bangkok, known for its tender chicken and flavorful rice.",
      area: "north-east",
      tag: "POPULAR",
      address: "23 Serangoon Central, #B1-05/06, Singapore 556083",
      phone: "65099980",
      hours: "Monday to Sunday: 11 am-10 pm",
      website: "https://bit.ly/GASelfCollect",
    },
    {
      id: "go-ang-pratunam-chicken-rice-jem",
      name: "Go-Ang Pratunam Chicken Rice",
      rating: 4.6,
      reviews: 1665,
      location: "JEM",
      tags: ["Thai", "Chicken Rice", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxcSqqlIgpRYReUBU8wnQC5_GkF85PPQmgxz1B3q08eFYM7jeI3CNLUMgZvGEm03GmIh6kkYvpoKxpr0uB9-lTFShirj8dfhQT_oT6II59OqD6FEh_MAT1_F3lEfgWbOHg-icmj6P9daj38S6g=s4800-w800",
      description:
        "Famous Thai chicken rice restaurant from Bangkok, known for its tender chicken and flavorful rice.",
      area: "west",
      tag: "POPULAR",
      address: "50 Jurong Gateway Rd, #B1 - 08 Jem, Singapore 608549",
      phone: "66941504",
      hours: "Monday-Sunday: 11 am-10 pm",
    },
    {
      id: "tuk-tuk-cha-treasures-nex",
      name: "Tuk Tuk Cha Treasures @ NEX",
      rating: 3.9,
      reviews: 296,
      location: "NEX",
      tags: ["Thai", "Cafe", "Quick Bites"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyS7BiTKHLUxL_bTIlTStlIUT-260MOR9f6AnVUP3sLRc7LXS3aZjZt-ennAhHeg_bHH2RatL6MDxbHpqEsm-aeQKvIYhVhnxWpjoNwKc-Ol444QngtSfFfYfTLMQcQrj4u7emV0tP77PmLJzE=s4800-w800",
      description:
        "Thai-inspired cafe specializing in tea and snacks in a casual setting.",
      area: "north-east",
      tag: "QUICK BITES",
      address: "23 Serangoon Central, #02-12 NEX, Singapore 556083",
      phone: "66342254",
      hours: "Monday to Sunday: 11 am-10 pm",
    },
    {
      id: "saap-saap-thai-imm",
      name: "Saap Saap Thai",
      rating: 2.8,
      reviews: 139,
      location: "IMM",
      tags: ["Thai", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFTLFqx4t1A2dUZIcIeLXCmyZ8ROVESicgQXQ9C5AB8dhVDGwJPs-MB_NySFctcf3AIF5-aqOmwXL6TwVcYkppopyy7GE_G42M=s4800-w800",
      description:
        "Casual Thai eatery offering authentic Thai street food favorites.",
      area: "west",
      tag: "CASUAL",
      address: "2, 01-48 Jurong East Street 21, 609601",
      phone: "65601108",
      hours:
        "Monday-Thursday & Sunday: 11 am-9 pm, Friday-Saturday: 11 am-9:30 pm",
    },
    {
      id: "saap-saap-thai-bedok-mall",
      name: "Saap Saap Thai",
      rating: 3.2,
      reviews: 70,
      location: "Bedok Mall",
      tags: ["Thai", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxRTEwGyRgTC-t3fn9F-lXTHQSQ8tl-JPfM6l_JDw15v6Uq-N1DjRjC_DmCo1Wavzm1uRTFQZgPwIQNPJgWG02bi6Xbm3EiqIw45iOz4X4tVm6p359CsNhzHxEsuvGoE-JAjkEPqKyurqkn9w=s4800-w800",
      description:
        "Casual Thai eatery offering authentic Thai street food favorites.",
      area: "east",
      tag: "CASUAL",
      address: "311 New Upper Changi Rd, B1-39, Singapore 467360",
      phone: "Not available",
      hours:
        "Monday to Thursday: 11 am-9 pm, Friday to Saturday: 11 am-9:30 pm, Sunday: 11 am-9 pm",
      website: "https://www.saapsaapthai.sg/",
    },
    {
      id: "nana-original-thai-food-aperia",
      name: "Nana Original Thai Food Aperia Mall",
      rating: 3.3,
      reviews: 256,
      location: "Aperia Mall",
      tags: ["Thai", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGU5rVmvze87PvfNJkTEQYm9LvESbA90jZPb_xsDU4B-rwqoOPursp_l-Uqv9_ZfarM92Ifuj3K-3M-R7vRxI30x_ItaNSoUbo=s4800-w800",
      description:
        "Authentic Thai restaurant serving traditional dishes in a casual setting.",
      area: "central",
      tag: "AUTHENTIC",
      address: "12 Kallang Ave, Aperia Mall, #01 53A, 339511",
      phone: "85035580",
      hours: "Monday-Sunday: 11 am-5 am",
    },
    {
      id: "lai-makan-thai-food",
      name: "Lai Makan (Thai Food)",
      rating: 4.1,
      reviews: 17,
      location: "Aperia Mall",
      tags: ["Thai", "Quick Bites"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxS9Dd4qM7BpE2cu3bMC9I6rwyRGgVOxPClSaV5o5r01CAgH24Yjz4TceK5-TZwTToPapeGfNZ1Sq6PyTHlp5zIulWnxcAqCy2rP_Rq_A_KbikF7CT0KKGeBp3qof0ow76Dj0tLNIvnXhcfCQ=s4800-w800",
      description:
        "Cozy eatery serving authentic Thai cuisine in a casual setting.",
      area: "central",
      tag: "AUTHENTIC",
      address: "12 Kallang Ave, #01-42A, Singapore 339509",
      phone: "96827824",
      hours:
        "Monday-Tuesday & Thursday-Friday: 7 am-8 pm, Wednesday: 7:30 am-8 pm, Saturday: 10:30 am-4:30 pm, Sunday: Closed",
      website: "http://www.orchidthai.com.sg/",
    }
  ],
  deals: [
    {
      id: "deal1",
      badge: "20% OFF",
      title: "20% OFF Weekend Dinner at A-Roy Thai Restaurant",
      duration: "Valid till: 30 May 2025",
      description:
        "Enjoy 20% off all dinner menu items at A-Roy Thai Restaurant. Valid for dine-in only, Friday to Sunday.",
      code: "AROY20",
    },
    {
      id: "deal2",
      badge: "1-FOR-1",
      title: "1-for-1 Tom Yum Soup at Sanook Kitchen",
      duration: "Valid till: 15 Jun 2025",
      description:
        "Buy one Tom Yum Soup and get one free at Sanook Kitchen. Second soup must be of equal or lesser value.",
      code: "TOMYUM121",
    },
    {
      id: "deal3",
      badge: "FREE",
      title: "Free Thai Milk Tea with Any Main Course at Bali Thai",
      duration: "Valid till: 20 May 2025",
      description:
        "Enjoy a complimentary Thai Milk Tea with any main course ordered at Bali Thai. Dine-in only.",
      code: "FREETEA",
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
      name: "Chinese",
      image:
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      url: "/cuisine/chinese",
    },
    {
      name: "Indian",
      image:
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1371&q=80",
      url: "/cuisine/indian",
    },
    {
      name: "European",
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      url: "/cuisine/european",
    },
    {
      name: "Korean",
      image:
        "https://images.unsplash.com/photo-1590301157890-4810ed352733?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      url: "/cuisine/korean",
    }
  ],
};
