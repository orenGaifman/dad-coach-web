/**
 * Family API service layer.
 *
 * Wraps children, goals, and missions endpoints using the shared apiClient.
 * Each function is typed against the family type definitions.
 *
 * @see design.md - API Service Layer section
 */

import { apiClient } from '@/src/lib/api-client';
import type {
  ChildrenResponse,
  ChildDetailResponse,
  ChildMutationRequest,
  ChildMutationResponse,
  ChildArchiveResponse,
  GoalsResponse,
  GoalsFilterParams,
  GoalDetailResponse,
  ActiveMissionResponse,
} from '@/src/types/family';

// ---------------------------------------------------------------------------
// Children
// ---------------------------------------------------------------------------

/**
 * Fetch all children overview.
 * GET /api/v1/workspace/children
 *
 * @see Requirement 5: Children Overview
 */
export async function getChildren(signal?: AbortSignal): Promise<ChildrenResponse> {
  return apiClient.get<ChildrenResponse>('/workspace/children', { signal });
}

/**
 * Fetch detailed information for a single child.
 * GET /api/v1/workspace/children/{childId}/summary
 *
 * @see Requirement 6: Child Detail
 */
export async function getChildDetail(
  childId: number,
  signal?: AbortSignal
): Promise<ChildDetailResponse> {
  return apiClient.get<ChildDetailResponse>(`/workspace/children/${childId}/summary`, { signal });
}

/**
 * Add a new child (via Application API).
 * POST /api/v1/fathers/{fatherId}/children
 *
 * @see Requirement 14.2: Add child
 */
export async function addChild(
  fatherId: number,
  data: ChildMutationRequest
): Promise<ChildMutationResponse> {
  return apiClient.post<ChildMutationResponse>(`/fathers/${fatherId}/children`, data);
}

/**
 * Update an existing child (via Application API).
 * PUT /api/v1/fathers/{fatherId}/children/{childId}
 *
 * @see Requirement 14.2: Edit child
 */
export async function updateChild(
  fatherId: number,
  childId: number,
  data: ChildMutationRequest
): Promise<ChildMutationResponse> {
  return apiClient.put<ChildMutationResponse>(`/fathers/${fatherId}/children/${childId}`, data);
}

/**
 * Archive a child (via Application API).
 * DELETE /api/v1/fathers/{fatherId}/children/{childId}
 *
 * @see Requirement 14.4: Archive child
 */
export async function archiveChild(
  fatherId: number,
  childId: number
): Promise<ChildArchiveResponse> {
  // The DELETE endpoint returns void, but we wrap it with a success response
  await apiClient.delete(`/fathers/${fatherId}/children/${childId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

/**
 * Fetch all goals with optional filtering.
 * GET /api/v1/workspace/goals
 *
 * @see Requirement 7: Goals Overview
 */
export async function getGoals(
  params?: GoalsFilterParams,
  signal?: AbortSignal
): Promise<GoalsResponse> {
  // Convert filter params to query string params
  const queryParams: Record<string, string> = {};
  if (params?.status) {
    queryParams.status = params.status;
  }
  if (params?.category) {
    queryParams.category = params.category;
  }
  if (params?.child_id !== undefined) {
    queryParams.child_id = String(params.child_id);
  }

  return apiClient.get<GoalsResponse>('/workspace/goals', queryParams, { signal });
}

/**
 * Fetch detailed progress for a single goal.
 * GET /api/v1/workspace/goals/{goalId}/progress
 *
 * @see Requirement 8: Goal Detail
 */
export async function getGoalDetail(
  goalId: string,
  signal?: AbortSignal
): Promise<GoalDetailResponse> {
  return apiClient.get<GoalDetailResponse>(
    `/workspace/goals/${encodeURIComponent(goalId)}/progress`,
    { signal }
  );
}

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------

/**
 * Fetch the current active mission (if any).
 * GET /api/v1/workspace/missions/active
 *
 * @see Requirement 1.1: Active mission display on dashboard
 */
export async function getActiveMission(
  signal?: AbortSignal
): Promise<ActiveMissionResponse> {
  return apiClient.get<ActiveMissionResponse>('/workspace/missions/active', { signal });
}
