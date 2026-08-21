import { describe, it, expect } from 'vitest';
import {
  formatIsraelDate,
  formatIsraelTime,
  formatIsraelDateTime,
  getIsraelTimezoneOffset,
  ISRAEL_TIMEZONE,
} from '@/src/utils/timezone';

describe('timezone', () => {
  describe('ISRAEL_TIMEZONE', () => {
    it('should be the correct IANA timezone identifier', () => {
      expect(ISRAEL_TIMEZONE).toBe('Asia/Jerusalem');
    });
  });

  describe('formatIsraelDate', () => {
    it('formats a UTC timestamp to DD/MM/YYYY in Israel timezone', () => {
      // 15th January 2025, 10:30 UTC should be 15/01/2025 in Israel
      const result = formatIsraelDate('2025-01-15T10:30:00Z');
      expect(result).toBe('15/01/2025');
    });

    it('handles date rollover correctly (UTC midnight becomes next day in Israel)', () => {
      // 20th July 2025, 22:00 UTC is 21st July 01:00 in Israel (UTC+3 DST)
      const result = formatIsraelDate('2025-07-20T22:00:00Z');
      expect(result).toBe('21/07/2025');
    });

    it('formats dates with timezone offset correctly', () => {
      // Timestamp with explicit offset should be handled
      const result = formatIsraelDate('2025-03-15T12:00:00+02:00');
      expect(result).toBe('15/03/2025');
    });

    it('handles end of year correctly', () => {
      // 31st December 2025, 23:00 UTC is 1st January 01:00 in Israel (UTC+2)
      const result = formatIsraelDate('2025-12-31T23:00:00Z');
      expect(result).toBe('01/01/2026');
    });

    it('handles leap year dates', () => {
      const result = formatIsraelDate('2024-02-29T12:00:00Z');
      expect(result).toBe('29/02/2024');
    });
  });

  describe('formatIsraelTime', () => {
    it('formats a UTC timestamp to HH:mm:ss in Israel timezone (winter)', () => {
      // January is winter in Israel (UTC+2)
      // 10:30:00 UTC becomes 12:30:00 in Israel
      const result = formatIsraelTime('2025-01-15T10:30:00Z');
      expect(result).toBe('12:30:00');
    });

    it('formats a UTC timestamp to HH:mm:ss in Israel timezone (summer DST)', () => {
      // July is summer in Israel (UTC+3 with DST)
      // 10:30:00 UTC becomes 13:30:00 in Israel
      const result = formatIsraelTime('2025-07-15T10:30:00Z');
      expect(result).toBe('13:30:00');
    });

    it('handles midnight UTC correctly', () => {
      // 00:00:00 UTC in winter becomes 02:00:00 in Israel
      const result = formatIsraelTime('2025-01-15T00:00:00Z');
      expect(result).toBe('02:00:00');
    });

    it('handles seconds correctly', () => {
      const result = formatIsraelTime('2025-01-15T10:30:45Z');
      expect(result).toBe('12:30:45');
    });

    it('uses 24-hour format', () => {
      // 20:30 UTC in winter becomes 22:30 in Israel
      const result = formatIsraelTime('2025-01-15T20:30:00Z');
      expect(result).toBe('22:30:00');
    });

    it('includes leading zeros', () => {
      // 06:05:04 UTC becomes 08:05:04 in Israel (winter)
      const result = formatIsraelTime('2025-01-15T06:05:04Z');
      expect(result).toBe('08:05:04');
    });
  });

  describe('formatIsraelDateTime', () => {
    it('combines date and time in the correct format', () => {
      const result = formatIsraelDateTime('2025-01-15T10:30:00Z');
      expect(result).toBe('15/01/2025 12:30:00');
    });

    it('handles DST correctly', () => {
      // Summer time (UTC+3)
      const result = formatIsraelDateTime('2025-07-15T10:30:00Z');
      expect(result).toBe('15/07/2025 13:30:00');
    });

    it('handles date rollover at midnight', () => {
      // 22:00 UTC on July 20th becomes 01:00 on July 21st in Israel
      const result = formatIsraelDateTime('2025-07-20T22:00:00Z');
      expect(result).toBe('21/07/2025 01:00:00');
    });
  });

  describe('getIsraelTimezoneOffset', () => {
    it('returns +02:00 for winter dates (standard time)', () => {
      const result = getIsraelTimezoneOffset('2025-01-15T12:00:00Z');
      expect(result).toBe('+02:00');
    });

    it('returns +03:00 for summer dates (daylight saving time)', () => {
      const result = getIsraelTimezoneOffset('2025-07-15T12:00:00Z');
      expect(result).toBe('+03:00');
    });

    it('handles DST transition dates correctly', () => {
      // Israel typically transitions to DST in late March
      // Testing a date well within summer to ensure DST is active
      const summerResult = getIsraelTimezoneOffset('2025-06-01T12:00:00Z');
      expect(summerResult).toBe('+03:00');

      // Testing a date well within winter to ensure standard time
      const winterResult = getIsraelTimezoneOffset('2025-12-01T12:00:00Z');
      expect(winterResult).toBe('+02:00');
    });

    it('returns current offset when no timestamp provided', () => {
      const result = getIsraelTimezoneOffset();
      // Should be either +02:00 or +03:00 depending on current date
      expect(result).toMatch(/^\+0[23]:00$/);
    });
  });

  describe('Property: Timezone Conversion Correctness', () => {
    /**
     * Validates: Requirements 10.1
     *
     * For any UTC timestamp, when displayed in the Dev Dashboard frontend,
     * the timestamp SHALL be converted to Israel timezone (Asia/Jerusalem)
     * with correct offset handling for both standard time (UTC+2) and
     * daylight saving time (UTC+3).
     */
    it('correctly handles UTC+2 offset in winter', () => {
      // Winter: UTC+2
      const winterTimestamp = '2025-01-15T08:00:00Z';
      const time = formatIsraelTime(winterTimestamp);

      // 08:00 UTC + 2 hours = 10:00 Israel time
      expect(time).toBe('10:00:00');
    });

    it('correctly handles UTC+3 offset in summer', () => {
      // Summer: UTC+3 (DST)
      const summerTimestamp = '2025-07-15T08:00:00Z';
      const time = formatIsraelTime(summerTimestamp);

      // 08:00 UTC + 3 hours = 11:00 Israel time
      expect(time).toBe('11:00:00');
    });
  });

  describe('Property: Display Formatting Consistency', () => {
    /**
     * Validates: Requirements 10.2, 10.3
     *
     * For any date displayed in the Dev Dashboard, the format SHALL match
     * DD/MM/YYYY (two-digit day, two-digit month, four-digit year).
     * For any time displayed, the format SHALL match HH:mm:ss
     * (24-hour format with leading zeros).
     */
    it('date format matches DD/MM/YYYY pattern', () => {
      const timestamps = [
        '2025-01-01T00:00:00Z',
        '2025-12-31T23:59:59Z',
        '2025-06-15T12:00:00Z',
        '2024-02-29T08:30:00Z', // leap year
      ];

      const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;

      for (const timestamp of timestamps) {
        const result = formatIsraelDate(timestamp);
        expect(result).toMatch(datePattern);
      }
    });

    it('time format matches HH:mm:ss pattern', () => {
      const timestamps = [
        '2025-01-01T00:00:00Z',
        '2025-01-01T23:59:59Z',
        '2025-01-01T12:30:45Z',
        '2025-01-01T06:05:04Z',
      ];

      const timePattern = /^\d{2}:\d{2}:\d{2}$/;

      for (const timestamp of timestamps) {
        const result = formatIsraelTime(timestamp);
        expect(result).toMatch(timePattern);
      }
    });

    it('datetime combines both formats correctly', () => {
      const timestamp = '2025-06-15T14:30:45Z';
      const result = formatIsraelDateTime(timestamp);

      // Should match "DD/MM/YYYY HH:mm:ss" pattern
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);
    });
  });
});
