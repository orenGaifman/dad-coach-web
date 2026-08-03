/**
 * Coaching-related type definitions for the Father Workspace.
 *
 * These types model conversations, activity logging, and
 * coaching history for the Coaching section (WEB-SPEC-008).
 *
 * DEPRECATION NOTICE (Deterministic Workflow Engine - Requirement 13.5):
 * =====================================================================
 * Conversation-related types (ConversationType, ConversationStatus, ConversationOverview,
 * ConversationDetail, etc.) are DEPRECATED. The deterministic workflow engine does not include:
 * - Free-form coaching chat interface
 * - Memory or conversation history displays
 * - AI-generated coaching tips
 *
 * Activity logging types remain ACTIVE and are aligned with the deterministic workflow
 * for tracking Quality Time completions.
 *
 * @see deterministic-workflow-engine/requirements.md - Requirement 13.5
 */

import type { BaseApiResponse, ISODateTime, ISODate, PaginationMeta } from './common';

// ---------------------------------------------------------------------------
// Activity Types
// ---------------------------------------------------------------------------

/**
 * Positive activity types.
 * @see Requirement 11.1: Activity type options
 */
export type PositiveActivityType =
  | 'PRAISE'
  | 'SHARED_ACTIVITY'
  | 'TEACHING_MOMENT'
  | 'QUALITY_CONVERSATION'
  | 'OTHER';

/**
 * All activity types (for logging).
 */
export type ActivityType = 'QUALITY_TIME' | PositiveActivityType;

// ---------------------------------------------------------------------------
// Activity Logging
// ---------------------------------------------------------------------------

/**
 * Request body for POST /api/v1/workspace/activity/quality-time
 * @see Requirement 10.1: Quality time form fields
 */
export interface LogQualityTimeRequest {
  /** Child ID (required) */
  child_id: number;
  /** Duration in minutes (optional, 15-480 range) */
  duration_minutes?: number;
  /** Description (optional, max 200 chars) */
  description?: string;
  /** Activity date (optional, defaults to today, not future, not >7 days past) */
  activity_date?: ISODate;
}

/**
 * Request body for POST /api/v1/workspace/activity/positive
 * @see Requirement 11.1: Positive activity form fields
 */
export interface LogPositiveActivityRequest {
  /** Activity type (required) */
  activity_type: PositiveActivityType;
  /** Child ID (optional) */
  child_id?: number;
  /** Description (optional, max 200 chars) */
  description?: string;
  /** Activity date (optional, defaults to today) */
  activity_date?: ISODate;
}

/**
 * Response from activity logging endpoints.
 * @see Requirements 10.3, 11.3: Activity confirmation
 */
export interface ActivityResponse extends BaseApiResponse {
  /** Whether the activity was logged successfully */
  success: boolean;
  /** Unique identifier for the logged activity */
  activity_id: string;
  /** Points awarded for this activity */
  points_awarded: number;
  /** Updated streak information */
  streak_impact: {
    /** Current streak after logging */
    current_streak_days: number;
    /** Whether this activity extended the streak */
    streak_extended: boolean;
    /** Whether this activity started a new streak */
    new_streak_started: boolean;
  };
  /** Encouraging message to display */
  encouragement_message: string;
  /** Updated total score */
  updated_total_score: number;
}

/**
 * Activity rate limit error response.
 * @see Requirements 10.4, 11.4: Rate limit handling
 */
export interface ActivityRateLimitError {
  /** Error code */
  code: 'DAILY_LIMIT_REACHED';
  /** Human-readable message */
  message: string;
  /** Activity type that hit the limit */
  activity_type: 'QUALITY_TIME' | 'POSITIVE_ACTIVITY';
  /** Maximum allowed per day */
  daily_limit: number;
  /** Number already logged today */
  logged_today: number;
}

/**
 * Activity duplicate error response.
 * @see Requirement 10.5: Duplicate detection
 */
export interface ActivityDuplicateError {
  /** Error code */
  code: 'DUPLICATE_ACTIVITY';
  /** Human-readable message */
  message: string;
  /** The existing activity that matches */
  existing_activity: {
    activity_id: string;
    logged_at: ISODateTime;
  };
}

// ---------------------------------------------------------------------------
// Conversations (DEPRECATED - Deterministic Workflow Engine)
// ---------------------------------------------------------------------------

/**
 * @deprecated Conversation types are deprecated as part of the Deterministic Workflow Engine migration.
 * Conversation type.
 */
export type ConversationType =
  | 'COACHING_SESSION'
  | 'CHECK_IN'
  | 'MISSION_GUIDANCE'
  | 'CELEBRATION'
  | 'SUPPORT';

