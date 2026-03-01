/**
 * Career Application API
 * Handles career form submissions:
 * 1. Saves to Supabase career_applications table
 * 2. Creates/updates contact in GHL
 * 3. Triggers n8n webhook for automation
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/client";
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
import type { N8nWebhookPayload } from "@/lib/ghl/types";
import type {
  CareerApplicationPayload,
  CareerApplicationResponse,
} from "@/types/career";

export async function POST(
  request: NextRequest
): Promise<NextResponse<CareerApplicationResponse>> {
  try {
    const body = (await request.json()) as CareerApplicationPayload;

    // Validate required fields
    if (!body.email || !body.name) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    if (!validateEmail(body.email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate Singapore phone if provided
    if (body.phone && body.phone.trim() && !validateSGPhone(body.phone)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid Singapore phone number",
        },
        { status: 400 }
      );
    }

    // Process data
    const email = body.email.trim().toLowerCase();
    const { firstName, lastName } = splitName(body.name);
    const phone = body.phone ? formatPhone(body.phone) : undefined;
    const trafficChannel = getTrafficChannel({
      utm_source: body.utm_source,
      utm_medium: body.utm_medium,
      pageUrl: body.pageUrl,
      referrer: body.referrer,
    });

    // Calculate lead score (career applications get higher base score)
    const leadScore = calculateInitialLeadScore({
      source: "career_application",
      hasPhone: !!phone,
      trafficChannel,
      hasMessage: !!body.message,
      subject: body.area_of_interest,
    });

    // Get Supabase client
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      console.error("Supabase client not available");
      // Continue without Supabase - still sync to GHL
    }

    let applicationId: string | undefined;

    // Save to Supabase career_applications table
    if (supabase) {
      const { data: application, error: dbError } = await supabase
        .from("career_applications")
        .insert({
          name: body.name.trim(),
          email,
          phone,
          area_of_interest: body.area_of_interest,
          availability: body.availability,
          message: body.message,
          resume_url: body.resume_url,
          job_id: body.job_id || null,
          utm_source: body.utm_source,
          utm_medium: body.utm_medium,
          utm_campaign: body.utm_campaign,
          utm_content: body.utm_content,
          utm_term: body.utm_term,
          status: "new",
        })
        .select("id")
        .single();

      if (dbError) {
        console.error("Failed to save application to database:", dbError);
        // Continue - GHL sync is more important
      } else {
        applicationId = application?.id;
      }
    }

    // Create/update contact in GHL
    const ghl = getGHLClient();
    const ghlResult = await ghl.createOrUpdateContact({
      email,
      firstName,
      lastName,
      phone,
      tags: ["career_application"],
      customFields: resolveCustomFieldIds([
        { key: "bfw_source", field_value: "career_application" },
        { key: "bfw_traffic_channel", field_value: trafficChannel },
        { key: "bfw_lead_score", field_value: String(leadScore) },
        ...(body.pageUrl
          ? [{ key: "bfw_source_url", field_value: body.pageUrl }]
          : []),
        ...(body.message
          ? [{ key: "bfw_message", field_value: body.message }]
          : []),
        ...(body.area_of_interest
          ? [{ key: "bfw_area_of_interest", field_value: body.area_of_interest }]
          : []),
        ...(body.availability
          ? [{ key: "bfw_availability", field_value: body.availability }]
          : []),
        ...(body.resume_url
          ? [{ key: "bfw_resume_url", field_value: body.resume_url }]
          : []),
        ...(body.utm_source
          ? [{ key: "utm_source", field_value: body.utm_source }]
          : []),
        ...(body.utm_medium
          ? [{ key: "utm_medium", field_value: body.utm_medium }]
          : []),
        ...(body.utm_campaign
          ? [{ key: "utm_campaign", field_value: body.utm_campaign }]
          : []),
        ...(body.utm_content
          ? [{ key: "utm_content", field_value: body.utm_content }]
          : []),
        ...(body.utm_term
          ? [{ key: "utm_term", field_value: body.utm_term }]
          : []),
      ]),
    });

    if (!ghlResult.success) {
      console.error("GHL contact creation failed:", ghlResult.error);
      // Don't fail the whole request - application is saved to DB
    }

    // Update application with GHL contact ID
    if (supabase && applicationId && ghlResult.contactId) {
      await supabase
        .from("career_applications")
        .update({ ghl_contact_id: ghlResult.contactId })
        .eq("id", applicationId);
    }

    // Trigger n8n webhook for automation
    const webhookUrl = process.env.N8N_WEBHOOK_CAREER;
    if (webhookUrl && ghlResult.contactId) {
      const webhookPayload: N8nWebhookPayload = {
        contactId: ghlResult.contactId,
        isNew: ghlResult.isNew || false,
        email,
        firstName,
        lastName,
        phone,
        source: "career_application",
        tags: ["career_application"],
        trafficChannel,
        subject: body.area_of_interest,
        message: body.message,
        pageUrl: body.pageUrl,
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        timestamp: new Date().toISOString(),
      };

      // Fire and forget
      triggerN8nWebhook(webhookUrl, webhookPayload).catch((err) => {
        console.error("n8n career webhook failed:", err);
      });
    }

    return NextResponse.json({
      success: true,
      applicationId,
      ghlContactId: ghlResult.contactId,
    });
  } catch (error) {
    console.error("Career application error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Application failed",
      },
      { status: 500 }
    );
  }
}
