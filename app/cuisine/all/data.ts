export interface Cuisine {
  id: string;
  name: string;
  description: string;
  image: string;
  url: string;
  count: number;
  countLabel: string;
}

export interface FeaturedRestaurant {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  tags: string[];
  menuUrl: string;
  mapsUrl: string;
}

export interface CuisineDeal {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  code: string;
  image: string;
  participants: string[];
  terms: string[];
}

export interface DeliveryService {
  id: string;
  name: string;
  description: string;
  icon: string;
  bgColor: string;
  url: string;
}

export interface TrendingFood {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface ServiceOption {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
  isFeatured?: boolean;
}

export const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1470&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1470&q=80",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1470&q=80",
];

export const STATS = [
  { value: "19", label: "Cuisine Types" },
  { value: "671", label: "Restaurants" },
  { value: "12,000+", label: "Menu Items" },
  { value: "25+", label: "Special Deals" },
];

export const CUISINES: Cuisine[] = [
  {
    id: "japanese",
    name: "Japanese",
    description: "Sushi, ramen, tempura and more",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1470&q=80",
    url: "/cuisine/japanese",
    count: 37,
    countLabel: "Restaurants",
  },
  {
    id: "western",
    name: "Western",
    description: "Steaks, burgers, pasta and more",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1470&q=80",
    url: "/cuisine/western",
    count: 62,
    countLabel: "Restaurants",
  },
  {
    id: "local",
    name: "Local",
    description: "Singaporean favorites and hawker delights",
    image:
      "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=1470&q=80",
    url: "/cuisine/local",
    count: 60,
    countLabel: "Restaurants",
  },
  {
    id: "chinese",
    name: "Chinese",
    description: "Dim sum, noodles, stir-fry and more",
    image:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1374&q=80",
    url: "/cuisine/chinese",
    count: 75,
    countLabel: "Restaurants",
  },
  {
    id: "korean",
    name: "Korean",
    description: "BBQ, bibimbap, fried chicken and more",
    image:
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=1374&q=80",
    url: "/cuisine/korean",
    count: 23,
    countLabel: "Restaurants",
  },
  {
    id: "fast-food",
    name: "Fast Food",
    description: "Burgers, fried chicken, pizza and more",
    image:
      "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1470&q=80",
    url: "/cuisine/fast-food",
    count: 72,
    countLabel: "Restaurants",
  },
  {
    id: "dessert",
    name: "Dessert",
    description: "Ice cream, cakes, pastries and more",
    image:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1374&q=80",
    url: "/cuisine/dessert",
    count: 80,
    countLabel: "Restaurants",
  },
  {
    id: "cafe",
    name: "Cafe",
    description: "Coffee, brunch, sandwiches and more",
    image:
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1470&q=80",
    url: "/cuisine/cafe",
    count: 43,
    countLabel: "Restaurants",
  },
  {
    id: "bubble-tea",
    name: "Bubble Tea",
    description: "Milk tea, fruit tea, specialty drinks",
    image:
      "https://images.unsplash.com/photo-1525803377221-4f6ccdaa5133?auto=format&fit=crop&w=1374&q=80",
    url: "/cuisine/bubble-tea",
    count: 49,
    countLabel: "Shops",
  },
  {
    id: "vietnamese",
    name: "Vietnamese",
    description: "Pho, banh mi, spring rolls and more",
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1374&q=80",
    url: "/cuisine/vietnamese",
    count: 7,
    countLabel: "Restaurants",
  },
  {
    id: "seafood",
    name: "Seafood",
    description: "Chili crab, fish, prawns and more",
    image:
      "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?auto=format&fit=crop&w=1470&q=80",
    url: "/cuisine/seafood",
    count: 42,
    countLabel: "Restaurants",
  },
  {
    id: "food-court",
    name: "Food Court",
    description: "Various stalls offering diverse cuisine",
    image:
      "https://images.unsplash.com/photo-1569096651661-820d0de8b4ab?auto=format&fit=crop&w=1470&q=80",
    url: "/cuisine/food-court",
    count: 14,
    countLabel: "Locations",
  },
  {
    id: "italian",
    name: "Italian",
    description: "Pizza, pasta, risotto and more",
    image:
      "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=1480&q=80",
    url: "/cuisine/italian",
    count: 39,
    countLabel: "Restaurants",
  },
  {
    id: "thai",
    name: "Thai",
    description: "Tom yum, pad thai, green curry and more",
    image:
      "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=1632&q=80",
    url: "/cuisine/thai",
    count: 8,
    countLabel: "Restaurants",
  },
  {
    id: "indian",
    name: "Indian",
    description: "Curry, naan, biryani and more",
    image:
      "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=1474&q=80",
    url: "/cuisine/indian",
    count: 19,
    countLabel: "Restaurants",
  },
  {
    id: "mediterranean",
    name: "Mediterranean",
    description: "Hummus, kebabs, falafel and more",
    image:
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=1471&q=80",
    url: "/cuisine/mediterranean",
    count: 7,
    countLabel: "Restaurants",
  },
  {
    id: "mexican",
    name: "Mexican",
    description: "Tacos, burritos, nachos and more",
    image:
      "https://images.unsplash.com/photo-1464219222984-216ebffaaf85?auto=format&fit=crop&w=1470&q=80",
    url: "/cuisine/mexican",
    count: 7,
    countLabel: "Restaurants",
  },
  {
    id: "american",
    name: "American",
    description: "Burgers, hot dogs, BBQ and more",
    image:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1470&q=80",
    url: "/cuisine/american",
    count: 12,
    countLabel: "Restaurants",
  },
  {
    id: "european",
    name: "European",
    description: "French, German, Spanish dishes and more",
    image:
      "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=1470&q=80",
    url: "/cuisine/european",
    count: 15,
    countLabel: "Restaurants",
  },
];

