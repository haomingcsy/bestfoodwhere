/**
 * CRM Integration Utilities for BestFoodWhere
 */

import type { TrafficChannel, N8nWebhookPayload } from "./types";

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
}): TrafficChannel {
  const source = (params.utm_source || "").toLowerCase();
  const medium = (params.utm_medium || "").toLowerCase();
  const pageUrl = (params.pageUrl || "").toLowerCase();

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

  if (!source || source === "direct" || source === "(direct)") {
    return "direct";
  }

  return "seo";
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
