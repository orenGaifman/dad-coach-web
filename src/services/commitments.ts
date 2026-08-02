/**
 * Commitments API service layer.
 *
 * Wraps quality time commitment endpoints using the shared apiClient.
 */

import { apiClient } from '@/src/lib/api-client';
import type {
  Commitment,
  CommitmentsResponse,
  UpcomingCommitmentsResponse,
  CommitmentStatsResponse,
  CreateCommitmentRequest,
  CompleteCommitmentRequest,
} from '@/src/types/commitment';

// ---------------------------------------------------------------------------
// Get Commitments
// ---------------------------------------------------------------------------

/**
 * Fetch all commitments for the authenticated father.
 * GET /api/v1/workspace/commitments
 */
export async function getCommitments(
  signal?: AbortSignal
): Promise<CommitmentsResponse> {
  return apiClient.get<CommitmentsResponse>('/workspace/commitments', { signal });
}

/**
 * Fetch upcoming (scheduled/reminded) commitments.
 * GET /api/v1/workspace/commitments/upcoming
 */
export async function getUpcomingCommitments(
  signal?: AbortSignal
): Promise<UpcomingCommitmentsResponse> {
  return apiClient.get<UpcomingCommitmentsResponse>('/workspace/commitments/upcoming', { signal });
}

/**
 * Fetch commitment statistics.
 * GET /api/v1/workspace/commitments/stats
 */
export async function getCommitmentStats(
  signal?: AbortSignal
): Promise<CommitmentStatsResponse> {
  return apiClient.get<CommitmentStatsResponse>('/workspace/commitments/stats', { signal });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Create a new commitment.
 * POST /api/v1/workspace/commitments
 */
export async function createCommitment(
  data: CreateCommitmentRequest
): Promise<Commitment> {
  return apiClient.post<Commitment>('/workspace/commitments', data);
}

/**
 * Mark a commitment as completed.
 * POST /api/v1/workspace/commitments/:id/complete
 */
export async function completeCommitment(
  commitmentId: number,
  data?: CompleteCommitmentRequest
): Promise<Commitment> {
  return apiClient.post<Commitment>(
    `/workspace/commitments/${commitmentId}/complete`,
    data || {}
  );
}

/**
 * Cancel a commitment.
 * DELETE /api/v1/workspace/commitments/:id
 */
export async function cancelCommitment(commitmentId: number): Promise<void> {
  return apiClient.delete(`/workspace/commitments/${commitmentId}`);
}
