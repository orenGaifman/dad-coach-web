/**
 * Dev Dashboard type definitions.
 *
 * These types model the debugging interfaces for the Dev Dashboard,
 * which provides real-time visibility into the WhatsApp workflow
 * conversation flow of the Dad Coach application.
 *
 * @see Requirements 1.1, 2.1, 3.1, 4.1
 */

// ---------------------------------------------------------------------------
// Father List Item
// ---------------------------------------------------------------------------

/**
 * Father list item for the searchable father dropdown.
 * @see Requirement 1.1: List All Fathers
 */
export interface DevFatherListItem {
  /** Father identifier */
  id: number;
  /** Father's display name (null if not set) */
  display_name: string | null;
  /** Father's phone number */
  phone: string;
  /** Father's status (e.g., ACTIVE, INACTIVE) */
  status: string;
  /** Current workflow state (e.g., WAITING, SCHEDULE_QUALITY_TIME) */
  current_workflow_state: string | null;
  /** Previous workflow state for context */
  previous_workflow_state: string | null;
  /** Current belt level */
  current_belt: string;
  /** Last interaction timestamp (ISO 8601) */
  last_interaction_at: string | null;
}

// ---------------------------------------------------------------------------
// Father State Details
// ---------------------------------------------------------------------------

/**
 * Father's workflow state information.
 * @see Requirement 2.1: Get Father State Details
 */
export interface DevWorkflowInfo {
  /** Current workflow state */
  current_state: string;
  /** Previous workflow state */
  previous_state: string | null;
  /** When the current state was entered (ISO 8601) */
  state_entered_at: string | null;
  /** When the father was welcomed (ISO 8601) */
  welcomed_at: string | null;
}

/**
 * Father's belt information.
 * @see Requirement 2.1: Get Father State Details
 */
export interface DevBeltInfo {
  /** Current belt level */
  current: string;
  /** Total quality times completed */
  total_quality_times_completed: number;
  /** Current streak in weeks */
  current_streak_weeks: number;
}

/**
 * Child information for dev dashboard.
 * @see Requirement 2.2: Children list in state details
 */
export interface DevChild {
  /** Child identifier */
  id: number;
  /** Child's name */
  name: string;
  /** Child's birth date (YYYY-MM-DD) */
  birth_date: string;
}

/**
 * Quality time entry for dev dashboard.
 * @see Requirement 2.3: Scheduled quality times in state details
 */
export interface DevQualityTime {
  /** Quality time identifier */
  id: string;
  /** Child's name */
  child_name: string;
  /** Scheduled start time (ISO 8601) */
  scheduled_start: string;
  /** Scheduled end time (ISO 8601) */
  scheduled_end: string;
  /** Quality time status (e.g., SCHEDULED, COMPLETED) */
  status: string;
}

/**
 * Complete father state details for debugging.
 * @see Requirement 2.1: Get Father State Details
 */
export interface DevFatherState {
  /** Father identifier */
  id: number;
  /** Father's display name (null if not set) */
  display_name: string | null;
  /** Father's phone number */
  phone: string;
  /** Father's status */
  status: string;
  /** Workflow state information */
  workflow: DevWorkflowInfo;
  /** Belt information */
  belt: DevBeltInfo;
  /** Father's children */
  children: DevChild[];
  /** Scheduled quality times */
  scheduled_quality_times: DevQualityTime[];
  /** Whether this is a partial response (some data failed to load) */
  _partial: boolean;
  /** Errors that occurred when loading data */
  _errors: string[];
}

// ---------------------------------------------------------------------------
// Message Log
// ---------------------------------------------------------------------------

/**
 * Message direction.
 */
export type DevMessageDirection = 'INBOUND' | 'OUTBOUND';

/**
 * Message log entry for the conversation view.
 * @see Requirement 3.1: Get Message Log
 */
export interface DevMessage {
  /** Message identifier */
  id: number;
  /** Message direction (INBOUND = from father, OUTBOUND = from bot) */
  direction: DevMessageDirection;
  /** Message content */
  content: string;
  /** When the message was created (ISO 8601) */
  created_at: string;
}

// ---------------------------------------------------------------------------
// State Transitions
// ---------------------------------------------------------------------------

/**
 * Workflow state transition log entry.
 * @see Requirement 4.1: Get State Transitions
 */
export interface DevTransition {
  /** Transition identifier */
  id: string;
  /** State transitioned from */
  from_state: string;
  /** State transitioned to */
  to_state: string;
  /** Reason for the transition */
  trigger_reason: string;
  /** Message that triggered the transition (null if not message-triggered) */
  trigger_message_id: string | null;
  /** When the transition occurred (ISO 8601) */
  created_at: string;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/**
 * Pagination links for navigating paginated results.
 */
export interface DevPaginationLinks {
  /** Link to the current page */
  self: string;
  /** Link to the next page (undefined if no next page) */
  next?: string;
  /** Link to the previous page (undefined if no previous page) */
  prev?: string;
  /** Link to the first page */
  first?: string;
  /** Link to the last page */
  last?: string;
}

/**
 * Generic paginated response wrapper.
 * @see Requirement 1.3: Paginated father list
 */
export interface PaginatedResponse<T> {
  /** List of items */
  items: T[];
  /** Current page number (zero-indexed) */
  page: number;
  /** Number of items per page */
  page_size: number;
  /** Total number of items across all pages */
  total_items: number;
  /** Total number of pages */
  total_pages: number;
  /** Pagination links */
  _links: DevPaginationLinks;
}

// ---------------------------------------------------------------------------
// API Response Wrappers
// ---------------------------------------------------------------------------

/**
 * Response wrapper for message list endpoint.
 * Note: The backend returns a raw array, this type adapts to that.
 * @see Requirement 3.1: Get Message Log
 */
export type DevMessagesResponse = DevMessage[];

/**
 * Response wrapper for transitions list endpoint.
 * Note: The backend returns a raw array, this type adapts to that.
 * @see Requirement 4.1: Get State Transitions
 */
export type DevTransitionsResponse = DevTransition[];

// ---------------------------------------------------------------------------
// Error Types
// ---------------------------------------------------------------------------

/**
 * Dev API error response.
 * @see Requirement 5.4: Error response sanitization
 */
export interface DevApiError {
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
}
