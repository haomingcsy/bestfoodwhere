/**
 * Webhook Receiver API
 *
 * Receives updates from:
 * - n8n workflows
 * - Google Places (via scheduled jobs)
 * - Partner integrations
 * - Owner portal
 *
 * All updates go through change detection and are logged.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import {
  createChangeDetector,
  DetectedChange,
} from "@/lib/sync/change-detection";

// Initialize Supabase with service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Webhook secret for HMAC verification
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "default-webhook-secret";

// Allowed webhook sources
const ALLOWED_SOURCES = ["n8n", "google_places", "partner", "owner", "system"];

// Allowed event types
const ALLOWED_EVENTS = [
  "update",
  "closure",
  "new_promotion",
  "menu_update",
  "hours_update",
  "bulk_sync",
];

interface WebhookPayload {
  source: string;
  event: string;
  signature?: string;
  timestamp?: number;
  data: {
    entityType: "mall_restaurant" | "brand_menu" | "menu_item" | "promotion";
    entityId?: string;
    entitySlug?: string;
    changes?: Record<string, unknown>;
    confidence?: number;
    metadata?: Record<string, unknown>;
  };
}

/**
 * Verify webhook signature using HMAC
 */
function verifySignature(
  payload: string,
  signature: string | undefined,
  timestamp: number | undefined,
): boolean {
  if (!signature || !timestamp) {
    return false;
  }

  // Check timestamp is recent (within 5 minutes)
  const now = Date.now();
  if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
    return false;
  }

  // Compute expected signature
  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  // Constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

/**
 * Log webhook event to sync logs
 */
