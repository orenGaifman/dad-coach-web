'use client';

/**
 * AchievementBadges — Compact achievement badges display for the Dashboard.
 *
 * Displays a collection of achievement badges in a grid/flex layout.
 * Earned achievements are shown at full color with a checkmark or glow effect.
 * Locked (unearned) achievements are shown as grayscale silhouettes with a lock icon.
 *
 * Features:
 * - Flexible grid layout for badges
 * - Earned badges: full color with checkmark or glow
 * - Locked badges: grayscale/silhouette with locked icon
 * - Badge icons with names below
 * - Hover/focus shows achievement description
 * - Accessible labels for screen readers
 *
 * Example achievements:
 * - "First Steps" - Complete first Quality Time
 * - "Weekly Champion" - Complete 3 in one week
 * - "Belt Master" - Earn first belt upgrade
 *
 * Requirements: 13.1 (Achievement Badges)
 * @see design.md - Dashboard components
 */

import Image from 'next/image';
import type { Achievement } from '@/src/types/growth';
import { classNames } from '@/src/utils/classNames';

/**
 * Formats a date string to a short display format (e.g., "Jan 15").
 */
function formatEarnedDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Props for the AchievementBadges component.
 */
export interface AchievementBadgesProps {
  /** Array of achievements to display */
  achievements: Achievement[];
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Single badge item within the grid.
 */
interface BadgeItemProps {
  achievement: Achievement;
}

/**
 * BadgeItem — Individual achievement badge display.
 *
 * Shows earned achievements at full color with a checkmark.
 * Shows locked achievements as grayscale silhouettes with a lock icon.
 */
function BadgeItem({ achievement }: BadgeItemProps) {
  const isEarned = achievement.earned_at !== null;

  // Build accessible description
  const accessibleLabel = isEarned
    ? `${achievement.name} - Earned on ${formatEarnedDate(achievement.earned_at!)}. ${achievement.description}`
    : `${achievement.name} - Locked. ${achievement.description}`;

  return (
    <div
      className={classNames(
        'relative group flex flex-col items-center p-3',
        'bg-[#1E293B] rounded-xl border border-white/5',
        'transition-all duration-200',
        'hover:bg-[#2D3B4D] focus-within:bg-[#2D3B4D]',
        isEarned ? 'opacity-100' : 'opacity-50'
      )}
      role="listitem"
      aria-label={accessibleLabel}
      tabIndex={0}
    >
      {/* Badge icon container */}
      <div className="relative w-14 h-14 mb-2">
        {/* Achievement image */}
        <Image
          src={`/achievements/${achievement.icon_key}.webp`}
          alt=""
          width={56}
          height={56}
          className={classNames(
            'object-contain transition-all duration-200',
            isEarned ? 'brightness-100' : 'grayscale brightness-50'
          )}
        />

        {/* Earned checkmark badge */}
        {isEarned && (
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-[#1E293B]"
            aria-hidden="true"
          >
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}

        {/* Locked icon badge */}
        {!isEarned && (
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-[#1E293B]"
            aria-hidden="true"
          >
            <svg
              className="w-3 h-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        )}

        {/* Glow effect for earned badges */}
        {isEarned && (
          <div
            className="absolute inset-0 -z-10 bg-emerald-500/20 blur-md rounded-full"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Achievement name */}
      <span
        className={classNames(
          'text-xs text-center line-clamp-2 font-medium',
          isEarned ? 'text-gray-200' : 'text-gray-500'
        )}
      >
        {achievement.name}
      </span>

      {/* Tooltip on hover/focus - shows description */}
      <div
        className={classNames(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2',
          'bg-gray-900 rounded-lg shadow-xl border border-white/10',
          'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
          'group-focus-within:opacity-100 group-focus-within:visible',
          'transition-all duration-200 z-10',
          'w-48 pointer-events-none'
        )}
        role="tooltip"
      >
        <p className="text-xs text-white font-medium mb-1">{achievement.name}</p>
        <p className="text-xs text-gray-400">{achievement.description}</p>
        {isEarned && achievement.earned_at && (
          <p className="text-xs text-emerald-400 mt-1">
            Earned {formatEarnedDate(achievement.earned_at)}
          </p>
        )}
        {!isEarned && achievement.progress_percentage !== undefined && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{achievement.progress_percentage}%</span>
            </div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${achievement.progress_percentage}%` }}
              />
            </div>
          </div>
        )}
        {/* Tooltip arrow */}
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-white/10"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

/**
 * AchievementBadges component.
 *
 * Displays a grid of achievement badges for the dashboard.
 * Earned badges appear at full color with a checkmark and glow.
 * Locked badges appear as grayscale silhouettes with a lock icon.
 *
 * @example
 * // Basic usage
 * <AchievementBadges achievements={achievements} />
 *
 * @example
 * // With custom styling
 * <AchievementBadges
 *   achievements={achievements}
 *   className="mt-4"
 * />
 */
export function AchievementBadges({ achievements, className }: AchievementBadgesProps) {
  // Calculate earned count for display
  const earnedCount = achievements.filter((a) => a.earned_at !== null).length;
  const totalCount = achievements.length;

  if (achievements.length === 0) {
    return (
      <div
        className={classNames(
          'bg-[#1E293B] rounded-2xl p-4 border border-white/5',
          className
        )}
      >
        <p className="text-gray-400 text-sm text-center">
          No achievements available yet. Keep going to unlock achievements!
        </p>
      </div>
    );
  }

  return (
    <div
      className={classNames('space-y-3', className)}
      role="region"
      aria-label={`Achievement badges: ${earnedCount} of ${totalCount} earned`}
    >
      {/* Header with earned count */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Achievements</h3>
        <span className="text-xs text-gray-400">
          {earnedCount}/{totalCount} earned
        </span>
      </div>

      {/* Badge grid */}
      <div
        className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6"
        role="list"
        aria-label="Achievement badges"
      >
        {achievements.map((achievement) => (
          <BadgeItem key={achievement.achievement_id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
