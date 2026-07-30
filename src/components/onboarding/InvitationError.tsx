'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InvitationErrorProps {
  kind: 'invalid' | 'expired' | 'rate_limited' | 'offline';
  message: string;
  reason?: string;
  retryAfterSeconds?: number;
  onRetry?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format seconds into M:SS display string. */
function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Map error kind to a heading string. */
function getHeading(kind: InvitationErrorProps['kind']): string {
  switch (kind) {
    case 'invalid':
      return 'Invalid Invitation';
    case 'expired':
      return 'Invitation Expired';
    case 'rate_limited':
      return 'Too Many Attempts';
    case 'offline':
      return 'Connection Issue';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * InvitationError — renders error states for invitation validation.
 *
 * Handles:
 * - 404 (invalid token)
 * - 410 (expired / revoked / used)
 * - 429 (rate limited with countdown timer)
 * - Network offline (with retry button)
 *
 * @see Requirements 1.3, 1.4, 1.5, 1.6
 */
export default function InvitationError({
  kind,
  message,
  retryAfterSeconds,
  onRetry,
}: InvitationErrorProps) {
  const [countdown, setCountdown] = useState(retryAfterSeconds ?? 0);

  // Countdown timer for rate-limited state
  useEffect(() => {
    if (kind !== 'rate_limited' || countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [kind, countdown]);

  // When countdown reaches 0, auto-retry if handler provided
  const handleCountdownComplete = useCallback(() => {
    if (onRetry) onRetry();
  }, [onRetry]);

  useEffect(() => {
    if (kind === 'rate_limited' && countdown === 0 && retryAfterSeconds && retryAfterSeconds > 0) {
      handleCountdownComplete();
    }
  }, [kind, countdown, retryAfterSeconds, handleCountdownComplete]);

  // Build display message for rate-limited state
  const displayMessage =
    kind === 'rate_limited' && countdown > 0
      ? `Too many attempts. Please try again in ${formatCountdown(countdown)}.`
      : message;

  return (
    <div
      className="flex flex-col items-center text-center space-y-4 pt-8"
      role="alert"
      aria-live="polite"
    >
      {/* Error illustration */}
      <Image
        src="/illustrations/error-state.webp"
        alt="Error"
        width={200}
        height={200}
        priority
      />

      {/* Heading */}
      <h1 className="text-xl font-semibold text-white">{getHeading(kind)}</h1>

      {/* Message */}
      <p className="text-gray-300">{displayMessage}</p>

      {/* Rate-limited: show countdown or retry button */}
      {kind === 'rate_limited' && countdown <= 0 && onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium transition-colors"
        >
          Try Again
        </button>
      )}

      {/* Offline: show retry button */}
      {kind === 'offline' && onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
