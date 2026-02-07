#!/usr/bin/env node
/**
 * Update outreach contacts with researched Singapore food blogger data
 * Run with: node scripts/update-outreach-contacts.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Researched Singapore food bloggers (updated with real data)
// Sources: Feedspot, CardinalDigital, BestInSingapore, GetKobe
const foodBloggers = [
  // Tier 1: High DA, Established Blogs
  {
    full_name: "Brad Lau",
    first_name: "Brad",
    email: "advertise@ladyironchef.com",
    website: "https://ladyironchef.com",
    company: "LadyIronChef",
    domain_authority: 52,
    monthly_traffic: 500000,
    notes:
      "Pioneer SG food blogger since 2007, 580K IG @ladyironchef. Focus: restaurants, cafes, travel food",
  },
  {
    full_name: "Seth Lui",
    first_name: "Seth",
    email: "hello@sethlui.com",
    website: "https://sethlui.com",
    company: "Seth Lui",
    domain_authority: 48,
    monthly_traffic: 1000000,
    notes:
      "1M+ monthly unique visitors, IG @sethluicious. Focus: hawker food, restaurants, food news",
  },
  {
    full_name: "Maureen Ow",
    first_name: "Maureen",
    email: "advertise@misstamchiak.com",
    website: "https://misstamchiak.com",
    company: "Miss Tam Chiak",
    domain_authority: 45,
    monthly_traffic: 300000,
    notes:
      "Since 2007, trusted food reviews. Focus: local food, restaurant reviews",
  },
  {
    full_name: "Dr Leslie Tay",
    first_name: "Leslie",
    email: "ieat@ieatishootipost.sg",
    website: "https://ieatishootipost.sg",
    company: "ieatishootipost",
    domain_authority: 50,
    monthly_traffic: 400000,
    notes:
      "Legendary SG food blogger, doctor by profession. Focus: hawker food heritage",
  },
  // Tier 2: Growing Blogs with Good Engagement
  {
    full_name: "Daniel Ang",
    first_name: "Daniel",
    email: "hello@danielfooddiary.com",
    website: "https://danielfooddiary.com",
    company: "Daniel Food Diary",
    domain_authority: 42,
    notes:
      "300K IG @danielfooddiary, popular with younger foodies. Aesthetic food photography",
  },
  {
    full_name: "Derrick Tan",
    first_name: "Derrick",
    email: "sgfoodonfoot@gmail.com",
    website: "https://sgfoodonfoot.com",
    company: "SG Food On Foot",
    domain_authority: 38,
    notes:
      "79K IG. Unique angle: food near MRT stations. Good for local SEO backlinks",
  },
  {
    full_name: "FoodGem Team",
    first_name: "Team",
    email: "hello@foodgem.sg",
    website: "https://foodgem.sg",
    company: "FoodGem",
    domain_authority: 35,
    notes:
      "27K IG. Independent food review blog, thorough reviews. Good backlink potential",
  },
  // Tier 3: Media/Platform Sites (Higher DA, harder to get)
  {
    full_name: "Eatbook Editorial",
    first_name: "Editorial",
    email: "editorial@eatbook.sg",
    website: "https://eatbook.sg",
    company: "Eatbook",
    domain_authority: 55,
    monthly_traffic: 800000,
    notes: "Major food media site, 192K IG. Pitch: exclusive data partnership",
  },
  {
    full_name: "8 Days Editorial",
    first_name: "Editorial",
    email: "editorial@8days.sg",
    website: "https://www.8days.sg",
    company: "8 Days",
    domain_authority: 62,
    notes:
      "Mediacorp property. High DA, pitch as data source for food coverage",
  },
  {
    full_name: "Time Out Singapore",
    first_name: "Editor",
    email: "singapore@timeout.com",
    website: "https://www.timeout.com/singapore",
    company: "Time Out Singapore",
    domain_authority: 90,
    notes:
      "International brand, very high DA. Pitch: official mall dining data source",
  },
  // Influencers with Blogs
  {
    full_name: "Zermatt Neo",
    first_name: "Zermatt",
    email: "zermatt@zermattneo.com",
    website: "https://zermattneo.com",
    company: "Zermatt Neo",
    domain_authority: 30,
    notes:
      "2M IG @zermattneo! Competitive eater. May be expensive but huge reach",
  },
];

// Tourism and expat sites for backlinks
const tourismSites = [
  {
    full_name: "Visit Singapore Partnerships",
    first_name: "Partnerships",
    email: "partnerships@stb.gov.sg",
    website: "https://www.visitsingapore.com",
    company: "Singapore Tourism Board",
    domain_authority: 78,
    notes:
      "Official tourism board. Pitch: add BFW as dining resource for tourists",
  },
  {
    full_name: "The Smart Local",
    first_name: "Team",
    email: "hello@thesmartlocal.com",
    website: "https://thesmartlocal.com",
    company: "The Smart Local",
    domain_authority: 58,
    monthly_traffic: 2000000,
    notes:
      "Huge lifestyle site, covers food. Pitch: data partnership for food lists",
  },
  {
    full_name: "Honeycombers Editorial",
    first_name: "Editorial",
    email: "editorial@thehoneycombers.com",
    website: "https://thehoneycombers.com/singapore",
    company: "Honeycombers Singapore",
    domain_authority: 55,
    notes: "Popular expat lifestyle site. Focus: mall dining guides for expats",
  },
  {
    full_name: "City Nomads",
    first_name: "Editor",
    email: "editor@citynomads.com",
    website: "https://www.citynomads.com",
    company: "City Nomads",
    domain_authority: 45,
    notes: "Lifestyle and nightlife focus. Good for bar/restaurant coverage",
  },
  {
    full_name: "Expat Living",
    first_name: "Editorial",
    email: "editorial@expatliving.sg",
    website: "https://expatliving.sg",
    company: "Expat Living Singapore",
    domain_authority: 48,
    notes: "Expat-focused. Pitch: mall dining guide for newcomers",
  },
];

async function updateContacts() {
  console.log("Updating outreach contacts with researched data...\n");

  // Get existing campaigns
  const { data: campaigns, error: campaignsError } = await supabase
    .from("outreach_campaigns")
    .select("id, name, type")
    .in("type", ["food-blogger", "tourism"]);

  if (campaignsError) {
    console.error("Error fetching campaigns:", campaignsError);
    return;
  }

  const bloggerCampaign = campaigns.find((c) => c.type === "food-blogger");
  const tourismCampaign = campaigns.find((c) => c.type === "tourism");

  // Clear existing contacts and add new ones
  if (bloggerCampaign) {
    console.log(`Updating blogger campaign: ${bloggerCampaign.name}`);

    // Delete old contacts
    await supabase
      .from("outreach_contacts")
      .delete()
      .eq("campaign_id", bloggerCampaign.id);

    // Add new contacts
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

  if (tourismCampaign) {
    console.log(`\nUpdating tourism campaign: ${tourismCampaign.name}`);

    // Delete old contacts
    await supabase
      .from("outreach_contacts")
      .delete()
      .eq("campaign_id", tourismCampaign.id);

    // Add new contacts
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

  // Update campaign target counts
  if (bloggerCampaign) {
    await supabase
      .from("outreach_campaigns")
      .update({ target_count: foodBloggers.length })
      .eq("id", bloggerCampaign.id);
  }
  if (tourismCampaign) {
    await supabase
      .from("outreach_campaigns")
      .update({ target_count: tourismSites.length })
      .eq("id", tourismCampaign.id);
  }

  console.log("\n=== Update Complete ===");
  console.log(`Food bloggers: ${foodBloggers.length} contacts`);
  console.log(`Tourism sites: ${tourismSites.length} contacts`);
  console.log(`\nTotal: ${foodBloggers.length + tourismSites.length} contacts`);
}

updateContacts().catch(console.error);
