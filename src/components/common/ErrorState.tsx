'use client';

import Image from 'next/image';

/**
 * Helper function to combine class names, filtering out undefined/null values.
 * A lightweight alternative to clsx/classnames.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Error type determines the appropriate message and illustration */
type ErrorType = 'error' | 'network' | 'offline';

/**
 * Props for the ErrorState component.
 */
interface ErrorStateProps {
  /** Type of error: 'error' (general/server), 'network', or 'offline'. Defaults to 'error'. */
  type?: ErrorType;
  /** Custom title (overrides default per type) */
  title?: string;
  /** Custom description (overrides default per type) */
  description?: string;
  /** Retry callback - shows retry button when provided */
  onRetry?: () => void;
  /** Additional container styling */
  className?: string;
}

/** Default content configuration per error type */
const ERROR_DEFAULTS: Record<
  ErrorType,
  { imageSrc: string; title: string; description: string }
> = {
  error: {
    imageSrc: '/illustrations/error-state.webp',
    title: 'Something went wrong',
    description: "We hit a bump. Let's try that again.",
  },
  network: {
    imageSrc: '/illustrations/error-state.webp',
    title: 'Connection problem',
    description:
      "We're having trouble connecting. Check your internet and try again.",
  },
  offline: {
    imageSrc: '/illustrations/offline-state.webp',
    title: "You're offline",
    description: "We'll be here when you're back.",
  },
};

/**
 * ErrorState — A reusable error display component with warm, supportive messaging.
 *
 * Displays a centered layout with an illustration, title, description, and optional
 * retry button. Designed for the dark navy theme with copy that follows the product's
 * Tone of Voice: warm, supportive, and encouraging — speaking to dads like a trusted
 * coach who has their back.
 *
 * Illustrations:
 * - `/illustrations/error-state.webp` - For general and network errors
 * - `/illustrations/offline-state.webp` - For offline state
 *
 * Error types and their default messages:
 * - `error` (general/server): "Something went wrong" / "We hit a bump. Let's try that again."
 * - `network`: "Connection problem" / "We're having trouble connecting. Check your internet and try again."
 * - `offline`: "You're offline" / "We'll be here when you're back."
 *
 * Requirements:
 * - 17.2 - Network errors SHALL display: "We can't connect right now. We'll be back shortly." with optional retry.
 * - 17.3 - Server errors (5xx) SHALL display: "Something didn't work on our end. Your progress is safe." with retry.
 * - 17.4 - All error copy SHALL follow the product's Tone of Voice.
 *
 * @example
 * // Simple error state with retry
 * <ErrorState onRetry={() => refetch()} />
 *
 * @example
 * // Offline state
 * <ErrorState type="offline" />
 *
 * @example
 * // Network error with custom description
 * <ErrorState
 *   type="network"
 *   description="We can't connect right now. We'll be back shortly."
 *   onRetry={() => refetch()}
 * />
 *
 * @example
 * // Fully customized error state
 * <ErrorState
 *   type="error"
 *   title="Oops, that didn't work"
 *   description="Your progress is safe. Let's try again."
 *   onRetry={() => handleRetry()}
 *   className="my-8"
 * />
 */
export function ErrorState({
  type = 'error',
  title,
  description,
  onRetry,
  className,
}: ErrorStateProps) {
  const defaults = ERROR_DEFAULTS[type];

  const displayTitle = title ?? defaults.title;
  const displayDescription = description ?? defaults.description;
  const imageSrc = defaults.imageSrc;

  return (
    <div
      className={classNames(
        'flex flex-col items-center justify-center text-center',
        'px-4 py-8',
        className
      )}
      role="alert"
      aria-label={displayTitle}
    >
      {/* Error illustration */}
      <div className="mb-6">
        <Image
          src={imageSrc}
          alt={type === 'offline' ? 'You are offline' : 'Something went wrong'}
          width={150}
          height={150}
          className="mx-auto"
          priority={false}
        />
      </div>

      {/* Title - warm, encouraging heading */}
      <h3 className="text-lg font-semibold text-white mb-2">{displayTitle}</h3>

      {/* Description - secondary muted text */}
      <p className="text-gray-400 text-sm max-w-xs mb-6">{displayDescription}</p>

      {/* Retry button (if onRetry provided) - teal accent */}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={classNames(
            'inline-flex items-center justify-center',
            'px-6 py-3 rounded-xl',
            'bg-teal-500 hover:bg-teal-600',
            'text-white font-medium',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0F172A]'
          )}
        >
          Try again
        </button>
      )}
    </div>
  );
}
