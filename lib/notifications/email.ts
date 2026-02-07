/**
 * Email Notifications using Resend
 *
 * Sends notifications for:
 * - Restaurant closures
 * - High-priority changes requiring review
 * - API cost alerts
 * - Sync failures
 * - Daily/weekly summaries
 */

import { Resend } from "resend";

// Lazy initialization to avoid build-time errors
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@bestfoodwhere.sg";
const FROM_EMAIL = "BestFoodWhere Alerts <alerts@mail.bestfoodwhere.sg>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bestfoodwhere.sg";

/**
 * Send an email notification
 */
async function sendEmail(
  subject: string,
  html: string,
  text: string,
): Promise<boolean> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("Email send error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/**
 * Send a closure alert
 */
export async function sendClosureAlert(
  restaurantName: string,
  mallName: string,
  detectionSource: string,
  confidence: number,
): Promise<boolean> {
  const subject = `[ALERT] Restaurant Closure: ${restaurantName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Restaurant Closure Detected</h2>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Restaurant</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${restaurantName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Mall</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${mallName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Source</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${detectionSource}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Confidence</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${Math.round(confidence * 100)}%</td>
        </tr>
      </table>

      <p>
        <a href="${APP_URL}/admin/verification"
           style="display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px;">
          Review in Admin Dashboard
        </a>
      </p>

      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        BestFoodWhere Data Sync System
      </p>
    </div>
  `;

  const text = `
Restaurant Closure Detected

Restaurant: ${restaurantName}
Mall: ${mallName}
Source: ${detectionSource}
Confidence: ${Math.round(confidence * 100)}%

Review at: ${APP_URL}/admin/verification
  `;

  return sendEmail(subject, html, text);
}

/**
 * Send a cost alert
 */
export async function sendCostAlert(
  totalCost: number,
  threshold: number,
  breakdown: Array<{ api: string; cost: number }>,
): Promise<boolean> {
  const alertLevel = totalCost > threshold * 2 ? "CRITICAL" : "Warning";
  const subject = `[${alertLevel}] API Cost Alert: $${totalCost.toFixed(2)} today`;

  const breakdownRows = breakdown
    .map(
      (b) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${b.api}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">$${b.cost.toFixed(2)}</td>
      </tr>
    `,
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${totalCost > threshold * 2 ? "#dc2626" : "#f59e0b"};">
        ${alertLevel}: API Cost Alert
      </h2>

      <p>Today's API costs have reached <strong>$${totalCost.toFixed(2)}</strong> (threshold: $${threshold})</p>

      <h3>Cost Breakdown</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">API</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Cost</th>
          </tr>
        </thead>
        <tbody>
          ${breakdownRows}
        </tbody>
        <tfoot>
          <tr style="background: #f3f4f6; font-weight: bold;">
            <td style="padding: 10px; border: 1px solid #e5e7eb;">Total</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">$${totalCost.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <p>
        <a href="${APP_URL}/admin/data-sync"
           style="display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px;">
          View Dashboard
        </a>
      </p>

      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        BestFoodWhere Cost Monitor
      </p>
    </div>
  `;

  const breakdownText = breakdown
    .map((b) => `  ${b.api}: $${b.cost.toFixed(2)}`)
    .join("\n");

  const text = `
${alertLevel}: API Cost Alert

Today's costs: $${totalCost.toFixed(2)} (threshold: $${threshold})

Breakdown:
${breakdownText}

Total: $${totalCost.toFixed(2)}

View dashboard: ${APP_URL}/admin/data-sync
  `;

  return sendEmail(subject, html, text);
}

/**
 * Send a sync summary
 */
export async function sendSyncSummary(
  syncType: string,
  stats: {
    total: number;
    synced: number;
    failed: number;
    closures: string[];
    duration: number;
  },
): Promise<boolean> {
  const hasIssues = stats.failed > 0 || stats.closures.length > 0;
  const subject = `[Sync] ${syncType} Complete: ${stats.synced}/${stats.total} updated${hasIssues ? " (issues detected)" : ""}`;

  const closuresList =
    stats.closures.length > 0
      ? `
      <h3 style="color: #dc2626;">Closures Detected (${stats.closures.length})</h3>
      <ul>
        ${stats.closures
          .slice(0, 10)
          .map((c) => `<li>${c}</li>`)
          .join("")}
        ${stats.closures.length > 10 ? `<li>...and ${stats.closures.length - 10} more</li>` : ""}
      </ul>
    `
      : "";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${hasIssues ? "#f59e0b" : "#22c55e"};">${syncType} Sync Complete</h2>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Total</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${stats.total}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Updated</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; color: #22c55e;">${stats.synced}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Failed</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; color: ${stats.failed > 0 ? "#dc2626" : "inherit"};">${stats.failed}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Duration</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${Math.round(stats.duration / 1000)}s</td>
        </tr>
      </table>

      ${closuresList}

      <p>
        <a href="${APP_URL}/admin/data-sync"
           style="display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px;">
          View Details
        </a>
      </p>

      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        BestFoodWhere Data Sync
      </p>
    </div>
  `;

  const text = `
${syncType} Sync Complete

Total: ${stats.total}
Updated: ${stats.synced}
Failed: ${stats.failed}
Duration: ${Math.round(stats.duration / 1000)}s

${stats.closures.length > 0 ? `Closures detected: ${stats.closures.join(", ")}` : ""}

View details: ${APP_URL}/admin/data-sync
  `;

  return sendEmail(subject, html, text);
}

/**
 * Send a sync failure alert
 */
export async function sendSyncFailureAlert(
  syncType: string,
  error: string,
  affectedCount: number,
): Promise<boolean> {
  const subject = `[ERROR] ${syncType} Sync Failed`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Sync Failure Alert</h2>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Sync Type</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${syncType}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Affected</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${affectedCount} restaurants</td>
        </tr>
      </table>

      <h3>Error Details</h3>
      <pre style="background: #f3f4f6; padding: 15px; border-radius: 6px; overflow-x: auto;">
${error.substring(0, 500)}
      </pre>

      <p>
        <a href="${APP_URL}/admin/data-sync"
           style="display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px;">
          Check Dashboard
        </a>
      </p>

      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        BestFoodWhere Data Sync
      </p>
    </div>
  `;

  const text = `
Sync Failure Alert

Sync Type: ${syncType}
Affected: ${affectedCount} restaurants

Error: ${error.substring(0, 500)}

Check dashboard: ${APP_URL}/admin/data-sync
  `;

  return sendEmail(subject, html, text);
}

/**
 * Send daily summary
 */
export async function sendDailySummary(stats: {
  totalRestaurants: number;
  verified24h: number;
  stale14d: number;
  changesDetected: number;
  closures: number;
  pendingVerification: number;
  apiCostsToday: number;
}): Promise<boolean> {
  const healthScore = Math.round(
    (stats.verified24h / Math.max(stats.totalRestaurants, 1)) * 100,
  );
  const healthColor =
    healthScore >= 80 ? "#22c55e" : healthScore >= 50 ? "#f59e0b" : "#dc2626";

  const subject = `[Daily] Data Health: ${healthScore}% | $${stats.apiCostsToday.toFixed(2)} costs`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Daily Data Health Summary</h2>

      <div style="background: ${healthColor}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <div style="font-size: 48px; font-weight: bold;">${healthScore}%</div>
        <div>Data Health Score</div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Total Restaurants</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${stats.totalRestaurants}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Verified (24h)</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; color: #22c55e;">${stats.verified24h}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Stale (14d+)</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; color: ${stats.stale14d > 50 ? "#dc2626" : "inherit"};">${stats.stale14d}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Changes Detected</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${stats.changesDetected}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Closures</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; color: ${stats.closures > 0 ? "#dc2626" : "inherit"};">${stats.closures}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Pending Verification</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; color: ${stats.pendingVerification > 10 ? "#f59e0b" : "inherit"};">${stats.pendingVerification}</td>
        </tr>
        <tr style="background: #f3f4f6;">
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>API Costs Today</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>$${stats.apiCostsToday.toFixed(2)}</strong></td>
        </tr>
      </table>

      <p>
        <a href="${APP_URL}/admin/data-sync"
           style="display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px;">
          View Full Dashboard
        </a>
      </p>

      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        BestFoodWhere Daily Report
      </p>
    </div>
  `;

  const text = `
Daily Data Health Summary

Health Score: ${healthScore}%

Total Restaurants: ${stats.totalRestaurants}
Verified (24h): ${stats.verified24h}
Stale (14d+): ${stats.stale14d}
Changes Detected: ${stats.changesDetected}
Closures: ${stats.closures}
Pending Verification: ${stats.pendingVerification}
API Costs Today: $${stats.apiCostsToday.toFixed(2)}

View dashboard: ${APP_URL}/admin/data-sync
  `;

  return sendEmail(subject, html, text);
}

/**
 * Send verification queue alert
 */
export async function sendVerificationQueueAlert(
  pending: number,
  critical: number,
): Promise<boolean> {
  if (pending === 0) return true;

  const subject = `[Action Required] ${pending} items pending verification${critical > 0 ? ` (${critical} critical)` : ""}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verification Queue Alert</h2>

      <p>There are <strong>${pending}</strong> items waiting for review${critical > 0 ? ` including <strong style="color: #dc2626;">${critical} critical</strong> items` : ""}.</p>

      <p>
        <a href="${APP_URL}/admin/verification"
           style="display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px;">
          Review Queue
        </a>
      </p>

      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        BestFoodWhere Data Sync
      </p>
    </div>
  `;

  const text = `
Verification Queue Alert

${pending} items pending verification${critical > 0 ? ` (${critical} critical)` : ""}.

Review at: ${APP_URL}/admin/verification
  `;

  return sendEmail(subject, html, text);
}
