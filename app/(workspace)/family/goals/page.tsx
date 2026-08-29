'use client';

/**
 * Goals Overview Page — Screen F3
 *
 * Displays all family goals with progress indicators and filtering options.
 * Goals come from WhatsApp coaching sessions and cannot be created from the UI.
 *
 * Features:
 * - Goal cards with progress bars
 * - Filtering by status (active, completed, archived)
 * - Filtering by category
 * - Filtering by child
 * - Progress percentage display (capped at 100%)
 * - Empty state explaining goals come from WhatsApp
 * - Loading skeleton
 * - Error handling
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4 (Goals Overview)
 * @see design.md - Screen F3: Goals Overview
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useGoals } from '@/src/hooks/useGoals';
import { useChildren } from '@/src/hooks/useChildren';
import { SkeletonCard } from '@/src/components/common/SkeletonScreen';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import type { GoalOverview, GoalStatus, GoalCategory } from '@/src/types/family';
import { classNames } from '@/src/utils/classNames';

/**
 * Category display information.
 */
const CATEGORY_INFO: Record<GoalCategory, { label: string; icon: string }> = {
  COMMUNICATION: { label: 'Communication', icon: '💬' },
  QUALITY_TIME: { label: 'Quality Time', icon: '⏰' },
  DISCIPLINE: { label: 'Discipline', icon: '📏' },
  EMOTIONAL_SUPPORT: { label: 'Emotional Support', icon: '💜' },
  EDUCATION: { label: 'Education', icon: '📚' },
  HEALTH: { label: 'Health', icon: '💪' },
  BONDING: { label: 'Bonding', icon: '🤝' },
  OTHER: { label: 'Other', icon: '📌' },
};

/**
 * Status filter options.
 */
const STATUS_OPTIONS: { value: GoalStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Goals' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

/**
 * Loading skeleton for the goals page.
 */
function GoalsSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonCard className="h-10" /> {/* Filter bar */}
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} className="h-28" />
      ))}
    </div>
  );
}

/**
 * Goal card component.
 */
function GoalCard({ goal }: { goal: GoalOverview }) {
  const categoryInfo = CATEGORY_INFO[goal.category];
  // Cap progress at 100%
  const cappedProgress = Math.min(goal.progress_percentage, 100);
  
  return (
    <Link
      href={`/family/goals/${goal.goal_id}`}
      className={classNames(
        'block bg-[#1E293B] rounded-2xl p-4 border border-white/5',
        'hover:bg-[#2D3B4D] transition-colors'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Category icon */}
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-lg" aria-hidden="true">
            {categoryInfo.icon}
          </span>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Description */}
          <p className="text-white font-medium mb-1 line-clamp-2">
            {goal.description}
          </p>
          
          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span>{categoryInfo.label}</span>
            {goal.related_child && (
              <>
                <span>•</span>
                <span>{goal.related_child.name}</span>
              </>
            )}
            <span>•</span>
            <span 
              className={classNames(
                goal.status === 'ACTIVE' && 'text-teal-400',
                goal.status === 'COMPLETED' && 'text-emerald-400',
                goal.status === 'ARCHIVED' && 'text-gray-400'
              )}
            >
              {(goal.status ?? 'PENDING').charAt(0) + (goal.status ?? 'PENDING').slice(1).toLowerCase()}
            </span>
          </div>
          
          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Progress</span>
              <span className="text-gray-400">{cappedProgress}%</span>
            </div>
            <ProgressBar 
              value={cappedProgress}
              height="sm"
              color={goal.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-teal-500'}
            />
          </div>
          
          {/* Missions count */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span>
              ✓ {goal.missions_completed_count} {goal.missions_completed_count === 1 ? 'mission' : 'missions'} done
            </span>
            {goal.missions_remaining_estimate > 0 && (
              <span>
                ~{goal.missions_remaining_estimate} remaining
              </span>
            )}
          </div>
        </div>
        
        {/* Chevron */}
        <div className="text-gray-500 flex-shrink-0">
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

/**
 * Filter button component.
 */
function FilterButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
        isActive
          ? 'bg-teal-500 text-white'
          : 'bg-white/5 text-gray-400 hover:bg-white/10'
      )}
    >
      {label}
    </button>
  );
}

/**
 * Empty state when there are no goals.
 */
