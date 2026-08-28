'use client';

/**
 * FatherStatePanel — displays the father's state details in the Dev Dashboard.
 *
 * Features:
 * - Display current_workflow_state with color-coded badge
 * - Display previous_workflow_state for context
 * - Display workflow_state_entered_at in Israel timezone
 * - Display current_belt with belt color indicator
 * - Display phone, display_name, status
 * - Display children list with empty state handling
 * - Show partial data indicator when _partial is true
 * - Show error indicators for failed components
 * - Show contextual status description for better debugging (Requirements 2.17, 2.18)
 *
 * @see Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 2.17, 2.18
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchFatherState } from '@/src/api/dev';
import { formatIsraelDateTime } from '@/src/utils/timezone';
import type { DevFatherState, DevChild, DevQualityTime } from '@/src/types/dev';

/** Polling interval for auto-refresh (2 seconds) */
const POLLING_INTERVAL_MS = 2000;

interface FatherStatePanelProps {
  /** Father ID to display state for */
  fatherId: number;
  /** Whether auto-refresh polling is enabled (default: true) */
  autoRefreshEnabled?: boolean;
  /** Callback when workflow state changes (for state diagram synchronization) */
  onWorkflowStateChange?: (currentState: string | null, previousState: string | null) => void;
}

/** Color mapping for workflow states */
const WORKFLOW_STATE_COLORS: Record<string, string> = {
  WELCOME: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  WAITING: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  SCHEDULE_QUALITY_TIME: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  QUALITY_TIME_FOLLOW_UP: 'bg-green-500/20 text-green-300 border-green-500/30',
  QUALITY_TIME_PREPARATION: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  QUALITY_TIME_IN_PROGRESS: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  BELT_PROMOTION: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
};

/** Color mapping for belt levels */
const BELT_COLORS: Record<string, { bg: string; text: string; display: string }> = {
  WHITE: { bg: 'bg-white/80', text: 'text-gray-800', display: 'White' },
  YELLOW: { bg: 'bg-yellow-400', text: 'text-yellow-900', display: 'Yellow' },
  ORANGE: { bg: 'bg-orange-500', text: 'text-white', display: 'Orange' },
  GREEN: { bg: 'bg-green-500', text: 'text-white', display: 'Green' },
  BLUE: { bg: 'bg-blue-500', text: 'text-white', display: 'Blue' },
  BROWN: { bg: 'bg-amber-800', text: 'text-white', display: 'Brown' },
  BLACK: { bg: 'bg-gray-900', text: 'text-white', display: 'Black' },
};

/** Color mapping for father status */
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-300',
  INACTIVE: 'bg-gray-500/20 text-gray-300',
  PAUSED: 'bg-yellow-500/20 text-yellow-300',
  BLOCKED: 'bg-red-500/20 text-red-300',
};

/**
 * Formats a quality time's scheduled start for display.
 * Returns a human-readable string like "today at 3:00 PM" or "tomorrow at 10:00 AM".
 * 
 * @see Requirement 2.18: Show meaningful context like "Quality Time scheduled for tomorrow at 3pm"
 */
