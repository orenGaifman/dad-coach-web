import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Bug 6: Status Dictionary for Dashboard - Exploration Test
// ---------------------------------------------------------------------------
// 
// **Property 1: Bug Condition** - Vague WAITING Status Without Context
// 
// **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
// 
// **GOAL**: Surface counterexamples that demonstrate:
// 1. WAITING shows only state name without contextual description
// 2. No status dictionary panel exists
// 
// **Validates: Requirements 1.16, 1.17, 1.18**
// 
// Bug Condition Function:
// ```
// FUNCTION isVagueStatusBug(dashboardDisplay, fatherState)
//   INPUT: dashboardDisplay of type StatusDisplay, fatherState of type FatherState
//   OUTPUT: boolean
//   RETURN dashboardDisplay.showsOnlyStateName()
//          AND NOT dashboardDisplay.hasContextDescription()
//          AND NOT dashboardDisplay.hasStatusDictionary()
// END FUNCTION
// ```
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockFetchFatherState = vi.fn();

vi.mock('@/src/api/dev', () => ({
  fetchFatherState: () => mockFetchFatherState(),
}));

vi.mock('@/src/utils/timezone', () => ({
  formatIsraelDateTime: (date: string) => `Israel: ${date}`,
}));

// ---------------------------------------------------------------------------
// Import components after mocks
// ---------------------------------------------------------------------------

import { FatherStatePanel } from '../FatherStatePanel';

// ---------------------------------------------------------------------------
// Test Data: Father in WAITING state
// ---------------------------------------------------------------------------

const FATHER_IN_WAITING_STATE = {
  id: 123,
  phone: '+972501234567',
  display_name: 'Test Father',
  status: 'ACTIVE',
  workflow: {
    current_state: 'WAITING',
    previous_state: 'SCHEDULE_QUALITY_TIME',
    state_entered_at: '2024-01-15T10:00:00Z',
  },
  belt: {
    current: 'WHITE',
    total_quality_times_completed: 5,
    current_streak_weeks: 2,
  },
  children: [
    { id: 1, name: 'Child One', birth_date: '2020-01-01' },
  ],
  _partial: false,
  _errors: [],
};

// ---------------------------------------------------------------------------
// Bug Exploration Tests
// ---------------------------------------------------------------------------

