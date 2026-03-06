import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * GHL Email Engagement Webhook
 *
 * Receives email engagement events (opens, clicks, bounces) from n8n
 * which processes GHL email tracking data.
 * URL: https://bestfoodwhere.sg/api/ghl/engagement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      email,
      event_type,
      ghl_contact_id,
      sequence_name,
      email_number,
      link_url,
      metadata,
    } = body;

    if (!email || !event_type) {
      return NextResponse.json(
        { error: "Missing required fields: email, event_type" },
        { status: 400 },
      );
    }

    await supabase.from("engagement_events").insert({
      email,
      event_type,
      ghl_contact_id: ghl_contact_id || null,
      sequence_name: sequence_name || null,
      email_number: email_number || null,
      link_url: link_url || null,
      metadata: metadata || {},
    });

    // Update engagement tier in ghl_contacts_sync if we have a contact ID
    if (ghl_contact_id && (event_type === "open" || event_type === "click")) {
      // Count recent engagement to determine tier
      const { count } = await supabase
        .from("engagement_events")
        .select("*", { count: "exact", head: true })
        .eq("ghl_contact_id", ghl_contact_id)
        .in("event_type", ["open", "click"])
        .gte(
          "created_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        );

      let tier = "subscribed";
      if (count && count >= 5) {
        tier = "highly_engaged";
      } else if (count && count >= 3) {
        tier = "engaged";
      }

      await supabase
        .from("ghl_contacts_sync")
        .update({
          engagement_tier: tier,
          last_synced_at: new Date().toISOString(),
        })
        .eq("ghl_contact_id", ghl_contact_id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Engagement webhook error:", error);
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 },
    );
  }
}
