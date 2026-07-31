'use client';

import { useCallback, useRef, useState } from 'react';

import { OnboardingLayout } from '@/src/components/onboarding/OnboardingLayout';
import { useOnboarding } from '@/src/components/onboarding/OnboardingProvider';
import { GoalsSelector } from '@/src/components/onboarding/GoalsSelector';
import { useStepGuard } from '@/src/hooks/useStepGuard';
import { ApiError } from '@/src/lib/api-client';
import { submitStep } from '@/src/services/onboarding';
import { WizardStep } from '@/src/types/onboarding';
import type { GoalsData } from '@/src/types/onboarding';

/**
 * Goals Selection page — optionally collects coaching goals.
 *
 * Handles:
 * - Form submission to PUT /api/v1/onboarding/sessions/{id}/steps/GOALS
 * - Skip behavior: "Skip for now" advances without submission (handled by OnboardingLayout)
 *
 * @see Requirement 6.4: "Skip for now" advances — backend handles defaults
 * @see Requirement 6.5: ON submit: PUT /api/v1/onboarding/sessions/{id}/steps/GOALS
 */
export default function GoalsPage() {
  const { isAllowed } = useStepGuard(WizardStep.GOALS);
  const { sessionId, isSubmitting, setIsSubmitting, markStepCompleted, goForward } = useOnboarding();
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleSubmit = useCallback(async (data: GoalsData) => {
    // Guard against double submission
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setFormError(null);

    try {
      await submitStep(sessionId!, 'GOALS', data);
      markStepCompleted(WizardStep.GOALS);
      goForward();
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.body?.message || 'Something went wrong. Please try again.');
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, sessionId, setIsSubmitting, markStepCompleted, goForward]);

  const handleContinue = useCallback(() => {
    formRef.current?.requestSubmit();
  }, []);

  if (!isAllowed) return null;

  return (
    <OnboardingLayout isStepValid={true} onContinue={handleContinue}>
      <GoalsSelector
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        ref={formRef}
      />
      {formError && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center" role="alert">
          <p className="text-red-300 text-sm">{formError}</p>
        </div>
      )}
    </OnboardingLayout>
  );
}
