'use client';

/**
 * TimezoneIndicator — displays the timezone used for timestamps in the Dev Dashboard.
 *
 * Shows the Israel timezone (Asia/Jerusalem) with the current UTC offset.
 * Displays an error message if timezone information is unavailable.
 *
 * @see Requirements 10.4, 10.5
 */

import { useState, useEffect } from 'react';
import {
  ISRAEL_TIMEZONE,
  getIsraelTimezoneOffset,
} from '@/src/utils/timezone';

interface TimezoneState {
  offset: string | null;
  error: string | null;
  loading: boolean;
}

export function TimezoneIndicator() {
  const [state, setState] = useState<TimezoneState>({
    offset: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    try {
      const offset = getIsraelTimezoneOffset();
      if (!offset) {
        setState({
          offset: null,
          error: 'Timezone information unavailable',
          loading: false,
        });
      } else {
        setState({
          offset,
          error: null,
          loading: false,
        });
      }
    } catch {
      setState({
        offset: null,
        error: 'Timezone information unavailable',
        loading: false,
      });
    }
  }, []);

  // Loading state
  if (state.loading) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <svg
          className="w-4 h-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Loading timezone...</span>
      </div>
    );
  }

  // Error state - requirement 10.5
  if (state.error) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-red-400">⚠️</span>
        <span className="text-red-300">{state.error}</span>
      </div>
    );
  }

  // Success state - requirement 10.4
  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-400">
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>
        {ISRAEL_TIMEZONE}{' '}
        <span className="text-gray-500">(UTC{state.offset})</span>
      </span>
    </div>
  );
}

export default TimezoneIndicator;
