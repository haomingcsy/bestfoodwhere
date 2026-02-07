"use client";

import { extractSection } from "@/lib/recipes";

interface RecipeDonenessTipsProps {
  content: string;
  title: string;
  donenessTips?: string;
}

export function RecipeDonenessTips({
  content,
  title,
  donenessTips,
}: RecipeDonenessTipsProps) {
  // Use enriched content if available
  if (donenessTips) {
    return (
      <section id="doneness" className="scroll-mt-28">
        <h2 className="font-heading text-2xl font-bold text-gray-900">
          How Do I Know It&apos;s Ready?
        </h2>

        <div className="mt-4 rounded-xl bg-green-50 p-5">
          <p className="text-gray-700 leading-relaxed">{donenessTips}</p>
        </div>
      </section>
    );
  }

  // Fall back to WordPress content parsing
  let tipsContent = extractSection(content, "How Do I Know");
  if (!tipsContent) {
    tipsContent = extractSection(content, "When It's Ready");
  }
  if (!tipsContent) {
    tipsContent = extractSection(content, "Tips");
  }

  // Generate helpful tips if none found
  const defaultTips = `
    <ul>
      <li>The dish should be heated through and any proteins should reach safe internal temperatures.</li>
      <li>Trust your senses – it should look appetizing and smell delicious.</li>
      <li>Taste and adjust seasoning as needed before serving.</li>
    </ul>
  `;

  return (
    <section id="doneness" className="scroll-mt-28">
      <h2 className="font-heading text-2xl font-bold text-gray-900">
        How Do I Know It&apos;s Ready?
      </h2>

      <div
        className="prose prose-gray mt-4 max-w-none prose-ul:my-2 prose-li:my-0 prose-li:text-gray-600"
        dangerouslySetInnerHTML={{ __html: tipsContent || defaultTips }}
      />
    </section>
  );
}
