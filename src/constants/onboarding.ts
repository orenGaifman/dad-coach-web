/**
 * Onboarding constants — step definitions, predefined options, and validation limits.
 *
 * All constants align with Backend SPEC-007 and WEB-SPEC-007 requirements.
 */

import {
  WizardStep,
  CoachingStyle,
  NotificationFrequency,
} from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// Step Definitions
// ---------------------------------------------------------------------------

export interface StepDefinition {
  name: WizardStep;
  label: string;
  required: boolean;
  order: number;
  path: string;
}

export const ONBOARDING_STEPS: readonly StepDefinition[] = [
  { name: WizardStep.WELCOME, label: 'Welcome', required: true, order: 0, path: '' },
  { name: WizardStep.LANGUAGE, label: 'Language', required: true, order: 1, path: 'language' },
  { name: WizardStep.FATHER_PROFILE, label: 'Profile', required: true, order: 2, path: 'profile' },
  { name: WizardStep.CHILDREN, label: 'Children', required: false, order: 3, path: 'children' },
  { name: WizardStep.GOALS, label: 'Goals', required: false, order: 4, path: 'goals' },
  { name: WizardStep.PREFERENCES, label: 'Preferences', required: false, order: 5, path: 'preferences' },
  { name: WizardStep.REVIEW, label: 'Review', required: true, order: 6, path: 'review' },
  { name: WizardStep.CALENDAR, label: 'Calendar', required: true, order: 7, path: 'calendar' },
  { name: WizardStep.ACTIVATION, label: 'Activate', required: true, order: 8, path: 'activate' },
] as const;

// ---------------------------------------------------------------------------
// Predefined Goals (Req 6.1)
// ---------------------------------------------------------------------------

export interface GoalOption {
  id: string;
  label: string;
}

export const PREDEFINED_GOALS: readonly GoalOption[] = [
  { id: 'spend-more-quality-time', label: 'Spend more quality time' },
  { id: 'improve-communication', label: 'Improve communication' },
  { id: 'build-stronger-emotional-connection', label: 'Build stronger emotional connection' },
  { id: 'handle-conflicts-better', label: 'Handle conflicts better' },
  { id: 'create-family-routines', label: 'Create family routines' },
  { id: 'support-child-development', label: 'Support child development' },
  { id: 'be-more-patient', label: 'Be more patient' },
] as const;

// ---------------------------------------------------------------------------
// Coaching Style Options (Req 7.1)
// ---------------------------------------------------------------------------

export interface CoachingStyleOption {
  value: CoachingStyle;
  label: string;
  description: string;
}

export const COACHING_STYLE_OPTIONS: readonly CoachingStyleOption[] = [
  { value: 'GENTLE', label: 'Gentle', description: 'Positive focus, gentle encouragement' },
  { value: 'BALANCED', label: 'Balanced', description: 'Mix of both styles' },
  { value: 'DIRECT', label: 'Direct', description: 'Clear, honest feedback' },
  { value: 'MOTIVATIONAL', label: 'Motivational', description: 'Action-oriented inspiration' },
] as const;

// ---------------------------------------------------------------------------
// Notification Frequency Options (Req 7.1)
// ---------------------------------------------------------------------------

export interface NotificationFrequencyOption {
  value: NotificationFrequency;
  label: string;
}

export const NOTIFICATION_FREQUENCY_OPTIONS: readonly NotificationFrequencyOption[] = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'EVERY_OTHER_DAY', label: 'Every other day' },
  { value: 'TWICE_WEEKLY', label: 'Twice a week' },
] as const;

// ---------------------------------------------------------------------------
// Validation Limits
// ---------------------------------------------------------------------------

export const VALIDATION = {
  DISPLAY_NAME_MIN: 2,
  DISPLAY_NAME_MAX: 50,
  CHILD_NAME_MIN: 2,
  CHILD_NAME_MAX: 30,
  MAX_CHILDREN: 8,
  MAX_GOALS: 5,
  MIN_GOALS: 1,
  CUSTOM_GOAL_MAX: 100,
  MAX_CHILD_AGE_YEARS: 18,
  SESSION_TTL_HOURS: 72,
  MAX_ACTIVATION_RETRIES: 3,
  POLLING_HOLD_SECONDS: 30,
} as const;

// ---------------------------------------------------------------------------
// Default Values
// ---------------------------------------------------------------------------

export const DEFAULTS = {
  COUNTRY_CODE: '+972',
  TIMEZONE: 'Asia/Jerusalem',
  COACHING_STYLE: 'BALANCED' as CoachingStyle,
  COACHING_TIME: '08:00',
  NOTIFICATION_FREQUENCY: 'DAILY' as NotificationFrequency,
  QUIET_HOURS_START: '21:00',
  QUIET_HOURS_END: '07:00',
  GOAL: 'spend-more-quality-time',
} as const;
