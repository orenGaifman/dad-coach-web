'use client';

import Image from 'next/image';

/**
 * Helper function to combine class names, filtering out undefined/null values.
 * A lightweight alternative to clsx/classnames.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Props for the EmptyState component.
 */
interface EmptyStateProps {
  /** Optional path to illustration image (e.g., '/dashboard/dashboard-empty.webp') */
  imageSrc?: string;
  /** Main message heading - should use warm, encouraging copy */
  title: string;
  /** Optional secondary message providing more context */
  description?: string;
  /** Optional action button with label and click handler */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Additional container styling */
  className?: string;
  /** Alt text for the image (defaults to empty string for decorative images) */
  imageAlt?: string;
  /** Image width in pixels (defaults to 200) */
  imageWidth?: number;
  /** Image height in pixels (defaults to 200) */
  imageHeight?: number;
}

/**
 * EmptyState — A reusable empty state component with warm, supportive messaging.
 *
 * Displays a centered layout with an optional illustration, title, description,
 * and action button. Designed for the dark navy theme with warm, encouraging copy
 * that speaks to fathers like a trusted coach.
 *
 * Empty state images are available at:
 * - `/dashboard/dashboard-empty.webp`
 * - `/dashboard/growth-empty.webp`
 * - `/dashboard/insights-empty.webp`
 *
 * Example messages following the Tone of Voice:
 * - "No activities yet — your journey starts with one small step"
 * - "Nothing here yet — every dad starts somewhere"
 * - "Start your fatherhood journey"
 *
 * Requirements: 17.7 - Every screen SHALL have a designed empty state using warm, inviting language.
 *
 * @example
 * // Simple empty state with just title
 * <EmptyState title="Nothing here yet — every dad starts somewhere" />
 *
 * @example
 * // Full empty state with all options
 * <EmptyState
 *   imageSrc="/dashboard/dashboard-empty.webp"
 *   title="Your journey begins on WhatsApp"
 *   description="This dashboard will track your progress as you grow."
 *   action={{
 *     label: "Open WhatsApp",
 *     onClick: () => window.open('https://wa.me/...')
 *   }}
 * />
 */
export function EmptyState({
  imageSrc,
  title,
  description,
  action,
  className,
  imageAlt = '',
  imageWidth = 200,
  imageHeight = 200,
}: EmptyStateProps) {
  return (
    <div
      className={classNames(
        'flex flex-col items-center justify-center text-center',
        'px-4 py-8',
        className
      )}
      role="status"
      aria-label={title}
    >
      {/* Illustration image (if provided) */}
      {imageSrc && (
        <div className="mb-6">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={imageWidth}
            height={imageHeight}
            className="mx-auto"
            priority={false}
          />
        </div>
      )}

      {/* Title - warm, encouraging heading */}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

      {/* Description - secondary muted text */}
      {description && (
        <p className="text-gray-400 text-sm max-w-xs mb-6">{description}</p>
      )}

      {/* Action button (if provided) - teal accent */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={classNames(
            'inline-flex items-center justify-center',
            'px-6 py-3 rounded-xl',
            'bg-teal-500 hover:bg-teal-600',
            'text-white font-medium',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0F172A]'
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
