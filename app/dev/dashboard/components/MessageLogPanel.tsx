'use client';

/**
 * MessageLogPanel — displays the conversation messages in a chat-style view.
 *
 * Features:
 * - Display messages in chat-style conversation view
 * - Visually distinguish INBOUND (from father) and OUTBOUND (from bot) messages
 * - Display created_at timestamp in Israel timezone HH:mm:ss format
 * - Manual refresh button
 * - Display last refresh timestamp
 * - Auto-refresh polling every 2 seconds when enabled
 * - Incremental fetching using `since` timestamp
 * - New messages prepended without full refresh
 *
 * INBOUND messages appear on the left (from father)
 * OUTBOUND messages appear on the right (from bot)
 *
 * @see Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 11.3
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMessages } from '@/src/api/dev';
import { formatIsraelTime, formatIsraelDateTime } from '@/src/utils/timezone';
import type { DevMessage, DevMessagesResponse } from '@/src/types/dev';

/** Polling interval in milliseconds */
const POLLING_INTERVAL_MS = 2000;

interface MessageLogPanelProps {
  /** Father ID to display messages for */
  fatherId: number;
  /** Whether auto-refresh polling is enabled (default: true) */
  autoRefreshEnabled?: boolean;
}

/**
 * Renders a single message bubble with appropriate styling.
 * INBOUND messages (from father) are aligned left with a different color.
 * OUTBOUND messages (from bot) are aligned right.
 */
function MessageBubble({ message }: { message: DevMessage }) {
  const isInbound = message.direction === 'INBOUND';

  return (
    <div
      className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isInbound
            ? 'bg-gray-600/50 text-white rounded-bl-sm'
            : 'bg-blue-600/50 text-white rounded-br-sm'
        }`}
      >
        {/* Message Content */}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

        {/* Timestamp and Direction Label */}
        <div
          className={`flex items-center gap-2 mt-1 text-xs ${
            isInbound ? 'text-gray-400' : 'text-blue-300/70'
          }`}
        >
          <span className="font-medium">
            {isInbound ? '👤 Father' : '🤖 Bot'}
          </span>
          <span>•</span>
          <span>{formatIsraelTime(message.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Renders a loading state for the message panel.
 */
function LoadingState() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>💬</span> Message Log
        </h3>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-12 bg-white/5 rounded-lg animate-pulse ${
              i % 2 === 0 ? 'ml-auto w-2/3' : 'mr-auto w-2/3'
            }`}
          />
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
          <span>💬</span> Message Log
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
 * Renders an empty state when no messages exist.
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="text-4xl mb-3">💭</div>
      <p className="text-gray-400 text-sm">No messages yet</p>
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
      aria-label="Refresh messages"
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
 * MessageLogPanel component — displays the conversation messages.
 *
 * Implements polling logic with 2-second interval for real-time updates.
 * Tracks `since` timestamp for incremental fetching.
 * New messages are prepended to the list without full refresh.
 * Respects auto-refresh toggle state.
 * Allows in-flight requests to complete when disabled.
 *
 * @see Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 11.3
 */
