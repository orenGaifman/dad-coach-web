/**
 * Coaching-related type definitions for the Father Workspace.
 *
 * These types model activity logging for the Coaching section (WEB-SPEC-008).
 *
 * @see design.md - Workspace Types
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
