/**
 * Quality Time API service layer.
 *
 * Wraps Quality Time scheduling, completion, and cancellation endpoints
 * using the shared apiClient. Each function is typed against the
 * qualityTime type definitions.
 *
 * @see design.md - API Service Layer section
 */

import { apiClient } from '@/src/lib/api-client';
import type {
  AvailableSlotsResponse,
  CompleteRequest,
  CompleteResponse,
  QualityTime,
  ScheduleRequest,
  ScheduleResponse,
} from '@/src/types/qualityTime';
import type { WorkspaceSummaryResponse } from '@/src/types/workspace';

// ---------------------------------------------------------------------------
// Workspace Summary
// ---------------------------------------------------------------------------

/**
 * Fetch the workspace summary (main dashboard data).
 * GET /api/v1/workspace/summary
 *
 * @param signal - Optional AbortSignal for request cancellation
 * @returns WorkspaceSummary containing current workflow state and dashboard data
 */
export async function getWorkspaceSummary(
  signal?: AbortSignal
): Promise<WorkspaceSummaryResponse> {
  return apiClient.get<WorkspaceSummaryResponse>('/workspace/summary', { signal });
}

// ---------------------------------------------------------------------------
// Available Slots
// ---------------------------------------------------------------------------

/**
 * Fetch available time slots for scheduling Quality Time.
 * GET /api/v1/quality-time/available-slots
 *
 * @param daysAhead - Number of days ahead to look for slots (default: 7)
 * @param minDuration - Minimum slot duration in minutes (default: 30)
 * @param signal - Optional AbortSignal for request cancellation
 * @returns AvailableSlotsResponse containing slots and calendar connection status
 */
export async function getAvailableSlots(
  daysAhead: number = 7,
  minDuration: number = 30,
  signal?: AbortSignal
): Promise<AvailableSlotsResponse> {
  const params: Record<string, string> = {
    days_ahead: String(daysAhead),
    min_duration_minutes: String(minDuration),
  };
  return apiClient.get<AvailableSlotsResponse>('/quality-time/available-slots', params, { signal });
}

// ---------------------------------------------------------------------------
// Schedule Quality Time
// ---------------------------------------------------------------------------

/**
 * Schedule a new Quality Time session.
 * POST /api/v1/quality-time/schedule
 *
 * @param request - Schedule request containing child_id, start_time, and duration
 * @param signal - Optional AbortSignal for request cancellation
 * @returns ScheduleResponse containing the created session details
 */
export async function scheduleQualityTime(
  request: ScheduleRequest,
  signal?: AbortSignal
): Promise<ScheduleResponse> {
  return apiClient.post<ScheduleResponse>('/quality-time/schedule', request, { signal });
}

// ---------------------------------------------------------------------------
// Complete Quality Time
// ---------------------------------------------------------------------------

/**
 * Mark a Quality Time session as completed.
 * POST /api/v1/quality-time/{id}/complete
 *
 * @param id - Quality Time session ID
 * @param notes - Optional completion notes
 * @param signal - Optional AbortSignal for request cancellation
 * @returns CompleteResponse containing streak and belt updates
 */
export async function completeQualityTime(
  id: string,
  notes?: string,
  signal?: AbortSignal
): Promise<CompleteResponse> {
  const body: CompleteRequest = notes ? { notes } : {};
  return apiClient.post<CompleteResponse>(`/quality-time/${id}/complete`, body, { signal });
}

// ---------------------------------------------------------------------------
// Cancel Quality Time
// ---------------------------------------------------------------------------

/**
 * Cancel a scheduled Quality Time session.
 * POST /api/v1/quality-time/{id}/cancel
 *
 * @param id - Quality Time session ID
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Updated QualityTime record with CANCELLED status
 */
export async function cancelQualityTime(
  id: string,
  signal?: AbortSignal
): Promise<QualityTime> {
  return apiClient.post<QualityTime>(`/quality-time/${id}/cancel`, undefined, { signal });
}
