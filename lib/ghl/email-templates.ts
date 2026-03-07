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
const ORANGE_LIGHT = "#ff8c5a";
const ORANGE_DARK = "#d4501f";
const TEXT_DARK = "#1a1a1a";
const TEXT_BODY = "#2d2d2d";
const TEXT_GRAY = "#666666";
const TEXT_LIGHT = "#999999";
const BG_WARM = "#fff9f6";
const BG_BODY = "#f4f1ee";
const BG_ORANGE_SUBTLE = "#fff0e8";
const WHITE = "#ffffff";
const BORDER_LIGHT = "#f0ece8";
const BORDER_ORANGE = "#ffd4bc";

/** Build a branded BFW email with visual polish */
function buildEmailTemplate(params: {
  preheader?: string;
  headline: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCta?: { text: string; url: string };
  headerEmoji?: string;
  headerTagline?: string;
}): string {
  const preheader = params.preheader
    ? `<div style="display:none;font-size:1px;color:${BG_BODY};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${params.preheader}${"&nbsp;&zwnj;".repeat(30)}</div>`
    : "";

  const ctaButton = params.ctaText && params.ctaUrl
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0 8px;">
        <tr><td align="center">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${params.ctaUrl}" style="height:50px;v-text-anchor:middle;width:240px;" arcsize="16%" stroke="f" fillcolor="${ORANGE}">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;">${params.ctaText}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${params.ctaUrl}" style="background: linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE_LIGHT} 100%); background-color: ${ORANGE}; color: ${WHITE}; padding: 15px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(239,95,42,0.3);">${params.ctaText}</a>
          <!--<![endif]-->
        </td></tr>
       </table>`
    : "";

  const secondaryLink = params.secondaryCta
    ? `<p style="text-align: center; margin: 8px 0 0;"><a href="${params.secondaryCta.url}" style="color: ${TEXT_GRAY}; font-size: 13px; text-decoration: underline;">${params.secondaryCta.text}</a></p>`
    : "";

  const headerEmoji = params.headerEmoji || "";
  const headerTagline = params.headerTagline || "";

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
    body, table, td { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    a { color: ${ORANGE}; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .content-cell { padding: 24px 20px !important; }
      .header-cell { padding: 28px 20px 16px !important; }
      .footer-cell { padding: 20px !important; }
      .hero-cell { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_BODY}; -webkit-font-smoothing: antialiased;">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BG_BODY};">
    <tr><td align="center" style="padding: 24px 16px;">

      <!-- Email Container -->
      <table role="presentation" class="email-container" width="560" cellpadding="0" cellspacing="0" style="background-color: ${WHITE}; border-radius: 16px; overflow: hidden; border: 1px solid ${BORDER_ORANGE}; box-shadow: 0 4px 20px rgba(239,95,42,0.08);">

        <!-- Orange Top Accent Bar -->
        <tr><td style="height: 4px; background: linear-gradient(90deg, ${ORANGE} 0%, ${ORANGE_LIGHT} 50%, ${ORANGE} 100%); background-color: ${ORANGE}; font-size: 0; line-height: 0;">&nbsp;</td></tr>

        <!-- Header with Logo -->
        <tr><td class="header-cell" style="padding: 28px 40px 16px; text-align: center;">
          <a href="${BFW_URL}" style="text-decoration: none;">
            <img src="${BFW_LOGO}" alt="BestFoodWhere" width="150" style="max-width: 150px; height: auto; border: 0;">
          </a>
        </td></tr>

        ${headerEmoji ? `
        <!-- Hero Section -->
        <tr><td class="hero-cell" style="padding: 0 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding: 24px 0; text-align: center; background: linear-gradient(135deg, ${BG_WARM} 0%, ${BG_ORANGE_SUBTLE} 100%); background-color: ${BG_WARM}; border-radius: 12px;">
              <span style="font-size: 48px; line-height: 1;">${headerEmoji}</span>
              ${headerTagline ? `<p style="font-size: 13px; color: ${ORANGE}; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; margin: 12px 0 0;">${headerTagline}</p>` : ""}
            </td></tr>
          </table>
        </td></tr>` : ""}

        <!-- Body -->
        <tr><td class="content-cell" style="padding: 24px 40px 32px;">
          <h1 style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 700; color: ${TEXT_DARK}; margin: 0 0 18px; line-height: 1.35;">${params.headline}</h1>
          <div style="font-size: 15px; line-height: 1.7; color: ${TEXT_BODY};">${params.body}</div>
          ${ctaButton}
          ${secondaryLink}
        </td></tr>

        <!-- Footer -->
        <tr><td class="footer-cell" style="padding: 24px 40px; background-color: ${BG_WARM}; border-top: 1px solid ${BORDER_LIGHT};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="text-align: center;">
              <a href="${BFW_URL}" style="color: ${ORANGE}; font-size: 13px; font-weight: 700; text-decoration: none; letter-spacing: 0.3px;">bestfoodwhere.sg</a>
              <p style="font-size: 12px; color: ${TEXT_LIGHT}; margin: 8px 0 0; line-height: 1.6;">
                Singapore's #1 Restaurant Discovery Platform<br>
                <a href="${BFW_URL}/unsubscribe?email={{email}}" style="color: ${TEXT_LIGHT}; text-decoration: underline;">Unsubscribe</a> &middot; <a href="mailto:hello@bestfoodwhere.sg" style="color: ${TEXT_LIGHT}; text-decoration: underline;">hello@bestfoodwhere.sg</a>
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

/** Styled info card with icon + orange accent */
function infoCard(emoji: string, title: string, desc: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 8px;">
    <tr>
      <td style="width: 44px; padding: 12px 0 12px 14px; vertical-align: top; background: ${BG_WARM}; border-radius: 10px 0 0 10px; border-left: 3px solid ${ORANGE};">
        <span style="font-size: 20px;">${emoji}</span>
      </td>
      <td style="padding: 12px 14px 12px 10px; background: ${BG_WARM}; border-radius: 0 10px 10px 0;">
        <strong style="color: ${TEXT_DARK}; font-size: 14px;">${title}</strong><br>
        <span style="color: ${TEXT_GRAY}; font-size: 13px; line-height: 1.4;">${desc}</span>
      </td>
    </tr>
  </table>`;
}

