import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { WizardStep } from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockSkipStep = vi.fn();
let mockCurrentStep: WizardStep = WizardStep.CHILDREN;

vi.mock('next/navigation', () => ({
  useParams: () => ({ token: 'test-token' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/src/components/onboarding/OnboardingProvider', () => ({
  useOnboarding: () => ({
    currentStep: mockCurrentStep,
    skipStep: mockSkipStep,
  }),
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { SkipButton } from '@/src/components/onboarding/SkipButton';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SkipButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentStep = WizardStep.CHILDREN;
  });

  it('renders on optional step CHILDREN', () => {
    mockCurrentStep = WizardStep.CHILDREN;

    render(<SkipButton />);

    expect(screen.getByText('Skip for now')).toBeInTheDocument();
  });

  it('does NOT render on required step FATHER_PROFILE', () => {
    mockCurrentStep = WizardStep.FATHER_PROFILE;

    render(<SkipButton />);

    expect(screen.queryByText('Skip for now')).not.toBeInTheDocument();
  });

  it('calls skipStep() when clicked', () => {
    mockCurrentStep = WizardStep.GOALS;

    render(<SkipButton />);

    fireEvent.click(screen.getByText('Skip for now'));

    expect(mockSkipStep).toHaveBeenCalledTimes(1);
  });
});
