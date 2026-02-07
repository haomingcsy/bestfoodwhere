import type { CuisineData } from "./types";

export const AMERICAN_CUISINE: CuisineData = {
  slug: "american",
  name: "American",
  tagline:
    "From juicy burgers to premium steaks, find the best American food near you",
  features: [
    { label: "Burgers" },
    { label: "Steaks" },
    { label: "Southern" },
    { label: "BBQ" },
    { label: "Diner Classics" },
  ],
  heroImages: [
    "https://images.unsplash.com/photo-1551782450-17144efb9c50?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
  ],
  stats: {
    restaurants: 12,
    menuItems: "500+",
    deals: 3,
    malls: 7,
  },
  restaurants: [
    {
      id: "bread-street-kitchen",
      name: "Bread Street Kitchen by Gordon Ramsay",
      rating: 4.1,
      reviews: 4273,
      location: "Marina Bay Sands",
      tags: ["Western", "Fine Dining", "Celebrity Chef"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipMyqJmwjq_l-vT-FO5PmquSIMNRvgceYl1xas_f=w408-h305-k-no",
      description:
        "Celebrity chef Gordon Ramsay's modern British European restaurant featuring classic dishes with a contemporary twist in an industrial warehouse-designed space.",
      area: "south",
      tag: "CELEBRITY CHEF",
      address:
        "10 Bayfront Ave, B1/01-81 The Shoppes, Marina Bay Sands, Singapore 018956",
      phone: "+65 6688 5665",
      hours: "Monday to Friday 12 pm–12 am, Saturday to Sunday 11:30 am–12 am",
      website:
        "https://www.marinabaysands.com/restaurants/breadstreetkitchenbygordonramsay.html",
    },
    {
      id: "cut-wolfgang-puck",
      name: "CUT by Wolfgang Puck",
      rating: 4.6,
      reviews: 1618,
      location: "Marina Bay Sands",
      tags: ["Western", "Fine Dining", "Steakhouse"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipPT2dL1P55UQQvcIpG8Nrgly7xyaVUdOlLMBXhC=w408-h271-k-no",
      description:
        "Sophisticated steakhouse by celebrity chef Wolfgang Puck offering prime cuts of beef, including Japanese Wagyu, American Angus, and Australian 300-day grain-fed.",
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
      id: "black-tap",
      name: "Black Tap Craft Burgers & Beers",
      rating: 4.2,
      reviews: 3553,
      location: "Marina Bay Sands",
      tags: ["American", "Burgers", "Craft Beer"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipNoE9BwX-PdYDJUC1OIXJ9fk7C6UUnHtjvtgh7v=w408-h306-k-no",
      description:
        "New York-style craft burger joint known for award-winning burgers, craft beers, and over-the-top CrazyShake® milkshakes served in a hip atmosphere.",
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
      id: "yardbird",
      name: "Yardbird Southern Table and Bar",
      rating: 4.1,
      reviews: 2285,
      location: "Marina Bay Sands",
      tags: ["American", "Southern", "Comfort Food"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipM39c2tTBQ6nArRGLFb6Rs3H0n7pdbLbWkrHYfs=w408-h305-k-no",
      description:
        "Southern American cuisine featuring farm-fresh ingredients, classic comfort food, and an impressive bourbon collection in a rustic-chic setting.",
      area: "south",
      tag: "SOUTHERN CUISINE",
      address:
        "10 Bayfront Ave, B1-07 The Shoppes, Marina Bay Sands, Singapore 018956",
      phone: "+65 6688 9959",
      hours: "Monday to Friday 11:30 am–12 am, Saturday to Sunday 11 am–12 am",
      website:
        "https://www.marinabaysands.com/restaurants/yardbirdsoutherntableandbar.html",
    },
    {
      id: "joshs-grill",
      name: "Josh's Grill",
      rating: 4.6,
      reviews: 7586,
      location: "Velocity@Novena Square",
      tags: ["Western", "Steakhouse", "Grill"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipMCL1MTsRoGU5cOKQOHCL8cUpDNa2YRjD-elaUK=w408-h543-k-no",
      description:
        "Premium steakhouse serving quality cuts of meat, flame-grilled to perfection, along with classic American sides and desserts in a modern setting.",
      area: "central",
      tag: "PREMIUM STEAKS",
      address:
        "238 Thomson Rd, #02-68/69/70/71/72 Velocity@Novena Square, Singapore 307683",
      phone: "+65 6250 6989",
      hours: "Monday to Sunday 11:30 am–10 pm",
      website: "https://www.joshsgrill.sg",
    },
    {
      id: "fish-co-amk",
      name: "Fish & Co.",
      rating: 4.1,
      reviews: 1063,
      location: "AMK Hub",
      tags: ["Western", "Seafood", "Family Dining"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipP8v3PT9FHdS3gKLh6A_B4fkf_qcqd36q_SI8GW=w408-h544-k-no",
      description:
        "Seafood specialists serving American-style fish and chips, grilled seafood platters, and pasta dishes in a casual, family-friendly environment.",
      area: "north-east",
      tag: "SEAFOOD SPECIALISTS",
      address: "53 Ang Mo Kio Ave 3, #02 - 02 AMK Hub, Singapore 569933",
      phone: "65556298",
      hours: "Monday to Sunday 11 am–9:30 pm",
      website: "https://foodpanda.sg/restaurant/c6cx/fish-and-co-amk-hub",
    },
    {
      id: "swensens-amk",
      name: "Swensen's @ AMK Hub",
      rating: 3.8,
      reviews: 1003,
      location: "AMK Hub",
      tags: ["Western", "Ice Cream", "Family Dining"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipO0kbjHf8ohjwuRfftXjWMI0SzHqlp8gaybVegb=w408-h270-k-no",
      description:
        "Classic American diner and ice cream parlor offering burgers, sandwiches, and their famous sundaes, perfect for family dining experiences.",
      area: "north-east",
      tag: "FAMILY DINING",
      address: "53 Ang Mo Kio Ave 3, #B1-21A, Singapore 569933",
      phone: "62359902",
      hours: "Monday to Sunday 11 am–10:30 pm",
      website: "http://www.swensens.com.sg/",
    },
    {
      id: "dallas-cafe",
      name: "Dallas Cafe & Bar",
      rating: 4.3,
      reviews: 1002,
      location: "Marina Bay Sands",
      tags: ["Western", "Texan", "Sports Bar"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipMxq-DZvsTy2C4Wxc5gyht08HaG5poCd_nvCJBr=w152-h86-k-no",
      description:
        "Texan-inspired restaurant and bar offering American classics like ribs, steaks, and burgers, with live sports screenings and a vibrant atmosphere.",
      area: "south",
      tag: "TEXAN CUISINE",
      address:
        "2 Bayfront Ave, #01 - 85 The Shoppes at Marina Bay Sands, Singapore 018972",
      phone: "+65 6688 7153",
      hours: "Monday to Sunday 11 am–12 am",
      website: "https://www.dallascafe.sg",
    },
    {
      id: "five-guys-plaza",
      name: "Five Guys Plaza Singapura",
      rating: 4.0,
      reviews: 2350,
      location: "Plaza Singapura",
      tags: ["Fast Food", "Burgers", "American"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipNy7cGx-UccmCVKGhLE3A203AjIaljDjujZpqki=w114-h86-k-no",
      description:
        "Iconic American burger chain known for its hand-crafted burgers, fresh-cut fries, and unlimited toppings, all made with high-quality ingredients.",
      area: "central",
      tag: "PREMIUM BURGERS",
      address:
        "#01-32-25 Unit #01-32/33/34C/35 Plaza Singapura, Singapore 238839",
      phone: "69764385",
      hours: "Monday, Wednesday-Sunday: 11 am–10 pm, Tuesday: 11 am–4 pm",
      website: "https://www.fiveguys.com.sg/",
    },
    {
      id: "shake-shack-junction8",
      name: "Shake Shack Junction 8",
      rating: 4.1,
      reviews: 423,
      location: "Junction 8",
      tags: ["Fast Food", "Burgers", "American"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipMMR7rIsFME4m7b79wa0IXe6oLRkmtqZ9YfUjRC=w408-h306-k-no",
      description:
        "New York's famous roadside burger stand serving 100% Angus beef burgers, crinkle-cut fries, and hand-spun shakes in a modern setting.",
      area: "north",
      tag: "NY BURGERS",
      address:
        "9 Bishan Pl, #01-51 Shopping Centre, Junction 8, Singapore 579837",
      phone: "Not available",
      hours: "Monday-Sunday: 10 am–10 pm",
      website: "http://shakeshack.com.sg/",
    },
    {
      id: "collins-woodleigh",
      name: "COLLIN'S® The Woodleigh Mall",
      rating: 4.1,
      reviews: 185,
      location: "The Woodleigh Mall",
      tags: ["Western", "Steakhouse", "Family Dining"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipNC60rBHLMF6CJCkMIGoK-Wb9IkZPoP2X6KBNHl=w408-h306-k-no",
      description:
        "Affordable Western restaurant serving quality steaks, pasta, and other classic American dishes in a welcoming, casual environment.",
      area: "north-east",
      tag: "AFFORDABLE WESTERN",
      address: "11 Bidadari Park Drive, Mall, #01-24 The Woodleigh, 367803",
      phone: "+65 6320 0139",
      hours: "Monday to Sunday 10 am–10 pm",
      website: "https://www.collins.sg",
    },
    {
      id: "poulet-woodleigh",
      name: "Poulet - Woodleigh Mall",
      rating: 4.8,
      reviews: 3548,
      location: "The Woodleigh Mall",
      tags: ["Western", "Chicken", "Family Dining"],
      image:
        "https://lh5.googleusercontent.com/p/AF1QipPewiaklJ5jIyvJzWxxyvuoQp5ODuCYyhPPaLyB=w408-h301-k-no",
      description:
        "French-inspired casual dining restaurant specializing in succulent roast chicken and classic Western sides at affordable prices.",
      area: "north-east",
      tag: "FRENCH CHICKEN",
      address: "Mall, 11 Bidadari Park Dr, B1-26/27 The Woodleigh, 367803",
      phone: "+65 6231 1594",
      hours: "Monday to Sunday 11:30 am–10 pm",
      website: "https://www.poulet.com.sg",
    },
  ],
  deals: [
    {
      id: "deal1",
      badge: "20% OFF",
      title: "20% OFF All Steaks at CUT by Wolfgang Puck",
      duration: "Valid till: 30 May 2025",
      description:
        "Enjoy 20% off all premium steak cuts at CUT by Wolfgang Puck. Valid for dine-in only, Monday to Thursday.",
      code: "STEAKCUT20",
    },
    {
      id: "deal2",
      badge: "1-FOR-1",
      title: "1-for-1 CrazyShake® at Black Tap",
      duration: "Valid till: 15 Jun 2025",
      description:
        "Buy one CrazyShake® and get one free at Black Tap Craft Burgers & Beers. Second shake must be of equal or lesser value.",
      code: "CRAZYTAP",
    },
    {
      id: "deal3",
      badge: "FREE",
      title: "Free Appetizer with Any Main Course at Yardbird",
      duration: "Valid till: 20 May 2025",
      description:
        "Enjoy a complimentary appetizer with any main course ordered at Yardbird Southern Table and Bar. Dine-in only.",
      code: "YARDAPP",
    },
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
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
      url: "/cuisine/indian",
    },
  ],
};
