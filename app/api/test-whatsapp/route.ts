import { NextResponse } from "next/server";

export async function GET() {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_API_KEY;

  if (!phone || !apikey) {
    return NextResponse.json({
      error: "Missing env vars",
      phone: !!phone,
      apikey: !!apikey,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes("CALLME")),
    });
  }

  const msg = "BFW Production Test - WhatsApp is working!";
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(msg)}&apikey=${apikey}`;

  try {
    const res = await fetch(url);
    const text = await res.text();
    return NextResponse.json({
      success: true,
      status: res.status,
      response: text.substring(0, 500),
      phone,
      apikeyLength: apikey.length,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
