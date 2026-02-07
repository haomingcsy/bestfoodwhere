#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
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

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

const email = process.argv[2] || "haomingxdd1@gmail.com";

const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("email", email)
  .single();

if (error) {
  console.error("Error:", error);
} else {
  console.log("Profile for", email);
  console.log(JSON.stringify(data, null, 2));
}
