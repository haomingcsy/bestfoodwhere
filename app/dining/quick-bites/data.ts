import type { Restaurant, DiningDeal, DiningCategory } from "@/types/dining";

export const QUICK_BITES_RESTAURANTS: Restaurant[] = [
  {
    id: "four-leaves-suntec",
    name: "Four Leaves",
    rating: 3.4,
    reviews: 28,
    location: "Suntec City",
    tags: ["Bakery", "Cafe", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNyJBJl1BpRMtcS6bZrFC-WCAMBVOpFtJKKsCTB=w800-h600-k-no",
    description:
      "Popular bakery chain offering a variety of freshly baked bread, pastries, and cakes with Asian-inspired flavors.",
    area: "central",
    tag: "BAKERY",
    address: "3 Temasek Blvd, #B1-K3, Singapore 038983",
    phone: "+65 6219 3580",
    hours: "Monday to Sunday 8 am–9:30 pm",
    website: "https://www.fourleaves.com.sg",
  },
  {
    id: "aj-teh-tarik",
    name: "AJ's Teh Tarik",
    rating: 4.7,
    reviews: 64,
    location: "Suntec City",
    tags: ["Local", "Drinks", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMvD3AtugMacXplQDvxooKgkXcTNiz_iufRudEN=w800-h600-k-no",
    description:
      "Authentic Teh Tarik (pulled tea) and local beverages in a convenient grab-and-go format. Popular among locals and tourists.",
    area: "central",
    tag: "LOCAL DRINKS",
    address: "3 Temasek Blvd, B1-141, Singapore 038983",
    phone: "+65 9023 2291",
    hours: "Monday to Friday 9:30 am–4:30 pm",
    website: "-",
  },
  {
    id: "old-chang-kee-novena",
    name: "Old Chang Kee",
    rating: 3.6,
    reviews: 116,
    location: "Novena",
    tags: ["Local", "Snacks", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPJhLb4cHV055Jkaemj6X8npi2AFeBROC1pq58U=w800-h600-k-no",
    description:
      "Beloved local chain famous for their signature curry puffs and various fried snacks. Perfect for a quick and satisfying bite.",
    area: "central",
    tag: "SNACKS",
    address:
      "238 Thomson Rd, #01-70/71 Velocity@Novena Square, Singapore 307683",
    phone: "+65 6354 1208",
    hours:
      "Monday 6 am–10 pm, Tuesday 7 am–10 pm, Wednesday to Saturday 6 am–10 pm, Sunday 10 am–10 pm",
    website: "https://www.oldchangkee.com",
  },
  {
    id: "liho-suntec",
    name: "LiHO TEA @ Suntec City B1",
    rating: 3.8,
    reviews: 148,
    location: "Suntec City",
    tags: ["Bubble Tea", "Drinks", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOqFddrVyHW6gKO9ySa9yUuYEkTH9GTzilLzRdR=w800-h600-k-no",
    description:
      "Singapore-based bubble tea chain offering a wide range of tea-based drinks including their signature cheese teas.",
    area: "central",
    tag: "BUBBLE TEA",
    address: "3 Temasek Blvd, #B1-175 Singapore (Tower 4), Singapore 038983",
    phone: "+65 6027 5842",
    hours:
      "Monday to Thursday 11 am–10 pm, Friday to Saturday 11 am–10:30 pm, Sunday 11 am–10 pm",
    website: "https://www.lihotea.com",
  },
  {
    id: "mr-coconut",
    name: "Mr. Coconut",
    rating: 4.0,
    reviews: 43,
    location: "Suntec City",
    tags: ["Coconut", "Drinks", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPIzlTcMxrUYdDayo4x_45uq-XUDd9Vn2OaPoQZ=w800-h600-k-no",
    description:
      "Specializing in fresh coconut shakes and desserts, Mr. Coconut offers refreshing tropical beverages using 100% natural coconut water.",
    area: "central",
    tag: "DRINKS",
    address: "3 Temasek Blvd, #01-K3, Singapore 038983",
    phone: "+65 6015 0341",
    hours: "Monday to Sunday 11 am–9:45 pm",
    website: "https://mrcoconut.com.sg",
  },
  {
    id: "playmade",
    name: "Playground by PlayMade",
    rating: 4.8,
    reviews: 59,
    location: "Suntec City",
    tags: ["Bubble Tea", "Drinks", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPPCPM4FkQfEJ2eQpz8WxIqBhDKrQ6iTkOOPidp=w800-h600-k-no",
    description:
      "Premium bubble tea shop offering handmade pearls in unique flavors like burnt caramel and pink cactus.",
    area: "central",
    tag: "PREMIUM",
    address: "3 Temasek Blvd, #B1-152, Singapore 038983",
    phone: "+65 9139 3419",
    hours:
      "Monday to Thursday 11 am–10 pm, Friday to Saturday 11 am–10:30 pm, Sunday 11 am–10 pm",
    website: "https://playmade.sg",
  },
  {
    id: "yakun-suntec",
    name: "Ya Kun Kaya Toast",
    rating: 3.9,
    reviews: 312,
    location: "Suntec City",
    tags: ["Local", "Toast", "Coffee", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPyZGnmixF6JyVeYUjbq2EH1Guvro76bsFQN5qI=w800-h600-k-no",
    description:
      "Iconic Singaporean breakfast spot famous for kaya toast, soft-boiled eggs, and traditional coffee. A quick local breakfast experience.",
    area: "central",
    tag: "LOCAL",
    address: "3 Temasek Blvd, #B1-104, Singapore 038983",
    phone: "+65 6337 6829",
    hours:
      "Monday to Thursday 7:30 am–7 pm, Friday to Saturday 7:30 am–9 pm, Sunday 8 am–7 pm",
    website: "https://yakun.com",
  },
  {
    id: "mister-wheel",
    name: "Mister Wheel Singapore",
    rating: 4.0,
    reviews: 63,
    location: "Suntec City",
    tags: ["Dessert", "Snacks", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMp6FXido8KGZ3Sx8_hNw6-OSjcEpJa8VTXXOnO=w800-h600-k-no",
    description:
      "Taiwanese-style wheel cakes with various fillings like red bean, custard, and matcha. Perfect for a sweet treat on the go.",
    area: "central",
    tag: "TAIWANESE",
    address: "3 Temasek Blvd, Mall, #01-K13/K14 Suntec City, 038983",
    phone: "+65 8468 8845",
    hours:
      "Monday to Thursday 10:30 am–8:30 pm, Friday to Saturday 10:30 am–9 pm, Sunday 10:30 am–8:30 pm",
    website: "-",
  },
  {
    id: "toastbox-suntec",
    name: "Toast Box (Suntec City)",
    rating: 3.9,
    reviews: 343,
    location: "Suntec City",
    tags: ["Local", "Toast", "Coffee", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMsocN8JGsXtoa6SIUrrk5dLFxdHDSFeRFk41w=w800-h600-k-no",
    description:
      "Traditional Singaporean breakfast chain offering kaya toast, local coffee, and a range of Asian dishes in a nostalgic setting.",
    area: "central",
    tag: "LOCAL",
    address: "5 Temasek Blvd, #B1-167 / 168, Singapore 038983",
    phone: "+65 6238 0130",
    hours: "Monday to Sunday 7:30 am–9 pm",
    website: "https://www.toastbox.com.sg",
  },
  {
    id: "soupcup-suntec",
    name: "SoupCup Suntec City",
    rating: 4.3,
    reviews: 64,
    location: "Suntec City",
    tags: ["Soup", "Healthy", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOo2FO5x8K63zmsuW3QyRCwd_5QMSyp8Y3Hf_LE=w800-h600-k-no",
    description:
      "Freshly made soup cups in various flavors. A healthy and convenient meal option for those on the go.",
    area: "central",
    tag: "HEALTHY",
    address: "3 Temasek Blvd, B1-K10 Suntec City CC, Singapore 038983",
    phone: "+65 6980 3303",
    hours: "Monday to Friday 11 am–8 pm, Saturday to Sunday 11 am–9 pm",
    website: "-",
  },
  {
    id: "4fingers-vivo",
    name: "4Fingers Crispy Chicken",
    rating: 4.8,
    reviews: 365,
    location: "VivoCity",
    tags: ["Fast Food", "Korean", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOd4gdP3EdrYguIPFtzwBZ9SRgerfF8g07zPhOu=w800-h600-k-no",
    description:
      "Korean-inspired crispy chicken with unique sauces and sides. Known for their crispy yet juicy chicken.",
    area: "south",
    tag: "KOREAN",
    address: "1 HarbourFront Walk, #02-120, Singapore 098585",
    phone: "Not available",
    hours: "Monday-Sunday: 11 am–10 pm",
    website: "https://www.4fingers.com.sg/",
  },
  {
    id: "burgerking-vivo",
    name: "Burger King VIVO City",
    rating: 3.9,
    reviews: 1250,
    location: "VivoCity",
    tags: ["Fast Food", "Burger", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipM4ZngY_U3N30iG5Hu5WNEhKLFbIlb2jkKUFvwL=w800-h600-k-no",
    description:
      "Global fast-food chain offering flame-grilled burgers, fries, and other quick meal options in a casual setting.",
    area: "south",
    tag: "BURGER",
    address: "1 HarbourFront Walk, #02 - 80, Singapore 098585",
    phone: "Not available",
    hours: "Monday-Friday: 10 am–10 pm, Saturday-Sunday: 8:30 am–10 pm",
    website: "https://www.burgerking.com.sg/",
  },
  {
    id: "kfc-vivo",
    name: "KFC",
    rating: 3.0,
    reviews: 269,
    location: "VivoCity",
    tags: ["Fast Food", "Fried Chicken", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipM9pwc8XNwIwmTKK--3oVMYGQ8UA4lutEQChJ30=w800-h600-k-no",
    description:
      "Kentucky Fried Chicken - fast food chain specializing in fried chicken with various sides and meal options.",
    area: "south",
    tag: "FRIED CHICKEN",
    address: "1 HarbourFront Walk, B2-32 VivoCity, Singapore 098585",
    phone: "63603385",
    hours: "Monday-Thursday, Sunday: 7 am–10 pm, Friday-Saturday: 7 am–11 pm",
    website: "https://www.kfc.com.sg/",
  },
  {
    id: "old-chang-kee-united",
    name: "Old Chang Kee",
    rating: 2.3,
    reviews: 20,
    location: "United Square",
    tags: ["Local", "Snacks", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMCKPnxweEH0-NUCm9t8PszBuDC44V1EVm61hoS=w800-h600-k-no",
    description:
      "Beloved local chain famous for their signature curry puffs and various fried snacks. Perfect for a quick and satisfying bite.",
    area: "north",
    tag: "SNACKS",
    address:
      "101 Thomson Road, #01-K2, United Square Shopping Mall, Singapore 307591",
    phone: "63032400",
    hours: "Monday-Sunday: 10 am–10 pm",
    website: "https://www.oldchangkee.com/",
  },
  {
    id: "soup-spoon-woodleigh",
    name: "The Soup Spoon Union",
    rating: 3.1,
    reviews: 34,
    location: "The Woodleigh Mall",
    tags: ["Soup", "Western", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipP8KbuoRK-zBz_xWnogJPbjfLsYTTdvFNaj4nL7=w800-h600-k-no",
    description:
      "Serving a variety of wholesome soups and healthy food options. Great for a quick and nutritious meal.",
    area: "north-east",
    tag: "HEALTHY",
    address: "11 Bidadari Park Dr, #01-39 HiArt Woodleigh, Singapore 367803",
    phone: "+65 6255 7269",
    hours: "Monday to Sunday 10 am–10 pm",
    website: "https://www.thesoupspoon.com",
  },
  {
    id: "wokhey-woodleigh",
    name: "WOK HEY The Woodleigh Mall",
    rating: 2.6,
    reviews: 31,
    location: "The Woodleigh Mall",
    tags: ["Chinese", "Wok", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNdOfL-GPZaoxg8wCx05ScQgI4-xfMwbAV0OI5v=w800-h600-k-no",
    description:
      "Fast-casual wok-fried noodles and rice with customizable ingredients, prepared fresh on the spot.",
    area: "north-east",
    tag: "CHINESE",
    address: "11 Bidadari Park Dr, B1-K4, Singapore 367803",
    phone: "+65 8440 8184",
    hours: "Monday to Sunday 10:30 am–9:45 pm",
    website: "http://wokhey.sg",
  },
  {
    id: "old-chang-kee-woodleigh",
    name: "Old Chang Kee",
    rating: 1.4,
    reviews: 17,
    location: "The Woodleigh Mall",
    tags: ["Local", "Snacks", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNQxXs5MospahnY-tOZ3NZJgJbP_nQVwJg6xyNm=w800-h600-k-no",
    description:
      "Beloved local chain famous for their signature curry puffs and various fried snacks. Perfect for a quick and satisfying bite.",
    area: "north-east",
    tag: "SNACKS",
    address:
      "Mall, 11 Bidadari Park Drive, B1-K1/K2 The Woodleigh, Singapore 367803",
    phone: "+65 6988 5814",
    hours: "Monday to Sunday 10 am–10 pm",
    website: "https://www.oldchangkee.com",
  },
  {
    id: "nam-kee-pau",
    name: "Nam Kee Pau",
    rating: 2.2,
    reviews: 24,
    location: "The Woodleigh Mall",
    tags: ["Chinese", "Buns", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNr7VVOziEM9S5fgTv5wNZZW3q-srSr187pFigo=w800-h600-k-no",
    description:
      "Traditional Chinese buns (pau) with various fillings like char siu, chicken, and red bean. A convenient on-the-go snack.",
    area: "north-east",
    tag: "CHINESE",
    address: "11 Bidadari Park Dr, B1-K33, Singapore 367803",
    phone: "+65 6908 0621",
    hours: "Monday to Sunday 8:30 am–9 pm",
    website: "https://www.namkeepau.com.sg",
  },
  {
    id: "mcdonalds-plaza",
    name: "McDonald's Plaza Singapura",
    rating: 4.2,
    reviews: 1714,
    location: "Plaza Singapura",
    tags: ["Fast Food", "Burger", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOUiJhG_02d3UeWghvJFsag3fjTIO3L3MtptDUb=w800-h600-k-no",
    description:
      "Global fast-food chain offering a range of burgers, fries, breakfast items and beverages in a casual, family-friendly environment.",
    area: "central",
    tag: "BURGER",
    address:
      "68 Orchard Road, #B1-23/24, Plaza Singapura, 68 Orchard Rd, #B1-23 24 Plaza, Singapore 238839",
    phone: "67773777",
    hours: "Monday-Sunday: 7 am–11 pm",
    website: "https://www.mcdonalds.com.sg/",
  },
  {
    id: "aw-woodleigh",
    name: "A&W The Woodleigh Mall",
    rating: 3.4,
    reviews: 95,
    location: "The Woodleigh Mall",
    tags: ["Fast Food", "American", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipO9j1pJHLnv7V21EnrgOqGMrkJIT7TKxgnAuIPi=w800-h600-k-no",
    description:
      "Classic American fast food chain offering burgers, hot dogs, and their signature root beer floats.",
    area: "north-east",
    tag: "AMERICAN",
    address: "11 Bidadari Park Dr, #01-40, Singapore 367803",
    phone: "+65 6255 8011",
    hours: "Monday to Sunday 10 am–10 pm",
    website: "https://www.awrestaurants.com.sg",
  },
  {
    id: "subway-woodleigh",
    name: "Subway",
    rating: 3.7,
    reviews: 26,
    location: "The Woodleigh Mall",
    tags: ["Sandwich", "Healthy", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMbTTUe_2VEYj4pN3-MrICdvyWQu4GyRh6UF7DG=w800-h600-k-no",
    description:
      "Global sandwich chain offering made-to-order sandwiches, wraps and salads with customizable ingredients.",
    area: "north-east",
    tag: "SANDWICH",
    address: "11 Bidadari Park Dr, B1-05, Singapore 367803",
    phone: "+65 6909 4361",
    hours: "Monday to Sunday 8 am–10 pm",
    website: "https://www.subway.com/en-SG",
  },
  {
    id: "stuffd-woodleigh",
    name: "Stuff'd",
    rating: 4.1,
    reviews: 196,
    location: "The Woodleigh Mall",
    tags: ["Mexican", "Health", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOcwr4nO0Kcbe_Q6PWiemP6OJgWkFwtEedi1Qg2=w800-h600-k-no",
    description:
      "Fast-casual restaurant specializing in Mexican-Turkish fusion including burritos, kebabs and salad bowls with fresh ingredients.",
    area: "north-east",
    tag: "MEXICAN",
    address: "11 Bidadari Park Dr, B1-K25, Singapore 367803",
    phone: "+65 9150 5729",
    hours: "Monday to Sunday 10:30 am–9:30 pm",
    website: "https://www.stuffd.com/sg",
  },
  {
    id: "food-republic-suntec",
    name: "Food Republic",
    rating: 3.9,
    reviews: 1620,
    location: "Suntec City",
    tags: ["Food Court", "Asian", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOm-8jQojzVGkrnROW6faIdZUsHmVAHJ3sWAJMW=w800-h600-k-no",
    description:
      "Modern food court offering a wide variety of local and Asian cuisines in a comfortable dining environment.",
    area: "central",
    tag: "FOOD COURT",
    address: "3 Temasek Blvd, #B1-115, Singapore 038983",
    phone: "+65 6338 2848",
    hours: "Monday to Sunday 10 am–9 pm",
    website: "https://www.foodrepublic.com.sg",
  },
  {
    id: "yakun-aperia",
    name: "Ya Kun Kaya Toast",
    rating: 4.2,
    reviews: 217,
    location: "Aperia Mall",
    tags: ["Local", "Cafe", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPuRRtI_SGsbyIWc5znT0sfIhQ7fKIjWh1yPOoZ=w800-h600-k-no",
    description:
      "Iconic Singaporean breakfast spot famous for kaya toast, soft-boiled eggs, and traditional coffee.",
    area: "central",
    tag: "LOCAL",
    address: "12 Kallang Ave, #01-33, Singapore 339511",
    phone: "69681245",
    hours: "Monday-Friday: 7:30 am–6 pm, Saturday-Sunday: 7:30 am–5 pm",
    website: "http://www.yakun.com/",
  },
  {
    id: "coffeebean-hougang",
    name: "The Coffee Bean & Tea Leaf",
    rating: 4.0,
    reviews: 168,
    location: "Hougang Mall",
    tags: ["Cafe", "Coffee", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNHlJhPkJjXGEcSHhh2RxZLu14NEnpuevrkQDQ3=w800-h600-k-no",
    description:
      "Popular American coffee chain serving specialty coffee, tea, and light snacks in a comfortable cafe setting.",
    area: "north-east",
    tag: "CAFE",
    address: "90 Hougang Ave 10 #01-01/02 & #01-04/05, 538766",
    phone: "62433557",
    hours: "Monday-Sunday: 24 hours",
    website: "https://www.coffeebean.com.sg/",
  },
  {
    id: "paris-baguette-nex",
    name: "Paris Baguette @Serangoon Central",
    rating: 4.2,
    reviews: 375,
    location: "Nex",
    tags: ["Dessert", "Bakery", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOxzfWhrZQ10Orgv47bUDo5b0L3Vc_mA2TyjMXk=w800-h600-k-no",
    description:
      "South Korean bakery chain offering freshly baked bread, pastries, cakes and sandwiches in a modern cafe setting.",
    area: "north-east",
    tag: "BAKERY",
    address: "23 Serangoon Central, #01-67 NEX, Singapore 556083",
    phone: "65090445",
    hours: "Monday to Sunday: 8 am–10 pm",
    website: "https://bit.ly/2SYZFTD",
  },
  {
    id: "subway-bedok",
    name: "Subway",
    rating: 4.0,
    reviews: 286,
    location: "Bedok Mall",
    tags: ["Fast Food", "Sandwich", "Quick Bites"],
    image:
      "https://lh3.googleusercontent.com/gps-cs-s/AB5caB_7l_U_iYFLZS7qe6QWq_XABa-raCLFduLlzS57Tx7ge5BQS4KkWXw8gp6edvQvh20AuUnmSJ7g-WD7vISIMEjBWUnPEtgMEIqzshRojQpAIEi7N_7O6G2fyiZhFB5C4zDTqorbJg=w800-h600-k-no",
    description:
      "Global sandwich chain offering made-to-order sandwiches, wraps and salads with customizable ingredients.",
    area: "east",
    tag: "SANDWICH",
    address: "311 New Upper Changi Rd, #01-96 Bedok Mall, Singapore 467360",
    phone: "68449620",
    hours: "Monday to Sunday: 9 am–10 pm",
    website: "https://www.subway.com/en-SG",
  },
  {
    id: "four-leaves-imm",
    name: "Four Leaves",
    rating: 2.5,
    reviews: 22,
    location: "IMM",
    tags: ["Bakery", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOvPR5v2aN2VegYC_76zHp3jd3sysIil_1N5aw=w800-h600-k-no",
    description:
      "Popular bakery chain offering a variety of freshly baked bread, pastries, and cakes with Asian-inspired flavors.",
    area: "west",
    tag: "BAKERY",
    address:
      "2 Jurong East Street 21, #01-44/45 IMM Building, Singapore 609601",
    phone: "67933733",
    hours: "Monday-Saturday: 10 am–10 pm, Sunday: 10 am–9:30 pm",
    website: "https://fourleaves.com.sg/",
  },
  {
    id: "shihlin-imm",
    name: "Shihlin Taiwan Street Snacks",
    rating: 4.5,
    reviews: 216,
    location: "IMM",
    tags: ["Taiwanese", "Snacks", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOJPlHzyd7RwqOw_sAGCO-MRKWFfMY7_xA4GQ0W=w800-h600-k-no",
    description:
      "Taiwanese street food stall offering popular snacks such as XXL crispy chicken, crispy floss egg crepe, and handmade oyster mee sua.",
    area: "west",
    tag: "TAIWANESE",
    address: "2 Jurong East Street 21, #01-K03 IMM Building, Singapore 609601",
    phone: "61001218",
    hours: "Monday-Sunday: 11 am–9:30 pm",
    website: "http://www.shihlinsnacks.com.tw/sg/",
  },
  {
    id: "awfully-chocolate-jem",
    name: "Awfully Chocolate Jem",
    rating: 3.3,
    reviews: 99,
    location: "JEM",
    tags: ["Dessert", "Chocolate", "Quick Bites"],
    image:
      "https://lh3.googleusercontent.com/gps-cs-s/AB5caB-g-z_hfhGsAjbPlJ7PqzREzqN858emMl5y14BSV5uuW9DvprAaaKDKLenefjDAY2Pb-4gIUDxp3BdJNVwP0rfhdJSEo8B6zFZhHZX4w5sIjwEkv1DQ4OYYE5GJeuK2yvdNlxl2=w800-h600-k-no",
    description:
      "Singapore chocolate cake specialist offering handcrafted chocolate cakes, ice cream and chocolate drinks.",
    area: "west",
    tag: "DESSERT",
    address: "Jem, #01-15, 50 Jurong Gateway Rd, 608549",
    phone: "67341530",
    hours: "Monday-Sunday: 10 am–9 pm",
    website: "https://www.awfullychocolate.com/",
  },
  {
    id: "goang-nex",
    name: "Go-Ang Pratunam Chicken Rice @ NEX",
    rating: 4.6,
    reviews: 3559,
    location: "Nex",
    tags: ["Thai", "Chicken Rice", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPH3dT1PH5YTp-b-bCIYndxCc8mRrpEQZfQKMvK=w800-h600-k-no",
    description:
      "Award-winning Thai chicken rice restaurant from Bangkok, serving authentic Hainanese chicken rice with Thai flavors.",
    area: "north-east",
    tag: "THAI",
    address: "23 Serangoon Central, #B1-05/06, Singapore 556083",
    phone: "65099980",
    hours: "Monday to Sunday: 11 am–10 pm",
    website: "https://bit.ly/GASelfCollect",
  },
  {
    id: "koi-bedok",
    name: "Koi Thé @ Bedok Mall",
    rating: 3.6,
    reviews: 223,
    location: "Bedok Mall",
    tags: ["Bubble Tea", "Drinks", "Quick Bites"],
    image:
      "https://lh3.googleusercontent.com/gps-proxy/ALd4DhE7dIstPM1rKT3HRe7X9hEquBRcncDIQ31e1i-0imwk-TRJ2g5zlbmUe_HiHQElFBnm3j9NUTlAtrIOHioRRpxcoJmPX9w1Pqwu4u8rQs3ckFs-NSD8AIJcUzubf0jwavH9zXLQXENqdUUgMhb2yNX19Jnchewv3Oj9yEpAdcv-u-Y-koLEddLU=w800-h600-k-no",
    description:
      "Popular Taiwanese bubble tea chain known for their aromatic teas and creative bubble tea combinations.",
    area: "east",
    tag: "BUBBLE TEA",
    address: "311 New Upper Changi Rd, #01-97, Singapore 467360",
    phone: "62461780",
    hours: "Monday to Sunday: 10 am–10 pm",
    website: "https://www.koithe.com/en",
  },
  {
    id: "liho-causeway",
    name: "LiHO TEA @ Causeway Point",
    rating: 3.9,
    reviews: 105,
    location: "Causeway Point",
    tags: ["Bubble Tea", "Drinks", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMcQvG6ayMxWYJFRPfqaH2QvGB81kxABfFDi48L=w800-h600-k-no",
    description:
      "Singapore-based bubble tea chain offering a wide range of tea-based drinks including their signature cheese teas.",
    area: "north",
    tag: "BUBBLE TEA",
    address: "1 Woodlands Square, B1-K30 Causeway Point, Singapore 738099",
    phone: "+65 6027 5801",
    hours: "Monday to Sunday 11 am–10:30 pm",
    website: "https://foodpanda.sg/restaurant/p08l/liho-tea-woodlands-square",
  },
  {
    id: "gongcha-causeway",
    name: "Gong Cha",
    rating: 3.4,
    reviews: 45,
    location: "Causeway Point",
    tags: ["Bubble Tea", "Drinks", "Quick Bites"],
    image:
      "https://lh3.googleusercontent.com/gps-proxy/ALd4DhEM__Y6p7VKiPqiN4kRF24tnxP_zdOogDCtH5xd71z8eEJttSSbHlW5kLnBZ_9I6e_LOp80bpHl3pVmnAptWXPmu3QPnwNjJUVf0zlcazekScneQ0xraoLdnmvTnII9MpOkpNCfRSw0F6x2v8Hlr4F7YEZd5peCbLGJXbWHUklZxI_zcg5RivA=w800-h600-k-no",
    description:
      "Popular Taiwanese bubble tea chain known for their quality teas and customizable sugar and ice levels.",
    area: "north",
    tag: "BUBBLE TEA",
    address: "1 Woodlands Square, #02-K10 Causeway Point, Singapore 738099",
    phone: "+65 6200 2288",
    hours: "Monday to Sunday 10 am–10 pm",
    website: "https://www.gong-cha-sg.com/",
  },
  {
    id: "old-chang-kee-causeway",
    name: "Old Chang Kee",
    rating: 3.6,
    reviews: 70,
    location: "Causeway Point",
    tags: ["Local", "Quick Bites", "Snacks"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipP700wEG42V7w9lfY-REsMvllxfKyZ3pRmOORjN=w800-h600-k-no",
    description:
      "Beloved local chain famous for their signature curry puffs and various fried snacks. Perfect for a quick and satisfying bite.",
    area: "north",
    tag: "SNACKS",
    address: "1 Woodlands Square, #01-K11 Causeway Point, Singapore 738099",
    phone: "+65 6979 6816",
    hours: "Monday to Saturday 6 am–10 pm, Sunday 10 am–10 pm",
    website:
      "https://deliveroo.com.sg/menu/singapore/woodlands-square/old-chang-kee-cwp",
  },
  {
    id: "mrbean-jem",
    name: "Mr Bean",
    rating: 3.8,
    reviews: 64,
    location: "JEM",
    tags: ["Local", "Soy", "Quick Bites"],
    image:
      "https://lh3.googleusercontent.com/gps-cs-s/AB5caB_3V-7lMl4G88BGJqOLQQdgIqVVNuHFkLn-Ymj4ChbR5PQp-74O1_yjPlEr4bgAvm9p-RI8huwKFUmGCfQboNExz0Woeb6Gm0o7CpCT0n-TTcIaNdVDBp9DJGbHzKzmDR3idm1gWA=w800-h600-k-no",
    description:
      "Singapore-based food and beverage chain specializing in soy-based products, including soy milk and beancurd.",
    area: "west",
    tag: "LOCAL",
    address: "JEM, Singapore",
    phone: "Not available",
    hours: "Not available",
    website: "https://www.mrbean.com.sg/",
  },
  {
    id: "dunkin-causeway",
    name: "Dunkin' Donuts",
    rating: 4.0,
    reviews: 48,
    location: "Causeway Point",
    tags: ["Dessert", "Cafe", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipP3vNMxP7hnPSm8oyvcER7Ob0w80_OSRWc425Th=w800-h600-k-no",
    description:
      "Global donut and coffee chain offering a variety of donuts, bagels, coffee and other beverages.",
    area: "north",
    tag: "DESSERT",
    address: "1 Woodlands Square, #B1 - K2, Singapore 738099",
    phone: "+65 6760 0248",
    hours: "Monday to Sunday 9 am–10 pm",
    website: "http://dunkindonuts.oddle.me/",
  },
  {
    id: "eachacup-causeway",
    name: "Each A Cup",
    rating: 3.9,
    reviews: 68,
    location: "Causeway Point",
    tags: ["Bubble Tea", "Drinks", "Quick Bites"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPV7hI3jSKUr1Kb7RFl9vlJQl8da_zwIkzMgbUl=w800-h600-k-no",
    description:
      "Bubble tea chain offering a variety of fruit teas, milk teas, and other beverages with customizable toppings.",
    area: "north",
    tag: "BUBBLE TEA",
    address: "1 Woodlands Square, #B1-K19 Causeway Point, Singapore 738099",
    phone: "+65 9857 2324",
    hours: "Monday to Sunday 10 am–10 pm",
    website: "http://www.each-a-cup.com/",
  },
];

export const QUICK_BITES_DEALS: DiningDeal[] = [
  {
    id: "deal1",
    badge: "BUY 1 GET 1",
    title: "Buy 1 Get 1 Free at Ya Kun Kaya Toast",
    duration: "Valid till: 15 May 2025",
    description:
      "Buy one set and get another set free. Valid Monday to Friday before 11am. Not valid on public holidays.",
    code: "YAKUN2025",
  },
  {
    id: "deal2",
    badge: "20% OFF",
    title: "20% Off All Orders at Toast Box",
    duration: "Valid till: 30 Jun 2025",
    description:
      "Enjoy 20% off your total bill when you pay with selected credit cards. Valid for dine-in and takeaway.",
    code: "TOAST20",
  },
  {
    id: "deal3",
    badge: "COMBO DEAL",
    title: "$6.90 Combo Deal at Old Chang Kee",
    duration: "Valid till: 31 Oct 2025",
    description:
      "Get 2 signature curry puffs and a drink for only $6.90. Available at all outlets nationwide.",
    code: "OCK690",
  },
];

export const OTHER_DINING_CATEGORIES: DiningCategory[] = [
  {
    name: "Casual Dining",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/casual",
  },
  {
    name: "Fine Dining",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/fine-dining",
  },
  {
    name: "Family Friendly",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/family-friendly",
  },
  {
    name: "Late Night Dining",
    image:
      "https://images.unsplash.com/photo-1505275350441-83dcda8eeef5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/late-night",
  },
  {
    name: "Romantic",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/romantic",
  },
];

export const QUICK_BITES_STATS = {
  locations: "60+",
  menuItems: "1,800+",
  shoppingMalls: "12",
  averageRating: "4.0",
};
