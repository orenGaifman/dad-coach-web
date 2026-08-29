'use client';

/**
 * ScoreBreakdown — Displays growth score breakdown by signal type.
 *
 * Shows the father's score breakdown by different signal types
 * (coaching sessions, quality time, positive activities, etc.)
 * and a list of recent signals with points and timestamps.
 *
 * Features:
 * - Score breakdown by signal type with points and count
 * - Recent signals list (last 10)
 * - Signal type icons and formatted names
 * - Relative time formatting for recent signals
 *
 * Requirements: 2.1 (Belt Progression Display - score breakdown)
 * @see design.md - Growth Score section
 */

import type { ScoreBySignal, RecentSignal, SignalType } from '@/src/types/growth';
import { classNames } from '@/src/utils/classNames';

/**
 * Signal type display metadata.
 * Maps each signal type to a display name, icon, and color.
 */
const SIGNAL_TYPE_INFO: Record<SignalType, { 
  name: string; 
  icon: string; 
  color: string;
}> = {
  COACHING_SESSION: { 
    name: 'Coaching Sessions', 
    icon: '💬', 
    color: 'text-indigo-400' 
  },
  QUALITY_TIME: { 
    name: 'Quality Time', 
    icon: '⏰', 
    color: 'text-emerald-400' 
  },
  POSITIVE_ACTIVITY: { 
    name: 'Positive Activities', 
    icon: '💜', 
    color: 'text-purple-400' 
  },
  MISSION_COMPLETED: { 
    name: 'Missions Completed', 
    icon: '🎯', 
    color: 'text-amber-400' 
  },
  GOAL_PROGRESS: { 
    name: 'Goal Progress', 
    icon: '📈', 
    color: 'text-blue-400' 
  },
  STREAK_BONUS: { 
    name: 'Streak Bonuses', 
    icon: '🔥', 
    color: 'text-orange-400' 
  },
};

/**
 * Formats a date string to a relative time string (e.g., "2 hours ago").
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }
  if (diffHours > 0) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  if (diffMinutes > 0) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }
  return 'Just now';
}

/**
 * Props for the ScoreBreakdown component.
 */
export interface ScoreBreakdownProps {
  /** Total growth score */
  totalScore: number;
  /** Score breakdown by signal type */
  scoreBySignal: ScoreBySignal[];
  /** Recent signals list */
  recentSignals: RecentSignal[];
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * ScoreBreakdown component.
 *
 * Displays a breakdown of the growth score by signal type,
 * along with a list of recent signals and their point values.
 *
 * @example
 * <ScoreBreakdown
 *   totalScore={1250}
 *   scoreBySignal={[
 *     { signal_type: 'QUALITY_TIME', points: 600, count: 50 },
 *     { signal_type: 'COACHING_SESSION', points: 400, count: 8 },
 *   ]}
 *   recentSignals={[
 *     { signal_type: 'QUALITY_TIME', points: 12, recorded_at: '2024-01-15T10:00:00Z' },
 *   ]}
 * />
 */
export function ScoreBreakdown({
  totalScore,
  scoreBySignal,
  recentSignals,
  className,
}: ScoreBreakdownProps) {
  // Sort score breakdown by points descending
  const sortedScoreBySignal = [...scoreBySignal].sort((a, b) => b.points - a.points);
  
  // Filter out signal types with 0 points
  const nonZeroSignals = sortedScoreBySignal.filter(s => s.points > 0);

  return (
    <div
      className={classNames(
        'space-y-6',
        className
      )}
      role="region"
      aria-label="Score breakdown"
    >
      {/* Score Breakdown by Signal Type */}
      <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span aria-hidden="true">📊</span>
          Score Breakdown
        </h3>
        
        {nonZeroSignals.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            Start engaging to see your score breakdown
          </p>
        ) : (
          <div className="space-y-3">
            {nonZeroSignals.map((signal) => {
              const info = SIGNAL_TYPE_INFO[signal.signal_type];
              const percentage = totalScore > 0 ? (signal.points / totalScore) * 100 : 0;
              
              return (
                <div 
                  key={signal.signal_type}
                  className="flex items-center gap-3"
                  role="listitem"
                >
                  {/* Icon */}
                  <span 
                    className="text-xl flex-shrink-0 w-8 text-center" 
                    aria-hidden="true"
                  >
                    {info.icon}
                  </span>
                  
                  {/* Name and progress */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={classNames('text-sm font-medium', info.color)}>
                        {info.name}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {(signal.points ?? 0).toLocaleString()} pts
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div 
                      className="h-2 bg-gray-700 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={Math.round(percentage)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${info.name}: ${Math.round(percentage)}% of total score`}
                    >
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    {/* Count */}
                    <p className="text-gray-500 text-xs mt-1">
                      {signal.count} {signal.count === 1 ? 'time' : 'times'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Signals */}
      <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span aria-hidden="true">⚡</span>
          Recent Activity
        </h3>
        
        {recentSignals.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No recent activity yet
          </p>
        ) : (
          <ul className="space-y-3" role="list" aria-label="Recent signals">
            {recentSignals.map((signal, index) => {
              const info = SIGNAL_TYPE_INFO[signal.signal_type];
              
              return (
                <li 
                  key={`${signal.signal_type}-${signal.recorded_at}-${index}`}
                  className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
                >
                  {/* Icon */}
                  <span 
                    className="text-lg flex-shrink-0 w-8 text-center" 
                    aria-hidden="true"
                  >
                    {info.icon}
                  </span>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className={classNames('text-sm font-medium', info.color)}>
                      {info.name}
                    </p>
                    {signal.description && (
                      <p className="text-gray-500 text-xs truncate">
                        {signal.description}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs">
                      {formatRelativeTime(signal.recorded_at)}
                    </p>
                  </div>
                  
                  {/* Points */}
                  <span className="text-emerald-400 font-semibold text-sm flex-shrink-0">
                    +{signal.points}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
