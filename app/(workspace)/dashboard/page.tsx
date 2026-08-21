'use client';

/**
 * Dashboard Home page — the father's main view after authentication.
 *
 * Displays the workspace summary with:
 * - Warm greeting with father's name
 * - Belt summary card (current belt + progress)
 * - Stats row (streak, score, kids count)
 * - Active mission card (or encouraging empty state)
 * - Quick actions grid
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

import { useState, useEffect } from 'react';
import { useWorkspaceSummary } from '@/src/hooks/useWorkspaceSummary';
import { useCelebrations } from '@/src/hooks/useCelebrations';
import { CelebrationModal } from '@/src/components/common/CelebrationModal';
import { usePageView } from '@/src/hooks/usePageView';
import { UpcomingCommitmentCard } from '@/src/components/dashboard/UpcomingCommitmentCard';
import { WeeklyGoalProgressCard } from '@/src/components/dashboard/WeeklyGoalProgressCard';
import { StreakDisplay } from '@/src/components/dashboard/StreakDisplay';
import { useStreak } from '@/src/hooks/useStreak';
import {
  SkeletonCard,
  SkeletonText,
  SkeletonBlock,
} from '@/src/components/common/SkeletonScreen';
import { ErrorState } from '@/src/components/common/ErrorState';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import type { ActiveMissionSummary, MissionCategory } from '@/src/types/workspace';
import type { BeltLevel } from '@/src/types/growth';
import type { DegradedSection } from '@/src/types/common';

/**
 * Helper function to combine class names
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get the belt display name with proper formatting
 */
function getBeltDisplayName(belt: BeltLevel): string {
  const beltNames: Record<BeltLevel, string> = {
    WHITE: 'White Belt',
    YELLOW: 'Yellow Belt',
    ORANGE: 'Orange Belt',
    GREEN: 'Green Belt',
    BLUE: 'Blue Belt',
    PURPLE: 'Purple Belt',
    BROWN: 'Brown Belt',
    BLACK: 'Black Belt',
  };
  return beltNames[belt];
}

/**
 * Get the belt color class for styling
 */
function getBeltColorClass(belt: BeltLevel): string {
  const colorClasses: Record<BeltLevel, string> = {
    WHITE: 'text-gray-200',
    YELLOW: 'text-yellow-400',
    ORANGE: 'text-orange-400',
    GREEN: 'text-emerald-400',
    BLUE: 'text-blue-400',
    PURPLE: 'text-purple-400',
    BROWN: 'text-amber-700',
    BLACK: 'text-gray-100',
  };
  return colorClasses[belt];
}

/**
 * Get the progress bar color for the belt
 */
function getBeltProgressColor(belt: BeltLevel): string {
  const progressColors: Record<BeltLevel, string> = {
    WHITE: 'bg-gray-400',
    YELLOW: 'bg-yellow-500',
    ORANGE: 'bg-orange-500',
    GREEN: 'bg-emerald-500',
    BLUE: 'bg-blue-500',
    PURPLE: 'bg-purple-500',
    BROWN: 'bg-amber-700',
    BLACK: 'bg-gray-200',
  };
  return progressColors[belt];
}

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
 * Belt Summary Card - compact belt display for dashboard
 * Links to Growth tab for full details (implemented in Task 2.2)
 */
interface BeltSummaryCardProps {
  belt: BeltLevel;
  score: number;
  isDegraded?: boolean;
}

