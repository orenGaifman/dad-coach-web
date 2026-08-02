'use client';

/**
 * Hook for fetching detailed information about a single coaching conversation.
 *
 * Wraps the getConversationDetail service with TanStack Query caching.
 * The query is only enabled when a valid conversationId is provided.
 *
 * Note: Returns summary view only, no full transcript per Requirement 9.2.
 *
 * @see Requirement 9.4: Conversation Detail displays summary without transcript
 * @see design.md - Hook Layer section
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getConversationDetail } from '@/src/services/coaching';

/**
 * Fetches detailed information for a specific conversation.
 *
 * @param conversationId - The ID of the conversation to fetch details for
 * @returns TanStack Query result with conversation detail data
 */
export function useConversationDetail(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.conversation(conversationId ?? ''),
    queryFn: ({ signal }) => getConversationDetail(conversationId!, signal),
    staleTime: STALE_TIMES.CONVERSATIONS,
    // Only enable query when conversationId is valid
    enabled: Boolean(conversationId && conversationId.length > 0),
  });
}
