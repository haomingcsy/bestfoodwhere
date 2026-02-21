import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: brand } = await sb.from('brand_menus').select('id, slug').eq('slug', 'lenu-chefs-wai-noodle-bar').single();
if (!brand) { console.log('No brand found'); process.exit(1); }

// Check menu_items table
const { data: items } = await sb.from('menu_items').select('id, name, image_url').eq('brand_menu_id', brand.id);
console.log(`menu_items for ${brand.slug}: ${(items||[]).length}`);

// Check brand_menus for menu_item_count and other data
const { data: full } = await sb.from('brand_menus').select('menu_item_count, enrichment_status, description').eq('slug', 'lenu-chefs-wai-noodle-bar').single();
console.log('brand_menus data:', JSON.stringify(full, null, 2));

// Also check how many brands have menu items at all
const { count: brandsWithItems } = await sb.from('menu_items').select('brand_menu_id', { count: 'exact', head: true });
console.log('\nTotal menu_items rows across all brands:', brandsWithItems);

const { count: totalBrands } = await sb.from('brand_menus').select('id', { count: 'exact', head: true });
console.log('Total brands:', totalBrands);

// Check how many brands have at least 1 menu item
const { data: brandIds } = await sb.rpc('get_brands_with_items').catch(() => ({ data: null }));
if (!brandIds) {
  // fallback: just count distinct brand_menu_ids
  const { data: allItems } = await sb.from('menu_items').select('brand_menu_id');
  const unique = new Set((allItems||[]).map(i => i.brand_menu_id));
  console.log('Brands with at least 1 menu item:', unique.size);
}
