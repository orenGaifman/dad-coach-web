/**
 * Weekly Goal API service layer.
 *
 * Wraps weekly goal endpoints using the shared apiClient.
 * Provides functions for fetching and managing weekly quality time goals.
 */

import { apiClient } from '@/src/lib/api-client';
import type {
  WeeklyGoal,
  CurrentWeeklyGoalResponse,
  WeeklyGoalHistoryResponse,
  WeeklySummaryResponse,
  CreateWeeklyGoalRequest,
} from '@/src/types/weeklyGoal';

// ---------------------------------------------------------------------------
// Get Weekly Goals
// ---------------------------------------------------------------------------

/**
 * Fetch the current week's goal.
 * GET /api/v1/workspace/weekly-goals/current
 */
export async function getCurrentWeeklyGoal(
  signal?: AbortSignal
): Promise<CurrentWeeklyGoalResponse | null> {
  try {
    return await apiClient.get<CurrentWeeklyGoalResponse>('/workspace/weekly-goals/current', { signal });
  } catch (error: unknown) {
    // 404 means no goal set for this week yet
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Fetch weekly goal history.
 * GET /api/v1/workspace/weekly-goals/history
 */
export async function getWeeklyGoalHistory(
  limit = 10,
  signal?: AbortSignal
): Promise<WeeklyGoalHistoryResponse> {
  return apiClient.get<WeeklyGoalHistoryResponse>(`/workspace/weekly-goals/history?limit=${limit}`, { signal });
}

/**
 * Fetch last week's summary.
 * GET /api/v1/workspace/weekly-goals/summary
 */
export async function getWeeklySummary(
  signal?: AbortSignal
): Promise<WeeklySummaryResponse> {
  return apiClient.get<WeeklySummaryResponse>('/workspace/weekly-goals/summary', { signal });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Create a new weekly goal.
 * POST /api/v1/workspace/weekly-goals
 */
export async function createWeeklyGoal(
  data: CreateWeeklyGoalRequest
): Promise<WeeklyGoal> {
  return apiClient.post<WeeklyGoal>('/workspace/weekly-goals', data);
}

/**
 * Activate a pending weekly goal.
 * POST /api/v1/workspace/weekly-goals/:id/activate
 */
export async function activateWeeklyGoal(goalId: number): Promise<WeeklyGoal> {
  return apiClient.post<WeeklyGoal>(`/workspace/weekly-goals/${goalId}/activate`, {});
}
