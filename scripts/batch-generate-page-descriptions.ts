/**
 * Generate AI SEO descriptions for mall, cuisine, and dining pages.
 * Saves results to lib/seo/ai-page-descriptions.json
 *
 * Usage:
 *   npx tsx scripts/batch-generate-page-descriptions.ts
 *   npx tsx scripts/batch-generate-page-descriptions.ts --dry-run
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DRY_RUN = process.argv.includes("--dry-run");
const OUTPUT_PATH = path.join(__dirname, "../lib/seo/ai-page-descriptions.json");

const BANNED_OPENERS = [
  "Discover", "Explore", "Experience", "Craving", "Hungry",
  "Indulge", "Step", "Savor", "Dive", "Treat yourself",
  "Welcome to", "Looking for", "Taste the", "Delight in",
  "Embark", "Unleash", "Elevate", "Immerse",
];

const MALL_STYLES = [
  "Start with the mall name as subject (e.g. '{name} packs…', '{name} is home to…')",
  "Open with a specific restaurant or dish found at this mall.",
  "Lead with the area/neighborhood vibe.",
  "Start with a number (e.g. 'With 50+ restaurants…', 'Over 30 cuisines…')",
  "Open with what makes this mall's food scene different from others.",
  "Start with an action directed at the reader (Grab, Tuck into, Head to, etc.).",
  "Lead with a foodie insider tip or hidden gem angle.",
  "Open with when to visit (lunch crowd, after-work, weekend brunch, etc.).",
];

const CUISINE_STYLES = [
  "Start with a signature dish of this cuisine as the hook.",
  "Open with the cuisine's heritage or origin story.",
  "Lead with a bold claim (e.g. 'Singapore's best…', 'The ultimate guide…').",
  "Start with a sensory word (aromatic, fiery, silky, crispy, etc.).",
  "Open with a specific number (e.g. 'Over X spots…', 'X hidden gems…').",
  "Lead with what makes this cuisine stand out in Singapore.",
  "Start from the reader's craving (e.g. 'When only real ramen will do…').",
];

interface PageDescriptions {
  malls: Record<string, string>;
  cuisines: Record<string, string>;
  dining: Record<string, string>;
}

async function callAPI(content: string): Promise<string> {
  for (let retry = 0; retry < 3; retry++) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        temperature: 1,
        messages: [{ role: "user", content }],
      });
      let desc = (response.content[0] as any).text.trim();
      if (desc.startsWith('"') && desc.endsWith('"')) desc = desc.slice(1, -1);
      return desc;
    } catch (err: any) {
      if (err.status === 429 || err.status === 529) {
        const wait = (retry + 1) * 5000;
        console.log(`    API ${err.status}, waiting ${wait / 1000}s...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
  throw new Error("API failed after 3 retries");
}

async function generateDescription(prompt: string): Promise<string> {
  if (DRY_RUN) return "[dry-run]";

  let desc = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    let retryHint = "";
    if (attempt > 0 && desc.length > 0) {
      const lenOk = desc.length >= 130 && desc.length <= 160;
      const firstWord = desc.split(/\s/)[0];
      const openerBanned = BANNED_OPENERS.some(b => desc.toLowerCase().startsWith(b.toLowerCase()));
      if (!lenOk) retryHint += ` Previous attempt was ${desc.length} characters — MUST be 140-155.`;
      if (openerBanned) retryHint += ` You started with "${firstWord}" which is BANNED. Use a completely different opening.`;
    }

    desc = await callAPI(prompt + retryHint);

    const lenOk = desc.length >= 130 && desc.length <= 160;
    const openerOk = !BANNED_OPENERS.some(b => desc.toLowerCase().startsWith(b.toLowerCase()));
    if (lenOk && openerOk) return desc;
  }
  return desc;
}

async function generateMallDescriptions(): Promise<Record<string, string>> {
  console.log("\n=== MALLS ===");

  const { data: malls } = await supabase
    .from("shopping_malls")
    .select("slug, name, region, address, description")
    .eq("is_active", true)
    .order("slug");

  if (!malls) { console.log("No malls found"); return {}; }

  const results: Record<string, string> = {};

  for (let i = 0; i < malls.length; i++) {
    const mall = malls[i];
    // Get restaurant count and top restaurants
    const { data: restaurants } = await supabase
      .from("mall_restaurants")
      .select("name, rating, cuisines")
      .eq("mall_id", mall.slug)
      .eq("is_active", true)
      .order("rating", { ascending: false })
      .limit(5);

    const restCount = restaurants?.length || 0;
    const topNames = (restaurants || []).slice(0, 3).map(r => r.name);
    const cuisines = [...new Set((restaurants || []).flatMap(r =>
      Array.isArray(r.cuisines) ? r.cuisines : (r.cuisines || "").split(",").map((s: string) => s.trim())
    ).filter(Boolean))].slice(0, 5);

    const style = MALL_STYLES[i % MALL_STYLES.length].replace("{name}", mall.name);

    const prompt = `Write a meta description for ${mall.name} shopping mall food guide in Singapore.

About: Shopping mall in ${mall.region || "Singapore"}. ${mall.address || ""}
${restCount ? `Has ${restCount}+ restaurants` : ""}${topNames.length ? ` including ${topNames.join(", ")}` : ""}.
${cuisines.length ? `Cuisines: ${cuisines.join(", ")}.` : ""}

WRITING STYLE (you MUST follow this): ${style}

Goal: Make people want to check out the food options at this mall.
Tone: Playful and fun.
Include: What makes this mall's food scene special, variety of options, and a soft CTA.
Rules:
- MUST be between 140-155 characters (count carefully, this is strict)
- NO emojis
- BANNED first words: ${BANNED_OPENERS.join(", ")}. Do NOT start with any of these.
- Be specific to THIS mall — mention actual restaurants, cuisines, or what makes it different.
Return ONLY the meta description text, nothing else.`;

    const desc = await generateDescription(prompt);
    results[mall.slug] = desc;
    console.log(`  ✓ ${mall.slug} (${desc.length}c): ${desc}`);
    await new Promise(r => setTimeout(r, 50));
  }

  return results;
}

async function generateCuisineDescriptions(): Promise<Record<string, string>> {
  console.log("\n=== CUISINES ===");

  // Cuisine slugs from the static data
  const cuisineSlugs = [
    "chinese", "japanese", "korean", "thai", "indian", "malay",
    "western", "italian", "french", "mexican", "vietnamese",
    "indonesian", "peranakan", "mediterranean", "middle-eastern",
    "taiwanese", "american", "fast-food", "halal"
  ];

  const results: Record<string, string> = {};

  for (let i = 0; i < cuisineSlugs.length; i++) {
    const slug = cuisineSlugs[i];
    const name = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    // Get restaurant count for this cuisine
    const { count } = await supabase
      .from("mall_restaurants")
      .select("*", { count: "exact", head: true })
      .contains("cuisines", [name]);

    const style = CUISINE_STYLES[i % CUISINE_STYLES.length];

    const prompt = `Write a meta description for "${name} Restaurants in Singapore" guide page.

About: A directory of ${count || "many"} ${name} restaurants across Singapore's shopping malls.

WRITING STYLE (you MUST follow this): ${style}

Goal: Help people find the best ${name} food in Singapore.
Tone: Playful and fun, appetizing.
Include: What makes ${name} food special, variety, and a soft CTA.
Rules:
- MUST be between 140-155 characters (count carefully, this is strict)
- NO emojis
- BANNED first words: ${BANNED_OPENERS.join(", ")}. Do NOT start with any of these.
- Be specific to ${name} cuisine — mention signature dishes, flavors, or cooking styles.
Return ONLY the meta description text, nothing else.`;

    const desc = await generateDescription(prompt);
    results[slug] = desc;
    console.log(`  ✓ ${slug} (${desc.length}c): ${desc}`);
    await new Promise(r => setTimeout(r, 50));
  }

  return results;
}

async function generateDiningDescriptions(): Promise<Record<string, string>> {
  console.log("\n=== DINING STYLES ===");

  const styles = [
    { slug: "fine-dining", name: "Fine Dining" },
    { slug: "casual-dining", name: "Casual Dining" },
    { slug: "quick-bites", name: "Quick Bites" },
    { slug: "late-night", name: "Late Night" },
  ];

  const results: Record<string, string> = {};

  const DINING_STYLES = [
    "Start with what makes this dining style unique in Singapore.",
    "Open with a specific scenario (e.g. 'After a long day…', 'When the clock strikes midnight…').",
    "Lead with a bold claim about Singapore's dining scene.",
    "Start with a number or statistic about this category.",
  ];

  for (let i = 0; i < styles.length; i++) {
    const style = styles[i];
    const writeStyle = DINING_STYLES[i % DINING_STYLES.length];

    const prompt = `Write a meta description for "${style.name} Restaurants in Singapore" guide page.

About: A directory of ${style.name.toLowerCase()} restaurants across Singapore.

WRITING STYLE (you MUST follow this): ${writeStyle}

Goal: Help people find ${style.name.toLowerCase()} spots in Singapore.
Tone: Playful and fun.
Include: What makes ${style.name.toLowerCase()} dining special, and a soft CTA.
Rules:
- MUST be between 140-155 characters (count carefully, this is strict)
- NO emojis
- BANNED first words: ${BANNED_OPENERS.join(", ")}. Do NOT start with any of these.
- Be specific — mention what defines ${style.name.toLowerCase()} dining in Singapore.
Return ONLY the meta description text, nothing else.`;

    const desc = await generateDescription(prompt);
    results[style.slug] = desc;
    console.log(`  ✓ ${style.slug} (${desc.length}c): ${desc}`);
    await new Promise(r => setTimeout(r, 50));
  }

  return results;
}

async function run() {
  console.log(`=== Page Description Generator (${DRY_RUN ? "DRY RUN" : "LIVE"}) ===`);

  const descriptions: PageDescriptions = {
    malls: await generateMallDescriptions(),
    cuisines: await generateCuisineDescriptions(),
    dining: await generateDiningDescriptions(),
  };

  if (!DRY_RUN) {
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(descriptions, null, 2));
    console.log(`\nSaved to ${OUTPUT_PATH}`);
  }

  console.log(`\nDone! Malls: ${Object.keys(descriptions.malls).length}, Cuisines: ${Object.keys(descriptions.cuisines).length}, Dining: ${Object.keys(descriptions.dining).length}`);
}

run();
