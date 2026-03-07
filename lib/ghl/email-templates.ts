/**
 * GHL Email Templates for BestFoodWhere
 *
 * Sent via GHL Conversations API (POST /conversations/messages).
 * Templates are personalized with {{firstName}}, {{email}}, etc.
 */

const BFW_LOGO = "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/recipe-images/brand/bfw-logo.png";
const BFW_URL = "https://bestfoodwhere.sg";

// Brand colors (matched to globals.css)
const ORANGE = "#ef5f2a";
const ORANGE_HOVER = "#ff6b35";
const TEXT_DARK = "#1a1a1a";
const TEXT_GRAY = "#666666";
const TEXT_LIGHT = "#999999";
const BG_WARM = "#fff9f6";
const BG_BODY = "#f4f1ee";
const WHITE = "#ffffff";
const BORDER_LIGHT = "#f0ece8";

function buildEmailTemplate(params: {
  preheader?: string;
  headline: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCta?: { text: string; url: string };
}): string {
  const preheader = params.preheader
    ? `<div style="display:none;font-size:1px;color:${BG_BODY};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${params.preheader}</div>`
    : "";

  const ctaButton = params.ctaText && params.ctaUrl
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0 8px;">
        <tr><td align="center">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${params.ctaUrl}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="17%" stroke="f" fillcolor="${ORANGE}">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;">${params.ctaText}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${params.ctaUrl}" style="background-color: ${ORANGE}; color: ${WHITE}; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; letter-spacing: 0.3px; mso-padding-alt: 0;">${params.ctaText}</a>
          <!--<![endif]-->
        </td></tr>
       </table>`
    : "";

  const secondaryLink = params.secondaryCta
    ? `<p style="text-align: center; margin: 8px 0 0;"><a href="${params.secondaryCta.url}" style="color: ${TEXT_GRAY}; font-size: 13px; text-decoration: underline;">${params.secondaryCta.text}</a></p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>BestFoodWhere</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap');
    body, table, td { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    a { color: ${ORANGE}; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .content-cell { padding: 24px 20px !important; }
      .header-cell { padding: 24px 20px !important; }
      .footer-cell { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_BODY}; -webkit-font-smoothing: antialiased;">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BG_BODY};">
    <tr><td align="center" style="padding: 32px 16px;">

      <!-- Email Container -->
      <table role="presentation" class="email-container" width="560" cellpadding="0" cellspacing="0" style="background-color: ${WHITE}; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr><td class="header-cell" style="padding: 28px 40px 20px; text-align: center; background: linear-gradient(180deg, ${BG_WARM} 0%, ${WHITE} 100%);">
          <a href="${BFW_URL}" style="text-decoration: none;">
            <img src="${BFW_LOGO}" alt="BestFoodWhere" width="160" style="max-width: 160px; height: auto; border: 0;">
          </a>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding: 0 40px;">
          <hr style="border: none; border-top: 1px solid ${BORDER_LIGHT}; margin: 0;">
        </td></tr>

        <!-- Body -->
        <tr><td class="content-cell" style="padding: 28px 40px 32px;">
          <h1 style="font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 21px; font-weight: 700; color: ${TEXT_DARK}; margin: 0 0 18px; line-height: 1.3;">${params.headline}</h1>
          <div style="font-size: 15px; line-height: 1.7; color: ${TEXT_DARK};">${params.body}</div>
          ${ctaButton}
          ${secondaryLink}
        </td></tr>

        <!-- Footer -->
        <tr><td class="footer-cell" style="padding: 24px 40px; background-color: ${BG_WARM}; border-top: 1px solid ${BORDER_LIGHT};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="text-align: center;">
              <a href="${BFW_URL}" style="color: ${ORANGE}; font-size: 13px; font-weight: 600; text-decoration: none;">bestfoodwhere.sg</a>
              <p style="font-size: 12px; color: ${TEXT_LIGHT}; margin: 8px 0 0; line-height: 1.5;">
                Singapore's restaurant discovery platform<br>
                <a href="${BFW_URL}/unsubscribe?email={{email}}" style="color: ${TEXT_LIGHT}; text-decoration: underline;">Unsubscribe</a> &middot; <a href="mailto:hello@bestfoodwhere.sg" style="color: ${TEXT_LIGHT}; text-decoration: underline;">Contact us</a>
              </p>
            </td></tr>
          </table>
        </td></tr>

      </table>
      <!-- /Email Container -->

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
      preheader: "730+ restaurants, exclusive deals, and weekly picks — all yours.",
      headline: "You're in, {{firstName}}!",
      body: `<p style="margin: 0 0 14px;">Welcome to BestFoodWhere — Singapore's restaurant discovery platform with <strong>730+ brands</strong> across <strong>840 locations</strong>.</p>
<p style="margin: 0 0 14px;">Here's what you'll get from us:</p>
<ul style="padding-left: 20px; margin: 0 0 14px;">
  <li style="margin-bottom: 6px;">Weekly restaurant recommendations</li>
  <li style="margin-bottom: 6px;">Exclusive deals and promotions</li>
  <li style="margin-bottom: 6px;">New restaurant alerts in your area</li>
</ul>
<p style="margin: 0;">Start exploring — here are this week's trending restaurants:</p>`,
      ctaText: "Explore Menus",
      ctaUrl: `${BFW_URL}/menu`,
    }),
  },

  welcome_email_2: {
    subject: "What kind of foodie are you?",
    html: buildEmailTemplate({
      preheader: "19 cuisine categories — find your perfect match.",
      headline: "Find your perfect cuisine",
      body: `<p style="margin: 0 0 14px;">We have 19 cuisine categories — from hawker favourites to fine dining.</p>
<p style="margin: 0 0 14px;">Tell us what you love and we'll send you personalised picks:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 14px;">
  <tr><td style="padding: 10px 16px; background: ${BG_WARM}; border-radius: 8px;">
    <a href="${BFW_URL}/cuisine/chinese" style="color: ${ORANGE}; text-decoration: none; font-weight: 600;">Chinese</a> <span style="color: ${TEXT_GRAY};">— 150+ restaurants</span>
  </td></tr>
  <tr><td style="height: 4px;"></td></tr>
  <tr><td style="padding: 10px 16px; background: ${BG_WARM}; border-radius: 8px;">
    <a href="${BFW_URL}/cuisine/japanese" style="color: ${ORANGE}; text-decoration: none; font-weight: 600;">Japanese</a> <span style="color: ${TEXT_GRAY};">— 80+ restaurants</span>
  </td></tr>
  <tr><td style="height: 4px;"></td></tr>
  <tr><td style="padding: 10px 16px; background: ${BG_WARM}; border-radius: 8px;">
    <a href="${BFW_URL}/cuisine/western" style="color: ${ORANGE}; text-decoration: none; font-weight: 600;">Western</a> <span style="color: ${TEXT_GRAY};">— 100+ restaurants</span>
  </td></tr>
  <tr><td style="height: 4px;"></td></tr>
  <tr><td style="padding: 10px 16px; background: ${BG_WARM}; border-radius: 8px;">
    <a href="${BFW_URL}/cuisine/korean" style="color: ${ORANGE}; text-decoration: none; font-weight: 600;">Korean</a> <span style="color: ${TEXT_GRAY};">— 60+ restaurants</span>
  </td></tr>
</table>`,
      ctaText: "Browse All Cuisines",
      ctaUrl: `${BFW_URL}/cuisine`,
    }),
  },

  welcome_email_3: {
    subject: "Deals you won't find on Google",
    html: buildEmailTemplate({
      preheader: "1-for-1 mains, 50% off set menus, and more.",
      headline: "This week's exclusive deals",
      body: `<p style="margin: 0 0 14px;">We curate the best restaurant promotions across Singapore — deals you won't find anywhere else.</p>
<p style="margin: 0;">From 1-for-1 mains to 50% off set menus, we've got you covered.</p>`,
      ctaText: "See All Deals",
      ctaUrl: `${BFW_URL}/deals`,
    }),
  },

  welcome_email_4: {
    subject: "How we find Singapore's hidden gems",
    html: buildEmailTemplate({
      preheader: "Real visits, verified menus, community picks.",
      headline: "Behind the scenes at BFW",
      body: `<p style="margin: 0 0 14px;">We visit, research, and vet every restaurant on our platform. Here's how we discover Singapore's best food:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 14px;">
  <tr><td style="padding: 12px 16px; border-left: 3px solid ${ORANGE}; margin-bottom: 8px;">
    <strong style="color: ${TEXT_DARK};">Real visits</strong><br>
    <span style="color: ${TEXT_GRAY}; font-size: 14px;">Our team eats at restaurants before listing them</span>
  </td></tr>
  <tr><td style="height: 8px;"></td></tr>
  <tr><td style="padding: 12px 16px; border-left: 3px solid ${ORANGE};">
    <strong style="color: ${TEXT_DARK};">Menu verification</strong><br>
    <span style="color: ${TEXT_GRAY}; font-size: 14px;">We check prices and items are accurate</span>
  </td></tr>
  <tr><td style="height: 8px;"></td></tr>
  <tr><td style="padding: 12px 16px; border-left: 3px solid ${ORANGE};">
    <strong style="color: ${TEXT_DARK};">Community input</strong><br>
    <span style="color: ${TEXT_GRAY}; font-size: 14px;">Your reviews and nominations help us find hidden gems</span>
  </td></tr>
</table>
<p style="margin: 0;">Know a restaurant we should feature?</p>`,
      ctaText: "Nominate a Restaurant",
      ctaUrl: `${BFW_URL}/contact-us`,
    }),
  },

  welcome_email_5: {
    subject: "You've been here 12 days — here's a gift",
    html: buildEmailTemplate({
      preheader: "Quick question: what do you want to see more of?",
      headline: "Thanks for sticking around, {{firstName}}",
      body: `<p style="margin: 0 0 14px;">You've been part of the BFW community for almost two weeks now. We'd love to hear from you.</p>
<p style="margin: 0 0 14px;"><strong>Quick question:</strong> What do you want to see more of?</p>
<ul style="padding-left: 20px; margin: 0 0 14px;">
  <li style="margin-bottom: 6px;">More deals and promotions?</li>
  <li style="margin-bottom: 6px;">New restaurant alerts?</li>
  <li style="margin-bottom: 6px;">Recipe inspiration?</li>
  <li style="margin-bottom: 6px;">Cuisine guides?</li>
</ul>
<p style="margin: 0;">Just reply to this email — we read every response.</p>`,
      ctaText: "Explore What's New",
      ctaUrl: `${BFW_URL}/menu`,
    }),
  },
};