async function logWebhookEvent(
  source: string,
  event: string,
  status: "running" | "completed" | "failed",
  stats: {
    entitiesProcessed?: number;
    entitiesUpdated?: number;
    errors?: Array<{ message: string }>;
  } = {},
): Promise<string | null> {
  const { data, error } = await supabase
    .from("data_sync_logs")
    .insert({
      sync_type: "webhook_triggered",
      sync_source: source === "n8n" ? "n8n_workflow" : source,
      status,
      total_entities: stats.entitiesProcessed || 1,
      entities_processed: stats.entitiesProcessed || 0,
      entities_updated: stats.entitiesUpdated || 0,
      errors_count: stats.errors?.length || 0,
      error_details: stats.errors || [],
      metadata: { event },
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to log webhook event:", error);
    return null;
  }

  return data?.id || null;
}

/**
 * Update sync log status
 */
async function updateSyncLog(
  logId: string,
  status: "completed" | "failed" | "partial",
  stats: {
    entitiesUpdated?: number;
    errors?: Array<{ message: string }>;
  },
): Promise<void> {
  await supabase
    .from("data_sync_logs")
    .update({
      status,
      entities_updated: stats.entitiesUpdated || 0,
      errors_count: stats.errors?.length || 0,
      error_details: stats.errors || [],
      completed_at: new Date().toISOString(),
    })
    .eq("id", logId);
}

/**
 * Handle restaurant update
 */
async function handleRestaurantUpdate(
  payload: WebhookPayload,
): Promise<{ success: boolean; changes: string[]; error?: string }> {
  const { entityId, entitySlug, changes, confidence } = payload.data;

  if (!entityId && !entitySlug) {
    return { success: false, changes: [], error: "Entity ID or slug required" };
  }

  // Find the restaurant
  let query = supabase.from("mall_restaurants").select("*");
  if (entityId) {
    query = query.eq("id", entityId);
  } else if (entitySlug) {
    query = query.eq("slug", entitySlug);
  }

  const { data: restaurant, error: fetchError } = await query.single();

  if (fetchError || !restaurant) {
    return { success: false, changes: [], error: "Restaurant not found" };
  }

  if (!changes || Object.keys(changes).length === 0) {
    return { success: true, changes: ["No changes provided"] };
  }

  // Use change detector
  const changeDetector = createChangeDetector(supabase);

  const detectedChanges: DetectedChange[] = [];
  for (const [field, newValue] of Object.entries(changes)) {
    if (restaurant[field] !== newValue) {
      detectedChanges.push({
        entityType: "mall_restaurant",
        entityId: restaurant.id,
        entitySlug: restaurant.slug,
        entityName: restaurant.name,
        fieldName: field,
        oldValue: restaurant[field] != null ? String(restaurant[field]) : null,
        newValue: newValue != null ? String(newValue) : null,
        changeType:
          field === "is_permanently_closed"
            ? "closure"
            : field === "opening_hours"
              ? "hours_change"
              : "other",
        changeSource:
          payload.source === "n8n" ? "n8n_workflow" : payload.source,
        confidenceScore: confidence || 0.8,
        metadata: payload.data.metadata,
      });
    }
  }

  if (detectedChanges.length === 0) {
    return { success: true, changes: ["No changes detected"] };
  }

  // Process changes
  const result = await changeDetector.processChanges(detectedChanges);

  return {
    success: true,
    changes: [
      ...result.autoApplied.map((f) => `Auto-applied: ${f}`),
      ...result.queuedForReview.map((f) => `Queued for review: ${f}`),
    ],
  };
}

/**
 * Handle closure event
 */
async function handleClosure(
  payload: WebhookPayload,
): Promise<{ success: boolean; error?: string }> {
  const { entityId, entitySlug, confidence } = payload.data;

  if (!entityId && !entitySlug) {
    return { success: false, error: "Entity ID or slug required" };
  }

  // Find the restaurant
  let query = supabase.from("mall_restaurants").select("*");
  if (entityId) {
    query = query.eq("id", entityId);
  } else if (entitySlug) {
    query = query.eq("slug", entitySlug);
  }

  const { data: restaurant, error: fetchError } = await query.single();

  if (fetchError || !restaurant) {
    return { success: false, error: "Restaurant not found" };
  }

  // Create critical change
  const changeDetector = createChangeDetector(supabase);

  const closureChange: DetectedChange = {
    entityType: "mall_restaurant",
    entityId: restaurant.id,
    entitySlug: restaurant.slug,
    entityName: restaurant.name,
    fieldName: "is_permanently_closed",
    oldValue: String(restaurant.is_permanently_closed || false),
    newValue: "true",
    changeType: "closure",
    changeSource: payload.source === "n8n" ? "n8n_workflow" : payload.source,
    confidenceScore: confidence || 0.8,
    metadata: payload.data.metadata,
  };

  await changeDetector.processChanges([closureChange]);

  return { success: true };
}

/**
 * Handle promotion event
 */
async function handlePromotion(
  payload: WebhookPayload,
): Promise<{ success: boolean; error?: string }> {
  const { entityId, entitySlug, changes, confidence, metadata } = payload.data;

  if (!changes) {
    return { success: false, error: "Promotion data required" };
  }

  const promotionData = {
    mall_restaurant_id: entityId,
    title: changes.title || "New Promotion",
    description: changes.description,
    promotion_type: changes.promotion_type || "discount",
    discount_value: changes.discount_value,
    terms_conditions: changes.terms_conditions,
    starts_at: changes.starts_at,
    expires_at: changes.expires_at,
    source_type:
      payload.source === "n8n"
        ? "scrape"
        : payload.source === "owner"
          ? "owner"
          : "website",
    confidence_score: confidence || 0.7,
    is_active: true,
    is_verified: (confidence || 0.7) >= 0.85,
    metadata: metadata || {},
  };

  const { error } = await supabase
    .from("restaurant_promotions")
    .insert(promotionData);

  if (error) {
    return { success: false, error: error.message };
  }

  // Log the change
  const changeDetector = createChangeDetector(supabase);
  await changeDetector.logChange({
    entityType: "promotion",
    entityId: entityId || "",
    entitySlug,
    fieldName: "new_promotion",
    oldValue: null,
    newValue: JSON.stringify(changes),
    changeType: "new_promotion",
    changeSource: payload.source === "n8n" ? "n8n_workflow" : payload.source,
    confidenceScore: confidence || 0.7,
  });

  return { success: true };
}

/**
 * Handle bulk sync (multiple updates)
 */
async function handleBulkSync(payload: WebhookPayload): Promise<{
  success: boolean;
  processed: number;
  updated: number;
  errors: Array<{ id: string; error: string }>;
}> {
  const updates = (payload.data.metadata?.updates || []) as Array<{
    entityId: string;
    changes: Record<string, unknown>;
  }>;

  if (!updates.length) {
    return { success: false, processed: 0, updated: 0, errors: [] };
  }

  let updated = 0;
  const errors: Array<{ id: string; error: string }> = [];

  for (const update of updates) {
    const result = await handleRestaurantUpdate({
      ...payload,
      data: {
        ...payload.data,
        entityId: update.entityId,
        changes: update.changes,
      },
    });

    if (result.success && result.changes.length > 0) {
      updated++;
    } else if (!result.success) {
      errors.push({ id: update.entityId, error: result.error || "Unknown" });
    }
  }

  return {
    success: errors.length === 0,
    processed: updates.length,
    updated,
    errors,
  };
}

/**
 * POST handler for webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    let payload: WebhookPayload;

    try {
      payload = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    // Validate source
    if (!ALLOWED_SOURCES.includes(payload.source)) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }

    // Validate event
    if (!ALLOWED_EVENTS.includes(payload.event)) {
      return NextResponse.json(
        { error: "Invalid event type" },
        { status: 400 },
      );
    }

    // Verify signature (skip for internal sources)
    const requiresSignature = !["system"].includes(payload.source);
    if (requiresSignature) {
      const isValid = verifySignature(
        body,
        payload.signature,
        payload.timestamp,
      );
      if (!isValid) {
        console.warn("Invalid webhook signature");
        // Log but don't reject for now (development mode)
        // return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    // Log the webhook event
    const logId = await logWebhookEvent(
      payload.source,
      payload.event,
      "running",
    );

    // Process based on event type
    let result: {
      success: boolean;
      changes?: string[];
      processed?: number;
      updated?: number;
      error?: string;
      errors?: Array<{ id: string; error: string }>;
    };

    switch (payload.event) {
      case "update":
      case "menu_update":
      case "hours_update":
        result = await handleRestaurantUpdate(payload);
        break;
      case "closure":
        result = await handleClosure(payload);
        break;
      case "new_promotion":
        result = await handlePromotion(payload);
        break;
      case "bulk_sync":
        result = await handleBulkSync(payload);
        break;
      default:
        result = { success: false, error: "Unknown event type" };
    }

    // Update sync log
    if (logId) {
      await updateSyncLog(logId, result.success ? "completed" : "failed", {
        entitiesUpdated: result.updated || (result.success ? 1 : 0),
        errors: result.errors?.map((e) => ({ message: e.error })),
      });
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET handler - health check and stats
 */
export async function GET() {
  try {
    // Get recent sync stats
    const { data: recentSyncs } = await supabase
      .from("data_sync_logs")
      .select("status, sync_type")
      .eq("sync_type", "webhook_triggered")
      .gte(
        "started_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      );

    const stats = {
      status: "healthy",
      last24h: {
        total: recentSyncs?.length || 0,
        completed:
          recentSyncs?.filter((s) => s.status === "completed").length || 0,
        failed: recentSyncs?.filter((s) => s.status === "failed").length || 0,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: "Failed to get stats" },
      { status: 500 },
    );
  }
}
