/**
 * Growth-related type definitions for the Father Workspace.
 *
 * These types model belt progression, scores, streaks, achievements,
 * and celebrations for the Growth section (WEB-SPEC-008).
 */

import type { BaseApiResponse, ISODateTime, ISODate } from './common';

// ---------------------------------------------------------------------------
// Belt System
// ---------------------------------------------------------------------------

/**
 * The 8 belt levels in the Dad Coach progression system.
 * @see Requirement 2: Belt Progression Display
 */
export type BeltLevel =
  | 'WHITE'    // Beginner
  | 'YELLOW'   // Learner
  | 'ORANGE'   // Improving
  | 'GREEN'    // Committed
  | 'BLUE'     // Advanced
  | 'PURPLE'   // Expert
  | 'BROWN'    // Master
  | 'BLACK';   // Dad Sensei (final)

/**
 * Belt metadata for display purposes.
 */
export interface BeltInfo {
  /** Belt level identifier */
  level: BeltLevel;
  /** Display name (e.g., "Green Belt") */
  name: string;
  /** Belt description (e.g., "Committed") */
  description: string;
  /** Minimum points required for this belt */
  threshold: number;
}

/**
 * Response from GET /api/v1/workspace/growth/belt
 * @see Requirement 2.1: Belt progression display
 */
export interface BeltProgressionResponse extends BaseApiResponse {
  /** Current belt level */
  current_belt: BeltLevel;
  /** Current total score (streak weeks in 7-week program context) */
  current_score: number;
  /** Next belt level (null if BLACK belt) */
  next_belt: BeltLevel | null;
  /** Points needed to reach next belt (null if BLACK belt) */
  points_to_next_belt: number | null;
  /** Progress percentage to next belt (0-100, null if BLACK belt) */
  progress_percentage_to_next_belt: number | null;
  /** When the current belt was earned */
  belt_earned_at: ISODateTime;
  /** Weeks remaining until BLACK belt (program completion) */
  weeks_to_black_belt: number;
  /** Whether the 7-week program is complete */
  program_completed: boolean;
}

// ---------------------------------------------------------------------------
// Growth Score
// ---------------------------------------------------------------------------

/**
 * Signal types that contribute to the growth score.
 */
export type SignalType =
  | 'COACHING_SESSION'
  | 'QUALITY_TIME'
  | 'POSITIVE_ACTIVITY'
  | 'MISSION_COMPLETED'
  | 'GOAL_PROGRESS'
  | 'STREAK_BONUS';

/**
 * Score breakdown by signal type.
 */
export interface ScoreBySignal {
  /** Signal type */
  signal_type: SignalType;
  /** Total points from this signal type */
  points: number;
  /** Number of occurrences */
  count: number;
}

/**
 * Recent signal entry for the score breakdown.
 */
export interface RecentSignal {
  /** Signal type */
  signal_type: SignalType;
  /** Points awarded */
  points: number;
  /** When the signal was recorded */
  recorded_at: ISODateTime;
  /** Optional description */
  description?: string;
}

/**
 * Response from GET /api/v1/workspace/growth/score
 */
export interface GrowthScoreResponse extends BaseApiResponse {
  /** Total growth score */
  total_score: number;
  /** Score breakdown by signal type */
  score_by_signal: ScoreBySignal[];
  /** Recent signals (last 10) */
  recent_signals: RecentSignal[];
  /** When the score was last updated */
  last_updated: ISODateTime;
}

// ---------------------------------------------------------------------------
// Streak
// ---------------------------------------------------------------------------

/**
 * Streak milestone markers.
 * @see Requirement 4.3: Milestone markers
 */
export type StreakMilestone = 7 | 14 | 21 | 30 | 60 | 90 | 180 | 365;

/**
 * Response from GET /api/v1/workspace/growth/streak
 * @see Requirement 4.1: Streak display
 * 
 * Note: In the 7-week program context, streaks are measured in WEEKS
 * (consecutive weeks meeting the weekly goal), not days.
 */
export interface StreakResponse extends BaseApiResponse {
  /** Current consecutive weeks of meeting the weekly goal */
  current_streak_weeks: number;
  /** Longest streak in weeks ever achieved */
  longest_streak_weeks: number;
  /** When the current streak started (null if no streak) */
  streak_start_date: ISODate | null;
  /** Last qualifying interaction date */
  last_qualifying_interaction_date: ISODate | null;
  
