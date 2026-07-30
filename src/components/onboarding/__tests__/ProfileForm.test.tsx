import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

import { ProfileForm, profileSchema } from '@/src/components/onboarding/ProfileForm';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProfileForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it('renders the illustration image', () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    const img = screen.getByAltText('Your Profile');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/illustrations/onboarding-father-info.webp');
  });

  it('renders all form fields with labels', () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
    expect(screen.getByLabelText('WhatsApp Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Email (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Timezone')).toBeInTheDocument();
  });

  it('renders heading text', () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText("Let's start your journey")).toBeInTheDocument();
    expect(screen.getByText('Just a few quick questions')).toBeInTheDocument();
  });

  it('renders country code selector with default +972', () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    const countrySelect = screen.getByLabelText('Country code') as HTMLSelectElement;
    expect(countrySelect.value).toBe('+972');
  });

  // -------------------------------------------------------------------------
  // Timezone auto-detect (Req 4.5)
  // -------------------------------------------------------------------------

  it('auto-detects timezone from browser on mount', () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    const timezoneSelect = screen.getByLabelText('Timezone') as HTMLSelectElement;
    // Should be populated with browser-detected timezone
    expect(timezoneSelect.value).not.toBe('');
  });

  it('uses initialData timezone if provided', () => {
    render(
      <ProfileForm
        onSubmit={mockOnSubmit}
        initialData={{ timezone: 'America/New_York' }}
      />,
    );

    const timezoneSelect = screen.getByLabelText('Timezone') as HTMLSelectElement;
    expect(timezoneSelect.value).toBe('America/New_York');
  });

  // -------------------------------------------------------------------------
  // Validation — display_name (Req 4.2)
  // -------------------------------------------------------------------------

  it('shows error when display_name is too short on blur', async () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('Display Name');
    await userEvent.type(nameInput, 'A');
    fireEvent.blur(nameInput);

    expect(await screen.findByText('Name must be at least 2 characters')).toBeInTheDocument();
  });

  it('shows error for invalid characters in display_name', async () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('Display Name');
    await userEvent.type(nameInput, 'John123');
    fireEvent.blur(nameInput);

    expect(await screen.findByText('Name can only contain letters and spaces')).toBeInTheDocument();
  });

  it('does not show error for valid Unicode display_name', async () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('Display Name');
    await userEvent.type(nameInput, 'אבא שלי');
    fireEvent.blur(nameInput);

    expect(screen.queryByText(/Name must be at least/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Name can only contain/)).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Validation — phone (Req 4.3)
  // -------------------------------------------------------------------------

  it('shows error when phone is empty on submit', async () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('Display Name');
    await userEvent.type(nameInput, 'Valid Name');

    // Submit the form
    const form = nameInput.closest('form')!;
    fireEvent.submit(form);

    expect(await screen.findByText('Phone number is required')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Validation — email (Req 4.4)
  // -------------------------------------------------------------------------

  it('does not show error when email is empty (optional field)', async () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText('Email (optional)');
    fireEvent.blur(emailInput);

    expect(screen.queryByText('Please enter a valid email')).not.toBeInTheDocument();
  });

  it('shows error for invalid email format', async () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText('Email (optional)');
    await userEvent.type(emailInput, 'not-an-email');
    fireEvent.blur(emailInput);

    expect(await screen.findByText('Please enter a valid email')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Successful submission
  // -------------------------------------------------------------------------

  it('calls onSubmit with form data on valid submission', async () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByLabelText('Display Name'), 'John Doe');
    await userEvent.type(screen.getByLabelText('WhatsApp Number'), '501234567');

    // Submit the form
    const form = screen.getByLabelText('Display Name').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    const callArgs = mockOnSubmit.mock.calls[0][0];
    expect(callArgs.displayName).toBe('John Doe');
    expect(callArgs.phoneNumber).toBe('501234567');
    expect(callArgs.countryCode).toBe('+972');
    expect(callArgs.timezone).toBeTruthy();
  });

  it('does not call onSubmit when form is invalid', async () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    // Submit with empty fields
    const form = screen.getByLabelText('Display Name').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Server errors
  // -------------------------------------------------------------------------

  it('displays server errors passed via props', () => {
    render(
      <ProfileForm
        onSubmit={mockOnSubmit}
        serverErrors={{ phoneNumber: 'Phone already registered' }}
      />,
    );

    expect(screen.getByText('Phone already registered')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Focus first invalid field on submit failure (Req 4.7)
  // -------------------------------------------------------------------------

  it('focuses first invalid field on submit failure', async () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    // Submit with empty displayName (first field) — should focus it
    const form = screen.getByLabelText('Display Name').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByLabelText('Display Name'));
    });
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------

  it('links error messages to inputs via aria-describedby', async () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('Display Name');
    // Type a single character and then clear focus to trigger blur validation
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'A');
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    });

    // After the error renders, verify aria attributes
    expect(nameInput).toHaveAttribute('aria-describedby', 'displayName-error');
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  });

  // -------------------------------------------------------------------------
  // Initial data
  // -------------------------------------------------------------------------

  it('pre-fills form with initialData', () => {
    render(
      <ProfileForm
        onSubmit={mockOnSubmit}
        initialData={{
          displayName: 'Existing Name',
          phoneNumber: '501234567',
          countryCode: '+1',
          email: 'test@example.com',
          timezone: 'Europe/London',
        }}
      />,
    );

    expect((screen.getByLabelText('Display Name') as HTMLInputElement).value).toBe('Existing Name');
    expect((screen.getByLabelText('WhatsApp Number') as HTMLInputElement).value).toBe('501234567');
    expect((screen.getByLabelText('Country code') as HTMLSelectElement).value).toBe('+1');
    expect((screen.getByLabelText('Email (optional)') as HTMLInputElement).value).toBe('test@example.com');
    expect((screen.getByLabelText('Timezone') as HTMLSelectElement).value).toBe('Europe/London');
  });
});

