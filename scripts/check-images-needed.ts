import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function getRecipesNeedingImages() {
  // Get all recipes
  const { data: recipes } = await supabase
    .from("recipe_content")
    .select("wp_slug, title")
    .order("created_at", { ascending: true });

  // List existing image folders in storage
  const { data: folders } = await supabase.storage
    .from("recipe-images")
    .list("", { limit: 1000 });

  const existingFolders = new Set(folders?.map((f) => f.name) || []);

  // Find recipes without image folders (check for -v3 suffix)
  const needImages =
    recipes?.filter((r) => {
      const hasV3 = existingFolders.has(r.wp_slug + "-v3");
      const hasV2 = existingFolders.has(r.wp_slug + "-v2");
      const hasBase = existingFolders.has(r.wp_slug);
      return !hasV3 && !hasV2 && !hasBase;
    }) || [];

  console.log("Total recipes:", recipes?.length);
  console.log(
    "Recipes with images:",
    (recipes?.length || 0) - needImages.length,
  );
  console.log("Recipes needing images:", needImages.length);
  console.log("\nFirst 20 needing images:");
  needImages.slice(0, 20).forEach((r) => console.log(" -", r.wp_slug));

  // Estimate cost
  const avgSteps = 11;
  const costPerImage = 0.06;
  console.log(
    "\nEstimated cost: ~$" +
      (needImages.length * avgSteps * costPerImage).toFixed(2),
  );
}

getRecipesNeedingImages();
