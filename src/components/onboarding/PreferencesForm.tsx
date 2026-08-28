'use client';

import { useState, forwardRef } from 'react';

import {
  COACHING_STYLE_OPTIONS,
  NOTIFICATION_FREQUENCY_OPTIONS,
  DEFAULTS,
} from '@/src/constants/onboarding';
import { useTranslations } from '@/src/i18n/useTranslations';
import type { PreferencesData, CoachingStyle, NotificationFrequency } from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// Time Options (30-min intervals)
// ---------------------------------------------------------------------------

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, '0');
  const mins = i % 2 === 0 ? '00' : '30';
  return `${hours}:${mins}`;
});

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PreferencesFormProps {
  onSubmit: (data: PreferencesData) => void;
  initialData?: Partial<PreferencesData>;
  isSubmitting?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const PreferencesForm = forwardRef<HTMLFormElement, PreferencesFormProps>(
  function PreferencesForm({ onSubmit, initialData, isSubmitting = false }, ref) {
    const { t } = useTranslations();
    const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>(
      initialData?.coaching_style ?? DEFAULTS.COACHING_STYLE,
    );
    const [coachingTime, setCoachingTime] = useState<string>(
      initialData?.preferred_coaching_time ?? DEFAULTS.COACHING_TIME,
    );
    const [frequency, setFrequency] = useState<NotificationFrequency>(
      initialData?.notification_frequency ?? DEFAULTS.NOTIFICATION_FREQUENCY,
    );
    const [quietStart, setQuietStart] = useState<string>(
      initialData?.quiet_hours_start ?? DEFAULTS.QUIET_HOURS_START,
    );
    const [quietEnd, setQuietEnd] = useState<string>(
      initialData?.quiet_hours_end ?? DEFAULTS.QUIET_HOURS_END,
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const data: PreferencesData = {
        coaching_style: coachingStyle,
        preferred_coaching_time: coachingTime,
        notification_frequency: frequency,
        quiet_hours_start: quietStart,
        quiet_hours_end: quietEnd,
      };

      onSubmit(data);
    };

    return (
      <form ref={ref} onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* Coaching Style Cards */}
        <fieldset className="space-y-3">
          <legend className="block text-sm font-medium text-gray-300 mb-2">
            {t('preferences.coachingStyle')}
          </legend>
          {COACHING_STYLE_OPTIONS.map((option) => {
            const isSelected = coachingStyle === option.value;
            const labelKey = `coachingStyle.${option.value.toLowerCase()}` as keyof import('@/src/i18n/translations').TranslationStrings;
            const descKey = `coachingStyle.${option.value.toLowerCase()}.description` as keyof import('@/src/i18n/translations').TranslationStrings;
            return (
              <label
                key={option.value}
                className={`block rounded-xl p-4 cursor-pointer transition-colors border ${
                  isSelected
                    ? 'bg-indigo-500/10 border-indigo-500'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="coaching_style"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => setCoachingStyle(option.value)}
                  className="sr-only"
                />
                <span className="block text-white text-sm font-medium">
                  {t(labelKey)}
                </span>
                <span className="block text-gray-400 text-xs mt-1">
                  {t(descKey)}
                </span>
              </label>
            );
          })}
        </fieldset>

        {/* Preferred Coaching Time */}
        <div className="space-y-2">
          <label
            htmlFor="coaching-time"
            className="block text-sm font-medium text-gray-300"
          >
            {t('preferences.coachingTime')}
          </label>
          <select
            id="coaching-time"
            value={coachingTime}
            onChange={(e) => setCoachingTime(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
          >
            {TIME_OPTIONS.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* Notification Frequency */}
        <fieldset className="space-y-3">
          <legend className="block text-sm font-medium text-gray-300 mb-2">
            {t('preferences.notificationFrequency')}
          </legend>
          {NOTIFICATION_FREQUENCY_OPTIONS.map((option) => {
            const isSelected = frequency === option.value;
            const freqKeyMap: Record<string, keyof import('@/src/i18n/translations').TranslationStrings> = {
              'DAILY': 'notificationFrequency.daily',
              'EVERY_OTHER_DAY': 'notificationFrequency.everyOtherDay',
              'TWICE_WEEKLY': 'notificationFrequency.twiceWeekly',
            };
            const labelKey = freqKeyMap[option.value];
            return (
              <label
                key={option.value}
                className={`flex items-center gap-3 rounded-xl p-4 cursor-pointer transition-colors border ${
                  isSelected
                    ? 'bg-indigo-500/10 border-indigo-500'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="notification_frequency"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => setFrequency(option.value)}
                  className="sr-only"
                />
                {/* Radio visual */}
                <span
                  className={`flex shrink-0 items-center justify-center w-5 h-5 rounded-full border transition-colors ${
                    isSelected
                      ? 'border-indigo-500'
                      : 'border-white/30'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  )}
                </span>
                <span className="text-white text-sm font-medium">
                  {t(labelKey)}
                </span>
              </label>
            );
          })}
        </fieldset>

        {/* Quiet Hours */}
        <div className="space-y-3">
          <p className="block text-sm font-medium text-gray-300">
            {t('preferences.quietHours')}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label
                htmlFor="quiet-start"
                className="block text-xs text-gray-400"
              >
                {t('preferences.quietHours.from')}
              </label>
              <select
                id="quiet-start"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="quiet-end"
                className="block text-xs text-gray-400"
              >
                {t('preferences.quietHours.to')}
              </label>
              <select
                id="quiet-end"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
