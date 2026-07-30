'use client';

import { useMemo } from 'react';

import { ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { WizardStep } from '@/src/types/onboarding';

import { useOnboarding } from './OnboardingProvider';

// ---------------------------------------------------------------------------
// Steps displayed in the indicator (exclude WELCOME and ACTIVATION)
// ---------------------------------------------------------------------------

const INDICATOR_STEPS = ONBOARDING_STEPS.filter(
  (s) => s.name !== WizardStep.WELCOME && s.name !== WizardStep.ACTIVATION,
);

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface StepIndicatorProps {
  /** If not provided, reads from OnboardingProvider context */
  currentStep?: WizardStep;
  completedSteps?: WizardStep[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * StepIndicator — visual progress indicator showing current position,
 * completed steps, and total count as dot navigation.
 *
 * @see Requirement 11: Progress Indication
 * - 11.1: Show current position (dots + "Step N of M" text)
 * - 11.2: Completed steps visually distinct from pending
 * - 11.4: No pressure language (no timers or "hurry up")
 * - 11.5: Step count adjusts when optional steps are skipped
 */
export function StepIndicator({
  currentStep: currentStepProp,
  completedSteps: completedStepsProp,
}: StepIndicatorProps) {
  const context = useOnboarding();

  const currentStep = currentStepProp ?? context.currentStep;
  const completedSteps = completedStepsProp ?? context.completedSteps;

  // Calculate the displayed steps, adjusting for skipped optional steps (Req 11.5)
  const { displayedSteps, currentIndex } = useMemo(() => {
    const currentStepOrder =
      ONBOARDING_STEPS.find((s) => s.name === currentStep)?.order ?? 0;

    // A step is included if:
    // - It's the current step or later (always shown)
    // - It's been completed (always shown)
    // - It hasn't been passed without completion (skipped) — only exclude
    //   optional steps that were skipped (past them and not completed)
    const displayed = INDICATOR_STEPS.filter((step) => {
      const isPastStep = step.order < currentStepOrder;
      const isCompleted = completedSteps.includes(step.name);

      // If we've passed this step and it's not completed, it was skipped
      if (isPastStep && !isCompleted && !step.required) {
        return false;
      }

      return true;
    });

    const idx = displayed.findIndex((s) => s.name === currentStep);

    return { displayedSteps: displayed, currentIndex: idx };
  }, [currentStep, completedSteps]);

  const total = displayedSteps.length;
  // If current step is WELCOME or ACTIVATION (not in indicator), don't render
  if (currentIndex === -1) {
    return null;
  }

  const position = currentIndex + 1;

  return (
    <div className="flex flex-col items-center gap-2" role="navigation" aria-label="Onboarding progress">
      {/* Dots */}
      <div className="flex items-center gap-1.5">
        {displayedSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.name);
          const isCurrent = step.name === currentStep;
          const isFilled = isCurrent || isCompleted;

          return (
            <span
              key={step.name}
              className={`w-2.5 h-2.5 rounded-full ${
                isFilled ? 'bg-indigo-500' : 'bg-white/20'
              }`}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Step ${index + 1}: ${step.label}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
            />
          );
        })}
      </div>

      {/* Step text */}
      <span className="text-gray-400 text-sm">
        Step {position} of {total}
      </span>
    </div>
  );
}
