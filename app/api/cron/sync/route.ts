/**
 * CRON Job: Weekly Data Sync
 *
 * Vercel CRON schedule: 0 3 * * 0 (Sunday 3 AM)
 *
 * This endpoint:
 * 1. Syncs all stale restaurants with Google Places
 * 2. Logs results to sync_logs
 * 3. Sends Slack notification with summary
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createGooglePlacesAPI } from "@/lib/sync/google-places";
import {
  sendSyncSummary,
  sendSyncFailureAlert,
} from "@/lib/notifications/email";

// Verify CRON secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Verify CRON authorization
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get stale restaurants (not verified in 7 days)
    const staleDate = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: restaurants, count } = await supabase
      .from("mall_restaurants")
      .select("id, name, shopping_malls(name)", { count: "exact" })
      .or(`last_verified_at.is.null,last_verified_at.lt.${staleDate}`)
      .eq("is_permanently_closed", false)
      .limit(100); // Limit to avoid timeout

    if (!restaurants || restaurants.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No stale restaurants to sync",
        synced: 0,
      });
    }

    // Create sync log
    const { data: syncLog } = await supabase
      .from("data_sync_logs")
      .insert({
        sync_type: "scheduled",
        sync_source: "google_places",
        status: "running",
        total_entities: count || restaurants.length,
      })
      .select("id")
      .single();

    // Run sync
    const placesAPI = createGooglePlacesAPI(supabase);

    const result = await placesAPI.batchSync(
      restaurants.map((r) => ({
        id: r.id,
        name: r.name,
        mallName:
          (r.shopping_malls as unknown as { name: string } | null)?.name ||
          "Singapore",
      })),
      {
        batchSize: 10,
        delayBetweenBatches: 2000,
      },
    );

    const duration = Date.now() - startTime;

    // Update sync log
    if (syncLog?.id) {
      await supabase
        .from("data_sync_logs")
        .update({
          status: result.failed === 0 ? "completed" : "partial",
          entities_processed: result.total,
          entities_updated: result.synced,
          entities_failed: result.failed,
          errors_count: result.errors.length,
          error_details: result.errors.slice(0, 20),
          completed_at: new Date().toISOString(),
        })
        .eq("id", syncLog.id);
    }

    // Send Slack notification
    await sendSyncSummary("Weekly", {
      total: result.total,
      synced: result.synced,
      failed: result.failed,
      closures: result.closures,
      duration,
    });

    return NextResponse.json({
      success: true,
      total: result.total,
      synced: result.synced,
      failed: result.failed,
      closures: result.closures.length,
      duration: `${Math.round(duration / 1000)}s`,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Send failure alert
    await sendSyncFailureAlert("Weekly CRON", errorMessage, 0);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        duration: `${Math.round(duration / 1000)}s`,
      },
      { status: 500 },
    );
  }
}
