'use client';

/**
 * Hook for fetching detailed progress for a single goal.
 *
 * Wraps the getGoalDetail service with TanStack Query caching.
 * The query is only enabled when a valid goalId is provided.
 *
 * @see Requirement 8.1: Goal Detail displays description, category, progress, missions
 * @see design.md - Hook Layer section
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getGoalDetail } from '@/src/services/family';

/**
 * Fetches detailed progress for a specific goal.
 *
 * @param goalId - The ID of the goal to fetch details for
 * @returns TanStack Query result with goal detail data
 */
export function useGoalDetail(goalId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.goal(goalId ?? ''),
    queryFn: ({ signal }) => getGoalDetail(goalId!, signal),
    staleTime: STALE_TIMES.GOALS,
    // Only enable query when goalId is valid
    enabled: Boolean(goalId && goalId.length > 0),
  });
}
