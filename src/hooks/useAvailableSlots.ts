'use client';

/**
 * Hook for fetching available time slots for Quality Time scheduling.
 *
 * Wraps the getAvailableSlots service with TanStack Query caching.
 * Slots change frequently (calendar updates, time passing), so stale time is short.
 *
 * @see Requirement 13.4: Frontend displays available slots from backend
 * @see design.md - Hook Layer section
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getAvailableSlots } from '@/src/services/qualityTime';

export interface UseAvailableSlotsOptions {
  /** Number of days ahead to look for available slots (default: 7) */
  daysAhead?: number;
  /** Minimum slot duration in minutes (default: 30) */
  minDuration?: number;
  /** Whether the query is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Fetches available time slots for scheduling Quality Time.
 *
 * @param options - Configuration for the query
 * @returns TanStack Query result with AvailableSlotsResponse data
 *
 * @example
 * ```tsx
 * // Basic usage with defaults (7 days ahead, 30 min minimum)
 * const { data, isLoading, error } = useAvailableSlots();
 *
 * // Custom parameters
 * const { data } = useAvailableSlots({ daysAhead: 14, minDuration: 60 });
 *
 * // Conditional fetching
 * const { data } = useAvailableSlots({ enabled: isSchedulingOpen });
 * ```
 */
export function useAvailableSlots(options: UseAvailableSlotsOptions = {}) {
  const { daysAhead = 7, minDuration = 30, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.availableSlots(daysAhead, minDuration),
    queryFn: ({ signal }) => getAvailableSlots(daysAhead, minDuration, signal),
    staleTime: STALE_TIMES.AVAILABLE_SLOTS,
    enabled,
  });
}
