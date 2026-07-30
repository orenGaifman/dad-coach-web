'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useParams, useRouter } from 'next/navigation';

import { getStoredSessionId } from '@/src/lib/api-client';

import { ONBOARDING_STEPS } from '@/src/constants/onboarding';
import type {
  OnboardingError,
  SupportedLanguage,
  WizardStep,
} from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Full client-side wizard state. */
export interface OnboardingState {
  sessionId: string | null;
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  language: SupportedLanguage | null;
  isSubmitting: boolean;
  error: OnboardingError | null;
  editingFromReview: boolean;
}

/** Context value exposed to consumers. */
export interface OnboardingContextValue extends OnboardingState {
  /** Navigate to the next step in order. */
  goForward: () => void;
  /** Navigate to the previous step (no-op on WELCOME). */
  goBack: () => void;
  /** Skip an optional step without marking it completed. */
  skipStep: () => void;
  /** Set the selected language. */
  setLanguage: (lang: SupportedLanguage) => void;
  /** Store the session id after creation. */
  setSessionId: (id: string) => void;
  /** Set or clear the current error. */
  setError: (error: OnboardingError | null) => void;
  /** Toggle submitting state. */
  setIsSubmitting: (submitting: boolean) => void;
  /** Mark a step as completed. */
  markStepCompleted: (step: WizardStep) => void;
  /** Directly set the current step. */
  setCurrentStep: (step: WizardStep) => void;
  /** Set editing-from-review flag (navigate back to review after step submit). */
  setEditingFromReview: (editing: boolean) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

// ---------------------------------------------------------------------------
// Default state
// ---------------------------------------------------------------------------

const DEFAULT_STATE: OnboardingState = {
  sessionId: null,
  currentStep: 'LANGUAGE' as WizardStep,
  completedSteps: [],
  language: null,
  isSubmitting: false,
  error: null,
  editingFromReview: false,
};

// ---------------------------------------------------------------------------
// Provider Props
// ---------------------------------------------------------------------------

export interface OnboardingProviderProps {
  children: React.ReactNode;
  /** Optional initial state for session resume scenarios. */
  initialState?: Partial<OnboardingState>;
}

// ---------------------------------------------------------------------------
// Provider Component
// ---------------------------------------------------------------------------

/**
 * OnboardingProvider — React Context provider for wizard state and navigation.
 *
 * Wraps the wizard step pages (language through activate). The Welcome page
 * is NOT wrapped by this provider.
 *
 * Provides navigation methods that use Next.js App Router (`useRouter`) and
 * derive URLs from the route token param (`/join/{token}/{stepPath}`).
 *
 * @see Requirement 11: Progress Indication
 * @see Requirement 12: Wizard Navigation
 */
export function OnboardingProvider({
  children,
  initialState,
}: OnboardingProviderProps) {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params.token;

  // --- State ---
  const [sessionId, setSessionIdState] = useState<string | null>(
    initialState?.sessionId ?? DEFAULT_STATE.sessionId,
  );

  // Restore sessionId from localStorage on mount
  useEffect(() => {
    if (!sessionId) {
      const stored = getStoredSessionId();
      if (stored) {
        setSessionIdState(stored);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [currentStep, setCurrentStepState] = useState<WizardStep>(
    initialState?.currentStep ?? DEFAULT_STATE.currentStep,
  );
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>(
    initialState?.completedSteps ?? DEFAULT_STATE.completedSteps,
  );
  const [language, setLanguageState] = useState<SupportedLanguage | null>(
    initialState?.language ?? DEFAULT_STATE.language,
  );
  const [isSubmitting, setIsSubmittingState] = useState<boolean>(
    initialState?.isSubmitting ?? DEFAULT_STATE.isSubmitting,
  );
  const [error, setErrorState] = useState<OnboardingError | null>(
    initialState?.error ?? DEFAULT_STATE.error,
  );
  const [editingFromReview, setEditingFromReviewState] = useState<boolean>(
    initialState?.editingFromReview ?? DEFAULT_STATE.editingFromReview,
  );

  // --- Helpers ---

  /** Build the full path for a wizard step. */
  const buildStepUrl = useCallback(
    (stepPath: string) => `/join/${token}/${stepPath}`,
    [token],
  );

  /** Get the step definition index for a given WizardStep. */
  const getStepIndex = useCallback((step: WizardStep): number => {
    return ONBOARDING_STEPS.findIndex((s) => s.name === step);
  }, []);

  // --- Navigation Methods ---

  const goForward = useCallback(() => {
    const currentIndex = getStepIndex(currentStep);
    const nextStepDef = ONBOARDING_STEPS[currentIndex + 1];

    if (!nextStepDef) return; // Already on last step

    setCurrentStepState(nextStepDef.name);
    router.push(buildStepUrl(nextStepDef.path));
  }, [currentStep, getStepIndex, router, buildStepUrl]);

  const goBack = useCallback(() => {
    const currentIndex = getStepIndex(currentStep);

    // Cannot go back from WELCOME (order 0) or LANGUAGE (first wizard step, order 1)
    if (currentIndex <= 1) return;

    const prevStepDef = ONBOARDING_STEPS[currentIndex - 1];
    if (!prevStepDef) return;

    setCurrentStepState(prevStepDef.name);
    router.push(buildStepUrl(prevStepDef.path));
  }, [currentStep, getStepIndex, router, buildStepUrl]);

  const skipStep = useCallback(() => {
    const currentIndex = getStepIndex(currentStep);
    const currentStepDef = ONBOARDING_STEPS[currentIndex];

    // Only optional steps can be skipped
    if (!currentStepDef || currentStepDef.required) return;

    const nextStepDef = ONBOARDING_STEPS[currentIndex + 1];
    if (!nextStepDef) return;

    // Advance without marking current step as completed
    setCurrentStepState(nextStepDef.name);
    router.push(buildStepUrl(nextStepDef.path));
  }, [currentStep, getStepIndex, router, buildStepUrl]);

  // --- Setter Methods ---

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
  }, []);

  const setSessionId = useCallback((id: string) => {
    setSessionIdState(id);
  }, []);

  const setError = useCallback((err: OnboardingError | null) => {
    setErrorState(err);
  }, []);

  const setIsSubmitting = useCallback((submitting: boolean) => {
    setIsSubmittingState(submitting);
  }, []);

  const markStepCompleted = useCallback((step: WizardStep) => {
    setCompletedSteps((prev) =>
      prev.includes(step) ? prev : [...prev, step],
    );
  }, []);

  const setCurrentStep = useCallback((step: WizardStep) => {
    setCurrentStepState(step);
  }, []);

  const setEditingFromReview = useCallback((editing: boolean) => {
    setEditingFromReviewState(editing);
  }, []);

  // --- Context Value ---

  const value: OnboardingContextValue = useMemo(
    () => ({
      sessionId,
      currentStep,
      completedSteps,
      language,
      isSubmitting,
      error,
      editingFromReview,
      goForward,
      goBack,
      skipStep,
      setLanguage,
      setSessionId,
      setError,
      setIsSubmitting,
      markStepCompleted,
      setCurrentStep,
      setEditingFromReview,
    }),
    [
      sessionId,
      currentStep,
      completedSteps,
      language,
      isSubmitting,
      error,
      editingFromReview,
      goForward,
      goBack,
      skipStep,
      setLanguage,
      setSessionId,
      setError,
      setIsSubmitting,
      markStepCompleted,
      setCurrentStep,
      setEditingFromReview,
    ],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Consumer Hook
// ---------------------------------------------------------------------------

/**
 * useOnboarding — access the onboarding wizard context.
 *
 * Must be used within an `<OnboardingProvider>`. Throws if used outside.
 */
export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error(
      'useOnboarding must be used within an <OnboardingProvider>',
    );
  }

  return context;
}
