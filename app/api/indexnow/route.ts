import { NextRequest, NextResponse } from "next/server";

const INDEXNOW_KEY = "bfw2026indexnow8sg7x";
const HOST = "bestfoodwhere.sg";

/**
 * POST /api/indexnow
 * Submit URLs to IndexNow (Bing, Yandex, Seznam, Naver) for instant indexing.
 * Body: { urls: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const urls: string[] = body.urls;

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "urls array is required" },
        { status: 400 },
      );
    }

    if (urls.length > 10000) {
      return NextResponse.json(
        { error: "Maximum 10,000 URLs per request" },
        { status: 400 },
      );
    }

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList: urls.map((url) =>
        url.startsWith("http") ? url : `https://${HOST}${url}`,
      ),
    };

    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      submitted: payload.urlList.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/indexnow
 * Returns the IndexNow key for verification.
 */
export async function GET() {
  return NextResponse.json({ key: INDEXNOW_KEY, host: HOST });
}
