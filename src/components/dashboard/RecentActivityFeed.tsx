'use client';

/**
 * RecentActivityFeed — Displays the father's recent Quality Time completions.
 *
 * Shows up to 5 most recent completed Quality Time sessions with:
 * - Date (formatted nicely, e.g., "Yesterday", "Jan 15")
 * - Child name
 * - Duration in minutes
 *
 * Features an empty state when no completions exist yet, encouraging
 * the father to schedule their first Quality Time.
 *
 * Requirements: 13.1 (Recent activity feed: Last 5 Quality Time completions with dates and children)
 * @see design.md - Screen D1: Dashboard Home - Recent activity feed section
 */

import type { QualityTime } from '@/src/types/qualityTime';

/**
 * Helper function to combine class names.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format a date string into a human-readable format.
 * Shows "Today", "Yesterday", or the date (e.g., "Jan 15").
 *
 * @param dateString - ISO 8601 date string
 * @returns Formatted date string
 */
function formatActivityDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (activityDate.getTime() === today.getTime()) {
    return 'Today';
  }

  if (activityDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  // Format as "Jan 15" for other dates
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate the duration in minutes from scheduled start and end times.
 *
 * @param startTime - ISO 8601 start time
 * @param endTime - ISO 8601 end time
 * @returns Duration in minutes
 */
function calculateDurationMinutes(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60));
}

/**
 * Format duration for display.
 *
 * @param minutes - Duration in minutes
 * @returns Formatted duration string (e.g., "30 min", "1h 15min")
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Props for the RecentActivityFeed component.
 */
export interface RecentActivityFeedProps {
  /** Array of completed Quality Time sessions (already filtered to completed status) */
  activities: QualityTime[];
  /** Additional CSS classes for the card container */
  className?: string;
}

/**
 * RecentActivityFeed component.
 *
 * A card displaying the father's most recent Quality Time completions.
 * Shows up to 5 activities with date, child name, and duration.
 *
 * When no activities exist, displays an encouraging empty state.
 *
 * @example
 * // With activities
 * <RecentActivityFeed
 *   activities={[
 *     {
 *       id: '1',
 *       child_name: 'Noah',
 *       scheduled_start: '2024-01-15T17:00:00Z',
 *       scheduled_end: '2024-01-15T17:30:00Z',
 *       completed_at: '2024-01-15T17:30:00Z',
 *       status: 'COMPLETED',
 *       ...
 *     }
 *   ]}
 * />
 *
 * @example
 * // Empty state
 * <RecentActivityFeed activities={[]} />
 *
 * @example
 * // With custom styling
 * <RecentActivityFeed activities={activities} className="mt-4" />
 */
export function RecentActivityFeed({ activities, className }: RecentActivityFeedProps) {
  // Take only the first 5 activities (most recent)
  const recentActivities = activities.slice(0, 5);

  // Empty state
  if (recentActivities.length === 0) {
    return (
      <div
        className={classNames(
          'bg-[#1E293B] rounded-2xl p-4',
          className
        )}
        aria-label="Recent activity feed with no completions yet"
      >
        {/* Header */}
        <p className="text-sm text-gray-400 mb-4">Recent Activity</p>

        {/* Empty state */}
        <div className="text-center py-6">
          <span className="text-3xl mb-3 block" aria-hidden="true">
            ⏳
          </span>
          <p className="text-gray-400 text-sm">No completions yet</p>
          <p className="text-gray-500 text-xs mt-1">
            Complete your first Quality Time to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'bg-[#1E293B] rounded-2xl p-4',
        className
      )}
      aria-label={`Recent activity feed showing ${recentActivities.length} completed Quality Time sessions`}
    >
      {/* Header */}
      <p className="text-sm text-gray-400 mb-4">Recent Activity</p>

      {/* Activity list */}
      <ul className="divide-y divide-white/5">
        {recentActivities.map((activity, index) => {
          // Use completedAt if available, otherwise fallback to scheduled_end
          const completionDate = activity.completed_at || activity.scheduled_end;
          const durationMinutes = calculateDurationMinutes(
            activity.scheduled_start,
            activity.scheduled_end
          );

          return (
            <li
              key={activity.id}
              className={classNames(
                'flex items-center justify-between py-3',
                index === 0 && 'pt-0',
                index === recentActivities.length - 1 && 'pb-0'
              )}
            >
              {/* Left side: Date and child name */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Checkmark indicator */}
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <svg
                    className="w-3.5 h-3.5 text-teal-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>

                {/* Activity details */}
                <div className="min-w-0">
                  <p className="text-white text-sm truncate">
                    Quality Time with {activity.child_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatActivityDate(completionDate)}
                  </p>
                </div>
              </div>

              {/* Right side: Duration */}
              <span className="flex-shrink-0 text-xs text-gray-400 ml-3">
                {formatDuration(durationMinutes)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
