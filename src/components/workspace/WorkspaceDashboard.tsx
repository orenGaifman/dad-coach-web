'use client';

/**
 * WorkspaceDashboard — Main container component for the father's workspace dashboard.
 *
 * Composes all dashboard components together and orchestrates:
 * - Data fetching via useWorkspaceSummary hook
 * - Belt celebration detection via useBeltCelebration hook
 * - Schedule modal state management
 * - Loading and error states
 * - RTL/localization support for English and Hebrew
 *
 * This component serves as the entry point for the father workspace experience
 * after onboarding completes (WEB-SPEC-007 → WEB-SPEC-008 handoff).
 *
 * Requirements:
 * - 13.1: Workspace Summary Dashboard display
 * - 13.2: Belt progression with celebration
 * - 13.3: Display celebration modal when new belt is earned
 * - 13.4: Schedule Quality Time primary action
 * - 13.5: Recent activity feed
 * - 13.6: Poll for workspace updates to detect belt changes
 *
 * @see design.md - Screen D1: Dashboard Home
 */

import { useState, useCallback } from 'react';
import { useWorkspaceSummary } from '@/src/hooks/useWorkspaceSummary';
import { useBeltCelebration } from '@/src/hooks/useBeltCelebration';
import { useLanguage, useDirection } from '@/src/providers/LanguageProvider';
import { BeltProgressionCard } from '@/src/components/dashboard/BeltProgressionCard';
import { NextQualityTimeCard } from '@/src/components/dashboard/NextQualityTimeCard';
import { StreakDisplay } from '@/src/components/dashboard/StreakDisplay';
import { RecentActivityFeed } from '@/src/components/dashboard/RecentActivityFeed';
import { AchievementBadges } from '@/src/components/dashboard/AchievementBadges';
import { ScheduleQualityTimeCTA } from '@/src/components/dashboard/ScheduleQualityTimeCTA';
import { ScheduleQualityTime } from '@/src/components/qualitytime/ScheduleQualityTime';
import { BeltEarnedModal } from '@/src/components/celebrations/BeltEarnedModal';
import { CelebrationOverlay } from '@/src/components/celebrations/CelebrationOverlay';
import { ErrorState } from '@/src/components/common/ErrorState';
import {
  SkeletonCard,
  SkeletonText,
  SkeletonBlock,
} from '@/src/components/common/SkeletonScreen';
import type { Achievement } from '@/src/types/growth';
import type { QualityTime } from '@/src/types/qualityTime';

// ---------------------------------------------------------------------------
// Localized Text
// ---------------------------------------------------------------------------

/**
 * Localized greeting text for the dashboard header.
 * Supports English (en) and Hebrew (he).
 */
const GREETINGS: Record<'en' | 'he', string> = {
  en: 'Welcome back',
  he: 'ברוך שובך',
};

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Helper function to combine class names, filtering out falsy values.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Loading Skeleton Component
// ---------------------------------------------------------------------------

/**
 * DashboardSkeleton — Loading state skeleton matching the dashboard layout.
 *
 * Shows placeholder cards while workspace summary data is being fetched.
 * Matches the final layout structure for smooth content transition.
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4" aria-label="Loading dashboard" role="status">
      {/* Welcome header skeleton */}
      <div className="space-y-2">
        <SkeletonText width="w-32" />
        <SkeletonText width="w-48" className="h-6" />
      </div>

      {/* Belt progression card skeleton */}
      <SkeletonCard className="h-28" />

      {/* Next Quality Time or CTA skeleton */}
      <SkeletonCard className="h-36" />

      {/* Streak display skeleton */}
      <SkeletonCard className="h-28" />

      {/* Recent activity skeleton */}
      <SkeletonCard className="h-48">
        <SkeletonText width="w-24" className="mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonBlock className="h-6 w-6 rounded-full" />
              <div className="flex-1 space-y-1">
                <SkeletonText width="w-3/4" />
                <SkeletonText width="w-1/4" className="h-3" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* Achievements skeleton */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <SkeletonText width="w-24" />
          <SkeletonText width="w-16" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="h-20" />
          ))}
        </div>
      </div>

      {/* Screen reader loading announcement */}
      <span className="sr-only">Loading your dashboard...</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WorkspaceDashboardProps {
  /** Additional CSS classes for the container */
  className?: string;
  /** Mock recent Quality Times for the activity feed (until API supports it) */
  recentQualityTimes?: QualityTime[];
  /** Mock achievements for the badges display (until API supports it) */
  achievements?: Achievement[];
}

// ---------------------------------------------------------------------------
// WorkspaceDashboard Component
// ---------------------------------------------------------------------------

/**
 * WorkspaceDashboard — Main container component for the Father Workspace.
 *
 * Fetches workspace summary data and composes all dashboard sub-components.
 * Handles loading states, error states, belt celebrations, and scheduling modals.
 *
 * @example
 * // Basic usage
 * <WorkspaceDashboard />
 *
 * @example
 * // With mock data for development
 * <WorkspaceDashboard
 *   recentQualityTimes={mockQualityTimes}
 *   achievements={mockAchievements}
 * />
 */
