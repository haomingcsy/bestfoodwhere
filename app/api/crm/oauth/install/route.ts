import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GHL_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "GHL_CLIENT_ID not configured" },
      { status: 500 },
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "https://bestfoodwhere.sg"}/api/crm/oauth/callback`;
  const scope = "contacts.readonly contacts.write";

  const params = new URLSearchParams({
    response_type: "code",
    redirect_uri: redirectUri,
    client_id: clientId,
    scope,
  });

  const installUrl = `https://marketplace.gohighlevel.com/oauth/chooselocation?${params.toString()}`;

  return NextResponse.redirect(installUrl);
}
