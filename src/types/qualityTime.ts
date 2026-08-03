/**
 * Quality Time type definitions for the Father Workspace.
 *
 * These types model Quality Time scheduling, tracking, belt progression,
 * and activity suggestions for the deterministic workflow engine.
 *
 * @see Requirement 13.1: Frontend types for Quality Time data
 */

import type { ISODateTime } from './common';
import type { BeltLevel } from './growth';

// ---------------------------------------------------------------------------
// Quality Time Status
// ---------------------------------------------------------------------------

/**
 * Status of a scheduled Quality Time session.
 */
export type QualityTimeStatus =
  | 'SCHEDULED'  // Session is scheduled but not yet completed
  | 'COMPLETED'  // Session was completed successfully
  | 'MISSED'     // Session was not completed (time passed)
  | 'CANCELLED'; // Session was cancelled by the father

// ---------------------------------------------------------------------------
// Workflow State
// ---------------------------------------------------------------------------

/**
 * Current state in the deterministic workflow engine.
 * Determines which screen/interaction the user sees.
 */
export type WorkflowState =
  | 'WELCOME'                // Initial welcome screen
  | 'SCHEDULE_QUALITY_TIME'  // Scheduling a new Quality Time session
  | 'WAITING'                // Waiting for scheduled Quality Time
  | 'QUALITY_TIME_FOLLOW_UP' // Follow-up after a Quality Time session
  | 'ACTIVITY_IDEAS'         // Showing activity suggestions
  | 'DASHBOARD';             // Main dashboard view

// ---------------------------------------------------------------------------
// Quality Time Session
// ---------------------------------------------------------------------------

/**
 * A Quality Time session scheduled by a father with a child.
 */
export interface QualityTime {
  /** Unique identifier for the Quality Time session */
  id: string;
  /** Father who scheduled this Quality Time */
  father_id: number;
  /** Child this Quality Time is with */
  child_id: number;
  /** Child's display name */
  child_name: string;
  /** Scheduled start time (ISO 8601) */
  scheduled_start: ISODateTime;
  /** Scheduled end time (ISO 8601) */
  scheduled_end: ISODateTime;
  /** Current status of the session */
  status: QualityTimeStatus;
  /** Notes from the father after completion (optional) */
  completion_notes?: string;
  /** When the session was marked completed (optional) */
  completed_at?: ISODateTime;
}

// ---------------------------------------------------------------------------
// Available Slots
// ---------------------------------------------------------------------------

/**
 * An available time slot for scheduling Quality Time.
 */
export interface AvailableSlot {
  /** Start time of the slot (ISO 8601) */
  start_time: ISODateTime;
  /** End time of the slot (ISO 8601) */
  end_time: ISODateTime;
  /** Duration of the slot in minutes */
  duration_minutes: number;
}

// ---------------------------------------------------------------------------
// Belt Progress
// ---------------------------------------------------------------------------

/**
 * Father's progress in the belt system based on Quality Time completions.
 */
export interface BeltProgress {
  /** Current belt level */
  current_belt: BeltLevel;
  /** Next belt level (null if at BLACK belt) */
  next_belt: BeltLevel | null;
  /** Points needed to reach the next belt (null if at BLACK belt) */
  points_to_next_belt: number | null;
  /** Progress percentage toward the next belt (0-100, null if at BLACK belt) */
  progress_percentage: number | null;
  /** Total number of Quality Time sessions completed */
  total_quality_times_completed: number;
}

// ---------------------------------------------------------------------------
// Workspace Summary
// ---------------------------------------------------------------------------

/**
 * Summary of the father's workspace state for the workflow engine.
 * Aligns with backend WorkspaceSummaryDto.
 */
export interface WorkspaceSummary {
  /** Father's unique identifier */
  father_id: number;
  /** Father's display name */
  father_display_name: string;
  /** Current workflow state */
  current_workflow_state: WorkflowState;
  /** Current belt level */
  current_belt: BeltLevel;
  /** Total growth score */
  growth_score: number;
  /** Current streak in days */
  current_streak_days: number;
  /** Next scheduled Quality Time (null if none) */
  next_quality_time: QualityTime | null;
  /** Most recent completed Quality Time (null if none) */
  last_completed_quality_time: QualityTime | null;
  /** Number of active children */
  active_children_count: number;
}

// ---------------------------------------------------------------------------
// Schedule Request/Response
// ---------------------------------------------------------------------------

/**
 * Request body for scheduling a new Quality Time session.
 */
export interface ScheduleRequest {
  /** Child to schedule Quality Time with */
  child_id: number;
  /** Desired start time (ISO 8601) */
  start_time: ISODateTime;
  /** Duration in minutes */
  duration_minutes: number;
}

/**
 * Response from scheduling a Quality Time session.
 */
export interface ScheduleResponse {
  /** Created Quality Time session ID */
  quality_time_id: string;
  /** Associated calendar event ID (if calendar integration enabled) */
  calendar_event_id?: string;
  /** Child's display name */
  child_name: string;
  /** Scheduled start time (ISO 8601) */
  start_time: ISODateTime;
  /** Scheduled end time (ISO 8601) */
  end_time: ISODateTime;
  /** Initial status (typically SCHEDULED) */
  status: QualityTimeStatus;
}

// ---------------------------------------------------------------------------
// Activity Ideas
// ---------------------------------------------------------------------------

/**
 * A suggested activity for Quality Time.
 */
export interface ActivityIdea {
  /** Activity title */
  title: string;
  /** Detailed description of the activity */
  description: string;
  /** Estimated duration in minutes */
  duration_minutes: number;
  /** Whether this activity is suitable for indoors */
  indoor: boolean;
}

// ---------------------------------------------------------------------------
// Available Slots Response
// ---------------------------------------------------------------------------

/**
 * Response from GET /api/v1/quality-time/available-slots
 */
export interface AvailableSlotsResponse {
  /** List of available time slots */
  slots: AvailableSlot[];
  /** Whether calendar integration is connected */
  calendar_connected: boolean;
  /** Father's timezone (IANA format) */
  timezone: string;
}

// ---------------------------------------------------------------------------
// Complete Request/Response
// ---------------------------------------------------------------------------

/**
 * Request body for completing a Quality Time session.
 */
export interface CompleteRequest {
  /** Optional notes about the session */
  notes?: string;
}

/**
 * Response from completing a Quality Time session.
 */
export interface CompleteResponse {
  /** Completed Quality Time session ID */
  quality_time_id: string;
  /** Updated status (typically COMPLETED) */
  status: QualityTimeStatus;
  /** Whether the streak was updated */
  streak_updated: boolean;
  /** New streak value after completion */
  new_streak: number;
  /** Belt earned from this completion (null if no belt change) */
  belt_earned: BeltLevel | null;
  /** Points awarded for this completion */
  points_awarded: number;
}

/**
 * Response from fetching activity ideas.
 */
export interface ActivityIdeasResponse {
  /** Array of suggested activities */
  ideas: ActivityIdea[];
}
