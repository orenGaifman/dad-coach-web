/**
 * Family-related type definitions for the Father Workspace.
 *
 * These types model children, goals, and missions
 * for the Family section (WEB-SPEC-008).
 */

import type { BaseApiResponse, ISODateTime, ISODate } from './common';

// ---------------------------------------------------------------------------
// Child
// ---------------------------------------------------------------------------

/**
 * Child gender options.
 * @see Requirement 14.2: Child form fields
 */
export type ChildGender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

/**
 * Child overview item for the children list.
 * @see Requirement 5.1: Children Overview display
 */
export interface ChildOverview {
  /** Child identifier */
  child_id: number;
  /** Child's name */
  name: string;
  /** Child's birth date */
  birth_date: ISODate;
  /** Computed age (e.g., "5 years" or "18 months") */
  computed_age: string;
  /** Age in years (for filtering) */
  age_years: number;
  /** Number of active goals for this child */
  active_goals_count: number;
  /** Number of completed missions */
  completed_missions_count: number;
  /** Most recent mission (null if none) */
  recent_mission: RecentMissionSummary | null;
  /** Child's interests */
  interests: string[];
  /** Whether birthday is within 7 days */
  birthday_upcoming: boolean;
}

/**
 * Summary of a recent mission for child overview.
 */
export interface RecentMissionSummary {
  /** Mission identifier */
  mission_id: string;
  /** Mission title */
  title: string;
  /** When the mission was completed (null if ongoing) */
  completed_at: ISODateTime | null;
}

/**
 * Response from GET /api/v1/workspace/children
 * @see Requirement 5: Children Overview
 */
export interface ChildrenResponse extends BaseApiResponse {
  /** List of children */
  children: ChildOverview[];
  /** Total count */
  total_count: number;
}

/**
 * Detailed child information.
 * @see Requirement 6.1: Child Detail display
 */
export interface ChildDetail {
  /** Child identifier */
  child_id: number;
  /** Child's name */
  name: string;
  /** Child's birth date */
  birth_date: ISODate;
  /** Computed age string */
  computed_age: string;
  /** Age in years */
  age_years: number;
  /** Gender (optional) */
  gender?: ChildGender;
  /** Child's interests */
  interests: string[];
  /** Child's challenges */
  challenges: string[];
  /** Active goals with progress */
  active_goals: GoalSummary[];
  /** Mission history summary */
  mission_history: MissionHistorySummary;
  /** Whether birthday is within 7 days */
  birthday_upcoming: boolean;
  /** Days until birthday (null if > 30 days) */
  days_until_birthday: number | null;
}

/**
 * Response from GET /api/v1/workspace/children/{childId}/summary
 * @see Requirement 6: Child Detail
 */
export interface ChildDetailResponse extends BaseApiResponse {
  /** Child details */
  child: ChildDetail;
}

/**
 * Mission history summary for child detail.
 */
export interface MissionHistorySummary {
  /** Total missions completed */
  total_completed: number;
  /** Total missions started */
  total_started: number;
  /** Recent completed missions (last 5) */
  recent_completed: RecentMissionSummary[];
}

/**
 * Request body for creating/updating a child.
 * @see Requirement 14.2: Child form fields
 */
export interface ChildMutationRequest {
  /** Child's name (required for create) */
  name: string;
  /** Birth date (required for create, must be 0-18 years past) */
  birth_date: ISODate;
  /** Gender (optional) */
  gender?: ChildGender;
  /** Interests (optional) */
  interests?: string[];
  /** Challenges (optional) */
  challenges?: string[];
}

/**
 * Response from child create/update operations.
 */
export interface ChildMutationResponse {
  success: boolean;
  child_id: number;
  message?: string;
}

/**
 * Response from child archive operation.
 * @see Requirement 14.4: Archive confirmation
 */
