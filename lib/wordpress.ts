import type { WPAuthor, WPCategory, WPMedia, WPPost } from "@/types/wordpress";

const WP_API_URL = "https://bestfoodwhere.sg/wp-json/wp/v2";
const DEFAULT_REVALIDATE_SECONDS = 300;

type QueryValue = string | number | boolean | undefined;
type QueryParams = Record<string, QueryValue>;

function buildUrl(pathname: string, params?: QueryParams) {
  const normalizedPath = pathname.replace(/^\//, "");
  const url = new URL(`${WP_API_URL}/${normalizedPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) return;
      url.searchParams.set(key, String(value));
    });
  }

  return url;
}

async function fetchWordPress<T>(
  pathname: string,
  params?: QueryParams,
): Promise<T> {
  const url = buildUrl(pathname, params);
  const response = await fetch(url.toString(), {
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(
      `WordPress API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

export async function getWordPressPosts(params?: {
  category?: number;
  page?: number;
  perPage?: number;
  search?: string;
}): Promise<WPPost[]> {
  return await fetchWordPress<WPPost[]>("/posts", {
    categories: params?.category,
    page: params?.page,
    per_page: params?.perPage,
    search: params?.search,
  });
}

export async function getWordPressPost(slug: string): Promise<WPPost | null> {
  const posts = await fetchWordPress<WPPost[]>("/posts", {
    slug,
    per_page: 1,
  });

  return posts[0] ?? null;
}

export async function getWordPressCategories(): Promise<WPCategory[]> {
  return await fetchWordPress<WPCategory[]>("/categories", {
    per_page: 100,
  });
}

export async function getWordPressCategory(
  slug: string,
): Promise<WPCategory | null> {
  const categories = await fetchWordPress<WPCategory[]>("/categories", {
    slug,
    per_page: 1,
  });

  return categories[0] ?? null;
}

// Get author by ID
export async function getWordPressAuthor(id: number): Promise<WPAuthor | null> {
  try {
    return await fetchWordPress<WPAuthor>(`/users/${id}`);
  } catch {
    return null;
  }
}

// Get media (image) by ID
export async function getWordPressMedia(id: number): Promise<WPMedia | null> {
  try {
    return await fetchWordPress<WPMedia>(`/media/${id}`);
  } catch {
    return null;
  }
}

// Get posts by category ID
export async function getRecipesByCategory(
  categoryId: number,
  params?: { page?: number; perPage?: number },
): Promise<WPPost[]> {
  return getWordPressPosts({
    category: categoryId,
    page: params?.page,
    perPage: params?.perPage ?? 12,
  });
}
