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

  // No commitments - encouraging message
  if (!nextCommitment) {
    return (
      <div className={classNames('bg-[#1E293B] rounded-2xl p-4 border border-white/5', className)}>
        <div className="text-center py-2">
          <span className="text-2xl mb-2 block" aria-hidden="true">📅</span>
          <p className="text-gray-400 text-sm">
            אין התחייבויות קרובות
          </p>
          <p className="text-gray-500 text-xs mt-1">
            שתף את הצ׳אט מתי תבלה עם הילדים
          </p>
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
        'bg-[#1E293B] rounded-2xl p-4 border',
        isSoon ? 'border-teal-500/50 ring-1 ring-teal-500/30' : 'border-white/5',
        className
      )}
      role="region"
      aria-label="התחייבות קרובה"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">זמן איכות מתוכנן</p>
        {isSoon && (
          <span className="text-xs text-teal-400 bg-teal-500/10 px-2 py-1 rounded-full animate-pulse">
            🔔 בקרוב!
          </span>
        )}
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl" aria-hidden="true">⏰</span>
        </div>
        <div>
          <p className="text-xl font-bold text-white">{relativeTime}</p>
          <p className="text-xs text-gray-500">{fullTime}</p>
        </div>
      </div>

      {/* Activity note (if exists) */}
      {nextCommitment.activityNote && (
        <div className="bg-[#0F172A] rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-300">{nextCommitment.activityNote}</p>
        </div>
      )}

      {/* Child name (if specified) */}
      {nextCommitment.childName && (
        <p className="text-sm text-gray-400 mb-3">
          👦 עם {nextCommitment.childName}
        </p>
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
