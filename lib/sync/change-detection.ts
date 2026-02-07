/**
 * Change Detection System
 *
 * Compares data from various sources and detects changes.
 * Logs all changes to data_change_history table.
 * Queues high-priority changes for manual verification.
 */

import { SupabaseClient } from "@supabase/supabase-js";

// Change types with priority (1 = highest)
export const CHANGE_PRIORITIES: Record<string, number> = {
  closure: 1,
  temporary_closure: 2,
  address_change: 2,
  hours_change: 3,
  phone_change: 4,
  menu_change: 5,
  price_change: 5,
  new_promotion: 6,
  image_change: 7,
  low_confidence: 8,
  name_change: 3,
  other: 9,
};

// Confidence thresholds
const AUTO_APPLY_THRESHOLD = 0.85; // Auto-apply changes above this
const REVIEW_THRESHOLD = 0.5; // Queue for review below this

export interface DetectedChange {
  entityType:
    | "mall_restaurant"
    | "brand_menu"
    | "menu_item"
    | "menu_category"
    | "promotion"
    | "brand_location";
  entityId: string;
  entitySlug?: string;
  entityName?: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  changeType: string;
  changeSource: string;
  confidenceScore: number;
  metadata?: Record<string, unknown>;
}

export interface ChangeDetectionResult {
  changes: DetectedChange[];
  criticalChanges: DetectedChange[];
  lowConfidenceChanges: DetectedChange[];
  autoApplied: string[];
  queuedForReview: string[];
}

/**
 * Compare two values and return true if they're different
 */
function isDifferent(
  oldVal: unknown,
  newVal: unknown,
  options: { ignoreCase?: boolean; trim?: boolean } = {},
): boolean {
  if (oldVal === newVal) return false;
  if (oldVal == null && newVal == null) return false;

  // Handle string comparison
  if (typeof oldVal === "string" && typeof newVal === "string") {
    let a = oldVal;
    let b = newVal;
    if (options.trim) {
      a = a.trim();
      b = b.trim();
    }
    if (options.ignoreCase) {
      a = a.toLowerCase();
      b = b.toLowerCase();
    }
    return a !== b;
  }

  // Handle array comparison (e.g., opening hours)
  if (Array.isArray(oldVal) && Array.isArray(newVal)) {
    return JSON.stringify(oldVal) !== JSON.stringify(newVal);
  }

  // Handle object comparison
  if (
    typeof oldVal === "object" &&
    typeof newVal === "object" &&
    oldVal !== null &&
    newVal !== null
  ) {
    return JSON.stringify(oldVal) !== JSON.stringify(newVal);
  }

  return true;
}

/**
 * Determine change type from field name
 */
function getChangeType(fieldName: string, newValue: unknown): string {
  const fieldToType: Record<string, string> = {
    is_permanently_closed: "closure",
    temporarily_closed: "temporary_closure",
    opening_hours: "hours_change",
    address: "address_change",
    phone: "phone_change",
    menu_items: "menu_change",
    price: "price_change",
    hero_image_url: "image_change",
    name: "name_change",
  };

  // Special case: closure detection
  if (fieldName === "is_permanently_closed" && newValue === true) {
    return "closure";
  }

  return fieldToType[fieldName] || "other";
}

/**
 * Change Detection Engine
 */
export class ChangeDetector {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Compare old and new restaurant data and detect changes
   */
  detectRestaurantChanges(
    entityId: string,
    entitySlug: string | undefined,
    entityName: string | undefined,
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
    source: string,
    confidenceScore = 0.8,
  ): DetectedChange[] {
    const changes: DetectedChange[] = [];

    // Fields to compare
    const compareFields = [
      "name",
      "address",
      "phone",
      "opening_hours",
      "rating",
      "review_count",
      "is_permanently_closed",
      "temporarily_closed",
      "website",
      "hero_image_url",
    ];

    for (const field of compareFields) {
      const oldVal = oldData[field];
      const newVal = newData[field];

      if (isDifferent(oldVal, newVal, { trim: true })) {
        const changeType = getChangeType(field, newVal);

        changes.push({
          entityType: "mall_restaurant",
          entityId,
          entitySlug,
          entityName,
          fieldName: field,
          oldValue: oldVal != null ? String(oldVal) : null,
          newValue: newVal != null ? String(newVal) : null,
          changeType,
          changeSource: source,
          confidenceScore,
        });
      }
    }

    return changes;
  }

