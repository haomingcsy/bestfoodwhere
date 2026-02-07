import type { CuisineData } from "./types";

export const BUBBLE_TEA_CUISINE: CuisineData = {
  slug: "bubble-tea",
  name: "Bubble Tea",
  tagline:
    "From classic milk tea to fruit tea, find the best bubble tea near you",
  features: [
    { label: "Milk Tea" },
    { label: "Fruit Tea" },
    { label: "Brown Sugar" },
    { label: "Cheese Tea" },
    { label: "Fresh Milk" }
  ],
  heroImages: [
    "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    "https://images.unsplash.com/photo-1627998792088-f8016b438988?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1376&q=80"
  ],
  stats: {
    restaurants: 49,
    menuItems: "1,000+",
    deals: 3,
    malls: 12,
  },
  restaurants: [
    {
      id: "liho-junction8",
      name: "LiHO TEA @ Junction 8",
      rating: 3.9,
      reviews: 186,
      location: "Junction 8",
      tags: ["Bubble Tea", "Cheese Tea", "Local Brand"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyXPwTwUClFuYJJGfQf5jxWAvYWzL4V_lTP4gcTPgY6-rvgLVp94S0lNpTI_E3o1LM8g_EQeDJw3xzPuQt5RKwJIxMejmqHcb3fACRke02KUjQHZ9JDWHisvES3rA8VmGUYehDcKoeujX2Ahw=s4800-w800",
      description:
        "Popular local bubble tea chain known for introducing cheese tea to Singapore and creative seasonal flavors.",
      area: "north",
      tag: "CHEESE TEA",
      address: "9 Bishan Pl, #02-18A, Singapore 579837",
      phone: "60275817",
      hours:
        "Monday-Thursday, Sunday: 11 am–10 pm, Friday-Saturday: 11 am–10:30 pm",
      website: "https://www.facebook.com/lihosg/",
    },
    {
      id: "koi-junction8",
      name: "KOI Thé @ Junction 8",
      rating: 2.4,
      reviews: 36,
      location: "Junction 8",
      tags: ["Bubble Tea", "Golden Bubble", "Milk Tea"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipMdaHtk_98__5vCEw6bPKgnhcezliomh2EAojsU=w408-h544-k-no",
      description:
        "One of Singapore's most established bubble tea brands known for their signature milk tea and golden bubble.",
      area: "north",
      tag: "CLASSIC",
      address: "9 Bishan Pl, #02-26, Singapore 579837",
      phone: "62581729",
      hours: "Monday-Sunday: 10 am–10 pm",
      website: "https://www.koithe.com/en/global/koi-singapore",
    },
    {
      id: "koi-hougang",
      name: "KOI Thé @ Hougang Mall",
      rating: 3.0,
      reviews: 26,
      location: "Hougang Mall",
      tags: ["Bubble Tea", "Golden Bubble", "Milk Tea"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqF0E9pEeoDXc-0kVvMTUX5zg0ihvV8svSkv-o_t3lewAiKpC2rmZUSZm8F_ComEvQKs6bIVPkz7jPOu_wqWxtdXohBZgT5_X4g=s4800-w800",
      description:
        "One of Singapore's most established bubble tea brands known for their signature milk tea and golden bubble.",
      area: "north-east",
      tag: "CLASSIC",
      address: "90 Hougang Ave 10, #01-15 Hougang Mall, Singapore 538766",
      phone: "63434234",
      hours: "Monday-Sunday: 10 am–10 pm",
      website: "https://www.koithe.com/global/koi-singapore",
    },
    {
      id: "liho-hougang",
      name: "LiHO TEA @ Hougang Mall",
      rating: 4.1,
      reviews: 104,
      location: "Hougang Mall",
      tags: ["Bubble Tea", "Cheese Tea", "Local Brand"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDz-mOua17lnqOcRA3g-oIx3tyIhO6qGNcpQ4wmdrSNf6vZTORQCPbqf88Wof-k3506argH0s4p3d4lvzewioyT89fg9hgmcFVImjf_QTpypV0F7w_nfWcJBhFtx4AL_U5EelMXddgW-ebMzKy6iWtep3g=s4800-w800",
      description:
        "Popular local bubble tea chain known for introducing cheese tea to Singapore and creative seasonal flavors.",
      area: "north-east",
      tag: "CHEESE TEA",
      address: "90 Hougang Ave 10, #02-08, Singapore 538766",
      phone: "60275813",
      hours: "Monday-Sunday: 11 am–10 pm",
      website:
        "https://foodpanda.sg/restaurant/xlug/liho-tea-hougang-mall?utm_source=google&utm_medium=organic&utm_campaign=google_reserve_place_order_action",
    },
    {
      id: "playmade-hougang",
      name: "PlayMade @ Hougang Mall",
      rating: 4.0,
      reviews: 50,
      location: "Hougang Mall",
      tags: ["Bubble Tea", "Handmade Pearls", "Colorful"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyiTLUvwnSvOXZHF_w6xugCLgBF08ZX-QM7vssQY0C0DPaREOpW2jqsevCqLNoJwZJxZfTqrQR99EvYdRV9R-bDm7dnJISf-JSzVYtmsdsGJLRZyidHrfNySKhPQ3Ncaa3My3vI6qKOJW1WYJg=s4800-w800",
      description:
        "Known for their handmade pearls in unique flavors and vibrant colors made fresh daily.",
      area: "north-east",
      tag: "HANDMADE",
      address: "90 Hougang Ave 10, #01-25, Singapore 538766",
      phone: "62149134",
      hours: "Monday-Friday: 11 am–10 pm, Saturday-Sunday: 10:30 am–10 pm",
      website:
        "https://foodpanda.sg/restaurant/d9m4/playmade-hougang-mall?utm_source=google&utm_medium=organic&utm_campaign=google_reserve_place_order_action",
    },
    {
      id: "chicha-nex",
      name: "CHICHA San Chen @ NEX",
      rating: 4.7,
      reviews: 489,
      location: "NEX",
      tags: ["Bubble Tea", "Taiwanese", "Premium"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyKBRJ6Nkq9bFjpRUkQCm9nWN4lgioeYo1oYTZKEEL-AXhONSr04o9tJSpzZZBpnYr4HIIbXY1nUweMRaMAx-JfZWQTwpZ6xyflwlOITbgA1bMRjR57r7yHbGG82BV6dxizfyaucvRmDZiB6k5_hRkLWw=s4800-w800",
      description:
        "Award-winning premium Taiwanese tea brand with high-quality tea leaves and brewing techniques.",
      area: "north-east",
      tag: "PREMIUM",
      address: "23 Serangoon Central, #02-13A NEX, Singapore 556083",
      phone: "Not available",
      hours:
        "Monday to Thursday: 11 am–9:15 pm, Friday to Saturday: 11 am–9:30 pm, Sunday: 11 am–9:15 pm",
      website: "https://www.chichasanchen.com.sg/",
    },
    {
      id: "koi-nex",
      name: "KOI Thé @ NEX",
      rating: 4.1,
      reviews: 427,
      location: "NEX",
      tags: ["Bubble Tea", "Golden Bubble", "Milk Tea"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwUvVZACgdcMhtKjIgChJf-E92gKJdCxuKepe-0G7Gl7CybmGYgnLg4Xkx6T15uvbau8hn8Y1ymc9bBSoFcfalOmY9qII25i11LvpIyfIDI0xzGByendBnUJfKQ_w26dv5BhPWM3GFp9thXyNQ=s4800-w800",
      description:
        "One of Singapore's most established bubble tea brands known for their signature milk tea and golden bubble.",
      area: "north-east",
      tag: "CLASSIC",
      address: "23 Serangoon Central, B1-07, Singapore 556083",
      phone: "66348623",
      hours:
        "Monday to Thursday: 10 am–10 pm, Friday to Saturday: 10 am–10:30 pm, Sunday: 10 am–10 pm",
      website: "https://www.koithe.com/en",
    },
    {
      id: "liho-amkhub",
      name: "LiHO TEA @ Ang Mo Kio HUB",
      rating: 3.9,
      reviews: 224,
      location: "AMK Hub",
      tags: ["Bubble Tea", "Cheese Tea", "Local Brand"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwrzaxDPxmoWyR4npGLByKusyGynTwMCne6QpoShKc0dTy0_zk_9aAjXzgJBmUpO_MdbFpnqy7fB0ptvlfN_7ntAV5QqjQYzSJCdohIbmRa2p5ecsyetolFBhcxuDo35LH1uSA66UdYfFjfNO5YcKnkCw=s4800-w800",
      description:
        "Popular local bubble tea chain known for introducing cheese tea to Singapore and creative seasonal flavors.",
      area: "north",
      tag: "CHEESE TEA",
      address: "53 Ang Mo Kio Ave 3, B2-57 @AMK Hub, Singapore 569933",
      phone: "60275784",
      hours:
        "Monday to Thursday: 11 am–10 pm; Friday to Saturday: 11 am–10:30 pm; Sunday: 11 am–10 pm",
      website: "https://foodpanda.sg/restaurant/x9ml/liho-tea-amk-hub",
    },
    {
      id: "playground-amkhub",
      name: "Playground by PlayMade @ AMK Hub",
      rating: 3.5,
      reviews: 82,
      location: "AMK Hub",
      tags: ["Bubble Tea", "Handmade Pearls", "Colorful"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDytd1rRE7bYpx2ROeALiTJvvLIwb2ISoyOp4ohQIhhuUGSGz5tt1gwkDIpVbFB43PuL_hZqzlWQfNM5rq54U5by06T4zflxUcHisC85c-eq7RV83zPXL810RHeO1SWHtza7ZF050IMfiW3flA=s4800-w800",
      description:
        "Known for their handmade pearls in unique flavors and vibrant colors made fresh daily.",
      area: "north",
      tag: "HANDMADE",
      address: "53 Ang Mo Kio Ave 3, B1 51B, Singapore 569933",
      phone: "Not available",
      hours:
        "Monday to Friday: 11 am–10 pm; Saturday to Sunday: 10:30 am–10 pm",
      website:
        "https://foodpanda.sg/restaurant/uqv2/playground-by-playmade-amk-hub",
    },
    {
      id: "koi-amkhub",
      name: "KOI Thé @ AMK Hub",
      rating: 2.8,
      reviews: 34,
      location: "AMK Hub",
      tags: ["Bubble Tea", "Golden Bubble", "Milk Tea"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGvUHfY1JTC4_Ym8r37YZ57PbFipWBlRwG5Sskx59UQcM8lhY7Hx1S03hbJF4zGFIX-edqR5swAT6huRCXzYtTOKBUR7E3lSAw=s4800-w600",
      description:
        "One of Singapore's most established bubble tea brands known for their signature milk tea and golden bubble.",
      area: "north",
      tag: "CLASSIC",
      address: "53 Ang Mo Kio Ave 3, #01-44, Singapore 569933",
      phone: "68152976",
      hours: "Monday to Sunday: 10 am–10 pm",
      website: "https://www.koithe.com/en/global/koi-singapore/Dq43jy",
    },
    {
      id: "liho-bedok",
      name: "LiHO TEA @ Bedok Mall",
      rating: 3.9,
      reviews: 233,
      location: "Bedok Mall",
      tags: ["Bubble Tea", "Cheese Tea", "Local Brand"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqE_83T9T7Yio2cmOi-Y2OuLHEMRTQmXb-haq19AY2Z2bVYYOUoC67x0ZUIhaBFEnpzZnBYcUvl81NwDRrMeLckhE_81cOEDvoM=s4800-w800",
      description:
        "Popular local bubble tea chain known for introducing cheese tea to Singapore and creative seasonal flavors.",
      area: "east",
      tag: "CHEESE TEA",
      address: "New Upper Changi Rd, B2-K16 311, Singapore 467360",
      phone: "60275792",
      hours: "Monday to Sunday: 10 am–10 pm",
      website: "https://foodpanda.sg/restaurant/x5fk/liho-tea-bedok-mall",
    },
    {
      id: "koi-bedok",
      name: "KOI Thé @ Bedok Mall",
      rating: 3.6,
      reviews: 223,
      location: "Bedok Mall",
      tags: ["Bubble Tea", "Golden Bubble", "Milk Tea"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHAMqiVJ8926VUMPhQVo5Q5wbMFwPSAT2KbvQMHh2yZTwkQQPUcbMZJMbxUimgSgJjBDWYP2E7TpjdGMunP_sbJJytGsrOtZC4=s4800-w600",
      description:
        "One of Singapore's most established bubble tea brands known for their signature milk tea and golden bubble.",
      area: "east",
      tag: "CLASSIC",
      address: "311 New Upper Changi Rd, #01-97, Singapore 467360",
      phone: "62461780",
      hours: "Monday to Sunday: 10 am–10 pm",
      website: "https://www.koithe.com/en",
    },
    {
      id: "mrcoconut-bedok",
      name: "Mr. Coconut @ Bedok Mall",
      rating: 4.1,
      reviews: 90,
      location: "Bedok Mall",
      tags: ["Bubble Tea", "Coconut", "Fresh"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxJMYm6b0pq4oNQt-JnjJNYlkt6t6KgEy98EI89_6RrIO7hanJ-9M1cpRRYELyHy0amQTn1nSjBmuBuc-lxK87EpVK4viROPvb267W3IJCk9K8hjiDtIsKwEpylyFxw2ydDzG6QBvYgKUfa=s4800-w800",
      description:
        "Specializing in coconut-based drinks with fresh coconut juice and coconut shakes with various toppings.",
      area: "east",
      tag: "COCONUT",
      address: "311 New Upper Changi Rd, #01-K1, Singapore 467360",
      phone: "60150313",
      hours: "Monday to Sunday: 10 am–9:45 pm",
      website: "https://mrcoconut.sg/",
    },
    {
      id: "chicha-bedok",
      name: "CHICHA San Chen @ Bedok Mall",
      rating: 4.8,
      reviews: 241,
      location: "Bedok Mall",
      tags: ["Bubble Tea", "Taiwanese", "Premium"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGdKjUC_QP03ubrAHB3G7WbsG6-P44bjihx43o_vPnGigwTjqabbMA4wZvYH8keiK7igt5uBkh0_IY34sAt77z8pex8ERSPOQk=s4800-w800",
      description:
        "Award-winning premium Taiwanese tea brand with high-quality tea leaves and brewing techniques.",
      area: "east",
      tag: "PREMIUM",
      address: "311 New Upper Changi Rd, B2-24A Bedok Mall, Singapore 467360",
      phone: "Not available",
      hours: "Monday to Sunday: 11 am–9:30 pm",
      website: "https://www.chichasanchen.com.sg/",
    },
    {
      id: "liho-imm",
      name: "LiHO TEA @ IMM",
      rating: 4.1,
      reviews: 121,
      location: "IMM",
      tags: ["Bubble Tea", "Cheese Tea", "Local Brand"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDymPtPaQaRCmoX4Vxy5iFI5IuJARcoeXpY0jQksiyAaechEPMkYV0PU41xwbaVOGr8J8MpQYFniPgJdYvrsrvdeBNqS_LX-vyywnh_5TKV4eJfKuvC1kuHWHmVjXEDa21onYxEX3fQS8ThE3X8=s4800-w800",
      description:
        "Popular local bubble tea chain known for introducing cheese tea to Singapore and creative seasonal flavors.",
      area: "west",
      tag: "CHEESE TEA",
      address: "2 Jurong East Street 21, #01-K12, Singapore 609601",
      phone: "60275815",
      hours:
        "Monday-Thursday & Sunday: 11 am–10 pm, Friday-Saturday: 11 am–10:30 pm",
      website: "https://www.facebook.com/lihosg/",
    },
    {
      id: "mrcoconut-imm",
      name: "Mr. Coconut @ IMM",
      rating: 4.0,
      reviews: 186,
      location: "IMM",
      tags: ["Bubble Tea", "Coconut", "Fresh"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwwaNzpWE2nvlHtGt_m62ZdJksDH3PXWf5VzZqkNDc15_zwDPUW1GIZ5lp5XyqjpN6pDWT8qju6FTAUf8bICzQhEQ2sXH3LIAEt1y3SLb9slhUno3f3ihKro5ArX3SejoHF3OU2bvtfGB9a0w=s4800-w800",
      description:
        "Specializing in coconut-based drinks with fresh coconut juice and coconut shakes with various toppings.",
      area: "west",
      tag: "COCONUT",
      address:
        "2 Jurong East Street 21, #01-K05 IMM Building, Singapore 609601",
      phone: "60150306",
      hours: "Monday-Sunday: 10 am–9:45 pm",
      website: "Not available",
    },
    {
      id: "chicha-jem",
      name: "CHICHA San Chen @ JEM",
      rating: 4.5,
      reviews: 365,
      location: "JEM",
      tags: ["Bubble Tea", "Taiwanese", "Premium"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyBtUlAIRiKk5VHkDLhoGruEZHBxcKSV59tobDUNbKWIWG6YX7jW_HWoX8ZfywToFTBcy_Xb9TsYoqeQEWXsqr3xhgWC7J8I22nv91GlaFxJUvWu6Jmfag3nfZ4ws0pHsfulrSEqogem0DHUw=s4800-w800",
      description:
        "Award-winning premium Taiwanese tea brand with high-quality tea leaves and brewing techniques.",
      area: "west",
      tag: "PREMIUM",
      address: "50 Jurong Gateway Rd, #01 - 17 JEM, Singapore 608549",
      phone: "Not available",
      hours: "Monday-Sunday: 11 am–9:30 pm",
      website: "https://www.chichasanchen.com.sg/",
    },
    {
      id: "liho-jem",
      name: "LiHO TEA @ JEM",
      rating: 3.7,
      reviews: 311,
      location: "JEM",
      tags: ["Bubble Tea", "Cheese Tea", "Local Brand"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwSboXi7oe0bjwf19otssYj_Qt4yhauP2FgSfQHKckNVGOXBIMRUMww8PgpcxlmqLs-uR4Nd12NWbx8vh_oqLyskTIiifntG06uIYJu2e4QggGJXT4ilqHNnaOaMr7mdqs3GM9JM2rhj9tY=s4800-w800",
      description:
        "Popular local bubble tea chain known for introducing cheese tea to Singapore and creative seasonal flavors.",
      area: "west",
      tag: "CHEESE TEA",
      address: "50 Jurong Gateway Rd, #B1 - 30, Singapore 608549",
      phone: "60275818",
      hours:
        "Monday-Thursday & Sunday: 11 am–10:30 pm, Friday-Saturday: 11 am–11 pm",
      website: "https://www.facebook.com/lihosg/",
    },
    {
      id: "chicha-jewel",
      name: "CHICHA San Chen @ Jewel Changi",
      rating: 4.7,
      reviews: 586,
      location: "Jewel Changi Airport",
      tags: ["Bubble Tea", "Taiwanese", "Premium"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGv-mRHGO--8aX-lapA3CpPfj0SAcHvbF-2YDbs4-gL01tiKGBzHwiuW85td5kyxBnZHHb7ccmpLQ779hfRTVnkOh64nriSr9g=s4800-w800",
      description:
        "Award-winning premium Taiwanese tea brand with high-quality tea leaves and brewing techniques.",
      area: "east",
      tag: "PREMIUM",
      address:
        "Jewel, 78 Airport Blvd., B2-213 Singapore Changi Airport, 819666",
      phone: "65505422",
      hours: "Monday-Sunday: 11 am–9:30 pm",
      website: "https://www.chichasanchen.com.sg/",
    },
    {
      id: "koi-jewel",
      name: "KOI Thé Jewel Changi",
      rating: 3.5,
      reviews: 45,
      location: "Jewel Changi Airport",
      tags: ["Bubble Tea", "Golden Bubble", "Milk Tea"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHrKGFPPmj2s-4758nCAYZ4og3C87dES2pvN_adEwtCP-PljpTP8TLyvRc5rQIh7WF4ZrtJfcNu9Gqd734LHdRBHC9IdwoZyaU=s4800-w600",
      description:
        "One of Singapore's most established bubble tea brands known for their signature milk tea and golden bubble.",
      area: "east",
      tag: "CLASSIC",
      address: "78 Airport Blvd., #01-K207, Singapore 819666",
      phone: "62149486",
      hours: "Monday-Sunday: 10 am–10 pm",
      website: "https://www.koithe.com/",
    },
    {
      id: "liho-jewel",
      name: "LiHO TEA Jewel",
      rating: 3.7,
      reviews: 29,
      location: "Jewel Changi Airport",
      tags: ["Bubble Tea", "Cheese Tea", "Local Brand"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxRDnmCtdbY0pIRQBEbE8HPq3hJgzOlGa-dyuffSVNuwrrFhetGvn-vdWgPpSUdImlzdMfJ_0oGr1rD-wSTI4VUA0K5kUOUny0c8mHbaUslqElitP0pufPTbVx4Qs1SdFD4CIER34P_6R4AcSo=s4800-w800",
      description:
        "Popular local bubble tea chain known for introducing cheese tea to Singapore and creative seasonal flavors.",
      area: "east",
      tag: "CHEESE TEA",
      address: "78 Airport Blvd., #B2-274, Singapore 819666",
      phone: "60275830",
      hours: "Monday-Sunday: 11 am–10 pm",
      website: "https://www.lihotea.com/",
    },
    {
      id: "mrcoconut-jewel",
      name: "Mr Coconut @ Jewel",
      rating: 4.2,
      reviews: 161,
      location: "Jewel Changi Airport",
      tags: ["Bubble Tea", "Coconut", "Fresh"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqF4AMmqxwSGZwH3Dpk102vIzpzx2b5uPgbe6pRq_8NPdrKVldxM9ubwLjKcuSC17WDyPh0LhQ1rWYe5HjbDSxhdXAK2DBk5m-Q=s4800-w500",
      description:
        "Specializing in coconut-based drinks with fresh coconut juice and coconut shakes with various toppings.",
      area: "east",
      tag: "COCONUT",
      address: "78 Airport Blvd., #B2 - 268, Singapore 819666",
      phone: "60150302",
      hours:
        "Monday-Thursday & Saturday-Sunday: 10:30 am–9:15 pm, Friday: 10:30 am–8:30 pm",
      website: "Not available",
    },
    {
      id: "eachacup-causeway",
      name: "Each A Cup @ Causeway Point",
      rating: 3.9,
      reviews: 68,
      location: "Causeway Point",
      tags: ["Bubble Tea", "Affordable", "Local Brand"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFG9G0gosYjhqer2_4fXAJ9R7YbstqdfepcT5_hEuV_e1IqIgpwlnANVc5tdZtFV45yP6kItyIbKnvjQHKfM2SOQRnA-S-fT_0=s4800-w800",
      description:
        "One of Singapore's oldest bubble tea brands offering a wide range of affordable bubble tea drinks since 2000.",
      area: "north",
      tag: "AFFORDABLE",
      address: "1 Woodlands Square, #B1-K19 Causeway Point, Singapore 738099",
      phone: "98572324",
      hours: "Monday-Sunday: 10 am–10 pm",
      website: "http://www.each-a-cup.com/",
    },
    {
      id: "gongcha-causeway",
      name: "Gong Cha @ Causeway Point",
      rating: 3.4,
      reviews: 45,
      location: "Causeway Point",
      tags: ["Bubble Tea", "Taiwanese", "Classic"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDx7OnpzDj8y9z4-uvTQNkRRnrC6mLaaCG0nrHfPau2wKJZQOfXlxy5T_-La-P7sFFY0xKLuVhNezLI5ZEd4luDZ4BPqjRAUkYNRcDkerCaDNmAYLPbWu9Q7B-8NLuLxsNYbb-QeeUSBo3YQ0g=s4800-w800",
      description:
        "Popular Taiwanese bubble tea chain known for their wide range of tea-based drinks and customizable options.",
      area: "north",
      tag: "CLASSIC",
      address: "1 Woodlands Square, #02-K10 Causeway Point, Singapore 738099",
      phone: "62002288",
      hours: "Monday-Sunday: 10 am–10 pm",
      website: "https://www.gong-cha-sg.com/",
    },
    {
      id: "chicha-suntec",
      name: "CHICHA San Chen @ Suntec City",
      rating: 4.7,
      reviews: 407,
      location: "Suntec City",
      tags: ["Bubble Tea", "Taiwanese", "Premium"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzLvPOZqi1MJnqOq2k0CFo8AV9fG3pAFPK6koP1MVdshD5OnjfkJx1m5suRnNzr_qLGiNjyoF2Y-kBPdiSbTLEORIGqlZy1bpzi3vQAJejZuXYL2da56-G19ZPELLCv2ac9L7dHfJx8pr4jhg=s4800-w800",
      description:
        "Award-winning premium Taiwanese tea brand known for their hand-shaken fresh tea and high-quality ingredients.",
      area: "central",
      tag: "PREMIUM",
      address: "Temasek Boulevard, 3 号, CourtB1-169 SG Suntec CityFountain",
      phone: "+65 6327 8280",
      hours: "Monday to Sunday 11 am–9:30 pm",
      website: "https://www.chichasanchen.com.sg",
    },
    {
      id: "mrcoconut-suntec",
      name: "Mr. Coconut",
      rating: 4.0,
      reviews: 43,
      location: "Suntec City",
      tags: ["Bubble Tea", "Coconut", "Fresh"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDznnZDOUWTjZhS35xeAl92LpAbZrgpHsyapwAgRPP1yKuVxKrF3IDUyxckH8fOoQZxKC_yD6x8YT-YepU2uSNDNazJZW8l2AlldY88GlxQfmL8C2Eh48h2_A_eSclZMEkOCcODXYnC5UL0u1Xngaa3AxA=s4800-w800",
      description:
        "Specializing in coconut-based drinks with fresh coconut juice and coconut shakes with various toppings.",
      area: "central",
      tag: "COCONUT",
      address: "3 Temasek Blvd, #01-K3, Singapore 038983",
      phone: "+65 6015 0341",
      hours: "Monday to Sunday 11 am–9:45 pm",
      website: "https://mrcoconut.com.sg",
    },
    {
      id: "playground-suntec",
      name: "Playground by PlayMade",
      rating: 4.8,
      reviews: 59,
      location: "Suntec City",
      tags: ["Bubble Tea", "Handmade Pearls", "Colorful"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxlS4FTv57SbFkpWxmlQDgerlhXOsCcr8q5m7x3P0hQdn2A39pGANJSurqbUPD8GBL9fHUY9p0JS1LjPqXs91PP6LCRan73vjXjHpLmZaAIqKHZl92ww7t3aCa4mXdggrYf02sw17nTfRgEAM7hpOpJyA=s4800-w800",
      description:
        "Known for their handmade pearls in unique flavors and vibrant colors made fresh daily.",
      area: "central",
      tag: "HANDMADE",
      address: "3 Temasek Blvd, #B1-152, Singapore 038983",
      phone: "+65 9139 3419",
      hours:
        "Monday to Thursday 11 am–10 pm, Friday to Saturday 11 am–10:30 pm, Sunday 11 am–10 pm",
      website: "https://playmade.sg",
    },
    {
      id: "whaletea-suntec",
      name: "The Whale Tea SG - Suntec City Mall",
      rating: 4.2,
      reviews: 101,
      location: "Suntec City",
      tags: ["Bubble Tea", "Chinese", "Fruit Tea"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGAyYE5_Pa7UHdPfcHJgdhsIlG1AE_usHUMPBuCCb6qo8n2OOtu9ACSerwta02UE07RlST17ZhGzsPN-yIf7dWORXCrZDgoiu4=s4800-w800",
      description:
        "Chinese bubble tea brand famous for their fruit-based beverages and innovative flavors.",
      area: "central",
      tag: "FRUIT TEA",
      address:
        "3 Temasek Boulevard #02-470 (Tower #1 Suntec City Mall), 038983",
      phone: "+65 8799 8336",
      hours: "Monday to Sunday 10 am–10 pm",
      website: "https://thewhaletea.sg",
    },
    {
      id: "liho-suntec",
      name: "LiHO TEA @ Suntec City B1",
      rating: 3.8,
      reviews: 148,
      location: "Suntec City",
      tags: ["Bubble Tea", "Cheese Tea", "Local Brand"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGQ4Xw278LVTBjkkHIAcjVwi1E-uoq-BImj1vdOkUyZZUDJ4CI5bZF5UYbLG_LvpKyT8E3mlGDZGfCal96XMTc08o0PowS0YqE=s4800-w640",
      description:
        "Popular local bubble tea chain known for introducing cheese tea to Singapore and creative seasonal flavors.",
      area: "central",
      tag: "CHEESE TEA",
      address: "3 Temasek Blvd, #B1-175 Singapore (Tower 4), Singapore 038983",
      phone: "+65 6027 5842",
      hours:
        "Monday to Thursday 11 am–10 pm, Friday to Saturday 11 am–10:30 pm, Sunday 11 am–10 pm",
      website: "https://www.lihotea.com",
    },
    {
      id: "koi-suntec",
      name: "KOI Thé",
      rating: 4.0,
      reviews: 134,
      location: "Suntec City",
      tags: ["Bubble Tea", "Golden Bubble", "Milk Tea"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFo8uTYzFGhYuro4DxIES1OOPY53rOjNBbmbhfV8reU8DSL4ZyjeTrxdJ29xNRexQbH70kVziShW3eXrY9ZH29IZuACpKwUm6k=s4800-w600",
      description:
        "One of Singapore's most established bubble tea brands known for their signature milk tea and golden bubble.",
      area: "central",
      tag: "CLASSIC",
      address: "3 Temasek Blvd, #01-432 Suntec City Mall, Singapore 038983",
      phone: "+65 6931 5497",
      hours: "Monday to Sunday 11 am–10 pm",
      website: "https://koithe.com",
    },
    {
      id: "chicha-plaza",
      name: "CHICHA San Chen @ Plaza Singapura",
      rating: 4.6,
      reviews: 583,
      location: "Plaza Singapura",
      tags: ["Bubble Tea", "Taiwanese", "Premium"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwXC4GprYXjKprkWyYQECgAzFyIlP0pTMv1InLv2F586tlMfbb8N-O0bC05bPtflSK0LCvf5b4aupzEY-OOlGUfUB3ECnhIAqIMqNiWYuMqrjCLoIzHKyC7FqrJuMhUoHBJXmC6xUWznTvacfU=s4800-w800",
      description:
        "Award-winning premium Taiwanese tea brand with high-quality tea leaves and brewing techniques.",
      area: "central",
      tag: "PREMIUM",
      address: "68 Orchard Rd, B1-K7 Plaza Singapura, Singapore 238839",
      phone: "Not available",
      hours:
        "Monday-Thursday, Sunday: 11 am–9:15 pm, Friday-Saturday: 11 am–9:30 pm",
      website: "https://www.chichasanchen.com.sg/",
    },
    {
      id: "koi-woodleigh",
      name: "KOI Thé @ Woodleigh Mall",
      rating: 2.6,
      reviews: 28,
      location: "The Woodleigh Mall",
      tags: ["Bubble Tea", "Golden Bubble", "Milk Tea"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGF1dBubJB5r-nHc2SaaCCnDC_I7lBHHDEv5Lto0GoVpgQzXWNb1IZdJfRwjVmGP_KYuRTcHyGSbve0FEdZtfDW73IzX3SETI0=s4800-w600",
      description:
        "One of Singapore's most established bubble tea brands known for their signature milk tea and golden bubble.",
      area: "north-east",
      tag: "CLASSIC",
      address: "11 Bidadari Park Dr, B1-K53, Singapore 367803",
      phone: "+65 6025 2245",
      hours: "Monday to Sunday 11 am–10 pm",
      website: "https://www.koithe.com/en/global/koi-singapore",
    },
    {
      id: "mrcoconut-woodleigh",
      name: "Mr. Coconut @ Woodleigh",
      rating: 4.0,
      reviews: 54,
      location: "The Woodleigh Mall",
      tags: ["Bubble Tea", "Coconut", "Fresh"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzP80geuBd6fteVsSytncEskIxRKmCwzCL-7kPDzzVo6JdpMM-UpXpTbwgWuWzA_z7i49ozTMIZzM7AxPDoUgBJHF5-KYn3lM9KpWipz46xZQDqnBscL6qrnhGNTT1Pmv9GKc9xg-w8Fl_HOgsv00ZTvw=s4800-w800",
      description:
        "Specializing in coconut-based drinks with fresh coconut juice and coconut shakes with various toppings.",
      area: "north-east",
      tag: "COCONUT",
      address: "Mall, 11 Bidadari Park Drive, B1-K27 The Woodleigh, 367803",
      phone: "+65 6980 8174",
      hours: "Monday to Sunday 10 am–9:45 pm",
      website: "http://mrcoconut.sg",
    },
    {
      id: "chicha-woodleigh",
      name: "CHICHA San Chen @ Woodleigh Mall",
      rating: 4.8,
      reviews: 300,
      location: "The Woodleigh Mall",
      tags: ["Bubble Tea", "Taiwanese", "Premium"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDx9XCvBSWlATf7DAs7XXQ5gGb8jBT6LDIqrjsaunJ3dBCMFOcT6Pqsv51lL0Q7el7i1iVYTlY96xEZNhSZLv3jDbCmxjpmRzPM3sfdBDMZda7zn-raqMLiVvbwWP0Dl3qwe0ohgSIPJJqj6rA=s4800-w800",
      description:
        "Award-winning premium Taiwanese tea brand with high-quality tea leaves and brewing techniques.",
      area: "north-east",
      tag: "PREMIUM",
      address:
        "11 Bidadari Park Dr, #01-32 The Woodleigh Mall, Singapore 367803",
      phone: "+65 6909 1542",
      hours:
        "Monday to Thursday 11 am–9 pm, Friday to Saturday 11 am–9:30 pm, Sunday 11 am–9 pm",
      website: "http://www.chichasanchen.com.sg",
    },
    {
      id: "no17tea-woodleigh",
      name: "No.17 Tea - Woodleigh",
      rating: 4.8,
      reviews: 304,
      location: "The Woodleigh Mall",
      tags: ["Bubble Tea", "Taiwanese", "Fresh Milk"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxz4nlsoowH50C1b9TSJxTQbYQCcjsVPqUufinvmdBomdst2MVbQX6KQBbxdkw9dY4wFPCnGCjO0xZKBZvcSmpviuif8RiC9JtCTrYs-ik3l-dljjW2wxq5Iil8bC3xJFnYTnscdOEB_GzRibcMoOMLmA=s4800-w800",
      description:
        "Specializes in fresh milk teas with high-quality tea leaves and fresh milk.",
      area: "north-east",
      tag: "FRESH MILK",
      address: "11 Bidadari Park Dr, B1-03, Singapore 367803",
      phone: "+65 8777 0017",
      hours: "Monday to Sunday 11 am–9:30 pm",
      website: "-",
    },
    {
      id: "playmade-vivocity",
      name: "PlayMade @ VivoCity",
      rating: 3.9,
      reviews: 94,
      location: "VivoCity",
      tags: ["Bubble Tea", "Handmade Pearls", "Colorful"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyWH-sx6IfITx4D1qP7b8boozf4jL_bPKJOvZZbUXGtqx1PyKdFrbeKllik0CsrZRUBiHShkc423M0LfFp9oXC7ldONMH4bELX3BSQLHpF1tbK8prw490sKrH1U1Y-9MbN3oeKm0nQLtb3KNGE=s4800-w800",
      description:
        "Known for their handmade pearls in unique flavors and vibrant colors made fresh daily.",
      area: "central",
      tag: "HANDMADE",
      address: "Vivo City, #02-118, 1 HarbourFront Walk, 098585",
      phone: "90883712",
      hours: "Monday-Friday: 11 am–10 pm, Saturday-Sunday: 10:30 am–10 pm",
      website: "https://www.playmade.com.sg/",
    },
    {
      id: "itea-amkhub",
      name: "iTEA - AMK HUB",
      rating: 4.5,
      reviews: 250,
      location: "AMK Hub",
      tags: ["Bubble Tea", "Taiwanese", "Affordable"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGcxh1GJcoD3SAJomfnKfxdk1jLBoZLYQnX3h9o3dhM7kv0Y6jh3xQUqije8IcsahNygAxJQKXKUbOuKvpaurnJSi_egD2xbfQ=s4800-w417",
      description:
        "Offers a wide range of affordable bubble tea drinks with quality ingredients and customizable sugar levels.",
      area: "north",
      tag: "AFFORDABLE",
      address: "53 Ang Mo Kio Ave 3, B1-66/67/68 AMK Hub, Singapore 569933",
      phone: "Not available",
      hours:
        "Monday to Friday: 11 am–9:45 pm; Saturday to Sunday: 10:30 am–9:45 pm",
      website: "http://www.itea.sg/",
    },
    {
      id: "eachacup-amkhub",
      name: "Each A Cup",
      rating: 4.0,
      reviews: 8,
      location: "AMK Hub",
      tags: ["Bubble Tea", "Affordable", "Local Brand"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEW2BHuE4_XMZV-kkBaWne3VVHEs2KGiftdwxLdQmOKqXsyzNr3iKrHaxKvGuNAH8XYSCyqJ44-2wnpWVt2lY9nxm_YlTOxv3c=s4800-w800",
      description:
        "One of Singapore's oldest bubble tea brands offering a wide range of affordable bubble tea drinks since 2000.",
      area: "north",
      tag: "AFFORDABLE",
      address: "53 Ang Mo Kio Ave 3, B2-32 AMK HUB",
      phone: "92331993",
      hours: "Monday to Sunday: 7:30 am–10 pm",
      website: "http://www.each-a-cup.com/",
    }
  ],
  deals: [
    {
      id: "deal1",
      badge: "1-FOR-1",
      title: "1-for-1 Classic Milk Tea at CHICHA San Chen",
      duration: "Valid till: 30 May 2025",
      description:
        "Buy one Classic Milk Tea and get one free at any CHICHA San Chen outlet. Valid Monday to Thursday, 2pm-5pm.",
      code: "CHICHI121",
    },
    {
      id: "deal2",
      badge: "20% OFF",
      title: "20% OFF Any Drink at LiHO TEA",
      duration: "Valid till: 15 Jun 2025",
      description:
        "Enjoy 20% off any drink at LiHO TEA outlets islandwide. Not valid with other promotions. T&Cs apply.",
      code: "LIHO20",
    },
    {
      id: "deal3",
      badge: "FREE",
      title: "Free Pearl Topping with Any Mr. Coconut Purchase",
      duration: "Valid till: 20 May 2025",
      description:
        "Enjoy a complimentary pearl topping with any drink purchase at all Mr. Coconut outlets.",
      code: "COCONUT25",
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
      name: "Western",
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      url: "/cuisine/western",
    }
  ],
};
