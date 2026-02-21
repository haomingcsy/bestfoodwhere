/**
 * Recipe Content Validation & Auto-Fix
 *
 * Automatically validates and fixes common formatting issues in recipe content.
 * This ensures consistent formatting across all recipes without manual intervention.
 */

/**
 * Validates and fixes why_love_it bullet formatting
 * Expected format: "• **Bold phrase** – description here"
 *
 * Fixes:
 * - Alternating bold/description lines → Merged into single bullets
 * - Missing bullet characters → Adds "•"
 * - Lowercase starts → Capitalizes
 * - Inconsistent dashes → Standardizes to "–"
 */
export function fixBulletFormatting(
  text: string | string[] | null,
): string | null {
  if (!text) return null;

  // Handle array input (Gemini sometimes returns arrays instead of strings)
  let textStr: string;
  if (Array.isArray(text)) {
    // Convert array to bullet-formatted string
    textStr = text
      .map((item) => (typeof item === "string" ? item : String(item)))
      .join("\n");
  } else if (typeof text !== "string") {
    // Handle any other non-string types
    textStr = String(text);
  } else {
    textStr = text;
  }

  // Already properly formatted? Return as-is
  const lines = textStr.split("\n").filter((l) => l.trim());
  let needsFix = false;

  for (const line of lines) {
    const content = line.trim().replace(/^[•\-]\s*/, "");
    // Check if has bold markers
    if (!content.includes("**")) {
      needsFix = true;
      break;
    }
    // Check if starts lowercase
    const textStart = content.replace(/^\*\*/, "");
    if (textStart && /^[a-z]/.test(textStart)) {
      needsFix = true;
      break;
    }
  }

  if (!needsFix) return textStr;

  // Fix alternating bold/description pattern
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim().replace(/^[•\-]\s*/, "");

    // Check if this is a bold-only line followed by description
    const isBoldOnly = /^\*\*[^*]+\*\*$/.test(line);
    const nextLine = lines[i + 1]?.trim().replace(/^[•\-]\s*/, "") || "";
    const nextHasNoBold = nextLine && !nextLine.includes("**");

    if (isBoldOnly && nextHasNoBold) {
      // Merge bold line with next description line
      const boldPart = line;
      let descPart = nextLine;
      // Capitalize first letter of description
      descPart = descPart.charAt(0).toUpperCase() + descPart.slice(1);
      result.push(`• ${boldPart} – ${descPart}`);
      i++; // Skip next line since we merged it
    } else if (line.includes("**")) {
      // Line already has bold, ensure proper bullet
      result.push(`• ${line}`);
    } else {
      // Standalone description without bold - try to make it proper
      const capitalized = line.charAt(0).toUpperCase() + line.slice(1);
      result.push(`• ${capitalized}`);
    }
  }

  return result.join("\n");
}

/**
 * Validates bullet formatting and returns issues found
 */
export function validateBulletFormatting(text: string | null): string[] {
  if (!text) return [];

  const lines = text.split("\n").filter((l) => l.trim());
  const issues: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const content = line.replace(/^[•\-]\s*/, "");

    // Check 1: Should have **bold** markers
    if (!content.includes("**")) {
      issues.push(`Line ${i + 1}: Missing **bold** markers`);
    }

    // Check 2: Should start with uppercase
    const textStart = content.replace(/^\*\*/, "");
    if (textStart && /^[a-z]/.test(textStart)) {
      issues.push(`Line ${i + 1}: Starts with lowercase`);
    }

    // Check 3: Should have closing **
    const boldCount = (content.match(/\*\*/g) || []).length;
    if (boldCount === 1) {
      issues.push(`Line ${i + 1}: Unclosed bold marker`);
    }
  }

  return issues;
}

/**
 * Validates and auto-fixes a complete recipe content object before saving
 */
export function validateAndFixRecipeContent<
  T extends { why_love_it?: string | null },
>(content: T): T {
  const fixed = { ...content };

  // Auto-fix why_love_it formatting
  if (fixed.why_love_it) {
    fixed.why_love_it = fixBulletFormatting(fixed.why_love_it);
  }

  return fixed;
}
