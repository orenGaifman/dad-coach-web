'use client';

/**
 * Mutation hook for scheduling a new Quality Time session.
 *
 * Wraps the scheduleQualityTime service with TanStack Query mutation,
 * invalidating the workspace summary on success to refresh dashboard state.
 *
 * @see Requirement 13.4: Quality Time scheduling
 * @see design.md - Mutation Hooks section
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query-client';
import { scheduleQualityTime } from '@/src/services/qualityTime';
import type { ScheduleRequest } from '@/src/types/qualityTime';

/**
 * Hook for scheduling a new Quality Time session.
 *
 * Usage:
 * ```tsx
 * const { mutate, isPending, isError, error, data } = useScheduleQualityTime();
 *
 * // Schedule quality time
 * mutate({
 *   child_id: 123,
 *   start_time: '2024-01-15T17:00:00Z',
 *   duration_minutes: 30
 * });
 * ```
 *
 * @returns TanStack Query mutation result with scheduleQualityTime
 */
export function useScheduleQualityTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ScheduleRequest) => scheduleQualityTime(request),
    onSuccess: () => {
      // Invalidate workspace summary to refresh dashboard with new scheduled quality time
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceSummary() });
    },
  });
}
