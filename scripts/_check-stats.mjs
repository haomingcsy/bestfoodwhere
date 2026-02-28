import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync("/Users/haoming/Desktop/bestfoodwhere/.env.local", "utf8");
const getEnv = (key) => { const m = envFile.match(new RegExp(`${key}="?([^"\\n]+)`)); return m?.[1]; };
const sb = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

const {count:total} = await sb.from("brand_menus").select("*",{count:"exact",head:true}).eq("is_active",true);
const {count:withMenu} = await sb.from("brand_menus").select("*",{count:"exact",head:true}).eq("is_active",true).gt("menu_item_count",0);
const {count:zeroMenu} = await sb.from("brand_menus").select("*",{count:"exact",head:true}).eq("is_active",true).eq("menu_item_count",0);
const {count:items} = await sb.from("menu_items").select("*",{count:"exact",head:true});
const {count:withImages} = await sb.from("menu_items").select("*",{count:"exact",head:true}).not("cdn_image_url","is",null);

console.log("=== Current DB Stats ===");
console.log(`Total brands: ${total}`);
console.log(`With menu: ${withMenu} (${(withMenu/total*100).toFixed(1)}%)`);
console.log(`Zero menu: ${zeroMenu} (${(zeroMenu/total*100).toFixed(1)}%)`);
console.log(`Total items: ${items}`);
console.log(`Items with CDN images: ${withImages} (${(withImages/items*100).toFixed(1)}%)`);
