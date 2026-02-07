import type { CuisineData } from "./types";

export const SEAFOOD_CUISINE: CuisineData = {
  slug: "seafood",
  name: "Seafood",
  tagline: "From fish to crab, find the best seafood dishes near you",
  features: [
    { label: "Fish" },
    { label: "Crab" },
    { label: "Lobster" },
    { label: "Prawns" },
    { label: "Shellfish" }
  ],
  heroImages: [
    "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?q=80&w=1374&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1374&auto=format&fit=crop"
  ],
  stats: {
    restaurants: 42,
    menuItems: "3,500+",
    deals: 3,
    malls: 10,
  },
  restaurants: [
    {
      id: "jumbo-signatures",
      name: "JUMBO Signatures",
      rating: 4.7,
      reviews: 804,
      location: "Marina Bay Sands",
      tags: ["Seafood", "Chinese"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxCyRSEC2bKcLQq5JMd1G-XlZdDp5LSq_X4f7gFlHNVX28G6iKuXlfj71bi1IriHPLXNeEMnFu6upCTb5wfMjz1PdOGoUN3o4ylipg0h84sdaiVBKwVc9w1eVC_479oS9N9ic-mVAs8q4TLLg=s4800-w800",
      description:
        "Famous for Singapore-style chili crab and other seafood specialties in an elegant setting.",
      area: "central",
      tag: "PREMIUM",
      address:
        "The Shoppes at Marina Bay Sands, 2 Bayfront Ave, B1- 01B, 018972",
      phone: "+65 6688 7023",
      hours:
        "Monday to Friday 11:30 am–3 pm, 5:30–10:30 pm, Saturday to Sunday 12–3:30 pm, 5:30–10:30 pm",
      website:
        "https://www.marinabaysands.com/restaurants/jumbosignatures.html",
    },
    {
      id: "dancing-crab",
      name: "Dancing Crab",
      rating: 4.2,
      reviews: 1071,
      location: "VivoCity",
      tags: ["Seafood", "American"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyubGg4QgQ4bo-cxIk1ngaVpA7mvAwQpetxfUAV_PB0mk5CoowJYFrurolg0bI5Mz3Tz9uLX0Re4fdIynzU14ha8Cn_zlU_u3hkPuiF8B_trVb21e2KVwMBcZsZvBnsXR4kn3e_qzQ0PBc59uXLjHP0aA=s4800-w800",
      description:
        "Louisiana-style seafood boil restaurant where diners eat directly off the table with their hands.",
      area: "south",
      tag: "POPULAR",
      address: "1 HarbourFront Walk, #03-10 VivoCity, Singapore 098585",
      phone: "62227377",
      hours: "Monday-Sunday: 11:30 am–3 pm, 5:30–10 pm",
      website: "https://dancingcrab.com.sg/",
    },
    {
      id: "blue-pearl-seafood",
      name: "Blue Pearl Seafood Restaurant",
      rating: 4.6,
      reviews: 20,
      location: "Marina Bay Sands",
      tags: ["Seafood", "Chinese"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzoA2i04gJduDeYkKkkHA8SVMyZcw6PQ9yjnpj80p7QlKo1elcK74uiX-WS3xr1sL8VB3-oA3uOnZTqILqKZO0VSA7ndtt7VMVSFYjzwSBv5zCVCweMdeBlV3g6Pjgx-Sf_aHQCoSwY4_rdbA=s4800-w800",
      description:
        "Elegant restaurant offering premium seafood dishes with a focus on fresh ingredients.",
      area: "central",
      tag: "FINE DINING",
      address: "10 Bayfront Ave, Singapore 018956",
      phone: "+65 6688 8883",
      hours: "Monday to Sunday 12 pm–10 pm",
      website: "https://www.bluepearlseafood.com",
    },
    {
      id: "seafood-paradise-vivocity",
      name: "Seafood Paradise at Vivocity",
      rating: 4.5,
      reviews: 370,
      location: "VivoCity",
      tags: ["Seafood", "Chinese"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEHCr0hDUJ_tDkAerVyOCKK7h8Om0VkbGb1ZE-8vVdlF9rv-H6-g6MCByM938Nrpp43M9-ssX4nKNm70Octn7z_Q-cJcZO1tQI=s4800-w800",
      description:
        "Renowned for its signature creamy butter crab and other Singaporean seafood specialties.",
      area: "south",
      tag: "AUTHENTIC",
      address: "1 HarbourFront Walk, #01-53 VivoCity, Singapore 098585",
      phone: "62210159",
      hours:
        "Monday-Friday: 11 am–3 pm, 6–10 pm, Saturday-Sunday: 10:30 am–3:30 pm, 5:30–10:30 pm",
      website: "https://www.paradisegp.com/seafood-paradise/",
    },
    {
      id: "fish-co-amk-hub",
      name: "Fish & Co. (AMK Hub)",
      rating: 4.1,
      reviews: 1063,
      location: "AMK Hub",
      tags: ["Seafood", "Western"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwWlEqadH5Vr5cWksafjPMw9FdD6H6KmOYLO7Ua5EZe4A80eEkQL4YiUJWv0NkxyTs2MBnJHFSp6AhMwmvj1-eOtn5TviqDcPsqEzvf_Qs2gaqGNgTcEmHtNkBRTrewwXW3B3Tb6xMXXOTuYg=s4800-w800",
      description:
        "Family-friendly restaurant offering a variety of seafood dishes, famous for their fish and chips.",
      area: "north",
      tag: "FAMILY FAVORITE",
      address: "53 Ang Mo Kio Ave 3, #02 - 02 AMK Hub, Singapore 569933",
      phone: "65556298",
      hours: "Monday to Sunday: 11 am–9:30 pm",
      website: "https://foodpanda.sg/restaurant/c6cx/fish-and-co-amk-hub",
    },
    {
      id: "putien-mbs",
      name: "PUTIEN Marina Bay Sands",
      rating: 4.8,
      reviews: 822,
      location: "Marina Bay Sands",
      tags: ["Seafood", "Chinese"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzR-6SWnGGGBYpRmFBr63dVxukvkeMgynoTyy9xk888vq0AyvlIxt6KKZdlDbUQe9dVSJVtPbCC0FGKfMZTrJBKWnbS_raUsZZDyFVgDItVkmwSXfDigbjVbTHzMY2kj9x4iIbpcGBE2jPSBqM=s4800-w800",
      description:
        "Michelin-starred restaurant specializing in cuisine from the Fujian province, known for its seafood dishes.",
      area: "central",
      tag: "MICHELIN STAR",
      address:
        "2 Bayfront Ave, #01-05 The Shoppes at, Marina Bay Sands, Singapore 018973",
      phone: "+65 6688 7053",
      hours: "Monday to Sunday 11:30 am–10 pm",
      website: "https://www.putien.com",
    },
    {
      id: "riverside-canton-claypot",
      name: "Riverside Canton Claypot Cuisine",
      rating: 4.5,
      reviews: 1065,
      location: "VivoCity",
      tags: ["Seafood", "Chinese"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzvjNaryqdqgvBWG2dyG7XZfptoZ3JLgwm9KHBbq9-lWdDXceVUjMKBalsi_Eg7jHdd1gSwnPjtbCrytvqpPLyaBuKdsUyJV9m105ZVlg5dyMCE4DIh2v9Nr8PIRHH2x5wjMj6rteybpjIe8JWknotyaQ=s4800-w800",
      description:
        "Specializing in Cantonese-style seafood claypot dishes with rich flavors and fresh ingredients.",
      area: "south",
      tag: "CLAYPOT SPECIALTY",
      address: "1 HarbourFront Walk, #02-85/86/87 VivoCity, Singapore 098585",
      phone: "62515863",
      hours: "Monday-Sunday: 11 am–10 pm",
    },
    {
      id: "haidilao-mbs",
      name: "Haidilao Hot Pot @Marina Bay Sands",
      rating: 4.8,
      reviews: 2719,
      location: "Marina Bay Sands",
      tags: ["Seafood", "Chinese", "Hot Pot"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqF-TaBnUlcTMlRBhzRO8SI62rmOJ_plKq5axn7K9HtOm09yrFqSipgghCmj1PxB_WwKPvPO-SuRCJsUjqeGFl1-PG7NpBOYp8k=s4800-w800",
      description:
        "Famous Chinese hotpot chain known for exceptional service and fresh seafood selection.",
      area: "central",
      tag: "PREMIUM SERVICE",
      address:
        "018972, Bayfront Ave, 2号, The Shoppes at Marina Bay Sands, #B2-01",
      phone: "+65 6509 1611",
      hours: "Monday to Sunday 12–6 am, 10:30 am–12 am",
      website: "https://www.haidilao.com",
    },
    {
      id: "fatt-choi-hotpot",
      name: "Fatt Choi Hotpot",
      rating: 4.3,
      reviews: 27,
      location: "Marina Bay Sands",
      tags: ["Seafood", "Chinese", "Hot Pot"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGNxj-WOoIauj3rJobvaCn2-tpWHGT1dxlKdPOlzyRqAochgu-jPV9TYjhlTf7CSqZm8sTL3QDNrIj3z8W7He_3wHt8lucavTU=s4800-w600",
      description:
        "Quality seafood hotpot restaurant offering fresh ingredients in a comfortable setting.",
      area: "central",
      tag: "LATE NIGHT",
      address:
        "10 Bayfront Avenue, Marina Bay Sands Main Casino, Level B2M Floor, 018956",
      phone: "+65 6688 1567",
      hours: "Monday to Sunday 12–6 am, 11 am–12 am",
      website: "https://www.marinabaysands.com/restaurants/fattchoihotpot.html",
    },
    {
      id: "yakiniku-go-plus",
      name: "Yakiniku-GO Plus",
      rating: 4.5,
      reviews: 508,
      location: "Suntec City",
      tags: ["Seafood", "Japanese", "BBQ"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxq-VE_3Fjf9zfDQCMtYnthPjPbf7A16vofk_vpNv71GRL0HGFHDeF2phZG7mGUL78-rZ4cijRKJvcyqQVGbkcSmebXj4CgpxG1kUSvmIzE4YrB0rAA3EIcbwR6QgRLE9fWlqwWHhiPfHXQVFc=s4800-w800",
      description:
        "Japanese BBQ restaurant offering seafood options including grilled prawns and scallops.",
      area: "central",
      tag: "BBQ",
      address: "3 Temasek Blvd, #01-353, Singapore 038983",
      phone: "+65 6250 2633",
      hours: "Monday to Friday 11:30 am–10 pm, Saturday to Sunday 11 am–10 pm",
      website: "https://www.yakinikunikuya.com.sg",
    },
    {
      id: "yayoi-united-square",
      name: "YAYOI Japanese Restaurant",
      rating: 4.4,
      reviews: 440,
      location: "United Square",
      tags: ["Seafood", "Japanese", "Set Meals"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHikNInryQrHCLuSpxVsdyBER7s_XEXrDlNEDItDw8vCUgbbF5sbjzyFm4jvqkPMfytU7FqKhNdln8HFsO6AjGu5baV0DG4xzQ=s4800-w800",
      description:
        "Authentic Japanese restaurant with variety of seafood set meals including salmon and unagi dishes.",
      area: "central",
      tag: "SET MEALS",
      address: "United Square Thomson Rd, #B1-54/55 101 307591",
      phone: "63527889",
      hours: "Monday-Sunday: 10:30 am–9 pm",
      website: "https://www.yayoi.sg/",
    },
    {
      id: "sushi-tei-jewel",
      name: "Sushi TEI",
      rating: 3.5,
      reviews: 179,
      location: "Jewel Changi Airport",
      tags: ["Seafood", "Japanese", "Sushi"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwtQhrSjq0shT8vXKdE4BMQKnHJatWyK5We_8G0Ki-DOYdX8Qj0sYonwvMLjvJYWlgTGkpxG5K_FfBlIGDj0WiIm0L21g7f0Y3YpMzPBcjuvOOpmoTpMLcRo9OBkZCkZPfwiNC1jXlkizmsUCWk22r4=s4800-w800",
      description:
        "Popular Japanese restaurant with a wide variety of fresh sushi and sashimi options.",
      area: "east",
      tag: "FRESH SUSHI",
      address:
        "78 Airport Blvd., #03 - 209 Singapore Changi Airport, Singapore 819666",
      phone: "62431633",
      hours: "Monday-Sunday: 11:30 am–10 pm",
      website: "https://sushitei.com/grand-menu/",
    },
    {
      id: "fish-co-junction8",
      name: "Fish & Co. (Junction 8)",
      rating: 4.1,
      reviews: 1063,
      location: "Junction 8",
      tags: ["Seafood", "Western"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDz1lyHqA_CWcV01cpoEFrR7QDdF6IuL3WLf1Lw4KaF5sIgHPsUzCsZxF-pIb9eht9kJ2GCEV9BQOwXV0xXZXm_WZQlC4e5b0Hg7WZqdYn3gOxogFWLBXXtOyIwppgpXWnrOK7lZOmgiazpciBo=s4800-w800",
      description:
        "Family-friendly restaurant offering a variety of seafood dishes, famous for their fish and chips.",
      area: "north-east",
      tag: "FAMILY FAVORITE",
      address: "9 Bishan Pl, #01-39 Junction 8, Singapore 579837",
      phone: "65556298",
      hours: "Monday to Sunday: 11 am–9:30 pm",
      website: "https://www.fish-co.com/",
    },
    {
      id: "jelebu-dry-laksa-vivocity",
      name: "Jelebu Dry Laksa (VivoCity)",
      rating: 4.5,
      reviews: 52350,
      location: "VivoCity",
      tags: ["Seafood", "Local"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDz4x8WaIuKpKDAksKZTQ7dNZZ5coJY5xZU2ZfWhs8LE8nuvrLl7UNR3s9AQRwqUgXcgLm3VKHG2Xj8uYFcax-AwZd_cbALS5TMw3Id8j-DRLeQqU0s7WDcz5rjsJ74OCf61DDv-WhsFjptYDgU=s4800-w800",
      description:
        "Specializing in dry laksa with fresh seafood toppings including prawns and cockles.",
      area: "south",
      tag: "LOCAL FAVORITE",
      address: "1 HarbourFront Walk, Singapore 098585",
      phone: "63776870",
      hours: "Monday-Sunday: 10 am–10 pm",
      website: "http://www.vivocity.com.sg/",
    },
    {
      id: "canton-paradise-mbs",
      name: "Canton Paradise at MBS",
      rating: 4.3,
      reviews: 1206,
      location: "Marina Bay Sands",
      tags: ["Seafood", "Chinese", "Dim Sum"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHyz_6J2EzuC-tspnN7j9EIPSpcgKfi-eMeoR3yblO9IxpiSAgW9H-SbfDm3FWKpycs34NXDBjyi1ZyJ059X-wthqYDiE6di68=s4800-w800",
      description:
        "Cantonese restaurant offering seafood specialties including dim sum and live seafood dishes.",
      area: "central",
      tag: "CANTONESE",
      address:
        "2 Bayfront Ave, #01 - 02 The Shoppes at Marina Bay Sands, Singapore 018972",
      phone: "+65 6634 9969",
      hours:
        "Monday to Thursday 11 am–10 pm, Friday to Saturday 11 am–11 pm, Sunday 11 am–10 pm",
      website:
        "https://www.marinabaysands.com/restaurants/cantonparadiseatmbs.html",
    },
    {
      id: "tim-ho-wan-peak",
      name: "Tim Ho Wan PEAK",
      rating: 3.7,
      reviews: 392,
      location: "Marina Bay Sands",
      tags: ["Seafood", "Chinese", "Dim Sum"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEuXqvQqIeLDPLiWA8gqmIFGrGANdfYIEMl1lVhfqBJje2Bf7gPPf1lECiSyoPD11kVb00MsjyO3uN6mAsCJQmlPxuxWj7C5lA=s4800-w800",
      description:
        "Michelin-starred dim sum restaurant with delicious seafood dumplings and other Cantonese specialties.",
      area: "central",
      tag: "DIM SUM",
      address:
        "B2-02/03/04, Canal Level, The Shoppes 2 BayFront Ave, Marina Bay Sands, 018972",
      phone: "+65 6688 7600",
      hours:
        "Monday to Thursday 11 am–10 pm, Friday to Saturday 11 am–11 pm, Sunday 11 am–10 pm",
      website: "https://www.marinabaysands.com/restaurants/timhowanpeak.html",
    },
    {
      id: "sen-of-japan",
      name: "Sen of Japan",
      rating: 4.5,
      reviews: 1301,
      location: "Marina Bay Sands",
      tags: ["Seafood", "Japanese", "Sushi"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHHwQx9NkcA69eSlNaJNpV_6uyI67LIyyi8Enz5wH64Kxs0WatwMKPE7JHHwQvzvcX7brQO5yWDegqYjdnnYPZHzlCzNllvdUM=s4800-w800",
      description:
        "Contemporary Japanese restaurant offering quality seafood dishes with a modern twist.",
      area: "central",
      tag: "MODERN JAPANESE",
      address: "2 Bayfront Ave, #01 - 86, Singapore 018972",
      phone: "+65 6688 7426",
      hours: "Monday to Sunday 11:30 am–10 pm",
      website: "https://www.marinabaysands.com/restaurants/senofjapan.html",
    },
    {
      id: "ippudo-mbs",
      name: "IPPUDO MARINA BAY SANDS",
      rating: 4.0,
      reviews: 778,
      location: "Marina Bay Sands",
      tags: ["Seafood", "Japanese", "Ramen"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzVzPMLk6-MVtCvSUzDPq_0clgmQbSLPBnHDdkE_WGzlw3ymgy7HaFaqTff8M0xATLHWoyKkF6CXsZBYjhAwU5NS4OzOXiG1lK0gwIDmSf44xVQY1d0aNcy_lAr9IISh5l78usqm0wqcQQSOK8=s4800-w800",
      description:
        "Famous ramen restaurant offering seafood ramen variations with fresh seafood toppings.",
      area: "central",
      tag: "RAMEN",
      address:
        "2 Bayfront Ave, # B2 - 54 / 55 The Shoppes at Marina Bay Sands, Singapore 018972",
      phone: "+65 6688 7064",
      hours: "Monday to Sunday 11 am–11 pm",
      website: "https://ippudo.com.sg",
    },
    {
      id: "aburi-en-jem",
      name: "Aburi-EN (Jem)",
      rating: 4.6,
      reviews: 1162,
      location: "Jem",
      tags: ["Seafood", "Japanese", "Grilled"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqE6RdqIiHaW1aE9BV95JLuzvq7Jz4u5U_o-plg-Rddbz_Egs-_9LuAtwrLVYvAiRNuSk7eejL06Fq3yh7g5MTOxmJ7W841A8Ik=s4800-w800",
      description:
        "Japanese restaurant specializing in aburi (flame-seared) seafood dishes with rich flavors.",
      area: "west",
      tag: "SPECIALTY",
      address: "50 Jurong Gateway Rd, #01-04 Jem, Singapore 608549",
      phone: "62620238",
      hours: "Monday to Sunday: 11 am–10 pm",
      website: "http://aburi-en.com/menu",
    },
    {
      id: "yakiniku-shokudo",
      name: "Yakiniku Shokudo",
      rating: 2.9,
      reviews: 63,
      location: "Bedok Mall",
      tags: ["Seafood", "Japanese", "BBQ"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyxyLQdGzoXFaomXWIVgYMWql8sLxeMIpaV4V20_JaGFrjwuWooAPELlpgEe6oLvLv9KlMk6VoS-Z6V_olwbu61QOJcuInbQjVuLsvPHny2q94ihFEY3lEju9Gh-yoSO6X2e-PCVbx7ByvMlyo=s4800-w800",
      description:
        "Japanese BBQ restaurant with seafood options including fresh squid, prawns and scallops.",
      area: "east",
      tag: "BBQ",
      address:
        "New Upper Changi Rd, 311号Bedok mall(yakiniku #B1-51 邮政编码: 467360",
      phone: "62410274",
      hours: "Monday-Sunday: 11:30 am–9:15 pm",
      website: "https://www.jfh.com.sg/html/brands.php",
    },
    {
      id: "fish-co-causeway-point",
      name: "Fish & Co. @ Causeway Point",
      rating: 4.5,
      reviews: 329,
      location: "Causeway Point",
      tags: ["Western", "Seafood"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyI_UZUZJ_ZmeOJVtkBwBaMxX3AwKIFX6IleXaAXKkpfaR7cRr0fzlokhmFuTYWCf6n4Bm6jBgNPm3ieMcCqt5Or6IK8AmKkerlQrk24wCU5Uc_bmK2RPJj3OJzBz5jhtATu_KPKAf46dlx7gM=s4800-w800",
      description:
        "Family-friendly restaurant specializing in fish and chips and other seafood dishes served in pans.",
      area: "north",
      tag: "FAMILY FRIENDLY",
      address: "1 Woodlands Square, #02-34/K01, Singapore 738099",
      phone: "62352156",
      hours: "Monday-Sunday: 11 am–9:30 pm",
      website: "https://www.fish-co.com/",
    },
    {
      id: "jumbo-seafood-jewel",
      name: "JUMBO Seafood - Jewel",
      rating: 4.8,
      reviews: 3651,
      location: "Jewel",
      tags: ["Seafood", "Chinese"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEfuqT0kT_10mL-f-xwd9xLzvpao1UirnHbHyESDkKAVX2lsOf3hKLDU9f7CVRWgW4mtNup38bXFoaOiTpMcdD5uCc2AQKUyRM=s4800-w748",
      description:
        "Award-winning seafood restaurant famous for Singapore-style chili crab and other seafood specialties.",
      area: "east",
      tag: "PREMIUM",
      address: "78 Airport Blvd., #03-202/203/204, Singapore 819666",
      phone: "63883435",
      hours: "Monday-Sunday: 11:30 am–10 pm",
      website: "https://www.jumboseafood.com.sg/en/menus",
    },
    {
      id: "fish-co-bedok-mall",
      name: "Fish & Co. (Bedok Mall)",
      rating: 4.4,
      reviews: 194,
      location: "Bedok Mall",
      tags: ["Fast Food", "Seafood"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzjYh0ikZtaY86TnDyBso3Mzd9ktja0nNaKiaO59caE00GcNe-svJYAwXEyg3yQDiP4nGbcWMahBe1NOdaYiiOMGwe_3auqzZ6hnSR80KMpZoCCpCWaCyX1wVrfnoA_c9sdU_eB0nuYSh8QKgGizbcZ0w=s4800-w800",
      description:
        "Casual dining restaurant specializing in fish and chips and other seafood dishes in a family-friendly setting.",
      area: "east",
      tag: "FAMILY FRIENDLY",
      address: "56 New Upper Changi Rd, #01-1316, Singapore 461056",
      phone: "62411266",
      hours:
        "Monday to Thursday: 10 am–11 pm, Friday to Saturday: 10 am–12 am, Sunday: 10 am–11 pm",
      website: "https://www.fish-co.com/",
    },
    {
      id: "long-john-silvers-hougang",
      name: "Long John Silver's (Hougang Mall)",
      rating: 3.3,
      reviews: 268,
      location: "Hougang Mall",
      tags: ["Western", "Fast Food", "Seafood"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDz3CeDTcNmbcpyD4cMnXsspbp1dRbFORhNZAth-w8-rj6_hciWYea3s0TEtWeOJThpVL6oK34iqJfRlUCjCsvtZ3w1UmDScczfSrV9omvy1Gp0uVh6IsoiARC5l3mKIp4mN0xwuIzhKJjuFfIU=s4800-w800",
      description:
        "Fast-food chain specializing in seafood including fish and chips, prawns, and other fried seafood items.",
      area: "north-east",
      tag: "FAST FOOD",
      address:
        "90 Hougang Ave 10, #B1 - 27 / 28 Hougang Mall, Singapore 538766",
      phone: "63860385",
      hours: "Monday-Sunday: 7:30 am–10 pm",
      website:
        "https://foodpanda.sg/restaurant/s1lm/long-john-silvers-hougang-mall",
    },
    {
      id: "long-john-silvers-tampines",
      name: "Long John Silver's (Tampines Mall)",
      rating: 3.6,
      reviews: 418,
      location: "Tampines Mall",
      tags: ["Fast Food", "Seafood"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyXYKtc463T8ALWHYrAbGnA5tfsZoH_lx7fWuTgajT3ixWNeCCug0Ef9rs7Ll8IOUp8W7rAXuDwPxZESwu732NCWO-MpQYk-2pAyg4SjMY8I_5dcwUgz9r5o7ZM_PKbjaJQvEs8QmhjVVpZOWmV_nbQSg=s4800-w800",
      description:
        "Fast-food chain offering fried seafood dishes including fish and chips in a casual setting.",
      area: "east",
      tag: "FAST FOOD",
      address: "4 Tampines Central 5, #04 - 23 to 25, Singapore 529510",
      phone: "67873900",
      hours: "Monday-Sunday: 7:30 am–10 pm",
      website:
        "https://foodpanda.sg/restaurant/s0qn/long-john-silvers-tampines-mall",
    },
    {
      id: "aburi-en-causeway-point",
      name: "Aburi-EN (Causeway Point)",
      rating: 4.7,
      reviews: 1193,
      location: "Causeway Point",
      tags: ["Japanese", "Seafood"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyAFLUbAitKegDKw6fFL05dSrkAOaPrsYJ3mauqV_O8hy1ZCaDGK9jZXk6YpnO_8ODO57H4NaK9HjQcqCJAIFnD5-hqo0-opiSeemFIx2DuvoSjKQHnaTnfxHSUs2U_0-Wl_wzdSjdGqAKP=s4800-w800",
      description:
        "Japanese restaurant specializing in flame-seared seafood and meat dishes with premium ingredients.",
      area: "north",
      tag: "PREMIUM",
      address: "1 Woodlands Square, #02-09B Causeway Point, Singapore 738099",
      phone: "67602081",
      hours: "Monday-Sunday: 11 am–10 pm",
      website: "http://aburi-en.com/menu",
    },
    {
      id: "dian-xiao-er-causeway-point",
      name: "Dian Xiao Er (Causeway Point)",
      rating: 4.1,
      reviews: 187,
      location: "Causeway Point",
      tags: ["Chinese", "Seafood"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDw6e-SnKVnQUwyimsGVchZeHTRcXda2pL5fgg2_YwlYUadn1eNfI2sk_RQuED2mr9saANWHVc_vYvrepQHITcsca5RCX-zL_XrEGBNY60NkvO9VX79j9t_Vz2oCwK-CtPdcV8iDcc0R2OoCSDI=s4800-w800",
      description:
        "Chinese restaurant known for its herbal roast duck and various seafood dishes.",
      area: "north",
      tag: "SIGNATURE",
      address: "1 Woodlands Square, #05-11 Causeway Point, Singapore 738099",
      phone: "62195519",
      hours: "Monday-Thursday: 11 am–9:30 pm, Friday-Sunday: 11 am–10 pm",
      website:
        "https://inline.app/booking/-M35wR-SxtIiCo3bCrsw:inline-live-1/-MZwJDrksfYbwaBlcH3e",
    },
    {
      id: "dian-xiao-er-bedok-mall",
      name: "Dian Xiao Er (Bedok Mall)",
      rating: 4.2,
      reviews: 429,
      location: "Bedok Mall",
      tags: ["Chinese", "Seafood"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxbF6JAzgOUFaxVs1zzv9-EicWMBAVC5J1_yBOWmw8gX-jroX1tViKBW30wHH2NqgsaTEc83UHSQmyU-Ka4i-1TWEvnVfiyp4OwcNrjDnk86oBgfC-gcay7-xp0u6sa2pcnLHqrqy100hu7=s4800-w800",
      description:
        "Chinese restaurant famous for its herbal roast duck and selection of seafood dishes.",
      area: "east",
      tag: "HERBAL ROAST",
      address: "311 New Upper Changi Rd, #01 - 71, Singapore 467360",
      phone: "68449266",
      hours: "Monday to Thursday: 11 am–9:30 pm, Friday to Sunday: 11 am–10 pm",
      website: "https://www.google.com.sg/intl/en/about/products?tab=lh",
    },
    {
      id: "dian-xiao-er-jewel",
      name: "Dian Xiao Er (Jewel)",
      rating: 4.1,
      reviews: 226,
      location: "Jewel",
      tags: ["Chinese", "Seafood"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHrJScIE4_0rbsLExLXzzun82DEaqsi1esQxJYNzheIW3PaG57wcEoyXYLVT_Vz1y31u_-vLqI-fIazGALVGLQggWhKgje54Q=s4800-w800",
      description:
        "Chinese restaurant offering herbal roast duck and a variety of seafood dishes in a comfortable setting.",
      area: "east",
      tag: "DUCK & SEAFOOD",
      address:
        "78 Airport Blvd., #B2 - 229 Jewel Changi Airport, Singapore 819666",
      phone: "65423789",
      hours: "Monday-Sunday: 11 am–10 pm",
      website: "https://order.dianxiaoer.com.sg/",
    },
    {
      id: "dian-xiao-er-jem",
      name: "Dian Xiao Er (Jem)",
      rating: 4.3,
      reviews: 546,
      location: "Jem",
      tags: ["Chinese", "Seafood"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEpwYhkiU-GE42CZDMyHfqQ-WniHWaTpUOykjfH7ovxfmfquK2QQbtggh4xO-NgGA1nVKiujjBBp19uwSI3C9aFfvIxq6MOqmo=s4800-w800",
      description:
        "Chinese restaurant specializing in herbal roast duck and various seafood dishes with traditional flavors.",
      area: "west",
      tag: "AUTHENTIC",
      address: "50 Jurong Gateway Rd, #03-08 Jem, Singapore 608549",
      phone: "67340813",
      hours: "Monday-Thursday: 11 am–9:30 pm, Friday-Sunday: 11 am–10 pm",
      website: "https://order.dianxiaoer.com.sg/",
    },
    {
      id: "ichiban-boshi-causeway-point",
      name: "Ichiban Boshi (Causeway Point)",
      rating: 4.5,
      reviews: 1495,
      location: "Causeway Point",
      tags: ["Japanese", "Seafood"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyIu1WwxWfwsiTJrx-evG0o5zq8erwMbwEzpDUFET-JpnrsLZ5NuSmYbXH7muMTCSovxm_JEEqIjafaH0m5LFC45qlZIcmQ14F1XzaYBn4W5XnprPAYae0fblbuRCtrkpp-32jJ1m5zgYKe=s4800-w800",
      description:
        "Popular Japanese restaurant offering quality sushi, sashimi and other seafood specialties.",
      area: "north",
      tag: "JAPANESE",
      address: "1 Woodlands Square, #05-06 Causeway Point, Singapore 738099",
      phone: "60163904",
      hours: "Monday-Sunday: 11 am–10 pm",
      website: "https://www.ichibanboshi.com.sg/",
    },
    {
      id: "ichiban-sushi-hougang",
      name: "Ichiban Sushi (Hougang Mall)",
      rating: 4.4,
      reviews: 888,
      location: "Hougang Mall",
      tags: ["Japanese", "Seafood"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDz8JQX35u6HYCaNKOJQlUDc13Ib6AnqI-XMXgheFP2ya-Nn1Gs5U9VBgF5O3vTlua98SF0dSGieiMYCQsaaIqWxbgbAtfaBYLk8TeQzJZm6XxrkKhhzmlD27schJJd3B0jWwkJd823mPxpxwg=s4800-w800",
      description:
        "Japanese restaurant offering fresh sushi, sashimi and other seafood dishes at affordable prices.",
      area: "north-east",
      tag: "AFFORDABLE",
      address: "90 Hougang Avenue 10 #02-23, Hougang Mall, 538766",
      phone: "63867836",
      hours: "Monday-Friday: 11:30 am–10 pm, Saturday-Sunday: 11 am–10 pm",
      website: "http://www.ichibansushi.com.sg/en/",
    },
    {
      id: "ichiban-boshi-jem",
      name: "Ichiban Boshi (Jem)",
      rating: 4.1,
      reviews: 593,
      location: "Jem",
      tags: ["Japanese", "Seafood"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwMtGjGbv8CwD1udiWUitpDVRqU3_Okebb8H9ihINVcVvaiXDNSsx-hii6BDIDoVVDSg2fU_yyRFeRj0yA-NPx6LQXMez5qfeCcxIbqKpuvKwN_ZGxx3ylDieKn9s2x7CSJk_GNkVq7bWwolg=s4800-w800",
      description:
        "Quality Japanese restaurant serving fresh sushi, sashimi and a variety of seafood dishes.",
      area: "west",
      tag: "POPULAR",
      address: "50 Jurong Gateway Rd, #B1-01 Jem, Singapore 608549",
      phone: "66596186",
      hours: "Monday-Friday: 11:30 am–10 pm, Saturday-Sunday: 11 am–10 pm",
      website: "http://www.ichibanboshi.com.sg/en/",
    },
    {
      id: "sushi-tei-jewel-2",
      name: "SUSHI TEI (Jewel)",
      rating: 3.5,
      reviews: 179,
      location: "Jewel",
      tags: ["Japanese", "Seafood"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwtQhrSjq0shT8vXKdE4BMQKnHJatWyK5We_8G0Ki-DOYdX8Qj0sYonwvMLjvJYWlgTGkpxG5K_FfBlIGDj0WiIm0L21g7f0Y3YpMzPBcjuvOOpmoTpMLcRo9OBkZCkZPfwiNC1jXlkizmsUCWk22r4=s4800-w800",
      description:
        "Japanese restaurant offering a wide variety of sushi, sashimi and other seafood dishes.",
      area: "east",
      tag: "VARIETY",
      address:
        "78 Airport Blvd., #03 - 209 Singapore Changi Airport, Singapore 819666",
      phone: "62431633",
      hours: "Monday-Sunday: 11:30 am–10 pm",
      website: "https://sushitei.com/grand-menu/",
    },
    {
      id: "genki-sushi-tampines",
      name: "Genki Sushi (Tampines Mall)",
      rating: 4.6,
      reviews: 4202,
      location: "Tampines Mall",
      tags: ["Japanese", "Seafood"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxGeMgf5NUNYR6xMhdpdi8lr5xCZ1U6cVOGZ53q-EDJTcTU_GWwIlTvY5zYRMM7kQ0lnhtAsx68fX_FOCQrpC8_pe9MlOjE8dKKGc_Wk1tv_G22o-TrBLLfbZLWE0w5Yb5Nh8NsFtIKhrQeSaQ=s4800-w800",
      description:
        "Popular Japanese restaurant featuring a conveyor belt delivery system for sushi and other seafood dishes.",
      area: "east",
      tag: "CONVEYOR BELT",
      address:
        "4 Tampines Central 5, #03-26/27 Tampines Mall, Singapore 529510",
      phone: "68164574",
      hours: "Monday-Sunday: 11 am–10 pm",
      website: "https://www.genkisushi.com.sg/",
    },
    {
      id: "shabu-sai-causeway-point",
      name: "Shabu Sai (Causeway Point)",
      rating: 4.0,
      reviews: 479,
      location: "Causeway Point",
      tags: ["Japanese", "Seafood", "Hot Pot"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwLGTf05Vd_LhCWPwliw31koWyOJcc3uQVqAssxRliACJniGpR5Yr6LbHluPXjPzpHrH9WzSbKZLN4f71B9awe-vLubxYewDKJEZ9PKY0fYekRh_FvXdBXceTQNYCZ-zGdpyhZ0Yc2D32Hapg=s4800-w800",
      description:
        "Japanese hot pot restaurant with an extensive selection of seafood, meat and vegetables.",
      area: "north",
      tag: "HOT POT",
      address: "1 Woodlands Square, #05-14/15 Causeway Point, Singapore 738099",
      phone: "64621557",
      hours: "Monday-Sunday: 11 am–10 pm",
      website: "http://facebook.com/shabusai.sg/menu",
    },
    {
      id: "kei-kaisendon-jewel",
      name: "Kei Kaisendon (Jewel)",
      rating: 4.2,
      reviews: 106,
      location: "Jewel",
      tags: ["Japanese", "Seafood"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDy0hRqNPOF97p3HjpAFFiOtcJBwLRlTRR-Qvih0GB10pXABnHR4XnmmyruG3G_Lq0Ru6CNdh4X3mjsPTQAf3FshF-Xjffo_zUpkg8X7BHvYakkeNzFQs4U36DhR9A7Hoc5fZ1ANSOglKQK6bQ=s4800-w800",
      description:
        "Japanese restaurant specializing in kaisendon (seafood rice bowls) with fresh sashimi and other seafood.",
      area: "east",
      tag: "RICE BOWLS",
      address: "78 Airport Blvd., #03 - 213, Singapore 819666",
      phone: "65303073",
      hours: "Monday-Sunday: 11 am–10 pm",
      website:
        "https://deliveroo.com.sg/menu/singapore/sg-changi-airport/kei-kaisendon-jewel-changi-airport",
    }
  ],
  deals: [
    {
      id: "deal1",
      badge: "15% OFF",
      title: "15% OFF All Fish Dishes at Fish & Co. (VivoCity)",
      duration: "Valid till: 30 May 2025",
      description:
        "Enjoy 15% off all fish dishes at Fish & Co. VivoCity. Valid for dine-in only, Monday to Thursday.",
      code: "FISH15",
    },
    {
      id: "deal2",
      badge: "1-FOR-1",
      title: "1-for-1 Seafood Platters at JUMBO Signatures (MBS)",
      duration: "Valid till: 15 Jun 2025",
      description:
        "Buy one seafood platter and get one free at JUMBO Signatures, MBS. Second platter must be of equal or lesser value. T&Cs apply.",
      code: "JUMBO121",
    },
    {
      id: "deal3",
      badge: "FREE",
      title: "Free Seafood Soup with Any Main Course at Blue Pearl Seafood",
      duration: "Valid till: 20 May 2025",
      description:
        "Enjoy a complimentary seafood soup with any main course ordered at Blue Pearl Seafood Restaurant.",
      code: "PEARLSOUP",
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
    }
  ],
};
