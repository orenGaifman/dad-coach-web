import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { WizardStep } from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockGoBack = vi.fn();
const mockSkipStep = vi.fn();

let mockCurrentStep: WizardStep = WizardStep.LANGUAGE;
let mockIsSubmitting = false;

vi.mock('next/navigation', () => ({
  useParams: () => ({ token: 'test-token' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

vi.mock('@/src/components/onboarding/OnboardingProvider', () => ({
  useOnboarding: () => ({
    currentStep: mockCurrentStep,
    completedSteps: [],
    isSubmitting: mockIsSubmitting,
    goBack: mockGoBack,
    skipStep: mockSkipStep,
  }),
}));

// Mock StepIndicator to keep tests focused on layout logic
vi.mock('@/src/components/onboarding/StepIndicator', () => ({
  StepIndicator: () => <div data-testid="step-indicator" />,
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { OnboardingLayout } from '@/src/components/onboarding/OnboardingLayout';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OnboardingLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentStep = WizardStep.LANGUAGE;
    mockIsSubmitting = false;
  });

  // -------------------------------------------------------------------------
  // Back button (Req 12.1)
  // -------------------------------------------------------------------------

  it('does NOT render Back button on LANGUAGE step', () => {
    mockCurrentStep = WizardStep.LANGUAGE;

    render(
      <OnboardingLayout>
        <p>content</p>
      </OnboardingLayout>,
    );

    expect(screen.queryByText('Back')).not.toBeInTheDocument();
  });

  it('renders Back button on FATHER_PROFILE step', () => {
    mockCurrentStep = WizardStep.FATHER_PROFILE;

    render(
      <OnboardingLayout>
        <p>content</p>
      </OnboardingLayout>,
    );

    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Continue button (Req 12.3)
  // -------------------------------------------------------------------------

  it('Continue button is disabled when isStepValid is false', () => {
    render(
      <OnboardingLayout isStepValid={false}>
        <p>content</p>
      </OnboardingLayout>,
    );

    expect(screen.getByText('Continue')).toBeDisabled();
  });

  it('Continue button is enabled when isStepValid is true', () => {
    render(
      <OnboardingLayout isStepValid={true}>
        <p>content</p>
      </OnboardingLayout>,
    );

    expect(screen.getByText('Continue')).toBeEnabled();
  });

  // -------------------------------------------------------------------------
  // Skip button visibility (Req 12.4)
  // -------------------------------------------------------------------------

  it('shows Skip button on optional step CHILDREN', () => {
    mockCurrentStep = WizardStep.CHILDREN;

    render(
      <OnboardingLayout>
        <p>content</p>
      </OnboardingLayout>,
    );

    expect(screen.getByText('Skip this step')).toBeInTheDocument();
  });

  it('shows Skip button on optional step GOALS', () => {
    mockCurrentStep = WizardStep.GOALS;

    render(
      <OnboardingLayout>
        <p>content</p>
      </OnboardingLayout>,
    );

    expect(screen.getByText('Skip this step')).toBeInTheDocument();
  });

  it('shows Skip button on optional step PREFERENCES', () => {
    mockCurrentStep = WizardStep.PREFERENCES;

    render(
      <OnboardingLayout>
        <p>content</p>
      </OnboardingLayout>,
    );

    expect(screen.getByText('Skip this step')).toBeInTheDocument();
  });

  it('does NOT show Skip button on required step LANGUAGE', () => {
    mockCurrentStep = WizardStep.LANGUAGE;

    render(
      <OnboardingLayout>
        <p>content</p>
      </OnboardingLayout>,
    );

    expect(screen.queryByText('Skip this step')).not.toBeInTheDocument();
  });

  it('does NOT show Skip button on required step FATHER_PROFILE', () => {
    mockCurrentStep = WizardStep.FATHER_PROFILE;

    render(
      <OnboardingLayout>
        <p>content</p>
      </OnboardingLayout>,
    );

    expect(screen.queryByText('Skip this step')).not.toBeInTheDocument();
  });

  it('does NOT show Skip button on required step REVIEW', () => {
    mockCurrentStep = WizardStep.REVIEW;

    render(
      <OnboardingLayout>
        <p>content</p>
      </OnboardingLayout>,
    );

    expect(screen.queryByText('Skip this step')).not.toBeInTheDocument();
  });
});
