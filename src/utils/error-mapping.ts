/**
 * Maps backend onboarding error codes to form field names for inline display.
 *
 * Codes that don't map to a specific field resolve to '_form' (general form-level error).
 */

import type { OnboardingErrorCode } from '@/src/types/onboarding';

export const ERROR_FIELD_MAP: Record<string, string> = {
  'INVALID_DISPLAY_NAME': 'displayName',
  'INVALID_PHONE_FORMAT': 'phoneNumber',
  'PHONE_ALREADY_REGISTERED': 'phoneNumber',
  'INVALID_EMAIL_FORMAT': 'email',
  'INVALID_TIMEZONE': 'timezone',
  'INVALID_CHILD_NAME': 'children',
  'INVALID_BIRTH_DATE': 'children',
  'MAX_CHILDREN_EXCEEDED': '_form',
  'INVALID_LANGUAGE': '_form',
  'INVALID_GOALS': '_form',
  'INVALID_PREFERENCES': '_form',
};

/** Maps an OnboardingError code to a field name for inline display. */
export function mapErrorToField(code: string): string {
  return ERROR_FIELD_MAP[code] ?? '_form';
}
