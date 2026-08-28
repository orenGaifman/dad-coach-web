/**
 * Workspace summary type definitions for the Father Workspace.
 *
 * These types model the main dashboard summary endpoint and
 * profile-related data (WEB-SPEC-008).
 */

import type {
  BaseApiResponse,
  DegradedSection,
  ISODateTime,
  TimeString,
  CoachingStyle,
  SupportedLanguage,
  NotificationFrequency,
} from './common';
import type { BeltLevel } from './growth';

// Re-export shared types for consumers of workspace types
export type { CoachingStyle, SupportedLanguage, NotificationFrequency } from './common';

// ---------------------------------------------------------------------------
// Coaching Phase
// ---------------------------------------------------------------------------

/**
 * Father's current coaching phase.
 */
export type CoachingPhase =
  | 'ONBOARDING'
  | 'EARLY_ENGAGEMENT'
  | 'ACTIVE_COACHING'
  | 'ESTABLISHED'
  | 'MASTERY';

// ---------------------------------------------------------------------------
// Active Mission (summary)
// ---------------------------------------------------------------------------

/**
 * Mission category for display purposes.
 */
export type MissionCategory =
  | 'QUALITY_TIME'
  | 'LISTENING'
  | 'PLAY'
  | 'CONVERSATION'
  | 'ROUTINE'
  | 'TEACHING'
  | 'BONDING';

/**
 * Active mission summary for dashboard display.
 */
export interface ActiveMissionSummary {
  /** Mission identifier */
  mission_id: string;
  /** Mission title */
  title: string;
  /** Mission category (for icon selection) */
  category: MissionCategory;
  /** Child this mission is for */
  child_name: string;
  /** Days remaining to complete (null if no deadline) */
  days_remaining: number | null;
  /** Progress (completed steps / total steps) */
  completed_steps: number;
  /** Total steps in the mission */
  total_steps: number;
}

// ---------------------------------------------------------------------------
// Workspace Summary
// ---------------------------------------------------------------------------

/**
 * Response from GET /api/v1/workspace/summary
 *
 * This is the main dashboard endpoint that provides an overview
 * of the father's current state across all sections.
 *
 * @see Requirement 1: Workspace Summary Dashboard
 */
export interface WorkspaceSummaryResponse extends BaseApiResponse {
  /** Father's display name */
  father_display_name: string;

  /** Current coaching phase */
  coaching_phase: CoachingPhase;

  /** Current belt level */
  current_belt: BeltLevel;

  /** Current growth score */
  growth_score: number;

  /** Number of active (non-archived) children */
  active_children_count: number;

  /** Number of active goals */
  active_goals_count: number;

  /** Current streak in days */
  current_streak_days: number;

  /** Active mission (null if no active mission) */
  active_mission: ActiveMissionSummary | null;

  /** Timestamp of last coaching conversation (null if never) */
  last_conversation_timestamp: ISODateTime | null;

  /** Count of unread notifications */
  unread_notifications_count: number;

  /** Sections that failed to load (for partial degradation handling) */
  degraded_sections: DegradedSection[];
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

/**
 * Response from GET /api/v1/workspace/profile
 * @see Requirement 13.1: Profile display
 */
export interface ProfileResponse extends BaseApiResponse {
  /** Father identifier */
  father_id: number;

  /** Display name */
  display_name: string;

  /** Phone number (should be masked for display: +1****1234) */
  phone_number: string;

  /** Email address (optional) */
  email?: string;

  /** Timezone (IANA format, e.g., "Asia/Jerusalem") */
  timezone: string;

  /** Preferred coaching style */
  coaching_style: CoachingStyle;

  /** Preferred time for coaching messages */
  preferred_coaching_time: TimeString;

  /** Notification frequency preference */
  notification_frequency: NotificationFrequency;

  /** Quiet hours start time */
  quiet_hours_start: TimeString;

  /** Quiet hours end time */
  quiet_hours_end: TimeString;

  /** Language preference */
  language: SupportedLanguage;

  /** Current coaching phase */
  coaching_phase: CoachingPhase;

  /** When the father was activated */
  activated_at: ISODateTime;

  /** Days since activation (computed) */
  days_since_activation: number;
}

/**
 * Request body for profile update (via Application API).
 * @see Requirement 13.2: Profile edit fields
 */
export interface ProfileUpdateRequest {
  /** Updated display name */
  display_name?: string;
  /** Updated timezone */
  timezone?: string;
  /** Updated email */
  email?: string;
}

/**
 * Response from profile update.
 */
export interface ProfileUpdateResponse {
  success: boolean;
  message?: string;
}

// ---------------------------------------------------------------------------
// Preferences
// ---------------------------------------------------------------------------

/**
 * Request body for preferences update.
 * @see Requirement 15.1: Preferences edit fields
 */
export interface PreferencesUpdateRequest {
  /** Updated coaching style */
  coaching_style?: CoachingStyle;
  /** Updated preferred coaching time */
  preferred_coaching_time?: TimeString;
  /** Updated notification frequency */
  notification_frequency?: NotificationFrequency;
  /** Updated quiet hours start */
  quiet_hours_start?: TimeString;
  /** Updated quiet hours end */
  quiet_hours_end?: TimeString;
}

/**
 * Response from preferences update.
 */
export interface PreferencesUpdateResponse {
  success: boolean;
  message?: string;
}