  /**
   * Compare menu data and detect changes
   */
  detectMenuChanges(
    brandMenuId: string,
    brandSlug: string | undefined,
    brandName: string | undefined,
    oldItems: Array<Record<string, unknown>>,
    newItems: Array<Record<string, unknown>>,
    source: string,
    confidenceScore = 0.8,
  ): DetectedChange[] {
    const changes: DetectedChange[] = [];

    // Build lookup maps
    const oldMap = new Map(oldItems.map((item) => [item.name as string, item]));
    const newMap = new Map(newItems.map((item) => [item.name as string, item]));

    // Check for new or changed items
    for (const [name, newItem] of newMap) {
      const oldItem = oldMap.get(name);

      if (!oldItem) {
        // New item
        changes.push({
          entityType: "menu_item",
          entityId: brandMenuId,
          entitySlug: brandSlug,
          entityName: `${brandName} - ${name}`,
          fieldName: "new_item",
          oldValue: null,
          newValue: JSON.stringify(newItem),
          changeType: "menu_change",
          changeSource: source,
          confidenceScore,
        });
      } else if (isDifferent(oldItem.price, newItem.price)) {
        // Price change
        changes.push({
          entityType: "menu_item",
          entityId: brandMenuId,
          entitySlug: brandSlug,
          entityName: `${brandName} - ${name}`,
          fieldName: "price",
          oldValue: String(oldItem.price),
          newValue: String(newItem.price),
          changeType: "price_change",
          changeSource: source,
          confidenceScore,
        });
      }
    }

    // Check for removed items
    for (const [name] of oldMap) {
      if (!newMap.has(name)) {
        changes.push({
          entityType: "menu_item",
          entityId: brandMenuId,
          entitySlug: brandSlug,
          entityName: `${brandName} - ${name}`,
          fieldName: "removed_item",
          oldValue: name,
          newValue: null,
          changeType: "menu_change",
          changeSource: source,
          confidenceScore,
        });
      }
    }

    return changes;
  }

