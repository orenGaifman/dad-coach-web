import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { WizardStep } from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ token: 'abc-token' }),
  useRouter: () => ({ push: mockPush }),
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import {
  OnboardingProvider,
  useOnboarding,
} from '@/src/components/onboarding/OnboardingProvider';

// ---------------------------------------------------------------------------
// Helper: Consumer component that exposes context values for assertions
// ---------------------------------------------------------------------------

function TestConsumer({ onRender }: { onRender: (ctx: ReturnType<typeof useOnboarding>) => void }) {
  const ctx = useOnboarding();
  onRender(ctx);
  return (
    <div>
      <span data-testid="step">{ctx.currentStep}</span>
      <span data-testid="session">{ctx.sessionId ?? 'none'}</span>
      <span data-testid="language">{ctx.language ?? 'none'}</span>
      <span data-testid="submitting">{String(ctx.isSubmitting)}</span>
      <span data-testid="completed">{ctx.completedSteps.join(',')}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OnboardingProvider', () => {
  let captured: ReturnType<typeof useOnboarding>;
  const onRender = (ctx: ReturnType<typeof useOnboarding>) => {
    captured = ctx;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides default state when no initialState given', () => {
    render(
      <OnboardingProvider>
        <TestConsumer onRender={onRender} />
      </OnboardingProvider>,
    );

    expect(screen.getByTestId('step').textContent).toBe(WizardStep.LANGUAGE);
    expect(screen.getByTestId('session').textContent).toBe('none');
    expect(screen.getByTestId('language').textContent).toBe('none');
    expect(screen.getByTestId('submitting').textContent).toBe('false');
  });

  it('accepts initialState for session resume', () => {
    render(
      <OnboardingProvider
        initialState={{
          sessionId: 'sess-123',
          currentStep: WizardStep.GOALS,
          completedSteps: [WizardStep.LANGUAGE, WizardStep.FATHER_PROFILE],
          language: 'he',
        }}
      >
        <TestConsumer onRender={onRender} />
      </OnboardingProvider>,
    );

    expect(screen.getByTestId('step').textContent).toBe(WizardStep.GOALS);
    expect(screen.getByTestId('session').textContent).toBe('sess-123');
    expect(screen.getByTestId('language').textContent).toBe('he');
    expect(screen.getByTestId('completed').textContent).toBe('LANGUAGE,FATHER_PROFILE');
  });

  it('goForward advances to the next step and navigates', () => {
    render(
      <OnboardingProvider initialState={{ currentStep: WizardStep.LANGUAGE }}>
        <TestConsumer onRender={onRender} />
      </OnboardingProvider>,
    );

    act(() => {
      captured.goForward();
    });

    expect(screen.getByTestId('step').textContent).toBe(WizardStep.FATHER_PROFILE);
    expect(mockPush).toHaveBeenCalledWith('/join/abc-token/profile');
  });

  it('goForward is no-op on last step', () => {
    render(
      <OnboardingProvider initialState={{ currentStep: WizardStep.ACTIVATION }}>
        <TestConsumer onRender={onRender} />
      </OnboardingProvider>,
    );

    act(() => {
      captured.goForward();
    });

    expect(screen.getByTestId('step').textContent).toBe(WizardStep.ACTIVATION);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('goBack navigates to the previous step', () => {
    render(
      <OnboardingProvider initialState={{ currentStep: WizardStep.FATHER_PROFILE }}>
        <TestConsumer onRender={onRender} />
      </OnboardingProvider>,
    );

    act(() => {
      captured.goBack();
    });

    expect(screen.getByTestId('step').textContent).toBe(WizardStep.LANGUAGE);
    expect(mockPush).toHaveBeenCalledWith('/join/abc-token/language');
  });

  it('goBack is no-op on LANGUAGE (first wizard step)', () => {
    render(
      <OnboardingProvider initialState={{ currentStep: WizardStep.LANGUAGE }}>
        <TestConsumer onRender={onRender} />
      </OnboardingProvider>,
    );

    act(() => {
      captured.goBack();
    });

    expect(screen.getByTestId('step').textContent).toBe(WizardStep.LANGUAGE);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('skipStep advances optional step without marking completed', () => {
    render(
      <OnboardingProvider initialState={{ currentStep: WizardStep.CHILDREN }}>
        <TestConsumer onRender={onRender} />
      </OnboardingProvider>,
    );

    act(() => {
      captured.skipStep();
    });

    expect(screen.getByTestId('step').textContent).toBe(WizardStep.GOALS);
    expect(mockPush).toHaveBeenCalledWith('/join/abc-token/goals');
    // Step should NOT be in completed list
    expect(screen.getByTestId('completed').textContent).toBe('');
  });

  it('skipStep is no-op on required steps', () => {
    render(
      <OnboardingProvider initialState={{ currentStep: WizardStep.FATHER_PROFILE }}>
        <TestConsumer onRender={onRender} />
      </OnboardingProvider>,
    );

    act(() => {
      captured.skipStep();
    });

    // Should stay on the same step
    expect(screen.getByTestId('step').textContent).toBe(WizardStep.FATHER_PROFILE);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('setLanguage updates language state', () => {
    render(
      <OnboardingProvider>
        <TestConsumer onRender={onRender} />
      </OnboardingProvider>,
    );

    act(() => {
      captured.setLanguage('he');
    });

    expect(screen.getByTestId('language').textContent).toBe('he');
  });

  it('setSessionId stores the session id', () => {
    render(
      <OnboardingProvider>
        <TestConsumer onRender={onRender} />
      </OnboardingProvider>,
    );

    act(() => {
      captured.setSessionId('new-session-456');
    });

    expect(screen.getByTestId('session').textContent).toBe('new-session-456');
  });

  it('markStepCompleted adds step without duplicates', () => {
    render(
      <OnboardingProvider>
        <TestConsumer onRender={onRender} />
      </OnboardingProvider>,
    );

    act(() => {
      captured.markStepCompleted(WizardStep.LANGUAGE);
    });

    expect(screen.getByTestId('completed').textContent).toBe('LANGUAGE');

    // Adding again should not duplicate
    act(() => {
      captured.markStepCompleted(WizardStep.LANGUAGE);
    });

    expect(screen.getByTestId('completed').textContent).toBe('LANGUAGE');
  });

  it('setIsSubmitting toggles submitting state', () => {
    render(
      <OnboardingProvider>
        <TestConsumer onRender={onRender} />
      </OnboardingProvider>,
    );

    act(() => {
      captured.setIsSubmitting(true);
    });

    expect(screen.getByTestId('submitting').textContent).toBe('true');

    act(() => {
      captured.setIsSubmitting(false);
    });

    expect(screen.getByTestId('submitting').textContent).toBe('false');
  });

  it('setError stores and clears error', () => {
    render(
      <OnboardingProvider>
        <TestConsumer onRender={onRender} />
      </OnboardingProvider>,
    );

    act(() => {
      captured.setError({ code: 'SESSION_EXPIRED', message: 'Session expired' });
    });

    expect(captured.error).toEqual({ code: 'SESSION_EXPIRED', message: 'Session expired' });

    act(() => {
      captured.setError(null);
    });

    expect(captured.error).toBeNull();
  });

  it('throws when useOnboarding is used outside provider', () => {
    // Suppress console.error for expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function Orphan() {
      useOnboarding();
      return null;
    }

    expect(() => render(<Orphan />)).toThrow(
      'useOnboarding must be used within an <OnboardingProvider>',
    );

    spy.mockRestore();
  });
});
