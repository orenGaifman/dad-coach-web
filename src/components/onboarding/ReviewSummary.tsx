'use client';

import {
  PREDEFINED_GOALS,
  COACHING_STYLE_OPTIONS,
  NOTIFICATION_FREQUENCY_OPTIONS,
  DEFAULTS,
} from '@/src/constants/onboarding';
import { useTranslations } from '@/src/i18n/useTranslations';
import { maskPhone } from '@/src/utils/phone';
import type { SessionState, WizardStep } from '@/src/types/onboarding';
import { WizardStep as WizardStepEnum } from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ReviewSummaryProps {
  sessionData: SessionState['data'];
  language: string;
  onEdit: (step: WizardStep) => void;
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
// Helpers
// ---------------------------------------------------------------------------

/** Compute age in years from ISO date string. */
function computeAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/** Format HH:mm to human-readable time (e.g., "08:00 AM"). */
function formatTime(time: string): string {
  const [hoursStr, minsStr] = time.split(':');
  const hours = parseInt(hoursStr, 10);
  const mins = minsStr ?? '00';
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHour.toString().padStart(2, '0')}:${mins} ${period}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SectionCardProps {
  title: string;
  step: WizardStep;
  onEdit: (step: WizardStep) => void;
  editLabel: string;
  children: React.ReactNode;
}

function SectionCard({ title, step, onEdit, editLabel, children }: SectionCardProps) {
  return (
    <section className="bg-white/5 rounded-xl p-4 space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="text-indigo-400 hover:text-indigo-300 text-sm"
        >
          {editLabel}
        </button>
      </div>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ReviewSummary({ sessionData, language, onEdit }: ReviewSummaryProps) {
  const { t } = useTranslations();
  const profile = sessionData?.father_profile;
  const children = sessionData?.children;
  const goals = sessionData?.goals;
  const preferences = sessionData?.preferences;

  /** Look up goal label from translations or return the id/custom goal as-is. */
  const getGoalLabel = (goalId: string): string => {
    const translationKey = GOAL_TRANSLATION_KEYS[goalId];
    if (translationKey) {
      return t(translationKey);
    }
    const found = PREDEFINED_GOALS.find((g) => g.id === goalId);
    return found ? found.label : goalId;
  };

  /** Look up coaching style label with translation. */
  const getCoachingStyleLabel = (value: string): string => {
    const styleKey = `coachingStyle.${value.toLowerCase()}` as keyof typeof import('@/src/i18n/translations').en;
    const translated = t(styleKey);
    // If translation returns the key itself, fallback to original lookup
    if (translated === styleKey) {
      const found = COACHING_STYLE_OPTIONS.find((o) => o.value === value);
      return found ? found.label : value;
    }
    return translated;
  };

  /** Look up notification frequency label with translation. */
  const getFrequencyLabel = (value: string): string => {
    const freqMap: Record<string, keyof TranslationStrings> = {
      'DAILY': 'notificationFrequency.daily',
      'EVERY_OTHER_DAY': 'notificationFrequency.everyOtherDay',
      'TWICE_WEEKLY': 'notificationFrequency.twiceWeekly',
    };
    const translationKey = freqMap[value];
    if (translationKey) {
      return t(translationKey);
    }
    const found = NOTIFICATION_FREQUENCY_OPTIONS.find((o) => o.value === value);
    return found ? found.label : value;
  };

  return (
    <div className="space-y-4">
      {/* Profile Section */}
      <SectionCard
        title={t('review.profile')}
        step={WizardStepEnum.FATHER_PROFILE}
        onEdit={onEdit}
        editLabel={t('common.edit')}
      >
        {profile ? (
          <dl className="space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-400">{t('profile.name')}:</dt>
              <dd className="text-white">{profile.display_name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400">{t('profile.phone')}:</dt>
              <dd className="text-white">{maskPhone(profile.phone_number)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400">{t('profile.timezone')}:</dt>
              <dd className="text-white">{profile.timezone}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-gray-400 text-sm">{t('profile.noData')}</p>
        )}
      </SectionCard>

      {/* Children Section */}
      <SectionCard
        title={t('review.children')}
        step={WizardStepEnum.CHILDREN}
        onEdit={onEdit}
        editLabel={t('common.edit')}
      >
        {children && children.length > 0 ? (
          <ul className="space-y-1 text-sm text-white">
            {children.map((child, idx) => {
              const age = computeAge(child.birth_date);
              return (
                <li key={idx} className="flex items-center gap-1">
                  <span className="text-gray-400">•</span>
                  <span>
                    {child.name} ({age} {age === 1 ? t('time.year') : t('time.years')})
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">{t('family.noChildren')}</p>
        )}
      </SectionCard>

      {/* Goals Section */}
      <SectionCard
        title={t('review.goals')}
        step={WizardStepEnum.GOALS}
        onEdit={onEdit}
        editLabel={t('common.edit')}
      >
        {goals && goals.selected_goals.length > 0 ? (
          <ul className="space-y-1 text-sm text-white">
            {goals.selected_goals.map((goalId) => (
              <li key={goalId} className="flex items-center gap-1">
                <span className="text-gray-400">•</span>
                <span>{getGoalLabel(goalId)}</span>
              </li>
            ))}
            {goals.custom_goal && (
              <li className="flex items-center gap-1">
                <span className="text-gray-400">•</span>
                <span>{goals.custom_goal}</span>
              </li>
            )}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">
            {getGoalLabel(DEFAULTS.GOAL)} ({t('common.default')})
          </p>
        )}
      </SectionCard>

      {/* Preferences Section */}
      <SectionCard
        title={t('review.preferences')}
        step={WizardStepEnum.PREFERENCES}
        onEdit={onEdit}
        editLabel={t('common.edit')}
      >
        {preferences ? (
          <dl className="space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-400">{t('preferences.coachingStyle')}:</dt>
              <dd className="text-white">
                {getCoachingStyleLabel(preferences.coaching_style)}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400">{t('preferences.coachingTime')}:</dt>
              <dd className="text-white">
                {formatTime(preferences.preferred_coaching_time)}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400">{t('preferences.notificationFrequency')}:</dt>
              <dd className="text-white">
                {getFrequencyLabel(preferences.notification_frequency)}
              </dd>
            </div>
          </dl>
        ) : (
          <dl className="space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-400">{t('preferences.coachingStyle')}:</dt>
              <dd className="text-white">
                {getCoachingStyleLabel(DEFAULTS.COACHING_STYLE)} ({t('common.default')})
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400">{t('preferences.coachingTime')}:</dt>
              <dd className="text-white">
                {formatTime(DEFAULTS.COACHING_TIME)} ({t('common.default')})
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400">{t('preferences.notificationFrequency')}:</dt>
              <dd className="text-white">
                {getFrequencyLabel(DEFAULTS.NOTIFICATION_FREQUENCY)} ({t('common.default')})
              </dd>
            </div>
          </dl>
        )}
      </SectionCard>
    </div>
  );
}