function EmptyGoalsState() {
  const handleChatWithCoach = () => {
    window.open('https://wa.me/message/your-coach-number', '_blank');
  };

  return (
    <EmptyState
      imageSrc="/dashboard/dashboard-empty.webp"
      title="Goals are created through coaching"
      description="Your goals emerge naturally from your coaching conversations on WhatsApp. As you discuss your parenting journey, your coach will help you define meaningful goals."
      action={{
        label: "Chat with Coach",
        onClick: handleChatWithCoach,
      }}
    />
  );
}

/**
 * Goals page component.
 */
export default function GoalsPage() {
  const { 
    data: goalsData, 
    isLoading: isLoadingGoals, 
    error: goalsError, 
    refetch: refetchGoals 
  } = useGoals();
  
  const { data: childrenData } = useChildren();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<GoalStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<GoalCategory | 'ALL'>('ALL');
  const [childFilter, setChildFilter] = useState<number | 'ALL'>('ALL');

  // Get unique categories from goals
  const availableCategories = useMemo(() => {
    if (!goalsData?.goals) return [];
    const categories = new Set(goalsData.goals.map(g => g.category));
    return Array.from(categories);
  }, [goalsData?.goals]);

  // Filter goals
  const filteredGoals = useMemo(() => {
    if (!goalsData?.goals) return [];
    
    return goalsData.goals.filter((goal) => {
      // Status filter
      if (statusFilter !== 'ALL' && goal.status !== statusFilter) {
        return false;
      }
      
      // Category filter
      if (categoryFilter !== 'ALL' && goal.category !== categoryFilter) {
        return false;
      }
      
      // Child filter
      if (childFilter !== 'ALL') {
        if (!goal.related_child || goal.related_child.child_id !== childFilter) {
          return false;
        }
      }
      
      return true;
    });
  }, [goalsData?.goals, statusFilter, categoryFilter, childFilter]);

  const hasGoals = (goalsData?.goals?.length ?? 0) > 0;
  const hasFilters = statusFilter !== 'ALL' || categoryFilter !== 'ALL' || childFilter !== 'ALL';
  const showNoResults = hasFilters && filteredGoals.length === 0 && hasGoals;

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
              Family Goals
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Loading state */}
        {isLoadingGoals && <GoalsSkeleton />}

        {/* Error state */}
        {goalsError && !isLoadingGoals && (
          <ErrorState
            type="error"
            description="We couldn't load your goals. Let's try again."
            onRetry={refetchGoals}
          />
        )}

        {/* Success state */}
        {goalsData && !isLoadingGoals && (
          <>
            {hasGoals ? (
              <div className="space-y-4">
                {/* Status filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  {STATUS_OPTIONS.map((option) => (
                    <FilterButton
                      key={option.value}
                      label={option.label}
                      isActive={statusFilter === option.value}
                      onClick={() => setStatusFilter(option.value)}
                    />
                  ))}
                </div>
                
                {/* Category and child filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  {/* Category filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as GoalCategory | 'ALL')}
                    className="px-3 py-1.5 rounded-full text-sm bg-white/5 text-gray-300 border-0 focus:ring-2 focus:ring-teal-500"
                    aria-label="Filter by category"
                  >
                    <option value="ALL">All Categories</option>
                    {availableCategories.map((category) => (
                      <option key={category} value={category}>
                        {CATEGORY_INFO[category].label}
                      </option>
                    ))}
                  </select>
                  
                  {/* Child filter */}
                  {childrenData && childrenData.children.length > 0 && (
                    <select
                      value={childFilter}
                      onChange={(e) => setChildFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value, 10))}
                      className="px-3 py-1.5 rounded-full text-sm bg-white/5 text-gray-300 border-0 focus:ring-2 focus:ring-teal-500"
                      aria-label="Filter by child"
                    >
                      <option value="ALL">All Children</option>
                      {childrenData.children.map((child) => (
                        <option key={child.child_id} value={child.child_id}>
                          {child.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                {/* Results count */}
                <p className="text-gray-500 text-sm">
                  {filteredGoals.length} {filteredGoals.length === 1 ? 'goal' : 'goals'}
                  {hasFilters && ' (filtered)'}
                </p>
                
                {/* Goals list */}
                {showNoResults ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No goals match your filters</p>
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('ALL');
                        setCategoryFilter('ALL');
                        setChildFilter('ALL');
                      }}
                      className="mt-2 text-teal-400 text-sm hover:text-teal-300"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredGoals.map((goal) => (
                      <GoalCard key={goal.goal_id} goal={goal} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <EmptyGoalsState />
            )}
          </>
        )}
      </main>
    </div>
  );
}
