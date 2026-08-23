import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Bug 6: Status Dictionary for Dashboard - Unit Tests
// ---------------------------------------------------------------------------
// 
// **Validates: Requirements 2.16, 2.17, 2.18**
// 
// These unit tests verify the implementation of Bug 6 fix:
// - StatusDictionaryPanel renders all workflow states
// - Contextual description generation for each state (getStatusContext)
// - Dashboard integration with new component
// - Collapsible/expandable functionality
// - Responsive layout and styling
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

import { StatusDictionaryPanel } from '../StatusDictionaryPanel';
import { FatherStatePanel } from '../FatherStatePanel';

// ---------------------------------------------------------------------------
// Test Data: All workflow states
// ---------------------------------------------------------------------------

const ALL_WORKFLOW_STATES = [
  'WELCOME',
  'SCHEDULE_QUALITY_TIME',
  'WAITING',
  'QUALITY_TIME_PREPARATION',
  'QUALITY_TIME_IN_PROGRESS',
  'QUALITY_TIME_FOLLOW_UP',
  'ACTIVITY_IDEAS',
  'BELT_PROMOTION',
];

/**
 * Creates a mock father state with the given configuration
 */
function createMockFatherState(overrides: {
  current_state?: string;
  previous_state?: string | null;
  scheduled_quality_times?: Array<{
    id: number;
    status: string;
    scheduled_start: string;
    scheduled_end: string;
  }>;
} = {}) {
  return {
    id: 123,
    phone: '+972501234567',
    display_name: 'Test Father',
    status: 'ACTIVE',
    workflow: {
      current_state: overrides.current_state ?? 'WAITING',
      previous_state: overrides.previous_state ?? 'SCHEDULE_QUALITY_TIME',
      state_entered_at: '2024-01-15T10:00:00Z',
      welcomed_at: '2024-01-01T08:00:00Z',
    },
    belt: {
      current: 'WHITE',
      total_quality_times_completed: 5,
      current_streak_weeks: 2,
    },
    children: [
      { id: 1, name: 'Child One', birth_date: '2020-01-01' },
    ],
    scheduled_quality_times: overrides.scheduled_quality_times ?? [],
    _partial: false,
    _errors: [],
  };
}

// ---------------------------------------------------------------------------
// Test 1: StatusDictionaryPanel renders all workflow states
// ---------------------------------------------------------------------------

