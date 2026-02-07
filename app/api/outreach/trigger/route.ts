import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import type {
  OutreachCampaign,
  OutreachContact,
  TriggerCampaignRequest,
} from "@/types/outreach";

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
    const body: TriggerCampaignRequest = await request.json();
    const { campaign_id, batch_size = 10 } = body;

    if (!campaign_id) {
      return NextResponse.json(
        { success: false, error: "campaign_id is required" },
        { status: 400 },
      );
    }

    // Fetch the campaign
    const { data: campaign, error: campaignError } = await getSupabase()
      .from("outreach_campaigns")
      .select("*")
      .eq("id", campaign_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 },
      );
    }

    // Check if campaign is active
    if (campaign.status !== "active") {
      return NextResponse.json(
        { success: false, error: `Campaign is ${campaign.status}, not active` },
        { status: 400 },
      );
    }

    // Fetch pending contacts for this campaign, prioritized by domain authority
    const { data: contacts, error: contactsError } = await getSupabase()
      .from("outreach_contacts")
      .select("*")
      .eq("campaign_id", campaign_id)
      .eq("status", "pending")
      .order("domain_authority", { ascending: false, nullsFirst: false })
      .limit(batch_size);

    if (contactsError) {
      console.error("Error fetching contacts:", contactsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch contacts" },
        { status: 500 },
      );
    }

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({
        success: true,
        queued_count: 0,
        message: "No pending contacts to process",
      });
    }

    // Generate tracking IDs and mark contacts as queued
    const contactUpdates = contacts.map((contact) => ({
      id: contact.id,
      status: "queued" as const,
      tracking_id: randomUUID(),
    }));

    // Update contacts to queued status
    for (const update of contactUpdates) {
      await getSupabase()
        .from("outreach_contacts")
        .update({ status: update.status, tracking_id: update.tracking_id })
        .eq("id", update.id);
    }

    // Send to n8n for processing (if webhook is configured)
    const N8N_OUTREACH_WEBHOOK = process.env.N8N_WEBHOOK_OUTREACH;
    if (N8N_OUTREACH_WEBHOOK) {
      const webhookPayload = {
        campaign: campaign as OutreachCampaign,
        contacts: contacts.map((c, i) => ({
          ...c,
          tracking_id: contactUpdates[i].tracking_id,
        })) as OutreachContact[],
        action: "send_batch",
        timestamp: new Date().toISOString(),
      };

      // Fire and forget - don't wait for n8n response
      fetch(N8N_OUTREACH_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      }).catch((err) => {
        console.error("Failed to trigger n8n webhook:", err);
      });
    }

    return NextResponse.json({
      success: true,
      queued_count: contacts.length,
      message: `Queued ${contacts.length} contacts for outreach`,
      contacts: contactUpdates.map((c) => ({
        id: c.id,
        tracking_id: c.tracking_id,
      })),
    });
  } catch (error) {
    console.error("Outreach trigger error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET: Check campaign status and stats
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const campaign_id = searchParams.get("campaign_id");

  if (!campaign_id) {
    // Return all active campaigns
    const { data: campaigns, error } = await getSupabase()
      .from("outreach_campaigns")
      .select("*")
      .in("status", ["draft", "active", "paused"])
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch campaigns" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, campaigns });
  }

  // Return specific campaign with contact stats
  const { data: campaign, error: campaignError } = await getSupabase()
    .from("outreach_campaigns")
    .select("*")
    .eq("id", campaign_id)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json(
      { success: false, error: "Campaign not found" },
      { status: 404 },
    );
  }

  // Get contact status breakdown
  const { data: statusCounts } = await getSupabase()
    .from("outreach_contacts")
    .select("status")
    .eq("campaign_id", campaign_id);

  const stats = (statusCounts || []).reduce(
    (acc, { status }) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return NextResponse.json({
    success: true,
    campaign,
    stats,
  });
}
