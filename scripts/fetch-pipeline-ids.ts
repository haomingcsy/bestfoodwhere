/**
 * Fetch GHL pipeline IDs and stage IDs.
 * Run after manually creating pipelines in GHL dashboard.
 *
 * Usage: npx tsx scripts/fetch-pipeline-ids.ts
 */

import { getGHLClient } from "../lib/ghl/client";

async function main() {
  const client = getGHLClient();

  console.log("Fetching pipelines from GHL...\n");

  const pipelines = await client.getPipelines();

  if (pipelines.length === 0) {
    console.log("No pipelines found. Create them in GHL dashboard first.");
    return;
  }

  console.log(`Found ${pipelines.length} pipeline(s):\n`);
  console.log("# Add these to your .env.local file:\n");

  for (const pipeline of pipelines) {
    const nameSlug = pipeline.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    console.log(`# Pipeline: ${pipeline.name}`);
    console.log(`# GHL_PIPELINE_${nameSlug.toUpperCase()}_ID=${pipeline.id}`);

    if (pipeline.stages && pipeline.stages.length > 0) {
      for (const stage of pipeline.stages) {
        const stageSlug = stage.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        console.log(
          `# GHL_STAGE_${nameSlug.toUpperCase()}_${stageSlug.toUpperCase()}=${stage.id}`,
        );
      }
    }
    console.log("");
  }

  console.log("\n# Suggested env var mapping for BFW pipelines:");
  console.log("# (Match these to your pipeline names)\n");

  const mapping = [
    {
      name: "Restaurant Advertising Leads",
      envPrefix: "ADVERTISING",
      stages: [
        "NEW_LEAD",
        "CONTACTED",
        "MEETING",
        "PROPOSAL",
        "NEGOTIATING",
        "WON",
        "LOST",
      ],
    },
    {
      name: "Partnership Inquiries",
      envPrefix: "PARTNERSHIP",
      stages: ["RECEIVED", "EVALUATED", "DISCUSSION", "ACTIVE", "DECLINED"],
    },
    {
      name: "Newsletter Subscribers",
      envPrefix: "NEWSLETTER",
      stages: [
        "SUBSCRIBED",
        "ENGAGED",
        "HIGHLY_ENGAGED",
        "INACTIVE",
        "CHURNED",
      ],
    },
    {
      name: "General Contact Inquiries",
      envPrefix: "GENERAL",
      stages: ["NEW", "RESPONDED", "RESOLVED", "ARCHIVED"],
    },
  ];

  for (const m of mapping) {
    const match = pipelines.find((p) =>
      p.name.toLowerCase().includes(m.envPrefix.toLowerCase()),
    );
    if (match) {
      console.log(`GHL_PIPELINE_${m.envPrefix}_ID=${match.id}`);
      for (
        let i = 0;
        i < m.stages.length && match.stages && i < match.stages.length;
        i++
      ) {
        const envKey =
          m.envPrefix === "ADVERTISING"
            ? "AD"
            : m.envPrefix === "PARTNERSHIP"
              ? "PARTNER"
              : m.envPrefix === "NEWSLETTER"
                ? "NEWS"
                : "GENERAL";
        console.log(`GHL_STAGE_${envKey}_${m.stages[i]}=${match.stages[i].id}`);
      }
      console.log("");
    }
  }
}

main().catch(console.error);