export interface ChildArchiveResponse {
  success: boolean;
  message?: string;
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

/**
 * Goal status.
 */
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

/**
 * Goal category.
 */
export type GoalCategory =
  | 'COMMUNICATION'
  | 'QUALITY_TIME'
  | 'DISCIPLINE'
  | 'EMOTIONAL_SUPPORT'
  | 'EDUCATION'
  | 'HEALTH'
  | 'BONDING'
  | 'OTHER';

/**
 * Goal priority level.
 */
export type GoalPriority = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Goal summary for lists and child detail.
 */
export interface GoalSummary {
  /** Goal identifier */
  goal_id: string;
  /** Goal description */
  description: string;
  /** Goal category */
  category: GoalCategory;
  /** Progress percentage (0-100) */
  progress_percentage: number;
}

/**
 * Goal overview item for goals list.
 * @see Requirement 7.1: Goals Overview display
 */
export interface GoalOverview {
  /** Goal identifier */
  goal_id: string;
  /** Goal description */
  description: string;
  /** Goal category */
  category: GoalCategory;
  /** Goal priority */
  priority: GoalPriority;
  /** Goal status */
  status: GoalStatus;
  /** Progress percentage (0-100, capped) */
  progress_percentage: number;
  /** Related child (null if not child-specific) */
  related_child: {
    child_id: number;
    name: string;
  } | null;
  /** Number of missions completed toward this goal */
  missions_completed_count: number;
  /** Estimated missions remaining */
  missions_remaining_estimate: number;
  /** When the goal was created */
  created_at: ISODateTime;
}

/**
 * Response from GET /api/v1/workspace/goals
 * @see Requirement 7: Goals Overview
 */
export interface GoalsResponse extends BaseApiResponse {
  /** List of goals */
  goals: GoalOverview[];
  /** Total count */
  total_count: number;
}

/**
 * Filter parameters for goals list.
 * @see Requirement 7.3: Goal filtering
 */
export interface GoalsFilterParams {
  /** Filter by status */
  status?: GoalStatus;
  /** Filter by category */
  category?: GoalCategory;
  /** Filter by child */
  child_id?: number;
}

/**
 * Mission related to a goal.
 */
export interface GoalRelatedMission {
  /** Mission identifier */
  mission_id: string;
  /** Mission title */
  title: string;
  /** Mission status */
  status: 'ACTIVE' | 'COMPLETED' | 'SKIPPED';
  /** When completed (null if not completed) */
  completed_at: ISODateTime | null;
}

/**
 * Milestone reached for a goal.
 */
export interface GoalMilestone {
  /** Milestone identifier */
  milestone_id: string;
  /** Milestone description */
  description: string;
  /** When the milestone was reached */
  reached_at: ISODateTime;
}

/**
 * Detailed goal information.
 * @see Requirement 8.1: Goal Detail display
 */
export interface GoalDetail {
  /** Goal identifier */
  goal_id: string;
  /** Goal description */
  description: string;
  /** Goal category */
  category: GoalCategory;
  /** Goal priority */
  priority: GoalPriority;
  /** Goal status */
  status: GoalStatus;
  /** When the goal was created */
  created_at: ISODateTime;
  /** Progress percentage (0-100, capped) */
  progress_percentage: number;
  /** Related child (null if not child-specific) */
  related_child: {
    child_id: number;
    name: string;
  } | null;
  /** Missions related to this goal (read-only) */
  related_missions: GoalRelatedMission[];
  /** Milestones reached */
  milestones_reached: GoalMilestone[];
}

/**
 * Response from GET /api/v1/workspace/goals/{goalId}/progress
 * @see Requirement 8: Goal Detail
 */
export interface GoalDetailResponse extends BaseApiResponse {
  /** Goal details */
  goal: GoalDetail;
}

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------

/**
 * Mission status.
 */
export type MissionStatus = 'ACTIVE' | 'COMPLETED' | 'SKIPPED' | 'EXPIRED';

/**
 * Active mission details.
 */
export interface ActiveMission {
  /** Mission identifier */
  mission_id: string;
  /** Mission title */
  title: string;
  /** Mission description */
  description: string;
  /** Mission category */
  category: string;
  /** Related child */
  child: {
    child_id: number;
    name: string;
  };
  /** When the mission was assigned */
  assigned_at: ISODateTime;
  /** When the mission expires (null if no expiry) */
  expires_at: ISODateTime | null;
  /** Days remaining */
  days_remaining: number | null;
  /** Mission steps */
  steps: MissionStep[];
  /** Completed steps count */
  completed_steps: number;
  /** Total steps count */
  total_steps: number;
  /** Related goal (if any) */
  related_goal?: {
    goal_id: string;
    description: string;
  };
}

/**
 * Mission step.
 */
export interface MissionStep {
  /** Step number */
  step_number: number;
  /** Step description */
  description: string;
  /** Whether the step is completed */
  completed: boolean;
  /** When the step was completed (null if not completed) */
  completed_at: ISODateTime | null;
}

/**
 * Response from GET /api/v1/workspace/missions/active
 */
export interface ActiveMissionResponse extends BaseApiResponse {
  /** Active mission (null if none) */
  active_mission: ActiveMission | null;
}