// ---------------------------------------------------------------------------
// Zod Schema Unit Tests
// ---------------------------------------------------------------------------

describe('profileSchema', () => {
  it('validates a correct profile', () => {
    const result = profileSchema.safeParse({
      displayName: 'John Doe',
      phoneNumber: '501234567',
      countryCode: '+972',
      email: 'john@example.com',
      timezone: 'Asia/Jerusalem',
    });
    expect(result.success).toBe(true);
  });

  it('rejects display_name shorter than 2 chars', () => {
    const result = profileSchema.safeParse({
      displayName: 'J',
      phoneNumber: '501234567',
      countryCode: '+972',
      email: '',
      timezone: 'Asia/Jerusalem',
    });
    expect(result.success).toBe(false);
  });

  it('rejects display_name with numbers', () => {
    const result = profileSchema.safeParse({
      displayName: 'John123',
      phoneNumber: '501234567',
      countryCode: '+972',
      email: '',
      timezone: 'Asia/Jerusalem',
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty email', () => {
    const result = profileSchema.safeParse({
      displayName: 'John Doe',
      phoneNumber: '501234567',
      countryCode: '+972',
      email: '',
      timezone: 'Asia/Jerusalem',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email format', () => {
    const result = profileSchema.safeParse({
      displayName: 'John Doe',
      phoneNumber: '501234567',
      countryCode: '+972',
      email: 'not-valid',
      timezone: 'Asia/Jerusalem',
    });
    expect(result.success).toBe(false);
  });

  it('accepts Unicode names (Hebrew)', () => {
    const result = profileSchema.safeParse({
      displayName: 'אבא שלי',
      phoneNumber: '501234567',
      countryCode: '+972',
      email: '',
      timezone: 'Asia/Jerusalem',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty timezone', () => {
    const result = profileSchema.safeParse({
      displayName: 'John Doe',
      phoneNumber: '501234567',
      countryCode: '+972',
      email: '',
      timezone: '',
    });
    expect(result.success).toBe(false);
  });
});
