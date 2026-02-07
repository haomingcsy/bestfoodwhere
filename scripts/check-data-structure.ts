import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  const { data: recipes } = await supabase
    .from("recipe_content")
    .select("wp_slug, ingredients, instructions, why_love_it")
    .limit(100);

  const malformed: Array<{ slug: string; issues: string }> = [];

  for (const r of recipes || []) {
    const issues: string[] = [];

    // Check if ingredients is valid array
    if (typeof r.ingredients === "string") {
      issues.push("ingredients is string not array");
    } else if (Array.isArray(r.ingredients)) {
      for (let i = 0; i < r.ingredients.length; i++) {
        const ing = r.ingredients[i];
        if (typeof ing !== "object" || ing === null) {
          issues.push(`ingredient[${i}] is not object`);
          break;
        }
        if (!ing.item) {
          issues.push(`ingredient[${i}] missing item`);
        }
      }
    }

    // Check if instructions is valid array
    if (typeof r.instructions === "string") {
      issues.push("instructions is string not array");
    } else if (Array.isArray(r.instructions)) {
      for (let i = 0; i < r.instructions.length; i++) {
        const inst = r.instructions[i];
        if (typeof inst !== "object" || inst === null) {
          issues.push(`instruction[${i}] is not object`);
          break;
        }
        if (inst.step === undefined || inst.step === null) {
          issues.push(`instruction[${i}] missing step`);
        }
        if (!inst.text) {
          issues.push(`instruction[${i}] missing text`);
        }
      }
    }

    // Check why_love_it format
    if (Array.isArray(r.why_love_it)) {
      issues.push("why_love_it is array not string");
    }

    if (issues.length > 0) {
      malformed.push({ slug: r.wp_slug, issues: issues.join(", ") });
    }
  }

  console.log("=".repeat(60));
  console.log("DATA STRUCTURE CHECK (first 100 recipes)");
  console.log("=".repeat(60));

  if (malformed.length === 0) {
    console.log("\nNo malformed data found - structure looks valid!");
  } else {
    console.log(`\nFound ${malformed.length} recipes with issues:\n`);
    malformed.forEach((m) => {
      console.log(`  ${m.slug}:`);
      console.log(`    ${m.issues}`);
    });
  }
}

main().catch(console.error);
