'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useOnboarding } from '@/src/components/onboarding/OnboardingProvider';
import ActivationScreen from '@/src/components/onboarding/ActivationScreen';
import ActivationFailed from '@/src/components/onboarding/ActivationFailed';
import { OnboardingLayout } from '@/src/components/onboarding/OnboardingLayout';
import { useStepGuard } from '@/src/hooks/useStepGuard';
import { useActivationPolling } from '@/src/hooks/useActivationPolling';
import { retryActivation } from '@/src/services/onboarding';
import { WizardStep } from '@/src/types/onboarding';
import { VALIDATION } from '@/src/constants/onboarding';
import { getWhatsAppDeepLink, WHATSAPP_PHONE_NUMBER } from '@/src/config/whatsapp';

// ---------------------------------------------------------------------------
// Activation Page
// ---------------------------------------------------------------------------

/**
 * ActivatePage — WhatsApp activation step (O8).
 *
 * Orchestrates the deep link display, long-poll loop, and retry logic:
 * - PENDING: shows ActivationScreen with deep link and polling indicator.
 * - CONVERSATION_STARTED: automatically proceeds to Calendar step.
 * - FAILED: shows ActivationFailed with retry (max 3) or give-up message.
 *
 * @see Requirement 9.6: Retry via POST activation/retry (max 3 attempts).
 * @see Requirement 9.8: Manual copy fallback for activation message.
 */
export default function ActivatePage() {
  const { isAllowed } = useStepGuard(WizardStep.ACTIVATION);
  const { sessionId, markStepCompleted } = useOnboarding();
  const router = useRouter();

  // Activation data — read from localStorage (set by review page after provisioning)
  const [deepLink] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dadcoach_deep_link') || getWhatsAppDeepLink(WHATSAPP_PHONE_NUMBER, '🚀 START');
    }
    return getWhatsAppDeepLink(WHATSAPP_PHONE_NUMBER, '🚀 START');
  });
  const [activationMessage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dadcoach_activation_message') || '🚀 START';
    }
    return '🚀 START';
  });

  // Retry state
  const [showGiveUp, setShowGiveUp] = useState(false);

  // Polling hook
  const { status, isPolling, error: pollingError, restart } =
    useActivationPolling(sessionId);

  // When activation succeeds, proceed to Dashboard (calendar already done)
  useEffect(() => {
    if (status === 'CONVERSATION_STARTED') {
      markStepCompleted(WizardStep.ACTIVATION);
      // Clean up onboarding data from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dadcoach_deep_link');
        localStorage.removeItem('dadcoach_activation_message');
        // Keep father_id - might be useful for dashboard
      }
      // Go directly to dashboard - onboarding complete!
      router.push('/workspace');
    }
  }, [status, markStepCompleted, router]);

  // --- Retry handler (Req 9.6) ---
  const handleRetry = useCallback(async () => {
    if (!sessionId) return;

    try {
      const result = await retryActivation(sessionId);

      if (result.retry_count >= VALIDATION.MAX_ACTIVATION_RETRIES) {
        setShowGiveUp(true);
        return;
      }

      // Restart polling after successful retry
      restart();
    } catch {
      setShowGiveUp(true);
    }
  }, [sessionId, restart]);

  // Guard: don't render until navigation is allowed
  if (!isAllowed) {
    return null;
  }

  // --- Determine which sub-view to render ---
  // Show loading state while transitioning to calendar
  if (status === 'CONVERSATION_STARTED') {
    return (
      <OnboardingLayout hideNavigation>
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="text-4xl">🎉</div>
          <h2 className="text-2xl font-bold text-white">You&apos;re connected!</h2>
          <p className="text-gray-400">Setting up calendar...</p>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout hideNavigation>
      {status === 'FAILED' && (
        <ActivationFailed onRetry={handleRetry} showGiveUp={showGiveUp} />
      )}

      {(status === null || status === 'PENDING') && (
        <ActivationScreen
          deepLink={deepLink}
          activationMessage={activationMessage}
          isPolling={isPolling}
          pollingError={pollingError}
        />
      )}
    </OnboardingLayout>
  );
}
