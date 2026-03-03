/**
 * GSC Keyword Enrichment for CRM Contacts
 *
 * Enriches GHL contacts with top search keywords from Google Search Console.
 * Called fire-and-forget after SEO-attributed contact creation.
 */

import { getTopKeywordsForPage } from "./client";
import { getGHLClient } from "@/lib/ghl/client";

const BFW_SEARCH_KEYWORDS_FIELD_ID = "VvnNn1G2Ylyc7M5Mgsdf";

/**
 * Query GSC for the top keywords driving traffic to pageUrl,
 * then update the GHL contact with a comma-separated keyword list.
 * Never throws — all errors are logged and swallowed.
 */
export async function enrichContactWithKeywords(
  contactId: string,
  pageUrl: string,
): Promise<void> {
  try {
    const keywords = await getTopKeywordsForPage(pageUrl);

    if (keywords.length === 0) {
      console.log(`No GSC keywords found for ${pageUrl}, skipping enrichment`);
      return;
    }

    const ghl = getGHLClient();
    const result = await ghl.updateContactById(contactId, {
      customFields: [
        {
          id: BFW_SEARCH_KEYWORDS_FIELD_ID,
          field_value: keywords.join(", "),
        },
      ],
    });

    if (result.success) {
      console.log(
        `Enriched contact ${contactId} with keywords: ${keywords.join(", ")}`,
      );
    } else {
      console.error(
        `Failed to enrich contact ${contactId}:`,
        result.error,
      );
    }
  } catch (error) {
    console.error("GSC keyword enrichment error:", error);
  }
}
