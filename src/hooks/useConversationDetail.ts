'use client';

/**
 * @deprecated This hook is deprecated as part of the Deterministic Workflow Engine migration.
 *
 * DEPRECATION NOTICE (Deterministic Workflow Engine - Requirement 13.5):
 * =====================================================================
 * This hook fetches conversation details from WhatsApp history, which is
 * no longer part of the core product experience. The deterministic workflow
 * engine focuses on:
 * - Quality Time scheduling (not AI-driven conversations)
 * - Progress tracking (belt, streak, achievements)
 * - Simple, guided flows (not open-ended chat)
 *
 * The product should feel like a GUIDED WORKFLOW, not an open-ended chat.
 * Memory/conversation history displays are not included in the new paradigm.
 *
 * This hook will be removed in a future release. Do not use in new code.
 * Use useWorkspaceSummary for dashboard data instead.
 *
 * @see deterministic-workflow-engine/requirements.md - Requirement 13.5
 * @see design.md - Architecture Philosophy: "AI is NOT the orchestrator"
 *
 * Original purpose:
 * Hook for fetching detailed information about a single coaching conversation.
 * Wraps the getConversationDetail service with TanStack Query caching.
 * The query is only enabled when a valid conversationId is provided.
 * Note: Returns summary view only, no full transcript per Requirement 9.2.
 * @see Requirement 9.4: Conversation Detail displays summary without transcript
 * @see design.md - Hook Layer section
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getConversationDetail } from '@/src/services/coaching';

/**
 * @deprecated Use useWorkspaceSummary instead. Conversation history display
 * is not part of the deterministic workflow paradigm.
 *
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
