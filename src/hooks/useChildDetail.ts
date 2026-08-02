'use client';

/**
 * Hook for fetching detailed information for a single child.
 *
 * Wraps the getChildDetail service with TanStack Query caching.
 * The query is only enabled when a valid childId is provided.
 *
 * @see Requirement 6.1: Child Detail displays all child information
 * @see design.md - Hook Layer section
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getChildDetail } from '@/src/services/family';

/**
 * Fetches detailed information for a specific child.
 *
 * @param childId - The ID of the child to fetch details for
 * @returns TanStack Query result with child detail data
 */
export function useChildDetail(childId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.child(childId !== undefined ? String(childId) : ''),
    queryFn: ({ signal }) => getChildDetail(childId!, signal),
    staleTime: STALE_TIMES.CHILDREN,
    // Only enable query when childId is valid
    enabled: childId !== undefined && childId > 0,
  });
}
