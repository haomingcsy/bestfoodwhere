import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get all brands with 0 menu items
const { data: emptyBrands } = await sb
  .from("brand_menus")
  .select("id, slug, name")
  .eq("menu_item_count", 0)
  .order("name");

// Get all brands WITH menu items (potential parents)
const { data: fullBrands } = await sb
  .from("brand_menus")
  .select("id, slug, name, menu_item_count")
  .gt("menu_item_count", 0);

// Manual mappings for known variants that won't match automatically
const manualMappings = {
  "85-redhill-teochew-fishball-noodle": "85-redhill",
  "arabica-coffee-jewel": "arabica-singapore-jewel-changi-airport",
  "ajisen-tanjiro": "ajisen-ramen",  // same brand family
  "big-appetite": "big-appetite-suntec-city",
  "bengawan-solo-united-square": "bengawan-solo",
  "ch-terais-nex": "ch-terais",
  "hollin-singapore-plaza-singapura": "hollin-singapore",
  "ichikokudo-hokkaido-ramen-jewel": "ichikokudo-hokkaido-ramen",
  "da-paolo-gastronomia-vivocity": "da-paolo-gastronomia-marina-bay",
  "mamma-mia-trattoria-e-caff-suntec-city": "mamma-mia-trattoria-e-caff",
  "sukiya-gyudon-curry-suntec-city": "sukiya-gyudon-curry",
  "super-sub-hotdogs-coffee-suntec-city": "super-sub-hotdogs-coffee",
  "xin-wang-hong-kong-caf": "xin-wang-hong-kong-cafe",
  "riverside-canton-claypot": "riverside-canton-claypot-cuisine",
  "riverside-canton-claypot-cuisine-nex": "riverside-canton-claypot-cuisine",
  "playground-by-playmade-amk-hub": "playground-by-playmade",
  "coucou-hotpot-brew-tea-suntec-city": "coucou-hotpot-brew-tea",
  "beautiful-lai-grilled-fish-suntec-city": "beautiful-lai-grilled-fish",
  "tun-xiang-hokkien-delights-jewel-changi-airport": "tun-xiang-hokkien-delights-bedok-mall",
  "march-jem": "march-suntec-city",
  "march-vivocity": "march-suntec-city",
  "crystal-jade-pavilion": "crystal-jade-hong-kong-kitchen",
  "boost-juice-express-vivocity": null, // no parent
  "bottles-bottles-jewel-changi-airport": null,
};

function normalize(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Try to find parent for each empty brand
const matches = [];
const noMatch = [];

for (const empty of emptyBrands) {
  // Check manual mapping first
  if (manualMappings.hasOwnProperty(empty.slug)) {
    const parentSlug = manualMappings[empty.slug];
    if (!parentSlug) {
      noMatch.push(empty);
      continue;
    }
    const parent = fullBrands.find((b) => b.slug === parentSlug);
    if (parent) {
      matches.push({ child: empty, parent, method: "manual" });
      continue;
    }
    // Parent might also be empty — check all brands
    const emptyParent = emptyBrands.find((b) => b.slug === parentSlug);
    if (emptyParent) {
      // Both are empty, skip
      noMatch.push(empty);
      continue;
    }
  }

  // Try "@" pattern
  if (empty.name.includes("@")) {
    const parentName = empty.name.split("@")[0].trim();
    const parent = fullBrands.find(
      (b) => normalize(b.name) === normalize(parentName)
    );
    if (parent) {
      matches.push({ child: empty, parent, method: "@-split" });
      continue;
    }
  }

  // Try location suffix patterns: "Brand Name - Location", "Brand Name (Location)"
  const locPatterns = [
    /^(.+?)\s*[-–]\s*(NEX|Jewel|VivoCity|Suntec|AMK|Novena|IMM|Bedok|Tampines|Plaza|United)/i,
    /^(.+?)\s*\(([^)]+)\)\s*$/,
    /^(.+?)\s+(Jewel|VivoCity|Suntec|AMK|Novena|IMM|Bedok|Tampines|Plaza|United)\b/i,
  ];

  let found = false;
  for (const pat of locPatterns) {
    const m = empty.name.match(pat);
    if (m) {
      const baseName = m[1].trim();
      const parent = fullBrands.find(
        (b) => normalize(b.name) === normalize(baseName)
      );
      if (parent) {
        matches.push({ child: empty, parent, method: "location-suffix" });
        found = true;
        break;
      }
    }
  }
  if (!found) {
    noMatch.push(empty);
  }
}

console.log(`\nMatched ${matches.length} brands to parents:`);
matches.forEach((m) =>
  console.log(
    `  ${m.child.name} -> ${m.parent.name} (${m.parent.menu_item_count} items) [${m.method}]`
  )
);

console.log(`\nNo match: ${noMatch.length} brands`);

// Now copy menu data from parent to child
let copied = 0;
for (const { child, parent } of matches) {
  // Get parent's menu categories
  const { data: cats } = await sb
    .from("menu_categories")
    .select("name, sort_order")
    .eq("brand_menu_id", parent.id)
    .order("sort_order");

  if (!cats || cats.length === 0) continue;

  // Check if child already has categories
  const { count: existingCats } = await sb
    .from("menu_categories")
    .select("id", { count: "exact", head: true })
    .eq("brand_menu_id", child.id);

  if (existingCats > 0) {
    console.log(`  SKIP ${child.slug} — already has ${existingCats} categories`);
    continue;
  }

  let totalItems = 0;
  for (const cat of cats) {
    // Create category for child
    const { data: newCat, error: catErr } = await sb
      .from("menu_categories")
      .insert({ brand_menu_id: child.id, name: cat.name, sort_order: cat.sort_order })
      .select("id")
      .single();

    if (catErr) {
      console.log(`  ERROR creating category for ${child.slug}: ${catErr.message}`);
      continue;
    }

    // Get parent's items for this category
    const { data: parentCat } = await sb
      .from("menu_categories")
      .select("id")
      .eq("brand_menu_id", parent.id)
      .eq("name", cat.name)
      .single();

    const { data: items } = await sb
      .from("menu_items")
      .select("name, description, price, original_image_url, cdn_image_url, sort_order")
      .eq("category_id", parentCat.id)
      .order("sort_order");

    if (items && items.length > 0) {
      const newItems = items.map((item) => ({
        ...item,
        category_id: newCat.id,
        brand_menu_id: child.id,
      }));
      const { error: itemErr } = await sb.from("menu_items").insert(newItems);
      if (itemErr) {
        console.log(`  ERROR inserting items for ${child.slug}/${cat.name}: ${itemErr.message}`);
      } else {
        totalItems += items.length;
      }
    }
  }

  // Update menu_item_count
  if (totalItems > 0) {
    await sb.from("brand_menus").update({ menu_item_count: totalItems }).eq("id", child.id);
    console.log(`  COPIED ${child.slug} <- ${parent.slug}: ${cats.length} cats, ${totalItems} items`);
    copied++;
  }
}

console.log(`\nCopied menus to ${copied} brands`);
console.log(`Remaining without menus: ${noMatch.length + (matches.length - copied)}`);
