import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useParams: () => ({ token: 'test-token' }),
}));

const mockGoForward = vi.fn();
const mockMarkStepCompleted = vi.fn();
const mockSetIsSubmitting = vi.fn();

vi.mock('@/src/components/onboarding/OnboardingProvider', () => ({
  useOnboarding: () => ({
    sessionId: 'session-123',
    currentStep: 'FATHER_PROFILE',
    completedSteps: ['LANGUAGE'],
    isSubmitting: false,
    goForward: mockGoForward,
    goBack: vi.fn(),
    skipStep: vi.fn(),
    markStepCompleted: mockMarkStepCompleted,
    setIsSubmitting: mockSetIsSubmitting,
    setError: vi.fn(),
  }),
}));

vi.mock('@/src/hooks/useStepGuard', () => ({
  useStepGuard: () => ({ isAllowed: true }),
}));

const mockSubmitStep = vi.fn();
vi.mock('@/src/services/onboarding', () => ({
  submitStep: (...args: unknown[]) => mockSubmitStep(...args),
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import ProfilePage from '../page';
import { ApiError } from '@/src/lib/api-client';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProfilePage — HTTP 409 duplicate phone handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "already registered" message with login link on 409', async () => {
    mockSubmitStep.mockRejectedValueOnce(
      new ApiError(409, { code: 'PHONE_ALREADY_REGISTERED', message: 'Phone already registered' }),
    );

    render(<ProfilePage />);

    // Fill in valid form data
    await userEvent.type(screen.getByLabelText('Display Name'), 'John Doe');
    await userEvent.type(screen.getByLabelText('WhatsApp Number'), '501234567');

    // Submit the form
    const form = screen.getByLabelText('Display Name').closest('form')!;
    fireEvent.submit(form);

    // Wait for the duplicate phone message to appear
    await waitFor(() => {
      expect(screen.getByText('This number is already registered.')).toBeInTheDocument();
    });

    // Login link should be present
    const loginLink = screen.getByText('Would you like to log in instead?');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('shows field-level error on other API validation errors', async () => {
    mockSubmitStep.mockRejectedValueOnce(
      new ApiError(400, { code: 'INVALID_DISPLAY_NAME', message: 'Name contains invalid characters' }),
    );

    render(<ProfilePage />);

    await userEvent.type(screen.getByLabelText('Display Name'), 'Valid Name');
    await userEvent.type(screen.getByLabelText('WhatsApp Number'), '501234567');

    const form = screen.getByLabelText('Display Name').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Name contains invalid characters')).toBeInTheDocument();
    });
  });

  it('shows generic error message on unexpected errors', async () => {
    mockSubmitStep.mockRejectedValueOnce(new Error('Network error'));

    render(<ProfilePage />);

    await userEvent.type(screen.getByLabelText('Display Name'), 'Valid Name');
    await userEvent.type(screen.getByLabelText('WhatsApp Number'), '501234567');

    const form = screen.getByLabelText('Display Name').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });

  it('navigates forward on successful submission', async () => {
    mockSubmitStep.mockResolvedValueOnce({
      success: true,
      next_step: 'CHILDREN',
      completed_steps: ['LANGUAGE', 'FATHER_PROFILE'],
    });

    render(<ProfilePage />);

    await userEvent.type(screen.getByLabelText('Display Name'), 'John Doe');
    await userEvent.type(screen.getByLabelText('WhatsApp Number'), '501234567');

    const form = screen.getByLabelText('Display Name').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockMarkStepCompleted).toHaveBeenCalledWith('FATHER_PROFILE');
      expect(mockGoForward).toHaveBeenCalled();
    });
  });

  it('submits data in snake_case format for backend', async () => {
    mockSubmitStep.mockResolvedValueOnce({
      success: true,
      next_step: 'CHILDREN',
      completed_steps: ['LANGUAGE', 'FATHER_PROFILE'],
    });

    render(<ProfilePage />);

    await userEvent.type(screen.getByLabelText('Display Name'), 'John Doe');
    await userEvent.type(screen.getByLabelText('WhatsApp Number'), '501234567');

    const form = screen.getByLabelText('Display Name').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSubmitStep).toHaveBeenCalledWith(
        'session-123',
        'FATHER_PROFILE',
        expect.objectContaining({
          display_name: 'John Doe',
          phone_number: '+972501234567',
        }),
      );
    });
  });

  it('clears duplicate phone message on re-submit', async () => {
    // First call: 409
    mockSubmitStep.mockRejectedValueOnce(
      new ApiError(409, { code: 'PHONE_ALREADY_REGISTERED', message: 'Phone already registered' }),
    );
    // Second call: success
    mockSubmitStep.mockResolvedValueOnce({
      success: true,
      next_step: 'CHILDREN',
      completed_steps: ['LANGUAGE', 'FATHER_PROFILE'],
    });

    render(<ProfilePage />);

    await userEvent.type(screen.getByLabelText('Display Name'), 'John Doe');
    await userEvent.type(screen.getByLabelText('WhatsApp Number'), '501234567');

    const form = screen.getByLabelText('Display Name').closest('form')!;
    fireEvent.submit(form);

    // Wait for duplicate message
    await waitFor(() => {
      expect(screen.getByText('This number is already registered.')).toBeInTheDocument();
    });

    // Correct the phone and re-submit
    const phoneInput = screen.getByLabelText('WhatsApp Number');
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, '509876543');
    fireEvent.submit(form);

    // The duplicate message should be cleared
    await waitFor(() => {
      expect(screen.queryByText('This number is already registered.')).not.toBeInTheDocument();
    });
  });
});
