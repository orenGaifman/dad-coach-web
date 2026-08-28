'use client';

import Image from 'next/image';

import { useTranslations } from '@/src/i18n/useTranslations';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ActivationFailedProps {
  /** Callback invoked when the user taps the retry button. */
  onRetry: () => void;
  /** When true, max retries have been exceeded — show give-up message instead of retry. */
  showGiveUp?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ActivationFailed — failure state when WhatsApp activation times out.
 *
 * Shows a retry button until max retries are exceeded, at which point it
 * displays a reassuring give-up message and hides the retry button.
 *
 * @see Requirements 9.5, 9.6, 9.7
 */
export default function ActivationFailed({
  onRetry,
  showGiveUp = false,
}: ActivationFailedProps) {
  const { t, isRTL } = useTranslations();

  return (
    <div
      className="flex flex-col items-center text-center space-y-6 pt-4"
      role="alert"
      aria-live="polite"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Error illustration */}
      <Image
        src="/illustrations/error-state.webp"
        alt="Connection issue"
        width={150}
        height={150}
        priority
      />

      {showGiveUp ? (
        <>
          {/* Give-up state: max retries exceeded */}
          <h2 className="text-2xl font-bold text-white">
            {t('onboarding.activation.failed.reminder')}
          </h2>
          <p className="text-gray-300">
            {t('onboarding.activation.failed.closePage')}
          </p>
        </>
      ) : (
        <>
          {/* Retry state */}
          <h2 className="text-2xl font-bold text-white">
            {t('onboarding.activation.failed.noMessage')}
          </h2>
          <p className="text-gray-300">
            {t('onboarding.activation.failed.tryAgain')}
          </p>

          {/* Retry button */}
          <button
            onClick={onRetry}
            className="w-full max-w-xs px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full transition-colors"
          >
            {t('onboarding.activation.failed.tryAgain')}
          </button>
        </>
      )}
    </div>
  );
}
