#!/usr/bin/env node
/**
 * Seed script for outreach campaigns and contacts
 * Run with: node scripts/seed-outreach.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample Singapore food bloggers (placeholder data - replace with real contacts)
const foodBloggers = [
  {
    full_name: "Seth Lui",
    first_name: "Seth",
    email: "contact@sethlui.com",
    website: "https://sethlui.com",
    company: "Seth Lui Blog",
    domain_authority: 45,
    notes: "Popular Singapore food blog, focuses on cafes and restaurants",
  },
  {
    full_name: "The Ranting Panda",
    first_name: "Panda",
    email: "hello@therantingpanda.com",
    website: "https://therantingpanda.com",
    company: "The Ranting Panda",
    domain_authority: 38,
    notes: "Honest food reviews, strong social following",
  },
  {
    full_name: "Maureen",
    first_name: "Maureen",
    email: "tamchiak@gmail.com",
    website: "https://www.misstamchiak.com",
    company: "Miss Tam Chiak",
    domain_authority: 42,
    notes: "One of Singapore's top food blogs",
  },
  {
    full_name: "Brad Lau",
    first_name: "Brad",
    email: "ladyironchef@gmail.com",
    website: "https://www.ladyironchef.com",
    company: "Lady Iron Chef",
    domain_authority: 48,
    notes: "High DA, covers dining and lifestyle",
  },
  {
    full_name: "Daniel Ang",
    first_name: "Daniel",
    email: "contact@danielfooddiary.com",
    website: "https://danielfooddiary.com",
    company: "Daniel Food Diary",
    domain_authority: 40,
    notes: "Detailed reviews with photography",
  },
  {
    full_name: "Dr Leslie Tay",
    first_name: "Leslie",
    email: "drleslie@gmail.com",
    website: "https://ieatishootipost.sg",
    company: "ieatishootipost",
    domain_authority: 52,
    notes: "Long-running food blog by Dr Leslie Tay",
  },
  {
    full_name: "Burpple Team",
    first_name: "Team",
    email: "partnerships@burpple.com",
    website: "https://www.burpple.com",
    company: "Burpple",
    domain_authority: 55,
    notes: "Food discovery platform - potential partnership",
  },
  {
    full_name: "HungryGoWhere Editorial",
    first_name: "Editorial",
    email: "editorial@hungrygowhere.com",
    website: "https://www.hungrygowhere.com",
    company: "HungryGoWhere",
    domain_authority: 58,
    notes: "Major food platform - high value partnership",
  },
];

// Tourism and travel sites
const tourismSites = [
  {
    full_name: "Visit Singapore Partnerships",
    first_name: "Partnerships",
    email: "partnerships@visitsingapore.com",
    website: "https://www.visitsingapore.com",
    company: "Singapore Tourism Board",
    domain_authority: 75,
    notes: "Official Singapore tourism board",
  },
  {
    full_name: "The Smart Local Team",
    first_name: "Team",
    email: "hello@thesmartlocal.com",
    website: "https://thesmartlocal.com",
    company: "The Smart Local",
    domain_authority: 60,
    notes: "Lifestyle and travel content",
  },
  {
    full_name: "SgTravelBuzz Editor",
    first_name: "Editor",
    email: "editor@sgtravelbuzz.com",
    website: "https://sgtravelbuzz.com",
    company: "SgTravelBuzz",
    domain_authority: 35,
    notes: "Travel tips and destination guides",
  },
];

async function main() {
  console.log("Seeding outreach data...\n");

  // Create food blogger campaign
  console.log("Creating food blogger campaign...");
  const { data: bloggerCampaign, error: bloggerCampaignError } = await supabase
    .from("outreach_campaigns")
    .insert({
      name: "Singapore Food Blogger Outreach Q1 2026",
      type: "food-blogger",
      description:
        "Outreach to top Singapore food bloggers for backlinks and collaborations",
      email_subject_template: "Quick question about {{blog_name}}",
      email_body_template: `Hi {{first_name}},

I came across {{blog_name}} and loved your recent post about {{recent_topic}}.

We're building Singapore's most comprehensive mall dining directory (10,000+ restaurants across 19 malls). Would you be interested in:
1. Early access to our data for your content?
2. A collaboration where we feature your reviews?

Best,
The BestFoodWhere Team`,
      sender_email: "partnerships@bestfoodwhere.sg",
      sender_name: "BestFoodWhere Team",
      status: "draft",
    })
    .select()
    .single();

  if (bloggerCampaignError) {
    console.error("Error creating blogger campaign:", bloggerCampaignError);
  } else {
    console.log(
      `Created campaign: ${bloggerCampaign.name} (${bloggerCampaign.id})`,
    );

    // Add food blogger contacts
    console.log("\nAdding food blogger contacts...");
    for (const blogger of foodBloggers) {
      const { error } = await supabase.from("outreach_contacts").insert({
        campaign_id: bloggerCampaign.id,
        ...blogger,
        status: "pending",
      });
      if (error) {
        console.error(`  Error adding ${blogger.full_name}:`, error.message);
      } else {
        console.log(
          `  Added: ${blogger.full_name} (DA: ${blogger.domain_authority})`,
        );
      }
    }
  }

  // Create tourism partnership campaign
  console.log("\nCreating tourism partnership campaign...");
  const { data: tourismCampaign, error: tourismCampaignError } = await supabase
    .from("outreach_campaigns")
    .insert({
      name: "Tourism & Travel Site Partnerships Q1 2026",
      type: "tourism",
      description:
        "Partner with tourism and travel sites for Singapore dining guides",
      email_subject_template: "Singapore Dining Data Partnership Opportunity",
      email_body_template: `Hi {{first_name}},

I noticed {{website}} provides excellent travel content for Singapore visitors.

We run BestFoodWhere.sg - Singapore's most comprehensive food directory covering 10,000+ restaurants across 19 major malls. We'd love to explore a partnership:

- Link to our dining guides as a resource for tourists
- Co-branded "Where to Eat" content for specific areas
- Data access for your editorial team

Would you be open to a quick chat?

Best regards,
The BestFoodWhere Team`,
      sender_email: "partnerships@bestfoodwhere.sg",
      sender_name: "BestFoodWhere Partnerships",
      status: "draft",
    })
    .select()
    .single();

  if (tourismCampaignError) {
    console.error("Error creating tourism campaign:", tourismCampaignError);
  } else {
    console.log(
      `Created campaign: ${tourismCampaign.name} (${tourismCampaign.id})`,
    );

    // Add tourism contacts
    console.log("\nAdding tourism contacts...");
    for (const site of tourismSites) {
      const { error } = await supabase.from("outreach_contacts").insert({
        campaign_id: tourismCampaign.id,
        ...site,
        status: "pending",
      });
      if (error) {
        console.error(`  Error adding ${site.full_name}:`, error.message);
      } else {
        console.log(
          `  Added: ${site.full_name} (DA: ${site.domain_authority})`,
        );
      }
    }
  }

  // Print summary
  console.log("\n=== Outreach Seed Complete ===");
  console.log(`Food blogger contacts: ${foodBloggers.length}`);
  console.log(`Tourism contacts: ${tourismSites.length}`);
  console.log(`Total contacts: ${foodBloggers.length + tourismSites.length}`);
  console.log("\nNext steps:");
  console.log("1. Review and update contact emails with real addresses");
  console.log("2. Set campaign status to 'active' when ready");
  console.log("3. Trigger campaign via /api/outreach/trigger");
}

main().catch(console.error);
