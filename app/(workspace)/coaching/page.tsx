'use client';

/**
 * @deprecated This page is deprecated as part of the Deterministic Workflow Engine migration.
 *
 * DEPRECATION NOTICE (Deterministic Workflow Engine - Requirement 13.5):
 * =====================================================================
 * This Coaching History Page is DEPRECATED. The deterministic workflow engine
 * does not include memory or conversation history displays.
 *
 * The frontend workspace focuses on:
 * - Belt progression (current belt, progress to next)
 * - Next Quality Time (scheduled date, time, child name)
 * - Streak display (current streak, longest streak)
 * - Recent activity feed (last 5 Quality Time completions)
 * - Achievement badges
 * - Schedule Quality Time action button
 *
 * The "Coaching" tab will be repurposed or removed in a future release.
 * Activity logging (Log Quality Time, Log Positive Activity) remains active
 * and should be accessible from the Dashboard or a simplified Coaching tab.
 *
 * @see deterministic-workflow-engine/requirements.md - Requirement 13.5
 * @see design.md - Architecture Philosophy: "AI is NOT the orchestrator"
 *
 * Original purpose:
 * Coaching History Page — Screen C1
 * Displays the father's coaching conversation history from WhatsApp.
 * Shows a list of past conversations with type, date, message count,
 * summary, and status. Conversations happen on WhatsApp - this is a
 * read-only view of the history.
 *
 * Features (DEPRECATED):
 * - Conversation cards with type, date, message count, summary
 * - Status indicators (active, completed, paused)
 * - Related child indicator
 * - Empty state explaining WhatsApp coaching
 * - Loading skeleton
 * - Error handling
 *
 * Requirements: 9.1, 9.2, 9.3, 9.5 (Coaching History) - DEPRECATED
 * @see design.md - Screen C1: Coaching History
 */

import Link from 'next/link';
import { useConversations } from '@/src/hooks/useConversations';
import { SkeletonCard } from '@/src/components/common/SkeletonScreen';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
import type { ConversationOverview, ConversationType, ConversationStatus } from '@/src/types/coaching';

/**
 * Helper function to combine class names, filtering out falsy values.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Conversation type display information.
 */
const CONVERSATION_TYPE_INFO: Record<ConversationType, { label: string; icon: string; color: string }> = {
  COACHING_SESSION: { label: 'Coaching Session', icon: '🧠', color: 'bg-indigo-500/20 text-indigo-400' },
  CHECK_IN: { label: 'Check-in', icon: '👋', color: 'bg-teal-500/20 text-teal-400' },
  MISSION_GUIDANCE: { label: 'Mission Guidance', icon: '🎯', color: 'bg-amber-500/20 text-amber-400' },
  CELEBRATION: { label: 'Celebration', icon: '🎉', color: 'bg-emerald-500/20 text-emerald-400' },
  SUPPORT: { label: 'Support', icon: '💬', color: 'bg-purple-500/20 text-purple-400' },
};


/**
 * Status display information.
 */
const STATUS_INFO: Record<ConversationStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Active', color: 'bg-teal-500/20 text-teal-400' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400' },
  PAUSED: { label: 'Paused', color: 'bg-gray-500/20 text-gray-400' },
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
 * Format relative time for conversation dates.
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateString);
}

/**
 * Loading skeleton for the coaching page.
 */
function CoachingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} className="h-28" />
      ))}
    </div>
  );
}


/**
 * Conversation card component.
 */
