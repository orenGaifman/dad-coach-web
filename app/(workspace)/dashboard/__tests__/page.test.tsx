/**
 * Tests for Dashboard Home page
 *
 * Tests cover:
 * 1. Renders all sections with complete data
 * 2. Handles partial degradation (degraded_sections containing items)
 * 3. Renders empty state for new father (no active mission)
 * 4. Skeleton shows during load
 * 5. Error state with retry
 *
 * @see Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { WorkspaceSummaryResponse } from '@/src/types/workspace';
import type { DegradedSection } from '@/src/types/common';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockCompleteSummary: WorkspaceSummaryResponse = {
  response_status: 'OK',
  father_display_name: 'John',
  coaching_phase: 'ACTIVE_COACHING',
  current_belt: 'GREEN',
  growth_score: 1750,
  active_children_count: 2,
  active_goals_count: 3,
  current_streak_days: 5,
  active_mission: {
    mission_id: '123',
    title: 'Quality Time Challenge',
    category: 'QUALITY_TIME',
    child_name: 'Noah',
    days_remaining: 2,
    completed_steps: 2,
    total_steps: 5,
  },
  last_conversation_timestamp: '2024-01-15T10:30:00Z',
  unread_notifications_count: 3,
  degraded_sections: [],
};

const mockSummaryWithDegradedSections: WorkspaceSummaryResponse = {
  ...mockCompleteSummary,
  response_status: 'PARTIAL',
  degraded_sections: ['growth', 'streak'] as DegradedSection[],
};

const mockSummaryNewFather: WorkspaceSummaryResponse = {
  ...mockCompleteSummary,
  coaching_phase: 'ONBOARDING',
  active_mission: null,
  current_streak_days: 0,
  growth_score: 0,
  active_children_count: 0,
  active_goals_count: 0,
  last_conversation_timestamp: null,
  unread_notifications_count: 0,
};

// ---------------------------------------------------------------------------
// Mock useWorkspaceSummary hook
// ---------------------------------------------------------------------------

type MockHookResult = Pick<
  UseQueryResult<WorkspaceSummaryResponse, Error>,
  'data' | 'isLoading' | 'isError' | 'error' | 'refetch'
>;

let mockUseWorkspaceSummaryReturn: MockHookResult = {
  data: mockCompleteSummary,
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock('@/src/hooks/useWorkspaceSummary', () => ({
  useWorkspaceSummary: () => mockUseWorkspaceSummaryReturn,
}));

// Mock useCelebrations hook
vi.mock('@/src/hooks/useCelebrations', () => ({
  useCelebrations: () => ({
    data: { celebrations: [], has_undisplayed: false },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

// Mock usePageView hook (added in Phase 8)
vi.mock('@/src/hooks/usePageView', () => ({
  usePageView: () => {},
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import DashboardPage from '../page';

// ---------------------------------------------------------------------------
// Test Utilities
// ---------------------------------------------------------------------------

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to complete data by default
    mockUseWorkspaceSummaryReturn = {
      data: mockCompleteSummary,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };
  });

  // -------------------------------------------------------------------------
  // Test 1: Renders all sections with complete data
  // -------------------------------------------------------------------------

  describe('renders all sections with complete data', () => {
    it('displays greeting with father name', () => {
      renderWithProviders(<DashboardPage />);

      expect(screen.getByText(/Hey John!/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Keep going. You're making a real difference/i)
      ).toBeInTheDocument();
    });

    it('renders belt card with current belt', () => {
      renderWithProviders(<DashboardPage />);

      expect(screen.getByText('Your Belt')).toBeInTheDocument();
      expect(screen.getByText('Green Belt')).toBeInTheDocument();
      // Should show XP for non-BLACK belt
      expect(screen.getByText(/1,750 XP/)).toBeInTheDocument();
    });

    it('renders stats row with streak, score, and kids count', () => {
      renderWithProviders(<DashboardPage />);

      // Streak
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Streak')).toBeInTheDocument();

      // Score - 1750 will be displayed as 1.8k
      expect(screen.getByText(/1\.8k/)).toBeInTheDocument();
      expect(screen.getByText('Score')).toBeInTheDocument();

      // Kids count
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Kids')).toBeInTheDocument();
    });

    it('renders active mission card with mission details', () => {
      renderWithProviders(<DashboardPage />);

      expect(screen.getByText('Active Mission')).toBeInTheDocument();
      expect(screen.getByText('Quality Time Challenge')).toBeInTheDocument();
      expect(screen.getByText('Noah')).toBeInTheDocument();
      expect(screen.getByText(/2 days left/)).toBeInTheDocument();
      expect(screen.getByText('2/5 completed')).toBeInTheDocument();
    });

    it('renders quick actions grid', () => {
      renderWithProviders(<DashboardPage />);

      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Report Quality Time')).toBeInTheDocument();
      expect(screen.getByText('Report Positive Action')).toBeInTheDocument();
      expect(screen.getByText('Chat with Coach')).toBeInTheDocument();
      expect(screen.getByText('View Missions')).toBeInTheDocument();
    });

    it('renders last conversation timestamp when available', () => {
      renderWithProviders(<DashboardPage />);

      expect(screen.getByText(/Last coaching session:/)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Test 2: Handles partial degradation (degraded sections)
  // -------------------------------------------------------------------------

  describe('handles partial degradation', () => {
    beforeEach(() => {
      mockUseWorkspaceSummaryReturn = {
        data: mockSummaryWithDegradedSections,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };
    });

    it('displays degradation banner when sections are unavailable', () => {
      renderWithProviders(<DashboardPage />);

      expect(
        screen.getByText(/Some sections are temporarily unavailable/i)
      ).toBeInTheDocument();
    });

    it('still renders greeting and available sections', () => {
      renderWithProviders(<DashboardPage />);

      // Greeting should still appear
      expect(screen.getByText(/Hey John!/i)).toBeInTheDocument();

      // Quick actions should still be visible
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('shows skeleton/placeholder for degraded stats', () => {
      renderWithProviders(<DashboardPage />);

      // The stats row should still exist
      const statsRow = screen.getByRole('list', { name: 'Stats overview' });
      expect(statsRow).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Test 3: Renders empty state for new father
  // -------------------------------------------------------------------------

  describe('renders empty state for new father', () => {
    beforeEach(() => {
      mockUseWorkspaceSummaryReturn = {
        data: mockSummaryNewFather,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };
    });

    it('shows no active mission message', () => {
      renderWithProviders(<DashboardPage />);

      expect(screen.getByText('No active mission')).toBeInTheDocument();
      expect(
        screen.getByText(/Check Coaching for your next adventure/i)
      ).toBeInTheDocument();
    });

    it('displays zero stats for new father', () => {
      renderWithProviders(<DashboardPage />);

      // Streak should show 0
      const streakCard = screen.getByLabelText('0 day streak');
      expect(streakCard).toBeInTheDocument();

      // Kids count should show 0
      const kidsCard = screen.getByLabelText('0 kids');
      expect(kidsCard).toBeInTheDocument();
    });

    it('does not show last conversation when null', () => {
      renderWithProviders(<DashboardPage />);

      expect(
        screen.queryByText(/Last coaching session:/i)
      ).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Test 4: Skeleton shows during load
  // -------------------------------------------------------------------------

  describe('skeleton shows during load', () => {
    beforeEach(() => {
      mockUseWorkspaceSummaryReturn = {
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };
    });

    it('renders loading skeleton', () => {
      renderWithProviders(<DashboardPage />);

      // Should have loading aria-label
      expect(screen.getByLabelText('Loading dashboard')).toBeInTheDocument();
    });

    it('does not render data content while loading', () => {
      renderWithProviders(<DashboardPage />);

      // Father's name should not be visible
      expect(screen.queryByText(/Hey John!/i)).not.toBeInTheDocument();

      // Belt card content should not be visible
      expect(screen.queryByText('Your Belt')).not.toBeInTheDocument();

      // Mission card content should not be visible
      expect(screen.queryByText('Active Mission')).not.toBeInTheDocument();

      // Quick actions should not be visible
      expect(screen.queryByText('Quick Actions')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Test 5: Error state with retry
  // -------------------------------------------------------------------------

  describe('error state with retry', () => {
    const mockRefetch = vi.fn();

    beforeEach(() => {
      mockUseWorkspaceSummaryReturn = {
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Something went wrong'),
        refetch: mockRefetch,
      };
    });

    it('renders error state', () => {
      renderWithProviders(<DashboardPage />);

      // ErrorState shows "Something went wrong" title and "We hit a bump" description
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText(/We hit a bump/i)
      ).toBeInTheDocument();
    });

    it('shows retry button', () => {
      renderWithProviders(<DashboardPage />);

      // The retry button is labeled "Try again"
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('calls refetch when retry button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DashboardPage />);

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('shows network error message for network errors', () => {
      mockUseWorkspaceSummaryReturn = {
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        refetch: mockRefetch,
      };

      renderWithProviders(<DashboardPage />);

      // Network errors show "Connection problem" title and "having trouble connecting" description
      expect(screen.getByText('Connection problem')).toBeInTheDocument();
      expect(
        screen.getByText(/having trouble connecting/i)
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Test: BLACK belt mastery state
  // -------------------------------------------------------------------------

  describe('BLACK belt mastery state', () => {
    it('shows mastery message for BLACK belt', () => {
      mockUseWorkspaceSummaryReturn = {
        data: {
          ...mockCompleteSummary,
          current_belt: 'BLACK',
          growth_score: 5500,
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithProviders(<DashboardPage />);

      expect(screen.getByText('Black Belt')).toBeInTheDocument();
      expect(
        screen.getByText(/Dad Sensei - You've mastered it!/i)
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Test: All belt levels render correctly
  // -------------------------------------------------------------------------

  describe('all belt levels render correctly', () => {
    const beltLevels = [
      { level: 'WHITE', name: 'White Belt' },
      { level: 'YELLOW', name: 'Yellow Belt' },
      { level: 'ORANGE', name: 'Orange Belt' },
      { level: 'GREEN', name: 'Green Belt' },
      { level: 'BLUE', name: 'Blue Belt' },
      { level: 'PURPLE', name: 'Purple Belt' },
      { level: 'BROWN', name: 'Brown Belt' },
      { level: 'BLACK', name: 'Black Belt' },
    ] as const;

    it.each(beltLevels)(
      'renders $name correctly',
      ({ level, name }) => {
        mockUseWorkspaceSummaryReturn = {
          data: {
            ...mockCompleteSummary,
            current_belt: level,
          },
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        };

        renderWithProviders(<DashboardPage />);

        expect(screen.getByText(name)).toBeInTheDocument();
      }
    );
  });

  // -------------------------------------------------------------------------
  // Test: Mission days remaining singular/plural
  // -------------------------------------------------------------------------

  describe('mission days remaining text', () => {
    it('shows "day" for singular', () => {
      mockUseWorkspaceSummaryReturn = {
        data: {
          ...mockCompleteSummary,
          active_mission: {
            ...mockCompleteSummary.active_mission!,
            days_remaining: 1,
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithProviders(<DashboardPage />);

      expect(screen.getByText(/1 day left/)).toBeInTheDocument();
    });

    it('shows "days" for plural', () => {
      mockUseWorkspaceSummaryReturn = {
        data: {
          ...mockCompleteSummary,
          active_mission: {
            ...mockCompleteSummary.active_mission!,
            days_remaining: 3,
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithProviders(<DashboardPage />);

      expect(screen.getByText(/3 days left/)).toBeInTheDocument();
    });
  });
});
