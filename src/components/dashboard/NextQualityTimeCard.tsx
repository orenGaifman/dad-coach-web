'use client';

/**
 * NextQualityTimeCard — Shows the next scheduled Quality Time session.
 *
 * Displays the scheduled date, time, child name, and a countdown timer
 * to the next Quality Time session. Includes a quick reschedule link.
 *
 * Features:
 * - Shows scheduled date and time in local timezone
 * - Displays child name
 * - Live countdown timer (updates every minute)
 * - Quick reschedule button
 * - Empty state when nothing is scheduled
 *
 * Requirements: 13.1 (Frontend display of next Quality Time)
 * @see design.md - Screen D1: Dashboard Home
 */

import { useState, useEffect, useCallback } from 'react';
import type { QualityTime } from '@/src/types/qualityTime';

/**
 * Helper function to combine class names.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Calculate the time difference between now and a target date.
 */
interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  totalMinutes: number;
  isPast: boolean;
}

function calculateTimeRemaining(targetDate: string): TimeRemaining {
  const now = new Date();
  const target = new Date(targetDate);
  const diffMs = target.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, totalMinutes: 0, isPast: true };
  }
  
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  
  return { days, hours, minutes, totalMinutes, isPast: false };
}

/**
 * Format the countdown display string.
 */
function formatCountdown(timeRemaining: TimeRemaining): string {
  const { days, hours, minutes, isPast, totalMinutes } = timeRemaining;
  
  if (isPast) {
    return 'Starting now!';
  }
  
  if (totalMinutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  if (days === 0) {
    if (hours === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${hours}h ${minutes}m`;
  }
  
  if (days === 1) {
    return `1 day ${hours}h`;
  }
  
  return `${days} days ${hours}h`;
}

/**
 * Format the scheduled date and time for display.
 */
function formatScheduledDateTime(scheduledStart: string): { date: string; time: string } {
  const scheduled = new Date(scheduledStart);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = scheduled.toDateString() === now.toDateString();
  const isTomorrow = scheduled.toDateString() === tomorrow.toDateString();
  
  const time = scheduled.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  let date: string;
  if (isToday) {
    date = 'Today';
  } else if (isTomorrow) {
    date = 'Tomorrow';
  } else {
    date = scheduled.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  return { date, time };
}

/**
 * Check if the quality time is happening soon (within 2 hours).
 */
function isHappeningSoon(scheduledStart: string): boolean {
  const now = new Date();
  const scheduled = new Date(scheduledStart);
  const diffMs = scheduled.getTime() - now.getTime();
  const diffHours = diffMs / 3600000;
  
  return diffHours >= 0 && diffHours <= 2;
}

/**
 * Props for the NextQualityTimeCard component.
 */
export interface NextQualityTimeCardProps {
  /** The next scheduled Quality Time session, or null if none scheduled */
  qualityTime: QualityTime | null;
  /** Callback when the reschedule button is clicked */
  onReschedule?: () => void;
  /** Additional CSS classes for the card container */
  className?: string;
}

/**
 * NextQualityTimeCard component.
 *
 * Shows the next scheduled Quality Time session with a countdown timer,
 * scheduled date/time, child name, and a reschedule option.
 *
 * @example
 * <NextQualityTimeCard 
 *   qualityTime={workspaceSummary.next_quality_time} 
 *   onReschedule={() => router.push('/schedule')} 
 * />
 *
 * @example
 * // Empty state when nothing is scheduled
 * <NextQualityTimeCard qualityTime={null} />
 */
export function NextQualityTimeCard({ 
  qualityTime, 
  onReschedule, 
  className 
}: NextQualityTimeCardProps) {
  // State for countdown timer
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  
  // Calculate time remaining
  const updateTimeRemaining = useCallback(() => {
    if (qualityTime) {
      setTimeRemaining(calculateTimeRemaining(qualityTime.scheduled_start));
    } else {
      setTimeRemaining(null);
    }
  }, [qualityTime]);
  
  // Update countdown on mount and every minute
  useEffect(() => {
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, [updateTimeRemaining]);

  // Empty state when nothing is scheduled
  if (!qualityTime) {
    return (
      <div 
        className={classNames(
          'bg-[#1E293B] rounded-2xl p-4 border border-white/5',
          className
        )}
        role="region"
        aria-label="Next Quality Time"
      >
        <div className="text-center py-4">
          <span className="text-3xl mb-3 block" aria-hidden="true">📅</span>
          <p className="text-gray-400 text-sm font-medium">
            No Quality Time scheduled
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Schedule some quality time with your child
          </p>
          {onReschedule && (
            <button
              type="button"
              onClick={onReschedule}
              className={classNames(
                'mt-3 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
                'bg-teal-500 text-white hover:bg-teal-600',
                'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#1E293B]'
              )}
            >
              Schedule Now
            </button>
          )}
        </div>
      </div>
    );
  }

  const { date, time } = formatScheduledDateTime(qualityTime.scheduled_start);
  const isSoon = isHappeningSoon(qualityTime.scheduled_start);
  const countdown = timeRemaining ? formatCountdown(timeRemaining) : '...';

  return (
    <div
      className={classNames(
        'bg-[#1E293B] rounded-2xl p-4 border',
        isSoon ? 'border-teal-500/50 ring-1 ring-teal-500/30' : 'border-white/5',
        className
      )}
      role="region"
      aria-label="Next Quality Time"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">Next Quality Time</p>
        {isSoon && (
          <span className="text-xs text-teal-400 bg-teal-500/10 px-2 py-1 rounded-full animate-pulse">
            🔔 Coming up!
          </span>
        )}
      </div>

      {/* Countdown Timer */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl" aria-hidden="true">⏱️</span>
        </div>
        <div>
          <p className="text-xl font-bold text-white" aria-live="polite">
            {timeRemaining?.isPast ? 'Starting now!' : `in ${countdown}`}
          </p>
          <p className="text-xs text-gray-500">
            {date} at {time}
          </p>
        </div>
      </div>

      {/* Child Name */}
      <div className="bg-[#0F172A] rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">👶</span>
          <p className="text-sm text-gray-300">
            with <span className="font-medium text-white">{qualityTime.child_name}</span>
          </p>
        </div>
      </div>

      {/* Duration info */}
      {qualityTime.scheduled_end && (
        <p className="text-xs text-gray-500 mb-3">
          {(() => {
            const start = new Date(qualityTime.scheduled_start);
            const end = new Date(qualityTime.scheduled_end);
            const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
            return `Duration: ${durationMinutes} minutes`;
          })()}
        </p>
      )}

      {/* Reschedule Link */}
      {onReschedule && (
        <button
          type="button"
          onClick={onReschedule}
          className={classNames(
            'w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors',
            'bg-gray-700 text-gray-300 hover:bg-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#1E293B]'
          )}
        >
          Reschedule
        </button>
      )}
    </div>
  );
}