function formatNextQTTime(scheduledStart: string): string {
  const qtDate = new Date(scheduledStart);
  const now = new Date();
  
  // Get dates in Israel timezone for comparison
  const qtDateStr = qtDate.toLocaleDateString('en-IL', { timeZone: 'Asia/Jerusalem' });
  const todayStr = now.toLocaleDateString('en-IL', { timeZone: 'Asia/Jerusalem' });
  
  // Calculate tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-IL', { timeZone: 'Asia/Jerusalem' });
  
  // Format the time
  const timeStr = qtDate.toLocaleTimeString('en-IL', {
    timeZone: 'Asia/Jerusalem',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  
  if (qtDateStr === todayStr) {
    return `today at ${timeStr}`;
  } else if (qtDateStr === tomorrowStr) {
    return `tomorrow at ${timeStr}`;
  } else {
    // Format as date + time for further dates
    const dateStr = qtDate.toLocaleDateString('en-IL', {
      timeZone: 'Asia/Jerusalem',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    return `${dateStr} at ${timeStr}`;
  }
}

/**
 * Gets the next scheduled quality time (status = SCHEDULED, start time in future).
 */
function getNextScheduledQT(qualityTimes: DevQualityTime[]): DevQualityTime | null {
  const now = new Date();
  return qualityTimes
    .filter(qt => qt.status === 'SCHEDULED' && new Date(qt.scheduled_start) > now)
    .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime())[0] || null;
}

/**
 * Gets a contextual status description based on the workflow state and father data.
 * Provides meaningful context beyond just the state name for better debugging.
 * 
 * @param state - The current workflow state
 * @param fatherData - The complete father state data including scheduled QTs
 * @returns A human-readable contextual description of the current state
 * 
 * @see Requirement 2.17: Include WorkflowState and relevant sub-state or action context
 * @see Requirement 2.18: Show meaningful context like "Waiting - Quality Time scheduled for tomorrow at 3pm"
 */
function getStatusContext(state: string | null, fatherData: DevFatherState | null): string {
  if (!state) {
    return 'No state set';
  }

  const nextQT = fatherData?.scheduled_quality_times 
    ? getNextScheduledQT(fatherData.scheduled_quality_times) 
    : null;

  switch (state) {
    case 'WELCOME':
      return 'New father - onboarding in progress';
    
    case 'SCHEDULE_QUALITY_TIME':
      return 'Needs to schedule Quality Time';
    
    case 'WAITING':
      if (nextQT) {
        const timeStr = formatNextQTTime(nextQT.scheduled_start);
        return `Quality Time scheduled for ${timeStr}`;
      }
      return 'Waiting - No QT scheduled';
    
    case 'QUALITY_TIME_PREPARATION':
      if (nextQT) {
        const timeStr = formatNextQTTime(nextQT.scheduled_start);
        return `Quality Time starting ${timeStr}`;
      }
      return 'Quality Time starting soon';
    
    case 'QUALITY_TIME_IN_PROGRESS':
      return 'Quality Time in progress';
    
    case 'QUALITY_TIME_FOLLOW_UP':
      return 'Following up on completed Quality Time';
    
    case 'BELT_PROMOTION':
      return 'Belt promotion achieved!';
    
    case 'ACTIVITY_IDEAS':
      return 'Browsing activity ideas';
    
    default:
      return state.replace(/_/g, ' ');
  }
}

/**
 * Renders a workflow state badge with appropriate colors and optional context.
 * 
 * @see Requirement 2.18: Show meaningful context alongside state name
 */
function WorkflowStateBadge({ 
  state, 
  label, 
  context 
}: { 
  state: string | null; 
  label?: string; 
  context?: string;
}) {
  if (!state) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-gray-500/10 text-gray-500 border border-gray-500/20">
        {label ? `${label}: ` : ''}None
      </span>
    );
  }

  const colorClass = WORKFLOW_STATE_COLORS[state] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  const displayState = state.replace(/_/g, ' ');

  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`text-xs px-2 py-1 rounded-full border ${colorClass}`}>
        {label ? `${label}: ` : ''}{displayState}
      </span>
      {context && (
        <span className="text-xs text-gray-400 italic max-w-[200px] text-right">
          {context}
        </span>
      )}
    </div>
  );
}

/**
 * Renders a belt indicator with the appropriate color.
 */