/**
 * @deprecated Conversation types are deprecated as part of the Deterministic Workflow Engine migration.
 * Conversation status.
 */
export type ConversationStatus =
  | 'ACTIVE'
  | 'COMPLETED'
  | 'PAUSED';

/**
 * @deprecated Conversation types are deprecated as part of the Deterministic Workflow Engine migration.
 * Conversation overview item for the history list.
 * @see Requirement 9.1: Coaching History display (DEPRECATED)
 */
export interface ConversationOverview {
  /** Conversation identifier */
  conversation_id: string;
  /** Conversation type */
  type: ConversationType;
  /** When the conversation started */
  started_at: ISODateTime;
  /** When the conversation ended (null if ongoing) */
  ended_at: ISODateTime | null;
  /** Number of messages exchanged */
  message_count: number;
  /** Summary of the conversation (AI-generated) */
  summary: string;
  /** Conversation status */
  status: ConversationStatus;
  /** Related child (if conversation was child-specific) */
  related_child?: {
    child_id: number;
    name: string;
  };
}

/**
 * @deprecated Conversation types are deprecated as part of the Deterministic Workflow Engine migration.
 * Response from GET /api/v1/workspace/conversations
 * @see Requirement 9: Coaching History (DEPRECATED)
 */
export interface ConversationsResponse extends BaseApiResponse {
  /** List of conversations */
  conversations: ConversationOverview[];
  /** Pagination metadata */
  pagination: PaginationMeta;
}

/**
 * @deprecated Conversation types are deprecated as part of the Deterministic Workflow Engine migration.
 * Query parameters for conversations list.
 */
export interface ConversationsQueryParams {
  /** Number of conversations to return (default 10, max 50) */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Filter by conversation type */
  type?: ConversationType;
}

/**
 * @deprecated Conversation types are deprecated as part of the Deterministic Workflow Engine migration.
 * Conversation insight from the AI summary.
 */
export interface ConversationInsight {
  /** Insight type */
  type: 'STRENGTH' | 'SUGGESTION' | 'OBSERVATION';
  /** Insight text */
  text: string;
}

/**
 * @deprecated Conversation types are deprecated as part of the Deterministic Workflow Engine migration.
 * Key topic discussed in the conversation.
 */
export interface ConversationTopic {
  /** Topic name */
  topic: string;
  /** Related child (if applicable) */
  child_name?: string;
}

/**
 * @deprecated Conversation types are deprecated as part of the Deterministic Workflow Engine migration.
 * Detailed conversation view.
 * @see Requirement 9.4: Conversation detail (summary only, no transcript) (DEPRECATED)
 */
export interface ConversationDetail {
  /** Conversation identifier */
  conversation_id: string;
  /** Conversation type */
  type: ConversationType;
  /** When the conversation started */
  started_at: ISODateTime;
  /** When the conversation ended */
  ended_at: ISODateTime | null;
  /** Number of messages */
  message_count: number;
  /** Conversation status */
  status: ConversationStatus;
  /** Extended summary */
  summary: string;
  /** Key topics discussed */
  key_topics: ConversationTopic[];
  /** Insights from the conversation */
  insights: ConversationInsight[];
  /** Related child (if applicable) */
  related_child?: {
    child_id: number;
    name: string;
  };
  /** Related mission (if applicable) */
  related_mission?: {
    mission_id: string;
    title: string;
  };
  /**
   * NOTE: Full message transcript is NOT included per Requirement 9.2
   * Only metadata and summary are exposed.
   */
}

/**
 * @deprecated Conversation types are deprecated as part of the Deterministic Workflow Engine migration.
 * Response from GET /api/v1/workspace/conversations/{conversationId}
 */
export interface ConversationDetailResponse extends BaseApiResponse {
  /** Conversation details */
  conversation: ConversationDetail;
}

// ---------------------------------------------------------------------------
// Activity Report (for displaying logged activities)
// ---------------------------------------------------------------------------

/**
 * Logged activity for display.
 */
export interface ActivityReport {
  /** Activity identifier */
  activity_id: string;
  /** Activity type */
  activity_type: ActivityType;
  /** Child (if specified) */
  child?: {
    child_id: number;
    name: string;
  };
  /** Duration in minutes (for quality time) */
  duration_minutes?: number;
  /** Description (if provided) */
  description?: string;
  /** Date of the activity */
  activity_date: ISODate;
  /** When the activity was logged */
  logged_at: ISODateTime;
  /** Points awarded */
  points_awarded: number;
}

/**
 * Response listing recent activities.
 */
export interface RecentActivitiesResponse extends BaseApiResponse {
  /** List of recent activities */
  activities: ActivityReport[];
  /** Pagination metadata */
  pagination: PaginationMeta;
}
