import { render, screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Bug 6: Status Dictionary for Dashboard - Preservation Tests
// ---------------------------------------------------------------------------
// 
// **Property 2: Preservation** - Existing Dashboard Functionality Unchanged
// 
// **Validates: Requirements 3.11, 3.12**
// 
// These tests verify that EXISTING dashboard functionality is preserved:
// - FatherStatePanel renders and shows current state correctly
// - State badge displays correctly for all workflow states  
// - Father data loads and displays correctly
// - Belt information displays correctly
// - Children information displays correctly
// - State history/transitions are shown
// 
// These tests MUST PASS on UNFIXED code (before implementing the fix).
// After the Bug 6 fix is implemented, these tests should STILL PASS,
// confirming that existing functionality was not broken.
// 
// Bug Condition Functions (from bugfix.md):
// ```
// 3.11 WHEN the workflow state machine transitions between states 
//      THEN the system SHALL CONTINUE TO use the existing WorkflowState enum values 
//      for core state management
// 
// 3.12 WHEN processing messages in WAITING state 
//      THEN the system SHALL CONTINUE TO use the existing pattern matching 
//      and state handler logic
// ```
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockFetchFatherState = vi.fn();

vi.mock('@/src/api/dev', () => ({
  fetchFatherState: (id: number, signal?: AbortSignal) => mockFetchFatherState(id, signal),
}));

vi.mock('@/src/utils/timezone', () => ({
  formatIsraelDateTime: (date: string) => `Israel: ${date}`,
}));

// ---------------------------------------------------------------------------
// Import components after mocks
// ---------------------------------------------------------------------------

import { FatherStatePanel } from '../FatherStatePanel';

// ---------------------------------------------------------------------------
// Test Data: Various workflow states
// ---------------------------------------------------------------------------

const WORKFLOW_STATES = [
  'WELCOME',
  'WAITING',
  'SCHEDULE_QUALITY_TIME',
  'QUALITY_TIME_FOLLOW_UP',
  'QUALITY_TIME_PREPARATION',
  'QUALITY_TIME_IN_PROGRESS',
  'BELT_PROMOTION',
];

const BELT_LEVELS = ['WHITE', 'YELLOW', 'ORANGE', 'GREEN', 'BLUE', 'BROWN', 'BLACK'];

const FATHER_STATUSES = ['ACTIVE', 'INACTIVE', 'PAUSED', 'BLOCKED'];

/**
 * Creates a mock father state with the given configuration
 */
function createMockFatherState(overrides: Partial<{
  id: number;
  phone: string;
  display_name: string | null;
  status: string;
  current_state: string;
  previous_state: string | null;
  state_entered_at: string | null;
  belt_current: string;
  total_quality_times_completed: number;
  current_streak_weeks: number;
  children: Array<{ id: number; name: string; birth_date: string }>;
  _partial: boolean;
  _errors: string[];
}> = {}) {
  return {
    id: overrides.id ?? 123,
    phone: overrides.phone ?? '+972501234567',
    // Use explicit check for undefined to allow null to be passed through
    display_name: 'display_name' in overrides ? overrides.display_name : 'Test Father',
    status: overrides.status ?? 'ACTIVE',
    workflow: {
      current_state: overrides.current_state ?? 'WAITING',
      previous_state: 'previous_state' in overrides ? overrides.previous_state : 'SCHEDULE_QUALITY_TIME',
      state_entered_at: 'state_entered_at' in overrides ? overrides.state_entered_at : '2024-01-15T10:00:00Z',
      welcomed_at: '2024-01-01T08:00:00Z',
    },
    belt: {
      current: overrides.belt_current ?? 'WHITE',
      total_quality_times_completed: overrides.total_quality_times_completed ?? 5,
      current_streak_weeks: overrides.current_streak_weeks ?? 2,
    },
    children: overrides.children ?? [
      { id: 1, name: 'Child One', birth_date: '2020-01-01' },
    ],
    scheduled_quality_times: [],
    _partial: overrides._partial ?? false,
    _errors: overrides._errors ?? [],
  };
}

// ---------------------------------------------------------------------------
// Preservation Tests
// ---------------------------------------------------------------------------

describe('Bug 6: Dashboard Preservation Tests - Existing Functionality Unchanged', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Property 2.1: FatherStatePanel Renders and Shows Current State
  // -------------------------------------------------------------------------
  describe('Property 2.1: FatherStatePanel renders and shows current state correctly', () => {
    
    /**
     * **PRESERVATION TEST: State display for all workflow states**
     * 
     * Validates: Requirement 3.11
     * WHEN the workflow state machine transitions between states THEN the system 
     * SHALL CONTINUE TO use the existing WorkflowState enum values for core state management
     * 
     * For each workflow state, the FatherStatePanel should display the state name.
     * This test MUST PASS on unfixed code.
     */
    it.each(WORKFLOW_STATES)(
      'should display %s workflow state correctly',
      async (workflowState) => {
        // Use a different previous state to avoid conflicts
        const previousState = workflowState === 'WAITING' ? 'SCHEDULE_QUALITY_TIME' : 'WAITING';
        mockFetchFatherState.mockResolvedValue(
          createMockFatherState({ current_state: workflowState, previous_state: previousState })
        );

        render(<FatherStatePanel fatherId={123} />);

        await waitFor(() => {
          // The state should be displayed (with spaces instead of underscores)
          const displayedState = workflowState.replace(/_/g, ' ');
          expect(screen.getByText(displayedState)).toBeInTheDocument();
        });
      }
    );

    /**
     * **PRESERVATION TEST: Panel header renders correctly**
     * 
     * Validates: Requirement 3.11
     * The FatherStatePanel header "Father State" should always be displayed.
     * This test MUST PASS on unfixed code.
     */
    it('should display the Father State panel header', async () => {
      mockFetchFatherState.mockResolvedValue(createMockFatherState());

      render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        expect(screen.getByText(/Father State/)).toBeInTheDocument();
      });
    });

    /**
     * **PRESERVATION TEST: Previous state is displayed**
     * 
     * Validates: Requirement 3.11
     * The FatherStatePanel should show the previous workflow state for context.
     * This test MUST PASS on unfixed code.
     */
    it('should display previous workflow state', async () => {
      mockFetchFatherState.mockResolvedValue(
        createMockFatherState({
          current_state: 'WAITING',
          previous_state: 'SCHEDULE_QUALITY_TIME',
        })
      );

      render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        expect(screen.getByText(/SCHEDULE QUALITY TIME/)).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Property 2.2: Status Badge Displays Correctly
  // -------------------------------------------------------------------------
  describe('Property 2.2: Status badge displays correctly for all workflow states', () => {
    
    /**
     * **PRESERVATION TEST: Status badge for all father statuses**
     * 
     * Validates: Requirement 3.12
     * The status badge should display correctly for ACTIVE, INACTIVE, PAUSED, BLOCKED.
     * This test MUST PASS on unfixed code.
     */
    it.each(FATHER_STATUSES)(
      'should display %s status badge correctly',
      async (status) => {
        mockFetchFatherState.mockResolvedValue(
          createMockFatherState({ status })
        );

        render(<FatherStatePanel fatherId={123} />);

        await waitFor(() => {
          expect(screen.getByText(status)).toBeInTheDocument();
        });
      }
    );

    /**
     * **PRESERVATION TEST: Workflow state has correct badge styling**
     * 
     * Validates: Requirement 3.11
     * Each workflow state should have a colored badge.
     * This test MUST PASS on unfixed code.
     */
    it('should display workflow state badge with styling', async () => {
      mockFetchFatherState.mockResolvedValue(
        createMockFatherState({ current_state: 'WAITING' })
      );

      render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        const waitingBadge = screen.getByText('WAITING');
        // The badge should have styling classes
        expect(waitingBadge).toHaveClass('text-xs');
        expect(waitingBadge).toHaveClass('rounded-full');
      });
    });
  });

  // -------------------------------------------------------------------------
  // Property 2.3: Father Data Loads and Displays Correctly
  // -------------------------------------------------------------------------
  describe('Property 2.3: Father data loads and displays correctly', () => {
    
    /**
     * **PRESERVATION TEST: Father name displays correctly**
     * 
     * Validates: Requirement 3.12
     * Father display_name should be shown in the panel.
     * This test MUST PASS on unfixed code.
     */
    it('should display father display name', async () => {
      mockFetchFatherState.mockResolvedValue(
        createMockFatherState({ display_name: 'John Doe' })
      );

      render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    /**
     * **PRESERVATION TEST: Father phone displays correctly**
     * 
     * Validates: Requirement 3.12
     * Father phone number should be shown in the panel.
     * This test MUST PASS on unfixed code.
     */
    it('should display father phone number', async () => {
      mockFetchFatherState.mockResolvedValue(
        createMockFatherState({ phone: '+972501234567' })
      );

      render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        expect(screen.getByText('+972501234567')).toBeInTheDocument();
      });
    });

    /**
     * **PRESERVATION TEST: Handle null display_name gracefully**
     * 
     * Validates: Requirement 3.12
     * When display_name is null, the panel should show "Unknown".
     * This test MUST PASS on unfixed code.
     */
    it('should handle null display_name gracefully', async () => {
      mockFetchFatherState.mockResolvedValue(
        createMockFatherState({ display_name: null })
      );

      render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        expect(screen.getByText('Unknown')).toBeInTheDocument();
      });
    });

    /**
     * **PRESERVATION TEST: State entered at timestamp is formatted**
     * 
     * Validates: Requirement 3.11
     * The state_entered_at timestamp should be displayed in Israel timezone.
     * This test MUST PASS on unfixed code.
     */
    it('should display state entered timestamp in Israel timezone', async () => {
      mockFetchFatherState.mockResolvedValue(
        createMockFatherState({ state_entered_at: '2024-01-15T10:00:00Z' })
      );

      render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        // The formatIsraelDateTime mock prepends "Israel: "
        expect(screen.getByText(/Israel:/)).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Property 2.4: Belt Information Displays Correctly
  // -------------------------------------------------------------------------
  describe('Property 2.4: Belt information displays correctly', () => {
    
    /**
     * **PRESERVATION TEST: Belt level displays for all belt colors**
     * 
     * Validates: Requirement 3.12
     * Each belt level (WHITE through BLACK) should display correctly.
     * This test MUST PASS on unfixed code.
     */
    it.each(BELT_LEVELS)(
      'should display %s belt correctly',
      async (beltLevel) => {
        mockFetchFatherState.mockResolvedValue(
          createMockFatherState({ belt_current: beltLevel })
        );

        render(<FatherStatePanel fatherId={123} />);

        await waitFor(() => {
          // Belt display shows "White Belt", "Yellow Belt", etc.
          const displayBelt = beltLevel.charAt(0) + beltLevel.slice(1).toLowerCase() + ' Belt';
          expect(screen.getByText(displayBelt)).toBeInTheDocument();
        });
      }
    );

    /**
     * **PRESERVATION TEST: Total quality times completed displays**
     * 
     * Validates: Requirement 3.12
     * The total_quality_times_completed should be shown.
     * This test MUST PASS on unfixed code.
     */
    it('should display total quality times completed', async () => {
      mockFetchFatherState.mockResolvedValue(
        createMockFatherState({ total_quality_times_completed: 15 })
      );

      render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        expect(screen.getByText('15')).toBeInTheDocument();
        expect(screen.getByText(/Quality times completed/i)).toBeInTheDocument();
      });
    });

    /**
     * **PRESERVATION TEST: Current streak displays**
     * 
     * Validates: Requirement 3.12
     * The current_streak_weeks should be shown.
     * This test MUST PASS on unfixed code.
     */
    it('should display current streak in weeks', async () => {
      mockFetchFatherState.mockResolvedValue(
        createMockFatherState({ current_streak_weeks: 7 })
      );

      render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        expect(screen.getByText('7 weeks')).toBeInTheDocument();
        expect(screen.getByText(/Current streak/i)).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Property 2.5: Children Information Displays Correctly
  // -------------------------------------------------------------------------
  describe('Property 2.5: Children information displays correctly', () => {
    
    /**
     * **PRESERVATION TEST: Single child displays correctly**
     * 
     * Validates: Requirement 3.12
     * When a father has one child, the child's name and birth date should be shown.
     * This test MUST PASS on unfixed code.
     */
    it('should display single child correctly', async () => {
      mockFetchFatherState.mockResolvedValue(
        createMockFatherState({
          children: [{ id: 1, name: 'Alice', birth_date: '2018-05-15' }],
        })
      );

      render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('2018-05-15')).toBeInTheDocument();
      });
    });

    /**
     * **PRESERVATION TEST: Multiple children display correctly**
     * 
     * Validates: Requirement 3.12
     * When a father has multiple children, all should be shown.
     * This test MUST PASS on unfixed code.
     */
    it('should display multiple children correctly', async () => {
      mockFetchFatherState.mockResolvedValue(
        createMockFatherState({
          children: [
            { id: 1, name: 'Alice', birth_date: '2018-05-15' },
            { id: 2, name: 'Bob', birth_date: '2020-08-22' },
            { id: 3, name: 'Charlie', birth_date: '2022-01-10' },
          ],
        })
      );

      render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
      });
    });

    /**
     * **PRESERVATION TEST: No children displays empty state**
     * 
     * Validates: Requirement 3.12
     * When a father has no children, an empty state message should be shown.
     * This test MUST PASS on unfixed code.
     */
    it('should display empty state when no children', async () => {
      mockFetchFatherState.mockResolvedValue(
        createMockFatherState({ children: [] })
      );

      render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        expect(screen.getByText(/No children registered/i)).toBeInTheDocument();
      });
    });

    /**
     * **PRESERVATION TEST: Children count displays correctly**
     * 
     * Validates: Requirement 3.12
     * The children section header should show the count.
     * This test MUST PASS on unfixed code.
     */
    it('should display children count in header', async () => {
      mockFetchFatherState.mockResolvedValue(
        createMockFatherState({
          children: [
            { id: 1, name: 'Alice', birth_date: '2018-05-15' },
            { id: 2, name: 'Bob', birth_date: '2020-08-22' },
          ],
        })
      );

      render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        expect(screen.getByText(/Children \(2\)/)).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Property 2.6: Loading and Error States
  // -------------------------------------------------------------------------
  describe('Property 2.6: Loading and error states work correctly', () => {
    
    /**
     * **PRESERVATION TEST: Loading state displays**
     * 
     * Validates: Requirement 3.12
     * While loading, the panel should show loading skeleton.
     * This test MUST PASS on unfixed code.
     */
    it('should display loading state while fetching data', async () => {
      // Create a promise that never resolves to test loading state
      mockFetchFatherState.mockImplementation(
        () => new Promise(() => {})
      );

      render(<FatherStatePanel fatherId={123} />);

      // Should show loading skeleton
      expect(screen.getByText(/Father State/)).toBeInTheDocument();
      
      // Should have animated pulse elements
      const pulseElements = document.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBeGreaterThan(0);
    });

    /**
     * **PRESERVATION TEST: Error state displays**
     * 
     * Validates: Requirement 3.12
     * When fetch fails, the panel should show error message with retry option.
     * This test MUST PASS on unfixed code.
     */
    it('should display error state when fetch fails', async () => {
      mockFetchFatherState.mockRejectedValue(new Error('Network error'));

      render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
        expect(screen.getByText(/Try again/)).toBeInTheDocument();
      });
    });

    /**
     * **PRESERVATION TEST: Retry works after error**
     * 
     * Validates: Requirement 3.12
     * After an error, clicking retry should attempt to fetch again.
     * This test MUST PASS on unfixed code.
     */
    it('should retry fetch when retry button is clicked', async () => {
      const user = userEvent.setup();
      
      // First call fails, second call succeeds
      mockFetchFatherState
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(createMockFatherState());

      render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });

      // Click retry button
      await user.click(screen.getByText(/Try again/));

      await waitFor(() => {
        expect(screen.getByText('WAITING')).toBeInTheDocument();
      });

      // Should have been called twice
      expect(mockFetchFatherState).toHaveBeenCalledTimes(2);
    });

    /**
     * **PRESERVATION TEST: Partial data warning displays**
     * 
     * Validates: Requirement 3.12
     * When _partial is true, a warning should be shown.
     * This test MUST PASS on unfixed code.
     */
    it('should display partial data warning when _partial is true', async () => {
      mockFetchFatherState.mockResolvedValue(
        createMockFatherState({
          _partial: true,
          _errors: ['children', 'quality_times'],
        })
      );

      render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        expect(screen.getByText(/Some data could not be loaded/i)).toBeInTheDocument();
        expect(screen.getByText(/children/)).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Property 2.7: API Integration
  // -------------------------------------------------------------------------
  describe('Property 2.7: API integration works correctly', () => {
    
    /**
     * **PRESERVATION TEST: Correct father ID is passed to API**
     * 
     * Validates: Requirement 3.11
     * The fetchFatherState should be called with the correct fatherId.
     * This test MUST PASS on unfixed code.
     */
    it('should call fetchFatherState with correct fatherId', async () => {
      mockFetchFatherState.mockResolvedValue(createMockFatherState({ id: 456 }));

      render(<FatherStatePanel fatherId={456} />);

      await waitFor(() => {
        expect(mockFetchFatherState).toHaveBeenCalledWith(456, expect.anything());
      });
    });

    /**
     * **PRESERVATION TEST: Refetches when fatherId changes**
     * 
     * Validates: Requirement 3.11
     * When the fatherId prop changes, data should be refetched.
     * This test MUST PASS on unfixed code.
     */
    it('should refetch when fatherId prop changes', async () => {
      mockFetchFatherState.mockResolvedValue(createMockFatherState({ id: 123 }));

      const { rerender } = render(<FatherStatePanel fatherId={123} />);

      await waitFor(() => {
        expect(mockFetchFatherState).toHaveBeenCalledWith(123, expect.anything());
      });

      // Change fatherId
      mockFetchFatherState.mockResolvedValue(createMockFatherState({ id: 456 }));
      rerender(<FatherStatePanel fatherId={456} />);

      await waitFor(() => {
        expect(mockFetchFatherState).toHaveBeenCalledWith(456, expect.anything());
      });
    });
  });
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
// 
// These preservation tests verify that existing dashboard functionality works 
// correctly and MUST PASS on the current unfixed codebase.
// 
// After Bug 6 is fixed (tasks 23.1 - 23.5), these tests should STILL PASS,
// confirming that the new StatusDictionaryPanel and contextual status 
// descriptions do not break existing functionality.
// 
// Validated Requirements:
// - 3.11: Workflow state machine transitions continue to use existing 
//         WorkflowState enum values for core state management
// - 3.12: Processing messages in WAITING state continues to use existing 
//         pattern matching and state handler logic
// 
// ---------------------------------------------------------------------------
