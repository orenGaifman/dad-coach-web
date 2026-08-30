'use client';

/**
 * UpcomingCommitmentCard — Shows the father's next scheduled quality time commitment
 * and upcoming calendar events from Google Calendar.
 *
 * Displays a countdown and details of the upcoming commitment/event to remind the father
 * of their promise to spend quality time with their children.
 *
 * Key features:
 * - Shows relative time countdown (e.g., "in 2 hours", "tomorrow at 5pm")
 * - Displays activity note if available
 * - Shows Google Calendar events synced to the dashboard
 * - Links to full commitments view
 *
 * Requirements: Quality Time Commitment System, Google Calendar Sync
 */

import { useState, useEffect, useMemo } from 'react';
import { useUpcomingCommitments } from '@/src/hooks/useCommitments';
import { useCalendarEvents } from '@/src/hooks/useCalendar';
import { useProfile } from '@/src/hooks/useProfile';
import type { Commitment } from '@/src/types/commitment';
import type { CalendarEvent } from '@/src/types/calendar';
import { classNames } from '@/src/utils/classNames';

/**
 * Unified item type that can represent either a commitment or a calendar event.
 */
interface UpcomingItem {
  type: 'commitment' | 'calendar';
  id: string | number;
  scheduledAt: string;
  title: string;
  childName?: string | null;
  activityNote?: string | null;
  location?: string | null;
  commitment?: Commitment; // Original commitment for actions
}

/**
 * Convert a commitment to an UpcomingItem.
 */
function commitmentToItem(c: Commitment): UpcomingItem {
  return {
    type: 'commitment',
    id: c.id,
    scheduledAt: c.scheduledAt,
    title: c.activityType || 'זמן איכות',
    childName: c.childName,
    activityNote: c.activityNote,
    commitment: c,
  };
}

/**
 * Convert a calendar event to an UpcomingItem.
 */
function calendarEventToItem(e: CalendarEvent): UpcomingItem {
  return {
    type: 'calendar',
    id: e.eventId,
    scheduledAt: e.startTime,
    title: e.title,
    activityNote: e.description,
    location: e.location,
  };
}

/**
 * Format a relative time string for the commitment.
 */
