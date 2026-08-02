'use client';

/**
 * BeltBadge — Small belt icon component for lists, cards, and badges.
 *
 * A reusable component that displays a belt icon with optional name label.
 * Loads belt images from /belts/{color}-belt.webp with a text fallback
 * if the image fails to load.
 *
 * Features:
 * - Three size variants: sm (24px), md (40px), lg (64px)
 * - Optional belt name display below/beside the image
 * - Graceful fallback to text initial if image fails to load
 * - Belt-colored text for fallback display
 * - Accessible alt text
 *
 * Requirements: 2.2 (belt visual representation)
 * @see design.md - Asset: /belts/{belt}-belt.webp
 */

import { useState } from 'react';
import Image from 'next/image';
import type { BeltLevel } from '@/src/types/growth';

/**
 * Size variants for the BeltBadge component.
 * - sm: 24x24 for inline/list items
 * - md: 40x40 for cards (default)
 * - lg: 64x64 for headers/detail views
 */
export type BeltBadgeSize = 'sm' | 'md' | 'lg';

/**
 * Size configuration for each variant.
 */
const SIZE_CONFIG: Record<BeltBadgeSize, { dimensions: number; textSize: string; initialSize: string }> = {
  sm: { dimensions: 24, textSize: 'text-xs', initialSize: 'text-xs' },
  md: { dimensions: 40, textSize: 'text-sm', initialSize: 'text-sm' },
  lg: { dimensions: 64, textSize: 'text-base', initialSize: 'text-lg' },
};

/**
 * Display names for each belt level.
 */
const BELT_DISPLAY_NAMES: Record<BeltLevel, string> = {
  WHITE: 'White Belt',
  YELLOW: 'Yellow Belt',
  ORANGE: 'Orange Belt',
  GREEN: 'Green Belt',
  BLUE: 'Blue Belt',
  PURPLE: 'Purple Belt',
  BROWN: 'Brown Belt',
  BLACK: 'Black Belt',
};

/**
 * Text colors for each belt level (used for fallback and name display).
 */
const BELT_TEXT_COLORS: Record<BeltLevel, string> = {
  WHITE: 'text-gray-200',
  YELLOW: 'text-yellow-400',
  ORANGE: 'text-orange-400',
  GREEN: 'text-emerald-400',
  BLUE: 'text-blue-400',
  PURPLE: 'text-purple-400',
  BROWN: 'text-amber-700',
  BLACK: 'text-gray-100',
};

/**
 * Background colors for fallback display.
 */
const BELT_BG_COLORS: Record<BeltLevel, string> = {
  WHITE: 'bg-gray-600',
  YELLOW: 'bg-yellow-900/50',
  ORANGE: 'bg-orange-900/50',
  GREEN: 'bg-emerald-900/50',
  BLUE: 'bg-blue-900/50',
  PURPLE: 'bg-purple-900/50',
  BROWN: 'bg-amber-900/50',
  BLACK: 'bg-gray-800',
};

/**
 * Helper function to combine class names, filtering out falsy values.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get the belt image path.
 *
 * @param belt - Belt level
 * @returns Path to the belt image asset
 */
function getBeltImagePath(belt: BeltLevel): string {
  return `/belts/${belt.toLowerCase()}-belt.webp`;
}

/**
 * Get the first letter of the belt level for fallback display.
 *
 * @param belt - Belt level
 * @returns First letter of the belt level (e.g., "G" for GREEN)
 */
function getBeltInitial(belt: BeltLevel): string {
  return belt.charAt(0);
}

/**
 * Props for the BeltBadge component.
 */
export interface BeltBadgeProps {
  /** The belt level to display */
  belt: BeltLevel;
  /** Size variant: 'sm' (24px), 'md' (40px, default), 'lg' (64px) */
  size?: BeltBadgeSize;
  /** Whether to show the belt name below/beside the image */
  showName?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * BeltBadge component.
 *
 * A compact belt icon component for use in lists, cards, and badges.
 * Displays the belt image with an optional name label and graceful
 * fallback to a text initial if the image fails to load.
 *
 * @example
 * // Small badge in a list
 * <BeltBadge belt="GREEN" size="sm" />
 *
 * @example
 * // With name displayed
 * <BeltBadge belt="YELLOW" size="md" showName />
 *
 * @example
 * // Large for detail view
 * <BeltBadge belt="BLACK" size="lg" />
 */
export function BeltBadge({
  belt,
  size = 'md',
  showName = false,
  className,
}: BeltBadgeProps) {
  const [imageError, setImageError] = useState(false);
  
  const sizeConfig = SIZE_CONFIG[size];
  const beltName = BELT_DISPLAY_NAMES[belt];
  const textColor = BELT_TEXT_COLORS[belt];
  const bgColor = BELT_BG_COLORS[belt];

  /**
   * Handle image load error by switching to text fallback.
   */
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className={classNames(
        'inline-flex items-center gap-2',
        showName && size === 'lg' ? 'flex-col' : '',
        className
      )}
    >
      {/* Belt image or fallback */}
      {imageError ? (
        // Text fallback when image fails to load
        <div
          className={classNames(
            'rounded-full flex items-center justify-center font-bold',
            bgColor,
            textColor,
            sizeConfig.initialSize
          )}
          style={{
            width: sizeConfig.dimensions,
            height: sizeConfig.dimensions,
          }}
          role="img"
          aria-label={beltName}
        >
          {getBeltInitial(belt)}
        </div>
      ) : (
        // Belt image
        <Image
          src={getBeltImagePath(belt)}
          alt={beltName}
          width={sizeConfig.dimensions}
          height={sizeConfig.dimensions}
          className="object-contain flex-shrink-0"
          onError={handleImageError}
        />
      )}

      {/* Optional belt name */}
      {showName && (
        <span
          className={classNames(
            'font-medium',
            textColor,
            sizeConfig.textSize
          )}
        >
          {beltName}
        </span>
      )}
    </div>
  );
}
