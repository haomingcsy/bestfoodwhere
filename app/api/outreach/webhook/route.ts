import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { WebhookPayload } from "@/types/outreach";

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

export async function POST(request: NextRequest) {
  try {
    // Validate webhook secret if configured
    const WEBHOOK_SECRET = process.env.OUTREACH_WEBHOOK_SECRET;
    if (WEBHOOK_SECRET) {
      const authHeader = request.headers.get("x-webhook-secret");
      if (authHeader !== WEBHOOK_SECRET) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }
    }

    const payload: WebhookPayload = await request.json();
    const { type, contact_id, campaign_id, tracking_id, timestamp, metadata } =
      payload;

    if (!type || !contact_id) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Handle different webhook event types
    switch (type) {
      case "email.sent": {
        // Update contact status to sent
        await getSupabase()
          .from("outreach_contacts")
          .update({
            status: "sent",
            sent_at: timestamp || new Date().toISOString(),
          })
          .eq("id", contact_id);

        // Update campaign sent count
        await getSupabase().rpc("increment_campaign_sent", {
          p_campaign_id: campaign_id,
        });

        // Log the email
        if (metadata?.subject && metadata?.body) {
          await getSupabase()
            .from("outreach_email_logs")
            .insert({
              contact_id,
              campaign_id,
              subject: metadata.subject as string,
              body_html: metadata.body as string,
              status: "sent",
              sent_at: timestamp,
              resend_message_id: metadata.message_id as string | undefined,
            });
        }
        break;
      }

      case "email.delivered": {
        await getSupabase()
          .from("outreach_contacts")
          .update({ status: "delivered" })
          .eq("id", contact_id);

        // Update email log
        await getSupabase()
          .from("outreach_email_logs")
          .update({
            status: "delivered",
            delivered_at: timestamp,
          })
          .eq("contact_id", contact_id)
          .order("created_at", { ascending: false })
          .limit(1);
        break;
      }

      case "email.bounced": {
        await getSupabase()
          .from("outreach_contacts")
          .update({ status: "bounced" })
          .eq("id", contact_id);

        await getSupabase()
          .from("outreach_email_logs")
          .update({
            status: "bounced",
            error_message: metadata?.error as string | undefined,
          })
          .eq("contact_id", contact_id)
          .order("created_at", { ascending: false })
          .limit(1);
        break;
      }

      case "email.opened": {
        // Only update if not already in a later state
        const { data: contact } = await getSupabase()
          .from("outreach_contacts")
          .select("status")
          .eq("id", contact_id)
          .single();

        if (contact && ["sent", "delivered"].includes(contact.status)) {
          await getSupabase()
            .from("outreach_contacts")
            .update({
              status: "opened",
              opened_at: timestamp || new Date().toISOString(),
            })
            .eq("id", contact_id);

          // Increment campaign opened count
          await getSupabase().rpc("increment_campaign_opened", {
            p_campaign_id: campaign_id,
          });
        }
        break;
      }

      case "email.clicked": {
        const { data: contact } = await getSupabase()
          .from("outreach_contacts")
          .select("status")
          .eq("id", contact_id)
          .single();

        if (
          contact &&
          ["sent", "delivered", "opened"].includes(contact.status)
        ) {
          await getSupabase()
            .from("outreach_contacts")
            .update({
              status: "clicked",
              clicked_at: timestamp || new Date().toISOString(),
            })
            .eq("id", contact_id);

          // Increment campaign clicked count
          await getSupabase().rpc("increment_campaign_clicked", {
            p_campaign_id: campaign_id,
          });
        }
        break;
      }

      default:
        console.log("Unknown webhook type:", type);
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${type} event`,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Handle reply notifications (manual or from email parsing service)
export async function PUT(request: NextRequest) {
  try {
    const { contact_id, campaign_id, backlink_url, backlink_anchor } =
      await request.json();

    if (!contact_id) {
      return NextResponse.json(
        { success: false, error: "contact_id required" },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = {
      status: backlink_url ? "converted" : "replied",
      replied_at: new Date().toISOString(),
    };

    if (backlink_url) {
      updateData.backlink_url = backlink_url;
      updateData.backlink_anchor = backlink_anchor;
      updateData.converted_at = new Date().toISOString();

      // Increment converted count
      if (campaign_id) {
        await getSupabase().rpc("increment_campaign_converted", {
          p_campaign_id: campaign_id,
        });
      }
    } else if (campaign_id) {
      // Increment replied count
      await getSupabase().rpc("increment_campaign_replied", {
        p_campaign_id: campaign_id,
      });
    }

    await getSupabase()
      .from("outreach_contacts")
      .update(updateData)
      .eq("id", contact_id);

    return NextResponse.json({
      success: true,
      message: backlink_url ? "Marked as converted" : "Marked as replied",
    });
  } catch (error) {
    console.error("Reply update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
