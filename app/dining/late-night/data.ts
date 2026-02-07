import type { Restaurant, DiningDeal, DiningCategory } from "@/types/dining";

export const LATE_NIGHT_RESTAURANTS: Restaurant[] = [
  {
    id: "ameising-live-house",
    name: "Ameising Live House",
    rating: 4.5,
    reviews: 140,
    location: "Suntec City",
    tags: ["Western", "Live Music", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOX8r0yGkDGl82l8szAKZ1zRm2eBDTyOav1Ksc6=w800-h600-k-no",
    description:
      "Live music venue with a full bar and Western food menu. Open late with regular performances by local and international artists.",
    area: "central",
    tag: "LIVE MUSIC",
    address: "3 Temasek Blvd, #01-512, Singapore 038983",
    phone: "+65 8102 5221",
    hours:
      "Monday to Thursday 4 pm–2 am, Friday 4 pm–3 am, Saturday 6 pm–3 am, Sunday 6 pm–1 am",
    website: "https://www.ameisingbar.com",
  },
  {
    id: "beauty-in-the-pot-nex",
    name: "Beauty in The Pot at NEX",
    rating: 4.5,
    reviews: 1221,
    location: "NEX",
    tags: ["Chinese", "Hot Pot", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipN88EAmYoCanqcpXuQ4pscdGARqOtg29Av2PLsw=w800-h600-k-no",
    description:
      "Premium hotpot restaurant known for their beauty collagen soup. Open until 3am, making it perfect for late-night dining.",
    area: "north-east",
    tag: "HOT POT",
    address: "23 Serangoon Central, #02-01, Singapore 556083",
    phone: "68058172",
    hours: "Monday to Sunday: 11:30 am–3 am",
    website: "https://www.paradisegp.com/brand-beauty-in-the-pot/",
  },
  {
    id: "mcdonalds-bedok-mall",
    name: "McDonald's Bedok Mall",
    rating: 4.1,
    reviews: 2536,
    location: "Bedok Mall",
    tags: ["Fast Food", "American", "Late Night Dining"],
    image:
      "https://lh3.googleusercontent.com/gps-cs-s/AB5caB_hjxBGMvbtNtJcbIFCm5n0ljMBn5XZocPRM1T7bN929NjbXLEI0r8hyRM-tNB9hkFkKx7GnwM7jWca9x9mb1n4O_sXI60boe7r0pvGmdvX8-Wlb8uTdP0RvfVv0_FxxUxtCxYL2A=w800-h600-k-no",
    description:
      "Popular fast-food chain open until 1am, offering burgers, fries, and breakfast options for late-night cravings.",
    area: "east",
    tag: "FAST FOOD",
    address: "311 New Upper Changi Road, Mall, Unit #01 - 10 11 Bedok, 467360",
    phone: "Not available",
    hours: "Monday to Sunday: 6 am–1 am",
    website: "https://www.mcdonalds.com.sg/",
  },
  {
    id: "coffee-bean-hougang",
    name: "The Coffee Bean and Tea Leaf - Hougang Mall",
    rating: 4.0,
    reviews: 168,
    location: "Hougang Mall",
    tags: ["Cafe", "Coffee", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNHlJhPkJjXGEcSHhh2RxZLu14NEnpuevrkQDQ3=w800-h600-k-no",
    description:
      "International coffee chain open 24 hours, perfect for night owls looking for a caffeine fix or a quiet place to work through the night.",
    area: "north-east",
    tag: "CAFE",
    address: "90 Hougang Ave 10 #01-01/02 & #01-04/05, 538766",
    phone: "62433557",
    hours: "Open 24 hours",
    website: "https://www.coffeebean.com.sg/",
  },
  {
    id: "haidilao-imm",
    name: "Haidilao Hot Pot @IMM",
    rating: 4.5,
    reviews: 2609,
    location: "IMM",
    tags: ["Chinese", "Hot Pot", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMBn70EyE-myXbRDKZaBh7bv1YoFGeqPRA_2U5e=w800-h600-k-no",
    description:
      "Popular Chinese hot pot chain open until late, known for exceptional service and quality ingredients. Perfect for midnight cravings.",
    area: "west",
    tag: "HOT POT",
    address: "2 Jurong East Street 21, #03-01 IMM Building, Singapore 609601",
    phone: "68964111",
    hours: "Monday-Sunday: 12–6 am, 10:30 am–12 am",
    website: "-",
  },
  {
    id: "mcdonalds-tampines",
    name: "McDonald's Tampines Mall",
    rating: 4.1,
    reviews: 2111,
    location: "Tampines Mall",
    tags: ["Fast Food", "American", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMggsb2wacfXbYfA5HPEHvXyGloCvgAsD34PFNz=w800-h600-k-no",
    description:
      "Fast-food restaurant open until 1am on weekdays and 2am on weekends, offering burgers, fries, and other quick meals for night owls.",
    area: "east",
    tag: "FAST FOOD",
    address: "4 Tampines Central 5, Singapore 529510",
    phone: "67773777",
    hours: "Monday-Thursday & Sunday: 6 am–1 am, Friday-Saturday: 6 am–2 am",
    website: "https://www.mcdonalds.com.sg/",
  },
  {
    id: "coffee-bean-bedok",
    name: "The Coffee Bean & Tea Leaf - Bedok Mall",
    rating: 3.4,
    reviews: 71,
    location: "Bedok Mall",
    tags: ["Cafe", "Coffee", "Late Night Dining"],
    image:
      "https://lh3.googleusercontent.com/gps-proxy/ALd4DhFThLM1dVCnxBHAuN_Yf3NlbQToUL5MTwCQsqRe21kEPbzoxMZp2HPleGcI7hMi5-iT0YTOe5ISqvRuj-oAZ3vXhrkDtGXOTVn3aLrgwf_IRtahUI7W_zPxdirmL2Is7aSOamNTS9SlR2bLCOZjITZ0L6vZb6U6YmI-5L3VCeIRWo-eftFuaBI=w800-h600-k-no",
    description:
      "Coffee shop open 24 hours, offering a comfortable space for late-night work or casual gatherings with a variety of beverages and light snacks.",
    area: "east",
    tag: "CAFE",
    address: "311 New Upper Changi Rd, #01-01, Singapore 467360",
    phone: "Not available",
    hours: "Open 24 hours",
    website: "https://www.coffeebean.com.sg/",
  },
  {
    id: "hitoyoshi-jewel",
    name: "Hitoyoshi Izakaya Singapore – Jewel Changi Airport",
    rating: 4.6,
    reviews: 528,
    location: "Jewel",
    tags: ["Japanese", "Izakaya", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOy4llPkKCAUJ9L5AfCi5qwLIFCT56GH90hnM9H=w800-h600-k-no",
    description:
      "Japanese izakaya restaurant with a vibrant atmosphere. Open until midnight on weekends, perfect for airport travelers and night owls.",
    area: "east",
    tag: "LATE NIGHT",
    address:
      "78 Airport Boulevard #05-205 Jewel, Singapore Changi Airport, 819666",
    phone: "60150398",
    hours:
      "Monday-Thursday & Sunday: 11:30 am–10 pm, Friday-Saturday: 11:30 am–12 am",
    website: "http://hitoyoshigroup.com/",
  },
  {
    id: "mcdonalds-hougang",
    name: "McDonald's Hougang Mall",
    rating: 3.9,
    reviews: 1308,
    location: "Hougang Mall",
    tags: ["Fast Food", "American", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMeng7zZ9e6uT85oW_SKw6GmiUfi4tDDfjPRrYg=w800-h600-k-no",
    description:
      "Fast-food restaurant open until midnight, offering burgers, chicken, and breakfast items for late-night cravings.",
    area: "north-east",
    tag: "FAST FOOD",
    address: "90 Hougang Ave 10, #01-16/17 Hougang Mall, Singapore 538766",
    phone: "67773777",
    hours: "Monday-Sunday: 6:30 am–12 am",
    website: "https://www.mcdonalds.com.sg/",
  },
  {
    id: "mcdonalds-jewel",
    name: "McDonald's Jewel",
    rating: 3.3,
    reviews: 183,
    location: "Jewel",
    tags: ["Fast Food", "American", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNNxiewIwSSMJVLKn-neUc5QL1ZvpvVrQa8gZkw=w800-h600-k-no",
    description:
      "Fast-food restaurant in Jewel Changi Airport open until midnight. Ideal for travelers and airport staff looking for quick meals at late hours.",
    area: "east",
    tag: "FAST FOOD",
    address:
      "78 Airport Boulevard Jewel, B1-298 Singapore Changi Airport, 819666",
    phone: "62906434",
    hours: "Monday-Sunday: 6:30 am–12 am",
    website: "http://www.mcdonalds.com.sg/",
  },
  {
    id: "aw-jewel",
    name: "A&W",
    rating: 3.8,
    reviews: 1193,
    location: "Jewel",
    tags: ["Fast Food", "American", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPM7WvV-8o4f--Nu_Axg1Juvzky4g8psXhRPAv9=w800-h600-k-no",
    description:
      "Classic American fast-food chain open until midnight on weekdays and 1am on weekends. Known for root beer floats, burgers, and fried chicken.",
    area: "east",
    tag: "FAST FOOD",
    address:
      "78 Airport Boulevard, #B2-209, Jewel, 78 Airport Blvd., #B2 - 209 Singapore Changi Airport, Singapore 819666",
    phone: "65801203",
    hours:
      "Monday-Thursday & Sunday: 8:30 am–12 am, Friday-Saturday: 8:30 am–1 am",
    website: "https://www.awrestaurants.com.sg/",
  },
  {
    id: "coffeesarang-bedok",
    name: "COFFEESARANG",
    rating: 4.2,
    reviews: 212,
    location: "Bedok Mall",
    tags: ["Cafe", "Korean", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipO6rYlXcAZXfq_UqWsg-Rq3s9V6u1-PW-a8npPm=w800-h600-k-no",
    description:
      "Korean-style cafe open until 11pm, offering a cozy atmosphere for late-evening coffee, desserts, and light meals.",
    area: "east",
    tag: "CAFE",
    address: "311 New Upper Changi Rd #01-78 Bedok Mall, 467360",
    phone: "62844550",
    hours: "Monday to Friday: 9:30 am–11 pm, Saturday to Sunday: 9 am–11 pm",
    website: "https://coffeesarang.cafe/menu",
  },
  {
    id: "beauty-pot-jewel",
    name: "Beauty in The Pot - Jewel Changi Airport",
    rating: 4.6,
    reviews: 1534,
    location: "Jewel",
    tags: ["Chinese", "Hot Pot", "Late Night Dining"],
    image:
      "https://lh3.googleusercontent.com/p/AF1QipNEx6drZ6d2yybPXawr8RPrERyALEQqz8GGza4Q=w800-h600-k-no",
    description:
      "Upscale hot pot restaurant open until 3am. Known for beauty collagen soup and premium ingredients, perfect for late-night dining.",
    area: "east",
    tag: "HOT POT",
    address: "78 Airport Blvd., #B2 - 224, Singapore 819666",
    phone: "62425131",
    hours: "Monday-Sunday: 11:30 am–3 am",
    website: "https://www.paradisegp.com/brand-beauty-in-the-pot/",
  },
  {
    id: "smile-martabak-bedok",
    name: "Smile Martabak Café - Bedok Mall",
    rating: 4.6,
    reviews: 1787,
    location: "Bedok Mall",
    tags: ["Indonesian", "Dessert", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOk0RzueXImkKGtqkIj1XDCWBGSKn6wvoC4EJnr=w800-h600-k-no",
    description:
      "Indonesian cafe specializing in martabak (stuffed pancakes) open until 11pm on weekdays and midnight on weekends. A popular late-night dessert spot.",
    area: "east",
    tag: "INDONESIAN",
    address: "311 New Upper Changi Rd, #01 - 03 Bedok Mall, Singapore 467360",
    phone: "86537486",
    hours:
      "Monday to Thursday: 10 am–11 pm, Friday to Saturday: 10 am–12 am, Sunday: 9 am–11 pm",
    website: "https://martabak.sg/",
  },
  {
    id: "bar-bar-q-suntec",
    name: "Bar Bar Q",
    rating: 4.0,
    reviews: 394,
    location: "Suntec City",
    tags: ["Western", "Bar", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNl7YE5KUv4V8Dqra0_dZ092dcUKedPgfChpL0r=w800-h600-k-no",
    description:
      "Lively bar and restaurant offering Western fare and a wide selection of drinks. Popular for afterwork gatherings and late-night hangouts.",
    area: "central",
    tag: "BAR",
    address: "3 Temasek Blvd, #01-602 / 603, Singapore 038987",
    phone: "+65 9383 8969",
    hours:
      "Monday to Thursday 12 pm–1 am, Friday 12 pm–3 am, Saturday 4 pm–3 am, Sunday 4 pm–12 am",
    website: "https://www.barbarq.com.sg",
  },
  {
    id: "jyu-lae-bistro",
    name: "Jyu Lae Bistro 聚樂",
    rating: 4.6,
    reviews: 1099,
    location: "Suntec City",
    tags: ["Chinese", "Bar", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPTDI-WercKpmLvrMmPPZg9bWiw2o6ysjH44ej2=w800-h600-k-no",
    description:
      "Chinese bistro and bar serving traditional dishes alongside a selection of alcoholic beverages. Open late with a vibrant atmosphere.",
    area: "central",
    tag: "CHINESE",
    address: "3 Temasek Blvd, #01-315, Singapore 038983",
    phone: "+65 8883 3660",
    hours:
      "Monday to Thursday 10:30 am–1 am, Friday to Saturday 10:30 am–3 am, Sunday 10:30 am–1 am",
    website: "https://www.jyulaebistro.com",
  },
  {
    id: "coffeesmith-suntec",
    name: "Coffeesmith (Suntec)",
    rating: 4.0,
    reviews: 545,
    location: "Suntec City",
    tags: ["Cafe", "Coffee", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNeIXSKz_SDHmzeEftrgSZQTENTwHmOuX7k57nQ=w800-h600-k-no",
    description:
      "Modern Korean-inspired cafe offering specialty coffee, light meals, and desserts in a cozy setting. Open until late for night owls.",
    area: "central",
    tag: "CAFE",
    address: "3 Temasek Blvd, #02-413 Tower 5, Singapore 038983",
    phone: "+65 6254 7994",
    hours: "Monday to Thursday 8 am–11 pm, Friday to Sunday 8 am–1 am",
    website: "https://coffeesmith.com.sg",
  },
  {
    id: "jjan-korean-bar",
    name: "Jjan Korean Fusion Bar",
    rating: 3.4,
    reviews: 114,
    location: "Suntec City",
    tags: ["Korean", "Bar", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNplgr6WgCv0hFooGLuAHA6-RiXRnnV4ODiF62W=w800-h600-k-no",
    description:
      "Korean fusion restaurant and bar serving innovative dishes alongside soju and other Korean alcoholic beverages. Lively evening atmosphere.",
    area: "central",
    tag: "KOREAN",
    address: "3 Temasek Blvd, #01-606, Singapore 038983",
    phone: "+65 9443 8651",
    hours: "Monday to Thursday 3 pm–12 am, Friday to Saturday 3 pm–3 am",
    website: "-",
  },
  {
    id: "mcdonalds-vivocity",
    name: "McDonald's Vivocity",
    rating: 4.1,
    reviews: 1720,
    location: "VivoCity",
    tags: ["Fast Food", "American", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPqTUiE03FymGkSDkwuyfXGTjFarRw3CLjOp_2z=w800-h600-k-no",
    description:
      "Global fast-food chain open until midnight, perfect for late-night cravings. Offers burgers, fries, and other quick meals.",
    area: "south",
    tag: "FAST FOOD",
    address: "1 HarbourFront Walk, #B2 - 40, Singapore 098585",
    phone: "63768197",
    hours: "Monday-Sunday: 6:30 am–12 am",
    website: "https://www.mcdonalds.com.sg/",
  },
  {
    id: "beauty-pot-vivocity",
    name: "Beauty in The Pot at VivoCity",
    rating: 4.5,
    reviews: 1342,
    location: "VivoCity",
    tags: ["Chinese", "Hot Pot", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNmnwk2avIb4yH73d1thIWmhm7Z43mlaFDRKIeV=w800-h600-k-no",
    description:
      "Premium hotpot restaurant known for their beauty collagen soup and wide variety of quality ingredients. Open until 3am for late-night dining.",
    area: "south",
    tag: "HOT POT",
    address: "1 HarbourFront Walk, #03-08A, Singapore 098585",
    phone: "62550758",
    hours: "Monday-Sunday: 11:30 am–3 am",
    website: "https://www.paradisegp.com/beauty-in-the-pot/",
  },
  {
    id: "haidilao-vivocity",
    name: "Haidilao Hot Pot @VivoCity",
    rating: 4.6,
    reviews: 3090,
    location: "VivoCity",
    tags: ["Chinese", "Hot Pot", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOV3Wtx4v5ErXIwpaTYDijiIhQxJl_oUKXJRiJ7=w800-h600-k-no",
    description:
      "Popular 24-hour Chinese hot pot chain known for excellent service and quality ingredients. Perfect for late-night gatherings.",
    area: "south",
    tag: "HOT POT",
    address: "1 HarbourFront Walk, #03-09 Vivocity, Singapore 098585",
    phone: "62507557",
    hours: "Monday-Sunday: 10:30 am–4 am",
    website: "https://www.haidilao.com/sg/",
  },
  {
    id: "coffee-bean-amk",
    name: "The Coffee Bean and Tea Leaf - AMK Hub",
    rating: 3.7,
    reviews: 381,
    location: "AMK Hub",
    tags: ["Cafe", "Coffee", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPVaWaNON1eTKsr9DGHT-j8AgYuePAanZrs0fp6=w800-h600-k-no",
    description:
      "International coffee and tea chain offering a variety of beverages and light bites. Open late for night owls looking for a caffeine fix.",
    area: "north",
    tag: "CAFE",
    address: "53 Ang Mo Kio Ave 3, #B1 - 14, Singapore 569933",
    phone: "62350203",
    hours: "Monday to Sunday: 7 am–2 am",
    website: "https://www.coffeebean.com.sg/",
  },
  {
    id: "fatt-choi-hotpot",
    name: "Fatt Choi Hotpot",
    rating: 4.3,
    reviews: 27,
    location: "Marina Bay Sands",
    tags: ["Chinese", "Hot Pot", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipM8aXa8YynZoKBtjIlQAKa_4qrVRYlO9Iqma1G7=w800-h600-k-no",
    description:
      "Upscale hotpot restaurant in the Marina Bay Sands casino. Open until 6am, perfect for late-night dining after gaming.",
    area: "central",
    tag: "CASINO",
    address:
      "10 Bayfront Avenue, Marina Bay Sands Main Casino, Level B2M Floor, 018956",
    phone: "+65 6688 1567",
    hours: "Monday to Sunday 12–6 am, 11 am–12 am",
    website: "https://www.marinabaysands.com/restaurants/fattchoihotpot.html",
  },
  {
    id: "flex-singapore",
    name: "FLEX Singapore",
    rating: 4.2,
    reviews: 5,
    location: "Suntec City",
    tags: ["Western", "Bar", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNu9hH686XdVZ7N1vhnQiLsY6oP9gCT_NnSPcak=w800-h600-k-no",
    description:
      "Trendy nightlife spot offering a combination of dining, drinking, and entertainment. Open late into the night with DJs and live performances.",
    area: "central",
    tag: "NIGHTLIFE",
    address: "3 Temasek Blvd, #03-306/307 Suntec City, Singapore 038983",
    phone: "+65 8189 1006",
    hours: "Monday to Friday 9 pm–3 am, Saturday 9 pm–4 am",
    website: "https://www.flex.sg",
  },
  {
    id: "brotzeit-vivocity",
    name: "Brotzeit German Beer Bar and Restaurant - VivoCity",
    rating: 4.3,
    reviews: 2962,
    location: "VivoCity",
    tags: ["German", "Beer", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMQBswGOI2jPmxMa8y6FJ7FOKLRxpVoF7uVqMrm=w800-h600-k-no",
    description:
      "German microbrewery and restaurant offering authentic Bavarian cuisine, including sausages, schnitzels, and draft beers. Open until late.",
    area: "south",
    tag: "GERMAN",
    address: "1 HarbourFront Walk, #01-149 VivoCity, Singapore 098585",
    phone: "62728815",
    hours: "Monday-Sunday: 11 am–11 pm",
    website: "https://brotzeit.co/",
  },
  {
    id: "wine-connection-vivocity",
    name: "Wine Connection Bistro",
    rating: 4.1,
    reviews: 1202,
    location: "VivoCity",
    tags: ["Western", "Wine", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOSxJ1CschAl7ofN3gv3SksjVgW5KdKWZvX_MUJ=w800-h600-k-no",
    description:
      "Wine-focused restaurant offering a wide selection of affordable wines paired with European cuisine. Popular late-night spot for wine enthusiasts.",
    area: "south",
    tag: "WINE",
    address: "1 HarbourFront Walk, #01 - 152/153/154, Singapore 098585",
    phone: "68730490",
    hours: "Monday-Thursday, Sunday: 11 am–11 pm, Friday-Saturday: 11 am–12 am",
    website: "https://www.wineconnection.com.sg/",
  },
  {
    id: "tong-dim-mbs",
    name: "Tong Dim Noodle Bar",
    rating: 3.7,
    reviews: 71,
    location: "Marina Bay Sands",
    tags: ["Chinese", "Noodles", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipN8DV83ql9JJCsArd7D_W8nTo_x1hPz46mntakz=w800-h600-k-no",
    description:
      "Casino restaurant serving Chinese noodles and dim sum around the clock. Perfect for night owls and early birds alike.",
    area: "central",
    tag: "CASINO",
    address: "10 Bayfront Ave, Singapore 018972",
    phone: "+65 6688 5521",
    hours: "Monday to Sunday 4 am–2 am",
    website: "https://www.marinabaysands.com/restaurants/tongdimnoodlebar.html",
  },
  {
    id: "lavo-mbs",
    name: "LAVO Italian Restaurant And Rooftop Bar",
    rating: 4.3,
    reviews: 5134,
    location: "Marina Bay Sands",
    tags: ["Italian", "Rooftop", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipM7GaPSaX8lEasq8Hrb0DKIz2Sy5gLU_g6E0lrc=w800-h600-k-no",
    description:
      "Upscale Italian restaurant and rooftop bar with panoramic views of Singapore. Transforms into a nightlife venue after dinner hours.",
    area: "central",
    tag: "ROOFTOP",
    address:
      "10 Bayfront Avenue, Marina Bay Sands, Hotel, Level 57 Tower 1, 018956",
    phone: "+65 6688 8591",
    hours:
      "Monday to Thursday 11 am–12 am, Friday to Saturday 11 am–1:30 am, Sunday 12 pm–12 am",
    website:
      "https://www.marinabaysands.com/restaurants/lavoitalianrestaurantandrooftopbar.html",
  },
  {
    id: "harrys-novena",
    name: "Harry's Novena",
    rating: 4.0,
    reviews: 526,
    location: "Novena",
    tags: ["Western", "Bar", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipNf9anbiBZRIaDsMJ_Sg0ziGn5WshJOqEpa6JyB=w800-h600-k-no",
    description:
      "Popular bar and restaurant chain offering Western comfort food and a wide range of drinks. Live sports screenings and occasional live music.",
    area: "central",
    tag: "BAR",
    address: "238 Thomson Rd, #01-59/60 Novena Square, Singapore 307683",
    phone: "+65 8268 8173",
    hours:
      "Monday to Thursday 11:30 am–11 pm, Friday to Saturday 11:30 am–1 am, Sunday 11:30 am–11 pm",
    website: "https://www.harrys.com.sg",
  },
  {
    id: "le-noir-mbs",
    name: "Le Noir @ MBS",
    rating: 4.6,
    reviews: 1362,
    location: "Marina Bay Sands",
    tags: ["Western", "Bar", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipOjNkZ3H0E8l__0xf0K5Sj0uKkV_zWJ6uTnZaiz=w800-h600-k-no",
    description:
      "Stylish bar and bistro offering international cuisine and innovative cocktails. Live music performances and spectacular views of Marina Bay.",
    area: "central",
    tag: "LIVE MUSIC",
    address: "2 Bayfront Ave, #01 - 84, Singapore 018972",
    phone: "+65 8684 2122",
    hours:
      "Monday to Thursday 12 pm–1 am, Friday to Saturday 12 pm–3 am, Sunday 12 pm–1 am",
    website: "https://lenoir.sg",
  },
  {
    id: "dallas-cafe-mbs",
    name: "Dallas Cafe & Bar",
    rating: 4.3,
    reviews: 1002,
    location: "Marina Bay Sands",
    tags: ["Western", "Bar", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipMxq-DZvsTy2C4Wxc5gyht08HaG5poCd_nvCJBr=w800-h600-k-no",
    description:
      "Laid-back cafe by day and vibrant bar by night, serving Western comfort food and drinks with a view of Marina Bay.",
    area: "central",
    tag: "BAR",
    address:
      "2 Bayfront Ave, #01 - 85 The Shoppes at Marina Bay Sands, Singapore 018972",
    phone: "+65 6688 7153",
    hours: "Monday to Sunday 11 am–12 am",
    website: "https://www.dallascafe.sg",
  },
  {
    id: "brauhaus-united-square",
    name: "Brauhaus Restaurant & Pub",
    rating: 4.4,
    reviews: 595,
    location: "United Square",
    tags: ["Western", "European", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipM1kwivgen0KT1HJZXpmjfzXVN1Y7TPIhsFnT99=w800-h600-k-no",
    description:
      "German-style pub and restaurant offering a wide selection of beers and European cuisine. Popular late-night spot for beer enthusiasts.",
    area: "north",
    tag: "PUB",
    address: "101 Thomson Road, B1, #13/14 United Square, 307591",
    phone: "62503116",
    hours:
      "Monday-Thursday: 12 pm–12 am, Friday-Saturday: 12 pm–1 am, Sunday: 4:30 pm–12 am",
    website: "http://www.brauhaus.com.sg/",
  },
  {
    id: "haidilao-mbs",
    name: "Haidilao Hot Pot @Marina Bay Sands",
    rating: 4.8,
    reviews: 2719,
    location: "Marina Bay Sands",
    tags: ["Chinese", "Hot Pot", "Late Night Dining"],
    image:
      "https://lh5.googleusercontent.com/p/AF1QipP3DV9KCuYk2sY-DowcnsDxx-4ZcgnqiIuEOof0=w800-h600-k-no",
    description:
      "Popular Chinese hot pot chain open until late, known for exceptional service and quality ingredients. Perfect for midnight cravings.",
    area: "central",
    tag: "HOT POT",
    address:
      "018972, Bayfront Ave, 2号, The Shoppes at Marina Bay Sands, #B2-01",
    phone: "+65 6509 1611",
    hours: "Monday to Sunday 12–6 am, 10:30 am–12 am",
    website: "https://www.haidilao.com",
  },
];

export const LATE_NIGHT_DEALS: DiningDeal[] = [
  {
    id: "deal1",
    badge: "HAPPY HOUR",
    title: "Extended Happy Hour at Bar Bar Q",
    duration: "Valid till: 30 May 2025",
    description:
      "Enjoy 1-for-1 drinks from 10pm to 1am daily. Includes selected cocktails, house pours, and draught beers.",
    code: "BARBARQ2X1",
  },
  {
    id: "deal2",
    badge: "30% OFF",
    title: "Late Night Menu at Haidilao Hot Pot",
    duration: "Valid till: 15 Jun 2025",
    description:
      "30% discount on all hot pot sets when dining between 11pm and 2am. Valid every day including weekends.",
    code: "HDL30NIGHT",
  },
  {
    id: "deal3",
    badge: "LIVE MUSIC",
    title: "Free Entry at Ameising Live House",
    duration: "Valid till: 31 Dec 2025",
    description:
      "Free entry with any food purchase after 10pm. Enjoy live music performances while dining late into the night.",
    code: "AMEISEFREE",
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
    name: "Quick Bites",
    image:
      "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/quick-bites",
  },
  {
    name: "Family Friendly",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/family-friendly",
  },
  {
    name: "Fine Dining",
    image:
      "https://images.unsplash.com/photo-1505275350441-83dcda8eeef5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/fine-dining",
  },
  {
    name: "Romantic",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    url: "/dining/romantic",
  },
];

export const LATE_NIGHT_STATS = {
  venues: "35+",
  latestClosing: "3:00am",
  entertainmentSpots: "15",
  averageRating: "4.3",
};
