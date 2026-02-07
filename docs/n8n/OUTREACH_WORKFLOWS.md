# n8n Outreach Automation Workflows

This document describes how to set up n8n workflows for BestFoodWhere's cold outreach system.

## Overview

The outreach system uses:

- **Supabase** for storing campaigns, contacts, and tracking data
- **n8n** for workflow automation and email orchestration
- **Resend** for sending emails (use separate subdomain: `outreach.bestfoodwhere.sg`)
- **HubSpot** for CRM integration
- **OpenAI GPT-4** for email personalization

## Architecture

```
┌─────────────────┐     ┌─────────────┐     ┌──────────────┐
│  BFW Admin UI   │────▶│  Next.js    │────▶│   Supabase   │
│  (trigger)      │     │  API        │     │   (data)     │
└─────────────────┘     └──────┬──────┘     └──────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │    n8n      │
                        │  Workflow   │
                        └──────┬──────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
     ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
     │   Resend    │   │   HubSpot   │   │   OpenAI    │
     │   (email)   │   │   (CRM)     │   │   (AI)      │
     └─────────────┘   └─────────────┘   └─────────────┘
```

## Environment Variables

Set these in your n8n instance:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_xxxxxxxxxx
HUBSPOT_ACCESS_TOKEN=pat-xx-xxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxx
BFW_WEBHOOK_SECRET=your-secure-secret
BFW_API_URL=https://bestfoodwhere.sg
```

---

## Workflow 1: Food Blogger Outreach

### Trigger: Webhook

**URL:** `https://your-n8n.com/webhook/outreach`
**Method:** POST
**Payload from BFW API:**

```json
{
  "action": "send_batch",
  "campaign": { "id": "uuid", "name": "...", "type": "food-blogger" },
  "contacts": [
    {
      "id": "uuid",
      "email": "blogger@example.com",
      "first_name": "Jane",
      "website": "https://janefood.com",
      "recent_post_title": "Best Ramen in Singapore",
      "niche": "Japanese food",
      "tracking_id": "uuid"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Workflow Steps

```
[1. Webhook Trigger]
        │
        ▼
[2. Loop: For Each Contact]
        │
        ├──▶ [3. Fetch Template from Supabase]
        │           │
        │           ▼
        │    [4. GPT-4: Personalize Email]
        │           │
        │           ▼
        │    [5. Send Email via Resend]
        │           │
        │           ▼
        │    [6. Update Contact Status → "sent"]
        │           │
        │           ▼
        │    [7. Create/Update HubSpot Contact]
        │           │
        │           ▼
        │    [8. Log Email in Supabase]
        │
        ▼
[9. Callback to BFW API with results]
```

### Node Details

#### 3. Fetch Template (Supabase)

```sql
SELECT * FROM outreach_templates
WHERE type = 'food-blogger' AND is_active = true
LIMIT 1
```

#### 4. GPT-4 Personalization

**Prompt:**

```
You are writing a friendly outreach email to a Singapore food blogger.

Template:
{template.body_template}

Recipient Info:
- Name: {contact.first_name}
- Blog: {contact.website}
- Recent Post: {contact.recent_post_title}
- Niche: {contact.niche}

Instructions:
1. Replace all {placeholders} with actual values
2. Add 1-2 sentences referencing their recent post specifically
3. Keep the tone friendly and casual, not salesy
4. Keep it under 200 words
5. Do NOT include tracking links (we add those separately)

Output the final email body only, no explanations.
```

#### 5. Send Email (Resend)

```javascript
// Add tracking pixel and wrap links
const trackingPixel = `<img src="${BFW_API_URL}/api/outreach/track?t=${contact.tracking_id}&e=open" width="1" height="1" style="display:none" />`;

const wrapLinks = (html) => {
  return html.replace(
    /href="(https?:\/\/[^"]+)"/g,
    `href="${BFW_API_URL}/api/outreach/track?t=${contact.tracking_id}&e=click&url=$1"`
  );
};

const finalHtml = wrapLinks(personalizedBody) + trackingPixel;

// Send via Resend
POST https://api.resend.com/emails
{
  "from": "BestFoodWhere <outreach@mail.bestfoodwhere.sg>",
  "to": contact.email,
  "subject": personalizedSubject,
  "html": finalHtml,
  "headers": {
    "X-Entity-Ref-ID": contact.tracking_id
  }
}
```

#### 6. Update Status (Supabase)

```sql
UPDATE outreach_contacts
SET status = 'sent', sent_at = NOW()
WHERE id = {contact.id}
```

#### 7. HubSpot Contact

```javascript
POST https://api.hubapi.com/crm/v3/objects/contacts
{
  "properties": {
    "email": contact.email,
    "firstname": contact.first_name,
    "lastname": contact.last_name,
    "company": contact.company,
    "website": contact.website,
    "bfw_source": "outreach",
    "bfw_tags": "food-blogger,outreach-campaign"
  }
}
```

---

## Workflow 2: Handle Resend Webhooks

Resend sends webhooks for delivery events. Configure in Resend dashboard.

### Trigger: Webhook

**URL:** `https://your-n8n.com/webhook/resend-events`

