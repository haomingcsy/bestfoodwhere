/**
 * Recipe Newsletter Welcome Email Template
 */

// Use the hosted logo from storage
const LOGO_URL =
  "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/recipe-images/brand/bfw-logo.png";
const UNSUBSCRIBE_URL = "https://bestfoodwhere.com/unsubscribe";

export function getRecipeWelcomeEmailHtml(email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BestFoodWhere Recipes!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; background-color: #fff8f5;">
              <img src="${LOGO_URL}" alt="BestFoodWhere" width="180" style="max-width: 180px; height: auto;">
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 24px; font-size: 28px; font-weight: 700; color: #1a1a1a; text-align: center;">
                Welcome, Food Lover! 🍳
              </h1>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                Thank you for subscribing to <strong>BestFoodWhere Recipes</strong>! You're now part of our community of home cooks who love discovering new dishes.
              </p>

              <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1a1a1a;">
                Here's what you can expect:
              </p>

              <ul style="margin: 0 0 24px; padding-left: 20px; font-size: 16px; line-height: 1.8; color: #4a4a4a;">
                <li>🥘 <strong>Weekly recipe updates</strong> – New dishes to try every week</li>
                <li>👨‍🍳 <strong>Step-by-step guides</strong> – Easy-to-follow instructions with photos</li>
                <li>💡 <strong>Cooking tips & tricks</strong> – Pro techniques made simple</li>
                <li>🌏 <strong>Asian & international cuisines</strong> – From local favorites to global flavors</li>
              </ul>

              <!-- CTA Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td style="background-color: #fff8f5; border-left: 4px solid #f97316; padding: 20px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #f97316;">
                      Start Cooking Today
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #c2410c;">
                      Browse our collection of tried-and-tested recipes!
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="https://bestfoodwhere.com/recipes" style="display: inline-block; padding: 16px 40px; background-color: #f97316; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Explore Recipes
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                Have a recipe request? Just reply to this email – we'd love to hear from you!
              </p>

              <p style="margin: 24px 0 0; font-size: 16px; color: #4a4a4a;">
                Happy cooking,<br>
                <strong>The BestFoodWhere Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px; font-size: 13px; color: #6b7280; text-align: center;">
                You're receiving this because you subscribed to recipe updates at BestFoodWhere.
              </p>
              <p style="margin: 0; font-size: 13px; color: #6b7280; text-align: center;">
                <a href="${UNSUBSCRIBE_URL}?email=${encodeURIComponent(email)}" style="color: #f97316; text-decoration: underline;">Unsubscribe</a>
                &nbsp;•&nbsp;
                <a href="https://bestfoodwhere.com/privacy" style="color: #6b7280; text-decoration: underline;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getRecipeWelcomeEmailText(email: string): string {
  return `
Welcome to BestFoodWhere Recipes! 🍳

Thank you for subscribing! You're now part of our community of home cooks who love discovering new dishes.

Here's what you can expect:
• Weekly recipe updates – New dishes to try every week
• Step-by-step guides – Easy-to-follow instructions with photos
• Cooking tips & tricks – Pro techniques made simple
• Asian & international cuisines – From local favorites to global flavors

Start cooking today: https://bestfoodwhere.com/recipes

Have a recipe request? Just reply to this email!

Happy cooking,
The BestFoodWhere Team

---
Unsubscribe: ${UNSUBSCRIBE_URL}?email=${encodeURIComponent(email)}
  `.trim();
}
