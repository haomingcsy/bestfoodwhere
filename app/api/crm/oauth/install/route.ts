import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GHL_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "https://bestfoodwhere.sg"}/api/crm/oauth/callback`;

  const installUrl = `https://marketplace.gohighlevel.com/oauth/chooselocation?response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${clientId}&scope=contacts.readonly contacts.write`;

  return NextResponse.redirect(installUrl);
}
