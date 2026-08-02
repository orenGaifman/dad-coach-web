/**
 * Notification type definitions for the Father Workspace.
 *
 * These types model notifications and mark-read operations
 * for the Notifications section (WEB-SPEC-008).
 */

import type { BaseApiResponse, ISODateTime, PaginationMeta } from './common';

// ---------------------------------------------------------------------------
// Notification Types
// ---------------------------------------------------------------------------

/**
 * Notification type categories.
 */
export type NotificationType =
  | 'ACHIEVEMENT_EARNED'
  | 'BELT_LEVEL_UP'
  | 'STREAK_MILESTONE'
  | 'MISSION_ASSIGNED'
  | 'MISSION_REMINDER'
  | 'GOAL_PROGRESS'
  | 'COACHING_INSIGHT'
  | 'BIRTHDAY_REMINDER'
  | 'SYSTEM_MESSAGE';

/**
 * Notification priority levels.
 * @see Requirement 12.1: Priority display
 */
export type NotificationPriority = 'HIGH' | 'MEDIUM' | 'LOW';

// ---------------------------------------------------------------------------
// Notification Item
// ---------------------------------------------------------------------------

/**
 * Single notification item.
 * @see Requirement 12.1: Notification display fields
 */
export interface Notification {
  /** Unique notification identifier */
  notification_id: string;
  /** Notification type */
  type: NotificationType;
  /** Notification title */
  title: string;
  /** Notification body/message */
  body: string;
  /** When the notification was created */
  created_at: ISODateTime;
  /** When the notification was read (null if unread) */
  read_at: ISODateTime | null;
  /** Notification priority */
  priority: NotificationPriority;
  /** Optional action URL (deep link within app) */
  action_url?: string;
  /** Related entity (achievement, mission, etc.) */
  related_entity?: {
    type: 'ACHIEVEMENT' | 'MISSION' | 'GOAL' | 'CHILD' | 'CONVERSATION';
    id: string;
    name?: string;
  };
  /** Icon key for notification display (maps to icon asset) */
  icon_key?: string;
}

// ---------------------------------------------------------------------------
// Notification Responses
// ---------------------------------------------------------------------------

/**
 * Response from GET /api/v1/workspace/notifications
 * @see Requirement 12.1: Notifications list
 */
export interface NotificationsResponse extends BaseApiResponse {
  /** List of notifications */
  notifications: Notification[];
  /** Pagination metadata */
  pagination: PaginationMeta;
  /** Total unread count (for badge) */
  unread_count: number;
}

/**
 * Query parameters for notifications list.
 */
export interface NotificationsQueryParams {
  /** Number of notifications to return (default 20) */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Filter by read status */
  unread_only?: boolean;
  /** Filter by priority */
  priority?: NotificationPriority;
  /** Filter by type */
  type?: NotificationType;
}

// ---------------------------------------------------------------------------
// Mark Read Operations
// ---------------------------------------------------------------------------

/**
 * Request body for POST /api/v1/workspace/notifications/mark-read
 * @see Requirement 12.2: Mark-as-read (individual)
 */
export interface MarkNotificationsReadRequest {
  /** List of notification IDs to mark as read */
  notification_ids: string[];
}

/**
 * Response from mark-read operations.
 */
export interface MarkNotificationsReadResponse {
  /** Whether the operation succeeded */
  success: boolean;
  /** Number of notifications marked as read */
  marked_count: number;
  /** Updated unread count */
  updated_unread_count: number;
}

/**
 * Response from POST /api/v1/workspace/notifications/mark-all-read
 * @see Requirement 12.2: Mark-as-read (bulk)
 */
export interface MarkAllNotificationsReadResponse {
  /** Whether the operation succeeded */
  success: boolean;
  /** Number of notifications marked as read */
  marked_count: number;
  /** Updated unread count (should be 0) */
  updated_unread_count: number;
}

// ---------------------------------------------------------------------------
// Notification Badge
// ---------------------------------------------------------------------------

/**
 * Notification badge state for navigation display.
 * @see Requirements 12.3, 12.4: Badge display
 */
export interface NotificationBadgeState {
  /** Number of unread notifications */
  count: number;
  /** Whether to show as dot (true) or count (false) */
  showAsDot: boolean;
}
