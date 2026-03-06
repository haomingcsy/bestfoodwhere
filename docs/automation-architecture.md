# BestFoodWhere Automation Architecture

> Plan document — review and approve before implementation.
> Generated: 2026-03-05

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State](#2-current-state)
3. [GHL API Capabilities & Limitations](#3-ghl-api-capabilities--limitations)
4. [Pipeline Design](#4-pipeline-design)
5. [Email Sequence Design](#5-email-sequence-design)
6. [n8n + GHL Integration Architecture](#6-n8n--ghl-integration-architecture)
7. [Workarounds for GHL API Limitations](#7-workarounds-for-ghl-api-limitations)
8. [Implementation Roadmap](#8-implementation-roadmap)
9. [Technical Appendix](#9-technical-appendix)

---

## 1. Executive Summary

This document defines the complete automation architecture for BestFoodWhere (BFW), covering lead management pipelines, email nurture sequences, and the integration layer between our Next.js application, GoHighLevel CRM, n8n workflow engine, and Supabase database. Email delivery is handled by GHL Workflows triggered by tag additions from n8n — all email templates live in GHL's visual email builder.

**What this covers:**

- 4 CRM pipelines for managing restaurant leads, partnerships, newsletter subscribers, and general inquiries
- 5 automated email sequences (21 total emails) for onboarding, nurturing, and re-engagement
- Full n8n workflow specifications for orchestrating automation between systems
- GHL API integration patterns with documented workarounds for API limitations
- GHL Workflow-based email delivery triggered by n8n tag additions
- A phased 4-week implementation roadmap

**Why this matters:**

BFW currently captures leads across 14 form submission points and syncs them to GHL, but has no automated follow-up, pipeline tracking, or email nurture sequences. This document turns raw lead capture into a full lifecycle management system.

---

## 2. Current State

### Form Infrastructure (Completed)

| Component | Status | Details |
|-----------|--------|---------|
| Form submission points | 14 active | All syncing to GHL via `/api/crm/contacts` |
| Supabase backup | Active | Every submission backed up to `form_submissions` table |
| Rate limiting | Active | All form endpoints rate-limited |
| GA4 events | Active | Fired on every form submission |
| Webhook failure logging | Active | Failures logged to `webhook_failures` table |
| Traffic channel detection | Active | 9 channels: direct, seo, google_ads, meta, linkedin, tiktok, chatgpt, paid_ads, referral |
| Lead scoring | Active | 0-100 scoring in `calculateInitialLeadScore()` at `lib/ghl/utils.ts` |
| GHL custom fields | 23 mapped | Field ID resolution via `resolveCustomFieldIds()` |

### Form Sources (9 Active)

| Source Key | Description | n8n Webhook |
|------------|-------------|-------------|
| `bfw_website` | Main site newsletter signup | N8N_WEBHOOK_NEWSLETTER |
| `bfw_vip_club` | VIP club registration | N8N_WEBHOOK_NEWSLETTER |
| `bfw_signup` | General signup | N8N_WEBHOOK_NEWSLETTER |
| `bfw_restaurant_signup` | Restaurant owner signup | N8N_WEBHOOK_NEWSLETTER |
| `contact_form` | General contact | N8N_WEBHOOK_CONTACT |
| `advertiser_inquiry` | Restaurant advertising interest | N8N_WEBHOOK_CONTACT |
| `recipe_newsletter` | Recipe newsletter signup | N8N_WEBHOOK_RECIPE |
| `career_application` | Job applications | N8N_WEBHOOK_CAREER |
| `report_issue` | Issue reports | N8N_WEBHOOK_REPORT |

### Outreach System (Existing)

- `outreach_campaigns` and `outreach_contacts` tables in Supabase
- `/api/outreach/trigger` — campaign triggering
- `/api/outreach/track` — open/click tracking
- `/api/outreach/webhook` — inbound webhook processing
- Outreach webhook: `N8N_WEBHOOK_OUTREACH`

### Email (Existing)

- Recipe welcome email template at `lib/email/recipe-welcome.ts` (legacy, to be migrated to GHL)
- Branded HTML template with BFW logo hosted on Supabase storage (reference for GHL template design)

---

## 3. GHL API Capabilities & Limitations

### Capability Matrix

| Feature | API Support | Method | Notes |
|---------|-------------|--------|-------|
| **Contacts — CRUD** | Full | `POST/GET/PUT/DELETE /contacts` | Upsert by email via `POST /contacts/upsert` |
| **Contacts — Search** | Full | `GET /contacts/search` | Filter by email, phone, tags, custom fields |
| **Contacts — Tags** | Full | `POST /contacts/{id}/tags` | Add/remove tags; tag changes can trigger GHL workflows |
| **Contacts — Notes** | Full | `POST /contacts/{id}/notes` | Attach notes to contact records |
| **Contacts — Tasks** | Full | `POST /contacts/{id}/tasks` | Create follow-up tasks assigned to team members |
| **Opportunities — CRUD** | Full | `POST/GET/PUT/DELETE /opportunities` | Upsert supported |
| **Opportunities — Pipeline** | Full | `POST /opportunities` with `pipelineId` + `pipelineStageId` | Assign to specific pipeline stage |
| **Pipelines — Read** | Read only | `GET /pipelines` | List pipelines and their stages |
| **Pipelines — Create** | **NO** | N/A | Must create in GHL dashboard |
| **Workflows — Create** | **NO** | N/A | Must create in GHL dashboard |
| **Workflows — Trigger** | Indirect | Tag changes, custom field updates, inbound webhooks | Workflows listen for these events |
| **Email — Send via Workflows** | Via tag triggers | n8n adds a tag to a contact → GHL Workflow fires → sends email using GHL's built-in email builder | All email templates are built in GHL's visual email builder. n8n controls sequence timing and logic; GHL handles composition, delivery, and tracking. |
| **Webhooks — Receive** | 50+ event types | Registered in GHL dashboard | contact.created, opportunity.statusChanged, etc. |
| **Campaigns/Sequences** | **DEPRECATED** | N/A | Replaced by Workflows |
| **Rate Limits** | — | — | 100 requests / 10 seconds burst, 200,000 / day |

### Critical Limitations Summary

1. **Cannot create pipelines via API** — must be created manually in GHL dashboard first, then use returned IDs in API calls
2. **Cannot create workflows via API** — all workflow automation must be built in GHL dashboard; n8n triggers workflows via tag additions
3. **Email sending is via GHL Workflows** — n8n adds tags to contacts (e.g., `welcome_email_1`), GHL Workflows listen for those tags and send emails using GHL's built-in email builder. Templates are designed in GHL's visual email builder, not in code.
4. **Webhook registration is dashboard-only** — cannot programmatically register webhook listeners
5. **Campaign/sequence APIs are deprecated** — all sequencing logic lives in n8n; email delivery is handled by GHL Workflows triggered by tags

---

## 4. Pipeline Design

### Pipeline 1 — Restaurant Advertising Leads

**Purpose:** Track restaurant owners and businesses interested in advertising on BFW, from initial inquiry through to deal closure.

**Stages:**

| Stage | Description | Trigger |
|-------|-------------|---------|
| New Lead | Initial form submission received | Form source: `advertiser_inquiry` or `bfw_restaurant_signup` |
| Contacted | First outreach sent (automated or manual) | Email sequence Email 1 sent |
| Meeting Scheduled | Discovery call booked | Manual move or calendar integration |
| Proposal Sent | Advertising package proposal delivered | Manual move after proposal email |
| Negotiating | Active pricing or terms discussion | Manual move |
| Won | Deal closed, payment received | Stripe webhook or manual |
| Lost | Lead declined or went cold | Manual move or 30-day inactivity |

**GHL Dashboard Setup:**

1. Navigate to **Settings** (gear icon, bottom left) → **Pipelines**
2. Click **+ Create Pipeline**
3. Name: `Restaurant Advertising Leads`
4. Add stages in order: New Lead, Contacted, Meeting Scheduled, Proposal Sent, Negotiating, Won, Lost
5. For each stage, click the stage name to set its color (suggested: blue, yellow, orange, purple, orange, green, red)
6. Click **Save**
7. After saving, click the pipeline name → note the **Pipeline ID** from the URL: `https://app.gohighlevel.com/v2/location/{locationId}/opportunities/{pipelineId}`
8. Click each stage → note the **Stage ID** from the URL or use the API: `GET /pipelines/{pipelineId}` to retrieve all stage IDs

**API Call — Create Opportunity When Lead Arrives:**

```
POST https://services.leadconnectorhq.com/opportunities/upsert
Authorization: Bearer {access_token}
Version: 2021-07-28

{
  "pipelineId": "{PIPELINE_1_ID}",
  "pipelineStageId": "{NEW_LEAD_STAGE_ID}",
  "locationId": "aj2VKGwRWaEEQpMnrbNj",
  "contactId": "{ghl_contact_id}",
  "name": "Ad Lead — {restaurant_name}",
  "status": "open",
  "monetaryValue": 0,
  "source": "BFW Website"
}
```

**API Call — Move to Next Stage:**

```
PUT https://services.leadconnectorhq.com/opportunities/{opportunityId}
Authorization: Bearer {access_token}
Version: 2021-07-28

{
  "pipelineStageId": "{CONTACTED_STAGE_ID}",
  "status": "open"
}
```

---

### Pipeline 2 — Partnership Inquiries

**Purpose:** Track business partnership and collaboration requests from brands, influencers, and organizations.

**Stages:**

| Stage | Description | Trigger |
|-------|-------------|---------|
| Inquiry Received | Contact form with partnership intent | `contact_form` where subject contains "partnership" or "business" |
| Evaluated | Team has reviewed the inquiry | Manual move after internal assessment |
| In Discussion | Active conversations happening | Manual move after first reply |
| Active Partner | Partnership formalized | Manual move |
| Declined | Not a fit | Manual move |

**GHL Dashboard Setup:**

1. **Settings** → **Pipelines** → **+ Create Pipeline**
2. Name: `Partnership Inquiries`
3. Add stages: Inquiry Received, Evaluated, In Discussion, Active Partner, Declined
4. Save and note Pipeline ID + Stage IDs (same method as Pipeline 1)

**Routing Logic (in n8n):**

When a `contact_form` submission arrives at the CONTACT webhook, check if the `subject` field contains "partnership", "business", "collaborate", or "collaboration". If yes, create an opportunity in Pipeline 2 instead of Pipeline 4.

---

### Pipeline 3 — Newsletter Subscribers

**Purpose:** Track subscriber engagement lifecycle from signup through engagement tiers to churn.

**Stages:**

| Stage | Description | Trigger |
|-------|-------------|---------|
| Subscribed | Just signed up | Form source: `bfw_website`, `bfw_vip_club`, `recipe_newsletter` |
| Engaged | Opened 3+ emails in last 30 days | GHL email engagement tracking |
| Highly Engaged | Opened 5+ emails AND clicked 2+ links | GHL email engagement tracking |
| Inactive | No opens in 30+ days | n8n cron check |
| Churned | Unsubscribed or bounced | GHL DND status or manual unsubscribe |

**GHL Dashboard Setup:**

1. **Settings** → **Pipelines** → **+ Create Pipeline**
2. Name: `Newsletter Subscribers`
3. Add stages: Subscribed, Engaged, Highly Engaged, Inactive, Churned
4. Save and note Pipeline ID + Stage IDs

**Engagement Tracking Strategy:**

GHL tracks email opens and clicks internally for emails sent via GHL Workflows. Engagement tier calculation:

1. GHL sends open/click webhook events to n8n (via registered GHL webhooks)
2. n8n processes these events and writes to Supabase `engagement_events` table
3. n8n cron job (daily) calculates engagement tier per subscriber from Supabase
4. n8n pushes the engagement status to the GHL contact's custom field `bfw_engagement_tier` and moves their opportunity to the matching pipeline stage

---

### Pipeline 4 — General Contact Inquiries

**Purpose:** Track general contact form submissions through to resolution.

**Stages:**

| Stage | Description | Trigger |
|-------|-------------|---------|
| New | Contact form submitted | `contact_form` (non-partnership) |
| Responded | Team has replied | Manual move or auto after email sent |
| Resolved | Issue addressed | Manual move |
| Archived | Closed, no further action | Manual move or 14-day auto-archive |

**GHL Dashboard Setup:**

1. **Settings** → **Pipelines** → **+ Create Pipeline**
2. Name: `General Contact Inquiries`
3. Add stages: New, Responded, Resolved, Archived
4. Save and note Pipeline ID + Stage IDs

---

## 5. Email Sequence Design

All sequences use **n8n + GHL** as the delivery mechanism. n8n handles sequence timing, branching logic, and unsubscribe checks. When it is time to send an email, n8n adds a tag (e.g., `welcome_email_1`) to the GHL contact via the API. A corresponding GHL Workflow listens for that tag addition and sends the email using GHL's built-in email builder. All email templates are designed and maintained in GHL's visual email builder — no email HTML lives in code.

### Sequence 1 — Newsletter Welcome

**Trigger:** Newsletter signup via `bfw_website`, `bfw_vip_club`, or `bfw_signup` form sources.
**Cadence:** 5 emails over 12 days.
**Goal:** Onboard subscriber, establish brand, drive first engagement.

| # | Day | Subject Line | Content Summary |
|---|-----|-------------|-----------------|
| 1 | 0 (immediate) | Welcome to the food club | What BFW is, what to expect (frequency, content type), top 3 trending restaurants this week with photos and links. Clear CTA: "Explore menus on BFW" |
| 2 | 2 | What kind of foodie are you? | Interactive element: link to a cuisine preference quiz or a curated "If you like X, try Y" guide. Drives profile enrichment (updates `bfw_favorite_cuisines` custom field). |
| 3 | 5 | Deals you won't find on Google | Compilation of 5 exclusive BFW deals/promotions. Create urgency with "This week only" framing. CTA: "See all deals" |
| 4 | 8 | How we find Singapore's hidden gems | Behind-the-scenes story of how BFW discovers and vets restaurants. Builds brand trust and emotional connection. Subtle CTA: "Nominate a restaurant" |
| 5 | 12 | You've been here 12 days — here's a gift | VIP upgrade prompt (if applicable) or exclusive content unlock. Feedback ask: "What do you want to see more of?" Simple reply or 1-click survey. |

**Implementation:**

```
n8n Workflow: "Newsletter Welcome Sequence"
Trigger: Webhook (N8N_WEBHOOK_NEWSLETTER)
Filter: source IN (bfw_website, bfw_vip_club, bfw_signup)

Nodes:
1. Webhook Trigger → receive payload
2. IF node → check source is newsletter (not restaurant_signup)
3. GHL API: Add tag `welcome_email_1` to contact (immediate)
   → GHL Workflow "Welcome Sequence" fires and sends Email 1
4. Wait 2 days
5. GHL API: Check contact DND status or `unsubscribed` tag → IF unsubscribed, stop
6. GHL API: Add tag `welcome_email_2` to contact
   → GHL Workflow sends Email 2
7. Wait 3 days
8. Unsubscribe check → GHL API: Add tag `welcome_email_3` → GHL Workflow sends Email 3
9. Wait 3 days
10. Unsubscribe check → GHL API: Add tag `welcome_email_4` → GHL Workflow sends Email 4
11. Wait 4 days
12. Unsubscribe check → GHL API: Add tag `welcome_email_5` → GHL Workflow sends Email 5
13. GHL API: Add tag "welcome_sequence_complete" to contact
```

> **GHL Workflow required:** Create a GHL Workflow named "Welcome Sequence" with trigger "Tag Added" matching `welcome_email_*`. The workflow branches on the specific tag, sends the corresponding email template, then removes the trigger tag to keep the contact's tag list clean.

**Metrics to Track:**

- Open rate per email (target: Email 1 > 60%, overall > 35%) — tracked via GHL's built-in email stats
- Click rate per email (target: > 5%) — tracked via GHL's built-in email stats
- Unsubscribe rate per email (flag if > 2% on any single email)
- Sequence completion rate (target: > 70% reach Email 5)

---

### Sequence 2 — Advertiser Lead Nurture

**Trigger:** `advertiser_inquiry` form source.
**Cadence:** 5 emails over 14 days.
**Goal:** Convert advertiser inquiry into a booked meeting or paid subscription.

| # | Day | Subject Line | Content Summary |
|---|-----|-------------|-----------------|
| 1 | 0 (immediate) | Got your inquiry — here's what happens next | Thank you, confirm receipt. Include: BFW monthly traffic stats (visitors, page views, top cuisines), timeline for follow-up (24-48 hours), what to prepare for a call. |
| 2 | 2 | How Nasi Lemak House grew 40% with BFW | Case study format (real or illustrative). Before/after metrics. Show the value of a BFW listing: search visibility, menu page views, click-to-order conversions. CTA: "See our advertising options" |
| 3 | 5 | Your advertising options at a glance | Clear breakdown of listing tiers (Basic, Featured, Premium). Pricing table. Feature comparison. CTA: "Book a 15-min walkthrough" with calendar link. |
| 4 | 9 | Don't just take our word for it | 3 short testimonials from restaurant partners. Quote format with restaurant name and location. Social proof builds trust. CTA: "Join 730+ restaurants on BFW" |
| 5 | 14 | Last chance: 20% off your first month | Direct offer with deadline (7 days). Limited-time incentive. Clear pricing with discount applied. CTA: "Claim your spot" with payment link. Fallback: "Not ready? Reply and tell us what you need." |

**Implementation:**

```
n8n Workflow: "Advertiser Lead Nurture"
Trigger: Webhook (N8N_WEBHOOK_CONTACT)
Filter: source = "advertiser_inquiry"

Nodes:
1. Webhook Trigger → receive payload
2. IF node → source === "advertiser_inquiry"
3. GHL API: Create opportunity in Pipeline 1 (Restaurant Advertising Leads), stage "New Lead"
4. GHL API: Add tag `nurture_email_1` to contact (immediate)
   → GHL Workflow "Advertiser Nurture" fires and sends Email 1
5. GHL API: Move opportunity to "Contacted" stage
6. Wait 2 days → Unsubscribe check → GHL API: Add tag `nurture_email_2`
   → GHL Workflow sends Email 2
7. Wait 3 days → Unsubscribe check → GHL API: Add tag `nurture_email_3`
   → GHL Workflow sends Email 3
8. Wait 4 days → Unsubscribe check → GHL API: Add tag `nurture_email_4`
   → GHL Workflow sends Email 4
9. Wait 5 days → Unsubscribe check → GHL API: Add tag `nurture_email_5`
   → GHL Workflow sends Email 5
10. GHL API: Add tag "nurture_sequence_complete"
11. GHL API: Create task on contact — "Follow up manually if no meeting booked"
```

> **GHL Workflow required:** Create a GHL Workflow named "Advertiser Nurture" with trigger "Tag Added" matching `nurture_email_*`. The workflow branches on the specific tag, sends the corresponding email template, then removes the trigger tag.

**Metrics to Track:**

- Email-to-meeting conversion rate (target: > 8%)
- Reply rate (target: > 5%)
- Offer redemption rate on Email 5 (target: > 3%)
- Pipeline progression: % of leads reaching "Meeting Scheduled" within 21 days
- Open/click rates tracked via GHL's built-in email stats

---

### Sequence 3 — Partnership Follow-Up

**Trigger:** `contact_form` with subject containing "partnership", "business", "collaborate", or "collaboration".
**Cadence:** 4 emails over 10 days.
**Goal:** Qualify partnership interest and schedule a discussion.

| # | Day | Subject Line | Content Summary |
|---|-----|-------------|-----------------|
| 1 | 0 (immediate) | Partnership inquiry received | Acknowledge receipt. Brief overview of BFW's reach (730+ brands, 840 locations, 19 malls). Ask: "To help us understand your proposal, could you share: (1) your organization, (2) partnership type, (3) timeline?" |
| 2 | 3 | How BFW partnerships work | Overview of partnership models: content collaborations, data partnerships, co-marketing, API integrations. Link to a partnerships page (if exists) or PDF. |
| 3 | 6 | Let's find a time to talk | Direct calendar booking link. Emphasize: 15 minutes, no commitment, just exploring fit. Include 2-3 suggested time slots. |
| 4 | 10 | Checking in on your partnership idea | Gentle follow-up. Restate openness. Provide alternative: "If timing isn't right, reply with 'later' and we'll check back in 3 months." |

**Implementation:**

```
n8n Workflow: "Partnership Follow-Up"
Trigger: Webhook (N8N_WEBHOOK_CONTACT)
Filter: source = "contact_form" AND subject matches partnership keywords

Nodes:
1. Webhook Trigger → receive payload
2. IF node → subject regex match: /partner|business|collaborat/i
3. GHL API: Create opportunity in Pipeline 2 (Partnership Inquiries), stage "Inquiry Received"
4. GHL API: Add tag `partnership_email_1` to contact
   → GHL Workflow "Partnership Follow-Up" fires and sends Email 1
5. Wait 3 days → GHL API: Add tag `partnership_email_2`
   → GHL Workflow sends Email 2
6. GHL API: Move opportunity to "Evaluated"
7. Wait 3 days → GHL API: Add tag `partnership_email_3`
   → GHL Workflow sends Email 3
8. Wait 4 days → GHL API: Add tag `partnership_email_4`
   → GHL Workflow sends Email 4
9. GHL API: Add tag "partnership_sequence_complete"
```

> **GHL Workflow required:** Create a GHL Workflow named "Partnership Follow-Up" with trigger "Tag Added" matching `partnership_email_*`. The workflow branches on the specific tag, sends the corresponding email template, then removes the trigger tag.

**Metrics to Track:**

- Reply rate (target: > 15% — partnership inquiries are higher intent)
- Meeting book rate (target: > 10%)
- Time to first response
- Open/click rates tracked via GHL's built-in email stats

---

### Sequence 4 — Re-engagement

**Trigger:** n8n cron job detects contacts with no email opens in 30+ days.
**Cadence:** 3 emails over 7 days.
**Goal:** Re-activate dormant subscribers or confirm churn.

| # | Day | Subject Line | Content Summary |
|---|-----|-------------|-----------------|
| 1 | 0 | Singapore's food scene changed while you were away | "Here's what you missed" — 3 new trending restaurants, 2 new deals, 1 new cuisine guide. Framed as exclusivity: "We saved these for you." |
| 2 | 3 | A little something to welcome you back | Exclusive re-engagement offer: early access to a new feature, a curated restaurant list, or a small discount code for a partner restaurant. CTA: "Explore now" |
| 3 | 7 | Should we stop sending these? | Direct and respectful. Two buttons: "Keep me subscribed" (updates engagement timestamp) and "Unsubscribe" (processes unsubscribe). If no action in 7 days, auto-move to Churned stage. |

**Implementation:**

```
n8n Workflow: "Re-engagement Sequence"
Trigger: Cron — runs daily at 10:00 AM SGT

Nodes:
1. Cron Trigger (daily)
2. Supabase: Query contacts WHERE last_email_open < NOW() - 30 days
   AND NOT in active re-engagement sequence
   AND subscribed = true
3. Loop over results:
   a. Supabase: Mark contact as "in_reengagement_sequence"
   b. GHL API: Add tag `reengagement_email_1` to contact
      → GHL Workflow "Re-engagement" fires and sends Email 1
4. [Separate n8n workflow or same with Wait nodes]
5. Wait 3 days → check if re-engaged (GHL webhook events for opens/clicks) → IF yes, stop and update tier
6. IF no → GHL API: Add tag `reengagement_email_2`
   → GHL Workflow sends Email 2
7. Wait 4 days → check if re-engaged
8. IF no → GHL API: Add tag `reengagement_email_3`
   → GHL Workflow sends Email 3
9. Wait 7 days → check if any action taken
10. IF no action → GHL API: Move subscriber opportunity to "Churned"
11. Supabase: Update subscriber status to "churned"
```

> **GHL Workflow required:** Create a GHL Workflow named "Re-engagement" with trigger "Tag Added" matching `reengagement_email_*`. The workflow branches on the specific tag, sends the corresponding email template, then removes the trigger tag.

**Metrics to Track:**

- Re-engagement rate (target: > 15% reactivate)
- Unsubscribe rate from Email 3 (expected: 20-30% — this is healthy list cleaning)
- False positive rate (contacts marked inactive who actually engage)
- Open/click rates tracked via GHL's built-in email stats

---

### Sequence 5 — Post-Advertiser Onboarding

**Trigger:** Stripe `checkout.session.completed` webhook (payment success for advertising subscription).
**Cadence:** 4 emails over 7 days.
**Goal:** Ensure successful onboarding and reduce early churn.

| # | Day | Subject Line | Content Summary |
|---|-----|-------------|-----------------|
| 1 | 0 (immediate) | You're live on BFW — here's your dashboard | Payment confirmation. Dashboard login link. Quick-start checklist: (1) upload logo, (2) verify menu, (3) add photos, (4) set business hours. Support email/chat link. |
| 2 | 1 | 3 things top-performing restaurants do on BFW | Actionable tips: complete profile, respond to reviews, update menu seasonally. Include stats: "Restaurants with photos get 3x more views." |
| 3 | 3 | Your first week stats are in | Even if minimal, share: page views, menu views, search appearances. Frame positively. Suggest: "Boost visibility by adding 5 more menu photos." |
| 4 | 7 | How's your first week going? | Check-in email. Ask for feedback. Offer a 15-minute onboarding call if needed. Link to FAQ/help center. |

**Implementation:**

```
n8n Workflow: "Advertiser Onboarding"
Trigger: Webhook from Stripe (checkout.session.completed) OR
         Webhook from BFW app (/api/stripe/webhook forwards to n8n)

Nodes:
1. Webhook Trigger → extract customer email, plan details
2. GHL API: Move opportunity in Pipeline 1 to "Won" stage
3. GHL API: Add tag "paying_customer"
4. GHL API: Add tag `onboarding_email_1` to contact
   → GHL Workflow "Advertiser Onboarding" fires and sends Email 1
5. Wait 1 day → GHL API: Add tag `onboarding_email_2`
   → GHL Workflow sends Email 2
6. Wait 2 days → GHL API: Add tag `onboarding_email_3`
   → GHL Workflow sends Email 3
7. Wait 4 days → GHL API: Add tag `onboarding_email_4`
   → GHL Workflow sends Email 4
8. GHL API: Add tag "onboarding_complete"
9. GHL API: Create task — "30-day check-in with {restaurant_name}"
```

> **GHL Workflow required:** Create a GHL Workflow named "Advertiser Onboarding" with trigger "Tag Added" matching `onboarding_email_*`. The workflow branches on the specific tag, sends the corresponding email template, then removes the trigger tag.

**Metrics to Track:**

- Profile completion rate within 7 days (target: > 60%)
- Support ticket rate during onboarding (lower is better)
- 30-day retention rate
- Open/click rates tracked via GHL's built-in email stats

---

## 6. n8n + GHL Integration Architecture

### 6A. BFW to n8n to GHL Flows

#### Workflow 1: Newsletter Welcome Sequence Orchestrator

```
Trigger:     N8N_WEBHOOK_NEWSLETTER
Filter:      source IN (bfw_website, bfw_vip_club, bfw_signup)
GHL calls:   POST /contacts/{id}/tags (add "welcome_sequence_started")
             POST /contacts/{id}/tags (add "welcome_email_1" through "welcome_email_5" on schedule)
             POST /contacts/{id}/tags (add "welcome_sequence_complete")
             POST /opportunities/upsert (Pipeline 3, "Subscribed" stage)
             → Each tag addition triggers GHL Workflow "Welcome Sequence" which sends the email
Supabase:    SELECT FROM subscribers to check unsubscribe status
```

#### Workflow 2: Advertiser Lead Nurture Orchestrator

```
Trigger:     N8N_WEBHOOK_CONTACT (filtered: source = advertiser_inquiry)
GHL calls:   POST /opportunities/upsert (Pipeline 1, "New Lead" stage)
             PUT /opportunities/{id} (move to "Contacted" on Email 1)
             POST /contacts/{id}/tags (add "nurture_email_1" through "nurture_email_5" on schedule)
             POST /contacts/{id}/tags (add "nurture_sequence_complete")
             POST /contacts/{id}/tasks (create follow-up task)
             → Each tag addition triggers GHL Workflow "Advertiser Nurture" which sends the email
```

#### Workflow 3: Partnership Follow-Up Orchestrator

```
Trigger:     N8N_WEBHOOK_CONTACT (filtered: subject matches partnership keywords)
GHL calls:   POST /opportunities/upsert (Pipeline 2, "Inquiry Received")
             PUT /opportunities/{id} (move to "Evaluated" after Email 2)
             POST /contacts/{id}/tags (add "partnership_email_1" through "partnership_email_4" on schedule)
             → Each tag addition triggers GHL Workflow "Partnership Follow-Up" which sends the email
```

#### Workflow 4: Re-engagement Checker (Cron)

```
Trigger:     Cron — daily at 10:00 AM SGT (02:00 UTC)
GHL calls:   PUT /opportunities/{id} (move to "Inactive" or "Churned")
             PUT /contacts/{id} (update custom field bfw_engagement_tier)
             POST /contacts/{id}/tags (add "reengagement_email_1" through "reengagement_email_3" on schedule)
             → Each tag addition triggers GHL Workflow "Re-engagement" which sends the email
Supabase:    SELECT inactive contacts
             UPDATE contact engagement status
```

#### Workflow 5: Opportunity Creator

```
Trigger:     N8N_WEBHOOK_NEWSLETTER (for Pipeline 3)
             N8N_WEBHOOK_CONTACT (for Pipelines 1, 2, 4)
GHL calls:   POST /opportunities/upsert
             Assigns to correct pipeline based on source + subject routing:
               advertiser_inquiry          → Pipeline 1 (Advertising)
               contact_form + partnership  → Pipeline 2 (Partnership)
               newsletter sources          → Pipeline 3 (Newsletter)
               contact_form (general)      → Pipeline 4 (General)
Supabase:    INSERT opportunity_id mapping into pipeline_contacts table
```

#### Workflow 6: Pipeline Stage Updater

```
Trigger:     Multiple — called by other workflows or GHL webhooks
GHL calls:   PUT /opportunities/{id} with new pipelineStageId
             POST /contacts/{id}/notes (log stage change reason)
Supabase:    INSERT INTO pipeline_events (opportunity_id, old_stage, new_stage, timestamp)
```

---

### 6B. GHL to n8n Flows

Register these webhook listeners in GHL dashboard (**Settings** → **Webhooks** → **+ Add Webhook**):

| GHL Event | n8n Endpoint | Action |
|-----------|-------------|--------|
| `contact.created` | `{n8n_base}/webhook/ghl-contact-created` | Sync new contact to Supabase `ghl_contacts_sync` table |
| `contact.tagAdded` | `{n8n_base}/webhook/ghl-tag-added` | Route: if tag = "meeting_booked" → move Pipeline 1 to "Meeting Scheduled" |
| `opportunity.statusChanged` | `{n8n_base}/webhook/ghl-opp-status` | Update Supabase `pipeline_events`, trigger stage-specific actions |
| `opportunity.stageChanged` | `{n8n_base}/webhook/ghl-opp-stage` | Log stage transition, trigger appropriate automation |
| `task.completed` | `{n8n_base}/webhook/ghl-task-done` | Update Supabase, trigger next action if applicable |
| `contact.deleted` | `{n8n_base}/webhook/ghl-contact-deleted` | Remove from Supabase sync table, stop active sequences |

**GHL Dashboard Webhook Setup Steps:**

1. Go to **Settings** → **Business Settings** → **Integrations** → **Webhooks**
2. Click **+ Add Webhook**
3. Enter the n8n webhook URL (e.g., `https://your-n8n.app/webhook/ghl-contact-created`)
4. Select the event type (e.g., `contact.created`)
5. Click **Save**
6. Test by creating a test contact in GHL — verify n8n receives the payload

---

### 6C. n8n to Supabase Flows

#### Contact Sync

```
Trigger:     GHL webhook (contact.created, contact.updated)
Supabase:    UPSERT INTO ghl_contacts_sync (
               ghl_contact_id, email, first_name, last_name,
               tags, custom_fields, synced_at
             )
```

#### Email Engagement Tracking

```
Trigger:     GHL webhook events (email opened, email clicked, email bounced)
             — GHL sends these events when emails sent via GHL Workflows are interacted with
Supabase:    INSERT INTO engagement_events (
               email, event_type, sequence_name,
               email_number, metadata, created_at
             )
```

#### Daily Engagement Report

```
Trigger:     Cron — daily at 11:00 PM SGT
Supabase:    Query engagement_events grouped by sequence
             Calculate: open rates, click rates, unsubscribes
             INSERT INTO daily_reports
GHL:         Update contact custom fields with engagement tier
```

---

### 6D. Full Data Flow Diagrams

#### Newsletter Signup to Welcome Sequence to Engagement Tracking

```
User signs up on bestfoodwhere.sg
         │
         ▼
  /api/crm/contacts (Next.js)
         │
         ├──► Supabase: form_submissions (backup)
         ├──► GHL API: upsert contact (23 custom fields)
         └──► n8n: N8N_WEBHOOK_NEWSLETTER
                    │
                    ▼
              n8n Workflow: "Newsletter Welcome"
                    │
                    ├──► GHL API: create opportunity (Pipeline 3, "Subscribed")
                    ├──► GHL API: add tag "welcome_sequence_started"
                    │
                    ├──► Day 0:  GHL API: add tag `welcome_email_1`
                    │             → GHL Workflow sends Email 1
                    ├──► Day 2:  GHL API: add tag `welcome_email_2`
                    │             → GHL Workflow sends Email 2
                    ├──► Day 5:  GHL API: add tag `welcome_email_3`
                    │             → GHL Workflow sends Email 3
                    ├──► Day 8:  GHL API: add tag `welcome_email_4`
                    │             → GHL Workflow sends Email 4
                    └──► Day 12: GHL API: add tag `welcome_email_5`
                                  → GHL Workflow sends Email 5
                                                          │
                    ┌─────────────────────────────────────┘
                    ▼
              GHL tracks opens/clicks internally
                    │
                    ▼
              GHL fires webhook events to n8n
                    │
                    ▼
              n8n writes to Supabase: engagement_events
                    │
                    ▼
              n8n Cron (daily): calculate engagement tier
                    │
                    ├──► GHL API: update custom field bfw_engagement_tier
                    └──► GHL API: move opportunity to "Engaged" / "Highly Engaged"
```

#### Advertiser Inquiry to Lead Nurture to Pipeline Management

```
Restaurant owner fills out advertiser inquiry form
         │
         ▼
  /api/crm/contacts (Next.js)
         │
         ├──► Supabase: form_submissions
         ├──► GHL API: upsert contact
         │    (bfw_source=advertiser_inquiry, lead_score calculated)
         └──► n8n: N8N_WEBHOOK_CONTACT
                    │
                    ▼
              n8n: IF source = "advertiser_inquiry"
                    │
                    ├──► GHL API: create opportunity
                    │    Pipeline 1 "Restaurant Advertising Leads"
                    │    Stage: "New Lead"
                    │
                    ├──► Day 0:  GHL API: add tag `nurture_email_1`
                    │             → GHL Workflow sends Email 1 (confirmation + stats)
                    │    └──► GHL API: move to "Contacted"
                    ├──► Day 2:  GHL API: add tag `nurture_email_2`
                    │             → GHL Workflow sends Email 2 (case study)
                    ├──► Day 5:  GHL API: add tag `nurture_email_3`
                    │             → GHL Workflow sends Email 3 (pricing options)
                    ├──► Day 9:  GHL API: add tag `nurture_email_4`
                    │             → GHL Workflow sends Email 4 (testimonials)
                    └──► Day 14: GHL API: add tag `nurture_email_5`
                                  → GHL Workflow sends Email 5 (limited offer)
                         └──► GHL API: add tag "nurture_complete"
                         └──► GHL API: create task "Manual follow-up"
                                          │
                    ┌─────────────────────┘
                    ▼
              If meeting booked (GHL tag "meeting_booked"):
                    │
                    ▼
              GHL webhook → n8n → move to "Meeting Scheduled"
                    │
                    ▼
              If proposal sent (manual GHL action):
                    → "Proposal Sent" → "Negotiating"
                    │
                    ▼
              If Stripe payment received:
                    │
                    ▼
              n8n: "Advertiser Onboarding" sequence
                    ├──► GHL API: move to "Won"
                    └──► 4-email onboarding sequence (via GHL tag-triggered Workflow)
```

#### Re-engagement Flow

```
n8n Cron (daily 10:00 AM SGT)
         │
         ▼
  Supabase: SELECT contacts
  WHERE last_email_open < NOW() - INTERVAL '30 days'
    AND subscribed = true
    AND NOT in_reengagement = true
         │
         ▼
  For each inactive contact:
         │
         ├──► Supabase: SET in_reengagement = true
         ├──► GHL API: move opportunity (Pipeline 3) to "Inactive"
         │
         ├──► Day 0: GHL API: add tag `reengagement_email_1`
         │           → GHL Workflow sends "Singapore's food scene changed"
         │    ▼
         │    Check: any open/click in 3 days? (via GHL webhook events)
         │    ├── YES → Stop sequence, move to "Engaged", clear flag
         │    └── NO ──► Day 3: GHL API: add tag `reengagement_email_2`
         │                       → GHL Workflow sends "Welcome back offer"
         │               ▼
         │               Check: any open/click in 4 days?
         │               ├── YES → Stop, move to "Engaged"
         │               └── NO ──► Day 7: GHL API: add tag `reengagement_email_3`
         │                                  → GHL Workflow sends "Should we stop?"
         │                           ▼
         │                           Wait 7 more days
         │                           ├── Action taken → update accordingly
         │                           └── No action → move to "Churned"
         │                                           Supabase: subscribed = false
         └──► GHL API: update bfw_engagement_tier custom field
```

---

## 7. Workarounds for GHL API Limitations

### Pipeline Creation (Manual Required)

**Limitation:** GHL API cannot create pipelines or pipeline stages.

**Workaround:** Create all 4 pipelines manually in GHL dashboard before any automation runs.

**Steps (one-time setup, ~15 minutes):**

1. Log into GHL: `https://app.gohighlevel.com`
2. Select location: `aj2VKGwRWaEEQpMnrbNj`
3. For each pipeline (see Section 4):
   - Navigate to **Settings** → **Pipelines**
   - Click **+ Create Pipeline**
   - Enter pipeline name
   - Add stages in the specified order
   - Click **Save**
4. After all 4 pipelines are created, use the API to retrieve IDs:
   ```
   GET https://services.leadconnectorhq.com/pipelines
   Authorization: Bearer {access_token}
   Version: 2021-07-28
   ```
5. Store pipeline IDs and stage IDs in n8n as environment variables or a credentials store

---

### Workflow Creation (Manual Required)

**Limitation:** GHL API cannot create workflows.

**Workaround:** Create GHL Workflows in the dashboard that listen for email tag additions and send the corresponding emails. n8n handles all sequence timing and logic; GHL handles email composition, delivery, and tracking.

**GHL Workflows to Create (dashboard only):**

| Workflow Name | Trigger | Action |
|---------------|---------|--------|
| Welcome Sequence | Tag added: `welcome_email_*` | Branch on tag → send corresponding email template → remove trigger tag |
| Advertiser Nurture | Tag added: `nurture_email_*` | Branch on tag → send corresponding email template → remove trigger tag |
| Partnership Follow-Up | Tag added: `partnership_email_*` | Branch on tag → send corresponding email template → remove trigger tag |
| Re-engagement | Tag added: `reengagement_email_*` | Branch on tag → send corresponding email template → remove trigger tag |
| Advertiser Onboarding | Tag added: `onboarding_email_*` | Branch on tag → send corresponding email template → remove trigger tag |
| Ad Lead — Meeting Booked | Tag added: `meeting_booked` | Move opportunity to "Meeting Scheduled" stage |
| Ad Lead — Proposal Sent | Tag added: `proposal_sent` | Move opportunity to "Proposal Sent" stage |
| Subscriber — Engaged | Custom field `bfw_engagement_tier` changed to `engaged` | Move opportunity to "Engaged" stage |
| Contact — Auto Archive | 14 days after opportunity enters "Responded" | Move to "Archived" |

**Steps for each email sequence workflow:**

1. **Automations** → **+ Create Workflow**
2. Choose trigger: **Tag Added**
3. Configure trigger condition: tag matches the sequence prefix (e.g., `welcome_email_`)
4. Add **IF/Branch** node to check the specific tag (e.g., `welcome_email_1`, `welcome_email_2`, etc.)
5. For each branch: add **Send Email** action → select the corresponding email template built in GHL's email builder
6. After send: add **Remove Tag** action to remove the trigger tag (keeps the contact's tag list clean)
7. **Publish** the workflow

---

### Email Delivery via GHL Tag-Triggered Workflows

Email delivery uses GHL Workflows triggered by n8n tag additions. n8n handles sequence timing and logic; GHL handles email composition, delivery, and tracking.

**How it works:**
1. n8n adds a tag like `welcome_email_1` to a GHL contact via the API
2. A GHL Workflow listening for that tag fires automatically
3. The workflow sends the corresponding email (built in GHL's visual email builder)
4. The workflow removes the trigger tag from the contact to keep tags clean
5. GHL internally tracks opens, clicks, and bounces
6. GHL can fire webhook events for engagement tracking, which n8n writes to Supabase

---

### Contact Scoring

**Limitation:** GHL has no built-in lead scoring engine accessible via API.

**Workaround (already implemented):**

Lead scoring is calculated in BFW's Next.js backend (`calculateInitialLeadScore()` in `lib/ghl/utils.ts`) and pushed to GHL as the `bfw_lead_score` custom field (ID: `YfvmTSviZ8syFdBmeIts`).

**Current scoring factors:**

| Factor | Points |
|--------|--------|
| Source: contact_form | +25 |
| Source: bfw_vip_club | +20 |
| Source: bfw_website | +10 |
| Has phone number | +15 |
| Traffic: chatgpt | +10 |
| Traffic: google_ads | +8 |
| Traffic: seo | +5 |
| Subject: partnership/business | +30 |
| Has message | +5 |

**Enhancement (planned):** n8n workflow to recalculate scores based on engagement data (email opens, clicks, page visits) and push updated scores to GHL weekly.

---

### Reporting

**Limitation:** GHL reporting is limited and not API-exportable for custom dashboards.

**Workaround:** Use Supabase as the analytics warehouse, supplemented by GHL's built-in email stats.

- All form submissions → `form_submissions` table
- All engagement events → `engagement_events` table (new) — populated via GHL webhook events
- All pipeline movements → `pipeline_events` table (new)
- Daily aggregate reports → `daily_reports` table or Supabase views
- n8n syncs GHL contact data back to Supabase nightly for cross-referencing
- GHL dashboard provides per-email open/click stats for emails sent via GHL Workflows

---

## 8. Implementation Roadmap

### Phase 1 — GHL Manual Setup (Week 1)

| Task | Owner | Time Est. | Dependencies |
|------|-------|-----------|-------------|
| Create Pipeline 1: Restaurant Advertising Leads (7 stages) | Admin | 10 min | None |
| Create Pipeline 2: Partnership Inquiries (5 stages) | Admin | 10 min | None |
| Create Pipeline 3: Newsletter Subscribers (5 stages) | Admin | 10 min | None |
| Create Pipeline 4: General Contact Inquiries (4 stages) | Admin | 10 min | None |
| Retrieve all pipeline IDs and stage IDs via API | Dev | 15 min | Pipelines created |
| Store IDs in n8n environment variables | Dev | 15 min | IDs retrieved |
| Register 6 GHL webhook URLs pointing to n8n | Admin | 20 min | n8n endpoints deployed |
| Create 21 GHL email templates (one per email across all 5 sequences) in GHL visual email builder | Content/Admin | 4 hrs | Email copy written (can start with placeholder copy) |
| Create GHL Workflow: "Welcome Sequence" (trigger: `welcome_email_*` tags, 5 branches, send email + remove tag) | Admin | 30 min | Email templates created |
| Create GHL Workflow: "Advertiser Nurture" (trigger: `nurture_email_*` tags, 5 branches, send email + remove tag) | Admin | 30 min | Email templates created |
| Create GHL Workflow: "Partnership Follow-Up" (trigger: `partnership_email_*` tags, 4 branches, send email + remove tag) | Admin | 20 min | Email templates created |
| Create GHL Workflow: "Re-engagement" (trigger: `reengagement_email_*` tags, 3 branches, send email + remove tag) | Admin | 20 min | Email templates created |
| Create GHL Workflow: "Advertiser Onboarding" (trigger: `onboarding_email_*` tags, 4 branches, send email + remove tag) | Admin | 20 min | Email templates created |
| Create 4 GHL workflows (tag-triggered stage movers: Meeting Booked, Proposal Sent, Engaged, Auto Archive) | Admin | 30 min | Pipelines created |
| Add new GHL custom field: `bfw_engagement_tier` | Admin | 5 min | None |
| Test: create test contact → add email tag → verify GHL Workflow fires and sends email | Dev | 30 min | Workflows + templates created |

**Deliverable:** All 4 pipelines live in GHL, 9 GHL Workflows active (5 email sequence workflows + 4 stage movers), 21 email templates ready, webhooks registered.

---

### Phase 2 — n8n Workflows (Week 2)

| Task | Owner | Time Est. | Dependencies |
|------|-------|-----------|-------------|
| Build Workflow 1: Newsletter Welcome Sequence (tag-based email triggers) | Dev | 2 hrs | Pipeline 3 IDs, GHL Workflow "Welcome Sequence" active |
| Build Workflow 2: Advertiser Lead Nurture (tag-based email triggers) | Dev | 2 hrs | Pipeline 1 IDs, GHL Workflow "Advertiser Nurture" active |
| Build Workflow 3: Partnership Follow-Up (tag-based email triggers) | Dev | 1.5 hrs | Pipeline 2 IDs, GHL Workflow "Partnership Follow-Up" active |
| Build Workflow 4: Re-engagement Checker (cron + tag-based email triggers) | Dev | 2.5 hrs | Supabase tables, GHL Workflow "Re-engagement" active |
| Build Workflow 5: Opportunity Creator (routing) | Dev | 2 hrs | All pipeline IDs |
| Build Workflow 6: Pipeline Stage Updater | Dev | 1 hr | All pipeline IDs |
| Build GHL → n8n → Supabase sync workflows (contact sync + engagement events) | Dev | 2 hrs | GHL webhooks |
| Apply Supabase migration: engagement_events table | Dev | 30 min | None |
| Apply Supabase migration: pipeline_events table | Dev | 30 min | None |
| Integration test: full flow from form → GHL → n8n → GHL tag → GHL Workflow → email sent | Dev | 2 hrs | All workflows |

**Deliverable:** All 6+ n8n workflows deployed and tested with real form submissions. Tag-based email triggering verified end-to-end.

---

### Phase 3 — Email Content & Templates (Week 3)

| Task | Owner | Time Est. | Dependencies |
|------|-------|-----------|-------------|
| Write email copy: Newsletter Welcome (5 emails) | Content | 4 hrs | None |
| Write email copy: Advertiser Nurture (5 emails) | Content | 4 hrs | None |
| Write email copy: Partnership Follow-Up (4 emails) | Content | 3 hrs | None |
| Write email copy: Re-engagement (3 emails) | Content | 2 hrs | None |
| Write email copy: Advertiser Onboarding (4 emails) | Content | 3 hrs | None |
| Build 21 GHL email templates in dashboard visual builder (finalize with real copy) | Content/Dev | 4 hrs | Copy written |
| A/B test setup: 2 subject line variants for Email 1 of each sequence (use GHL A/B testing if available, or create variant tags) | Dev | 2 hrs | Templates built |
| End-to-end test: trigger all 21 emails via tag additions to test contacts | QA | 2 hrs | All templates finalized |

**Deliverable:** 21 email templates finalized in GHL visual email builder, A/B test variants configured, full sequence tested end-to-end via tag triggers.

---

### Phase 4 — Monitoring & Optimization (Week 4)

| Task | Owner | Time Est. | Dependencies |
|------|-------|-----------|-------------|
| Build Supabase view: `v_email_sequence_metrics` (based on engagement_events from GHL webhooks) | Dev | 1 hr | engagement_events table |
| Build Supabase view: `v_pipeline_conversion_rates` | Dev | 1 hr | pipeline_events table |
| Build Supabase view: `v_daily_lead_summary` | Dev | 1 hr | form_submissions table |
| Add GA4 conversion events for key pipeline milestones | Dev | 2 hrs | Workflows active |
| Build admin dashboard widget: sequence performance (data from GHL email stats + Supabase engagement_events) | Dev | 3 hrs | Views created |
| Build admin dashboard widget: pipeline overview | Dev | 3 hrs | Views created |
| Configure n8n error alerting (Slack/email on workflow failure) | Dev | 1 hr | n8n running |
| First week performance review and subject line optimization | Team | 2 hrs | 7 days of data |
| Document actual pipeline IDs and stage IDs in env config | Dev | 30 min | Phase 1 complete |

**Deliverable:** Monitoring dashboards live, alerting configured, first optimization pass complete.

---

## 9. Technical Appendix

### GHL API Endpoint Reference

All requests require:
- `Authorization: Bearer {access_token}`
- `Version: 2021-07-28`
- Base URL: `https://services.leadconnectorhq.com`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/contacts/upsert` | POST | Create or update contact by email |
| `/contacts/{id}` | GET | Retrieve contact details |
| `/contacts/{id}` | PUT | Update contact fields |
| `/contacts/{id}/tags` | POST | Add tags to contact |
| `/contacts/{id}/tags` | DELETE | Remove tags from contact |
| `/contacts/{id}/notes` | POST | Add note to contact |
| `/contacts/{id}/tasks` | POST | Create task on contact |
| `/contacts/search` | GET | Search contacts by query params |
| `/opportunities/upsert` | POST | Create or update opportunity |
| `/opportunities/{id}` | PUT | Update opportunity (stage, status, value) |
| `/opportunities/{id}` | GET | Retrieve opportunity details |
| `/opportunities/{id}` | DELETE | Delete opportunity |
| `/pipelines` | GET | List all pipelines and stages |
| `/pipelines/{id}` | GET | Get single pipeline with stages |
| `/locations/{id}/customFields` | GET | List all custom fields |

**Rate Limits:** 100 requests per 10 seconds (burst), 200,000 requests per day.

---

### n8n Workflow Node Specifications

**Common nodes used across workflows:**

| Node Type | Configuration | Notes |
|-----------|--------------|-------|
| Webhook | Method: POST, Path: `/webhook/{name}`, Response: 200 OK | Entry point for BFW and GHL |
| Cron | Timezone: Asia/Singapore, Time: varies | For scheduled workflows |
| HTTP Request | URL: GHL API endpoint, Auth: Bearer token | All GHL API calls (contact CRUD, tag additions, opportunity updates) |
| Supabase | Operation: Insert/Update/Select, Table: varies | Uses service role key |
| IF | Conditions: field-based routing | Source routing, engagement checks, DND/unsubscribe checks |
| Wait | Duration: days, Resume: On webhook | Sequence timing |
| Switch | Multiple outputs based on source field | Pipeline routing |
| Set | Merge/transform fields | Payload preparation |

> **Note:** Email sending is handled entirely by GHL Workflows triggered by tag additions. n8n does not directly send any emails — it adds tags like `welcome_email_1` to GHL contacts, and GHL Workflows handle the email composition and delivery.

---

### GHL Email Tag Reference

All email tags follow the pattern `{sequence}_{email_number}`. n8n adds these tags to trigger GHL Workflows that send the corresponding email.

| Tag | Sequence | Email # | GHL Workflow |
|-----|----------|---------|-------------|
| `welcome_email_1` | Newsletter Welcome | 1 | Welcome Sequence |
| `welcome_email_2` | Newsletter Welcome | 2 | Welcome Sequence |
| `welcome_email_3` | Newsletter Welcome | 3 | Welcome Sequence |
| `welcome_email_4` | Newsletter Welcome | 4 | Welcome Sequence |
| `welcome_email_5` | Newsletter Welcome | 5 | Welcome Sequence |
| `nurture_email_1` | Advertiser Lead Nurture | 1 | Advertiser Nurture |
| `nurture_email_2` | Advertiser Lead Nurture | 2 | Advertiser Nurture |
| `nurture_email_3` | Advertiser Lead Nurture | 3 | Advertiser Nurture |
| `nurture_email_4` | Advertiser Lead Nurture | 4 | Advertiser Nurture |
| `nurture_email_5` | Advertiser Lead Nurture | 5 | Advertiser Nurture |
| `partnership_email_1` | Partnership Follow-Up | 1 | Partnership Follow-Up |
| `partnership_email_2` | Partnership Follow-Up | 2 | Partnership Follow-Up |
| `partnership_email_3` | Partnership Follow-Up | 3 | Partnership Follow-Up |
| `partnership_email_4` | Partnership Follow-Up | 4 | Partnership Follow-Up |
| `reengagement_email_1` | Re-engagement | 1 | Re-engagement |
| `reengagement_email_2` | Re-engagement | 2 | Re-engagement |
| `reengagement_email_3` | Re-engagement | 3 | Re-engagement |
| `onboarding_email_1` | Post-Advertiser Onboarding | 1 | Advertiser Onboarding |
| `onboarding_email_2` | Post-Advertiser Onboarding | 2 | Advertiser Onboarding |
| `onboarding_email_3` | Post-Advertiser Onboarding | 3 | Advertiser Onboarding |
| `onboarding_email_4` | Post-Advertiser Onboarding | 4 | Advertiser Onboarding |

---

### GHL Workflow Specifications (Dashboard Setup)

Each email sequence has a corresponding GHL Workflow that must be created in the GHL dashboard:

| Workflow Name | Trigger Type | Trigger Condition | Actions | Email Count |
|---------------|-------------|-------------------|---------|-------------|
| Welcome Sequence | Tag Added | Tag starts with `welcome_email_` | IF/Branch on tag → Send Email → Remove Tag | 5 emails |
| Advertiser Nurture | Tag Added | Tag starts with `nurture_email_` | IF/Branch on tag → Send Email → Remove Tag | 5 emails |
| Partnership Follow-Up | Tag Added | Tag starts with `partnership_email_` | IF/Branch on tag → Send Email → Remove Tag | 4 emails |
| Re-engagement | Tag Added | Tag starts with `reengagement_email_` | IF/Branch on tag → Send Email → Remove Tag | 3 emails |
| Advertiser Onboarding | Tag Added | Tag starts with `onboarding_email_` | IF/Branch on tag → Send Email → Remove Tag | 4 emails |
| Ad Lead — Meeting Booked | Tag Added | Tag = `meeting_booked` | Move opportunity to "Meeting Scheduled" | — |
| Ad Lead — Proposal Sent | Tag Added | Tag = `proposal_sent` | Move opportunity to "Proposal Sent" | — |
| Subscriber — Engaged | Custom Field Changed | `bfw_engagement_tier` = `engaged` | Move opportunity to "Engaged" | — |
| Contact — Auto Archive | Timer | 14 days after "Responded" stage | Move to "Archived" | — |

---

### Supabase Table Schemas (New)

#### `engagement_events`

```sql
CREATE TABLE engagement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  event_type text NOT NULL,           -- open, click, bounce, unsubscribe
  sequence_name text,
  email_number int,
  link_url text,                      -- for click events
  metadata jsonb DEFAULT '{}',        -- GHL webhook payload data
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_engagement_email ON engagement_events(email);
CREATE INDEX idx_engagement_type ON engagement_events(event_type);
CREATE INDEX idx_engagement_created ON engagement_events(created_at);
```

> **Note:** Engagement events are populated from GHL webhook events when emails sent via GHL Workflows are opened, clicked, or bounced. GHL tracks email sends internally — no separate `email_sends` table is needed.

#### `pipeline_events`

```sql
CREATE TABLE pipeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_opportunity_id text NOT NULL,
  ghl_contact_id text,
  pipeline_name text NOT NULL,
  old_stage text,
  new_stage text NOT NULL,
  trigger_source text,                -- 'n8n', 'ghl_workflow', 'manual'
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_pipeline_events_opp ON pipeline_events(ghl_opportunity_id);
CREATE INDEX idx_pipeline_events_created ON pipeline_events(created_at);
```

#### `ghl_contacts_sync`

```sql
CREATE TABLE ghl_contacts_sync (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_contact_id text UNIQUE NOT NULL,
  email text,
  first_name text,
  last_name text,
  phone text,
  tags text[] DEFAULT '{}',
  custom_fields jsonb DEFAULT '{}',
  engagement_tier text DEFAULT 'new', -- new, subscribed, engaged, highly_engaged, inactive, churned
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ghl_sync_email ON ghl_contacts_sync(email);
CREATE INDEX idx_ghl_sync_tier ON ghl_contacts_sync(engagement_tier);
```

---

### Environment Variables (New)

Add to `.env.local` (never commit):

```bash
# Pipeline IDs (retrieve from GHL API after manual creation)
GHL_PIPELINE_ADVERTISING_ID=          # Pipeline 1
GHL_PIPELINE_PARTNERSHIP_ID=          # Pipeline 2
GHL_PIPELINE_NEWSLETTER_ID=           # Pipeline 3
GHL_PIPELINE_GENERAL_ID=              # Pipeline 4

# Stage IDs (retrieve from GHL API, format: pipeline:stage pairs)
GHL_STAGE_AD_NEW_LEAD=
GHL_STAGE_AD_CONTACTED=
GHL_STAGE_AD_MEETING=
GHL_STAGE_AD_PROPOSAL=
GHL_STAGE_AD_NEGOTIATING=
GHL_STAGE_AD_WON=
GHL_STAGE_AD_LOST=

GHL_STAGE_PARTNER_RECEIVED=
GHL_STAGE_PARTNER_EVALUATED=
GHL_STAGE_PARTNER_DISCUSSION=
GHL_STAGE_PARTNER_ACTIVE=
GHL_STAGE_PARTNER_DECLINED=

GHL_STAGE_NEWS_SUBSCRIBED=
GHL_STAGE_NEWS_ENGAGED=
GHL_STAGE_NEWS_HIGHLY_ENGAGED=
GHL_STAGE_NEWS_INACTIVE=
GHL_STAGE_NEWS_CHURNED=

GHL_STAGE_GENERAL_NEW=
GHL_STAGE_GENERAL_RESPONDED=
GHL_STAGE_GENERAL_RESOLVED=
GHL_STAGE_GENERAL_ARCHIVED=

# n8n webhook endpoints for GHL events
N8N_WEBHOOK_GHL_CONTACT_CREATED=
N8N_WEBHOOK_GHL_TAG_ADDED=
N8N_WEBHOOK_GHL_OPP_STATUS=
N8N_WEBHOOK_GHL_OPP_STAGE=
N8N_WEBHOOK_GHL_TASK_DONE=
N8N_WEBHOOK_GHL_CONTACT_DELETED=
```

---

### GHL Custom Field Addition

One new custom field to create in GHL dashboard:

| Field Name | Key | Type | Values |
|------------|-----|------|--------|
| BFW Engagement Tier | `bfw_engagement_tier` | Single-line text | new, subscribed, engaged, highly_engaged, inactive, churned |

**Steps:** GHL Dashboard → **Settings** → **Custom Fields** → **+ Add Field** → Name: `BFW Engagement Tier`, Type: Text → Save → Note the field ID → Add to `GHL_FIELD_IDS` in `lib/ghl/utils.ts`.

---

### Monitoring & Alerting

**n8n Error Handling (per workflow):**

- Every workflow wraps its main logic in a try/catch (Error Trigger node)
- On error: send Slack notification OR insert into Supabase `workflow_errors` table
- Critical workflows (lead nurture, opportunity creation) also send email alert to admin

**Supabase Reporting Views:**

```sql
-- Email sequence performance (based on GHL webhook engagement events)
CREATE VIEW v_email_sequence_metrics AS
SELECT
  sequence_name,
  email_number,
  COUNT(*) FILTER (WHERE event_type = 'send') AS total_sent,
  COUNT(*) FILTER (WHERE event_type = 'open') AS total_opened,
  COUNT(*) FILTER (WHERE event_type = 'click') AS total_clicked,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'open')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'send'), 0) * 100, 1
  ) AS open_rate,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'click')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'send'), 0) * 100, 1
  ) AS click_rate
FROM engagement_events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY sequence_name, email_number
ORDER BY sequence_name, email_number;

-- Pipeline conversion funnel
CREATE VIEW v_pipeline_conversion_rates AS
SELECT
  pipeline_name,
  new_stage,
  COUNT(*) AS entries,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS entries_7d,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS entries_30d
FROM pipeline_events
GROUP BY pipeline_name, new_stage
ORDER BY pipeline_name, new_stage;
```

---

*End of document. Review each section, approve pipeline designs and email copy direction, then proceed with Phase 1 implementation.*
