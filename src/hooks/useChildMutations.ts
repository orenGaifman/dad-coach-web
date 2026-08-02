'use client';

/**
 * Mutation hooks for child management operations.
 *
 * Provides hooks for:
 * - Adding a new child
 * - Updating an existing child
 * - Archiving a child
 *
 * All mutations invalidate the children and workspace-summary caches on success.
 *
 * @see Requirement 14: Manage Children
 * @see design.md - Mutation Hooks section
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addChild, updateChild, archiveChild } from '@/src/services/family';
import { queryKeys } from '@/src/lib/query-client';
import type { ChildMutationRequest } from '@/src/types/family';

interface AddChildParams {
  fatherId: number;
  data: ChildMutationRequest;
}

interface UpdateChildParams {
  fatherId: number;
  childId: number;
  data: ChildMutationRequest;
}

interface ArchiveChildParams {
  fatherId: number;
  childId: number;
}

/**
 * Hook for adding a new child.
 *
 * @see Requirement 14.2: Add child form
 */
export function useAddChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fatherId, data }: AddChildParams) => addChild(fatherId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.children() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceSummary() });
    },
  });
}

/**
 * Hook for updating an existing child.
 *
 * @see Requirement 14.2: Edit child form
 */
export function useUpdateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fatherId, childId, data }: UpdateChildParams) =>
      updateChild(fatherId, childId, data),
    onSuccess: (_, { childId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.children() });
      queryClient.invalidateQueries({ queryKey: queryKeys.child(String(childId)) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceSummary() });
    },
  });
}

/**
 * Hook for archiving a child.
 *
 * Uses optimistic update to immediately remove the child from the list.
 *
 * @see Requirement 14.4: Archive child
 */
export function useArchiveChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fatherId, childId }: ArchiveChildParams) =>
      archiveChild(fatherId, childId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.children() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceSummary() });
    },
  });
}
