import { NextRequest, NextResponse } from "next/server";
import { getGHLClient } from "@/lib/ghl/client";
import { getEmailTemplate } from "@/lib/ghl/email-templates";

/**
 * Send email via GHL Conversations API.
 * Called by n8n workflows for delayed sequence emails.
 *
 * POST /api/ghl/send-email
 * Body: { contactId, templateKey, firstName?, email?, restaurantName? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactId, templateKey, firstName, email, restaurantName } = body;

    if (!contactId || !templateKey) {
      return NextResponse.json(
        { error: "Missing required fields: contactId, templateKey" },
        { status: 400 },
      );
    }

    const template = getEmailTemplate(templateKey, {
      firstName,
      email,
      restaurantName,
    });

    if (!template) {
      return NextResponse.json(
        { error: `Unknown template: ${templateKey}` },
        { status: 400 },
      );
    }

    const ghl = getGHLClient();
    const result = await ghl.sendEmail({
      contactId,
      subject: template.subject,
      html: template.html,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, templateKey });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
