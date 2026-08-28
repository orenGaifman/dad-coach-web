'use client';

/**
 * Child Detail Page — Screen F2
 *
 * Displays detailed read-only information for a single child including
 * name, age, birth date, interests, challenges, active goals, and
 * mission history.
 *
 * Features:
 * - Full child profile display (read-only)
 * - Birthday indicator with days until birthday
 * - Interests and challenges tags
 * - Active goals with progress
 * - Mission history summary
 * - Back navigation to family overview
 * - Loading skeleton
 * - Error handling (including 404)
 *
 * Requirements: 6.1, 6.2, 6.3 (Child Detail)
 * @see design.md - Screen F2: Child Detail
 */

import { use } from 'react';
import Link from 'next/link';
import { useChildDetail } from '@/src/hooks/useChildDetail';
import { SkeletonCard } from '@/src/components/common/SkeletonScreen';
import { ErrorState } from '@/src/components/common/ErrorState';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import type { ChildDetail, GoalSummary, RecentMissionSummary } from '@/src/types/family';

/**
 * Format birth date for display.
 */
function formatBirthDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Loading skeleton for the child detail page.
 */
function ChildDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <SkeletonCard className="h-32" />
      
      {/* Info sections */}
      <SkeletonCard className="h-24" />
      <SkeletonCard className="h-24" />
      <SkeletonCard className="h-32" />
    </div>
  );
}

/**
 * Info card section component.
 */
function InfoSection({ 
  title, 
  icon, 
  children 
}: { 
  title: string; 
  icon: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <span aria-hidden="true">{icon}</span>
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/**
 * Tag list component for interests and challenges.
 */
function TagList({ 
  items, 
  emptyMessage 
}: { 
  items: string[]; 
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="text-gray-500 text-sm">{emptyMessage}</p>;
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="px-3 py-1.5 bg-white/5 rounded-full text-sm text-gray-300"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/**
 * Goal card component.
 */
function GoalCard({ goal }: { goal: GoalSummary }) {
  return (
    <Link
      href={`/family/goals/${goal.goal_id}`}
      className="block p-3 bg-[#0F172A] rounded-xl hover:bg-[#1a2234] transition-colors"
    >
      <p className="text-white text-sm font-medium mb-2 line-clamp-2">
        {goal.description}
      </p>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 capitalize">
          {(goal.category ?? '').toLowerCase().replace('_', ' ')}
        </span>
        <span className="text-xs text-gray-400">
          {goal.progress_percentage}%
        </span>
      </div>
      <ProgressBar 
        value={goal.progress_percentage} 
        height="sm"
        color="bg-teal-500"
      />
    </Link>
  );
}

/**
 * Mission history item component.
 */
function MissionHistoryItem({ mission }: { mission: RecentMissionSummary }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-emerald-400" aria-hidden="true">✓</span>
      <p className="text-gray-300 text-sm flex-1 truncate">{mission.title}</p>
      {mission.completed_at && (
        <span className="text-gray-500 text-xs flex-shrink-0">
          {new Date(mission.completed_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      )}
    </div>
  );
}

/**
 * Child detail content component.
 */
function ChildDetailContent({ child }: { child: ChildDetail }) {
  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-teal-400 text-2xl font-semibold">
              {(child.name ?? 'C').charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-white text-xl font-semibold">
                {child.name}
              </h2>
              {child.birthday_upcoming && (
                <span 
                  className="text-xl" 
                  role="img" 
                  aria-label="Birthday coming up"
                >
                  🎂
                </span>
              )}
            </div>
            
            <p className="text-gray-400">{child.computed_age}</p>
            
            <p className="text-gray-500 text-sm mt-1">
              Born {formatBirthDate(child.birth_date)}
            </p>
            
            {child.days_until_birthday !== null && child.days_until_birthday <= 30 && (
              <div className="mt-3 inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-full text-sm">
                <span aria-hidden="true">🎉</span>
                <span>
                  {child.days_until_birthday === 0 
                    ? "Happy Birthday today!" 
                    : `Birthday in ${child.days_until_birthday} ${child.days_until_birthday === 1 ? 'day' : 'days'}`
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interests */}
      <InfoSection title="Interests" icon="💫">
        <TagList 
          items={child.interests} 
          emptyMessage="No interests added yet"
        />
      </InfoSection>

      {/* Challenges */}
      <InfoSection title="Challenges" icon="💪">
        <TagList 
          items={child.challenges} 
          emptyMessage="No challenges noted"
        />
      </InfoSection>

      {/* Active Goals */}
      <InfoSection title="Active Goals" icon="🎯">
        {child.active_goals.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No active goals for {child.name}
          </p>
        ) : (
          <div className="space-y-3">
            {child.active_goals.map((goal) => (
              <GoalCard key={goal.goal_id} goal={goal} />
            ))}
          </div>
        )}
      </InfoSection>

      {/* Mission History */}
      <InfoSection title="Mission History" icon="📜">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-gray-400 text-sm">
            {child.mission_history.total_completed} completed
          </span>
          <span className="text-gray-500 text-sm">
            {child.mission_history.total_started} started
          </span>
        </div>
        
        {child.mission_history.recent_completed.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No missions completed yet
          </p>
        ) : (
          <div>
            {child.mission_history.recent_completed.map((mission) => (
              <MissionHistoryItem key={mission.mission_id} mission={mission} />
            ))}
          </div>
        )}
      </InfoSection>
    </div>
  );
}

/**
 * Page props with route params.
 */
interface PageProps {
  params: Promise<{ childId: string }>;
}

/**
 * Child detail page component.
 */
export default function ChildDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const childId = parseInt(resolvedParams.childId, 10);
  
  const { 
    data: childDetailData, 
    isLoading, 
    error, 
    refetch 
  } = useChildDetail(isNaN(childId) ? undefined : childId);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0F172A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/family"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Back to Family"
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
              {childDetailData?.child.name ?? 'Child Details'}
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Invalid ID */}
        {isNaN(childId) && (
          <ErrorState
            type="error"
            title="Invalid child ID"
            description="The child ID in the URL is not valid."
          />
        )}
        
        {/* Loading state */}
        {!isNaN(childId) && isLoading && <ChildDetailSkeleton />}

        {/* Error state */}
        {!isNaN(childId) && error && !isLoading && (
          <ErrorState
            type="error"
            description="We couldn't load this child's details. Let's try again."
            onRetry={refetch}
          />
        )}

        {/* Success state */}
        {!isNaN(childId) && childDetailData && !isLoading && (
          <ChildDetailContent child={childDetailData.child} />
        )}
      </main>
    </div>
  );
}