// ============ Advertiser Nurture Templates ============

export const ADVERTISER_TEMPLATES: Record<string, { subject: string; html: string }> = {
  advertiser_email_1: {
    subject: "Got your inquiry — here's what happens next",
    html: buildEmailTemplate({
      preheader: "We'll follow up within 24-48 hours with details.",
      headline: "Thanks for your interest, {{firstName}}",
      body: `<p style="margin: 0 0 14px;">We received your inquiry about advertising on BestFoodWhere.</p>
<p style="margin: 0 0 14px;"><strong>Here's what BFW delivers:</strong></p>
<ul style="padding-left: 20px; margin: 0 0 14px;">
  <li style="margin-bottom: 6px;">730+ restaurant brands listed</li>
  <li style="margin-bottom: 6px;">840 location pages with full menus</li>
  <li style="margin-bottom: 6px;">19 mall directory pages</li>
  <li style="margin-bottom: 6px;">Growing organic traffic from Google & AI search</li>
</ul>
<p style="margin: 0;">We'll follow up within 24-48 hours with details on how we can help your restaurant get discovered.</p>`,
      ctaText: "See Advertising Options",
      ctaUrl: `${BFW_URL}/advertise`,
    }),
  },

  advertiser_email_2: {
    subject: "How restaurants grow with BFW",
    html: buildEmailTemplate({
      preheader: "Complete profiles get 3x more page views.",
      headline: "What a BFW listing does for you",
      body: `<p style="margin: 0 0 14px;">Restaurants on BFW get discovered by people actively searching for where to eat.</p>
<p style="margin: 0 0 14px;"><strong>What you get:</strong></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 14px;">
  <tr><td style="padding: 12px 16px; background: ${BG_WARM}; border-radius: 8px; border-left: 3px solid ${ORANGE};">
    <strong>Dedicated menu page</strong> with full pricing<br>
    <strong>SEO-optimised listing</strong> — we rank on Google<br>
    <strong>Cuisine & mall pages</strong> — extra visibility<br>
    <strong>Featured placement</strong> — premium positioning
  </td></tr>
</table>
<p style="margin: 0;">Restaurants with complete profiles get <strong>3x more page views</strong> than basic listings.</p>`,
      ctaText: "Book a 15-Min Walkthrough",
      ctaUrl: `${BFW_URL}/contact-us`,
    }),
  },

  advertiser_email_3: {
    subject: "Your advertising options at a glance",
    html: buildEmailTemplate({
      preheader: "No hidden fees, no long contracts.",
      headline: "Simple, transparent pricing",
      body: `<p style="margin: 0 0 14px;">We keep it straightforward — no hidden fees, no long contracts.</p>
<p style="margin: 0;">Our listing tiers give you flexibility to start small and scale up as you see results.</p>`,
      ctaText: "View Pricing Tiers",
      ctaUrl: `${BFW_URL}/advertise`,
    }),
  },

  advertiser_email_4: {
    subject: "Don't just take our word for it",
    html: buildEmailTemplate({
      preheader: "Hear from restaurant owners already on BFW.",
      headline: "Restaurant partners love BFW",
      body: `<p style="margin: 0 0 14px;">Here's what restaurant owners say about being on BestFoodWhere:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 14px;">
  <tr><td style="padding: 16px 20px; background: ${BG_WARM}; border-radius: 8px; border-left: 3px solid ${ORANGE}; font-style: italic; color: ${TEXT_GRAY};">
    "BFW brought us customers who already knew our menu before walking in. The conversion rate is incredible."
  </td></tr>
</table>
<p style="margin: 0;">Join 730+ restaurants already on the platform.</p>`,
      ctaText: "Join 730+ Restaurants",
      ctaUrl: `${BFW_URL}/advertise`,
    }),
  },

  advertiser_email_5: {
    subject: "Special offer for new partners",
    html: buildEmailTemplate({
      preheader: "20% off your first month — limited time.",
      headline: "Limited time: 20% off your first month",
      body: `<p style="margin: 0 0 14px;">We'd love to have your restaurant on BFW. To make it easy to get started:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 14px;">
  <tr><td align="center" style="padding: 20px; background: ${BG_WARM}; border-radius: 12px;">
    <span style="font-size: 28px; font-weight: 700; color: ${ORANGE}; font-family: 'Montserrat', sans-serif;">20% OFF</span><br>
    <span style="font-size: 14px; color: ${TEXT_GRAY};">your first month</span>
  </td></tr>
</table>
<p style="margin: 0;">This offer expires in 7 days. If now isn't the right time, just reply and let us know — we're happy to chat whenever you're ready.</p>`,
      ctaText: "Claim Your Spot",
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
      preheader: "We're interested — here's what we need from you.",
      headline: "Thanks for reaching out, {{firstName}}",
      body: `<p style="margin: 0 0 14px;">We received your partnership inquiry and we're interested.</p>
<p style="margin: 0 0 14px;"><strong>About BFW's reach:</strong></p>
<ul style="padding-left: 20px; margin: 0 0 14px;">
  <li style="margin-bottom: 6px;">730+ restaurant brands</li>
  <li style="margin-bottom: 6px;">840 locations across Singapore</li>
  <li style="margin-bottom: 6px;">19 mall directory pages</li>
</ul>
<p style="margin: 0 0 14px;">To help us understand your proposal better, could you share:</p>
<ol style="padding-left: 20px; margin: 0;">
  <li style="margin-bottom: 6px;">Your organisation</li>
  <li style="margin-bottom: 6px;">Partnership type you're envisioning</li>
  <li style="margin-bottom: 6px;">Ideal timeline</li>
</ol>
<p style="margin: 14px 0 0;">Just reply to this email — we'll get back to you within 48 hours.</p>`,
    }),
  },

  partnership_email_2: {
    subject: "How BFW partnerships work",
    html: buildEmailTemplate({
      preheader: "Content, data, co-marketing, or API — pick your model.",
      headline: "Partnership models we offer",
      body: `<p style="margin: 0 0 14px;">Here's how we typically work with partners:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 14px;">
  <tr><td style="padding: 12px 16px; border-left: 3px solid ${ORANGE};">
    <strong>Content Collaborations</strong><br>
    <span style="color: ${TEXT_GRAY}; font-size: 14px;">Co-created guides, reviews, and features</span>
  </td></tr>
  <tr><td style="height: 8px;"></td></tr>
  <tr><td style="padding: 12px 16px; border-left: 3px solid ${ORANGE};">
    <strong>Data Partnerships</strong><br>
    <span style="color: ${TEXT_GRAY}; font-size: 14px;">Restaurant data, pricing intelligence, trend insights</span>
  </td></tr>
  <tr><td style="height: 8px;"></td></tr>
  <tr><td style="padding: 12px 16px; border-left: 3px solid ${ORANGE};">
    <strong>Co-Marketing</strong><br>
    <span style="color: ${TEXT_GRAY}; font-size: 14px;">Joint promotions, cross-platform campaigns</span>
  </td></tr>
  <tr><td style="height: 8px;"></td></tr>
  <tr><td style="padding: 12px 16px; border-left: 3px solid ${ORANGE};">
    <strong>API Integrations</strong><br>
    <span style="color: ${TEXT_GRAY}; font-size: 14px;">Menu data, restaurant info for your platform</span>
  </td></tr>
</table>`,
      ctaText: "Let's Discuss",
      ctaUrl: `${BFW_URL}/contact-us`,
    }),
  },

  partnership_email_3: {
    subject: "Let's find a time to talk",
    html: buildEmailTemplate({
      preheader: "15 minutes — no commitment, just a conversation.",
      headline: "15 minutes, no commitment",
      body: `<p style="margin: 0;">A quick call is the fastest way to explore fit. No pitch — just a conversation about what could work for both of us.</p>`,
      ctaText: "Reply With Your Availability",
      ctaUrl: `mailto:hello@bestfoodwhere.sg`,
    }),
  },

  partnership_email_4: {
    subject: "Checking in on your partnership idea",
    html: buildEmailTemplate({
      preheader: "Still interested? No pressure either way.",
      headline: "Still interested, {{firstName}}?",
      body: `<p style="margin: 0 0 14px;">Just checking in on your partnership inquiry. We're still keen to explore this.</p>
<p style="margin: 0;">If the timing isn't right, just reply with "later" and we'll check back in 3 months. No pressure at all.</p>`,
      ctaText: "Let's Connect",
      ctaUrl: `mailto:hello@bestfoodwhere.sg`,
    }),
  },
};

