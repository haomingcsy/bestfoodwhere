/**
 * Google Search Console API Client
 *
 * Queries GSC for top search keywords per landing page.
 * Uses raw JWT + fetch — no Google SDK dependencies.
 */

import { createSign } from "crypto";

const GSC_SITE_URL = "sc-domain:bestfoodwhere.sg";
const GSC_API_BASE = "https://searchconsole.googleapis.com/webmasters/v3";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const TOP_N_KEYWORDS = 5;
const DATA_DELAY_DAYS = 3;
const LOOKBACK_DAYS = 28;

interface CacheEntry {
  keywords: string[];
  expiry: number;
}

interface GSCRow {
  keys: string[];
  clicks: number;
  impressions: number;
}

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
}

const cache = new Map<string, CacheEntry>();

let tokenCache: { token: string; expiry: number } | null = null;

function base64url(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64url");
}

function getCredentials(): ServiceAccountKey {
  const encodedJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!encodedJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON env var not set");
  }
  return JSON.parse(Buffer.from(encodedJson, "base64").toString());
}

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiry) {
    return tokenCache.token;
  }

  const creds = getCredentials();
  const now = Math.floor(Date.now() / 1000);

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: creds.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );

  const signInput = `${header}.${payload}`;
  const sign = createSign("RSA-SHA256");
  sign.update(signInput);
  const signature = sign.sign(creds.private_key, "base64url");

  const jwt = `${signInput}.${signature}`;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Token exchange failed ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  tokenCache = {
    token: data.access_token,
    expiry: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get the top search keywords for a specific page URL from GSC.
 * Returns up to 5 keywords sorted by clicks, with a 6-hour cache.
 * Returns empty array on any error — never throws.
 */
export async function getTopKeywordsForPage(
  pageUrl: string,
): Promise<string[]> {
  try {
    // Check cache
    const cached = cache.get(pageUrl);
    if (cached && Date.now() < cached.expiry) {
      console.log(`GSC cache hit for: ${pageUrl}`);
      return cached.keywords;
    }

    const token = await getAccessToken();

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - DATA_DELAY_DAYS);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - LOOKBACK_DAYS);

    const siteUrlEncoded = encodeURIComponent(GSC_SITE_URL);
    const url = `${GSC_API_BASE}/sites/${siteUrlEncoded}/searchAnalytics/query`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ["query"],
        dimensionFilterGroups: [
          {
            filters: [
              {
                dimension: "page",
                operator: "equals",
                expression: pageUrl,
              },
            ],
          },
        ],
        rowLimit: TOP_N_KEYWORDS,
        type: "web",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`GSC API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const rows: GSCRow[] = data.rows || [];
    const keywords = rows
      .map((row) => row.keys?.[0])
      .filter((k): k is string => !!k);

    // Cache the result
    cache.set(pageUrl, {
      keywords,
      expiry: Date.now() + CACHE_TTL_MS,
    });

    console.log(
      `GSC keywords for ${pageUrl}: ${keywords.length ? keywords.join(", ") : "(none)"}`,
    );
    return keywords;
  } catch (error) {
    console.error("GSC keyword query failed:", error);
    return [];
  }
}
