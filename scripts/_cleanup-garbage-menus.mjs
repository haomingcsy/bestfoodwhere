/**
 * Clean up brands where the website scraper scraped navigation/footer links
 * instead of actual menu items. These brands have NO real food items.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`)); return m?.[1]; };
const sb = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

const DRY_RUN = process.argv.includes("--dry-run");

// Brands where ALL items are garbage (nav links, footer content, etc.)
const GARBAGE_SLUGS = [
  // Burger King - all items are "About BK", "Events", "Privacy Policy", etc.
  "burger-king",
  "burger-king-imm",
  "burger-king-jem",
  "burger-king-vivo-city",
  "burger-king-the-woodleigh-mall",
  // Hans - all items are "Shop Online", "Careers", "Privacy Policy", etc.
  "hans",
  "hans-union",
  // Beanstro (Coffee Bean) - all items are "About Us", "Feedback Form", "FAQs", etc.
  "beanstro",
  // Big Appetite (Broadway) - all items are company info, contact, careers
  "big-appetite",
  // COCA Hotpot - all items are category names and nav ("About Us", "Contact Us", "Make Reservation")
  "coca",
  // Blanco Court Beef Noodles - "Home", "Services", "Contact Us"
  "blanco-court-beef-noodles-aperia-mall",
  // Rich & Good Cake Shop - website structure text
  "rich-good-cake-shop",
  // Läderach - website nav (Store Locator, FAQ, Corporate Orders, etc.)
  "l-derach",
  // IKEA Jurong - entire IKEA website footer (32 nav items)
  "ikea-jurong",
  // Food Dynasty - gourmet card promo text, not menu items
  "food-dynasty",
  // Collins - only category names ("Pasta", "Seafood", "Meats"), not actual dishes
  "collins-nex",
  "collins-the-woodleigh-mall",
];

async function main() {
  console.log("=== Cleanup Garbage Menu Items ===\n");
  if (DRY_RUN) console.log("*** DRY RUN ***\n");

  let totalDeleted = 0;
  let brandsReset = 0;

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
      console.log(`  ⏭️ Already clean: ${slug}`);
      continue;
    }

    console.log(`🗑️ ${brand.name} (${slug}): deleting ${brand.menu_item_count} garbage items`);

    if (!DRY_RUN) {
      // Delete items
      const { error: itemErr } = await sb.from("menu_items").delete().eq("brand_menu_id", brand.id);
      if (itemErr) { console.log(`  ❌ Error deleting items: ${itemErr.message}`); continue; }

      // Delete categories
      const { error: catErr } = await sb.from("menu_categories").delete().eq("brand_menu_id", brand.id);
      if (catErr) { console.log(`  ❌ Error deleting categories: ${catErr.message}`); continue; }

      // Reset count
      const { error: updateErr } = await sb.from("brand_menus").update({
        menu_item_count: 0,
        has_images: false,
        has_prices: false,
        scrape_status: "failed",
        updated_at: new Date().toISOString(),
      }).eq("id", brand.id);

      if (updateErr) {
        console.log(`  ❌ Error updating brand: ${updateErr.message}`);
      } else {
        console.log(`  ✅ Cleaned`);
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
  console.log(`Total garbage items deleted: ${totalDeleted}`);
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
