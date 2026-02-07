/**
 * Fix Recipe Formatting Issues
 *
 * Fixes:
 * 1. why_love_it - Convert to proper bullet format with newlines
 * 2. Verify equipment structure
 * 3. Standardize data format across all recipes
 *
 * Run with: npx tsx scripts/fix-recipe-formatting.ts
 * Dry run:  npx tsx scripts/fix-recipe-formatting.ts --dry-run
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const isDryRun = process.argv.includes("--dry-run");

/**
 * Fix why_love_it formatting
 * Converts markdown-style bullets to proper bullet points with newlines
 */
function fixWhyLoveIt(text: string | null): string | null {
  if (!text) return null;

  // Already has proper newlines and bullets? Return as-is
  if (text.includes("\n") && text.includes("•")) {
    return text;
  }

  // Split by various bullet patterns
  let items: string[] = [];

  // Try splitting by " - **" (markdown inline bullets)
  if (text.includes(" - **")) {
    items = text.split(/\s+-\s+(?=\*\*)/).filter((s) => s.trim());
  }
  // Try splitting by "- **" at start
  else if (text.startsWith("- ") || text.includes("\n- ")) {
    items = text.split(/\n?\s*-\s+/).filter((s) => s.trim());
  }
  // Try splitting by existing bullets
  else if (text.includes("•")) {
    items = text.split(/\s*•\s*/).filter((s) => s.trim());
  }
  // Already looks fine
  else {
    return text;
  }

  if (items.length <= 1) {
    return text; // Couldn't split, return original
  }

  // Rebuild with proper format: "• item\n• item\n• item"
  return items.map((item) => `• ${item.trim()}`).join("\n");
}

/**
 * Fix equipment format
 * Ensures it's an array of {name, required} objects
 */
function fixEquipment(
  equipment: any,
): Array<{ name: string; required: boolean }> | null {
  if (!equipment) return null;

  // If it's already an array, validate structure
  if (Array.isArray(equipment)) {
    return equipment.map((item) => {
      if (typeof item === "string") {
        return { name: item, required: true };
      }
      return {
        name: item.name || item,
        required: item.required ?? true,
      };
    });
  }

  return null;
}

async function main() {
  console.log("=".repeat(60));
  console.log("Recipe Formatting Fixer");
  console.log(
    isDryRun
      ? "DRY RUN - No changes will be saved"
      : "LIVE RUN - Changes will be saved",
  );
  console.log("=".repeat(60));

  // Get all recipes
  const { data: recipes, error } = await supabase
    .from("recipe_content")
    .select("wp_slug, title, why_love_it, equipment");

  if (error || !recipes) {
    console.error("Error fetching recipes:", error);
    return;
  }

  console.log(`\nFound ${recipes.length} recipes to check\n`);

  let fixedCount = 0;
  let alreadyGood = 0;

  for (const recipe of recipes) {
    const fixes: string[] = [];
    const updates: any = {};

    // Check why_love_it
    if (recipe.why_love_it) {
      const fixed = fixWhyLoveIt(recipe.why_love_it);
      if (fixed !== recipe.why_love_it) {
        fixes.push("why_love_it (bullet formatting)");
        updates.why_love_it = fixed;
      }
    }

    // Check equipment
    if (recipe.equipment) {
      const fixed = fixEquipment(recipe.equipment);
      if (JSON.stringify(fixed) !== JSON.stringify(recipe.equipment)) {
        fixes.push("equipment (structure)");
        updates.equipment = fixed;
      }
    }

    // Report and update
    if (fixes.length > 0) {
      console.log(`\n${recipe.wp_slug}:`);
      fixes.forEach((fix) => console.log(`  - Fixed: ${fix}`));

      if (updates.why_love_it) {
        console.log(
          `  - why_love_it preview: ${updates.why_love_it.substring(0, 80)}...`,
        );
      }

      if (!isDryRun) {
        const { error: updateError } = await supabase
          .from("recipe_content")
          .update(updates)
          .eq("wp_slug", recipe.wp_slug);

        if (updateError) {
          console.log(`  - ERROR saving: ${updateError.message}`);
        } else {
          console.log(`  - Saved successfully`);
        }
      }

      fixedCount++;
    } else {
      alreadyGood++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));
  console.log(`Already correct: ${alreadyGood}`);
  console.log(`Fixed: ${fixedCount}`);

  if (isDryRun && fixedCount > 0) {
    console.log("\nRun without --dry-run to apply fixes.");
  }
}

main().catch(console.error);
