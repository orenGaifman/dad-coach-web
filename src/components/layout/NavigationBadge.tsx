'use client';

/**
 * Props for the NavigationBadge component.
 */
interface NavigationBadgeProps {
  /** Number of unread notifications */
  count: number;
  /** If true, show a simple dot instead of the count */
  showDot?: boolean;
  /** Maximum number to display before showing "{maxCount}+" (defaults to 9) */
  maxCount?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * NavigationBadge — notification count badge component.
 *
 * Features:
 * - Displays unread notification count from workspace summary
 * - Can show as a dot or numeric count
 * - Shows "{maxCount}+" when count exceeds maxCount
 * - Teal color (NEVER red to avoid alarm per design requirements)
 * - Positioned absolutely in top-right corner (parent should be relative)
 * - Accessible with aria-label for screen readers
 *
 * Usage:
 * ```tsx
 * <div className="relative">
 *   <TabIcon />
 *   <NavigationBadge count={5} />
 * </div>
 * ```
 *
 * Requirements covered:
 * - 12.3: Unread count visible in navigation badge
 * - 12.4: Badge is simple dot or count — never red, never aggressive
 */
export default function NavigationBadge({
  count,
  showDot = false,
  maxCount = 9,
  className = '',
}: NavigationBadgeProps) {
  // Don't render anything if count is 0
  if (count <= 0) {
    return null;
  }

  // Determine the display value
  const displayValue = showDot ? null : count > maxCount ? `${maxCount}+` : count;

  // Determine aria-label for accessibility
  const ariaLabel = count === 1 
    ? '1 unread notification' 
    : `${count} unread notifications`;

  // Base styles for positioning and color
  // - Absolute positioning in top-right corner
  // - Teal background (never red per design requirements)
  // - White text
  const baseStyles = 'absolute -top-1 -right-1 flex items-center justify-center bg-teal-500 text-white';

  // Dot variant: small circle (~8px)
  if (showDot) {
    return (
      <span
        className={`${baseStyles} h-2 w-2 rounded-full ${className}`}
        aria-label={ariaLabel}
        role="status"
      />
    );
  }

  // Count variant: pill shape with number
  // - Larger width for multiple digits (like "9+")
  // - Min-width ensures single digits look good
  // - Text-xs for compact size
  const isMultiDigit = displayValue !== null && String(displayValue).length > 1;

  return (
    <span
      className={`
        ${baseStyles}
        min-w-[18px] rounded-full px-1.5 py-0.5
        text-xs font-semibold leading-none
        ${isMultiDigit ? 'min-w-[22px]' : ''}
        ${className}
      `}
      aria-label={ariaLabel}
      role="status"
    >
      {displayValue}
    </span>
  );
}
