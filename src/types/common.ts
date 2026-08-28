/**
 * Common type definitions shared across all workspace modules.
 *
 * These types model shared patterns like pagination, API responses,
 * and error handling for the Father Workspace (WEB-SPEC-008).
 */

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/**
 * Pagination request parameters.
 */
export interface PaginationParams {
  /** Number of items to return (default varies by endpoint) */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Pagination metadata included in paginated responses.
 */
export interface PaginationMeta {
  /** Total number of items available */
  total: number;
  /** Number of items returned in this response */
  count: number;
  /** Current offset */
  offset: number;
  /** Limit used for this request */
  limit: number;
  /** Whether there are more items to fetch */
  has_more: boolean;
}

// ---------------------------------------------------------------------------
// API Response Status
// ---------------------------------------------------------------------------

/**
 * Response status indicating request outcome.
 */
export type ResponseStatus = 'OK' | 'PARTIAL' | 'ERROR';

/**
 * Sections that can be degraded in a partial response.
 */
export type DegradedSection =
  | 'growth'
  | 'belt'
  | 'streak'
  | 'achievements'
  | 'children'
  | 'goals'
  | 'missions'
  | 'conversations'
  | 'notifications'
  | 'profile';

/**
 * Base response wrapper for API responses that support partial degradation.
 */
export interface BaseApiResponse {
  /** Overall response status */
  response_status: ResponseStatus;
  /** Sections that failed to load (present when response_status is PARTIAL) */
  degraded_sections?: DegradedSection[];
}

// ---------------------------------------------------------------------------
// API Errors
// ---------------------------------------------------------------------------

/**
 * Error codes returned by workspace APIs.
 */
export type WorkspaceErrorCode =
  // Authentication/Authorization
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SESSION_EXPIRED'
  // Resource errors
  | 'NOT_FOUND'
  | 'CHILD_NOT_FOUND'
  | 'GOAL_NOT_FOUND'
  | 'CONVERSATION_NOT_FOUND'
  | 'NOTIFICATION_NOT_FOUND'
  // Rate limiting
  | 'RATE_LIMITED'
  | 'DAILY_LIMIT_REACHED'
  | 'AI_CREDITS_EXHAUSTED'
  // Validation errors
  | 'VALIDATION_ERROR'
  | 'INVALID_DATE'
  | 'INVALID_DATE_RANGE'
  | 'INVALID_DURATION'
  | 'INVALID_DESCRIPTION'
  | 'DUPLICATE_ACTIVITY'
  // Server errors
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  // Network errors (client-side only)
  | 'NETWORK_ERROR'
  | 'TIMEOUT';

/**
 * Structured error response from workspace APIs.
 */
export interface ApiError {
  /** Error code for programmatic handling */
  code: WorkspaceErrorCode;
  /** Human-readable error message */
  message: string;
  /** Field-level detail for validation errors */
  field?: string;
  /** Retry-After value in seconds (for rate limiting) */
  retry_after?: number;
  /** Whether the operation can be retried */
  retryable: boolean;
}

// ---------------------------------------------------------------------------
// HTTP Error Classification
// ---------------------------------------------------------------------------

/**
 * HTTP error categories for error handling logic.
 */
export type HttpErrorCategory =
  | 'network'      // Failed to connect
  | 'timeout'      // Request timed out
  | 'unauthorized' // 401
  | 'forbidden'    // 403
  | 'not_found'    // 404
  | 'rate_limited' // 429
  | 'validation'   // 400/422
  | 'server'       // 5xx
  | 'unknown';     // Other errors

// ---------------------------------------------------------------------------
// Timestamp Types
// ---------------------------------------------------------------------------

/**
 * ISO 8601 datetime string (e.g., "2024-01-15T10:30:00Z").
 */
export type ISODateTime = string;

/**
 * ISO 8601 date string (e.g., "2024-01-15").
 */
export type ISODate = string;

/**
 * Time in HH:mm format (e.g., "14:30").
 */
export type TimeString = string;

// ---------------------------------------------------------------------------
// Shared Domain Types
// ---------------------------------------------------------------------------

/**
 * Coaching style preferences.
 * Used across onboarding and workspace profile.
 * @see Requirement 15.1: Coaching style options
 */
export type CoachingStyle = 'GENTLE' | 'BALANCED' | 'DIRECT' | 'MOTIVATIONAL';

/**
 * Supported languages for the application.
 */
export type SupportedLanguage = 'he' | 'en';

/**
 * Notification frequency options for coaching reminders.
 */
export type NotificationFrequency = 'DAILY' | 'EVERY_OTHER_DAY' | 'TWICE_WEEKLY';

/**
 * Child gender options.
 * @see Requirement 14.2: Child form fields
 */
export type ChildGender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

// ---------------------------------------------------------------------------
// Generic Response Types
// ---------------------------------------------------------------------------

/**
 * Generic success response for mutations.
 */
export interface SuccessResponse {
  success: boolean;
  message?: string;
}

/**
 * Generic list response wrapper.
 */
export interface ListResponse<T> extends BaseApiResponse {
  items: T[];
  pagination?: PaginationMeta;
}
