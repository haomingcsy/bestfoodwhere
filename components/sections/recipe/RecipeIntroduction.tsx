"use client";

import { extractSection } from "@/lib/recipes";

interface RecipeIntroductionProps {
  content: string;
  title: string;
  introduction?: string;
  whyLoveIt?: string;
}

// Simple markdown parser for bold text and bullet points
function parseSimpleMarkdown(text: string): string {
  // Split by newlines first
  let lines = text.split("\n").filter((line) => line.trim());

  // If single line with inline bullets, try to split
  if (lines.length === 1) {
    // Try splitting by " • " pattern
    if (text.includes(" • ")) {
      lines = text.split(/\s*•\s*/).filter((s) => s.trim());
    }
    // Try splitting by " - **" pattern
    else if (text.includes(" - **")) {
      lines = text.split(/\s+-\s+(?=\*\*)/).filter((s) => s.trim());
    }
  }

  // Check if we have bullet items
  const hasBullets =
    lines.length > 1 ||
    lines.some((l) => l.trim().startsWith("•") || l.trim().startsWith("- "));

  if (hasBullets && lines.length > 0) {
    const listItems = lines
      .map((line) => {
        let content = line.trim();
        // Remove leading bullet characters
        if (content.startsWith("•")) content = content.substring(1).trim();
        if (content.startsWith("- ")) content = content.substring(2).trim();
        // Convert **bold** to <strong>
        content = content.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        return `<li class="mb-2">${content}</li>`;
      })
      .join("\n");
    return `<ul class="list-none space-y-1 m-0 p-0">${listItems}</ul>`;
  }

  // Just convert bold text
  return text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

export function RecipeIntroduction({
  content,
  title,
  introduction,
  whyLoveIt,
}: RecipeIntroductionProps) {
  // Use enriched content if available
  if (introduction || whyLoveIt) {
    return (
      <section id="introduction" className="scroll-mt-28">
        <h2 className="font-heading text-2xl font-bold text-gray-900">
          Why I Love This Recipe
        </h2>

        <div className="mt-4 space-y-4">
          {introduction && (
            <p className="text-gray-600 leading-relaxed">{introduction}</p>
          )}

          {whyLoveIt && (
            <div className="rounded-xl bg-orange-50 p-4">
              <ul className="space-y-2 m-0 p-0 list-none">
                {whyLoveIt
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((line, idx) => {
                    let content = line.trim();
                    // Remove bullet character
                    if (content.startsWith("•"))
                      content = content.substring(1).trim();
                    if (content.startsWith("- "))
                      content = content.substring(2).trim();
                    // Convert **bold** to JSX
                    const parts = content.split(/\*\*([^*]+)\*\*/g);
                    return (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-orange-900"
                      >
                        <span className="text-orange-500 mt-1">•</span>
                        <span className="font-medium">
                          {parts.map((part, i) =>
                            i % 2 === 1 ? (
                              <strong key={i}>{part}</strong>
                            ) : (
                              part
                            ),
                          )}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Fall back to WordPress content parsing
  let introContent = extractSection(content, "Why I Love");
  if (!introContent) {
    introContent = extractSection(content, "What is");
  }

  // If no specific section found, get the first paragraph before any H2
  if (!introContent) {
    const firstH2Index = content.indexOf("<h2");
    if (firstH2Index > 0) {
      introContent = content.substring(0, firstH2Index);
    }
  }

  // Clean up the content
  const cleanContent =
    introContent ||
    `<p>Discover how to make this delicious ${title} at home. This recipe is perfect for any occasion and is sure to impress your family and friends.</p>`;

  return (
    <section id="introduction" className="scroll-mt-28">
      <h2 className="font-heading text-2xl font-bold text-gray-900">
        Why I Love This Recipe
      </h2>
      <div
        className="prose prose-gray mt-4 max-w-none prose-p:text-gray-600 prose-p:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />
    </section>
  );
}
