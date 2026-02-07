import type { CuisineData } from "./types";

export const CAFE_CUISINE: CuisineData = {
  slug: "cafe",
  name: "Café",
  tagline:
    "From artisanal coffee to brunch delights, find the best cafés near you",
  features: [
    { label: "Specialty Coffee" },
    { label: "Artisanal Pastries" },
    { label: "Brunch Menus" },
    { label: "Cozy Ambience" },
    { label: "Wi-Fi Available" }
  ],
  heroImages: [
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1376&q=80"
  ],
  stats: {
    restaurants: 43,
    menuItems: "1,500+",
    deals: 3,
    malls: 12,
  },
  restaurants: [
    {
      id: "paris-baguette-nex",
      name: "Paris Baguette @Serangoon Central",
      rating: 4.2,
      reviews: 375,
      location: "NEX",
      tags: ["Cafe", "French", "Bakery"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHVvavX5Q1dCJPTrdcqoZV68Uyd0gWanK2uYCmHfxKBgbZrUB004XH1DomUBtXTliEJomI7zrg0OLQtTKu4CBQtAfIceDnimP8=s4800-w800",
      description:
        "French-inspired bakery cafe offering pastries, bread, cakes, and light meals in a modern, elegant setting.",
      area: "north-east",
      tag: "FRENCH CAFE",
      address: "23 Serangoon Central, #01-67 NEX, Singapore 556083",
      phone: "65090445",
      hours: "Monday to Sunday: 8 am–10 pm",
      website: "https://bit.ly/2SYZFTD",
    },
    {
      id: "paris-baguette-bedok",
      name: "Paris Baguette @Bedok Mall",
      rating: 4.4,
      reviews: 285,
      location: "Bedok Mall",
      tags: ["Cafe", "French", "Bakery"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwq2lBb1l4Geu0iiT4NoW7xR2XGkNUauZmpY4X1wNwCQb_6J7IFAbX2nUW0zEa7YDdv1PSEUMIsqTe34mdifWowH7a9gx1GWHTTzN4ydgJSmeBTNvmejH6abu4FwOIAF6i6TWfnsin-mSiX=s4800-w800",
      description:
        "French-inspired bakery cafe offering freshly baked goods, artisanal pastries, and specialty coffee in a sophisticated environment.",
      area: "east",
      tag: "FRENCH CAFE",
      address: "311 New Upper Changi Road 01 - 31 Bedok Mall, 467360",
      phone: "Not available",
      hours: "Monday to Sunday: 8 am–10 pm",
      website: "http://www.parisbaguette.com.sg/",
    },
    {
      id: "paris-baguette-jewel",
      name: "Paris Baguette @Jewel Changi",
      rating: 3.8,
      reviews: 470,
      location: "Jewel",
      tags: ["Cafe", "French", "Bakery"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHUmEAw3q9QhgY_UnWgmzswUZK02P69mGKWYUYpwLnXefYO-hqQAG4PjkDQRF296eY-hqhe6dh06xe33L90KFXrxnVhKMQK6R0=s4800-w800",
      description:
        "Popular French-inspired bakery cafe offering a wide selection of breads, pastries, cakes, and beverages in an airport setting.",
      area: "east",
      tag: "FRENCH CAFE",
      address:
        "78 Airport Boulevard Jewel Changi, #02 - 200 Singapore Changi Airport, 819666",
      phone: "62149495",
      hours: "Monday-Friday & Sunday: 8 am–10 pm",
      website: "http://www.parisbaguette.com.sg/",
    },
    {
      id: "paris-baguette-jem",
      name: "Paris Baguette @Jem",
      rating: 4.1,
      reviews: 955,
      location: "JEM",
      tags: ["Cafe", "French", "Bakery"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHFUsEBpnDhyO484H7dfreKdKYLobCn_B20855ZIoexAiNPKx1luXS_OWYbf4hoz7skEbsPbfrx3GsQhJO5rFMLSQPrX31YdRg=s4800-w800",
      description:
        "French-inspired bakery cafe offering artisanal breads, pastries, sandwiches, and coffee in a contemporary setting.",
      area: "west",
      tag: "FRENCH CAFE",
      address: "50 Jurong Gateway Rd, #02 - 20 / 21 Jem, Singapore 608549",
      phone: "67347765",
      hours: "Monday-Sunday: 8 am–10 pm",
      website: "Not available",
    },
    {
      id: "coffeesarang-bedok",
      name: "COFFEESARANG",
      rating: 4.2,
      reviews: 212,
      location: "Bedok Mall",
      tags: ["Cafe", "Korean", "Coffee"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFXx5LkuIXA08CXNQdL5fF1iIzh7n1Hrhoupep4QyOTpeMCHKV-osoIhhSOmwuj8lL6j4wcuyaKaG5vocCpKAHaTnyE0wtuvbw=s4800-w403",
      description:
        "Korean-style cafe offering specialty coffee, teas, and light bites in a cozy, modern atmosphere.",
      area: "east",
      tag: "KOREAN CAFE",
      address: "311 New Upper Changi Rd #01-78 Bedok Mall, 467360",
      phone: "62844550",
      hours: "Monday to Friday: 9:30 am–11 pm, Saturday to Sunday: 9 am–11 pm",
      website: "https://coffeesarang.cafe/menu",
    },
    {
      id: "arabica-jewel",
      name: "% Arabica Singapore Jewel Changi Airport",
      rating: 3.9,
      reviews: 341,
      location: "Jewel",
      tags: ["Cafe", "Japanese", "Coffee"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzwpvB_3gy1mx-ydNvQhTqJB-jw78DRozV_7ETRfx042x1qUmE5nL5rRR1XzgpJ8a-9K2dFBh8vxRS4tPj4y6pxtDvig4asOeR8315Zf5aisAeZ6w8tU4xjK0q5stOiuxE14zFyXJhqQw8EZdI=s4800-w800",
      description:
        "Minimalist Japanese coffee chain known for its high-quality beans, precision brewing techniques, and sleek, modern aesthetic.",
      area: "east",
      tag: "SPECIALTY COFFEE",
      address: "78 Airport Boulevard #01, K208, 819666",
      phone: "96805288",
      hours:
        "Monday-Thursday & Sunday: 10 am–9 pm, Friday-Saturday: 10 am–10 pm",
      website:
        "https://food.grab.com/sg/en/restaurant/arabica-jewel-delivery/4-C6XTN7EHNP2DSA?",
    },
    {
      id: "hoshino-united",
      name: "Hoshino Coffee @ United Square",
      rating: 3.1,
      reviews: 339,
      location: "United Square",
      tags: ["Japanese", "Cafe", "Dessert"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqHe-Gi4VrBaY2iTAiF7hi7jOc_WA5T0rHajZ1w8uVjrBEwTgHP_fhQ65KJ2DliW6s1XYkHfuxRxwTv0YbTVOujb8s-xXoOxPzg=s4800-w800",
      description:
        "Japanese-style cafe offering hand-drip coffee, signature soufflé pancakes, and Western-Japanese fusion dishes in a cozy setting.",
      area: "central",
      tag: "CAFE",
      address: "101 Thomson Rd, #02-06/07, Singapore 307591",
      phone: "62645878",
      hours: "Monday-Friday: 11 am–9 pm, Saturday-Sunday: 9 am–9 pm",
      website: "https://www.hoshinocoffee.com.sg/",
    },
    {
      id: "coffeebean-amk",
      name: "The Coffee Bean & Tea Leaf - AMK Hub",
      rating: 3.7,
      reviews: 381,
      location: "AMK Hub",
      tags: ["Cafe", "Coffee", "Tea"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFuFjJSRyznpBJDY05ePgtgVNS82h5t3NFQzA54Cg9vanyUhJKNLkK-icLc0uobCLsoo9nN4r4twu-c0wjpRS1w4vN6fuVj4Rg=s4800-w800",
      description:
        "Popular cafe chain offering specialty coffee, tea, and light bites in a relaxed atmosphere. Known for their Ice Blended drinks.",
      area: "north",
      tag: "COFFEE CHAIN",
      address: "53 Ang Mo Kio Ave 3, #B1 - 14, Singapore 569933",
      phone: "62350203",
      hours: "Monday to Sunday: 7 am–2 am",
      website: "https://www.coffeebean.com.sg/",
    },
    {
      id: "starbucks-citysquare",
      name: "Starbucks City Square Mall",
      rating: 4.1,
      reviews: 523,
      location: "City Square Mall",
      tags: ["Cafe", "Coffee", "Dessert"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDw3YLVbL9STv7-A9YdkbrAQ6uWJCFvPaa6VjPvPLRLIM8kISSxnfHwahIsrfGNk9P6OhO8rM50h2zqolftGoks6aCH4WKqMiJpZwAqc-oDQKmuqRcYQMp6iIfwhXSQRRbdJIIp7oEczbyMDnA=s4800-w800",
      description:
        "Global coffeehouse chain offering signature coffee drinks, light bites and pastries in a comfortable environment with free Wi-Fi.",
      area: "north-east",
      tag: "COFFEE CHAIN",
      address:
        "180 Kitchener Road 01-38 City Square Mall, 180 Kitchener Rd, #01 - 38, 208539",
      phone: "69101275",
      hours:
        "Monday-Thursday & Sunday: 7:30 am–11 pm, Friday-Saturday: 7:30 am–12 am",
      website: "http://www.starbucks.com.sg/",
    },
    {
      id: "starbucks-novena",
      name: "Starbucks Novena Square",
      rating: 3.9,
      reviews: 176,
      location: "Novena Square",
      tags: ["Cafe", "Coffee", "Dessert"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwOH7-Xn66XSnGMLjFJcE8MzOJSawf1Jy89cpXmvQ3np6bK8oF6hreBRQ60OZgwqEEZKIisKe5gY01TlvlWd52prwpqeYhhBZ2WFLabEDAoc5wIrc42sr2o0DaEOyPZ6I8HXGhNDDWcTvLLMA=s4800-w800",
      description:
        "International coffeehouse chain serving their signature coffee drinks, sandwiches and pastries in a relaxed setting with Wi-Fi.",
      area: "central",
      tag: "COFFEE CHAIN",
      address: "238 Thomson Rd, #02 - k7 / k8 Novena Square, Singapore 307683",
      phone: "+65 6910 1191",
      hours: "Monday to Friday 7 am–9 pm, Saturday to Sunday 8 am–8 pm",
      website: "http://www.starbucks.com.sg",
    },
    {
      id: "starbucks-united",
      name: "Starbucks United Square",
      rating: 4.2,
      reviews: 1017,
      location: "United Square",
      tags: ["Cafe", "Coffee", "Dessert"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwn046M9UqgenF5P6VMGdwiXrgR8E4TUnsJLJ3vGuMx96V9LXN7NzWJ9-53ukr5AK2Vvb9It6f9C-Em1AmzFiySU4hFNn0rbDsciIBWUYOBSfm_JjP1gH8n6iYyHAs910apkb8yqFe1NS12iA=s4800-w800",
      description:
        "Popular global coffee chain offering a variety of coffee drinks, pastries and light bites in a comfortable environment with free Wi-Fi.",
      area: "central",
      tag: "COFFEE CHAIN",
      address: "101 Thomson Rd, #01-01 United Square, Singapore 307591",
      phone: "69101185",
      hours: "Monday-Sunday: 7:30 am–10:30 pm",
      website: "http://www.starbucks.com.sg/",
    },
    {
      id: "starbucks-amk",
      name: "Starbucks Ang Mo Kio Hub",
      rating: 3.2,
      reviews: 224,
      location: "AMK Hub",
      tags: ["Cafe", "Coffee", "Dessert"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqFtuNpBaRJp1WxU54Cn5xrR8iCW623TnEYr9ZRuB_gw4QGGkkBJkaYh7Bm0dCLfq_fFG1Rh78qV-qY72Sqqt-o0RLwprCes06k=s4800-w800",
      description:
        "International coffee chain offering a wide range of coffee beverages, pastries and light meals in a relaxed atmosphere with free Wi-Fi.",
      area: "north",
      tag: "COFFEE CHAIN",
      address: "53 Ang Mo Kio Ave 3, B1-65 AMK Hub, Singapore 569933",
      phone: "69101152",
      hours:
        "Monday to Thursday: 7:30 am–10 pm; Friday to Saturday: 7:30 am–10:30 pm; Sunday: 7:30 am–10 pm",
      website: "http://www.starbucks.com.sg/",
    },
    {
      id: "coffeebean-suntec",
      name: "The Coffee Bean & Tea Leaf",
      rating: 3.6,
      reviews: 239,
      location: "Suntec City",
      tags: ["Cafe", "Coffee", "Tea"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqF0UIl0y9BnwN5ePpycAAYK7Fn3CBYEC5yZUe17pNGSLFWfSyNIiJSB1kluGWp_8R4DhN2h1cZDE8uGiWEzmfq2x6UQhjx4fJo=s4800-w800",
      description:
        "International cafe chain known for specialty coffee, tea and Ice Blended drinks, along with pastries and light meals in a comfortable setting.",
      area: "south",
      tag: "COFFEE CHAIN",
      address: "3 Temasek Blvd, #01-341 / 342, Singapore 038983",
      phone: "+65 6517 9828",
      hours:
        "Monday to Thursday 7:30 am–10:30 pm, Friday to Saturday 7:30 am–11 pm, Sunday 7:30 am–10:30 pm",
      website: "https://www.coffeebean.com.sg",
    },
    {
      id: "huggs-united",
      name: "Huggs Coffee",
      rating: 4.6,
      reviews: 22,
      location: "United Square",
      tags: ["Cafe", "Coffee", "Quick Bites"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEspnXhTampn4BUAPDJtS4fpBdb-v532tKZWICE2WbLqOSQRdZuJV74wTTzjgmzXvA3KFnyFOoM-ZWkwsu9rYcoYNHQBrKW8Bo=s4800-w800",
      description:
        "Local coffee chain offering quality coffee beverages, teas, and light snacks in a simple, modern setting ideal for quick breaks.",
      area: "central",
      tag: "LOCAL CAFE",
      address: "101 Thomson Rd, Lobby, #02-K2 United Square Office, 307591",
      phone: "88347028",
      hours: "Monday-Friday: 8 am–6 pm, Saturday-Sunday: 8:30 am–5:30 pm",
      website: "https://huggscoffee.com/",
    },
    {
      id: "tcc-vivocity",
      name: "tcc - The Connoisseur Concerto @ VivoCity",
      rating: 4.0,
      reviews: 484,
      location: "VivoCity",
      tags: ["Cafe", "Western", "Dessert"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyoQEhWldqT--ZQrHYvoo_xEB2d17aorUWxUl3H3eLqzFgFWztheSKjzzvy3g2EpK1FGc858Qf4yAWCGe_iiBg90Z-DSlyyaZLDNK-83XBrVCngDbNlcjxxn3eD55zhD6Z8lQODA1woEZBmQw=s4800-w800",
      description:
        "Upscale cafe offering premium coffee blends, artisanal teas, and an extensive menu of Western cuisine and exquisite desserts.",
      area: "central",
      tag: "PREMIUM CAFE",
      address: "1 HarbourFront Walk, #02 -149, Singapore 098585",
      phone: "62215455",
      hours: "Monday-Sunday: 11 am–10 pm",
      website: "http://theconnoisseurconcerto.com/",
    },
    {
      id: "providore-vivocity",
      name: "The Providore - VivoCity",
      rating: 4.0,
      reviews: 104,
      location: "VivoCity",
      tags: ["Cafe", "Western", "Grocery"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwPXsp0rEH-J-YKNjZZPw7PVDWPjQzQa-74ow25S-bIR3M7Rd1TiteekR3jvq1mTtSY0g1LjBbY_iyD6_viMBpPwWKRekAaK_FyAe1Z5N5DulKESPY3Vf4SHzh4ipfUoqZ8-kVNUOas-ZL73A=s4800-w800",
      description:
        "Combination of gourmet cafe and grocery store offering specialty coffee, artisanal food products, and a menu featuring fresh, quality ingredients.",
      area: "central",
      tag: "GOURMET CAFE",
      address: "1 HarbourFront Walk, #01-188, Singapore 098585",
      phone: "62217056",
      hours: "Monday-Friday: 8 am–10:30 pm, Saturday-Sunday: 9 am–10:30 pm",
      website: "https://theprovidore.com/",
    },
    {
      id: "guerilla-suntec",
      name: "Guerilla Coffee @ Suntec",
      rating: 4.1,
      reviews: 265,
      location: "Suntec City",
      tags: ["Cafe", "Coffee", "Pastries"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDy_Fz8CKSnizCxcwOiVuVyxiRj_GkVbAmvUU7tueIDIa87K4mvmKEBPrySPmNaLcOT1GIk0Yx7UYHqal_Qcdj8jfqqbhTI7SDfaRCeKdRJToPM92d8gzx9h3zzSaKYKFlunvsVTPTfecLTQ2A=s4800-w800",
      description:
        "Specialty coffee shop focusing on quality beans and brewing techniques. Offers artisanal coffee, tea and a selection of pastries.",
      area: "south",
      tag: "SPECIALTY COFFEE",
      address:
        "3 Temasek Blvd, #01-506 / 507 Suntec City Mall, Singapore 038983",
      phone: "+65 8031 8877",
      hours: "Monday to Friday 8 am–8 pm, Saturday to Sunday 9 am–8 pm",
      website: "https://www.guerilla.sg",
    },
    {
      id: "compose-suntec",
      name: "Compose Coffee Suntec City",
      rating: 4.1,
      reviews: 216,
      location: "Suntec City",
      tags: ["Cafe", "Coffee", "Korean"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzTPkrIAxkW_JgGfeN3psE7-wV14ip1xCi5tNA5dsgSdWCMKq05W5nMgKdMv7n0P2HpJ6ON_m8lu6vawwvhtvnH2tAE3sx3LM_vw4VNf0q8hiL4v-GnKBSqMI1dW6-w6UWpptLugYTb7SK1lwANmDOi3Q=s4800-w800",
      description:
        "Korean-inspired coffee shop serving specialty coffee, unique beverages and light snacks in a minimalist, modern setting.",
      area: "south",
      tag: "KOREAN CAFE",
      address: "3 Temasek Blvd, #01-623, Singapore 038983",
      phone: "+65 8952 1130",
      hours:
        "Monday to Thursday 8 am–8 pm, Friday 8 am–9 pm, Saturday 10 am–9 pm, Sunday 9 am–8 pm",
      website: "https://composecoffee.sg",
    },
    {
      id: "luckin-suntec",
      name: "luckin coffee - Suntec City",
      rating: 3.2,
      reviews: 45,
      location: "Suntec City",
      tags: ["Cafe", "Coffee", "Chinese"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEyQHUBLXrUW1jPZlDYLZsSykcU9kFJiTd-T45TxYalYxH24h5ieQpa4u_9Kee15mDy9eg5bNdXzzqw2FX8lnC8b-NBZ34i71c=s4800-w800",
      description:
        "Popular Chinese coffee chain known for quality coffee beverages at competitive prices, offering a tech-enabled ordering experience.",
      area: "south",
      tag: "CHINESE CAFE",
      address: "3 Temasek Blvd, $02-375/376 Suntec City, Singapore 038983",
      phone: "+65 6970 0518",
      hours: "Monday to Sunday 8 am–10 pm",
      website: "https://www.luckincoffee.com",
    },
    {
      id: "coffeesmith-suntec",
      name: "Coffeesmith (Suntec)",
      rating: 4.0,
      reviews: 545,
      location: "Suntec City",
      tags: ["Cafe", "Coffee", "Korean"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDw6VKdWL1V9gVZcXgHxvNrApxiBwWtkuTqYtTwanx_CK3kfckWDD6saSUHITEPMqphFb6xCOb5ixEQM-EPgXjblXtObnrBU2IrUgmpM3L1mqor0Bq7YxtsV_7K2KcdaEVnCqlZD0OyvhSGbYQ=s4800-w800",
      description:
        "Korean-style coffee house offering premium coffee beverages, teas, and light bites in a sophisticated, comfortable atmosphere.",
      area: "south",
      tag: "KOREAN CAFE",
      address: "3 Temasek Blvd, #02-413 Tower 5, Singapore 038983",
      phone: "+65 6254 7994",
      hours: "Monday to Thursday 8 am–11 pm, Friday to Sunday 8 am–1 am",
      website: "https://coffeesmith.com.sg",
    },
    {
      id: "timhortons-suntec",
      name: "Tim Hortons Suntec City",
      rating: 4.1,
      reviews: 106,
      location: "Suntec City",
      tags: ["Cafe", "Coffee", "Canadian"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqEf4qjOuquoO2q7BaA8CGmGTFvgWKxP4tzHoFBDM6fUX2JYiEoRTyOv_mXhwp-uKaa2gN3E9SW0iJEyBcm8GQX78LqifyRTrAw=s4800-w800",
      description:
        "Canadian coffee and fast food chain known for their coffee, donuts, and Timbits. Offers breakfast and lunch options in a casual setting.",
      area: "south",
      tag: "CANADIAN CAFE",
      address:
        "3 Temasek Boulevard, Suntec City, Mall, #01-314 Convention Centre, 038983",
      phone: "+65 6242 5322",
      hours: "Monday to Friday 8 am–10 pm, Saturday to Sunday 10 am–10 pm",
      website: "https://timhortons.sg",
    },
    {
      id: "xinwang-suntec",
      name: "Xin Wang Hong Kong Cafe",
      rating: 4.5,
      reviews: 917,
      location: "Suntec City",
      tags: ["Chinese", "Hong Kong", "Cafe"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyql2mGLlJu_dqEqKlSEHVOWMUAssIay4IfXY_oas3ml8ufjyyWYi7rRT7gBGbpmvCnT6eWcoiYk377hr-I2Eckr_ZyCsL5lOuWq_suZnrLuqeA7U8zOrGGzrfEQoSXsrijfcbA58kDnAe4ymioKJmn=s4800-w800",
      description:
        "Hong Kong-style cafe offering a fusion of Asian and Western dishes including HK milk tea, pork chop rice, and French toast.",
      area: "south",
      tag: "HONG KONG CAFE",
      address: "3 Temasek Blvd, #B1-128 / 129, Singapore 038983",
      phone: "+65 6231 1599",
      hours: "Monday to Sunday 8 am–10 pm",
      website: "https://www.xinwang.com.sg",
    },
    {
      id: "kopitarts-citysquare",
      name: "Kopi & Tarts @ City Square Mall",
      rating: 3.8,
      reviews: 233,
      location: "City Square Mall",
      tags: ["Cafe", "Local", "Pastry"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzrnI79xs863QExLxKAwqvuAbzwmfvTsbNxhpjFLDu-UozHwwV2Qf9o3vJ2tihTi0K2m0cK7xd9TIhB2D728Ku1rdJJ4HqdyCHA5FhZyLLl5BXlJzgQleBEXb8Nbkv2LN4-ZRywBaluANs7eg=s4800-w800",
      description:
        "Local cafe offering traditional coffee, tarts, and local delights in a modern setting. Perfect for a quick breakfast or afternoon snack.",
      area: "north-east",
      tag: "LOCAL BAKERY",
      address: "180 Kitchener Rd, B1 - 23 City Square Mall, Singapore 208539",
      phone: "62665280",
      hours: "Monday-Sunday: 8 am–9 pm",
      website: "https://www.kopiandtarts.com.sg/",
    },
    {
      id: "kopitarts-suntec",
      name: "Kopi & Tarts Temasek Blvd",
      rating: 3.8,
      reviews: 119,
      location: "Suntec City",
      tags: ["Cafe", "Local", "Pastry"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDx0fcKQLSjw5NVvqyTt8zwQTHrul1_gR1aY4VUe34l0pBvuiqjO61WhbKoKo8OjTQ0hroGYMBcFxCdRgARmflmFAxTn6MaVPcO90QTCrv6yw2WnEhSCuSPISFx7pSsME3vw_zUq-a9SPWuclA=s4800-w800",
      description:
        "Local cafe serving traditional kopi (coffee), signature tarts, and other local snacks in a casual, contemporary setting.",
      area: "south",
      tag: "LOCAL BAKERY",
      address: "3 Temasek Blvd, #01-648, Singapore 038983",
      phone: "+65 8853 8119",
      hours:
        "Monday to Thursday 7 am–8:45 pm, Friday 7 am–9 pm, Saturday to Sunday 9 am–9 pm",
      website: "https://www.kopiandtarts.com",
    },
    {
      id: "toastbox-vivocity",
      name: "Toast Box",
      rating: 3.7,
      reviews: 752,
      location: "VivoCity",
      tags: ["Local", "Cafe", "Breakfast"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDzWgICHcCRwWoQ6ZZiu1YDvBVAMfXK6WhfZpcFXsdsF4TnNLxcSrMIjX4EXaQFj1UCn7-AzovZR83xiI5kUe2Fq7vtfLlg2G6xr8nl6FaFYWeZ4cHqfneR554Br5YkE1GIJ49MCUD5hHifd=s4800-w800",
      description:
        "Popular local cafe chain offering traditional Singaporean breakfast sets with kaya toast, soft-boiled eggs, and local coffee.",
      area: "central",
      tag: "LOCAL KOPI",
      address: "1 HarbourFront Walk, B2-34 VivoCity, Singapore 098585",
      phone: "62784434",
      hours:
        "Monday-Thursday, Sunday: 7:30 am–9:30 pm, Friday-Saturday: 7:30 am–10 pm",
      website: "http://toastbox.com.sg/",
    },
    {
      id: "toastbox-suntec",
      name: "Toast Box (Suntec City)",
      rating: 3.9,
      reviews: 343,
      location: "Suntec City",
      tags: ["Local", "Cafe", "Breakfast"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDys2HRZVAGuS25p8SDHqZ49x76jGW4s3U5owU50VBeCHLViUh0zCK_r_1GIoQAum417XitFYKkggbqwxQ-jX0mZ0tIvyhmISxG7EOSPcJwW-xiqsk9DvvhsoVzZWR5ZaW49jTmmitTEDMu9fw=s4800-w800",
      description:
        "Traditional Nanyang coffee shop serving authentic kaya toast, Singapore-style coffee, and local breakfast favorites in a nostalgic setting.",
      area: "south",
      tag: "LOCAL KOPI",
      address: "5 Temasek Blvd, #B1-167 / 168, Singapore 038983",
      phone: "+65 6238 0130",
      hours: "Monday to Sunday 7:30 am–9 pm",
      website: "https://www.toastbox.com.sg",
    },
    {
      id: "toastbox-united",
      name: "Toast Box",
      rating: 3.5,
      reviews: 148,
      location: "United Square",
      tags: ["Local", "Cafe", "Breakfast"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyv1uIAelcHs75PEGYFg8yVAPPS-nju-puhOpU2nN8Ncy4SdFuv6V3nE464--6_wHh14_eSXnGSKQiBO7EYzhtOB5tBIEa2UbA5SDQI1kSv5maf6yxcn9VasiutaJMWemFhQu-uSwuw22P9PA=s4800-w800",
      description:
        "Local coffee shop chain offering traditional kaya toast sets, local-style coffee (kopi), and simple Asian dishes in a nostalgic setting.",
      area: "central",
      tag: "LOCAL KOPI",
      address: "101 Thomson Rd, #01-81 United Square, Singapore 307591",
      phone: "62537962",
      hours: "Monday-Sunday: 7:30 am–9 pm",
      website: "http://www.toastbox.com.sg/",
    },
    {
      id: "toastbox-mbs",
      name: "Toast Box @ Marina Bay Sands",
      rating: 3.8,
      reviews: 893,
      location: "Marina Bay Sands",
      tags: ["Local", "Cafe", "Breakfast"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxGqw69ggwttxgGymTFTWgDJR9X5bsQiQ5BH5gUqhMbbLnv1gFkDYSHNpNmLIhbZK59pU50FIroTVFVDdO5Ku0PzT4_sPkmE8nHm2Rb_xRlnQnNirP5BRCaNeO_aNk4PtKKUuHB7sd2I3P9K7VbLo7b=s4800-w800",
      description:
        "Traditional Singapore coffee shop chain serving classic kaya toast, soft-boiled eggs, and local coffee in a nostalgic setting.",
      area: "south",
      tag: "LOCAL KOPI",
      address: "2 Bayfront Ave, # B1 - 01E, Singapore 018956",
      phone: "+65 6636 7131",
      hours: "Monday to Sunday 7:30 am–9:30 pm",
      website: "https://www.marinabaysands.com/restaurants/toastbox.html",
    },
    {
      id: "toastbox-woodleigh",
      name: "Toast Box",
      rating: 2.9,
      reviews: 33,
      location: "The Woodleigh Mall",
      tags: ["Local", "Cafe", "Breakfast"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwB37pj0fXv3EBefYIqO5nj1AJUGS_RWHVJNf79cMDuFE3X_4Z3WCoHmV5lKv3tNwKzaA1uM0dy2JJ43seuVw9rFkJQN_1-XPpQeKUN1XjM3x8MpH29s1v8r4MlS2EU4KGAiw32pudp74c9uBk=s4800-w800",
      description:
        "Popular local cafe chain serving traditional kaya toast, Singapore-style coffee and tea, soft-boiled eggs and simple Asian dishes.",
      area: "north-east",
      tag: "LOCAL KOPI",
      address: "11 Bidadari Park Drive, Mall, #01-35/36 The Woodleigh, 367803",
      phone: "+65 6908 1486",
      hours: "Monday to Sunday 7:30 am–9:30 pm",
      website: "http://www.toastbox.com.sg",
    },
    {
      id: "yakun-vivocity",
      name: "Ya Kun Kaya Toast",
      rating: 4.2,
      reviews: 631,
      location: "VivoCity",
      tags: ["Local", "Cafe", "Breakfast"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwdKvswV9sdcQOoCD2Nc6-pjwcnGR_J__7mzwzBQ5edk_slxUQDzxTudOBYQ03S-QNio2IbFclGEHpPciAmSX648DKh_TvZqCWDJiq8WQOqkGmNJ8AOCQf_aTLU7vG2ixvsVv3jVOMi470xxg=s4800-w800",
      description:
        "Iconic Singapore chain known for traditional kaya toast, soft-boiled eggs, and local coffee since 1944. Simple, authentic breakfast experience.",
      area: "central",
      tag: "LEGACY KOPI",
      address: "1 HarbourFront Walk, #B2-26, Singapore 098585",
      phone: "62255789",
      hours: "Monday-Sunday: 8 am–9 pm",
      website: "http://www.yakun.com/",
    },
    {
      id: "yakun-suntec",
      name: "Ya Kun Kaya Toast",
      rating: 3.9,
      reviews: 312,
      location: "Suntec City",
      tags: ["Local", "Cafe", "Breakfast"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDwxY5mmA4BEXEB-416Gm1MsbAvQa_FFH8z3QK59NZPTqqSYeQ-mVsfooVaW1r6IyZNCrYyRaC5vdagqv82m498bWAZEfzeDl0QVa4yNB6xAR8nvjUKx-v-8rRzo3Pin5t9IT3PwgClLL3YYOg=s4800-w800",
      description:
        "Iconic Singapore coffee chain serving traditional kaya toast, soft-boiled eggs and local coffee in a simple, nostalgic setting.",
      area: "south",
      tag: "LEGACY KOPI",
      address: "3 Temasek Blvd, #B1-104, Singapore 038983",
      phone: "+65 6337 6829",
      hours:
        "Monday to Thursday 7:30 am–7 pm, Friday to Saturday 7:30 am–9 pm, Sunday 8 am–7 pm",
      website: "https://yakun.com",
    },
    {
      id: "yakun-united",
      name: "Ya Kun Kaya Toast Cuisine",
      rating: 3.8,
      reviews: 230,
      location: "United Square",
      tags: ["Local", "Cafe", "Breakfast"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDz7HWKSga1lzr3MTa6cleSgHmUE3-vyx0_tSqjId7EuKskTTa5gNrEZj7u4cjvLPN3tF5f64OxWjBdyY9grM2kjePjVdcK6A14EsBz7tdJbfJ2tJ-7tvISgmvE4Q5qq_Wo6JQCcgWpyg8SQNRQ=s4800-w800",
      description:
        "Iconic Singaporean brand offering traditional kaya toast, soft-boiled eggs and local coffee (kopi) in a simple, nostalgic setting.",
      area: "central",
      tag: "LEGACY KOPI",
      address: "101 Thomson Road #B1-38, United Square Shopping Mall, 307591",
      phone: "69092349",
      hours: "Monday-Friday: 7:30 am–7:30 pm, Saturday-Sunday: 7:30 am–8 pm",
      website: "http://www.yakun.com/",
    },
    {
      id: "yakun-woodleigh",
      name: "Ya Kun Kaya Toast",
      rating: 3.2,
      reviews: 42,
      location: "The Woodleigh Mall",
      tags: ["Local", "Cafe", "Breakfast"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyhVELxIsdY3IAe38iSc5RM-HYUiTP_CwqVbnmCmRDw6shLIf93DftJvM5-mQJbAD20ajBHY0EkbLqED-I91yH6KtjzPh2WS-pryNMISlHY0xB9CGasvADRTHUuHsClqP8L1xT2VaDD_egV2pYbo4aQ3A=s4800-w800",
      description:
        "Classic Singapore coffee shop known for their signature kaya toast, soft-boiled eggs and traditional kopi in a nostalgic setting.",
      area: "north-east",
      tag: "LEGACY KOPI",
      address: "11 Bidadari Park Dr, B1-07, Singapore 367803",
      phone: "+65 6610 6008",
      hours: "Monday to Sunday 8 am–9 pm",
      website: "http://www.yakun.com",
    },
    {
      id: "funtoast-suntec",
      name: "Fun Toast",
      rating: 2.8,
      reviews: 93,
      location: "Suntec City",
      tags: ["Local", "Cafe", "Asian"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxp9vN2WvNF1iRl1bf1tNx4xzvt-kMzalzsPt39kbEqN7z6X3jmLnc1HGlhM-avl8fDZ4GT-nOIINMbl08CTvB99lKhAt2iRmzItFyUeylYwDMPlgHa_933k2nEhyyJljI67tdD0Mdoyu0V=s4800-w800",
      description:
        "Casual local cafe offering traditional Singapore breakfast items like kaya toast and local coffee along with Asian comfort food.",
      area: "south",
      tag: "LOCAL CAFE",
      address: "3 Temasek Blvd, #01-432A, Singapore 038983",
      phone: "+65 6336 6800",
      hours: "Monday to Sunday 8 am–8 pm",
      website: "http://funtoast.com.sg",
    },
    {
      id: "funtoast-junction8",
      name: "Fun Toast @ Junction 8",
      rating: 2.6,
      reviews: 78,
      location: "Junction 8",
      tags: ["Local", "Cafe", "Asian"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDyHrronl8eHD6yOOot2PRDU2MWVXWP-aruXf3zcY3QWdIkg-fLHA0JWP5beQWFhoVm43DhTcaqdCQ2RmPGjtBYnLTS_C9Mctcj4wMUu0CkDpUKgOeE3qVeOSpa3KjTNImOkHyAX77flnbriVQ=s4800-w800",
      description:
        "Local cafe serving traditional kaya toast, coffee and tea, plus a variety of Asian comfort food in a casual, no-frills environment.",
      area: "north",
      tag: "LOCAL CAFE",
      address: "9 Bishan Pl, #03-09 Junction 8, Singapore 579837",
      phone: "Not available",
      hours: "Monday-Sunday: 8 am–9 pm",
      website: "https://www.funtoast.com.sg/",
    },
    {
      id: "funtoast-woodleigh",
      name: "Fun Toast",
      rating: 3.8,
      reviews: 68,
      location: "The Woodleigh Mall",
      tags: ["Local", "Cafe", "Asian"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqE4Cip3CpyWaW_EmMCGAHls9BOi_MS-E77awbvbJgp2HRRrM7mzsAzfIlcepRi2p9F2WGjJyBXR0yex-yGmwoLAgwhCZ892Wgg=s4800-w800",
      description:
        "Local cafe offering traditional Singaporean breakfast fare like kaya toast and kopi, plus various Asian snacks and light meals.",
      area: "north-east",
      tag: "LOCAL CAFE",
      address: "Mall, 11 Bidadari Park Dr, #02-19 The Woodleigh, 367803",
      phone: "+65 6702 4852",
      hours: "Monday to Sunday 8 am–8 pm",
      website: "https://www.funtoast.com.sg",
    },
    {
      id: "olivia-suntec",
      name: "Olivia & Co",
      rating: 3.9,
      reviews: 445,
      location: "Suntec City",
      tags: ["Cafe", "Western", "Brunch"],
      image:
        "https://lh3.googleusercontent.com/places/ANXAkqF3hwVQDJzGCnQGUS8sU5Gtx6EYGXZSpH6rRHeergMG2QX7x0pRDNQimufnsBdb-LItLBpyP3LbmFW3ixsI2gyFlGQv0abCCkg=s4800-w800",
      description:
        "Modern cafe offering international comfort food, specialty coffee, and all-day breakfast in a stylish, relaxed atmosphere.",
      area: "south",
      tag: "CASUAL CAFE",
      address: "3 Temasek Blvd, #01-481, Singapore 038983",
      phone: "+65 6337 2518",
      hours:
        "Monday to Thursday 8 am–8 pm, Friday 8 am–9 pm, Saturday 9 am–9 pm, Sunday 9 am–8 pm",
      website: "https://www.olivianco.com",
    },
    {
      id: "xinwang-novena",
      name: "Xin Wang Hong Kong Cafe @ Novena Square",
      rating: 4.4,
      reviews: 1415,
      location: "Novena Square",
      tags: ["Chinese", "Hong Kong", "Cafe"],
      image:
        "https://lh3.googleusercontent.com/place-photos/AEkURDxP8Db9zqMmNC6Fb9qRH4C7_AMHyhM0zbnyPJt9deQinwGiwuIuJMlIpLDJWMS0I4VoHtiAA2zf17r_K6pc97m-HcTliPNsLxX_WQrO32pVrQwEhuBxuBjR-PkkuiIO9YfqWd8jP9-QloRSraWylx3KRA=s4800-w800",
      description:
        "Hong Kong-style cafe offering a wide range of dishes combining Asian and Western flavors, including classic HK milk tea and pork chop rice.",
      area: "central",
      tag: "HONG KONG CAFE",
      address: "238 Thomson Rd, #01-09 Novena Square, Singapore 307683",
      phone: "+65 6250 0608",
      hours: "Monday to Sunday 7 am–10 pm",
      website: "https://www.xinwang.com.sg",
    }
  ],
  deals: [
    {
      id: "deal1",
      badge: "20% OFF",
      title: "20% OFF All Handcrafted Beverages at Starbucks (Novena)",
      duration: "Valid till: 31 May 2025",
      description:
        "Enjoy 20% off all handcrafted beverages at Starbucks Novena. Valid for in-store purchase only, Monday to Thursday, 2pm-5pm.",
      code: "SBUX20",
    },
    {
      id: "deal2",
      badge: "1-FOR-1",
      title: "1-for-1 Signature Coffee at The Coffee Bean & Tea Leaf",
      duration: "Valid till: 15 Jun 2025",
      description:
        "Buy one signature coffee and get one free at The Coffee Bean & Tea Leaf. Second beverage must be of equal or lesser value. T&Cs apply.",
      code: "CBTL121",
    },
    {
      id: "deal3",
      badge: "FREE",
      title: "Free Pastry with Any Medium or Large Coffee at Toast Box",
      duration: "Valid till: 20 May 2025",
      description:
        "Enjoy a complimentary pastry with any medium or large coffee ordered at all Toast Box outlets. Limited to selected pastries.",
      code: "TBPASTRY",
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
      name: "Korean",
      image:
        "https://images.unsplash.com/photo-1590301157890-4810ed352733?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      url: "/cuisine/korean",
    }
  ],
};
