"use client";

import { extractSection } from "@/lib/recipes";

interface RecipeFinalThoughtsProps {
  content: string;
  title: string;
}

export function RecipeFinalThoughts({
  content,
  title,
}: RecipeFinalThoughtsProps) {
  let finalContent = extractSection(content, "Final Thoughts");
  if (!finalContent) {
    finalContent = extractSection(content, "Conclusion");
  }

  // Generate default if none found
  const defaultContent = `
    <p>
      I hope you enjoy making this ${title} as much as I do! It's a wonderful dish
      that's sure to become a favorite in your kitchen. If you try this recipe,
      I'd love to hear how it turned out – feel free to share your experience
      and any variations you tried!
    </p>
  `;

  return (
    <section id="final-thoughts" className="scroll-mt-28">
      <h2 className="font-heading text-2xl font-bold text-gray-900">
        Final Thoughts
      </h2>

      <div
        className="prose prose-gray mt-4 max-w-none prose-p:text-gray-600 prose-p:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: finalContent || defaultContent }}
      />
    </section>
  );
}