  // Legacy fields for backwards compatibility (deprecated)
  /** @deprecated Use current_streak_weeks instead */
  current_streak_days?: number;
  /** @deprecated Use longest_streak_weeks instead */
  longest_streak_days?: number;
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

/**
 * Achievement categories.
 * @see Requirement 3.1: Achievement categories
 */
export type AchievementCategory =
  | 'MISSIONS'
  | 'CONSISTENCY'
  | 'GROWTH'
  | 'CONVERSATIONS'
  | 'GOALS'
  | 'SPECIAL';

/**
 * Single achievement item.
 */
export interface Achievement {
  /** Unique achievement identifier */
  achievement_id: string;
  /** Achievement name */
  name: string;
  /** Achievement description */
  description: string;
  /** Achievement category */
  category: AchievementCategory;
  /** Key for loading the achievement icon (maps to /achievements/{icon_key}.webp) */
  icon_key: string;
  /** When the achievement was earned (null if not earned) */
  earned_at: ISODateTime | null;
  /** Progress toward earning this achievement (0-100, optional) */
  progress_percentage?: number;
}

/**
 * The next achievable achievement (closest to earning).
 * @see Requirement 3.4: Next achievable highlight
 */
export interface NextAchievable {
  /** Achievement identifier */
  achievement_id: string;
  /** Achievement name */
  name: string;
  /** Achievement description */
  description: string;
  /** Icon key */
  icon_key: string;
  /** Progress percentage toward earning */
  progress_percentage: number;
}

/**
 * Response from GET /api/v1/workspace/growth/achievements
 * @see Requirement 3: Achievements Gallery
 */
export interface AchievementsResponse extends BaseApiResponse {
  /** Total achievements available */
  total_available: number;
  /** Total achievements earned by the father */
  total_earned: number;
  /** All achievements (earned and unearned) */
  achievements: Achievement[];
  /** The next achievement the father is closest to earning */
  next_achievable: NextAchievable | null;
}

// ---------------------------------------------------------------------------
// Celebrations
// ---------------------------------------------------------------------------

/**
 * Celebration event types.
 * @see Requirement 16.2: Celebration types
 */
export type CelebrationType =
  | 'BELT_LEVEL_UP'
  | 'ACHIEVEMENT_EARNED'
  | 'MILESTONE_REACHED'
  | 'STREAK_MILESTONE';

/**
 * Single celebration event.
 * @see Requirement 16: Celebration Events
 */
export interface Celebration {
  /** Unique celebration identifier */
  celebration_id: string;
  /** Type of celebration */
  event_type: CelebrationType;
  /** Celebration title */
  title: string;
  /** Encouragement message from backend */
  encouragement_message: string;
  /** When the celebration was earned */
  earned_at: ISODateTime;
  /** Whether the celebration has been displayed to the user */
  displayed: boolean;
  /** Related achievement (for ACHIEVEMENT_EARNED type) */
  achievement?: {
    achievement_id: string;
    name: string;
    icon_key: string;
  };
  /** Related belt (for BELT_LEVEL_UP type) */
  belt?: {
    new_belt: BeltLevel;
    previous_belt: BeltLevel;
  };
  /** Points awarded with this celebration */
  points_awarded?: number;
}

/**
 * Response from GET /api/v1/workspace/growth/celebrations
 * @see Requirement 16.1: Celebration fetch
 */
export interface CelebrationsResponse extends BaseApiResponse {
  /** List of celebration events */
  celebrations: Celebration[];
  /** Whether there are undisplayed celebrations */
  has_undisplayed: boolean;
  /** Whether the 7-week program is complete (BLACK belt) */
  program_completed: boolean;
}

/**
 * Request body for POST /api/v1/workspace/growth/celebrations/mark-displayed
 * @see Requirement 16.4: Mark as displayed
 */
export interface MarkCelebrationsDisplayedRequest {
  /** List of celebration IDs to mark as displayed */
  celebration_ids: string[];
}

/**
 * Response from POST /api/v1/workspace/growth/celebrations/mark-displayed
 */
export interface MarkCelebrationsDisplayedResponse {
  /** Whether the operation succeeded */
  success: boolean;
  /** Number of celebrations marked as displayed */
  marked_count: number;
}
