'use client';

/**
 * Achievements Page — Screen G2
 *
 * Displays the father's achievements gallery showing earned and available
 * achievements. Uses the AchievementGallery component to render achievements
 * grouped by category.
 *
 * Features:
 * - All achievements with earned/unearned status
 * - Grouped by category
 * - Next achievable highlight
 * - Progress summary
 * - Loading skeleton
 * - Error handling
 *
 * Requirements: 3.1 (Achievements Gallery)
 * @see design.md - Screen G2: Achievements
 */

import Link from 'next/link';
import { useAchievements } from '@/src/hooks/useAchievements';
import { AchievementGallery } from '@/src/components/achievements/AchievementGallery';
import { SkeletonCard } from '@/src/components/common/SkeletonScreen';
import { ErrorState } from '@/src/components/common/ErrorState';

/**
 * Loading skeleton for the achievements page.
 */
function AchievementsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary skeleton */}
      <SkeletonCard className="h-24" />
      
      {/* Next achievable skeleton */}
      <SkeletonCard className="h-28" />
      
      {/* Category sections */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-6 w-32 bg-[#1E293B] rounded animate-pulse" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((j) => (
              <SkeletonCard key={j} className="aspect-square" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Achievements page component.
 */
export default function AchievementsPage() {
  const { 
    data: achievementsData, 
    isLoading, 
    error, 
    refetch 
  } = useAchievements();

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
              Achievements
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Loading state */}
        {isLoading && <AchievementsSkeleton />}

        {/* Error state */}
        {error && !isLoading && (
          <ErrorState
            type="error"
            description="We couldn't load your achievements. Let's try again."
            onRetry={refetch}
          />
        )}

        {/* Success state */}
        {achievementsData && !isLoading && (
          <AchievementGallery
            achievements={achievementsData.achievements}
            totalAvailable={achievementsData.total_available}
            totalEarned={achievementsData.total_earned}
            nextAchievable={achievementsData.next_achievable}
          />
        )}
      </main>
    </div>
  );
}