### Workflow Steps

```
[1. Webhook Trigger (Resend)]
        │
        ▼
[2. Switch: Event Type]
        │
        ├── delivered ──▶ [3a. Update status to "delivered"]
        │
        ├── bounced ──▶ [3b. Update status to "bounced"]
        │
        └── complained ──▶ [3c. Update status to "unsubscribed"]
        │
        ▼
[4. Callback to BFW API]
```

---

## Workflow 3: Daily Campaign Scheduler

Automatically sends batches from active campaigns.

### Trigger: Cron

**Schedule:** `0 9 * * 1-5` (9 AM, Mon-Fri)

### Workflow Steps

```
[1. Cron Trigger]
        │
        ▼
[2. Fetch Active Campaigns from Supabase]
        │
        ▼
[3. For Each Campaign]
        │
        ├──▶ [4. Check daily_send_limit not exceeded]
        │           │
        │           ▼
        │    [5. Trigger BFW Outreach API]
        │           POST /api/outreach/trigger
        │           { campaign_id, batch_size: 10 }
        │
        ▼
[6. Log run to Supabase]
```

---

## Workflow 4: Reply Detection (Optional)

If you have email parsing set up (e.g., Mailparser, or n8n's IMAP node):

### Trigger: Email Received

**Folder:** Outreach inbox

### Workflow Steps

```
[1. Email Trigger (IMAP)]
        │
        ▼
[2. Extract sender email]
        │
        ▼
[3. Lookup contact by email in Supabase]
        │
        ▼
[4. If found: Update status to "replied"]
        │
        ▼
[5. GPT-4: Analyze if positive/interested]
        │
        ▼
[6. If positive: Create task in HubSpot/Slack alert]
```

---

## Adding Contacts to Campaigns

### Via n8n (Scraping Workflow)

```
[1. HTTP Request: Scrape food blogger directory]
        │
        ▼
[2. Extract: name, email, website, social]
        │
        ▼
[3. Enrich: Get domain authority (Moz/Ahrefs API)]
        │
        ▼
[4. Filter: DA > 20]
        │
        ▼
[5. Insert to Supabase outreach_contacts]
```

### Via CSV Import

Upload CSV to Supabase directly or use n8n spreadsheet node.

Required fields:

- `email` (required)
- `first_name`
- `website`
- `campaign_id`

---

## Tracking & Analytics

### Email Tracking Flow

1. **Open Tracking:**
   - Pixel: `<img src="/api/outreach/track?t={tracking_id}&e=open" />`
   - When loaded → status updates to "opened"

2. **Click Tracking:**
   - Links wrapped: `/api/outreach/track?t={tracking_id}&e=click&url={original_url}`
   - When clicked → status updates to "clicked" → redirects to original URL

3. **Conversion Tracking:**
   - Manual: Use PUT `/api/outreach/webhook` to mark as converted
   - Include `backlink_url` when they add a link to you

### Dashboard Queries

**Campaign Performance:**

```sql
SELECT
  name,
  target_count,
  sent_count,
  ROUND(100.0 * opened_count / NULLIF(sent_count, 0), 1) as open_rate,
  ROUND(100.0 * clicked_count / NULLIF(sent_count, 0), 1) as click_rate,
  ROUND(100.0 * replied_count / NULLIF(sent_count, 0), 1) as reply_rate,
  converted_count
FROM outreach_campaigns
WHERE status IN ('active', 'completed')
ORDER BY created_at DESC;
```

**Top Converting Contacts:**

```sql
SELECT
  email, website, domain_authority,
  backlink_url, backlink_anchor
FROM outreach_contacts
WHERE status = 'converted'
ORDER BY converted_at DESC;
```

---

## Best Practices

### Email Deliverability

1. **Use separate subdomain:** `outreach.bestfoodwhere.sg` or `mail.bestfoodwhere.sg`
2. **Warm up the domain:** Start with 10-20 emails/day, increase gradually
3. **Set up SPF, DKIM, DMARC** for the outreach domain
4. **Keep bounce rate < 2%:** Clean your lists

### Personalization

1. Always reference something specific about their content
2. Keep emails under 200 words
3. Ask a question to encourage reply
4. No attachments on first email

### Timing

1. Send Tuesday-Thursday for best response
2. Send 9-11 AM local time
3. Wait 5-7 days before follow-up
4. Max 3 follow-ups per contact

### Compliance

1. Include unsubscribe link (or honor replies)
2. Don't buy email lists
3. Target publicly available professional emails
4. Respect opt-outs immediately
