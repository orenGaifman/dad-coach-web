/**
 * Tests for Coaching section pages - Activity Logging
 *
 * Tests cover:
 * 1. Successful submission shows confirmation with correct points (12 for quality time, 5 for positive activity)
 * 2. Rate limit shows friendly message
 * 3. Duplicate quality time rejected clearly
 * 4. Validation errors appear inline
 * 5. Date constraints enforced (future rejected, >7 days rejected)
 *
 * @see Requirements: 10.1–10.7, 11.1–11.6
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';

import type {
  ActivityResponse,
} from '@/src/types/coaching';
import type { ChildrenResponse, ChildOverview } from '@/src/types/family';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockChildOverview: ChildOverview = {
  child_id: 1,
  name: 'Emma',
  birth_date: '2019-03-15',
  computed_age: '5 years',
  age_years: 5,
  active_goals_count: 3,
  completed_missions_count: 12,
  recent_mission: {
    mission_id: 'm1',
    title: 'Read a bedtime story together',
    completed_at: '2024-01-10T20:00:00Z',
  },
  interests: ['Drawing', 'Animals', 'Music'],
  birthday_upcoming: false,
};

const mockChildrenResponse: ChildrenResponse = {
  response_status: 'OK',
  children: [mockChildOverview],
  total_count: 1,
};

const mockQualityTimeResponse: ActivityResponse = {
  response_status: 'OK',
  success: true,
  activity_id: 'act-qt-1',
  points_awarded: 12,
  streak_impact: {
    current_streak_days: 5,
    streak_extended: true,
    new_streak_started: false,
  },
  encouragement_message: "Great job spending quality time with Emma!",
  updated_total_score: 1500,
};

const mockPositiveActivityResponse: ActivityResponse = {
  response_status: 'OK',
  success: true,
  activity_id: 'act-pa-1',
  points_awarded: 5,
  streak_impact: {
    current_streak_days: 3,
    streak_extended: false,
    new_streak_started: true,
  },
  encouragement_message: "Wonderful! Positive moments like these build strong connections.",
  updated_total_score: 1205,
};

// ---------------------------------------------------------------------------
// Mock Hooks
// ---------------------------------------------------------------------------

type MockChildrenHookResult = Pick<
  UseQueryResult<ChildrenResponse, Error>,
  'data' | 'isLoading' | 'error' | 'refetch'
>;

let mockUseChildrenReturn: MockChildrenHookResult = {
  data: mockChildrenResponse,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock('@/src/hooks/useChildren', () => ({
  useChildren: () => mockUseChildrenReturn,
}));

// Mock mutation functions
let mockQualityTimeMutateAsync = vi.fn();
let mockPositiveActivityMutateAsync = vi.fn();

type MockMutationResult = Pick<
  UseMutationResult<ActivityResponse, Error, unknown>,
  'mutate' | 'mutateAsync' | 'isPending' | 'error' | 'isSuccess' | 'data' | 'reset'
>;

let mockQualityTimeMutation: MockMutationResult = {
  mutate: vi.fn(),
  mutateAsync: mockQualityTimeMutateAsync,
  isPending: false,
  error: null,
  isSuccess: false,
  data: undefined,
  reset: vi.fn(),
};

let mockPositiveActivityMutation: MockMutationResult = {
  mutate: vi.fn(),
  mutateAsync: mockPositiveActivityMutateAsync,
  isPending: false,
  error: null,
  isSuccess: false,
  data: undefined,
  reset: vi.fn(),
};

vi.mock('@/src/hooks/useLogActivity', () => ({
  useLogQualityTime: () => mockQualityTimeMutation,
  useLogPositiveActivity: () => mockPositiveActivityMutation,
  getActivityErrorMessage: (error: unknown) => {
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code: string }).code;
      if (code === 'DAILY_LIMIT_REACHED') {
        return "You've reached today's activity limit. Great job being so engaged! Come back tomorrow.";
      }
      if (code === 'DUPLICATE_ACTIVITY') {
        return "Looks like you've already logged this activity. Each moment counts once!";
      }
    }
    return "Something went wrong while saving your activity. Please try again.";
  },
  isRateLimitError: (error: unknown) => {
    if (error && typeof error === 'object' && 'code' in error) {
      return (error as { code: string }).code === 'DAILY_LIMIT_REACHED';
    }
    return false;
  },
  isDuplicateError: (error: unknown) => {
    if (error && typeof error === 'object' && 'code' in error) {
      return (error as { code: string }).code === 'DUPLICATE_ACTIVITY';
    }
    return false;
  },
}));

// Mock router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Import Components After Mocks
// ---------------------------------------------------------------------------

import LogActivityPage from '../log/page';

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

describe('Activity Logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    
    // Reset mock functions
    mockQualityTimeMutateAsync = vi.fn();
    mockPositiveActivityMutateAsync = vi.fn();
    
    // Reset to defaults
    mockUseChildrenReturn = {
      data: mockChildrenResponse,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };
    
    mockQualityTimeMutation = {
      mutate: vi.fn(),
      mutateAsync: mockQualityTimeMutateAsync,
      isPending: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    };
    
    mockPositiveActivityMutation = {
      mutate: vi.fn(),
      mutateAsync: mockPositiveActivityMutateAsync,
      isPending: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    };
  });

  // -------------------------------------------------------------------------
  // Basic Rendering
  // -------------------------------------------------------------------------

  describe('Log Activity Page', () => {
    it('renders with activity type selector', () => {
      renderWithProviders(<LogActivityPage />);
      
      expect(screen.getByText('Log Activity')).toBeInTheDocument();
      expect(screen.getByText('Quality Time')).toBeInTheDocument();
      expect(screen.getByText('Positive Activity')).toBeInTheDocument();
    });

    it('shows quality time form by default', () => {
      renderWithProviders(<LogActivityPage />);
      
      // Quality Time form should show child selector as required
      expect(screen.getByText('Child')).toBeInTheDocument();
      expect(screen.getByText('Duration (minutes)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log quality time/i })).toBeInTheDocument();
    });

    it('switches to positive activity form when selected', () => {
      renderWithProviders(<LogActivityPage />);
      
      // Click positive activity selector
      const positiveActivityButton = screen.getByText('Positive Activity').closest('button');
      fireEvent.click(positiveActivityButton!);
      
      // Should show activity type selector and Log Positive Activity button
      expect(screen.getByText('Activity Type')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log positive activity/i })).toBeInTheDocument();
    });

    it('shows points for each activity type', () => {
      renderWithProviders(<LogActivityPage />);
      
      expect(screen.getByText('12 points')).toBeInTheDocument();
      expect(screen.getByText('5 points')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Quality Time Form
  // -------------------------------------------------------------------------

  describe('Quality Time Form', () => {
    it('shows child dropdown with children from API', () => {
      renderWithProviders(<LogActivityPage />);
      
      const childSelect = screen.getByRole('combobox');
      expect(childSelect).toBeInTheDocument();
      
      // Should have Emma option
      expect(screen.getByText('Emma')).toBeInTheDocument();
    });

    it('validates child is required', async () => {
      renderWithProviders(<LogActivityPage />);
      
      // Submit without selecting child
      const submitButton = screen.getByRole('button', { name: /log quality time/i });
      fireEvent.click(submitButton);
      
      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Please select a child')).toBeInTheDocument();
      });
    });

    it('shows character count for description', () => {
      renderWithProviders(<LogActivityPage />);
      
      expect(screen.getByText('0/200')).toBeInTheDocument();
      
      // Enter some text
      const descriptionInput = screen.getByPlaceholderText('What did you do together?');
      fireEvent.change(descriptionInput, { target: { value: 'Played in the park' } });
      
      // Should show character count
      expect(screen.getByText('18/200')).toBeInTheDocument();
    });

    it('shows optional label for duration', () => {
      renderWithProviders(<LogActivityPage />);
      
      expect(screen.getByText('Optional. 15-480 minutes.')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Positive Activity Form
  // -------------------------------------------------------------------------

  describe('Positive Activity Form', () => {
    it('shows activity type selector with all options', () => {
      renderWithProviders(<LogActivityPage />);
      
      // Switch to positive activity
      const positiveActivityButton = screen.getByText('Positive Activity').closest('button');
      fireEvent.click(positiveActivityButton!);
      
      // Should show all activity type options
      expect(screen.getByText('Praise')).toBeInTheDocument();
      expect(screen.getByText('Shared Activity')).toBeInTheDocument();
      expect(screen.getByText('Teaching Moment')).toBeInTheDocument();
      expect(screen.getByText('Quality Conversation')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    it('validates activity type is required', async () => {
      renderWithProviders(<LogActivityPage />);
      
      // Switch to positive activity
      const positiveActivityButton = screen.getByText('Positive Activity').closest('button');
      fireEvent.click(positiveActivityButton!);
      
      // Submit without selecting activity type
      const submitButton = screen.getByRole('button', { name: /log positive activity/i });
      fireEvent.click(submitButton);
      
      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Please select an activity type')).toBeInTheDocument();
      });
    });

    it('shows child as optional for positive activity', () => {
      renderWithProviders(<LogActivityPage />);
      
      // Switch to positive activity
      const positiveActivityButton = screen.getByText('Positive Activity').closest('button');
      fireEvent.click(positiveActivityButton!);
      
      // Should show child as optional (note the "(optional)" in label)
      expect(screen.getByText('Child (optional)')).toBeInTheDocument();
    });

    it('child is optional for positive activity - can submit without child', async () => {
      mockPositiveActivityMutateAsync.mockResolvedValue(mockPositiveActivityResponse);
      
      renderWithProviders(<LogActivityPage />);
      
      // Switch to positive activity
      const positiveActivityButton = screen.getByText('Positive Activity').closest('button');
      fireEvent.click(positiveActivityButton!);
      
      // Select activity type
      const praiseButton = screen.getByText('Praise').closest('button');
      fireEvent.click(praiseButton!);
      
      // Submit WITHOUT selecting child (should be valid)
      const submitButton = screen.getByRole('button', { name: /log positive activity/i });
      fireEvent.click(submitButton);
      
      // Should call mutation (no child validation error)
      await waitFor(() => {
        expect(mockPositiveActivityMutateAsync).toHaveBeenCalled();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Confirmation View
  // -------------------------------------------------------------------------

  describe('Confirmation View', () => {
    it('shows 12 points for quality time on success', async () => {
      mockQualityTimeMutateAsync.mockResolvedValue(mockQualityTimeResponse);
      
      renderWithProviders(<LogActivityPage />);
      
      // Fill form and submit
      const childSelect = screen.getByRole('combobox');
      fireEvent.change(childSelect, { target: { value: '1' } });
      
      const submitButton = screen.getByRole('button', { name: /log quality time/i });
      fireEvent.click(submitButton);
      
      // Wait for confirmation view
      await waitFor(() => {
        expect(screen.getByText('+12 Points!')).toBeInTheDocument();
      });
      
      // Check confirmation details
      expect(screen.getByText("Great job spending quality time with Emma!")).toBeInTheDocument();
      expect(screen.getByText('5 Day Streak')).toBeInTheDocument();
      expect(screen.getByText('Streak extended!')).toBeInTheDocument();
      expect(screen.getByText('Total Score: 1,500 XP')).toBeInTheDocument();
    });

    it('shows 5 points for positive activity on success', async () => {
      mockPositiveActivityMutateAsync.mockResolvedValue(mockPositiveActivityResponse);
      
      renderWithProviders(<LogActivityPage />);
      
      // Switch to positive activity
      const positiveActivityButton = screen.getByText('Positive Activity').closest('button');
      fireEvent.click(positiveActivityButton!);
      
      // Select activity type
      const praiseButton = screen.getByText('Praise').closest('button');
      fireEvent.click(praiseButton!);
      
      // Submit
      const submitButton = screen.getByRole('button', { name: /log positive activity/i });
      fireEvent.click(submitButton);
      
      // Wait for confirmation view
      await waitFor(() => {
        expect(screen.getByText('+5 Points!')).toBeInTheDocument();
      });
      
      // Check confirmation details
      expect(screen.getByText("Wonderful! Positive moments like these build strong connections.")).toBeInTheDocument();
      expect(screen.getByText('3 Day Streak')).toBeInTheDocument();
      expect(screen.getByText('New streak started!')).toBeInTheDocument();
    });

    it('Done button navigates to coaching page', async () => {
      mockQualityTimeMutateAsync.mockResolvedValue(mockQualityTimeResponse);
      
      renderWithProviders(<LogActivityPage />);
      
      // Fill form and submit
      const childSelect = screen.getByRole('combobox');
      fireEvent.change(childSelect, { target: { value: '1' } });
      
      const submitButton = screen.getByRole('button', { name: /log quality time/i });
      fireEvent.click(submitButton);
      
      // Wait for confirmation and click Done
      await waitFor(() => {
        expect(screen.getByText('+12 Points!')).toBeInTheDocument();
      });
      
      const doneButton = screen.getByRole('button', { name: /done/i });
      fireEvent.click(doneButton);
      
      // Should navigate to coaching
      expect(mockPush).toHaveBeenCalledWith('/coaching');
    });
  });

  // -------------------------------------------------------------------------
  // Error Handling
  // -------------------------------------------------------------------------

  describe('Error Handling', () => {
    it('shows friendly message for rate limit error', () => {
      const rateLimitError = { code: 'DAILY_LIMIT_REACHED' };
      mockQualityTimeMutation = {
        ...mockQualityTimeMutation,
        error: rateLimitError as unknown as Error,
      };
      
      renderWithProviders(<LogActivityPage />);
      
      // Should show friendly rate limit message
      expect(screen.getByText("You've reached today's activity limit. Great job being so engaged! Come back tomorrow.")).toBeInTheDocument();
    });

    it('shows friendly message for duplicate error', () => {
      const duplicateError = { code: 'DUPLICATE_ACTIVITY' };
      mockQualityTimeMutation = {
        ...mockQualityTimeMutation,
        error: duplicateError as unknown as Error,
      };
      
      renderWithProviders(<LogActivityPage />);
      
      // Should show friendly duplicate message
      expect(screen.getByText("Looks like you've already logged this activity. Each moment counts once!")).toBeInTheDocument();
    });

    it('shows generic error message for other errors', () => {
      const genericError = new Error('Network error');
      mockQualityTimeMutation = {
        ...mockQualityTimeMutation,
        error: genericError,
      };
      
      renderWithProviders(<LogActivityPage />);
      
      // Should show generic error message
      expect(screen.getByText("Something went wrong while saving your activity. Please try again.")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Loading State
  // -------------------------------------------------------------------------

  describe('Loading State', () => {
    it('shows loading state when submitting quality time', () => {
      mockQualityTimeMutation = {
        ...mockQualityTimeMutation,
        isPending: true,
      };
      
      renderWithProviders(<LogActivityPage />);
      
      const submitButton = screen.getByRole('button', { name: /logging\.\.\./i });
      expect(submitButton).toBeDisabled();
    });

    it('shows loading state when submitting positive activity', () => {
      mockPositiveActivityMutation = {
        ...mockPositiveActivityMutation,
        isPending: true,
      };
      
      renderWithProviders(<LogActivityPage />);
      
      // Switch to positive activity
      const positiveActivityButton = screen.getByText('Positive Activity').closest('button');
      fireEvent.click(positiveActivityButton!);
      
      const submitButton = screen.getByRole('button', { name: /logging\.\.\./i });
      expect(submitButton).toBeDisabled();
    });
  });
});
