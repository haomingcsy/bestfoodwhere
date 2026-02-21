import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

let totalItems = 0, withOrigImg = 0, withCdnImg = 0, withPrice = 0;
let offset = 0;

while (true) {
  const { data } = await sb.from('menu_items')
    .select('original_image_url, cdn_image_url, price')
    .range(offset, offset + 999);
  if (!data || data.length === 0) break;

  data.forEach(item => {
    totalItems++;
    if (item.original_image_url) withOrigImg++;
    if (item.cdn_image_url) withCdnImg++;
    if (item.price) withPrice++;
  });
  offset += 1000;
}

console.log('=== Menu Item Data Coverage ===');
console.log(`Total menu items: ${totalItems}`);
console.log(`With original image URL: ${withOrigImg} (${(withOrigImg/totalItems*100).toFixed(1)}%)`);
console.log(`With CDN image URL: ${withCdnImg} (${(withCdnImg/totalItems*100).toFixed(1)}%)`);
console.log(`With price: ${withPrice} (${(withPrice/totalItems*100).toFixed(1)}%)`);

// Check how the frontend loads menus - is it using Supabase or Sheets?
console.log('\n=== Scrape Status Distribution ===');
const { data: statuses } = await sb.from('brand_menus').select('scrape_status');
const dist = {};
(statuses||[]).forEach(r => { dist[r.scrape_status || 'null'] = (dist[r.scrape_status || 'null']||0)+1; });
Object.entries(dist).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

// Check how many of the 158 "no items" brands have website_url
const { data: allBrands } = await sb.from('brand_menus').select('slug, website_url, scrape_status, menu_item_count');
const noItemBrands = (allBrands||[]).filter(b => !b.menu_item_count || b.menu_item_count === 0);
const noItemWithUrl = noItemBrands.filter(b => b.website_url);
console.log(`\n=== Brands With No Menu Items (${noItemBrands.length}) ===`);
console.log(`  Have website_url: ${noItemWithUrl.length}`);
console.log(`  No website_url: ${noItemBrands.length - noItemWithUrl.length}`);
console.log(`  Scrape statuses of no-item brands:`);
const noItemDist = {};
noItemBrands.forEach(b => { noItemDist[b.scrape_status || 'null'] = (noItemDist[b.scrape_status || 'null']||0)+1; });
Object.entries(noItemDist).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`    ${k}: ${v}`));
