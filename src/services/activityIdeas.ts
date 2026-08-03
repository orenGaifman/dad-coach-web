/**
 * Activity Ideas API service layer.
 *
 * Wraps activity ideas endpoints using the shared apiClient.
 * Each function is typed against the qualityTime type definitions.
 *
 * @see design.md - API Service Layer section
 */

import { apiClient } from '@/src/lib/api-client';
import type { ActivityIdeasResponse } from '@/src/types/qualityTime';

// ---------------------------------------------------------------------------
// Activity Ideas
// ---------------------------------------------------------------------------

/**
 * Fetch activity ideas for a specific child.
 * GET /api/v1/activity-ideas?child_id={childId}
 *
 * @param childId - UUID of the child to get activity ideas for
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Promise resolving to ActivityIdeasResponse containing array of ActivityIdea
 *
 * @see Requirement: Activity Ideas for Quality Time
 */
export async function getActivityIdeas(
  childId: string,
  signal?: AbortSignal
): Promise<ActivityIdeasResponse> {
  return apiClient.get<ActivityIdeasResponse>(
    '/activity-ideas',
    { child_id: childId },
    { signal }
  );
}
