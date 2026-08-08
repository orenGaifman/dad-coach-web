'use client';

/**
 * StreakDisplay — Weekly streak display component for the Dashboard.
 *
 * Shows the father's current weekly streak with flame icon and longest streak as
 * an achievement badge. In the 7-week program context, streaks are measured in
 * WEEKS (consecutive weeks meeting the weekly goal), not days.
 *
 * Key constraints:
 * - NEVER shows negative or shaming language
 * - Zero streak shows "0" without negative messaging
 * - If current equals longest: shows "🏆 Personal Best!"
 * - Keep it positive and celebratory
 * - Hebrew language throughout
 *
 * @see Backend: GrowthController.getStreak()
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
  /** Current streak in weeks (0 or positive integer) */
  currentStreak: number;
  /** Longest streak ever achieved in weeks (0 or positive integer) */
  longestStreak: number;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * StreakDisplay component.
 *
 * A detailed component showing:
 * - Current weekly streak with flame icon 🔥
 * - Longest streak ever as achievement badge
 * - Personal best indicator when current equals longest
 *
 * Design notes:
 * - Follows dark theme pattern: bg-[#1E293B]
 * - Uses positive, encouraging language only
 * - Never shows negative/shaming language for zero or low streaks
 * - Hebrew language with RTL direction
 *
 * @example
 * // Basic usage with active streak
 * <StreakDisplay currentStreak={3} longestStreak={5} />
 *
 * @example
 * // Personal best (current equals longest)
 * <StreakDisplay currentStreak={5} longestStreak={5} />
 *
 * @example
 * // Zero streak (still positive)
 * <StreakDisplay currentStreak={0} longestStreak={3} />
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

  // Determine week/weeks text in Hebrew
  const currentWeeksText = displayCurrentStreak === 1 ? 'שבוע' : 'שבועות';
  const longestWeeksText = displayLongestStreak === 1 ? 'שבוע' : 'שבועות';

  return (
    <div
      className={classNames(
        'bg-[#1E293B] rounded-2xl p-4 border border-white/5',
        className
      )}
      dir="rtl"
      aria-label={`רצף נוכחי: ${displayCurrentStreak} ${currentWeeksText}. רצף שיא: ${displayLongestStreak} ${longestWeeksText}.`}
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
          <p className="text-sm text-gray-400">רצף נוכחי</p>
          <p className="text-2xl font-bold text-white">
            {displayCurrentStreak} {currentWeeksText}
          </p>
        </div>

        {/* Personal Best Badge */}
        {isPersonalBest && (
          <div
            className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium"
            aria-label="שיא אישי!"
          >
            <span aria-hidden="true">🏆</span>
            <span>שיא אישי!</span>
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
          <span className="text-sm text-gray-400">רצף שיא</span>
        </div>
        <p className="text-lg font-semibold text-white">
          {displayLongestStreak} {longestWeeksText}
        </p>
      </div>
    </div>
  );
}
