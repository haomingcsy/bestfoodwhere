import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/user/favorites - Get all favorites for current user
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ favorites: data });
}

// POST /api/user/favorites - Add a new favorite
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { brand_slug, location_slug } = body;

  if (!brand_slug) {
    return NextResponse.json(
      { error: "brand_slug is required" },
      { status: 400 },
    );
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("brand_slug", brand_slug)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Already in favorites" },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("favorites")
    .insert({
      user_id: user.id,
      brand_slug,
      location_slug: location_slug || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ favorite: data }, { status: 201 });
}

// DELETE /api/user/favorites - Remove a favorite
export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const brand_slug = searchParams.get("brand_slug");

  if (!id && !brand_slug) {
    return NextResponse.json(
      { error: "id or brand_slug is required" },
      { status: 400 },
    );
  }

  let query = supabase.from("favorites").delete().eq("user_id", user.id);

  if (id) {
    query = query.eq("id", id);
  } else if (brand_slug) {
    query = query.eq("brand_slug", brand_slug);
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
