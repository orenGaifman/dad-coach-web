import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PreferencesForm } from '@/src/components/onboarding/PreferencesForm';
import {
  COACHING_STYLE_OPTIONS,
  NOTIFICATION_FREQUENCY_OPTIONS,
  DEFAULTS,
} from '@/src/constants/onboarding';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PreferencesForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it('renders all coaching style cards with labels and descriptions', () => {
    render(<PreferencesForm onSubmit={mockOnSubmit} />);

    for (const option of COACHING_STYLE_OPTIONS) {
      expect(screen.getByText(option.label)).toBeInTheDocument();
      expect(screen.getByText(option.description)).toBeInTheDocument();
    }
  });

  it('renders coaching time select with 48 options (30-min intervals)', () => {
    render(<PreferencesForm onSubmit={mockOnSubmit} />);

    const timeSelect = screen.getByLabelText('Preferred coaching time');
    expect(timeSelect).toBeInTheDocument();

    const options = timeSelect.querySelectorAll('option');
    expect(options).toHaveLength(48);
    expect(options[0]).toHaveValue('00:00');
    expect(options[1]).toHaveValue('00:30');
    expect(options[47]).toHaveValue('23:30');
  });

  it('renders notification frequency options', () => {
    render(<PreferencesForm onSubmit={mockOnSubmit} />);

    for (const option of NOTIFICATION_FREQUENCY_OPTIONS) {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    }
  });

  it('renders quiet hours start and end selects', () => {
    render(<PreferencesForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Defaults
  // -------------------------------------------------------------------------

  it('selects BALANCED coaching style by default', () => {
    render(<PreferencesForm onSubmit={mockOnSubmit} />);

    const balancedRadio = screen
      .getByText('Balanced')
      .closest('label')!
      .querySelector('input[type="radio"]') as HTMLInputElement;
    expect(balancedRadio.checked).toBe(true);
  });

  it('sets default coaching time to 08:00', () => {
    render(<PreferencesForm onSubmit={mockOnSubmit} />);

    const timeSelect = screen.getByLabelText('Preferred coaching time') as HTMLSelectElement;
    expect(timeSelect.value).toBe(DEFAULTS.COACHING_TIME);
  });

  it('selects DAILY notification frequency by default', () => {
    render(<PreferencesForm onSubmit={mockOnSubmit} />);

    const dailyRadio = screen
      .getByText('Daily')
      .closest('label')!
      .querySelector('input[type="radio"]') as HTMLInputElement;
    expect(dailyRadio.checked).toBe(true);
  });

  it('sets default quiet hours to 21:00–07:00', () => {
    render(<PreferencesForm onSubmit={mockOnSubmit} />);

    const startSelect = screen.getByLabelText('From') as HTMLSelectElement;
    const endSelect = screen.getByLabelText('To') as HTMLSelectElement;
    expect(startSelect.value).toBe(DEFAULTS.QUIET_HOURS_START);
    expect(endSelect.value).toBe(DEFAULTS.QUIET_HOURS_END);
  });

  // -------------------------------------------------------------------------
  // Interactions
  // -------------------------------------------------------------------------

  it('changes coaching style on card click', async () => {
    const user = userEvent.setup();
    render(<PreferencesForm onSubmit={mockOnSubmit} />);

    const gentleLabel = screen.getByText('Gentle').closest('label')!;
    await user.click(gentleLabel);

    const gentleRadio = gentleLabel.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(gentleRadio.checked).toBe(true);

    // Balanced should be deselected
    const balancedRadio = screen
      .getByText('Balanced')
      .closest('label')!
      .querySelector('input[type="radio"]') as HTMLInputElement;
    expect(balancedRadio.checked).toBe(false);
  });

  it('applies selected styling to chosen coaching style card', async () => {
    const user = userEvent.setup();
    render(<PreferencesForm onSubmit={mockOnSubmit} />);

    const directLabel = screen.getByText('Direct').closest('label')!;
    expect(directLabel.className).toContain('bg-white/5');

    await user.click(directLabel);
    expect(directLabel.className).toContain('bg-indigo-500/10');
    expect(directLabel.className).toContain('border-indigo-500');
  });

  it('changes notification frequency on selection', async () => {
    const user = userEvent.setup();
    render(<PreferencesForm onSubmit={mockOnSubmit} />);

    const everyOtherLabel = screen.getByText('Every other day').closest('label')!;
    await user.click(everyOtherLabel);

    const radio = everyOtherLabel.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(radio.checked).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Submission
  // -------------------------------------------------------------------------

  it('submits with all default values', async () => {
    const user = userEvent.setup();
    const { container } = render(<PreferencesForm onSubmit={mockOnSubmit} />);

    const form = container.querySelector('form')!;
    await user.click(form.querySelector('button[type="submit"]')!);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      coaching_style: DEFAULTS.COACHING_STYLE,
      preferred_coaching_time: DEFAULTS.COACHING_TIME,
      notification_frequency: DEFAULTS.NOTIFICATION_FREQUENCY,
      quiet_hours_start: DEFAULTS.QUIET_HOURS_START,
      quiet_hours_end: DEFAULTS.QUIET_HOURS_END,
    });
  });

  it('submits with changed values', async () => {
    const user = userEvent.setup();
    const { container } = render(<PreferencesForm onSubmit={mockOnSubmit} />);

    // Change coaching style to DIRECT
    await user.click(screen.getByText('Direct').closest('label')!);

    // Change coaching time
    const timeSelect = screen.getByLabelText('Preferred coaching time');
    await user.selectOptions(timeSelect, '09:30');

    // Change frequency
    await user.click(screen.getByText('Twice a week').closest('label')!);

    // Submit
    const form = container.querySelector('form')!;
    await user.click(form.querySelector('button[type="submit"]')!);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      coaching_style: 'DIRECT',
      preferred_coaching_time: '09:30',
      notification_frequency: 'TWICE_WEEKLY',
      quiet_hours_start: DEFAULTS.QUIET_HOURS_START,
      quiet_hours_end: DEFAULTS.QUIET_HOURS_END,
    });
  });

  // -------------------------------------------------------------------------
  // Initial data
  // -------------------------------------------------------------------------

  it('pre-fills from initialData', () => {
    render(
      <PreferencesForm
        onSubmit={mockOnSubmit}
        initialData={{
          coaching_style: 'MOTIVATIONAL',
          preferred_coaching_time: '14:00',
          notification_frequency: 'EVERY_OTHER_DAY',
          quiet_hours_start: '22:00',
          quiet_hours_end: '06:00',
        }}
      />,
    );

    // Coaching style
    const motivationalRadio = screen
      .getByText('Motivational')
      .closest('label')!
      .querySelector('input[type="radio"]') as HTMLInputElement;
    expect(motivationalRadio.checked).toBe(true);

    // Time
    const timeSelect = screen.getByLabelText('Preferred coaching time') as HTMLSelectElement;
    expect(timeSelect.value).toBe('14:00');

    // Frequency
    const everyOtherRadio = screen
      .getByText('Every other day')
      .closest('label')!
      .querySelector('input[type="radio"]') as HTMLInputElement;
    expect(everyOtherRadio.checked).toBe(true);

    // Quiet hours
    const startSelect = screen.getByLabelText('From') as HTMLSelectElement;
    const endSelect = screen.getByLabelText('To') as HTMLSelectElement;
    expect(startSelect.value).toBe('22:00');
    expect(endSelect.value).toBe('06:00');
  });

  // -------------------------------------------------------------------------
  // ForwardRef
  // -------------------------------------------------------------------------

  it('exposes form element via ref', () => {
    const ref = { current: null as HTMLFormElement | null };
    render(<PreferencesForm ref={ref} onSubmit={mockOnSubmit} />);

    expect(ref.current).toBeInstanceOf(HTMLFormElement);
  });
});
