/**
 * HubSpot Integration Utilities for BestFoodWhere
 */

import type { TrafficChannel, N8nWebhookPayload } from "./types";

/**
 * Split a full name into first and last name
 */
export function splitName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");

  return { firstName, lastName };
}

/**
 * Determine traffic channel from UTM parameters and page URL
 */
export function getTrafficChannel(params: {
  utm_source?: string;
  utm_medium?: string;
  pageUrl?: string;
}): TrafficChannel {
  const source = (params.utm_source || "").toLowerCase();
  const medium = (params.utm_medium || "").toLowerCase();
  const pageUrl = (params.pageUrl || "").toLowerCase();

  // ChatGPT referrals
  if (source.includes("chatgpt") || pageUrl.includes("chatgpt.com")) {
    return "chatgpt";
  }

  // Meta (Facebook/Instagram)
  if (
    source.includes("facebook") ||
    source.includes("meta") ||
    source.includes("fb")
  ) {
    return "meta";
  }

  if (source.includes("instagram") || source.includes("ig")) {
    return "meta";
  }

  // LinkedIn
  if (source.includes("linkedin")) {
    return "linkedin";
  }

  // TikTok
  if (source.includes("tiktok")) {
    return "tiktok";
  }

  // Google
  if (source.includes("google")) {
    if (medium === "cpc" || medium === "paid") {
      return "google_ads";
    }
    return "seo";
  }

  // Generic paid ads
  if (medium === "cpc" || medium === "paid" || medium === "ppc") {
    return "paid_ads";
  }

  // Referral traffic (has source but not paid)
  if (source && source !== "direct" && source !== "(direct)") {
    return "referral";
  }

  // Direct or SEO (organic)
  if (!source || source === "direct" || source === "(direct)") {
    return "direct";
  }

  return "seo";
}

/**
 * Trigger n8n webhook with contact data
 */
export async function triggerN8nWebhook(
  webhookUrl: string,
  payload: N8nWebhookPayload,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(
        `n8n webhook failed: ${response.status} ${response.statusText}`,
      );
      return {
        success: false,
        error: `Webhook returned ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("n8n webhook error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Validate Singapore phone number format
 */
export function validateSGPhone(phone: string): boolean {
  if (!phone || !phone.trim()) {
    return true; // Empty is valid (optional field)
  }

  const cleanPhone = phone.replace(/[\s\-()]/g, "");
  const sgPhoneRegex = /^(\+65)?[689]\d{7}$/;
  return sgPhoneRegex.test(cleanPhone);
}

/**
 * Clean and format phone number
 */
export function formatPhone(phone: string): string {
  if (!phone) return "";

  const cleaned = phone.replace(/[\s\-()]/g, "");

  // Add +65 prefix if not present
  if (cleaned.length === 8 && /^[689]/.test(cleaned)) {
    return `+65${cleaned}`;
  }

  if (cleaned.startsWith("65") && cleaned.length === 10) {
    return `+${cleaned}`;
  }

  return cleaned;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate initial lead score based on form data
 */
export function calculateInitialLeadScore(params: {
  source: string;
  hasPhone: boolean;
  trafficChannel: TrafficChannel;
  hasMessage: boolean;
  subject?: string;
}): number {
  let score = 0;

  // Source-based scoring
  if (params.source === "contact_form") {
    score += 25;
  } else if (params.source === "bfw_vip_club") {
    score += 20;
  } else if (params.source === "bfw_website") {
    score += 10;
  }

  // Phone provided (higher intent)
  if (params.hasPhone) {
    score += 15;
  }

  // Traffic channel scoring
  if (params.trafficChannel === "chatgpt") {
    score += 10; // High intent - actively searching
  } else if (params.trafficChannel === "google_ads") {
    score += 8;
  } else if (params.trafficChannel === "seo") {
    score += 5;
  }

  // Partnership inquiry (highest intent)
  if (
    params.subject?.toLowerCase().includes("partnership") ||
    params.subject?.toLowerCase().includes("business")
  ) {
    score += 30;
  }

  // Has a message (engaged)
  if (params.hasMessage) {
    score += 5;
  }

  return Math.min(score, 100);
}
