'use client';

/**
 * Hook for fetching the workspace summary dashboard data.
 *
 * Wraps the getWorkspaceSummary service with TanStack Query caching.
 *
 * @see Requirement 1.1: Workspace Summary Dashboard
 * @see design.md - Hook Layer section
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getWorkspaceSummary } from '@/src/services/workspace';

export function useWorkspaceSummary() {
  return useQuery({
    queryKey: queryKeys.workspaceSummary(),
    queryFn: ({ signal }) => getWorkspaceSummary(signal),
    staleTime: STALE_TIMES.WORKSPACE_SUMMARY,
    refetchOnWindowFocus: true, // Workspace summary refreshes on window focus
  });
}
