import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

let all = [], offset = 0;
while (true) {
  const { data } = await sb.from('brand_menus').select('description').not('description', 'is', null).range(offset, offset + 999);
  if (!data || data.length === 0) break;
  all.push(...data);
  offset += 1000;
}

const patterns = {};
all.forEach(d => {
  const first = d.description.split(' ').slice(0, 6).join(' ');
  patterns[first] = (patterns[first] || 0) + 1;
});

const sorted = Object.entries(patterns).sort((a,b) => b[1] - a[1]).slice(0, 20);
console.log('Most repeated opening phrases:');
sorted.forEach(([k, v]) => console.log(`  ${v}x => "${k}"`));
console.log('\nTotal brands:', all.length);

// Also check specific starters
const starters = {
  'The moment you': 0,
  'This is where': 0,
  'Walking into': 0,
  'Walk into': 0,
  "There's something": 0,
  "If you're": 0,
  'Tucked': 0,
};
all.forEach(d => {
  for (const s of Object.keys(starters)) {
    if (d.description.startsWith(s)) starters[s]++;
  }
});
console.log('\nStarter pattern counts:');
Object.entries(starters).sort((a,b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${v}x => "${k}..."`));
