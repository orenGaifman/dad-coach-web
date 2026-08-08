/**
 * Tests for Growth section pages and components
 *
 * Tests cover:
 * 1. Belt renders correctly for all 8 levels
 * 2. BLACK belt shows mastery state
 * 3. Achievements grouped by category
 * 4. Unearned achievements are NOT locked/greyed (just faded)
 * 5. Streak zero shows encouraging message
 * 6. No "at risk" language present anywhere
 *
 * @see Requirements: 2.1–2.5, 3.1–3.5, 4.1–4.4
 */

import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { BeltProgressionResponse, BeltLevel, AchievementsResponse, StreakResponse, Achievement, AchievementCategory } from '@/src/types/growth';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockBeltProgressionGreen: BeltProgressionResponse = {
  response_status: 'OK',
  current_belt: 'GREEN',
  current_score: 1750,
  next_belt: 'BLUE',
  points_to_next_belt: 250,
  progress_percentage_to_next_belt: 75,
  belt_earned_at: '2024-01-10T10:00:00Z',
  weeks_to_black_belt: 4,
  program_completed: false,
};

const mockBeltProgressionBlack: BeltProgressionResponse = {
  response_status: 'OK',
  current_belt: 'BLACK',
  current_score: 5500,
  next_belt: null,
  points_to_next_belt: null,
  progress_percentage_to_next_belt: null,
  belt_earned_at: '2024-01-15T10:00:00Z',
  weeks_to_black_belt: 0,
  program_completed: true,
};

const createMockAchievement = (
  id: string,
  name: string,
  category: AchievementCategory,
  earned: boolean
): Achievement => ({
  achievement_id: id,
  name,
  description: `Description for ${name}`,
  category,
  icon_key: name.toLowerCase().replace(/\s+/g, '-'),
  earned_at: earned ? '2024-01-10T10:00:00Z' : null,
  progress_percentage: earned ? undefined : Math.floor(Math.random() * 100),
});

const mockAchievements: AchievementsResponse = {
  response_status: 'OK',
  total_available: 10,
  total_earned: 4,
  achievements: [
    createMockAchievement('1', 'Great Listener', 'CONVERSATIONS', true),
    createMockAchievement('2', 'Quality Time Champion', 'CONSISTENCY', true),
    createMockAchievement('3', 'First Mission', 'MISSIONS', true),
    createMockAchievement('4', '7-Day Streak', 'CONSISTENCY', true),
    createMockAchievement('5', '30-Day Streak', 'CONSISTENCY', false),
    createMockAchievement('6', 'Deep Conversation', 'CONVERSATIONS', false),
    createMockAchievement('7', 'Patience Master', 'GROWTH', false),
    createMockAchievement('8', 'Playful Dad', 'MISSIONS', false),
    createMockAchievement('9', 'Bedtime Hero', 'GOALS', false),
    createMockAchievement('10', 'Growth Milestone', 'GROWTH', false),
  ],
  next_achievable: {
    achievement_id: '5',
    name: '30-Day Streak',
    description: 'Maintain a 30-day streak',
    icon_key: '30-day-streak',
    progress_percentage: 70,
  },
};

const mockStreakActive: StreakResponse = {
  response_status: 'OK',
  current_streak_weeks: 3,
  longest_streak_weeks: 5,
  current_streak_days: 12,
  longest_streak_days: 15,
  streak_start_date: '2024-01-03',
  last_qualifying_interaction_date: '2024-01-15',
};

const mockStreakZero: StreakResponse = {
  response_status: 'OK',
  current_streak_weeks: 0,
  longest_streak_weeks: 5,
  current_streak_days: 0,
  longest_streak_days: 15,
  streak_start_date: null,
  last_qualifying_interaction_date: '2024-01-01',
};

// ---------------------------------------------------------------------------
// Mock Hooks
// ---------------------------------------------------------------------------

type MockBeltHookResult = Pick<
  UseQueryResult<BeltProgressionResponse, Error>,
  'data' | 'isLoading' | 'isError' | 'error' | 'refetch'
>;

type MockAchievementsHookResult = Pick<
  UseQueryResult<AchievementsResponse, Error>,
  'data' | 'isLoading' | 'isError' | 'error' | 'refetch'
