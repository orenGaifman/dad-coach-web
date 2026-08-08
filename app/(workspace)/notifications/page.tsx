'use client';

/**
 * Notifications Page — Screen U1
 *
 * Displays paginated list of notifications with:
 * - Type, title, body, created_at, read status, priority
 * - Mark-as-read individual buttons
 * - Mark All Read bulk action
 * - Empty state when no notifications
 *
 * @see Requirements 12.1, 12.2, 12.5: Notifications list
 * @see design.md - Screen U1: Notifications
 */

import { useState } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useMarkRead, useMarkAllRead } from '@/src/hooks/useMarkRead';
import { SkeletonList } from '@/src/components/common/SkeletonScreen';
import { ErrorState } from '@/src/components/common/ErrorState';
import { EmptyState } from '@/src/components/common/EmptyState';
import type { Notification, NotificationPriority, NotificationType } from '@/src/types/notifications';

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago").
 */
function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get icon for notification type.
 */
function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    ACHIEVEMENT_EARNED: '🏆',
    BELT_LEVEL_UP: '🥋',
    STREAK_MILESTONE: '🔥',
    MISSION_ASSIGNED: '📋',
    MISSION_REMINDER: '⏰',
    GOAL_PROGRESS: '📈',
    COACHING_INSIGHT: '💡',
    BIRTHDAY_REMINDER: '🎂',
    SYSTEM_MESSAGE: '📢',
  };
  return icons[type] ?? '📬';
}

/**
 * Get priority badge color.
 */
function getPriorityColor(priority: NotificationPriority): string {
  const colors: Record<NotificationPriority, string> = {
    HIGH: 'bg-amber-500/20 text-amber-400',
    MEDIUM: 'bg-blue-500/20 text-blue-400',
    LOW: 'bg-gray-500/20 text-gray-400',
  };
  return colors[priority] ?? 'bg-gray-500/20 text-gray-400';
}

/**
 * Notification card component.
 */
function NotificationCard({
  notification,
  onMarkRead,
  isMarking,
}: {
  notification: Notification;
  onMarkRead: () => void;
  isMarking: boolean;
}) {
  const isRead = notification.read_at !== null;

  return (
    <div
      className={`bg-[#1E293B] rounded-xl border p-4 transition-colors ${
        isRead ? 'border-white/5 opacity-70' : 'border-teal-500/30'
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-[#0F172A] flex items-center justify-center flex-shrink-0 text-xl">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-medium ${isRead ? 'text-gray-400' : 'text-white'}`}>
              {notification.title}
            </h3>
            {!isRead && (
              <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-2" />
            )}
          </div>

          <p className="text-gray-400 text-sm mb-2 line-clamp-2">{notification.body}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">
                {formatRelativeTime(notification.created_at)}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                  notification.priority
                )}`}
              >
                {(notification.priority ?? 'normal').toLowerCase()}
              </span>
            </div>

            {!isRead && (
              <button
                onClick={onMarkRead}
                disabled={isMarking}
                className="text-teal-400 text-xs hover:text-teal-300 transition-colors disabled:opacity-50"
              >
                {isMarking ? 'Marking...' : 'Mark read'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action link if available */}
      {notification.action_url && (
        <Link
          href={notification.action_url}
          className="mt-3 block text-center py-2 bg-[#0F172A] rounded-lg text-teal-400 text-sm hover:bg-[#0F172A]/80 transition-colors"
        >
          View Details →
        </Link>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { data, isLoading, error, refetch } = useNotifications();
  const markReadMutation = useMarkRead();
  const markAllReadMutation = useMarkAllRead();
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unread_count ?? 0;

  // Handle mark single notification as read
  const handleMarkRead = async (notificationId: string) => {
    setMarkingIds((prev) => new Set(prev).add(notificationId));
    try {
      await markReadMutation.mutateAsync([notificationId]);
    } finally {
      setMarkingIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }
  };

  // Handle mark all as read
  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] pb-24">
        <div className="max-w-[512px] mx-auto px-4">
          <header className="py-4">
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
          </header>
          <SkeletonList count={5} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172A] pb-24">
        <div className="max-w-[512px] mx-auto px-4">
          <header className="py-4">
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
          </header>
          <ErrorState
            type="error"
            title="Couldn't load notifications"
            description="Something went wrong while fetching your notifications."
            onRetry={refetch}
          />
        </div>
      </div>
    );
  }

  // Empty state
  if (notifications.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F172A] pb-24">
        <div className="max-w-[512px] mx-auto px-4">
          <header className="py-4">
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
          </header>
          <EmptyState
            title="No notifications yet"
            description="When you earn achievements, hit milestones, or receive coaching insights, they'll show up here."
            imageSrc="/dashboard/insights-empty.webp"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pb-24">
      <div className="max-w-[512px] mx-auto px-4">
        {/* Header */}
        <header className="py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-gray-400 text-sm mt-1">
                {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
              className="text-teal-400 text-sm hover:text-teal-300 transition-colors disabled:opacity-50"
            >
              {markAllReadMutation.isPending ? 'Marking...' : 'Mark all read'}
            </button>
          )}
        </header>

        {/* Error from mutations */}
        {(markReadMutation.error || markAllReadMutation.error) && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">
              Something went wrong. Please try again.
            </p>
          </div>
        )}

        {/* Notifications list */}
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.notification_id}
              notification={notification}
              onMarkRead={() => handleMarkRead(notification.notification_id)}
              isMarking={markingIds.has(notification.notification_id)}
            />
          ))}
        </div>

        {/* Pagination info (basic - more pages not implemented in MVP) */}
        {data?.pagination && data.pagination.total > notifications.length && (
          <div className="mt-6 text-center text-gray-500 text-sm">
            Showing {notifications.length} of {data.pagination.total} notifications
          </div>
        )}
      </div>
    </div>
  );
}