export function WorkspaceDashboard({
  className,
  recentQualityTimes = [],
  achievements = [],
}: WorkspaceDashboardProps) {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { language } = useLanguage();
  const direction = useDirection();
  const lang = language === 'he' ? 'he' : 'en';

  // Fetch workspace summary data
  const { data: summary, isLoading, error, refetch } = useWorkspaceSummary();

  // Belt celebration detection
  const beltCelebration = useBeltCelebration();

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCelebrationOverlay, setShowCelebrationOverlay] = useState(false);

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Open the schedule Quality Time modal.
   */
  const handleOpenScheduleModal = useCallback(() => {
    setShowScheduleModal(true);
  }, []);

  /**
   * Close the schedule Quality Time modal.
   */
  const handleCloseScheduleModal = useCallback(() => {
    setShowScheduleModal(false);
  }, []);

  /**
   * Handle belt celebration dismissal.
   * Triggers confetti overlay then dismisses the modal.
   */
  const handleDismissBeltCelebration = useCallback(() => {
    setShowCelebrationOverlay(true);
    beltCelebration.dismiss();
  }, [beltCelebration]);

  /**
   * Handle celebration overlay completion.
   */
  const handleCelebrationOverlayComplete = useCallback(() => {
    setShowCelebrationOverlay(false);
  }, []);

  /**
   * Handle retry on error.
   */
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // ---------------------------------------------------------------------------
  // Error State
  // ---------------------------------------------------------------------------

  if (error) {
    return (
      <div className={classNames('p-4', className)} dir={direction}>
        <ErrorState
          type="error"
          title={lang === 'he' ? 'משהו השתבש' : 'Something went wrong'}
          description={
            lang === 'he'
              ? 'לא הצלחנו לטעון את לוח הבקרה. נסה שוב.'
              : "We couldn't load your dashboard. Let's try again."
          }
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // No Data State
  // ---------------------------------------------------------------------------

  if (!summary) {
    return null;
  }

  // ---------------------------------------------------------------------------
  // Prepare Display Data
  // ---------------------------------------------------------------------------

  // Build a QualityTime object for NextQualityTimeCard if we have next_quality_time data
  // Note: The API might return next_quality_time or we need to handle when it's null
  const nextQualityTime: QualityTime | null = summary.active_mission
    ? {
        id: summary.active_mission.mission_id,
        father_id: 0, // Not needed for display
        child_id: 0, // Not needed for display
        child_name: summary.active_mission.child_name,
        scheduled_start: new Date().toISOString(), // Placeholder - needs real data
        scheduled_end: new Date().toISOString(), // Placeholder - needs real data
        status: 'SCHEDULED',
      }
    : null;

  // Greeting text
  const greeting = GREETINGS[lang];
  const displayName = summary.father_display_name || (lang === 'he' ? 'אבא' : 'Dad');

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={classNames('space-y-6 p-4', className)}
      dir={direction}
      role="main"
      aria-label={lang === 'he' ? 'לוח הבקרה' : 'Dashboard'}
    >
      {/* Welcome Header */}
      <header className="space-y-1">
        <p className="text-sm text-gray-400">{greeting}</p>
        <h1 className="text-2xl font-bold text-white">
          {displayName}
          <span className="ml-2" aria-hidden="true">
            👋
          </span>
        </h1>
      </header>

      {/* Belt Progression Card */}
      <BeltProgressionCard
        belt={summary.current_belt}
        completionCount={summary.growth_score}
      />

      {/* Next Quality Time or Schedule CTA */}
      {nextQualityTime ? (
        <NextQualityTimeCard
          qualityTime={nextQualityTime}
          onReschedule={handleOpenScheduleModal}
        />
      ) : (
        <div className="space-y-3">
          <NextQualityTimeCard
            qualityTime={null}
            onReschedule={handleOpenScheduleModal}
          />
          <ScheduleQualityTimeCTA
            onClick={handleOpenScheduleModal}
            className="w-full"
          />
        </div>
      )}

      {/* Streak Display */}
      <StreakDisplay
        currentStreak={summary.current_streak_days}
        longestStreak={summary.current_streak_days} // API should provide longest_streak
      />

      {/* Recent Activity Feed */}
      <RecentActivityFeed activities={recentQualityTimes} />

      {/* Achievement Badges */}
      {achievements.length > 0 && (
        <AchievementBadges achievements={achievements} />
      )}

      {/* Schedule Quality Time Modal */}
      {showScheduleModal && (
        <ScheduleQualityTime onClose={handleCloseScheduleModal} />
      )}

      {/* Belt Celebration Modal */}
      {beltCelebration.isActive && beltCelebration.newBelt && (
        <BeltEarnedModal
          newBelt={beltCelebration.newBelt}
          onDismiss={handleDismissBeltCelebration}
        />
      )}

      {/* Celebration Confetti Overlay */}
      <CelebrationOverlay
        isVisible={showCelebrationOverlay}
        onComplete={handleCelebrationOverlayComplete}
        duration={3000}
        particleCount={50}
      />
    </div>
  );
}

export default WorkspaceDashboard;
