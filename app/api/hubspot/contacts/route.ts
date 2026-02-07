/**
 * Unified HubSpot Contacts API Endpoint
 *
 * Handles all form submissions from BFW website:
 * - Newsletter signup (popup)
 * - VIP Club signup (footer + standalone)
 * - Contact form
 *
 * Creates/updates contacts in HubSpot and triggers n8n webhooks for automation.
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
import type {
  ContactAPIRequest,
  ContactAPIResponse,
  N8nWebhookPayload,
  FormSource,
} from "@/lib/hubspot/types";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ContactAPIResponse>> {
  try {
    const body = (await request.json()) as ContactAPIRequest;

    // Validate required fields (name optional for recipe_newsletter)
    if (!body.email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }

    // For recipe_newsletter, name is optional - use "Recipe Subscriber" as default
    if (!body.name && body.source !== "recipe_newsletter") {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 },
      );
    }

    if (!validateEmail(body.email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Validate Singapore phone number if provided
    if (body.phone && body.phone.trim() && !validateSGPhone(body.phone)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please enter a valid Singapore phone number (8 digits starting with 6, 8, or 9)",
        },
        { status: 400 },
      );
    }

    // Process the data
    const email = body.email.trim().toLowerCase();
    const name =
      body.name ||
      (body.source === "recipe_newsletter" ? "Recipe Subscriber" : "");
    const { firstName, lastName } = splitName(name);
    const phone = body.phone ? formatPhone(body.phone) : undefined;
    const trafficChannel = getTrafficChannel({
      utm_source: body.utm_source,
      utm_medium: body.utm_medium,
      pageUrl: body.pageUrl,
    });

    // Calculate initial lead score
    const leadScore = calculateInitialLeadScore({
      source: body.source,
      hasPhone: !!phone,
      trafficChannel,
      hasMessage: !!body.message,
      subject: body.subject,
    });

    // Get HubSpot client
    const hubspot = getHubSpotClient();

    // Create or update contact in HubSpot
    // Only sending basic contact properties
    const result = await hubspot.createOrUpdateContact({
      email,
      firstName,
      lastName,
      phone,
    });

    if (!result.success) {
      console.error("HubSpot contact creation failed:", result.error);
      return NextResponse.json(
        { success: false, error: result.error || "Failed to create contact" },
        { status: 500 },
      );
    }

    // Trigger n8n webhook for automation
    const webhookUrl = getWebhookUrl(body.source);
    if (webhookUrl && result.contactId) {
      const webhookPayload: N8nWebhookPayload = {
        contactId: result.contactId,
        isNew: result.isNew || false,
        email,
        firstName,
        lastName,
        phone,
        source: body.source,
        tags: body.tags,
        trafficChannel,
        subject: body.subject,
        message: body.message,
        pageUrl: body.pageUrl,
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        timestamp: new Date().toISOString(),
      };

      // Fire and forget - don't block response on webhook
      triggerN8nWebhook(webhookUrl, webhookPayload).catch((err) => {
        console.error("n8n webhook failed:", err);
      });
    }

    return NextResponse.json({
      success: true,
      contactId: result.contactId,
      isNew: result.isNew,
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

/**
 * Get the appropriate n8n webhook URL based on form source
 */
function getWebhookUrl(source: FormSource): string | null {
  switch (source) {
    case "bfw_website":
    case "bfw_vip_club":
      return process.env.N8N_WEBHOOK_NEWSLETTER || null;
    case "recipe_newsletter":
      return process.env.N8N_WEBHOOK_RECIPE || null;
    case "contact_form":
      return process.env.N8N_WEBHOOK_CONTACT || null;
    case "career_application":
      return process.env.N8N_WEBHOOK_CAREER || null;
    default:
      return null;
  }
}

/**
 * Health check endpoint
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    service: "hubspot-contacts",
    timestamp: new Date().toISOString(),
  });
}
