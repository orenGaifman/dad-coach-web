/**
 * Calendar API service layer.
 *
 * Wraps Google Calendar endpoints using the shared apiClient.
 */

import { apiClient } from '@/src/lib/api-client';
import type {
  CalendarEventsResponse,
  CalendarStatusResponse,
} from '@/src/types/calendar';

// ---------------------------------------------------------------------------
// Get Calendar Status
// ---------------------------------------------------------------------------

/**
 * Fetch the calendar connection status for a father.
 * GET /api/v1/calendar/status/{fatherId}
 */
export async function getCalendarStatus(
  fatherId: number,
  signal?: AbortSignal
): Promise<CalendarStatusResponse> {
  return apiClient.get<CalendarStatusResponse>(`/calendar/status/${fatherId}`, { signal });
}

// ---------------------------------------------------------------------------
// Get Calendar Events
// ---------------------------------------------------------------------------

/**
 * Fetch upcoming events from the father's Google Calendar.
 * GET /api/v1/calendar/events/{fatherId}
 * 
 * @param fatherId - The father's ID
 * @param days - Number of days ahead to fetch (default: 7)
 * @param allEvents - If true, return all events, not just Dad Coach related
 * @param signal - AbortSignal for cancellation
 */
export async function getCalendarEvents(
  fatherId: number,
  days: number = 7,
  allEvents: boolean = false,
  signal?: AbortSignal
): Promise<CalendarEventsResponse> {
  return apiClient.get<CalendarEventsResponse>(
    `/calendar/events/${fatherId}`,
    { days: String(days), allEvents: String(allEvents) },
    { signal }
  );
}
