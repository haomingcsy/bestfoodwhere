import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy initialization to avoid build-time errors
let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return supabase;
}

// 1x1 transparent GIF for open tracking pixel
const TRACKING_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

/**
 * GET /api/outreach/track?t={tracking_id}&e={event}
 *
 * Track email opens (pixel) and link clicks
 * - e=open: Returns tracking pixel, records open
 * - e=click&url={url}: Records click, redirects to URL
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trackingId = searchParams.get("t");
  const event = searchParams.get("e") || "open";
  const redirectUrl = searchParams.get("url");

  if (!trackingId) {
    // Return pixel anyway to not break email display
    return new NextResponse(TRACKING_PIXEL, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  }

  try {
    // Find the contact by tracking ID
    const { data: contact, error } = await getSupabase()
      .from("outreach_contacts")
      .select("id, campaign_id, status")
      .eq("tracking_id", trackingId)
      .single();

    if (!error && contact) {
      const now = new Date().toISOString();

      if (event === "open") {
        // Only update if not already opened/clicked
        if (["sent", "delivered"].includes(contact.status)) {
          await getSupabase()
            .from("outreach_contacts")
            .update({
              status: "opened",
              opened_at: now,
            })
            .eq("id", contact.id);

          // Increment campaign opened count
          await getSupabase().rpc("increment_campaign_opened", {
            p_campaign_id: contact.campaign_id,
          });
        }
      } else if (event === "click" && redirectUrl) {
        // Only update if not already clicked
        if (["sent", "delivered", "opened"].includes(contact.status)) {
          await getSupabase()
            .from("outreach_contacts")
            .update({
              status: "clicked",
              clicked_at: now,
            })
            .eq("id", contact.id);

          // Increment campaign clicked count
          await getSupabase().rpc("increment_campaign_clicked", {
            p_campaign_id: contact.campaign_id,
          });
        }
      }
    }
  } catch (err) {
    console.error("Tracking error:", err);
    // Don't fail the request - tracking should be silent
  }

  // Return appropriate response based on event type
  if (event === "click" && redirectUrl) {
    // Redirect to the target URL
    try {
      const url = new URL(redirectUrl);
      return NextResponse.redirect(url.toString());
    } catch {
      // Invalid URL, redirect to homepage
      return NextResponse.redirect("https://bestfoodwhere.sg");
    }
  }

  // Return tracking pixel for open events
  return new NextResponse(TRACKING_PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
