/**
 * Tests for Family section pages and components
 *
 * Tests cover:
 * 1. Children render with dynamically computed ages
 * 2. Birthday indicator shows within 7 days
 * 3. Goals progress percentage displays correctly (capped at 100%)
 * 4. Filtering works for goals
 * 5. Empty states render with correct copy
 *
 * @see Requirements: 5.1–5.5, 7.1–7.4, 8.1-8.3
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type {
  ChildrenResponse,
  ChildDetailResponse,
  ChildOverview,
  ChildDetail,
  GoalsResponse,
  GoalDetailResponse,
  GoalOverview,
  GoalDetail,
} from '@/src/types/family';

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


const mockChildWithBirthday: ChildOverview = {
  ...mockChildOverview,
  child_id: 2,
  name: 'Lucas',
  birthday_upcoming: true,
};

const mockChildrenResponse: ChildrenResponse = {
  response_status: 'OK',
  children: [mockChildOverview, mockChildWithBirthday],
  total_count: 2,
};

const mockEmptyChildrenResponse: ChildrenResponse = {
  response_status: 'OK',
  children: [],
  total_count: 0,
};

const mockChildDetail: ChildDetail = {
  child_id: 1,
  name: 'Emma',
  birth_date: '2019-03-15',
  computed_age: '5 years',
  age_years: 5,
  gender: 'FEMALE',
  interests: ['Drawing', 'Animals', 'Music'],
  challenges: ['Bedtime routines', 'Sharing with siblings'],
  active_goals: [
    {
      goal_id: 'g1',
      description: 'Improve bedtime routine consistency',
      category: 'DISCIPLINE',
      progress_percentage: 65,
    },
  ],
  mission_history: {
    total_completed: 12,
    total_started: 15,
    recent_completed: [
      { mission_id: 'm1', title: 'Read a bedtime story', completed_at: '2024-01-10T20:00:00Z' },
      { mission_id: 'm2', title: 'Play together for 30 mins', completed_at: '2024-01-09T18:00:00Z' },
    ],
  },
  birthday_upcoming: false,
  days_until_birthday: null,
};


const mockChildDetailWithBirthday: ChildDetail = {
  ...mockChildDetail,
  child_id: 2,
  name: 'Lucas',
  birthday_upcoming: true,
  days_until_birthday: 3,
};

const mockChildDetailResponse: ChildDetailResponse = {
  response_status: 'OK',
  child: mockChildDetail,
};

const mockGoalOverview: GoalOverview = {
  goal_id: 'g1',
  description: 'Improve bedtime routine consistency',
  category: 'DISCIPLINE',
  priority: 'HIGH',
  status: 'ACTIVE',
  progress_percentage: 65,
  related_child: { child_id: 1, name: 'Emma' },
  missions_completed_count: 4,
  missions_remaining_estimate: 2,
  created_at: '2024-01-01T10:00:00Z',
};

const mockGoalOver100: GoalOverview = {
  ...mockGoalOverview,
  goal_id: 'g2',
  description: 'Goal with over 100% progress',
  progress_percentage: 125,
};

const mockCompletedGoal: GoalOverview = {
  ...mockGoalOverview,
  goal_id: 'g3',
  description: 'Completed goal',
  status: 'COMPLETED',
  category: 'QUALITY_TIME',
  progress_percentage: 100,
};

const mockGoalsResponse: GoalsResponse = {
  response_status: 'OK',
  goals: [mockGoalOverview, mockGoalOver100, mockCompletedGoal],
  total_count: 3,
};


const mockEmptyGoalsResponse: GoalsResponse = {
  response_status: 'OK',
  goals: [],
  total_count: 0,
};

const mockGoalDetail: GoalDetail = {
  goal_id: 'g1',
  description: 'Improve bedtime routine consistency',
  category: 'DISCIPLINE',
  priority: 'HIGH',
  status: 'ACTIVE',
  created_at: '2024-01-01T10:00:00Z',
  progress_percentage: 65,
  related_child: { child_id: 1, name: 'Emma' },
  related_missions: [
    { mission_id: 'm1', title: 'Read bedtime story', status: 'COMPLETED', completed_at: '2024-01-05T20:00:00Z' },
    { mission_id: 'm2', title: 'Establish consistent bedtime', status: 'ACTIVE', completed_at: null },
    { mission_id: 'm3', title: 'Skipped mission', status: 'SKIPPED', completed_at: null },
  ],
  milestones_reached: [
    { milestone_id: 'ml1', description: 'First week of consistency', reached_at: '2024-01-08T10:00:00Z' },
  ],
};

const mockGoalDetailResponse: GoalDetailResponse = {
  response_status: 'OK',
  goal: mockGoalDetail,
};

// ---------------------------------------------------------------------------
// Mock Hooks
// ---------------------------------------------------------------------------

type MockChildrenHookResult = Pick<
  UseQueryResult<ChildrenResponse, Error>,
  'data' | 'isLoading' | 'error' | 'refetch'
>;

type MockChildDetailHookResult = Pick<
  UseQueryResult<ChildDetailResponse, Error>,
  'data' | 'isLoading' | 'error' | 'refetch'
>;


type MockGoalsHookResult = Pick<
  UseQueryResult<GoalsResponse, Error>,
  'data' | 'isLoading' | 'error' | 'refetch'
>;

type MockGoalDetailHookResult = Pick<
  UseQueryResult<GoalDetailResponse, Error>,
  'data' | 'isLoading' | 'error' | 'refetch'
>;

let mockUseChildrenReturn: MockChildrenHookResult = {
  data: mockChildrenResponse,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

let mockUseChildDetailReturn: MockChildDetailHookResult = {
  data: mockChildDetailResponse,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

let mockUseGoalsReturn: MockGoalsHookResult = {
  data: mockGoalsResponse,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

let mockUseGoalDetailReturn: MockGoalDetailHookResult = {
  data: mockGoalDetailResponse,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock('@/src/hooks/useChildren', () => ({
  useChildren: () => mockUseChildrenReturn,
}));

vi.mock('@/src/hooks/useChildDetail', () => ({
  useChildDetail: () => mockUseChildDetailReturn,
}));

vi.mock('@/src/hooks/useGoals', () => ({
  useGoals: () => mockUseGoalsReturn,
}));

vi.mock('@/src/hooks/useGoalDetail', () => ({
  useGoalDetail: () => mockUseGoalDetailReturn,
}));


// ---------------------------------------------------------------------------
// Import Components After Mocks
// ---------------------------------------------------------------------------

import FamilyPage from '../page';
import GoalsPage from '../goals/page';

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

describe('Family Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to defaults
    mockUseChildrenReturn = {
      data: mockChildrenResponse,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };
    mockUseChildDetailReturn = {
      data: mockChildDetailResponse,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };
    mockUseGoalsReturn = {
      data: mockGoalsResponse,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };
    mockUseGoalDetailReturn = {
      data: mockGoalDetailResponse,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };
  });


  // -------------------------------------------------------------------------
  // Children Overview Tests (FamilyPage)
  // -------------------------------------------------------------------------

  describe('FamilyPage - Children Overview', () => {
    describe('children render with dynamically computed ages', () => {
      it('renders child with computed age string', () => {
        renderWithProviders(<FamilyPage />);

        expect(screen.getByText('Emma')).toBeInTheDocument();
        // Both children have "5 years", so there will be duplicates
        const ageTexts = screen.getAllByText('5 years');
        expect(ageTexts.length).toBeGreaterThanOrEqual(1);
      });

      it('renders multiple children with their ages', () => {
        renderWithProviders(<FamilyPage />);

        expect(screen.getByText('Emma')).toBeInTheDocument();
        expect(screen.getByText('Lucas')).toBeInTheDocument();
      });

      it('displays child count', () => {
        renderWithProviders(<FamilyPage />);

        expect(screen.getByText('2 children')).toBeInTheDocument();
      });

      it('displays singular "child" for one child', () => {
        mockUseChildrenReturn = {
          data: {
            response_status: 'OK',
            children: [mockChildOverview],
            total_count: 1,
          },
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        };

        renderWithProviders(<FamilyPage />);

        expect(screen.getByText('1 child')).toBeInTheDocument();
      });
    });


    describe('birthday indicator shows within 7 days', () => {
      it('shows birthday emoji for child with upcoming birthday', () => {
        renderWithProviders(<FamilyPage />);

        // Lucas has birthday_upcoming: true
        const lucasCard = screen.getByText('Lucas').closest('a');
        expect(lucasCard).toBeInTheDocument();
        
        // Check for birthday emoji
        const birthdayIndicator = within(lucasCard!).getByRole('img', { name: /birthday coming up/i });
        expect(birthdayIndicator).toBeInTheDocument();
      });

      it('does not show birthday emoji for child without upcoming birthday', () => {
        renderWithProviders(<FamilyPage />);

        // Emma does not have birthday_upcoming
        const emmaCard = screen.getByText('Emma').closest('a');
        expect(emmaCard).toBeInTheDocument();
        
        // Should not have birthday indicator
        const birthdayIndicators = within(emmaCard!).queryByRole('img', { name: /birthday coming up/i });
        expect(birthdayIndicators).not.toBeInTheDocument();
      });
    });

    describe('child card content', () => {
      it('displays goals count', () => {
        renderWithProviders(<FamilyPage />);

        // Both children have 3 goals, so there will be duplicates
        const goalTexts = screen.getAllByText('3 goals');
        expect(goalTexts.length).toBeGreaterThanOrEqual(1);
      });

      it('displays missions count', () => {
        renderWithProviders(<FamilyPage />);

        // Both children have 12 missions, so there will be duplicates
        const missionTexts = screen.getAllByText('12 missions');
        expect(missionTexts.length).toBeGreaterThanOrEqual(1);
      });

      it('displays recent mission', () => {
        renderWithProviders(<FamilyPage />);

        // Both children have the same recent mission, so there will be duplicates
        const missionTexts = screen.getAllByText('Read a bedtime story together');
        expect(missionTexts.length).toBeGreaterThanOrEqual(1);
      });

      it('displays interests preview (max 3)', () => {
        renderWithProviders(<FamilyPage />);

        // Both children have the same interests, so there will be duplicates
        const drawingTexts = screen.getAllByText('Drawing');
        expect(drawingTexts.length).toBeGreaterThanOrEqual(1);
        
        const animalsTexts = screen.getAllByText('Animals');
        expect(animalsTexts.length).toBeGreaterThanOrEqual(1);
        
        const musicTexts = screen.getAllByText('Music');
        expect(musicTexts.length).toBeGreaterThanOrEqual(1);
      });
    });


    describe('empty states render with correct copy', () => {
      it('renders empty state when no children', () => {
        mockUseChildrenReturn = {
          data: mockEmptyChildrenResponse,
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        };

        renderWithProviders(<FamilyPage />);

        expect(screen.getByText('Add your first child')).toBeInTheDocument();
        expect(screen.getByText(/Your kids' profiles are set up during your coaching onboarding/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /chat with coach/i })).toBeInTheDocument();
      });

      it('does not show "View Goals" link when no children', () => {
        mockUseChildrenReturn = {
          data: mockEmptyChildrenResponse,
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        };

        renderWithProviders(<FamilyPage />);

        expect(screen.queryByText('View Goals →')).not.toBeInTheDocument();
      });
    });

    describe('loading and error states', () => {
      it('shows skeleton when loading', () => {
        mockUseChildrenReturn = {
          data: undefined,
          isLoading: true,
          error: null,
          refetch: vi.fn(),
        };

        renderWithProviders(<FamilyPage />);

        expect(screen.queryByText('Emma')).not.toBeInTheDocument();
      });

      it('shows error state on error', () => {
        mockUseChildrenReturn = {
          data: undefined,
          isLoading: false,
          error: new Error('Failed to load'),
          refetch: vi.fn(),
        };

        renderWithProviders(<FamilyPage />);

        expect(screen.getByText(/couldn't load your family data/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    });
  });


  // -------------------------------------------------------------------------
  // Goals Overview Tests (GoalsPage)
  // -------------------------------------------------------------------------

  describe('GoalsPage - Goals Overview', () => {
    describe('goals progress percentage displays correctly', () => {
      it('displays progress percentage', () => {
        renderWithProviders(<GoalsPage />);

        expect(screen.getByText('65%')).toBeInTheDocument();
      });

      it('caps progress at 100% when over 100', () => {
        renderWithProviders(<GoalsPage />);

        // mockGoalOver100 has progress_percentage: 125
        // Should display as 100%, not 125%
        const progressTexts = screen.getAllByText('100%');
        expect(progressTexts.length).toBeGreaterThanOrEqual(1);
        expect(screen.queryByText('125%')).not.toBeInTheDocument();
      });

      it('shows progress bar for each goal', () => {
        renderWithProviders(<GoalsPage />);

        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars.length).toBeGreaterThanOrEqual(3);
      });
    });

    describe('filtering works', () => {
      it('shows all goals by default', () => {
        renderWithProviders(<GoalsPage />);

        expect(screen.getByText('3 goals')).toBeInTheDocument();
      });

      it('shows filtered count when Active filter is selected', () => {
        renderWithProviders(<GoalsPage />);

        // Click on "Active" filter
        const activeButton = screen.getByRole('button', { name: 'Active' });
        fireEvent.click(activeButton);

        // Should show filtered text (2 active goals out of 3)
        expect(screen.getByText(/2 goals \(filtered\)/)).toBeInTheDocument();
      });

      it('shows filtered count when Completed filter is selected', () => {
        renderWithProviders(<GoalsPage />);

        const completedButton = screen.getByRole('button', { name: 'Completed' });
        fireEvent.click(completedButton);

        // Should show filtered text (1 completed goal)
        expect(screen.getByText(/1 goal \(filtered\)/)).toBeInTheDocument();
      });

      it('shows "Clear filters" when no results match filters', () => {
        mockUseGoalsReturn = {
          data: {
            response_status: 'OK',
            goals: [mockGoalOverview], // Only one active goal
            total_count: 1,
          },
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        };

        renderWithProviders(<GoalsPage />);

        // Click on "Completed" filter
        const completedButton = screen.getByRole('button', { name: 'Completed' });
        fireEvent.click(completedButton);

        // Should show no results message with clear filters option
        expect(screen.getByText('No goals match your filters')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
      });

      it('clears filters when "Clear filters" is clicked', () => {
        mockUseGoalsReturn = {
          data: {
            response_status: 'OK',
            goals: [mockGoalOverview],
            total_count: 1,
          },
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        };

        renderWithProviders(<GoalsPage />);

        // Apply filter that yields no results
        const completedButton = screen.getByRole('button', { name: 'Completed' });
        fireEvent.click(completedButton);

        // Click clear filters
        const clearButton = screen.getByRole('button', { name: /clear filters/i });
        fireEvent.click(clearButton);

        // Should show all goals again
        expect(screen.getByText('1 goal')).toBeInTheDocument();
        expect(screen.queryByText('No goals match your filters')).not.toBeInTheDocument();
      });
    });


    describe('goal card content', () => {
      it('displays goal description', () => {
        renderWithProviders(<GoalsPage />);

        expect(screen.getByText('Improve bedtime routine consistency')).toBeInTheDocument();
      });

      it('displays goal category', () => {
        renderWithProviders(<GoalsPage />);

        // Multiple goals may have Discipline category, so check for at least one
        const categoryText = screen.getAllByText('Discipline');
        expect(categoryText.length).toBeGreaterThanOrEqual(1);
      });

      it('displays related child name in goal cards', () => {
        renderWithProviders(<GoalsPage />);

        // Emma appears multiple times (once per goal card)
        const emmaTexts = screen.getAllByText('Emma');
        expect(emmaTexts.length).toBeGreaterThanOrEqual(1);
      });

      it('displays missions completed count', () => {
        renderWithProviders(<GoalsPage />);

        // Multiple goals have same missions count
        const missionsDone = screen.getAllByText(/4 missions done/);
        expect(missionsDone.length).toBeGreaterThanOrEqual(1);
      });

      it('displays missions remaining estimate', () => {
        renderWithProviders(<GoalsPage />);

        // Multiple goals have same remaining estimate
        const remaining = screen.getAllByText(/~2 remaining/);
        expect(remaining.length).toBeGreaterThanOrEqual(1);
      });

      it('displays status badges for different statuses', () => {
        renderWithProviders(<GoalsPage />);

        // Check for Active status badge (in filter buttons and status spans)
        const activeElements = screen.getAllByText('Active');
        expect(activeElements.length).toBeGreaterThanOrEqual(1);
        
        // Check for Completed status badge
        const completedElements = screen.getAllByText('Completed');
        expect(completedElements.length).toBeGreaterThanOrEqual(1);
      });
    });


    describe('empty states render with correct copy', () => {
      it('renders empty state when no goals', () => {
        mockUseGoalsReturn = {
          data: mockEmptyGoalsResponse,
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        };

        renderWithProviders(<GoalsPage />);

        expect(screen.getByText('Goals are created through coaching')).toBeInTheDocument();
        expect(screen.getByText(/goals emerge naturally from your coaching conversations/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /chat with coach/i })).toBeInTheDocument();
      });

      it('does not show filters when no goals', () => {
        mockUseGoalsReturn = {
          data: mockEmptyGoalsResponse,
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        };

        renderWithProviders(<GoalsPage />);

        expect(screen.queryByRole('button', { name: 'Active' })).not.toBeInTheDocument();
      });
    });

    describe('loading and error states', () => {
      it('shows skeleton when loading', () => {
        mockUseGoalsReturn = {
          data: undefined,
          isLoading: true,
          error: null,
          refetch: vi.fn(),
        };

        renderWithProviders(<GoalsPage />);

        expect(screen.queryByText('Improve bedtime routine consistency')).not.toBeInTheDocument();
      });

      it('shows error state on error', () => {
        mockUseGoalsReturn = {
          data: undefined,
          isLoading: false,
          error: new Error('Failed to load'),
          refetch: vi.fn(),
        };

        renderWithProviders(<GoalsPage />);

        expect(screen.getByText(/couldn't load your goals/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    });
  });
});
