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

This document defines the complete automation architecture for BestFoodWhere (BFW), covering lead management pipelines, email nurture sequences, and the integration layer between our Next.js application, GoHighLevel CRM, n8n workflow engine, Resend email service, and Supabase database.

**What this covers:**

- 4 CRM pipelines for managing restaurant leads, partnerships, newsletter subscribers, and general inquiries
- 5 automated email sequences (25 total emails) for onboarding, nurturing, and re-engagement
- Full n8n workflow specifications for orchestrating automation between systems
- GHL API integration patterns with documented workarounds for API limitations
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

- Resend integration for transactional email
- Recipe welcome email template at `lib/email/recipe-welcome.ts`
- Branded HTML template with BFW logo hosted on Supabase storage

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
| **Email/SMS — Send** | Via Conversations | `POST /conversations/messages` | Requires existing conversation; not a standalone email API |
| **Webhooks — Receive** | 50+ event types | Registered in GHL dashboard | contact.created, opportunity.statusChanged, etc. |
| **Campaigns/Sequences** | **DEPRECATED** | N/A | Replaced by Workflows |
| **Rate Limits** | — | — | 100 requests / 10 seconds burst, 200,000 / day |

### Critical Limitations Summary

1. **Cannot create pipelines via API** — must be created manually in GHL dashboard first, then use returned IDs in API calls
2. **Cannot create workflows via API** — all workflow automation must be built in GHL dashboard or offloaded to n8n
3. **No standalone email sending API** — email must go through Conversations API (requires existing thread) or be handled externally (Resend)
4. **Webhook registration is dashboard-only** — cannot programmatically register webhook listeners
5. **Campaign/sequence APIs are deprecated** — all sequencing must use Workflows or external tools (n8n)

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
| Engaged | Opened 3+ emails in last 30 days | Supabase engagement tracking |
| Highly Engaged | Opened 5+ emails AND clicked 2+ links | Supabase engagement tracking |
| Inactive | No opens in 30+ days | n8n cron check |
| Churned | Unsubscribed or bounced | Resend webhook or manual unsubscribe |

**GHL Dashboard Setup:**

1. **Settings** → **Pipelines** → **+ Create Pipeline**
2. Name: `Newsletter Subscribers`
3. Add stages: Subscribed, Engaged, Highly Engaged, Inactive, Churned
4. Save and note Pipeline ID + Stage IDs

**Engagement Tracking Strategy:**

GHL does not expose per-email open/click metrics via API. Instead, track engagement externally:

1. Resend sends open/click webhooks to `/api/outreach/webhook` (already exists)
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

