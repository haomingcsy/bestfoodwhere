/**
 * Kitchen Equipment Affiliate Links
 * Amazon Singapore affiliate tag: haominglyt-22
 *
 * Premium kitchen equipment recommendations for recipes
 */

const AFFILIATE_TAG = "haominglyt-22";
const AMAZON_SG_BASE = "https://www.amazon.sg";

// Helper to create search URL
function amazonSearch(query: string): string {
  return `${AMAZON_SG_BASE}/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
}

// Helper to create direct product URL (if we have ASINs)
function amazonProduct(asin: string): string {
  return `${AMAZON_SG_BASE}/dp/${asin}?tag=${AFFILIATE_TAG}`;
}

/**
 * Kitchen Equipment Categories with Affiliate Links
 * Organized by cooking method/category
 */
export const KITCHEN_EQUIPMENT = {
  // === COOKWARE ===
  wok: {
    name: "Carbon Steel Wok (14-inch)",
    description: "Essential for stir-frying with high heat",
    link: amazonSearch("carbon steel wok 14 inch"),
    priceRange: "$50-150",
    category: "cookware",
  },
  castIronSkillet: {
    name: "Cast Iron Skillet (12-inch)",
    description: "Perfect sear, oven-safe, lasts generations",
    link: amazonSearch("lodge cast iron skillet 12 inch"),
    priceRange: "$40-80",
    category: "cookware",
  },
  stainlessSteelPan: {
    name: "Stainless Steel Frying Pan",
    description: "Professional-grade, even heat distribution",
    link: amazonSearch("all clad stainless steel frying pan"),
    priceRange: "$100-200",
    category: "cookware",
  },
  dutchOven: {
    name: "Enameled Dutch Oven (6-qt)",
    description: "Perfect for braising, stews, and bread",
    link: amazonSearch("le creuset dutch oven"),
    priceRange: "$200-400",
    category: "cookware",
  },
  stockPot: {
    name: "Stainless Steel Stock Pot (12-qt)",
    description: "For soups, stocks, and large batches",
    link: amazonSearch("all clad stock pot 12 quart"),
    priceRange: "$150-300",
    category: "cookware",
  },
  saucePan: {
    name: "Stainless Steel Saucepan Set",
    description: "Essential for sauces and small batches",
    link: amazonSearch("all clad saucepan set"),
    priceRange: "$100-200",
    category: "cookware",
  },
  nonstickPan: {
    name: "Non-Stick Frying Pan",
    description: "For eggs, delicate fish, and easy cleanup",
    link: amazonSearch("scanpan nonstick frying pan"),
    priceRange: "$80-150",
    category: "cookware",
  },
  grilPan: {
    name: "Cast Iron Grill Pan",
    description: "Indoor grilling with beautiful grill marks",
    link: amazonSearch("lodge cast iron grill pan"),
    priceRange: "$40-80",
    category: "cookware",
  },

  // === APPLIANCES ===
  riceCooker: {
    name: "Zojirushi Rice Cooker",
    description: "Perfect rice every time, fuzzy logic technology",
    link: amazonSearch("zojirushi rice cooker"),
    priceRange: "$150-400",
    category: "appliances",
  },
  pressureCooker: {
    name: "Instant Pot Electric Pressure Cooker",
    description: "7-in-1 multi-cooker for fast cooking",
    link: amazonSearch("instant pot duo 8 quart"),
    priceRange: "$100-200",
    category: "appliances",
  },
  airFryer: {
    name: "Philips Air Fryer XXL",
    description: "Crispy results with less oil",
    link: amazonSearch("philips air fryer xxl"),
    priceRange: "$200-350",
    category: "appliances",
  },
  standMixer: {
    name: "KitchenAid Stand Mixer",
    description: "Professional mixing, kneading, and whipping",
    link: amazonSearch("kitchenaid stand mixer artisan"),
    priceRange: "$400-600",
    category: "appliances",
  },
  foodProcessor: {
    name: "Cuisinart Food Processor (14-cup)",
    description: "Chop, slice, shred, and puree",
    link: amazonSearch("cuisinart food processor 14 cup"),
    priceRange: "$200-300",
    category: "appliances",
  },
  immersionBlender: {
    name: "Breville Immersion Blender",
    description: "Blend soups and sauces right in the pot",
    link: amazonSearch("breville immersion blender"),
    priceRange: "$80-150",
    category: "appliances",
  },
  blender: {
    name: "Vitamix Professional Blender",
    description: "Restaurant-quality blending power",
    link: amazonSearch("vitamix professional blender"),
    priceRange: "$400-700",
    category: "appliances",
  },
  slowCooker: {
    name: "Crock-Pot Slow Cooker (8-qt)",
    description: "Set it and forget it cooking",
    link: amazonSearch("crock pot slow cooker 8 quart"),
    priceRange: "$60-120",
    category: "appliances",
  },
  sousVide: {
    name: "Anova Sous Vide Precision Cooker",
    description: "Restaurant-quality precision cooking",
    link: amazonSearch("anova sous vide precision cooker"),
    priceRange: "$150-300",
    category: "appliances",
  },
  toasterOven: {
    name: "Breville Smart Oven Air",
    description: "Convection toaster oven with air fry",
    link: amazonSearch("breville smart oven air fryer"),
    priceRange: "$300-450",
    category: "appliances",
  },

  // === KNIVES & CUTTING ===
  chefKnife: {
    name: "Japanese Chef's Knife (8-inch)",
    description: "Precision cutting, razor-sharp edge",
    link: amazonSearch("shun classic chef knife 8 inch"),
    priceRange: "$150-300",
    category: "knives",
  },
  santokuKnife: {
    name: "Santoku Knife (7-inch)",
    description: "Versatile Asian-style knife",
    link: amazonSearch("shun santoku knife"),
    priceRange: "$100-200",
    category: "knives",
  },
  cleaver: {
    name: "Chinese Cleaver",
    description: "Essential for Chinese cooking",
    link: amazonSearch("chinese cleaver stainless steel"),
    priceRange: "$30-80",
    category: "knives",
  },
  paringKnife: {
    name: "Paring Knife Set",
    description: "For detailed cutting and peeling",
    link: amazonSearch("wusthof paring knife"),
    priceRange: "$50-100",
    category: "knives",
  },
  breadKnife: {
    name: "Serrated Bread Knife (10-inch)",
    description: "Clean cuts through crusty bread",
    link: amazonSearch("shun bread knife serrated"),
    priceRange: "$100-180",
    category: "knives",
  },
  cuttingBoard: {
    name: "End-Grain Cutting Board",
    description: "Knife-friendly, durable hardwood",
    link: amazonSearch("end grain cutting board walnut"),
    priceRange: "$80-200",
    category: "knives",
  },
  knifeSharpener: {
    name: "Electric Knife Sharpener",
    description: "Keep knives razor-sharp",
    link: amazonSearch("chef's choice electric knife sharpener"),
    priceRange: "$100-200",
    category: "knives",
  },

  // === BAKEWARE ===
  bakingSheet: {
    name: "Nordic Ware Baking Sheets (Set)",
    description: "Heavy-duty, warp-resistant",
    link: amazonSearch("nordic ware baking sheet half sheet"),
    priceRange: "$30-60",
    category: "bakeware",
  },
  cakePan: {
    name: "Cake Pan Set (9-inch Round)",
    description: "Even baking, easy release",
    link: amazonSearch("usa pan cake pan 9 inch"),
    priceRange: "$30-60",
    category: "bakeware",
  },
  muffinTin: {
    name: "Silicone Muffin Pan",
    description: "Non-stick, easy cleanup",
    link: amazonSearch("silicone muffin pan 12 cup"),
    priceRange: "$20-40",
    category: "bakeware",
  },
  loafPan: {
    name: "Bread Loaf Pan",
    description: "Perfect for bread and meatloaf",
    link: amazonSearch("usa pan bread loaf pan"),
    priceRange: "$20-40",
    category: "bakeware",
  },
  pieDisH: {
    name: "Glass Pie Dish",
    description: "See-through for perfect crusts",
    link: amazonSearch("pyrex glass pie dish"),
    priceRange: "$15-30",
    category: "bakeware",
  },
  rollingPin: {
    name: "French Rolling Pin",
    description: "Better control for doughs",
    link: amazonSearch("french rolling pin wood"),
    priceRange: "$20-50",
    category: "bakeware",
  },

  // === TOOLS & UTENSILS ===
  spatula: {
    name: "Fish Spatula (Stainless Steel)",
    description: "Flexible, perfect for delicate foods",
    link: amazonSearch("fish spatula stainless steel"),
    priceRange: "$20-40",
    category: "tools",
  },
  tongs: {
    name: "Kitchen Tongs (Set of 2)",
    description: "Heat-resistant, locking mechanism",
    link: amazonSearch("oxo kitchen tongs set"),
    priceRange: "$15-30",
    category: "tools",
  },
  whisk: {
    name: "Balloon Whisk (Stainless Steel)",
    description: "For sauces, eggs, and batters",
    link: amazonSearch("stainless steel balloon whisk"),
    priceRange: "$10-25",
    category: "tools",
  },
  ladle: {
    name: "Stainless Steel Ladle",
    description: "For soups and sauces",
    link: amazonSearch("stainless steel ladle"),
    priceRange: "$10-25",
    category: "tools",
  },
  woodenSpoons: {
    name: "Wooden Spoon Set",
    description: "Gentle on cookware, heat-resistant",
    link: amazonSearch("wooden spoon set cooking"),
    priceRange: "$15-35",
    category: "tools",
  },
  siliconeSpatula: {
    name: "Silicone Spatula Set",
    description: "Heat-resistant, non-scratch",
    link: amazonSearch("oxo silicone spatula set"),
    priceRange: "$15-30",
    category: "tools",
  },
  thermometer: {
    name: "Instant-Read Meat Thermometer",
    description: "Accurate temps in 2-3 seconds",
    link: amazonSearch("thermapen instant read thermometer"),
    priceRange: "$80-120",
    category: "tools",
  },
  kitchenScale: {
    name: "Digital Kitchen Scale",
    description: "Precise measurements for baking",
    link: amazonSearch("oxo digital kitchen scale"),
    priceRange: "$30-60",
    category: "tools",
  },
  mandoline: {
    name: "Japanese Mandoline Slicer",
    description: "Uniform slices every time",
    link: amazonSearch("benriner mandoline slicer"),
    priceRange: "$30-60",
    category: "tools",
  },
  microplane: {
    name: "Microplane Zester/Grater",
    description: "For citrus zest, garlic, ginger",
    link: amazonSearch("microplane zester grater"),
    priceRange: "$15-30",
    category: "tools",
  },
  colander: {
    name: "Stainless Steel Colander",
    description: "For draining pasta and washing vegetables",
    link: amazonSearch("stainless steel colander"),
    priceRange: "$25-50",
    category: "tools",
  },
  mixingBowls: {
    name: "Stainless Steel Mixing Bowl Set",
    description: "Nesting bowls with lids",
    link: amazonSearch("stainless steel mixing bowl set with lids"),
    priceRange: "$30-60",
    category: "tools",
  },
  measuringCups: {
    name: "Measuring Cup & Spoon Set",
    description: "Stainless steel, accurate measurements",
    link: amazonSearch("stainless steel measuring cups spoons set"),
    priceRange: "$20-40",
    category: "tools",
  },
  pepperMill: {
    name: "Peugeot Pepper Mill",
    description: "Fresh-ground pepper, adjustable grind",
    link: amazonSearch("peugeot pepper mill"),
    priceRange: "$40-80",
    category: "tools",
  },
  mortarPestle: {
    name: "Granite Mortar and Pestle",
    description: "For grinding spices and making pastes",
    link: amazonSearch("granite mortar pestle large"),
    priceRange: "$30-60",
    category: "tools",
  },

  // === STORAGE & ORGANIZATION ===
  foodStorage: {
    name: "Glass Food Storage Containers",
    description: "Airtight, microwave-safe",
    link: amazonSearch("pyrex glass food storage containers"),
    priceRange: "$30-60",
    category: "storage",
  },
  spiceRack: {
    name: "Spice Rack Organizer",
    description: "Keep spices organized and accessible",
    link: amazonSearch("spice rack organizer drawer"),
    priceRange: "$25-50",
    category: "storage",
  },

  // === SPECIALTY ASIAN COOKING ===
  wokRing: {
    name: "Wok Ring Stand",
    description: "Stabilize round-bottom woks",
    link: amazonSearch("wok ring stand"),
    priceRange: "$10-20",
    category: "asian",
  },
  bambooSteamer: {
    name: "Bamboo Steamer (10-inch)",
    description: "For dumplings, buns, and vegetables",
    link: amazonSearch("bamboo steamer 10 inch"),
    priceRange: "$20-40",
    category: "asian",
  },
  riceContainer: {
    name: "Rice Storage Container",
    description: "Keep rice fresh and pest-free",
    link: amazonSearch("rice storage container dispenser"),
    priceRange: "$30-60",
    category: "asian",
  },
  clayPot: {
    name: "Chinese Clay Pot",
    description: "For claypot rice and braised dishes",
    link: amazonSearch("chinese clay pot cooking"),
    priceRange: "$20-50",
    category: "asian",
  },
  wokSpatula: {
    name: "Wok Spatula & Ladle Set",
    description: "Long handles for high-heat wok cooking",
    link: amazonSearch("wok spatula ladle set stainless"),
    priceRange: "$15-35",
    category: "asian",
  },
  strainer: {
    name: "Spider Strainer",
    description: "For deep frying and blanching",
    link: amazonSearch("spider strainer stainless steel"),
    priceRange: "$10-25",
    category: "asian",
  },
} as const;

export type EquipmentKey = keyof typeof KITCHEN_EQUIPMENT;

/**
 * Get equipment recommendations based on recipe equipment list
 * Returns top 3 premium affiliate recommendations
 */
export function getAffiliateRecommendations(
  equipmentNames: string[],
  limit: number = 3,
): (typeof KITCHEN_EQUIPMENT)[EquipmentKey][] {
  const recommendations: (typeof KITCHEN_EQUIPMENT)[EquipmentKey][] = [];
  const lowerNames = equipmentNames.map((n) => n.toLowerCase());

  // Priority matching - most relevant first
  const priorityMatches: EquipmentKey[] = [];

  for (const name of lowerNames) {
    // Match equipment to our catalog
    if (name.includes("wok")) priorityMatches.push("wok");
    if (name.includes("skillet") || name.includes("frying pan"))
      priorityMatches.push("castIronSkillet");
    if (name.includes("knife") || name.includes("cleaver"))
      priorityMatches.push("chefKnife");
    if (name.includes("dutch oven")) priorityMatches.push("dutchOven");
    if (name.includes("stock pot")) priorityMatches.push("stockPot");
    if (name.includes("pressure cooker"))
      priorityMatches.push("pressureCooker");
    if (name.includes("rice cooker")) priorityMatches.push("riceCooker");
    if (name.includes("thermometer")) priorityMatches.push("thermometer");
    if (name.includes("cutting board")) priorityMatches.push("cuttingBoard");
    if (name.includes("steamer")) priorityMatches.push("bambooSteamer");
    if (name.includes("blender")) priorityMatches.push("immersionBlender");
    if (name.includes("food processor")) priorityMatches.push("foodProcessor");
    if (name.includes("scale")) priorityMatches.push("kitchenScale");
    if (name.includes("tongs")) priorityMatches.push("tongs");
    if (name.includes("spatula")) priorityMatches.push("spatula");
  }

  // Remove duplicates and get equipment
  const uniqueMatches = [...new Set(priorityMatches)];
  for (const key of uniqueMatches.slice(0, limit)) {
    recommendations.push(KITCHEN_EQUIPMENT[key]);
  }

  return recommendations;
}

/**
 * Get curated equipment for specific recipe categories
 */
export function getCategoryEquipment(
  category: string,
): (typeof KITCHEN_EQUIPMENT)[EquipmentKey][] {
  switch (category) {
    case "asian-cuisine":
    case "chinese":
      return [
        KITCHEN_EQUIPMENT.wok,
        KITCHEN_EQUIPMENT.cleaver,
        KITCHEN_EQUIPMENT.bambooSteamer,
      ];
    case "italian-european":
      return [
        KITCHEN_EQUIPMENT.dutchOven,
        KITCHEN_EQUIPMENT.stainlessSteelPan,
        KITCHEN_EQUIPMENT.foodProcessor,
      ];
    case "chicken":
    case "beef-pork":
      return [
        KITCHEN_EQUIPMENT.castIronSkillet,
        KITCHEN_EQUIPMENT.thermometer,
        KITCHEN_EQUIPMENT.chefKnife,
      ];
    case "seafood":
      return [
        KITCHEN_EQUIPMENT.nonstickPan,
        KITCHEN_EQUIPMENT.spatula,
        KITCHEN_EQUIPMENT.thermometer,
      ];
    case "soups-stews":
      return [
        KITCHEN_EQUIPMENT.dutchOven,
        KITCHEN_EQUIPMENT.immersionBlender,
        KITCHEN_EQUIPMENT.stockPot,
      ];
    case "rice-noodles":
      return [
        KITCHEN_EQUIPMENT.riceCooker,
        KITCHEN_EQUIPMENT.wok,
        KITCHEN_EQUIPMENT.colander,
      ];
    case "curries-spiced":
      return [
        KITCHEN_EQUIPMENT.dutchOven,
        KITCHEN_EQUIPMENT.mortarPestle,
        KITCHEN_EQUIPMENT.immersionBlender,
      ];
    case "quick-weeknight":
      return [
        KITCHEN_EQUIPMENT.pressureCooker,
        KITCHEN_EQUIPMENT.airFryer,
        KITCHEN_EQUIPMENT.nonstickPan,
      ];
    case "comfort-classics":
      return [
        KITCHEN_EQUIPMENT.dutchOven,
        KITCHEN_EQUIPMENT.castIronSkillet,
        KITCHEN_EQUIPMENT.slowCooker,
      ];
    default:
      return [
        KITCHEN_EQUIPMENT.chefKnife,
        KITCHEN_EQUIPMENT.castIronSkillet,
        KITCHEN_EQUIPMENT.dutchOven,
      ];
  }
}
