/**
 * Real-Time Data Sync Library
 *
 * Provides utilities for:
 * - Google Places API integration with caching
 * - Change detection and logging
 * - Webhook processing
 */

export { GooglePlacesAPI, createGooglePlacesAPI } from "./google-places";

export type { DetectedChange, ChangeDetectionResult } from "./change-detection";

export {
  ChangeDetector,
  createChangeDetector,
  CHANGE_PRIORITIES,
} from "./change-detection";
