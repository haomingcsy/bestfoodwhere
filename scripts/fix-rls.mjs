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

console.log("Fixing RLS infinite recursion issue...\n");

// Drop problematic policies and create fixed ones
const sql = `
-- Drop the problematic admin policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can read all consumer profiles" ON public.consumer_profiles;
DROP POLICY IF EXISTS "Admins can read all restaurant profiles" ON public.restaurant_profiles;

-- Create a security definer function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND account_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

const { error: error1 } = await supabase
  .rpc("exec_sql", { sql_query: sql })
  .catch(() => ({ error: { message: "rpc not available" } }));

// Try direct approach - run each statement separately
const statements = [
  `DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles`,
  `DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles`,
  `DROP POLICY IF EXISTS "Admins can read all reviews" ON public.reviews`,
  `DROP POLICY IF EXISTS "Admins can update reviews" ON public.reviews`,
  `DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews`,
  `DROP POLICY IF EXISTS "Admins can read all consumer profiles" ON public.consumer_profiles`,
  `DROP POLICY IF EXISTS "Admins can read all restaurant profiles" ON public.restaurant_profiles`,
];

console.log(
  "Note: You need to run the following SQL in Supabase Dashboard > SQL Editor:\n",
);
console.log("=".repeat(60));
console.log(`
-- Fix infinite recursion in RLS policies

-- Drop the problematic admin policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can read all consumer profiles" ON public.consumer_profiles;
DROP POLICY IF EXISTS "Admins can read all restaurant profiles" ON public.restaurant_profiles;

-- Create a security definer function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND account_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`);
console.log("=".repeat(60));
console.log(
  "\nGo to: https://supabase.com/dashboard/project/hgdedyrjkywaboalisaw/sql/new",
);
