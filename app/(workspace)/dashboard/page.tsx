'use client';

/**
 * Dashboard Home page — the father's main view after authentication.
 *
 * Displays the workspace summary with:
 * - Warm greeting with father's name
 * - Belt summary card (current belt + progress)
 * - Stats row (streak, score, kids count)
 * - Upcoming commitment card
 * - Weekly goal progress
 *
 * Handles:
 * - Loading state with skeleton placeholders
 * - Error state with retry option
 * - Partial degradation (null sections rendered as placeholders)
 * - Celebration events (shown on mount if any undisplayed)
 *
 * Requirements: 1.1 (dashboard display), 1.3 (partial degradation), 16.1 (celebrations)
 * @see design.md - Screen D1: Dashboard Home
 */

import { useState, useEffect, useRef } from 'react';
import { useWorkspaceSummary } from '@/src/hooks/useWorkspaceSummary';
import { useCelebrations } from '@/src/hooks/useCelebrations';
import { CelebrationModal } from '@/src/components/common/CelebrationModal';
import { usePageView } from '@/src/hooks/usePageView';
import { UpcomingCommitmentCard } from '@/src/components/dashboard/UpcomingCommitmentCard';
import { WeeklyGoalProgressCard } from '@/src/components/dashboard/WeeklyGoalProgressCard';
import { BeltProgressHero } from '@/src/components/dashboard/BeltProgressHero';
import {
  SkeletonCard,
  SkeletonText,
  SkeletonBlock,
} from '@/src/components/common/SkeletonScreen';
import { ErrorState } from '@/src/components/common/ErrorState';
import type { DegradedSection } from '@/src/types/common';

/**
 * Check if a section is degraded
 */
function isSectionDegraded(
  section: DegradedSection,
  degradedSections: DegradedSection[] | undefined
): boolean {
  return degradedSections?.includes(section) ?? false;
}

/**
 * Loading skeleton for the dashboard
 */
