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
import { waitUntil } from "@vercel/functions";
import { createClient } from "@supabase/supabase-js";
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
  routeToPipeline,
  getPipelineConfig,
  getOpportunityName,
} from "@/lib/ghl/utils";
import type {
  ContactAPIRequest,
  ContactAPIResponse,
  N8nWebhookPayload,
  GHLCustomField,
  FormSource,
} from "@/lib/ghl/types";
import { enrichContactWithKeywords } from "@/lib/gsc/enrich";
import { getEmailTemplate } from "@/lib/ghl/email-templates";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/** Send WhatsApp notification via CallMeBot */
const CALLMEBOT_PHONE = process.env.CALLMEBOT_PHONE?.trim().replace(/\\n/g, "");
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY?.trim().replace(/\\n/g, "");

async function notifyWhatsApp(message: string): Promise<{ sent: boolean; status?: number; response?: string; error?: string }> {
  if (!CALLMEBOT_PHONE || !CALLMEBOT_API_KEY) {
    return { sent: false, error: "env vars missing" };
  }
  const phone = CALLMEBOT_PHONE.replace(/[^0-9+]/g, "");
  const text = encodeURIComponent(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${text}&apikey=${CALLMEBOT_API_KEY}`;

  try {
    const response = await fetch(url);
    const body = await response.text();
    return { sent: true, status: response.status, response: body.substring(0, 200) };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function saveFormSubmission(data: {
  email: string;
  name: string;
  phone?: string;
  source: string;
  tags: string[];
  subject?: string;
  message?: string;
  pageUrl?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  trafficChannel: string;
  leadScore: number;
  ghlContactId?: string;
  ghlSyncSuccess: boolean;
  customFields?: Record<string, string>;
  ipAddress?: string;
}) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    await supabase.from("form_submissions").insert({
      email: data.email,
      name: data.name,
      phone: data.phone || null,
      source: data.source,
      tags: data.tags || [],
      subject: data.subject || null,
      message: data.message || null,
      page_url: data.pageUrl || null,
      referrer: data.referrer || null,
      utm_source: data.utm_source || null,
      utm_medium: data.utm_medium || null,
      utm_campaign: data.utm_campaign || null,
      utm_content: data.utm_content || null,
      utm_term: data.utm_term || null,
      traffic_channel: data.trafficChannel,
      lead_score: data.leadScore,
      ghl_contact_id: data.ghlContactId || null,
      ghl_sync_success: data.ghlSyncSuccess,
      custom_fields: data.customFields || {},
      ip_address: data.ipAddress || null,
    });
  } catch (err) {
    console.error("Supabase form_submissions backup failed:", err);
  }
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ContactAPIResponse>> {
  // Rate limiting
  const ip = getClientIp(request);
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rateCheck.retryAfterMs / 1000)) } }
    );
  }

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
      referrer: body.referrer,
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
    addField("bfw_referrer", body.referrer);
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

    // Extract IP address early for Supabase backup
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    // Build common Supabase backup data
    const backupData = {
      email,
      name,
      phone,
      source: body.source,
      tags: body.tags || [],
      subject: body.subject,
      message: body.message,
      pageUrl: body.pageUrl,
      referrer: body.referrer,
      utm_source: body.utm_source,
      utm_medium: body.utm_medium,
      utm_campaign: body.utm_campaign,
      utm_content: body.utm_content,
      utm_term: body.utm_term,
      trafficChannel,
      leadScore,
      customFields: Object.fromEntries(
        (body.customFields || []).map((cf) => [cf.key, cf.field_value]),
      ),
      ipAddress: ipAddress || undefined,
    };

    // Create or update contact in GHL with custom fields
    const result = await ghl.createOrUpdateContact({
      email,
      firstName,
      lastName,
      phone,
      tags: body.tags,
      customFields,
    });

    // Always save to Supabase as backup (fire-and-forget, never blocks response)
    waitUntil(
      saveFormSubmission({
        ...backupData,
        ghlContactId: result.contactId,
        ghlSyncSuccess: result.success,
      }),
    );

    if (!result.success) {
      console.error("GHL contact creation failed:", result.error);
      // Still return success to user — we have the data in Supabase
      return NextResponse.json({
        success: true,
        contactId: undefined,
        isNew: undefined,
      });
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
      waitUntil(
        triggerN8nWebhook(webhookUrl, webhookPayload).catch((err) => {
          console.error("n8n webhook failed:", err);
        }),
      );
    }

    // Notify via WhatsApp
    let whatsappResult: { sent: boolean; status?: number; response?: string; error?: string } | null = null;
    if (result.contactId) {
      const whatsappMsg = `New BFW Lead\n\nEmail: ${email}\nName: ${name}\nSource: ${body.source}\nChannel: ${trafficChannel}${phone ? `\nPhone: ${phone}` : ""}${body.subject ? `\nSubject: ${body.subject}` : ""}`;
      whatsappResult = await notifyWhatsApp(whatsappMsg);
    }

    // Create opportunity in the appropriate pipeline (fire and forget)
    const pipelineType = routeToPipeline({ source: body.source, subject: body.subject });
    if (pipelineType && result.contactId) {
      const pipelineConfig = getPipelineConfig(pipelineType);
      if (pipelineConfig) {
        const oppName = getOpportunityName(pipelineType, {
          name: body.name,
          email: body.email,
          restaurantName: body.customFields?.find((f) => f.key === "bfw_restaurant_name")?.field_value,
        });
        waitUntil(
          ghl.createOpportunity({
            pipelineId: pipelineConfig.pipelineId,
            pipelineStageId: pipelineConfig.initialStageId,
            contactId: result.contactId,
            name: oppName,
            source: "BFW Website",
          }).catch((err) => console.error("Opportunity creation failed:", err)),
        );
      }
    }

    // Enrich SEO contacts with GSC search keywords (fire and forget)
    if (trafficChannel === "seo" && result.contactId && body.pageUrl) {
      waitUntil(
        enrichContactWithKeywords(result.contactId, body.pageUrl).catch((err) => {
          console.error("GSC keyword enrichment failed:", err);
        }),
      );
    }

    // Send welcome email for new contacts via GHL Conversations API
    const isNew = result.isNew;
    const contactId = result.contactId;
    if (isNew && contactId) {
      const source = body.source;
      const welcomeTemplateMap: Record<string, string | undefined> = {
        bfw_website: "welcome_email_1",
        bfw_vip_club: "welcome_email_1",
        bfw_signup: "welcome_email_1",
        recipe_newsletter: "welcome_email_1",
        advertiser_inquiry: "advertiser_email_1",
        bfw_restaurant_signup: "advertiser_email_1",
        contact_form: source === "contact_form" && body.subject?.toLowerCase().match(/partner|business|collaborat/)
          ? "partnership_email_1"
          : undefined,
      };

      const templateKey = welcomeTemplateMap[source];
      if (templateKey) {
        const template = getEmailTemplate(templateKey, {
          firstName: splitName(body.name || "").firstName,
          email: body.email,
        });
        if (template) {
          waitUntil(
            ghl.sendEmail({
              contactId,
              subject: template.subject,
              html: template.html,
            }).catch((err) => console.error("Welcome email failed:", err)),
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      contactId: result.contactId,
      isNew: result.isNew,
      _debug_whatsapp: whatsappResult,
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