export const FEATURED_RESTAURANTS: FeaturedRestaurant[] = [
  {
    id: "garden-bistro",
    name: "The Garden Bistro",
    location: "Orchard Road",
    rating: 4.9,
    reviews: 623,
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1470&q=80",
    tags: ["Western", "Fine Dining"],
    menuUrl: "/menu/garden-bistro?location=orchard-road",
    mapsUrl:
      "https://www.google.com/maps/search/The+Garden+Bistro+Orchard+Road+Singapore",
  },
  {
    id: "sushi-masterpiece",
    name: "Sushi Masterpiece",
    location: "Marina Bay Sands",
    rating: 4.8,
    reviews: 812,
    image:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1470&q=80",
    tags: ["Japanese", "Sushi"],
    menuUrl: "/menu/sushi-masterpiece?location=marina-bay-sands",
    mapsUrl:
      "https://www.google.com/maps/search/Sushi+Masterpiece+Marina+Bay+Sands+Singapore",
  },
  {
    id: "spice-pavilion",
    name: "Spice Pavilion",
    location: "Clarke Quay",
    rating: 4.7,
    reviews: 542,
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1474&q=80",
    tags: ["Indian", "Fine Dining"],
    menuUrl: "/menu/spice-pavilion?location=clarke-quay",
    mapsUrl:
      "https://www.google.com/maps/search/Spice+Pavilion+Clarke+Quay+Singapore",
  },
];

export const CUISINE_DEALS: CuisineDeal[] = [
  {
    id: "half50",
    badge: "50%",
    title: "50% OFF Second Main Course",
    subtitle: "Valid at select restaurants Mon-Thu",
    duration: "Valid till: 30 June 2025",
    description:
      "Enjoy 50% off your second main course when dining with a friend or loved one at any of our participating restaurants. Perfect for lunch dates or dinner outings!",
    code: "HALF50",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1470&q=80",
    participants: [
      "The Garden Bistro - Orchard Road",
      "Spice Pavilion - Clarke Quay",
      "Carnivore Steakhouse - Dempsey Hill",
      "Pasta Paradise - Marina Bay",
    ],
    terms: [
      "Valid for dine-in only",
      "Valid Monday to Thursday, excluding public holidays",
      "Second main course must be of equal or lesser value",
      "Cannot be combined with other promotions or discounts",
      "The management reserves the right to amend the terms & conditions without prior notice",
    ],
  },
  {
    id: "boba121",
    badge: "1+1",
    title: "1-for-1 Bubble Tea",
    subtitle: "At 15 participating outlets islandwide",
    duration: "Valid till: 15 May 2025",
    description:
      "Buy one bubble tea and get one free at 15 participating outlets across Singapore. Perfect for sharing with friends or treating yourself to a second cup!",
    code: "BOBA121",
    image:
      "https://images.unsplash.com/photo-1525803377221-4f6ccdaa5133?auto=format&fit=crop&w=1374&q=80",
    participants: [
      "Boba Paradise - Orchard Road",
      "Tea Master - Bugis Junction",
      "Bubble World - NEX Mall",
      "Plus 12 more locations islandwide",
    ],
    terms: [
      "Valid for all bubble tea flavors",
      "Second drink must be of equal or lesser value",
      "Valid all days including weekends",
      "Limited to one redemption per customer per day",
      "Cannot be combined with other promotions or discounts",
    ],
  },
];

