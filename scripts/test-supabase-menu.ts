import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

async function main() {
  // Dynamic import AFTER env is loaded (static imports are hoisted)
  const { fetchBrandBySlugSupabase } = await import("../lib/supabase-menu");

  const slug = process.argv[2] || "koma-singapore";
  console.log(`Testing fetchBrandBySlugSupabase("${slug}")...\n`);

  const brand = await fetchBrandBySlugSupabase(slug);
  if (!brand) {
    console.log("Not found");
    return;
  }
  console.log("Name:", brand.name);
  console.log("Description:", brand.description?.substring(0, 80) + "...");
  console.log("Locations:", brand.locations?.length);
  console.log(
    "Menu categories:",
    brand.menu?.length,
    brand.menu?.map((c) => c.category).join(", "),
  );
  console.log(
    "Menu items:",
    brand.menu?.reduce((s, c) => s + (c.items?.length || 0), 0),
  );
  console.log(
    "Reviews:",
    brand.reviews?.reduce((s, r) => s + (r.reviews?.length || 0), 0),
  );
  console.log("Related brands:", brand.relatedBrands?.length);
  console.log("Amenities:", brand.amenities?.length, brand.amenities);
  console.log("Social links:", Object.keys(brand.socialLinks || {}));
  console.log("Recommendations:", brand.recommendations);
}

main().catch(console.error);
