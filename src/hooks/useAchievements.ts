'use client';

/**
 * Hook for fetching achievements data.
 *
 * Wraps the getAchievements service with TanStack Query caching.
 *
 * @see Requirement 3.1: Achievements Gallery
 * @see design.md - Hook Layer section
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getAchievements } from '@/src/services/growth';

export function useAchievements() {
  return useQuery({
    queryKey: queryKeys.growthAchievements(),
    queryFn: ({ signal }) => getAchievements(signal),
    staleTime: STALE_TIMES.GROWTH_ACHIEVEMENTS,
  });
}
