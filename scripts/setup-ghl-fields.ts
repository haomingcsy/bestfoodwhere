/**
 * One-time setup: Create BFW custom fields in GHL via API.
 * Run: npx tsx scripts/setup-ghl-fields.ts
 */

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_BASE_URL = "https://services.leadconnectorhq.com";

if (!GHL_API_KEY || !GHL_LOCATION_ID) {
  console.error("Missing GHL_API_KEY or GHL_LOCATION_ID env vars");
  process.exit(1);
}

async function ghlRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${GHL_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GHL_API_KEY}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GHL API error ${response.status}: ${body}`);
  }

  return response.json();
}

const CUSTOM_FIELDS = [
  { name: "BFW Engagement Tier", fieldKey: "bfw_engagement_tier", dataType: "TEXT" },
];

async function getExistingFields(): Promise<Set<string>> {
  const response = await ghlRequest<{ customFields: Array<{ fieldKey: string }> }>(
    `/locations/${GHL_LOCATION_ID}/customFields`
  );
  return new Set(response.customFields.map((f) => f.fieldKey.replace(/^contact\./, "")));
}

async function createCustomFields() {
  console.log("Fetching existing custom fields...");
  const existing = await getExistingFields();
  console.log(`Found ${existing.size} existing fields.\n`);

  for (const field of CUSTOM_FIELDS) {
    if (existing.has(field.fieldKey)) {
      console.log(`  SKIP: ${field.name} (${field.fieldKey}) — already exists`);
      continue;
    }

    try {
      const result = await ghlRequest<{ customField: { id: string } }>(
        `/locations/${GHL_LOCATION_ID}/customFields`,
        {
          method: "POST",
          body: JSON.stringify({
            name: field.name,
            fieldKey: field.fieldKey,
            dataType: field.dataType,
            model: "contact",
          }),
        }
      );
      console.log(`  CREATED: ${field.name} (${field.fieldKey}) → ID: ${result.customField.id}`);
      console.log(`    Add to GHL_FIELD_IDS in lib/ghl/utils.ts: bfw_engagement_tier: "${result.customField.id}"`);
    } catch (err) {
      console.error(`  FAILED: ${field.name} —`, err);
    }
  }

  console.log("\nDone. Update lib/ghl/utils.ts GHL_FIELD_IDS with any new field IDs above.");
}

createCustomFields().catch(console.error);
