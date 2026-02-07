import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex);
      let value = trimmed.substring(eqIndex + 1);
      value = value.replace(/^"|"$/g, "");
      process.env[key] = value;
    }
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function check() {
  // Check brand_menus for Old Chang Kee
  const { data: brand, error: brandErr } = await supabase
    .from("brand_menus")
    .select("id, slug, name, youtube_url")
    .eq("slug", "old-chang-kee")
    .single();

  console.log("Brand Data:", JSON.stringify(brand, null, 2));
  if (brandErr) console.log("Brand Error:", brandErr);

  if (brand) {
    // Check ALL menu items
    const { data: items } = await supabase
      .from("menu_items")
      .select("name, original_image_url")
      .eq("brand_menu_id", brand.id);

    console.log("\nAll Menu Items:");
    items?.forEach((i) => console.log(`- ${i.name}: ${i.original_image_url}`));

    // Check unique URLs
    const uniqueUrls = new Set(items?.map((i) => i.original_image_url));
    console.log(`\n=== Summary ===`);
    console.log(`Total items: ${items?.length}`);
    console.log(`Unique image URLs: ${uniqueUrls.size}`);

    if (uniqueUrls.size === 1 && items && items.length > 1) {
      console.log("\n⚠️  WARNING: All images are the same URL!");
    }
  }
}

check().catch(console.error);
