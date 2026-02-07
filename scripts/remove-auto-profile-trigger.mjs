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

const ACCESS_TOKEN = env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = "hgdedyrjkywaboalisaw";

async function runSQL(query) {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );

  const text = await response.text();
  return { status: response.status, body: text };
}

console.log("Removing auto-create profile trigger...\n");

// Remove the trigger that auto-creates profiles
const sql = `
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
`;

const result = await runSQL(sql);
console.log("Result:", result.status, result.body);

if (result.status === 201) {
  console.log("\n✅ Auto-create profile trigger removed!");
  console.log(
    "Now new Google sign-in users without profiles will be redirected to signup.",
  );
} else {
  console.log("\n❌ Failed to remove trigger");
}
