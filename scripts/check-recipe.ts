import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  const { data, error } = await supabase
    .from("recipe_content")
    .select("wp_slug, instructions")
    .eq("wp_slug", "chicken-rice")
    .single();

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Recipe:", data.wp_slug);
  console.log("\nAll instructions:");
  const instructions = data.instructions as any[];
  instructions.forEach((inst: any) => {
    const hint = inst.image_hint || "none";
    const hasUrl = hint.startsWith("http");
    console.log(
      "Step " +
        inst.step +
        ": " +
        (hasUrl ? "URL" : "TEXT: " + hint.substring(0, 50)),
    );
  });
}

main();
