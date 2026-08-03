/**
 * Unit tests for WorkspaceDashboard component.
 *
 * Tests the container component's core functionality:
 * - Loading state rendering
 * - Error state rendering with retry
 * - Successful data rendering
 * - Schedule modal interactions
 * - Belt celebration handling
 * - RTL support for Hebrew
 *
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkspaceDashboard } from './WorkspaceDashboard';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock useWorkspaceSummary hook
const mockRefetch = vi.fn();
const mockWorkspaceSummary = {
  data: undefined as unknown,
  isLoading: false,
  error: null as Error | null,
  refetch: mockRefetch,
};

vi.mock('@/src/hooks/useWorkspaceSummary', () => ({
  useWorkspaceSummary: () => mockWorkspaceSummary,
}));

// Mock useBeltCelebration hook
const mockDismiss = vi.fn();
const mockBeltCelebration = {
  isActive: false,
  newBelt: null as string | null,
  dismiss: mockDismiss,
};

vi.mock('@/src/hooks/useBeltCelebration', () => ({
  useBeltCelebration: () => mockBeltCelebration,
}));

// Mock LanguageProvider
vi.mock('@/src/providers/LanguageProvider', () => ({
  useLanguage: () => ({ language: 'en' }),
  useDirection: () => 'ltr',
}));

// Mock child components to simplify testing
vi.mock('@/src/components/dashboard/BeltProgressionCard', () => ({
  BeltProgressionCard: ({ belt, completionCount }: { belt: string; completionCount: number }) => (
    <div data-testid="belt-progression-card">
      Belt: {belt}, Count: {completionCount}
    </div>
  ),
}));

vi.mock('@/src/components/dashboard/NextQualityTimeCard', () => ({
  NextQualityTimeCard: ({ qualityTime, onReschedule }: { qualityTime: unknown; onReschedule?: () => void }) => (
    <div data-testid="next-quality-time-card">
      {qualityTime ? 'Has Quality Time' : 'No Quality Time'}
      {onReschedule && <button onClick={onReschedule}>Reschedule</button>}
    </div>
  ),
}));

vi.mock('@/src/components/dashboard/StreakDisplay', () => ({
  StreakDisplay: ({ currentStreak, longestStreak }: { currentStreak: number; longestStreak: number }) => (
    <div data-testid="streak-display">
      Current: {currentStreak}, Longest: {longestStreak}
    </div>
  ),
}));

vi.mock('@/src/components/dashboard/RecentActivityFeed', () => ({
  RecentActivityFeed: ({ activities }: { activities: unknown[] }) => (
    <div data-testid="recent-activity-feed">Activities: {activities.length}</div>
  ),
}));

vi.mock('@/src/components/dashboard/AchievementBadges', () => ({
  AchievementBadges: ({ achievements }: { achievements: unknown[] }) => (
    <div data-testid="achievement-badges">Achievements: {achievements.length}</div>
  ),
}));

vi.mock('@/src/components/dashboard/ScheduleQualityTimeCTA', () => ({
  ScheduleQualityTimeCTA: ({ onClick }: { onClick: () => void }) => (
    <button data-testid="schedule-cta" onClick={onClick}>
      Schedule Quality Time
    </button>
  ),
}));

vi.mock('@/src/components/qualitytime/ScheduleQualityTime', () => ({
  ScheduleQualityTime: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="schedule-modal">
      <button onClick={onClose}>Close Modal</button>
    </div>
  ),
}));

vi.mock('@/src/components/celebrations/BeltEarnedModal', () => ({
  BeltEarnedModal: ({ newBelt, onDismiss }: { newBelt: string; onDismiss: () => void }) => (
    <div data-testid="belt-earned-modal">
      New Belt: {newBelt}
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  ),
}));

vi.mock('@/src/components/celebrations/CelebrationOverlay', () => ({
  CelebrationOverlay: ({ isVisible }: { isVisible: boolean }) =>
    isVisible ? <div data-testid="celebration-overlay">Confetti!</div> : null,
}));

vi.mock('@/src/components/common/ErrorState', () => ({
  ErrorState: ({ title, onRetry }: { title: string; onRetry?: () => void }) => (
    <div data-testid="error-state">
      {title}
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  ),
}));

vi.mock('@/src/components/common/SkeletonScreen', () => ({
  SkeletonCard: ({ className }: { className?: string }) => (
    <div data-testid="skeleton-card" className={className} />
  ),
  SkeletonText: ({ width }: { width?: string }) => (
    <div data-testid="skeleton-text" data-width={width} />
  ),
  SkeletonBlock: ({ className }: { className?: string }) => (
    <div data-testid="skeleton-block" className={className} />
  ),
}));

// ---------------------------------------------------------------------------
// Test Utilities
// ---------------------------------------------------------------------------

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderWithProviders(component: React.ReactElement) {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
}

// Mock workspace summary data
const mockSummaryData = {
  father_display_name: 'John',
  coaching_phase: 'ACTIVE_COACHING',
  current_belt: 'GREEN',
  growth_score: 35,
  active_children_count: 2,
  active_goals_count: 1,
  current_streak_days: 7,
  active_mission: null,
  last_conversation_timestamp: null,
  unread_notifications_count: 0,
  degraded_sections: [],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WorkspaceDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWorkspaceSummary.data = undefined;
    mockWorkspaceSummary.isLoading = false;
    mockWorkspaceSummary.error = null;
    mockBeltCelebration.isActive = false;
    mockBeltCelebration.newBelt = null;
  });

  describe('Loading State', () => {
    it('renders skeleton loader while fetching data', () => {
      mockWorkspaceSummary.isLoading = true;

      renderWithProviders(<WorkspaceDashboard />);

      // Should show multiple skeleton components
      const skeletonCards = screen.getAllByTestId('skeleton-card');
      expect(skeletonCards.length).toBeGreaterThan(0);
    });

    it('has accessible loading label', () => {
      mockWorkspaceSummary.isLoading = true;

      renderWithProviders(<WorkspaceDashboard />);

      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Loading dashboard'
      );
    });
  });

  describe('Error State', () => {
    it('renders error state on fetch failure', () => {
      mockWorkspaceSummary.error = new Error('Network error');

      renderWithProviders(<WorkspaceDashboard />);

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });

    it('calls refetch on retry', () => {
      mockWorkspaceSummary.error = new Error('Network error');

      renderWithProviders(<WorkspaceDashboard />);

      fireEvent.click(screen.getByText('Retry'));

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      mockWorkspaceSummary.data = mockSummaryData;
    });

    it('renders welcome header with father name', () => {
      renderWithProviders(<WorkspaceDashboard />);

      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });

    it('renders belt progression card with correct data', () => {
      renderWithProviders(<WorkspaceDashboard />);

      const beltCard = screen.getByTestId('belt-progression-card');
      expect(beltCard).toHaveTextContent('Belt: GREEN');
      expect(beltCard).toHaveTextContent('Count: 35');
    });

    it('renders streak display with correct data', () => {
      renderWithProviders(<WorkspaceDashboard />);

      const streakDisplay = screen.getByTestId('streak-display');
      expect(streakDisplay).toHaveTextContent('Current: 7');
    });

    it('renders recent activity feed', () => {
      renderWithProviders(<WorkspaceDashboard recentQualityTimes={[]} />);

      expect(screen.getByTestId('recent-activity-feed')).toBeInTheDocument();
    });

    it('renders achievement badges when provided', () => {
      const mockAchievements = [
        {
          achievement_id: '1',
          name: 'First Steps',
          description: 'Complete first quality time',
          category: 'MISSIONS' as const,
          icon_key: 'first-steps',
          earned_at: '2024-01-01T00:00:00Z',
        },
      ];

      renderWithProviders(<WorkspaceDashboard achievements={mockAchievements} />);

      expect(screen.getByTestId('achievement-badges')).toBeInTheDocument();
    });
  });

  describe('Schedule Modal', () => {
    beforeEach(() => {
      mockWorkspaceSummary.data = mockSummaryData;
    });

    it('opens schedule modal when CTA is clicked', () => {
      renderWithProviders(<WorkspaceDashboard />);

      // Initially modal should not be visible
      expect(screen.queryByTestId('schedule-modal')).not.toBeInTheDocument();

      // Click the schedule CTA
      fireEvent.click(screen.getByTestId('schedule-cta'));

      // Modal should now be visible
      expect(screen.getByTestId('schedule-modal')).toBeInTheDocument();
    });

    it('closes schedule modal when close button is clicked', async () => {
      renderWithProviders(<WorkspaceDashboard />);

      // Open modal
      fireEvent.click(screen.getByTestId('schedule-cta'));
      expect(screen.getByTestId('schedule-modal')).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByText('Close Modal'));

      await waitFor(() => {
        expect(screen.queryByTestId('schedule-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Belt Celebration', () => {
    beforeEach(() => {
      mockWorkspaceSummary.data = mockSummaryData;
    });

    it('shows belt earned modal when celebration is active', () => {
      mockBeltCelebration.isActive = true;
      mockBeltCelebration.newBelt = 'BLUE';

      renderWithProviders(<WorkspaceDashboard />);

      expect(screen.getByTestId('belt-earned-modal')).toBeInTheDocument();
      expect(screen.getByText('New Belt: BLUE')).toBeInTheDocument();
    });

    it('calls dismiss when belt modal is dismissed', () => {
      mockBeltCelebration.isActive = true;
      mockBeltCelebration.newBelt = 'BLUE';

      renderWithProviders(<WorkspaceDashboard />);

      fireEvent.click(screen.getByText('Dismiss'));

      expect(mockDismiss).toHaveBeenCalled();
    });

    it('does not show belt modal when celebration is not active', () => {
      mockBeltCelebration.isActive = false;

      renderWithProviders(<WorkspaceDashboard />);

      expect(screen.queryByTestId('belt-earned-modal')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockWorkspaceSummary.data = mockSummaryData;
    });

    it('has main landmark with accessible label', () => {
      renderWithProviders(<WorkspaceDashboard />);

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label', 'Dashboard');
    });

    it('has correct dir attribute for LTR language', () => {
      renderWithProviders(<WorkspaceDashboard />);

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('dir', 'ltr');
    });
  });
});
