'use client';

/**
 * Hook for fetching belt progression data.
 *
 * Wraps the getBeltProgression service with TanStack Query caching.
 *
 * @see Requirement 2.1: Belt Progression Display
 * @see design.md - Hook Layer section
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getBeltProgression } from '@/src/services/growth';

export function useBeltProgression() {
  return useQuery({
    queryKey: queryKeys.growthBelt(),
    queryFn: ({ signal }) => getBeltProgression(signal),
    staleTime: STALE_TIMES.GROWTH_BELT,
  });
}
