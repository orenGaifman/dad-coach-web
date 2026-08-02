'use client';

/**
 * AchievementCard — Single achievement display card.
 *
 * Displays an individual achievement with its icon, name, description,
 * and earned status. Unearned achievements are shown as available
 * (slightly faded) rather than locked.
 *
 * Features:
 * - Achievement icon from /achievements/{slug}.webp
 * - Achievement name and description
 * - Earned status with checkmark and date
 * - Unearned state shown as available (opacity-40, not locked)
 * - Optional progress indicator for partially completed achievements
 * - Accessible labels for screen readers
 *
 * Requirements: 3.2 (Achievements Gallery - single card)
 * @see design.md - Screen G2: Achievements
 */

import Image from 'next/image';
import type { Achievement } from '@/src/types/growth';

/**
 * Helper function to combine class names, filtering out falsy values.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a date string to a short display format (e.g., "Jan 15, 2024").
 */
function formatEarnedDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Props for the AchievementCard component.
 */
export interface AchievementCardProps {
  /** Achievement data */
  achievement: Achievement;
  /** Whether this is the next achievable achievement */
  isNextAchievable?: boolean;
  /** Whether to show compact view (icon only, for grid layout) */
  compact?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * AchievementCard component.
 *
 * Displays a single achievement with icon, name, earned status,
 * and optional progress indicator.
 *
 * @example
 * // Earned achievement
 * <AchievementCard
 *   achievement={{
 *     achievement_id: '1',
 *     name: 'Great Listener',
 *     description: 'Had 10 meaningful conversations',
 *     category: 'CONVERSATIONS',
 *     icon_key: 'great-listener',
 *     earned_at: '2024-01-15T10:00:00Z',
 *   }}
 * />
 *
 * @example
 * // Unearned achievement (available, not locked)
 * <AchievementCard
 *   achievement={{
 *     achievement_id: '2',
 *     name: '30-Day Streak',
 *     description: 'Maintain a 30-day streak',
 *     category: 'CONSISTENCY',
 *     icon_key: 'streak-30-days',
 *     earned_at: null,
 *     progress_percentage: 45,
 *   }}
 *   isNextAchievable
 * />
 */
export function AchievementCard({
  achievement,
  isNextAchievable = false,
  compact = false,
  className,
  onClick,
}: AchievementCardProps) {
  const isEarned = achievement.earned_at !== null;
  const hasProgress = !isEarned && achievement.progress_percentage !== undefined;
  
  // Build the accessible label
  const accessibleLabel = isEarned
    ? `${achievement.name} - Earned on ${formatEarnedDate(achievement.earned_at!)}`
    : hasProgress
      ? `${achievement.name} - ${achievement.progress_percentage}% complete`
      : `${achievement.name} - Available to earn`;

  if (compact) {
    // Compact view for grid layout - icon only with checkmark
    return (
      <button
        type="button"
        className={classNames(
          'relative p-3 bg-[#1E293B] rounded-xl border border-white/5',
          'flex flex-col items-center justify-center gap-2',
          'transition-all duration-200',
          isEarned ? 'opacity-100' : 'opacity-40',
          isNextAchievable && !isEarned && 'ring-2 ring-amber-400/50 opacity-75',
          onClick && 'hover:bg-[#2D3B4D] cursor-pointer',
          className
        )}
        onClick={onClick}
        aria-label={accessibleLabel}
      >
        {/* Achievement icon */}
        <div className="relative w-16 h-16">
          <Image
            src={`/achievements/${achievement.icon_key}.webp`}
            alt=""
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
        
        {/* Name */}
        <span className="text-xs text-gray-300 text-center line-clamp-2">
          {achievement.name}
        </span>
        
        {/* Earned checkmark */}
        {isEarned && (
          <div 
            className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
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
        
        {/* Next achievable indicator */}
        {isNextAchievable && !isEarned && (
          <div 
            className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-amber-500 rounded-full"
            aria-hidden="true"
          >
            <span className="text-[10px] font-bold text-black">NEXT</span>
          </div>
        )}
      </button>
    );
  }

  // Full card view with description
  return (
    <button
      type="button"
      className={classNames(
        'w-full p-4 bg-[#1E293B] rounded-2xl border border-white/5',
        'flex items-start gap-4 text-left',
        'transition-all duration-200',
        isEarned ? 'opacity-100' : 'opacity-60',
        isNextAchievable && !isEarned && 'ring-2 ring-amber-400/50 opacity-80',
        onClick && 'hover:bg-[#2D3B4D] cursor-pointer',
        className
      )}
      onClick={onClick}
      aria-label={accessibleLabel}
    >
      {/* Achievement icon */}
      <div className="relative flex-shrink-0">
        <Image
          src={`/achievements/${achievement.icon_key}.webp`}
          alt=""
          width={64}
          height={64}
          className="object-contain"
        />
        
        {/* Earned checkmark overlay */}
        {isEarned && (
          <div 
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
            aria-hidden="true"
          >
            <svg 
              className="w-4 h-4 text-white" 
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
      </div>
      
      {/* Text content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-white font-semibold">
            {achievement.name}
          </h4>
          
          {/* Next achievable badge */}
          {isNextAchievable && !isEarned && (
            <span 
              className="flex-shrink-0 px-2 py-0.5 bg-amber-500 rounded-full text-[10px] font-bold text-black"
              aria-hidden="true"
            >
              NEXT
            </span>
          )}
        </div>
        
        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
          {achievement.description}
        </p>
        
        {/* Earned date or progress */}
        <div className="mt-2">
          {isEarned ? (
            <p className="text-emerald-400 text-xs">
              Earned {formatEarnedDate(achievement.earned_at!)}
            </p>
          ) : hasProgress ? (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Progress</span>
                <span className="text-gray-400">{achievement.progress_percentage}%</span>
              </div>
              <div 
                className="h-1.5 bg-gray-700 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={achievement.progress_percentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${achievement.progress_percentage}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-xs">
              Available to earn
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
