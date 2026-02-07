import { getEnrichedTitles } from "./recipe-content";
import {
  getSupabaseRecipe,
  getRecipeFeaturedImage,
  convertToRecipeData,
} from "./supabase-recipes";

// Re-export for convenience
export { getEnrichedTitles };
import type { RecipeData } from "@/types/recipe";

/**
 * Get a single recipe by slug
 * Fetches directly from Supabase - no WordPress dependency
 */
export async function getRecipe(slug: string): Promise<RecipeData | null> {
  // Fetch recipe content and featured image in parallel
  const [recipeContent, featuredImageUrl] = await Promise.all([
    getSupabaseRecipe(slug),
    getRecipeFeaturedImage(slug),
  ]);

  if (!recipeContent) return null;

  // Convert to RecipeData format with featured image
  return convertToRecipeData(recipeContent, featuredImageUrl);
}

/**
 * Strip HTML tags from string
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

/**
 * Extract a section from HTML content by heading text
 * Finds content between the matching H2 and the next H2 (or end of content)
 */
export function extractSection(html: string, headingText: string): string {
  // Match H2 containing the heading text and capture content until next H2, aside, script, or structural tags
  const regex = new RegExp(
    `<h2[^>]*>[^<]*${escapeRegex(headingText)}[^<]*</h2>([\\s\\S]*?)(?=<h2|</main>|<aside|<script|$)`,
    "i",
  );
  const match = html.match(regex);
  return match?.[1]?.trim() ?? "";
}

/**
 * Extract all H2 sections from HTML content
 */
export function extractAllSections(
  html: string,
): Array<{ heading: string; content: string }> {
  const sections: Array<{ heading: string; content: string }> = [];
  const regex = /<h2[^>]*>([^<]*)<\/h2>([\s\S]*?)(?=<h2|$)/gi;

  let match;
  while ((match = regex.exec(html)) !== null) {
    sections.push({
      heading: stripHtml(match[1]),
      content: match[2]?.trim() ?? "",
    });
  }

  return sections;
}

/**
 * Extract FAQ items from HTML content
 * Expects H3 for questions followed by paragraph answers
 */
export function extractFAQ(
  html: string,
): Array<{ question: string; answer: string }> {
  const faqSection = extractSection(html, "FAQ");
  if (!faqSection) return [];

  const faqs: Array<{ question: string; answer: string }> = [];
  // Match H3 (question) followed by content until next H3 or end
  const regex = /<h3[^>]*>([^<]*)<\/h3>([\s\S]*?)(?=<h3|$)/gi;

  let match;
  while ((match = regex.exec(faqSection)) !== null) {
    const question = stripHtml(match[1]);
    const answer = stripHtml(match[2]);
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  return faqs;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Format time in minutes to human-readable string
 */
export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} hr ${mins} mins` : `${hours} hr`;
}

/**
 * Format date to human-readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
