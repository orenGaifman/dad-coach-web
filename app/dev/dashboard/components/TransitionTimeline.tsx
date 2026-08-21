'use client';

/**
 * TransitionTimeline — displays workflow state transitions as a timeline view.
 *
 * Features:
 * - Display transitions as timeline view
 * - Show from_state → to_state with arrow indicator
 * - Display trigger_reason for each transition
 * - Make trigger_message_id clickable reference when present
 * - Display created_at in Israel timezone
 * - Manual refresh button
 * - Display last refresh timestamp
 * - Auto-refresh polling every 3 seconds when enabled
 * - Full transition list refresh on each poll
 *
 * @see Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 11.3
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTransitions } from '@/src/api/dev';
import { formatIsraelDateTime } from '@/src/utils/timezone';
import type { DevTransition, DevTransitionsResponse } from '@/src/types/dev';

/** Polling interval in milliseconds (3 seconds per requirement 9.5) */
const POLLING_INTERVAL_MS = 3000;

interface TransitionTimelineProps {
  /** Father ID to display transitions for */
  fatherId: number;
  /** Optional callback when a message ID is clicked */
  onMessageClick?: (messageId: string) => void;
  /** Whether auto-refresh polling is enabled (default: true) */
  autoRefreshEnabled?: boolean;
}

/** Color mapping for trigger reasons */
const TRIGGER_REASON_COLORS: Record<string, string> = {
  USER_MESSAGE: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  SCHEDULER: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  SYSTEM: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  CALENDAR_EVENT_CREATED: 'bg-green-500/20 text-green-300 border-green-500/30',
  QUALITY_TIME_COMPLETED: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  BELT_PROMOTION: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  TIMEOUT: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
};

/** Color mapping for workflow states */
const WORKFLOW_STATE_COLORS: Record<string, string> = {
  WELCOME: 'text-blue-300',
  WAITING: 'text-gray-300',
  SCHEDULE_QUALITY_TIME: 'text-purple-300',
  QUALITY_TIME_FOLLOW_UP: 'text-green-300',
  QUALITY_TIME_PREPARATION: 'text-cyan-300',
  QUALITY_TIME_IN_PROGRESS: 'text-teal-300',
  BELT_PROMOTION: 'text-yellow-300',
};

/**
 * Renders a trigger reason badge with appropriate colors.
 */
