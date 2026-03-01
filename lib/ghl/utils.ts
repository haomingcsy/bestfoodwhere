/**
 * CRM Integration Utilities for BestFoodWhere
 */

import type { TrafficChannel, N8nWebhookPayload, GHLCustomField } from "./types";

/**
 * GHL custom field key → ID mapping.
 * GHL upsert API requires field IDs, not keys.
 * Retrieve via: GET /locations/{locationId}/customFields
 */
const GHL_FIELD_IDS: Record<string, string> = {
  bfw_source: "hsIbkTzZrudfDc7wfWQl",
  bfw_traffic_channel: "3dzJ7Oq5i1a3ZhmaZywW",
  bfw_lead_score: "YfvmTSviZ8syFdBmeIts",
  bfw_source_url: "3GBIr6hoBlFqYUYnG2Go",
  bfw_subject: "8iFnuLoXpb9EkpSoZAre",
  bfw_message: "7ud4Ho8s6BC4DWo1WwxJ",
  bfw_issue_type: "SwtA4d3YCKvyiw6pfrk5",
  bfw_restaurant_name: "QwtecwPkl3ShP7eM2yve",
  bfw_mall_location: "UYNOKayzMBXjcWp6cSyy",
  bfw_cuisine_type: "1hVqh6LtHGfhoUdViAWv",
  bfw_pricing_tier: "CJAw1Uowk5WMY6FNgB6k",
  bfw_dietary_preferences: "oE578Yyas0cWFYy1gjyA",
  bfw_favorite_cuisines: "Epk4ZOdrkatoSpTqjOdz",
  bfw_business_phone: "XBWdPwkvJsV8uLLeqdJ8",
  bfw_website_url: "gTWWaBmgI09n3zU9NMWT",
  bfw_referrer: "JkMVmuenvt1gR0cEZzSW",
  utm_source: "xfDFarptvC1JLp8iEUjv",
  utm_medium: "PQrlrQesBMFKNwYK1Why",
  utm_campaign: "sLKQ0ZSPuF2KTp71AH2S",
  utm_content: "tgipv3TWKGucrEtv1rs8",
  utm_term: "ElEANWYxt5a0RqLVvfk8",
};

/**
 * Resolve custom field keys to GHL field IDs.
 * Accepts fields with key names (e.g., "bfw_source") and returns
 * fields with id + field_value for the GHL upsert API.
 */
export function resolveCustomFieldIds(
  fields: GHLCustomField[],
): Array<{ id: string; field_value: string }> {
  return fields
    .map((f) => {
      const cleanKey = f.key.replace(/^contact\./, "");
      const id = GHL_FIELD_IDS[cleanKey];
      if (!id) {
        console.warn(`Unknown GHL custom field key: ${f.key}`);
        return null;
      }
      return { id, field_value: f.field_value };
    })
    .filter((f): f is { id: string; field_value: string } => f !== null);
}

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

export function getTrafficChannel(params: {
  utm_source?: string;
  utm_medium?: string;
  pageUrl?: string;
  referrer?: string;
}): TrafficChannel {
  const source = (params.utm_source || "").toLowerCase();
  const medium = (params.utm_medium || "").toLowerCase();
  const pageUrl = (params.pageUrl || "").toLowerCase();
  const referrer = (params.referrer || "").toLowerCase();

  // 1. Check UTM params first (explicit campaign tracking)
  if (source.includes("chatgpt") || pageUrl.includes("chatgpt.com")) {
    return "chatgpt";
  }

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

  if (source.includes("linkedin")) {
    return "linkedin";
  }

  if (source.includes("tiktok")) {
    return "tiktok";
  }

  if (source.includes("google")) {
    if (medium === "cpc" || medium === "paid") {
      return "google_ads";
    }
    return "seo";
  }

  if (medium === "cpc" || medium === "paid" || medium === "ppc") {
    return "paid_ads";
  }

  if (source && source !== "direct" && source !== "(direct)") {
    return "referral";
  }

  // 2. No UTM params — fall back to document.referrer
  if (referrer) {
    // Search engines → seo
    if (
      referrer.includes("google.") ||
      referrer.includes("bing.") ||
      referrer.includes("yahoo.") ||
      referrer.includes("duckduckgo.") ||
      referrer.includes("baidu.") ||
      referrer.includes("yandex.")
    ) {
      return "seo";
    }
    // Social platforms → appropriate channel
    if (referrer.includes("facebook.com") || referrer.includes("fb.com") || referrer.includes("meta.com")) {
      return "meta";
    }
    if (referrer.includes("instagram.com")) {
      return "meta";
    }
    if (referrer.includes("linkedin.com")) {
      return "linkedin";
    }
    if (referrer.includes("tiktok.com")) {
      return "tiktok";
    }
    if (referrer.includes("chatgpt.com") || referrer.includes("chat.openai.com")) {
      return "chatgpt";
    }
    // Any other external referrer
    return "referral";
  }

  // 3. No UTM, no referrer → direct
  return "direct";
}

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

export function validateSGPhone(phone: string): boolean {
  if (!phone || !phone.trim()) {
    return true;
  }

  const cleanPhone = phone.replace(/[\s\-()]/g, "");
  const sgPhoneRegex = /^(\+65)?[689]\d{7}$/;
  return sgPhoneRegex.test(cleanPhone);
}

export function formatPhone(phone: string): string {
  if (!phone) return "";

  const cleaned = phone.replace(/[\s\-()]/g, "");

  if (cleaned.length === 8 && /^[689]/.test(cleaned)) {
    return `+65${cleaned}`;
  }

  if (cleaned.startsWith("65") && cleaned.length === 10) {
    return `+${cleaned}`;
  }

  return cleaned;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function calculateInitialLeadScore(params: {
  source: string;
  hasPhone: boolean;
  trafficChannel: TrafficChannel;
  hasMessage: boolean;
  subject?: string;
}): number {
  let score = 0;

  if (params.source === "contact_form") {
    score += 25;
  } else if (params.source === "bfw_vip_club") {
    score += 20;
  } else if (params.source === "bfw_website") {
    score += 10;
  }

  if (params.hasPhone) {
    score += 15;
  }

  if (params.trafficChannel === "chatgpt") {
    score += 10;
  } else if (params.trafficChannel === "google_ads") {
    score += 8;
  } else if (params.trafficChannel === "seo") {
    score += 5;
  }

  if (
    params.subject?.toLowerCase().includes("partnership") ||
    params.subject?.toLowerCase().includes("business")
  ) {
    score += 30;
  }

  if (params.hasMessage) {
    score += 5;
  }

  return Math.min(score, 100);
}