export function MessageLogPanel({ fatherId, autoRefreshEnabled = true }: MessageLogPanelProps) {
  const [messages, setMessages] = useState<DevMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Track the most recent message's created_at for incremental fetching
  // Use a ref so the polling interval callback has access to the latest value
  const sinceTimestampRef = useRef<string | null>(null);

  // Track in-flight request to allow completion when disabled
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Get the latest message timestamp from messages array.
   * Messages in the array are in chronological order (oldest first),
   * so the last message has the most recent timestamp.
   */
  const getLatestTimestamp = useCallback((msgs: DevMessage[]): string | null => {
    if (msgs.length === 0) return null;
    // Messages are displayed oldest first (chronological), so last message is newest
    return msgs[msgs.length - 1].created_at;
  }, []);

  /**
   * Fetch new messages since the last known timestamp.
   * Only fetches incremental updates, not the full message list.
   * Prepends new messages to the existing list.
   *
   * @see Requirements 8.4, 8.5
   */
  const pollForNewMessages = useCallback(async () => {
    // Don't poll if there's no since timestamp yet (initial load not complete)
    if (!sinceTimestampRef.current) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data: DevMessagesResponse = await fetchMessages(
        fatherId,
        50, // Limit for incremental fetch
        sinceTimestampRef.current,
        controller.signal
      );

      // Only update if we got new messages
      const messages = data.messages || [];
      if (messages.length > 0) {
        // API returns messages in descending order (newest first)
        // Reverse to get chronological order, then append to existing messages
        const newMessages = [...messages].reverse();

        setMessages((prev) => {
          // Filter out any duplicates by ID (in case of race conditions)
          const existingIds = new Set(prev.map((m) => m.id));
          const uniqueNewMessages = newMessages.filter((m) => !existingIds.has(m.id));

          if (uniqueNewMessages.length === 0) return prev;

          // Append new messages to the end (chronological order)
          const updated = [...prev, ...uniqueNewMessages];

          // Update the since timestamp for next poll
          sinceTimestampRef.current = getLatestTimestamp(updated);

          return updated;
        });

        setLastRefreshed(new Date());
      }
    } catch (err) {
      // Ignore abort errors (expected when component unmounts or polling stops)
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      // Log but don't set error state for polling failures
      // This prevents UI disruption during temporary network issues
      console.warn('Polling for messages failed:', err);
    } finally {
      abortControllerRef.current = null;
    }
  }, [fatherId, getLatestTimestamp]);

  // Load initial data when fatherId changes
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      // Reset since timestamp for new father
      sinceTimestampRef.current = null;

      try {
        const data: DevMessagesResponse = await fetchMessages(fatherId, 100, undefined, controller.signal);
        if (isMounted) {
          // Messages come ordered by created_at descending (newest first)
          // We reverse them for display (oldest at top, newest at bottom)
          const messages = data.messages || [];
          const chronologicalMessages = [...messages].reverse();
          setMessages(chronologicalMessages);
          setLastRefreshed(new Date());

          // Set the since timestamp to the most recent message for future polls
          sinceTimestampRef.current = getLatestTimestamp(chronologicalMessages);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Request was cancelled
        }
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load messages');
          setMessages([]);
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
  }, [fatherId, getLatestTimestamp]);

  // Set up polling interval when auto-refresh is enabled
  // @see Requirements 8.4, 11.3
  useEffect(() => {
    if (autoRefreshEnabled && !isLoading) {
      // Start polling
      pollingIntervalRef.current = setInterval(pollForNewMessages, POLLING_INTERVAL_MS);
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
  }, [autoRefreshEnabled, isLoading, pollForNewMessages]);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const data: DevMessagesResponse = await fetchMessages(fatherId, 100);
      // Messages come ordered by created_at descending (newest first)
      // We reverse them for display (oldest at top, newest at bottom)
      const messages = data.messages || [];
      const chronologicalMessages = [...messages].reverse();
      setMessages(chronologicalMessages);
      setLastRefreshed(new Date());

      // Update the since timestamp
      sinceTimestampRef.current = getLatestTimestamp(chronologicalMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsRefreshing(false);
    }
  }, [fatherId, getLatestTimestamp]);

  // Handle retry after error
  const handleRetry = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data: DevMessagesResponse = await fetchMessages(fatherId, 100);
      const messages = data.messages || [];
      const chronologicalMessages = [...messages].reverse();
      setMessages(chronologicalMessages);
      setLastRefreshed(new Date());
      sinceTimestampRef.current = getLatestTimestamp(chronologicalMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [fatherId, getLatestTimestamp]);

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
          <span>💬</span> Message Log
          <span className="text-xs text-gray-500 font-normal">
            ({messages.length} messages)
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

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-1">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>
    </div>
  );
}

export default MessageLogPanel;
