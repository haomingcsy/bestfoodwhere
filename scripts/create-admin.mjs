#!/usr/bin/env node

/**
 * Create an admin user with email/password
 * Usage: node scripts/create-admin.mjs <email> <password>
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
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdmin(email, password) {
  console.log(`\nCreating admin account for ${email}...\n`);

  // Check if user already exists in profiles
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, email, account_type")
    .eq("email", email)
    .single();

  if (existingProfile) {
    console.log(
      `User already exists with account type: ${existingProfile.account_type}`,
    );

    if (existingProfile.account_type !== "admin") {
      // Promote to admin
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ account_type: "admin" })
        .eq("id", existingProfile.id);

      if (updateError) {
        console.error("❌ Error promoting to admin:", updateError.message);
        process.exit(1);
      }
      console.log("✅ Promoted existing user to admin!");
    } else {
      console.log("✅ User is already an admin!");
    }
    return;
  }

  // Create auth user using admin API
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        display_name: "Admin",
      },
    });

  if (authError) {
    console.error("❌ Error creating auth user:", authError.message);
    process.exit(1);
  }

  console.log(`✅ Auth user created: ${authData.user.id}`);

  // Create profile as admin
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    email: email,
    display_name: "Admin",
    account_type: "admin",
  });

  if (profileError) {
    console.error("❌ Error creating profile:", profileError.message);
    // Try to clean up auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    process.exit(1);
  }

  console.log(`✅ Profile created with admin role`);
  console.log(`\n========================================`);
  console.log(`Admin account created successfully!`);
  console.log(`========================================`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`\nYou can now login at /login and access /admin`);
}

// Get email and password from command line args
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password>");
  process.exit(1);
}

createAdmin(email, password);
