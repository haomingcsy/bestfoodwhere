/**
 * Unified CRM Contacts API Endpoint (GoHighLevel)
 *
 * Handles all form submissions from BFW website:
 * - Newsletter signup (popup)
 * - VIP Club signup (footer + standalone)
 * - Contact form
 *
 * Creates/updates contacts in GHL and triggers n8n webhooks for automation.
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
  resolveCustomFieldIds,
} from "@/lib/ghl/utils";
import type {
  ContactAPIRequest,
  ContactAPIResponse,
  N8nWebhookPayload,
  GHLCustomField,
  FormSource,
} from "@/lib/ghl/types";

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

    // For recipe_newsletter/report_issue/advertiser_inquiry, name is optional
    if (!body.name && body.source !== "recipe_newsletter" && body.source !== "report_issue" && body.source !== "advertiser_inquiry") {
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
      (body.source === "recipe_newsletter" ? "Recipe Subscriber" :
       body.source === "report_issue" ? "Issue Reporter" :
       body.source === "advertiser_inquiry" ? "Advertiser Lead" : "");
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

    // Get GHL client
    const ghl = getGHLClient();

    // Build custom fields from request data (using key names)
    const rawFields: GHLCustomField[] = [];
    const addField = (key: string, value: string | undefined) => {
      if (value) rawFields.push({ key, field_value: value });
    };

    addField("bfw_source", body.source);
    addField("bfw_traffic_channel", trafficChannel);
    addField("bfw_lead_score", String(leadScore));
    addField("bfw_source_url", body.pageUrl);
    addField("bfw_subject", body.subject);
    addField("bfw_message", body.message);
    addField("utm_source", body.utm_source);
    addField("utm_medium", body.utm_medium);
    addField("utm_campaign", body.utm_campaign);
    addField("utm_content", body.utm_content);
    addField("utm_term", body.utm_term);

    // Merge any form-specific custom fields from the frontend
    if (body.customFields) {
      for (const cf of body.customFields) {
        if (cf.field_value) rawFields.push(cf);
      }
    }

    // Resolve key names to GHL field IDs (GHL API requires IDs, not keys)
    const customFields = resolveCustomFieldIds(rawFields);

    // Create or update contact in GHL with custom fields
    const result = await ghl.createOrUpdateContact({
      email,
      firstName,
      lastName,
      phone,
      tags: body.tags,
      customFields,
    });

    if (!result.success) {
      console.error("GHL contact creation failed:", result.error);
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
    case "advertiser_inquiry":
      return process.env.N8N_WEBHOOK_CONTACT || null;
    case "career_application":
      return process.env.N8N_WEBHOOK_CAREER || null;
    case "report_issue":
      return process.env.N8N_WEBHOOK_REPORT || null;
    case "bfw_signup":
    case "bfw_restaurant_signup":
      return process.env.N8N_WEBHOOK_NEWSLETTER || null;
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
    service: "ghl-contacts",
    version: "2",
    timestamp: new Date().toISOString(),
  });
}
