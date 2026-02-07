#!/usr/bin/env node

/**
 * Promote a user to admin
 * Usage: node scripts/promote-admin.mjs <email>
 */

import { createClient } from "@supabase/supabase-js";
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
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Create admin client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function promoteToAdmin(email) {
  console.log(`\nPromoting ${email} to admin...\n`);

  // First check if user exists
  const { data: profile, error: findError } = await supabase
    .from("profiles")
    .select("id, email, display_name, account_type")
    .eq("email", email)
    .single();

  if (findError) {
    if (findError.code === "PGRST116") {
      console.error(`❌ No user found with email: ${email}`);
      console.log(
        "\nThe user must sign up first before being promoted to admin.",
      );
      process.exit(1);
    }
    console.error("❌ Error finding user:", findError.message);
    process.exit(1);
  }

  if (profile.account_type === "admin") {
    console.log(`✅ ${profile.display_name || email} is already an admin!`);
    return;
  }

  console.log(
    `Found user: ${profile.display_name || "No name"} (${profile.email})`,
  );
  console.log(`Current account type: ${profile.account_type}`);

  // Update to admin
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ account_type: "admin" })
    .eq("id", profile.id);

  if (updateError) {
    console.error("❌ Error promoting user:", updateError.message);
    process.exit(1);
  }

  console.log(
    `\n✅ Successfully promoted ${profile.display_name || email} to admin!`,
  );
  console.log(`\nYou can now access the admin panel at: /admin`);
}

// Get email from command line args or use default
const email = process.argv[2] || "haomingxdd1@gmail.com";
promoteToAdmin(email);
