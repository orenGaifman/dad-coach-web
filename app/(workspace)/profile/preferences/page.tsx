'use client';

/**
 * Preferences Page — Screen P4
 *
 * Editor for coaching preferences:
 * - Coaching style (GENTLE/BALANCED/DIRECT/MOTIVATIONAL)
 * - Preferred coaching time
 * - Notification frequency
 * - Quiet hours (start and end times)
 *
 * @see Requirements 15.1, 15.2, 15.3: Preferences editing
 * @see design.md - Screen P4: Preferences
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProfile } from '@/src/hooks/useProfile';
import { useUpdatePreferences } from '@/src/hooks/useUpdatePreferences';
import { SkeletonCard } from '@/src/components/common/SkeletonScreen';
import { ErrorState } from '@/src/components/common/ErrorState';
import type {
  CoachingStyle,
  NotificationFrequency,
} from '@/src/types/workspace';

/**
 * Helper function to combine class names.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Coaching style options with descriptions.
 */
const COACHING_STYLE_OPTIONS: {
  value: CoachingStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'GENTLE',
    label: 'Gentle',
    description: 'Soft, supportive guidance with extra encouragement',
  },
  {
    value: 'BALANCED',
    label: 'Balanced',
    description: 'A mix of warmth and practical advice',
  },
  {
    value: 'DIRECT',
    label: 'Direct',
    description: 'Straight-to-the-point insights and suggestions',
  },
  {
    value: 'MOTIVATIONAL',
    label: 'Motivational',
    description: 'High-energy, action-oriented coaching',
  },
];

/**
 * Notification frequency options.
 */
const NOTIFICATION_FREQUENCY_OPTIONS: {
  value: NotificationFrequency;
  label: string;
}[] = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'EVERY_OTHER_DAY', label: 'Every Other Day' },
  { value: 'TWICE_WEEKLY', label: 'Twice Weekly' },
];

/**
 * Time options for dropdowns (hourly intervals).
 */
const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = String(i).padStart(2, '0');
  const period = i >= 12 ? 'PM' : 'AM';
  const displayHour = i % 12 || 12;
  return {
    value: `${hour}:00:00`,
    label: `${displayHour}:00 ${period}`,
  };
});

/**
 * Form field wrapper.
 */
function FormField({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      {description && (
        <p className="text-gray-500 text-xs">{description}</p>
      )}
      {children}
    </div>
  );
}

/**
 * Style selector component with radio-like buttons.
 */
