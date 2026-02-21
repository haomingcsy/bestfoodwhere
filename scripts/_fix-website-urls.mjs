import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fix known wrong URLs — these point to malls or wrong sites instead of the actual restaurant
const urlFixes = [
  // Gong Cha pointed to causewaypoint.com.sg (a mall)
  { slug: "gong-cha", url: "https://www.gong-cha.com.sg/" },
  // Samurice pointed to unitedsquare.com.sg (a mall)
  { slug: "samurice", url: null },
  { slug: "samurice-united-square-bento-japanese-food", url: null },
  // MBS subpages — use actual restaurant sites where possible
  { slug: "bread-street-kitchen-by-gordon-ramsay", url: "https://www.marinabaysands.com/restaurants/bread-street-kitchen.html" },
  { slug: "blue-pearl-seafood-restaurant", url: "https://www.marinabaysands.com/restaurants/blue-pearl.html" },
  { slug: "cut-by-wolfgang-puck", url: "https://www.marinabaysands.com/restaurants/cut.html" },
  { slug: "fatt-choi-hotpot", url: "https://www.marinabaysands.com/restaurants/fatt-choi-hotpot.html" },
  { slug: "mott-32-singapore", url: "https://www.mott32.com/location/singapore/" },
  { slug: "origin-bloom", url: "https://www.marinabaysands.com/restaurants/origin-bloom.html" },
  { slug: "tong-dim-noodle-bar", url: "https://www.marinabaysands.com/restaurants/tong-dim-noodle-bar.html" },
  { slug: "waku-ghin", url: "https://www.marinabaysands.com/restaurants/waku-ghin.html" },
  { slug: "wakuda", url: "https://www.marinabaysands.com/restaurants/wakuda.html" },
  { slug: "yardbird-southern-table-and-bar", url: "https://www.marinabaysands.com/restaurants/yardbird.html" },
  { slug: "le-noir-mbs", url: "https://lenoir.com.sg/" },
  // Châteraisé — fix URL to actual site
  { slug: "ch-terais-nex", url: "https://www.chateraise.co.jp/en/" },
  { slug: "ch-terais-amk-hub", url: "https://www.chateraise.co.jp/en/" },
  // Ben & Jerry's — fix to SG page
  { slug: "ben-jerrys", url: "https://www.benjerry.com/flavors" },
  // Haidilao
  { slug: "haidilao-hot-pot-vivocity", url: "https://www.haidilao.com/sg/menu" },
  // Sushiro
  { slug: "sushiro-jewel-changi", url: "https://www.akindo-sushiro.co.jp/en/menu/" },
  // llaollao (was yol-jewel)
  { slug: "yol-jewel", url: "https://www.llaollaoweb.com/en/" },
  // Sukiya
  { slug: "sukiya-gyudon-curry", url: "https://www.sukiya.com.sg/" },
  { slug: "sukiya-gyudon-curry-suntec-city", url: "https://www.sukiya.com.sg/" },
];

let fixed = 0;
for (const { slug, url } of urlFixes) {
  const { error } = await sb.from("brand_menus").update({ website_url: url }).eq("slug", slug);
  if (error) {
    console.log(`FAILED ${slug}:`, error.message);
  } else {
    console.log(`Fixed: ${slug} -> ${url || "(cleared)"}`);
    fixed++;
  }
}
console.log(`\nFixed ${fixed}/${urlFixes.length} URLs`);
