'use client';

/**
 * UnifiedConversationTimeline — displays messages and state transitions in a single chronological view.
 *
 * Features:
 * - Merges messages and state transitions into a unified timeline
 * - Shows state change markers between messages
 * - Highlights AI agent invocations (trigger_reason starting with "AI_AGENT_")
 * - Highlights scheduler-triggered actions (QUALITY_TIME_ENDED, FOLLOW_UP_TIMEOUT, SCHEDULER_REMINDER, COMMITMENT_REMINDER)
 * - Displays in chronological order (oldest at top, newest at bottom)
 * - Auto-refresh polling when enabled
 *
 * Visual format:
 * [STATE: WELCOME]
 * 👤 User: message
 * 🤖 Bot: response
 * [STATE: SCHEDULE_QUALITY_TIME] [🧠 AI: set_weekly_goal]
 * 👤 User: message
 * [🧠 AI invoked for understanding]
 * 🤖 Bot: response
 * [STATE: QUALITY_TIME_FOLLOW_UP] [⏰ SCHEDULER: QT ended]
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchMessages, fetchTransitions } from '@/src/api/dev';
import { formatIsraelTime, formatIsraelDateTime } from '@/src/utils/timezone';
import type { DevMessage, DevTransition } from '@/src/types/dev';

/** Polling interval in milliseconds */
const POLLING_INTERVAL_MS = 2000;

interface UnifiedConversationTimelineProps {
  /** Father ID to display timeline for */
  fatherId: number;
  /** Whether auto-refresh polling is enabled (default: true) */
  autoRefreshEnabled?: boolean;
}

/** Unified timeline item type */
type TimelineItemType = 'message' | 'transition';

interface TimelineItem {
  type: TimelineItemType;
  timestamp: string;
  data: DevMessage | DevTransition;
}

/** Color mapping for workflow states */
const WORKFLOW_STATE_COLORS: Record<string, string> = {
  WELCOME: 'bg-blue-500/30 text-blue-300 border-blue-500/50',
  WAITING: 'bg-gray-500/30 text-gray-300 border-gray-500/50',
  SCHEDULE_QUALITY_TIME: 'bg-purple-500/30 text-purple-300 border-purple-500/50',
  QUALITY_TIME_FOLLOW_UP: 'bg-green-500/30 text-green-300 border-green-500/50',
  QUALITY_TIME_PREPARATION: 'bg-cyan-500/30 text-cyan-300 border-cyan-500/50',
  QUALITY_TIME_IN_PROGRESS: 'bg-teal-500/30 text-teal-300 border-teal-500/50',
  BELT_PROMOTION: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50',
};

/**
 * Check if a trigger reason indicates AI agent invocation
 */
function isAiInvocation(triggerReason: string): boolean {
  return triggerReason?.startsWith('AI_AGENT_') || false;
}

/**
 * Check if a trigger reason indicates a scheduler-initiated action
 */
function isSchedulerTrigger(triggerReason: string): boolean {
  const schedulerTriggers = [
    'QUALITY_TIME_ENDED',
    'FOLLOW_UP_TIMEOUT', 
    'SCHEDULER_REMINDER',
    'COMMITMENT_REMINDER',
  ];
  return schedulerTriggers.includes(triggerReason) || false;
}

/**
 * Get scheduler label for display
 */
function getSchedulerLabel(triggerReason: string): { emoji: string; label: string } {
  switch (triggerReason) {
    case 'QUALITY_TIME_ENDED':
      return { emoji: '⏰', label: 'QT ended' };
    case 'FOLLOW_UP_TIMEOUT':
      return { emoji: '⏰', label: 'follow-up timeout' };
    case 'SCHEDULER_REMINDER':
      return { emoji: '⏰', label: 'morning reminder' };
    case 'COMMITMENT_REMINDER':
      return { emoji: '⏰', label: 'commitment reminder' };
    default:
      return { emoji: '⏰', label: triggerReason.replace(/_/g, ' ').toLowerCase() };
  }
}

/**
 * Extract AI tool name from trigger reason
 */
function getAiToolName(triggerReason: string): string {
  if (triggerReason?.startsWith('AI_AGENT_')) {
    return triggerReason.replace('AI_AGENT_', '').replace(/_/g, ' ');
  }
  return triggerReason?.replace(/_/g, ' ') || '';
}

/**
 * Renders a state transition marker
 */
