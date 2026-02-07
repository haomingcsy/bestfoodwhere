/**
 * HubSpot Contact Cleanup Script
 *
 * Lists all contacts and identifies non-Singaporean ones for removal.
 * Run with: npx tsx scripts/hubspot-cleanup.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const envContent = readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex > 0) {
          const key = trimmed.slice(0, eqIndex);
          const value = trimmed.slice(eqIndex + 1);
          process.env[key] = value;
        }
      }
    }
  } catch (e) {
    console.error("Could not load .env.local:", e);
  }
}

loadEnv();

const HUBSPOT_API_BASE = "https://api.hubapi.com";
const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error("Error: HUBSPOT_ACCESS_TOKEN not found in environment");
  process.exit(1);
}

interface HubSpotContact {
  id: string;
  properties: {
    email?: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    createdate?: string;
  };
}

interface HubSpotListResponse {
  results: HubSpotContact[];
  paging?: {
    next?: {
      after: string;
    };
  };
}

async function fetchAllContacts(): Promise<HubSpotContact[]> {
  const allContacts: HubSpotContact[] = [];
  let after: string | undefined;

  do {
    const url = new URL(HUBSPOT_API_BASE + "/crm/v3/objects/contacts");
    url.searchParams.set("limit", "100");
    url.searchParams.set(
      "properties",
      "email,firstname,lastname,phone,createdate",
    );
    if (after) {
      url.searchParams.set("after", after);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: "Bearer " + ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("HubSpot API error:", response.status, error);
      break;
    }

    const data: HubSpotListResponse = await response.json();
    allContacts.push(...data.results);
    after = data.paging?.next?.after;

    console.log("Fetched " + allContacts.length + " contacts...");
  } while (after);

  return allContacts;
}

function isSingaporeanPhone(phone: string | undefined): boolean {
  if (!phone) return false;

  const cleaned = phone.replace(/[\s\-()]/g, "");

  // Singapore phone patterns:
  // +65XXXXXXXX (with country code)
  // 65XXXXXXXX (country code without +)
  // 8XXXXXXX or 9XXXXXXX or 6XXXXXXX (local 8-digit)

  if (cleaned.startsWith("+65") && cleaned.length === 11) {
    return /^[689]/.test(cleaned.slice(3));
  }
  if (cleaned.startsWith("65") && cleaned.length === 10) {
    return /^[689]/.test(cleaned.slice(2));
  }
  if (cleaned.length === 8 && /^[689]/.test(cleaned)) {
    return true;
  }

  return false;
}

async function deleteContact(contactId: string): Promise<boolean> {
  const response = await fetch(
    HUBSPOT_API_BASE + "/crm/v3/objects/contacts/" + contactId,
    {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + ACCESS_TOKEN,
      },
    },
  );

  return response.ok;
}

async function main() {
  console.log("=== HubSpot Contact Cleanup ===\n");

  // Fetch all contacts
  console.log("Fetching all contacts from HubSpot...\n");
  const contacts = await fetchAllContacts();

  if (contacts.length === 0) {
    console.log("No contacts found in HubSpot.");
    return;
  }

  console.log("\nTotal contacts: " + contacts.length + "\n");

  // Categorize contacts
  const singaporean: HubSpotContact[] = [];
  const nonSingaporean: HubSpotContact[] = [];
  const noPhone: HubSpotContact[] = [];

  for (const contact of contacts) {
    const phone = contact.properties.phone;
    if (!phone) {
      noPhone.push(contact);
    } else if (isSingaporeanPhone(phone)) {
      singaporean.push(contact);
    } else {
      nonSingaporean.push(contact);
    }
  }

  // Display summary
  console.log("=== Contact Summary ===");
  console.log("Singaporean (valid SG phone): " + singaporean.length);
  console.log("Non-Singaporean (foreign phone): " + nonSingaporean.length);
  console.log("No phone provided: " + noPhone.length);
  console.log("");

  // List all contacts with details
  console.log("=== All Contacts ===");
  for (const contact of contacts) {
    const { email, firstname, lastname, phone } = contact.properties;
    const name = [firstname, lastname].filter(Boolean).join(" ") || "(no name)";
    const isSG = isSingaporeanPhone(phone);
    const status = !phone ? "NO_PHONE" : isSG ? "SG" : "FOREIGN";
    console.log(
      "[" +
        status +
        "] " +
        contact.id +
        ": " +
        email +
        " | " +
        name +
        " | " +
        (phone || "(no phone)"),
    );
  }

  // List non-Singaporean contacts to be deleted
  if (nonSingaporean.length > 0) {
    console.log("\n=== Contacts to DELETE (Non-Singaporean) ===");
    for (const contact of nonSingaporean) {
      const { email, firstname, lastname, phone } = contact.properties;
      const name =
        [firstname, lastname].filter(Boolean).join(" ") || "(no name)";
      console.log(
        "  - " + contact.id + ": " + email + " | " + name + " | " + phone,
      );
    }

    // Ask for confirmation via command line arg
    if (process.argv.includes("--delete")) {
      console.log("\n=== Deleting Non-Singaporean Contacts ===");
      for (const contact of nonSingaporean) {
        const success = await deleteContact(contact.id);
        const symbol = success ? "OK" : "FAIL";
        console.log(
          "  " +
            symbol +
            " Deleted " +
            contact.id +
            " (" +
            contact.properties.email +
            ")",
        );
      }
      console.log("\nDeletion complete!");
    } else {
      console.log("\nTo delete these contacts, run with --delete flag:");
      console.log("   npx ts-node scripts/hubspot-cleanup.ts --delete");
    }
  }
}

main().catch(console.error);
