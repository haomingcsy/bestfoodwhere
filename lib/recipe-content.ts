import { getSupabaseServerClient } from "./supabase/client";
import type {
  RecipeContentRecord,
  RecipeContentInput,
} from "@/types/recipe-content";

/**
 * Get enriched recipe content from Supabase by WordPress slug
 * Only returns content for published recipes (unpublished recipes fall back to WordPress)
 * @param wpSlug - The WordPress slug of the recipe
 * @param includeUnpublished - If true, return content regardless of publish status (for admin/preview)
 */
export async function getRecipeContent(
  wpSlug: string,
  includeUnpublished = false,
): Promise<RecipeContentRecord | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  let query = supabase.from("recipe_content").select("*").eq("wp_slug", wpSlug);

  // Only filter by publish_status if not including unpublished
  if (!includeUnpublished) {
    query = query.eq("publish_status", "published");
  }

  const { data, error } = await query.single();

  if (error || !data) return null;

  return data as RecipeContentRecord;
}

/**
 * Check if enriched content exists for a recipe
 */
export async function hasRecipeContent(wpSlug: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;

  const { count, error } = await supabase
    .from("recipe_content")
    .select("id", { count: "exact", head: true })
    .eq("wp_slug", wpSlug);

  return !error && (count ?? 0) > 0;
}

/**
 * Create or update recipe content
 */
export async function upsertRecipeContent(
  input: RecipeContentInput,
): Promise<RecipeContentRecord | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("recipe_content")
    .upsert(
      {
        ...input,
        generated_at: new Date().toISOString(),
      },
      {
        onConflict: "wp_slug",
      },
    )
    .select()
    .single();

  if (error) {
    console.error("Error upserting recipe content:", error);
    return null;
  }

  return data as RecipeContentRecord;
}

/**
 * Get all recipes that have enriched content and are published
 * @param includeScheduled - If true, also include scheduled recipes (for admin views)
 */
export async function getEnrichedRecipeSlugs(
  includeScheduled = false,
): Promise<string[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("recipe_content")
    .select("wp_slug")
    .order("created_at", { ascending: false });

  // Filter by publish status
  if (includeScheduled) {
    query = query.in("publish_status", ["published", "scheduled"]);
  } else {
    query = query.eq("publish_status", "published");
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((row) => row.wp_slug);
}

/**
 * Get recipes that need content generation (no enriched content)
 */
export async function getRecipesNeedingContent(
  existingSlugs: string[],
): Promise<string[]> {
  const enrichedSlugs = await getEnrichedRecipeSlugs();
  return existingSlugs.filter((slug) => !enrichedSlugs.includes(slug));
}

/**
 * Get enriched titles and descriptions for a list of slugs
 * Returns a map of slug -> { title, description }
 * Only returns data for published recipes (to prevent showing unpublished content)
 */
export async function getEnrichedTitles(
  slugs: string[],
): Promise<Map<string, { title: string; description?: string }>> {
  const supabase = getSupabaseServerClient();
  const result = new Map<string, { title: string; description?: string }>();

  if (!supabase || slugs.length === 0) return result;

  const { data, error } = await supabase
    .from("recipe_content")
    .select("wp_slug, title, description")
    .in("wp_slug", slugs)
    .eq("publish_status", "published");

  if (error || !data) return result;

  for (const row of data) {
    result.set(row.wp_slug, {
      title: row.title,
      description: row.description ?? undefined,
    });
  }

  return result;
}

/**
 * Mark a recipe as verified after manual review
 */
export async function markRecipeVerified(wpSlug: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("recipe_content")
    .update({
      is_verified: true,
      last_verified: new Date().toISOString(),
    })
    .eq("wp_slug", wpSlug);

  return !error;
}

/**
 * Get scheduling statistics for recipes
 */
export async function getRecipeSchedulingStats(): Promise<{
  draft: number;
  scheduled: number;
  published: number;
  total: number;
} | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("recipe_content")
    .select("publish_status");

  if (error || !data) return null;

  const stats = {
    draft: 0,
    scheduled: 0,
    published: 0,
    total: data.length,
  };

  for (const row of data) {
    const status = row.publish_status as keyof typeof stats;
    if (status in stats && status !== "total") {
      stats[status]++;
    }
  }

  return stats;
}

/**
 * Get upcoming scheduled recipes
 */
export async function getUpcomingScheduledRecipes(
  limit = 10,
): Promise<Array<{ wp_slug: string; title: string; scheduled_date: string }>> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("recipe_content")
    .select("wp_slug, title, scheduled_date")
    .eq("publish_status", "scheduled")
    .order("scheduled_date", { ascending: true })
    .limit(limit);

  if (error || !data) return [];

  return data as Array<{
    wp_slug: string;
    title: string;
    scheduled_date: string;
  }>;
}