All sequences use **n8n + Resend** as the delivery mechanism (not GHL's built-in email, which requires the Conversations API and existing threads). Resend provides reliable transactional email with open/click tracking webhooks.

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
3. Resend: Send Email 1 (immediate)
4. Supabase: Insert into email_sends (email, sequence, email_number, sent_at)
5. Wait 2 days
6. Supabase: Check if unsubscribed → IF yes, stop
7. Resend: Send Email 2
8. Supabase: Log send
9. Wait 3 days
10. Unsubscribe check → Resend: Send Email 3 → Log
11. Wait 3 days
12. Unsubscribe check → Resend: Send Email 4 → Log
13. Wait 4 days
14. Unsubscribe check → Resend: Send Email 5 → Log
15. GHL API: Add tag "welcome_sequence_complete" to contact
```

**Metrics to Track:**

- Open rate per email (target: Email 1 > 60%, overall > 35%)
- Click rate per email (target: > 5%)
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
4. Resend: Send Email 1 (immediate)
5. GHL API: Move opportunity to "Contacted" stage
6. Supabase: Log send to email_sends
7. Wait 2 days → Unsubscribe check → Resend: Send Email 2 → Log
8. Wait 3 days → Unsubscribe check → Resend: Send Email 3 → Log
9. Wait 4 days → Unsubscribe check → Resend: Send Email 4 → Log
10. Wait 5 days → Unsubscribe check → Resend: Send Email 5 → Log
11. GHL API: Add tag "nurture_sequence_complete"
12. GHL API: Create task on contact — "Follow up manually if no meeting booked"
```

**Metrics to Track:**

- Email-to-meeting conversion rate (target: > 8%)
- Reply rate (target: > 5%)
- Offer redemption rate on Email 5 (target: > 3%)
- Pipeline progression: % of leads reaching "Meeting Scheduled" within 21 days

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
4. Resend: Send Email 1 → Log
5. Wait 3 days → Resend: Send Email 2 → Log
6. GHL API: Move opportunity to "Evaluated"
7. Wait 3 days → Resend: Send Email 3 → Log
8. Wait 4 days → Resend: Send Email 4 → Log
9. GHL API: Add tag "partnership_sequence_complete"
```

**Metrics to Track:**

- Reply rate (target: > 15% — partnership inquiries are higher intent)
- Meeting book rate (target: > 10%)
- Time to first response

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
   b. Resend: Send Email 1 → Log
4. [Separate n8n workflow or same with Wait nodes]
5. Wait 3 days → check if re-engaged (any open/click) → IF yes, stop and update tier
6. IF no → Resend: Send Email 2 → Log
7. Wait 4 days → check if re-engaged
8. IF no → Resend: Send Email 3 → Log
9. Wait 7 days → check if any action taken
10. IF no action → GHL API: Move subscriber opportunity to "Churned"
11. Supabase: Update subscriber status to "churned"
```

**Metrics to Track:**

- Re-engagement rate (target: > 15% reactivate)
- Unsubscribe rate from Email 3 (expected: 20-30% — this is healthy list cleaning)
- False positive rate (contacts marked inactive who actually engage)

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
4. Resend: Send Email 1 → Log
5. Wait 1 day → Resend: Send Email 2 → Log
6. Wait 2 days → Resend: Send Email 3 → Log
7. Wait 4 days → Resend: Send Email 4 → Log
8. GHL API: Add tag "onboarding_complete"
9. GHL API: Create task — "30-day check-in with {restaurant_name}"
```

**Metrics to Track:**

- Profile completion rate within 7 days (target: > 60%)
- Support ticket rate during onboarding (lower is better)
- 30-day retention rate

---

## 6. n8n + GHL Integration Architecture

### 6A. BFW to n8n to GHL Flows

#### Workflow 1: Newsletter Welcome Sequence Orchestrator

```
Trigger:     N8N_WEBHOOK_NEWSLETTER
Filter:      source IN (bfw_website, bfw_vip_club, bfw_signup)
GHL calls:   POST /contacts/{id}/tags (add "welcome_sequence_started")
             POST /contacts/{id}/tags (add "welcome_sequence_complete")
             POST /opportunities/upsert (Pipeline 3, "Subscribed" stage)
Resend:      5 emails on schedule (day 0, 2, 5, 8, 12)
Supabase:    INSERT INTO email_sends for each email
             SELECT FROM subscribers to check unsubscribe status
```

#### Workflow 2: Advertiser Lead Nurture Orchestrator

```
Trigger:     N8N_WEBHOOK_CONTACT (filtered: source = advertiser_inquiry)
GHL calls:   POST /opportunities/upsert (Pipeline 1, "New Lead" stage)
             PUT /opportunities/{id} (move to "Contacted" on Email 1)
             POST /contacts/{id}/tags (add "nurture_sequence_complete")
             POST /contacts/{id}/tasks (create follow-up task)
Resend:      5 emails on schedule (day 0, 2, 5, 9, 14)
Supabase:    INSERT INTO email_sends
```

#### Workflow 3: Partnership Follow-Up Orchestrator

```
Trigger:     N8N_WEBHOOK_CONTACT (filtered: subject matches partnership keywords)
GHL calls:   POST /opportunities/upsert (Pipeline 2, "Inquiry Received")
             PUT /opportunities/{id} (move to "Evaluated" after Email 2)
             POST /contacts/{id}/tags
Resend:      4 emails on schedule (day 0, 3, 6, 10)
Supabase:    INSERT INTO email_sends
```

#### Workflow 4: Re-engagement Checker (Cron)

```
Trigger:     Cron — daily at 10:00 AM SGT (02:00 UTC)
GHL calls:   PUT /opportunities/{id} (move to "Inactive" or "Churned")
             PUT /contacts/{id} (update custom field bfw_engagement_tier)
Resend:      3 emails on schedule (day 0, 3, 7)
Supabase:    SELECT inactive contacts
             UPDATE contact engagement status
             INSERT INTO email_sends
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
| `opportunity.statusChanged` | `{n8n_base}/webhook/ghl-opp-status` | Update Supabase `pipeline_events`, trigger stage-specific emails |
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
Trigger:     Resend webhook (email.opened, email.clicked, email.bounced)
Supabase:    INSERT INTO engagement_events (
               email, event_type, email_id, sequence_name,
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
                    ├──► Day 0:  Resend → Email 1 → Supabase: email_sends
                    ├──► Day 2:  Resend → Email 2 → Supabase: email_sends
                    ├──► Day 5:  Resend → Email 3 → Supabase: email_sends
                    ├──► Day 8:  Resend → Email 4 → Supabase: email_sends
                    └──► Day 12: Resend → Email 5 → Supabase: email_sends
                                                          │
                    ┌─────────────────────────────────────┘
                    ▼
              Resend fires open/click webhooks
                    │
                    ▼
              /api/outreach/webhook (BFW)
                    │
                    ▼
              Supabase: engagement_events
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
                    ├──► Day 0:  Resend → Email 1 (confirmation + stats)
                    │    └──► GHL API: move to "Contacted"
                    ├──► Day 2:  Resend → Email 2 (case study)
                    ├──► Day 5:  Resend → Email 3 (pricing options)
                    ├──► Day 9:  Resend → Email 4 (testimonials)
                    └──► Day 14: Resend → Email 5 (limited offer)
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
                    └──► 4-email onboarding sequence (Resend)
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
         ├──► Day 0: Resend → "Singapore's food scene changed" → Log
         │    ▼
         │    Check: any open/click in 3 days?
         │    ├── YES → Stop sequence, move to "Engaged", clear flag
         │    └── NO ──► Day 3: Resend → "Welcome back offer" → Log
         │               ▼
         │               Check: any open/click in 4 days?
         │               ├── YES → Stop, move to "Engaged"
         │               └── NO ──► Day 7: Resend → "Should we stop?" → Log
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

**Workaround:** Create minimal GHL workflows that listen for tag changes and trigger internal actions. Heavy lifting done in n8n.

**GHL Workflows to Create (dashboard only):**

| Workflow Name | Trigger | Action |
|---------------|---------|--------|
| Ad Lead — Meeting Booked | Tag added: `meeting_booked` | Move opportunity to "Meeting Scheduled" stage |
| Ad Lead — Proposal Sent | Tag added: `proposal_sent` | Move opportunity to "Proposal Sent" stage |
| Subscriber — Engaged | Custom field `bfw_engagement_tier` changed to `engaged` | Move opportunity to "Engaged" stage |
| Contact — Auto Archive | 14 days after opportunity enters "Responded" | Move to "Archived" |

**Steps for each workflow:**

1. **Automations** → **+ Create Workflow**
2. Choose trigger type (Tag Added or Custom Field Changed)
3. Configure trigger condition
4. Add action: Update Opportunity → select pipeline → select target stage
5. **Publish** the workflow

---

### Email Sequences (n8n + Resend vs GHL Built-in)

| Feature | n8n + Resend | GHL Built-in (Workflows) |
|---------|-------------|-------------------------|
| **Setup complexity** | Medium — build n8n workflows | Low — visual builder |
| **Email delivery** | Excellent — Resend is purpose-built for transactional email | Good — GHL email delivery |
| **Open/click tracking** | Via Resend webhooks → Supabase | Built-in to GHL (but not API-accessible) |
| **Personalization** | Full — n8n can query any data source | Limited to GHL contact fields |
| **Template control** | Full HTML control, React Email compatible | GHL email builder |
| **Reporting** | Custom — Supabase analytics | GHL dashboard (limited export) |
| **Sequence branching** | Full n8n IF/Switch logic | GHL workflow builder |
| **Cost** | Resend free tier: 3,000 emails/month | Included in GHL plan |
| **Portability** | Templates and logic exportable | Locked to GHL |

**Recommendation:** Use **n8n + Resend** for all sequences. This gives full control over email content, delivery, tracking, and analytics. GHL Workflows are used only for simple tag-based triggers and opportunity stage movements.

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

**Workaround:** Use Supabase as the analytics warehouse.

- All form submissions → `form_submissions` table
- All email sends → `email_sends` table (new)
- All engagement events → `engagement_events` table (new)
- All pipeline movements → `pipeline_events` table (new)
- Daily aggregate reports → `daily_reports` table or Supabase views
- n8n syncs GHL contact data back to Supabase nightly for cross-referencing

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
| Create 4 GHL workflows (tag-triggered stage movers) | Admin | 30 min | Pipelines created |
| Add new GHL custom field: `bfw_engagement_tier` | Admin | 5 min | None |
| Test: create test contact → verify webhook fires | Dev | 15 min | Webhooks registered |

**Deliverable:** All 4 pipelines live in GHL, webhooks registered, workflow triggers active.

---

### Phase 2 — n8n Workflows (Week 2)

| Task | Owner | Time Est. | Dependencies |
|------|-------|-----------|-------------|
| Build Workflow 1: Newsletter Welcome Sequence | Dev | 3 hrs | Pipeline 3 IDs |
| Build Workflow 2: Advertiser Lead Nurture | Dev | 3 hrs | Pipeline 1 IDs |
| Build Workflow 3: Partnership Follow-Up | Dev | 2 hrs | Pipeline 2 IDs |
| Build Workflow 4: Re-engagement Checker (cron) | Dev | 3 hrs | Supabase tables |
| Build Workflow 5: Opportunity Creator (routing) | Dev | 2 hrs | All pipeline IDs |
| Build Workflow 6: Pipeline Stage Updater | Dev | 1 hr | All pipeline IDs |
| Build GHL → n8n → Supabase sync workflows | Dev | 2 hrs | GHL webhooks |
| Apply Supabase migration: email_sends table | Dev | 30 min | None |
| Apply Supabase migration: engagement_events table | Dev | 30 min | None |
| Apply Supabase migration: pipeline_events table | Dev | 30 min | None |
| Integration test: full flow from form → GHL → n8n → Resend | Dev | 2 hrs | All workflows |

**Deliverable:** All 6+ n8n workflows deployed and tested with real form submissions.

---

### Phase 3 — Email Content & Templates (Week 3)

| Task | Owner | Time Est. | Dependencies |
|------|-------|-----------|-------------|
| Write email copy: Newsletter Welcome (5 emails) | Content | 4 hrs | None |
| Write email copy: Advertiser Nurture (5 emails) | Content | 4 hrs | None |
| Write email copy: Partnership Follow-Up (4 emails) | Content | 3 hrs | None |
| Write email copy: Re-engagement (3 emails) | Content | 2 hrs | None |
| Write email copy: Advertiser Onboarding (4 emails) | Content | 3 hrs | None |
| Build Resend HTML templates (extend existing BFW template) | Dev | 4 hrs | Copy written |
| Configure Resend open/click tracking webhooks | Dev | 1 hr | None |
| Wire Resend webhooks to /api/outreach/webhook | Dev | 1 hr | Webhook route exists |
| A/B test setup: 2 subject line variants for Email 1 of each sequence | Dev | 2 hrs | Templates built |
| End-to-end test: send all 21 emails to test addresses | QA | 2 hrs | All templates |

**Deliverable:** 21 email templates live in Resend, A/B test variants configured, full sequence tested.

---

### Phase 4 — Monitoring & Optimization (Week 4)

| Task | Owner | Time Est. | Dependencies |
|------|-------|-----------|-------------|
| Build Supabase view: `v_email_sequence_metrics` | Dev | 1 hr | email_sends table |
| Build Supabase view: `v_pipeline_conversion_rates` | Dev | 1 hr | pipeline_events table |
| Build Supabase view: `v_daily_lead_summary` | Dev | 1 hr | form_submissions table |
| Add GA4 conversion events for key pipeline milestones | Dev | 2 hrs | Workflows active |
| Build admin dashboard widget: sequence performance | Dev | 3 hrs | Views created |
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
| HTTP Request | URL: GHL API endpoint, Auth: Bearer token | All GHL API calls |
| HTTP Request | URL: Resend API endpoint, Auth: Bearer token | Email sending |
| Supabase | Operation: Insert/Update/Select, Table: varies | Uses service role key |
| IF | Conditions: field-based routing | Source routing, engagement checks |
| Wait | Duration: days, Resume: On webhook | Sequence timing |
| Switch | Multiple outputs based on source field | Pipeline routing |
| Set | Merge/transform fields | Payload preparation |

---

### Resend Email Template Format

Extend the existing BFW template pattern from `lib/email/recipe-welcome.ts`:

```typescript
// lib/email/templates/{sequence-name}/email-{n}.ts

const LOGO_URL = "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/recipe-images/brand/bfw-logo.png";

export function getEmailHtml(params: {
  email: string;
  firstName?: string;
  // sequence-specific params
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{Subject Line}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; background-color: #fff8f5;">
              <img src="${LOGO_URL}" alt="BestFoodWhere" width="180">
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px;">
              <!-- Email content here -->
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9f9f9; text-align: center; font-size: 12px; color: #999;">
              <a href="https://bestfoodwhere.sg" style="color: #e85d04;">bestfoodwhere.sg</a>
              <br><br>
              <a href="{unsubscribe_url}" style="color: #999;">Unsubscribe</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
```

**Resend API call (from n8n HTTP Request node):**

```json
POST https://api.resend.com/emails
Authorization: Bearer {RESEND_API_KEY}
Content-Type: application/json

{
  "from": "BestFoodWhere <hello@bestfoodwhere.sg>",
  "to": ["{recipient_email}"],
  "subject": "{subject_line}",
  "html": "{email_html}",
  "tags": [
    { "name": "sequence", "value": "{sequence_name}" },
    { "name": "email_number", "value": "{n}" }
  ]
}
```

---

### Supabase Table Schemas (New)

#### `email_sends`

```sql
CREATE TABLE email_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  sequence_name text NOT NULL,        -- e.g., 'newsletter_welcome'
  email_number int NOT NULL,          -- 1-5
  subject text NOT NULL,
  resend_email_id text,               -- Resend's email ID for tracking
  status text DEFAULT 'sent',         -- sent, delivered, bounced, failed
  sent_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  clicked_at timestamptz,
  metadata jsonb DEFAULT '{}'
);

CREATE INDEX idx_email_sends_email ON email_sends(email);
CREATE INDEX idx_email_sends_sequence ON email_sends(sequence_name, email_number);
CREATE INDEX idx_email_sends_sent_at ON email_sends(sent_at);
```

#### `engagement_events`

```sql
CREATE TABLE engagement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  event_type text NOT NULL,           -- open, click, bounce, unsubscribe
  resend_email_id text,
  sequence_name text,
  email_number int,
  link_url text,                      -- for click events
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_engagement_email ON engagement_events(email);
CREATE INDEX idx_engagement_type ON engagement_events(event_type);
CREATE INDEX idx_engagement_created ON engagement_events(created_at);
```

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

# Resend (already exists, verify)
RESEND_API_KEY=

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
-- Email sequence performance
CREATE VIEW v_email_sequence_metrics AS
SELECT
  sequence_name,
  email_number,
  COUNT(*) AS total_sent,
  COUNT(opened_at) AS total_opened,
  COUNT(clicked_at) AS total_clicked,
  ROUND(COUNT(opened_at)::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS open_rate,
  ROUND(COUNT(clicked_at)::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS click_rate
FROM email_sends
WHERE sent_at > NOW() - INTERVAL '30 days'
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
