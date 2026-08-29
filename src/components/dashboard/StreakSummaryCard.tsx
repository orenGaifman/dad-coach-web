'use client';

/**
 * StreakSummaryCard — Compact streak display for the Dashboard stats row.
 *
 * Shows the father's current consistency streak in days with a fire emoji.
 * The entire card is clickable and navigates to the Growth tab for streak details.
 *
 * Key constraints (from Requirement 4):
 * - NEVER shows "at risk" or any negative/shaming language
 * - Zero streak shows "0" without negative messaging
 * - Keep it positive and celebratory
 *
 * Requirements: 1.1 (dashboard display), 4.1, 4.2 (streak display without "at risk")
 * @see design.md - Screen D1: Dashboard Home - Stats row section
 */

import Link from 'next/link';
import { classNames } from '@/src/utils/classNames';

/**
 * Props for the StreakSummaryCard component.
 */
export interface StreakSummaryCardProps {
  /** Current streak in days (0 or positive integer) */
  streakDays: number;
  /** Additional CSS classes for the card container */
  className?: string;
}

/**
 * StreakSummaryCard component.
 *
 * A compact stats card showing the father's current streak days.
 * Clicking the card navigates to the Growth tab (/growth) for full streak details.
 *
 * Design notes:
 * - Part of the 3-column stats row on the dashboard (grid grid-cols-3 gap-3)
 * - Matches the compact stat card pattern: bg-[#1E293B] rounded-xl p-3
 * - Number in text-2xl font-bold white, label in text-xs text-gray-500
 * - Fire emoji 🔥 as visual indicator
 *
 * @example
 * // Basic usage
 * <StreakSummaryCard streakDays={12} />
 *
 * @example
 * // Zero streak (still positive messaging)
 * <StreakSummaryCard streakDays={0} />
 *
 * @example
 * // With custom styling
 * <StreakSummaryCard streakDays={7} className="col-span-1" />
 */
export function StreakSummaryCard({ streakDays, className }: StreakSummaryCardProps) {
  // Ensure streakDays is never negative
  const displayDays = Math.max(0, streakDays);

  // Determine the label text based on streak count
  // For 1 day: "Day Streak", for 0 or multiple: "Day Streak" (keep consistent)
  const label = displayDays === 1 ? 'Day Streak' : 'Day Streak';

  return (
    <Link
      href="/growth"
      className={classNames(
        'block bg-[#1E293B] rounded-xl p-3',
        'hover:bg-[#2D3B4F] transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0F172A]',
        'text-center',
        className
      )}
      aria-label={`View streak details. Current streak: ${displayDays} ${displayDays === 1 ? 'day' : 'days'}`}
    >
      {/* Fire emoji indicator */}
      <div className="text-lg mb-1" aria-hidden="true">
        🔥
      </div>

      {/* Streak count - prominent display */}
      <p className="text-2xl font-bold text-white">{displayDays}</p>

      {/* Label */}
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </Link>
  );
}
