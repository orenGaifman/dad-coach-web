'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';

import { OnboardingLayout } from '@/src/components/onboarding/OnboardingLayout';
import { useOnboarding } from '@/src/components/onboarding/OnboardingProvider';
import { ProfileForm } from '@/src/components/onboarding/ProfileForm';
import type { ProfileFormData } from '@/src/components/onboarding/ProfileForm';
import { useStepGuard } from '@/src/hooks/useStepGuard';
import { ApiError } from '@/src/lib/api-client';
import { submitStep } from '@/src/services/onboarding';
import { WizardStep } from '@/src/types/onboarding';
import { mapErrorToField } from '@/src/utils/error-mapping';
import { formatE164 } from '@/src/utils/phone';

/**
 * Father Profile page — collects display name, phone, email, and timezone.
 *
 * Handles:
 * - Form submission to PUT /api/v1/onboarding/sessions/{id}/steps/FATHER_PROFILE
 * - HTTP 409 (duplicate phone): shows inline "already registered" message with login link
 * - Other validation errors: maps to field-level inline errors via error-mapping utility
 *
 * @see Requirement 4: Father Profile
 * @see Requirement 4.7: HTTP 409 duplicate phone handling
 */
export default function ProfilePage() {
  const { isAllowed } = useStepGuard(WizardStep.FATHER_PROFILE);
  const {
    sessionId,
    isSubmitting,
    setIsSubmitting,
    markStepCompleted,
    goForward,
  } = useOnboarding();

  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [duplicatePhone, setDuplicatePhone] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Ref to programmatically submit the hidden form button
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleProfileSubmit = useCallback(
    async (data: ProfileFormData) => {
      // Guard against double submission
      if (isSubmitting) return;
      
      setIsSubmitting(true);
      setServerErrors({});
      setDuplicatePhone(false);

      try {
        const e164Phone = formatE164(data.countryCode, data.phoneNumber);
        await submitStep(sessionId!, 'FATHER_PROFILE', {
          display_name: data.displayName,
          phone_number: e164Phone,
          email: data.email || undefined,
          timezone: data.timezone,
        });
        markStepCompleted(WizardStep.FATHER_PROFILE);
        goForward();
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          setDuplicatePhone(true);
        } else if (err instanceof ApiError && err.body?.code) {
          const field = mapErrorToField(err.body.code);
          setServerErrors({ [field]: err.body.message || 'Validation error' });
        } else {
          setServerErrors({ _form: 'Something went wrong. Please try again.' });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, sessionId, setIsSubmitting, markStepCompleted, goForward],
  );

  // Trigger the hidden form submit button from OnboardingLayout's Continue
  const handleContinue = useCallback(() => {
    formRef.current?.requestSubmit();
  }, []);

  // Track form validity for Continue button state
  const handleFormChange = useCallback(() => {
    // Simple check: form is always "valid enough" to attempt submit —
    // detailed validation happens on submit in ProfileForm itself.
    setIsFormValid(true);
  }, []);

  if (!isAllowed) {
    return null;
  }

  return (
    <OnboardingLayout isStepValid={isFormValid} onContinue={handleContinue}>
      <div onInput={handleFormChange}>
        <ProfileForm
          onSubmit={handleProfileSubmit}
          isSubmitting={isSubmitting}
          serverErrors={serverErrors}
          ref={formRef}
        />
      </div>

      {/* Duplicate phone message (Req 4.7) */}
      {duplicatePhone && (
        <div
          className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center"
          role="alert"
          aria-live="polite"
        >
          <p className="text-amber-200 text-sm font-medium">
            This number is already registered.
          </p>
          <Link
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 text-sm underline mt-1 inline-block"
          >
            Would you like to log in instead?
          </Link>
        </div>
      )}

      {/* General form-level error */}
      {serverErrors._form && !duplicatePhone && (
        <div
          className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center"
          role="alert"
          aria-live="polite"
        >
          <p className="text-red-300 text-sm">{serverErrors._form}</p>
        </div>
      )}
    </OnboardingLayout>
  );
}
