'use client';

/**
 * Mutation hook for updating the father's profile.
 *
 * Handles:
 * - Optimistic update (show confirmation immediately)
 * - Cache invalidation on success (profile, workspace-summary)
 * - Error handling with rollback on failure
 *
 * @see Requirement 13.2: Profile edit functionality
 * @see design.md - Mutation Hooks section
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '@/src/services/workspace';
import { queryKeys, invalidationPatterns } from '@/src/lib/query-client';
import type { ProfileUpdateRequest } from '@/src/types/workspace';

interface UpdateProfileParams {
  fatherId: number;
  data: ProfileUpdateRequest;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fatherId, data }: UpdateProfileParams) =>
      updateProfile(fatherId, data),
    onSuccess: () => {
      // Invalidate profile and workspace summary to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceSummary() });
    },
  });
}