function StateTransitionMarker({ transition }: { transition: DevTransition }) {
  const toStateColor = WORKFLOW_STATE_COLORS[transition.to_state] || 'bg-gray-500/30 text-gray-300 border-gray-500/50';
  const isAi = isAiInvocation(transition.trigger_reason);
  const isScheduler = isSchedulerTrigger(transition.trigger_reason);
  const schedulerLabel = isScheduler ? getSchedulerLabel(transition.trigger_reason) : null;
  
  return (
    <div className="flex items-center justify-center py-3 my-2">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* State badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${toStateColor}`}>
          📍 {transition.to_state.replace(/_/g, ' ')}
        </span>
        
        {/* Scheduler trigger indicator */}
        {isScheduler && schedulerLabel && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/30 text-orange-300 border border-orange-500/50">
            {schedulerLabel.emoji} SCHEDULER: {schedulerLabel.label}
          </span>
        )}
        
        {/* AI invocation indicator */}
        {isAi && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/30 text-amber-300 border border-amber-500/50">
            🧠 AI: {getAiToolName(transition.trigger_reason)}
          </span>
        )}
        
        {/* Non-AI, non-scheduler trigger reason (e.g., USER_MESSAGE) */}
        {!isAi && !isScheduler && transition.trigger_reason && (
          <span className="px-2 py-0.5 rounded text-xs text-gray-500">
            ({transition.trigger_reason.replace(/_/g, ' ')})
          </span>
        )}
        
        {/* Timestamp */}
        <span className="text-xs text-gray-600">
          {formatIsraelTime(transition.created_at)}
        </span>
      </div>
    </div>
  );
}

/**
 * Renders AI decision metadata for outbound messages
 */
function AiDecisionInfo({ message }: { message: DevMessage }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Only show for outbound messages with AI decision data
  if (message.direction !== 'OUTBOUND' || !message.tool_used) {
    return null;
  }

  const hasStateChange = message.new_state && message.new_state !== message.previous_state;
  const hasParams = message.tool_parameters && Object.keys(message.tool_parameters).length > 0;
  const hasError = !message.tool_success && message.error_message;

  return (
    <div className="mt-2 pt-2 border-t border-white/10">
      {/* Compact AI info header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left group"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tool badge */}
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            🧠 {message.tool_used.replace(/_/g, ' ')}
          </span>
          
          {/* Success/failure indicator */}
          {message.tool_success === false ? (
            <span className="px-1.5 py-0.5 rounded text-xs bg-red-500/20 text-red-300 border border-red-500/30">
              ❌ Failed
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-xs bg-green-500/20 text-green-300 border border-green-500/30">
              ✓
            </span>
          )}
          
          {/* State transition indicator */}
          {hasStateChange && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className={`px-1.5 py-0.5 rounded ${WORKFLOW_STATE_COLORS[message.previous_state || ''] || 'bg-gray-500/20 text-gray-300'}`}>
                {(message.previous_state || '').replace(/_/g, ' ')}
              </span>
              <span>→</span>
              <span className={`px-1.5 py-0.5 rounded ${WORKFLOW_STATE_COLORS[message.new_state || ''] || 'bg-gray-500/20 text-gray-300'}`}>
                {(message.new_state || '').replace(/_/g, ' ')}
              </span>
            </span>
          )}
        </div>
        
        {/* Expand/collapse indicator */}
        {(hasParams || hasError) && (
          <span className={`text-xs text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        )}
      </button>

      {/* Expanded details */}
      {isExpanded && (hasParams || hasError) && (
        <div className="mt-2 space-y-2">
          {/* Parameters */}
          {hasParams && (
            <div className="bg-black/20 rounded p-2">
              <div className="text-xs text-gray-500 mb-1">Parameters:</div>
              <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(message.tool_parameters, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Error message */}
          {hasError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
              <div className="text-xs text-red-400">
                ⚠️ Error: {message.error_message}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Renders a message bubble
 */
function MessageBubble({ message }: { message: DevMessage }) {
  const isInbound = message.direction === 'INBOUND';
  const hasAiInfo = !isInbound && message.tool_used;

  return (
    <div className={`flex ${isInbound ? 'justify-start' : 'justify-end'} my-1`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 ${
          isInbound
            ? 'bg-gray-600/50 text-white rounded-bl-sm'
            : 'bg-blue-600/50 text-white rounded-br-sm'
        }`}
      >
        {/* Sender label */}
        <div className={`text-xs font-medium mb-1 flex items-center gap-2 ${isInbound ? 'text-gray-400' : 'text-blue-300/70'}`}>
          {isInbound ? '👤 User' : '🤖 Bot'}
          {hasAiInfo && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
              AI
            </span>
          )}
        </div>
        
        {/* Message Content */}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

        {/* Timestamp */}
        <div className={`text-right text-xs mt-1 ${isInbound ? 'text-gray-500' : 'text-blue-400/60'}`}>
          {formatIsraelTime(message.created_at)}
        </div>
        
        {/* AI Decision Info (for outbound messages) */}
        <AiDecisionInfo message={message} />
      </div>
    </div>
  );
}

/**
 * Renders a loading state
 */
function LoadingState() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>📋</span> Conversation Timeline
        </h3>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-16 bg-white/5 rounded-lg animate-pulse ${
              i % 2 === 0 ? 'ml-auto w-2/3' : 'mr-auto w-2/3'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Renders an error state
 */
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>📋</span> Conversation Timeline
        </h3>
      </div>
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p className="text-red-300 text-sm flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </p>
        <button
          onClick={onRetry}
          className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

/**
 * Renders an empty state
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="text-4xl mb-3">💬</div>
      <p className="text-gray-400 text-sm">No conversation yet</p>
    </div>
  );
}

/**
 * Manual refresh button
 */
function RefreshButton({ onClick, isLoading }: { onClick: () => void; isLoading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
      aria-label="Refresh timeline"
    >
      <svg
        className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      <span>Refresh</span>
    </button>
  );
}

/**
 * UnifiedConversationTimeline — merges messages and transitions into one chronological view
 */
export function UnifiedConversationTimeline({ fatherId, autoRefreshEnabled = true }: UnifiedConversationTimelineProps) {
  const [messages, setMessages] = useState<DevMessage[]>([]);
  const [transitions, setTransitions] = useState<DevTransition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Merge and sort messages and transitions into a unified timeline
  const timelineItems = useMemo((): TimelineItem[] => {
    const items: TimelineItem[] = [];
    
    // Add messages
    messages.forEach(msg => {
      items.push({
        type: 'message',
        timestamp: msg.created_at,
        data: msg,
      });
    });
    
    // Add transitions
    transitions.forEach(trans => {
      items.push({
        type: 'transition',
        timestamp: trans.created_at,
        data: trans,
      });
    });
    
    // Sort by timestamp (oldest first for chronological display)
    items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    return items;
  }, [messages, transitions]);

  // Load data
  const loadData = useCallback(async (signal?: AbortSignal) => {
    try {
      const [messagesData, transitionsData] = await Promise.all([
        fetchMessages(fatherId, 100, undefined, signal),
        fetchTransitions(fatherId, 100, signal),
      ]);
      
      setMessages(messagesData || []);
      setTransitions(transitionsData || []);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      throw err;
    }
  }, [fatherId]);

  // Initial load
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function init() {
      setIsLoading(true);
      setError(null);
      
      try {
        await loadData(controller.signal);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load timeline');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [loadData]);

  // Polling
  useEffect(() => {
    if (autoRefreshEnabled && !isLoading) {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          await loadData();
        } catch (err) {
          console.warn('Polling failed:', err);
        }
      }, POLLING_INTERVAL_MS);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [autoRefreshEnabled, isLoading, loadData]);

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  }, [loadData]);

  // Retry after error
  const handleRetry = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline');
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [timelineItems.length]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  const messageCount = messages.length;
  const transitionCount = transitions.length;
  const aiInvocationCount = transitions.filter(t => isAiInvocation(t.trigger_reason)).length;
  const schedulerCount = transitions.filter(t => isSchedulerTrigger(t.trigger_reason)).length;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[400px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>📋</span> Conversation Timeline
          <span className="text-xs text-gray-500 font-normal">
            ({messageCount} msgs, {transitionCount} transitions, {aiInvocationCount} AI, {schedulerCount} scheduled)
          </span>
          {autoRefreshEnabled && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full animate-pulse">
              Live
            </span>
          )}
        </h3>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs text-gray-500">
              Updated: {formatIsraelDateTime(lastRefreshed.toISOString())}
            </span>
          )}
          <RefreshButton onClick={handleRefresh} isLoading={isRefreshing} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs">
        <span className="px-2 py-1 rounded bg-gray-600/50 text-gray-300">👤 User message</span>
        <span className="px-2 py-1 rounded bg-blue-600/50 text-blue-300">🤖 Bot message</span>
        <span className="px-2 py-1 rounded bg-purple-500/30 text-purple-300 border border-purple-500/50">📍 State change</span>
        <span className="px-2 py-1 rounded bg-amber-500/30 text-amber-300 border border-amber-500/50">🧠 AI decision</span>
        <span className="px-2 py-1 rounded bg-orange-500/30 text-orange-300 border border-orange-500/50">⏰ Scheduler</span>
        <span className="text-gray-500 italic">(Click AI messages to see tool details)</span>
      </div>

      {/* Timeline container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto max-h-[500px] pr-1"
      >
        {timelineItems.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-1">
            {timelineItems.map((item) => {
              if (item.type === 'transition') {
                return (
                  <StateTransitionMarker 
                    key={`trans-${(item.data as DevTransition).id}`} 
                    transition={item.data as DevTransition} 
                  />
                );
              } else {
                return (
                  <MessageBubble 
                    key={`msg-${(item.data as DevMessage).id}`} 
                    message={item.data as DevMessage} 
                  />
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default UnifiedConversationTimeline;
