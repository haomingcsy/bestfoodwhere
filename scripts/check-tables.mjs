import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log("Checking database tables...\n");

  const tables = [
    "profiles",
    "consumer_profiles",
    "restaurant_profiles",
    "favorites",
    "reviews",
    "saved_deals",
  ];

  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: exists (${count || 0} rows)`);
    }
  }
}

checkTables();
