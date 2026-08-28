/**
 * Types for Google Calendar integration.
 *
 * Represents calendar events synced from the father's Google Calendar
 * for display on the dashboard.
 */

/**
 * A single calendar event from Google Calendar.
 */
export interface CalendarEvent {
  eventId: string;
  title: string;
  description: string | null;
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  location: string | null;
}

/**
 * Response from GET /api/v1/calendar/events/{fatherId}
 */
export interface CalendarEventsResponse {
  connected: boolean;
  events: CalendarEvent[];
  error: string | null;
}

/**
 * Response from GET /api/v1/calendar/status/{fatherId}
 */
export interface CalendarStatusResponse {
  connected: boolean;
  connect_url: string;
}
