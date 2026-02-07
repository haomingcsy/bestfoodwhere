import type { CuisineData } from "./types";

export const WESTERN_CUISINE: CuisineData = {
  slug: "western",
  name: "Western",
  tagline: "From steaks to pasta, find the best Western food near you",
  features: [
    { label: "Steaks" },
    { label: "Burgers" },
    { label: "Pasta" },
    { label: "Pizza" },
    { label: "Seafood" }
  ],
  heroImages: [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=800&q=80"
  ],
  stats: {
    restaurants: 62,
    menuItems: "3,500+",
    deals: 3,
    malls: 10,
  },
  restaurants: [
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
        "Casual dining restaurant specializing in fish and chips and other seafood dishes in a pan.",
      area: "north",
      tag: "SEAFOOD",
      address: "1 Woodlands Square, #02-34/K01, Singapore 738099",
      phone: "62352156",
      hours: "Monday-Sunday: 11 am-9:30 pm",
      website: "https://www.fish-co.com/",
    },
    {
      id: "hot-tomato-causeway-point",
      name: "Hot Tomato",
      rating: 4.0,
      reviews: 733,
      location: "Causeway Point",
      tags: ["Western", "Casual Dining", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDz20-UCCCztR3AL3EHsMCqZbWlS1zFI7TVnpmglOZHKSBIU6dPoFOfVXSR_IndpEEsPzqDcGRwMQ7UobPpCz-2ETlKZfrxM4Ym8OOVCHsrGtLfF1yEv0daonGQpFd6aMpyj_KwfHniH3AI_=s4800-w800",
      description:
        "Popular Western restaurant offering steaks, pasta and other Western favorites at affordable prices.",
      area: "north",
      tag: "CASUAL DINING",
      address: "1 Woodlands Square, #02-11, Singapore 738099",
      phone: "68942685",
      hours: "Monday-Sunday: 11 am-10 pm",
      website: "http://www.hottomato.com.sg/",
    },
    {
      id: "pastamania-causeway-point",
      name: "PastaMania - Italian Casual Dining @ Causeway Point",
      rating: 4.4,
      reviews: 1490,
      location: "Causeway Point",
      tags: ["Italian", "Western", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEKwclz78VjTmX4s7IaBbaxTbPv1HNF9NOZbRimrAtlt5LPQnD4i0jvevLfqy5y9hisnUEjR97mVKrSF_fSab6l3tj9UKyhgPE=s4800-w800",
      description:
        "Italian-themed restaurant specializing in pasta and other Italian favorites in a family-friendly setting.",
      area: "north",
      tag: "ITALIAN",
      address: "1 Woodlands Square, B1-20 Causeway Point, Singapore 738099",
      phone: "68911349",
      hours: "Monday-Sunday: 11 am-10 pm",
      website: "https://www.pastamania.com.sg/menu",
    },
    {
      id: "poulet-causeway-point",
      name: "Poulet - Causeway Point",
      rating: 4.8,
      reviews: 7029,
      location: "Causeway Point",
      tags: ["Western", "French", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzKzkRk8jS4rIQh37WY1o0KA4ILVzqAWwEFycu3mcWo1-CkuCepeWCP5oVgXnlHwbpWs_7_6wmN4RZTBnsnjJsIqZJfH-_9mHjFbt0t5335Fk5wdgyQ7Jurx0fVWREuQRVjq7XEa6WQzvY57Q=s4800-w800",
      description:
        "French-inspired restaurant specializing in roast chicken with various sauces and French side dishes.",
      area: "north",
      tag: "FRENCH",
      address: "1 Woodlands Square, #B1 - 25 Causeway Point, Singapore 738099",
      phone: "62195122",
      hours: "Monday-Sunday: 11:30 am-10 pm",
      website: "https://www.poulet.com.sg/",
    },
    {
      id: "swensens-causeway-point",
      name: "Swensen's @ Causeway Point",
      rating: 3.5,
      reviews: 1029,
      location: "Causeway Point",
      tags: ["Western", "Dessert", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwwOUf4Tw2HQzDW7y-L3LrPtWuLL7u9dGt4fv77kf-jV5ovBaL0XHCgdWepWJj_Oj9xuSwg9NxIwJjC59DmfTqNB_5A3d1NiV6xkjVADy-qnn-EIewgiBJHcJxGg0c6DFMxPsRBnSuHB4Gh=s4800-w800",
      description:
        "Family-friendly restaurant serving Western cuisine alongside famous ice cream sundaes.",
      area: "north",
      tag: "CASUAL DINING",
      address: "1 Woodlands Square, #02 - 08 / 09, Singapore 738099",
      phone: "68942086",
      hours: "Monday-Sunday: 11 am-10:30 pm",
      website: "https://www.swensens.com.sg/",
    },
    {
      id: "hot-tomato-nex",
      name: "Hot Tomato",
      rating: 3.9,
      reviews: 921,
      location: "NEX",
      tags: ["Western", "Casual Dining", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxQ3lIVFnYhV2f970YJBUzUSJ4IrFeLUTVRTYoTzTN07fVk620IMm54i9q1nnRMBjF36lsrQHrB87_smvQIk8x_rn-_1GY9lTLKVPK3MzDokXbKuSeI1U77eykOr3w9KUUFXvxJRcfSkt5df-g=s4800-w800",
      description:
        "Popular Western restaurant offering steaks, pasta and other Western favorites at affordable prices.",
      area: "north-east",
      tag: "CASUAL DINING",
      address: "23 Serangoon Central, B1- 47, Singapore 556083",
      phone: "67534300",
      hours: "Monday to Sunday: 11 am-10 pm",
      website: "http://www.hottomato.com.sg/",
    },
    {
      id: "jacks-place-nex",
      name: "Jack's Place NEX",
      rating: 3.5,
      reviews: 798,
      location: "NEX",
      tags: ["Western", "Steakhouse", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwiAd25p4QkCPYCDaVOoUBXb-DKXk5f95xLlsSVq5Ymc-nUVc0_vY9yLriCf3vtt68DaHpXhdaXBnyKe6lQf0ZuCmEGhMKwhl47l-xeliMKkZVLEexhsW6mS9PvmHk1yjfAy_1JkJIq0lKM=s4800-w800",
      description:
        "Popular steakhouse chain serving a variety of steaks and Western dishes in a family-friendly setting.",
      area: "north-east",
      tag: "STEAKHOUSE",
      address: "23 Serangoon Central, #04-66 NEX, Singapore 556083",
      phone: "66342433",
      hours: "Monday to Sunday: 11 am-10:30 pm",
      website: "https://www.jacksplace.com.sg/jp-menu/",
    },
    {
      id: "collins-nex",
      name: "COLLIN'S NEX",
      rating: 4.0,
      reviews: 861,
      location: "NEX",
      tags: ["Western", "Casual Dining", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDx5PCS4kWDCOL3lIqpQHCuHdKFzqjdwIY1XcklxpdtDzqo_CqZb3-1hMAGEectWcvanK8oVS8MnKNw4CsrnXFQ81H8HlhnHfzeylaRuvjaXH8TOmnlEB7cSXnbicSrHQ5Uo1gxm2tEf22bZew=s4800-w800",
      description:
        "Affordable Western restaurant specializing in steaks, pasta, and other Western classics in a family-friendly setting.",
      area: "north-east",
      tag: "VALUE",
      address: "23 Serangoon Central, #B1-27 NEX, Singapore 556083",
      phone: "80130656",
      hours: "Monday to Sunday: 10:30 am-10 pm",
      website: "https://www.collins.sg",
    },
    {
      id: "swensens-bedok-mall",
      name: "Swensen's @ Bedok Mall",
      rating: 3.7,
      reviews: 1088,
      location: "Bedok Mall",
      tags: ["Western", "Dessert", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwYmdX67LRoc2YkxkGMb79HDzBSyxKsLlXzqzMAyahBZ06a6yQCo3B2ohtLVoGQnvxcdZLcZyyoDuto7dLdB5Dl4I0qfKUsVOSXpfLePDcVHzPKzpMLaFI22cU6vsdf9fiXICVV7ZTTwMNoEQ=s4800-w800",
      description:
        "Family-friendly restaurant serving Western cuisine alongside famous ice cream sundaes.",
      area: "east",
      tag: "DESSERT",
      address: "311 New Upper Changi Rd, #01-77, Singapore 467360",
      phone: "68449759",
      hours: "Monday to Sunday: 11 am-10:30 pm",
      website: "http://www.swensens.com.sg/",
    },
    {
      id: "hot-tomato-bedok-mall",
      name: "Hot Tomato Bistro",
      rating: 4.0,
      reviews: 522,
      location: "Bedok Mall",
      tags: ["Western", "Casual Dining", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzqQvoStxEpvYZDN-hr2KramoaHSeepgw2dDqXkv5_3dAn3Uk0o0O_oXA6KcGwKAASvEVQbEx_wpbis2VH6Xpo5S3aqCYTO3bhxhTomCnKc7ZrsNQzlRmcAzeg3jJ1xyQowNCQuwsUzaJcs0_px7HIRhA=s4800-w800",
      description:
        "Popular Western restaurant offering steaks, pasta and other Western favorites at affordable prices.",
      area: "east",
      tag: "CASUAL DINING",
      address: "311 New Upper Changi Rd, #B1-37/38, Singapore 467360",
      phone: "68449328",
      hours: "Monday to Sunday: 11 am-10 pm",
      website: "http://www.hottomato.com.sg/",
    },
    {
      id: "long-john-silvers-hougang",
      name: "Long John Silver's",
      rating: 3.3,
      reviews: 268,
      location: "Hougang Mall",
      tags: ["Western", "Fast Food", "Seafood"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDz3CeDTcNmbcpyD4cMnXsspbp1dRbFORhNZAth-w8-rj6_hciWYea3s0TEtWeOJThpVL6oK34iqJfRlUCjCsvtZ3w1UmDScczfSrV9omvy1Gp0uVh6IsoiARC5l3mKIp4mN0xwuIzhKJjuFfIU=s4800-w800",
      description:
        "Fast-food chain specializing in seafood, particularly fish and chips, and other fried seafood items.",
      area: "north-east",
      tag: "FAST FOOD",
      address:
        "90 Hougang Ave 10, #B1 - 27 / 28 Hougang Mall, Singapore 538766",
      phone: "63860385",
      hours: "Monday-Sunday: 7:30 am-10 pm",
      website: "https://www.longjohnsilvers.com.sg/",
    },
    {
      id: "saizeriya-hougang",
      name: "Saizeriya",
      rating: 3.3,
      reviews: 210,
      location: "Hougang Mall",
      tags: ["Western", "Italian", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwK8c9el2E-VNDP3SWu5o9BjJorxfX8mS5ITXTyQN_d22N0xxCDrw8KvtEVwbTYWPtzBhOCpY-VJpE2rHEYiRevTJaUTgKHhp9kFXQ1fL-q7_WWLndV-eOvk4rZCQTKSu6e4by1wWm897racg=s4800-w800",
      description:
        "Budget-friendly Italian restaurant chain offering pasta, pizza, and other Western dishes.",
      area: "north-east",
      tag: "ITALIAN",
      address: "90 Hougang Avenue 10, #02-24, Hougang Mall, Singapore 538766",
      phone: "62435927",
      hours: "Monday-Sunday: 11 am-10 pm",
      website: "https://www.saizeriya.com.sg/",
    },
    {
      id: "nandos-tampines",
      name: "Nando's Tampines Mall",
      rating: 4.2,
      reviews: 1294,
      location: "Tampines Mall",
      tags: ["Western", "Portuguese", "Chicken"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzFPDJv_cPl6psOIwgLpsu6RDLprYl9kOXZ6e6HzgxXao9o4RMsi8CZYINQdfJXfDh_caVRFqusyZK82UjgvhVc1TFWJDHMPR-bBvDBZ-4SPUfoH_203-nZ3SY0wzs63KBwCR2wt8GvYC5zcw=s4800-w800",
      description:
        "South African restaurant chain famous for its Portuguese-style flame-grilled peri-peri chicken.",
      area: "east",
      tag: "PERI-PERI",
      address: "4 Tampines Central 5, #01-46 Tampines Mall, Singapore 529510",
      phone: "67895052",
      hours: "Monday-Sunday: 10 am-10 pm",
      website: "http://nandos.com.sg/menu/",
    },
    {
      id: "swensens-tampines",
      name: "Swensen's @ Tampines Mall",
      rating: 4.0,
      reviews: 1885,
      location: "Tampines Mall",
      tags: ["Western", "Dessert", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwgVEjUVD99zPX_OWbCvJd0m-QEPB70IYllWLomj9kc5JF2Ku1UjKP17yooXE_p4u-ewSMEHD8ouduImEm8pSIAcjHHrYew6ILEINTz4wWzMZsLYtKgWrsmpCsJQoC0HkZ6XKxGTycTXTn0Ng=s4800-w800",
      description:
        "Family-friendly restaurant serving Western cuisine alongside famous ice cream sundaes.",
      area: "east",
      tag: "DESSERT",
      address: "4 Tampines Central 5, #03 - 30, Singapore 529510",
      phone: "67815489",
      hours: "Monday-Sunday: 11 am-10:30 pm",
      website: "http://www.swensens.com.sg/",
    },
    {
      id: "pastamania-tampines",
      name: "PastaMania - Italian Casual Dining @ Tampines Mall",
      rating: 4.2,
      reviews: 850,
      location: "Tampines Mall",
      tags: ["Western", "Italian", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFtQF_2rZ87ZsXfQOanAaWUA0W1A52CVE73UrWohyux5ILIleVbba7DiJtoi8o1rHyWdT2mlK-fdQOFwSWNilbF37fSZ64SvjQ=s4800-w800",
      description:
        "Italian-themed restaurant specializing in pasta and other Italian favorites in a family-friendly setting.",
      area: "east",
      tag: "ITALIAN",
      address: "4 Tampines Central 5, #04 - 21 / 22, Singapore 529510",
      phone: "67843126",
      hours: "Monday-Sunday: 11 am-9:30 pm",
      website: "https://www.pastamania.com.sg/menu",
    },
    {
      id: "hot-tomato-jewel",
      name: "Hot Tomato",
      rating: 3.8,
      reviews: 281,
      location: "Jewel Changi Airport",
      tags: ["Western", "Casual Dining", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDx2I_BQeuCt3WLqAhfPqTpgYz15VDfmJHoxR1ahsb7XBr1LySKfzdHJGy1YrIsjXbGCvMXLheHKqNZZELveBrau9wpfl_n9V3Ns4dA8Vzjt397aldvantbM31wGuAoppKMMWfXH5GvJBRMrmuU=s4800-w800",
      description:
        "Popular Western restaurant offering steaks, pasta and other Western favorites at affordable prices.",
      area: "east",
      tag: "CASUAL DINING",
      address: "78 Airport Blvd., #04 - 229, Singapore 819666",
      phone: "62149352",
      hours: "Monday-Sunday: 11 am-10 pm",
      website: "https://www.hottomato.com.sg/",
    },
    {
      id: "jacks-place-jewel",
      name: "Jack's Place Jewel Changi Airport",
      rating: 4.1,
      reviews: 1249,
      location: "Jewel Changi Airport",
      tags: ["Western", "Steakhouse", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFm5tg0qcPh5KrnJcVn0b1UX_20XIqxxV4qm1-yxS3y_vZ3iDp6-oV80BU00-y825OWJTuRWZn27NSY-vPmjxjW_NdmlbvnesM=s4800-w800",
      description:
        "Popular steakhouse chain serving a variety of steaks and Western dishes in a family-friendly setting.",
      area: "east",
      tag: "STEAKHOUSE",
      address:
        "78 Airport Boulevard, Jewel, #04-219 Singapore Changi Airport, 819666",
      phone: "62149173",
      hours: "Monday-Sunday: 11 am-10 pm",
      website: "https://www.jacksplace.com.sg/jp-menu/",
    },
    {
      id: "poulet-bijou-jewel",
      name: "Poulet Bijou - Jewel Changi Airport",
      rating: 4.8,
      reviews: 9629,
      location: "Jewel Changi Airport",
      tags: ["Western", "French", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzneUxqg8Fod3dtc_dTMKmWU9idpw2-iLh0Q4jub2fhV9PoNPZwtiDAA1H9oVcuKoIJayVt7EmZ15keYsDKBwevOsM9f0T_izNWLiaFVn031Ykq7n9MF1xvyCc6h-g-iqCHGyTxiYAawYTo=s4800-w800",
      description:
        "French-inspired restaurant specializing in roast chicken with various sauces and French side dishes.",
      area: "east",
      tag: "FRENCH",
      address:
        "78 Airport Road, Jewel 01 - 227 Singapore Changi Airport, Singapore 819666",
      phone: "62437820",
      hours: "Monday-Sunday: 11:30 am-10 pm",
      website: "https://www.poulet.com.sg/",
    },
    {
      id: "andes-by-astons-imm",
      name: "ANDES by Astons",
      rating: 4.4,
      reviews: 837,
      location: "IMM",
      tags: ["Western", "Steakhouse", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDy75OBad8HNDhINsALkUwnvBPeGm8ZVl_35FDxSSM39FKLugld2g1QGomGlPmMMONYUFC5lZRhnhvVQ9pdASn7b__lxSEuWFIFIwO3kX2_X2g416cuqEgbW5VIa3bis1mp8Q7_fRqQxzS9XRx0=s4800-w800",
      description:
        "Affordable steakhouse by the Astons group offering quality steaks and Western dishes at reasonable prices.",
      area: "west",
      tag: "STEAK",
      address: "2 Jurong East Street 21, #01-96 Imm, Singapore 609601",
      phone: "62590285",
      hours: "Monday-Sunday: 11:30 am-10 pm",
      website: "https://www.astons.com.sg",
    },
    {
      id: "swensens-imm",
      name: "Swensen's @ IMM",
      rating: 4.0,
      reviews: 1139,
      location: "IMM",
      tags: ["Western", "Dessert", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyj6rjCrpPP7bPSw01TYezQCAuuATf9f0tlWMH_GCQPpFPPXj67hIz6UUGYgruiZJpN2MkQf6WNaXJPlkGy57gPbYykDxpcLmGf-l7Dwa-u-Lthj3hziP9jlhZyegB0v42DpzGXoNonkWHq6w=s4800-w800",
      description:
        "Family-friendly restaurant serving Western cuisine alongside famous ice cream sundaes.",
      area: "west",
      tag: "DESSERT",
      address:
        "2 Jurong East Street 21, #01-92/93 IMM Building, Singapore 609601",
      phone: "65399624",
      hours: "Monday-Sunday: 11 am-10:30 pm",
      website: "http://www.swensens.com.sg/",
    },
    {
      id: "isteaks-jem",
      name: "iSTEAKS @ Jem",
      rating: 3.9,
      reviews: 484,
      location: "JEM",
      tags: ["Western", "Steakhouse", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqF7ZRD4J2NJUMyBQkzUEx1mZ6yHd8lfuj_nRFGfYSv8RIiGk-Tvsdr5WWJDkBsFWYVzQa0gbo5alsgAGzzQ5PLim0ss-_oSikQ=s4800-w800",
      description:
        "Casual steakhouse offering quality steaks and Western dishes at reasonable prices.",
      area: "west",
      tag: "STEAK",
      address: "50 Jurong Gateway Rd, #01-08/09, Singapore 608549",
      phone: "62858839",
      hours: "Monday-Sunday: 11 am-10 pm",
      website: "http://www.isteaksdiner.com/",
    },
    {
      id: "jacks-place-jem",
      name: "Jack's Place JEM",
      rating: 3.6,
      reviews: 748,
      location: "JEM",
      tags: ["Western", "Steakhouse", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwfBYJ82NJBx4ffuY9mmKMubmBMOxkpVUgbRQYm7U8voedrqoKbPMdtv4sFknsGoOtHeC5agyAvBz03gnDOdxHP5xdhaMQWOt-_2QII7hoILJUrvxGjI3RKmcsAHAk2LKW3rEPkHCpCad68CX0=s4800-w800",
      description:
        "Popular steakhouse chain serving a variety of steaks and Western dishes in a family-friendly setting.",
      area: "west",
      tag: "STEAKHOUSE",
      address: "50 Jurong Gateway Rd, #04-15 JEM, Singapore 608549",
      phone: "67348812",
      hours: "Monday-Sunday: 11 am-10:30 pm",
      website: "https://www.jacksplace.com.sg/jp-menu/",
    },
    {
      id: "marche-jem",
      name: "Marche Jem",
      rating: 4.4,
      reviews: 2409,
      location: "JEM",
      tags: ["Western", "European", "Family Friendly"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipN9pb2AXWyPK91LYznXMKJReXeWWFoO6YAUkd9_=w408-h261-k-no",
      description:
        "European market-style restaurant with various food stations offering fresh, made-to-order European dishes.",
      area: "west",
      tag: "EUROPEAN",
      address: "50 Jurong Gateway Rd, #01-03 JEM, Singapore 608549",
      phone: "65931701",
      hours:
        "Monday-Thursday & Sunday: 9 am-10 pm, Friday-Saturday: 9 am-11 pm",
      website: "https://www.marche.sg",
    },
    {
      id: "armoury-steakhouse-aperia",
      name: "Armoury Steakhouse Bar & Grill @ Aperia",
      rating: 4.5,
      reviews: 192,
      location: "Aperia Mall",
      tags: ["Western", "Steakhouse", "Bar"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqErAIGMqs_BUYsB2zApXt26gCT9HOj0dC1IUmlR3-Z4gdIeEPH_UyYH50N2RVtmII6El4p1deS0KHGTB33o9FBuVe_OrUUam8g=s4800-w800",
      description:
        "Modern steakhouse and bar offering premium steaks, grilled meats, and a selection of drinks in a stylish setting.",
      area: "central",
      tag: "STEAKHOUSE",
      address: "#01- 44/45, Aperia Mall, 12 Kallang Ave, #01-44 Mall, 339511",
      phone: "90487656",
      hours: "Monday-Friday: 11:30 am-10 pm, Saturday-Sunday: Closed",
      website: "https://www.armourysteaks.com/",
    },
    {
      id: "the-pack-aperia",
      name: "The Pack Protein & Salad Bar",
      rating: 4.1,
      reviews: 79,
      location: "Aperia Mall",
      tags: ["Western", "Healthy", "Salad"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqElKbMqOgkdHwhSNIXlD1yygyBiLClO0H8BcPAH96Qy_O-y3cKKPYWb1950UMXfFBrJ1Old97E2_NFnVC-03bKtcHe9ZEo3HnU=s4800-w800",
      description:
        "Health-focused eatery offering protein-rich meals, salads, and nutritious options for the health-conscious.",
      area: "central",
      tag: "HEALTHY",
      address: "12 Kallang Avenue, #01-30, Aperia Mall, 339511",
      phone: "81189313",
      hours: "Monday-Friday: 10:15 am-8 pm, Saturday-Sunday: 10:15 am-7 pm",
      website: "https://www.thepack.sg",
    },
    {
      id: "bread-street-kitchen",
      name: "Bread Street Kitchen by Gordon Ramsay",
      rating: 4.1,
      reviews: 4273,
      location: "Marina Bay Sands",
      tags: ["Western", "Fine Dining", "British"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEhlGIvBXsFtIF1gFPmwLXVbDiPsYQOAu1OE8Qae_x_GaRA1jrhTx9v_JmwPhMeotGGHgTCoRj3sQpsyA47_Ayui5DRTWCYz38=s4800-w800",
      description:
        "Gordon Ramsay's restaurant offering classic British dishes with a modern twist in a vibrant warehouse setting.",
      area: "south",
      tag: "FINE DINING",
      address:
        "10 Bayfront Ave, B1/01-81 The Shoppes, Marina Bay Sands, Singapore 018956",
      phone: "+65 6688 5665",
      hours: "Monday to Friday 12 pm-12 am, Saturday to Sunday 11:30 am-12 am",
      website:
        "https://www.marinabaysands.com/restaurants/breadstreetkitchenbygordonramsay.html",
    },
    {
      id: "cut-wolfgang-puck",
      name: "CUT by Wolfgang Puck",
      rating: 4.6,
      reviews: 1618,
      location: "Marina Bay Sands",
      tags: ["Western", "Steakhouse", "Fine Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHlgOHcM3-LVId4tFIEvxjT0hbQ4q9q1Be7rd0YFkoRAdwiPZDZBwPJtRKsw0vp1rxc5-9x_k3liv0I-emf1dEyr_xNi0oJBKQ=s4800-w800",
      description:
        "Celebrity chef Wolfgang Puck's steakhouse offering prime cuts of meat in an elegant setting.",
      area: "south",
      tag: "FINE DINING",
      address:
        "10 Bayfront Ave, B1-71 The Shoppes, Marina Bay Sands, Singapore 018956",
      phone: "+65 6688 8517",
      hours:
        "Monday to Thursday 5-10 pm, Friday to Saturday 5-11 pm, Sunday 5-10 pm",
      website:
        "https://www.marinabaysands.com/restaurants/cutbywolfgangpuck.html",
    },
    {
      id: "yardbird",
      name: "Yardbird Southern Table and Bar",
      rating: 4.1,
      reviews: 2285,
      location: "Marina Bay Sands",
      tags: ["Western", "American", "Southern"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwVn5J6VinQHocM4WuRIGKJVEShC07bBeHNDBmm00S2N0-LqWbe6uTtCBnmOwWNtdp6R7MfnpQdod5m2bk3XqOx2mJW0wpKG79kOBdu6GWpDhLMNLuf-AMexvxQVPuga19sdKGBq8AV-vGUx8mz9W81yA=s4800-w800",
      description:
        "American restaurant serving southern comfort food including their famous fried chicken and classic cocktails.",
      area: "south",
      tag: "AMERICAN",
      address:
        "10 Bayfront Ave, B1-07 The Shoppes, Marina Bay Sands, Singapore 018956",
      phone: "+65 6688 9959",
      hours: "Monday to Friday 11:30 am-12 am, Saturday to Sunday 11 am-12 am",
      website:
        "https://www.marinabaysands.com/restaurants/yardbirdsoutherntableandbar.html",
    },
    {
      id: "black-tap",
      name: "Black Tap Craft Burgers & Beers",
      rating: 4.2,
      reviews: 3553,
      location: "Marina Bay Sands",
      tags: ["Western", "Burgers", "Craft Beer"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyxPiO48de42-JQS4wjfsLru4praMCdOJQt0rMxcmP_ufXQghHqJInfEDlKvapToqnHWS6helPyu0q2PvcbHADZCYtQefdMsM9Foy_tcg95oDEc1LA8wFUTFHTfbvI9APw7JA7zZJJmRNOprQ=s4800-w800",
      description:
        "New York-based restaurant famous for gourmet burgers, craft beers, and over-the-top milkshakes.",
      area: "south",
      tag: "BURGERS",
      address:
        "10 Bayfront Ave, #01-80 The Shoppes, Marina Bay Sands, Singapore 018956",
      phone: "+65 6688 9957",
      hours: "Monday to Friday 11:30 am-11 pm, Saturday to Sunday 11 am-11 pm",
      website:
        "https://www.marinabaysands.com/restaurants/blacktapcraftburgers&beers.html",
    },
    {
      id: "lavo-mbs",
      name: "LAVO Italian Restaurant And Rooftop Bar",
      rating: 4.3,
      reviews: 5134,
      location: "Marina Bay Sands",
      tags: ["Italian", "Fine Dining", "Bar"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqG4bJD3VDtkobrq90m_ZWaQHRVJWf15F8MPEyB4rVF6mcv98D-a0FqqgaKuIhskXZ_8ppbW4ySbIabY5KUfPrm-XzOGcCaD59g=s4800-w800",
      description:
        "Italian-American restaurant with a rooftop bar offering panoramic views of Singapore's skyline.",
      area: "south",
      tag: "ROOFTOP",
      address:
        "10 Bayfront Avenue, Marina Bay Sands, Hotel, Level 57 Tower 1, 018956",
      phone: "+65 6688 8591",
      hours:
        "Monday to Thursday 11 am-12 am, Friday to Saturday 11 am-1:30 am, Sunday 12 pm-12 am",
      website:
        "https://www.marinabaysands.com/restaurants/lavoitalianrestaurantandrooftopbar.html",
    },
    {
      id: "dallas-cafe",
      name: "Dallas Cafe & Bar",
      rating: 4.3,
      reviews: 1002,
      location: "Marina Bay Sands",
      tags: ["Western", "Bar", "Casual Dining"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFe7EAvZddn5v7tHEHD1b5zf_XsjJgyiYzOXbNJowdn62rChonNxEHStLSmq_RmpEg7r7an7gZcHMHt_ECK8lW2yZ83WiXbp7A=s4800-w800",
      description:
        "Casual dining restaurant and bar offering a wide selection of Western comfort food and drinks.",
      area: "south",
      tag: "CASUAL",
      address:
        "2 Bayfront Ave, #01 - 85 The Shoppes at Marina Bay Sands, Singapore 018972",
      phone: "+65 6688 7153",
      hours: "Monday to Sunday 11 am-12 am",
      website: "https://www.dallascafe.sg",
    },
    {
      id: "le-noir-mbs",
      name: "Le Noir @ MBS",
      rating: 4.6,
      reviews: 1362,
      location: "Marina Bay Sands",
      tags: ["Western", "Bar", "Fusion"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFquTaArZ_t_VWYb_mmPCzLabr1QcRmHKOpgZJU4VAKf7Cd2Tsmb5sH7M-1gXPaG72adrqz2uT8mVuZxWoXg_CnuYc1LmT1RxI=s4800-w800",
      description:
        "Stylish bar and restaurant offering a fusion of Western and Asian cuisine with great views.",
      area: "south",
      tag: "BAR",
      address: "2 Bayfront Ave, #01 - 84, Singapore 018972",
      phone: "+65 8684 2122",
      hours:
        "Monday to Thursday 12 pm-1 am, Friday to Saturday 12 pm-3 am, Sunday 12 pm-1 am",
      website: "https://lenoir.sg",
    },
    {
      id: "collins-woodleigh",
      name: "COLLIN'S The Woodleigh Mall",
      rating: 4.1,
      reviews: 185,
      location: "The Woodleigh Mall",
      tags: ["Western", "Steak", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwUw5eyV9atptAH67hwUIgFFLS-QSy-qkG3vgSwG6njmEI5snEL4eFn490yum_1WVxtXQzyk-Z8q0QhA_Ph9DLEWgYixg0ClqlGa0xWrhCUh3_0pFEewDz4LXhRQ88PgLn0Iv0PBEuR3h65u_U=s4800-w800",
      description:
        "Affordable Western restaurant specializing in steaks, pasta, and other Western classics in a family-friendly setting.",
      area: "north",
      tag: "VALUE",
      address: "11 Bidadari Park Drive, Mall, #01-24 The Woodleigh, 367803",
      phone: "+65 6320 0139",
      hours: "Monday to Sunday 10 am-10 pm",
      website: "https://www.collins.sg",
    },
    {
      id: "poulet-woodleigh",
      name: "Poulet - Woodleigh Mall",
      rating: 4.8,
      reviews: 3548,
      location: "The Woodleigh Mall",
      tags: ["Western", "French", "Chicken"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwpjXBQe2vah_GmfOjSDWdQgbxtrewMDWp5eRybs1fU7PqBAx6VfZ1ImQLLcxER4uyeQX-tEv3n_Vhly_YJJO85tiRSQXAM6SbDfVho_6jdkqC1hsd2YDxjRmsz_zcu1mkqy-CAp37dZ22hh1qbarXPbQ=s4800-w800",
      description:
        "French-inspired restaurant specializing in roast chicken with various sauces and French side dishes.",
      area: "north",
      tag: "FRENCH",
      address: "Mall, 11 Bidadari Park Dr, B1-26/27 The Woodleigh, 367803",
      phone: "+65 6231 1594",
      hours: "Monday to Sunday 11:30 am-10 pm",
      website: "https://www.poulet.com.sg",
    },
    {
      id: "brewerkz-woodleigh",
      name: "Brewerkz Woodleigh Mall",
      rating: 4.4,
      reviews: 302,
      location: "The Woodleigh Mall",
      tags: ["Western", "Craft Beer", "Bar Food"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGKaocqOQq7dLijXD7ZsTRj91khP3jzulmR9_Fls5KrHC6yRh2c6yZOQ69rHU0OSlFdE0HI9pMMv9BDbYpsfZh2VZFJquI0nyc=s4800-w800",
      description:
        "Craft brewery and restaurant offering a range of beers and Western pub fare in a casual setting.",
      area: "north",
      tag: "BREWERY",
      address: "11 Bidadari Park Dr, #02-20/20A, Singapore 367803",
      phone: "+65 9820 0271",
      hours: "Monday to Sunday 12-10 pm",
      website: "https://brewerkz.com/outlet/woodleigh-mall",
    },
    {
      id: "soup-spoon-woodleigh",
      name: "The Soup Spoon Union",
      rating: 3.1,
      reviews: 34,
      location: "The Woodleigh Mall",
      tags: ["Western", "Soup", "Healthy"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGsVEBf7xVY1np21djnsZiSSMnuUWz1orI7KpioJC2sFYZPDh8XIQbGfIfTsQDuowRcRE-X3u1g842KuS5jw020O4eLquPkXdU=s4800-w800",
      description:
        "Casual restaurant specializing in hearty and nutritious soups alongside salads and sandwiches.",
      area: "north",
      tag: "HEALTHY",
      address: "11 Bidadari Park Dr, #01-39 HiArt Woodleigh, Singapore 367803",
      phone: "+65 6255 7269",
      hours: "Monday to Sunday 10 am-10 pm",
      website: "https://www.thesoupspoon.com",
    },
    {
      id: "little-italy-woodleigh",
      name: "Little Italy - Woodleigh",
      rating: 4.2,
      reviews: 212,
      location: "The Woodleigh Mall",
      tags: ["Italian", "Pizza", "Pasta"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGrWGV8GAQtKbiaoXO4JLiYaQdt133nXpV2MTzgjo6SHGWjXu8qHqDpR9Axw04wW72VKL5rCk8E0qQnV8iDIh9g6gxDbTRnNBo=s4800-w800",
      description:
        "Authentic Italian restaurant specializing in pizzas, pastas, and other Italian classics.",
      area: "north",
      tag: "ITALIAN",
      address: "11 Bidadari Park Dr, Mall, #02-48 The Woodleigh, 367803",
      phone: "+65 9710 9052",
      hours: "Monday to Sunday 11:30 am-10 pm",
      website: "https://www.littleitaly.com.sg",
    },
    {
      id: "aw-woodleigh",
      name: "A&W The Woodleigh Mall",
      rating: 3.4,
      reviews: 95,
      location: "The Woodleigh Mall",
      tags: ["Fast Food", "Burgers", "American"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGFiqR1piUC4b3k-0qEJcwNSoF-yfIV5A0ZYJ2eDNtuguBji4rIrPEeaXKXb07HkyRNmoxdo94MynJrCzJ4Zq0i8yToPoAcLJ0=s4800-w800",
      description:
        "Iconic American fast food chain famous for root beer floats, burgers, and curly fries.",
      area: "north",
      tag: "FAST FOOD",
      address: "11 Bidadari Park Dr, #01-40, Singapore 367803",
      phone: "+65 6255 8011",
      hours: "Monday to Sunday 10 am-10 pm",
      website: "https://www.awrestaurants.com.sg",
    },
    {
      id: "joshs-grill",
      name: "Josh's Grill",
      rating: 4.6,
      reviews: 7586,
      location: "Velocity@Novena Square",
      tags: ["Western", "Steakhouse", "Grill"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwO3-YMu1SjI-LePgEFHdJXt9HgAFa0WCUHMoZS6TOhefln5LnZKgqtnoU4sfCf91crDln-syYNr4HdrpP8VoMHjBgpK6_wL4i7BZOoJ2xhAb2sHDYTeToTWdypxafp8fkhunTwth2t9cTh8_I=s4800-w800",
      description:
        "Popular steakhouse known for quality grilled meats and Western dishes at reasonable prices.",
      area: "central",
      tag: "STEAKHOUSE",
      address:
        "238 Thomson Rd, #02-68/69/70/71/72 Velocity@Novena Square, Singapore 307683",
      phone: "+65 6250 6989",
      hours: "Monday to Sunday 11:30 am-10 pm",
      website: "https://www.joshsgrill.sg",
    },
    {
      id: "poke-theory-novena",
      name: "Poke Theory",
      rating: 4.4,
      reviews: 352,
      location: "Velocity@Novena Square",
      tags: ["Western", "Hawaiian", "Healthy"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqF2ibDTrWPg5msC1suE8tcE7Y3_g9-jnQPZ5RLcUYCUh_26T9Sg_eqcw7w8JkWBe5OqdUGZSA249V8zwcaIdFBVhAEbjeyVUOs=s4800-w800",
      description:
        "Modern Hawaiian-inspired restaurant specializing in healthy poke bowls with fresh ingredients.",
      area: "central",
      tag: "HEALTHY",
      address: "#01-53 Velocity @ Novena Square, 238 Thomson Rd, 307683",
      phone: "+65 6904 6010",
      hours: "Monday to Sunday 10:30 am-9 pm",
      website: "https://poketheory.com.sg",
    },
    {
      id: "saladstop-novena",
      name: "SaladStop! Novena Square",
      rating: 4.2,
      reviews: 166,
      location: "Velocity@Novena Square",
      tags: ["Western", "Salad", "Healthy"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxhxMatNFLgcDxags4BGKx08lEDhVhEsTu5uu7kpZerPbXnba3lg2GnWo_nsEQ24BP5gDin98g5wDUEN_rUcQja2jWvhnB8NEYnMaYBk5oj90pGflXC6lv44dY2_CuSSr5C8tJi7k_bcjI8tg=s4800-w800",
      description:
        "Healthy food chain specializing in customizable salads, wraps, and grain bowls with fresh ingredients.",
      area: "central",
      tag: "SALAD",
      address: "238 Thomson Rd, #02-24 Novena Square, Singapore 307683",
      phone: "+65 6931 7649",
      hours: "Monday to Sunday 10 am-7:30 pm",
      website: "https://order.saladstop.com.sg",
    },
    {
      id: "peperoni-united-square",
      name: "Peperoni Pizzeria @ United Square",
      rating: 4.7,
      reviews: 346,
      location: "United Square",
      tags: ["Italian", "Pizza", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwt6ndycByW8J5U8AH0G1cGjekjWh8Z3irtvHMClBD3bmHXRp3cxDvxNbxO3MTMNlBpF8x0IB3qPt16MTvrBL9Pe-eQAJflVgW60-RHKYT1R0h0giIqIFpT9Di9Q-6kKFpVSvT8EPCGXTaUSkC_IoqcCA=s4800-w800",
      description:
        "Family-friendly Italian restaurant known for its wide variety of thin-crust pizzas in various sizes.",
      area: "central",
      tag: "PIZZA",
      address: "101 Thomson Rd, #01-07/60, Singapore 307591",
      phone: "66816704",
      hours: "Monday-Sunday: 11 am-2:30 pm, 5-9 pm",
      website: "https://www.peperoni.com.sg/menu",
    },
    {
      id: "brauhaus-united-square",
      name: "Brauhaus Restaurant & Pub",
      rating: 4.4,
      reviews: 595,
      location: "United Square",
      tags: ["Western", "European", "German"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFvCwczXTMbKynaP2zL8Zk0xxSnDoTId-HDnev-dgmFUqw-U4ctccjqdhydAjK21pAd1hPWANi1_8Jb-4HKsFZQ9yW3l8Xqz1Q=s4800-w800",
      description:
        "German restaurant and pub serving authentic German cuisine and a wide selection of beers.",
      area: "central",
      tag: "GERMAN",
      address: "101 Thomson Road, B1, #13/14 United Square, 307591",
      phone: "62503116",
      hours:
        "Monday-Thursday: 12 pm-12 am, Friday-Saturday: 12 pm-1 am, Sunday: 4:30 pm-12 am",
      website: "http://www.brauhaus.com.sg/",
    },
    {
      id: "mamma-mia-plaza-singapura",
      name: "Mamma Mia Trattoria E Caffe",
      rating: 4.7,
      reviews: 6074,
      location: "Plaza Singapura",
      tags: ["Italian", "European", "Pizza"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyis9FIUjHUfdzJ2beAVwJjM8wMp6wPUErtr7hMtE2nremj__Xo_KVad7fE9suRZR-eiVN_ZtT6WNQxXWRmzdhNEuHPj9nO2kRvSMKjMdyJIFo6C-XwfAMy2wwmIJU2YA-pYOoZUthqyW91GYSy1DEe7w=s4800-w800",
      description:
        "Authentic Italian restaurant serving a variety of pasta, pizza, and other Italian classics in a warm atmosphere.",
      area: "central",
      tag: "ITALIAN",
      address: "68 Orchard Rd, #03-79/83, Singapore 238839",
      phone: "62639153",
      hours: "Monday-Sunday: 11:30 am-10 pm",
      website: "https://mamma-mia.sg/",
    },
    {
      id: "nandos-plaza-singapura",
      name: "Nando's Plaza Singapura",
      rating: 4.1,
      reviews: 2073,
      location: "Plaza Singapura",
      tags: ["Western", "Portuguese", "Chicken"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDx_MMDR2Yj-BGdJ7Wc_G_69ssmD0O2jNNoljFyyKEXCH59z1-g81U58HbUH4RXjxWQXGvLpZfkqKbuLSOoNJjZZN0FwobyiBt9ONTdjp8-zjwnvtiIFNR-VRtpIplJngIxquy67oG6O_8G1mPc=s4800-w800",
      description:
        "South African restaurant chain famous for its Portuguese-style flame-grilled peri-peri chicken.",
      area: "central",
      tag: "PERI-PERI",
      address: "68 Orchard Rd, #04 -10/11 Plaza Singapura, Singapore 238839",
      phone: "63372555",
      hours: "Monday-Sunday: 10 am-10 pm",
      website: "https://www.nandos.com.sg/",
    },
    {
      id: "five-guys-plaza-singapura",
      name: "Five Guys Plaza Singapura",
      rating: 4.0,
      reviews: 2350,
      location: "Plaza Singapura",
      tags: ["Western", "Burgers", "Fast Food"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyjZHHP-DmLwy0DJ_oxPznkXkpUR-EaNZO3oD81XXNo9KRvPnYjS3D-yffpRCS44D4J_SX5lH3b_anQvXCV-2mm1spYFwfCSnpSaza6Xf5To5-sSSaZnaZGcaYWHSPzwEzIETvAVesj8jtFaQ=s4800-w800",
      description:
        "Popular American burger chain known for its customizable burgers, hand-cut fries, and milkshakes.",
      area: "central",
      tag: "BURGERS",
      address:
        "#01-32-25 Unit #01-32/33/34C/35 Plaza Singapura, Singapore 238839",
      phone: "69764385",
      hours: "Monday, Wednesday-Sunday: 11 am-10 pm, Tuesday: 11 am-4 pm",
      website: "https://www.fiveguys.com.sg/",
    },
    {
      id: "astons-suntec",
      name: "ASTONS Specialities",
      rating: 4.4,
      reviews: 1184,
      location: "Suntec City",
      tags: ["Western", "Steakhouse", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwyqVsER6M0U4Fda99yTuH9zeDsMHReCZ8yK8c5LYmGuiCV8qZFk9JNGve4KgiVJgRXE4mJZFjfAhIU727nlxyQGqZ4_8as-LCkwEhH2NyncxKfZUoRYUXPVivOv8RA2SJrcYFCgbsYG_Xjhw=s4800-w800",
      description:
        "Popular steakhouse chain serving quality Western meals at affordable prices in a casual setting.",
      area: "central",
      tag: "VALUE STEAK",
      address: "3 Temasek Blvd, #B1-161, Singapore 038983",
      phone: "+65 6337 2468",
      hours: "Monday to Sunday 11:30 am-10 pm",
      website: "https://www.astons.com.sg",
    },
    {
      id: "marche-suntec",
      name: "Marche Suntec City",
      rating: 4.2,
      reviews: 2630,
      location: "Suntec City",
      tags: ["European", "Swiss", "Market Style"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEcyVTi8qK299QcZmxNvbtG1io7f3A6KKSVzHMwrZmyROvRi90ZeAyfpEOmUEAdcNYzD5JTj4QhWnM5KZwkBEb_fvNNT_dJAKE=s4800-w800",
      description:
        "European market-style restaurant with various food stations offering fresh, made-to-order European dishes.",
      area: "central",
      tag: "EUROPEAN",
      address:
        "3 Temasek Boulevard #01-612 to 614, Tower 3 Suntec City, 038983",
      phone: "+65 6593 1704",
      hours:
        "Monday to Thursday 11 am-9:30 pm, Friday 11 am-10:30 pm, Saturday 10 am-10:30 pm, Sunday 10 am-9:30 pm",
      website: "https://www.marche.sg",
    },
    {
      id: "morganfields-suntec",
      name: "Morganfield's | Suntec City",
      rating: 4.1,
      reviews: 976,
      location: "Suntec City",
      tags: ["Western", "American", "Ribs"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGDb51F5YPyprZzpk9aKYO5ipaISQa0mvrsKQtN_5iflu1fJgiDUC3EqVN0hpcNKAV_qTXX_1XqiHicyG2weodY8S-YIQHAgDo=s4800-w800",
      description:
        'American restaurant specializing in "Sticky Bones" - barbecued ribs basted with signature sauce.',
      area: "central",
      tag: "RIBS",
      address: "3 Temasek Blvd, #01 - 645 / 646, Singapore 038983",
      phone: "+65 6736 1136",
      hours:
        "Monday to Thursday 11 am-10 pm, Friday to Saturday 11 am-11 pm, Sunday 11 am-10 pm",
      website: "https://www.morganfields.com.sg",
    },
    {
      id: "isteaks-suntec",
      name: "iSTEAKS @ Suntec City",
      rating: 4.1,
      reviews: 1028,
      location: "Suntec City",
      tags: ["Western", "Steakhouse", "Affordable"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqGPNH8CNEJovMIKVrhCv2k6bZcnRU4pMa2JRx8bSggA0Tht6qdDHJvd6TWgKoVtGAqXqafFub-udzBfBx_9mMWInKzofRbz7MQ=s4800-w800",
      description:
        "Casual steakhouse offering quality steaks and Western dishes at reasonable prices.",
      area: "central",
      tag: "STEAK",
      address: "3 Temasek Blvd, #02-472 / 473, Singapore 038983",
      phone: "+65 6285 8839",
      hours: "Monday to Sunday 11 am-10 pm",
      website: "https://www.isteaks.com.sg",
    },
    {
      id: "true-cost-suntec",
      name: "True Cost",
      rating: 4.1,
      reviews: 849,
      location: "Suntec City",
      tags: ["Western", "Bar", "Value"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHwIwrMxAiBpeEYaCw8paIwZBppHdNnjb48ECz4TTrQ_9qMVPIxb-PGdgA4DL3UTljvisw1rCknXIEeIMS37unSjscnSWia7Q=s4800-w768",
      description:
        "Unique concept bar and restaurant where drinks are sold at retail price with a cover charge.",
      area: "central",
      tag: "BAR",
      address: "3 Temasek Blvd, #03-302/303 Suntec City, Singapore 038983",
      phone: "+65 9170 2502",
      hours: "Monday to Sunday 12-10:30 pm",
      website: "https://www.truecost.sg",
    },
    {
      id: "soup-spoon-novena",
      name: "The Soup Spoon Novena",
      rating: 3.9,
      reviews: 367,
      location: "Velocity@Novena Square",
      tags: ["Western", "Soup", "Healthy"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzAbkuZdGY_ZBkonaPiYrt0_tThPAfY_Ml0In5Zo4Z0nP_HikMA_uv32h-PlHFKhvvdYnpWv0CK-Jj4xO70oZ9xGnJHDZ795e4hxo7DY8gMBixY0OOd2ipVQQxI9Znijj8yMRRDLCHU6CVb=s4800-w800",
      description:
        "Restaurant specializing in nutritious and hearty soups with a range of Western sides and sandwiches.",
      area: "central",
      tag: "SOUP",
      address: "Novena Square, 238 Thomson Rd, #01-62/63, 307683",
      phone: "+65 6255 6128",
      hours: "Monday to Sunday 10:30 am-10 pm",
      website: "https://www.thesoupspoon.com",
    },
    {
      id: "fish-co-amk",
      name: "Fish & Co. @ AMK Hub",
      rating: 4.1,
      reviews: 1063,
      location: "AMK Hub",
      tags: ["Western", "Seafood", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwWlEqadH5Vr5cWksafjPMw9FdD6H6KmOYLO7Ua5EZe4A80eEkQL4YiUJWv0NkxyTs2MBnJHFSp6AhMwmvj1-eOtn5TviqDcPsqEzvf_Qs2gaqGNgTcEmHtNkBRTrewwXW3B3Tb6xMXXOTuYg=s4800-w800",
      description:
        "Casual seafood restaurant serving fish and chips and other seafood dishes in a pan.",
      area: "north-east",
      tag: "SEAFOOD",
      address: "53 Ang Mo Kio Ave 3, #02 - 02 AMK Hub, Singapore 569933",
      phone: "65556298",
      hours: "Monday to Sunday: 11 am-9:30 pm",
      website: "https://www.fish-co.com/",
    },
    {
      id: "swensens-amk",
      name: "Swensen's @ AMK Hub",
      rating: 3.8,
      reviews: 1003,
      location: "AMK Hub",
      tags: ["Western", "Family Friendly", "Dessert"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqG3P67Mn49JW5LFn47hFQCe331m6tFjbwLV5OJWSh9nHoeT0zwoQ5MTM7BX9VvnS63LPha2Od0VdTiKER5fsZxJBKXgeOq1usk=s4800-w800",
      description:
        "Family-friendly restaurant offering Western cuisine and famous for its ice cream sundaes.",
      area: "north-east",
      tag: "FAMILY",
      address: "53 Ang Mo Kio Ave 3, #B1-21A, Singapore 569933",
      phone: "62359902",
      hours: "Monday to Sunday: 11 am-10:30 pm",
      website: "http://www.swensens.com.sg/",
    },
    {
      id: "big-pasta-amk",
      name: "Big Pasta Small Pasta",
      rating: 2.9,
      reviews: 48,
      location: "AMK Hub",
      tags: ["Western", "Italian", "Pasta"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxkumBSAUz7nKga5HP8Mr8RigW4RzG9H3VToIMkaCYLO2m1sPiqT74c8oF62Hpt3M4EnkdEhRUoUOUsBRC1SQsZAyXFXRneWZ5oTKlqEZABnER4nhwX-izAXRSvti_MAd8nXDNf3yF0U97A=s4800-w800",
      description:
        "Pasta restaurant offering a variety of pasta dishes in different portion sizes.",
      area: "north-east",
      tag: "PASTA",
      address: "53 Ang Mo Kio Ave 3, B2-47 AMK Hub, Singapore 569933",
      phone: "Not available",
      hours: "Monday to Sunday: 11 am-9:30 pm",
      website: "https://www.bigpastasmallpasta.com",
    },
    {
      id: "ambush-junction8",
      name: "Ambush",
      rating: 4.0,
      reviews: 639,
      location: "Junction 8",
      tags: ["Western", "Steakhouse", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDybuRRBRoyc2G2CqH7F1qn2WoNPyKbH8KKL-19B_V6HTo9nHxlAlk_KjeVXJn7FCTEzmklh9r4UxNjisdLUPQ229KDQzPNLT70s7rWC5MfeODo8hMWho3QDoqLX9A1MW_d-wpBuTln1RXan5RQqgq7e=s4800-w800",
      description:
        "Western restaurant serving steaks, pasta, and other Western favorites in a casual setting.",
      area: "north-east",
      tag: "CASUAL",
      address:
        "9 Bishan Pl, #02-19 to 20 & #02-27 Junction 8, Singapore 579837",
      phone: "63533960",
      hours: "Monday-Sunday: 11 am-10 pm",
      website: "https://www.ambush.com.sg/",
    },
    {
      id: "grub-junction8",
      name: "GRUB Junction 8",
      rating: 4.1,
      reviews: 330,
      location: "Junction 8",
      tags: ["Western", "Burgers", "Family Friendly"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxQENX_QGYLCHa9F_L5IsHQsgOa3pYzYhnWvs329VD8H_BgMB8W7e8kEajm60PxqsMYuLfQH4R8cOvIst0MkaKXjECsf30wfrsOd9AeHlkWJSpAdO0Xeb7Zl_VjjFFwdObRFf6ReO0861Xq=s4800-w800",
      description:
        "Local Western food concept serving quality burgers, pastas, and other Western dishes using fresh ingredients.",
      area: "north-east",
      tag: "LOCAL WESTERN",
      address: "9 Bishan Pl, #01-38 Junction 8, Singapore 579837",
      phone: "88919298",
      hours: "Monday-Friday: 11 am-10 pm, Saturday-Sunday: 10 am-10 pm",
      website: "https://grub.com.sg/",
    },
    {
      id: "saybons-junction8",
      name: "SAYBONS @ Bishan Junction 8",
      rating: 3.5,
      reviews: 382,
      location: "Junction 8",
      tags: ["Western", "European", "French"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHRQ1-ySMAJ646LkScDG3Tz6fMOGyMKIz3t72DpAyMzYfQRO933rSgK139uEicPzfA9H2miKeTuHEGcvoSNRHeiS4b6-QF79Y0=s4800-w800",
      description:
        "French-inspired restaurant offering soups, savory crepes, and other European dishes at affordable prices.",
      area: "north-east",
      tag: "FRENCH",
      address: "9 Bishan Pl, #02-43, Singapore 579837",
      phone: "62583138",
      hours:
        "Monday-Thursday, Sunday: 10 am-9 pm, Friday-Saturday: 10 am-9:30 pm",
      website: "http://www.saybons.com/",
    },
    {
      id: "swensens-junction8",
      name: "Swensen's @ Junction 8",
      rating: 3.8,
      reviews: 1005,
      location: "Junction 8",
      tags: ["Western", "Family Friendly", "Dessert"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzkY_kzMjn5oHfILCP2-IHswGPXSGCW_MV8vKiJvZZ09Ar1nEtHmG5puCWMIa9c1U1XMzyxYrjEBmNm6qGjHD3pKJQwupV5ajMdRTwPjjp52yocXns7nQzByctGcINw4eC92xjQD_Yq2ePEAQ=s4800-w800",
      description:
        "Family-friendly restaurant serving Western cuisine alongside famous ice cream sundaes.",
      area: "north-east",
      tag: "ICE CREAM",
      address: "9 Bishan Pl, #01-39 Junction 8, Singapore 579837",
      phone: "62526229",
      hours: "Monday-Sunday: 11 am-10:30 pm",
      website: "http://www.swensens.com.sg/",
    }
  ],
  deals: [
    {
      id: "deal1",
      badge: "20% OFF",
      title: "20% OFF All Pasta Dishes at Fish & Co. (AMK Hub)",
      duration: "Valid till: 31 May 2025",
      description:
        "Enjoy 20% off all pasta dishes at Fish & Co. AMK Hub. Valid for dine-in only, Monday to Thursday.",
      code: "PASTA20",
    },
    {
      id: "deal2",
      badge: "1-FOR-1",
      title: "1-for-1 Main Course at Marche (Suntec City)",
      duration: "Valid till: 15 Jun 2025",
      description:
        "Buy one main course and get one free at Marche, Suntec City. Second main course must be of equal or lesser value. T&Cs apply.",
      code: "MARCHE121",
    },
    {
      id: "deal3",
      badge: "FREE",
      title: "Free Dessert with Any Steak Order at iSTEAKS (Suntec City)",
      duration: "Valid till: 20 May 2025",
      description:
        "Enjoy a complimentary dessert with any steak order at iSTEAKS Suntec City.",
      code: "SWEETSTEAK",
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
      name: "Korean",
      image:
        "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80",
      url: "/cuisine/korean",
    },
    {
      name: "Thai",
      image:
        "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=800&q=80",
      url: "/cuisine/thai",
    },
    {
      name: "Indian",
      image:
        "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80",
      url: "/cuisine/indian",
    }
  ],
};
