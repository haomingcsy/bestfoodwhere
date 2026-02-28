import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand revalidation for menu pages.
 * Usage: POST /api/revalidate { "slug": "burger-king" }
 * Or:    POST /api/revalidate { "slugs": ["burger-king", "subway"] }
 * Or:    POST /api/revalidate { "all": true } (revalidates all menu pages)
 * Requires REVALIDATION_SECRET header for security.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidation-secret");
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.all) {
      revalidatePath("/menu/[slug]", "page");
      return NextResponse.json({ revalidated: true, scope: "all menu pages" });
    }

    const slugs: string[] = body.slugs || (body.slug ? [body.slug] : []);
    if (slugs.length === 0) {
      return NextResponse.json(
        { error: "Provide slug, slugs, or all:true" },
        { status: 400 },
      );
    }

    for (const slug of slugs) {
      revalidatePath(`/menu/${slug}`);
    }

    return NextResponse.json({ revalidated: true, slugs });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
