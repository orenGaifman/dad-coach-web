/**
 * Coaching API service layer.
 *
 * Provides activity logging endpoints using the shared apiClient.
 * Each function is typed against the coaching type definitions.
 *
 * @see design.md - API Service Layer section
 */

import { apiClient } from '@/src/lib/api-client';
import type {
  LogQualityTimeRequest,
  LogPositiveActivityRequest,
  ActivityResponse,
} from '@/src/types/coaching';

/**
 * Log quality time spent with a child.
 * POST /api/v1/workspace/activity/quality-time
 *
 * @see Requirement 10: Log Quality Time
 */
export async function logQualityTime(
  data: LogQualityTimeRequest
): Promise<ActivityResponse> {
  return apiClient.post<ActivityResponse>('/workspace/activity/quality-time', data);
}

/**
 * Log a positive parenting activity.
 * POST /api/v1/workspace/activity/positive
 *
 * @see Requirement 11: Log Positive Activity
 */
export async function logPositiveActivity(
  data: LogPositiveActivityRequest
): Promise<ActivityResponse> {
  return apiClient.post<ActivityResponse>('/workspace/activity/positive', data);
}
