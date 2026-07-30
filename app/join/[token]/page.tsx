'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ApiError } from '@/src/lib/api-client';
import { setCsrfToken, setStoredSessionId } from '@/src/lib/api-client';
import InvitationError from '@/src/components/onboarding/InvitationError';
import WelcomeScreen from '@/src/components/onboarding/WelcomeScreen';
import { useOnboarding } from '@/src/components/onboarding/OnboardingProvider';
import { createSession, validateInvitation } from '@/src/services/onboarding';
import { WizardStep } from '@/src/types/onboarding';
import type { InvitationValidation } from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// State types
// ---------------------------------------------------------------------------

type PageState = 'loading' | 'valid' | 'error';

type ErrorKind = 'invalid' | 'expired' | 'rate_limited' | 'offline';

type SessionError = 'duplicate' | 'server' | null;

interface ErrorInfo {
  kind: ErrorKind;
  message: string;
  reason?: string;
  retryAfterSeconds?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapApiErrorToInfo(err: unknown): ErrorInfo {
  if (err instanceof ApiError) {
    switch (err.status) {
      case 404:
        return {
          kind: 'invalid',
          message:
            "This invitation link isn't valid. Please check with the person who shared it.",
        };
      case 410:
        return {
          kind: 'expired',
          message: err.body.message ?? 'This invitation has expired or has already been used.',
          reason: err.body.code,
        };
      case 429:
        return {
          kind: 'rate_limited',
          message: `Too many attempts. Please try again in ${err.body.retry_after ?? 5} minutes.`,
          retryAfterSeconds: err.body.retry_after ? err.body.retry_after * 60 : 300,
        };
      default:
        return {
          kind: 'offline',
          message: 'Something went wrong. Please check your connection and try again.',
        };
    }
  }

  return {
    kind: 'offline',
    message: 'You appear to be offline. Please check your connection and try again.',
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InvitationPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const router = useRouter();
  const { setSessionId, setCurrentStep } = useOnboarding();

  const [state, setState] = useState<PageState>('loading');
  const [validation, setValidation] = useState<InvitationValidation | null>(null);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionError, setSessionError] = useState<SessionError>(null);

  // ---------------------------------------------------------------------------
  // Validate invitation
  // ---------------------------------------------------------------------------
  const performValidation = useCallback(() => {
    setState('loading');
    setErrorInfo(null);

    validateInvitation(token)
      .then((result) => {
        setValidation(result);
        setState('valid');
      })
      .catch((err: unknown) => {
        setErrorInfo(mapApiErrorToInfo(err));
        setState('error');
      });
  }, [token]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function validate() {
      try {
        const result = await validateInvitation(token);
        if (!cancelled) {
          setValidation(result);
          setState('valid');
        }
      } catch (err: unknown) {
        if (cancelled) return;
        setErrorInfo(mapApiErrorToInfo(err));
        setState('error');
      }
    }

    validate();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ---------------------------------------------------------------------------
  // Session creation handler
  // ---------------------------------------------------------------------------
  const handleGetStarted = useCallback(async () => {
    setIsCreatingSession(true);
    setSessionError(null);

    try {
      const session = await createSession(token);
      setSessionId(session.session_id);
      setStoredSessionId(session.session_id);
      setCsrfToken(session.csrf_token);
      setCurrentStep(WizardStep.LANGUAGE);
      // Success (201): navigate to language step
      router.push(`/join/${token}/language`);
    } catch (err: unknown) {
      setIsCreatingSession(false);

      if (err instanceof ApiError && err.status === 409) {
        // Duplicate — phone already registered
        setSessionError('duplicate');
      } else {
        // 5xx or network error
        setSessionError('server');
      }
    }
  }, [token, router]);

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------
  if (state === 'loading') {
    return (
      <div aria-busy="true" aria-label="Validating invitation" className="space-y-6 pt-8">
        {/* Illustration placeholder */}
        <div className="animate-pulse bg-white/10 rounded-2xl h-48 w-full" />
        {/* Text line 1 */}
        <div className="animate-pulse bg-white/10 rounded-2xl h-6 w-3/4" />
        {/* Text line 2 */}
        <div className="animate-pulse bg-white/10 rounded-2xl h-4 w-1/2" />
        {/* Button placeholder */}
        <div className="animate-pulse bg-white/10 rounded-2xl h-12 w-full mt-4" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error states
  // ---------------------------------------------------------------------------
  if (state === 'error' && errorInfo) {
    return (
      <InvitationError
        kind={errorInfo.kind}
        message={errorInfo.message}
        reason={errorInfo.reason}
        retryAfterSeconds={errorInfo.retryAfterSeconds}
        onRetry={performValidation}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Valid invitation — WelcomeScreen + session error messages
  // ---------------------------------------------------------------------------
  if (state === 'valid' && validation) {
    return (
      <>
        <WelcomeScreen
          inviterName={validation.inviter_display_name}
          onGetStarted={handleGetStarted}
          isLoading={isCreatingSession}
        />

        {/* Session creation error messages */}
        {sessionError === 'duplicate' && (
          <div
            role="alert"
            className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-center"
          >
            <p className="text-amber-200 text-sm">
              This phone number is already registered. Would you like to{' '}
              <a
                href="/login"
                className="underline font-medium text-amber-400 hover:text-amber-300"
              >
                log in instead
              </a>
              ?
            </p>
          </div>
        )}

        {sessionError === 'server' && (
          <div
            role="alert"
            className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-center"
          >
            <p className="text-red-200 text-sm">
              Something went wrong. Please try again.
            </p>
          </div>
        )}
      </>
    );
  }

  return null;
}