function StyleSelector({
  selected,
  onChange,
}: {
  selected: CoachingStyle;
  onChange: (style: CoachingStyle) => void;
}) {
  return (
    <div className="space-y-2">
      {COACHING_STYLE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={classNames(
            'w-full text-left p-3 rounded-xl border transition-colors',
            selected === option.value
              ? 'bg-teal-500/20 border-teal-500/50'
              : 'bg-[#0F172A] border-white/10 hover:border-white/20'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={classNames(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                selected === option.value
                  ? 'border-teal-500'
                  : 'border-gray-500'
              )}
            >
              {selected === option.value && (
                <div className="w-2 h-2 rounded-full bg-teal-500" />
              )}
            </div>
            <div className="flex-1">
              <span
                className={classNames(
                  'font-medium',
                  selected === option.value ? 'text-teal-400' : 'text-white'
                )}
              >
                {option.label}
              </span>
              <p className="text-gray-500 text-xs mt-0.5">{option.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function PreferencesPage() {
  const { data: profile, isLoading, error, refetch } = useProfile();
  const mutation = useUpdatePreferences();

  // Form state
  const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>('BALANCED');
  const [preferredTime, setPreferredTime] = useState('09:00:00');
  const [notificationFrequency, setNotificationFrequency] =
    useState<NotificationFrequency>('DAILY');
  const [quietHoursStart, setQuietHoursStart] = useState('22:00:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00:00');
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setCoachingStyle(profile.coaching_style);
      setPreferredTime(profile.preferred_coaching_time);
      setNotificationFrequency(profile.notification_frequency);
      setQuietHoursStart(profile.quiet_hours_start);
      setQuietHoursEnd(profile.quiet_hours_end);
    }
  }, [profile]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(false);

    try {
      await mutation.mutateAsync({
        fatherId: profile!.father_id,
        data: {
          coaching_style: coachingStyle,
          preferred_coaching_time: preferredTime,
          notification_frequency: notificationFrequency,
          quiet_hours_start: quietHoursStart,
          quiet_hours_end: quietHoursEnd,
        },
      });
      setShowSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch {
      // Error handled by mutation state
    }
  };

  // Check if form has changes
  const hasChanges =
    profile &&
    (coachingStyle !== profile.coaching_style ||
      preferredTime !== profile.preferred_coaching_time ||
      notificationFrequency !== profile.notification_frequency ||
      quietHoursStart !== profile.quiet_hours_start ||
      quietHoursEnd !== profile.quiet_hours_end);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] pb-24">
        <div className="max-w-[512px] mx-auto px-4">
          <header className="py-4 flex items-center gap-3">
            <Link
              href="/profile"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1E293B] text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Back to Profile</span>
              ←
            </Link>
            <h1 className="text-xl font-semibold text-white">Preferences</h1>
          </header>
          <SkeletonCard className="h-96" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0F172A] pb-24">
        <div className="max-w-[512px] mx-auto px-4">
          <header className="py-4 flex items-center gap-3">
            <Link
              href="/profile"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1E293B] text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Back to Profile</span>
              ←
            </Link>
            <h1 className="text-xl font-semibold text-white">Preferences</h1>
          </header>
          <ErrorState
            type="error"
            title="Couldn't load preferences"
            description="Something went wrong while fetching your preferences."
            onRetry={refetch}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pb-24">
      <div className="max-w-[512px] mx-auto px-4">
        {/* Header */}
        <header className="py-4 flex items-center gap-3">
          <Link
            href="/profile"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1E293B] text-gray-400 hover:text-white transition-colors"
          >
            <span className="sr-only">Back to Profile</span>
            ←
          </Link>
          <h1 className="text-xl font-semibold text-white">Preferences</h1>
        </header>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <p className="text-emerald-400 text-sm">
              ✓ Preferences saved! Changes take effect on your next coaching session.
            </p>
          </div>
        )}

        {/* Error Message */}
        {mutation.error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">
              Something went wrong while saving. Please try again.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Coaching Style */}
          <div className="bg-[#1E293B] rounded-2xl p-5 border border-white/5">
            <FormField
              label="Coaching Style"
              description="How would you like your coach to communicate?"
            >
              <StyleSelector
                selected={coachingStyle}
                onChange={setCoachingStyle}
              />
            </FormField>
          </div>

          {/* Timing Preferences */}
          <div className="bg-[#1E293B] rounded-2xl p-5 border border-white/5 space-y-5">
            <FormField
              label="Preferred Coaching Time"
              description="When do you prefer to receive coaching messages?"
            >
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-4 py-3 bg-[#0F172A] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {TIME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Notification Frequency"
              description="How often would you like to hear from your coach?"
            >
              <select
                value={notificationFrequency}
                onChange={(e) =>
                  setNotificationFrequency(e.target.value as NotificationFrequency)
                }
                className="w-full px-4 py-3 bg-[#0F172A] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {NOTIFICATION_FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Quiet Hours */}
          <div className="bg-[#1E293B] rounded-2xl p-5 border border-white/5 space-y-5">
            <div>
              <h3 className="text-white font-medium mb-1">Quiet Hours</h3>
              <p className="text-gray-500 text-xs">
                No notifications during these hours
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start">
                <select
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0F172A] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="End">
                <select
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0F172A] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={mutation.isPending || !hasChanges}
            className={classNames(
              'w-full py-3 px-4 font-medium rounded-xl transition-colors',
              mutation.isPending || !hasChanges
                ? 'bg-teal-500/50 text-white/70 cursor-not-allowed'
                : 'bg-teal-500 text-white hover:bg-teal-600'
            )}
          >
            {mutation.isPending ? 'Saving...' : 'Save Preferences'}
          </button>

          {/* Cancel Link */}
          <Link
            href="/profile"
            className="block text-center text-gray-400 hover:text-white transition-colors py-2"
          >
            Cancel
          </Link>
        </form>
      </div>
    </div>
  );
}
