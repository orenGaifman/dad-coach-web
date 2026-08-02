'use client';

/**
 * Hook for fetching streak data.
 *
 * Wraps the getStreak service with TanStack Query caching.
 *
 * @see Requirement 4.1: Streak Display
 * @see design.md - Hook Layer section
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getStreak } from '@/src/services/growth';

export function useStreak() {
  return useQuery({
    queryKey: queryKeys.growthStreak(),
    queryFn: ({ signal }) => getStreak(signal),
    staleTime: STALE_TIMES.GROWTH_STREAK,
  });
}