// ============ Re-engagement Templates ============

export const REENGAGEMENT_TEMPLATES: Record<string, { subject: string; html: string }> = {
  reengagement_email_1: {
    subject: "Singapore's food scene changed while you were away",
    html: buildEmailTemplate({
      preheader: "New restaurants, updated menus, fresh deals.",
      headline: "Here's what you missed",
      body: `<p style="margin: 0 0 14px;">It's been a while! Singapore's food scene doesn't stand still — here's what's new:</p>
<ul style="padding-left: 20px; margin: 0 0 14px;">
  <li style="margin-bottom: 6px;">New restaurants added to BFW</li>
  <li style="margin-bottom: 6px;">Updated menus and prices</li>
  <li style="margin-bottom: 6px;">Fresh deals and promotions</li>
</ul>
<p style="margin: 0;">We saved the highlights for you.</p>`,
      ctaText: "See What's New",
      ctaUrl: `${BFW_URL}/menu`,
    }),
  },

  reengagement_email_2: {
    subject: "A little something to welcome you back",
    html: buildEmailTemplate({
      preheader: "Curated picks just for returning members.",
      headline: "Welcome back, {{firstName}}",
      body: `<p style="margin: 0;">We've put together a curated list of the best new restaurants and deals — just for returning members.</p>`,
      ctaText: "Explore Curated Picks",
      ctaUrl: `${BFW_URL}/deals`,
    }),
  },

  reengagement_email_3: {
    subject: "Should we stop sending these?",
    html: buildEmailTemplate({
      preheader: "Your call — stay or go, no hard feelings.",
      headline: "Your call, {{firstName}}",
      body: `<p style="margin: 0 0 14px;">We noticed you haven't opened our emails in a while. No hard feelings — we only want to send you stuff you actually want.</p>
<p style="margin: 0;"><strong>Two options:</strong></p>`,
      ctaText: "Keep Me Subscribed",
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
      preheader: "Your quick-start checklist to maximise your listing.",
      headline: "Welcome aboard, {{firstName}}!",
      body: `<p style="margin: 0 0 14px;">Your restaurant is now live on BestFoodWhere. Here's your quick-start checklist:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 14px;">
  <tr><td style="padding: 10px 16px; background: ${BG_WARM}; border-radius: 8px;">
    <span style="color: ${ORANGE}; font-weight: 700;">1.</span> Upload your logo
  </td></tr>
  <tr><td style="height: 4px;"></td></tr>
  <tr><td style="padding: 10px 16px; background: ${BG_WARM}; border-radius: 8px;">
    <span style="color: ${ORANGE}; font-weight: 700;">2.</span> Verify your menu is accurate
  </td></tr>
  <tr><td style="height: 4px;"></td></tr>
  <tr><td style="padding: 10px 16px; background: ${BG_WARM}; border-radius: 8px;">
    <span style="color: ${ORANGE}; font-weight: 700;">3.</span> Add photos of your dishes
  </td></tr>
  <tr><td style="height: 4px;"></td></tr>
  <tr><td style="padding: 10px 16px; background: ${BG_WARM}; border-radius: 8px;">
    <span style="color: ${ORANGE}; font-weight: 700;">4.</span> Set your business hours
  </td></tr>
</table>
<p style="margin: 0;">Complete profiles get <strong>3x more views</strong>.</p>`,
      ctaText: "Go to Your Dashboard",
      ctaUrl: `${BFW_URL}/restaurant/dashboard`,
    }),
  },

  onboarding_email_2: {
    subject: "3 things top-performing restaurants do on BFW",
    html: buildEmailTemplate({
      preheader: "What the most-viewed restaurants have in common.",
      headline: "Maximise your listing",
      body: `<p style="margin: 0 0 14px;">Here's what the most-viewed restaurants on BFW have in common:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 14px;">
  <tr><td style="padding: 12px 16px; border-left: 3px solid ${ORANGE};">
    <strong>Complete profile</strong><br>
    <span style="color: ${TEXT_GRAY}; font-size: 14px;">Logo, photos, hours, and accurate menu</span>
  </td></tr>
  <tr><td style="height: 8px;"></td></tr>
  <tr><td style="padding: 12px 16px; border-left: 3px solid ${ORANGE};">
    <strong>Updated menu</strong><br>
    <span style="color: ${TEXT_GRAY}; font-size: 14px;">Seasonal updates get 2x more repeat visitors</span>
  </td></tr>
  <tr><td style="height: 8px;"></td></tr>
  <tr><td style="padding: 12px 16px; border-left: 3px solid ${ORANGE};">
    <strong>Respond to reviews</strong><br>
    <span style="color: ${TEXT_GRAY}; font-size: 14px;">Engagement builds trust with potential customers</span>
  </td></tr>
</table>`,
      ctaText: "Update Your Profile",
      ctaUrl: `${BFW_URL}/restaurant/settings`,
    }),
  },

  onboarding_email_3: {
    subject: "Your first week stats are in",
    html: buildEmailTemplate({
      preheader: "Here's how your listing is performing so far.",
      headline: "Here's how your listing is performing",
      body: `<p style="margin: 0 0 14px;">Your restaurant has been live for a few days. Here's a quick snapshot of your visibility on BFW.</p>
<p style="margin: 0;">Want to boost these numbers? Adding more menu photos is the #1 way to increase page views.</p>`,
      ctaText: "View Your Analytics",
      ctaUrl: `${BFW_URL}/restaurant/analytics`,
    }),
  },

  onboarding_email_4: {
    subject: "How's your first week going?",
    html: buildEmailTemplate({
      preheader: "Quick check-in — need help with anything?",
      headline: "Quick check-in",
      body: `<p style="margin: 0 0 14px;">Just checking in on your BFW experience so far. Everything going smoothly?</p>
<p style="margin: 0;">If you need help with anything — setting up your profile, understanding your analytics, or anything else — just reply to this email. We're here to help you get the most out of your listing.</p>`,
      ctaText: "Visit Your Dashboard",
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