function formatRelativeTime(scheduledAt: string): string {
  const now = new Date();
  const scheduled = new Date(scheduledAt);
  const diffMs = scheduled.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 0) {
    return 'עכשיו'; // Now (past due)
  }

  if (diffMins < 60) {
    return `בעוד ${diffMins} דקות`;
  }

  if (diffHours < 24) {
    return `בעוד ${diffHours} שעות`;
  }

  if (diffDays === 1) {
    return `מחר ב-${scheduled.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Format with day name for this week
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const dayName = dayNames[scheduled.getDay()];
  const time = scheduled.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  
  return `יום ${dayName} ב-${time}`;
}

/**
 * Format the scheduled time in a nice display format.
 */
function formatScheduledTime(scheduledAt: string): string {
  const scheduled = new Date(scheduledAt);
  const dayNames = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת'];
  const dayName = dayNames[scheduled.getDay()];
  const time = scheduled.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  const date = scheduled.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' });
  
  return `${dayName}, ${date} בשעה ${time}`;
}

/**
 * Check if commitment is happening soon (within 2 hours).
 */
function isHappeningSoon(scheduledAt: string): boolean {
  const now = new Date();
  const scheduled = new Date(scheduledAt);
  const diffMs = scheduled.getTime() - now.getTime();
  const diffHours = diffMs / 3600000;
  
  return diffHours >= 0 && diffHours <= 2;
}

/**
 * Props for the UpcomingCommitmentCard component.
 */
export interface UpcomingCommitmentCardProps {
  /** Additional CSS classes for the card container */
  className?: string;
}

/**
 * UpcomingCommitmentCard component.
 *
 * Shows the next scheduled quality time commitment or calendar event with countdown and actions.
 * Merges commitments and Google Calendar events, sorted by time.
 */
export function UpcomingCommitmentCard({ className }: UpcomingCommitmentCardProps) {
  const { data: profile } = useProfile();
  const { data: commitments, isLoading: commitmentsLoading } = useUpcomingCommitments();
  const { data: calendarData, isLoading: calendarLoading } = useCalendarEvents(
    profile?.father_id,
    7, // 7 days ahead
    false // Only Dad Coach related events
  );
  
  // Force re-render every minute to update countdown
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Merge commitments and calendar events, sorted by scheduled time
  const upcomingItems = useMemo(() => {
    const items: UpcomingItem[] = [];
    
    // Add commitments
    if (commitments) {
      items.push(...commitments.map(commitmentToItem));
    }
    
    // Add calendar events (if connected and available)
    if (calendarData?.connected && calendarData.events) {
      items.push(...calendarData.events.map(calendarEventToItem));
    }
    
    // Sort by scheduled time and filter out past events
    const now = new Date();
    return items
      .filter(item => new Date(item.scheduledAt) >= now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [commitments, calendarData]);

  // Get the next item
  const nextItem = upcomingItems.length > 0 ? upcomingItems[0] : null;

  const isLoading = commitmentsLoading || calendarLoading;

  // Loading state
  if (isLoading) {
    return (
      <div className={classNames('bg-[#1E293B] rounded-2xl p-4 border border-white/5', className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="h-6 bg-gray-700 rounded w-2/3"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // No items - encouraging message with stronger CTA
  if (!nextItem) {
    return (
      <div className={classNames('bg-gradient-to-br from-teal-900/30 to-blue-900/30 rounded-2xl p-6 border border-teal-500/20', className)}>
        <div className="text-center" dir="rtl">
          <span className="text-4xl mb-3 block" aria-hidden="true">📅</span>
          <h3 className="text-lg font-bold text-white mb-2">אין זמן איכות מתוכנן</h3>
          <p className="text-gray-300 text-sm mb-4">
            קביעת זמן איכות עם הילדים היא הבסיס להצלחה!
          </p>
          <div className="bg-[#1E293B]/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs">
              💬 שלח הודעה בוואטסאפ למאמן וקבע זמן איכות
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isSoon = isHappeningSoon(nextItem.scheduledAt);
  const relativeTime = formatRelativeTime(nextItem.scheduledAt);
  const fullTime = formatScheduledTime(nextItem.scheduledAt);
  const isCommitment = nextItem.type === 'commitment';

  return (
    <div
      className={classNames(
        'rounded-2xl p-5 border',
        isSoon 
          ? 'bg-gradient-to-br from-teal-900/40 to-emerald-900/40 border-teal-400/50 ring-2 ring-teal-500/40 shadow-lg shadow-teal-500/10' 
          : 'bg-gradient-to-br from-teal-900/20 to-blue-900/20 border-teal-500/20',
        className
      )}
      role="region"
      aria-label="התחייבות קרובה"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{isCommitment ? '⏰' : '📅'}</span>
          <p className="text-sm font-medium text-teal-400">
            {isCommitment ? 'זמן איכות מתוכנן' : 'אירוע מהיומן'}
          </p>
        </div>
        {isSoon && (
          <span className="text-xs text-teal-300 bg-teal-500/20 px-3 py-1.5 rounded-full animate-pulse font-medium">
            🔔 בקרוב!
          </span>
        )}
      </div>

      {/* Countdown - Made more prominent */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-3xl" aria-hidden="true">👨‍👧</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{relativeTime}</p>
          <p className="text-sm text-gray-400">{fullTime}</p>
        </div>
      </div>

      {/* Title for calendar events */}
      {!isCommitment && (
        <div className="bg-[#0F172A]/50 rounded-xl p-3 mb-4">
          <p className="text-base text-white font-medium">
            🎯 {nextItem.title}
          </p>
        </div>
      )}

      {/* Child name (if specified) - Made more prominent */}
      {nextItem.childName && (
        <div className="bg-[#0F172A]/50 rounded-xl p-3 mb-4">
          <p className="text-base text-white font-medium">
            👦 זמן איכות עם {nextItem.childName}
          </p>
        </div>
      )}

      {/* Activity note (if exists) */}
      {nextItem.activityNote && (
        <div className="bg-[#0F172A]/50 rounded-xl p-3 mb-4">
          <p className="text-sm text-gray-300">💡 {nextItem.activityNote}</p>
        </div>
      )}

      {/* Location (for calendar events) */}
      {nextItem.location && (
        <div className="bg-[#0F172A]/50 rounded-xl p-3">
          <p className="text-sm text-gray-300">📍 {nextItem.location}</p>
        </div>
      )}
    </div>
  );
}
