/**
 * TanStack Query client configuration.
 *
 * This module configures the QueryClient with sensible defaults aligned
 * with the workspace data fetching strategy from WEB-SPEC-008.
 *
 * Requirements covered:
 * - 1.2: Dashboard renders within 2 seconds (stale-while-revalidate strategy)
 * - 17.1: Graceful handling of loading/error states
 *
 * Cache Keys and Stale Times (from design.md State Management):
 * | Key                    | Stale Time |
 * |------------------------|------------|
 * | workspace-summary      | 60s        |
 * | growth-belt            | 300s (5m)  |
 * | growth-score           | 300s (5m)  |
 * | growth-streak          | 120s (2m)  |
 * | growth-achievements    | 600s (10m) |
 * | celebrations           | 0 (fresh)  |
 * | children, child-*      | 120s (2m)  |
 * | goals, goal-*          | 120s (2m)  |
 * | missions-active        | 60s        |
 * | conversations          | 120s (2m)  |
 * | notifications          | 30s        |
 * | profile                | 0 (fresh)  |
 *
 * Revalidation Triggers:
 * - Tab navigation (focus): Stale queries for that tab
 * - Window regain focus: workspace-summary only
 * - After activity mutation: Summary + growth queries
 * - Pull-to-refresh (mobile): All queries for current tab
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { ApiError } from './api-client';

// ---------------------------------------------------------------------------
// Default stale times (in milliseconds)
// ---------------------------------------------------------------------------

export const STALE_TIMES = {
  /** Workspace summary - refreshes often to show current state */
  WORKSPACE_SUMMARY: 60 * 1000, // 60s

  /** Belt progression - changes infrequently */
  GROWTH_BELT: 5 * 60 * 1000, // 5 minutes

  /** Growth score - changes infrequently */
  GROWTH_SCORE: 5 * 60 * 1000, // 5 minutes

  /** Streak data - moderate refresh rate */
  GROWTH_STREAK: 2 * 60 * 1000, // 2 minutes

  /** Achievements - rarely change */
  GROWTH_ACHIEVEMENTS: 10 * 60 * 1000, // 10 minutes

  /** Celebrations - always fresh to not miss new events */
  CELEBRATIONS: 0,

  /** Children list - moderate refresh rate */
  CHILDREN: 2 * 60 * 1000, // 2 minutes

  /** Goals - moderate refresh rate */
  GOALS: 2 * 60 * 1000, // 2 minutes

  /** Active mission - refreshes often */
  MISSIONS_ACTIVE: 60 * 1000, // 60s

  /** Conversations - moderate refresh rate */
  CONVERSATIONS: 2 * 60 * 1000, // 2 minutes

  /** Notifications - more frequent refresh */
  NOTIFICATIONS: 30 * 1000, // 30s

  /** Profile - always fresh each view */
  PROFILE: 0,

  /** Commitments - moderate refresh rate */
  COMMITMENTS: 60 * 1000, // 60s

  /** Available time slots - refresh frequently as slots change quickly */
  AVAILABLE_SLOTS: 30 * 1000, // 30s
} as const;

// ---------------------------------------------------------------------------
// Query Keys factory (centralized key management)
// ---------------------------------------------------------------------------

export const queryKeys = {
  // Workspace
  workspaceSummary: () => ['workspace-summary'] as const,

  // Growth
  growthBelt: () => ['growth-belt'] as const,
  growthScore: () => ['growth-score'] as const,
  growthStreak: () => ['growth-streak'] as const,
  growthAchievements: () => ['growth-achievements'] as const,
  celebrations: () => ['celebrations'] as const,

  // Family
  children: () => ['children'] as const,
  child: (childId: string) => ['child', childId] as const,
  goals: () => ['goals'] as const,
  goal: (goalId: string) => ['goal', goalId] as const,
  missionsActive: () => ['missions-active'] as const,

  // Coaching
  conversations: () => ['conversations'] as const,
  conversation: (conversationId: string) => ['conversation', conversationId] as const,

  // Notifications
  notifications: () => ['notifications'] as const,

  // Profile
  profile: () => ['profile'] as const,

  // Commitments
  commitments: () => ['commitments'] as const,
  commitmentsUpcoming: () => ['commitments-upcoming'] as const,
  commitmentStats: () => ['commitment-stats'] as const,

  // Quality Time
  availableSlots: (daysAhead?: number, minDuration?: number) =>
    ['available-slots', { daysAhead, minDuration }] as const,
} as const;

// ---------------------------------------------------------------------------
// Retry behavior configuration
// ---------------------------------------------------------------------------

/**
 * Determines whether a failed query should be retried.
 * 
 * - Network errors: retry up to 3 times
 * - Server errors (5xx): retry up to 2 times
 * - Rate limited (429): no retry (respect rate limit)
 * - Auth errors (401, 403): no retry (requires re-authentication)
 * - Not found (404): no retry (resource doesn't exist)
 * - Validation errors (400, 422): no retry (fix request first)
 */
