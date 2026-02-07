/**
 * CRON Job: Daily Summary Report
 *
 * Vercel CRON schedule: 0 9 * * * (Daily 9 AM)
 *
 * This endpoint:
 * 1. Gathers data health metrics
 * 2. Checks for cost alerts
 * 3. Sends Slack summary notification
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  sendDailySummary,
  sendCostAlert,
  sendVerificationQueueAlert,
} from "@/lib/notifications/email";

const CRON_SECRET = process.env.CRON_SECRET;
const COST_ALERT_THRESHOLD = 50; // USD

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Verify CRON authorization
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get data freshness summary
    const { data: freshness } = await supabase
      .from("data_freshness_summary")
      .select("*")
      .single();

    // Get changes in last 24 hours
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: changesCount } = await supabase
      .from("data_change_history")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since24h);

    // Get closures in last 24 hours
    const { count: closuresCount } = await supabase
      .from("data_change_history")
      .select("id", { count: "exact", head: true })
      .eq("field_name", "is_permanently_closed")
      .gte("created_at", since24h);

    // Get pending verification count
    const { count: pendingCount } = await supabase
      .from("verification_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    // Get critical verification count
    const { count: criticalCount } = await supabase
      .from("verification_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .lte("priority", 2);

    // Get today's API costs
    const { data: todayCosts } = await supabase
      .from("today_api_costs")
      .select("*");

    const totalCostToday =
      todayCosts?.reduce(
        (sum, c) => sum + (parseFloat(c.cost_today_usd) || 0),
        0,
      ) || 0;

    // Send daily summary
    await sendDailySummary({
      totalRestaurants: freshness?.total_restaurants || 0,
      verified24h: freshness?.verified_24h || 0,
      stale14d: freshness?.stale_14d || 0,
      changesDetected: changesCount || 0,
      closures: closuresCount || 0,
      pendingVerification: pendingCount || 0,
      apiCostsToday: totalCostToday,
    });

    // Send cost alert if threshold exceeded
    if (totalCostToday >= COST_ALERT_THRESHOLD) {
      await sendCostAlert(
        totalCostToday,
        COST_ALERT_THRESHOLD,
        todayCosts?.map((c) => ({
          api: c.api_name,
          cost: parseFloat(c.cost_today_usd) || 0,
        })) || [],
      );
    }

    // Send verification queue alert if items pending
    if ((pendingCount || 0) > 0) {
      await sendVerificationQueueAlert(pendingCount || 0, criticalCount || 0);
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalRestaurants: freshness?.total_restaurants || 0,
        verified24h: freshness?.verified_24h || 0,
        stale14d: freshness?.stale_14d || 0,
        changesDetected: changesCount || 0,
        pendingVerification: pendingCount || 0,
        apiCostsToday: totalCostToday.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Daily summary CRON error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