function BeltSummaryCard({ belt, score, isDegraded }: BeltSummaryCardProps) {
  // If belt section is degraded, show placeholder
  if (isDegraded) {
    return (
      <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/5">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonText width="w-24" />
            <SkeletonBlock className="h-2 w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Calculate progress percentage (placeholder - will use belt hook in Task 2.2)
  const beltThresholds: Record<BeltLevel, { min: number; max: number }> = {
    WHITE: { min: 0, max: 500 },
    YELLOW: { min: 500, max: 1000 },
    ORANGE: { min: 1000, max: 1500 },
    GREEN: { min: 1500, max: 2000 },
    BLUE: { min: 2000, max: 3000 },
    PURPLE: { min: 3000, max: 4000 },
    BROWN: { min: 4000, max: 5000 },
    BLACK: { min: 5000, max: 5000 },
  };

  const threshold = beltThresholds[belt];
  const progress =
    belt === 'BLACK'
      ? 100
      : Math.min(100, ((score - threshold.min) / (threshold.max - threshold.min)) * 100);

  return (
    <div
      className="bg-[#1E293B] rounded-2xl p-4 border border-white/5"
      role="region"
      aria-label="Belt progress"
    >
      <p className="text-sm text-gray-400 mb-3">Your Belt</p>
      <div className="flex items-center gap-4">
        {/* Belt icon placeholder - will use actual image in Task 2.2 */}
        <div className="w-12 h-12 rounded-full bg-[#0F172A] flex items-center justify-center">
          <span className="text-2xl" aria-hidden="true">
            🥋
          </span>
        </div>
        <div className="flex-1">
          <p className={classNames('font-semibold', getBeltColorClass(belt))}>
            {getBeltDisplayName(belt)}
          </p>
          <div className="mt-2">
            <ProgressBar
              value={progress}
              color={getBeltProgressColor(belt)}
              height="sm"
              label={`Belt progress: ${Math.round(progress)}%`}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {belt === 'BLACK'
              ? 'Dad Sensei - You\'ve mastered it!'
              : `${(score ?? 0).toLocaleString()} XP`}
          </p>
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
 * Get mission category icon
 */
function getMissionCategoryEmoji(category: MissionCategory): string {
  const icons: Record<MissionCategory, string> = {
    QUALITY_TIME: '⏰',
    LISTENING: '👂',
    PLAY: '🎮',
    CONVERSATION: '💬',
    ROUTINE: '📋',
    TEACHING: '📚',
    BONDING: '🤝',
  };
  return icons[category] || '🎯';
}

/**
 * Active Mission Card - displays current mission or encouraging empty state
 */
interface ActiveMissionCardProps {
  mission: ActiveMissionSummary | null;
  isDegraded?: boolean;
}

function ActiveMissionCard({ mission, isDegraded }: ActiveMissionCardProps) {
  // If missions section is degraded, show placeholder
  if (isDegraded) {
    return (
      <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <SkeletonText width="w-32" />
          <SkeletonText width="w-16" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBlock className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <SkeletonText width="w-3/4" />
            <SkeletonText width="w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // No active mission - show encouraging message
  if (!mission) {
    return (
      <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/5">
        <div className="text-center py-4">
          <span className="text-3xl mb-2 block" aria-hidden="true">
            🎯
          </span>
          <p className="text-white font-medium">No active mission</p>
          <p className="text-sm text-gray-400 mt-1">
            Check Coaching for your next adventure
          </p>
        </div>
      </div>
    );
  }

  const progress = mission.total_steps > 0
    ? (mission.completed_steps / mission.total_steps) * 100
    : 0;

  return (
    <div
      className="bg-[#1E293B] rounded-2xl p-4 border border-white/5"
      role="region"
      aria-label={`Active mission: ${mission.title}`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">Active Mission</p>
        {mission.days_remaining !== null && (
          <span className="text-xs text-teal-400 bg-teal-500/10 px-2 py-1 rounded-full">
            {mission.days_remaining} {mission.days_remaining === 1 ? 'day' : 'days'} left
          </span>
        )}
      </div>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#0F172A] flex items-center justify-center flex-shrink-0">
          <span className="text-xl" aria-hidden="true">
            {getMissionCategoryEmoji(mission.category)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{mission.title}</p>
          <p className="text-sm text-gray-400">{mission.child_name}</p>
          <div className="mt-2">
            <ProgressBar
              value={progress}
              color="bg-teal-500"
              height="sm"
              label={`Mission progress: ${mission.completed_steps} of ${mission.total_steps} steps`}
            />
            <p className="text-xs text-gray-500 mt-1">
              {mission.completed_steps}/{mission.total_steps} completed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Quick Actions Grid - navigation shortcuts in Hebrew
 */
function QuickActionsGrid() {
  const actions = [
    { icon: '⏰', label: 'דווח זמן איכות', href: '/coaching/log' },
    { icon: '💜', label: 'דווח פעולה חיובית', href: '/coaching/log' },
    { icon: '💬', label: 'שוחח עם המאמן', href: '#whatsapp' },
    { icon: '🎯', label: 'צפה במשימות', href: '/coaching' },
  ];

  return (
    <div dir="rtl">
      <p className="text-sm text-gray-500 uppercase tracking-wide mb-3">
        פעולות מהירות
      </p>
      <div className="grid grid-cols-2 gap-3" role="navigation" aria-label="פעולות מהירות">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className={classNames(
              'bg-[#1E293B] rounded-xl p-3 text-center',
              'border border-white/5',
              'hover:bg-[#2D3B4F] transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0F172A]'
            )}
            onClick={() => {
              // Navigation will be implemented with actual routing
              console.log(`Navigate to: ${action.href}`);
            }}
            aria-label={action.label}
          >
            <span className="text-2xl block mb-1" aria-hidden="true">
              {action.icon}
            </span>
            <span className="text-xs text-gray-300">{action.label}</span>
          </button>
        ))}
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
  
  // Track if celebrations modal should be shown
  const [showCelebrations, setShowCelebrations] = useState(false);
  
  // Check for undisplayed celebrations on mount
  useEffect(() => {
    if (celebrationsData?.has_undisplayed && celebrationsData.celebrations.length > 0) {
      // Filter to only undisplayed celebrations
      const undisplayed = celebrationsData.celebrations.filter(c => !c.displayed);
      if (undisplayed.length > 0) {
        setShowCelebrations(true);
      }
    }
  }, [celebrationsData]);

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

        {/* MOST IMPORTANT: Upcoming Quality Time Commitment - this is the core of the app! */}
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

        {/* Belt Summary Card - moved lower as it's secondary to quality times */}
        <BeltSummaryCard
          belt={data.current_belt}
          score={data.growth_score}
          isDegraded={isSectionDegraded('belt', degradedSections) || isSectionDegraded('growth', degradedSections)}
        />

        {/* Active Mission Card */}
        <ActiveMissionCard
          mission={data.active_mission}
          isDegraded={isSectionDegraded('missions', degradedSections)}
        />

        {/* Quick Actions Grid */}
        <QuickActionsGrid />

        {/* Recent Conversations placeholder - will be expanded in later tasks */}
        {data.last_conversation_timestamp && (
          <div className="text-xs text-gray-500 text-center pt-4">
            Last coaching session: {new Date(data.last_conversation_timestamp).toLocaleDateString()}
          </div>
        )}
      </div>
    </>
  );
}
