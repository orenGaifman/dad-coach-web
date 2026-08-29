'use client';

/**
 * Hooks for fetching and mutating weekly goals.
 *
 * Wraps the weekly goal service with TanStack Query caching.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import {
  getCurrentWeeklyGoal,
  getWeeklyGoalHistory,
  getWeeklySummary,
  createWeeklyGoal,
  activateWeeklyGoal,
} from '@/src/services/weeklyGoal';
import type { CreateWeeklyGoalRequest } from '@/src/types/weeklyGoal';

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/**
 * Fetch current week's goal.
 */
export function useCurrentWeeklyGoal() {
  return useQuery({
    queryKey: queryKeys.weeklyGoalCurrent(),
    queryFn: ({ signal }) => getCurrentWeeklyGoal(signal),
    staleTime: STALE_TIMES.COMMITMENTS,
  });
}

/**
 * Fetch weekly goal history.
 */
export function useWeeklyGoalHistory(limit = 10) {
  return useQuery({
    queryKey: queryKeys.weeklyGoalHistory(limit),
    queryFn: ({ signal }) => getWeeklyGoalHistory(limit, signal),
    staleTime: STALE_TIMES.COMMITMENTS,
  });
}

/**
 * Fetch last week's summary.
 */
export function useWeeklySummary() {
  return useQuery({
    queryKey: queryKeys.weeklyGoalSummary(),
    queryFn: ({ signal }) => getWeeklySummary(signal),
    staleTime: STALE_TIMES.COMMITMENTS,
  });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/**
 * Create a new weekly goal.
 */
export function useCreateWeeklyGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWeeklyGoalRequest) => createWeeklyGoal(data),
    onSuccess: () => {
      // Invalidate weekly goal queries
      queryClient.invalidateQueries({ queryKey: queryKeys.weeklyGoal() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceSummary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthBelt() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthStreak() });
    },
  });
}

/**
 * Activate a pending weekly goal.
 */
export function useActivateWeeklyGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: number) => activateWeeklyGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.weeklyGoal() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceSummary() });
    },
  });
}
