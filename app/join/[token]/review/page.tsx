'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { OnboardingLayout } from '@/src/components/onboarding/OnboardingLayout';
import { useOnboarding } from '@/src/components/onboarding/OnboardingProvider';
import { ReviewSummary } from '@/src/components/onboarding/ReviewSummary';
import { useStepGuard } from '@/src/hooks/useStepGuard';
import { useTranslations } from '@/src/i18n/useTranslations';
import { completeOnboarding, getSession } from '@/src/services/onboarding';
import { ApiError } from '@/src/lib/api-client';
import { getStoredSessionId } from '@/src/lib/api-client';
import { ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { WizardStep } from '@/src/types/onboarding';
import type { SessionState } from '@/src/types/onboarding';

/**
 * Review & Confirm page — displays all submitted data for review before activation.
 *
 * Handles:
 * - Fetching session data to display in ReviewSummary
 * - Edit links that navigate back to specific steps (preserving all data)
 * - On return from edit, user comes back to Review
 * - "Confirm & Start" submission: calls completeOnboarding, shows provisioning loading state
 *
 * @see Requirement 8.3: Each section has "Edit" link that navigates back to that step
 * @see Requirement 8.4: "Confirm & Start" triggers POST /api/v1/onboarding/sessions/{id}/complete
 * @see Requirement 8.5: Duplicate submission prevention — button disables on click; 409 treated as success
 * @see Requirement 8.7: During provisioning, show "Setting up your coaching..." loading state
 * @see Requirement 12.6: On return from edit, come back to Review
 */
export default function ReviewPage() {
  const { isAllowed } = useStepGuard(WizardStep.REVIEW);
  const { t } = useTranslations();
  const {
    sessionId,
    language,
    markStepCompleted,
    goForward,
    setCurrentStep,
    setEditingFromReview,
  } = useOnboarding();
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [sessionData, setSessionData] = useState<SessionState['data'] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  // Fetch session data on mount to populate the review summary
  useEffect(() => {
    const sid = sessionId || getStoredSessionId();
    if (!sid) return;

    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const session = await getSession(sid!);
        if (!cancelled) {
          // The backend returns wizard_data_summary; map it to the expected format
          const raw = session as unknown as Record<string, unknown>;
          const summary = raw.wizard_data_summary as Record<string, unknown> | undefined;
          if (summary) {
            setSessionData({
              father_profile: summary.display_name ? {
                display_name: summary.display_name as string,
                phone_number: summary.phone_masked as string || '',
                timezone: 'Asia/Jerusalem',
              } : undefined,
              children: summary.children_count && (summary.children_count as number) > 0
                ? [{ name: `${summary.children_count} child(ren)`, birth_date: '' }]
                : undefined,
              goals: summary.goals_count && (summary.goals_count as number) > 0
                ? { selected_goals: ['Goals configured'] }
                : undefined,
            });
          } else {
            setSessionData(session.data);
          }
        }
      } catch {
        if (!cancelled) {
          setLoadError('Could not load your data. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [sessionId]);

  /**
   * Handle Edit click — navigate back to the specific step.
   * Sets editingFromReview flag so that step pages know to return
   * directly to Review after submission instead of calling goForward().
   */
  const handleEdit = useCallback(
    (step: WizardStep) => {
      setEditingFromReview(true);
      setCurrentStep(step);

      const stepDef = ONBOARDING_STEPS.find((s) => s.name === step);
      if (stepDef && token) {
        router.push(`/join/${token}/${stepDef.path}`);
      }
    },
    [setEditingFromReview, setCurrentStep, router, token],
  );

  /**
   * Handle "Confirm & Start" submission.
   *
   * - Disables button immediately (isProvisioning = true)
   * - Calls completeOnboarding(sessionId)
   * - Shows "Setting up your coaching..." loading state during provisioning
   * - On success: marks step completed and navigates to activate
   * - On 409 (duplicate): treats as success (idempotent)
   * - On other errors: shows error message with retry option
   *
   * @see Requirement 8.4, 8.5, 8.7
   */
  const handleConfirm = useCallback(async () => {
    const sid = sessionId || getStoredSessionId();
    if (!sid || isProvisioning) return;

    setIsProvisioning(true);
    setProvisionError(null);

    try {
      const response = await completeOnboarding(sid);
      // Store data for subsequent pages (activation and calendar)
      if (typeof window !== 'undefined' && response) {
        // Try whatsapp_deep_link first, fall back to deep_link
        const deepLink = response.whatsapp_deep_link || response.deep_link;
        if (deepLink) {
          localStorage.setItem('dadcoach_deep_link', deepLink);
        }
        if (response.activation_message) {
          localStorage.setItem('dadcoach_activation_message', response.activation_message);
        }
        // Store father_id for calendar connection step
        if (response.father_id) {
          localStorage.setItem('dadcoach_father_id', String(response.father_id));
        }
      }
      markStepCompleted(WizardStep.REVIEW);
      goForward(); // → activate
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Idempotent — treat duplicate submission as success
        markStepCompleted(WizardStep.REVIEW);
        goForward();
      } else {
        setIsProvisioning(false);
        setProvisionError(t('onboarding.review.error'));
      }
    }
  }, [sessionId, isProvisioning, markStepCompleted, goForward]);

  if (!isAllowed) return null;

  // Provisioning loading state (Req 8.7)
  if (isProvisioning) {
    return (
      <OnboardingLayout isStepValid={false} hideNavigation>
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div
            className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"
            role="status"
            aria-label={t('onboarding.review.provisioning')}
          />
          <p className="text-white text-lg font-medium">{t('onboarding.review.provisioning')}</p>
          <p className="text-gray-400 text-sm">{t('onboarding.review.provisioningSubtitle')}</p>
        </div>
      </OnboardingLayout>
    );
  }

  if (isLoading) {
    return (
      <OnboardingLayout isStepValid={false}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-gray-400 text-sm">{t('onboarding.review.loading')}</div>
        </div>
      </OnboardingLayout>
    );
  }

  if (loadError) {
    return (
      <OnboardingLayout isStepValid={false}>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center" role="alert">
          <p className="text-red-300 text-sm">{loadError}</p>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      isStepValid={!isProvisioning}
      continueLabel={t('onboarding.review.confirmButton')}
      onContinue={handleConfirm}
    >
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">{t('onboarding.review.title')}</h1>
          <p className="text-gray-400 text-sm">
            {t('onboarding.review.subtitle')}
          </p>
        </div>

        <ReviewSummary
          sessionData={sessionData}
          language={language ?? 'en'}
          onEdit={handleEdit}
        />

        {/* Provisioning error message (Req 8.6) */}
        {provisionError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center" role="alert">
            <p className="text-red-300 text-sm">{provisionError}</p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}
