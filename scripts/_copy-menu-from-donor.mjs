/**
 * Copy menu data from donor brands to near-match brands with 0 menu items.
 * These are the same chain/brand at different locations.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`)); return m?.[1]; };
const sb = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

const DRY_RUN = process.argv.includes("--dry-run");

// Manual mapping: target slug → donor slug
// These are confirmed same-brand, different-location pairs
const COPY_MAP = [
  // Exact same brands, just different location
  { target: "sushiro-jewel-changi", donor: "sushiro-bedok-mall", reason: "Same chain" },
  { target: "jollibee-serangoon-nex", donor: "jollibee", reason: "Same chain" },
  { target: "hollin-singapore", donor: "hollin", reason: "Same brand" },
  { target: "boost-juice-express-vivocity", donor: "boost-juice", reason: "Same brand (express variant)" },
  { target: "playground-by-playmade", donor: "playmade", reason: "Same brand family" },
  { target: "playground-by-playmade-amk-hub", donor: "playmade", reason: "Same brand family" },
  { target: "yakiniku-go-plus", donor: "yakiniku-go", reason: "Same brand (plus variant)" },
  { target: "pontian-mee", donor: "pontian-wanton-noodle", reason: "Same brand family" },
  { target: "gochi-so-shokudo-japanese-restaurant-jewel-changi-airport", donor: "gochi-so-shokudo-bedok-mall", reason: "Same restaurant" },
  // 4 Fingers slug variant
  { target: "4-fingers-crispy-chicken", donor: "4fingers-crispy-chicken", reason: "Slug variant" },
];

async function main() {
  console.log("=== Copy Menu Data from Donor Brands ===\n");
  if (DRY_RUN) console.log("*** DRY RUN ***\n");

  let copied = 0;
  let skipped = 0;
  let failed = 0;

  for (const mapping of COPY_MAP) {
    // Find target brand
    const { data: target } = await sb.from("brand_menus")
      .select("id, slug, name, menu_item_count")
      .eq("slug", mapping.target)
      .single();

    if (!target) {
      // Try fuzzy match
      const { data: fuzzyTargets } = await sb.from("brand_menus")
        .select("id, slug, name, menu_item_count")
        .ilike("slug", `%${mapping.target.slice(0, 20)}%`)
        .eq("menu_item_count", 0);

      if (fuzzyTargets?.length === 1) {
        console.log(`  ℹ️ Fuzzy matched: "${mapping.target}" → "${fuzzyTargets[0].slug}"`);
        Object.assign(target || {}, fuzzyTargets[0]);
      } else {
        console.log(`  ⚠️ Target not found: ${mapping.target} (fuzzy: ${fuzzyTargets?.map(f => f.slug).join(", ") || "none"})`);
        failed++;
        continue;
      }
    }

    if (!target || target.menu_item_count > 0) {
      console.log(`  ⏭️ Skipping ${mapping.target}: already has ${target?.menu_item_count || 0} items`);
      skipped++;
      continue;
    }

    // Find donor brand
    const { data: donor } = await sb.from("brand_menus")
      .select("id, slug, name, menu_item_count")
      .eq("slug", mapping.donor)
      .single();

    if (!donor || donor.menu_item_count === 0) {
      console.log(`  ⚠️ Donor not found or empty: ${mapping.donor} (${donor?.menu_item_count || 0} items)`);
      failed++;
      continue;
    }

    console.log(`📋 ${target.name} (${target.slug}) ← ${donor.name} (${donor.slug}, ${donor.menu_item_count} items) [${mapping.reason}]`);

    if (DRY_RUN) {
      copied++;
      continue;
    }

    // Get donor categories
    const { data: donorCats } = await sb.from("menu_categories")
      .select("*")
      .eq("brand_menu_id", donor.id)
      .order("sort_order");

    // Get donor items
    const { data: donorItems } = await sb.from("menu_items")
      .select("*")
      .eq("brand_menu_id", donor.id);

    if (!donorCats?.length && !donorItems?.length) {
      console.log(`  ⚠️ Donor has menu_item_count=${donor.menu_item_count} but no actual items in DB`);
      failed++;
      continue;
    }

    // Delete any existing categories/items for target
    await sb.from("menu_items").delete().eq("brand_menu_id", target.id);
    await sb.from("menu_categories").delete().eq("brand_menu_id", target.id);

    // Copy categories with new brand_menu_id
    const catIdMap = {}; // old cat id → new cat id
    if (donorCats?.length) {
      for (const cat of donorCats) {
        const newCat = {
          brand_menu_id: target.id,
          name: cat.name,
          sort_order: cat.sort_order,
          description: cat.description,
        };
        const { data: inserted, error } = await sb.from("menu_categories").insert(newCat).select("id").single();
        if (error) {
          console.log(`  ❌ Error inserting category: ${error.message}`);
          continue;
        }
        catIdMap[cat.id] = inserted.id;
      }
    }

    // Copy items with new brand_menu_id and category_id
    let itemCount = 0;
    if (donorItems?.length) {
      const batch = donorItems.map(item => ({
        brand_menu_id: target.id,
        category_id: catIdMap[item.category_id] || null,
        name: item.name,
        description: item.description,
        price: item.price,
        original_image_url: item.original_image_url,
        cdn_image_url: item.cdn_image_url,
        is_available: item.is_available,
        dietary_tags: item.dietary_tags,
        sort_order: item.sort_order,
      }));

      // Insert in chunks of 100
      for (let i = 0; i < batch.length; i += 100) {
        const chunk = batch.slice(i, i + 100);
        const { error } = await sb.from("menu_items").insert(chunk);
        if (error) {
          console.log(`  ❌ Error inserting items batch: ${error.message}`);
        } else {
          itemCount += chunk.length;
        }
      }
    }

    // Update target brand_menus count
    const { error: updateError } = await sb.from("brand_menus").update({
      menu_item_count: itemCount,
      has_images: donorItems?.some(i => i.original_image_url || i.cdn_image_url) || false,
      has_prices: donorItems?.some(i => i.price) || false,
      updated_at: new Date().toISOString(),
    }).eq("id", target.id);

    if (updateError) {
      console.log(`  ❌ Error updating brand count: ${updateError.message}`);
    } else {
      console.log(`  ✅ Copied ${itemCount} items, ${Object.keys(catIdMap).length} categories`);
      copied++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Copied: ${copied}`);
  console.log(`Skipped (already has items): ${skipped}`);
  console.log(`Failed: ${failed}`);
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
