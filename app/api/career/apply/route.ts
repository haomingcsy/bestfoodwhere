/**
 * Career Application API
 * Handles career form submissions:
 * 1. Saves to Supabase career_applications table
 * 2. Creates/updates contact in HubSpot
 * 3. Triggers n8n webhook for automation
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/client";
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
      // Continue without Supabase - still sync to HubSpot
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
        // Continue - HubSpot sync is more important
      } else {
        applicationId = application?.id;
      }
    }

    // Create/update contact in HubSpot
    const hubspot = getHubSpotClient();
    const hubspotResult = await hubspot.createOrUpdateContact({
      email,
      firstName,
      lastName,
      phone,
      properties: {
        bfw_source: "career_application",
        bfw_traffic_channel: trafficChannel,
        bfw_tags: "career_application",
        bfw_lead_score: leadScore,
        bfw_source_url: body.pageUrl,
        bfw_message: body.message,
        bfw_area_of_interest: body.area_of_interest,
        bfw_availability: body.availability,
        bfw_resume_url: body.resume_url,
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        utm_content: body.utm_content,
        utm_term: body.utm_term,
      },
    });

    if (!hubspotResult.success) {
      console.error("HubSpot contact creation failed:", hubspotResult.error);
      // Don't fail the whole request - application is saved to DB
    }

    // Update application with HubSpot contact ID
    if (supabase && applicationId && hubspotResult.contactId) {
      await supabase
        .from("career_applications")
        .update({ hubspot_contact_id: hubspotResult.contactId })
        .eq("id", applicationId);
    }

    // Trigger n8n webhook for automation
    const webhookUrl = process.env.N8N_WEBHOOK_CAREER;
    if (webhookUrl && hubspotResult.contactId) {
      const webhookPayload: N8nWebhookPayload = {
        contactId: hubspotResult.contactId,
        isNew: hubspotResult.isNew || false,
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
      hubspotContactId: hubspotResult.contactId,
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
