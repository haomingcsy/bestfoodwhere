import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: zero } = await sb.from("brand_menus").select("slug, name, website_url, scrape_status, social_links").eq("menu_item_count", 0);

let withGrab = 0, withDeliveroo = 0, withAny = 0;
for (const b of zero) {
  const links = b.social_links || {};
  if (links.grabfood_url) withGrab++;
  if (links.deliveroo_url) withDeliveroo++;
  if (links.grabfood_url || links.deliveroo_url) withAny++;
}
console.log(`Delivery URL coverage for ${zero.length} zero-menu brands:`);
console.log(`  GrabFood: ${withGrab}`);
console.log(`  Deliveroo: ${withDeliveroo}`);
console.log(`  Any delivery URL: ${withAny}`);
console.log(`  No delivery URL: ${zero.length - withAny}`);

console.log("\nSample brands WITH delivery URLs:");
let shown = 0;
for (const b of zero) {
  const links = b.social_links || {};
  if (links.grabfood_url || links.deliveroo_url) {
    console.log(`  ${b.slug} | grab:${!!links.grabfood_url} | deliveroo:${!!links.deliveroo_url}`);
    if (++shown >= 10) break;
  }
}

const noAnything = zero.filter(b => {
  const links = b.social_links || {};
  return !b.website_url && !links.grabfood_url && !links.deliveroo_url;
});
console.log(`\nBrands with NO website AND NO delivery URL: ${noAnything.length}`);
noAnything.forEach(b => console.log(`  ${b.slug} (${b.name})`));