function BeltIndicator({ belt }: { belt: string }) {
  const beltStyle = BELT_COLORS[belt] || { bg: 'bg-gray-500', text: 'text-white', display: belt };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-3 rounded-sm shadow-inner ${beltStyle.bg}`}
        aria-label={`${beltStyle.display} belt`}
      />
      <span className={`text-sm font-medium ${beltStyle.text === 'text-gray-800' ? 'text-white' : beltStyle.text}`}>
        {beltStyle.display} Belt
      </span>
    </div>
  );
}

/**
 * Renders a status badge.
 */
function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-500/20 text-gray-300';

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>
      {status}
    </span>
  );
}

/**
 * Renders a single child item.
 */
function ChildItem({ child }: { child: DevChild }) {
  return (
    <div className="flex items-center justify-between py-1 px-2 bg-white/5 rounded">
      <span className="text-white text-sm">{child.name}</span>
      <span className="text-gray-400 text-xs">{child.birth_date}</span>
    </div>
  );
}

/**
 * Renders the children list or empty state.
 */
function ChildrenList({ children }: { children: DevChild[] }) {
  if (children.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic py-2">
        No children registered
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {children.map((child) => (
        <ChildItem key={child.id} child={child} />
      ))}
    </div>
  );
}

/**
 * Renders a partial data warning.
 */
function PartialDataWarning({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 mt-3">
      <p className="text-yellow-300 text-xs flex items-center gap-1">
        <span>⚠️</span>
        Some data could not be loaded: {errors.join(', ')}
      </p>
    </div>
  );
}

/**
 * Renders an error state for the panel.
 */
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <span>👤</span> Father State
      </h3>
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
 * Renders a loading state for the panel.
 */
function LoadingState() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <span>👤</span> Father State
      </h3>
      <div className="space-y-3">
        <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-3/5 animate-pulse" />
      </div>
    </div>
  );
}

/**
 * FatherStatePanel component — displays the father's state details.
 *
 * @see Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 */
export function FatherStatePanel({ fatherId, autoRefreshEnabled = true, onWorkflowStateChange }: FatherStatePanelProps) {
  const [fatherState, setFatherState] = useState<DevFatherState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch father state data
  const loadFatherState = useCallback(async (signal?: AbortSignal, isPolling = false) => {
    // Only show loading spinner on initial load, not during polling
    if (!isPolling) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await fetchFatherState(fatherId, signal);
      setFatherState(data);
      // Notify parent of workflow state changes
      if (onWorkflowStateChange) {
        onWorkflowStateChange(
          data.workflow?.current_state ?? null,
          data.workflow?.previous_state ?? null
        );
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }
      setError(err instanceof Error ? err.message : 'Failed to load father state');
      setFatherState(null);
    } finally {
      if (!isPolling) {
        setIsLoading(false);
      }
    }
  }, [fatherId, onWorkflowStateChange]);

  // Initial load when fatherId changes
  useEffect(() => {
    const controller = new AbortController();
    loadFatherState(controller.signal, false);

    return () => {
      controller.abort();
    };
  }, [loadFatherState]);

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefreshEnabled || isLoading) {
      return;
    }

    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      loadFatherState(undefined, true);
    }, POLLING_INTERVAL_MS);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [autoRefreshEnabled, isLoading, loadFatherState]);

  // Handle retry
  const handleRetry = useCallback(() => {
    loadFatherState();
  }, [loadFatherState]);

  // Render loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Render error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  // Render empty state (shouldn't happen normally)
  if (!fatherState) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span>👤</span> Father State
        </h3>
        <p className="text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      {/* Header */}
      <h3 className="text-white font-semibold mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span>👤</span> Father State
        </span>
        <StatusBadge status={fatherState.status} />
      </h3>

      {/* Basic Info Section */}
      <div className="space-y-3 mb-4">
        {/* Display Name */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Name</span>
          <span className="text-white font-medium">
            {fatherState.display_name || 'Unknown'}
          </span>
        </div>

        {/* Phone */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Phone</span>
          <span className="text-white font-mono text-sm">{fatherState.phone}</span>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-white/10 my-4" />

      {/* Workflow State Section */}
      <div className="space-y-3 mb-4">
        <h4 className="text-gray-300 text-sm font-medium">Workflow</h4>

        {/* Current State with Contextual Description */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Current</span>
          <WorkflowStateBadge 
            state={fatherState.workflow.current_state} 
            context={getStatusContext(fatherState.workflow.current_state, fatherState)}
          />
        </div>

        {/* Previous State */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Previous</span>
          <WorkflowStateBadge state={fatherState.workflow.previous_state} />
        </div>

        {/* State Entered At */}
        {fatherState.workflow.state_entered_at && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Entered</span>
            <span className="text-white text-sm">
              {formatIsraelDateTime(fatherState.workflow.state_entered_at)}
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <hr className="border-white/10 my-4" />

      {/* Belt Section */}
      <div className="space-y-3 mb-4">
        <h4 className="text-gray-300 text-sm font-medium">Belt</h4>

        <BeltIndicator belt={fatherState.belt.current} />

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Quality times completed</span>
          <span className="text-white">{fatherState.belt.total_quality_times_completed}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Current streak</span>
          <span className="text-white">{fatherState.belt.current_streak_weeks} weeks</span>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-white/10 my-4" />

      {/* Children Section */}
      <div className="space-y-2">
        <h4 className="text-gray-300 text-sm font-medium flex items-center gap-2">
          <span>👶</span> Children ({fatherState.children.length})
        </h4>
        <ChildrenList children={fatherState.children} />
      </div>

      {/* Partial Data Warning */}
      {fatherState._partial && (
        <PartialDataWarning errors={fatherState._errors} />
      )}
    </div>
  );
}

export default FatherStatePanel;
