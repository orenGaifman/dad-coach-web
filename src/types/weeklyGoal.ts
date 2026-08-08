/**
 * Weekly Goal type definitions for the Dad Coach 7-week program.
 *
 * These types model the weekly goal system where fathers set and track
 * weekly quality time goals, earning belt promotions for each successful week.
 */

import type { ISODateTime, ISODate } from './common';
import type { BeltLevel } from './growth';

// ---------------------------------------------------------------------------
// Weekly Goal Status
// ---------------------------------------------------------------------------

/**
 * Status of a weekly goal.
 */
export type WeeklyGoalStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'MISSED' | 'CANCELLED';

// ---------------------------------------------------------------------------
// Weekly Goal
// ---------------------------------------------------------------------------

/**
 * A single weekly goal record.
 */
export interface WeeklyGoal {
  /** Unique goal identifier */
  id: number;
  /** Start date of the week (Sunday) */
  weekStartDate: string;
  /** Target hours for the week (minimum 1) */
  targetHours: number;
  /** Actual minutes completed */
  actualMinutes: number;
  /** Actual hours completed (computed) */
  actualHours: number;
  /** Progress percentage (0-100+) */
  progressPercentage: number;
  /** Whether the goal was met */
  goalMet: boolean;
  /** Number of quality times scheduled */
  scheduledCount: number;
  /** Number of quality times completed */
  completedCount: number;
  /** Belt level at start of week */
  startingBelt: BeltLevel;
  /** Belt level at end of week */
  endingBelt: BeltLevel;
  /** Whether belt promotion occurred */
  beltPromoted: boolean;
  /** Goal status */
  status: WeeklyGoalStatus;
  /** When the goal was created */
  createdAt: ISODateTime;
  /** When the goal was completed (null if not completed) */
  completedAt: ISODateTime | null;
  /** Current streak in weeks */
  currentStreakWeeks: number;
}

/**
 * Response from GET /api/v1/workspace/weekly-goals/current
 */
export type CurrentWeeklyGoalResponse = WeeklyGoal;

/**
 * Response from GET /api/v1/workspace/weekly-goals/history
 */
export type WeeklyGoalHistoryResponse = WeeklyGoal[];

/**
 * Request to create a new weekly goal.
 * POST /api/v1/workspace/weekly-goals
 */
export interface CreateWeeklyGoalRequest {
  /** Target hours for the week (minimum 1) */
  targetHours: number;
  /** Whether to activate immediately (default: false) */
  activateImmediately?: boolean;
}

// ---------------------------------------------------------------------------
// Weekly Summary
// ---------------------------------------------------------------------------

/**
 * Weekly summary for the dashboard.
 * Response from GET /api/v1/workspace/weekly-goals/summary
 */
export interface WeeklySummaryResponse {
  /** Whether there was a previous goal to summarize */
  hasPreviousGoal: boolean;
  /** Target hours from last week */
  targetHours: number;
  /** Actual hours completed last week */
  actualHours: number;
  /** Number of quality times completed */
  completedCount: number;
  /** Number of quality times scheduled */
  scheduledCount: number;
  /** Whether the goal was met */
  goalMet: boolean;
  /** Starting belt level */
  startingBelt: BeltLevel | null;
  /** Ending belt level */
  endingBelt: BeltLevel | null;
  /** Whether a belt promotion occurred */
  wasPromoted: boolean;
  /** Number of consecutive successful weeks */
  consecutiveWeeks: number;
  /** Current streak in weeks */
  currentStreakWeeks: number;
  /** Longest streak ever */
  longestStreakWeeks: number;
  /** Weeks remaining until BLACK belt */
  weeksUntilBlackBelt: number;
}

// ---------------------------------------------------------------------------
// Program Progress
// ---------------------------------------------------------------------------

/**
 * Overall program progress for the 7-week journey.
 */
export interface ProgramProgress {
  /** Current belt level */
  currentBelt: BeltLevel;
  /** Current streak of successful weeks */
  currentStreakWeeks: number;
  /** Longest streak ever achieved */
  longestStreakWeeks: number;
  /** Weeks remaining until BLACK belt */
  weeksToBlackBelt: number;
  /** Whether the program is complete (BLACK belt achieved) */
  programCompleted: boolean;
  /** Progress percentage through the program (0-100) */
  progressPercentage: number;
}

/**
 * Calculates program progress from belt level.
 */
export function calculateProgramProgress(
  currentBelt: BeltLevel,
  currentStreakWeeks: number,
  longestStreakWeeks: number
): ProgramProgress {
  const beltOrder: BeltLevel[] = ['WHITE', 'YELLOW', 'ORANGE', 'GREEN', 'BLUE', 'BROWN', 'BLACK'];
  const currentIndex = beltOrder.indexOf(currentBelt);
  const totalBelts = beltOrder.length - 1; // Exclude WHITE as starting point
  
  return {
    currentBelt,
    currentStreakWeeks,
    longestStreakWeeks,
    weeksToBlackBelt: Math.max(0, totalBelts - currentIndex),
    programCompleted: currentBelt === 'BLACK',
    progressPercentage: Math.round((currentIndex / totalBelts) * 100),
  };
}
