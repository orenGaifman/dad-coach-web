'use client';

/**
 * Hooks for fetching Google Calendar data.
 *
 * Wraps the calendar service with TanStack Query caching.
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/src/lib/query-client';
import { getCalendarStatus, getCalendarEvents } from '@/src/services/calendar';

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/**
 * Fetch calendar connection status for a father.
 */
export function useCalendarStatus(fatherId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.calendarStatus(fatherId ?? 0),
    queryFn: ({ signal }) => getCalendarStatus(fatherId!, signal),
    enabled: !!fatherId,
    staleTime: STALE_TIMES.CALENDAR,
  });
}

/**
 * Fetch upcoming calendar events for a father.
 * 
 * @param fatherId - The father's ID
 * @param days - Number of days ahead to fetch (default: 7)
 * @param allEvents - If true, return all events, not just Dad Coach related
 */
export function useCalendarEvents(
  fatherId: number | undefined,
  days: number = 7,
  allEvents: boolean = false
) {
  return useQuery({
    queryKey: queryKeys.calendarEvents(fatherId ?? 0, days, allEvents),
    queryFn: ({ signal }) => getCalendarEvents(fatherId!, days, allEvents, signal),
    enabled: !!fatherId,
    staleTime: STALE_TIMES.CALENDAR,
  });
}
