// Outreach Campaign Types

export type CampaignType =
  | "food-blogger"
  | "tourism"
  | "supplier"
  | "partnership"
  | "media";
export type CampaignStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "archived";
export type ContactStatus =
  | "pending"
  | "queued"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "replied"
  | "converted"
  | "unsubscribed"
  | "bounced"
  | "failed";

export interface OutreachCampaign {
  id: string;
  name: string;
  type: CampaignType;
  description?: string;

  // Email configuration
  email_subject_template?: string;
  email_body_template?: string;
  sender_name: string;
  sender_email: string;

  // Campaign settings
  daily_send_limit: number;
  delay_between_sends_seconds: number;

  // Status and tracking
  status: CampaignStatus;
  target_count: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  replied_count: number;
  converted_count: number;

  // Timestamps
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface OutreachContact {
  id: string;
  campaign_id: string;

  // Contact information
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  company?: string;
  website?: string;

  // SEO metrics
  domain_authority?: number;
  domain_rating?: number;
  monthly_traffic?: number;

  // Social metrics
  instagram_followers?: number;
  twitter_followers?: number;

  // Personalization
  recent_post_title?: string;
  recent_post_url?: string;
  niche?: string;
  notes?: string;
  personalization_data?: Record<string, unknown>;

  // CRM
  hubspot_contact_id?: string;

  // Status
  status: ContactStatus;
  tracking_id?: string;

  // Timestamps
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  replied_at?: string;
  converted_at?: string;

  // Result
  backlink_url?: string;
  backlink_anchor?: string;

  created_at: string;
  updated_at: string;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  type: CampaignType;
  subject_template: string;
  body_template: string;
  usage_count: number;
  open_rate?: number;
  reply_rate?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OutreachEmailLog {
  id: string;
  contact_id: string;
  campaign_id: string;
  subject: string;
  body_html?: string;
  body_text?: string;
  status: "pending" | "sent" | "delivered" | "bounced" | "failed";
  resend_message_id?: string;
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  created_at: string;
}

// API Request/Response Types

export interface TriggerCampaignRequest {
  campaign_id: string;
  batch_size?: number; // How many to send in this batch
}

export interface TriggerCampaignResponse {
  success: boolean;
  queued_count: number;
  message: string;
}

export interface TrackEventRequest {
  tracking_id: string;
  event: "open" | "click";
  metadata?: {
    link_url?: string;
    user_agent?: string;
    ip_address?: string;
  };
}

export interface WebhookPayload {
  type:
    | "email.sent"
    | "email.delivered"
    | "email.bounced"
    | "email.opened"
    | "email.clicked";
  contact_id: string;
  campaign_id: string;
  tracking_id: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// n8n Webhook Payloads

export interface N8nOutreachWebhook {
  action: "send_email" | "update_status" | "log_event";
  contact: OutreachContact;
  campaign: OutreachCampaign;
  template?: OutreachTemplate;
  personalized_content?: {
    subject: string;
    body: string;
  };
}
