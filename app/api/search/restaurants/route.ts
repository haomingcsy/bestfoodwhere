import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const searchPattern = `%${query}%`;

  const { data, error } = await supabase
    .from("mall_restaurants")
    .select(
      `
      name,
      slug,
      cuisines,
      hero_image_url,
      has_menu_page,
      shopping_malls!inner (
        slug,
        name
      )
    `,
    )
    .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
    .limit(8);

  if (error) {
    console.error("Restaurant search error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }

  const results = (data || []).map((r: any) => ({
    name: r.name,
    slug: r.slug,
    mallSlug: r.shopping_malls.slug,
    mallName: r.shopping_malls.name,
    cuisines: r.cuisines || [],
    imageUrl: r.hero_image_url || "",
    hasMenuPage: r.has_menu_page || false,
  }));

  return NextResponse.json({ results });
}
