/**
 * Contact Form API Endpoint
 *
 * Handles contact form submissions from the BFW website.
 * Creates contacts in HubSpot and triggers n8n webhook for automation.
 */

import { NextRequest, NextResponse } from "next/server";
import { getHubSpotClient } from "@/lib/hubspot/client";
import {
  splitName,
  getTrafficChannel,
  triggerN8nWebhook,
  validateEmail,
  validateSGPhone,
  formatPhone,
  calculateInitialLeadScore,
} from "@/lib/hubspot/utils";
import type { N8nWebhookPayload } from "@/lib/hubspot/types";

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  pageUrl?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export async function POST(request: NextRequest) {
  let payload: ContactPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, phone, subject, message, pageUrl } = payload;

  // Validate required fields
  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 },
    );
  }

  if (!validateEmail(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 },
    );
  }

  // Validate Singapore phone number if provided
  if (phone && phone.trim() && !validateSGPhone(phone)) {
    return NextResponse.json(
      {
        error:
          "Please enter a valid Singapore phone number (8 digits starting with 6, 8, or 9)",
      },
      { status: 400 },
    );
  }

  try {
    // Process the data
    const cleanEmail = email.trim().toLowerCase();
    const { firstName, lastName } = splitName(name);
    const formattedPhone = phone ? formatPhone(phone) : undefined;
    const trafficChannel = getTrafficChannel({
      utm_source: payload.utm_source,
      utm_medium: payload.utm_medium,
      pageUrl: payload.pageUrl,
    });

    // Calculate lead score
    const leadScore = calculateInitialLeadScore({
      source: "contact_form",
      hasPhone: !!formattedPhone,
      trafficChannel,
      hasMessage: !!message,
      subject,
    });

    // Get HubSpot client
    const hubspot = getHubSpotClient();

    // Create or update contact in HubSpot
    const result = await hubspot.createOrUpdateContact({
      email: cleanEmail,
      firstName,
      lastName,
      phone: formattedPhone,
      properties: {
        bfw_source: "contact_form",
        bfw_traffic_channel: trafficChannel,
        bfw_tags: "contact_form",
        bfw_lead_score: leadScore,
        bfw_source_url: pageUrl,
        bfw_subject: subject,
        bfw_message: message,
        utm_source: payload.utm_source,
        utm_medium: payload.utm_medium,
        utm_campaign: payload.utm_campaign,
        utm_content: payload.utm_content,
        utm_term: payload.utm_term,
      },
    });

    if (!result.success) {
      console.error("HubSpot contact creation failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to submit contact form" },
        { status: 500 },
      );
    }

    // Trigger n8n webhook for contact form automation
    const webhookUrl = process.env.N8N_WEBHOOK_CONTACT;
    if (webhookUrl && result.contactId) {
      const webhookPayload: N8nWebhookPayload = {
        contactId: result.contactId,
        isNew: result.isNew || false,
        email: cleanEmail,
        firstName,
        lastName,
        phone: formattedPhone,
        source: "contact_form",
        tags: ["contact_form"],
        trafficChannel,
        subject,
        message,
        pageUrl,
        utm_source: payload.utm_source,
        utm_medium: payload.utm_medium,
        utm_campaign: payload.utm_campaign,
        timestamp: new Date().toISOString(),
      };

      // Fire and forget - don't block response on webhook
      triggerN8nWebhook(webhookUrl, webhookPayload).catch((err) => {
        console.error("n8n webhook failed:", err);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
      contactId: result.contactId,
      isNew: result.isNew,
    });
  } catch (error) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