function ConversationCard({ conversation }: { conversation: ConversationOverview }) {
  const typeInfo = CONVERSATION_TYPE_INFO[conversation.type];
  const statusInfo = STATUS_INFO[conversation.status];
  
  return (
    <Link
      href={`/coaching/${conversation.conversation_id}`}
      className={classNames(
        'block bg-[#1E293B] rounded-2xl p-4 border border-white/5',
        'hover:bg-[#2D3B4D] transition-colors'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Type icon */}
        <div className={classNames(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          typeInfo.color
        )}>
          <span className="text-lg" aria-hidden="true">
            {typeInfo.icon}
          </span>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Type and status */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-medium">
              {typeInfo.label}
            </span>
            <span className={classNames(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              statusInfo.color
            )}>
              {statusInfo.label}
            </span>
          </div>
          
          {/* Summary */}
          <p className="text-gray-400 text-sm line-clamp-2 mb-2">
            {conversation.summary}
          </p>
          
          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{formatRelativeTime(conversation.started_at)}</span>
            <span>•</span>
            <span>{conversation.message_count} messages</span>
            {conversation.related_child && (
              <>
                <span>•</span>
                <span>About {conversation.related_child.name}</span>
              </>
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
 * Empty state when there are no conversations.
 */
function EmptyCoachingState() {
  const handleOpenWhatsApp = () => {
    window.open('https://wa.me/message/your-coach-number', '_blank');
  };

  return (
    <EmptyState
      imageSrc="/dashboard/dashboard-empty.webp"
      title="Your coaching happens on WhatsApp"
      description="Chat with your coach on WhatsApp to get personalized guidance. Your conversation history will appear here as you continue your journey."
      action={{
        label: "Chat with Coach",
        onClick: handleOpenWhatsApp,
      }}
    />
  );
}

/**
 * Quick action buttons for the coaching page.
 */
function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <Link
        href="/coaching/log"
        className="flex flex-col items-center gap-2 p-4 bg-[#1E293B] rounded-xl border border-white/5 hover:bg-[#2D3B4D] transition-colors"
      >
        <span className="text-2xl" aria-hidden="true">⏰</span>
        <span className="text-white text-sm font-medium">Log Quality Time</span>
      </Link>
      
      <Link
        href="/coaching/log"
        className="flex flex-col items-center gap-2 p-4 bg-[#1E293B] rounded-xl border border-white/5 hover:bg-[#2D3B4D] transition-colors"
      >
        <span className="text-2xl" aria-hidden="true">💜</span>
        <span className="text-white text-sm font-medium">Log Positive Activity</span>
      </Link>
    </div>
  );
}


/**
 * Coaching page component.
 *
 * @deprecated The conversation history section of this page is deprecated.
 * Only the Quick Actions (Log Quality Time, Log Positive Activity) remain active.
 */
export default function CoachingPage() {
  const { 
    data: conversationsData, 
    isLoading, 
    error, 
    refetch 
  } = useConversations();

  const conversations = conversationsData?.conversations ?? [];
  const hasConversations = conversations.length > 0;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0F172A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-white">
            Coaching
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Quick actions - These remain active for logging Quality Time */}
        <QuickActions />

        {/* DEPRECATION NOTICE: Conversation history is deprecated per Deterministic Workflow Engine */}
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-lg">ℹ️</span>
            <div>
              <p className="text-amber-300 text-sm font-medium mb-1">
                Simplified Experience
              </p>
              <p className="text-amber-200/70 text-sm">
                We&apos;re focusing on what matters most: scheduling Quality Time and tracking your progress.
                Use the buttons above to log your activities, or visit the Dashboard for your belt progression and achievements.
              </p>
            </div>
          </div>
        </div>
        {/* Loading state */}
        {isLoading && <CoachingSkeleton />}

        {/* Error state */}
        {error && !isLoading && (
          <ErrorState
            type="error"
            description="We couldn't load your coaching history. Let's try again."
            onRetry={refetch}
          />
        )}

        {/* Success state */}
        {conversationsData && !isLoading && (
          <>
            {hasConversations ? (
              <div className="space-y-4">
                {/* Section header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-medium">
                    Conversation History
                  </h2>
                  <span className="text-gray-500 text-sm">
                    {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
                  </span>
                </div>
                
                {/* Conversations list */}
                {conversations.map((conversation) => (
                  <ConversationCard key={conversation.conversation_id} conversation={conversation} />
                ))}
                
                {/* WhatsApp prompt */}
                <div className="mt-6 p-4 bg-teal-500/10 rounded-xl border border-teal-500/20">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">💬</span>
                    <div>
                      <p className="text-teal-300 text-sm font-medium mb-1">
                        Continue your coaching
                      </p>
                      <p className="text-teal-200/70 text-sm">
                        Chat with your coach on WhatsApp for personalized guidance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyCoachingState />
            )}
          </>
        )}
      </main>
    </div>
  );
}
