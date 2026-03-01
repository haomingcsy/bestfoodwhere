/**
 * GoHighLevel Integration Types for BestFoodWhere
 */

// ============ Form Submission Types ============
// These are app-level types, not GHL-specific

export type FormSource =
  | "bfw_website"
  | "bfw_vip_club"
  | "contact_form"
  | "career_application"
  | "recipe_newsletter"
  | "report_issue";

export type TrafficChannel =
  | "seo"
  | "google_ads"
  | "meta"
  | "chatgpt"
  | "tiktok"
  | "linkedin"
  | "referral"
  | "direct"
  | "paid_ads";

export interface FormSubmissionPayload {
  email: string;
  name: string;
  phone?: string;
  source: FormSource;
  tags: string[];
  subject?: string;
  message?: string;
  pageUrl?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

// ============ GHL Contact Types ============

export interface GHLContactProperties {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags?: string[];
  customFields?: GHLCustomField[];
}

export interface GHLCustomField {
  key: string;
  field_value: string;
}

export interface GHLContact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: Array<{ id: string; key: string; value: string }>;
  dateAdded?: string;
  dateUpdated?: string;
}

export interface CreateContactInput {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags?: string[];
  customFields?: GHLCustomField[];
}

export interface CreateContactResult {
  success: boolean;
  contactId?: string;
  isNew?: boolean;
  error?: string;
}

// ============ GHL API Response Types ============

export interface GHLAPIResponse {
  contact: GHLContact;
}

export interface GHLSearchResponse {
  contacts: GHLContact[];
  total: number;
}

export interface GHLUpsertResponse {
  contact: GHLContact;
  new: boolean;
}

// ============ n8n Webhook Types ============

export interface N8nWebhookPayload {
  contactId: string;
  isNew: boolean;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  source: FormSource;
  tags: string[];
  trafficChannel: TrafficChannel;
  subject?: string;
  message?: string;
  pageUrl?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  timestamp: string;
}

// ============ API Request/Response Types ============

export interface ContactAPIRequest {
  email: string;
  name: string;
  phone?: string;
  source: FormSource;
  tags: string[];
  subject?: string;
  message?: string;
  pageUrl?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  send_welcome?: boolean;
  send_confirmation?: boolean;
}

export interface ContactAPIResponse {
  success: boolean;
  contactId?: string;
  isNew?: boolean;
  error?: string;
}
