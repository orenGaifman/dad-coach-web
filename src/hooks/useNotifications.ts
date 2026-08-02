'use client';

/**
 * Hook for fetching notifications list.
 *
 * Wraps the getNotifications service with TanStack Query caching.
 * Uses a shorter stale time since notifications need more frequent updates.
 *
 * @see Requirement 12.1: Notifications view displays paginated list
 * @see design.md - Hook Layer section
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getNotifications } from '@/src/services/notifications';

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: ({ signal }) => getNotifications(undefined, signal),
    staleTime: STALE_TIMES.NOTIFICATIONS,
  });
}
