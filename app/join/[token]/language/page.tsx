'use client';

import { useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { OnboardingLayout } from '@/src/components/onboarding/OnboardingLayout';
import { useOnboarding } from '@/src/components/onboarding/OnboardingProvider';
import { LanguageSelector } from '@/src/components/onboarding/LanguageSelector';
import { useLanguage } from '@/src/providers/LanguageProvider';
import { apiClient } from '@/src/lib/api-client';
import { getStoredSessionId } from '@/src/lib/api-client';
import { WizardStep } from '@/src/types/onboarding';
import type { SupportedLanguage } from '@/src/types/onboarding';

/**
 * Language Selection page — first wizard step after welcome.
 * 
 * UX: Clicking a language automatically submits and navigates to the next step
 * (no separate "Continue" button needed).
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
  
  // Also get the global language setter to persist across the app
  const { setLanguage: setGlobalLanguage } = useLanguage();

  const [error, setError] = useState<string | null>(null);

  // When user clicks a language, immediately submit and navigate
  const handleSelect = useCallback(async (lang: SupportedLanguage) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const sid = sessionId || getStoredSessionId();
      if (sid) {
        await apiClient.put(`/onboarding/sessions/${sid}/steps/LANGUAGE`, {
          language: lang,
        });
      } else {
        console.warn('No session ID available — skipping server step submission');
      }
      
      // Update both onboarding state AND global language provider
      setLanguage(lang);
      setGlobalLanguage(lang);
      
      setCurrentStep(WizardStep.FATHER_PROFILE);
      markStepCompleted(WizardStep.LANGUAGE);
      router.push(`/join/${params.token}/profile`);
    } catch (err: unknown) {
      console.error('Language submit error:', err);
      setError(lang === 'he' ? 'משהו השתבש. אנא נסה שוב.' : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }, [isSubmitting, sessionId, setIsSubmitting, setLanguage, setGlobalLanguage, setCurrentStep, markStepCompleted, router, params.token]);

  return (
    <OnboardingLayout
      isStepValid={false}
      hideStepIndicator
      hideNavigation
    >
      <LanguageSelector selected={null} onSelect={handleSelect} isSubmitting={isSubmitting} />
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}
    </OnboardingLayout>
  );
}
