'use client';

import { useCallback, useState } from 'react';

import { useOnboarding } from '@/src/components/onboarding/OnboardingProvider';
import ActivationScreen from '@/src/components/onboarding/ActivationScreen';
import ActivationSuccess from '@/src/components/onboarding/ActivationSuccess';
import ActivationFailed from '@/src/components/onboarding/ActivationFailed';
import { OnboardingLayout } from '@/src/components/onboarding/OnboardingLayout';
import { useStepGuard } from '@/src/hooks/useStepGuard';
import { useActivationPolling } from '@/src/hooks/useActivationPolling';
import { retryActivation } from '@/src/services/onboarding';
import { WizardStep } from '@/src/types/onboarding';
import { VALIDATION } from '@/src/constants/onboarding';

// ---------------------------------------------------------------------------
// Activation Page
// ---------------------------------------------------------------------------

/**
 * ActivatePage — WhatsApp activation step (O8).
 *
 * Orchestrates the deep link display, long-poll loop, and retry logic:
 * - PENDING: shows ActivationScreen with deep link and polling indicator.
 * - CONVERSATION_STARTED: shows ActivationSuccess with dashboard link.
 * - FAILED: shows ActivationFailed with retry (max 3) or give-up message.
 *
 * @see Requirement 9.6: Retry via POST activation/retry (max 3 attempts).
 * @see Requirement 9.8: Manual copy fallback for activation message.
 */
export default function ActivatePage() {
  const { isAllowed } = useStepGuard(WizardStep.ACTIVATION);
  const { sessionId } = useOnboarding();

  // Activation data — placeholder values until wired end-to-end with provisioning.
  // These will ultimately come from ProvisioningResponse stored in context or session.
  const [deepLink] = useState('https://wa.me/972500000000?text=%F0%9F%9A%80%20START');
  const [activationMessage] = useState('🚀 START');

  // Retry state
  const [showGiveUp, setShowGiveUp] = useState(false);

  // Polling hook
  const { status, activationData, isPolling, error: pollingError, restart } =
    useActivationPolling(sessionId);

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
  const dashboardUrl = activationData?.dashboard_url ?? '/workspace';

  return (
    <OnboardingLayout hideNavigation>
      {status === 'CONVERSATION_STARTED' && (
        <ActivationSuccess dashboardUrl={dashboardUrl} />
      )}

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
