'use client';

/**
 * Hook for fetching all goals with optional filtering.
 *
 * Wraps the getGoals service with TanStack Query caching.
 *
 * @see Requirement 7.1: Goals Overview displays per goal info
 * @see Requirement 7.3: Goals view supports filtering by status, category, child
 * @see design.md - Hook Layer section
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getGoals } from '@/src/services/family';

export function useGoals() {
  return useQuery({
    queryKey: queryKeys.goals(),
    queryFn: ({ signal }) => getGoals(undefined, signal),
    staleTime: STALE_TIMES.GOALS,
  });
}
