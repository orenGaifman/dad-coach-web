import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { GoalsSelector } from '@/src/components/onboarding/GoalsSelector';
import { PREDEFINED_GOALS, VALIDATION } from '@/src/constants/onboarding';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GoalsSelector', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it('renders the header illustration', () => {
    render(<GoalsSelector onSubmit={mockOnSubmit} />);

    const img = screen.getByAltText('Goals');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/illustrations/onboarding-goals.webp');
  });

  it('renders heading and subtitle', () => {
    render(<GoalsSelector onSubmit={mockOnSubmit} />);

    expect(
      screen.getByText('What would you like to improve as a father?'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`(Choose up to ${VALIDATION.MAX_GOALS})`),
    ).toBeInTheDocument();
  });

  it('renders all 7 predefined goals', () => {
    render(<GoalsSelector onSubmit={mockOnSubmit} />);

    for (const goal of PREDEFINED_GOALS) {
      expect(screen.getByText(goal.label)).toBeInTheDocument();
    }
  });

  it('renders custom goal input with label', () => {
    render(<GoalsSelector onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('Custom goal (optional)')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Selection behavior
  // -------------------------------------------------------------------------

  it('toggles goal selection on click', async () => {
    const user = userEvent.setup();
    render(<GoalsSelector onSubmit={mockOnSubmit} />);

    const goalLabel = screen.getByText(PREDEFINED_GOALS[0].label);
    const checkbox = goalLabel.closest('label')!.querySelector('input[type="checkbox"]') as HTMLInputElement;

    expect(checkbox.checked).toBe(false);

    await user.click(goalLabel);
    expect(checkbox.checked).toBe(true);

    await user.click(goalLabel);
    expect(checkbox.checked).toBe(false);
  });

  it('prevents selecting more than MAX_GOALS goals', async () => {
    const user = userEvent.setup();
    render(<GoalsSelector onSubmit={mockOnSubmit} />);

    // Select 5 goals (max)
    for (let i = 0; i < VALIDATION.MAX_GOALS; i++) {
      await user.click(screen.getByText(PREDEFINED_GOALS[i].label));
    }

    // Try to select a 6th
    await user.click(screen.getByText(PREDEFINED_GOALS[5].label));

    // 6th should NOT be selected
    const sixthCheckbox = screen
      .getByText(PREDEFINED_GOALS[5].label)
      .closest('label')!
      .querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(sixthCheckbox.checked).toBe(false);
  });

  it('applies selected styling to selected goals', async () => {
    const user = userEvent.setup();
    render(<GoalsSelector onSubmit={mockOnSubmit} />);

    const goalLabel = screen.getByText(PREDEFINED_GOALS[0].label).closest('label')!;
    expect(goalLabel.className).toContain('bg-white/5');

    await user.click(goalLabel);
    expect(goalLabel.className).toContain('bg-indigo-500/10');
    expect(goalLabel.className).toContain('border-indigo-500');
  });

  // -------------------------------------------------------------------------
  // Custom goal input
  // -------------------------------------------------------------------------

  it('allows typing a custom goal', async () => {
    const user = userEvent.setup();
    render(<GoalsSelector onSubmit={mockOnSubmit} />);

    const input = screen.getByLabelText('Custom goal (optional)');
    await user.type(input, 'My custom goal');

    expect(input).toHaveValue('My custom goal');
  });

  it('shows character count for custom goal', async () => {
    const user = userEvent.setup();
    render(<GoalsSelector onSubmit={mockOnSubmit} />);

    expect(screen.getByText(`0/${VALIDATION.CUSTOM_GOAL_MAX}`)).toBeInTheDocument();

    const input = screen.getByLabelText('Custom goal (optional)');
    await user.type(input, 'Hello');

    expect(screen.getByText(`5/${VALIDATION.CUSTOM_GOAL_MAX}`)).toBeInTheDocument();
  });

  it('enforces max length on custom goal input', async () => {
    const user = userEvent.setup();
    render(<GoalsSelector onSubmit={mockOnSubmit} />);

    const input = screen.getByLabelText('Custom goal (optional)');
    const longText = 'a'.repeat(VALIDATION.CUSTOM_GOAL_MAX + 10);
    await user.type(input, longText);

    expect((input as HTMLInputElement).value.length).toBeLessThanOrEqual(
      VALIDATION.CUSTOM_GOAL_MAX,
    );
  });

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  it('shows validation error when submitting with 0 goals', async () => {
    const user = userEvent.setup();
    const { container } = render(<GoalsSelector onSubmit={mockOnSubmit} />);

    // Trigger form submission
    const form = container.querySelector('form')!;
    await user.click(form.querySelector('button[type="submit"]')!);

    expect(
      screen.getByText(`Select ${VALIDATION.MIN_GOALS}–${VALIDATION.MAX_GOALS} goals`),
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits successfully with valid selection', async () => {
    const user = userEvent.setup();
    const { container } = render(<GoalsSelector onSubmit={mockOnSubmit} />);

    // Select 2 goals
    await user.click(screen.getByText(PREDEFINED_GOALS[0].label));
    await user.click(screen.getByText(PREDEFINED_GOALS[1].label));

    // Submit
    const form = container.querySelector('form')!;
    await user.click(form.querySelector('button[type="submit"]')!);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      selected_goals: [PREDEFINED_GOALS[0].id, PREDEFINED_GOALS[1].id],
    });
  });

  it('includes custom goal in submission when provided', async () => {
    const user = userEvent.setup();
    const { container } = render(<GoalsSelector onSubmit={mockOnSubmit} />);

    // Select 1 goal
    await user.click(screen.getByText(PREDEFINED_GOALS[0].label));

    // Type custom goal
    const input = screen.getByLabelText('Custom goal (optional)');
    await user.type(input, 'Be a better listener');

    // Submit
    const form = container.querySelector('form')!;
    await user.click(form.querySelector('button[type="submit"]')!);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      selected_goals: [PREDEFINED_GOALS[0].id],
      custom_goal: 'Be a better listener',
    });
  });

  // -------------------------------------------------------------------------
  // Initial data
  // -------------------------------------------------------------------------

  it('pre-selects goals from initialData', () => {
    render(
      <GoalsSelector
        onSubmit={mockOnSubmit}
        initialData={{
          selected_goals: [PREDEFINED_GOALS[0].id, PREDEFINED_GOALS[2].id],
          custom_goal: 'Pre-existing goal',
        }}
      />,
    );

    const firstCheckbox = screen
      .getByText(PREDEFINED_GOALS[0].label)
      .closest('label')!
      .querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(firstCheckbox.checked).toBe(true);

    const thirdCheckbox = screen
      .getByText(PREDEFINED_GOALS[2].label)
      .closest('label')!
      .querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(thirdCheckbox.checked).toBe(true);

    const input = screen.getByLabelText('Custom goal (optional)');
    expect(input).toHaveValue('Pre-existing goal');
  });
});
