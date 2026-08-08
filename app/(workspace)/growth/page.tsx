'use client';

/**
 * Growth Overview page — displays belt progression, streak, and achievements preview.
 *
 * Features:
 * - Belt progression with large belt image and progress bar
 * - Current streak display (never shows "at risk")
 * - Achievements preview with count and next achievable
 * - Links to detailed streak and achievements pages
 *
 * Requirements: 2.1, 2.2 (Belt Progression), 3 (Achievements), 4 (Streak)
 * @see design.md - Screen G1: Growth / Belt Progression
 */

import Image from 'next/image';
import Link from 'next/link';
import { useBeltProgression } from '@/src/hooks/useBeltProgression';
import { useStreak } from '@/src/hooks/useStreak';
import { useAchievements } from '@/src/hooks/useAchievements';
import {
  SkeletonCard,
  SkeletonText,
  SkeletonBlock,
} from '@/src/components/common/SkeletonScreen';
import { ErrorState } from '@/src/components/common/ErrorState';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import type { BeltLevel } from '@/src/types/growth';

/**
 * Helper function to combine class names
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Belt metadata for display
 */
const BELT_INFO: Record<BeltLevel, { name: string; description: string; color: string; progressColor: string }> = {
  WHITE: { name: 'White Belt', description: 'Beginner', color: 'text-gray-200', progressColor: 'bg-gray-400' },
  YELLOW: { name: 'Yellow Belt', description: 'Learner', color: 'text-yellow-400', progressColor: 'bg-yellow-500' },
  ORANGE: { name: 'Orange Belt', description: 'Improving', color: 'text-orange-400', progressColor: 'bg-orange-500' },
  GREEN: { name: 'Green Belt', description: 'Committed', color: 'text-emerald-400', progressColor: 'bg-emerald-500' },
  BLUE: { name: 'Blue Belt', description: 'Advanced', color: 'text-blue-400', progressColor: 'bg-blue-500' },
  PURPLE: { name: 'Purple Belt', description: 'Expert', color: 'text-purple-400', progressColor: 'bg-purple-500' },
  BROWN: { name: 'Brown Belt', description: 'Master', color: 'text-amber-700', progressColor: 'bg-amber-700' },
  BLACK: { name: 'Black Belt', description: 'Dad Sensei', color: 'text-gray-100', progressColor: 'bg-gray-200' },
};

/**
 * All belt levels in order for the progression row
 */
const BELT_LEVELS: BeltLevel[] = ['WHITE', 'YELLOW', 'ORANGE', 'GREEN', 'BLUE', 'PURPLE', 'BROWN', 'BLACK'];

/**
 * Belt thresholds for score display
 */
const BELT_THRESHOLDS: Record<BeltLevel, number> = {
  WHITE: 0,
  YELLOW: 500,
  ORANGE: 1000,
  GREEN: 1500,
  BLUE: 2000,
  PURPLE: 3000,
  BROWN: 4000,
  BLACK: 5000,
};

/**
 * Loading skeleton for the Growth page
 */
function GrowthSkeleton() {
  return (
    <div className="py-6 space-y-6" aria-label="Loading growth data">
      {/* Header skeleton */}
      <div className="text-center space-y-2">
        <SkeletonText width="w-48 mx-auto" />
        <SkeletonText width="w-64 mx-auto" />
      </div>

      {/* Belt row skeleton */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonBlock key={i} className="w-14 h-14 rounded-full" />
        ))}
      </div>

      {/* Belt detail card skeleton */}
      <SkeletonCard className="h-64" />

      {/* Streak card skeleton */}
      <SkeletonCard className="h-24" />

      {/* Achievements preview skeleton */}
      <SkeletonCard className="h-32" />
    </div>
  );
}

/**
 * Belt Progression Row — horizontal display of all 8 belts
 * Current belt is highlighted with ring and scale
 */
interface BeltRowProps {
  currentBelt: BeltLevel;
}

