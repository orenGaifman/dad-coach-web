import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { WizardStep } from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ token: 'test-token' }),
  useRouter: () => ({ replace: mockReplace }),
}));

let mockCurrentStep: WizardStep = WizardStep.LANGUAGE;
vi.mock('@/src/components/onboarding/OnboardingProvider', () => ({
  useOnboarding: () => ({ currentStep: mockCurrentStep }),
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { useStepGuard } from '@/src/hooks/useStepGuard';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useStepGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentStep = WizardStep.LANGUAGE;
  });

  it('allows access to the current step', () => {
    mockCurrentStep = WizardStep.FATHER_PROFILE;

    const { result } = renderHook(() => useStepGuard(WizardStep.FATHER_PROFILE));

    expect(result.current.isAllowed).toBe(true);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('allows access to a previous step (back navigation)', () => {
    mockCurrentStep = WizardStep.GOALS; // order 4

    const { result } = renderHook(() => useStepGuard(WizardStep.LANGUAGE)); // order 1

    expect(result.current.isAllowed).toBe(true);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('blocks access to a future step and redirects', () => {
    mockCurrentStep = WizardStep.LANGUAGE; // order 1

    const { result } = renderHook(() => useStepGuard(WizardStep.GOALS)); // order 4

    expect(result.current.isAllowed).toBe(false);
    expect(mockReplace).toHaveBeenCalledWith('/join/test-token/language');
  });

  it('blocks access to the activation step when on language', () => {
    mockCurrentStep = WizardStep.LANGUAGE; // order 1

    const { result } = renderHook(() => useStepGuard(WizardStep.ACTIVATION)); // order 7

    expect(result.current.isAllowed).toBe(false);
    expect(mockReplace).toHaveBeenCalledWith('/join/test-token/language');
  });

  it('allows access to all previous steps when on activation', () => {
    mockCurrentStep = WizardStep.ACTIVATION; // order 7

    // Should allow access to all earlier steps
    const steps = [
      WizardStep.LANGUAGE,
      WizardStep.FATHER_PROFILE,
      WizardStep.CHILDREN,
      WizardStep.GOALS,
      WizardStep.PREFERENCES,
      WizardStep.REVIEW,
    ];

    for (const step of steps) {
      const { result } = renderHook(() => useStepGuard(step));
      expect(result.current.isAllowed).toBe(true);
    }

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('redirects to the correct step path when blocking', () => {
    mockCurrentStep = WizardStep.FATHER_PROFILE; // order 2, path 'profile'

    renderHook(() => useStepGuard(WizardStep.REVIEW)); // order 6

    expect(mockReplace).toHaveBeenCalledWith('/join/test-token/profile');
  });
});
