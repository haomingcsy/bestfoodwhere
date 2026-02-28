/**
 * Comprehensive cleanup of brands where scraper captured nav links,
 * footer content, promo text, or other non-menu data.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`)); return m?.[1]; };
const sb = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

const DRY_RUN = process.argv.includes("--dry-run");

// Brands with 100% garbage items (no real food content)
const GARBAGE_SLUGS = [
  // Store info text: "Website:", "Operating Hours:", "Number:", "Address:"
  "armoury-steakhouse-bar-grill-aperia",
  "hot-tomato",
  "hot-tomato-bistro",
  // Social links: "Facebook", "Instagram"
  "bens-cookies-suntec-city-singapore",
  // Allergen list, not menu items
  "co-chung-vietnamese-restaurant-plaza-singapura",
  // Category count labels: "In stock (23)", "Out of stock (30)"
  "eastern-rice-dumpling",
  // Corporate page: "Overview", "Our Core Values", "Board of Directors"
  "fu-lin-tofu-yuen-jurong-imm",
  // About page paragraph text
  "fun-toast-junction-8",
  // Single "All Items" label
  "greendot-bedok-mall",
  // "Coming Soon" placeholders
  "hitoyoshi-izakaya-singapore-jewel-changi-airport",
  // Website nav: "Newsroom", "Menu", "Membership"
  "huggs-coffee",
  // Blog post titles
  "i-love-taimei-the-woodleigh-mall-fried-chicken-bubble-tea-taiwan-street-food",
  "i-love-taimei-junction-8",
  // GrabFood promo text (not restaurant content)
  "jollibee-suntec-city",
  "jollibee-vivo-city",
  "jollibee-woodlands-mrt",
  "poulet-causeway-point",
  "poulet-vivocity",
  "poulet-woodleigh-mall",
  "poulet-bijou-jewel-changi-airport",
  "tamjai-samgor-mixian-bedok-mall",
  "tamjai-samgor-mixian-city-square-mall",
  "tamjai-samgor-mixian-junction-8",
  // E-commerce nav: "Account", "History", "Login / Register"
  "kams-roast",
  // Website nav: "Order", "Menu", "FAQ", "Privacy Policy"
  "kazo",
  "kazo-amk-hub",
  "kazo-vivocity",
  // Phone numbers and addresses
  "little-italy-woodleigh",
  // McDonald's website nav (all locations)
  "mcdonalds",
  "mcdonalds-aperia",
  "mcdonalds-bedok-mall",
  "mcdonalds-bishan-junction-8",
  "mcdonalds-causeway-point",
  "mcdonalds-city-square-mall",
  "mcdonalds-jem",
  "mcdonalds-jewel",
  "mcdonalds-plaza-singapura",
  "mcdonalds-suntec-city",
  "mcdonalds-tampines-mall",
  "mcdonalds-the-woodleigh-mall",
  "mcdonalds-vivocity",
  // Checkout form text
  "mister-wheel-singapore",
  // Nando's website nav
  "nandos-plaza-singapura",
  "nandos-tampines-mall",
  // Currency selector text
  "penang-culture",
  // Just "Email"
  "punjab-grill",
  // Marketing slogans
  "saizeriya",
  "saizeriya-aperia-mall",
  // Website nav
  "secret-recipe",
  // Deliveroo platform nav: "Investors", "Newsroom", "FAQs"
  "seoul-garden-hotpot-cafe-imm",
  "xiang-xiang-hunan-cuisine",
  "xiang-xiang-hunan-cuisine-suntec-city",
  // "Menu" and "Corporate Orders" only
  "shake-shake-in-a-tub",
  "shake-shake-in-a-tub-suntec-city",
  // Mall location names only
  "shihlin-taiwan-street-snacks",
  // Broken template: "product.title }} {{ product.title"
  "song-fa-bak-kut-teh-jewel-changi-airport",
  "song-fa-bak-kut-teh-suntec-city",
  // Merch categories: "Shorts", "Hats", "Stickers"
  "tapas-club-vivocity",
  // Nav: "Locations", "FAQs", "Franchising", "Menu"
  "texas-chicken",
  // Coffee Bean website nav
  "the-coffee-bean-tea-leaf",
  "the-coffee-bean-and-tea-leaf",
  "the-coffee-bean-and-tea-leaf-amk-hub",
  // Blog metadata
  "the-queen-mangosteen",
  // Just location names: "Bugis+", "Vivo City"
  "una-una",
  // Promo terms & conditions
  "umisushi-amk-hub",
  // Review quote, not menu
  "tiong-bahru-bakery",
  // "Make Reservation" only
  "coca-suntec-city-mall",
  // Ingredient list: "Egg Yolk", "Vanilla Bean", "Butter"
  "beard-papas-plaza-singapura",
  // BK category names: "Sides", "Sweets", "Breakfast Platter"
  "burger-king-plaza-singapura",
  // Category labels: "All Items", "CNY COOKIES 2026", etc.
  "harrianns-nonya-table",
  // Thai Accent - Deliveroo nav: "Delivery", "Dine-in", etc.
  "thai-accent",
  // Melvados - "Product FAQ", "Corporate Gifting", "Our Outlets"
  "melvados-united-square",
  // Category names only: "Cold Beverages", "Nutrition Information"
  "ya-kun-kaya-toast",
  // Category names: "TOAST", "PASTA", "FRIED NOODLES"
  "streats",
  // Category names: "All Items", "Noodle", "Sides"
  "nature-cafe",
  // Menu descriptions not items: "Come with choice of 1 Dipping Sauce"
  "pepper-lunch-amk-hub",
  "pepper-lunch-bedok-mall",
  "pepper-lunch-jem",
  // Category names: "Maru Set", "Premium Pizza"
  "pizza-maru",
];

async function main() {
  console.log("=== Comprehensive Garbage Menu Cleanup (V2) ===\n");
  if (DRY_RUN) console.log("*** DRY RUN ***\n");

  let totalDeleted = 0;
  let brandsReset = 0;
  let alreadyClean = 0;

  for (const slug of GARBAGE_SLUGS) {
    const { data: brand } = await sb.from("brand_menus")
      .select("id, name, menu_item_count")
      .eq("slug", slug)
      .single();

    if (!brand) {
      console.log(`  ⚠️ Not found: ${slug}`);
      continue;
    }

    if (brand.menu_item_count === 0) {
      alreadyClean++;
      continue;
    }

    console.log(`🗑️ ${brand.name} (${slug}): deleting ${brand.menu_item_count} garbage items`);

    if (!DRY_RUN) {
      await sb.from("menu_items").delete().eq("brand_menu_id", brand.id);
      await sb.from("menu_categories").delete().eq("brand_menu_id", brand.id);
      const { error } = await sb.from("brand_menus").update({
        menu_item_count: 0,
        has_images: false,
        has_prices: false,
        scrape_status: "failed",
        updated_at: new Date().toISOString(),
      }).eq("id", brand.id);

      if (error) {
        console.log(`  ❌ ${error.message}`);
      } else {
        totalDeleted += brand.menu_item_count;
        brandsReset++;
      }
    } else {
      totalDeleted += brand.menu_item_count;
      brandsReset++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Brands reset: ${brandsReset}`);
  console.log(`Already clean: ${alreadyClean}`);
  console.log(`Total garbage items deleted: ${totalDeleted}`);
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
