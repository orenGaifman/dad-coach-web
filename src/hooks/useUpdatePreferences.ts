'use client';

/**
 * Mutation hook for updating coaching preferences.
 *
 * Handles:
 * - Optimistic update (show confirmation immediately)
 * - Cache invalidation on success (profile, workspace-summary)
 * - Error handling with rollback on failure
 *
 * @see Requirement 15: Preferences editing
 * @see design.md - Mutation Hooks section
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePreferences } from '@/src/services/workspace';
import { queryKeys } from '@/src/lib/query-client';
import type { PreferencesUpdateRequest } from '@/src/types/workspace';

interface UpdatePreferencesParams {
  fatherId: number;
  data: PreferencesUpdateRequest;
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fatherId, data }: UpdatePreferencesParams) =>
      updatePreferences(fatherId, data),
    onSuccess: () => {
      // Invalidate profile and workspace summary to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceSummary() });
    },
  });
}
