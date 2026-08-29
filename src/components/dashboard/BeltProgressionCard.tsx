'use client';

/**
 * BeltProgressionCard — Displays belt progression based on Quality Time completions.
 *
 * Shows the father's current belt level, progress bar to next belt, and
 * total Quality Time completions count. The entire card is clickable and
 * navigates to the Growth tab for full details.
 *
 * Features:
 * - Belt image from /belts/{color}-belt.webp
 * - Belt name with appropriate color styling
 * - Progress bar showing quality times completed vs threshold
 * - Total quality times completed count
 * - Clickable card that navigates to /growth
 *
 * Belt progression thresholds (SACRED — do NOT modify):
 * - WHITE: 0-2 completions
 * - YELLOW: 3-9 completions
 * - ORANGE: 10-24 completions
 * - GREEN: 25-49 completions
 * - BLUE: 50-99 completions
 * - BROWN: 100-199 completions
 * - BLACK: 200+ completions
 *
 * Requirement: 13.1
 * @see design.md - Belt Progression Display
 */

import Link from 'next/link';
import Image from 'next/image';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import type { BeltLevel } from '@/src/types/growth';
import { classNames } from '@/src/utils/classNames';

/**
 * Belt thresholds defining the completion count ranges for each belt level.
 * SACRED — These values must NOT be modified.
 */
const BELT_THRESHOLDS: Record<BeltLevel, { min: number; max: number; next: BeltLevel | null }> = {
  WHITE: { min: 0, max: 3, next: 'YELLOW' },      // 0-2 completions (max is threshold for next)
  YELLOW: { min: 3, max: 10, next: 'ORANGE' },    // 3-9 completions
  ORANGE: { min: 10, max: 25, next: 'GREEN' },    // 10-24 completions
  GREEN: { min: 25, max: 50, next: 'BLUE' },      // 25-49 completions
  BLUE: { min: 50, max: 100, next: 'BROWN' },     // 50-99 completions
  PURPLE: { min: 100, max: 150, next: 'BROWN' },  // Not used in completion-based progression
  BROWN: { min: 100, max: 200, next: 'BLACK' },   // 100-199 completions
  BLACK: { min: 200, max: 200, next: null },      // 200+ completions (Mastery level)
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
 * Calculate progress percentage to the next belt based on completion count.
 *
 * @param belt - Current belt level
 * @param completionCount - Total Quality Time completions
 * @returns Progress percentage (0-100)
 */
function calculateBeltProgress(belt: BeltLevel, completionCount: number): number {
  const threshold = BELT_THRESHOLDS[belt];

  // BLACK belt is mastery - always 100%
  if (belt === 'BLACK') {
    return 100;
  }

  // Calculate progress within the current belt range
  const rangeSize = threshold.max - threshold.min;
  const progressInRange = completionCount - threshold.min;
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
 * Get the count needed to reach the next belt.
 *
 * @param belt - Current belt level
 * @param completionCount - Current completion count
 * @returns Count remaining to next belt, or null if at BLACK belt
 */
function getCountToNextBelt(belt: BeltLevel, completionCount: number): number | null {
  const threshold = BELT_THRESHOLDS[belt];

  if (belt === 'BLACK') {
    return null;
  }

  return Math.max(0, threshold.max - completionCount);
}

/**
 * Props for the BeltProgressionCard component.
 */
export interface BeltProgressionCardProps {
  /** Current belt level */
  belt: BeltLevel;
  /** Total Quality Time completions count */
  completionCount: number;
  /** Additional CSS classes for the card container */
  className?: string;
}

/**
 * BeltProgressionCard component.
 *
 * A card showing the father's current belt, progress to next belt based on
 * Quality Time completions. Clicking the card navigates to the Growth tab
 * (/growth) for more details.
 *
 * @example
 * <BeltProgressionCard belt="GREEN" completionCount={32} />
 *
 * @example
 * // With custom styling
 * <BeltProgressionCard belt="YELLOW" completionCount={5} className="mt-4" />
 */
export function BeltProgressionCard({ belt, completionCount, className }: BeltProgressionCardProps) {
  const threshold = BELT_THRESHOLDS[belt];
  const progress = calculateBeltProgress(belt, completionCount);
  const isMaxBelt = belt === 'BLACK';
  const countToNext = getCountToNextBelt(belt, completionCount);

  return (
    <Link
      href="/growth"
      className={classNames(
        'block bg-[#1E293B] rounded-2xl p-4 border border-white/5',
        'hover:bg-[#2D3B4F] transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0F172A]',
        className
      )}
      aria-label={`View growth details. Current belt: ${BELT_DISPLAY_NAMES[belt]}, ${completionCount} Quality Times completed`}
    >
      {/* Label */}
      <p className="text-sm text-gray-400 mb-3">Belt Progression</p>

      {/* Belt info row */}
      <div className="flex items-center gap-4">
        {/* Belt image */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <Image
            src={getBeltImagePath(belt)}
            alt={BELT_DISPLAY_NAMES[belt]}
            width={48}
            height={48}
            className="object-contain"
            priority
          />
        </div>

        {/* Belt details */}
        <div className="flex-1 min-w-0">
          {/* Belt name */}
          <p className={classNames('font-semibold', BELT_TEXT_COLORS[belt])}>
            {BELT_DISPLAY_NAMES[belt]}
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

          {/* Quality Times completed display */}
          <p className="text-xs text-gray-500 mt-1">
            {isMaxBelt ? (
              <>
                <span className="text-gray-300">{completionCount}</span> Quality Times — Dad Sensei!
              </>
            ) : (
              <>
                <span className="text-gray-300">{completionCount}</span>/{threshold.max} Quality Times
                {countToNext !== null && countToNext > 0 && (
                  <span className="text-gray-600"> ({countToNext} to next belt)</span>
                )}
              </>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}
