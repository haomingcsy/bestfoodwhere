#!/usr/bin/env node

/**
 * Supabase Auth Configuration Script
 * Checks and configures email and Google OAuth providers
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = join(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join("=").trim();
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ACCESS_TOKEN = env.SUPABASE_ACCESS_TOKEN;
const GOOGLE_CLIENT_ID = env.GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = env.GOOGLE_OAUTH_CLIENT_SECRET;

// Extract project ref from URL
const projectRef = SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];

if (!projectRef || !SUPABASE_ACCESS_TOKEN) {
  console.error("Missing SUPABASE_URL or SUPABASE_ACCESS_TOKEN");
  process.exit(1);
}

const API_URL = `https://api.supabase.com/v1/projects/${projectRef}`;

async function getAuthConfig() {
  const response = await fetch(`${API_URL}/config/auth`, {
    headers: {
      Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get auth config: ${response.status} ${await response.text()}`,
    );
  }

  return response.json();
}

async function updateAuthConfig(config) {
  console.log("   Sending config:", JSON.stringify(config, null, 2));

  const response = await fetch(`${API_URL}/config/auth`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to update auth config: ${response.status} ${text}`);
  }

  console.log("   Response:", text.substring(0, 200));
  return JSON.parse(text);
}

async function main() {
  console.log("🔍 Checking Supabase Auth Configuration...\n");
  console.log(`Project: ${projectRef}`);
  console.log(`URL: ${SUPABASE_URL}\n`);

  try {
    const config = await getAuthConfig();

    console.log("📧 Email Auth:");
    console.log(
      `   - Enabled: ${config.external_email_enabled !== false ? "✅ Yes" : "❌ No"}`,
    );
    console.log(
      `   - Confirm Email: ${config.mailer_autoconfirm === false ? "✅ Required" : "⚠️ Auto-confirmed"}`,
    );
    console.log(
      `   - Double Confirm: ${config.mailer_secure_email_change_enabled ? "✅ Yes" : "❌ No"}`,
    );

    console.log("\n🔐 Google OAuth:");
    console.log(
      `   - Enabled: ${config.external_google_enabled ? "✅ Yes" : "❌ No"}`,
    );
    console.log(
      `   - Client ID: ${config.external_google_client_id ? "✅ Configured" : "❌ Not set"}`,
    );
    console.log(
      `   - Client Secret: ${config.external_google_secret ? "✅ Configured" : "❌ Not set"}`,
    );

    console.log("\n🌐 Site URL:");
    console.log(`   - ${config.site_url || "Not set"}`);

    console.log("\n🔗 Redirect URLs:");
    console.log(`   - ${config.uri_allow_list || "Not set"}`);

    // Check if Google OAuth needs setup
    if (!config.external_google_enabled || !config.external_google_client_id) {
      if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
        console.log("\n📝 Enabling Google OAuth...");

        await updateAuthConfig({
          external_google_enabled: true,
          external_google_client_id: GOOGLE_CLIENT_ID,
          external_google_secret: GOOGLE_CLIENT_SECRET,
        });

        console.log("✅ Google OAuth enabled successfully!");
      } else {
        console.log("\n" + "=".repeat(60));
        console.log("⚠️  GOOGLE OAUTH SETUP REQUIRED");
        console.log("=".repeat(60));
        console.log("\nTo enable Google OAuth, you need to:");
        console.log("\n1. Go to Google Cloud Console:");
        console.log("   https://console.cloud.google.com/apis/credentials");
        console.log("\n2. Create OAuth 2.0 Client ID:");
        console.log("   - Application type: Web application");
        console.log("   - Authorized JavaScript origins:");
        console.log(`     ${SUPABASE_URL}`);
        console.log("     http://localhost:4007");
        console.log("   - Authorized redirect URIs:");
        console.log(`     ${SUPABASE_URL}/auth/v1/callback`);
        console.log("\n3. Copy the Client ID and Client Secret");
        console.log("\n4. Add to .env.local:");
        console.log("   GOOGLE_OAUTH_CLIENT_ID=your_client_id");
        console.log("   GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret");
        console.log("\n5. Run this script again");
        console.log("\n" + "=".repeat(60));
      }
    }

    // Check site URL configuration
    const prodUrl = "https://bestfoodwhere.sg";
    const devUrl = "http://localhost:4007";

    if (!config.site_url || !config.site_url.includes("bestfoodwhere.sg")) {
      console.log("\n📝 Updating Site URL and Redirect URLs...");

      await updateAuthConfig({
        site_url: prodUrl,
        uri_allow_list: `${prodUrl}/**,${prodUrl},${devUrl}/**,${devUrl}`,
      });

      console.log("✅ Site URL set to production: " + prodUrl);
      console.log("✅ Redirect URLs include both production and localhost");
    }

    console.log("\n✅ Auth configuration check complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
