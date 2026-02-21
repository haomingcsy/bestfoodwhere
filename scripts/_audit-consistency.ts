import * as dotenv from "dotenv";
dotenv.config({ path: "/Users/haoming/Desktop/bestfoodwhere/.env.local" });
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {auth:{persistSession:false}});

async function run() {
  // First check actual columns
  const { data: sample } = await sb.from("brand_menus").select("*").limit(1).single();
  console.log("brand_menus columns:", Object.keys(sample || {}));

  // Get brands with actual columns
  const { data: brands, error } = await sb.from("brand_menus").select("id, slug, name, description, amenities, recommendations").eq("is_active", true).order("name").limit(30);
  if (error) { console.log("Error:", error.message); return; }
  
  console.log("\nSLUG".padEnd(45), "ITEMS", "IMGS", "DESC", "AMEN", "RECS", "NUTR");
  console.log("-".repeat(90));
  
  const fs = await import("fs");
  const path = await import("path");
  
  for (const b of brands!) {
    const { count } = await sb.from("menu_items").select("*", {count:"exact", head:true}).eq("brand_menu_id", b.id).eq("is_available", true);
    const { count: imgCount } = await sb.from("menu_items").select("*", {count:"exact", head:true}).eq("brand_menu_id", b.id).eq("is_available", true).not("original_image_url", "is", null);
    const hasDesc = !!(b.description && b.description.length > 0);
    const hasAmenities = !!(b.amenities && (Array.isArray(b.amenities) ? b.amenities.length > 0 : Object.keys(b.amenities).length > 0));
    const hasRec = !!(b.recommendations && (Array.isArray(b.recommendations) ? b.recommendations.length > 0 : true));
    const hasNutrition = fs.existsSync(path.join("/Users/haoming/Desktop/bestfoodwhere/data/nutrition", b.slug + ".json"));
    console.log(
      b.slug.padEnd(45),
      String(count ?? 0).padStart(4),
      String(imgCount ?? 0).padStart(4),
      hasDesc ? "  Y " : "  N ",
      hasAmenities ? "  Y " : "  N ",
      hasRec ? "  Y " : "  N ",
      hasNutrition ? "  Y " : "  N "
    );
  }
}
run();
