/**
 * HubSpot Integration Types for BestFoodWhere
 */

// ============ Form Submission Types ============

export type FormSource =
  | "bfw_website"
  | "bfw_vip_club"
  | "contact_form"
  | "career_application"
  | "recipe_newsletter";

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

// ============ HubSpot Contact Types ============

export interface HubSpotContactProperties {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  // BFW Custom Properties
  bfw_source?: FormSource;
  bfw_traffic_channel?: TrafficChannel;
  bfw_tags?: string;
  bfw_lead_score?: number;
  bfw_source_url?: string;
  bfw_subject?: string;
  bfw_message?: string;
  // Career-specific Properties
  bfw_area_of_interest?: string;
  bfw_availability?: string;
  bfw_resume_url?: string;
  // UTM Properties
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export interface HubSpotContact {
  id: string;
  properties: HubSpotContactProperties;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactInput {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  properties?: Partial<HubSpotContactProperties>;
}

export interface CreateContactResult {
  success: boolean;
  contactId?: string;
  isNew?: boolean;
  error?: string;
}

// ============ HubSpot API Response Types ============

export interface HubSpotAPIContact {
  id: string;
  properties: Record<string, string | null>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotAPIError {
  status: string;
  message: string;
  correlationId: string;
  category: string;
}

export interface HubSpotSearchResponse {
  total: number;
  results: HubSpotAPIContact[];
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