function DashboardSkeleton() {
  return (
    <div className="py-6 space-y-4" aria-label="Loading dashboard">
      {/* Greeting skeleton */}
      <div className="space-y-2">
        <SkeletonText width="w-48" />
        <SkeletonText width="w-64" />
      </div>

      {/* Belt card skeleton */}
      <SkeletonCard className="h-28" />

      {/* Stats row skeleton */}
      <div className="grid grid-cols-3 gap-3">
        <SkeletonCard className="h-20" />
        <SkeletonCard className="h-20" />
        <SkeletonCard className="h-20" />
      </div>

      {/* Mission card skeleton */}
      <SkeletonCard className="h-32" />

      {/* Quick actions skeleton */}
      <div className="space-y-2">
        <SkeletonText width="w-32" />
        <div className="grid grid-cols-2 gap-3">
          <SkeletonCard className="h-20" />
          <SkeletonCard className="h-20" />
          <SkeletonCard className="h-20" />
          <SkeletonCard className="h-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * Stats Row - 3 equal cards showing weekly streak, score, kids count
 * Hebrew language, RTL direction
 */
interface StatsRowProps {
  streak: number;
  score: number;
  kidsCount: number;
  degradedSections?: DegradedSection[];
}

function StatsRow({ streak, score, kidsCount, degradedSections }: StatsRowProps) {
  const isStreakDegraded = isSectionDegraded('streak', degradedSections);
  const isGrowthDegraded = isSectionDegraded('growth', degradedSections);
  const isChildrenDegraded = isSectionDegraded('children', degradedSections);

  return (
    <div className="grid grid-cols-3 gap-3" role="list" aria-label="סטטיסטיקות" dir="rtl">
      {/* Streak card - now in weeks */}
      <div
        className="bg-[#1E293B] rounded-xl p-3 text-center"
        role="listitem"
        aria-label={isStreakDegraded ? 'נתוני רצף לא זמינים' : `${streak} שבועות רצף`}
      >
        {isStreakDegraded ? (
          <SkeletonBlock className="h-8 w-8 mx-auto mb-1" />
        ) : (
          <p className="text-2xl font-bold text-white">
            <span aria-hidden="true">🔥</span> {streak}
          </p>
        )}
        <p className="text-xs text-gray-500">רצף שבועות</p>
      </div>

      {/* Score card */}
      <div
        className="bg-[#1E293B] rounded-xl p-3 text-center"
        role="listitem"
        aria-label={isGrowthDegraded ? 'נתוני ניקוד לא זמינים' : `${score} נקודות`}
      >
        {isGrowthDegraded ? (
          <SkeletonBlock className="h-8 w-8 mx-auto mb-1" />
        ) : (
          <p className="text-2xl font-bold text-white">
            <span aria-hidden="true">⭐</span> {score >= 1000 ? `${(score / 1000).toFixed(1)}k` : score}
          </p>
        )}
        <p className="text-xs text-gray-500">ניקוד</p>
      </div>

      {/* Kids count card */}
      <div
        className="bg-[#1E293B] rounded-xl p-3 text-center"
        role="listitem"
        aria-label={isChildrenDegraded ? 'נתוני ילדים לא זמינים' : `${kidsCount} ילדים`}
      >
        {isChildrenDegraded ? (
          <SkeletonBlock className="h-8 w-8 mx-auto mb-1" />
        ) : (
          <p className="text-2xl font-bold text-white">
            <span aria-hidden="true">👨‍👧</span> {kidsCount}
          </p>
        )}
        <p className="text-xs text-gray-500">ילדים</p>
      </div>
    </div>
  );
}

/**
 * Degradation Banner - subtle notification when some sections are unavailable
 */
function DegradationBanner({ sections }: { sections: DegradedSection[] }) {
  if (sections.length === 0) return null;

  return (
    <div
      className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm text-amber-400">
        Some sections are temporarily unavailable. We&apos;re working on it.
      </p>
    </div>
  );
}

/**
 * Main Dashboard Page Component
 */
export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useWorkspaceSummary();
  const { data: celebrationsData, isLoading: celebrationsLoading } = useCelebrations();
  
  // Track page view
  usePageView({ pageName: 'Dashboard' });
  
  // Track if celebrations modal should be shown - initialize based on data
  // Use a ref to track if we've already shown celebrations this session
  const celebrationsShownRef = useRef(false);
  
  // Determine if we should show celebrations based on data
  const hasUndisplayedCelebrations = celebrationsData?.has_undisplayed && 
    celebrationsData.celebrations.some(c => !c.displayed);
  
  const [showCelebrations, setShowCelebrations] = useState(false);
  
  // Show celebrations modal when data loads with undisplayed celebrations (once per session)
  useEffect(() => {
    if (hasUndisplayedCelebrations && !celebrationsShownRef.current) {
      celebrationsShownRef.current = true;
      setShowCelebrations(true);
    }
  }, [hasUndisplayedCelebrations]);

  // Handle celebration modal complete
  const handleCelebrationsComplete = () => {
    setShowCelebrations(false);
  };

  // Get undisplayed celebrations for the modal
  const undisplayedCelebrations = celebrationsData?.celebrations.filter(c => !c.displayed) ?? [];

  // Loading state - show skeleton
  if (isLoading || celebrationsLoading) {
    return <DashboardSkeleton />;
  }

  // Error state - show error with retry
  if (isError) {
    const isNetworkError = error?.message?.toLowerCase().includes('network');
    return (
      <div className="py-6">
        <ErrorState
          type={isNetworkError ? 'network' : 'error'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // No data (shouldn't happen, but handle gracefully)
  if (!data) {
    return (
      <div className="py-6">
        <ErrorState
          title="Something unexpected happened"
          description="We couldn't load your dashboard. Let's try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const degradedSections = data.degraded_sections ?? [];
  const hasDegradation = degradedSections.length > 0;

  return (
    <>
      {/* Celebration Modal - shown before father interacts with dashboard */}
      {showCelebrations && undisplayedCelebrations.length > 0 && (
        <CelebrationModal
          celebrations={undisplayedCelebrations}
          onComplete={handleCelebrationsComplete}
        />
      )}

      <div className="py-6 space-y-4">
        {/* Degradation banner (if any sections unavailable) */}
        {hasDegradation && <DegradationBanner sections={degradedSections} />}

        {/* Greeting header */}
        <header dir="rtl">
          <h1 className="text-xl font-semibold text-white">
            היי {data.father_display_name}! 👋
          </h1>
          <p className="text-gray-400 mt-1">
            המשך כך. אתה עושה שינוי אמיתי.
          </p>
        </header>

        {/* MOST IMPORTANT: Belt Progress Hero - Shows belt image and motivation */}
        <BeltProgressHero />

        {/* SECOND MOST IMPORTANT: Upcoming Quality Time Commitment */}
        <UpcomingCommitmentCard />

        {/* Weekly Goal Progress Card */}
        <WeeklyGoalProgressCard />

        {/* Stats Row */}
        <StatsRow
          streak={data.current_streak_days}
          score={data.growth_score}
          kidsCount={data.active_children_count}
          degradedSections={degradedSections}
        />

        {/* Recent Conversations - Hebrew */}
        {data.last_conversation_timestamp && (
          <div className="text-xs text-gray-500 text-center pt-4" dir="rtl">
            שיחת אימון אחרונה: {new Date(data.last_conversation_timestamp).toLocaleDateString('he-IL')}
          </div>
        )}
      </div>
    </>
  );
}
