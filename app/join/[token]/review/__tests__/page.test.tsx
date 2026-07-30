import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { WizardStep } from '@/src/types/onboarding';
import { ApiError } from '@/src/lib/api-client';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockGoForward = vi.fn();
const mockMarkStepCompleted = vi.fn();
const mockSetCurrentStep = vi.fn();
const mockSetEditingFromReview = vi.fn();
const mockRouterPush = vi.fn();

const mockGetSession = vi.fn();
const mockCompleteOnboarding = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ token: 'test-token' }),
  useRouter: () => ({ push: mockRouterPush, replace: vi.fn() }),
}));

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

vi.mock('@/src/components/onboarding/OnboardingProvider', () => ({
  useOnboarding: () => ({
    sessionId: 'session-123',
    language: 'en',
    currentStep: WizardStep.REVIEW,
    completedSteps: [WizardStep.LANGUAGE, WizardStep.FATHER_PROFILE],
    isSubmitting: false,
    goForward: mockGoForward,
    goBack: vi.fn(),
    skipStep: vi.fn(),
    markStepCompleted: mockMarkStepCompleted,
    setCurrentStep: mockSetCurrentStep,
    setEditingFromReview: mockSetEditingFromReview,
  }),
}));

vi.mock('@/src/hooks/useStepGuard', () => ({
  useStepGuard: () => ({ isAllowed: true }),
}));

vi.mock('@/src/services/onboarding', () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
  completeOnboarding: (...args: unknown[]) => mockCompleteOnboarding(...args),
}));

vi.mock('@/src/components/onboarding/OnboardingLayout', () => ({
  OnboardingLayout: ({
    children,
    onContinue,
    continueLabel,
    isStepValid,
    hideNavigation,
  }: {
    children: React.ReactNode;
    onContinue?: () => void;
    continueLabel?: string;
    isStepValid?: boolean;
    hideNavigation?: boolean;
  }) => (
    <div data-testid="onboarding-layout" data-hide-nav={hideNavigation}>
      {children}
      {!hideNavigation && onContinue && (
        <button
          onClick={onContinue}
          disabled={!isStepValid}
          data-testid="continue-button"
        >
          {continueLabel ?? 'Continue'}
        </button>
      )}
    </div>
  ),
}));

vi.mock('@/src/components/onboarding/ReviewSummary', () => ({
  ReviewSummary: () => <div data-testid="review-summary" />,
}));

