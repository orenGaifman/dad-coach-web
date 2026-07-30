import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { WizardStep } from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('next/navigation', () => ({
  useParams: () => ({ token: 'test-token' }),
  useRouter: () => ({ push: vi.fn() }),
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { OnboardingProvider } from '@/src/components/onboarding/OnboardingProvider';
import { StepIndicator } from '@/src/components/onboarding/StepIndicator';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderWithProvider(
  props: { currentStep?: WizardStep; completedSteps?: WizardStep[] } = {},
  providerState?: { currentStep?: WizardStep; completedSteps?: WizardStep[] },
) {
  return render(
    <OnboardingProvider initialState={providerState}>
      <StepIndicator {...props} />
    </OnboardingProvider>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('StepIndicator', () => {
  it('renders 6 dots for the standard step flow (LANGUAGE through REVIEW)', () => {
    renderWithProvider(
      { currentStep: WizardStep.LANGUAGE, completedSteps: [] },
    );

    const dots = screen.getAllByRole('navigation')[0]
      .querySelectorAll('span.rounded-full');
    expect(dots).toHaveLength(6);
  });

  it('displays "Step 1 of 6" when on LANGUAGE step', () => {
    renderWithProvider(
      { currentStep: WizardStep.LANGUAGE, completedSteps: [] },
    );

    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();
  });

  it('displays "Step 3 of 6" when on CHILDREN step with previous steps completed', () => {
    renderWithProvider({
      currentStep: WizardStep.CHILDREN,
      completedSteps: [WizardStep.LANGUAGE, WizardStep.FATHER_PROFILE],
    });

    expect(screen.getByText('Step 3 of 6')).toBeInTheDocument();
  });

  it('marks completed dots as filled (bg-indigo-500)', () => {
    renderWithProvider({
      currentStep: WizardStep.CHILDREN,
      completedSteps: [WizardStep.LANGUAGE, WizardStep.FATHER_PROFILE],
    });

    const nav = screen.getByRole('navigation');
    const dots = nav.querySelectorAll('span.rounded-full');

    // LANGUAGE (completed) — filled
    expect(dots[0]).toHaveClass('bg-indigo-500');
    // FATHER_PROFILE (completed) — filled
    expect(dots[1]).toHaveClass('bg-indigo-500');
    // CHILDREN (current) — filled
    expect(dots[2]).toHaveClass('bg-indigo-500');
    // GOALS (pending) — empty
    expect(dots[3]).toHaveClass('bg-white/20');
    // PREFERENCES (pending) — empty
    expect(dots[4]).toHaveClass('bg-white/20');
    // REVIEW (pending) — empty
    expect(dots[5]).toHaveClass('bg-white/20');
  });

  it('applies aria-current="step" only on the current step dot', () => {
    renderWithProvider({
      currentStep: WizardStep.GOALS,
      completedSteps: [WizardStep.LANGUAGE, WizardStep.FATHER_PROFILE, WizardStep.CHILDREN],
    });

    const nav = screen.getByRole('navigation');
    const dotsWithAriaCurrent = nav.querySelectorAll('[aria-current="step"]');

    expect(dotsWithAriaCurrent).toHaveLength(1);
    expect(dotsWithAriaCurrent[0]).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Goals'),
    );
  });

  it('adjusts total when optional steps are skipped (Req 11.5)', () => {
    // User is on REVIEW, skipped CHILDREN and GOALS (optional, not completed)
    renderWithProvider({
      currentStep: WizardStep.REVIEW,
      completedSteps: [
        WizardStep.LANGUAGE,
        WizardStep.FATHER_PROFILE,
        WizardStep.PREFERENCES,
      ],
    });

    // CHILDREN (order 3) and GOALS (order 4) skipped → total = 4
    expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();
  });

  it('does not render when current step is WELCOME', () => {
    const { container } = renderWithProvider({
      currentStep: WizardStep.WELCOME,
      completedSteps: [],
    });

    expect(container.querySelector('[role="navigation"]')).toBeNull();
  });

  it('does not render when current step is ACTIVATION', () => {
    const { container } = renderWithProvider({
      currentStep: WizardStep.ACTIVATION,
      completedSteps: [],
    });

    expect(container.querySelector('[role="navigation"]')).toBeNull();
  });

  it('reads from OnboardingProvider context when no props given', () => {
    renderWithProvider(
      {},
      { currentStep: WizardStep.FATHER_PROFILE, completedSteps: [WizardStep.LANGUAGE] },
    );

    expect(screen.getByText('Step 2 of 6')).toBeInTheDocument();
  });

  it('has no pressure language — only shows position text', () => {
    renderWithProvider({
      currentStep: WizardStep.GOALS,
      completedSteps: [WizardStep.LANGUAGE, WizardStep.FATHER_PROFILE, WizardStep.CHILDREN],
    });

    // Ensure no timer-related or pressure text
    expect(screen.queryByText(/hurry/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/timer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/remaining/i)).not.toBeInTheDocument();
  });
});
