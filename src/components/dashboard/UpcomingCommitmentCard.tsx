'use client';

/**
 * UpcomingCommitmentCard — Shows the father's next scheduled quality time commitment.
 *
 * Displays a countdown and details of the upcoming commitment to remind the father
 * of their promise to spend quality time with their children.
 *
 * Key features:
 * - Shows relative time countdown (e.g., "in 2 hours", "tomorrow at 5pm")
 * - Displays activity note if available
 * - Allows marking as complete or canceling
 * - Links to full commitments view
 *
 * Requirements: Quality Time Commitment System
 */

import { useState, useEffect } from 'react';
import { useUpcomingCommitments, useCompleteCommitment, useCancelCommitment } from '@/src/hooks/useCommitments';
import type { Commitment } from '@/src/types/commitment';

/**
 * Helper function to combine class names.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
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
 * Shows the next scheduled quality time commitment with countdown and actions.
 */
export function UpcomingCommitmentCard({ className }: UpcomingCommitmentCardProps) {
  const { data: commitments, isLoading } = useUpcomingCommitments();
  const completeCommitment = useCompleteCommitment();
  const cancelCommitment = useCancelCommitment();
  
  // Force re-render every minute to update countdown
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Get the next commitment
  const nextCommitment: Commitment | null = commitments && commitments.length > 0 ? commitments[0] : null;

  // Handle complete action
  const handleComplete = async () => {
    if (!nextCommitment) return;
    try {
      await completeCommitment.mutateAsync({ commitmentId: nextCommitment.id });
    } catch (error) {
      console.error('Failed to complete commitment:', error);
    }
  };

  // Handle cancel action
  const handleCancel = async () => {
    if (!nextCommitment) return;
    try {
      await cancelCommitment.mutateAsync(nextCommitment.id);
    } catch (error) {
      console.error('Failed to cancel commitment:', error);
    }
  };

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

  // No commitments - encouraging message with stronger CTA
  if (!nextCommitment) {
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

  const isSoon = isHappeningSoon(nextCommitment.scheduledAt);
  const relativeTime = formatRelativeTime(nextCommitment.scheduledAt);
  const fullTime = formatScheduledTime(nextCommitment.scheduledAt);

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
          <span className="text-xl">⏰</span>
          <p className="text-sm font-medium text-teal-400">זמן איכות מתוכנן</p>
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

      {/* Child name (if specified) - Made more prominent */}
      {nextCommitment.childName && (
        <div className="bg-[#0F172A]/50 rounded-xl p-3 mb-4">
          <p className="text-base text-white font-medium">
            👦 זמן איכות עם {nextCommitment.childName}
          </p>
        </div>
      )}

      {/* Activity note (if exists) */}
      {nextCommitment.activityNote && (
        <div className="bg-[#0F172A]/50 rounded-xl p-3 mb-4">
          <p className="text-sm text-gray-300">💡 {nextCommitment.activityNote}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleComplete}
          disabled={completeCommitment.isPending}
          className={classNames(
            'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
            'bg-teal-500 text-white hover:bg-teal-600',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#1E293B]',
            completeCommitment.isPending && 'opacity-50 cursor-not-allowed'
          )}
        >
          {completeCommitment.isPending ? '...' : '✓ בוצע!'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={cancelCommitment.isPending}
          className={classNames(
            'py-2 px-3 rounded-lg text-sm font-medium transition-colors',
            'bg-gray-700 text-gray-300 hover:bg-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#1E293B]',
            cancelCommitment.isPending && 'opacity-50 cursor-not-allowed'
          )}
        >
          {cancelCommitment.isPending ? '...' : 'ביטול'}
        </button>
      </div>
    </div>
  );
}
