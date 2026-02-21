import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { existsSync } from 'fs';
import { join } from 'path';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Get all brands
const { data: brands } = await sb.from('brand_menus').select('id, slug, name, menu_item_count');

// Check menu_items per brand
const { data: allItems } = await sb.from('menu_items').select('brand_menu_id, image_url');
const itemsByBrand = {};
(allItems || []).forEach(i => {
  if (!itemsByBrand[i.brand_menu_id]) itemsByBrand[i.brand_menu_id] = { total: 0, withImage: 0 };
  itemsByBrand[i.brand_menu_id].total++;
  if (i.image_url) itemsByBrand[i.brand_menu_id].withImage++;
});

let hasItems = 0, noItems = 0, hasNutrition = 0, noNutrition = 0;
const noItemBrands = [];

brands.forEach(b => {
  if (itemsByBrand[b.id]) {
    hasItems++;
  } else {
    noItems++;
    noItemBrands.push(b.name);
  }

  const nutritionPath = join(process.cwd(), 'data', 'nutrition', `${b.slug}.json`);
  if (existsSync(nutritionPath)) {
    hasNutrition++;
  } else {
    noNutrition++;
  }
});

console.log('=== Menu Item Coverage ===');
console.log(`Brands with menu_items in Supabase: ${hasItems}/${brands.length}`);
console.log(`Brands relying on Google Sheets: ${noItems}/${brands.length}`);
console.log(`\n=== Nutrition Coverage ===`);
console.log(`Brands with nutrition JSON: ${hasNutrition}/${brands.length}`);
console.log(`Brands missing nutrition: ${noNutrition}/${brands.length}`);
console.log(`\nSample brands with NO menu items (first 15):`);
noItemBrands.slice(0, 15).forEach(n => console.log(`  - ${n}`));
