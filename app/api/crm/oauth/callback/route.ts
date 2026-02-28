import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "No authorization code" },
      { status: 400 },
    );
  }

  // Exchange code for tokens
  const tokenResponse = await fetch(
    "https://services.leadconnectorhq.com/oauth/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GHL_CLIENT_ID!,
        client_secret: process.env.GHL_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bestfoodwhere.sg"}/api/crm/oauth/callback`,
      }),
    },
  );

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error("GHL OAuth token exchange failed:", error);
    return NextResponse.json(
      { error: "Token exchange failed" },
      { status: 500 },
    );
  }

  const tokens = await tokenResponse.json();
  // tokens has: access_token, refresh_token, expires_in, locationId, etc.

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Store tokens
  const expiresAt = new Date(
    Date.now() + tokens.expires_in * 1000,
  ).toISOString();

  const { error } = await supabaseAdmin
    .from("ghl_oauth_tokens")
    .upsert(
      {
        location_id: tokens.locationId || process.env.GHL_LOCATION_ID!,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "location_id" },
    );

  if (error) {
    console.error("Failed to store GHL tokens:", error);
    return NextResponse.json(
      { error: "Failed to store tokens" },
      { status: 500 },
    );
  }

  // Redirect to a success page or admin
  return NextResponse.redirect(new URL("/admin?ghl=connected", request.url));
}
