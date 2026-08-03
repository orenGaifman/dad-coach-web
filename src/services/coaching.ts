/**
 * Coaching API service layer.
 *
 * Wraps conversations and activity logging endpoints using the shared apiClient.
 * Each function is typed against the coaching type definitions.
 *
 * DEPRECATION NOTICE (Deterministic Workflow Engine - Requirement 13.5):
 * =====================================================================
 * Conversation-related functions (getConversations, getConversationDetail) are
 * DEPRECATED. The deterministic workflow engine does not include:
 * - Free-form coaching chat interface
 * - Memory or conversation history displays
 * - AI-generated coaching tips
 *
 * Activity logging functions (logQualityTime, logPositiveActivity) remain
 * ACTIVE and are aligned with the deterministic workflow for tracking
 * Quality Time completions.
 *
 * @see deterministic-workflow-engine/requirements.md - Requirement 13.5
 * @see design.md - API Service Layer section
 */

import { apiClient } from '@/src/lib/api-client';
import type {
  ConversationsResponse,
  ConversationsQueryParams,
  ConversationDetailResponse,
  LogQualityTimeRequest,
  LogPositiveActivityRequest,
  ActivityResponse,
} from '@/src/types/coaching';

// ---------------------------------------------------------------------------
// Conversations (DEPRECATED - Deterministic Workflow Engine)
// ---------------------------------------------------------------------------

/**
 * @deprecated This function is deprecated as part of the Deterministic Workflow Engine migration.
 *
 * Conversation history display is not part of the deterministic workflow paradigm.
 * The product focuses on: Quality Time scheduling, progress tracking, and celebrations.
 *
 * This function will be removed in a future release.
 *
 * Fetch coaching conversation history.
 * GET /api/v1/workspace/conversations
 *
 * @see Requirement 9: Coaching History (DEPRECATED)
 */
export async function getConversations(
  params?: ConversationsQueryParams,
  signal?: AbortSignal
): Promise<ConversationsResponse> {
  // Convert query params to string params
  const queryParams: Record<string, string> = {};
  if (params?.limit !== undefined) {
    queryParams.limit = String(params.limit);
  }
  if (params?.offset !== undefined) {
    queryParams.offset = String(params.offset);
  }
  if (params?.type) {
    queryParams.type = params.type;
  }

  return apiClient.get<ConversationsResponse>('/workspace/conversations', queryParams, { signal });
}

/**
 * @deprecated This function is deprecated as part of the Deterministic Workflow Engine migration.
 *
 * Conversation history display is not part of the deterministic workflow paradigm.
 * The product focuses on: Quality Time scheduling, progress tracking, and celebrations.
 *
 * This function will be removed in a future release.
 *
 * Fetch details for a single conversation.
 * GET /api/v1/workspace/conversations/{conversationId}
 *
 * Note: Returns summary only, no full transcript per Requirement 9.2.
 *
 * @see Requirement 9.4: Conversation Detail (DEPRECATED)
 */
export async function getConversationDetail(
  conversationId: string,
  signal?: AbortSignal
): Promise<ConversationDetailResponse> {
  return apiClient.get<ConversationDetailResponse>(
    `/workspace/conversations/${encodeURIComponent(conversationId)}`,
    { signal }
  );
}

// ---------------------------------------------------------------------------
// Activity Logging (ACTIVE - Aligned with Deterministic Workflow)
// ---------------------------------------------------------------------------

/**
 * Log quality time spent with a child.
 * POST /api/v1/workspace/activity/quality-time
 *
 * @see Requirement 10: Log Quality Time
 */
export async function logQualityTime(
  data: LogQualityTimeRequest
): Promise<ActivityResponse> {
  return apiClient.post<ActivityResponse>('/workspace/activity/quality-time', data);
}

/**
 * Log a positive parenting activity.
 * POST /api/v1/workspace/activity/positive
 *
 * @see Requirement 11: Log Positive Activity
 */
export async function logPositiveActivity(
  data: LogPositiveActivityRequest
): Promise<ActivityResponse> {
  return apiClient.post<ActivityResponse>('/workspace/activity/positive', data);
}
