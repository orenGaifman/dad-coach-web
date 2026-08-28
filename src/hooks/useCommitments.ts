'use client';

/**
 * Hooks for fetching and mutating quality time commitments.
 *
 * Wraps the commitments service with TanStack Query caching.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES, invalidationPatterns } from '@/src/lib/query-client';
import {
  getCommitments,
  getUpcomingCommitments,
  getCommitmentStats,
  createCommitment,
  completeCommitment,
  cancelCommitment,
} from '@/src/services/commitments';
import type { CreateCommitmentRequest, CompleteCommitmentRequest } from '@/src/types/commitment';

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/**
 * Fetch all commitments.
 */
export function useCommitments() {
  return useQuery({
    queryKey: queryKeys.commitments(),
    queryFn: ({ signal }) => getCommitments(signal),
    staleTime: STALE_TIMES.COMMITMENTS,
  });
}

/**
 * Fetch upcoming commitments only.
 */
export function useUpcomingCommitments() {
  return useQuery({
    queryKey: queryKeys.commitmentsUpcoming(),
    queryFn: ({ signal }) => getUpcomingCommitments(signal),
    staleTime: STALE_TIMES.COMMITMENTS,
  });
}

/**
 * Fetch commitment statistics.
 */
export function useCommitmentStats() {
  return useQuery({
    queryKey: queryKeys.commitmentStats(),
    queryFn: ({ signal }) => getCommitmentStats(signal),
    staleTime: STALE_TIMES.COMMITMENTS,
  });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/**
 * Shared invalidation for commitment changes.
 */
function invalidateCommitmentQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.commitments() });
  queryClient.invalidateQueries({ queryKey: queryKeys.commitmentsUpcoming() });
  queryClient.invalidateQueries({ queryKey: queryKeys.commitmentStats() });
}

/**
 * Create a new commitment.
 */
export function useCreateCommitment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommitmentRequest) => createCommitment(data),
    onSuccess: () => {
      invalidateCommitmentQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceSummary() });
    },
  });
}

/**
 * Complete a commitment.
 */
export function useCompleteCommitment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commitmentId, data }: { commitmentId: number; data?: CompleteCommitmentRequest }) =>
      completeCommitment(commitmentId, data),
    onSuccess: () => {
      invalidateCommitmentQueries(queryClient);
      invalidationPatterns.afterActivityLog.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}

/**
 * Cancel a commitment.
 */
export function useCancelCommitment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commitmentId: number) => cancelCommitment(commitmentId),
    onSuccess: () => {
      invalidateCommitmentQueries(queryClient);
    },
  });
}
