/**
 * Cleanup V3: brands with garbage/unusable scrape data from re-scrape.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`)); return m?.[1]; };
const sb = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

const DRY_RUN = process.argv.includes("--dry-run");

const GARBAGE_SLUGS = [
  // 471 items, only 4 with prices — raw scrape fragments
  "koma-singapore",
  // 291 items, only 1 with price — wine lists without prices
  "lavo-italian-restaurant-and-rooftop-bar",
  // 10 items each — "Add to wishlist", "Add to cart" UI text in names
  "kei-kaisendon",
  "kei-kaisendon-vivocity",
  // 9 items — 3 are "Add to Cart", "Qty" UI text
  "juice-farm",
  // 1 item each — name is literally "ADD TO CART"
  "kopi-tarts-kallang-ave",
  "kopi-tarts-temasek-blvd",
];

async function main() {
  console.log("=== Garbage Cleanup V3 ===\n");
  if (DRY_RUN) console.log("*** DRY RUN ***\n");

  let totalDeleted = 0;
  let brandsReset = 0;

  for (const slug of GARBAGE_SLUGS) {
    const { data: brand } = await sb.from("brand_menus")
      .select("id, name, menu_item_count")
      .eq("slug", slug)
      .single();

    if (!brand) { console.log(`  ⚠️ Not found: ${slug}`); continue; }
    if (brand.menu_item_count === 0) { continue; }

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
  console.log(`Total garbage items deleted: ${totalDeleted}`);
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
