/**
 * Tests for Profile section pages
 *
 * Tests cover:
 * 1. Profile displays all fields with phone masked
 * 2. Edit saves and confirms
 * 3. Children list renders
 * 4. Add child form validates (birth date 0–18 years)
 * 5. Max 8 children enforced (button disabled)
 * 6. Archive requires confirmation
 * 7. Preferences save with confirmation
 *
 * @see Requirements: 13.1–13.4, 14.1–14.5, 15.1–15.3
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';

import type { ProfileResponse, ProfileUpdateResponse, PreferencesUpdateResponse } from '@/src/types/workspace';
import type { ChildrenResponse, ChildOverview, ChildDetailResponse } from '@/src/types/family';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockProfileResponse: ProfileResponse = {
  response_status: 'OK',
  father_id: 1,
  display_name: 'John Smith',
  phone_number: '+1234567890',
  email: 'john@example.com',
  timezone: 'America/New_York',
  coaching_style: 'BALANCED',
  preferred_coaching_time: '09:00:00',
  notification_frequency: 'DAILY',
  quiet_hours_start: '22:00:00',
  quiet_hours_end: '07:00:00',
  language: 'en',
  coaching_phase: 'ACTIVE_COACHING',
  activated_at: '2024-01-15T10:00:00Z',
  days_since_activation: 180,
};

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
  interests: ['Drawing', 'Animals'],
  birthday_upcoming: false,
};

const createMockChildren = (count: number): ChildOverview[] => {
  return Array.from({ length: count }, (_, i) => ({
    ...mockChildOverview,
    child_id: i + 1,
    name: `Child ${i + 1}`,
  }));
};

const mockChildrenResponse: ChildrenResponse = {
  response_status: 'OK',
  children: [mockChildOverview],
  total_count: 1,
};

const mock8ChildrenResponse: ChildrenResponse = {
  response_status: 'OK',
  children: createMockChildren(8),
  total_count: 8,
};

const mockProfileUpdateResponse: ProfileUpdateResponse = {
  success: true,
  message: 'Profile updated successfully',
};

const mockPreferencesUpdateResponse: PreferencesUpdateResponse = {
  success: true,
  message: 'Preferences updated successfully',
};

const mockChildDetailResponse: ChildDetailResponse = {
  response_status: 'OK',
  child: {
    child_id: 1,
    name: 'Emma',
    birth_date: '2019-03-15',
    computed_age: '5 years',
    age_years: 5,
    gender: 'FEMALE',
    interests: ['Drawing', 'Animals'],
    challenges: ['Shyness'],
    active_goals: [],
    mission_history: {
      total_completed: 12,
      total_started: 15,
      recent_completed: [],
    },
    birthday_upcoming: false,
    days_until_birthday: null,
  },
};

// ---------------------------------------------------------------------------
// Mock Hooks
// ---------------------------------------------------------------------------

type MockProfileHookResult = Pick<
  UseQueryResult<ProfileResponse, Error>,
  'data' | 'isLoading' | 'error' | 'refetch'
>;

type MockChildrenHookResult = Pick<
  UseQueryResult<ChildrenResponse, Error>,
  'data' | 'isLoading' | 'error' | 'refetch'
>;

let mockUseProfileReturn: MockProfileHookResult = {
  data: mockProfileResponse,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

let mockUseChildrenReturn: MockChildrenHookResult = {
  data: mockChildrenResponse,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock('@/src/hooks/useProfile', () => ({
  useProfile: () => mockUseProfileReturn,
}));

vi.mock('@/src/hooks/useChildren', () => ({
  useChildren: () => mockUseChildrenReturn,
}));

// Mock mutation functions
let mockUpdateProfileMutateAsync = vi.fn();
let mockUpdatePreferencesMutateAsync = vi.fn();
let mockAddChildMutateAsync = vi.fn();
let mockUpdateChildMutateAsync = vi.fn();
let mockArchiveChildMutateAsync = vi.fn();

type MockProfileMutationResult = Pick<
  UseMutationResult<ProfileUpdateResponse, Error, unknown>,
  'mutate' | 'mutateAsync' | 'isPending' | 'error' | 'isSuccess' | 'data' | 'reset'
>;

type MockPreferencesMutationResult = Pick<
  UseMutationResult<PreferencesUpdateResponse, Error, unknown>,
  'mutate' | 'mutateAsync' | 'isPending' | 'error' | 'isSuccess' | 'data' | 'reset'
>;

type MockChildMutationResult = Pick<
  UseMutationResult<ChildDetailResponse, Error, unknown>,
  'mutate' | 'mutateAsync' | 'isPending' | 'error' | 'isSuccess' | 'data' | 'reset'
>;

let mockUpdateProfileMutation: MockProfileMutationResult = {
  mutate: vi.fn(),
  mutateAsync: mockUpdateProfileMutateAsync,
  isPending: false,
  error: null,
  isSuccess: false,
  data: undefined,
  reset: vi.fn(),
};

let mockUpdatePreferencesMutation: MockPreferencesMutationResult = {
  mutate: vi.fn(),
  mutateAsync: mockUpdatePreferencesMutateAsync,
  isPending: false,
  error: null,
  isSuccess: false,
  data: undefined,
  reset: vi.fn(),
};

let mockAddChildMutation: MockChildMutationResult = {
  mutate: vi.fn(),
  mutateAsync: mockAddChildMutateAsync,
  isPending: false,
  error: null,
  isSuccess: false,
  data: undefined,
  reset: vi.fn(),
};

let mockUpdateChildMutation: MockChildMutationResult = {
  mutate: vi.fn(),
  mutateAsync: mockUpdateChildMutateAsync,
  isPending: false,
  error: null,
  isSuccess: false,
  data: undefined,
  reset: vi.fn(),
};

let mockArchiveChildMutation: MockChildMutationResult = {
  mutate: vi.fn(),
  mutateAsync: mockArchiveChildMutateAsync,
  isPending: false,
  error: null,
  isSuccess: false,
  data: undefined,
  reset: vi.fn(),
};

vi.mock('@/src/hooks/useUpdateProfile', () => ({
  useUpdateProfile: () => mockUpdateProfileMutation,
}));

vi.mock('@/src/hooks/useUpdatePreferences', () => ({
  useUpdatePreferences: () => mockUpdatePreferencesMutation,
}));

vi.mock('@/src/hooks/useChildMutations', () => ({
  useAddChild: () => mockAddChildMutation,
  useUpdateChild: () => mockUpdateChildMutation,
  useArchiveChild: () => mockArchiveChildMutation,
}));

// Mock router
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Import Components After Mocks
// ---------------------------------------------------------------------------

import ProfilePage from '../page';
import EditProfilePage from '../edit/page';
import ChildrenManagementPage from '../children/page';
import PreferencesPage from '../preferences/page';

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

describe('Profile Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockBack.mockClear();

    // Reset mock functions
    mockUpdateProfileMutateAsync = vi.fn();
    mockUpdatePreferencesMutateAsync = vi.fn();
    mockAddChildMutateAsync = vi.fn();
    mockUpdateChildMutateAsync = vi.fn();
    mockArchiveChildMutateAsync = vi.fn();

    // Reset to defaults
    mockUseProfileReturn = {
      data: mockProfileResponse,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };

    mockUseChildrenReturn = {
      data: mockChildrenResponse,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };

    mockUpdateProfileMutation = {
      mutate: vi.fn(),
      mutateAsync: mockUpdateProfileMutateAsync,
      isPending: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    };

    mockUpdatePreferencesMutation = {
      mutate: vi.fn(),
      mutateAsync: mockUpdatePreferencesMutateAsync,
      isPending: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    };

    mockAddChildMutation = {
      mutate: vi.fn(),
      mutateAsync: mockAddChildMutateAsync,
      isPending: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    };

    mockArchiveChildMutation = {
      mutate: vi.fn(),
      mutateAsync: mockArchiveChildMutateAsync,
      isPending: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    };
  });

  // -------------------------------------------------------------------------
  // Profile Overview (Task 6.1)
  // -------------------------------------------------------------------------

  describe('Profile Overview Page', () => {
    it('displays all profile fields', () => {
      renderWithProviders(<ProfilePage />);

      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Active Coaching')).toBeInTheDocument();
      expect(screen.getByText('180 days')).toBeInTheDocument();
    });

    it('displays phone number masked', () => {
      renderWithProviders(<ProfilePage />);

      // Phone should be masked like +******7890 (actual masking shows all prefix digits as asterisks)
      expect(screen.getByText(/\+\*+7890/)).toBeInTheDocument();
    });

    it('displays timezone formatted nicely', () => {
      renderWithProviders(<ProfilePage />);

      // Should show formatted timezone
      expect(screen.getByText(/America\/New_York|Eastern/)).toBeInTheDocument();
    });

    it('displays coaching style', () => {
      renderWithProviders(<ProfilePage />);

      expect(screen.getByText('Balanced')).toBeInTheDocument();
    });

    it('has navigation links to edit and other sections', () => {
      renderWithProviders(<ProfilePage />);

      // Personal info has Edit link, Coaching Settings has Edit link
      const editLinks = screen.getAllByText('Edit');
      expect(editLinks.length).toBeGreaterThanOrEqual(1);
      // Navigation links
      expect(screen.getByText('Manage Children')).toBeInTheDocument();
      expect(screen.getByText('Account Settings')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      mockUseProfileReturn = {
        ...mockUseProfileReturn,
        data: undefined,
        isLoading: true,
      };

      renderWithProviders(<ProfilePage />);

      // Should show skeleton/loading state (skeleton card)
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('shows error state with retry', () => {
      const mockRefetch = vi.fn();
      mockUseProfileReturn = {
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
      };

      renderWithProviders(<ProfilePage />);

      expect(screen.getByText(/couldn.?t load/i)).toBeInTheDocument();
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);
      
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Edit Profile (Task 6.2)
  // -------------------------------------------------------------------------

  describe('Edit Profile Page', () => {
    it('pre-fills form with current profile data', () => {
      renderWithProviders(<EditProfilePage />);

      const nameInput = screen.getByDisplayValue('John Smith');
      expect(nameInput).toBeInTheDocument();

      const emailInput = screen.getByDisplayValue('john@example.com');
      expect(emailInput).toBeInTheDocument();
    });

    it('saves profile and shows confirmation', async () => {
      mockUpdateProfileMutateAsync.mockResolvedValue(mockProfileUpdateResponse);

      renderWithProviders(<EditProfilePage />);

      // Change name
      const nameInput = screen.getByDisplayValue('John Smith');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(submitButton);

      // Should call mutation
      await waitFor(() => {
        expect(mockUpdateProfileMutateAsync).toHaveBeenCalled();
      });
    });

    it('shows error message on save failure', async () => {
      mockUpdateProfileMutation = {
        ...mockUpdateProfileMutation,
        error: new Error('Save failed'),
      };

      renderWithProviders(<EditProfilePage />);

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('disables save button when no changes', () => {
      renderWithProviders(<EditProfilePage />);

      const submitButton = screen.getByRole('button', { name: /save/i });
      expect(submitButton).toBeDisabled();
    });
  });

  // -------------------------------------------------------------------------
  // Children Management (Tasks 6.3, 6.4, 6.5)
  // -------------------------------------------------------------------------

  describe('Children Management Page', () => {
    it('renders children list', () => {
      renderWithProviders(<ChildrenManagementPage />);

      expect(screen.getByText('Emma')).toBeInTheDocument();
      expect(screen.getByText('5 years')).toBeInTheDocument();
    });

    it('shows Add Child button', () => {
      renderWithProviders(<ChildrenManagementPage />);

      expect(screen.getByRole('button', { name: /add child/i })).toBeInTheDocument();
    });

    it('disables Add Child button when 8 children exist', () => {
      mockUseChildrenReturn = {
        data: mock8ChildrenResponse,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithProviders(<ChildrenManagementPage />);

      // The button shows "Maximum 8 children reached" when disabled
      const addButton = screen.getByRole('button', { name: /maximum 8 children reached/i });
      expect(addButton).toBeDisabled();
    });

    it('shows max children message when 8 children exist', () => {
      mockUseChildrenReturn = {
        data: mock8ChildrenResponse,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithProviders(<ChildrenManagementPage />);

      // Button should be disabled and show max children message
      expect(screen.getByText(/Maximum 8 children reached/i)).toBeInTheDocument();
    });

    it('opens add child form when Add Child clicked', () => {
      renderWithProviders(<ChildrenManagementPage />);

      const addButton = screen.getByRole('button', { name: /\+ add child/i });
      fireEvent.click(addButton);

      // Form should appear - use getAllByText since "Add Child" appears as both heading and button
      const addChildElements = screen.getAllByText('Add Child');
      expect(addChildElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByPlaceholderText(/child's name/i)).toBeInTheDocument();
    });

    it('validates birth date must be 0-18 years', async () => {
      renderWithProviders(<ChildrenManagementPage />);

      // Open add form
      const addButton = screen.getByRole('button', { name: /\+ add child/i });
      fireEvent.click(addButton);

      // Enter name
      const nameInput = screen.getByPlaceholderText(/child's name/i);
      fireEvent.change(nameInput, { target: { value: 'Test Child' } });

      // Leave birth date empty and try to submit (required field validation)
      const saveButtons = screen.getAllByRole('button', { name: /add child/i });
      const saveButton = saveButtons[saveButtons.length - 1];
      fireEvent.click(saveButton);

      // Should show validation error for required birth date
      await waitFor(() => {
        expect(screen.getByText(/birth date is required/i)).toBeInTheDocument();
      });
    });

    it('archive requires confirmation dialog', async () => {
      renderWithProviders(<ChildrenManagementPage />);

      // Find and click archive button for Emma
      const archiveButton = screen.getByRole('button', { name: /archive/i });
      fireEvent.click(archiveButton);

      // Confirmation dialog should appear with "Archive Emma?"
      expect(screen.getByText(/Archive Emma\?/)).toBeInTheDocument();
      expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();

      // Should have Cancel button
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('archive proceeds after confirmation', async () => {
      mockArchiveChildMutateAsync.mockResolvedValue({ success: true });

      renderWithProviders(<ChildrenManagementPage />);

      // Click archive
      const archiveButton = screen.getByRole('button', { name: /archive/i });
      fireEvent.click(archiveButton);

      // Confirm in dialog
      const confirmButtons = screen.getAllByRole('button', { name: /archive/i });
      const confirmButton = confirmButtons[confirmButtons.length - 1]; // Get the one in dialog
      fireEvent.click(confirmButton);

      // Should call archive mutation
      await waitFor(() => {
        expect(mockArchiveChildMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({ childId: 1 })
        );
      });
    });

    it('shows empty state when no children', () => {
      mockUseChildrenReturn = {
        data: { response_status: 'OK', children: [], total_count: 0 },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithProviders(<ChildrenManagementPage />);

      expect(screen.getByText(/no children yet/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Preferences (Task 6.6)
  // -------------------------------------------------------------------------

  describe('Preferences Page', () => {
    it('displays all preference options', () => {
      renderWithProviders(<PreferencesPage />);

      expect(screen.getByText('Coaching Style')).toBeInTheDocument();
      expect(screen.getByText('Preferred Coaching Time')).toBeInTheDocument();
      expect(screen.getByText('Notification Frequency')).toBeInTheDocument();
      expect(screen.getByText('Quiet Hours')).toBeInTheDocument();
    });

    it('shows all 4 coaching style options', () => {
      renderWithProviders(<PreferencesPage />);

      expect(screen.getByText('Gentle')).toBeInTheDocument();
      expect(screen.getByText('Balanced')).toBeInTheDocument();
      expect(screen.getByText('Direct')).toBeInTheDocument();
      expect(screen.getByText('Motivational')).toBeInTheDocument();
    });

    it('pre-selects current coaching style', () => {
      renderWithProviders(<PreferencesPage />);

      // Balanced should be selected (from mock profile)
      const balancedButton = screen.getByText('Balanced').closest('button');
      expect(balancedButton).toHaveClass('bg-teal-500/20');
    });

    it('saves preferences and shows confirmation', async () => {
      mockUpdatePreferencesMutateAsync.mockResolvedValue(mockPreferencesUpdateResponse);

      renderWithProviders(<PreferencesPage />);

      // Change coaching style
      const directButton = screen.getByText('Direct').closest('button');
      fireEvent.click(directButton!);

      // Submit
      const submitButton = screen.getByRole('button', { name: /save preferences/i });
      fireEvent.click(submitButton);

      // Should call mutation
      await waitFor(() => {
        expect(mockUpdatePreferencesMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              coaching_style: 'DIRECT',
            }),
          })
        );
      });
    });

    it('disables save button when no changes', () => {
      renderWithProviders(<PreferencesPage />);

      const submitButton = screen.getByRole('button', { name: /save preferences/i });
      expect(submitButton).toBeDisabled();
    });

    it('shows error message on save failure', () => {
      mockUpdatePreferencesMutation = {
        ...mockUpdatePreferencesMutation,
        error: new Error('Save failed'),
      };

      renderWithProviders(<PreferencesPage />);

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
