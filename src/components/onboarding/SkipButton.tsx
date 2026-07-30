'use client';

import { ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { useOnboarding } from './OnboardingProvider';

/**
 * SkipButton — renders "Skip for now" only on optional steps.
 * Calls skipStep() from context on click.
 *
 * This is a standalone reusable component that can be placed anywhere
 * independently of the OnboardingLayout's built-in skip button.
 *
 * @see Requirement 12.4
 */
export function SkipButton() {
  const { currentStep, skipStep } = useOnboarding();

  const currentStepDef = ONBOARDING_STEPS.find((s) => s.name === currentStep);

  // Only render on optional (non-required) steps
  if (!currentStepDef || currentStepDef.required) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={skipStep}
      className="text-gray-400 hover:text-gray-300 text-sm underline transition-colors"
    >
      Skip for now
    </button>
  );
}