describe('StatusDictionaryPanel renders all workflow states', () => {
  /**
   * Test that the panel renders and contains the header
   * 
   * Validates: Requirement 2.16
   */
  it('should render the Status Dictionary panel header', () => {
    render(<StatusDictionaryPanel />);
    
    expect(screen.getByText(/Status Dictionary/)).toBeInTheDocument();
  });

  /**
   * Test that the panel starts collapsed with state count
   * 
   * Validates: Requirement 2.16
   */
  it('should display state count when collapsed', () => {
    render(<StatusDictionaryPanel />);
    
    // Should show count in collapsed state
    expect(screen.getByText(/Click to expand/)).toBeInTheDocument();
    expect(screen.getByText(/8 states/)).toBeInTheDocument();
  });

  /**
   * Test that all workflow states are rendered when expanded
   * 
   * Validates: Requirement 2.16
   */
  it('should render all workflow states when expanded', async () => {
    const user = userEvent.setup();
    render(<StatusDictionaryPanel />);
    
    // Expand the panel
    await user.click(screen.getByRole('button', { name: /Status Dictionary/i }));
    
    // Check that all states are rendered (as display names)
    await waitFor(() => {
      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByText('Schedule Quality Time')).toBeInTheDocument();
      expect(screen.getByText('Waiting')).toBeInTheDocument();
      expect(screen.getByText('QT Preparation')).toBeInTheDocument();
      expect(screen.getByText('QT In Progress')).toBeInTheDocument();
      expect(screen.getByText('QT Follow-Up')).toBeInTheDocument();
      expect(screen.getByText('Activity Ideas')).toBeInTheDocument();
      expect(screen.getByText('Belt Promotion')).toBeInTheDocument();
    });
  });

  /**
   * Test that state descriptions are rendered
   * 
   * Validates: Requirement 2.17
   */
  it('should render descriptions for each state', async () => {
    const user = userEvent.setup();
    render(<StatusDictionaryPanel />);
    
    // Expand the panel
    await user.click(screen.getByRole('button', { name: /Status Dictionary/i }));
    
    await waitFor(() => {
      // Check for some key descriptions
      expect(screen.getByText(/Initial state for new fathers/i)).toBeInTheDocument();
      expect(screen.getByText(/Active scheduling phase/i)).toBeInTheDocument();
      expect(screen.getByText(/Passive state after QT is scheduled/i)).toBeInTheDocument();
      expect(screen.getByText(/Post-event state/i)).toBeInTheDocument();
    });
  });

  /**
   * Test that state types (State vs AI Action) are displayed
   * 
   * Validates: Requirement 2.17
   */
  it('should display state types (State vs AI Action)', async () => {
    const user = userEvent.setup();
    render(<StatusDictionaryPanel />);
    
    // Expand the panel
    await user.click(screen.getByRole('button', { name: /Status Dictionary/i }));
    
    await waitFor(() => {
      // Should have AI Action type badges
      const actionBadges = screen.getAllByText('AI Action');
      expect(actionBadges.length).toBeGreaterThan(0);
      
      // Look for "State" type badges in the type column (tbody only)
      // We use text search with a function to exclude the header
      const allStateTexts = screen.getAllByText('State');
      // Filter to only include those that are badges (have the bg-gray-500 class)
      const stateBadges = allStateTexts.filter(el => 
        el.classList.contains('border') && el.classList.contains('rounded')
      );
      expect(stateBadges.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test that possible actions are displayed for each state
   * 
   * Validates: Requirement 2.17
   */
  it('should display possible actions for each state', async () => {
    const user = userEvent.setup();
    render(<StatusDictionaryPanel />);
    
    // Expand the panel
    await user.click(screen.getByRole('button', { name: /Status Dictionary/i }));
    
    await waitFor(() => {
      // Check for some actions (note: displayed with spaces instead of underscores)
      // Use getAllByText since these may appear multiple times
      const transitionActions = screen.getAllByText(/TRANSITION TO SCHEDULE/i);
      expect(transitionActions.length).toBeGreaterThan(0);
      
      const selectSlotActions = screen.getAllByText(/SELECT SLOT/i);
      expect(selectSlotActions.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test table structure with correct headers
   * 
   * Validates: Requirement 2.16
   */
  it('should render table with correct headers', async () => {
    const user = userEvent.setup();
    render(<StatusDictionaryPanel />);
    
    // Expand the panel
    await user.click(screen.getByRole('button', { name: /Status Dictionary/i }));
    
    await waitFor(() => {
      // Check headers in thead - use role selector for table headers
      const headers = screen.getAllByRole('columnheader');
      const headerTexts = headers.map(h => h.textContent);
      
      expect(headerTexts).toContain('State');
      expect(headerTexts).toContain('Description');
      expect(headerTexts).toContain('Type');
      expect(headerTexts).toContain('Actions');
    });
  });
});

// ---------------------------------------------------------------------------
// Test 2: Contextual description generation for each state
// ---------------------------------------------------------------------------

describe('Contextual description generation (getStatusContext)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test WELCOME state context
   * 
   * Validates: Requirement 2.18
   */
  it('should show "New father - onboarding in progress" for WELCOME state', async () => {
    mockFetchFatherState.mockResolvedValue(
      createMockFatherState({ current_state: 'WELCOME' })
    );

    render(<FatherStatePanel fatherId={123} />);

    await waitFor(() => {
      expect(screen.getByText(/New father - onboarding in progress/i)).toBeInTheDocument();
    });
  });

  /**
   * Test SCHEDULE_QUALITY_TIME state context
   * 
   * Validates: Requirement 2.18
   */
  it('should show "Needs to schedule Quality Time" for SCHEDULE_QUALITY_TIME state', async () => {
    mockFetchFatherState.mockResolvedValue(
      createMockFatherState({ current_state: 'SCHEDULE_QUALITY_TIME' })
    );

    render(<FatherStatePanel fatherId={123} />);

    await waitFor(() => {
      expect(screen.getByText(/Needs to schedule Quality Time/i)).toBeInTheDocument();
    });
  });

  /**
   * Test WAITING state context WITH scheduled QT
   * 
   * Validates: Requirement 2.18
   */
  it('should show "Quality Time scheduled for {time}" for WAITING state with scheduled QT', async () => {
    // Create a scheduled QT for 24 hours from now to ensure it's always in the future
    const futureDate = new Date();
    futureDate.setTime(futureDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    futureDate.setMinutes(0);
    futureDate.setSeconds(0);
    
    mockFetchFatherState.mockResolvedValue(
      createMockFatherState({
        current_state: 'WAITING',
        scheduled_quality_times: [
          {
            id: 1,
            status: 'SCHEDULED',
            scheduled_start: futureDate.toISOString(),
            scheduled_end: new Date(futureDate.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour later
          },
        ],
      })
    );

    render(<FatherStatePanel fatherId={123} />);

    await waitFor(() => {
      // Should contain "Quality Time scheduled for" with a time reference
      const bodyText = document.body.textContent || '';
      expect(bodyText.toLowerCase()).toContain('quality time scheduled for');
    });
  });

  /**
   * Test WAITING state context WITHOUT scheduled QT
   * 
   * Validates: Requirement 2.18
   */
  it('should show "Waiting - No QT scheduled" for WAITING state without scheduled QT', async () => {
    mockFetchFatherState.mockResolvedValue(
      createMockFatherState({
        current_state: 'WAITING',
        scheduled_quality_times: [],
      })
    );

    render(<FatherStatePanel fatherId={123} />);

    await waitFor(() => {
      expect(screen.getByText(/Waiting - No QT scheduled/i)).toBeInTheDocument();
    });
  });

  /**
   * Test QUALITY_TIME_FOLLOW_UP state context
   * 
   * Validates: Requirement 2.18
   */
  it('should show "Following up on completed Quality Time" for QUALITY_TIME_FOLLOW_UP state', async () => {
    mockFetchFatherState.mockResolvedValue(
      createMockFatherState({ current_state: 'QUALITY_TIME_FOLLOW_UP' })
    );

    render(<FatherStatePanel fatherId={123} />);

    await waitFor(() => {
      expect(screen.getByText(/Following up on completed Quality Time/i)).toBeInTheDocument();
    });
  });

  /**
   * Test QUALITY_TIME_PREPARATION state context
   * 
   * Validates: Requirement 2.18
   */
  it('should show "Quality Time starting soon" for QUALITY_TIME_PREPARATION state', async () => {
    mockFetchFatherState.mockResolvedValue(
      createMockFatherState({ current_state: 'QUALITY_TIME_PREPARATION' })
    );

    render(<FatherStatePanel fatherId={123} />);

    await waitFor(() => {
      // Should find the context text (may be multiple elements with similar text)
      const bodyText = document.body.textContent || '';
      expect(bodyText.toLowerCase()).toContain('quality time starting');
    });
  });

  /**
   * Test QUALITY_TIME_IN_PROGRESS state context
   * 
   * Validates: Requirement 2.18
   */
  it('should show "Quality Time in progress" for QUALITY_TIME_IN_PROGRESS state', async () => {
    mockFetchFatherState.mockResolvedValue(
      createMockFatherState({ current_state: 'QUALITY_TIME_IN_PROGRESS' })
    );

    render(<FatherStatePanel fatherId={123} />);

    await waitFor(() => {
      // May find multiple elements due to badge and context both containing similar text
      const elements = screen.getAllByText(/Quality Time in progress/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test BELT_PROMOTION state context
   * 
   * Validates: Requirement 2.18
   */
  it('should show "Belt promotion achieved!" for BELT_PROMOTION state', async () => {
    mockFetchFatherState.mockResolvedValue(
      createMockFatherState({ current_state: 'BELT_PROMOTION' })
    );

    render(<FatherStatePanel fatherId={123} />);

    await waitFor(() => {
      expect(screen.getByText(/Belt promotion achieved!/i)).toBeInTheDocument();
    });
  });

  /**
   * Test ACTIVITY_IDEAS state context
   * 
   * Validates: Requirement 2.18
   */
  it('should show "Browsing activity ideas" for ACTIVITY_IDEAS state', async () => {
    mockFetchFatherState.mockResolvedValue(
      createMockFatherState({ current_state: 'ACTIVITY_IDEAS' })
    );

    render(<FatherStatePanel fatherId={123} />);

    await waitFor(() => {
      expect(screen.getByText(/Browsing activity ideas/i)).toBeInTheDocument();
    });
  });

  /**
   * Test unknown state graceful handling
   * 
   * Validates: Requirement 2.18
   */
  it('should format unknown states by replacing underscores with spaces', async () => {
    mockFetchFatherState.mockResolvedValue(
      createMockFatherState({ current_state: 'SOME_UNKNOWN_STATE' })
    );

    render(<FatherStatePanel fatherId={123} />);

    await waitFor(() => {
      // Should find at least one element with the formatted state name
      const elements = screen.getAllByText(/SOME UNKNOWN STATE/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});

// ---------------------------------------------------------------------------
// Test 3: Dashboard integration with new component
// ---------------------------------------------------------------------------

describe('Dashboard integration with StatusDictionaryPanel', () => {
  /**
   * Test that StatusDictionaryPanel is imported in dashboard page
   * 
   * Validates: Requirement 2.16
   */
  it('should have StatusDictionaryPanel imported in dashboard page', () => {
    const dashboardPagePath = path.resolve(__dirname, '../../page.tsx');
    
    let hasStatusDictionaryImport = false;
    let hasStatusDictionaryRender = false;
    
    try {
      const content = fs.readFileSync(dashboardPagePath, 'utf-8');
      hasStatusDictionaryImport = content.includes("import { StatusDictionaryPanel }") || 
                                   content.includes("from './components/StatusDictionaryPanel'");
      hasStatusDictionaryRender = content.includes('<StatusDictionaryPanel');
    } catch {
      // File doesn't exist
    }
    
    expect(hasStatusDictionaryImport).toBe(true);
    expect(hasStatusDictionaryRender).toBe(true);
  });

  /**
   * Test that StatusDictionaryPanel is placed in the correct location (left column)
   * 
   * Validates: Requirement 2.16
   */
  it('should have StatusDictionaryPanel in left column of dashboard', () => {
    const dashboardPagePath = path.resolve(__dirname, '../../page.tsx');
    
    let isInLeftColumn = false;
    
    try {
      const content = fs.readFileSync(dashboardPagePath, 'utf-8');
      // The left column should contain both FatherStatePanel and StatusDictionaryPanel
      const leftColumnMatch = content.match(/<div className="space-y-4">[\s\S]*?<FatherStatePanel[\s\S]*?<StatusDictionaryPanel[\s\S]*?<\/div>/);
      isInLeftColumn = leftColumnMatch !== null;
    } catch {
      // File doesn't exist
    }
    
    expect(isInLeftColumn).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Test 4: Collapsible/expandable functionality and styling
// ---------------------------------------------------------------------------

describe('StatusDictionaryPanel collapsible/expandable functionality', () => {
  /**
   * Test that panel starts collapsed
   * 
   * Validates: Requirement 2.16
   */
  it('should start in collapsed state', () => {
    render(<StatusDictionaryPanel />);
    
    // Should show collapsed message
    expect(screen.getByText(/Click to expand/)).toBeInTheDocument();
    
    // Table headers should NOT be visible when collapsed
    expect(screen.queryByText('Description')).not.toBeInTheDocument();
  });

  /**
   * Test that clicking expands the panel
   * 
   * Validates: Requirement 2.16
   */
  it('should expand when header is clicked', async () => {
    const user = userEvent.setup();
    render(<StatusDictionaryPanel />);
    
    // Click to expand
    await user.click(screen.getByRole('button', { name: /Status Dictionary/i }));
    
    // Table headers should now be visible
    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
    
    // Collapsed message should be gone
    expect(screen.queryByText(/Click to expand/)).not.toBeInTheDocument();
  });

  /**
   * Test that clicking again collapses the panel
   * 
   * Validates: Requirement 2.16
   */
  it('should collapse when header is clicked again', async () => {
    const user = userEvent.setup();
    render(<StatusDictionaryPanel />);
    
    // Click to expand
    await user.click(screen.getByRole('button', { name: /Status Dictionary/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
    
    // Click to collapse
    await user.click(screen.getByRole('button', { name: /Status Dictionary/i }));
    
    // Table headers should NOT be visible again
    await waitFor(() => {
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });
    
    // Collapsed message should be back
    expect(screen.getByText(/Click to expand/)).toBeInTheDocument();
  });

  /**
   * Test aria-expanded attribute
   * 
   * Validates: Accessibility compliance
   */
  it('should have correct aria-expanded attribute', async () => {
    const user = userEvent.setup();
    render(<StatusDictionaryPanel />);
    
    const button = screen.getByRole('button', { name: /Status Dictionary/i });
    
    // Initially collapsed
    expect(button).toHaveAttribute('aria-expanded', 'false');
    
    // Click to expand
    await user.click(button);
    
    // Now expanded
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});

// ---------------------------------------------------------------------------
// Test 5: Responsive layout and styling
// ---------------------------------------------------------------------------

describe('StatusDictionaryPanel responsive layout and styling', () => {
  /**
   * Test that panel has correct container styling
   * 
   * Validates: Requirement 2.16
   */
  it('should have correct container styling classes', () => {
    render(<StatusDictionaryPanel />);
    
    const container = document.querySelector('.bg-white\\/5');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('border');
    expect(container).toHaveClass('rounded-xl');
    expect(container).toHaveClass('p-4');
  });

  /**
   * Test that state badges have correct colors
   * 
   * Validates: Requirement 2.16, 2.17
   */
  it('should have color-coded state badges', async () => {
    const user = userEvent.setup();
    render(<StatusDictionaryPanel />);
    
    // Expand the panel
    await user.click(screen.getByRole('button', { name: /Status Dictionary/i }));
    
    await waitFor(() => {
      // Find the Welcome badge
      const welcomeBadge = screen.getByText('Welcome');
      expect(welcomeBadge).toHaveClass('text-xs');
      expect(welcomeBadge).toHaveClass('rounded-full');
      
      // Find the Waiting badge
      const waitingBadge = screen.getByText('Waiting');
      expect(waitingBadge).toHaveClass('text-xs');
      expect(waitingBadge).toHaveClass('rounded-full');
    });
  });

  /**
   * Test that type badges have correct styling
   * 
   * Validates: Requirement 2.17
   */
  it('should have styled type badges', async () => {
    const user = userEvent.setup();
    render(<StatusDictionaryPanel />);
    
    // Expand the panel
    await user.click(screen.getByRole('button', { name: /Status Dictionary/i }));
    
    await waitFor(() => {
      // Find type badges (they're in the tbody, not thead)
      const actionBadges = screen.getAllByText('AI Action');
      
      // Check that action badges have expected styling
      expect(actionBadges.length).toBeGreaterThan(0);
      expect(actionBadges[0]).toHaveClass('text-xs');
      expect(actionBadges[0]).toHaveClass('rounded');
      expect(actionBadges[0]).toHaveClass('border');
      
      // Find state type badges (distinct from table header "State")
      // The type badge in tbody has specific styling
      const typeBadges = document.querySelectorAll('tbody .bg-gray-500\\/20');
      expect(typeBadges.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test that table has horizontal scroll for responsive design
   * 
   * Validates: Responsive design
   */
  it('should have overflow-x-auto for responsive table', async () => {
    const user = userEvent.setup();
    render(<StatusDictionaryPanel />);
    
    // Expand the panel
    await user.click(screen.getByRole('button', { name: /Status Dictionary/i }));
    
    await waitFor(() => {
      const scrollContainer = document.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  /**
   * Test that legend is displayed
   * 
   * Validates: Requirement 2.17
   */
  it('should display legend explaining state types', async () => {
    const user = userEvent.setup();
    render(<StatusDictionaryPanel />);
    
    // Expand the panel
    await user.click(screen.getByRole('button', { name: /Status Dictionary/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Passive waiting states/i)).toBeInTheDocument();
      expect(screen.getByText(/AI-driven interaction states/i)).toBeInTheDocument();
    });
  });

  /**
   * Test that rows have hover effect
   * 
   * Validates: UX design
   */
  it('should have hover styling on table rows', async () => {
    const user = userEvent.setup();
    render(<StatusDictionaryPanel />);
    
    // Expand the panel
    await user.click(screen.getByRole('button', { name: /Status Dictionary/i }));
    
    await waitFor(() => {
      const tableRows = document.querySelectorAll('tbody tr');
      expect(tableRows.length).toBeGreaterThan(0);
      
      // Check that rows have hover class
      tableRows.forEach(row => {
        expect(row).toHaveClass('hover:bg-white/5');
      });
    });
  });

  /**
   * Test that collapse arrow rotates when expanded
   * 
   * Validates: UX design
   */
  it('should rotate collapse arrow when expanded', async () => {
    const user = userEvent.setup();
    render(<StatusDictionaryPanel />);
    
    const button = screen.getByRole('button', { name: /Status Dictionary/i });
    
    // Initially not rotated (collapsed) - find the arrow span
    const getArrow = () => {
      const spans = button.querySelectorAll('span');
      // The arrow is the last span in the button (contains ▼)
      return Array.from(spans).find(span => span.textContent?.includes('▼'));
    };
    
    const arrowBefore = getArrow();
    expect(arrowBefore).not.toHaveClass('rotate-180');
    
    // Click to expand
    await user.click(button);
    
    // Should be rotated
    await waitFor(() => {
      const arrowAfter = getArrow();
      expect(arrowAfter).toHaveClass('rotate-180');
    });
  });
});

// ---------------------------------------------------------------------------
// Test 6: Status context integration with FatherStatePanel
// ---------------------------------------------------------------------------

describe('Status context integration with FatherStatePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test that context is displayed below the state badge
   * 
   * Validates: Requirement 2.18
   */
  it('should display context below the workflow state badge', async () => {
    mockFetchFatherState.mockResolvedValue(
      createMockFatherState({ current_state: 'WAITING' })
    );

    render(<FatherStatePanel fatherId={123} />);

    await waitFor(() => {
      // Should have both the state name and the contextual description
      expect(screen.getByText('WAITING')).toBeInTheDocument();
      expect(screen.getByText(/Waiting - No QT scheduled/i)).toBeInTheDocument();
    });
  });

  /**
   * Test that context is styled as italic text
   * 
   * Validates: Requirement 2.18, UX design
   */
  it('should style context text with italic class', async () => {
    mockFetchFatherState.mockResolvedValue(
      createMockFatherState({ current_state: 'WELCOME' })
    );

    render(<FatherStatePanel fatherId={123} />);

    await waitFor(() => {
      const contextElement = screen.getByText(/New father - onboarding in progress/i);
      expect(contextElement).toHaveClass('italic');
    });
  });

  /**
   * Test that WAITING state with scheduled QT shows time
   * 
   * Validates: Requirement 2.18
   */
  it('should show scheduled QT time for WAITING state', async () => {
    // Create a scheduled QT for 24 hours from now to ensure it's always in the future
    const futureDate = new Date();
    futureDate.setTime(futureDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    futureDate.setMinutes(0);
    futureDate.setSeconds(0);
    
    mockFetchFatherState.mockResolvedValue(
      createMockFatherState({
        current_state: 'WAITING',
        scheduled_quality_times: [
          {
            id: 1,
            status: 'SCHEDULED',
            scheduled_start: futureDate.toISOString(),
            scheduled_end: new Date(futureDate.getTime() + 60 * 60 * 1000).toISOString(),
          },
        ],
      })
    );

    render(<FatherStatePanel fatherId={123} />);

    await waitFor(() => {
      // Should contain a time reference in the body text
      const bodyText = document.body.textContent || '';
      const hasTimeReference = bodyText.includes('today at') || 
                               bodyText.includes('tomorrow at') ||
                               bodyText.includes('AM') ||
                               bodyText.includes('PM') ||
                               bodyText.includes('Quality Time scheduled for');
      expect(hasTimeReference).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
// 
// These unit tests verify the Bug 6 fix implementation:
// 
// 1. StatusDictionaryPanel renders all workflow states (WELCOME, SCHEDULE_QUALITY_TIME,
//    WAITING, QUALITY_TIME_PREPARATION, QUALITY_TIME_IN_PROGRESS, QUALITY_TIME_FOLLOW_UP,
//    ACTIVITY_IDEAS, BELT_PROMOTION)
// 
// 2. Contextual description generation (getStatusContext) returns correct descriptions:
//    - WELCOME → "New father - onboarding in progress"
//    - SCHEDULE_QUALITY_TIME → "Needs to schedule Quality Time"
//    - WAITING with QT → "Quality Time scheduled for {time}"
//    - WAITING without QT → "Waiting - No QT scheduled"
//    - QUALITY_TIME_FOLLOW_UP → "Following up on completed Quality Time"
//    - QUALITY_TIME_PREPARATION → "Quality Time starting soon"
//    - QUALITY_TIME_IN_PROGRESS → "Quality Time in progress"
//    - BELT_PROMOTION → "Belt promotion achieved!"
//    - ACTIVITY_IDEAS → "Browsing activity ideas"
// 
// 3. Dashboard integration with new component
//    - StatusDictionaryPanel is imported and rendered in dashboard page
//    - Placed correctly in left column layout
// 
// 4. Responsive layout and styling
//    - Collapsible/expandable functionality with aria-expanded
//    - Color-coded state badges
//    - Type badges (State vs AI Action)
//    - Horizontal scroll for responsive design
//    - Legend explaining state types
//    - Hover effects on rows
//    - Animated collapse arrow
// 
// ---------------------------------------------------------------------------