/** Stat badge with big number */
function statBadge(number: string, label: string): string {
  return `<td style="padding: 14px 8px; text-align: center; background: ${BG_WARM}; border-radius: 10px; width: 33%;">
    <span style="font-size: 24px; font-weight: 800; color: ${ORANGE}; display: block; line-height: 1;">${number}</span>
    <span style="font-size: 11px; color: ${TEXT_GRAY}; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; display: block;">${label}</span>
  </td>`;
}

/** Cuisine link pill */
function cuisinePill(name: string, slug: string, count: string): string {
  return `<a href="${BFW_URL}/cuisine/${slug}" style="display: inline-block; padding: 8px 16px; margin: 4px; background: ${BG_WARM}; border: 1px solid ${BORDER_ORANGE}; border-radius: 20px; text-decoration: none; color: ${TEXT_DARK}; font-size: 13px; font-weight: 600;">${name} <span style="color: ${TEXT_GRAY}; font-weight: 400;">${count}</span></a>`;
}

// ============ Welcome Sequence Templates ============

export const WELCOME_TEMPLATES: Record<string, { subject: string; html: string }> = {
  welcome_email_1: {
    subject: "Welcome to the food club",
    html: buildEmailTemplate({
      preheader: "730+ restaurants, exclusive deals, and weekly picks — all yours.",
      headerEmoji: "🍜",
      headerTagline: "Welcome to the club",
      headline: "You're in, {{firstName}}! 🎉",
      body: `<p style="margin: 0 0 16px; font-size: 16px;">Welcome to <strong>BestFoodWhere</strong> — Singapore's restaurant discovery platform.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 20px;">
  <tr>
    ${statBadge("730+", "Brands")}
    <td style="width: 8px;"></td>
    ${statBadge("840", "Locations")}
    <td style="width: 8px;"></td>
    ${statBadge("19", "Malls")}
  </tr>
</table>

<p style="margin: 0 0 12px; font-weight: 600; color: ${TEXT_DARK};">Here's what you'll get from us:</p>
${infoCard("📬", "Weekly Picks", "Curated restaurant recommendations every week")}
${infoCard("🏷️", "Exclusive Deals", "Promotions you won't find anywhere else")}
${infoCard("🆕", "New Alerts", "Be the first to know about new restaurants")}`,
      ctaText: "Start Exploring →",
      ctaUrl: `${BFW_URL}/menu`,
    }),
  },

  welcome_email_2: {
    subject: "What kind of foodie are you?",
    html: buildEmailTemplate({
      preheader: "19 cuisine categories — find your perfect match.",
      headerEmoji: "🍱",
      headerTagline: "Find your flavour",
      headline: "What's your favourite cuisine?",
      body: `<p style="margin: 0 0 16px;">We have <strong>19 cuisine categories</strong> — from hawker favourites to fine dining. Pick your flavour:</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px;">
  <tr><td style="text-align: center; line-height: 2.4;">
    ${cuisinePill("Chinese", "chinese", "150+")}
    ${cuisinePill("Japanese", "japanese", "80+")}
    ${cuisinePill("Western", "western", "100+")}
    ${cuisinePill("Korean", "korean", "60+")}
    ${cuisinePill("Thai", "thai", "40+")}
    ${cuisinePill("Indian", "indian", "50+")}
  </td></tr>
</table>

<p style="margin: 0; color: ${TEXT_GRAY};">...and 13 more categories waiting for you.</p>`,
      ctaText: "Browse All Cuisines →",
      ctaUrl: `${BFW_URL}/cuisine`,
    }),
  },

  welcome_email_3: {
    subject: "Deals you won't find on Google",
    html: buildEmailTemplate({
      preheader: "1-for-1 mains, 50% off set menus, and more.",
      headerEmoji: "🔥",
      headerTagline: "Hot deals this week",
      headline: "This week's exclusive deals",
      body: `<p style="margin: 0 0 16px;">We curate the best restaurant promotions across Singapore — deals you won't find anywhere else.</p>

${infoCard("🍕", "1-for-1 Deals", "Buy one get one free at selected restaurants")}
${infoCard("💰", "Up to 50% Off", "Set menus and seasonal specials")}
${infoCard("🎁", "Members Only", "Exclusive perks for BFW subscribers")}

<p style="margin: 16px 0 0; color: ${TEXT_GRAY}; font-size: 14px;">New deals are added every week. Don't miss out!</p>`,
      ctaText: "See All Deals →",
      ctaUrl: `${BFW_URL}/deals`,
    }),
  },

  welcome_email_4: {
    subject: "How we find Singapore's hidden gems",
    html: buildEmailTemplate({
      preheader: "Real visits, verified menus, community picks.",
      headerEmoji: "🔍",
      headerTagline: "Behind the scenes",
      headline: "How we discover the best food",
      body: `<p style="margin: 0 0 16px;">We visit, research, and vet every restaurant on our platform. Here's our process:</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px;">
  <tr><td style="padding: 16px; background: ${BG_WARM}; border-radius: 12px; border: 1px solid ${BORDER_ORANGE};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding: 6px 0;">
        <span style="display: inline-block; width: 28px; height: 28px; background: ${ORANGE}; color: white; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 700;">1</span>
        <span style="margin-left: 10px; font-weight: 600;">Real Visits</span> — <span style="color: ${TEXT_GRAY};">We eat there first</span>
      </td></tr>
      <tr><td style="padding: 6px 0;">
        <span style="display: inline-block; width: 28px; height: 28px; background: ${ORANGE}; color: white; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 700;">2</span>
        <span style="margin-left: 10px; font-weight: 600;">Menu Check</span> — <span style="color: ${TEXT_GRAY};">Prices & items verified</span>
      </td></tr>
      <tr><td style="padding: 6px 0;">
        <span style="display: inline-block; width: 28px; height: 28px; background: ${ORANGE}; color: white; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 700;">3</span>
        <span style="margin-left: 10px; font-weight: 600;">Community</span> — <span style="color: ${TEXT_GRAY};">Your reviews help us find gems</span>
      </td></tr>
    </table>
  </td></tr>
</table>

<p style="margin: 0;">Know a restaurant we should feature?</p>`,
      ctaText: "Nominate a Restaurant →",
      ctaUrl: `${BFW_URL}/contact-us`,
    }),
  },

  welcome_email_5: {
    subject: "You've been here 12 days — here's a gift",
    html: buildEmailTemplate({
      preheader: "Quick question: what do you want to see more of?",
      headerEmoji: "💌",
      headerTagline: "A note from us",
      headline: "Thanks for sticking around, {{firstName}} 🙏",
      body: `<p style="margin: 0 0 16px;">You've been part of the BFW community for almost two weeks. We'd love to hear what matters most to you.</p>

<p style="margin: 0 0 12px; font-weight: 600;">What do you want to see more of?</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px;">
  <tr><td style="padding: 12px 16px; background: ${BG_WARM}; border-radius: 10px; border: 1px solid ${BORDER_ORANGE};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding: 4px 0;"><span style="color: ${ORANGE};">▸</span> More deals and promotions</td></tr>
      <tr><td style="padding: 4px 0;"><span style="color: ${ORANGE};">▸</span> New restaurant alerts</td></tr>
      <tr><td style="padding: 4px 0;"><span style="color: ${ORANGE};">▸</span> Recipe inspiration</td></tr>
      <tr><td style="padding: 4px 0;"><span style="color: ${ORANGE};">▸</span> Cuisine guides & food trails</td></tr>
    </table>
  </td></tr>
</table>

<p style="margin: 0; font-style: italic; color: ${TEXT_GRAY};">Just reply to this email — we read every response.</p>`,
      ctaText: "Explore What's New →",
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
      headerEmoji: "📩",
      headerTagline: "Inquiry received",
      headline: "Thanks for your interest, {{firstName}}",
      body: `<p style="margin: 0 0 16px;">We received your inquiry about advertising on BestFoodWhere. Here's what we deliver:</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 20px;">
  <tr>
    ${statBadge("730+", "Brands")}
    <td style="width: 8px;"></td>
    ${statBadge("840", "Locations")}
    <td style="width: 8px;"></td>
    ${statBadge("19", "Malls")}
  </tr>
</table>

${infoCard("📈", "Growing Traffic", "Organic traffic from Google & AI search engines")}
${infoCard("🎯", "Targeted Audience", "People actively searching for where to eat")}

<p style="margin: 16px 0 0; color: ${TEXT_GRAY};">We'll follow up within 24-48 hours with details on how we can help your restaurant get discovered.</p>`,
      ctaText: "See Advertising Options →",
      ctaUrl: `${BFW_URL}/advertise`,
    }),
  },

  advertiser_email_2: {
    subject: "How restaurants grow with BFW",
    html: buildEmailTemplate({
      preheader: "Complete profiles get 3x more page views.",
      headerEmoji: "🚀",
      headerTagline: "Grow with us",
      headline: "What a BFW listing does for you",
      body: `<p style="margin: 0 0 16px;">Restaurants on BFW get discovered by people actively searching for where to eat.</p>

${infoCard("📋", "Dedicated Menu Page", "Full menu with accurate pricing")}
${infoCard("🔎", "SEO-Optimised", "We rank on Google for food searches")}
${infoCard("🏬", "Cuisine & Mall Pages", "Extra visibility across category pages")}
${infoCard("⭐", "Featured Placement", "Premium positioning for top results")}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
  <tr><td style="padding: 14px 20px; background: ${BG_ORANGE_SUBTLE}; border-radius: 10px; text-align: center; border: 1px dashed ${BORDER_ORANGE};">
    <span style="font-size: 14px; color: ${ORANGE_DARK}; font-weight: 700;">Complete profiles get 3x more page views</span>
  </td></tr>
</table>`,
      ctaText: "Book a 15-Min Walkthrough →",
      ctaUrl: `${BFW_URL}/contact-us`,
    }),
  },

  advertiser_email_3: {
    subject: "Your advertising options at a glance",
    html: buildEmailTemplate({
      preheader: "No hidden fees, no long contracts.",
      headerEmoji: "💡",
      headerTagline: "Simple pricing",
      headline: "Simple, transparent pricing",
      body: `<p style="margin: 0 0 16px;">We keep it straightforward — no hidden fees, no long contracts.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px;">
  <tr><td style="padding: 16px 20px; background: ${BG_WARM}; border-radius: 12px; border: 1px solid ${BORDER_ORANGE};">
    ${infoCard("✅", "Start Small", "Flexible tiers — scale up as you see results")}
    ${infoCard("📊", "Track Results", "See exactly how your listing performs")}
    ${infoCard("🤝", "No Lock-in", "Cancel anytime, no questions asked")}
  </td></tr>
</table>`,
      ctaText: "View Pricing Tiers →",
      ctaUrl: `${BFW_URL}/advertise`,
    }),
  },

  advertiser_email_4: {
    subject: "Don't just take our word for it",
    html: buildEmailTemplate({
      preheader: "Hear from restaurant owners already on BFW.",
      headerEmoji: "💬",
      headerTagline: "Partner stories",
      headline: "Restaurant partners love BFW",
      body: `<p style="margin: 0 0 16px;">Here's what restaurant owners say:</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px;">
  <tr><td style="padding: 20px; background: ${BG_WARM}; border-radius: 12px; border-left: 4px solid ${ORANGE};">
    <span style="font-size: 28px; line-height: 1;">❝</span>
    <p style="margin: 8px 0 12px; font-size: 15px; font-style: italic; color: ${TEXT_BODY}; line-height: 1.6;">BFW brought us customers who already knew our menu before walking in. The conversion rate is incredible.</p>
    <p style="margin: 0; font-size: 13px; color: ${TEXT_GRAY};">— Restaurant Owner, Singapore</p>
  </td></tr>
</table>

<p style="margin: 0;">Join <strong>730+ restaurants</strong> already on the platform.</p>`,
      ctaText: "Join 730+ Restaurants →",
      ctaUrl: `${BFW_URL}/advertise`,
    }),
  },

  advertiser_email_5: {
    subject: "Special offer for new partners",
    html: buildEmailTemplate({
      preheader: "20% off your first month — limited time.",
      headerEmoji: "🎉",
      headerTagline: "Exclusive offer",
      headline: "Limited time: 20% off your first month",
      body: `<p style="margin: 0 0 16px;">We'd love to have your restaurant on BFW. To make it easy to get started:</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 20px;">
  <tr><td align="center" style="padding: 28px 20px; background: linear-gradient(135deg, ${BG_WARM} 0%, ${BG_ORANGE_SUBTLE} 100%); background-color: ${BG_WARM}; border-radius: 16px; border: 2px dashed ${ORANGE};">
    <span style="font-size: 40px; font-weight: 800; color: ${ORANGE}; font-family: 'Helvetica Neue', sans-serif; display: block; line-height: 1;">20% OFF</span>
    <span style="font-size: 15px; color: ${TEXT_GRAY}; margin-top: 8px; display: block;">your first month on BFW</span>
    <span style="font-size: 12px; color: ${TEXT_LIGHT}; margin-top: 4px; display: block;">⏰ Offer expires in 7 days</span>
  </td></tr>
</table>

<p style="margin: 0; color: ${TEXT_GRAY};">If now isn't the right time, just reply and let us know — we're happy to chat whenever you're ready.</p>`,
      ctaText: "Claim Your Spot →",
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
      headerEmoji: "🤝",
      headerTagline: "Let's partner up",
      headline: "Thanks for reaching out, {{firstName}}",
      body: `<p style="margin: 0 0 16px;">We received your partnership inquiry and we're interested.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 20px;">
  <tr>
    ${statBadge("730+", "Brands")}
    <td style="width: 8px;"></td>
    ${statBadge("840", "Locations")}
    <td style="width: 8px;"></td>
    ${statBadge("19", "Malls")}
  </tr>
</table>

<p style="margin: 0 0 12px; font-weight: 600;">To help us understand your proposal, could you share:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px;">
  <tr><td style="padding: 14px 16px; background: ${BG_WARM}; border-radius: 10px; border: 1px solid ${BORDER_ORANGE};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding: 4px 0;"><span style="display: inline-block; width: 22px; height: 22px; background: ${ORANGE}; color: white; border-radius: 50%; text-align: center; line-height: 22px; font-size: 11px; font-weight: 700;">1</span> <span style="margin-left: 6px;">Your organisation</span></td></tr>
      <tr><td style="padding: 4px 0;"><span style="display: inline-block; width: 22px; height: 22px; background: ${ORANGE}; color: white; border-radius: 50%; text-align: center; line-height: 22px; font-size: 11px; font-weight: 700;">2</span> <span style="margin-left: 6px;">Partnership type you're envisioning</span></td></tr>
      <tr><td style="padding: 4px 0;"><span style="display: inline-block; width: 22px; height: 22px; background: ${ORANGE}; color: white; border-radius: 50%; text-align: center; line-height: 22px; font-size: 11px; font-weight: 700;">3</span> <span style="margin-left: 6px;">Ideal timeline</span></td></tr>
    </table>
  </td></tr>
</table>

<p style="margin: 0; font-style: italic; color: ${TEXT_GRAY};">Just reply to this email — we'll get back to you within 48 hours.</p>`,
    }),
  },

  partnership_email_2: {
    subject: "How BFW partnerships work",
    html: buildEmailTemplate({
      preheader: "Content, data, co-marketing, or API — pick your model.",
      headerEmoji: "🧩",
      headerTagline: "Partnership models",
      headline: "Partnership models we offer",
      body: `<p style="margin: 0 0 16px;">Here's how we typically work with partners:</p>

${infoCard("✍️", "Content Collaborations", "Co-created guides, reviews, and features")}
${infoCard("📊", "Data Partnerships", "Restaurant data, pricing intelligence, trend insights")}
${infoCard("📣", "Co-Marketing", "Joint promotions, cross-platform campaigns")}
${infoCard("🔌", "API Integrations", "Menu data, restaurant info for your platform")}`,
      ctaText: "Let's Discuss →",
      ctaUrl: `${BFW_URL}/contact-us`,
    }),
  },

  partnership_email_3: {
    subject: "Let's find a time to talk",
    html: buildEmailTemplate({
      preheader: "15 minutes — no commitment, just a conversation.",
      headerEmoji: "☕",
      headerTagline: "Quick chat?",
      headline: "15 minutes, no commitment",
      body: `<p style="margin: 0;">A quick call is the fastest way to explore fit. No pitch — just a conversation about what could work for both of us.</p>`,
      ctaText: "Reply With Your Availability →",
      ctaUrl: `mailto:hello@bestfoodwhere.sg`,
    }),
  },

  partnership_email_4: {
    subject: "Checking in on your partnership idea",
    html: buildEmailTemplate({
      preheader: "Still interested? No pressure either way.",
      headerEmoji: "👋",
      headerTagline: "Just checking in",
      headline: "Still interested, {{firstName}}?",
      body: `<p style="margin: 0 0 16px;">Just checking in on your partnership inquiry. We're still keen to explore this.</p>
<p style="margin: 0;">If the timing isn't right, just reply with <strong>"later"</strong> and we'll check back in 3 months. No pressure at all.</p>`,
      ctaText: "Let's Connect →",
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
      headerEmoji: "🗺️",
      headerTagline: "You've been missed",
      headline: "Here's what you missed, {{firstName}}",
      body: `<p style="margin: 0 0 16px;">It's been a while! Singapore's food scene doesn't stand still — here's what's new:</p>

${infoCard("🆕", "New Restaurants", "Fresh additions to the BFW platform")}
${infoCard("📋", "Updated Menus", "Latest prices and seasonal specials")}
${infoCard("🏷️", "Fresh Deals", "Promotions you won't want to miss")}

<p style="margin: 16px 0 0; color: ${TEXT_GRAY}; font-size: 14px;">We saved the highlights for you.</p>`,
      ctaText: "See What's New →",
      ctaUrl: `${BFW_URL}/menu`,
    }),
  },

  reengagement_email_2: {
    subject: "A little something to welcome you back",
    html: buildEmailTemplate({
      preheader: "Curated picks just for returning members.",
      headerEmoji: "🎁",
      headerTagline: "Welcome back",
      headline: "Welcome back, {{firstName}} 👋",
      body: `<p style="margin: 0;">We've put together a curated list of the best new restaurants and deals — just for returning members.</p>`,
      ctaText: "Explore Curated Picks →",
      ctaUrl: `${BFW_URL}/deals`,
    }),
  },

  reengagement_email_3: {
    subject: "Should we stop sending these?",
    html: buildEmailTemplate({
      preheader: "Your call — stay or go, no hard feelings.",
      headerEmoji: "💭",
      headerTagline: "Your choice",
      headline: "Your call, {{firstName}}",
      body: `<p style="margin: 0 0 16px;">We noticed you haven't opened our emails in a while. No hard feelings — we only want to send you stuff you actually want.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px;">
  <tr><td style="padding: 16px; background: ${BG_WARM}; border-radius: 12px; text-align: center; border: 1px solid ${BORDER_ORANGE};">
    <p style="margin: 0; font-weight: 600; color: ${TEXT_DARK};">Two options:</p>
  </td></tr>
</table>`,
      ctaText: "Keep Me Subscribed ✓",
      ctaUrl: `${BFW_URL}/menu`,
      secondaryCta: { text: "Unsubscribe — no hard feelings", url: `${BFW_URL}/unsubscribe?email={{email}}` },
    }),
  },
};

