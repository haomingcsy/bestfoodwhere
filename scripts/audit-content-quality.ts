/**
 * Content Quality Audit Script
 * Identifies templated, boring, or incorrect content
 */

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
    .select(
      "wp_slug, title, description, why_love_it, ingredients, instructions",
    )
    .order("title");

  console.log("=".repeat(70));
  console.log("CONTENT QUALITY AUDIT");
  console.log("=".repeat(70));

  const issues = {
    wrongDescriptions: [] as any[],
    unfilledTemplates: [] as any[],
    genericTitles: [] as any[],
    lowQualityInstructions: [] as any[],
  };

  for (const r of recipes || []) {
    const slug = r.wp_slug?.toLowerCase() || "";
    const desc = (r.description || "").toLowerCase();
    const title = r.title || "";

    // Check for chicken description on non-chicken recipes
    const isChickenRecipe =
      slug.includes("chicken") ||
      slug.includes("ayam") ||
      slug.includes("satay") ||
      title.toLowerCase().includes("chicken");

    if (desc.includes("chicken") && !isChickenRecipe) {
      issues.wrongDescriptions.push({
        slug: r.wp_slug,
        title: r.title,
        issue: "Wrong food - chicken description on non-chicken dish",
        desc: r.description?.substring(0, 100),
      });
    }

    // Check for pork description on non-pork recipes
    const isPorkRecipe =
      slug.includes("pork") ||
      slug.includes("bacon") ||
      slug.includes("ham") ||
      slug.includes("bak") ||
      slug.includes("char-siew");

    if (desc.includes("pork") && !isPorkRecipe) {
      issues.wrongDescriptions.push({
        slug: r.wp_slug,
        title: r.title,
        issue: "Wrong food - pork description on non-pork dish",
        desc: r.description?.substring(0, 100),
      });
    }

    // Check for unfilled templates
    if (desc.includes("{") || desc.includes("}")) {
      issues.unfilledTemplates.push({
        slug: r.wp_slug,
        desc: r.description?.substring(0, 100),
      });
    }

    // Check for generic/templated titles
    const genericPhrases = [
      "Special Recipe for You",
      "The Ratio Found",
      "Your Family Will Love",
      "Simplified Version",
      "Finally Written Down",
    ];

    for (const phrase of genericPhrases) {
      if (title.includes(phrase)) {
        issues.genericTitles.push({
          slug: r.wp_slug,
          title: r.title,
          phrase,
        });
        break;
      }
    }

    // Check instruction quality - look for very short or repetitive steps
    const instructions = r.instructions || [];
    const shortSteps = instructions.filter(
      (i: any) => (i.text?.length || 0) < 80,
    );
    const genericSteps = instructions.filter(
      (i: any) =>
        i.text?.includes("This step is") ||
        i.text?.includes("This is important") ||
        i.text?.includes("ensures the"),
    );

    if (shortSteps.length > 3 || genericSteps.length > 4) {
      issues.lowQualityInstructions.push({
        slug: r.wp_slug,
        shortSteps: shortSteps.length,
        genericSteps: genericSteps.length,
      });
    }
  }

  // Print results
  console.log(
    "\n1. WRONG DESCRIPTIONS (food mismatch):",
    issues.wrongDescriptions.length,
  );
  console.log("-".repeat(50));
  issues.wrongDescriptions.slice(0, 15).forEach((i) => {
    console.log(`  ${i.slug}: ${i.issue}`);
    console.log(`    "${i.desc}..."`);
  });

  console.log("\n2. UNFILLED TEMPLATES:", issues.unfilledTemplates.length);
  console.log("-".repeat(50));
  issues.unfilledTemplates.forEach((i) => {
    console.log(`  ${i.slug}: "${i.desc}..."`);
  });

  console.log("\n3. GENERIC/BORING TITLES:", issues.genericTitles.length);
  console.log("-".repeat(50));
  issues.genericTitles.slice(0, 15).forEach((i) => {
    console.log(`  ${i.slug}: "${i.title}"`);
  });

  console.log(
    "\n4. LOW QUALITY INSTRUCTIONS:",
    issues.lowQualityInstructions.length,
  );
  console.log("-".repeat(50));
  issues.lowQualityInstructions.slice(0, 10).forEach((i) => {
    console.log(
      `  ${i.slug}: ${i.shortSteps} short steps, ${i.genericSteps} generic phrases`,
    );
  });

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("SUMMARY");
  console.log("=".repeat(70));
  console.log(`Total recipes: ${recipes?.length}`);
  console.log(`Wrong descriptions: ${issues.wrongDescriptions.length}`);
  console.log(`Unfilled templates: ${issues.unfilledTemplates.length}`);
  console.log(`Generic titles: ${issues.genericTitles.length}`);
  console.log(
    `Low quality instructions: ${issues.lowQualityInstructions.length}`,
  );

  const totalIssues =
    issues.wrongDescriptions.length +
    issues.unfilledTemplates.length +
    issues.genericTitles.length +
    issues.lowQualityInstructions.length;
  console.log(`\nTotal issues found: ${totalIssues}`);
}

main().catch(console.error);
