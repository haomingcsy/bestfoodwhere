/**
 * Contact Form API Endpoint
 *
 * Handles contact form submissions from the BFW website.
 * Creates contacts in GHL and triggers n8n webhook for automation.
 */

import { NextRequest, NextResponse } from "next/server";
import { getGHLClient } from "@/lib/ghl/client";
import {
  splitName,
  getTrafficChannel,
  triggerN8nWebhook,
  validateEmail,
  validateSGPhone,
  formatPhone,
  calculateInitialLeadScore,
} from "@/lib/ghl/utils";
import type { N8nWebhookPayload } from "@/lib/ghl/types";

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

    // Get GHL client
    const ghl = getGHLClient();

    // Create or update contact in GHL
    const result = await ghl.createOrUpdateContact({
      email: cleanEmail,
      firstName,
      lastName,
      phone: formattedPhone,
      tags: ["contact_form"],
      customFields: [
        { key: "bfw_source", field_value: "contact_form" },
        { key: "bfw_traffic_channel", field_value: trafficChannel },
        { key: "bfw_lead_score", field_value: String(leadScore) },
        ...(pageUrl
          ? [{ key: "bfw_source_url", field_value: pageUrl }]
          : []),
        ...(subject
          ? [{ key: "bfw_subject", field_value: subject }]
          : []),
        ...(message
          ? [{ key: "bfw_message", field_value: message }]
          : []),
        ...(payload.utm_source
          ? [{ key: "utm_source", field_value: payload.utm_source }]
          : []),
        ...(payload.utm_medium
          ? [{ key: "utm_medium", field_value: payload.utm_medium }]
          : []),
        ...(payload.utm_campaign
          ? [{ key: "utm_campaign", field_value: payload.utm_campaign }]
          : []),
        ...(payload.utm_content
          ? [{ key: "utm_content", field_value: payload.utm_content }]
          : []),
        ...(payload.utm_term
          ? [{ key: "utm_term", field_value: payload.utm_term }]
          : []),
      ],
    });

    if (!result.success) {
      console.error("GHL contact creation failed:", result.error);
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
