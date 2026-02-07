import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...val] = trimmed.split("=");
    if (key && val.length) process.env[key] = val.join("=");
  }
}
loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, count } = await supabase
    .from("restaurant_image_cache")
    .select("*", { count: "exact" })
    .limit(5);

  console.log("Total entries in restaurant_image_cache:", count);
  console.log("\nSample entries:");
  data?.forEach((row, i) => {
    console.log(`\n[${i+1}]`);
    console.log("  CDN URL:", row.cdn_url);
    console.log("  Mall:", row.mall_slug);
  });
}
main();
