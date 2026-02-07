const fs = require("fs");
const crypto = require("crypto");

const SERVICE_ACCOUNT_PATH = "./mythic-fulcrum-482313-s7-0bcbb11c69a3.json";
const envOverrides = {};
if (fs.existsSync(".env.local")) {
  fs.readFileSync(".env.local", "utf8")
    .split("\n")
    .forEach((line) => {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match) envOverrides[match[1]] = match[2];
    });
}

const SHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID || envOverrides.GOOGLE_SHEETS_SPREADSHEET_ID;
const SHEET_NAME =
  process.env.GOOGLE_SHEETS_SHEET_NAME || envOverrides.GOOGLE_SHEETS_SHEET_NAME || "Assessment";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_URI = "https://oauth2.googleapis.com/token";

if (!SHEET_ID) {
  throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID in env.");
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function signJwt() {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60;
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: SCOPE,
      aud: TOKEN_URI,
      iat,
      exp,
    }),
  );
  const data = `${header}.${payload}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(data);
  const signature = signer.sign(serviceAccount.private_key, "base64");
  return `${data}.${signature.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")}`;
}

async function fetchAccessToken() {
  const assertion = signJwt();
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const response = await fetch(TOKEN_URI, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return json.access_token;
}

async function fetchSheetValues(accessToken, range) {
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}`,
  );
  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Values request failed: ${response.status} ${response.statusText}`);
  }
  const json = await response.json();
  return json.values || [];
}

function toColumnLetter(index) {
  let result = "";
  let num = index + 1;
  while (num > 0) {
    const rem = (num - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    num = Math.floor((num - 1) / 26);
  }
  return result;
}

async function updateCell(accessToken, range, value) {
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}`,
  );
  url.searchParams.set("valueInputOption", "RAW");
  const response = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [[value]] }),
  });
  if (!response.ok) {
    throw new Error(`Update failed: ${response.status} ${response.statusText}`);
  }
}

async function main() {
  const accessToken = await fetchAccessToken();
  const range = `${SHEET_NAME}!A:Z`;
  const values = await fetchSheetValues(accessToken, range);

  const headerRowIndex = values.findIndex((row) => {
    const normalized = row.map((cell) => String(cell || "").trim().toLowerCase());
    return normalized.includes("name") && normalized.some((cell) => cell.includes("general information"));
  });

  if (headerRowIndex === -1) {
    throw new Error("Unable to find header row.");
  }

  const headers = values[headerRowIndex] || [];
  const normalizedHeaders = headers.map((cell) => String(cell || "").trim().toLowerCase());
  let couponColIndex = normalizedHeaders.findIndex((cell) => cell === "exclusive coupons");

  if (couponColIndex === -1) {
    couponColIndex = headers.length;
    const colLetter = toColumnLetter(couponColIndex);
    const headerRowNumber = headerRowIndex + 1;
    await updateCell(accessToken, `${SHEET_NAME}!${colLetter}${headerRowNumber}`, "Exclusive Coupons");
  }

  const dataRows = values.slice(headerRowIndex + 1);
  const fourLeavesRowIndex = dataRows.findIndex(
    (row) => String(row[0] || "").trim().toLowerCase() === "four leaves",
  );

  if (fourLeavesRowIndex === -1) {
    throw new Error("Unable to find Four Leaves row.");
  }

  const targetRowNumber = headerRowIndex + 1 + fourLeavesRowIndex + 1;
  const colLetter = toColumnLetter(couponColIndex);
  const sampleCoupons = [
    "BFW-FL-15OFF | 15% off cakes above $30",
    "BFW-FL-BUN5 | Buy 5 buns, get 1 free",
    "BFW-FL-5OFF50 | $5 off purchases above $50",
  ].join("\n");

  await updateCell(accessToken, `${SHEET_NAME}!${colLetter}${targetRowNumber}`, sampleCoupons);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
