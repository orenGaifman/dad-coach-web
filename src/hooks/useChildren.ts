'use client';

/**
 * Hook for fetching all children overview data.
 *
 * Wraps the getChildren service with TanStack Query caching.
 *
 * @see Requirement 5.1: Children Overview displays per child info
 * @see design.md - Hook Layer section
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getChildren } from '@/src/services/family';

export function useChildren() {
  return useQuery({
    queryKey: queryKeys.children(),
    queryFn: ({ signal }) => getChildren(signal),
    staleTime: STALE_TIMES.CHILDREN,
  });
}
