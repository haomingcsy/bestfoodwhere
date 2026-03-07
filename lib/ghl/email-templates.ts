/**
 * GHL Email Templates for BestFoodWhere
 *
 * Sent via GHL Conversations API (POST /conversations/messages).
 * Templates are personalized with {{firstName}}, {{email}}, etc.
 */

const BFW_LOGO = "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/recipe-images/brand/bfw-logo.png";
const BFW_URL = "https://bestfoodwhere.sg";

function buildEmailTemplate(params: {
  headline: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCta?: { text: string; url: string };
}): string {
  const ctaButton = params.ctaText && params.ctaUrl
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr><td align="center">
          <a href="${params.ctaUrl}" style="background-color: #e85d04; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">${params.ctaText}</a>
        </td></tr>
       </table>`
    : "";

  const secondaryLink = params.secondaryCta
    ? `<p style="text-align: center; margin-top: 12px;"><a href="${params.secondaryCta.url}" style="color: #e85d04; font-size: 14px;">${params.secondaryCta.text}</a></p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
        <tr><td style="padding: 32px 40px; text-align: center; background-color: #fff8f5;">
          <img src="${BFW_LOGO}" alt="BestFoodWhere" width="180" style="max-width: 180px;">
        </td></tr>
        <tr><td style="padding: 32px 40px;">
          <h1 style="font-size: 22px; color: #1a1a1a; margin: 0 0 16px 0;">${params.headline}</h1>
          <div style="font-size: 15px; line-height: 1.6; color: #333333;">${params.body}</div>
          ${ctaButton}
          ${secondaryLink}
        </td></tr>
        <tr><td style="padding: 24px 40px; background-color: #f9f9f9; text-align: center; font-size: 12px; color: #999;">
          <a href="${BFW_URL}" style="color: #e85d04;">bestfoodwhere.sg</a><br><br>
          Singapore's restaurant discovery platform<br>
          <a href="${BFW_URL}/unsubscribe?email={{email}}" style="color: #999;">Unsubscribe</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ============ Welcome Sequence Templates ============

export const WELCOME_TEMPLATES: Record<string, { subject: string; html: string }> = {
  welcome_email_1: {
    subject: "Welcome to the food club",
    html: buildEmailTemplate({
      headline: "You're in, {{firstName}}!",
      body: `<p>Welcome to BestFoodWhere — Singapore's restaurant discovery platform with <strong>730+ brands</strong> and <strong>840 locations</strong>.</p>
<p>Here's what you'll get from us:</p>
<ul style="padding-left: 20px;">
  <li>Weekly restaurant recommendations</li>
  <li>Exclusive deals and promotions</li>
  <li>New restaurant alerts in your area</li>
</ul>
<p>Start exploring — here are this week's trending restaurants:</p>`,
      ctaText: "Explore menus on BFW",
      ctaUrl: `${BFW_URL}/menu`,
    }),
  },

  welcome_email_2: {
    subject: "What kind of foodie are you?",
    html: buildEmailTemplate({
      headline: "Find your perfect cuisine",
      body: `<p>We have 19 cuisine categories — from hawker favourites to fine dining.</p>
<p>Tell us what you love and we'll send you personalised picks:</p>
<ul style="padding-left: 20px;">
  <li><a href="${BFW_URL}/cuisine/chinese" style="color: #e85d04;">Chinese</a> — 150+ restaurants</li>
  <li><a href="${BFW_URL}/cuisine/japanese" style="color: #e85d04;">Japanese</a> — 80+ restaurants</li>
  <li><a href="${BFW_URL}/cuisine/western" style="color: #e85d04;">Western</a> — 100+ restaurants</li>
  <li><a href="${BFW_URL}/cuisine/korean" style="color: #e85d04;">Korean</a> — 60+ restaurants</li>
</ul>`,
      ctaText: "Browse all cuisines",
      ctaUrl: `${BFW_URL}/cuisine`,
    }),
  },

  welcome_email_3: {
    subject: "Deals you won't find on Google",
    html: buildEmailTemplate({
      headline: "This week's exclusive deals",
      body: `<p>We curate the best restaurant promotions across Singapore — deals you won't find anywhere else.</p>
<p>From 1-for-1 mains to 50% off set menus, we've got you covered.</p>`,
      ctaText: "See all deals",
      ctaUrl: `${BFW_URL}/deals`,
    }),
  },

  welcome_email_4: {
    subject: "How we find Singapore's hidden gems",
    html: buildEmailTemplate({
      headline: "Behind the scenes at BFW",
      body: `<p>We visit, research, and vet every restaurant on our platform. Here's how we discover Singapore's best food:</p>
<p><strong>1. Real visits</strong> — Our team eats at restaurants before listing them</p>
<p><strong>2. Menu verification</strong> — We check prices and items are accurate</p>
<p><strong>3. Community input</strong> — Your reviews and nominations help us find hidden gems</p>
<p>Know a restaurant we should feature?</p>`,
      ctaText: "Nominate a restaurant",
      ctaUrl: `${BFW_URL}/contact-us`,
    }),
  },

  welcome_email_5: {
    subject: "You've been here 12 days — here's a gift",
    html: buildEmailTemplate({
      headline: "Thanks for sticking around, {{firstName}}",
      body: `<p>You've been part of the BFW community for almost two weeks now. We'd love to hear from you.</p>
<p><strong>Quick question:</strong> What do you want to see more of?</p>
<ul style="padding-left: 20px;">
  <li>More deals and promotions?</li>
  <li>New restaurant alerts?</li>
  <li>Recipe inspiration?</li>
  <li>Cuisine guides?</li>
</ul>
<p>Just reply to this email — we read every response.</p>`,
      ctaText: "Explore what's new",
      ctaUrl: `${BFW_URL}/menu`,
    }),
  },
};

// ============ Advertiser Nurture Templates ============

export const ADVERTISER_TEMPLATES: Record<string, { subject: string; html: string }> = {
  advertiser_email_1: {
    subject: "Got your inquiry — here's what happens next",
    html: buildEmailTemplate({
      headline: "Thanks for your interest, {{firstName}}",
      body: `<p>We received your inquiry about advertising on BestFoodWhere.</p>
<p><strong>Here's what BFW delivers:</strong></p>
<ul style="padding-left: 20px;">
  <li>730+ restaurant brands listed</li>
  <li>840 location pages with full menus</li>
  <li>19 mall directory pages</li>
  <li>Growing organic traffic from Google & AI search</li>
</ul>
<p>We'll follow up within 24-48 hours with details on how we can help your restaurant get discovered.</p>`,
      ctaText: "See our advertising options",
      ctaUrl: `${BFW_URL}/advertise`,
    }),
  },

  advertiser_email_2: {
    subject: "How restaurants grow with BFW",
    html: buildEmailTemplate({
      headline: "What a BFW listing does for you",
      body: `<p>Restaurants on BFW get discovered by people actively searching for where to eat.</p>
<p><strong>What you get:</strong></p>
<ul style="padding-left: 20px;">
  <li>Dedicated menu page with full pricing</li>
  <li>SEO-optimised listing (we rank on Google)</li>
  <li>Inclusion in cuisine and mall category pages</li>
  <li>Featured placement opportunities</li>
</ul>
<p>Restaurants with complete profiles get <strong>3x more page views</strong> than basic listings.</p>`,
      ctaText: "Book a 15-min walkthrough",
      ctaUrl: `${BFW_URL}/contact-us`,
    }),
  },

  advertiser_email_3: {
    subject: "Your advertising options at a glance",
    html: buildEmailTemplate({
      headline: "Simple, transparent pricing",
      body: `<p>We keep it straightforward — no hidden fees, no long contracts.</p>
<p>Our listing tiers give you flexibility to start small and scale up as you see results.</p>`,
      ctaText: "View pricing tiers",
      ctaUrl: `${BFW_URL}/advertise`,
    }),
  },

  advertiser_email_4: {
    subject: "Don't just take our word for it",
    html: buildEmailTemplate({
      headline: "Restaurant partners love BFW",
      body: `<p>Here's what restaurant owners say about being on BestFoodWhere:</p>
<blockquote style="border-left: 3px solid #e85d04; padding-left: 16px; margin: 16px 0; color: #555;">
  "BFW brought us customers who already knew our menu before walking in. The conversion rate is incredible."
</blockquote>
<p>Join 730+ restaurants already on the platform.</p>`,
      ctaText: "Join 730+ restaurants on BFW",
      ctaUrl: `${BFW_URL}/advertise`,
    }),
  },

  advertiser_email_5: {
    subject: "Special offer for new partners",
    html: buildEmailTemplate({
      headline: "Limited time: 20% off your first month",
      body: `<p>We'd love to have your restaurant on BFW. To make it easy to get started, here's an exclusive offer:</p>
<p style="text-align: center; font-size: 24px; font-weight: bold; color: #e85d04; margin: 24px 0;">20% off your first month</p>
<p>This offer expires in 7 days. If now isn't the right time, just reply and let us know — we're happy to chat whenever you're ready.</p>`,
      ctaText: "Claim your spot",
      ctaUrl: `${BFW_URL}/advertise`,
      secondaryCta: { text: "Not ready? Reply and tell us what you need", url: `mailto:hello@bestfoodwhere.sg` },
    }),
  },
};

// ============ Partnership Templates ============

export const PARTNERSHIP_TEMPLATES: Record<string, { subject: string; html: string }> = {
  partnership_email_1: {
    subject: "Partnership inquiry received",
    html: buildEmailTemplate({
      headline: "Thanks for reaching out, {{firstName}}",
      body: `<p>We received your partnership inquiry and we're interested.</p>
<p><strong>About BFW's reach:</strong></p>
<ul style="padding-left: 20px;">
  <li>730+ restaurant brands</li>
  <li>840 locations across Singapore</li>
  <li>19 mall directory pages</li>
</ul>
<p>To help us understand your proposal better, could you share:</p>
<ol style="padding-left: 20px;">
  <li>Your organisation</li>
  <li>Partnership type you're envisioning</li>
  <li>Ideal timeline</li>
</ol>
<p>Just reply to this email — we'll get back to you within 48 hours.</p>`,
    }),
  },

  partnership_email_2: {
    subject: "How BFW partnerships work",
    html: buildEmailTemplate({
      headline: "Partnership models we offer",
      body: `<p>Here's how we typically work with partners:</p>
<p><strong>Content Collaborations</strong> — Co-created guides, reviews, and features</p>
<p><strong>Data Partnerships</strong> — Restaurant data, pricing intelligence, trend insights</p>
<p><strong>Co-Marketing</strong> — Joint promotions, cross-platform campaigns</p>
<p><strong>API Integrations</strong> — Menu data, restaurant info for your platform</p>`,
      ctaText: "Let's discuss",
      ctaUrl: `${BFW_URL}/contact-us`,
    }),
  },

  partnership_email_3: {
    subject: "Let's find a time to talk",
    html: buildEmailTemplate({
      headline: "15 minutes, no commitment",
      body: `<p>A quick call is the fastest way to explore fit. No pitch — just a conversation about what could work for both of us.</p>`,
      ctaText: "Reply with your availability",
      ctaUrl: `mailto:hello@bestfoodwhere.sg`,
    }),
  },

  partnership_email_4: {
    subject: "Checking in on your partnership idea",
    html: buildEmailTemplate({
      headline: "Still interested, {{firstName}}?",
      body: `<p>Just checking in on your partnership inquiry. We're still keen to explore this.</p>
<p>If the timing isn't right, just reply with "later" and we'll check back in 3 months. No pressure at all.</p>`,
      ctaText: "Let's connect",
      ctaUrl: `mailto:hello@bestfoodwhere.sg`,
    }),
  },
};

// ============ Re-engagement Templates ============

export const REENGAGEMENT_TEMPLATES: Record<string, { subject: string; html: string }> = {
  reengagement_email_1: {
    subject: "Singapore's food scene changed while you were away",
    html: buildEmailTemplate({
      headline: "Here's what you missed",
      body: `<p>It's been a while! Singapore's food scene doesn't stand still — here's what's new:</p>
<ul style="padding-left: 20px;">
  <li>New restaurants added to BFW</li>
  <li>Updated menus and prices</li>
  <li>Fresh deals and promotions</li>
</ul>
<p>We saved the highlights for you.</p>`,
      ctaText: "See what's new",
      ctaUrl: `${BFW_URL}/menu`,
    }),
  },

  reengagement_email_2: {
    subject: "A little something to welcome you back",
    html: buildEmailTemplate({
      headline: "Welcome back, {{firstName}}",
      body: `<p>We've put together a curated list of the best new restaurants and deals — just for returning members.</p>`,
      ctaText: "Explore curated picks",
      ctaUrl: `${BFW_URL}/deals`,
    }),
  },

  reengagement_email_3: {
    subject: "Should we stop sending these?",
    html: buildEmailTemplate({
      headline: "Your call, {{firstName}}",
      body: `<p>We noticed you haven't opened our emails in a while. No hard feelings — we only want to send you stuff you actually want.</p>
<p><strong>Two options:</strong></p>`,
      ctaText: "Keep me subscribed",
      ctaUrl: `${BFW_URL}/menu`,
      secondaryCta: { text: "Unsubscribe", url: `${BFW_URL}/unsubscribe?email={{email}}` },
    }),
  },
};

// ============ Onboarding Templates (Post-Payment) ============

export const ONBOARDING_TEMPLATES: Record<string, { subject: string; html: string }> = {
  onboarding_email_1: {
    subject: "You're live on BFW — here's your dashboard",
    html: buildEmailTemplate({
      headline: "Welcome aboard, {{firstName}}!",
      body: `<p>Your restaurant is now live on BestFoodWhere. Here's your quick-start checklist:</p>
<ol style="padding-left: 20px;">
  <li>Upload your logo</li>
  <li>Verify your menu is accurate</li>
  <li>Add photos of your dishes</li>
  <li>Set your business hours</li>
</ol>
<p>Complete profiles get <strong>3x more views</strong>.</p>`,
      ctaText: "Go to your dashboard",
      ctaUrl: `${BFW_URL}/restaurant/dashboard`,
    }),
  },

  onboarding_email_2: {
    subject: "3 things top-performing restaurants do on BFW",
    html: buildEmailTemplate({
      headline: "Maximise your listing",
      body: `<p>Here's what the most-viewed restaurants on BFW have in common:</p>
<p><strong>1. Complete profile</strong> — Logo, photos, hours, and accurate menu</p>
<p><strong>2. Updated menu</strong> — Restaurants that update seasonally get 2x more repeat visitors</p>
<p><strong>3. Respond to reviews</strong> — Engagement builds trust with potential customers</p>`,
      ctaText: "Update your profile",
      ctaUrl: `${BFW_URL}/restaurant/settings`,
    }),
  },

  onboarding_email_3: {
    subject: "Your first week stats are in",
    html: buildEmailTemplate({
      headline: "Here's how your listing is performing",
      body: `<p>Your restaurant has been live for a few days. Here's a quick snapshot of your visibility on BFW.</p>
<p>Want to boost these numbers? Adding more menu photos is the #1 way to increase page views.</p>`,
      ctaText: "View your analytics",
      ctaUrl: `${BFW_URL}/restaurant/analytics`,
    }),
  },

  onboarding_email_4: {
    subject: "How's your first week going?",
    html: buildEmailTemplate({
      headline: "Quick check-in",
      body: `<p>Just checking in on your BFW experience so far. Everything going smoothly?</p>
<p>If you need help with anything — setting up your profile, understanding your analytics, or anything else — just reply to this email.</p>
<p>We're here to help you get the most out of your listing.</p>`,
      ctaText: "Visit your dashboard",
      ctaUrl: `${BFW_URL}/restaurant/dashboard`,
    }),
  },
};

// ============ Template Lookup ============

const ALL_TEMPLATES: Record<string, { subject: string; html: string }> = {
  ...WELCOME_TEMPLATES,
  ...ADVERTISER_TEMPLATES,
  ...PARTNERSHIP_TEMPLATES,
  ...REENGAGEMENT_TEMPLATES,
  ...ONBOARDING_TEMPLATES,
};

/**
 * Get an email template by key and personalize it.
 */
export function getEmailTemplate(
  templateKey: string,
  params: {
    firstName?: string;
    email?: string;
    restaurantName?: string;
  },
): { subject: string; html: string } | null {
  const template = ALL_TEMPLATES[templateKey];
  if (!template) return null;

  let subject = template.subject;
  let html = template.html;

  const firstName = params.firstName || "there";
  subject = subject.replace(/\{\{firstName\}\}/g, firstName);
  html = html.replace(/\{\{firstName\}\}/g, firstName);

  if (params.email) {
    html = html.replace(/\{\{email\}\}/g, encodeURIComponent(params.email));
  }

  if (params.restaurantName) {
    subject = subject.replace(/\{\{restaurantName\}\}/g, params.restaurantName);
    html = html.replace(/\{\{restaurantName\}\}/g, params.restaurantName);
  }

  return { subject, html };
}

/**
 * Get all template keys for a given sequence.
 */
export function getSequenceTemplateKeys(sequence: string): string[] {
  const sequences: Record<string, string[]> = {
    welcome: ["welcome_email_1", "welcome_email_2", "welcome_email_3", "welcome_email_4", "welcome_email_5"],
    advertiser: ["advertiser_email_1", "advertiser_email_2", "advertiser_email_3", "advertiser_email_4", "advertiser_email_5"],
    partnership: ["partnership_email_1", "partnership_email_2", "partnership_email_3", "partnership_email_4"],
    reengagement: ["reengagement_email_1", "reengagement_email_2", "reengagement_email_3"],
    onboarding: ["onboarding_email_1", "onboarding_email_2", "onboarding_email_3", "onboarding_email_4"],
  };
  return sequences[sequence] || [];
}
