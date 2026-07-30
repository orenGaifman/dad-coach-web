'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useOnboarding } from '@/src/components/onboarding/OnboardingProvider';
import { ONBOARDING_STEPS } from '@/src/constants/onboarding';
import type { WizardStep } from '@/src/types/onboarding';

/**
 * useStepGuard — navigation guard for onboarding wizard pages.
 *
 * Prevents direct URL access to future steps by redirecting to the current step.
 * Always allows access to the current step and any previous steps (back navigation).
 *
 * @param pageStep - The WizardStep this page represents.
 * @returns `{ isAllowed }` — false while redirecting, true when the page may render.
 *
 * @see Requirement 12.5: Direct URL access to a future step SHALL redirect to current step.
 * @see Requirement 12.1: BACK always available (previous steps are never blocked).
 */
export function useStepGuard(pageStep: WizardStep): { isAllowed: boolean } {
  const { currentStep } = useOnboarding();
  const router = useRouter();
  const params = useParams<{ token: string }>();

  const pageStepOrder =
    ONBOARDING_STEPS.find((s) => s.name === pageStep)?.order ?? 0;
  const currentStepOrder =
    ONBOARDING_STEPS.find((s) => s.name === currentStep)?.order ?? 0;

  useEffect(() => {
    // If the URL targets a step ahead of the current step, redirect back.
    if (pageStepOrder > currentStepOrder) {
      const currentStepDef = ONBOARDING_STEPS.find(
        (s) => s.name === currentStep,
      );
      if (currentStepDef && params.token) {
        router.replace(`/join/${params.token}/${currentStepDef.path}`);
      }
    }
  }, [pageStepOrder, currentStepOrder, currentStep, router, params.token]);

  // Allow current step and any previous step (back navigation always permitted).
  return { isAllowed: pageStepOrder <= currentStepOrder };
}
