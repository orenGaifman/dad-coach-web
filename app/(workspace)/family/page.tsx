'use client';

/**
 * Family Page — Screen F1: Children Overview
 *
 * Displays all children with their key information including name, age,
 * recent mission, and goals count. Shows birthday indicator for children
 * with birthdays within 7 days.
 *
 * Features:
 * - Child cards with name, age, recent mission, goals count
 * - Birthday indicator (🎂) for upcoming birthdays within 7 days
 * - Links to child detail pages
 * - Link to goals page
 * - Empty state for new fathers with no children
 * - Loading skeleton
 * - Error handling
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4 (Children Overview)
 * @see design.md - Screen F1: Children Overview
 */

import Link from 'next/link';
import { useChildren } from '@/src/hooks/useChildren';
import { SkeletonCard } from '@/src/components/common/SkeletonScreen';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
import type { ChildOverview } from '@/src/types/family';
import { classNames } from '@/src/utils/classNames';
import { getWhatsAppDeepLink, WHATSAPP_PHONE_NUMBER } from '@/src/config/whatsapp';

/**
 * Loading skeleton for the family page.
 */
function FamilySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} className="h-32" />
      ))}
    </div>
  );
}

/**
 * Props for the ChildCard component.
 */
interface ChildCardProps {
  child: ChildOverview;
}

/**
 * Individual child card component.
 */
function ChildCard({ child }: ChildCardProps) {
  return (
    <Link
      href={`/family/children/${child.child_id}`}
      className={classNames(
        'block bg-[#1E293B] rounded-2xl p-4 border border-white/5',
        'hover:bg-[#2D3B4D] transition-colors'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Avatar/Initial */}
        <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-teal-400 text-lg font-semibold">
            {(child.name ?? 'C').charAt(0).toUpperCase()}
          </span>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name and birthday indicator */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold truncate">
              {child.name}
            </h3>
            {child.birthday_upcoming && (
              <span 
                className="text-lg" 
                role="img" 
                aria-label="Birthday coming up"
                title="Birthday within 7 days"
              >
                🎂
              </span>
            )}
          </div>
          
          {/* Age */}
          <p className="text-gray-400 text-sm mb-2">
            {child.computed_age}
          </p>
          
          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm">
            {/* Goals count */}
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400" aria-hidden="true">🎯</span>
              <span className="text-gray-400">
                {child.active_goals_count} {child.active_goals_count === 1 ? 'goal' : 'goals'}
              </span>
            </div>
            
            {/* Missions count */}
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400" aria-hidden="true">✓</span>
              <span className="text-gray-400">
                {child.completed_missions_count} {child.completed_missions_count === 1 ? 'mission' : 'missions'}
              </span>
            </div>
          </div>
          
          {/* Recent mission */}
          {child.recent_mission && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-gray-500 text-xs mb-1">Recent Mission</p>
              <p className="text-gray-300 text-sm truncate">
                {child.recent_mission.title}
              </p>
            </div>
          )}
          
          {/* Interests preview */}
          {(child.interests?.length ?? 0) > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(child.interests ?? []).slice(0, 3).map((interest) => (
                <span
                  key={interest}
                  className="px-2 py-0.5 bg-white/5 rounded-full text-xs text-gray-400"
                >
                  {interest}
                </span>
              ))}
              {(child.interests?.length ?? 0) > 3 && (
                <span className="px-2 py-0.5 text-xs text-gray-500">
                  +{(child.interests?.length ?? 0) - 3} more
                </span>
              )}
            </div>
          )}
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
 * Empty state when father has no children.
 */
function EmptyChildrenState() {
  const handleChatWithCoach = () => {
    window.open(getWhatsAppDeepLink(WHATSAPP_PHONE_NUMBER), '_blank');
  };

  return (
    <EmptyState
      imageSrc="/dashboard/dashboard-empty.webp"
      title="Add your first child"
      description="Your kids' profiles are set up during your coaching onboarding. Chat with your coach on WhatsApp to get started!"
      action={{
        label: "Chat with Coach",
        onClick: handleChatWithCoach,
      }}
    />
  );
}

/**
 * Family page component.
 */
export default function FamilyPage() {
  const { 
    data: childrenData, 
    isLoading, 
    error, 
    refetch 
  } = useChildren();

  const children = childrenData?.children ?? [];
  const hasChildren = children.length > 0;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0F172A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">
              My Family
            </h1>
            
            {/* Quick link to goals */}
            {hasChildren && (
              <Link
                href="/family/goals"
                className="text-teal-400 text-sm font-medium hover:text-teal-300 transition-colors"
              >
                View Goals →
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Loading state */}
        {isLoading && <FamilySkeleton />}

        {/* Error state */}
        {error && !isLoading && (
          <ErrorState
            type="error"
            description="We couldn't load your family data. Let's try again."
            onRetry={refetch}
          />
        )}

        {/* Success state */}
        {childrenData && !isLoading && (
          <>
            {hasChildren ? (
              <div className="space-y-4">
                {/* Children count */}
                <p className="text-gray-500 text-sm">
                  {children.length} {children.length === 1 ? 'child' : 'children'}
                </p>
                
                {/* Children list */}
                {children.map((child) => (
                  <ChildCard key={child.child_id} child={child} />
                ))}
                
                {/* Quick actions */}
                <div className="pt-4 space-y-3">
                  <Link
                    href="/family/goals"
                    className="flex items-center justify-between p-4 bg-[#1E293B] rounded-xl border border-white/5 hover:bg-[#2D3B4D] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden="true">🎯</span>
                      <span className="text-white font-medium">Family Goals</span>
                    </div>
                    <svg 
                      className="w-5 h-5 text-gray-500" 
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
                  </Link>
                  
                  <Link
                    href="/profile/children"
                    className="flex items-center justify-between p-4 bg-[#1E293B] rounded-xl border border-white/5 hover:bg-[#2D3B4D] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden="true">⚙️</span>
                      <span className="text-white font-medium">Manage Children</span>
                    </div>
                    <svg 
                      className="w-5 h-5 text-gray-500" 
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
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyChildrenState />
            )}
          </>
        )}
      </main>
    </div>
  );
}
