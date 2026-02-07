/**
 * Import n8n Workflows Script
 *
 * Usage: npx tsx scripts/import-n8n-workflows.ts
 */

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const N8N_URL = process.env.N8N_URL || "https://n8n.bestfoodwhere.sg";
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_API_KEY) {
  console.error("N8N_API_KEY is required in environment variables");
  process.exit(1);
}

async function importWorkflow(filePath: string): Promise<{ id: string }> {
  const workflowJson = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const workflowName = workflowJson.name;

  // Remove read-only fields that n8n API doesn't accept
  delete workflowJson.tags;
  delete workflowJson.id;
  delete workflowJson.staticData;

  console.log(`Importing workflow: ${workflowName}...`);

  const response = await fetch(`${N8N_URL}/api/v1/workflows`, {
    method: "POST",
    headers: {
      "X-N8N-API-KEY": N8N_API_KEY ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workflowJson),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Failed to import ${workflowName}: ${response.status} - ${error}`,
    );
  }

  const result = await response.json();
  console.log(`✓ Imported: ${workflowName} (ID: ${result.id})`);
  return result;
}

async function activateWorkflow(workflowId: string): Promise<void> {
  console.log(`Activating workflow ${workflowId}...`);

  const response = await fetch(
    `${N8N_URL}/api/v1/workflows/${workflowId}/activate`,
    {
      method: "POST",
      headers: {
        "X-N8N-API-KEY": N8N_API_KEY!,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    console.log(
      `  Note: Could not activate (${response.status}) - you may need to connect credentials first`,
    );
    return;
  }

  console.log(`✓ Activated workflow ${workflowId}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "activate") {
    // Just activate existing workflows
    const workflowIds = args.slice(1);
    for (const id of workflowIds) {
      await activateWorkflow(id);
    }
    return;
  }

  const workflowsDir = path.join(__dirname, "../docs/n8n");

  const workflows = [
    "bfw-data-sync-workflow.json",
    "bfw-daily-check-workflow.json",
  ];

  console.log("Starting n8n workflow import...\n");

  const importedIds: string[] = [];

  for (const workflow of workflows) {
    const filePath = path.join(workflowsDir, workflow);
    if (fs.existsSync(filePath)) {
      try {
        const result = await importWorkflow(filePath);
        if (result && (result as { id: string }).id) {
          importedIds.push((result as { id: string }).id);
        }
      } catch (error) {
        console.error(`✗ Failed: ${workflow}`, error);
      }
    } else {
      console.error(`✗ File not found: ${filePath}`);
    }
  }

  console.log("\nImport complete!");

  // Try to activate workflows
  console.log("\nAttempting to activate workflows...");
  for (const id of importedIds) {
    await activateWorkflow(id);
  }

  console.log("\nNext steps:");
  console.log("1. Go to n8n.bestfoodwhere.sg");
  console.log("2. Open each workflow and connect the Resend credential");
  console.log("3. If not already active, activate the workflows");
}

main().catch(console.error);
