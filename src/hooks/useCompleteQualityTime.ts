'use client';

/**
 * Mutation hook for completing a Quality Time session.
 *
 * Wraps the completeQualityTime service with TanStack Query mutation,
 * handling cache invalidation for workspace, belt, streak, and celebrations
 * on successful completion.
 *
 * @see Requirement 13.1: Frontend hooks for Quality Time operations
 * @see design.md - Mutation Hooks section
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query-client';
import { completeQualityTime } from '@/src/services/qualityTime';

/**
 * Hook for marking a Quality Time session as completed.
 *
 * On success, invalidates:
 * - workspace-summary (main dashboard data)
 * - growth-belt (belt progression may change)
 * - growth-streak (streak will update)
 * - celebrations (new celebration may trigger)
 *
 * @example
 * ```tsx
 * const { mutate, isPending, isError } = useCompleteQualityTime();
 *
 * const handleComplete = () => {
 *   mutate(
 *     { id: qualityTimeId, notes: 'Great time at the park!' },
 *     {
 *       onSuccess: (data) => {
 *         if (data.belt_earned) {
 *           // Show belt celebration
 *         }
 *       },
 *     }
 *   );
 * };
 * ```
 */
export function useCompleteQualityTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      completeQualityTime(id, notes),
    onSuccess: () => {
      // Invalidate all growth and workspace queries since completion affects belt/streak
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceSummary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthBelt() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthStreak() });
      queryClient.invalidateQueries({ queryKey: queryKeys.celebrations() });
    },
  });
}
