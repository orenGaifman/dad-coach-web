'use client';

/**
 * Goal Detail Page — Screen F4
 *
 * Displays detailed information about a specific goal including:
 * - Goal description, category, priority, status
 * - Progress indicator (capped at 100%)
 * - Related child information
 * - List of related missions (read-only)
 * - Milestones reached
 *
 * This is a read-only view. Goals are created and managed through
 * WhatsApp coaching sessions.
 *
 * Requirements: 8.1, 8.2, 8.3 (Goal Detail)
 * @see design.md - Screen F4: Goal Detail
 */

import { use } from 'react';
import Link from 'next/link';
import { useGoalDetail } from '@/src/hooks/useGoalDetail';
import { SkeletonCard, SkeletonText } from '@/src/components/common/SkeletonScreen';
import { ErrorState } from '@/src/components/common/ErrorState';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import type { GoalCategory, GoalPriority, GoalRelatedMission, GoalMilestone } from '@/src/types/family';

/**
 * Helper function to combine class names, filtering out falsy values.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Category display information.
 */
const CATEGORY_INFO: Record<GoalCategory, { label: string; icon: string; color: string }> = {
  COMMUNICATION: { label: 'Communication', icon: '💬', color: 'bg-blue-500/20 text-blue-400' },
  QUALITY_TIME: { label: 'Quality Time', icon: '⏰', color: 'bg-teal-500/20 text-teal-400' },
  DISCIPLINE: { label: 'Discipline', icon: '📏', color: 'bg-orange-500/20 text-orange-400' },
  EMOTIONAL_SUPPORT: { label: 'Emotional Support', icon: '💜', color: 'bg-purple-500/20 text-purple-400' },
  EDUCATION: { label: 'Education', icon: '📚', color: 'bg-indigo-500/20 text-indigo-400' },
  HEALTH: { label: 'Health', icon: '💪', color: 'bg-emerald-500/20 text-emerald-400' },
  BONDING: { label: 'Bonding', icon: '🤝', color: 'bg-pink-500/20 text-pink-400' },
  OTHER: { label: 'Other', icon: '📌', color: 'bg-gray-500/20 text-gray-400' },
};

/**
 * Priority display information.
 */
const PRIORITY_INFO: Record<GoalPriority, { label: string; color: string }> = {
  HIGH: { label: 'High Priority', color: 'bg-red-500/20 text-red-400' },
  MEDIUM: { label: 'Medium Priority', color: 'bg-amber-500/20 text-amber-400' },
  LOW: { label: 'Low Priority', color: 'bg-slate-500/20 text-slate-400' },
};

/**
 * Format date for display.
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format relative time for missions.
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateString);
}

/**
 * Loading skeleton for the goal detail page.
 */
function GoalDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header card skeleton */}
      <SkeletonCard className="h-48" />
      
      {/* Progress card skeleton */}
      <SkeletonCard className="h-24" />
      
      {/* Missions skeleton */}
      <div className="space-y-3">
        <SkeletonText className="h-6 w-32" />
        <SkeletonCard className="h-20" />
        <SkeletonCard className="h-20" />
      </div>
    </div>
  );
}

/**
 * Mission card component.
 */