// ============ Onboarding Templates (Post-Payment) ============

export const ONBOARDING_TEMPLATES: Record<string, { subject: string; html: string }> = {
  onboarding_email_1: {
    subject: "You're live on BFW — here's your dashboard",
    html: buildEmailTemplate({
      preheader: "Your quick-start checklist to maximise your listing.",
      headerEmoji: "🎊",
      headerTagline: "You're live!",
      headline: "Welcome aboard, {{firstName}}! 🚀",
      body: `<p style="margin: 0 0 16px;">Your restaurant is now live on BestFoodWhere. Here's your quick-start checklist:</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px;">
  <tr><td style="padding: 16px; background: ${BG_WARM}; border-radius: 12px; border: 1px solid ${BORDER_ORANGE};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding: 6px 0;">
        <span style="display: inline-block; width: 28px; height: 28px; background: ${ORANGE}; color: white; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 700;">1</span>
        <span style="margin-left: 10px; font-weight: 600;">Upload your logo</span>
      </td></tr>
      <tr><td style="padding: 6px 0;">
        <span style="display: inline-block; width: 28px; height: 28px; background: ${ORANGE}; color: white; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 700;">2</span>
        <span style="margin-left: 10px; font-weight: 600;">Verify your menu</span>
      </td></tr>
      <tr><td style="padding: 6px 0;">
        <span style="display: inline-block; width: 28px; height: 28px; background: ${ORANGE}; color: white; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 700;">3</span>
        <span style="margin-left: 10px; font-weight: 600;">Add dish photos</span>
      </td></tr>
      <tr><td style="padding: 6px 0;">
        <span style="display: inline-block; width: 28px; height: 28px; background: ${ORANGE}; color: white; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 700;">4</span>
        <span style="margin-left: 10px; font-weight: 600;">Set business hours</span>
      </td></tr>
    </table>
  </td></tr>
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="padding: 12px 16px; background: ${BG_ORANGE_SUBTLE}; border-radius: 8px; text-align: center; border: 1px dashed ${BORDER_ORANGE};">
    <span style="font-size: 14px; color: ${ORANGE_DARK}; font-weight: 700;">💡 Complete profiles get 3x more views</span>
  </td></tr>
</table>`,
      ctaText: "Go to Your Dashboard →",
      ctaUrl: `${BFW_URL}/restaurant/dashboard`,
    }),
  },

  onboarding_email_2: {
    subject: "3 things top-performing restaurants do on BFW",
    html: buildEmailTemplate({
      preheader: "What the most-viewed restaurants have in common.",
      headerEmoji: "🏆",
      headerTagline: "Pro tips",
      headline: "Maximise your listing",
      body: `<p style="margin: 0 0 16px;">Here's what the most-viewed restaurants on BFW have in common:</p>

${infoCard("📸", "Complete Profile", "Logo, photos, hours, and accurate menu")}
${infoCard("🔄", "Updated Menu", "Seasonal updates get 2x more repeat visitors")}
${infoCard("💬", "Review Responses", "Engagement builds trust with customers")}`,
      ctaText: "Update Your Profile →",
      ctaUrl: `${BFW_URL}/restaurant/settings`,
    }),
  },

  onboarding_email_3: {
    subject: "Your first week stats are in",
    html: buildEmailTemplate({
      preheader: "Here's how your listing is performing so far.",
      headerEmoji: "📊",
      headerTagline: "Your stats",
      headline: "Your listing performance",
      body: `<p style="margin: 0 0 16px;">Your restaurant has been live for a few days. Here's a quick snapshot of your visibility on BFW.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px;">
  <tr><td style="padding: 14px 20px; background: ${BG_ORANGE_SUBTLE}; border-radius: 10px; text-align: center; border: 1px dashed ${BORDER_ORANGE};">
    <span style="font-size: 14px; color: ${ORANGE_DARK}; font-weight: 700;">📸 #1 tip: Add more menu photos to boost page views</span>
  </td></tr>
</table>`,
      ctaText: "View Your Analytics →",
      ctaUrl: `${BFW_URL}/restaurant/analytics`,
    }),
  },

  onboarding_email_4: {
    subject: "How's your first week going?",
    html: buildEmailTemplate({
      preheader: "Quick check-in — need help with anything?",
      headerEmoji: "👋",
      headerTagline: "Check-in",
      headline: "Quick check-in, {{firstName}}",
      body: `<p style="margin: 0 0 16px;">Just checking in on your BFW experience so far. Everything going smoothly?</p>
<p style="margin: 0;">If you need help with anything — setting up your profile, understanding your analytics, or anything else — just reply to this email. We're here to help you get the most out of your listing.</p>`,
      ctaText: "Visit Your Dashboard →",
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
