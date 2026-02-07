import type { CuisineData } from "./types";

export const EUROPEAN_CUISINE: CuisineData = {
  slug: "european",
  name: "European",
  tagline:
    "From Italian pasta to French bistros, find the best European food near you",
  features: [
    { label: "Italian" },
    { label: "French" },
    { label: "German" },
    { label: "Spanish" },
    { label: "Mediterranean" }
  ],
  heroImages: [
    "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80"
  ],
  stats: {
    restaurants: 39,
    menuItems: "3,500+",
    deals: 3,
    malls: 9,
  },
  restaurants: [
    {
      id: "cut-wolfgang-puck",
      name: "CUT by Wolfgang Puck",
      rating: 4.6,
      reviews: 1618,
      location: "Marina Bay Sands",
      tags: ["Western", "Fine Dining", "Steak"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHlgOHcM3-LVId4tFIEvxjT0hbQ4q9q1Be7rd0YFkoRAdwiPZDZBwPJtRKsw0vp1rxc5-9x_k3liv0I-emf1dEyr_xNi0oJBKQ=s4800-w800",
      description:
        "Upscale steakhouse by celebrity chef Wolfgang Puck offering premium cuts and refined sides in a sophisticated setting.",
      area: "south",
      tag: "FINE DINING",
      address:
        "10 Bayfront Ave, B1-71 The Shoppes, Marina Bay Sands, Singapore 018956",
      phone: "+65 6688 8517",
      hours:
        "Monday to Thursday 5–10 pm, Friday to Saturday 5–11 pm, Sunday 5–10 pm",
      website:
        "https://www.marinabaysands.com/restaurants/cutbywolfgangpuck.html",
    },
    {
      id: "bread-street-kitchen",
      name: "Bread Street Kitchen by Gordon Ramsay",
      rating: 4.1,
      reviews: 4273,
      location: "Marina Bay Sands",
      tags: ["Western", "British", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEhlGIvBXsFtIF1gFPmwLXVbDiPsYQOAu1OE8Qae_x_GaRA1jrhTx9v_JmwPhMeotGGHgTCoRj3sQpsyA47_Ayui5DRTWCYz38=s4800-w800",
      description:
        "British European restaurant by celebrity chef Gordon Ramsay serving classics in a relaxed warehouse setting with a bar area.",
      area: "south",
      tag: "CELEBRITY CHEF",
      address:
        "10 Bayfront Ave, B1/01-81 The Shoppes, Marina Bay Sands, Singapore 018956",
      phone: "+65 6688 5665",
      hours: "Monday to Friday, 12 pm–12 am, Saturday to Sunday 11:30 am–12 am",
      website:
        "https://www.marinabaysands.com/restaurants/breadstreetkitchenbygordonramsay.html",
    },
    {
      id: "marche-suntec-city",
      name: "Marché Suntec City",
      rating: 4.2,
      reviews: 2630,
      location: "Suntec City",
      tags: ["European", "Swiss", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEcyVTi8qK299QcZmxNvbtG1io7f3A6KKSVzHMwrZmyROvRi90ZeAyfpEOmUEAdcNYzD5JTj4QhWnM5KZwkBEb_fvNNT_dJAKE=s4800-w800",
      description:
        "European marketplace restaurant concept offering made-to-order dishes from various specialty food stations in a rustic setting.",
      area: "central",
      tag: "FAMILY FRIENDLY",
      address:
        "3 Temasek Boulevard #01-612 to 614, Tower 3 Suntec City, 038983",
      phone: "+65 6593 1704",
      hours:
        "Monday to Thursday 11 am–9:30 pm, Friday 11 am–10:30 pm, Saturday 10 am–10:30 pm, Sunday 10 am–9:30 pm",
      website: "https://www.marche.sg",
    },
    {
      id: "mamma-mia-trattoria",
      name: "Mamma Mia Trattoria E Caffè",
      rating: 4.7,
      reviews: 10618,
      location: "VivoCity",
      tags: ["Italian", "Pasta", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxZRPmyTYjQDPAqYFRvsZDDLEtDkt3HkbZZePsEdZOHqk15bSxeMslOHX5s17jNzDkJRD2Q9534SoCgkekhwjKcl-K9scpT-jtn8-xzFCBn98LEeLg4N15Ok-9LltJ8eGr9N5CbTzEwvhevLD8=s4800-w800",
      description:
        "Vibrant Italian restaurant serving authentic pizzas, pastas, and other classic dishes in a lively atmosphere.",
      area: "central",
      tag: "POPULAR",
      address: "1 HarbourFront Walk, #01-116, Singapore 098585",
      phone: "62547706",
      hours: "Monday to Sunday 11:30 am–10 pm",
      website: "https://mamma-mia.sg/",
    },
    {
      id: "brotzeit-vivocity",
      name: "Brotzeit German Beer Bar and Restaurant",
      rating: 4.3,
      reviews: 2962,
      location: "VivoCity",
      tags: ["German", "Beer", "Sausages"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyiw-H3oUTgtH5kev81jBD63Mca7dRekY5InzBkRHjTzLfB86Cyr0cRsyukTJvyVLmdKCEzvcymrL5SvrZUEUSVZ82s2MStGeEXr6nFNL9gTKLkpdsM_LJZnN8suI1JskzzCbg8P0SvtvCiWA=s4800-w800",
      description:
        "German microbrewery and restaurant offering authentic Bavarian cuisine, including sausages, schnitzels, and draft beers.",
      area: "central",
      tag: "BEER & FOOD",
      address: "1 HarbourFront Walk, #01-149 VivoCity, Singapore 098585",
      phone: "62728815",
      hours: "Monday to Sunday 11 am–11 pm",
      website: "https://brotzeit.co/",
    },
    {
      id: "astons-specialities",
      name: "ASTONS Specialities",
      rating: 4.5,
      reviews: 1225,
      location: "Suntec City",
      tags: ["Western", "Steak", "Affordable"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwyqVsER6M0U4Fda99yTuH9zeDsMHReCZ8yK8c5LYmGuiCV8qZFk9JNGve4KgiVJgRXE4mJZFjfAhIU727nlxyQGqZ4_8as-LCkwEhH2NyncxKfZUoRYUXPVivOv8RA2SJrcYFCgbsYG_Xjhw=s4800-w800",
      description:
        "Casual Western steakhouse chain known for affordable steaks and chops in a relaxed environment.",
      area: "central",
      tag: "VALUE",
      address: "3 Temasek Blvd, #B1-161, Singapore 038983",
      phone: "+65 6337 2468",
      hours: "Monday to Sunday 11:30 am–10 pm",
      website: "https://www.astons.com.sg",
    },
    {
      id: "yardbird-southern",
      name: "Yardbird Southern Table and Bar",
      rating: 4.1,
      reviews: 2285,
      location: "Marina Bay Sands",
      tags: ["American", "Southern", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwVn5J6VinQHocM4WuRIGKJVEShC07bBeHNDBmm00S2N0-LqWbe6uTtCBnmOwWNtdp6R7MfnpQdod5m2bk3XqOx2mJW0wpKG79kOBdu6GWpDhLMNLuf-AMexvxQVPuga19sdKGBq8AV-vGUx8mz9W81yA=s4800-w800",
      description:
        "Modern restaurant serving Southern U.S. comfort food, including signature fried chicken and classic cocktails.",
      area: "south",
      tag: "SOUTHERN COMFORT",
      address:
        "10 Bayfront Ave, B1-07 The Shoppes, Marina Bay Sands, Singapore 018956",
      phone: "+65 6688 9959",
      hours: "Monday to Friday 11:30 am–12 am, Saturday to Sunday 11 am–12 am",
      website:
        "https://www.marinabaysands.com/restaurants/yardbirdsoutherntableandbar.html",
    },
    {
      id: "wine-connection-bistro",
      name: "Wine Connection Bistro",
      rating: 4.1,
      reviews: 1202,
      location: "VivoCity",
      tags: ["European", "Wine", "Bistro"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHzFaKj1sOmkL1jTWzE1kVZuXn-nFEmEwh9zp8zkRBeBFjol-TZRCMBAC2y8a1j1QITsbhWX2QZWtYCj__PEhaNgoLLr-_RVrY=s4800-w800",
      description:
        "Wine-focused bistro offering European cuisine and an extensive selection of wines at retail prices with a small corkage fee.",
      area: "central",
      tag: "WINE & DINE",
      address: "1 HarbourFront Walk, #01-152/153/154, Singapore 098585",
      phone: "68730490",
      hours:
        "Monday to Thursday, Sunday 11 am–11 pm, Friday to Saturday 11 am–12 am",
      website: "https://www.wineconnection.com.sg/",
    },
    {
      id: "black-tap-mbs",
      name: "Black Tap Craft Burgers & Beers",
      rating: 4.2,
      reviews: 3553,
      location: "Marina Bay Sands",
      tags: ["American", "Burgers", "Craft Beer"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyxPiO48de42-JQS4wjfsLru4praMCdOJQt0rMxcmP_ufXQghHqJInfEDlKvapToqnHWS6helPyu0q2PvcbHADZCYtQefdMsM9Foy_tcg95oDEc1LA8wFUTFHTfbvI9APw7JA7zZJJmRNOprQ=s4800-w800",
      description:
        "New York-style craft burger restaurant known for award-winning burgers and over-the-top milkshakes.",
      area: "south",
      tag: "CRAFT BURGERS",
      address:
        "10 Bayfront Ave, #01-80 The Shoppes, Marina Bay Sands, Singapore 018956",
      phone: "+65 6688 9957",
      hours: "Monday to Friday 11:30 am–11 pm, Saturday to Sunday 11 am–11 pm",
      website:
        "https://www.marinabaysands.com/restaurants/blacktapcraftburgers&beers.html",
    },
    {
      id: "lavo-mbs",
      name: "LAVO Italian Restaurant And Rooftop Bar",
      rating: 4.3,
      reviews: 5134,
      location: "Marina Bay Sands",
      tags: ["Italian", "Rooftop", "Fine Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqG4bJD3VDtkobrq90m_ZWaQHRVJWf15F8MPEyB4rVF6mcv98D-a0FqqgaKuIhskXZ_8ppbW4ySbIabY5KUfPrm-XzOGcCaD59g=s4800-w800",
      description:
        "Upscale Italian-American restaurant and nightlife hotspot offering a rooftop bar with panoramic city views.",
      area: "south",
      tag: "ROOFTOP DINING",
      address:
        "10 Bayfront Avenue, Marina Bay Sands, Hotel, Level 57 Tower 1, 018956",
      phone: "+65 6688 8591",
      hours:
        "Monday to Thursday 11 am–12 am, Friday to Saturday 11 am–1:30 am, Sunday 12 pm–12 am",
      website:
        "https://www.marinabaysands.com/restaurants/lavoitalianrestaurantandrooftopbar.html",
    },
    {
      id: "isteaks-suntec",
      name: "iSTEAKS",
      rating: 4.1,
      reviews: 1028,
      location: "Suntec City",
      tags: ["Western", "Steak", "Affordable"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGPNH8CNEJovMIKVrhCv2k6bZcnRU4pMa2JRx8bSggA0Tht6qdDHJvd6TWgKoVtGAqXqafFub-udzBfBx_9mMWInKzofRbz7MQ=s4800-w800",
      description:
        "Casual steakhouse offering quality steaks and Western fare at affordable prices, with an open kitchen concept.",
      area: "central",
      tag: "VALUE STEAK",
      address: "3 Temasek Blvd, #02-472 / 473, Singapore 038983",
      phone: "+65 6285 8839",
      hours: "Monday to Sunday 11 am–10 pm",
      website: "https://www.isteaks.com.sg",
    },
    {
      id: "fish-co-amk",
      name: "Fish & Co.",
      rating: 4.1,
      reviews: 1063,
      location: "AMK Hub",
      tags: ["Western", "Seafood", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwWlEqadH5Vr5cWksafjPMw9FdD6H6KmOYLO7Ua5EZe4A80eEkQL4YiUJWv0NkxyTs2MBnJHFSp6AhMwmvj1-eOtn5TviqDcPsqEzvf_Qs2gaqGNgTcEmHtNkBRTrewwXW3B3Tb6xMXXOTuYg=s4800-w800",
      description:
        "Seafood chain restaurant serving fish and chips and other seafood dishes in pan presentations.",
      area: "north",
      tag: "SEAFOOD",
      address: "53 Ang Mo Kio Ave 3, #02-02 AMK Hub, Singapore 569933",
      phone: "65556298",
      hours: "Monday to Sunday 11 am–9:30 pm",
      website: "https://www.fish-co.com",
    },
    {
      id: "poulet-vivocity",
      name: "Poulet",
      rating: 4.7,
      reviews: 13123,
      location: "VivoCity",
      tags: ["French", "Chicken", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFhFTMWbOF5JHlumjoZx8nrQJzm6p2w0D09FYlb5LqYcdy1lbK8pdP08C8jhZoqdIdqPI1i35yORQDwQdQ0NkLHhogefrjUYoo=s4800-w800",
      description:
        "French casual dining restaurant specializing in roast chicken with various sauces and French-inspired sides.",
      area: "central",
      tag: "FRENCH",
      address: "1 HarbourFront Walk, #01-175/176/177, Singapore 098585",
      phone: "62311598",
      hours: "Monday to Sunday 11:30 am–10 pm",
      website: "https://www.poulet.com.sg/",
    },
    {
      id: "collins-woodleigh",
      name: "COLLIN'S",
      rating: 4.1,
      reviews: 185,
      location: "The Woodleigh Mall",
      tags: ["Western", "Steak", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwUw5eyV9atptAH67hwUIgFFLS-QSy-qkG3vgSwG6njmEI5snEL4eFn490yum_1WVxtXQzyk-Z8q0QhA_Ph9DLEWgYixg0ClqlGa0xWrhCUh3_0pFEewDz4LXhRQ88PgLn0Iv0PBEuR3h65u_U=s4800-w800",
      description:
        "Western restaurant offering quality steaks, pastas, and other Western fare at affordable prices in a pleasant setting.",
      area: "north-east",
      tag: "AFFORDABLE",
      address: "11 Bidadari Park Drive, Mall, #01-24 The Woodleigh, 367803",
      phone: "+65 6320 0139",
      hours: "Monday to Sunday 10 am–10 pm",
      website: "https://www.collins.sg",
    },
    {
      id: "swensens-amk",
      name: "Swensen's",
      rating: 3.8,
      reviews: 1003,
      location: "AMK Hub",
      tags: ["Western", "Dessert", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqG3P67Mn49JW5LFn47hFQCe331m6tFjbwLV5OJWSh9nHoeT0zwoQ5MTM7BX9VvnS63LPha2Od0VdTiKER5fsZxJBKXgeOq1usk=s4800-w800",
      description:
        "Family restaurant serving Western comfort food and known for their ice cream sundaes and desserts.",
      area: "north",
      tag: "FAMILY",
      address: "53 Ang Mo Kio Ave 3, #B1-21A, Singapore 569933",
      phone: "62359902",
      hours: "Monday to Sunday 11 am–10:30 pm",
      website: "http://www.swensens.com.sg/",
    },
    {
      id: "joshs-grill",
      name: "Josh's Grill",
      rating: 4.6,
      reviews: 7586,
      location: "Velocity@Novena",
      tags: ["Western", "Grill", "Premium"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwO3-YMu1SjI-LePgEFHdJXt9HgAFa0WCUHMoZS6TOhefln5LnZKgqtnoU4sfCf91crDln-syYNr4HdrpP8VoMHjBgpK6_wL4i7BZOoJ2xhAb2sHDYTeToTWdypxafp8fkhunTwth2t9cTh8_I=s4800-w800",
      description:
        "Premium grill restaurant specializing in steaks, chops, and seafood dishes in a sophisticated yet relaxed setting.",
      area: "central",
      tag: "GRILL SPECIALIST",
      address:
        "238 Thomson Rd, #02-68/69/70/71/72 Velocity@Novena Square, Singapore 307683",
      phone: "+65 6250 6989",
      hours: "Monday to Sunday 11:30 am–10 pm",
      website: "https://www.joshsgrill.sg",
    },
    {
      id: "saizeriya-city-square",
      name: "Saizeriya",
      rating: 4.1,
      reviews: 1270,
      location: "City Square Mall",
      tags: ["Italian", "Affordable", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzLQMa-uFraEDvGFoUhy94asbPAT3PctrRePIQZW-lmEphkV0yZhnOHv6IrFD1GA9syBlzubWF7_caL9fU_MWgeQPm9lsM-fCcDeRvnhVtgJHCGbrhw2ct4bsjHjNHj5lWYL6VLpGjjR-EKsIV_MJqsQw=s4800-w800",
      description:
        "Budget-friendly Italian restaurant chain offering pastas, pizzas, and other Italian fare in a casual setting.",
      area: "north-east",
      tag: "BUDGET",
      address: "180 Kitchener Road, Mall, B2-55/56 City Square",
      phone: "68344877",
      hours: "Monday to Sunday 11 am–10 pm",
      website: "https://www.saizeriya.com.sg/search/",
    },
    {
      id: "morganfields-suntec",
      name: "Morganfield's",
      rating: 4.1,
      reviews: 976,
      location: "Suntec City",
      tags: ["American", "Ribs", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGDb51F5YPyprZzpk9aKYO5ipaISQa0mvrsKQtN_5iflu1fJgiDUC3EqVN0hpcNKAV_qTXX_1XqiHicyG2weodY8S-YIQHAgDo=s4800-w800",
      description:
        'Restaurant specializing in "Sticky Bones" - American-style barbecued pork ribs and other meat dishes.',
      area: "central",
      tag: "RIBSLICIOUS",
      address: "3 Temasek Blvd, #01-645/646, Singapore 038983",
      phone: "+65 6736 1136",
      hours:
        "Monday to Thursday 11 am–10 pm, Friday to Saturday 11 am–11 pm, Sunday 11 am–10 pm",
      website: "https://www.morganfields.com.sg",
    },
    {
      id: "dallas-cafe-mbs",
      name: "Dallas Cafe & Bar",
      rating: 4.3,
      reviews: 1002,
      location: "Marina Bay Sands",
      tags: ["Western", "Bar", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFe7EAvZddn5v7tHEHD1b5zf_XsjJgyiYzOXbNJowdn62rChonNxEHStLSmq_RmpEg7r7an7gZcHMHt_ECK8lW2yZ83WiXbp7A=s4800-w800",
      description:
        "Modern café and bar serving Western favorites and refreshing drinks with Marina Bay waterfront views.",
      area: "south",
      tag: "WATERFRONT",
      address:
        "2 Bayfront Ave, #01-85 The Shoppes at Marina Bay Sands, Singapore 018972",
      phone: "+65 6688 7153",
      hours: "Monday to Sunday 11 am–12 am",
      website: "https://www.dallascafe.sg",
    },
    {
      id: "fish-co-causeway-point",
      name: "Fish & Co. @ Causeway Point",
      rating: 4.5,
      reviews: 329,
      location: "Causeway Point",
      tags: ["Western", "Seafood", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyI_UZUZJ_ZmeOJVtkBwBaMxX3AwKIFX6IleXaAXKkpfaR7cRr0fzlokhmFuTYWCf6n4Bm6jBgNPm3ieMcCqt5Or6IK8AmKkerlQrk24wCU5Uc_bmK2RPJj3OJzBz5jhtATu_KPKAf46dlx7gM=s4800-w800",
      description:
        "Seafood chain restaurant serving fish and chips and other seafood dishes in pan presentations.",
      area: "north",
      tag: "SEAFOOD",
      address: "1 Woodlands Square, #02-34/K01, Singapore 738099",
      phone: "62352156",
      hours: "Monday to Sunday 11 am–9:30 pm",
      website: "https://www.fish-co.com/",
    },
    {
      id: "poulet-causeway-point",
      name: "Poulet - Causeway Point",
      rating: 4.8,
      reviews: 7029,
      location: "Causeway Point",
      tags: ["French", "Chicken", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzKzkRk8jS4rIQh37WY1o0KA4ILVzqAWwEFycu3mcWo1-CkuCepeWCP5oVgXnlHwbpWs_7_6wmN4RZTBnsnjJsIqZJfH-_9mHjFbt0t5335Fk5wdgyQ7Jurx0fVWREuQRVjq7XEa6WQzvY57Q=s4800-w800",
      description:
        "French casual dining restaurant specializing in roast chicken with various sauces and French-inspired sides.",
      area: "north",
      tag: "FRENCH",
      address: "1 Woodlands Square, #B1-25 Causeway Point, Singapore 738099",
      phone: "62195122",
      hours: "Monday to Sunday 11:30 am–10 pm",
      website: "https://www.poulet.com.sg/",
    },
    {
      id: "marche-jem",
      name: "Marché Mövenpick JEM",
      rating: 4.5,
      reviews: 2409,
      location: "JEM",
      tags: ["European", "Swiss", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqE3Uko7Sr9AR3HDf5Uhk5khKL_JfM0YjKYWDX__f9LL3ucbdJctltx5bvAJOjnutpb1c688_GKsueUIyHF3T1rDXmHlAp-qesE=s4800-w800",
      description:
        "European marketplace restaurant concept offering made-to-order dishes from various specialty food stations in a rustic setting.",
      area: "west",
      tag: "FAMILY FRIENDLY",
      address: "50 Jurong Gateway Rd, #01-03 JEM, Singapore 608549",
      phone: "65931701",
      hours:
        "Monday to Thursday & Sunday: 9 am–10 pm, Friday to Saturday: 9 am–11 pm (Saturday opens at 8:30 am)",
      website: "https://www.marche.sg",
    },
    {
      id: "pastamania-nex",
      name: "PastaMania - NEX",
      rating: 4.4,
      reviews: 1490,
      location: "NEX",
      tags: ["Italian", "Pasta", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyZPylLz_JjrkEiBZhdZcgsNlDKeguLIb1t0Uk4Fta4AEAYD7DxPlcIj2MbSjGAzTO_ilWxxt6mp-FiSGHTX6QTEXN0cWbf9Vv2Rek9pAmeG2LByNt2Tuf5orBL_tB6ho3EMbungq9CzJ487Mo=s4800-w800",
      description:
        "Italian casual dining restaurant chain offering a variety of pasta dishes, pizzas, and other Italian favorites.",
      area: "north-east",
      tag: "FAMILY FRIENDLY",
      address: "1 Woodlands Square, B1-20 Causeway Point, Singapore 738099",
      phone: "68911349",
      hours: "Monday to Sunday 11 am–10 pm",
      website: "https://www.pastamania.com.sg/menu",
    },
    {
      id: "pastamania-tampines",
      name: "PastaMania - Tampines Mall",
      rating: 4.2,
      reviews: 850,
      location: "Tampines Mall",
      tags: ["Italian", "Pasta", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFtQF_2rZ87ZsXfQOanAaWUA0W1A52CVE73UrWohyux5ILIleVbba7DiJtoi8o1rHyWdT2mlK-fdQOFwSWNilbF37fSZ64SvjQ=s4800-w800",
      description:
        "Italian casual dining restaurant chain offering a variety of pasta dishes, pizzas, and other Italian favorites.",
      area: "east",
      tag: "FAMILY FRIENDLY",
      address: "4 Tampines Central 5, #04-21/22, Singapore 529510",
      phone: "67843126",
      hours: "Monday to Sunday 11 am–9:30 pm",
      website: "https://www.pastamania.com.sg/menu",
    },
    {
      id: "pastamania-jem",
      name: "PastaMania - JEM",
      rating: 4.1,
      reviews: 576,
      location: "JEM",
      tags: ["Italian", "Pasta", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxNPSJXshKyGq9ZSPE9aJhwcp7DM57apjBIa-GwHenwP0fLc_Xjd7nYDw0MH6h6M9DTy8osV5ouErPAV50zeUHFX3DrqIUCJjErs0RangK1WP2fDGnUoMYbQ3mNKtGFWWS8e-QFJebA6EG-Aud3fCP8OQ=s4800-w800",
      description:
        "Italian casual dining restaurant chain offering a variety of pasta dishes, pizzas, and other Italian favorites.",
      area: "west",
      tag: "FAMILY FRIENDLY",
      address: "52 Jurong Gateway Rd, #04-26, Singapore 608549",
      phone: "67342329",
      hours: "Monday to Sunday 11 am–9:30 pm",
      website: "https://www.pastamania.com.sg/menu",
    },
    {
      id: "brotzeit-westgate",
      name: "Brotzeit German Bier Bar & Restaurant - Westgate",
      rating: 4.0,
      reviews: 589,
      location: "Westgate",
      tags: ["German", "Beer", "European"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGJR91jImQRBQVYEafDBgv-JcOZII7paNC34HHm6zdRhAzfJhZVGAarO4LcvilPRx3dRZAUTClXF6hEkejpd3f-2HWmbY3EoaU=s4800-w800",
      description:
        "German microbrewery and restaurant offering authentic Bavarian cuisine, including sausages, schnitzels, and draft beers.",
      area: "west",
      tag: "BEER & FOOD",
      address: "3 Gateway Drive, #01-04, Westgate, Singapore 608532",
      phone: "64659874",
      hours:
        "Monday to Thursday 11:30 am–12 am, Friday to Saturday 11:30 am–1 am, Sunday 11:30 am–12 am",
      website: "https://brotzeit.co/",
    },
    {
      id: "saizeriya-aperia",
      name: "Saizeriya - Aperia Mall",
      rating: 3.6,
      reviews: 448,
      location: "Aperia Mall",
      tags: ["Italian", "Affordable", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwt-_quoJ2FLeApJdR-UQo4vDIVeOvhN5mboyvfNR4Oca9XgO_7u1iVWpUp-BgV7fBa2Iaw_Md9ViU3CLAxRd9uH7-myyPPrlP2waNYrmIFre77nuEjgFT3ls7Qdcvv_JHucsiV0BtYrY6-0twHEUipOw=s4800-w800",
      description:
        "Budget-friendly Italian restaurant chain offering pastas, pizzas, and other Italian fare in a casual setting.",
      area: "central",
      tag: "BUDGET",
      address: "12 Kallang Ave, #02-14/15 Aperia, Singapore 339511",
      phone: "63862792",
      hours: "Monday to Sunday 11 am–10 pm",
      website: "https://www.saizeriya.com.sg/",
    },
    {
      id: "saizeriya-hougang",
      name: "Saizeriya - Hougang Mall",
      rating: 4.4,
      reviews: 888,
      location: "Hougang Mall",
      tags: ["Italian", "Affordable", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwK8c9el2E-VNDP3SWu5o9BjJorxfX8mS5ITXTyQN_d22N0xxCDrw8KvtEVwbTYWPtzBhOCpY-VJpE2rHEYiRevTJaUTgKHhp9kFXQ1fL-q7_WWLndV-eOvk4rZCQTKSu6e4by1wWm897racg=s4800-w800",
      description:
        "Budget-friendly Italian restaurant chain offering pastas, pizzas, and other Italian fare in a casual setting.",
      area: "north-east",
      tag: "BUDGET",
      address: "90 Hougang Avenue 10 #02-24, Hougang Mall, 538766",
      phone: "62435927",
      hours: "Monday to Sunday 11 am–10 pm",
      website: "https://www.saizeriya.com.sg/",
    },
    {
      id: "poulet-bijou-jewel",
      name: "Poulet Bijou - Jewel Changi Airport",
      rating: 4.8,
      reviews: 9629,
      location: "Jewel Changi Airport",
      tags: ["French", "Chicken", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzneUxqg8Fod3dtc_dTMKmWU9idpw2-iLh0Q4jub2fhV9PoNPZwtiDAA1H9oVcuKoIJayVt7EmZ15keYsDKBwevOsM9f0T_izNWLiaFVn031Ykq7n9MF1xvyCc6h-g-iqCHGyTxiYAawYTo=s4800-w800",
      description:
        "Upscale version of Poulet offering signature roast chicken with premium sides and elegant desserts.",
      area: "east",
      tag: "FRENCH",
      address:
        "78 Airport Road, Jewel 01-227 Singapore Changi Airport, Singapore 819666",
      phone: "62437820",
      hours: "Monday to Sunday 11:30 am–10 pm",
      website: "https://www.poulet.com.sg/",
    }
  ],
  deals: [
    {
      id: "deal1",
      badge: "20% OFF",
      title: "20% OFF Weekday Lunch at Bread Street Kitchen by Gordon Ramsay",
      duration: "Valid till: 15 May 2025",
      description:
        "Enjoy 20% off all lunch menu items at Bread Street Kitchen. Valid for dine-in only, Monday to Thursday.",
      code: "BREAD20",
    },
    {
      id: "deal2",
      badge: "1-FOR-1",
      title: "1-for-1 Main Course at Marché (Suntec City)",
      duration: "Valid till: 30 Jun 2025",
      description:
        "Buy one main course and get one free at Marché, Suntec City. Second item must be of equal or lesser value. T&Cs apply.",
      code: "MARCHE121",
    },
    {
      id: "deal3",
      badge: "FREE",
      title: "Free Glass of Wine with Any Steak at CUT by Wolfgang Puck",
      duration: "Valid till: 10 May 2025",
      description:
        "Enjoy a complimentary glass of house wine with any steak ordered at CUT by Wolfgang Puck.",
      code: "CUTWINE",
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
        "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80",
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
