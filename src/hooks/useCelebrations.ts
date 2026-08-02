'use client';

/**
 * Hook for fetching undisplayed celebration events.
 *
 * Wraps the getCelebrations service with TanStack Query caching.
 * Always fetches fresh data (staleTime: 0) to ensure new celebrations
 * are not missed.
 *
 * @see Requirement 16.1: Celebration Events
 * @see design.md - Hook Layer section
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getCelebrations } from '@/src/services/growth';

export function useCelebrations() {
  return useQuery({
    queryKey: queryKeys.celebrations(),
    queryFn: ({ signal }) => getCelebrations(signal),
    staleTime: STALE_TIMES.CELEBRATIONS,
  });
}
