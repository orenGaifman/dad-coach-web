'use client';

/**
 * Streak Page — Screen G3
 *
 * Displays the father's engagement streak information including current
 * streak, longest streak, and milestone markers. Zero-streak shows an
 * encouraging message. NEVER shows "at risk" status per Requirement 4.2.
 *
 * Features:
 * - Current streak display (large, prominent)
 * - Longest streak display
 * - Streak milestones (7, 14, 21, 30, 60, 90, 180, 365 days)
 * - Zero-streak encouraging message
 * - Last qualifying interaction date
 * - NO "at risk" language anywhere
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4 (Streak Display)
 * @see design.md - Streak section
 */

import Link from 'next/link';
import { useStreak } from '@/src/hooks/useStreak';
import { SkeletonCard } from '@/src/components/common/SkeletonScreen';
import { ErrorState } from '@/src/components/common/ErrorState';
import type { StreakMilestone } from '@/src/types/growth';
import { classNames } from '@/src/utils/classNames';

/**
 * Streak milestone definitions with icons and names.
 */
const STREAK_MILESTONES: { days: StreakMilestone; name: string; icon: string }[] = [
  { days: 7, name: '1 Week', icon: '🔥' },
  { days: 14, name: '2 Weeks', icon: '🔥' },
  { days: 21, name: '3 Weeks', icon: '🔥' },
  { days: 30, name: '1 Month', icon: '🏆' },
  { days: 60, name: '2 Months', icon: '🏆' },
  { days: 90, name: '3 Months', icon: '💎' },
  { days: 180, name: '6 Months', icon: '💎' },
  { days: 365, name: '1 Year', icon: '👑' },
];

/**
 * Formats a date string to a friendly format.
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Loading skeleton for the streak page.
 */
function StreakSkeleton() {
  return (
    <div className="space-y-6">
      {/* Current streak skeleton */}
      <SkeletonCard className="h-48" />
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <SkeletonCard className="h-24" />
        <SkeletonCard className="h-24" />
      </div>
      
      {/* Milestones skeleton */}
      <SkeletonCard className="h-64" />
    </div>
  );
}

/**
 * Zero streak encouraging state.
 */
function ZeroStreakState() {
  return (
    <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 text-center">
      {/* Encouraging illustration */}
      <div className="text-6xl mb-4" aria-hidden="true">
        🌱
      </div>
      
      <h2 className="text-white text-xl font-semibold mb-2">
        Ready to Start Your Streak?
      </h2>
      
      <p className="text-gray-400 mb-6 max-w-xs mx-auto">
        Every great journey begins with a single step. Start engaging with your
        coach today to begin building your streak!
      </p>
      
      {/* Encouraging message */}
      <div className="bg-emerald-500/10 text-emerald-400 px-4 py-3 rounded-xl text-sm">
        <p className="font-medium">
          &ldquo;The best time to plant a tree was 20 years ago. The second best
          time is now.&rdquo;
        </p>
      </div>
    </div>
  );
}

/**
 * Current streak display component.
 */
function CurrentStreakCard({ 
  currentDays, 
  longestDays 
}: { 
  currentDays: number; 
  longestDays: number;
}) {
  const isPersonalBest = currentDays > 0 && currentDays === longestDays;
  
  return (
    <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 text-center">
      {/* Flame icon */}
      <div className="text-6xl mb-2" aria-hidden="true">
        🔥
      </div>
      
      {/* Current streak number */}
      <div 
        className="text-5xl font-bold text-white mb-1"
        aria-label={`Current streak: ${currentDays} days`}
      >
        {currentDays}
      </div>
      
      <p className="text-gray-400 text-lg">
        {currentDays === 1 ? 'Day' : 'Days'}
      </p>
      
      {/* Personal best badge */}
      {isPersonalBest && currentDays > 0 && (
        <div 
          className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 px-4 py-2 rounded-full mt-4"
          aria-label="Personal best streak"
        >
          <span aria-hidden="true">👑</span>
          <span className="font-medium">Personal Best!</span>
        </div>
      )}
      
      {/* Encouraging message based on streak */}
      <p className="text-gray-500 text-sm mt-4">
        {currentDays === 0 && 'Start your streak today!'}
        {currentDays >= 1 && currentDays < 7 && 'Great start! Keep the momentum going.'}
        {currentDays >= 7 && currentDays < 30 && 'Amazing consistency! You\'re building a habit.'}
        {currentDays >= 30 && currentDays < 90 && 'Incredible dedication! You\'re a role model.'}
        {currentDays >= 90 && 'Legendary commitment! Your family is blessed.'}
      </p>
    </div>
  );
}