function MissionCard({ mission }: { mission: GoalRelatedMission }) {
  const isCompleted = mission.status === 'COMPLETED';
  const isSkipped = mission.status === 'SKIPPED';
  
  return (
    <div
      className={classNames(
        'bg-[#1E293B] rounded-xl p-4 border border-white/5',
        isSkipped && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div
          className={classNames(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
            isCompleted && 'bg-emerald-500/20',
            isSkipped && 'bg-gray-500/20',
            !isCompleted && !isSkipped && 'bg-teal-500/20'
          )}
        >
          {isCompleted && (
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isSkipped && (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          )}
          {!isCompleted && !isSkipped && (
            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={classNames(
            'font-medium',
            isCompleted ? 'text-white' : 'text-gray-300',
            isSkipped && 'line-through text-gray-500'
          )}>
            {mission.title}
          </p>
          
          <p className="text-xs text-gray-500 mt-1">
            {isCompleted && mission.completed_at ? (
              <>Completed {formatRelativeTime(mission.completed_at)}</>
            ) : isSkipped ? (
              'Skipped'
            ) : (
              'In progress'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Milestone card component.
 */
function MilestoneCard({ milestone }: { milestone: GoalMilestone }) {
  return (
    <div className="flex items-start gap-3 py-3">
      {/* Trophy icon */}
      <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-sm">🏆</span>
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <p className="text-white text-sm">{milestone.description}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Reached {formatDate(milestone.reached_at)}
        </p>
      </div>
    </div>
  );
}

/**
 * Goal Detail page component.
 */
export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const resolvedParams = use(params);
  const goalId = resolvedParams.goalId;
  
  const { data, isLoading, error, refetch } = useGoalDetail(goalId);

  const goal = data?.goal;
  const categoryInfo = goal ? CATEGORY_INFO[goal.category] : null;
  const priorityInfo = goal ? PRIORITY_INFO[goal.priority] : null;
  
  // Cap progress at 100%
  const cappedProgress = goal ? Math.min(goal.progress_percentage, 100) : 0;
  
  // Split missions by status
  const completedMissions = goal?.related_missions.filter(m => m.status === 'COMPLETED') ?? [];
  const activeMissions = goal?.related_missions.filter(m => m.status === 'ACTIVE') ?? [];
  const skippedMissions = goal?.related_missions.filter(m => m.status === 'SKIPPED') ?? [];

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0F172A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/family/goals"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Back to Goals"
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
              Goal Details
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Loading state */}
        {isLoading && <GoalDetailSkeleton />}

        {/* Error state */}
        {error && !isLoading && (
          <ErrorState
            type="error"
            description="We couldn't load this goal. Let's try again."
            onRetry={refetch}
          />
        )}

        {/* Success state */}
        {goal && !isLoading && (
          <div className="space-y-6">
            {/* Goal header card */}
            <section className="bg-[#1E293B] rounded-2xl p-5 border border-white/5">
              {/* Category and priority badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categoryInfo && (
                  <span className={classNames(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
                    categoryInfo.color
                  )}>
                    <span aria-hidden="true">{categoryInfo.icon}</span>
                    {categoryInfo.label}
                  </span>
                )}
                {priorityInfo && (
                  <span className={classNames(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    priorityInfo.color
                  )}>
                    {priorityInfo.label}
                  </span>
                )}
                <span className={classNames(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  goal.status === 'ACTIVE' && 'bg-teal-500/20 text-teal-400',
                  goal.status === 'COMPLETED' && 'bg-emerald-500/20 text-emerald-400',
                  goal.status === 'ARCHIVED' && 'bg-gray-500/20 text-gray-400'
                )}>
                  {goal.status.charAt(0) + goal.status.slice(1).toLowerCase()}
                </span>
              </div>
              
              {/* Description */}
              <h2 className="text-white text-lg font-medium mb-3">
                {goal.description}
              </h2>
              
              {/* Related child */}
              {goal.related_child && (
                <Link
                  href={`/family/children/${goal.related_child.child_id}`}
                  className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors"
                >
                  <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    👶
                  </span>
                  {goal.related_child.name}
                </Link>
              )}
              
              {/* Created date */}
              <p className="text-xs text-gray-500 mt-4">
                Created {formatDate(goal.created_at)}
              </p>
            </section>

            {/* Progress card */}
            <section className="bg-[#1E293B] rounded-2xl p-5 border border-white/5">
              <h3 className="text-gray-400 text-sm font-medium mb-3">Progress</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-bold text-white">
                    {cappedProgress}%
                  </span>
                  {goal.status === 'COMPLETED' ? (
                    <span className="text-emerald-400 text-sm">Goal achieved! 🎉</span>
                  ) : (
                    <span className="text-gray-500 text-sm">Keep going!</span>
                  )}
                </div>
                
                <ProgressBar
                  value={cappedProgress}
                  height="md"
                  color={goal.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-teal-500'}
                />
              </div>
            </section>

            {/* Missions section */}
            <section>
              <h3 className="text-white font-medium mb-4">
                Related Missions ({goal.related_missions.length})
              </h3>
              
              {goal.related_missions.length > 0 ? (
                <div className="space-y-3">
                  {/* Active missions first */}
                  {activeMissions.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs text-teal-400 font-medium uppercase tracking-wider">
                        In Progress
                      </p>
                      {activeMissions.map((mission) => (
                        <MissionCard key={mission.mission_id} mission={mission} />
                      ))}
                    </div>
                  )}
                  
                  {/* Completed missions */}
                  {completedMissions.length > 0 && (
                    <div className="space-y-3 mt-4">
                      <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider">
                        Completed
                      </p>
                      {completedMissions.map((mission) => (
                        <MissionCard key={mission.mission_id} mission={mission} />
                      ))}
                    </div>
                  )}
                  
                  {/* Skipped missions */}
                  {skippedMissions.length > 0 && (
                    <div className="space-y-3 mt-4">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Skipped
                      </p>
                      {skippedMissions.map((mission) => (
                        <MissionCard key={mission.mission_id} mission={mission} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#1E293B] rounded-xl p-6 text-center border border-white/5">
                  <p className="text-gray-400">
                    No missions yet. Your coach will assign missions as you work toward this goal.
                  </p>
                </div>
              )}
            </section>

            {/* Milestones section */}
            {goal.milestones_reached.length > 0 && (
              <section>
                <h3 className="text-white font-medium mb-4">
                  Milestones ({goal.milestones_reached.length})
                </h3>
                
                <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/5">
                  <div className="divide-y divide-white/5">
                    {goal.milestones_reached.map((milestone) => (
                      <MilestoneCard key={milestone.milestone_id} milestone={milestone} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Coaching note */}
            <section className="bg-teal-500/10 rounded-2xl p-4 border border-teal-500/20">
              <div className="flex items-start gap-3">
                <span className="text-lg">💡</span>
                <div>
                  <p className="text-teal-300 text-sm font-medium mb-1">
                    A note about goals
                  </p>
                  <p className="text-teal-200/70 text-sm">
                    Goals and their progress are tracked through your WhatsApp coaching sessions. 
                    Continue your conversations with your coach to make progress on this goal.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
