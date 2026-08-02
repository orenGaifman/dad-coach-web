/**
 * Coaching API service layer.
 *
 * Wraps conversations and activity logging endpoints using the shared apiClient.
 * Each function is typed against the coaching type definitions.
 *
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
// Conversations
// ---------------------------------------------------------------------------

/**
 * Fetch coaching conversation history.
 * GET /api/v1/workspace/conversations
 *
 * @see Requirement 9: Coaching History
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
 * Fetch details for a single conversation.
 * GET /api/v1/workspace/conversations/{conversationId}
 *
 * Note: Returns summary only, no full transcript per Requirement 9.2.
 *
 * @see Requirement 9.4: Conversation Detail
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
// Activity Logging
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
