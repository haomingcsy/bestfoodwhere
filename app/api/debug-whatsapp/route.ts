import { NextResponse } from "next/server";

export async function GET() {
  const rawPhone = process.env.CALLMEBOT_PHONE;
  const rawApiKey = process.env.CALLMEBOT_API_KEY;

  const phone = rawPhone?.trim().replace(/\\n/g, "").replace(/[^0-9+]/g, "");
  const apikey = rawApiKey?.trim().replace(/\\n/g, "");

  const debug: Record<string, unknown> = {
    rawPhone,
    rawApiKey: rawApiKey ? `${rawApiKey.length} chars` : null,
    cleanPhone: phone,
    cleanApiKey: apikey ? `${apikey.length} chars` : null,
    rawPhoneHex: rawPhone ? Buffer.from(rawPhone).toString("hex") : null,
    rawApiKeyHex: rawApiKey ? Buffer.from(rawApiKey).toString("hex") : null,
  };

  if (!phone || !apikey) {
    return NextResponse.json({ error: "Missing env vars", debug });
  }

  const msg = "BFW Debug Test";
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(msg)}&apikey=${apikey}`;
  debug.fetchUrl = url;

  try {
    const res = await fetch(url);
    const text = await res.text();
    debug.status = res.status;
    debug.response = text.substring(0, 500);
    debug.headers = Object.fromEntries(res.headers.entries());
    return NextResponse.json({ success: true, debug });
  } catch (err) {
    debug.fetchError = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, debug });
  }
}
