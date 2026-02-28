import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`)); return m?.[1]; };
const sb = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

const PAIRS = [
  { donor: "beard-papas", targets: ["beard-papas-plaza-singapura"] },
  { donor: "burger-king-suntec-city", targets: ["burger-king", "burger-king-imm", "burger-king-jem", "burger-king-plaza-singapura", "burger-king-the-woodleigh-mall", "burger-king-vivo-city"] },
  { donor: "fun-toast", targets: ["fun-toast-junction-8"] },
  { donor: "greendot-junction-8", targets: ["greendot-bedok-mall"] },
  { donor: "jollibee", targets: ["jollibee-suntec-city", "jollibee-vivo-city", "jollibee-woodlands-mrt"] },
  { donor: "kei-kaisendon-amk-hub", targets: ["kei-kaisendon", "kei-kaisendon-vivocity"] },
  { donor: "kopi-tarts-city-square-mall", targets: ["kopi-tarts-kallang-ave", "kopi-tarts-temasek-blvd"] },
  { donor: "mcdonalds-united-square", targets: ["mcdonalds", "mcdonalds-aperia", "mcdonalds-bedok-mall", "mcdonalds-bishan-junction-8", "mcdonalds-causeway-point", "mcdonalds-city-square-mall", "mcdonalds-jem", "mcdonalds-jewel", "mcdonalds-plaza-singapura", "mcdonalds-suntec-city", "mcdonalds-tampines-mall", "mcdonalds-the-woodleigh-mall"] },
  { donor: "melvados-woodleigh", targets: ["melvados-united-square"] },
  { donor: "pepper-lunch", targets: ["pepper-lunch-amk-hub", "pepper-lunch-bedok-mall", "pepper-lunch-jem"] },
  { donor: "saizeriya-ristorante-e-caff", targets: ["saizeriya", "saizeriya-aperia-mall"] },
  { donor: "shake-shake-in-a-tub-jewel-changi-airport", targets: ["shake-shake-in-a-tub", "shake-shake-in-a-tub-suntec-city"] },
  { donor: "song-fa-bak-kut-teh", targets: ["song-fa-bak-kut-teh-jewel-changi-airport", "song-fa-bak-kut-teh-suntec-city"] },
  { donor: "tamjai-samgor-mixian", targets: ["tamjai-samgor-mixian-bedok-mall", "tamjai-samgor-mixian-city-square-mall", "tamjai-samgor-mixian-junction-8"] },
];

async function copyMenu(donorSlug, targetSlug) {
  // Get donor brand
  const { data: donor } = await sb.from("brand_menus").select("id, name, menu_item_count, has_images, has_prices").eq("slug", donorSlug).single();
  if (!donor || donor.menu_item_count === 0) { console.log(`  ⚠️ Donor ${donorSlug} has no items`); return 0; }

  // Get target brand
  const { data: target } = await sb.from("brand_menus").select("id, name, menu_item_count").eq("slug", targetSlug).single();
  if (!target) { console.log(`  ⚠️ Target ${targetSlug} not found`); return 0; }
  if (target.menu_item_count > 0) { console.log(`  ⏭️ ${targetSlug} already has ${target.menu_item_count} items`); return 0; }

  // Get donor categories
  const { data: cats } = await sb.from("menu_categories").select("*").eq("brand_menu_id", donor.id).order("sort_order");
  
  // Get donor items
  const { data: items } = await sb.from("menu_items").select("*").eq("brand_menu_id", donor.id).order("sort_order");

  // Create categories for target
  const catMap = {};
  for (const cat of cats || []) {
    const { data: newCat } = await sb.from("menu_categories").insert({
      brand_menu_id: target.id,
      name: cat.name,
      sort_order: cat.sort_order,
    }).select("id").single();
    if (newCat) catMap[cat.id] = newCat.id;
  }

  // Create items for target (batch insert in groups of 50)
  let copied = 0;
  const batch = [];
  for (const item of items || []) {
    batch.push({
      brand_menu_id: target.id,
      category_id: catMap[item.category_id] || null,
      name: item.name,
      description: item.description,
      price: item.price,
      original_image_url: item.original_image_url,
      cdn_image_url: item.cdn_image_url,
      sort_order: item.sort_order,
      is_available: item.is_available,
      dietary_tags: item.dietary_tags,
    });
    
    if (batch.length >= 50) {
      const { error } = await sb.from("menu_items").insert(batch);
      if (error) { console.log(`  ❌ Insert error: ${error.message}`); } 
      else { copied += batch.length; }
      batch.length = 0;
    }
  }
  if (batch.length > 0) {
    const { error } = await sb.from("menu_items").insert(batch);
    if (error) { console.log(`  ❌ Insert error: ${error.message}`); }
    else { copied += batch.length; }
  }

  // Update target brand
  await sb.from("brand_menus").update({
    menu_item_count: copied,
    has_images: donor.has_images,
    has_prices: donor.has_prices,
    scrape_status: "completed",
    updated_at: new Date().toISOString(),
  }).eq("id", target.id);

  return copied;
}

async function main() {
  console.log("=== Batch Donor Menu Copy ===\n");
  let totalCopied = 0;
  let brandsUpdated = 0;

  for (const pair of PAIRS) {
    console.log(`\n📋 Donor: ${pair.donor} → ${pair.targets.length} targets`);
    for (const target of pair.targets) {
      const count = await copyMenu(pair.donor, target);
      if (count > 0) {
        console.log(`  ✅ ${target}: ${count} items copied`);
        totalCopied += count;
        brandsUpdated++;
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Brands updated: ${brandsUpdated}`);
  console.log(`Total items copied: ${totalCopied}`);
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
