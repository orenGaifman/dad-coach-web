'use client';

/**
 * Hook for fetching coaching conversation history.
 *
 * Wraps the getConversations service with TanStack Query caching.
 *
 * @see Requirement 9.1: Coaching History displays recent conversations
 * @see design.md - Hook Layer section
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getConversations } from '@/src/services/coaching';

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations(),
    queryFn: ({ signal }) => getConversations(undefined, signal),
    staleTime: STALE_TIMES.CONVERSATIONS,
  });
}
