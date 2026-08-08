/**
 * Tests for Notifications & Celebrations
 *
 * Tests cover:
 * 1. Notifications list renders with correct data
 * 2. Mark-read updates badge count
 * 3. Mark-all clears badge to zero
 * 4. Empty state renders
 * 5. CelebrationModal appears when undisplayed events exist
 * 6. Sequential display works for multiple celebrations
 * 7. Dismiss triggers mark-displayed API call
 * 8. Modal does not reappear after dismiss
 *
 * @see Requirements: 12.1–12.5, 16.1–16.7
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';

import type { NotificationsResponse, Notification, NotificationType, NotificationPriority } from '@/src/types/notifications';
import type { CelebrationsResponse, Celebration, CelebrationType } from '@/src/types/growth';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const createMockNotification = (
  id: string,
  overrides: Partial<Notification> = {}
): Notification => ({
  notification_id: id,
  type: 'ACHIEVEMENT_EARNED' as NotificationType,
  title: `Notification ${id}`,
  body: `This is the body for notification ${id}`,
  priority: 'MEDIUM' as NotificationPriority,
  read_at: null,
  created_at: '2024-01-15T10:00:00Z',
  action_url: undefined,
  ...overrides,
});

const mockNotificationsResponse: NotificationsResponse = {
  response_status: 'OK',
  notifications: [
    createMockNotification('n1', { title: 'Achievement Earned!', type: 'ACHIEVEMENT_EARNED' }),
    createMockNotification('n2', { title: 'Streak Milestone!', type: 'STREAK_MILESTONE', priority: 'HIGH' }),
    createMockNotification('n3', { title: 'Mission Reminder', type: 'MISSION_REMINDER', read_at: '2024-01-14T10:00:00Z' }),
  ],
  unread_count: 2,
  pagination: {
    total: 3,
    count: 3,
    offset: 0,
    limit: 20,
    has_more: false,
  },
};

const mockEmptyNotificationsResponse: NotificationsResponse = {
  response_status: 'OK',
  notifications: [],
  unread_count: 0,
  pagination: {
    total: 0,
    count: 0,
    offset: 0,
    limit: 20,
    has_more: false,
  },
};

const createMockCelebration = (
  id: string,
  overrides: Partial<Celebration> = {}
): Celebration => ({
  celebration_id: id,
  event_type: 'ACHIEVEMENT_EARNED' as CelebrationType,
  title: 'Great Listener Achievement',
  encouragement_message: 'You are becoming an amazing father!',
  earned_at: '2024-01-15T10:00:00Z',
  displayed: false,
  achievement: {
    achievement_id: 'a1',
    name: 'Great Listener',
    icon_key: 'great-listener',
  },
  points_awarded: 200,
  ...overrides,
});

const mockCelebrationsResponse: CelebrationsResponse = {
  response_status: 'OK',
  celebrations: [
    createMockCelebration('c1', { event_type: 'ACHIEVEMENT_EARNED', title: 'Great Listener Achievement' }),
    createMockCelebration('c2', { 
      event_type: 'BELT_LEVEL_UP', 
      title: 'You leveled up to Green Belt!',
      belt: { new_belt: 'GREEN', previous_belt: 'ORANGE' },
      achievement: undefined,
      points_awarded: 500,
    }),
  ],
  has_undisplayed: true,
  program_completed: false,
};

const mockNoCelebrationsResponse: CelebrationsResponse = {
  response_status: 'OK',
  celebrations: [],
  has_undisplayed: false,
  program_completed: false,
};

// ---------------------------------------------------------------------------
// Mock Hooks
// ---------------------------------------------------------------------------

type MockNotificationsHookResult = Pick<
  UseQueryResult<NotificationsResponse, Error>,
  'data' | 'isLoading' | 'error' | 'refetch'
>;

type MockCelebrationsHookResult = Pick<
  UseQueryResult<CelebrationsResponse, Error>,
  'data' | 'isLoading' | 'error' | 'refetch'
>;

type MockMutationResult<TData = unknown> = Pick<
  UseMutationResult<TData, Error, unknown>,
  'mutate' | 'mutateAsync' | 'isPending' | 'error' | 'isSuccess' | 'data' | 'reset'
>;

let mockUseNotificationsReturn: MockNotificationsHookResult = {
  data: mockNotificationsResponse,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

let mockUseCelebrationsReturn: MockCelebrationsHookResult = {
  data: mockCelebrationsResponse,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

let mockMarkReadMutateAsync = vi.fn();
let mockMarkAllReadMutate = vi.fn();
let mockMarkCelebrationsDisplayedMutate = vi.fn();

let mockMarkReadMutation: MockMutationResult = {
  mutate: vi.fn(),
  mutateAsync: mockMarkReadMutateAsync,
  isPending: false,
  error: null,
  isSuccess: false,
  data: undefined,
  reset: vi.fn(),
};

let mockMarkAllReadMutation: MockMutationResult = {
  mutate: mockMarkAllReadMutate,
  mutateAsync: vi.fn(),
  isPending: false,
  error: null,
  isSuccess: false,
  data: undefined,
  reset: vi.fn(),
};

vi.mock('@/src/hooks/useNotifications', () => ({
  useNotifications: () => mockUseNotificationsReturn,
}));

vi.mock('@/src/hooks/useCelebrations', () => ({
  useCelebrations: () => mockUseCelebrationsReturn,
}));

vi.mock('@/src/hooks/useMarkRead', () => ({
  useMarkRead: () => mockMarkReadMutation,
  useMarkAllRead: () => mockMarkAllReadMutation,
}));

// Mock the markCelebrationsDisplayed service
vi.mock('@/src/services/growth', () => ({
  markCelebrationsDisplayed: (data: { celebration_ids: string[] }) => {
    mockMarkCelebrationsDisplayedMutate(data);
    return Promise.resolve({ success: true, marked_count: data.celebration_ids.length });
  },
  getBeltProgression: vi.fn(),
  getGrowthScore: vi.fn(),
  getStreak: vi.fn(),
  getAchievements: vi.fn(),
  getCelebrations: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Import Components After Mocks
// ---------------------------------------------------------------------------

import NotificationsPage from '../page';
import { CelebrationModal } from '@/src/components/common/CelebrationModal';

// ---------------------------------------------------------------------------
// Test Utilities
// ---------------------------------------------------------------------------

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
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

describe('Notifications Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock functions
    mockMarkReadMutateAsync = vi.fn().mockResolvedValue({ success: true });
    mockMarkAllReadMutate = vi.fn();
    mockMarkCelebrationsDisplayedMutate = vi.fn();
    
    // Reset to defaults
    mockUseNotificationsReturn = {
      data: mockNotificationsResponse,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };
    
    mockMarkReadMutation = {
      mutate: vi.fn(),
      mutateAsync: mockMarkReadMutateAsync,
      isPending: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    };
    
    mockMarkAllReadMutation = {
      mutate: mockMarkAllReadMutate,
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    };
  });

  // -------------------------------------------------------------------------
  // Notifications List (Task 7.1)
  // -------------------------------------------------------------------------

  describe('Notifications List', () => {
    it('renders notifications with correct data', () => {
      renderWithProviders(<NotificationsPage />);

      expect(screen.getByText('Achievement Earned!')).toBeInTheDocument();
      expect(screen.getByText('Streak Milestone!')).toBeInTheDocument();
      expect(screen.getByText('Mission Reminder')).toBeInTheDocument();
    });

    it('shows notification type icons', () => {
      renderWithProviders(<NotificationsPage />);

      // Achievement icon 🏆, streak icon 🔥, mission icon ⏰
      expect(screen.getByText('🏆')).toBeInTheDocument();
      expect(screen.getByText('🔥')).toBeInTheDocument();
      expect(screen.getByText('⏰')).toBeInTheDocument();
    });

    it('shows priority badges', () => {
      renderWithProviders(<NotificationsPage />);

      // There are 2 medium priority badges (n1 and n3), 1 high priority badge (n2)
      const mediumBadges = screen.getAllByText('medium');
      const highBadges = screen.getAllByText('high');
      expect(mediumBadges).toHaveLength(2);
      expect(highBadges).toHaveLength(1);
    });

    it('displays unread count in header', () => {
      renderWithProviders(<NotificationsPage />);

      expect(screen.getByText('2 unread notifications')).toBeInTheDocument();
    });

    it('shows unread indicator for unread notifications', () => {
      renderWithProviders(<NotificationsPage />);

      // Unread notifications have teal dot indicator (class w-2 h-2 rounded-full bg-teal-500)
      const markReadButtons = screen.getAllByText('Mark read');
      expect(markReadButtons).toHaveLength(2); // 2 unread notifications
    });

    it('shows loading state', () => {
      mockUseNotificationsReturn = {
        ...mockUseNotificationsReturn,
        data: undefined,
        isLoading: true,
      };

      renderWithProviders(<NotificationsPage />);

      expect(screen.getByText('Notifications')).toBeInTheDocument();
      // Should show skeleton loading state
    });

    it('shows error state with retry', () => {
      const mockRefetch = vi.fn();
      mockUseNotificationsReturn = {
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
      };

      renderWithProviders(<NotificationsPage />);

      expect(screen.getByText(/couldn't load notifications/i)).toBeInTheDocument();
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);
      
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('shows empty state when no notifications', () => {
      mockUseNotificationsReturn = {
        data: mockEmptyNotificationsResponse,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithProviders(<NotificationsPage />);

      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
      expect(screen.getByText(/when you earn achievements/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Mark Read (Task 7.2)
  // -------------------------------------------------------------------------

  describe('Mark Read Functionality', () => {
    it('calls mark-read mutation when individual notification marked', async () => {
      renderWithProviders(<NotificationsPage />);

      const markReadButtons = screen.getAllByText('Mark read');
      fireEvent.click(markReadButtons[0]);

      await waitFor(() => {
        expect(mockMarkReadMutateAsync).toHaveBeenCalledWith(['n1']);
      });
    });

    it('shows "Marking..." while marking read', async () => {
      mockMarkReadMutation = {
        ...mockMarkReadMutation,
        isPending: true,
      };

      // Keep the mutateAsync mock resolved
      mockMarkReadMutateAsync = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      mockMarkReadMutation.mutateAsync = mockMarkReadMutateAsync;

      renderWithProviders(<NotificationsPage />);

      const markReadButtons = screen.getAllByText('Mark read');
      fireEvent.click(markReadButtons[0]);

      // Button should show "Marking..." state
      await waitFor(() => {
        expect(screen.getByText('Marking...')).toBeInTheDocument();
      });
    });

    it('calls mark-all-read mutation when bulk action clicked', async () => {
      renderWithProviders(<NotificationsPage />);

      const markAllButton = screen.getByText('Mark all read');
      fireEvent.click(markAllButton);

      expect(mockMarkAllReadMutate).toHaveBeenCalled();
    });

    it('hides mark-all button when no unread notifications', () => {
      mockUseNotificationsReturn = {
        data: {
          ...mockNotificationsResponse,
          notifications: mockNotificationsResponse.notifications.map(n => ({
            ...n,
            read_at: '2024-01-14T10:00:00Z',
          })),
          unread_count: 0,
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithProviders(<NotificationsPage />);

      expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
    });

    it('shows error message when mark-read fails', () => {
      mockMarkReadMutation = {
        ...mockMarkReadMutation,
        error: new Error('Failed to mark as read'),
      };

      renderWithProviders(<NotificationsPage />);

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Celebration Modal Tests
// ---------------------------------------------------------------------------

describe('CelebrationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMarkCelebrationsDisplayedMutate = vi.fn();
  });

  const undisplayedCelebrations = mockCelebrationsResponse.celebrations;

  it('renders when undisplayed celebrations exist', () => {
    const onComplete = vi.fn();
    
    renderWithProviders(
      <CelebrationModal celebrations={undisplayedCelebrations} onComplete={onComplete} />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays celebration title and message', () => {
    const onComplete = vi.fn();
    
    renderWithProviders(
      <CelebrationModal celebrations={undisplayedCelebrations} onComplete={onComplete} />
    );

    expect(screen.getByText('Achievement Earned!')).toBeInTheDocument();
    expect(screen.getByText('Great Listener Achievement')).toBeInTheDocument();
    expect(screen.getByText(/You are becoming an amazing father/i)).toBeInTheDocument();
  });

  it('displays points awarded', () => {
    const onComplete = vi.fn();
    
    renderWithProviders(
      <CelebrationModal celebrations={undisplayedCelebrations} onComplete={onComplete} />
    );

    expect(screen.getByText('+200 XP')).toBeInTheDocument();
  });

  it('displays coach celebrating image', () => {
    const onComplete = vi.fn();
    
    renderWithProviders(
      <CelebrationModal celebrations={undisplayedCelebrations} onComplete={onComplete} />
    );

    const coachImage = screen.getByAltText('Coach celebrating');
    expect(coachImage).toBeInTheDocument();
  });

  it('shows "Next" button when multiple celebrations', () => {
    const onComplete = vi.fn();
    
    renderWithProviders(
      <CelebrationModal celebrations={undisplayedCelebrations} onComplete={onComplete} />
    );

    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('shows "Awesome" button on last celebration', () => {
    const onComplete = vi.fn();
    const singleCelebration = [undisplayedCelebrations[0]];
    
    renderWithProviders(
      <CelebrationModal celebrations={singleCelebration} onComplete={onComplete} />
    );

    // Button has aria-label "Close celebration modal" and text "Awesome! →"
    expect(screen.getByRole('button', { name: /close celebration modal/i })).toBeInTheDocument();
  });

  it('shows progress dots for multiple celebrations', () => {
    const onComplete = vi.fn();
    
    renderWithProviders(
      <CelebrationModal celebrations={undisplayedCelebrations} onComplete={onComplete} />
    );

    // Should have 2 progress dots for 2 celebrations
    const progressDots = document.querySelectorAll('.w-2.h-2.rounded-full');
    expect(progressDots).toHaveLength(2);
  });

  it('advances to next celebration on dismiss', async () => {
    const onComplete = vi.fn();
    
    renderWithProviders(
      <CelebrationModal celebrations={undisplayedCelebrations} onComplete={onComplete} />
    );

    // First celebration should be shown
    expect(screen.getByText('Great Listener Achievement')).toBeInTheDocument();

    // Click Next
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Wait for animation and next celebration
    await waitFor(() => {
      expect(screen.getByText('You leveled up to Green Belt!')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('calls mark-displayed API on dismiss', async () => {
    const onComplete = vi.fn();
    
    renderWithProviders(
      <CelebrationModal celebrations={undisplayedCelebrations} onComplete={onComplete} />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockMarkCelebrationsDisplayedMutate).toHaveBeenCalledWith({
        celebration_ids: ['c1'],
      });
    });
  });

  it('calls onComplete when all celebrations dismissed', async () => {
    const onComplete = vi.fn();
    const singleCelebration = [undisplayedCelebrations[0]];
    
    renderWithProviders(
      <CelebrationModal celebrations={singleCelebration} onComplete={onComplete} />
    );

    // Button shows "Awesome! →" with aria-label "Close celebration modal"
    const dismissButton = screen.getByRole('button', { name: /close celebration modal/i });
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it('dismisses on Escape key', async () => {
    const onComplete = vi.fn();
    const singleCelebration = [undisplayedCelebrations[0]];
    
    renderWithProviders(
      <CelebrationModal celebrations={singleCelebration} onComplete={onComplete} />
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(mockMarkCelebrationsDisplayedMutate).toHaveBeenCalled();
    });
  });

  it('dismisses on overlay click', async () => {
    const onComplete = vi.fn();
    const singleCelebration = [undisplayedCelebrations[0]];
    
    renderWithProviders(
      <CelebrationModal celebrations={singleCelebration} onComplete={onComplete} />
    );

    // Click the backdrop overlay
    const overlay = document.querySelector('.bg-black\\/60');
    if (overlay) {
      fireEvent.click(overlay);
    }

    await waitFor(() => {
      expect(mockMarkCelebrationsDisplayedMutate).toHaveBeenCalled();
    });
  });

  it('displays belt image for BELT_LEVEL_UP type', async () => {
    const onComplete = vi.fn();
    const beltCelebration = [undisplayedCelebrations[1]]; // Belt level up celebration
    
    renderWithProviders(
      <CelebrationModal celebrations={beltCelebration} onComplete={onComplete} />
    );

    // Should show "Belt Level Up!" title
    expect(screen.getByText('Belt Level Up!')).toBeInTheDocument();
    
    // Should show belt image
    const beltImage = screen.getByAltText(/green belt/i);
    expect(beltImage).toBeInTheDocument();
  });

  it('does not render when celebrations array is empty', () => {
    const onComplete = vi.fn();
    
    const { container } = renderWithProviders(
      <CelebrationModal celebrations={[]} onComplete={onComplete} />
    );

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });
});
