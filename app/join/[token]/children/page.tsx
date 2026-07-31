'use client';

import { useCallback, useRef, useState } from 'react';

import { OnboardingLayout } from '@/src/components/onboarding/OnboardingLayout';
import { useOnboarding } from '@/src/components/onboarding/OnboardingProvider';
import { ChildrenForm } from '@/src/components/onboarding/ChildrenForm';
import { useStepGuard } from '@/src/hooks/useStepGuard';
import { ApiError } from '@/src/lib/api-client';
import { submitStep } from '@/src/services/onboarding';
import { WizardStep } from '@/src/types/onboarding';
import type { ChildData } from '@/src/types/onboarding';

/**
 * Children Setup page — optionally collects child information.
 *
 * Handles:
 * - Form submission to PUT /api/v1/onboarding/sessions/{id}/steps/CHILDREN
 * - Skip behavior: "Skip for now" advances to Goals without submission (handled by OnboardingLayout)
 * - Submit behavior: when children are added, submits all via submitStep('CHILDREN', data)
 *
 * @see Requirement 5.3: "Skip for now" advances to Goals with no children registered
 * @see Requirement 5.6: WHEN children are added, submit via submitStep('CHILDREN', data)
 */
export default function ChildrenPage() {
  const { isAllowed } = useStepGuard(WizardStep.CHILDREN);
  const { sessionId, isSubmitting, setIsSubmitting, markStepCompleted, goForward } = useOnboarding();
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleSubmit = useCallback(async (children: ChildData[]) => {
    // Guard against double submission
    if (isSubmitting) return;
    
    if (children.length === 0) {
      // No children added — treat as skip
      goForward();
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await submitStep(sessionId!, 'CHILDREN', { children });
      markStepCompleted(WizardStep.CHILDREN);
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
    <OnboardingLayout
      isStepValid={true}
      onContinue={handleContinue}
      continueLabel="Continue"
    >
      <ChildrenForm
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
