import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=["']?(.+?)["']?$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const socialPatterns = ['facebook.com','instagram.com','google.com','twitter.com','x.com','linkedin.com','youtube.com','tiktok.com'];
function isSocial(url) { return socialPatterns.some(p => url.toLowerCase().includes(p)); }

const { data: pending } = await supabase.from('brand_menus')
  .select('slug, website_url, menu_item_count')
  .eq('scrape_status', 'pending')
  .order('slug');

const nullUrl = pending.filter(b => b.website_url === null);
const withUrl = pending.filter(b => b.website_url !== null);
const social = withUrl.filter(b => isSocial(b.website_url));
const real = withUrl.filter(b => !isSocial(b.website_url));
const realZero = real.filter(b => (b.menu_item_count || 0) === 0);

console.log('=== 141 Pending brands breakdown ===');
console.log('NULL url:', nullUrl.length);
console.log('Social media url:', social.length);
console.log('Real url:', real.length);
console.log('Real url with 0 items:', realZero.length);
console.log('');
console.log('Real pending brands with 0 items (NEVER attempted, should be scraped):');
for (const b of realZero) {
  console.log(' ', b.slug, ':', b.website_url);
}

// Now look at how many of the 52 that the scraper query found were previously "failed" vs "pending"
console.log('\n=== Scraper query candidates (pending/failed, url not null, 0 items) ===');
const { data: candidates } = await supabase.from('brand_menus')
  .select('slug, website_url, scrape_status, menu_item_count')
  .not('website_url', 'is', null)
  .in('scrape_status', ['pending', 'failed'])
  .eq('menu_item_count', 0)
  .order('slug');

const pendingCandidates = candidates.filter(c => c.scrape_status === 'pending');
const failedCandidates = candidates.filter(c => c.scrape_status === 'failed');

console.log('Total candidates:', candidates.length);
console.log('  pending:', pendingCandidates.length);
console.log('  failed:', failedCandidates.length);
console.log('');

console.log('Pending candidates (never tried before):');
for (const c of pendingCandidates) {
  console.log(' ', c.slug, ':', c.website_url);
}
console.log('');
console.log('Failed candidates (being retried):');
for (const c of failedCandidates) {
  console.log(' ', c.slug, ':', c.website_url);
}
