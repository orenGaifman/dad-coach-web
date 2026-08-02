/**
 * Notifications API service layer.
 *
 * Wraps notification list and mark-read endpoints using the shared apiClient.
 * Each function is typed against the notifications type definitions.
 *
 * @see design.md - API Service Layer section
 */

import { apiClient } from '@/src/lib/api-client';
import type {
  NotificationsResponse,
  NotificationsQueryParams,
  MarkNotificationsReadRequest,
  MarkNotificationsReadResponse,
  MarkAllNotificationsReadResponse,
} from '@/src/types/notifications';

// ---------------------------------------------------------------------------
// Notifications List
// ---------------------------------------------------------------------------

/**
 * Fetch paginated notifications list.
 * GET /api/v1/workspace/notifications
 *
 * @see Requirement 12: Notifications
 */
export async function getNotifications(
  params?: NotificationsQueryParams,
  signal?: AbortSignal
): Promise<NotificationsResponse> {
  // Convert query params to string params
  const queryParams: Record<string, string> = {};
  if (params?.limit !== undefined) {
    queryParams.limit = String(params.limit);
  }
  if (params?.offset !== undefined) {
    queryParams.offset = String(params.offset);
  }
  if (params?.unread_only !== undefined) {
    queryParams.unread_only = String(params.unread_only);
  }
  if (params?.priority) {
    queryParams.priority = params.priority;
  }
  if (params?.type) {
    queryParams.type = params.type;
  }

  return apiClient.get<NotificationsResponse>('/workspace/notifications', queryParams, { signal });
}

// ---------------------------------------------------------------------------
// Mark Read Operations
// ---------------------------------------------------------------------------

/**
 * Mark specific notifications as read.
 * POST /api/v1/workspace/notifications/mark-read
 *
 * @see Requirement 12.2: Mark-as-read (individual)
 */
export async function markNotificationsRead(
  data: MarkNotificationsReadRequest
): Promise<MarkNotificationsReadResponse> {
  return apiClient.post<MarkNotificationsReadResponse>(
    '/workspace/notifications/mark-read',
    data
  );
}

/**
 * Mark all notifications as read.
 * POST /api/v1/workspace/notifications/mark-all-read
 *
 * @see Requirement 12.2: Mark-as-read (bulk)
 */
export async function markAllNotificationsRead(): Promise<MarkAllNotificationsReadResponse> {
  return apiClient.post<MarkAllNotificationsReadResponse>(
    '/workspace/notifications/mark-all-read',
    {}
  );
}
