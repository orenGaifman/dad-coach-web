'use client';

import Image from 'next/image';

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
  return (
    <div
      className="flex flex-col items-center text-center space-y-6 pt-4"
      role="alert"
      aria-live="polite"
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
            We&apos;ll send you a reminder.
          </h2>
          <p className="text-gray-300">
            You can close this page.
          </p>
        </>
      ) : (
        <>
          {/* Retry state */}
          <h2 className="text-2xl font-bold text-white">
            We didn&apos;t receive your message.
          </h2>
          <p className="text-gray-300">
            Tap the button to try again.
          </p>

          {/* Retry button */}
          <button
            onClick={onRetry}
            className="w-full max-w-xs px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full transition-colors"
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}