function TriggerReasonBadge({ reason }: { reason: string }) {
  const colorClass = TRIGGER_REASON_COLORS[reason] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colorClass}`}>
      {reason.replace(/_/g, ' ')}
    </span>
  );
}

/**
 * Renders a workflow state with appropriate color.
 */
function WorkflowState({ state }: { state: string }) {
  const colorClass = WORKFLOW_STATE_COLORS[state] || 'text-gray-300';

  return (
    <span className={`font-medium ${colorClass}`}>
      {state.replace(/_/g, ' ')}
    </span>
  );
}

/**
 * Renders a clickable message ID reference.
 */
function MessageIdLink({
  messageId,
  onClick,
}: {
  messageId: string;
  onClick?: (messageId: string) => void;
}) {
  const handleClick = () => {
    if (onClick) {
      onClick(messageId);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-mono transition-colors"
      title={`View message ${messageId}`}
    >
      📨 {messageId.slice(0, 8)}...
    </button>
  );
}

/**
 * Renders a single transition item in the timeline.
 */
function TransitionItem({
  transition,
  onMessageClick,
  isLast,
}: {
  transition: DevTransition;
  onMessageClick?: (messageId: string) => void;
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-3">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        {/* Dot */}
        <div className="w-3 h-3 rounded-full bg-white/20 border-2 border-white/40 z-10" />
        {/* Vertical line */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-white/10 min-h-[40px]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        {/* State transition with arrow */}
        <div className="flex items-center gap-2 flex-wrap text-sm mb-1">
          <WorkflowState state={transition.from_state} />
          <span className="text-gray-500">→</span>
          <WorkflowState state={transition.to_state} />
        </div>

        {/* Trigger reason and message ID */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <TriggerReasonBadge reason={transition.trigger_reason} />
          {transition.trigger_message_id && (
            <MessageIdLink
              messageId={transition.trigger_message_id}
              onClick={onMessageClick}
            />
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-500">
          {formatIsraelDateTime(transition.created_at)}
        </div>
      </div>
    </div>
  );
}

/**
 * Renders a loading state for the panel.
 */
function LoadingState() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>🔄</span> State Transitions
        </h3>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-3 h-3 rounded-full bg-white/10 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse" />
              <div className="h-3 bg-white/5 rounded w-1/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Renders an error state for the panel.
 */
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>🔄</span> State Transitions
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
 * Renders an empty state when no transitions exist.
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="text-4xl mb-3">🔄</div>
      <p className="text-gray-400 text-sm">No state transitions yet</p>
    </div>
  );
}

/**
 * Manual refresh button component.
 */
function RefreshButton({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Refresh transitions"
    >
      <svg
        className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
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
 * Displays when the data was last refreshed.
 */
function LastRefreshIndicator({ timestamp }: { timestamp: Date | null }) {
  if (!timestamp) return null;

  return (
    <span className="text-xs text-gray-500">
      Last updated: {formatIsraelDateTime(timestamp.toISOString())}
    </span>
  );
}

/**
 * TransitionTimeline component — displays workflow state transitions.
 *
 * Implements polling logic with 3-second interval for real-time updates.
 * Refreshes full transition list on each poll.
 * Respects auto-refresh toggle state.
 * Allows in-flight requests to complete when disabled.
 *
 * @see Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 11.3
 */
export function TransitionTimeline({
  fatherId,
  onMessageClick,
  autoRefreshEnabled = true,
}: TransitionTimelineProps) {
  const [transitions, setTransitions] = useState<DevTransition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Track in-flight request to allow completion when disabled
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load data when fatherId changes
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const data: DevTransitionsResponse = await fetchTransitions(
          fatherId,
          100,
          controller.signal
        );
        if (isMounted) {
          // Transitions come ordered by created_at descending (newest first)
          // Keep this order for timeline display (newest at top)
          setTransitions(data.transitions);
          setLastRefreshed(new Date());
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Request was cancelled
        }
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to load transitions'
          );
          setTransitions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fatherId]);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsRefreshing(true);
    setError(null);

    try {
      const data: DevTransitionsResponse = await fetchTransitions(fatherId, 100, controller.signal);
      setTransitions(data.transitions);
      setLastRefreshed(new Date());
    } catch (err) {
      // Ignore abort errors (expected when component unmounts or polling stops)
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(
        err instanceof Error ? err.message : 'Failed to load transitions'
      );
    } finally {
      setIsRefreshing(false);
      abortControllerRef.current = null;
    }
  }, [fatherId]);

  /**
   * Poll for transitions by refreshing the full list.
   * Unlike messages, transitions use full refresh on each poll.
   *
   * @see Requirements 9.5
   */
  const pollForTransitions = useCallback(async () => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data: DevTransitionsResponse = await fetchTransitions(
        fatherId,
        100,
        controller.signal
      );

      setTransitions(data.transitions);
      setLastRefreshed(new Date());
    } catch (err) {
      // Ignore abort errors (expected when component unmounts or polling stops)
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      // Log but don't set error state for polling failures
      // This prevents UI disruption during temporary network issues
      console.warn('Polling for transitions failed:', err);
    } finally {
      abortControllerRef.current = null;
    }
  }, [fatherId]);

  // Handle retry after error
  const handleRetry = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data: DevTransitionsResponse = await fetchTransitions(fatherId, 100);
      setTransitions(data.transitions);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load transitions'
      );
      setTransitions([]);
    } finally {
      setIsLoading(false);
    }
  }, [fatherId]);

  // Set up polling interval when auto-refresh is enabled
  // @see Requirements 9.5, 11.3
  useEffect(() => {
    if (autoRefreshEnabled && !isLoading) {
      // Start polling
      pollingIntervalRef.current = setInterval(pollForTransitions, POLLING_INTERVAL_MS);
    }

    return () => {
      // Clean up interval when disabled or unmounting
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      // Note: We don't abort in-flight requests here per requirement 11.3
      // "allow in-flight requests to complete when disabled"
    };
  }, [autoRefreshEnabled, isLoading, pollForTransitions]);

  // Render loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Render error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[300px] flex flex-col">
      {/* Header with refresh controls */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>🔄</span> State Transitions
          <span className="text-xs text-gray-500 font-normal">
            ({transitions.length} transitions)
          </span>
          {autoRefreshEnabled && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full animate-pulse">
              Live
            </span>
          )}
        </h3>
        <div className="flex items-center gap-3">
          <LastRefreshIndicator timestamp={lastRefreshed} />
          <RefreshButton onClick={handleRefresh} isLoading={isRefreshing} />
        </div>
      </div>

      {/* Timeline container */}
      <div className="flex-1 overflow-y-auto max-h-[400px] pr-1">
        {transitions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-0">
            {transitions.map((transition, index) => (
              <TransitionItem
                key={transition.id}
                transition={transition}
                onMessageClick={onMessageClick}
                isLast={index === transitions.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TransitionTimeline;
