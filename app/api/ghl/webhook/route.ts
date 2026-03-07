import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * GHL Webhook Receiver
 *
 * Receives events from GoHighLevel and syncs to Supabase.
 * Register this URL in GHL Dashboard: Settings → Webhooks
 * URL: https://bestfoodwhere.sg/api/ghl/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.type || body.event;

    if (!eventType) {
      return NextResponse.json(
        { error: "Missing event type" },
        { status: 400 },
      );
    }

    switch (eventType) {
      case "ContactCreate":
      case "ContactUpdate":
        await handleContactSync(body);
        break;

      case "ContactDelete":
        await handleContactDelete(body);
        break;

      case "OpportunityStageUpdate":
        await handleOpportunityStageChange(body);
        break;

      case "OpportunityStatusUpdate":
        await handleOpportunityStatusChange(body);
        break;

      case "TaskComplete":
        await handleTaskComplete(body);
        break;

      case "ContactTagUpdate":
        await handleTagUpdate(body);
        break;

      default:
        console.log(`Unhandled GHL webhook event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("GHL webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handleContactSync(body: any) {
  const contact = body.contact || body;
  const ghlContactId = contact.id || contact.contactId;

  if (!ghlContactId) return;

  await supabase.from("ghl_contacts_sync").upsert(
    {
      ghl_contact_id: ghlContactId,
      email: contact.email,
      first_name: contact.firstName,
      last_name: contact.lastName,
      phone: contact.phone,
      tags: contact.tags || [],
      custom_fields: contact.customFields || {},
      last_synced_at: new Date().toISOString(),
    },
    { onConflict: "ghl_contact_id" },
  );
}

async function handleContactDelete(body: any) {
  const ghlContactId = body.contact?.id || body.contactId || body.id;
  if (!ghlContactId) return;

  await supabase
    .from("ghl_contacts_sync")
    .delete()
    .eq("ghl_contact_id", ghlContactId);
}

async function handleOpportunityStageChange(body: any) {
  const opp = body.opportunity || body;

  await supabase.from("pipeline_events").insert({
    ghl_opportunity_id: opp.id || opp.opportunityId,
    ghl_contact_id: opp.contactId,
    pipeline_name: opp.pipelineName || opp.pipeline?.name || "unknown",
    old_stage: opp.previousStage?.name || opp.previousStageName,
    new_stage: opp.currentStage?.name || opp.currentStageName || opp.stageName,
    trigger_source: "ghl_webhook",
    metadata: { raw_event: body },
  });
}

async function handleOpportunityStatusChange(body: any) {
  const opp = body.opportunity || body;

  await supabase.from("pipeline_events").insert({
    ghl_opportunity_id: opp.id || opp.opportunityId,
    ghl_contact_id: opp.contactId,
    pipeline_name: opp.pipelineName || "unknown",
    old_stage: opp.previousStatus,
    new_stage: opp.status,
    trigger_source: "ghl_webhook",
    metadata: { type: "status_change", raw_event: body },
  });
}

async function handleTaskComplete(body: any) {
  const task = body.task || body;
  const contactId = task.contactId;

  if (contactId) {
    await supabase.from("pipeline_events").insert({
      ghl_opportunity_id: task.opportunityId || "task",
      ghl_contact_id: contactId,
      pipeline_name: "task_completion",
      new_stage: "completed",
      trigger_source: "ghl_webhook",
      metadata: { task_title: task.title, task_id: task.id },
    });
  }
}

async function handleTagUpdate(body: any) {
  const contact = body.contact || body;
  const ghlContactId = contact.id || contact.contactId;

  if (!ghlContactId) return;

  // Sync updated tags to our contacts table
  await supabase
    .from("ghl_contacts_sync")
    .update({
      tags: contact.tags || [],
      last_synced_at: new Date().toISOString(),
    })
    .eq("ghl_contact_id", ghlContactId);
}
