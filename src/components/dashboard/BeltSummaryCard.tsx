'use client';

/**
 * BeltSummaryCard — Compact belt display for the Dashboard.
 *
 * Shows the father's current belt level, score, and progress toward the next belt.
 * The entire card is clickable and navigates to the Growth tab for full details.
 *
 * Features:
 * - Belt image from /belts/{color}-belt.webp
 * - Belt name with appropriate color styling
 * - Current XP display
 * - Progress bar showing progress to next belt
 * - Clickable card that navigates to /growth
 *
 * Requirements: 1.1 (dashboard display), 2.1 (belt progression display)
 * @see design.md - Screen D1: Dashboard Home - Belt Summary Card section
 */

import Link from 'next/link';
import Image from 'next/image';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import type { BeltLevel } from '@/src/types/growth';

/**
 * Belt thresholds defining the point ranges for each belt level.
 * Used to calculate progress percentage to the next belt.
 */
const BELT_THRESHOLDS: Record<BeltLevel, { min: number; max: number; next: BeltLevel | null }> = {
  WHITE: { min: 0, max: 500, next: 'YELLOW' },
  YELLOW: { min: 500, max: 1000, next: 'ORANGE' },
  ORANGE: { min: 1000, max: 1500, next: 'GREEN' },
  GREEN: { min: 1500, max: 2000, next: 'BLUE' },
  BLUE: { min: 2000, max: 3000, next: 'PURPLE' },
  PURPLE: { min: 3000, max: 4000, next: 'BROWN' },
  BROWN: { min: 4000, max: 5000, next: 'BLACK' },
  BLACK: { min: 5000, max: 5000, next: null }, // Mastery level
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
 * Text color classes for each belt level.
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
 * Progress bar colors for each belt level.
 */
const BELT_PROGRESS_COLORS: Record<BeltLevel, string> = {
  WHITE: 'bg-gray-400',
  YELLOW: 'bg-yellow-500',
  ORANGE: 'bg-orange-500',
  GREEN: 'bg-emerald-500',
  BLUE: 'bg-blue-500',
  PURPLE: 'bg-purple-500',
  BROWN: 'bg-amber-700',
  BLACK: 'bg-gray-200',
};

/**
 * Helper function to combine class names.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Calculate progress percentage to the next belt.
 *
 * @param belt - Current belt level
 * @param score - Current XP/growth score
 * @returns Progress percentage (0-100)
 */
function calculateBeltProgress(belt: BeltLevel, score: number): number {
  const threshold = BELT_THRESHOLDS[belt];

  // BLACK belt is mastery - always 100%
  if (belt === 'BLACK') {
    return 100;
  }

  // Calculate progress within the current belt range
  const rangeSize = threshold.max - threshold.min;
  const progressInRange = score - threshold.min;
  const percentage = (progressInRange / rangeSize) * 100;

  // Clamp between 0 and 100
  return Math.min(100, Math.max(0, percentage));
}

/**
 * Get the belt image path.
 *
 * @param belt - Belt level
 * @returns Path to the belt image asset
 */
function getBeltImagePath(belt: BeltLevel): string {
  return `/belts/${(belt ?? 'WHITE').toLowerCase()}-belt.webp`;
}

/**
 * Props for the BeltSummaryCard component.
 */
export interface BeltSummaryCardProps {
  /** Current belt level */
  belt: BeltLevel;
  /** Current XP/growth score */
  score: number;
  /** Additional CSS classes for the card container */
  className?: string;
}

/**
 * BeltSummaryCard component.
 *
 * A compact card showing the father's current belt, score, and progress.
 * Clicking the card navigates to the Growth tab (/growth) for more details.
 *
 * @example
 * <BeltSummaryCard belt="GREEN" score={1750} />
 *
 * @example
 * // With custom styling
 * <BeltSummaryCard belt="YELLOW" score={650} className="mt-4" />
 */
export function BeltSummaryCard({ belt, score, className }: BeltSummaryCardProps) {
  const safeBelt = belt ?? 'WHITE';
  const safeScore = score ?? 0;
  const threshold = BELT_THRESHOLDS[safeBelt];
  const progress = calculateBeltProgress(safeBelt, safeScore);
  const isMaxBelt = safeBelt === 'BLACK';

  return (
    <Link
      href="/growth"
      className={classNames(
        'block bg-[#1E293B] rounded-2xl p-4 border border-white/5',
        'hover:bg-[#2D3B4F] transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0F172A]',
        className
      )}
      aria-label={`View growth details. Current belt: ${BELT_DISPLAY_NAMES[safeBelt]}, ${safeScore.toLocaleString()} XP`}
    >
      {/* Label */}
      <p className="text-sm text-gray-400 mb-3">Your Belt</p>

      {/* Belt info row */}
      <div className="flex items-center gap-4">
        {/* Belt image */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <Image
            src={getBeltImagePath(safeBelt)}
            alt={BELT_DISPLAY_NAMES[safeBelt]}
            width={48}
            height={48}
            className="object-contain"
            priority
          />
        </div>

        {/* Belt details */}
        <div className="flex-1 min-w-0">
          {/* Belt name */}
          <p className={classNames('font-semibold', BELT_TEXT_COLORS[safeBelt])}>
            {BELT_DISPLAY_NAMES[safeBelt]}
          </p>

          {/* Progress bar */}
          <div className="mt-2">
            <ProgressBar
              value={progress}
              color={BELT_PROGRESS_COLORS[belt]}
              height="sm"
              label={
                isMaxBelt
                  ? 'Belt mastery achieved'
                  : `Belt progress: ${Math.round(progress)}%`
              }
            />
          </div>

          {/* XP display */}
          <p className="text-xs text-gray-500 mt-1">
            {isMaxBelt ? (
              "Dad Sensei - You've mastered it!"
            ) : (
              <>
                {(score ?? 0).toLocaleString()}/{(threshold?.max ?? 0).toLocaleString()} XP
              </>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}
