/**
 * _delete-sheets-rows.mjs
 *
 * Deletes rows from the Google Sheets "Assessment" tab that do NOT correspond
 * to any brand remaining in the Supabase `brand_menus` table.
 *
 * Auth: Google service account (genial-retina-485114-u9-766fc0022b06.json)
 *
 * Usage:
 *   node scripts/_delete-sheets-rows.mjs [--dry-run]
 */

import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Load env
// ---------------------------------------------------------------------------
const envPath = resolve(ROOT, ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const SPREADSHEET_ID =
  env.GOOGLE_SHEETS_SPREADSHEET_ID || "1_cYc73Tsni6Sqtb1OX61TjoWwFtVx5BcXnsYFo1bZBM";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");
const SHEET_NAME = "Assessment";

// Service account key file
const SERVICE_ACCOUNT_KEY = resolve(
  ROOT,
  "genial-retina-485114-u9-766fc0022b06.json",
);

// ---------------------------------------------------------------------------
// Google Sheets auth via service account
// ---------------------------------------------------------------------------
function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth;
}

// ---------------------------------------------------------------------------
// Supabase: fetch all remaining brand names
// ---------------------------------------------------------------------------
async function fetchRemainingBrandNames() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  const names = [];
  const BATCH = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("brand_menus")
      .select("name")
      .range(from, from + BATCH - 1);
    if (error) throw new Error(`Supabase error: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const row of data) names.push(row.name);
    if (data.length < BATCH) break;
    from += BATCH;
  }
  return names;
}

// ---------------------------------------------------------------------------
// Normalize name for matching
// ---------------------------------------------------------------------------
function normalizeName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[''`\u2018\u2019]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("=== Delete Assessment Sheet Rows ===");
  console.log(`Spreadsheet: ${SPREADSHEET_ID}`);
  console.log(`Sheet: ${SHEET_NAME}`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

  // 1. Fetch remaining brand names from Supabase
  console.log("Fetching remaining brands from Supabase...");
  const remainingNames = await fetchRemainingBrandNames();
  console.log(`  ${remainingNames.length} brands remain in Supabase\n`);

  const remainingSet = new Set(remainingNames.map(normalizeName));

  // 2. Authenticate with Google Sheets (service account)
  console.log("Authenticating with Google Sheets (service account)...");
  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  // 3. Get the sheet ID (needed for batchUpdate)
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const assessmentSheet = meta.data.sheets.find(
    (s) => s.properties.title === SHEET_NAME,
  );
  if (!assessmentSheet) {
    console.error(`Sheet "${SHEET_NAME}" not found!`);
    console.error(
      "Available sheets:",
      meta.data.sheets.map((s) => s.properties.title),
    );
    process.exit(1);
  }
  const sheetId = assessmentSheet.properties.sheetId;
  console.log(`  Sheet ID: ${sheetId}`);

  // 4. Fetch column A (brand names) from Assessment sheet
  console.log("\nFetching Assessment sheet data (column A)...");
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${SHEET_NAME}'!A:A`,
  });
  const allRows = res.data.values || [];
  console.log(`  Total rows (including header): ${allRows.length}`);

  // 5. Find rows to delete (skip header row 0)
  const rowsToDelete = [];
  for (let i = 1; i < allRows.length; i++) {
    const name = allRows[i]?.[0];
    if (!name || !name.trim()) {
      // Empty row — also delete
      rowsToDelete.push({ index: i, name: "(empty)" });
      continue;
    }
    const normalized = normalizeName(name);
    if (!remainingSet.has(normalized)) {
      rowsToDelete.push({ index: i, name });
    }
  }

  console.log(`\n  Rows to delete: ${rowsToDelete.length}`);
  console.log(`  Rows to keep: ${allRows.length - 1 - rowsToDelete.length}`);

  if (rowsToDelete.length === 0) {
    console.log("\nNothing to delete. Done.");
    return;
  }

  // Print the names being deleted
  console.log("\nBrands being deleted:");
  for (const r of rowsToDelete) {
    console.log(`  Row ${r.index + 1}: ${r.name}`);
  }

  if (DRY_RUN) {
    console.log("\n[DRY RUN] No changes made.");
    return;
  }

  // 6. Build delete requests (MUST go from bottom to top to preserve row indices)
  const sortedDesc = [...rowsToDelete].sort((a, b) => b.index - a.index);

  const requests = sortedDesc.map((r) => ({
    deleteDimension: {
      range: {
        sheetId,
        dimension: "ROWS",
        startIndex: r.index, // 0-based
        endIndex: r.index + 1,
      },
    },
  }));

  // 7. Execute in batches (Sheets API has a limit per request)
  const BATCH_SIZE = 100;
  let deleted = 0;
  for (let i = 0; i < requests.length; i += BATCH_SIZE) {
    const batch = requests.slice(i, i + BATCH_SIZE);
    console.log(
      `\nDeleting batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} rows)...`,
    );
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: batch },
    });
    deleted += batch.length;
    console.log(`  Done. Total deleted so far: ${deleted}`);
  }

  console.log(`\nComplete! Deleted ${deleted} rows from "${SHEET_NAME}" sheet.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
