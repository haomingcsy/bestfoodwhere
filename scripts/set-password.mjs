#!/usr/bin/env node

/**
 * Set/reset password for an existing user
 * Usage: node scripts/set-password.mjs <email> <password>
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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setPassword(email, password) {
  console.log(`\nSetting password for ${email}...\n`);

  // Find user by email
  const { data: users, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("❌ Error listing users:", listError.message);
    process.exit(1);
  }

  const user = users.users.find((u) => u.email === email);

  if (!user) {
    console.error(`❌ No auth user found with email: ${email}`);
    process.exit(1);
  }

  console.log(`Found user: ${user.id}`);

  // Update password
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      password: password,
    },
  );

  if (updateError) {
    console.error("❌ Error setting password:", updateError.message);
    process.exit(1);
  }

  console.log(`✅ Password updated successfully!`);
  console.log(`\nYou can now login with:`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node scripts/set-password.mjs <email> <password>");
  process.exit(1);
}

setPassword(email, password);
