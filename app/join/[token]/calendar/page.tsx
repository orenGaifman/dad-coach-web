'use client';

import { useCallback, useState, useEffect } from 'react';

import { OnboardingLayout } from '@/src/components/onboarding/OnboardingLayout';
import { useOnboarding } from '@/src/components/onboarding/OnboardingProvider';
import { CalendarConnect } from '@/src/components/onboarding/CalendarConnect';
import { useStepGuard } from '@/src/hooks/useStepGuard';
import { WizardStep } from '@/src/types/onboarding';

/**
 * Calendar connection page — connects Google Calendar for scheduling.
 * This step comes AFTER review (provisioning), so father_id is available from localStorage.
 * After calendar connection (or skip), user proceeds to WhatsApp activation.
 *
 * Handles:
 * - Google OAuth flow for calendar access
 * - Skip behavior: allows proceeding without calendar (scheduling will be manual)
 *
 * @see Requirement: Calendar integration for automatic slot detection
 */
export default function CalendarPage() {
  const { isAllowed } = useStepGuard(WizardStep.CALENDAR);
  const { markStepCompleted, goForward } = useOnboarding();
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

  const goToActivation = useCallback(() => {
    markStepCompleted(WizardStep.CALENDAR);
    goForward(); // → activate (WhatsApp)
  }, [markStepCompleted, goForward]);

  const handleConnected = useCallback(() => {
    setIsConnected(true);
    goToActivation();
  }, [goToActivation]);

  const handleSkip = useCallback(() => {
    // Skip without connecting calendar - proceed to activation
    goToActivation();
  }, [goToActivation]);

  const handleContinue = useCallback(() => {
    if (isConnected) {
      goToActivation();
    }
    // If not connected, the CalendarConnect component handles the OAuth redirect
  }, [isConnected, goToActivation]);

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
