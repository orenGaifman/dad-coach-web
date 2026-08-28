'use client';

import { classNames } from '@/src/utils/classNames';

/**
 * Height variant options for the progress bar.
 */
type HeightVariant = 'sm' | 'md' | 'lg';

/**
 * Props for the ProgressBar component.
 */
interface ProgressBarProps {
  /** Progress percentage (0-100). Values outside this range will be clamped. */
  value: number;
  /** Tailwind color class for the fill (defaults to 'bg-teal-500') */
  color?: string;
  /** Tailwind color class for the background track (defaults to 'bg-slate-700') */
  bgColor?: string;
  /** Height variant: 'sm' (6px), 'md' (10px - default), 'lg' (16px) */
  height?: HeightVariant;
  /** Whether to animate the fill with a smooth transition */
  animated?: boolean;
  /** Accessible label for screen readers */
  label?: string;
  /** Whether to display the percentage text to the right of the bar */
  showValue?: boolean;
  /** Additional container styling */
  className?: string;
}

/**
 * Height class mapping for the different size variants.
 */
const heightClasses: Record<HeightVariant, string> = {
  sm: 'h-1.5', // 6px
  md: 'h-2.5', // 10px
  lg: 'h-4',   // 16px
};

/**
 * ProgressBar — A reusable progress fill bar component for the Father Workspace.
 *
 * Displays a horizontal progress bar that fills from left to right. The bar
 * never depletes — it only fills to show forward progress, aligned with the
 * app's philosophy of celebrating growth without highlighting setbacks.
 *
 * Features:
 * - Percentage-based fill (0-100, clamped to prevent overflow)
 * - Three height variants: sm (6px), md (10px), lg (16px)
 * - Customizable fill and background colors via Tailwind classes
 * - Optional smooth animation on fill changes
 * - Optional percentage text display
 * - Full ARIA accessibility support
 *
 * Requirements: 2.4 - THE progress visualization SHALL fill (never deplete).
 *
 * @example
 * // Simple progress bar with default styling
 * <ProgressBar value={65} />
 *
 * @example
 * // Animated progress bar with custom colors and label
 * <ProgressBar
 *   value={75}
 *   color="bg-emerald-500"
 *   animated
 *   label="Belt progression"
 *   showValue
 * />
 *
 * @example
 * // Small height variant
 * <ProgressBar value={30} height="sm" />
 */
export function ProgressBar({
  value,
  color = 'bg-teal-500',
  bgColor = 'bg-slate-700',
  height = 'md',
  animated = false,
  label,
  showValue = false,
  className,
}: ProgressBarProps) {
  // Clamp value between 0 and 100 to prevent overflow
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={classNames(
        'flex items-center gap-2',
        className
      )}
    >
      {/* Progress bar container */}
      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || `Progress: ${clampedValue}%`}
        className={classNames(
          'relative w-full overflow-hidden rounded-full',
          bgColor,
          heightClasses[height]
        )}
      >
        {/* Fill overlay */}
        <div
          className={classNames(
            'absolute inset-y-0 left-0 rounded-full',
            color,
            animated && 'transition-all duration-500 ease-out'
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>

      {/* Optional percentage text */}
      {showValue && (
        <span
          className="text-sm font-medium text-gray-300 min-w-[3ch] text-right"
          aria-hidden="true"
        >
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
}
