/**
 * Israel timezone utility functions for timestamp conversion and display.
 *
 * All functions convert ISO 8601 timestamps to Israel timezone (Asia/Jerusalem).
 * The timezone automatically handles daylight saving time (UTC+2 in winter, UTC+3 in summer).
 *
 * Uses the built-in Intl.DateTimeFormat API for proper timezone handling.
 *
 * @see Requirements 10.1, 10.2, 10.3
 */

/** Israel timezone identifier (IANA timezone database) */
export const ISRAEL_TIMEZONE = 'Asia/Jerusalem';

/**
 * Formats an ISO 8601 timestamp to DD/MM/YYYY format in Israel timezone.
 *
 * @param timestamp - ISO 8601 formatted timestamp string (e.g., "2025-01-15T10:30:00Z")
 * @returns Date string in DD/MM/YYYY format (e.g., "15/01/2025")
 *
 * @example
 * formatIsraelDate("2025-01-15T10:30:00Z") // "15/01/2025"
 * formatIsraelDate("2025-07-20T22:00:00Z") // "21/07/2025" (after midnight in Israel during DST)
 */
export function formatIsraelDate(timestamp: string): string {
  const date = new Date(timestamp);

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: ISRAEL_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // en-GB locale returns DD/MM/YYYY format which matches Israeli date conventions
  return formatter.format(date);
}

/**
 * Formats an ISO 8601 timestamp to HH:mm:ss format in Israel timezone.
 *
 * Uses 24-hour format with leading zeros for consistency.
 *
 * @param timestamp - ISO 8601 formatted timestamp string (e.g., "2025-01-15T10:30:00Z")
 * @returns Time string in HH:mm:ss format (e.g., "12:30:00")
 *
 * @example
 * formatIsraelTime("2025-01-15T10:30:00Z") // "12:30:00" (UTC+2 in winter)
 * formatIsraelTime("2025-07-15T10:30:00Z") // "13:30:00" (UTC+3 in summer DST)
 */
export function formatIsraelTime(timestamp: string): string {
  const date = new Date(timestamp);

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: ISRAEL_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // en-GB with hour12: false returns HH:mm:ss format
  return formatter.format(date);
}

/**
 * Formats an ISO 8601 timestamp to a combined date and time format in Israel timezone.
 *
 * Returns "DD/MM/YYYY HH:mm:ss" format combining date and time.
 *
 * @param timestamp - ISO 8601 formatted timestamp string (e.g., "2025-01-15T10:30:00Z")
 * @returns Combined datetime string (e.g., "15/01/2025 12:30:00")
 *
 * @example
 * formatIsraelDateTime("2025-01-15T10:30:00Z") // "15/01/2025 12:30:00"
 * formatIsraelDateTime("2025-07-15T10:30:00Z") // "15/07/2025 13:30:00"
 */
export function formatIsraelDateTime(timestamp: string): string {
  return `${formatIsraelDate(timestamp)} ${formatIsraelTime(timestamp)}`;
}

/**
 * Gets the current UTC offset for Israel timezone (e.g., "+02:00" or "+03:00").
 *
 * Israel observes daylight saving time:
 * - Winter (standard time): UTC+2
 * - Summer (daylight saving): UTC+3
 *
 * @param timestamp - Optional ISO 8601 timestamp to check offset for (defaults to current time)
 * @returns UTC offset string (e.g., "+02:00" or "+03:00")
 *
 * @example
 * getIsraelTimezoneOffset("2025-01-15T12:00:00Z") // "+02:00" (winter)
 * getIsraelTimezoneOffset("2025-07-15T12:00:00Z") // "+03:00" (summer DST)
 */
export function getIsraelTimezoneOffset(timestamp?: string): string {
  const date = timestamp ? new Date(timestamp) : new Date();

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: ISRAEL_TIMEZONE,
    timeZoneName: 'longOffset',
  });

  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find((p) => p.type === 'timeZoneName');

  // The offset format from longOffset is like "GMT+02:00" or "GMT+03:00"
  // We extract just the offset portion
  if (offsetPart?.value) {
    const match = offsetPart.value.match(/GMT([+-]\d{2}:\d{2})/);
    if (match) {
      return match[1];
    }
  }

  // Fallback: calculate offset manually if the above doesn't work
  // This should rarely happen with modern browsers
  const utcTime = date.getTime();
  const israelTime = new Date(
    date.toLocaleString('en-US', { timeZone: ISRAEL_TIMEZONE })
  ).getTime();
  const offsetMinutes = (israelTime - utcTime) / 60000;
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  const sign = offsetMinutes >= 0 ? '+' : '-';

  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
