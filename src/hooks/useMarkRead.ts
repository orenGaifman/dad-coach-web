'use client';

/**
 * Mutation hooks for marking notifications as read.
 *
 * Provides:
 * - useMarkRead: Mark specific notification(s) as read
 * - useMarkAllRead: Mark all notifications as read
 *
 * Both hooks implement optimistic updates:
 * - Badge count decrements immediately
 * - Notification list updates read_at field
 * - Reverts on failure
 * - Analytics tracking for notification events
 *
 * @see Requirement 12.2: Mark-as-read functionality
 * @see Task 8.4: Analytics event tracking
 * @see design.md - Mutation Hooks section
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationsRead, markAllNotificationsRead } from '@/src/services/notifications';
import { queryKeys } from '@/src/lib/query-client';
import { analytics } from '@/src/services/analytics';
import type { NotificationsResponse, Notification } from '@/src/types/notifications';
import type { WorkspaceSummaryResponse } from '@/src/types/workspace';

/**
 * Hook for marking specific notifications as read.
 *
 * Implements optimistic update: marks notifications as read immediately
 * in the cache and updates badge count. Reverts on failure.
 */
export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: string[]) =>
      markNotificationsRead({ notification_ids: notificationIds }),

    onMutate: async (notificationIds) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications() });
      await queryClient.cancelQueries({ queryKey: queryKeys.workspaceSummary() });

      // Snapshot previous values
      const previousNotifications = queryClient.getQueryData<NotificationsResponse>(
        queryKeys.notifications()
      );
      const previousSummary = queryClient.getQueryData<WorkspaceSummaryResponse>(
        queryKeys.workspaceSummary()
      );

      // Optimistically update notifications
      if (previousNotifications) {
        const now = new Date().toISOString();
        const updatedNotifications: NotificationsResponse = {
          ...previousNotifications,
          notifications: previousNotifications.notifications.map((n: Notification) =>
            notificationIds.includes(n.notification_id)
              ? { ...n, read_at: now }
              : n
          ),
          unread_count: Math.max(
            0,
            previousNotifications.unread_count - notificationIds.length
          ),
        };
        queryClient.setQueryData(queryKeys.notifications(), updatedNotifications);
      }

      // Optimistically update workspace summary badge count
      if (previousSummary) {
        const updatedSummary: WorkspaceSummaryResponse = {
          ...previousSummary,
          unread_notifications_count: Math.max(
            0,
            previousSummary.unread_notifications_count - notificationIds.length
          ),
        };
        queryClient.setQueryData(queryKeys.workspaceSummary(), updatedSummary);
      }

      return { previousNotifications, previousSummary };
    },

    onError: (_error, _variables, context) => {
      // Revert on failure
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKeys.notifications(), context.previousNotifications);
      }
      if (context?.previousSummary) {
        queryClient.setQueryData(queryKeys.workspaceSummary(), context.previousSummary);
      }
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceSummary() });
    },

    onSuccess: (_data, notificationIds) => {
      // Track notification mark read event
      analytics.notificationMarkRead({
        notification_ids: notificationIds,
        count: notificationIds.length,
      });
    },
  });
}

/**
 * Hook for marking all notifications as read.
 *
 * Implements optimistic update: marks all notifications as read immediately
 * and sets badge count to 0. Reverts on failure.
 */
export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(),

    onMutate: async () => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications() });
      await queryClient.cancelQueries({ queryKey: queryKeys.workspaceSummary() });

      // Snapshot previous values
      const previousNotifications = queryClient.getQueryData<NotificationsResponse>(
        queryKeys.notifications()
      );
      const previousSummary = queryClient.getQueryData<WorkspaceSummaryResponse>(
        queryKeys.workspaceSummary()
      );

      // Optimistically update all notifications
      if (previousNotifications) {
        const now = new Date().toISOString();
        const updatedNotifications: NotificationsResponse = {
          ...previousNotifications,
          notifications: previousNotifications.notifications.map((n: Notification) => ({
            ...n,
            read_at: n.read_at ?? now,
          })),
          unread_count: 0,
        };
        queryClient.setQueryData(queryKeys.notifications(), updatedNotifications);
      }

      // Optimistically update workspace summary badge count to 0
      if (previousSummary) {
        const updatedSummary: WorkspaceSummaryResponse = {
          ...previousSummary,
          unread_notifications_count: 0,
        };
        queryClient.setQueryData(queryKeys.workspaceSummary(), updatedSummary);
      }

      return { previousNotifications, previousSummary };
    },

    onError: (_error, _variables, context) => {
      // Revert on failure
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKeys.notifications(), context.previousNotifications);
      }
      if (context?.previousSummary) {
        queryClient.setQueryData(queryKeys.workspaceSummary(), context.previousSummary);
      }
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceSummary() });
    },

    onSuccess: () => {
      // Track mark all read event
      analytics.track('notification_mark_all_read', {});
    },
  });
}
