/**
 * Migrate WordPress posts and categories to Supabase
 * Run with: npx tsx scripts/migrate-wordpress.ts
 *
 * IMPORTANT: Run this BEFORE WordPress access is lost!
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load env
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (key && valueParts.length > 0) {
      let value = valueParts.join("=");
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const WP_API_URL = "https://bestfoodwhere.sg/wp-json/wp/v2";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface WPCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  date: string;
  categories: number[];
}

interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
}

async function fetchAllCategories(): Promise<WPCategory[]> {
  console.log("📁 Fetching categories...");
  const response = await fetch(`${WP_API_URL}/categories?per_page=100`);
  const categories = await response.json();
  console.log(`  Found ${categories.length} categories`);
  return categories;
}

async function fetchAllPosts(): Promise<WPPost[]> {
  console.log("📝 Fetching all posts...");
  const allPosts: WPPost[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${WP_API_URL}/posts?per_page=100&page=${page}`,
    );

    if (!response.ok) {
      hasMore = false;
      break;
    }

    const posts = await response.json();
    if (posts.length === 0) {
      hasMore = false;
    } else {
      allPosts.push(...posts);
      console.log(
        `  Page ${page}: ${posts.length} posts (total: ${allPosts.length})`,
      );
      page++;
      await new Promise((r) => setTimeout(r, 300)); // Rate limit
    }
  }

  return allPosts;
}

async function fetchMedia(mediaId: number): Promise<WPMedia | null> {
  if (!mediaId) return null;
  try {
    const response = await fetch(`${WP_API_URL}/media/${mediaId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function downloadAndUploadImage(
  url: string,
  filename: string,
): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    const storagePath = `recipes/${filename}`;

    // Delete if exists
    await supabase.storage.from("hero-images").remove([storagePath]);

    // Upload
    const contentType = url.includes(".png") ? "image/png" : "image/jpeg";
    const { error } = await supabase.storage
      .from("hero-images")
      .upload(storagePath, buffer, { contentType, upsert: true });

    if (error) {
      console.error(`  Failed to upload ${filename}:`, error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("hero-images")
      .getPublicUrl(storagePath);
    return data.publicUrl;
  } catch (error) {
    console.error(`  Error downloading ${url}:`, error);
    return null;
  }
}

function stripHtml(html: string): string {
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

async function main() {
  console.log("🚀 Starting WordPress to Supabase migration...\n");

  // 1. Fetch and save categories
  const categories = await fetchAllCategories();

  console.log("\n💾 Saving categories to Supabase...");
  for (const cat of categories) {
    const { error } = await supabase.from("wp_categories").upsert({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || null,
      post_count: cat.count,
    });
    if (error) {
      console.error(`  Error saving category ${cat.name}:`, error.message);
    }
  }
  console.log(`  ✅ Saved ${categories.length} categories`);

  // 2. Fetch all posts
  const posts = await fetchAllPosts();
  console.log(`\n📊 Total posts to migrate: ${posts.length}`);

  // 3. Process each post
  let successCount = 0;
  let imageCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`\n[${i + 1}/${posts.length}] Processing: ${post.slug}`);

    // Fetch featured image
    let imageUrl: string | null = null;
    let imageAlt = "";

    if (post.featured_media) {
      const media = await fetchMedia(post.featured_media);
      if (media?.source_url) {
        console.log(`  📷 Downloading image...`);
        const ext = media.source_url.split(".").pop()?.split("?")[0] || "jpg";
        const filename = `${post.slug}.${ext}`;
        imageUrl = await downloadAndUploadImage(media.source_url, filename);
        imageAlt = media.alt_text || post.title.rendered;
        if (imageUrl) {
          imageCount++;
          console.log(`  ✅ Image uploaded`);
        }
      }
    }

    // Save post
    const { error: postError } = await supabase.from("wp_posts").upsert({
      id: post.id,
      slug: post.slug,
      title: stripHtml(post.title.rendered),
      excerpt: stripHtml(post.excerpt.rendered),
      content: post.content.rendered, // Keep HTML for content
      featured_image_url: imageUrl,
      featured_image_alt: imageAlt,
      published_at: post.date,
    });

    if (postError) {
      console.error(`  ❌ Error saving post:`, postError.message);
      continue;
    }

    // Save post-category relationships
    for (const catId of post.categories) {
      await supabase.from("wp_post_categories").upsert({
        post_id: post.id,
        category_id: catId,
      });
    }

    successCount++;
    console.log(`  ✅ Saved`);

    // Rate limit
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Migration complete!");
  console.log(`   Posts migrated: ${successCount}/${posts.length}`);
  console.log(`   Images uploaded: ${imageCount}`);
  console.log("=".repeat(50));
}

main().catch(console.error);