/**
 * Streak stats cards component.
 */
function StreakStats({
  longestStreak,
  streakStartDate,
}: {
  longestStreak: number;
  streakStartDate: string | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Longest streak */}
      <div className="bg-[#1E293B] rounded-xl p-4 border border-white/5">
        <p className="text-gray-500 text-sm mb-1">Longest Streak</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">{longestStreak}</span>
          <span className="text-gray-400 text-sm">days</span>
        </div>
      </div>
      
      {/* Streak started */}
      <div className="bg-[#1E293B] rounded-xl p-4 border border-white/5">
        <p className="text-gray-500 text-sm mb-1">Streak Started</p>
        <p className="text-white font-medium">
          {formatDate(streakStartDate)}
        </p>
      </div>
    </div>
  );
}

/**
 * Streak milestones component.
 */
function StreakMilestones({ currentStreak }: { currentStreak: number }) {
  return (
    <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/5">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <span aria-hidden="true">🏆</span>
        Milestones
      </h3>
      
      <div className="space-y-3" role="list" aria-label="Streak milestones">
        {STREAK_MILESTONES.map((milestone) => {
          const isReached = currentStreak >= milestone.days;
          const isNext = !isReached && 
            STREAK_MILESTONES.findIndex(m => m.days > currentStreak) === 
            STREAK_MILESTONES.indexOf(milestone);
          
          return (
            <div
              key={milestone.days}
              className={classNames(
                'flex items-center gap-3 p-3 rounded-xl transition-all',
                isReached && 'bg-emerald-500/10',
                isNext && 'bg-amber-500/5 ring-1 ring-amber-400/30',
                !isReached && !isNext && 'opacity-50'
              )}
              role="listitem"
            >
              {/* Icon */}
              <span 
                className={classNames(
                  'text-2xl',
                  isReached && 'opacity-100',
                  !isReached && 'opacity-50 grayscale'
                )}
                aria-hidden="true"
              >
                {milestone.icon}
              </span>
              
              {/* Milestone info */}
              <div className="flex-1">
                <p className={classNames(
                  'font-medium',
                  isReached ? 'text-emerald-400' : 'text-gray-400'
                )}>
                  {milestone.name}
                </p>
                <p className="text-gray-500 text-sm">
                  {milestone.days} days
                </p>
              </div>
              
              {/* Status indicator */}
              {isReached ? (
                <div 
                  className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                  aria-label="Milestone reached"
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
              ) : isNext ? (
                <span className="text-amber-400 text-sm font-medium">
                  {milestone.days - currentStreak} to go
                </span>
              ) : (
                <span className="text-gray-600 text-sm">
                  {milestone.days - currentStreak} to go
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Streak page component.
 */
export default function StreakPage() {
  const { 
    data: streakData, 
    isLoading, 
    error, 
    refetch 
  } = useStreak();

  const currentStreak = streakData?.current_streak_days ?? 0;
  const longestStreak = streakData?.longest_streak_days ?? 0;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0F172A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/growth"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Back to Growth"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-white">
              Your Streak
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Loading state */}
        {isLoading && <StreakSkeleton />}

        {/* Error state */}
        {error && !isLoading && (
          <ErrorState
            type="error"
            description="We couldn't load your streak data. Let's try again."
            onRetry={refetch}
          />
        )}

        {/* Success state */}
        {streakData && !isLoading && (
          <div className="space-y-6">
            {/* Zero streak state */}
            {currentStreak === 0 ? (
              <ZeroStreakState />
            ) : (
              <CurrentStreakCard 
                currentDays={currentStreak} 
                longestDays={longestStreak}
              />
            )}
            
            {/* Stats */}
            <StreakStats
              longestStreak={longestStreak}
              streakStartDate={streakData.streak_start_date}
            />
            
            {/* Milestones */}
            <StreakMilestones currentStreak={currentStreak} />
          </div>
        )}
      </main>
    </div>
  );
}
