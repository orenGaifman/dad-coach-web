'use client';

/**
 * Hook for fetching the father's profile data.
 *
 * Wraps the getProfile service with TanStack Query caching.
 * Uses staleTime of 0 to always fetch fresh data on each view.
 *
 * @see Requirement 13.1: Profile view displays name, phone, timezone, etc.
 * @see design.md - Hook Layer section
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getProfile } from '@/src/services/workspace';

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile(),
    queryFn: ({ signal }) => getProfile(signal),
    staleTime: STALE_TIMES.PROFILE,
  });
}
