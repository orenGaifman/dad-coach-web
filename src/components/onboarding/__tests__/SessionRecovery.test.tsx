import { render, screen, fireEvent, renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

// Mock api-client and services
const mockGetSession = vi.fn();
vi.mock('@/src/services/onboarding', () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
}));

vi.mock('@/src/lib/api-client', () => {
  class ApiError extends Error {
    status: number;
    body: Record<string, unknown>;
    constructor(status: number, body: Record<string, unknown>) {
      super('API Error');
      this.name = 'ApiError';
      this.status = status;
      this.body = body;
    }
  }
  return { ApiError };
});

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import SessionExpired from '@/src/components/onboarding/SessionExpired';
import InvitationRevoked from '@/src/components/onboarding/InvitationRevoked';
import OfflineBanner from '@/src/components/onboarding/OfflineBanner';
import { useSessionRestore } from '@/src/hooks/useSessionRestore';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { ApiError } from '@/src/lib/api-client';

// ---------------------------------------------------------------------------
// SessionExpired
// ---------------------------------------------------------------------------

describe('SessionExpired', () => {
  it('renders heading and message', () => {
    render(<SessionExpired onStartAgain={vi.fn()} />);
    expect(screen.getByText('Your session has expired')).toBeInTheDocument();
    expect(screen.getByText(/invitation is still valid/)).toBeInTheDocument();
  });

  it('renders Start Again button that calls onStartAgain', () => {
    const mockFn = vi.fn();
    render(<SessionExpired onStartAgain={mockFn} />);
    fireEvent.click(screen.getByText('Start Again'));
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('renders the session-expired illustration', () => {
    render(<SessionExpired onStartAgain={vi.fn()} />);
    expect(screen.getByAltText('Session expired')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// InvitationRevoked
// ---------------------------------------------------------------------------

describe('InvitationRevoked', () => {
  it('renders heading and message', () => {
    render(<InvitationRevoked />);
    expect(screen.getByText('Invitation No Longer Available')).toBeInTheDocument();
    expect(screen.getByText(/no longer available/)).toBeInTheDocument();
  });

  it('does not render any action button', () => {
    render(<InvitationRevoked />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// OfflineBanner
// ---------------------------------------------------------------------------

describe('OfflineBanner', () => {
  it('renders when isVisible is true', () => {
    render(<OfflineBanner isVisible={true} />);
    expect(screen.getByText(/You're offline/)).toBeInTheDocument();
  });

  it('does not render when isVisible is false', () => {
    render(<OfflineBanner isVisible={false} />);
    expect(screen.queryByText(/You're offline/)).not.toBeInTheDocument();
  });

  it('has alert role for accessibility', () => {
    render(<OfflineBanner isVisible={true} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// useSessionRestore
// ---------------------------------------------------------------------------

describe('useSessionRestore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isRestoring=false and null state when sessionId is null', async () => {
    const { result } = renderHook(() => useSessionRestore(null));

    await waitFor(() => {
      expect(result.current.isRestoring).toBe(false);
    });
    expect(result.current.restoredState).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('restores session state when IN_PROGRESS', async () => {
    const mockSession = {
      session_id: 'sess-1',
      current_step: 'GOALS',
      completed_steps: ['LANGUAGE', 'FATHER_PROFILE'],
      language: 'en',
      status: 'IN_PROGRESS',
      data: {},
    };
    mockGetSession.mockResolvedValue(mockSession);

    const { result } = renderHook(() => useSessionRestore('sess-1'));

    await waitFor(() => {
      expect(result.current.isRestoring).toBe(false);
    });
    expect(result.current.restoredState).toEqual(mockSession);
    expect(result.current.error).toBeNull();
  });

  it('returns expired error on 403', async () => {
    mockGetSession.mockRejectedValue(new ApiError(403, { message: 'Session expired' }));

    const { result } = renderHook(() => useSessionRestore('sess-expired'));

    await waitFor(() => {
      expect(result.current.isRestoring).toBe(false);
    });
    expect(result.current.error).toBe('expired');
    expect(result.current.restoredState).toBeNull();
  });

  it('returns not_found error on 404', async () => {
    mockGetSession.mockRejectedValue(new ApiError(404, { message: 'Not found' }));

    const { result } = renderHook(() => useSessionRestore('sess-missing'));

    await waitFor(() => {
      expect(result.current.isRestoring).toBe(false);
    });
    expect(result.current.error).toBe('not_found');
    expect(result.current.restoredState).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// useNetworkStatus
// ---------------------------------------------------------------------------

describe('useNetworkStatus', () => {
  it('returns isOnline=true by default', () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
  });

  it('updates to offline when offline event fires', async () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it('updates to online when online event fires', async () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isOnline).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOnline).toBe(true);
  });
});
