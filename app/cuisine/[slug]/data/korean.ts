import type { CuisineData } from "./types";

export const KOREAN_CUISINE: CuisineData = {
  slug: "korean",
  name: "Korean",
  tagline: "From BBQ to Bibimbap, find the best Korean food near you",
  features: [
    { label: "BBQ" },
    { label: "Bibimbap" },
    { label: "Tteokbokki" },
    { label: "Kimchi" },
    { label: "Bingsu" }
  ],
  heroImages: [
    "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1635363638580-c2809d049eee?auto=format&fit=crop&w=800&q=80"
  ],
  stats: {
    restaurants: 23,
    menuItems: "3,000+",
    deals: 3,
    malls: 9,
  },
  restaurants: [
    {
      id: "4-fingers-crispy-chicken",
      name: "4 Fingers Crispy Chicken",
      rating: 4.1,
      reviews: 587,
      location: "JEM Shopping Mall",
      tags: ["Korean", "Fast Food", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwY5cPANi6K9Rg2P1XnVdAG0M4Lw9qXdmCsdw5bLx5nrSRekCvbz0o6yC6h25155Jc58mzC2lpdxdlCNBRsf5vptDyDLs8wp5x2n1dVnFj5c_OBC-0j1v1_QJV5npPR6ngqgOIwrkTXSiIoSw=s4800-w800",
      description:
        "Korean-inspired fast food restaurant known for their crispy chicken with various savory sauces.",
      area: "west",
      tag: "FASTFOOD",
      address:
        "50 Jurong Gateway Rd, #01-15A JEM Shopping Mall, Singapore 608549",
      phone: "64812357",
      hours: "Monday-Sunday: 11 am-10 pm",
      website: "https://www.4fingers.com.sg/",
    },
    {
      id: "jinjja-chicken-jewel-changi",
      name: "JINJJA Chicken @ Jewel Changi Airport",
      rating: 4.6,
      reviews: 740,
      location: "Jewel Changi Airport",
      tags: ["Korean", "Chicken", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHnHewLkxlGARX_hibPMRQ5zXA-Ee-KmLFNFDHWeI5jjl3F6lIq9xhIRLJktyO7vPWX7X-wMdAyMgkZQOuOLVgnnuOdM9PSpM0=s4800-w800",
      description:
        "Korean fried chicken restaurant with authentic Korean flavors and modern atmosphere.",
      area: "east",
      tag: "CHICKEN",
      address: "78 Airport Blvd., #B1 - 247, Singapore 819666",
      phone: "67861086",
      hours: "Monday-Sunday: 11 am-9:30 pm",
      website: "http://www.jinjjachicken.com/",
    },
    {
      id: "seorae-jib",
      name: "SEORAE JIB",
      rating: 4.6,
      reviews: 2330,
      location: "NEX",
      tags: ["Korean", "BBQ", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyUBDms9F8VHDDt4iE8aXKtz0HThLR6IpMISPhryRog8IhFSbaByHnzdZS5bKxNTddSaE40OgQntOkIO_lWq-aaqSAQuPuGiEM2CDA40pLoU3l8qFM5Um-Qbm2rJDf5lufPJ1VIqYmDxOrwCAWwCLQdeg=s4800-w800",
      description:
        "Authentic Korean BBQ restaurant specializing in premium meat cuts for tabletop grilling.",
      area: "north-east",
      tag: "BBQ",
      address: "23 Serangoon Central, #B1-73/74 NEX, Singapore 556083",
      phone: "93855045",
      hours: "Monday to Sunday: 11:30 am-10 pm",
      website: "https://www.seoraejib.com.sg/menu",
    },
    {
      id: "pohang-seafood-butchery",
      name: "Pohang Seafood & Butchery",
      rating: 4.6,
      reviews: 556,
      location: "Aperia Mall",
      tags: ["Korean", "Seafood", "BBQ"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFWSw-VkZQMLQ2jwWpduDMtl7AxHIvkrGD2PUnJn4z5TsnVMP_pNGADsyC5weXA7gNMhMR7a_R0JckCxDKWF8KaNVqxbWtG3g=s4800-w800",
      description:
        "Korean restaurant specializing in fresh seafood and premium meat selections for BBQ.",
      area: "central",
      tag: "SEAFOOD",
      address: "12 Kallang Avenue, #02-10, Aperia Mall, Singapore 339511",
      phone: "90104781",
      hours:
        "Monday: 11:45 am-3 pm, 5-9:30 pm, Tuesday-Sunday: 11:45 am-3 pm, 5-9:50 pm",
      website: undefined,
    },
    {
      id: "tteok-sang",
      name: "TTEOK SANG",
      rating: 3.6,
      reviews: 79,
      location: "Aperia Mall",
      tags: ["Korean", "Rice Cake", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGslOV0ZnchVXUcge1W4tPD699_EwJ9-XExKOvIP9eJvdKGX-Fghls2Y42s1OLADaNhKfeGt6djpWoN75zkblYF4aq371d3o0Q=s4800-w800",
      description:
        "Specialized Korean restaurant focusing on traditional rice cakes and Korean snacks.",
      area: "central",
      tag: "RICECAKE",
      address: "339511 339511 12 kallang ave Aperia mall #01-37",
      phone: "90859406",
      hours: "Monday-Sunday: 11 am-9 pm",
      website: undefined,
    },
    {
      id: "ha-jun-korean",
      name: "Ha-Jun Korean",
      rating: 3.2,
      reviews: 75,
      location: "Aperia Mall",
      tags: ["Korean", "Casual Dining", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwkqEbLY-GyPP8IRjWC6LCL_nIS7Y4svkhqmQGCEr1HZYb5dr3qKpCGK5MoCRVAZ9q25gB_h1nBt8UF2wnFKbGhuxHkctNxKVX1B4Wih6obmcmSVCsG162oeaYMZL1j3nMiI9_u80NTibjG=s4800-w800",
      description:
        "Casual Korean restaurant serving classic Korean dishes in a family-friendly environment.",
      area: "central",
      tag: "FAMILYFRIENDLY",
      address: "12 Kallang Ave, #01-31A Aperia Mall, Singapore 339509",
      phone: "Not available",
      hours: "Monday-Sunday: 10 am-9 pm",
      website: undefined,
    },
    {
      id: "kko-kko-nara",
      name: "Kko Kko Nara",
      rating: 2.7,
      reviews: 303,
      location: "Jewel",
      tags: ["Korean", "Chicken", "Casual Dining"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipNAfGkKQUNKMF37IHaLiU_dx7imOV4B616pMw-1=w408-h306-k-no",
      description:
        "Korean restaurant specializing in traditional Korean fried chicken and authentic side dishes.",
      area: "east",
      tag: "CHICKEN",
      address: "78 Airport Blvd., #02 - 243, Singapore 819666",
      phone: "62428720",
      hours: "Monday-Sunday: 11 am-9:30 pm",
      website:
        "https://deliveroo.com.sg/menu/singapore/sg-changi-airport/kko-kko-nara-jewel",
    },
    {
      id: "hana-k-food",
      name: "Hana K-Food",
      rating: 4.1,
      reviews: 286,
      location: "Velocity @ Novena Square",
      tags: ["Korean", "BBQ", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxBtPQpvTCfHURuKNx7HWJBhSCjvzs97_4jaz52wKtW56aUt1BVvPHXqjK7jFX1mFuCsrn9A3XlHobWiIqxA8BYW1WnmmteIq0o8rm4lG_A_brz9g-TH7Zbg_olOjNdbPdG25fFryOhKhMwdA=s4800-w800",
      description:
        "Authentic Korean restaurant serving traditional dishes including BBQ, stews, and other Korean favorites.",
      area: "north",
      tag: "AUTHENTIC",
      address:
        "#02-25 Velocity @ Novena Square, 238 Thomson Rd, Singapore 307683",
      phone: "+65 6256 0873",
      hours: "Monday to Sunday 10 am-9:30 pm",
      website: "https://www.hanakfood.com",
    },
    {
      id: "pizza-maru",
      name: "Pizza Maru",
      rating: 4.6,
      reviews: 651,
      location: "Plaza Singapura",
      tags: ["Korean", "Italian", "Pizza"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwi13xKD02BF93R_9zjQodkJ8f2mcpcAHeshBevsakrTp4bL_GKigxVqBLIcL7Uv0cOQ5aKACC9pMcTztEPlo0BWyTe0o43YXwiICVfmf50zM-kYqQcrzzg2ESXfSA5gNOo0WR7vmCylsGz1WN0sw_VWw=s4800-w800",
      description:
        "Korean-style pizza restaurant offering unique fusion dishes combining Korean flavors with Italian pizza.",
      area: "south",
      tag: "FUSION",
      address: "68 Orchard Rd, #04-66, Singapore 238839",
      phone: "62359775",
      hours: "Monday-Sunday: 11:30 am-10 pm",
      website: "https://pizzamaru.sg/",
    },
    {
      id: "nunsaram-korean-dessert-cafe",
      name: "Nunsaram Korean Dessert Cafe",
      rating: 4.7,
      reviews: 396,
      location: "Plaza Singapura",
      tags: ["Korean", "Dessert", "Cafe"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxNETN8T1BEmVyyifTWMYRUQzGaPqD4yLJXl-zlnFUIqJKDkVGiL4bEszYOQE5pIWCcdT9Zc91j4BlvSYn_esonBwgGFaf4v3ppk-IOqdxbYAt3rtn2CqPy4rF1elgQB_U984y3iIuJBLjc=s4800-w798",
      description:
        "Specialized Korean dessert cafe famous for bingsu (Korean shaved ice) and other sweet treats.",
      area: "south",
      tag: "DESSERT",
      address: "68 Orchard Rd, #04-69 A/B, Plaza 238839",
      phone: "Not available",
      hours: "Monday-Sunday: 11 am-10 pm",
      website: "https://www.facebook.com/NunsaramSG/",
    },
    {
      id: "dookki-suntec",
      name: "Dookki",
      rating: 4.2,
      reviews: 873,
      location: "Suntec City",
      tags: ["Korean", "Tteokbokki", "Buffet"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqG9huuN9CLDF_c_SMNdR1Tc3_OhlEDMFtOJgJjdreCwy71m2LuiwQRwih73U1YVr3gG5QQP9sQhNm8oM6Z5AMX54xxv7WHuoNc=s4800-w800",
      description:
        "Self-cooking Korean restaurant specializing in tteokbokki (spicy rice cakes) and other Korean favorites.",
      area: "south",
      tag: "BUFFET",
      address: "3 Temasek Blvd, #B1-107, Singapore 038983",
      phone: "+65 6266 2425",
      hours:
        "Monday to Thursday 11:30 am-10 pm, Friday to Saturday 11:30 am-10:30 pm, Sunday 11:30 am-10 pm",
      website: "https://dookki.com.sg",
    },
    {
      id: "jjan-korean-fusion-bar",
      name: "Jjan Korean Fusion Bar",
      rating: 3.4,
      reviews: 114,
      location: "Suntec City",
      tags: ["Korean", "Fusion", "Bar"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwM8NwQLZnvi_q_A3opL-Z6TKfp65ujXKdy0v49ZP9hKgdgs2eh_DRyZ42bhwAbeiDLwh5VlEDHP4IajCyi6H3ybHPpaNTYSBI-G5wimKvABgYZ6DyROajLxIhwGY8F17Dk4-_oY2GNnHKo1T8=s4800-w800",
      description:
        "Korean fusion bar offering creative Korean-inspired dishes and drinks in a vibrant atmosphere.",
      area: "south",
      tag: "BAR",
      address: "3 Temasek Blvd, #01-606, Singapore 038983",
      phone: "+65 9443 8651",
      hours: "Monday to Thursday 3 pm-12 am, Friday to Saturday 3 pm-3 am",
      website: undefined,
    },
    {
      id: "onggii",
      name: "onggii",
      rating: 4.6,
      reviews: 3206,
      location: "Suntec City",
      tags: ["Korean", "Stew", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHeQv7ZCti6abyCR7bkF3swtgKHr6tkjYq7zRMT-fjIDee0-TJt-bQVXhxum9-A8L-uu2F1jRBGmOObeOct-tpRaVHfJ8CZYNI=s4800-w800",
      description:
        "Popular Korean restaurant specializing in hearty stews and authentic Korean dishes.",
      area: "south",
      tag: "POPULAR",
      address:
        "3 Temasek Blvd, #02-300 Singapore Suntec City, Singapore 038983",
      phone: "+65 8778 8905",
      hours:
        "Monday to Friday 11:30 am-3:30 pm, 5:30-9 pm, Saturday to Sunday 11 am-3 pm, 5-9 pm",
      website: "https://onggii.sg",
    },
    {
      id: "sotpot",
      name: "SOTPOT",
      rating: 4.5,
      reviews: 1768,
      location: "Suntec City",
      tags: ["Korean", "Hotpot", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGunJcVstvMn3W74C9zJBg4qI5M4jmv0tRhCOKlgOodJl__pRlW_F2G27y1DFd8Ms20jyZW3ebPbGoBQBcbiQVWsvo9HTmjhbM=s4800-w800",
      description:
        "Specialized Korean hotpot restaurant offering a variety of soup bases and fresh ingredients.",
      area: "south",
      tag: "HOTPOT",
      address:
        "3 Temasek Boulevard #03-304/305, Sky Garden Suntec City, 038983",
      phone: "+65 8891 5068",
      hours:
        "Monday to Friday 11:30 am-3:30 pm, 5:30-9 pm, Saturday to Sunday 11 am-3 pm, 5-9 pm",
      website: "https://sotpot.com",
    },
    {
      id: "wonderful-bapsang-suntec",
      name: "Wonderful BapSang",
      rating: 4.3,
      reviews: 1104,
      location: "Suntec City",
      tags: ["Korean", "Traditional", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGmeoxj4L0vH-ttU4WG3gnMUDZy6iaIq4zvFoxARpIlMRD30aZpMUgdQPZ9KVEmm8wYSvjbiMDjJnGvLgbut8VQOLwdLM0PjE4=s4800-w800",
      description:
        "Authentic Korean restaurant offering traditional home-style Korean meals with banchan (side dishes).",
      area: "south",
      tag: "TRADITIONAL",
      address: "3 Temasek Blvd, #02-609, Singapore 038983",
      phone: "+65 6732 0974",
      hours:
        "Monday to Friday 11:30 am-3 pm, 5:30-10 pm, Saturday to Sunday 11:30 am-10 pm",
      website: "https://wonderfulbapsang.com.sg",
    },
    {
      id: "paiks-noodle-suntec",
      name: "Paik's Noodle @ Suntec City",
      rating: 4.4,
      reviews: 1648,
      location: "Suntec City",
      tags: ["Korean", "Noodles", "Fast Casual"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyO0ocEufIb6nWRXRvBj5i9j9f7cKY7KwoKEUrTPvrLjgvc55Tw4ooSifJBlC8YuO2tp4AjiMuxq6ByLdfErW_a6m5E8QaKi2tyBVST6t38bCuoAyu9BxJfa1y1E2AM2c6c_Ccw98MFFbie-rc=s4800-w800",
      description:
        "Fast-casual Korean noodle restaurant specializing in jjajangmyeon (black bean noodles) and other noodle dishes.",
      area: "south",
      tag: "NOODLES",
      address: "3 Temasek Blvd, B1-177/177A, Singapore 038983",
      phone: "+65 6027 5863",
      hours: "Monday to Sunday 11 am-9 pm",
      website: "https://paiksnoodle.com.sg",
    },
    {
      id: "im-kim-korean-bbq",
      name: "I'm Kim Korean BBQ & Shabu Shabu",
      rating: 4.6,
      reviews: 1969,
      location: "Pasir Ris",
      tags: ["Korean", "BBQ", "Buffet"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwVS9n-96e5xWEE5E5SrEDHxM7G4eHiicEYPl305p4M_6Zup60qgzseIVSMw3YLDa3SNu1UDStCnalT-IKAQig9XlhH8uWmUAa_Jl5e3HkdHpxzZtqi6fPB8tvAlQ2oVMLh8bp0swbdkCUqlLg=s4800-w800",
      description:
        "Popular Korean BBQ buffet restaurant offering a wide selection of meats and side dishes for unlimited enjoyment.",
      area: "east",
      tag: "BUFFET",
      address: "7 Pasir Ris Central, #01-03, Singapore 519612",
      phone: "80332734",
      hours:
        "Monday to Thursday: 11:30 am-4 pm, 5:30-9:30 pm; Friday: 11:30 am-4 pm, 5:30-10:30 pm; Saturday to Sunday: 11:30 am-4:30 pm, 5-10:30 pm",
      website: "https://kingdomfood.sg/im-kim-korean-bbq-shabu-shabu/",
    },
    {
      id: "k-cook-korean-bbq-buffet",
      name: "K.COOK Korean BBQ Buffet",
      rating: 4.6,
      reviews: 168,
      location: "The Woodleigh Mall",
      tags: ["Korean", "BBQ", "Buffet"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEtcM_B5SoiNUl5AFgFAsj0SG3Wr7NR95njJLOoXr-MVpi80kAqRgK6jEj0Khh_j8gbykrzrkUkY3mkXRddCxNS00JhPk5SeWc=s4800-w800",
      description:
        "All-you-can-eat Korean BBQ buffet restaurant with a wide variety of meats and banchan (side dishes).",
      area: "north-east",
      tag: "BUFFET",
      address: "11 Bidadari Park Drive, Mall, #02-49/50 The Woodleigh, 367803",
      phone: "+65 6322 3392",
      hours:
        "Monday to Thursday 11:30 am-3 pm, 5:30-10 pm, Friday 11:30 am-3 pm, 5-10 pm, Saturday to Sunday 11:30 am-10 pm",
      website: "https://www.facebook.com/kcooksg",
    },
    {
      id: "paiks-bibim-vivocity",
      name: "Paik's Bibim @ Vivo City",
      rating: 3.8,
      reviews: 296,
      location: "Vivo City",
      tags: ["Korean", "Bibimbap", "Fast Casual"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGVmQo1sdy40m35jB1EPIJrFntUYK6jYIzxdLY_0mmD7W_s1N4_hYsajZA5AmubOD-tqoE3TlvlmVgqQlPT43RjG1tE0FITGoM=s4800-w800",
      description:
        "Fast-casual Korean restaurant specializing in bibimbap (mixed rice bowls) and other Korean favorites.",
      area: "south",
      tag: "BIBIMBAP",
      address: "1 Harbourfront Walk, #02-125, 098585",
      phone: "63770696",
      hours: "Monday-Sunday: 11 am-10 pm",
      website: "http://www.facebook.com/paiks.bibimsg/",
    }
  ],
  deals: [
    {
      id: "deal1",
      badge: "15% OFF",
      title: "15% OFF All BBQ Sets at K.COOK Korean BBQ Buffet",
      duration: "Valid till: 30 May 2025",
      description:
        "Enjoy 15% off all BBQ sets at K.COOK Korean BBQ Buffet. Valid for dine-in only, Monday to Thursday.",
      code: "KCOOK15",
    },
    {
      id: "deal2",
      badge: "1-FOR-1",
      title: "1-for-1 Bibimbap at Paik's Bibim (VivoCity)",
      duration: "Valid till: 15 Jun 2025",
      description:
        "Buy one Bibimbap and get one free at Paik's Bibim, VivoCity. Second bowl must be of equal or lesser value. T&Cs apply.",
      code: "PAIKS121",
    },
    {
      id: "deal3",
      badge: "FREE",
      title: "Free Kimchi with Any Main Course at POCHA!",
      duration: "Valid till: 20 May 2025",
      description:
        "Enjoy complimentary kimchi with any main course ordered at POCHA! Korean Street Dining.",
      code: "POCHAKIMCHI",
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
      name: "Western",
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
      url: "/cuisine/western",
    },
    {
      name: "Thai",
      image:
        "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=800&q=80",
      url: "/cuisine/thai",
    },
    {
      name: "Italian",
      image:
        "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=800&q=80",
      url: "/cuisine/italian",
    }
  ],
};
