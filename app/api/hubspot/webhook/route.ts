import { NextRequest, NextResponse } from "next/server";

const OK_RESPONSE = { ok: true };

export async function GET() {
  return NextResponse.json(OK_RESPONSE);
}

export async function POST(request: NextRequest) {
  let payload: unknown = null;

  try {
    payload = await request.json();
  } catch {
    try {
      const text = await request.text();
      payload = text || null;
    } catch {
      payload = null;
    }
  }

  console.log("HubSpot webhook received", payload);
  return NextResponse.json(OK_RESPONSE);
}