  /**
   * Log a change to the data_change_history table
   */
  async logChange(change: DetectedChange): Promise<string | null> {
    const { data, error } = await this.supabase
      .from("data_change_history")
      .insert({
        entity_type: change.entityType,
        entity_id: change.entityId,
        entity_slug: change.entitySlug,
        field_name: change.fieldName,
        old_value: change.oldValue,
        new_value: change.newValue,
        change_source: change.changeSource,
        confidence_score: change.confidenceScore,
        metadata: change.metadata || {},
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to log change:", error);
      return null;
    }

    return data?.id || null;
  }

  /**
   * Queue a change for manual verification
   */
  async queueForVerification(
    change: DetectedChange,
    changeHistoryId?: string,
  ): Promise<string | null> {
    const priority =
      CHANGE_PRIORITIES[change.changeType] || CHANGE_PRIORITIES.other;

    const { data, error } = await this.supabase
      .from("verification_queue")
      .insert({
        entity_type: change.entityType,
        entity_id: change.entityId,
        entity_slug: change.entitySlug,
        entity_name: change.entityName,
        change_type: change.changeType,
        priority,
        detected_value: change.newValue,
        current_value: change.oldValue,
        detection_source: change.changeSource,
        confidence_score: change.confidenceScore,
        related_change_id: changeHistoryId,
        metadata: change.metadata || {},
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to queue for verification:", error);
      return null;
    }

    return data?.id || null;
  }

  /**
   * Process a batch of detected changes
   * - Logs all changes to history
   * - Auto-applies high-confidence changes
   * - Queues low-confidence changes for review
   * - Returns summary
   */
  async processChanges(
    changes: DetectedChange[],
  ): Promise<ChangeDetectionResult> {
    const result: ChangeDetectionResult = {
      changes,
      criticalChanges: [],
      lowConfidenceChanges: [],
      autoApplied: [],
      queuedForReview: [],
    };

    for (const change of changes) {
      // Log to history
      const changeId = await this.logChange(change);

      // Categorize
      const isCritical =
        change.changeType === "closure" ||
        change.changeType === "temporary_closure" ||
        change.changeType === "address_change";
      const isLowConfidence = change.confidenceScore < REVIEW_THRESHOLD;
      const canAutoApply = change.confidenceScore >= AUTO_APPLY_THRESHOLD;

      if (isCritical) {
        result.criticalChanges.push(change);
        // Always queue critical changes for review
        const queueId = await this.queueForVerification(
          change,
          changeId || undefined,
        );
        if (queueId) {
          result.queuedForReview.push(change.fieldName);
        }
      } else if (isLowConfidence) {
        result.lowConfidenceChanges.push(change);
        // Queue low confidence changes
        const queueId = await this.queueForVerification(
          change,
          changeId || undefined,
        );
        if (queueId) {
          result.queuedForReview.push(change.fieldName);
        }
      } else if (canAutoApply) {
        // Auto-apply the change
        const applied = await this.applyChange(change);
        if (applied) {
          result.autoApplied.push(change.fieldName);
        }
      } else {
        // Medium confidence - queue for review
        const queueId = await this.queueForVerification(
          change,
          changeId || undefined,
        );
        if (queueId) {
          result.queuedForReview.push(change.fieldName);
        }
      }
    }

    return result;
  }

  /**
   * Apply a change to the database
   */
  private async applyChange(change: DetectedChange): Promise<boolean> {
    try {
      // Handle different entity types
      if (change.entityType === "mall_restaurant") {
        const updates: Record<string, unknown> = {};

        // Parse the new value based on field type
        if (
          change.fieldName === "is_permanently_closed" ||
          change.fieldName === "temporarily_closed"
        ) {
          updates[change.fieldName] = change.newValue === "true";
        } else if (
          change.fieldName === "rating" ||
          change.fieldName === "review_count"
        ) {
          updates[change.fieldName] = parseFloat(change.newValue || "0");
        } else if (change.fieldName === "opening_hours") {
          try {
            updates[change.fieldName] = JSON.parse(change.newValue || "[]");
          } catch {
            updates[change.fieldName] = change.newValue;
          }
        } else {
          updates[change.fieldName] = change.newValue;
        }

        const { error } = await this.supabase
          .from("mall_restaurants")
          .update(updates)
          .eq("id", change.entityId);

        if (error) {
          console.error("Failed to apply change:", error);
          return false;
        }

        // Mark the change as verified (auto-applied)
        await this.supabase
          .from("data_change_history")
          .update({
            is_verified: true,
            verified_at: new Date().toISOString(),
            change_reason: "Auto-applied (high confidence)",
          })
          .eq("entity_id", change.entityId)
          .eq("field_name", change.fieldName)
          .order("created_at", { ascending: false })
          .limit(1);

        return true;
      }

      // Add handlers for other entity types as needed
      return false;
    } catch (error) {
      console.error("Error applying change:", error);
      return false;
    }
  }

  /**
   * Get pending verifications grouped by type
   */
  async getPendingVerifications(): Promise<{
    critical: number;
    highPriority: number;
    normal: number;
    total: number;
  }> {
    const { data, error } = await this.supabase
      .from("verification_queue")
      .select("priority")
      .eq("status", "pending");

    if (error || !data) {
      return { critical: 0, highPriority: 0, normal: 0, total: 0 };
    }

    return {
      critical: data.filter((d) => d.priority <= 2).length,
      highPriority: data.filter((d) => d.priority > 2 && d.priority <= 4)
        .length,
      normal: data.filter((d) => d.priority > 4).length,
      total: data.length,
    };
  }

  /**
   * Get recent changes summary
   */
  async getRecentChangesSummary(hours = 24): Promise<{
    total: number;
    byType: Record<string, number>;
    bySource: Record<string, number>;
    closures: number;
  }> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const { data, error } = await this.supabase
      .from("data_change_history")
      .select("field_name, change_source")
      .gte("created_at", since);

    if (error || !data) {
      return { total: 0, byType: {}, bySource: {}, closures: 0 };
    }

    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    let closures = 0;

    for (const change of data) {
      const type = getChangeType(change.field_name, null);
      byType[type] = (byType[type] || 0) + 1;
      bySource[change.change_source] =
        (bySource[change.change_source] || 0) + 1;

      if (change.field_name === "is_permanently_closed") {
        closures++;
      }
    }

    return {
      total: data.length,
      byType,
      bySource,
      closures,
    };
  }
}

/**
 * Create a change detector instance
 */
export function createChangeDetector(supabase: SupabaseClient): ChangeDetector {
  return new ChangeDetector(supabase);
}
