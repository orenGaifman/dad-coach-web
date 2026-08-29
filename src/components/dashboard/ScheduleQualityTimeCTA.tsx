'use client';

/**
 * ScheduleQualityTimeCTA — Primary action button for scheduling Quality Time.
 *
 * A prominent call-to-action button that opens the scheduling modal
 * when clicked. Designed to draw attention as the main action fathers
 * should take on the dashboard.
 *
 * Features:
 * - Primary teal color theme for visibility
 * - Accessible with proper ARIA labels
 * - Disabled state support
 * - Customizable via className prop
 *
 * Requirements: 13.4 - THE frontend SHALL include a "Schedule Quality Time"
 * primary action button that opens a calendar picker.
 *
 * @see design.md - Screen D1: Dashboard Home
 */

import { classNames } from '@/src/utils/classNames';

/**
 * Props for the ScheduleQualityTimeCTA component.
 */
export interface ScheduleQualityTimeCTAProps {
  /** Callback when the button is clicked to open the scheduling modal */
  onClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the button */
  className?: string;
}

/**
 * Calendar icon component for the CTA button.
 */
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

/**
 * ScheduleQualityTimeCTA component.
 *
 * A primary action button for scheduling Quality Time sessions.
 * Designed to be prominent and encourage fathers to schedule
 * their next Quality Time with their children.
 *
 * @example
 * // Basic usage
 * <ScheduleQualityTimeCTA onClick={() => setIsModalOpen(true)} />
 *
 * @example
 * // With disabled state
 * <ScheduleQualityTimeCTA
 *   onClick={() => setIsModalOpen(true)}
 *   disabled={isLoading}
 * />
 *
 * @example
 * // With custom styling
 * <ScheduleQualityTimeCTA
 *   onClick={() => setIsModalOpen(true)}
 *   className="w-full"
 * />
 */
export function ScheduleQualityTimeCTA({
  onClick,
  disabled = false,
  className,
}: ScheduleQualityTimeCTAProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        'inline-flex items-center justify-center gap-2',
        'py-3 px-6 rounded-xl',
        'text-white font-medium',
        'transition-colors duration-200',
        // Primary teal color theme
        disabled
          ? 'bg-teal-500/50 cursor-not-allowed'
          : 'bg-teal-500 hover:bg-teal-600',
        // Focus ring for accessibility
        'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0F172A]',
        className
      )}
      aria-label="Schedule Quality Time with your child"
    >
      <CalendarIcon className="h-5 w-5" />
      Schedule Quality Time
    </button>
  );
}
