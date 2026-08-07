'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { OnboardingLayout } from '@/src/components/onboarding/OnboardingLayout';
import { useOnboarding } from '@/src/components/onboarding/OnboardingProvider';
import { CalendarConnect } from '@/src/components/onboarding/CalendarConnect';
import { useStepGuard } from '@/src/hooks/useStepGuard';
import { WizardStep } from '@/src/types/onboarding';

/**
 * Calendar connection page — connects Google Calendar for scheduling.
 * This step comes AFTER activation, so father_id is available from localStorage.
 * This is the FINAL step - after completion, user is redirected to dashboard.
 *
 * Handles:
 * - Google OAuth flow for calendar access
 * - Skip behavior: allows proceeding without calendar (scheduling will be manual)
 *
 * @see Requirement: Calendar integration for automatic slot detection
 */
export default function CalendarPage() {
  const router = useRouter();
  const { isAllowed } = useStepGuard(WizardStep.CALENDAR);
  const { markStepCompleted } = useOnboarding();
  const [error, setError] = useState<string | null>(null);
  const [fatherId, setFatherId] = useState<number | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);

  // Get father_id from localStorage (set by review page after provisioning)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFatherId = localStorage.getItem('dadcoach_father_id');
      if (storedFatherId) {
        setFatherId(Number(storedFatherId));
      }
    }
  }, []);

  // Check URL params for OAuth callback result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const calendarConnected = params.get('calendar_connected');
    const calendarError = params.get('calendar_error');

    if (calendarConnected === 'true') {
      setIsConnected(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (calendarError) {
      setError(calendarError);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const goToDashboard = useCallback(() => {
    // Clean up onboarding data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dadcoach_deep_link');
      localStorage.removeItem('dadcoach_activation_message');
      // Keep father_id - might be useful for dashboard
    }
    router.push('/workspace');
  }, [router]);

  const handleConnected = useCallback(() => {
    setIsConnected(true);
    markStepCompleted(WizardStep.CALENDAR);
    goToDashboard();
  }, [markStepCompleted, goToDashboard]);

  const handleSkip = useCallback(() => {
    // Skip without connecting calendar - proceed to dashboard
    markStepCompleted(WizardStep.CALENDAR);
    goToDashboard();
  }, [markStepCompleted, goToDashboard]);

  const handleContinue = useCallback(() => {
    if (isConnected) {
      markStepCompleted(WizardStep.CALENDAR);
      goToDashboard();
    }
    // If not connected, the CalendarConnect component handles the OAuth redirect
  }, [isConnected, markStepCompleted, goToDashboard]);

  if (!isAllowed) return null;

  return (
    <OnboardingLayout 
      isStepValid={isConnected} 
      onContinue={handleContinue}
      continueLabel={isConnected ? 'Go to Dashboard' : 'Connect Calendar'}
    >
      <CalendarConnect
        onConnected={handleConnected}
        onSkip={handleSkip}
        fatherId={fatherId}
        allowSkip={true}
      />
      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center" role="alert">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
    </OnboardingLayout>
  );
}
