'use client';

import { useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { OnboardingLayout } from '@/src/components/onboarding/OnboardingLayout';
import { useOnboarding } from '@/src/components/onboarding/OnboardingProvider';
import { LanguageSelector } from '@/src/components/onboarding/LanguageSelector';
import { apiClient } from '@/src/lib/api-client';
import { getStoredSessionId } from '@/src/lib/api-client';
import { WizardStep } from '@/src/types/onboarding';
import type { SupportedLanguage } from '@/src/types/onboarding';

/**
 * Language Selection page — first wizard step after welcome.
 */
export default function LanguagePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const {
    sessionId,
    setLanguage,
    setCurrentStep,
    markStepCompleted,
    setIsSubmitting,
    isSubmitting,
  } = useOnboarding();

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = useCallback((lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
    setError(null);
  }, []);

  const handleContinue = useCallback(async () => {
    if (!selectedLanguage || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const sid = sessionId || getStoredSessionId();
      if (sid) {
        await apiClient.put(`/onboarding/sessions/${sid}/steps/LANGUAGE`, {
          language: selectedLanguage,
        });
      }
      setLanguage(selectedLanguage);
      setCurrentStep(WizardStep.FATHER_PROFILE);
      markStepCompleted(WizardStep.LANGUAGE);
      router.push(`/join/${params.token}/profile`);
    } catch (err: unknown) {
      console.error('Language submit error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedLanguage, isSubmitting, sessionId, setIsSubmitting, setLanguage, setCurrentStep, markStepCompleted, router, params.token]);

  return (
    <OnboardingLayout
      isStepValid={selectedLanguage !== null && !isSubmitting}
      onContinue={handleContinue}
      continueLabel="Continue"
      hideStepIndicator
    >
      <LanguageSelector selected={selectedLanguage} onSelect={handleSelect} />
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}
    </OnboardingLayout>
  );
}
