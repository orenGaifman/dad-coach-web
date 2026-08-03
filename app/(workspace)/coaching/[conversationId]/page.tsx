'use client';

/**
 * @deprecated This page is deprecated as part of the Deterministic Workflow Engine migration.
 *
 * DEPRECATION NOTICE (Deterministic Workflow Engine - Requirement 13.5):
 * =====================================================================
 * This Conversation Detail Page is DEPRECATED. The deterministic workflow engine
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
 * This page will be removed in a future release. Users should be directed
 * to the Dashboard instead.
 *
 * @see deterministic-workflow-engine/requirements.md - Requirement 13.5
 * @see design.md - Architecture Philosophy: "AI is NOT the orchestrator"
 *
 * Original purpose:
 * Conversation Detail Page — Screen C2
 * Displays detailed summary of a coaching conversation. Shows extended
 * summary, key topics discussed, and insights from the conversation.
 *
 * IMPORTANT: This is a SUMMARY VIEW ONLY. No full message transcript
 * is shown per Requirement 9.2 to protect conversation privacy.
 *
 * Features (DEPRECATED):
 * - Extended conversation summary
 * - Key topics discussed
 * - Insights (strengths, suggestions, observations)
 * - Related child and mission info
 * - Back navigation to coaching history
 * - Loading skeleton
 * - Error handling
 *
 * Requirements: 9.4 (Conversation Detail - summary only) - DEPRECATED
 * @see design.md - Screen C2: Conversation Detail
 */

import { use } from 'react';
import Link from 'next/link';
import { useConversationDetail } from '@/src/hooks/useConversationDetail';
import { SkeletonCard, SkeletonText } from '@/src/components/common/SkeletonScreen';
import { ErrorState } from '@/src/components/common/ErrorState';
import type { 
  ConversationType, 
  ConversationStatus,
  ConversationInsight,
  ConversationTopic 
} from '@/src/types/coaching';

/**
 * Helper function to combine class names.
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
 * Insight type display information.
 */
const INSIGHT_TYPE_INFO: Record<ConversationInsight['type'], { icon: string; color: string }> = {
  STRENGTH: { icon: '💪', color: 'bg-emerald-500/20 border-emerald-500/30' },
  SUGGESTION: { icon: '💡', color: 'bg-amber-500/20 border-amber-500/30' },
  OBSERVATION: { icon: '👁️', color: 'bg-indigo-500/20 border-indigo-500/30' },
};

/**
 * Format date and time for display.
 */
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format duration between two dates.
 */
function formatDuration(startedAt: string, endedAt: string | null): string {
  if (!endedAt) return 'Ongoing';
  
  const start = new Date(startedAt);
  const end = new Date(endedAt);
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  
  if (diffMins < 60) return `${diffMins} minutes`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
}

/**
 * Loading skeleton for the conversation detail page.
 */
function ConversationDetailSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonCard className="h-32" />
      <SkeletonCard className="h-48" />
      <div className="space-y-3">
        <SkeletonText className="h-6 w-24" />
        <SkeletonCard className="h-20" />
        <SkeletonCard className="h-20" />
      </div>
    </div>
  );
}


/**
 * Topic chip component.
 */
function TopicChip({ topic }: { topic: ConversationTopic }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full text-sm">
      <span className="text-white">{topic.topic}</span>
      {topic.child_name && (
        <span className="text-gray-500">({topic.child_name})</span>
      )}
    </div>
  );
}

/**
 * Insight card component.
 */
function InsightCard({ insight }: { insight: ConversationInsight }) {
  const typeInfo = INSIGHT_TYPE_INFO[insight.type];
  
  return (
    <div className={classNames(
      'p-4 rounded-xl border',
      typeInfo.color
    )}>
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0" aria-hidden="true">
          {typeInfo.icon}
        </span>
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
            {insight.type.charAt(0) + insight.type.slice(1).toLowerCase()}
          </p>
          <p className="text-white text-sm">
            {insight.text}
          </p>
        </div>
      </div>
    </div>
  );
}


/**
 * Conversation detail page component.
 */
export default function ConversationDetailPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const resolvedParams = use(params);
  const conversationId = resolvedParams.conversationId;
  
  const { data, isLoading, error, refetch } = useConversationDetail(conversationId);

  const conversation = data?.conversation;
  const typeInfo = conversation ? CONVERSATION_TYPE_INFO[conversation.type] : null;
  const statusInfo = conversation ? STATUS_INFO[conversation.status] : null;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0F172A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/coaching"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Back to Coaching"
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
              Conversation Details
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Loading state */}
        {isLoading && <ConversationDetailSkeleton />}

        {/* Error state */}
        {error && !isLoading && (
          <ErrorState
            type="error"
            description="We couldn't load this conversation. Let's try again."
            onRetry={refetch}
          />
        )}

        {/* Success state */}
        {conversation && !isLoading && typeInfo && statusInfo && (
          <div className="space-y-6">
            {/* Header card */}
            <section className="bg-[#1E293B] rounded-2xl p-5 border border-white/5">
              {/* Type and status badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={classNames(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
                  typeInfo.color
                )}>
                  <span aria-hidden="true">{typeInfo.icon}</span>
                  {typeInfo.label}
                </span>
                <span className={classNames(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  statusInfo.color
                )}>
                  {statusInfo.label}
                </span>
              </div>
              
              {/* Meta info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Started</span>
                  <span className="text-gray-300">{formatDateTime(conversation.started_at)}</span>
                </div>
                {conversation.ended_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="text-gray-300">
                      {formatDuration(conversation.started_at, conversation.ended_at)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Messages</span>
                  <span className="text-gray-300">{conversation.message_count}</span>
                </div>
              </div>
              
              {/* Related info */}
              {(conversation.related_child || conversation.related_mission) && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                  {conversation.related_child && (
                    <Link
                      href={`/family/children/${conversation.related_child.child_id}`}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors"
                    >
                      <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs">
                        👶
                      </span>
                      About {conversation.related_child.name}
                    </Link>
                  )}
                  {conversation.related_mission && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs">
                        🎯
                      </span>
                      Mission: {conversation.related_mission.title}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Summary */}
            <section className="bg-[#1E293B] rounded-2xl p-5 border border-white/5">
              <h2 className="text-white font-medium mb-3">Summary</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                {conversation.summary}
              </p>
            </section>

            {/* Key topics */}
            {conversation.key_topics.length > 0 && (
              <section>
                <h2 className="text-white font-medium mb-3">Topics Discussed</h2>
                <div className="flex flex-wrap gap-2">
                  {conversation.key_topics.map((topic, index) => (
                    <TopicChip key={index} topic={topic} />
                  ))}
                </div>
              </section>
            )}

            {/* Insights */}
            {conversation.insights.length > 0 && (
              <section>
                <h2 className="text-white font-medium mb-3">Key Insights</h2>
                <div className="space-y-3">
                  {conversation.insights.map((insight, index) => (
                    <InsightCard key={index} insight={insight} />
                  ))}
                </div>
              </section>
            )}

            {/* Privacy note */}
            <section className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-start gap-3">
                <span className="text-lg">🔒</span>
                <div>
                  <p className="text-gray-400 text-sm">
                    For your privacy, full conversation transcripts are not stored. 
                    This summary captures the key moments from your coaching session.
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
