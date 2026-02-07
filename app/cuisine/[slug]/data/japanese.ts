import type { CuisineData } from "./types";

export const JAPANESE_CUISINE: CuisineData = {
  slug: "japanese",
  name: "Japanese",
  tagline: "From sushi to ramen, find the best Japanese food near you",
  features: [
    { label: "Sushi" },
    { label: "Ramen" },
    { label: "Yakiniku" },
    { label: "Tempura" },
    { label: "Tonkatsu" }
  ],
  heroImages: [
    "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=800&q=80"
  ],
  stats: {
    restaurants: 37,
    menuItems: "4,000+",
    deals: 3,
    malls: 12,
  },
  restaurants: [
    {
      id: "koma-singapore",
      name: "KOMA Singapore",
      rating: 4.3,
      reviews: 2511,
      location: "Marina Bay Sands",
      tags: ["Japanese", "Fine Dining", "Sushi"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqF4VxWQbkJ7hP_IWfNF6BznrpIwH3VdgM9bj7iGskMhbHGfHiTuCGpRkTAw3khzsnIa4A8tyiOr6tLeGmY8UVKnKJ2B27PuRnc=s4800-w800",
      description:
        "Contemporary Japanese restaurant with stunning interiors offering a diverse menu of sushi, robatayaki and more.",
      area: "south",
      tag: "FINE DINING",
      address:
        "10 Bayfront Ave, B1-67 The Shoppes, Marina Bay Sands, Singapore 018956",
      phone: "+65 6688 8690",
      hours:
        "Monday to Thursday 11:30 am-2:30 pm, 5-11 pm, Friday to Saturday 11:30 am-2:30 pm, 5 pm-12 am, Sunday 11:30 am-2:30 pm, 5-11 pm",
      website: "https://www.marinabaysands.com/restaurants/komasingapore.html",
    },
    {
      id: "genki-sushi-city-square",
      name: "Genki Sushi",
      rating: 4.5,
      reviews: 1008,
      location: "City Square Mall",
      tags: ["Japanese", "Sushi", "Conveyor Belt"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDw0MBOB6seJxZwR3sSmWaJkdO994QZMkXTJGf0VpCJoPWuYam_SOsyeUBLFCIjfLe1pox1N6wImy1U0nFsMqHr8OnD81mo-bdia4FR3gY-6CXya01YsSnC8yI7okLH2guVaucbVoLg1ImvVqQ=s4800-w800",
      description:
        "Popular conveyor belt sushi restaurant offering a wide variety of fresh sushi and Japanese dishes at affordable prices.",
      area: "north-east",
      tag: "POPULAR",
      address: "180 Kitchener Rd, #02-37/38 City Square Mall, Singapore 208539",
      phone: "69748040",
      hours: "Monday to Sunday 11 am-10 pm",
      website: "https://www.genkisushi.com.sg/",
    },
    {
      id: "ajisen-ramen-junction8",
      name: "Ajisen Ramen",
      rating: 3.9,
      reviews: 346,
      location: "Junction 8",
      tags: ["Japanese", "Ramen", "Noodles"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwfwtIEoCtXKrmft-mFpmyM5tx_3v7HQpe84FO1IR3taMu2HKLStcAMo-tGjxkKbbleXGYWJfWy9gROEKfpjEmfEmFHy1SXyXJ22TwOnZsPLDRzdnO3gkzrgZAdP40hi6wE3CRXuLZ2i3sA=s4800-w800",
      description:
        "Popular ramen chain serving authentic Kyushu-style tonkotsu ramen and various Japanese side dishes.",
      area: "north",
      tag: "RAMEN",
      address: "9 Bishan Pl, #B1-19 Junction 8, Singapore 579837",
      phone: "62556642",
      hours: "Monday to Sunday 11:30 am-10 pm",
      website: "https://www.ajisen.com.sg/",
    },
    {
      id: "sushi-tei-united-square",
      name: "Sushi Tei",
      rating: 4.1,
      reviews: 1773,
      location: "United Square",
      tags: ["Japanese", "Sushi", "Family Friendly"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipOF25lfh-b0X-FtuU9qQGNamwejZQJ_nhB9ltYd=w408-h306-k-no",
      description:
        "Well-established Japanese restaurant offering a wide variety of sushi, sashimi and cooked dishes.",
      area: "central",
      tag: "AUTHENTIC",
      address:
        "101 Thomson Rd, #B1-10 United Square Shopping Mall, Singapore 307591",
      phone: "62831679",
      hours: "Monday to Sunday 11:30 am-10 pm",
      website: "https://www.sushitei.com",
    },
    {
      id: "tempura-makino",
      name: "Tempura Makino",
      rating: 4.8,
      reviews: 2220,
      location: "VivoCity",
      tags: ["Japanese", "Tempura", "Fine Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxHueOxjwraO1F-qoJl6D-7iGxx63B2qYoqOwGl7PNv5ZIaNBayK6RYedd4GVP3Jfn8FopNI0TPltAo3CuoL5OZsu5yQCPEkNHJ_SwxIXmT3qfGHJ9HTcPRSRxaEB7VgZBpCelewR2P2uESkQ=s4800-w800",
      description:
        "Premium tempura restaurant offering an authentic Japanese dining experience with high-quality ingredients.",
      area: "central",
      tag: "PREMIUM",
      address: "1 HarbourFront Walk, #02-111 VivoCity, Singapore 098585",
      phone: "62732088",
      hours: "Monday to Sunday 11 am-10 pm",
      website: "https://www.tempuramakino.com.sg",
    },
    {
      id: "ichiban-boshi-united-square",
      name: "Ichiban Boshi",
      rating: 4.5,
      reviews: 619,
      location: "United Square",
      tags: ["Japanese", "Sushi", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxgp8XC66f5DE0DQp-wQ4B-uckRf_5lpWbSGGHyRBWuC0FoN-tE9QoWc7xDv7uWhLWmKP2EWhd52UKEFCkGp5cVpDFUA0WiPTJP15nLw1fSLzX9uU1SbDMOB1n-XjfbLhoGAWDHA1lCsDBQTpw=s4800-w800",
      description:
        "Family-friendly Japanese restaurant offering a wide range of sushi, sashimi and cooked dishes at reasonable prices.",
      area: "central",
      tag: "FAMILY FAVORITE",
      address: "101 Thomson Rd, #02-02 United Square, Singapore 307591",
      phone: "62587786",
      hours: "Monday to Friday, Sunday 11 am-9:30 pm, Saturday 11 am-10 pm",
      website: "http://www.ichibanboshi.com.sg/en/",
    },
    {
      id: "aburi-en-vivocity",
      name: "Aburi-EN",
      rating: 4.7,
      reviews: 998,
      location: "VivoCity",
      tags: ["Japanese", "Grilled", "Don"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGSHbnyFoTPPGemWxNnEEQwSE2ZJIGIB3PEYTHl3vdCwmbgzrx7Jt4M_wbvfd50pfG36Io6Qhfpm4jMtuSr6GM_sDqyYEtkqQ=s4800-w800",
      description:
        "Specializing in aburi (flame-seared) dishes, particularly donburi (rice bowls) with premium toppings.",
      area: "central",
      tag: "SPECIALTY",
      address: "1 HarbourFront Walk, #01-159/160 VivoCity, Singapore 098585",
      phone: "62599603",
      hours: "Monday to Sunday 11 am-10 pm",
      website: "http://aburi-en.com/menu",
    },
    {
      id: "sushiro-suntec",
      name: "Sushiro",
      rating: 4.3,
      reviews: 1147,
      location: "Suntec City",
      tags: ["Japanese", "Sushi", "Conveyor Belt"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDx3AgV6uPDi9JWTL6DoqNP4GLmX_VBGgsMLGZZqSZt-ec5rQorl1eEImL_1AZpd9YBX5qK0oMtJ0irPYuVCcZygqPeSV4z-Q5ksIALV9mE_cJVuB9spPLqR3_DkKRkUShSFxNSa5N9Fqmm2V9TqrXn-tw=s4800-w800",
      description:
        "Popular Japanese conveyor belt sushi chain known for its quality and affordability.",
      area: "central",
      tag: "AFFORDABLE",
      address: "3 Temasek Blvd, #01-649 Suntec City, Singapore 038983",
      phone: "+65 6970 6610",
      hours: "Monday to Sunday 11 am-10 pm",
      website: "https://www.sushiro.sg",
    },
    {
      id: "yakiniku-go",
      name: "Yakiniku-GO",
      rating: 4.5,
      reviews: 508,
      location: "Suntec City",
      tags: ["Japanese", "BBQ", "Grill"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxq-VE_3Fjf9zfDQCMtYnthPjPbf7A16vofk_vpNv71GRL0HGFHDeF2phZG7mGUL78-rZ4cijRKJvcyqQVGbkcSmebXj4CgpxG1kUSvmIzE4YrB0rAA3EIcbwR6QgRLE9fWlqwWHhiPfHXQVFc=s4800-w800",
      description:
        "Affordable Japanese BBQ restaurant offering quality grilled meats and set meals.",
      area: "central",
      tag: "BBQ",
      address: "3 Temasek Blvd, #01-353, Singapore 038983",
      phone: "+65 6250 2633",
      hours: "Monday to Friday 11:30 am-10 pm, Saturday to Sunday 11 am-10 pm",
      website: "https://www.yakinikunikuya.com.sg",
    },
    {
      id: "yayoi-united-square",
      name: "YAYOI Japanese Restaurant",
      rating: 4.4,
      reviews: 440,
      location: "United Square",
      tags: ["Japanese", "Set Meals", "Teishoku"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHikNInryQrHCLuSpxVsdyBER7s_XEXrDlNEDItDw8vCUgbbF5sbjzyFm4jvqkPMfytU7FqKhNdln8HFsO6AjGu5baV0DG4xzQ=s4800-w800",
      description:
        "Authentic Japanese restaurant specializing in teishoku (set meals) with a variety of options.",
      area: "central",
      tag: "SET MEALS",
      address: "United Square Thomson Rd, #B1-54/55 101 307591",
      phone: "63527889",
      hours: "Monday to Sunday 10:30 am-9 pm",
      website: "https://www.yayoi.sg/",
    },
    {
      id: "monster-curry",
      name: "Monster Curry",
      rating: 4.6,
      reviews: 977,
      location: "Suntec City",
      tags: ["Japanese", "Curry", "Spicy"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDw6qngKIiTo83ZN-cNCuZfxMQb4voJg-6EGPKpboqbCIR_MKcKN8t0J4cOeVZ71mvVdiLWVq2AcvN6DSBJ_77X0wdQjK5z1m3J3LNXWYE6noOa7TtJMkETHbGtAFB-7a-GZYbJ0LRdpLL0JWQ=s4800-w800",
      description:
        "Known for their demi-glace Japanese curry that comes in various spice levels and generous portions.",
      area: "central",
      tag: "CURRY",
      address: "3 Temasek Blvd, #02-377 / 378, Singapore 038983",
      phone: "+65 6358 2377",
      hours: "Monday to Sunday 11 am-10 pm",
      website: "https://www.monstercurry.com.sg",
    },
    {
      id: "tonkatsu-enbiton",
      name: "Tonkatsu ENbiton",
      rating: 4.5,
      reviews: 197,
      location: "Suntec City",
      tags: ["Japanese", "Tonkatsu", "Pork"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHdO1T2uLEQYGVY2ENfXLrCMlPRSV64q-WWctCCgIL4lPCjSQ04zR6oXhp0c91ocJAhc93k_bJf9T_x6rsjpHHlYIV0kzydOq4=s4800-w800",
      description:
        "Specializing in premium tonkatsu (Japanese breaded pork cutlets) that are crispy on the outside and tender inside.",
      area: "central",
      tag: "TONKATSU",
      address: "3 Temasek Blvd, #B1-170 / 171, Singapore 038983",
      phone: "+65 6970 8837",
      hours: "Monday to Sunday 11 am-10 pm",
    },
    {
      id: "genki-sushi-woodleigh",
      name: "Genki Sushi",
      rating: 4.6,
      reviews: 2683,
      location: "Woodleigh Mall",
      tags: ["Japanese", "Sushi", "Conveyor Belt"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwvMo_XdE5xQNpOsQIzNRTUPi7J821QDa2GcpWYylrivK5f6SQVk869AbZE3LOdcxS7GEdWnh9lSlLSQx-VQeSoM8zBPNoOcjOgcW2p-6HZdwfd6V9DE3KcON_YaXLCyo38RJ6MSFuOFaJL8mg=s4800-w800",
      description:
        "Modern conveyor belt sushi restaurant offering fresh sushi and various Japanese dishes in a family-friendly setting.",
      area: "north-east",
      tag: "FAMILY FRIENDLY",
      address: "11 Bidadari Park Dr, #01-31, Singapore 367803",
      phone: "+65 6025 2250",
      hours: "Monday to Sunday 11 am-10 pm",
      website: "https://www.genkisushi.com.sg",
    },
    {
      id: "yakiniku-like",
      name: "Yakiniku Like",
      rating: 4.6,
      reviews: 523,
      location: "Suntec City",
      tags: ["Japanese", "BBQ", "Affordable"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHAMENaF-rZYKO6G_Te4jEkEP7vYeZg8ts2Leix-5mMw1gxYMlpxKhEHyQWQ5dkMfCQD8G9-ahH9bHdO_x1QoE6PD7UfDXsO8c=s4800-w800",
      description:
        "Solo-friendly Japanese BBQ restaurant offering quality grilled meats at affordable prices.",
      area: "central",
      tag: "SOLO DINING",
      address: "3 Temasek Blvd, #02-603 / 604, Singapore 038983",
      phone: "+65 6993 7656",
      hours: "Monday to Sunday 11 am-10 pm",
      website: "https://www.yakiniku-like.com.sg",
    },
    {
      id: "sushi-tei-vivocity",
      name: "Sushi TEI",
      rating: 4.2,
      reviews: 935,
      location: "VivoCity",
      tags: ["Japanese", "Sushi", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHSysqE_NXsa5UJwI9lct5DXz4J9iYdmi4oHKdXsVab_l2TxLqWl5BSnGVOQe4qk29O9WfKHOf-YVLZyEj1NBmYpYt5hBUwQvw=s4800-w800",
      description:
        "Popular Japanese restaurant offering a wide range of sushi, sashimi and cooked dishes in a comfortable setting.",
      area: "central",
      tag: "POPULAR",
      address: "1 HarbourFront Walk, #02 - 152, Singapore 098585",
      phone: "63769591",
      hours: "Monday to Sunday 11:30 am-10 pm",
      website: "https://sushitei.com/grand-menu/",
    },
    {
      id: "kei-kaisendon",
      name: "Kei Kaisendon",
      rating: 4.5,
      reviews: 67,
      location: "VivoCity",
      tags: ["Japanese", "Donburi", "Fresh"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyu2AR0M4lZ9oISHOhe0mrb-pw4U-7VUlgz7F-hvaqBnhU4iavbKxnQ3ciK6R7PMHu0Q9Di3OXl-psndiasVQaNWzut39JN2E5OPTlXrYwEG9m0zZqcdzAvpQfJ0BW6XmGRCcaNMhw39pVZ2w=s4800-w800",
      description:
        "Specializing in kaisendon (seafood rice bowls) with premium toppings including fresh sashimi.",
      area: "central",
      tag: "DONBURI",
      address: "1 HarbourFront Walk, #02-136, Singapore 098585",
      phone: "65189926",
      hours: "Monday to Sunday 11 am-10 pm",
    },
    {
      id: "ajisen-ramen-amk",
      name: "Ajisen Ramen",
      rating: 4.0,
      reviews: 321,
      location: "AMK Hub",
      tags: ["Japanese", "Ramen", "Noodles"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipP-6fC7c3JLUlDn_AfR0_iGGLjIVwcFB3UYZ8al=w408-h306-k-no",
      description:
        "Popular ramen chain serving authentic Kyushu-style tonkotsu ramen and various Japanese side dishes.",
      area: "north",
      tag: "RAMEN",
      address: "53 Ang Mo Kio Ave 3, AMK Hub, #02 - 19/20/21, Singapore 569933",
      phone: "64818861",
      hours: "Monday to Sunday 11 am-10 pm",
      website: "https://www.ajisen.com.sg/",
    },
    {
      id: "pepper-lunch-amk",
      name: "Pepper Lunch",
      rating: 3.9,
      reviews: 708,
      location: "AMK Hub",
      tags: ["Japanese", "Fast Food", "Teppanyaki"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwsNnVJR0z1TO66HIfssBWmWImFXnCgzbCKKJUZDCTdfgYU020fG4PWu_n9cS4bV2NrH8MGYn2gNBk7dowddr4aECfY0S5OL4EO_yJ1OWGbXt06kEOVqtsO1B54XOG7HiXtCqXY_VA-eJ5Qfj8=s4800-w800",
      description:
        "Fast-casual teppanyaki restaurant where customers cook their own meals on a sizzling hot plate.",
      area: "north",
      tag: "SIZZLING PLATES",
      address: "53 Ang Mo Kio Ave 3, #01-34, Singapore 569933",
      phone: "67525886",
      hours: "Monday to Sunday 10 am-10 pm",
      website: "https://pepperlunch.sg/",
    },
    {
      id: "genki-sushi-plaza-singapura",
      name: "Genki Sushi",
      rating: 4.5,
      reviews: 1042,
      location: "Plaza Singapura",
      tags: ["Japanese", "Sushi", "Conveyor Belt"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzuE_ZNte_2nY50W7rC48rMcj3tDxB6lCWE7zZPyPmp2GO2o6opnkMxVLtZ8pu7RZQxwRAuqjo4QiZ3-t537MDtnY1dKTfQ-XZMGtcW2kEkDUxJDSFJgTFWxsHISA9l5n99e56jBtG3HbZbGw=s4800-w800",
      description:
        "Popular conveyor belt sushi restaurant offering a wide variety of fresh sushi and Japanese dishes at affordable prices.",
      area: "central",
      tag: "POPULAR",
      address: "68 Orchard Rd, #06-05/06, Singapore 238839",
      phone: "69200740",
      hours: "Monday to Sunday 11 am-10 pm",
      website: "https://www.genkisushi.com.sg/",
    },
    {
      id: "genki-sushi-tampines",
      name: "Genki Sushi Tampines Mall",
      rating: 4.6,
      reviews: 4202,
      location: "Tampines Mall",
      tags: ["Japanese", "Sushi", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxGeMgf5NUNYR6xMhdpdi8lr5xCZ1U6cVOGZ53q-EDJTcTU_GWwIlTvY5zYRMM7kQ0lnhtAsx68fX_FOCQrpC8_pe9MlOjE8dKKGc_Wk1tv_G22o-TrBLLfbZLWE0w5Yb5Nh8NsFtIKhrQeSaQ=s4800-w800",
      description:
        "Popular sushi restaurant with a conveyor belt system offering fresh sushi and Japanese dishes.",
      area: "east",
      tag: "POPULAR",
      address:
        "4 Tampines Central 5, #03-26/27 Tampines Mall, Singapore 529510",
      phone: "68164574",
      hours: "Monday to Sunday: 11 am-10 pm",
      website: "https://www.genkisushi.com.sg/",
    },
    {
      id: "ajisen-tanjiro-tampines",
      name: "Ajisen Tanjiro",
      rating: 3.5,
      reviews: 354,
      location: "Tampines Mall",
      tags: ["Japanese", "Ramen", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyiiyekFxIRBcKD3hx5FeeDhBe3YRX78Forcu-VpSzkhHZEB7Xj3RF92ZQJPghQZ3v_zrRV60bpPgvzdjPBFezV7vD9IKTJRCeeMf8Wsw2zJO_QDCFMWqnQzmCQ_zZ2YtFwhaLGAmpp8ihmkzKAkTNFpw=s4800-w800",
      description:
        "Japanese ramen restaurant offering authentic Kyushu-style tonkotsu ramen and side dishes.",
      area: "east",
      tag: "RAMEN",
      address:
        "4 Tampines Central 5, #04-19/20 Tampines Mall, Singapore 529510",
      phone: "67876422",
      hours: "Monday to Sunday: 11 am-10 pm",
      website: "https://ajisen.com.sg/",
    },
    {
      id: "ajisen-tanjiro-hougang",
      name: "Ajisen Tanjiro",
      rating: 3.8,
      reviews: 190,
      location: "Hougang Mall",
      tags: ["Japanese", "Ramen", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxWYkb9-_5xTHcOuZnBz30WlONGiHTx1ce6AxKz9qp1-IL8hQxsougktScIoAwi6udwEpreJJQ8GMyO7dF-ytnWC28XyM6IRmtkywrUKlXlOD-9ki-wpf5CRhctX69EgIRXNGuUhZAfbLhdDOsCTRaIxg=s4800-w800",
      description:
        "Popular ramen chain serving authentic tonkotsu ramen and Japanese side dishes in a casual setting.",
      area: "north-east",
      tag: "RAMEN",
      address: "90 Hougang Ave 10, #01-26, Hougang Mall, Singapore 538766",
      phone: "63434229",
      hours: "Monday to Sunday: 11:30 am-10 pm",
      website: "https://www.ajisen.com.sg/",
    },
    {
      id: "ichiban-sushi-hougang",
      name: "Ichiban Sushi",
      rating: 4.4,
      reviews: 888,
      location: "Hougang Mall",
      tags: ["Japanese", "Sushi", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDz8JQX35u6HYCaNKOJQlUDc13Ib6AnqI-XMXgheFP2ya-Nn1Gs5U9VBgF5O3vTlua98SF0dSGieiMYCQsaaIqWxbgbAtfaBYLk8TeQzJZm6XxrkKhhzmlD27schJJd3B0jWwkJd823mPxpxwg=s4800-w800",
      description:
        "Family-friendly Japanese restaurant offering a wide variety of sushi, sashimi and cooked dishes.",
      area: "north-east",
      tag: "FAMILY FRIENDLY",
      address: "90 Hougang Avenue 10 #02-23, Hougang Mall, 538766",
      phone: "63867836",
      hours:
        "Monday to Friday: 11:30 am-10 pm, Saturday to Sunday: 11 am-10 pm",
      website: "http://www.ichibansushi.com.sg/en/",
    },
    {
      id: "ajisen-ramen-causeway",
      name: "Ajisen Ramen",
      rating: 3.7,
      reviews: 406,
      location: "Causeway Point",
      tags: ["Japanese", "Ramen", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDygUyfLLLfhFt2O4ovGjOsxlQr691D6jzgoxU8bxMDxZtcU3JXcaV9c5j-w_uocgz_OkQnNO4DQLUEkcgKb5WAeCFUY8ym7Go9BDBmJv8Yt5C6FBYeDUsiHvQqqSG-dM04_UnXzOILgEmb3=s4800-w800",
      description:
        "Popular ramen chain serving authentic Kyushu-style tonkotsu ramen and various Japanese side dishes.",
      area: "north",
      tag: "RAMEN",
      address: "1 Woodlands Square, #B1, #18 Causeway Point, Singapore 738099",
      phone: "68938212",
      hours:
        "Monday to Thursday: 11:30 am-10 pm, Friday to Sunday: 11 am-10 pm",
      website: "https://www.ajisen.com.sg/",
    },
    {
      id: "tonkatsu-ma-maison-jewel",
      name: "Tonkatsu by Ma Maison @ Jewel",
      rating: 4.3,
      reviews: 452,
      location: "Jewel Changi Airport",
      tags: ["Japanese", "Tonkatsu", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzDrfiHHVBZZxRbpbOvsDnXxiF1qmoajG7lSLLqLPkwHZsO3bEC1iZSKsnnAbFbQHDiaoQWGwf9C6ZzpEDL8C7bKPEUbHtL00sAIPmfIMV90p-abmD2XXw8Ja6YfSInLI4Yz_sHBOpuXw5lOw=s4800-w800",
      description:
        "Specializing in premium Japanese pork cutlets that are crispy on the outside and juicy on the inside.",
      area: "east",
      tag: "TONKATSU",
      address: "78 Airport Blvd., #02 - 211, Singapore 819666",
      phone: "62429322",
      hours: "Monday to Sunday: 11 am-10 pm",
    },
    {
      id: "sushiro-bedok",
      name: "Sushiro Bedok Mall",
      rating: 4.1,
      reviews: 743,
      location: "Bedok Mall",
      tags: ["Japanese", "Sushi", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxLf7BTolJGUELM7azQg6gR_60Zi2uKg479GsPLWl4sRmb3ADT4tlAj-PnaXd3yAaUN619ZwGc7TGBhvuhhn6nPJ01u6pV553tDRsYcrrXPPBqLMp_j97k1Rwa1a6Y5vIGE4wuxGo2UxdPSSQ=s4800-w800",
      description:
        "Popular Japanese conveyor belt sushi chain known for its quality and affordable prices.",
      area: "east",
      tag: "AFFORDABLE",
      address: "311 New Upper Changi Rd, #B1-10, Singapore 467360",
      phone: "69702568",
      hours: "Monday to Sunday: 11 am-10 pm",
      website: "https://linktr.ee/sushirosingapore",
    },
    {
      id: "ichiban-boshi-causeway",
      name: "Ichiban Boshi",
      rating: 4.5,
      reviews: 1495,
      location: "Causeway Point",
      tags: ["Japanese", "Sushi", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyIu1WwxWfwsiTJrx-evG0o5zq8erwMbwEzpDUFET-JpnrsLZ5NuSmYbXH7muMTCSovxm_JEEqIjafaH0m5LFC45qlZIcmQ14F1XzaYBn4W5XnprPAYae0fblbuRCtrkpp-32jJ1m5zgYKe=s4800-w800",
      description:
        "Popular family-friendly Japanese restaurant offering a wide range of sushi, sashimi and cooked dishes.",
      area: "north",
      tag: "FAMILY FAVORITE",
      address: "1 Woodlands Square, #05-06 Causeway Point, Singapore 738099",
      phone: "60163904",
      hours: "Monday to Sunday: 11 am-10 pm",
      website: "https://www.ichibanboshi.com.sg/",
    },
    {
      id: "aburi-en-causeway",
      name: "Aburi-EN",
      rating: 4.7,
      reviews: 1193,
      location: "Causeway Point",
      tags: ["Japanese", "Grilled Meat", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyAFLUbAitKegDKw6fFL05dSrkAOaPrsYJ3mauqV_O8hy1ZCaDGK9jZXk6YpnO_8ODO57H4NaK9HjQcqCJAIFnD5-hqo0-opiSeemFIx2DuvoSjKQHnaTnfxHSUs2U_0-Wl_wzdSjdGqAKP=s4800-w800",
      description:
        "Specializing in aburi (flame-seared) dishes, particularly donburi with premium toppings.",
      area: "north",
      tag: "SPECIALTY",
      address: "1 Woodlands Square, #02-09B Causeway Point, Singapore 738099",
      phone: "67602081",
      hours: "Monday to Sunday: 11 am-10 pm",
      website: "http://aburi-en.com/menu",
    },
    {
      id: "aburi-en-jem",
      name: "Aburi-EN (Jem)",
      rating: 4.6,
      reviews: 1162,
      location: "Jem",
      tags: ["Japanese", "Grilled Meat", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqE6RdqIiHaW1aE9BV95JLuzvq7Jz4u5U_o-plg-Rddbz_Egs-_9LuAtwrLVYvAiRNuSk7eejL06Fq3yh7g5MTOxmJ7W841A8Ik=s4800-w800",
      description:
        "Specializing in aburi (flame-seared) dishes with a focus on quality grilled meats.",
      area: "west",
      tag: "SPECIALTY",
      address: "50 Jurong Gateway Rd, #01-04 Jem, Singapore 608549",
      phone: "62620238",
      hours: "Monday to Sunday: 11 am-10 pm",
      website: "http://aburi-en.com/menu",
    },
    {
      id: "ajisen-tanjiro-bedok",
      name: "Ajisen Tanjiro",
      rating: 3.6,
      reviews: 113,
      location: "Bedok Mall",
      tags: ["Japanese", "Ramen", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzU_S7ImBxahrAYaMeiVN5R6cj_waWfviDncOBbWH4DmQPjF1LoBROgK8k28MWPR3emhVp3iMO_reXb0ZW4M0gC5WrwK9NWZo6n4N_2KJuBkFuE5NLPIXRPn8c0DLKyEJ8s7eSKWaBpJPIrYSBPvKn5pw=s4800-w800",
      description:
        "Japanese ramen restaurant serving authentic tonkotsu broth and various side dishes.",
      area: "east",
      tag: "RAMEN",
      address: "311 New Upper Changi Rd, #01-69 Bedok Mall, Singapore 467360",
      phone: "68449373",
      hours: "Monday to Sunday: 11:30 am-10 pm",
      website: "https://www.ajisen.com.sg/",
    },
    {
      id: "yakiniku-shokudo-bedok",
      name: "Yakiniku Shokudo",
      rating: 2.9,
      reviews: 63,
      location: "Bedok Mall",
      tags: ["Japanese", "BBQ", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyxyLQdGzoXFaomXWIVgYMWql8sLxeMIpaV4V20_JaGFrjwuWooAPELlpgEe6oLvLv9KlMk6VoS-Z6V_olwbu61QOJcuInbQjVuLsvPHny2q94ihFEY3lEju9Gh-yoSO6X2e-PCVbx7ByvMlyo=s4800-w800",
      description:
        "Casual Japanese BBQ restaurant where customers can grill their choice of meats at the table.",
      area: "east",
      tag: "BBQ",
      address: "New Upper Changi Rd, #B1-51 Bedok Mall, Singapore 467360",
      phone: "62410274",
      hours: "Monday to Sunday: 11:30 am-9:15 pm",
      website: "https://www.jfh.com.sg/html/brands.php",
    },
    {
      id: "yakiniku-shokudo-imm",
      name: "Yakiniku Shokudo",
      rating: 3.8,
      reviews: 182,
      location: "IMM",
      tags: ["Japanese", "BBQ", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwrx0CGMoR35e801O0ffMH9whoSPqEe8WRFyUnyUjIFFYhY8hxV1rpLXyuBskPiVezL4aJ6SkP8TMD828dZc6n4v9-b_RwF683n3pEZDHeldbDjIUSWHo1_X2d72A-9HoNgfNkcVFrh30D1fOg=s4800-w800",
      description:
        "Casual Japanese BBQ restaurant offering quality meats for grilling at your table.",
      area: "west",
      tag: "BBQ",
      address: "2 Jurong East Street 21, #02-53 IMM Building, Singapore 609601",
      phone: "62523364",
      hours: "Monday to Sunday: 11:30 am-10 pm",
    },
    {
      id: "yoshinoya-bedok",
      name: "Yoshinoya",
      rating: 3.5,
      reviews: 201,
      location: "Bedok Mall",
      tags: ["Japanese", "Fast Food", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyHWtft9yYfpRJwezbpA6JYyg9CDebSwshlnymOrVEunmxmGKd5MsR9Awt1pjogmmB8gALBtzCHpdSpPvrhJ3pTnKjyyCRyvTnGPeyRtavuu3LNTwpyna_99MWA-knJLPa32IpQxz0q0A8upA=s4800-w800",
      description:
        "Fast-casual Japanese restaurant famous for its signature gyudon (beef bowl).",
      area: "east",
      tag: "QUICK BITES",
      address: "311 New Upper Changi Rd, #B2-30, Singapore 467360",
      phone: "68449418",
      hours: "Monday to Sunday: 10 am-9:30 pm",
      website: "https://yoshinoya.com.sg/",
    },
    {
      id: "sushi-tei-jewel",
      name: "SUSHI TEI",
      rating: 3.5,
      reviews: 179,
      location: "Jewel Changi Airport",
      tags: ["Japanese", "Sushi", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwtQhrSjq0shT8vXKdE4BMQKnHJatWyK5We_8G0Ki-DOYdX8Qj0sYonwvMLjvJYWlgTGkpxG5K_FfBlIGDj0WiIm0L21g7f0Y3YpMzPBcjuvOOpmoTpMLcRo9OBkZCkZPfwiNC1jXlkizmsUCWk22r4=s4800-w800",
      description:
        "Popular Japanese restaurant offering a wide range of sushi, sashimi and cooked dishes.",
      area: "east",
      tag: "AUTHENTIC",
      address:
        "78 Airport Blvd., #03 - 209 Singapore Changi Airport, Singapore 819666",
      phone: "62431633",
      hours: "Monday to Sunday: 11:30 am-10 pm",
      website: "https://sushitei.com/grand-menu/",
    },
    {
      id: "ichiban-boshi-jem",
      name: "Ichiban Boshi",
      rating: 4.1,
      reviews: 593,
      location: "JEM",
      tags: ["Japanese", "Sushi", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwMtGjGbv8CwD1udiWUitpDVRqU3_Okebb8H9ihINVcVvaiXDNSsx-hii6BDIDoVVDSg2fU_yyRFeRj0yA-NPx6LQXMez5qfeCcxIbqKpuvKwN_ZGxx3ylDieKn9s2x7CSJk_GNkVq7bWwolg=s4800-w800",
      description:
        "Family-friendly Japanese restaurant with a wide variety of sushi, sashimi and hot dishes.",
      area: "west",
      tag: "FAMILY FRIENDLY",
      address: "50 Jurong Gateway Rd, #B1-01 Jem, Singapore 608549",
      phone: "66596186",
      hours:
        "Monday to Friday: 11:30 am-10 pm, Saturday to Sunday: 11 am-10 pm",
      website: "http://www.ichibanboshi.com.sg/en/",
    }
  ],
  deals: [
    {
      id: "deal1",
      badge: "15% OFF",
      title: "15% OFF All Ramen Dishes at Ajisen Ramen (NEX)",
      duration: "Valid till: 30 May 2025",
      description:
        "Enjoy 15% off all ramen dishes at Ajisen Ramen NEX. Valid for dine-in only, Monday to Thursday.",
      code: "RAMEN15",
    },
    {
      id: "deal2",
      badge: "1-FOR-1",
      title: "1-for-1 Sushi Platters at Genki Sushi (VivoCity)",
      duration: "Valid till: 15 Jun 2025",
      description:
        "Buy one sushi platter and get one free at Genki Sushi, VivoCity. Second platter must be of equal or lesser value.",
      code: "GENKI121",
    },
    {
      id: "deal3",
      badge: "FREE",
      title: "Free Miso Soup with Any Main Course at Ichiban Boshi",
      duration: "Valid till: 20 May 2025",
      description:
        "Enjoy a complimentary miso soup with any main course ordered at all Ichiban Boshi outlets.",
      code: "ICHISOUP",
    }
  ],
  otherCuisines: [
    {
      name: "Korean",
      image:
        "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80",
      url: "/cuisine/korean",
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
