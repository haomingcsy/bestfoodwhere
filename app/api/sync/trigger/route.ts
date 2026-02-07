/**
 * Manual Sync Trigger API
 *
 * Allows manual triggering of data sync for:
 * - Single restaurant
 * - All restaurants in a mall
 * - All stale restaurants
 * - Full refresh
 *
 * Used by:
 * - Admin dashboard
 * - n8n scheduled workflows
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createGooglePlacesAPI } from "@/lib/sync/google-places";
import { createChangeDetector } from "@/lib/sync/change-detection";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Sync types
type SyncType = "single" | "mall" | "stale" | "full";

interface SyncRequest {
  type: SyncType;
  restaurantId?: string;
  mallSlug?: string;
  limit?: number;
  forceRefresh?: boolean;
  dryRun?: boolean;
}

/**
 * Create sync log entry
 */
async function createSyncLog(
  syncType: string,
  totalEntities: number,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("data_sync_logs")
    .insert({
      sync_type: syncType === "full" ? "full_refresh" : "targeted",
      sync_source: "api",
      status: "running",
      total_entities: totalEntities,
    })
    .select("id")
    .single();

  return error ? null : data?.id;
}

/**
 * Update sync log with results
 */
async function updateSyncLog(
  logId: string,
  stats: {
    processed: number;
    updated: number;
    created: number;
    unchanged: number;
    failed: number;
    errors?: Array<{ message: string }>;
  },
): Promise<void> {
  const status =
    stats.failed === 0
      ? "completed"
      : stats.failed < stats.processed
        ? "partial"
        : "failed";

  await supabase
    .from("data_sync_logs")
    .update({
      status,
      entities_processed: stats.processed,
      entities_updated: stats.updated,
      entities_created: stats.created,
      entities_unchanged: stats.unchanged,
      entities_failed: stats.failed,
      errors_count: stats.failed,
      error_details: stats.errors || [],
      completed_at: new Date().toISOString(),
    })
    .eq("id", logId);
}

/**
 * Sync a single restaurant
 */
async function syncSingleRestaurant(
  restaurantId: string,
  forceRefresh = false,
): Promise<{
  success: boolean;
  changes: string[];
  error?: string;
}> {
  const { data: restaurant, error } = await supabase
    .from("mall_restaurants")
    .select("*, shopping_malls(name)")
    .eq("id", restaurantId)
    .single();

  if (error || !restaurant) {
    return { success: false, changes: [], error: "Restaurant not found" };
  }

  const placesAPI = createGooglePlacesAPI(supabase);
  const mallName = restaurant.shopping_malls?.name || "Singapore";

  return placesAPI.syncRestaurant(restaurantId, restaurant.name, mallName, {
    forceRefresh,
    fetchPhoto: true,
  });
}

/**
 * Sync all restaurants in a mall
 */
async function syncMallRestaurants(
  mallSlug: string,
  limit = 100,
  forceRefresh = false,
): Promise<{
  total: number;
  synced: number;
  failed: number;
  closures: string[];
  errors: Array<{ id: string; error: string }>;
}> {
  const { data: mall } = await supabase
    .from("shopping_malls")
    .select("id, name")
    .eq("slug", mallSlug)
    .single();

  if (!mall) {
    return { total: 0, synced: 0, failed: 0, closures: [], errors: [] };
  }

  const { data: restaurants } = await supabase
    .from("mall_restaurants")
    .select("id, name")
    .eq("mall_id", mall.id)
    .limit(limit);

  if (!restaurants || restaurants.length === 0) {
    return { total: 0, synced: 0, failed: 0, closures: [], errors: [] };
  }

  const placesAPI = createGooglePlacesAPI(supabase);

  return placesAPI.batchSync(
    restaurants.map((r) => ({
      id: r.id,
      name: r.name,
      mallName: mall.name,
    })),
    {
      batchSize: 10,
      delayBetweenBatches: 2000,
    },
  );
}

/**
 * Sync stale restaurants (not verified in X days)
 */