export const DELIVERY_SERVICES: DeliveryService[] = [
  {
    id: "foodpanda",
    name: "Foodpanda",
    description:
      "Wide selection of restaurants with fast delivery across Singapore.",
    icon: "panda",
    bgColor: "#FFE8E1",
    url: "https://www.foodpanda.sg",
  },
  {
    id: "grabfood",
    name: "GrabFood",
    description:
      "Enjoy exclusive deals and earn reward points with every order.",
    icon: "grab",
    bgColor: "#E1FFE8",
    url: "https://food.grab.com",
  },
  {
    id: "deliveroo",
    name: "Deliveroo",
    description: "Premium restaurant selection with reliable delivery service.",
    icon: "deliveroo",
    bgColor: "#E1F1FF",
    url: "https://deliveroo.com.sg",
  },
];

export const DELIVERY_TIPS = [
  "Compare prices across platforms to find the best deals",
  "Order directly from restaurants for better prices",
  "Look for free delivery promotions and minimum order discounts",
  "Join restaurant loyalty programs for regular discounts",
];

export const TRENDING_FOODS: TrendingFood[] = [
  {
    id: "korean-fried-chicken",
    name: "Korean Fried Chicken",
    description: "Crispy, spicy and sweet",
    url: "/cuisine/korean",
  },
  {
    id: "japanese-omakase",
    name: "Japanese Omakase",
    description: "Chef's selection dining experience",
    url: "/cuisine/japanese",
  },
  {
    id: "brown-sugar-bubble-tea",
    name: "Brown Sugar Bubble Tea",
    description: "Caramelized tapioca pearls",
    url: "/cuisine/bubble-tea",
  },
];

export const LISTING_OPTIONS: ServiceOption[] = [
  {
    id: "basic",
    name: "Basic Listing",
    description:
      "Standard restaurant listing with basic information and contact details.",
    price: "Free",
    features: [
      "Restaurant name and address",
      "Contact information",
      "Basic description",
      "Opening hours",
    ],
  },
  {
    id: "premium",
    name: "Premium Listing",
    description:
      "Enhanced listing with additional features and better visibility.",
    price: "$99/month",
    features: [
      "All Basic features plus:",
      "Professional photo gallery",
      "Full menu display",
      "Featured in search results",
      "Customer reviews and ratings",
    ],
  },
  {
    id: "featured",
    name: "Featured Listing",
    description:
      "Premium placement with maximum visibility and exclusive features.",
    price: "$249/month",
    features: [
      "All Premium features plus:",
      "Top placement in search results",
      "Homepage feature rotation",
      "Promotional deal listings",
      "Monthly performance reports",
      "Dedicated account manager",
    ],
    isFeatured: true,
  },
];

export const MARKETING_PACKAGES = [
  {
    id: "featured-placements",
    name: "Featured Placements",
    description:
      "Get premium visibility across our platform with featured placements in high-traffic areas.",
    price: "Starting from $199/month",
    features: [
      "Homepage spotlight rotation",
      "Category page top placements",
      "Banner promotions",
      'Featured in "Recommended" sections',
    ],
  },
  {
    id: "promotional-campaigns",
    name: "Promotional Campaigns",
    description:
      "Custom promotional campaigns designed to drive traffic and increase orders.",
    price: "Starting from $299/month",
    features: [
      "Exclusive deals and offers",
      "Email newsletter features",
      "Social media promotions",
      "Push notification campaigns",
    ],
  },
  {
    id: "targeted-advertising",
    name: "Targeted Advertising",
    description:
      "Precision-targeted ads based on location, cuisine preferences, and user behavior.",
    price: "Custom pricing based on requirements",
    features: [
      "Geo-targeted promotions",
      "Cuisine preference targeting",
      "Competitor audience targeting",
      "Performance analytics and reporting",
    ],
  },
];

export const DIGITAL_SOLUTIONS = [
  {
    id: "reservation",
    name: "Online Reservation System",
    description:
      "Streamline your booking process with our easy-to-use reservation system. Reduce no-shows and manage your tables efficiently.",
    icon: "calendar",
    price: "$89/month",
    features: [
      "24/7 online bookings",
      "Automated confirmations and reminders",
      "Table management system",
      "No-show reduction tools",
    ],
  },
  {
    id: "analytics",
    name: "Analytics Dashboard",
    description:
      "Gain valuable insights into your restaurant's performance with our comprehensive analytics dashboard.",
    icon: "chart",
    price: "$129/month",
    features: [
      "Customer behavior analytics",
      "Traffic and conversion tracking",
      "Menu performance insights",
      "Competitive benchmarking",
    ],
  },
  {
    id: "ordering",
    name: "Online Ordering System",
    description:
      "Accept orders directly from your restaurant listing with our commission-free online ordering system.",
    icon: "cart",
    price: "$149/month",
    features: [
      "Commission-free orders",
      "Menu management system",
      "Real-time order notifications",
      "Customer database building",
    ],
  },
];