>;

type MockStreakHookResult = Pick<
  UseQueryResult<StreakResponse, Error>,
  'data' | 'isLoading' | 'isError' | 'error' | 'refetch'
>;

let mockUseBeltProgressionReturn: MockBeltHookResult = {
  data: mockBeltProgressionGreen,
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

let mockUseAchievementsReturn: MockAchievementsHookResult = {
  data: mockAchievements,
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

let mockUseStreakReturn: MockStreakHookResult = {
  data: mockStreakActive,
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock('@/src/hooks/useBeltProgression', () => ({
  useBeltProgression: () => mockUseBeltProgressionReturn,
}));

vi.mock('@/src/hooks/useAchievements', () => ({
  useAchievements: () => mockUseAchievementsReturn,
}));

vi.mock('@/src/hooks/useStreak', () => ({
  useStreak: () => mockUseStreakReturn,
}));

// ---------------------------------------------------------------------------
// Import Components After Mocks
// ---------------------------------------------------------------------------

import { BeltProgressDisplay } from '@/src/components/belts/BeltProgressDisplay';
import { BeltBadge } from '@/src/components/belts/BeltBadge';
import { AchievementCard } from '@/src/components/achievements/AchievementCard';
import { AchievementGallery } from '@/src/components/achievements/AchievementGallery';
import StreakPage from '../streak/page';
import AchievementsPage from '../achievements/page';

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

describe('Growth Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to defaults
    mockUseBeltProgressionReturn = {
      data: mockBeltProgressionGreen,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };
    mockUseAchievementsReturn = {
      data: mockAchievements,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };
    mockUseStreakReturn = {
      data: mockStreakActive,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };
  });

  // -------------------------------------------------------------------------
  // Belt Tests
  // -------------------------------------------------------------------------

  describe('BeltProgressDisplay', () => {
    describe('belt renders correctly for all 8 levels', () => {
      const beltLevels: { level: BeltLevel; name: string }[] = [
        { level: 'WHITE', name: 'White Belt' },
        { level: 'YELLOW', name: 'Yellow Belt' },
        { level: 'ORANGE', name: 'Orange Belt' },
        { level: 'GREEN', name: 'Green Belt' },
        { level: 'BLUE', name: 'Blue Belt' },
        { level: 'PURPLE', name: 'Purple Belt' },
        { level: 'BROWN', name: 'Brown Belt' },
        { level: 'BLACK', name: 'Black Belt' },
      ];

      it.each(beltLevels)(
        'renders $name correctly',
        ({ level, name }) => {
          render(
            <BeltProgressDisplay
              currentBelt={level}
              currentScore={1500}
              nextBelt={level === 'BLACK' ? null : level === 'BROWN' ? 'BLACK' : 'BLUE'}
              pointsToNextBelt={level === 'BLACK' ? null : 500}
              progressPercentage={level === 'BLACK' ? null : 75}
            />
          );

          // Get the belt region and check the heading within it
          const region = screen.getByRole('region', { name: new RegExp(`Current belt: ${name}`, 'i') });
          expect(region).toBeInTheDocument();
          
          // Verify the belt name is rendered as a heading
          const heading = screen.getByRole('heading', { name });
          expect(heading).toBeInTheDocument();
          
          // For BLACK belt, we verify the mastery achievement badge
          if (level === 'BLACK') {
            expect(screen.getByLabelText('Dad Sensei achievement')).toBeInTheDocument();
          }
        }
      );
    });

    describe('BLACK belt shows mastery state', () => {
      it('shows mastery message and no progress bar', () => {
        render(
          <BeltProgressDisplay
            currentBelt="BLACK"
            currentScore={5500}
            nextBelt={null}
            pointsToNextBelt={null}
            progressPercentage={null}
          />
        );

        // Should show mastery content
        expect(screen.getByText('Black Belt')).toBeInTheDocument();
        expect(screen.getByText(/You've reached the highest level/i)).toBeInTheDocument();
        
        // Should show trophy and Dad Sensei badge
        expect(screen.getByText('🏆')).toBeInTheDocument();
        expect(screen.getByLabelText('Dad Sensei achievement')).toBeInTheDocument();
        
        // Should NOT show "points to" text (no next belt)
        expect(screen.queryByText(/points to/i)).not.toBeInTheDocument();
      });

      it('displays total XP earned for BLACK belt', () => {
        render(
          <BeltProgressDisplay
            currentBelt="BLACK"
            currentScore={5500}
            nextBelt={null}
            pointsToNextBelt={null}
            progressPercentage={null}
          />
        );

        expect(screen.getByText('Total XP Earned')).toBeInTheDocument();
        expect(screen.getByText(/5,500 XP/)).toBeInTheDocument();
      });
    });

    it('shows progress bar and points to next belt for non-BLACK belts', () => {
      render(
        <BeltProgressDisplay
          currentBelt="GREEN"
          currentScore={1750}
          nextBelt="BLUE"
          pointsToNextBelt={250}
          progressPercentage={75}
        />
      );

      // Progress bar should exist
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      
      // Points to next belt should be shown
      expect(screen.getByText(/250/)).toBeInTheDocument();
      expect(screen.getByText(/points to/i)).toBeInTheDocument();
      expect(screen.getByText('Blue Belt')).toBeInTheDocument();
    });
  });

  describe('BeltBadge', () => {
    it('renders belt image with correct alt text', () => {
      render(<BeltBadge belt="GREEN" />);
      
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'Green Belt');
    });

    it.each([
      'WHITE', 'YELLOW', 'ORANGE', 'GREEN', 'BLUE', 'PURPLE', 'BROWN', 'BLACK'
    ] as BeltLevel[])('renders %s belt correctly', (belt) => {
      render(<BeltBadge belt={belt} />);
      
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Achievement Tests
  // -------------------------------------------------------------------------

  describe('AchievementCard', () => {
    it('shows checkmark for earned achievements', () => {
      const earnedAchievement = createMockAchievement('1', 'Great Listener', 'CONVERSATIONS', true);
      
      render(<AchievementCard achievement={earnedAchievement} />);

      // Should have visible checkmark (SVG)
      const checkmark = screen.getByRole('button').querySelector('svg');
      expect(checkmark).toBeInTheDocument();
    });

    it('shows earned date for earned achievements', () => {
      const earnedAchievement = createMockAchievement('1', 'Great Listener', 'CONVERSATIONS', true);
      
      render(<AchievementCard achievement={earnedAchievement} />);

      expect(screen.getByText(/Earned/)).toBeInTheDocument();
      expect(screen.getByText(/Jan 10, 2024/)).toBeInTheDocument();
    });

    it('unearned achievements are shown as available (not locked)', () => {
      const unearnedAchievement = createMockAchievement('5', '30-Day Streak', 'CONSISTENCY', false);
      
      render(<AchievementCard achievement={unearnedAchievement} />);

      // Should show "Available to earn" text, NOT "Locked"
      expect(screen.queryByText(/locked/i)).not.toBeInTheDocument();
      
      // The button should still be functional (opacity reduced but not disabled)
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('shows progress for unearned achievements with progress', () => {
      const unearnedAchievement: Achievement = {
        ...createMockAchievement('5', '30-Day Streak', 'CONSISTENCY', false),
        progress_percentage: 45,
      };
      
      render(<AchievementCard achievement={unearnedAchievement} />);

      expect(screen.getByText('45%')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('highlights next achievable with NEXT badge', () => {
      const unearnedAchievement = createMockAchievement('5', '30-Day Streak', 'CONSISTENCY', false);
      
      render(<AchievementCard achievement={unearnedAchievement} isNextAchievable />);

      expect(screen.getByText('NEXT')).toBeInTheDocument();
    });
  });

  describe('AchievementGallery', () => {
    it('groups achievements by category', () => {
      render(
        <AchievementGallery
          achievements={mockAchievements.achievements}
          totalAvailable={mockAchievements.total_available}
          totalEarned={mockAchievements.total_earned}
          nextAchievable={mockAchievements.next_achievable}
        />
      );

      // Should show category headers
      expect(screen.getByText('Missions')).toBeInTheDocument();
      expect(screen.getByText('Consistency')).toBeInTheDocument();
      expect(screen.getByText('Growth')).toBeInTheDocument();
      expect(screen.getByText('Conversations')).toBeInTheDocument();
      expect(screen.getByText('Goals')).toBeInTheDocument();
    });

    it('shows earned/total count in summary', () => {
      render(
        <AchievementGallery
          achievements={mockAchievements.achievements}
          totalAvailable={10}
          totalEarned={4}
          nextAchievable={mockAchievements.next_achievable}
        />
      );

      expect(screen.getByText('4/10')).toBeInTheDocument();
      expect(screen.getByText('40% complete')).toBeInTheDocument();
    });

    it('highlights next achievable achievement', () => {
      render(
        <AchievementGallery
          achievements={mockAchievements.achievements}
          totalAvailable={10}
          totalEarned={4}
          nextAchievable={mockAchievements.next_achievable}
        />
      );

      // Should show "Next Up" section
      expect(screen.getByText('Next Up')).toBeInTheDocument();
    });
  });

  describe('AchievementsPage', () => {
    it('renders achievements gallery', () => {
      renderWithProviders(<AchievementsPage />);

      expect(screen.getByText('Achievements')).toBeInTheDocument();
      expect(screen.getByText('Your Achievements')).toBeInTheDocument();
    });

    it('shows loading skeleton when loading', () => {
      mockUseAchievementsReturn = {
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithProviders(<AchievementsPage />);

      // Should not show achievement content
      expect(screen.queryByText('Your Achievements')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Streak Tests
  // -------------------------------------------------------------------------

  describe('StreakPage', () => {
    describe('active streak display', () => {
      it('shows current streak prominently', () => {
        renderWithProviders(<StreakPage />);

        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('Days')).toBeInTheDocument();
      });

      it('shows longest streak', () => {
        renderWithProviders(<StreakPage />);

        expect(screen.getByText('Longest Streak')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
      });

      it('shows encouraging message for active streak', () => {
        renderWithProviders(<StreakPage />);

        expect(screen.getByText(/Amazing consistency/i)).toBeInTheDocument();
      });

      it('shows milestones with reached status', () => {
        renderWithProviders(<StreakPage />);

        expect(screen.getByText('Milestones')).toBeInTheDocument();
        expect(screen.getByText('1 Week')).toBeInTheDocument();
        expect(screen.getByText('2 Weeks')).toBeInTheDocument();
      });
    });

    describe('zero streak shows encouraging message', () => {
      beforeEach(() => {
        mockUseStreakReturn = {
          data: mockStreakZero,
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        };
      });

      it('shows encouraging message for zero streak', () => {
        renderWithProviders(<StreakPage />);

        expect(screen.getByText('Ready to Start Your Streak?')).toBeInTheDocument();
        expect(screen.getByText(/Every great journey begins/i)).toBeInTheDocument();
      });

      it('shows motivational quote for zero streak', () => {
        renderWithProviders(<StreakPage />);

        expect(screen.getByText(/The best time to plant a tree/i)).toBeInTheDocument();
      });

      it('does not show negative or discouraging language', () => {
        renderWithProviders(<StreakPage />);

        // Should not have any negative language
        expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/broken/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/lost/i)).not.toBeInTheDocument();
      });
    });

    describe('no "at risk" language present anywhere', () => {
      it('does not show "at risk" for active streak', () => {
        renderWithProviders(<StreakPage />);

        const content = document.body.textContent || '';
        expect(content.toLowerCase()).not.toContain('at risk');
        expect(content.toLowerCase()).not.toContain('at-risk');
        expect(content.toLowerCase()).not.toContain('atrisk');
      });

      it('does not show "at risk" for zero streak', () => {
        mockUseStreakReturn = {
          data: mockStreakZero,
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        };

        renderWithProviders(<StreakPage />);

        const content = document.body.textContent || '';
        expect(content.toLowerCase()).not.toContain('at risk');
        expect(content.toLowerCase()).not.toContain('at-risk');
        expect(content.toLowerCase()).not.toContain('atrisk');
      });

      it('does not show "danger" or "warning" for streak', () => {
        renderWithProviders(<StreakPage />);

        const content = document.body.textContent || '';
        expect(content.toLowerCase()).not.toContain('danger');
        expect(content.toLowerCase()).not.toContain('warning');
      });
    });
  });
});
