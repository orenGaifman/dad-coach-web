'use client';

/**
 * @deprecated This hook is deprecated as part of the Deterministic Workflow Engine migration.
 *
 * DEPRECATION NOTICE (Deterministic Workflow Engine - Requirement 13.5):
 * =====================================================================
 * This hook fetches coaching conversation history from WhatsApp, which is
 * no longer part of the core product experience. The deterministic workflow
 * engine focuses on:
 * - Quality Time scheduling (not AI-driven conversations)
 * - Progress tracking (belt, streak, achievements)
 * - Simple, guided flows (not open-ended chat)
 *
 * The product should feel like a GUIDED WORKFLOW, not an open-ended chat.
 * AI is minimized to: activity recommendations, encouragement, and celebrations.
 *
 * This hook will be removed in a future release. Do not use in new code.
 * Use useWorkspaceSummary for dashboard data instead.
 *
 * @see deterministic-workflow-engine/requirements.md - Requirement 13.5
 * @see design.md - Architecture Philosophy: "AI is NOT the orchestrator"
 *
 * Original purpose:
 * Hook for fetching coaching conversation history.
 * Wraps the getConversations service with TanStack Query caching.
 * @see Requirement 9.1: Coaching History displays recent conversations
 * @see design.md - Hook Layer section
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getConversations } from '@/src/services/coaching';

/**
 * @deprecated Use useWorkspaceSummary instead. Conversation history display
 * is not part of the deterministic workflow paradigm.
 */
export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations(),
    queryFn: ({ signal }) => getConversations(undefined, signal),
    staleTime: STALE_TIMES.CONVERSATIONS,
  });
}
