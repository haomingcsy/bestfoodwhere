"use client";

import Image from "next/image";
import { extractSection } from "@/lib/recipes";
import { KITCHEN_EQUIPMENT } from "@/lib/affiliates/kitchen-equipment";
import type { RecipeInstruction } from "@/types/recipe";

interface RecipeInstructionsProps {
  content: string;
  instructions?: RecipeInstruction[];
}

// Equipment keywords to match and their affiliate links
const EQUIPMENT_LINKS: Array<{
  keywords: string[];
  name: string;
  link: string;
}> = [
  {
    keywords: ["wok"],
    name: "wok",
    link: KITCHEN_EQUIPMENT.wok.link,
  },
  {
    keywords: ["skillet", "frying pan", "pan"],
    name: "skillet",
    link: KITCHEN_EQUIPMENT.castIronSkillet.link,
  },
  {
    keywords: ["dutch oven"],
    name: "Dutch oven",
    link: KITCHEN_EQUIPMENT.dutchOven.link,
  },
  {
    keywords: ["knife", "cleaver"],
    name: "knife",
    link: KITCHEN_EQUIPMENT.chefKnife.link,
  },
  {
    keywords: ["cutting board"],
    name: "cutting board",
    link: KITCHEN_EQUIPMENT.cuttingBoard.link,
  },
  {
    keywords: ["thermometer"],
    name: "thermometer",
    link: KITCHEN_EQUIPMENT.thermometer.link,
  },
  {
    keywords: ["stock pot", "stockpot"],
    name: "stock pot",
    link: KITCHEN_EQUIPMENT.stockPot.link,
  },
  {
    keywords: ["pressure cooker", "instant pot"],
    name: "pressure cooker",
    link: KITCHEN_EQUIPMENT.pressureCooker.link,
  },
  {
    keywords: ["rice cooker"],
    name: "rice cooker",
    link: KITCHEN_EQUIPMENT.riceCooker.link,
  },
  {
    keywords: ["blender"],
    name: "blender",
    link: KITCHEN_EQUIPMENT.immersionBlender.link,
  },
  {
    keywords: ["food processor"],
    name: "food processor",
    link: KITCHEN_EQUIPMENT.foodProcessor.link,
  },
  {
    keywords: ["steamer", "bamboo steamer"],
    name: "steamer",
    link: KITCHEN_EQUIPMENT.bambooSteamer.link,
  },
  {
    keywords: ["tongs"],
    name: "tongs",
    link: KITCHEN_EQUIPMENT.tongs.link,
  },
  {
    keywords: ["spatula"],
    name: "spatula",
    link: KITCHEN_EQUIPMENT.spatula.link,
  },
  {
    keywords: ["whisk"],
    name: "whisk",
    link: KITCHEN_EQUIPMENT.whisk.link,
  },
  {
    keywords: ["colander", "strainer"],
    name: "colander",
    link: KITCHEN_EQUIPMENT.colander.link,
  },
  {
    keywords: ["mixing bowl"],
    name: "mixing bowl",
    link: KITCHEN_EQUIPMENT.mixingBowls.link,
  },
  {
    keywords: ["mortar", "pestle"],
    name: "mortar and pestle",
    link: KITCHEN_EQUIPMENT.mortarPestle.link,
  },
  {
    keywords: ["mandoline", "slicer"],
    name: "mandoline",
    link: KITCHEN_EQUIPMENT.mandoline.link,
  },
  {
    keywords: ["microplane", "zester", "grater"],
    name: "microplane",
    link: KITCHEN_EQUIPMENT.microplane.link,
  },
];

// Track which links have been added to avoid duplicates per render
let addedLinks: Set<string> = new Set();

/**
 * Parse instruction text and add affiliate links to equipment mentions
 * Only links each equipment type once per instruction set
 */
function parseInstructionWithLinks(
  text: string,
  isFirstOccurrence: (keyword: string) => boolean,
): React.ReactNode {
  // Build regex pattern from all keywords
  const allKeywords = EQUIPMENT_LINKS.flatMap((eq) => eq.keywords);
  const pattern = new RegExp(`\\b(${allKeywords.join("|")})s?\\b`, "gi");

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  // Reset regex
  pattern.lastIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    const matchedWord = match[0];
    const matchedLower = match[1].toLowerCase();

    // Find the equipment config for this keyword
    const equipment = EQUIPMENT_LINKS.find((eq) =>
      eq.keywords.some(
        (k) => matchedLower.includes(k) || k.includes(matchedLower),
      ),
    );

    if (equipment && isFirstOccurrence(equipment.name)) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add linked text
      parts.push(
        <a
          key={`${equipment.name}-${match.index}`}
          href={equipment.link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="text-orange-600 underline decoration-orange-300 underline-offset-2 hover:text-orange-700 hover:decoration-orange-500"
          title={`Shop for ${equipment.name} on Amazon`}
        >
          {matchedWord}
        </a>,
      );

      lastIndex = match.index + matchedWord.length;
    }
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export function RecipeInstructions({
  content,
  instructions,
}: RecipeInstructionsProps) {
  // Reset tracking for each render
  addedLinks = new Set();

  // Helper to track first occurrence
  const isFirstOccurrence = (keyword: string): boolean => {
    if (addedLinks.has(keyword)) {
      return false;
    }
    addedLinks.add(keyword);
    return true;
  };

  // Use structured instructions if available
  if (instructions && instructions.length > 0) {
    return (
      <section id="instructions" className="scroll-mt-28">
        <h2 className="font-heading text-2xl font-bold text-gray-900">
          Step-by-Step Instructions
        </h2>

        <ol className="mt-6 space-y-8">
          {instructions.map((instruction) => (
            <li
              key={instruction.step}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                {instruction.step}
              </div>
              <div className="flex-1">
                {/* Step image */}
                {instruction.imageUrl && (
                  <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl sm:aspect-video sm:max-w-md">
                    <Image
                      src={instruction.imageUrl}
                      alt={`Step ${instruction.step}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 448px"
                    />
                  </div>
                )}
                <p className="text-gray-700">
                  {parseInstructionWithLinks(
                    instruction.text,
                    isFirstOccurrence,
                  )}
                </p>
                {instruction.timeMinutes && (
                  <p className="mt-1 text-sm text-gray-500">
                    ~{instruction.timeMinutes} min
                  </p>
                )}
                {instruction.tip && (
                  <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    <span className="font-semibold">Tip:</span>{" "}
                    {instruction.tip}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  // Fall back to WordPress content parsing
  const instructionsSection = extractSection(content, "Step-by-Step");

  const isPlaceholder =
    instructionsSection.toLowerCase().includes("see recipe card") ||
    instructionsSection.toLowerCase().includes("recipe card for");

  return (
    <section id="instructions" className="scroll-mt-28">
      <h2 className="font-heading text-2xl font-bold text-gray-900">
        Step-by-Step Instructions
      </h2>

      {isPlaceholder || !instructionsSection ? (
        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            See recipe card for step-by-step instructions
          </p>
        </div>
      ) : (
        <div
          className="prose prose-gray mt-4 max-w-none prose-ol:my-2 prose-li:my-1 prose-li:text-gray-600"
          dangerouslySetInnerHTML={{ __html: instructionsSection }}
        />
      )}
    </section>
  );
}
