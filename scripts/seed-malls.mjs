#!/usr/bin/env node

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = join(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join("=").trim();
  }
});

const ACCESS_TOKEN = env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = "hgdedyrjkywaboalisaw";

async function runSQL(query) {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );
  const text = await response.text();
  return { status: response.status, body: text };
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/@/g, "-at-")
    .replace(/\+/g, "-plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const malls = [
  "313@Somerset",
  "Bugis Junction",
  "Bugis+",
  "Capitol Singapore",
  "Causeway Point",
  "Changi City Point",
  "City Square Mall",
  "Clarke Quay Central",
  "Compass One",
  "Downtown East",
  "Great World City",
  "HarbourFront Centre",
  "IMM",
  "ION Orchard",
  "JCube",
  "Jem",
  "Junction 8",
  "Jurong Point",
  "Lot One",
  "Marina Bay Sands",
  "Marina Square",
  "Millenia Walk",
  "NEX",
  "Ngee Ann City",
  "Northpoint City",
  "One Raffles Place",
  "Orchard Central",
  "Paragon",
  "Plaza Singapura",
  "Raffles City",
  "Suntec City",
  "Tampines 1",
  "Tampines Mall",
  "The Centrepoint",
  "The Star Vista",
  "Thomson Plaza",
  "Tiong Bahru Plaza",
  "VivoCity",
  "Waterway Point",
  "Westgate",
  "White Sands",
  "Wisma Atria",
];

console.log("Seeding shopping malls...\n");

const values = malls
  .map((mall) => {
    const slug = slugify(mall);
    return `('${mall.replace(/'/g, "''")}', '${slug}')`;
  })
  .join(",\n  ");

const sql = `
INSERT INTO public.shopping_malls (name, slug) VALUES
  ${values}
ON CONFLICT (name) DO NOTHING;
`;

const result = await runSQL(sql);
console.log("Result:", result.status);

if (result.status === 201) {
  console.log("\n✅ Shopping malls seeded successfully!");
  console.log(`Added ${malls.length} malls`);
} else {
  console.log("\n❌ Failed to seed malls");
  console.log(result.body);
}
