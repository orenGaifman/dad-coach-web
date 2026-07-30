/**
 * Onboarding & Activation type definitions.
 *
 * These types model the API responses and client state for the
 * multi-step onboarding wizard (WEB-SPEC-007).
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** Wizard steps in order of progression. */
export enum WizardStep {
  WELCOME = 'WELCOME',
  LANGUAGE = 'LANGUAGE',
  FATHER_PROFILE = 'FATHER_PROFILE',
  CHILDREN = 'CHILDREN',
  GOALS = 'GOALS',
  PREFERENCES = 'PREFERENCES',
  REVIEW = 'REVIEW',
  ACTIVATION = 'ACTIVATION',
}

/** Coaching style options (Req 7). */
export type CoachingStyle = 'GENTLE' | 'BALANCED' | 'DIRECT' | 'MOTIVATIONAL';

/** Notification frequency options (Req 7). */
export type NotificationFrequency = 'DAILY' | 'EVERY_OTHER_DAY' | 'TWICE_WEEKLY';

/** Child gender options (Req 5). */
export type ChildGender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

/** Supported languages. */
export type SupportedLanguage = 'he' | 'en';

/** Activation polling status values (Req 9). */
export type ActivationPollingStatus =
  | 'PENDING'
  | 'CONVERSATION_STARTED'
  | 'FAILED';

// ---------------------------------------------------------------------------
// Data Models (step payloads / nested structures)
// ---------------------------------------------------------------------------

/** Single child data structure (Req 5). */
export interface ChildData {
  name: string;
  birth_date: string; // ISO date string (YYYY-MM-DD)
  gender?: ChildGender;
  interests?: string[];
  challenges?: string[];
}

/** Goals step data (Req 6). */
export interface GoalsData {
  selected_goals: string[];
  custom_goal?: string;
}

/** Preferences step data (Req 7). */
export interface PreferencesData {
  coaching_style: CoachingStyle;
  preferred_coaching_time: string; // HH:mm format
  notification_frequency: NotificationFrequency;
  quiet_hours_start: string; // HH:mm format
  quiet_hours_end: string; // HH:mm format
}

// ---------------------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------------------

/**
 * Response from GET /api/v1/invitations/{token}/validate (Req 1).
 *
 * HTTP 200 indicates valid; error codes handled separately.
 */
export interface InvitationValidation {
  valid: boolean;
  invitation_id: string;
  inviter_display_name?: string;
  /** Reason field present in 410 responses (expired/revoked/used). */
  reason?: string;
}

/**
 * Response from POST /api/v1/onboarding/sessions (Req 2).
 *
 * HTTP 201 on success. Session cookie is set by the backend.
 */
export interface SessionCreateResponse {
  session_id: string;
  current_step: WizardStep;
  expires_at: string; // ISO 8601 datetime
  csrf_token: string;
}

/**
 * Response from GET /api/v1/onboarding/sessions/{id} (Req 10).
 *
 * Full session state used for resume and state restoration.
 */
export interface SessionState {
  session_id: string;
  current_step: WizardStep;
  completed_steps: WizardStep[];
  language: SupportedLanguage | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  data?: {
    father_profile?: {
      display_name: string;
      phone_number: string;
      email?: string;
      timezone: string;
    };
    children?: ChildData[];
    goals?: GoalsData;
    preferences?: PreferencesData;
  };
}

/**
 * Response from PUT /api/v1/onboarding/sessions/{id}/steps/{step} (Reqs 3-7).
 */
export interface StepResponse {
  success: boolean;
  next_step: WizardStep;
  completed_steps: WizardStep[];
}

/**
 * Response from POST /api/v1/onboarding/sessions/{id}/complete (Req 8).
 */
export interface ProvisioningResponse {
  success: boolean;
  whatsapp_deep_link: string; // e.g. https://wa.me/{number}?text=...
  activation_message: string; // Fallback copy message
}

/**
 * Response from GET /api/v1/onboarding/sessions/{id}/activation-status (Req 9).
 */
export interface ActivationStatus {
  status: ActivationPollingStatus;
  retry_count: number;
  max_retries: number;
  /** Present when status is CONVERSATION_STARTED. */
  dashboard_url?: string;
}

/**
 * Response from POST /api/v1/onboarding/sessions/{id}/activation/retry (Req 9).
 */
export interface ActivationRetryResponse {
  success: boolean;
  retry_count: number;
  max_retries: number;
}

// ---------------------------------------------------------------------------
// Error Types
// ---------------------------------------------------------------------------

/** Error codes returned by onboarding APIs. */
export type OnboardingErrorCode =
  | 'INVALID_DISPLAY_NAME'
  | 'INVALID_PHONE_FORMAT'
  | 'PHONE_ALREADY_REGISTERED'
  | 'INVALID_EMAIL_FORMAT'
  | 'INVALID_TIMEZONE'
  | 'INVALID_CHILD_NAME'
  | 'INVALID_BIRTH_DATE'
  | 'MAX_CHILDREN_EXCEEDED'
  | 'INVALID_LANGUAGE'
  | 'INVALID_GOALS'
  | 'INVALID_PREFERENCES'
  | 'SESSION_EXPIRED'
  | 'SESSION_NOT_FOUND'
  | 'INVITATION_EXPIRED'
  | 'INVITATION_REVOKED'
  | 'INVITATION_USED'
  | 'INVITATION_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'PROVISIONING_FAILED'
  | 'ACTIVATION_FAILED';

/** Structured error response from onboarding APIs. */
export interface OnboardingError {
  code: OnboardingErrorCode;
  message: string;
  /** Field-level detail for validation errors. */
  field?: string;
  /** Retry-After value in seconds (for rate limiting). */
  retry_after?: number;
}

// ---------------------------------------------------------------------------
// Client-Side State (used by OnboardingProvider context)
// ---------------------------------------------------------------------------

/** Client-side wizard state managed by OnboardingProvider. */
export interface OnboardingClientState {
  sessionId: string | null;
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  language: SupportedLanguage | null;
  isSubmitting: boolean;
  error: OnboardingError | null;
}