describe('Bug 6: Status Dictionary for Dashboard - Bug Condition Exploration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchFatherState.mockResolvedValue(FATHER_IN_WAITING_STATE);
  });

  /**
   * **BUG CONDITION TEST 1: Vague WAITING Status Without Context**
   * 
   * Validates: Requirement 1.16
   * WHEN a father is in WAITING state THEN various interaction types are all 
   * handled by the same state with different AI actions, making debugging and 
   * state tracking difficult
   * 
   * This test SHOULD FAIL on unfixed code because:
   * - The current FatherStatePanel only shows "WAITING" without context
   * - After the fix, it should show something like "Waiting - QT scheduled for tomorrow at 3pm"
   * 
   * **EXPECTED OUTCOME**: Test FAILS (only state name shown, no contextual description)
   */
  it('should show contextual description for WAITING state (currently shows only state name)', async () => {
    render(<FatherStatePanel fatherId={123} />);

    // Wait for the component to render with WAITING state
    await waitFor(() => {
      // Use getAllByText since there may be multiple elements containing WAITING
      const waitingElements = screen.getAllByText(/WAITING/i);
      expect(waitingElements.length).toBeGreaterThan(0);
    });

    // This assertion will FAIL on unfixed code because FatherStatePanel
    // currently shows only "WAITING" without any contextual description
    // like "Waiting - QT scheduled for ..." or "Waiting - morning reminder pending"
    
    // Look for contextual status text - should contain more than just the state name
    // The fix should add getStatusContext() function that returns meaningful descriptions
    
    // Search for any element that contains contextual waiting information
    const bodyText = document.body.textContent || '';
    
    // Check for the contextual description text pattern
    // After the fix, getStatusContext() returns "Waiting - No QT scheduled" or similar
    const hasContextualDescription = 
      bodyText.toLowerCase().includes('waiting -') ||
      bodyText.toLowerCase().includes('scheduled') ||
      bodyText.includes('QT') ||
      bodyText.includes('Quality Time') ||
      bodyText.includes('reminder') ||
      bodyText.toLowerCase().includes('waiting for');
    
    expect(hasContextualDescription).toBe(true);
  });

  /**
   * **BUG CONDITION TEST 2: Status Dictionary Panel Does Not Exist**
   * 
   * Validates: Requirements 1.17, 1.18
   * WHEN reviewing logs or dashboard data for fathers in WAITING state THEN 
   * it is unclear what specific phase of interaction they are in
   * 
   * The fix should add a StatusDictionaryPanel component that displays:
   * - State name
   * - Definition/description
   * - Type (AI action vs State)
   * 
   * This test verifies that StatusDictionaryPanel exists AND can be imported.
   * Note: The panel is rendered separately on the dashboard page, not inside FatherStatePanel.
   * 
   * **EXPECTED OUTCOME**: Test FAILS (no StatusDictionaryPanel component exists)
   */
  it('should include a Status Dictionary panel with state definitions', async () => {
    // Check if StatusDictionaryPanel exists and can be imported
    const componentPath = path.resolve(__dirname, '../StatusDictionaryPanel.tsx');
    
    let fileExists = false;
    let hasStateDefinitions = false;
    
    try {
      fs.accessSync(componentPath);
      fileExists = true;
      
      // Also verify it contains state definitions (the core of the fix)
      const content = fs.readFileSync(componentPath, 'utf-8');
      hasStateDefinitions = 
        content.includes('WELCOME') &&
        content.includes('WAITING') &&
        content.includes('SCHEDULE_QUALITY_TIME');
    } catch {
      fileExists = false;
    }
    
    // This will FAIL on unfixed code because:
    // - There is no StatusDictionaryPanel component yet
    // After the fix, the component should exist and contain state definitions
    expect(fileExists).toBe(true);
    expect(hasStateDefinitions).toBe(true);
  });

  /**
   * **BUG CONDITION TEST 3: WAITING State Shows Only Raw State Name**
   * 
   * Validates: Requirement 1.16
   * The current behavior shows just "WAITING" or "WAITING" with spaces 
   * (i.e., "WAITING" converted to "WAITING" via replace(/_/g, ' '))
   * but no meaningful context about WHAT the father is waiting for.
   * 
   * This is a more direct test that verifies the raw state display without context.
   * 
   * **EXPECTED OUTCOME**: Test FAILS (state shows only name, not context)
   */
  it('should not show bare WAITING state without context explanation', async () => {
    render(<FatherStatePanel fatherId={123} />);

    // Wait for the component to render
    await waitFor(() => {
      // Use getAllByText since there may be multiple elements containing WAITING
      const waitingElements = screen.getAllByText(/WAITING/i);
      expect(waitingElements.length).toBeGreaterThan(0);
    });

    // This assertion will FAIL on unfixed code because the current implementation
    // shows the raw state name "WAITING" without any context.
    // After the fix, any display of "WAITING" should be accompanied by context.
    
    // Look for the contextual description element that should now exist
    // The fix adds a context span with italic text below the state badge
    const bodyText = document.body.textContent || '';
    
    // After the fix, the getStatusContext() returns contextual descriptions
    // like "Waiting - No QT scheduled" or "Quality Time scheduled for..."
    const hasContext = 
      bodyText.toLowerCase().includes('waiting -') || 
      bodyText.toLowerCase().includes('no qt scheduled') ||
      bodyText.toLowerCase().includes('scheduled for') ||
      bodyText.toLowerCase().includes('quality time');
    
    expect(hasContext).toBe(true);
  });

  /**
   * **BUG CONDITION TEST 4: StatusDictionaryPanel Component File Does Not Exist**
   * 
   * Validates: Requirements 2.16, 2.17, 2.18
   * WHEN displaying father status in the dashboard THEN the system SHALL show 
   * a status dictionary/table that includes: status name, definition/description, 
   * and type (AI action vs State)
   * 
   * This test verifies that the StatusDictionaryPanel file exists.
   * 
   * **EXPECTED OUTCOME**: Test FAILS (no StatusDictionaryPanel file exists)
   */
  it('should have StatusDictionaryPanel component file', async () => {
    // Check if the StatusDictionaryPanel file exists
    const componentPath = path.resolve(__dirname, '../StatusDictionaryPanel.tsx');
    
    let fileExists = false;
    try {
      fs.accessSync(componentPath);
      fileExists = true;
    } catch {
      fileExists = false;
    }
    
    // This will FAIL on unfixed code because the file doesn't exist yet
    expect(fileExists).toBe(true);
  });

  /**
   * **BUG CONDITION TEST 5: Dashboard Page Does Not Import StatusDictionaryPanel**
   * 
   * Validates: Requirement 1.18
   * WHEN the WAITING state handles multiple scenarios THEN the AI action strings 
   * are the only way to distinguish between them, which is not reflected in the 
   * state machine visualization or status tracking
   * 
   * After the fix, the dashboard page should import and render StatusDictionaryPanel.
   * 
   * **EXPECTED OUTCOME**: Test FAILS (dashboard doesn't import StatusDictionaryPanel)
   */
  it('should have StatusDictionaryPanel imported in dashboard page', async () => {
    // Read the dashboard page file to check for StatusDictionaryPanel import
    const dashboardPagePath = path.resolve(__dirname, '../../page.tsx');
    
    let hasStatusDictionaryImport = false;
    try {
      const content = fs.readFileSync(dashboardPagePath, 'utf-8');
      hasStatusDictionaryImport = content.includes('StatusDictionaryPanel');
    } catch {
      hasStatusDictionaryImport = false;
    }
    
    // This will FAIL on unfixed code because the dashboard doesn't import this component yet
    expect(hasStatusDictionaryImport).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
// 
// These tests are designed to FAIL on the current unfixed codebase because:
// 
// 1. FatherStatePanel shows only raw state names without contextual descriptions
// 2. StatusDictionaryPanel component file does not exist
// 3. Dashboard page doesn't import or render StatusDictionaryPanel
// 4. No contextual status descriptions are shown for WAITING state
// 
// After the bug is fixed (tasks 23.1 - 23.5), these tests should PASS because:
// 
// 1. FatherStatePanel will include getStatusContext() that adds meaningful 
//    descriptions like "Waiting - QT scheduled for tomorrow at 3pm"
// 2. StatusDictionaryPanel.tsx component will be created with all workflow state 
//    definitions, descriptions, and possible actions
// 3. Dashboard page will import and render StatusDictionaryPanel
// 4. Users will see meaningful context instead of just state names
// 
// ---------------------------------------------------------------------------
