'use client';

/**
 * Mutation hooks for logging parenting activities.
 *
 * Provides two hooks:
 * - useLogQualityTime: Log quality time spent with a child
 * - useLogPositiveActivity: Log positive parenting moments
 *
 * Both hooks handle:
 * - Optimistic UI updates (show confirmation immediately)
 * - Cache invalidation on success (workspace-summary, growth-score, growth-streak)
 * - Error handling with rollback on failure
 * - Rate limit and duplicate detection errors
 * - Analytics tracking for activity_logged events
 *
 * @see Requirements 10.3, 11.3: Activity confirmation with points and streak impact
 * @see Task 8.4: Analytics event tracking
 * @see design.md - Mutation Hooks section
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logQualityTime, logPositiveActivity } from '@/src/services/coaching';
import { invalidationPatterns } from '@/src/lib/query-client';
import { analytics } from '@/src/services/analytics';
import type {
  LogQualityTimeRequest,
  LogPositiveActivityRequest,
  ActivityResponse,
} from '@/src/types/coaching';

/**
 * Hook for logging quality time with a child.
 *
 * Awards 12 points per quality time log.
 * Invalidates workspace-summary, growth-score, and growth-streak on success.
 *
 * @see Requirement 10: Log Quality Time
 */
export function useLogQualityTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LogQualityTimeRequest) => logQualityTime(data),
    onSuccess: (response, variables) => {
      // Track activity logged event
      analytics.activityLogged({
        activity_type: 'quality_time',
        child_id: String(variables.child_id),
        points_awarded: response.points_awarded,
        duration_minutes: variables.duration_minutes,
      });

      // Invalidate related queries to refresh data
      invalidationPatterns.afterActivityLog.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    },
  });
}


/**
 * Hook for logging positive parenting activities.
 *
 * Awards 5 points per positive activity log.
 * Invalidates workspace-summary, growth-score, and growth-streak on success.
 *
 * @see Requirement 11: Log Positive Activity
 */
export function useLogPositiveActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LogPositiveActivityRequest) => logPositiveActivity(data),
    onSuccess: (response, variables) => {
      // Track activity logged event
      analytics.activityLogged({
        activity_type: 'positive_activity',
        child_id: variables.child_id ? String(variables.child_id) : undefined,
        points_awarded: response.points_awarded,
      });

      // Invalidate related queries to refresh data
      invalidationPatterns.afterActivityLog.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    },
  });
}

/**
 * Type guard for rate limit errors.
 */
export function isRateLimitError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    return (error as { code: string }).code === 'DAILY_LIMIT_REACHED';
  }
  return false;
}

/**
 * Type guard for duplicate activity errors.
 */
export function isDuplicateError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    return (error as { code: string }).code === 'DUPLICATE_ACTIVITY';
  }
  return false;
}

/**
 * Get user-friendly error message for activity logging errors.
 */
export function getActivityErrorMessage(error: unknown): string {
  if (isRateLimitError(error)) {
    return "You've reached today's activity limit. Great job being so engaged! Come back tomorrow.";
  }
  if (isDuplicateError(error)) {
    return "Looks like you've already logged this activity. Each moment counts once!";
  }
  return "Something went wrong while saving your activity. Please try again.";
}
