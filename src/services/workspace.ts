/**
 * Workspace API service layer.
 *
 * Wraps workspace summary and profile endpoints using the shared apiClient.
 * Each function is typed against the workspace type definitions.
 *
 * @see design.md - API Service Layer section
 */

import { apiClient } from '@/src/lib/api-client';
import type {
  WorkspaceSummaryResponse,
  ProfileResponse,
  ProfileUpdateRequest,
  ProfileUpdateResponse,
  PreferencesUpdateRequest,
  PreferencesUpdateResponse,
} from '@/src/types/workspace';

// ---------------------------------------------------------------------------
// Workspace Summary
// ---------------------------------------------------------------------------

/**
 * Fetch the workspace summary (main dashboard data).
 * GET /api/v1/workspace/summary
 *
 * @see Requirement 1: Workspace Summary Dashboard
 */
export async function getWorkspaceSummary(
  signal?: AbortSignal
): Promise<WorkspaceSummaryResponse> {
  return apiClient.get<WorkspaceSummaryResponse>('/workspace/summary', { signal });
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

/**
 * Fetch the father's profile.
 * GET /api/v1/workspace/profile
 *
 * @see Requirement 13.1: Profile View
 */
export async function getProfile(signal?: AbortSignal): Promise<ProfileResponse> {
  return apiClient.get<ProfileResponse>('/workspace/profile', { signal });
}

/**
 * Update the father's profile (via Application API).
 * PUT /api/v1/fathers/{fatherId}/profile
 *
 * Note: This uses the Application API (different base path) for profile mutations.
 *
 * @see Requirement 13.2: Profile Edit
 */
export async function updateProfile(
  fatherId: number,
  data: ProfileUpdateRequest
): Promise<ProfileUpdateResponse> {
  return apiClient.put<ProfileUpdateResponse>(`/fathers/${fatherId}/profile`, data);
}

/**
 * Update the father's preferences (via Application API).
 * PUT /api/v1/fathers/{fatherId}/preferences
 *
 * @see Requirement 15: Preferences
 */
export async function updatePreferences(
  fatherId: number,
  data: PreferencesUpdateRequest
): Promise<PreferencesUpdateResponse> {
  return apiClient.put<PreferencesUpdateResponse>(`/fathers/${fatherId}/preferences`, data);
}
