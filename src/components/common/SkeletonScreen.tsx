'use client';

/**
 * Helper function to combine class names, filtering out undefined/null values.
 * A lightweight alternative to clsx/classnames.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Base skeleton styles for the dark navy theme.
 * Uses slate-700 for visibility on dark backgrounds with animate-pulse shimmer effect.
 */
const baseSkeletonClasses = 'animate-pulse rounded bg-slate-700';

/* --------------------------------------------------------------------------
 * SkeletonText
 * --------------------------------------------------------------------------
 * Text placeholder component for single lines of text.
 * 
 * @param width - Tailwind width class (e.g., 'w-full', 'w-1/2', 'w-24'). Defaults to 'w-full'.
 * @param className - Additional CSS classes for customization.
 * 
 * Requirements: 17.1 - Loading uses skeleton screens matching final layout.
 */

interface SkeletonTextProps {
  /** Tailwind width class (e.g., 'w-full', 'w-1/2', 'w-24') */
  width?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SkeletonText — A text line placeholder with shimmer animation.
 * 
 * Use for loading states where text content will appear.
 * Height is sized appropriately for single-line text (h-4, ~16px).
 * 
 * @example
 * <SkeletonText width="w-1/2" />
 * <SkeletonText width="w-full" />
 * <SkeletonText width="w-24" />
 */
export function SkeletonText({ width = 'w-full', className }: SkeletonTextProps) {
  return (
    <div
      className={classNames(baseSkeletonClasses, 'h-4', width, className)}
      aria-hidden="true"
    />
  );
}

/* --------------------------------------------------------------------------
 * SkeletonCard
 * --------------------------------------------------------------------------
 * Card placeholder component matching the workspace card styles.
 * 
 * @param className - Additional CSS classes for sizing and customization.
 * @param children - Optional children to render inside the card skeleton.
 * 
 * Requirements: 17.1 - Loading uses skeleton screens matching final layout.
 */

interface SkeletonCardProps {
  /** Additional CSS classes for sizing/styling */
  className?: string;
  /** Optional children for custom skeleton content within the card */
  children?: React.ReactNode;
}

/**
 * SkeletonCard — A card-shaped placeholder with shimmer animation.
 * 
 * Matches the workspace card styles: rounded-2xl, dark background (bg-[#1E293B]),
 * subtle border (border-white/5), and standard padding (p-4).
 * 
 * Can be used empty (solid shimmer) or with children for custom internal layouts.
 * 
 * @example
 * // Simple card placeholder
 * <SkeletonCard className="h-32" />
 * 
 * // Card with custom internal skeleton layout
 * <SkeletonCard>
 *   <SkeletonAvatar size="md" />
 *   <SkeletonText width="w-3/4" />
 * </SkeletonCard>
 */
export function SkeletonCard({ className, children }: SkeletonCardProps) {
  // If children are provided, render them inside a card-styled container
  if (children) {
    return (
      <div
        className={classNames(
          'rounded-2xl border border-white/5 bg-[#1E293B] p-4',
          className
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    );
  }

  // Otherwise, render as a solid shimmer card
  return (
    <div
      className={classNames(
        baseSkeletonClasses,
        'rounded-2xl border border-white/5',
        className
      )}
      aria-hidden="true"
    />
  );
}

/* --------------------------------------------------------------------------
 * SkeletonList
 * --------------------------------------------------------------------------
 * List placeholder component showing multiple list item skeletons.
 * 
 * @param count - Number of list items to display. Defaults to 3.
 * @param className - Additional CSS classes for the container.
 * 
 * Requirements: 17.1 - Loading uses skeleton screens matching final layout.
 */

interface SkeletonListProps {
  /** Number of list items to render (default: 3) */
  count?: number;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * SkeletonList — A list of placeholder items with shimmer animation.
 * 
 * Each item shows a common list pattern: left circle (avatar/icon),
 * right side with title and subtitle text lines.
 * 
 * @example
 * <SkeletonList count={5} />
 * <SkeletonList /> // Defaults to 3 items
 */
export function SkeletonList({ count = 3, className }: SkeletonListProps) {
  return (
    <div className={classNames('space-y-3', className)} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#1E293B] p-3"
        >
          {/* Avatar/icon placeholder */}
          <div className={classNames(baseSkeletonClasses, 'h-10 w-10 flex-shrink-0 rounded-full')} />
          
          {/* Text content placeholder */}
          <div className="flex-1 space-y-2">
            <div className={classNames(baseSkeletonClasses, 'h-4 w-3/4')} />
            <div className={classNames(baseSkeletonClasses, 'h-3 w-1/2')} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * SkeletonAvatar
 * --------------------------------------------------------------------------
 * Circular avatar placeholder for profile pictures or icons.
 * 
 * @param size - Size variant: 'sm' (32px), 'md' (48px), 'lg' (64px). Defaults to 'md'.
 * @param className - Additional CSS classes.
 * 
 * Requirements: 17.1 - Loading uses skeleton screens matching final layout.
 */

interface SkeletonAvatarProps {
  /** Size of the avatar: 'sm' (32px), 'md' (48px), 'lg' (64px) */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const avatarSizeClasses = {
  sm: 'h-8 w-8',   // 32px
  md: 'h-12 w-12', // 48px
  lg: 'h-16 w-16', // 64px
} as const;

/**
 * SkeletonAvatar — A circular avatar placeholder with shimmer animation.
 * 
 * Use for user profile pictures, coach avatars, or circular icon placeholders.
 * 
 * @example
 * <SkeletonAvatar size="sm" />
 * <SkeletonAvatar size="md" />
 * <SkeletonAvatar size="lg" />
 */
export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  return (
    <div
      className={classNames(
        baseSkeletonClasses,
        'rounded-full',
        avatarSizeClasses[size],
        className
      )}
      aria-hidden="true"
    />
  );
}

/* --------------------------------------------------------------------------
 * SkeletonButton
 * --------------------------------------------------------------------------
 * Button placeholder for action buttons.
 * 
 * @param size - Size variant: 'sm', 'md', 'lg'. Defaults to 'md'.
 * @param className - Additional CSS classes.
 * 
 * Requirements: 17.1 - Loading uses skeleton screens matching final layout.
 */

interface SkeletonButtonProps {
  /** Size of the button: 'sm', 'md', 'lg' */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const buttonSizeClasses = {
  sm: 'h-8 w-20',   // Small button
  md: 'h-10 w-28',  // Medium button (default)
  lg: 'h-12 w-36',  // Large button
} as const;

/**
 * SkeletonButton — A button-shaped placeholder with shimmer animation.
 * 
 * Use for loading states where action buttons will appear.
 * Includes rounded corners matching typical button styling.
 * 
 * @example
 * <SkeletonButton size="sm" />
 * <SkeletonButton size="md" />
 * <SkeletonButton size="lg" />
 */
export function SkeletonButton({ size = 'md', className }: SkeletonButtonProps) {
  return (
    <div
      className={classNames(
        baseSkeletonClasses,
        'rounded-lg',
        buttonSizeClasses[size],
        className
      )}
      aria-hidden="true"
    />
  );
}

/* --------------------------------------------------------------------------
 * SkeletonBlock
 * --------------------------------------------------------------------------
 * Flexible rectangular block placeholder for custom shapes.
 * 
 * @param className - CSS classes for width, height, and styling.
 * 
 * Requirements: 17.1 - Loading uses skeleton screens matching final layout.
 */

interface SkeletonBlockProps {
  /** CSS classes for width, height, and styling */
  className?: string;
}

/**
 * SkeletonBlock — A flexible rectangular placeholder with shimmer animation.
 * 
 * Use for custom-shaped placeholders that don't fit other skeleton types.
 * You control all dimensions via className.
 * 
 * @example
 * <SkeletonBlock className="h-32 w-full" />
 * <SkeletonBlock className="h-4 w-24 rounded-full" />
 */
export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      className={classNames(baseSkeletonClasses, className)}
      aria-hidden="true"
    />
  );
}