function BeltRow({ currentBelt }: BeltRowProps) {
  return (
    <div 
      className="flex justify-center gap-2 overflow-x-auto pb-2 -mx-4 px-4"
      role="list"
      aria-label="Belt progression levels"
    >
      {BELT_LEVELS.map((belt) => {
        const isCurrent = belt === currentBelt;
        const isPast = BELT_LEVELS.indexOf(belt) < BELT_LEVELS.indexOf(currentBelt);
        
        return (
          <div
            key={belt}
            role="listitem"
            aria-label={`${BELT_INFO[belt].name}${isCurrent ? ' (current)' : ''}`}
            aria-current={isCurrent ? 'true' : undefined}
            className={classNames(
              'relative flex-shrink-0 rounded-full overflow-hidden',
              isCurrent && 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0F172A] scale-110 z-10',
              !isCurrent && !isPast && 'opacity-40',
              isPast && 'opacity-70'
            )}
          >
            <Image
              src={`/belts/${belt.toLowerCase()}-belt.webp`}
              alt={BELT_INFO[belt].name}
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Belt Detail Card — large display of current belt with progress
 */
interface BeltDetailCardProps {
  currentBelt: BeltLevel;
  currentScore: number;
  nextBelt: BeltLevel | null;
  pointsToNextBelt: number | null;
  progressPercentage: number | null;
}

function BeltDetailCard({
  currentBelt,
  currentScore,
  nextBelt,
  pointsToNextBelt,
  progressPercentage,
}: BeltDetailCardProps) {
  const safeBelt = currentBelt ?? 'WHITE';
  const beltInfo = BELT_INFO[safeBelt];
  const isBlackBelt = safeBelt === 'BLACK';
  const nextBeltThreshold = nextBelt ? BELT_THRESHOLDS[nextBelt] : null;

  return (
    <div
      className="bg-[#1E293B] rounded-2xl p-6 border border-white/5"
      role="region"
      aria-label="Current belt details"
    >
      {/* Large belt image */}
      <div className="flex justify-center mb-4">
        <Image
          src={`/belts/${safeBelt.toLowerCase()}-belt.webp`}
          alt={beltInfo.name}
          width={120}
          height={120}
          className="object-contain"
          priority
        />
      </div>

      {/* Belt name and description */}
      <div className="text-center mb-4">
        <h2 className={classNames('text-xl font-semibold', beltInfo.color)}>
          {beltInfo.name}
        </h2>
        <p className="text-gray-400 text-sm">
          {isBlackBelt ? 'Dad Sensei — Master of Fatherhood' : beltInfo.description}
        </p>
      </div>

      {/* Progress section */}
      {isBlackBelt ? (
        // BLACK belt mastery state
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 px-4 py-2 rounded-full">
            <span aria-hidden="true">🏆</span>
            <span className="font-medium">Master Level Achieved</span>
          </div>
          <p className="text-gray-500 text-sm mt-3">
            You&apos;ve reached the highest level. Keep inspiring your family!
          </p>
        </div>
      ) : (
        // Progress to next belt
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progress to {nextBelt ? BELT_INFO[nextBelt].name : 'next belt'}</span>
            <span className="text-white font-medium">
              {(currentScore ?? 0).toLocaleString()} / {(nextBeltThreshold ?? 0).toLocaleString()} XP
            </span>
          </div>
          
          <ProgressBar
            value={progressPercentage ?? 0}
            color={beltInfo.progressColor}
            height="md"
            animated
            label={`Belt progress: ${Math.round(progressPercentage ?? 0)}%`}
          />
          
          <p className="text-gray-500 text-sm text-center">
            {(pointsToNextBelt ?? 0).toLocaleString()} points to {nextBelt ? BELT_INFO[nextBelt].name : 'next belt'}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Streak Section — current streak with link to details
 * NEVER shows "at risk" per Requirement 4.2
 */
interface StreakSectionProps {
  currentStreakDays: number;
  longestStreakDays: number;
  isLoading: boolean;
  isError: boolean;
}

function StreakSection({ currentStreakDays, longestStreakDays, isLoading, isError }: StreakSectionProps) {
  if (isLoading) {
    return <SkeletonCard className="h-24" />;
  }

  if (isError) {
    return (
      <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/5">
        <p className="text-gray-400 text-center">Streak data unavailable</p>
      </div>
    );
  }

  const hasStreak = currentStreakDays > 0;

  return (
    <Link href="/growth/streak" className="block">
      <div
        className={classNames(
          'bg-[#1E293B] rounded-2xl p-4 border border-white/5',
          'hover:bg-[#2D3B4F] transition-colors'
        )}
        role="region"
        aria-label="Streak summary"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl" aria-hidden="true">🔥</div>
            <div>
              <p className="text-white font-semibold text-lg">
                {hasStreak ? (
                  <>
                    {currentStreakDays} {currentStreakDays === 1 ? 'Day' : 'Days'}
                  </>
                ) : (
                  'Start Your Streak'
                )}
              </p>
              <p className="text-gray-400 text-sm">
                {hasStreak ? 'Current streak' : 'Every day counts'}
              </p>
            </div>
          </div>
          
          {hasStreak && longestStreakDays > currentStreakDays && (
            <div className="text-right">
              <p className="text-gray-500 text-xs">Best</p>
              <p className="text-amber-400 font-medium">{longestStreakDays} days</p>
            </div>
          )}
          
          <span className="text-gray-500 ml-2" aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Achievements Preview — earned count and next achievable
 */
interface AchievementsPreviewProps {
  totalEarned: number;
  totalAvailable: number;
  nextAchievable: {
    name: string;
    icon_key: string;
    progress_percentage: number;
  } | null;
  isLoading: boolean;
  isError: boolean;
}

function AchievementsPreview({
  totalEarned,
  totalAvailable,
  nextAchievable,
  isLoading,
  isError,
}: AchievementsPreviewProps) {
  if (isLoading) {
    return <SkeletonCard className="h-32" />;
  }

  if (isError) {
    return (
      <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/5">
        <p className="text-gray-400 text-center">Achievements data unavailable</p>
      </div>
    );
  }

  return (
    <Link href="/growth/achievements" className="block">
      <div
        className={classNames(
          'bg-[#1E293B] rounded-2xl p-4 border border-white/5',
          'hover:bg-[#2D3B4F] transition-colors'
        )}
        role="region"
        aria-label="Achievements summary"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Achievements</h3>
          <span className="text-gray-500" aria-hidden="true">→</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white">
              <span className="text-amber-400">{totalEarned}</span>
              <span className="text-gray-500 text-lg"> / {totalAvailable}</span>
            </p>
            <p className="text-gray-400 text-sm">achievements earned</p>
          </div>
          
          {nextAchievable && (
            <div className="flex items-center gap-3 bg-[#0F172A] rounded-xl p-3">
              <Image
                src={`/achievements/${nextAchievable.icon_key}.webp`}
                alt={nextAchievable.name}
                width={40}
                height={40}
                className="opacity-60"
              />
              <div>
                <p className="text-gray-300 text-sm font-medium">Next up</p>
                <p className="text-gray-500 text-xs">{nextAchievable.name}</p>
                <div className="mt-1 w-16">
                  <ProgressBar
                    value={nextAchievable.progress_percentage}
                    color="bg-amber-500"
                    height="sm"
                    label={`${nextAchievable.name} progress`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Main Growth Page Component
 */
export default function GrowthPage() {
  const {
    data: beltData,
    isLoading: beltLoading,
    isError: beltError,
    error: beltErrorObj,
    refetch: refetchBelt,
  } = useBeltProgression();

  const {
    data: streakData,
    isLoading: streakLoading,
    isError: streakError,
  } = useStreak();

  const {
    data: achievementsData,
    isLoading: achievementsLoading,
    isError: achievementsError,
  } = useAchievements();

  // Primary loading state (belt is the main content)
  if (beltLoading) {
    return <GrowthSkeleton />;
  }

  // Primary error state (belt is required)
  if (beltError) {
    const isNetworkError = beltErrorObj?.message?.toLowerCase().includes('network');
    return (
      <div className="py-6">
        <ErrorState
          type={isNetworkError ? 'network' : 'error'}
          onRetry={() => refetchBelt()}
        />
      </div>
    );
  }

  // No belt data (shouldn't happen, but handle gracefully)
  if (!beltData) {
    return (
      <div className="py-6">
        <ErrorState
          title="Something unexpected happened"
          description="We couldn't load your growth data. Let's try again."
          onRetry={() => refetchBelt()}
        />
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Page header */}
      <header className="text-center">
        <h1 className="text-xl font-semibold text-white">Your Journey of Growth</h1>
        <p className="text-gray-400 mt-1">Every step makes you a better father</p>
      </header>

      {/* Belt progression row */}
      <BeltRow currentBelt={beltData.current_belt} />

      {/* Current belt detail card */}
      <BeltDetailCard
        currentBelt={beltData.current_belt}
        currentScore={beltData.current_score}
        nextBelt={beltData.next_belt}
        pointsToNextBelt={beltData.points_to_next_belt}
        progressPercentage={beltData.progress_percentage_to_next_belt}
      />

      {/* Streak section */}
      <StreakSection
        currentStreakDays={streakData?.current_streak_days ?? 0}
        longestStreakDays={streakData?.longest_streak_days ?? 0}
        isLoading={streakLoading}
        isError={streakError}
      />

      {/* Achievements preview */}
      <AchievementsPreview
        totalEarned={achievementsData?.total_earned ?? 0}
        totalAvailable={achievementsData?.total_available ?? 0}
        nextAchievable={achievementsData?.next_achievable ?? null}
        isLoading={achievementsLoading}
        isError={achievementsError}
      />
    </div>
  );
}
