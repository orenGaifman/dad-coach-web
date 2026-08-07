'use client';

import { useCallback, useState, useEffect } from 'react';

import { OnboardingLayout } from '@/src/components/onboarding/OnboardingLayout';
import { useOnboarding } from '@/src/components/onboarding/OnboardingProvider';
import { CalendarConnect } from '@/src/components/onboarding/CalendarConnect';
import { useStepGuard } from '@/src/hooks/useStepGuard';
import { WizardStep } from '@/src/types/onboarding';

/**
 * Calendar connection page — connects Google Calendar for scheduling.
 *
 * Handles:
 * - Google OAuth flow for calendar access
 * - Skip behavior: allows proceeding without calendar (scheduling will be manual)
 *
 * @see Requirement: Calendar integration for automatic slot detection
 */
export default function CalendarPage() {
  const { isAllowed } = useStepGuard(WizardStep.CALENDAR);
  const { 
    sessionId, 
    isSubmitting, 
    setIsSubmitting, 
    markStepCompleted, 
    goForward,
    skipStep,
    language 
  } = useOnboarding();
  const [error, setError] = useState<string | null>(null);
  const [fatherId, setFatherId] = useState<number | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);

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

  // Get father ID from session data
  useEffect(() => {
    const fetchFatherId = async () => {
      if (!sessionId) return;
      
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dad-coach.onrender.com/api/v1';
        const response = await fetch(`${apiBaseUrl}/onboarding/sessions/${sessionId}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.father_id) {
            setFatherId(data.father_id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch session data:', err);
      }
    };

    fetchFatherId();
  }, [sessionId]);

  const handleConnected = useCallback(() => {
    setIsConnected(true);
    markStepCompleted(WizardStep.CALENDAR);
    goForward();
  }, [markStepCompleted, goForward]);

  const handleSkip = useCallback(() => {
    // Skip without connecting calendar
    skipStep();
  }, [skipStep]);

  const handleContinue = useCallback(() => {
    if (isConnected) {
      markStepCompleted(WizardStep.CALENDAR);
      goForward();
    }
    // If not connected, the CalendarConnect component handles the OAuth redirect
  }, [isConnected, markStepCompleted, goForward]);

  if (!isAllowed) return null;

  return (
    <OnboardingLayout 
      isStepValid={isConnected} 
      onContinue={handleContinue}
      continueLabel={isConnected ? 'Continue' : 'Connect Calendar'}
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
