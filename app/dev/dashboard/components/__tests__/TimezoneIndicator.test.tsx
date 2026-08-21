import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockGetIsraelTimezoneOffset = vi.fn();
vi.mock('@/src/utils/timezone', () => ({
  ISRAEL_TIMEZONE: 'Asia/Jerusalem',
  getIsraelTimezoneOffset: () => mockGetIsraelTimezoneOffset(),
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { TimezoneIndicator } from '../TimezoneIndicator';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TimezoneIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Validates: Requirement 10.4
   * THE Dev_Dashboard SHALL include a visual indicator showing the current timezone being used
   */
  it('displays Asia/Jerusalem timezone with offset', async () => {
    mockGetIsraelTimezoneOffset.mockReturnValue('+02:00');

    render(<TimezoneIndicator />);

    await waitFor(() => {
      expect(screen.getByText(/Asia\/Jerusalem/)).toBeInTheDocument();
      expect(screen.getByText(/\(UTC\+02:00\)/)).toBeInTheDocument();
    });
  });

  it('displays summer DST offset correctly', async () => {
    mockGetIsraelTimezoneOffset.mockReturnValue('+03:00');

    render(<TimezoneIndicator />);

    await waitFor(() => {
      expect(screen.getByText(/Asia\/Jerusalem/)).toBeInTheDocument();
      expect(screen.getByText(/\(UTC\+03:00\)/)).toBeInTheDocument();
    });
  });

  /**
   * Validates: Requirement 10.5
   * IF the timezone indicator fails to load, THEN THE Dev_Dashboard SHALL prevent
   * timestamp display and show an error message indicating timezone information is unavailable
   */
  it('displays error message when timezone info returns empty', async () => {
    mockGetIsraelTimezoneOffset.mockReturnValue('');

    render(<TimezoneIndicator />);

    await waitFor(() => {
      expect(screen.getByText('Timezone information unavailable')).toBeInTheDocument();
    });
  });

  it('displays error message when timezone info returns null', async () => {
    mockGetIsraelTimezoneOffset.mockReturnValue(null);

    render(<TimezoneIndicator />);

    await waitFor(() => {
      expect(screen.getByText('Timezone information unavailable')).toBeInTheDocument();
    });
  });

  it('displays error message when getIsraelTimezoneOffset throws', async () => {
    mockGetIsraelTimezoneOffset.mockImplementation(() => {
      throw new Error('Timezone API error');
    });

    render(<TimezoneIndicator />);

    await waitFor(() => {
      expect(screen.getByText('Timezone information unavailable')).toBeInTheDocument();
    });
  });

  it('includes a clock icon for visual indication', async () => {
    mockGetIsraelTimezoneOffset.mockReturnValue('+02:00');

    render(<TimezoneIndicator />);

    await waitFor(() => {
      // The SVG should be present with the clock path
      const svgElement = document.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });
  });
});
