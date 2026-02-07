import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Read the SQL file
const schemaPath = join(__dirname, "..", "supabase", "schema.sql");
const sql = readFileSync(schemaPath, "utf-8");

// Split into individual statements
const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

console.log(`Found ${statements.length} SQL statements to execute\n`);

async function runMigration() {
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ";";
    const preview = statement.substring(0, 60).replace(/\n/g, " ");

    try {
      const { error } = await supabase.rpc("exec_sql", { sql: statement });

      if (error) {
        // Try direct query for DDL statements
        const { error: directError } = await supabase
          .from("_migrations")
          .select("*")
          .limit(0);
        if (directError && directError.message.includes("does not exist")) {
          // Table doesn't exist, this is expected for first run
        }
        console.log(`[${i + 1}/${statements.length}] ⚠️  ${preview}...`);
        console.log(`    Error: ${error.message}`);
        errorCount++;
      } else {
        console.log(`[${i + 1}/${statements.length}] ✓ ${preview}...`);
        successCount++;
      }
    } catch (err) {
      console.log(`[${i + 1}/${statements.length}] ⚠️  ${preview}...`);
      console.log(`    Error: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Success: ${successCount}, Errors: ${errorCount}`);
}

// Check if we can use the Management API instead
async function runWithManagementAPI() {
  const projectRef = "hgdedyrjkywaboalisaw";
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

  if (!accessToken) {
    console.log("No SUPABASE_ACCESS_TOKEN, trying alternative method...");
    return false;
  }

  console.log("Running SQL via Supabase Management API...\n");

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    console.log("Management API error:", error);
    return false;
  }

  const result = await response.json();
  console.log("Migration result:", result);
  return true;
}

// Main
console.log("BestFoodWhere Database Migration\n");
console.log("Supabase URL:", supabaseUrl);
console.log("");

const success = await runWithManagementAPI();
if (!success) {
  console.log("\nFalling back to individual statements...");
  await runMigration();
}
