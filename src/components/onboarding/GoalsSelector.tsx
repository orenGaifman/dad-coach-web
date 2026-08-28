'use client';

import { useState, forwardRef, useCallback } from 'react';
import Image from 'next/image';

import { PREDEFINED_GOALS, VALIDATION } from '@/src/constants/onboarding';
import { useTranslations } from '@/src/i18n/useTranslations';
import type { GoalsData } from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface GoalsSelectorProps {
  onSubmit: (data: GoalsData) => void;
  initialData?: GoalsData;
  isSubmitting?: boolean;
}

// ---------------------------------------------------------------------------
// Goal ID to translation key mapping
// ---------------------------------------------------------------------------

import type { TranslationStrings } from '@/src/i18n/translations';

const GOAL_TRANSLATION_KEYS: Record<string, keyof TranslationStrings> = {
  'spend_more_quality_time': 'onboarding.goals.spendMoreQualityTime',
  'improve_communication': 'onboarding.goals.improveCommunication',
  'build_stronger_emotional_connection': 'onboarding.goals.buildStrongerEmotionalConnection',
  'handle_conflicts_better': 'onboarding.goals.handleConflictsBetter',
  'create_family_routines': 'onboarding.goals.createFamilyRoutines',
  'support_child_development': 'onboarding.goals.supportChildDevelopment',
  'be_more_patient': 'onboarding.goals.beMorePatient',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const GoalsSelector = forwardRef<HTMLFormElement, GoalsSelectorProps>(
  function GoalsSelector({ onSubmit, initialData, isSubmitting = false }, ref) {
    const { t } = useTranslations();
    const [selectedGoals, setSelectedGoals] = useState<string[]>(
      initialData?.selected_goals ?? [],
    );
    const [customGoal, setCustomGoal] = useState<string>(
      initialData?.custom_goal ?? '',
    );
    const [error, setError] = useState<string>('');

    // Toggle a goal selection
    const toggleGoal = useCallback(
      (goalId: string) => {
        setSelectedGoals((prev) => {
          if (prev.includes(goalId)) {
            return prev.filter((id) => id !== goalId);
          }
          // Prevent selecting more than MAX_GOALS
          if (prev.length >= VALIDATION.MAX_GOALS) {
            return prev;
          }
          return [...prev, goalId];
        });
        // Clear error when user makes a selection
        setError('');
      },
      [],
    );

    // Handle custom goal input
    const handleCustomGoalChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= VALIDATION.CUSTOM_GOAL_MAX) {
          setCustomGoal(value);
        }
      },
      [],
    );

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      // Validate: 1–5 goals required
      if (
        selectedGoals.length < VALIDATION.MIN_GOALS ||
        selectedGoals.length > VALIDATION.MAX_GOALS
      ) {
        setError(t('onboarding.goals.validation.selectGoals'));
        return;
      }

      const data: GoalsData = {
        selected_goals: selectedGoals,
      };
      if (customGoal.trim()) {
        data.custom_goal = customGoal.trim();
      }

      onSubmit(data);
    };

    // Get translated label for a goal
    const getGoalLabel = (goalId: string): string => {
      const translationKey = GOAL_TRANSLATION_KEYS[goalId];
      if (translationKey) {
        return t(translationKey);
      }
      // Fallback to the label from PREDEFINED_GOALS
      const found = PREDEFINED_GOALS.find((g) => g.id === goalId);
      return found ? found.label : goalId;
    };

    return (
      <form ref={ref} onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Illustration */}
        <div className="flex justify-center">
          <Image
            src="/illustrations/onboarding-goals.webp"
            alt="Goals"
            width={200}
            height={200}
            className="max-w-[140px] h-auto"
            priority
          />
        </div>

        {/* Heading */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white">
            {t('onboarding.goals.title')}
          </h1>
          <p className="text-gray-400">({t('onboarding.goals.subtitle')})</p>
        </div>

        {/* Validation error */}
        {error && (
          <p role="alert" className="text-red-400 text-sm text-center">
            {error}
          </p>
        )}

        {/* Goal cards */}
        <fieldset className="space-y-3">
          <legend className="sr-only">{t('onboarding.goals.selectGoalsLabel')}</legend>
          {PREDEFINED_GOALS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            const goalLabel = getGoalLabel(goal.id);
            return (
              <label
                key={goal.id}
                className={`flex items-center gap-3 rounded-xl p-4 cursor-pointer transition-colors border ${
                  isSelected
                    ? 'bg-indigo-500/10 border-indigo-500'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleGoal(goal.id)}
                  className="sr-only"
                  aria-label={goalLabel}
                />
                {/* Checkbox visual */}
                <span
                  className={`flex shrink-0 items-center justify-center w-5 h-5 rounded border transition-colors ${
                    isSelected
                      ? 'bg-indigo-500 border-indigo-500'
                      : 'border-white/30 bg-transparent'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
                <span className="text-white text-sm font-medium">
                  {goalLabel}
                </span>
              </label>
            );
          })}
        </fieldset>

        {/* Custom goal input */}
        <div className="space-y-2">
          <label
            htmlFor="custom-goal"
            className="block text-sm font-medium text-gray-300"
          >
            {t('onboarding.goals.customGoal')}
          </label>
          <input
            id="custom-goal"
            type="text"
            value={customGoal}
            onChange={handleCustomGoalChange}
            placeholder={t('onboarding.goals.customGoalPlaceholder')}
            maxLength={VALIDATION.CUSTOM_GOAL_MAX}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <p className="text-xs text-gray-500 text-right">
            {customGoal.length}/{VALIDATION.CUSTOM_GOAL_MAX}
          </p>
        </div>

        {/* Submit button is hidden — parent OnboardingLayout provides navigation */}
        <button
          type="submit"
          className="sr-only"
          disabled={isSubmitting}
          tabIndex={-1}
        >
          Submit
        </button>
      </form>
    );
  },
);