vi.mock('@/src/components/onboarding/StepIndicator', () => ({
  StepIndicator: () => <div data-testid="step-indicator" />,
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import ReviewPage from '@/app/join/[token]/review/page';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ReviewPage — Confirm & Start submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      session_id: 'session-123',
      current_step: WizardStep.REVIEW,
      completed_steps: [WizardStep.LANGUAGE, WizardStep.FATHER_PROFILE],
      language: 'en',
      status: 'IN_PROGRESS',
      data: {
        father_profile: {
          display_name: 'Test Dad',
          phone_number: '+1234567890',
          timezone: 'America/New_York',
        },
      },
    });
  });

  // -------------------------------------------------------------------------
  // Req 8.4: "Confirm & Start" button calls completeOnboarding
  // -------------------------------------------------------------------------

  it('renders "Confirm & Start" button label', async () => {
    render(<ReviewPage />);

    await waitFor(() => {
      expect(screen.getByTestId('continue-button')).toBeInTheDocument();
    });

    expect(screen.getByTestId('continue-button')).toHaveTextContent('Confirm & Start');
  });

  it('calls completeOnboarding(sessionId) when "Confirm & Start" is clicked', async () => {
    mockCompleteOnboarding.mockResolvedValue({
      success: true,
      whatsapp_deep_link: 'https://wa.me/123?text=START',
      activation_message: 'Send START',
    });

    render(<ReviewPage />);

    await waitFor(() => {
      expect(screen.getByTestId('continue-button')).toBeEnabled();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('continue-button'));
    });

    expect(mockCompleteOnboarding).toHaveBeenCalledWith('session-123');
  });

  // -------------------------------------------------------------------------
  // Req 8.5: Duplicate submission prevention — button disables on click
  // -------------------------------------------------------------------------

  it('disables the button after click (prevents duplicate submission)', async () => {
    // Make the promise hang to simulate provisioning in progress
    mockCompleteOnboarding.mockReturnValue(new Promise(() => {}));

    render(<ReviewPage />);

    await waitFor(() => {
      expect(screen.getByTestId('continue-button')).toBeEnabled();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('continue-button'));
    });

    // After click, the provisioning loading state should appear (button hidden)
    await waitFor(() => {
      expect(screen.getByText('Setting up your coaching...')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Req 8.7: "Setting up your coaching..." loading state during provisioning
  // -------------------------------------------------------------------------

  it('shows "Setting up your coaching..." loading state during provisioning', async () => {
    mockCompleteOnboarding.mockReturnValue(new Promise(() => {}));

    render(<ReviewPage />);

    await waitFor(() => {
      expect(screen.getByTestId('continue-button')).toBeEnabled();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('continue-button'));
    });

    await waitFor(() => {
      expect(screen.getByText('Setting up your coaching...')).toBeInTheDocument();
      expect(screen.getByText('This usually takes just a moment')).toBeInTheDocument();
    });

    // Spinner should have accessible role
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('hides navigation during provisioning loading state', async () => {
    mockCompleteOnboarding.mockReturnValue(new Promise(() => {}));

    render(<ReviewPage />);

    await waitFor(() => {
      expect(screen.getByTestId('continue-button')).toBeEnabled();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('continue-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('onboarding-layout')).toHaveAttribute('data-hide-nav', 'true');
    });
  });

  // -------------------------------------------------------------------------
  // Success → navigate to activate step
  // -------------------------------------------------------------------------

  it('on success, marks step completed and navigates forward', async () => {
    mockCompleteOnboarding.mockResolvedValue({
      success: true,
      whatsapp_deep_link: 'https://wa.me/123?text=START',
      activation_message: 'Send START',
    });

    render(<ReviewPage />);

    await waitFor(() => {
      expect(screen.getByTestId('continue-button')).toBeEnabled();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('continue-button'));
    });

    await waitFor(() => {
      expect(mockMarkStepCompleted).toHaveBeenCalledWith(WizardStep.REVIEW);
      expect(mockGoForward).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Req 8.5: HTTP 409 treated as success (idempotent)
  // -------------------------------------------------------------------------

  it('treats 409 response as success (idempotent submission)', async () => {
    mockCompleteOnboarding.mockRejectedValue(
      new ApiError(409, { code: 'ALREADY_COMPLETED', message: 'Already completed' }),
    );

    render(<ReviewPage />);

    await waitFor(() => {
      expect(screen.getByTestId('continue-button')).toBeEnabled();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('continue-button'));
    });

    await waitFor(() => {
      expect(mockMarkStepCompleted).toHaveBeenCalledWith(WizardStep.REVIEW);
      expect(mockGoForward).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Error handling — shows error message
  // -------------------------------------------------------------------------

  it('shows error message on non-409 failure', async () => {
    mockCompleteOnboarding.mockRejectedValue(
      new ApiError(500, { message: 'Internal server error' }),
    );

    render(<ReviewPage />);

    await waitFor(() => {
      expect(screen.getByTestId('continue-button')).toBeEnabled();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('continue-button'));
    });

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Your information is safe — please try again.')).toBeInTheDocument();
    });

    // Should NOT navigate forward
    expect(mockGoForward).not.toHaveBeenCalled();
  });

  it('re-enables button after error so user can retry', async () => {
    mockCompleteOnboarding.mockRejectedValue(
      new ApiError(500, { message: 'Internal server error' }),
    );

    render(<ReviewPage />);

    await waitFor(() => {
      expect(screen.getByTestId('continue-button')).toBeEnabled();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('continue-button'));
    });

    // After error, the button should be re-enabled (isProvisioning = false)
    await waitFor(() => {
      expect(screen.getByTestId('continue-button')).toBeEnabled();
    });
  });
});
