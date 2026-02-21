import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Check LeNu Chef specifically
const { data: lenu } = await sb.from('brand_menus').select('id, slug, menu_item_count, scrape_status').eq('slug', 'lenu-chefs-wai-noodle-bar').single();
console.log('LeNu Chef:', JSON.stringify(lenu));

if (lenu) {
  const { count } = await sb.from('menu_items').select('id', { count: 'exact', head: true }).eq('brand_menu_id', lenu.id);
  console.log('LeNu items count:', count);

  const { data: items } = await sb.from('menu_items').select('name, price, original_image_url').eq('brand_menu_id', lenu.id).limit(5);
  if (items && items.length > 0) {
    console.log('Sample items:');
    items.forEach(i => console.log(`  - ${i.name} | ${i.price || 'no price'} | img: ${i.original_image_url ? 'yes' : 'no'}`));
  }
}

// How many brands have 0 menu_item_count?
const { data: allBrands } = await sb.from('brand_menus').select('id, slug, menu_item_count');
const noItems = (allBrands||[]).filter(b => !b.menu_item_count || b.menu_item_count === 0);
console.log('\nBrands with 0 menu_item_count:', noItems.length, '/', (allBrands||[]).length);
console.log('Sample brands with no items:', noItems.slice(0, 10).map(b => b.slug));

// Check a few popular brands
for (const slug of ['kfc', 'mcdonalds', 'subway', 'four-leaves', 'starbucks']) {
  const { data: brand } = await sb.from('brand_menus').select('id, menu_item_count, scrape_status').eq('slug', slug).single();
  if (brand) {
    const { count } = await sb.from('menu_items').select('id', { count: 'exact', head: true }).eq('brand_menu_id', brand.id);
    console.log(`${slug}: menu_item_count=${brand.menu_item_count}, actual_items=${count}, scrape=${brand.scrape_status}`);
  } else {
    console.log(`${slug}: not found in brand_menus`);
  }
}
