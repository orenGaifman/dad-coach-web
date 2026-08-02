/**
 * Growth API service layer.
 *
 * Wraps belt, score, streak, achievements, and celebrations endpoints
 * using the shared apiClient. Each function is typed against the growth
 * type definitions.
 *
 * @see design.md - API Service Layer section
 */

import { apiClient } from '@/src/lib/api-client';
import type {
  BeltProgressionResponse,
  GrowthScoreResponse,
  StreakResponse,
  AchievementsResponse,
  CelebrationsResponse,
  MarkCelebrationsDisplayedRequest,
  MarkCelebrationsDisplayedResponse,
} from '@/src/types/growth';

// ---------------------------------------------------------------------------
// Belt Progression
// ---------------------------------------------------------------------------

/**
 * Fetch belt progression data.
 * GET /api/v1/workspace/growth/belt
 *
 * @see Requirement 2: Belt Progression Display
 */
export async function getBeltProgression(
  signal?: AbortSignal
): Promise<BeltProgressionResponse> {
  return apiClient.get<BeltProgressionResponse>('/workspace/growth/belt', { signal });
}

// ---------------------------------------------------------------------------
// Growth Score
// ---------------------------------------------------------------------------

/**
 * Fetch growth score breakdown.
 * GET /api/v1/workspace/growth/score
 *
 * @see Requirement 2.1: Belt progression display (score component)
 */
export async function getGrowthScore(
  signal?: AbortSignal
): Promise<GrowthScoreResponse> {
  return apiClient.get<GrowthScoreResponse>('/workspace/growth/score', { signal });
}

// ---------------------------------------------------------------------------
// Streak
// ---------------------------------------------------------------------------

/**
 * Fetch streak data.
 * GET /api/v1/workspace/growth/streak
 *
 * @see Requirement 4: Streak Display
 */
export async function getStreak(signal?: AbortSignal): Promise<StreakResponse> {
  return apiClient.get<StreakResponse>('/workspace/growth/streak', { signal });
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

/**
 * Fetch all achievements (earned and unearned).
 * GET /api/v1/workspace/growth/achievements
 *
 * @see Requirement 3: Achievements Gallery
 */
export async function getAchievements(
  signal?: AbortSignal
): Promise<AchievementsResponse> {
  return apiClient.get<AchievementsResponse>('/workspace/growth/achievements', { signal });
}

// ---------------------------------------------------------------------------
// Celebrations
// ---------------------------------------------------------------------------

/**
 * Fetch undisplayed celebration events.
 * GET /api/v1/workspace/growth/celebrations
 *
 * @see Requirement 16: Celebration Events
 */
export async function getCelebrations(
  signal?: AbortSignal
): Promise<CelebrationsResponse> {
  return apiClient.get<CelebrationsResponse>('/workspace/growth/celebrations', { signal });
}

/**
 * Mark celebrations as displayed.
 * POST /api/v1/workspace/growth/celebrations/mark-displayed
 *
 * @see Requirement 16.4: Mark celebration as displayed
 */
export async function markCelebrationsDisplayed(
  data: MarkCelebrationsDisplayedRequest
): Promise<MarkCelebrationsDisplayedResponse> {
  return apiClient.post<MarkCelebrationsDisplayedResponse>(
    '/workspace/growth/celebrations/mark-displayed',
    data
  );
}