function shouldRetry(failureCount: number, error: Error): boolean {
  if (!(error instanceof ApiError)) {
    // Unknown errors: retry up to 3 times
    return failureCount < 3;
  }

  const { status, category, retryable } = error;

  // Don't retry non-retryable errors
  if (!retryable) {
    return false;
  }

  // Network errors and timeouts: retry up to 3 times
  if (category === 'network' || category === 'timeout' || status === 0) {
    return failureCount < 3;
  }

  // Server errors (5xx): retry up to 2 times
  if (status >= 500) {
    return failureCount < 2;
  }

  return false;
}

/**
 * Calculates retry delay with exponential backoff.
 * 
 * Base delay: 1 second
 * Max delay: 30 seconds
 * Formula: min(1000 * 2^attemptIndex, 30000)
 */
function getRetryDelay(attemptIndex: number): number {
  return Math.min(1000 * Math.pow(2, attemptIndex), 30000);
}

// ---------------------------------------------------------------------------
// Global error handlers
// ---------------------------------------------------------------------------

/**
 * Handle global query errors.
 * Logs errors for debugging but doesn't show UI notifications
 * (individual components handle their own error states).
 */
function handleQueryError(error: Error): void {
  if (error instanceof ApiError) {
    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('[QueryClient] Query error:', {
        code: error.code,
        status: error.status,
        message: error.message,
        category: error.category,
      });
    }

    // Handle 401 - could trigger global auth redirect
    // This is left for AuthProvider to handle via query cache access
    if (error.status === 401) {
      // Auth errors are handled at the AuthProvider level
      // which has access to the query cache for clearing on logout
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.error('[QueryClient] Unknown error:', error);
    }
  }
}

/**
 * Handle global mutation errors.
 * Similar to query errors but may include optimistic update rollbacks.
 */
function handleMutationError(error: Error): void {
  if (error instanceof ApiError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[QueryClient] Mutation error:', {
        code: error.code,
        status: error.status,
        message: error.message,
        category: error.category,
      });
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.error('[QueryClient] Unknown mutation error:', error);
    }
  }
}

// ---------------------------------------------------------------------------
// QueryClient factory
// ---------------------------------------------------------------------------

/**
 * Creates a new QueryClient instance with default configuration.
 * 
 * Called once at app startup. The returned client is provided to
 * QueryClientProvider in QueryProvider.tsx.
 * 
 * Default behaviors:
 * - Stale-while-revalidate: show cached data immediately, revalidate in background
 * - Configurable retry behavior based on error type
 * - Window focus refetching enabled (controlled per-query)
 * - Garbage collection after 5 minutes of inactivity
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleQueryError,
    }),
    mutationCache: new MutationCache({
      onError: handleMutationError,
    }),
    defaultOptions: {
      queries: {
        // Default stale time - individual hooks override with specific times
        staleTime: STALE_TIMES.WORKSPACE_SUMMARY,

        // Cache time before garbage collection (5 minutes)
        gcTime: 5 * 60 * 1000,

        // Retry configuration
        retry: shouldRetry,
        retryDelay: getRetryDelay,

        // Refetch behavior
        refetchOnWindowFocus: false, // Controlled per-query (only workspace-summary by default)
        refetchOnReconnect: true,
        refetchOnMount: true,

        // Network mode - always fetch when online, use cache when offline
        networkMode: 'offlineFirst',

        // Don't throw errors to React - let components handle error states
        throwOnError: false,
      },
      mutations: {
        // Retry mutations on network errors only, not on validation errors
        retry: (failureCount, error) => {
          if (!(error instanceof ApiError)) {
            return failureCount < 2;
          }
          // Only retry network errors for mutations
          return error.category === 'network' && failureCount < 2;
        },
        retryDelay: getRetryDelay,

        // Network mode for mutations
        networkMode: 'offlineFirst',

        // Don't throw errors to React
        throwOnError: false,
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Invalidation helpers
// ---------------------------------------------------------------------------

/**
 * Invalidation patterns for common mutation scenarios.
 * Used by mutation hooks after successful operations.
 */
export const invalidationPatterns = {
  /**
   * After logging activity (quality time or positive activity).
   * Invalidates: workspace-summary, growth-score, growth-streak
   */
  afterActivityLog: [
    queryKeys.workspaceSummary(),
    queryKeys.growthScore(),
    queryKeys.growthStreak(),
  ],

  /**
   * After marking celebration as displayed.
   * Invalidates: celebrations
   */
  afterCelebrationDismissed: [
    queryKeys.celebrations(),
  ],

  /**
   * After marking notification(s) as read.
   * Invalidates: notifications, workspace-summary
   */
  afterNotificationRead: [
    queryKeys.notifications(),
    queryKeys.workspaceSummary(),
  ],

  /**
   * After editing profile.
   * Invalidates: profile, workspace-summary
   */
  afterProfileEdit: [
    queryKeys.profile(),
    queryKeys.workspaceSummary(),
  ],

  /**
   * After adding/editing/archiving child.
   * Invalidates: children, workspace-summary
   */
  afterChildChange: [
    queryKeys.children(),
    queryKeys.workspaceSummary(),
  ],
} as const;
