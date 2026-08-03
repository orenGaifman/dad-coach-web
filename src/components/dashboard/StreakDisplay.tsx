'use client';

/**
 * StreakDisplay — Detailed streak display component for the Dashboard.
 *
 * Shows the father's current streak with flame icon and longest streak as
 * an achievement badge. Provides more detail than StreakSummaryCard.
 *
 * Key constraints (from Requirement 13.1):
 * - NEVER shows negative or shaming language
 * - Zero streak shows "0" without negative messaging
 * - If current equals longest: shows "🏆 Personal Best!"
 * - Keep it positive and celebratory
 *
 * Requirements: 13.1 (Streak display: Current streak with flame icon, longest streak badge)
 * @see design.md - Screen D1: Dashboard Home
 */

/**
 * Helper function to combine class names.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Props for the StreakDisplay component.
 */
export interface StreakDisplayProps {
  /** Current streak in days (0 or positive integer) */
  currentStreak: number;
  /** Longest streak ever achieved (0 or positive integer) */
  longestStreak: number;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * StreakDisplay component.
 *
 * A detailed component showing:
 * - Current streak with flame icon 🔥
 * - Longest streak ever as achievement badge
 * - Personal best indicator when current equals longest
 *
 * Design notes:
 * - Follows dark theme pattern: bg-[#1E293B]
 * - Uses positive, encouraging language only
 * - Never shows negative/shaming language for zero or low streaks
 *
 * @example
 * // Basic usage with active streak
 * <StreakDisplay currentStreak={12} longestStreak={15} />
 *
 * @example
 * // Personal best (current equals longest)
 * <StreakDisplay currentStreak={15} longestStreak={15} />
 *
 * @example
 * // Zero streak (still positive)
 * <StreakDisplay currentStreak={0} longestStreak={5} />
 *
 * @example
 * // With custom styling
 * <StreakDisplay currentStreak={7} longestStreak={10} className="mt-4" />
 */
export function StreakDisplay({
  currentStreak,
  longestStreak,
  className,
}: StreakDisplayProps) {
  // Ensure values are never negative
  const displayCurrentStreak = Math.max(0, currentStreak);
  const displayLongestStreak = Math.max(0, longestStreak);

  // Check if current streak equals longest (personal best)
  const isPersonalBest =
    displayCurrentStreak > 0 && displayCurrentStreak >= displayLongestStreak;

  // Determine day/days text
  const currentDaysText = displayCurrentStreak === 1 ? 'day' : 'days';
  const longestDaysText = displayLongestStreak === 1 ? 'day' : 'days';

  return (
    <div
      className={classNames(
        'bg-[#1E293B] rounded-2xl p-4 border border-white/5',
        className
      )}
      aria-label={`Current streak: ${displayCurrentStreak} ${currentDaysText}. Longest streak: ${displayLongestStreak} ${longestDaysText}.`}
    >
      {/* Current Streak Section */}
      <div className="flex items-center gap-3 mb-4">
        {/* Flame Icon */}
        <div
          className="text-3xl flex-shrink-0"
          aria-hidden="true"
          role="img"
        >
          🔥
        </div>

        {/* Current Streak Info */}
        <div className="flex-1">
          <p className="text-sm text-gray-400">Current Streak</p>
          <p className="text-2xl font-bold text-white">
            {displayCurrentStreak} {currentDaysText}
          </p>
        </div>

        {/* Personal Best Badge */}
        {isPersonalBest && (
          <div
            className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium"
            aria-label="Personal best achieved"
          >
            <span aria-hidden="true">🏆</span>
            <span>Personal Best!</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 my-3" />

      {/* Longest Streak Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            ⭐
          </span>
          <span className="text-sm text-gray-400">Best Streak</span>
        </div>
        <p className="text-lg font-semibold text-white">
          {displayLongestStreak} {longestDaysText}
        </p>
      </div>
    </div>
  );
}
