#!/usr/bin/env node

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join("=").trim();
  }
});

const GOOGLE_API_KEY = env.GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = "198QKXG3B3StIEXYui17o1SmIEcpi1OsUbZGpaVFekhw";
const SUPABASE_URL = "https://hgdedyrjkywaboalisaw.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGVkeXJqa3l3YWJvYWxpc2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQwMzMyNiwiZXhwIjoyMDgxOTc5MzI2fQ.UHEFZBuZ4Di8T_SKp_ufulxyEcXOQLNoy2-wFs8v6R4";

function toSlug(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Map header slugs to URL slugs (same as shopping-mall-sheets.ts)
const HEADER_TO_URL_SLUG = {
  mbs: "marina-bay-sands",
  "velocity-novena": "velocity-novena-square",
  "the-woodleigh-mall": "woodleigh-mall",
};

function toUrlSlug(headerSlug) {
  return HEADER_TO_URL_SLUG[headerSlug] || headerSlug;
}

function parseRestaurantName(text) {
  if (!text) return null;
  const match = text.match(
    /Name\s*:\s*(.+?)(?:\s+(?:Cuisine|Reviews|Address|Phone|Price|Opening|Website|Image|Dining|Unit)\s*:|$)/i,
  );
  return match ? match[1].trim() : null;
}

async function fetchSheet(range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  return json.values || [];
}

async function main() {
  console.log("Fetching mall list from URLs sheet...\n");

  const urlsData = await fetchSheet("URLs!A:E");
  const mallSlugs = [];

  for (const row of urlsData) {
    const urlMatch = (row[0] || "").match(/\/shopping-malls\/([^\/]+)\/?$/);
    if (urlMatch && urlMatch[1] !== "shopping-malls") {
      mallSlugs.push(urlMatch[1]);
    }
  }

  console.log(`Found ${mallSlugs.length} malls:\n  ${mallSlugs.join(", ")}\n`);

  console.log("Fetching restaurant data from Full info sheet...\n");
  const fullInfo = await fetchSheet("Full info!A:Z");

  if (fullInfo.length < 2) {
    console.log("No data in Full info sheet");
    return;
  }

  const headers = fullInfo[0];
  console.log("Column headers:", headers.slice(0, 10).join(", "), "...\n");

  // Map headers to URL slugs (what the page uses)
  const headerToSlug = {};
  headers.forEach((h, idx) => {
    const headerSlug = toSlug(h);
    if (headerSlug) headerToSlug[idx] = toUrlSlug(headerSlug);
  });

  // Collect all restaurants by mall
  const restaurantsByMall = {};

  for (let i = 1; i < fullInfo.length; i++) {
    const row = fullInfo[i];
    for (let col = 0; col < row.length; col++) {
      const mallSlug = headerToSlug[col];
      if (!mallSlug) continue;

      const name = parseRestaurantName(row[col]);
      if (name) {
        if (!restaurantsByMall[mallSlug]) {
          restaurantsByMall[mallSlug] = [];
        }
        restaurantsByMall[mallSlug].push(name);
      }
    }
  }

  // Count totals
  let totalRestaurants = 0;
  for (const mall of Object.keys(restaurantsByMall)) {
    totalRestaurants += restaurantsByMall[mall].length;
  }

  console.log(`Total restaurants found: ${totalRestaurants}\n`);

  // Fetch existing descriptions (paginate to get all rows)
  console.log("Fetching existing descriptions from Supabase...\n");
  let existing = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const existingRes = await fetch(
      SUPABASE_URL +
        `/rest/v1/restaurant_descriptions?select=restaurant_name,mall_slug&limit=${limit}&offset=${offset}`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: "Bearer " + SUPABASE_KEY,
        },
      },
    );
    const batch = await existingRes.json();
    existing = existing.concat(batch);
    if (batch.length < limit) break;
    offset += limit;
  }

  const existingSet = new Set(
    existing.map((e) => `${e.restaurant_name}|${e.mall_slug}`),
  );
  console.log(`Existing descriptions: ${existing.length}\n`);

  // Find missing
  const missing = {};
  let missingCount = 0;

  for (const [mall, restaurants] of Object.entries(restaurantsByMall)) {
    for (const name of restaurants) {
      const key = `${name}|${mall}`;
      if (!existingSet.has(key)) {
        if (!missing[mall]) missing[mall] = [];
        missing[mall].push(name);
        missingCount++;
      }
    }
  }

  console.log(`Missing descriptions: ${missingCount}\n`);

  if (missingCount > 0) {
    console.log("=== RESTAURANTS NEEDING DESCRIPTIONS ===\n");
    for (const [mall, restaurants] of Object.entries(missing).sort()) {
      console.log(`\n${mall} (${restaurants.length}):`);
      restaurants.forEach((r) => console.log(`  - ${r}`));
    }
  }

  // Output JSON for easy processing
  console.log("\n\n=== JSON OUTPUT ===");
  console.log(JSON.stringify(missing, null, 2));
}

main().catch(console.error);
