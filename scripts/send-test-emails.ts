/**
 * Send all email templates to a test address via GHL Conversations API.
 * Usage: npx tsx scripts/send-test-emails.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { getGHLClient } from "../lib/ghl/client";
import { getEmailTemplate, getSequenceTemplateKeys } from "../lib/ghl/email-templates";

const TEST_EMAIL = "meliodas988@hotmail.com";
const TEST_NAME = "Haoming";

const SEQUENCES = ["welcome", "advertiser", "partnership", "reengagement", "onboarding"];

async function main() {
  const ghl = getGHLClient();

  // First, upsert a test contact
  console.log(`Upserting test contact: ${TEST_EMAIL}...`);
  const contactResult = await ghl.createOrUpdateContact({
    email: TEST_EMAIL,
    firstName: TEST_NAME,
    lastName: "Test",
    tags: ["test-email-preview"],
  });

  if (!contactResult.success || !contactResult.contactId) {
    console.error("Failed to create test contact:", contactResult.error);
    return;
  }

  const contactId = contactResult.contactId;
  console.log(`Contact ID: ${contactId}\n`);

  // Get or create conversation
  console.log("Creating conversation...");
  const conversationId = await ghl.getOrCreateConversation(contactId);
  console.log(`Conversation ID: ${conversationId}\n`);

  let sent = 0;
  let failed = 0;

  for (const sequence of SEQUENCES) {
    const keys = getSequenceTemplateKeys(sequence);
    console.log(`\n--- ${sequence.toUpperCase()} SEQUENCE (${keys.length} emails) ---`);

    for (const key of keys) {
      const template = getEmailTemplate(key, {
        firstName: TEST_NAME,
        email: TEST_EMAIL,
        restaurantName: "Sample Restaurant",
      });

      if (!template) {
        console.log(`  SKIP: ${key} — template not found`);
        failed++;
        continue;
      }

      // Prefix subject with sequence info for easy identification
      const subject = `[BFW Preview] ${sequence}/${key}: ${template.subject}`;

      try {
        const result = await ghl.sendEmail({
          contactId,
          conversationId,
          subject,
          html: template.html,
        });

        if (result.success) {
          console.log(`  SENT: ${key} — "${template.subject}"`);
          sent++;
        } else {
          console.log(`  FAIL: ${key} — ${result.error}`);
          failed++;
        }

        // 5s delay to avoid GHL rate limiting
        await new Promise((r) => setTimeout(r, 5000));
      } catch (err) {
        console.error(`  ERROR: ${key} —`, err);
        failed++;
      }
    }
  }

  console.log(`\n\nDone. Sent: ${sent}, Failed: ${failed}`);
  console.log(`Check ${TEST_EMAIL} inbox (and spam folder).`);
}

main().catch(console.error);