async function syncStaleRestaurants(
  staleDays = 7,
  limit = 50,
): Promise<{
  total: number;
  synced: number;
  failed: number;
  closures: string[];
  errors: Array<{ id: string; error: string }>;
}> {
  const staleDate = new Date(
    Date.now() - staleDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: restaurants } = await supabase
    .from("mall_restaurants")
    .select("id, name, shopping_malls(name)")
    .or(`last_verified_at.is.null,last_verified_at.lt.${staleDate}`)
    .eq("is_permanently_closed", false)
    .limit(limit);

  if (!restaurants || restaurants.length === 0) {
    return { total: 0, synced: 0, failed: 0, closures: [], errors: [] };
  }

  const placesAPI = createGooglePlacesAPI(supabase);

  return placesAPI.batchSync(
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
}

/**
 * POST - Trigger sync
 */
export async function POST(request: NextRequest) {
  try {
    const body: SyncRequest = await request.json();

    // Validate request
    if (!body.type) {
      return NextResponse.json(
        { error: "Sync type required" },
        { status: 400 },
      );
    }

    // Dry run mode - just return what would be synced
    if (body.dryRun) {
      let preview: {
        count: number;
        restaurants?: Array<{ id: string; name: string }>;
      } = { count: 0 };

      if (body.type === "single" && body.restaurantId) {
        const { data } = await supabase
          .from("mall_restaurants")
          .select("id, name")
          .eq("id", body.restaurantId)
          .single();
        preview = { count: data ? 1 : 0, restaurants: data ? [data] : [] };
      } else if (body.type === "mall" && body.mallSlug) {
        const { data: mall } = await supabase
          .from("shopping_malls")
          .select("id")
          .eq("slug", body.mallSlug)
          .single();
        if (mall) {
          const { data, count } = await supabase
            .from("mall_restaurants")
            .select("id, name", { count: "exact" })
            .eq("mall_id", mall.id)
            .limit(body.limit || 100);
          preview = { count: count || 0, restaurants: data || [] };
        }
      } else if (body.type === "stale") {
        const staleDate = new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString();
        const { data, count } = await supabase
          .from("mall_restaurants")
          .select("id, name", { count: "exact" })
          .or(`last_verified_at.is.null,last_verified_at.lt.${staleDate}`)
          .eq("is_permanently_closed", false)
          .limit(body.limit || 50);
        preview = { count: count || 0, restaurants: data || [] };
      }

      return NextResponse.json({
        dryRun: true,
        type: body.type,
        preview,
      });
    }

    // Execute sync
    let result: {
      success: boolean;
      total?: number;
      synced?: number;
      failed?: number;
      closures?: string[];
      changes?: string[];
      error?: string;
    };

    const logId = await createSyncLog(
      body.type,
      body.type === "single" ? 1 : body.limit || 50,
    );

    switch (body.type) {
      case "single":
        if (!body.restaurantId) {
          return NextResponse.json(
            { error: "Restaurant ID required for single sync" },
            { status: 400 },
          );
        }
        const singleResult = await syncSingleRestaurant(
          body.restaurantId,
          body.forceRefresh,
        );
        result = {
          success: singleResult.success,
          synced: singleResult.success ? 1 : 0,
          failed: singleResult.success ? 0 : 1,
          changes: singleResult.changes,
          error: singleResult.error,
        };
        break;

      case "mall":
        if (!body.mallSlug) {
          return NextResponse.json(
            { error: "Mall slug required for mall sync" },
            { status: 400 },
          );
        }
        const mallResult = await syncMallRestaurants(
          body.mallSlug,
          body.limit,
          body.forceRefresh,
        );
        result = {
          success: mallResult.failed === 0,
          total: mallResult.total,
          synced: mallResult.synced,
          failed: mallResult.failed,
          closures: mallResult.closures,
        };
        break;

      case "stale":
        const staleResult = await syncStaleRestaurants(7, body.limit || 50);
        result = {
          success: staleResult.failed === 0,
          total: staleResult.total,
          synced: staleResult.synced,
          failed: staleResult.failed,
          closures: staleResult.closures,
        };
        break;

      case "full":
        // Full refresh - sync all stale (>7 days) restaurants
        const fullResult = await syncStaleRestaurants(7, body.limit || 100);
        result = {
          success: fullResult.failed === 0,
          total: fullResult.total,
          synced: fullResult.synced,
          failed: fullResult.failed,
          closures: fullResult.closures,
        };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid sync type" },
          { status: 400 },
        );
    }

    // Update sync log
    if (logId) {
      await updateSyncLog(logId, {
        processed: result.total || (result.synced || 0) + (result.failed || 0),
        updated: result.synced || 0,
        created: 0,
        unchanged: 0,
        failed: result.failed || 0,
      });
    }

    return NextResponse.json({
      type: body.type,
      ...result,
    });
  } catch (error) {
    console.error("Sync trigger error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET - Get sync status and stats
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const logId = searchParams.get("logId");

    if (logId) {
      // Get specific sync log
      const { data, error } = await supabase
        .from("data_sync_logs")
        .select("*")
        .eq("id", logId)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Log not found" }, { status: 404 });
      }

      return NextResponse.json(data);
    }

    // Get recent sync activity
    const { data: recentSyncs } = await supabase
      .from("recent_sync_activity")
      .select("*")
      .limit(10);

    // Get sync statistics
    const { data: syncStats } = await supabase
      .from("sync_statistics")
      .select("*");

    // Get data freshness summary
    const { data: freshness } = await supabase
      .from("data_freshness_summary")
      .select("*")
      .single();

    return NextResponse.json({
      recentSyncs: recentSyncs || [],
      statistics: syncStats || [],
      freshness: freshness || {},
    });
  } catch (error) {
    console.error("Sync status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
