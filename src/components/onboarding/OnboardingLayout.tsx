'use client';

import Image from 'next/image';

import { ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { useTranslations } from '@/src/i18n/useTranslations';
import { WizardStep } from '@/src/types/onboarding';

import { useOnboarding } from './OnboardingProvider';
import { StepIndicator } from './StepIndicator';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface OnboardingLayoutProps {
  children: React.ReactNode;
  /** Whether the current step's form is valid (enables Continue button) */
  isStepValid?: boolean;
  /** Custom label for the continue button */
  continueLabel?: string;
  /** Called when Continue is clicked (parent step validates and handles submission) */
  onContinue?: () => void;
  /** Hide the navigation footer entirely (e.g., on activation screen) */
  hideNavigation?: boolean;
  /** Hide the step indicator (e.g., on language screen which is the first step shown) */
  hideStepIndicator?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * OnboardingLayout — UI shell rendered inside the route layout.
 * Provides logo header, StepIndicator, content slot, and navigation footer.
 *
 * @see Requirement 12: Wizard Navigation
 * - 12.1: BACK always available (except first wizard step: LANGUAGE)
 * - 12.2: BACK preserves data (server-side, handled by context)
 * - 12.3: FORWARD only proceeds after step validates (isStepValid prop)
 * - 12.4: SKIP available only on optional steps
 */
export function OnboardingLayout({
  children,
  isStepValid = false,
  continueLabel,
  onContinue,
  hideNavigation = false,
  hideStepIndicator = false,
}: OnboardingLayoutProps) {
  const { currentStep, isSubmitting, goBack, skipStep } = useOnboarding();
  const { t, isRTL } = useTranslations();

  // Use provided label or default to translated "Continue"
  const buttonLabel = continueLabel || t('common.continue');

  // Determine if Back button should be shown (Req 12.1)
  // Hidden on LANGUAGE (first wizard step — WELCOME isn't in the wizard flow)
  const showBack = currentStep !== WizardStep.LANGUAGE;

  // Determine if Skip button should be shown (Req 12.4)
  const currentStepDef = ONBOARDING_STEPS.find((s) => s.name === currentStep);
  const showSkip = currentStepDef ? !currentStepDef.required : false;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Logo Header */}
      <header className="flex justify-center py-4">
        <Image
          src="/logos/dad-coach-logo-icon.webp"
          alt="Dad Coach"
          width={32}
          height={32}
          priority
        />
      </header>

      {/* Step Indicator */}
      {!hideStepIndicator && (
        <div className="mb-6">
          <StepIndicator />
        </div>
      )}

      {/* Content Slot */}
      <main className="flex-1">{children}</main>

      {/* Navigation Footer */}
      {!hideNavigation && (
        <footer className="mt-8">
          {/* Skip button — above navigation row */}
          {showSkip && (
            <div className="flex justify-center mb-3">
              <button
                type="button"
                onClick={skipStep}
                className="text-gray-400 hover:text-gray-300 text-sm underline"
              >
                {t('common.skipForNow')}
              </button>
            </div>
          )}

          {/* Navigation row */}
          <div className="flex justify-between items-center">
            {/* Back button */}
            {showBack ? (
              <button
                type="button"
                onClick={goBack}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <span aria-hidden="true">{isRTL ? '→' : '←'}</span> {t('common.back')}
              </button>
            ) : (
              <div /> /* Spacer to maintain layout */
            )}

            {/* Continue button */}
            <button
              type="button"
              onClick={onContinue}
              disabled={!isStepValid || isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-6 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? t('onboarding.nav.saving') : buttonLabel}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
