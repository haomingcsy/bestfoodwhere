/**
 * 08-export-google-sheets.ts
 *
 * Exports enriched brand data from Supabase to a Google Sheets "Enriched Data"
 * tab for manual review and quality checking.
 *
 * Usage:
 *   npx tsx scripts/pipeline/08-export-google-sheets.ts [--dry-run]
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { google } from "googleapis";

config({ path: resolve(__dirname, "../../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID; // Assessment spreadsheet

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

if (!SPREADSHEET_ID) {
  console.error("Missing GOOGLE_SHEETS_SPREADSHEET_ID in .env.local");
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const DRY_RUN = process.argv.includes("--dry-run");
const BATCH_SIZE = 1000;
const TAB_NAME = "Enriched Data";

const HEADERS = [
  "Slug",
  "Name",
  "Cuisine Type",
  "Website URL",
  "Scrape Status",
  "Menu Item Count",
  "Has Prices",
  "AI Description",
  "AI Amenities",
  "AI Recommendations",
  "Locations",
  "Social Links",
  "Hero Image URL",
  "Logo URL",
  "Enrichment Status",
  "Enrichment Score",
  "Last Scraped At",
];

interface BrandRow {
  id: string;
  slug: string;
  name: string;
  cuisine_type: string | null;
  website_url: string | null;
  scrape_status: string | null;
  ai_description: string | null;
  ai_amenities: string[] | null;
  ai_recommendations: string[] | null;
  social_links: Record<string, string> | null;
  hero_image_url: string | null;
  logo_url: string | null;
  enrichment_status: string | null;
  enrichment_score: number | null;
  last_scraped_at: string | null;
}

async function fetchAllBrands(): Promise<BrandRow[]> {
  const all: BrandRow[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("brand_menus")
      .select(
        "id, slug, name, cuisine_type, website_url, scrape_status, ai_description, ai_amenities, ai_recommendations, social_links, hero_image_url, logo_url, enrichment_status, enrichment_score, last_scraped_at",
      )
      .range(from, from + BATCH_SIZE - 1);
    if (error) throw new Error(`Failed to fetch brand_menus: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...(data as BrandRow[]));
    if (data.length < BATCH_SIZE) break;
    from += BATCH_SIZE;
  }
  return all;
}

async function fetchMenuItemCounts(): Promise<Record<string, number>> {
  // Fetch counts grouped by brand_menu_id using RPC or manual aggregation
  const counts: Record<string, number> = {};
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("menu_items")
      .select("brand_menu_id")
      .range(from, from + BATCH_SIZE - 1);
    if (error) throw new Error(`Failed to fetch menu_items: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const row of data) {
      counts[row.brand_menu_id] = (counts[row.brand_menu_id] || 0) + 1;
    }
    if (data.length < BATCH_SIZE) break;
    from += BATCH_SIZE;
  }
  return counts;
}

async function fetchBrandLocations(): Promise<Record<string, string[]>> {
  const locations: Record<string, string[]> = {};
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("brand_locations")
      .select("brand_menu_id, shopping_malls(name)")
      .range(from, from + BATCH_SIZE - 1);
    if (error)
      throw new Error(`Failed to fetch brand_locations: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const row of data as any[]) {
      const mallName = row.shopping_malls?.name;
      if (mallName) {
        if (!locations[row.brand_menu_id]) locations[row.brand_menu_id] = [];
        locations[row.brand_menu_id].push(mallName);
      }
    }
    if (data.length < BATCH_SIZE) break;
    from += BATCH_SIZE;
  }
  return locations;
}

function hasPrices(brandId: string, counts: Record<string, number>): string {
  // We only have counts here; mark Y if items exist (prices assumed present with items)
  return (counts[brandId] || 0) > 0 ? "Y" : "N";
}

function formatSocialLinks(links: Record<string, string> | null): string {
  if (!links) return "";
  return Object.entries(links)
    .map(([platform, url]) => `${platform}: ${url}`)
    .join("\n");
}

function truncate(str: string | null, max: number): string {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "..." : str;
}

function buildRow(
  brand: BrandRow,
  itemCounts: Record<string, number>,
  locationMap: Record<string, string[]>,
): string[] {
  return [
    brand.slug,
    brand.name,
    brand.cuisine_type || "",
    brand.website_url || "",
    brand.scrape_status || "",
    String(itemCounts[brand.id] || 0),
    hasPrices(brand.id, itemCounts),
    truncate(brand.ai_description, 500),
    (brand.ai_amenities || []).join(", "),
    (brand.ai_recommendations || []).join(", "),
    (locationMap[brand.id] || []).join(", "),
    formatSocialLinks(brand.social_links),
    brand.hero_image_url || "",
    brand.logo_url || "",
    brand.enrichment_status || "",
    brand.enrichment_score != null ? String(brand.enrichment_score) : "",
    brand.last_scraped_at || "",
  ];
}

async function getOrCreateTab(
  sheets: any,
  spreadsheetId: string,
): Promise<number> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = meta.data.sheets?.find(
    (s: any) => s.properties?.title === TAB_NAME,
  );
  if (existing) return existing.properties!.sheetId!;

  const res = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: TAB_NAME } } }],
    },
  });
  return res.data.replies![0].addSheet!.properties!.sheetId!;
}

async function formatHeaderBold(
  sheets: any,
  spreadsheetId: string,
  sheetId: number,
) {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true },
              },
            },
            fields: "userEnteredFormat.textFormat.bold",
          },
        },
      ],
    },
  });
}

async function main() {
  console.log(
    `Exporting enriched brand data to Google Sheets${DRY_RUN ? " (DRY RUN)" : ""}...\n`,
  );

  // Fetch data from Supabase
  console.log("Fetching brands from Supabase...");
  const [brands, itemCounts, locationMap] = await Promise.all([
    fetchAllBrands(),
    fetchMenuItemCounts(),
    fetchBrandLocations(),
  ]);
  console.log(`  Found ${brands.length} brands`);

  // Build rows
  const rows = brands.map((b) => buildRow(b, itemCounts, locationMap));

  if (DRY_RUN) {
    console.log(
      `\n[DRY RUN] Would write ${rows.length} data rows + 1 header to "${TAB_NAME}" tab.`,
    );
    console.log("Sample row (first brand):");
    if (rows.length > 0) {
      HEADERS.forEach((h, i) => console.log(`  ${h}: ${rows[0][i]}`));
    }
    console.log(`\nTimestamp: ${new Date().toISOString()}`);
    return;
  }

  // Authenticate with Google Sheets
  const auth = new google.auth.GoogleAuth({
    keyFile: resolve(__dirname, "../../client_secret_google_sheets.json"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  // Ensure tab exists
  console.log(`Ensuring "${TAB_NAME}" tab exists...`);
  const sheetId = await getOrCreateTab(sheets, SPREADSHEET_ID!);

  // Clear existing data
  console.log("Clearing existing data...");
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID!,
    range: `'${TAB_NAME}'`,
  });

  // Write header + data
  const values = [HEADERS, ...rows];
  console.log(`Writing ${rows.length} rows...`);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID!,
    range: `'${TAB_NAME}'!A1`,
    valueInputOption: "RAW",
    requestBody: { values },
  });

  // Bold header row
  await formatHeaderBold(sheets, SPREADSHEET_ID!, sheetId);

  console.log(`\nExport complete.`);
  console.log(`  Total rows exported: ${rows.length}`);
  console.log(`  Timestamp: ${new Date().toISOString()}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
