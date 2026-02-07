/**
 * Update shopping mall hero images using restaurant images
 * Run with: npx tsx scripts/update-mall-hero-images.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  const lines = envContent.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (key && valueParts.length > 0) {
      process.env[key] = valueParts.join("=");
    }
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  console.log("🏬 Updating Mall Hero Images\n");

  // Get all malls
  const { data: malls } = await supabase
    .from("shopping_malls")
    .select("id, slug, name");

  console.log(`Found ${malls?.length || 0} malls\n`);

  let updated = 0;
  for (const mall of malls || []) {
    // Get a restaurant image for this mall (prefer highest rated)
    const { data: restaurants } = await supabase
      .from("mall_restaurants")
      .select("hero_image_url, name")
      .eq("mall_id", mall.id)
      .not("hero_image_url", "is", null)
      .limit(5);

    if (restaurants && restaurants.length > 0) {
      // Use the first available image
      const heroImage = restaurants[0].hero_image_url;

      const { error } = await supabase
        .from("shopping_malls")
        .update({ hero_image_url: heroImage })
        .eq("id", mall.id);

      if (!error) {
        console.log(`✅ ${mall.name}`);
        updated++;
      } else {
        console.log(`❌ ${mall.name}: ${error.message}`);
      }
    } else {
      console.log(`⚠️  ${mall.name} - no restaurant images available`);
    }
  }

  console.log(`\n📊 Updated ${updated} malls with hero images`);
}

main().catch(console.error);
