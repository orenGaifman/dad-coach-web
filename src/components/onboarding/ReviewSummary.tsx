'use client';

import {
  PREDEFINED_GOALS,
  COACHING_STYLE_OPTIONS,
  NOTIFICATION_FREQUENCY_OPTIONS,
  DEFAULTS,
} from '@/src/constants/onboarding';
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

/** Look up goal label from PREDEFINED_GOALS or return the id/custom goal as-is. */
function getGoalLabel(goalId: string): string {
  const found = PREDEFINED_GOALS.find((g) => g.id === goalId);
  return found ? found.label : goalId;
}

/** Look up coaching style label. */
function getCoachingStyleLabel(value: string): string {
  const found = COACHING_STYLE_OPTIONS.find((o) => o.value === value);
  return found ? found.label : value;
}

/** Look up notification frequency label. */
function getFrequencyLabel(value: string): string {
  const found = NOTIFICATION_FREQUENCY_OPTIONS.find((o) => o.value === value);
  return found ? found.label : value;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SectionCardProps {
  title: string;
  step: WizardStep;
  onEdit: (step: WizardStep) => void;
  children: React.ReactNode;
}

function SectionCard({ title, step, onEdit, children }: SectionCardProps) {
  return (
    <section className="bg-white/5 rounded-xl p-4 space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="text-indigo-400 hover:text-indigo-300 text-sm"
        >
          Edit
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
  const profile = sessionData?.father_profile;
  const children = sessionData?.children;
  const goals = sessionData?.goals;
  const preferences = sessionData?.preferences;

  return (
    <div className="space-y-4">
      {/* Profile Section */}
      <SectionCard
        title="Profile"
        step={WizardStepEnum.FATHER_PROFILE}
        onEdit={onEdit}
      >
        {profile ? (
          <dl className="space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-400">Name:</dt>
              <dd className="text-white">{profile.display_name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400">Phone:</dt>
              <dd className="text-white">{maskPhone(profile.phone_number)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400">Timezone:</dt>
              <dd className="text-white">{profile.timezone}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-gray-400 text-sm">No profile data</p>
        )}
      </SectionCard>

      {/* Children Section */}
      <SectionCard
        title="Children"
        step={WizardStepEnum.CHILDREN}
        onEdit={onEdit}
      >
        {children && children.length > 0 ? (
          <ul className="space-y-1 text-sm text-white">
            {children.map((child, idx) => {
              const age = computeAge(child.birth_date);
              return (
                <li key={idx} className="flex items-center gap-1">
                  <span className="text-gray-400">•</span>
                  <span>
                    {child.name} ({age} {age === 1 ? 'year' : 'years'})
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No children added</p>
        )}
      </SectionCard>

      {/* Goals Section */}
      <SectionCard
        title="Goals"
        step={WizardStepEnum.GOALS}
        onEdit={onEdit}
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
            Goal: {getGoalLabel(DEFAULTS.GOAL)} (default)
          </p>
        )}
      </SectionCard>

      {/* Preferences Section */}
      <SectionCard
        title="Preferences"
        step={WizardStepEnum.PREFERENCES}
        onEdit={onEdit}
      >
        {preferences ? (
          <dl className="space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-400">Style:</dt>
              <dd className="text-white">
                {getCoachingStyleLabel(preferences.coaching_style)}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400">Time:</dt>
              <dd className="text-white">
                {formatTime(preferences.preferred_coaching_time)}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400">Frequency:</dt>
              <dd className="text-white">
                {getFrequencyLabel(preferences.notification_frequency)}
              </dd>
            </div>
          </dl>
        ) : (
          <dl className="space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-400">Style:</dt>
              <dd className="text-white">
                {getCoachingStyleLabel(DEFAULTS.COACHING_STYLE)} (default)
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400">Time:</dt>
              <dd className="text-white">
                {formatTime(DEFAULTS.COACHING_TIME)} (default)
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400">Frequency:</dt>
              <dd className="text-white">
                {getFrequencyLabel(DEFAULTS.NOTIFICATION_FREQUENCY)} (default)
              </dd>
            </div>
          </dl>
        )}
      </SectionCard>
    </div>
  );
}
